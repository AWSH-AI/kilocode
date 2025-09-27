export const config = {
	port: Number(process.env.CLOUD_PORT || process.env.PORT || 3001),
	cors: {
		origin: (process.env.CLOUD_CORS_ORIGIN || "http://localhost:3000").split(","),
		credentials: true,
	},
	databaseUrl: process.env.DATABASE_URL || "postgres://postgres:password@localhost:5432/kilocode_cloud",
	redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
	jwtSecret: process.env.JWT_SECRET || "change-me-in-production",
	jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
	nodeEnv: (process.env.NODE_ENV as string) || "development",
}
