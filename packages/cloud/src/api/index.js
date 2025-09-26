import express from "express"

/**
 * Minimal API routes for local development.
 * Expand with real handlers as auth, telemetry, etc. are implemented.
 */

export function setupRoutes(app) {
	const router = express.Router()

	// Auth - development stub
	router.post("/auth/login", (req, res) => {
		// In development return a dummy token. Replace with real auth logic.
		res.json({ token: "dev-token", user: { id: "dev-user", email: "dev@example.com" } })
	})

	// Telemetry - simple ping
	router.get("/telemetry/ping", (_req, res) => {
		res.json({ ok: true, timestamp: Date.now() })
	})

	// Health under /api to keep API health separated from /healthz
	router.get("/health", (_req, res) => {
		res.json({ status: "ok", uptime: process.uptime() })
	})

	app.use("/api", router)
}
