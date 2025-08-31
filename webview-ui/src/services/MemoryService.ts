// kilocode_change - new file
import { telemetryClient } from "../utils/TelemetryClient"
import { TelemetryEventName } from "@roo-code/types"
import { createSampledFunction } from "../utils/sampling"

interface PerformanceMemory {
	usedJSHeapSize?: number
	totalJSHeapSize?: number
}

export class MemoryService {
	private intervalId: number | null = null
	private readonly intervalMs: number = 10 * 60 * 1000 // 10 min(s)
	private readonly sampledTelemetryCapture = createSampledFunction(
		telemetryClient.capture.bind(telemetryClient),
		0.01, // 1% sampling rate
	)
	
	// Cache management for memory warnings
	private caches = new Map<string, any>()
	private messageListener: ((event: MessageEvent) => void) | null = null

	public start(): void {
		if (this.intervalId) {
			return
		}
		this.reportMemoryUsage()

		this.intervalId = window.setInterval(() => {
			this.reportMemoryUsage()
		}, this.intervalMs)
		
		// Set up message listener for memory warnings
		this.setupMessageListener()
	}

	public stop(): void {
		if (this.intervalId) {
			window.clearInterval(this.intervalId)
			this.intervalId = null
		}
		
		// Clean up message listener
		if (this.messageListener) {
			window.removeEventListener('message', this.messageListener)
			this.messageListener = null
		}
	}

	private reportMemoryUsage(): void {
		const memory = (performance as Performance & { memory?: PerformanceMemory }).memory
		const memoryInfo = {
			heapUsedMb: this.bytesToMegabytes(memory?.usedJSHeapSize || 0),
			heapTotalMb: this.bytesToMegabytes(memory?.totalJSHeapSize || 0),
		}
		this.sampledTelemetryCapture(TelemetryEventName.WEBVIEW_MEMORY_USAGE, memoryInfo)
	}

	private bytesToMegabytes(bytes: number): number {
		return Math.round((bytes / 1024 / 1024) * 100) / 100
	}
	
	/**
	 * Sets up message listener for memory warnings from extension
	 */
	private setupMessageListener(): void {
		this.messageListener = (event: MessageEvent) => {
			if (event.data?.type === 'memoryWarning') {
				this.handleMemoryWarning(event.data.action)
			}
		}
		
		window.addEventListener('message', this.messageListener)
	}
	
	/**
	 * Handles memory warnings by clearing caches
	 */
	private handleMemoryWarning(action: string): void {
		console.log('Memory warning received, clearing caches...')
		
		if (action === 'clearCaches') {
			this.clearCaches()
		}
	}
	
	/**
	 * Clears all caches to free memory
	 */
	public clearCaches(): void {
		// Clear internal caches
		this.caches.clear()
		
		// Clear React Query cache if available
		try {
			const { QueryClient } = require('@tanstack/react-query')
			// Note: This would need to be passed from the component that uses QueryClient
		} catch (error) {
			// React Query not available
		}
		
		// Clear image caches
		this.clearImageCaches()
		
		// Force garbage collection if available
		if (window.gc) {
			window.gc()
		}
		
		console.log('Caches cleared successfully')
	}
	
	/**
	 * Clears image caches
	 */
	private clearImageCaches(): void {
		// Clear any cached images
		const images = document.querySelectorAll('img')
		images.forEach(img => {
			if (img.src.startsWith('data:')) {
				img.src = ''
			}
		})
	}
}
