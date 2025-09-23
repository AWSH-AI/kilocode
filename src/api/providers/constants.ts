import { Package } from "../../shared/package"

export const DEFAULT_HEADERS = {
	"HTTP-Referer": "https://awsh.net/code",
	"X-Title": "AWSH CODE",
	"X-KiloCode-Version": Package.version,
	"User-Agent": `Kilo-Code/${Package.version}`,
}
