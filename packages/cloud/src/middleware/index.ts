import type express from "express"

/**
 * Setup application-level middleware (rate limiting, request id, logging, etc.)
 * This is intentionally minimal — add concrete middleware (e.g. express-rate-limit)
 * once dependencies are installed.
 */
export async function setupMiddleware(app: express.Application): Promise<void> {
	// Example: attach a simple request id and start time for logging
	app.use((req, _res, next) => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		;(req as any).requestStartedAt = Date.now()
		next()
	})

	// Add body size limits, etc. are already configured in server.ts
	return
}
