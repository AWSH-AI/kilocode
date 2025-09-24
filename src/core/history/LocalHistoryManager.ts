import * as vscode from "vscode"
import * as fs from "fs/promises"
import * as path from "path"

export interface TaskHistoryItem {
	id: string
	task: string
	timestamp: number
	messages?: any[]
	[key: string]: any
}

export class LocalHistoryManager {
	private historyDir: string

	constructor(private context: vscode.ExtensionContext) {
		this.historyDir = path.join(context.globalStorageUri.fsPath, ".kilocode", "history")
	}

	async saveTaskHistory(historyItem: TaskHistoryItem): Promise<void> {
		try {
			// Ensure the history directory exists
			await fs.mkdir(this.historyDir, { recursive: true })

			// Save the history item to a JSON file
			const filePath = path.join(this.historyDir, `${historyItem.id}.json`)
			await fs.writeFile(filePath, JSON.stringify(historyItem, null, 2))
		} catch (error) {
			console.error("Failed to save task history:", error)
			// Don't throw the error to avoid breaking the main functionality
		}
	}

	async loadTaskHistory(id: string): Promise<TaskHistoryItem | null> {
		try {
			const filePath = path.join(this.historyDir, `${id}.json`)
			const data = await fs.readFile(filePath, "utf-8")
			return JSON.parse(data) as TaskHistoryItem
		} catch (error) {
			// If file doesn't exist or can't be parsed, return null
			return null
		}
	}

	async listTaskHistory(): Promise<TaskHistoryItem[]> {
		try {
			const files = await fs.readdir(this.historyDir, { withFileTypes: true })
			const historyItems: TaskHistoryItem[] = []

			for (const file of files) {
				if (file.isFile() && file.name.endsWith(".json")) {
					try {
						const filePath = path.join(this.historyDir, file.name)
						const data = await fs.readFile(filePath, "utf-8")
						const historyItem = JSON.parse(data) as TaskHistoryItem
						historyItems.push(historyItem)
					} catch (error) {
						// Skip invalid JSON files
						console.warn(`Failed to parse history file ${file.name}:`, error)
					}
				}
			}

			// Sort by timestamp, newest first
			return historyItems.sort((a, b) => b.timestamp - a.timestamp)
		} catch (error) {
			// If directory doesn't exist or can't be read, return empty array
			return []
		}
	}

	async deleteTaskHistory(id: string): Promise<void> {
		try {
			const filePath = path.join(this.historyDir, `${id}.json`)
			await fs.unlink(filePath)
		} catch (error) {
			// If file doesn't exist, ignore the error
			console.warn(`Failed to delete history file for ${id}:`, error)
		}
	}
}
