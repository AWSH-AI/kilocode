import { createLogger, format, transports } from "winston"

const { combine, timestamp, printf, colorize, errors } = format

const logFormat = printf(({ level, message, timestamp, stack }) => {
	const base = `${timestamp} [${level}] ${message}`
	return stack ? `${base}\n${stack}` : base
})

export const logger = createLogger({
	level: process.env.LOG_LEVEL || "info",
	format: combine(
		errors({ stack: true }),
		timestamp(),
		process.env.NODE_ENV === "development" ? colorize() : format.uncolorize(),
		logFormat,
	),
	transports: [new transports.Console()],
})
