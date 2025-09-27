import express from "express"
import helmet from "helmet"
import cors from "cors"

import { config } from "./config/index.js"
import { logger } from "./utils/logger.js"
import { setupRoutes } from "./api/index.js"
import { setupMiddleware } from "./middleware/index.js"

export async function createServer() {
	const app = express()

	// Security + parsing
	app.use(helmet())
	app.use(cors(config.cors))
	app.use(express.json({ limit: "10mb" }))
	app.use(express.urlencoded({ extended: true }))

	// App-level middleware (rate limiting, request id, etc.)
	await setupMiddleware(app)

	// Routes
	setupRoutes(app)

	// Basic health endpoint
	app.get("/healthz", (_req, res) => {
		res.status(200).json({ status: "ok", uptime: process.uptime() })
	})

	return app
}

if (process.env.NODE_ENV !== "test") {
	const port = config.port || 3001
	const app = await createServer()

	const server = app.listen(port, () => {
		logger.info(`🚀 Kilo Code Cloud API listening on port ${port}`)
	})

	const shutdown = (signal: string) => {
		logger.info(`${signal} received — shutting down`)
		server.close(() => {
			logger.info("HTTP server closed")
			process.exit(0)
		})
		setTimeout(() => {
			logger.error("Forcing shutdown")
			process.exit(1)
		}, 10_000).unref()
	}

	process.on("SIGINT", () => shutdown("SIGINT"))
	process.on("SIGTERM", () => shutdown("SIGTERM"))
}
