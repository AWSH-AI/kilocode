import { describe, test, expect, vi, beforeEach } from "vitest"
import { LocalHistoryManager } from "../LocalHistoryManager"
import * as vscode from "vscode"
import * as path from "path"

// Mock vscode module
vi.mock("vscode", () => ({
	Uri: {
		file: (path: string) => ({ fsPath: path }),
	},
}))

// Mock fs module with factory function
vi.mock("fs/promises", () => ({
	mkdir: vi.fn(),
	writeFile: vi.fn(),
	readFile: vi.fn(),
	readdir: vi.fn(),
	unlink: vi.fn(),
}))

// Import mocked modules after mocking
import * as fs from "fs/promises"
const mockedFs = vi.mocked(fs)

// Mock Dirent type for testing
const createMockDirent = (name: string): any => ({
	name,
	isFile: () => true,
	isDirectory: () => false,
	isBlockDevice: () => false,
	isCharacterDevice: () => false,
	isSymbolicLink: () => false,
	isFIFO: () => false,
	isSocket: () => false,
})

describe("LocalHistoryManager", () => {
	let mockContext: vscode.ExtensionContext
	let historyManager: LocalHistoryManager

	beforeEach(() => {
		// Reset all mocks
		vi.clearAllMocks()

		// Create mock context
		mockContext = {
			globalStorageUri: { fsPath: "/test/global/storage" },
		} as unknown as vscode.ExtensionContext

		// Create history manager
		historyManager = new LocalHistoryManager(mockContext)
	})

	describe("constructor", () => {
		test("should set history directory path", () => {
			expect(historyManager["historyDir"]).toBe(path.join("/test/global/storage", ".kilocode", "history"))
		})
	})

	describe("saveTaskHistory", () => {
		test("should create directory and save task history", async () => {
			const historyItem = {
				id: "test-id",
				task: "test task",
				timestamp: Date.now(),
				messages: [],
			}

			// Mock fs operations
			vi.mocked(mockedFs.mkdir).mockResolvedValue(undefined)
			vi.mocked(mockedFs.writeFile).mockResolvedValue(undefined)

			await historyManager.saveTaskHistory(historyItem)

			expect(mockedFs.mkdir).toHaveBeenCalledWith(historyManager["historyDir"], { recursive: true })
			expect(mockedFs.writeFile).toHaveBeenCalledWith(
				path.join(historyManager["historyDir"], "test-id.json"),
				JSON.stringify(historyItem, null, 2),
			)
		})

		test("should handle errors gracefully", async () => {
			const historyItem = {
				id: "test-id",
				task: "test task",
				timestamp: Date.now(),
				messages: [],
			}

			// Mock fs to throw error
			vi.mocked(mockedFs.mkdir).mockRejectedValue(new Error("Permission denied"))

			// Should not throw error
			await expect(historyManager.saveTaskHistory(historyItem)).resolves.not.toThrow()
		})
	})

	describe("loadTaskHistory", () => {
		test("should load task history successfully", async () => {
			const historyItem = {
				id: "test-id",
				task: "test task",
				timestamp: Date.now(),
				messages: [],
			}

			// Mock fs operations
			vi.mocked(mockedFs.readFile).mockResolvedValue(JSON.stringify(historyItem))

			const result = await historyManager.loadTaskHistory("test-id")

			expect(result).toEqual(historyItem)
			expect(mockedFs.readFile).toHaveBeenCalledWith(
				path.join(historyManager["historyDir"], "test-id.json"),
				"utf-8",
			)
		})

		test("should return null if file does not exist", async () => {
			// Mock fs to throw file not found error
			vi.mocked(mockedFs.readFile).mockRejectedValue(new Error("ENOENT: no such file or directory"))

			const result = await historyManager.loadTaskHistory("non-existent-id")

			expect(result).toBeNull()
		})

		test("should return null for invalid JSON", async () => {
			// Mock fs to return invalid JSON
			vi.mocked(mockedFs.readFile).mockResolvedValue("invalid json")

			const result = await historyManager.loadTaskHistory("invalid-json-id")

			expect(result).toBeNull()
		})
	})

	describe("listTaskHistory", () => {
		test("should return empty array when history directory does not exist", async () => {
			// Mock fs to throw error for directory access
			vi.mocked(mockedFs.readdir).mockRejectedValue(new Error("ENOENT: no such file or directory"))

			const result = await historyManager.listTaskHistory()

			expect(result).toEqual([])
		})

		test("should list task history items", async () => {
			const historyItems = [
				{
					id: "test-id-1",
					task: "test task 1",
					timestamp: Date.now(),
					messages: [],
				},
				{
					id: "test-id-2",
					task: "test task 2",
					timestamp: Date.now(),
					messages: [],
				},
			]

			// Mock fs operations
			vi.mocked(mockedFs.readdir).mockResolvedValue([
				createMockDirent("test-id-1.json"),
				createMockDirent("test-id-2.json"),
				createMockDirent("other-file.txt"),
			])
			vi.mocked(mockedFs.readFile)
				.mockResolvedValueOnce(JSON.stringify(historyItems[0]))
				.mockResolvedValueOnce(JSON.stringify(historyItems[1]))

			const result = await historyManager.listTaskHistory()

			expect(result).toEqual(historyItems)
			expect(mockedFs.readdir).toHaveBeenCalledWith(historyManager["historyDir"], { withFileTypes: true })
		})

		test("should handle invalid JSON files gracefully", async () => {
			const validItem = {
				id: "test-id-1",
				task: "test task 1",
				timestamp: Date.now(),
				messages: [],
			}

			// Mock fs operations
			vi.mocked(mockedFs.readdir).mockResolvedValue([
				createMockDirent("test-id-1.json"),
				createMockDirent("invalid.json"),
			])
			vi.mocked(mockedFs.readFile)
				.mockResolvedValueOnce(JSON.stringify(validItem))
				.mockResolvedValueOnce("invalid json")

			const result = await historyManager.listTaskHistory()

			expect(result).toEqual([validItem])
		})
	})

	describe("deleteTaskHistory", () => {
		test("should delete task history file", async () => {
			// Mock fs operations
			vi.mocked(mockedFs.unlink).mockResolvedValue(undefined)

			await historyManager.deleteTaskHistory("test-id")

			expect(mockedFs.unlink).toHaveBeenCalledWith(path.join(historyManager["historyDir"], "test-id.json"))
		})

		test("should handle file not found gracefully", async () => {
			// Mock fs to throw file not found error
			vi.mocked(mockedFs.unlink).mockRejectedValue(new Error("ENOENT: no such file or directory"))

			// Should not throw error
			await expect(historyManager.deleteTaskHistory("non-existent-id")).resolves.not.toThrow()
		})
	})
})
