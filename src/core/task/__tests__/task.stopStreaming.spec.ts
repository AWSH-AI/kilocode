// Provide a minimal `vscode` mock used by Task and helpers in unit tests.
vi.mock("vscode", () => ({
	// Provide env export used by getEnvironmentDetails (vscode.env.language)
	env: {
		language: "en",
	},
	window: {
		// Provide createTextEditorDecorationType used by modules that create decoration types at import time.
		createTextEditorDecorationType: vi.fn().mockReturnValue({ dispose: vi.fn() }),
		showInformationMessage: vi.fn(),
		showErrorMessage: vi.fn(),
		// Provide empty tabGroups so getEnvironmentDetails can access tabGroups.all safely.
		tabGroups: { all: [], close: vi.fn(), onDidChangeTabs: vi.fn(() => ({ dispose: vi.fn() })) },
		visibleTextEditors: [],
		activeTextEditor: null,
		onDidChangeActiveTextEditor: vi.fn(() => ({ dispose: vi.fn() })),
	},
	workspace: {
		workspaceFolders: [{ uri: { fsPath: "/mock/workspace" } }],
		getConfiguration: vi.fn().mockReturnValue({ get: vi.fn().mockReturnValue(undefined) }),
	},
	// Minimal placeholder class used for `instanceof` checks in code.
	TabInputText: class {},
}))
import { vi, describe, it, expect, beforeEach } from "vitest"

// Mock RooIgnoreController to avoid vscode RelativePattern issues during Task construction.
// Also implement `filterPaths` used by getEnvironmentDetails so tests don't hit it.
vi.mock("../../ignore/RooIgnoreController", () => ({
	RooIgnoreController: class {
		constructor() {}
		initialize = vi.fn().mockResolvedValue(undefined)
		dispose = vi.fn()
		getInstructions = vi.fn().mockReturnValue("")
		// filterPaths should accept an array of path-like objects and return a string
		// representation; implement a simple passthrough for tests.
		filterPaths = vi.fn().mockImplementation((paths: any[]) => {
			try {
				return (paths || []).map((p: any) => (p && typeof p.toPosix === "function" ? p.toPosix() : String(p))).join("\n")
			} catch {
				return ""
			}
		})
	},
}))

// Mock TelemetryService so Task constructor won't throw during tests.
vi.mock("@roo-code/telemetry", () => {
	return {
		TelemetryService: {
			instance: {
				captureTaskRestarted: vi.fn(),
				captureTaskCreated: vi.fn(),
				captureConversationMessage: vi.fn(),
				captureLlmCompletion: vi.fn(),
				captureEvent: vi.fn(),
				captureTabShown: vi.fn(),
				updateTelemetryState: vi.fn(),
			},
			hasInstance: vi.fn().mockReturnValue(true),
		},
	}
})

// Mock processKiloUserContentMentions to avoid heavy workspace/context interactions in unit tests.
// This prevents Task.recursivelyMakeClineRequests from invoking refreshWorkflowToggles and ContextProxy.
vi.mock("../../mentions/processKiloUserContentMentions", () => ({
	processKiloUserContentMentions: vi.fn().mockResolvedValue([
		[], // parsed user content
		false, // needsRulesFileCheck
	]),
}))

// Mock getEnvironmentDetails to short-circuit file system / ripgrep calls in unit tests.
// Returning a simple string avoids expensive environment enumeration and related OS-dependent behavior.
vi.mock("../../environment/getEnvironmentDetails", () => ({
	getEnvironmentDetails: vi.fn().mockResolvedValue("MOCK_ENVIRONMENT_DETAILS"),
}))

import { Task } from "../Task"

// Minimal mock provider to satisfy Task constructor needs.
const createMockProvider = () => {
	return {
		context: {
			globalStorageUri: { fsPath: "/mock/global/storage" },
			extensionPath: "/mock/extension/path",
		},
		getState: vi.fn().mockResolvedValue({ apiConfiguration: {} }),
		postMessageToWebview: vi.fn().mockResolvedValue(undefined),
		postStateToWebview: vi.fn().mockResolvedValue(undefined),
		providerSettingsManager: {
			getProfile: vi.fn().mockResolvedValue({ apiProvider: "none" }),
		},
		log: vi.fn(),
		// minimal contextProxy with originalContext.globalState.update mock (not used due to mocks above)
		contextProxy: {
			getValue: vi.fn(),
			setValue: vi.fn(),
			storeSecret: vi.fn(),
			originalContext: {
				globalState: {
					update: vi.fn().mockResolvedValue(undefined),
				},
			},
		},
	}
}

describe("Task stop-streaming behavior", () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it("calls iterator.return() when requestStopStreaming is triggered during stream", async () => {
		const mockProvider: any = createMockProvider()

		// Create a minimal fake ExtensionContext to satisfy ContextProxy usage inside Task
		const fakeExtensionContext: any = {
			globalState: {
				get: vi.fn().mockReturnValue(undefined),
				update: vi.fn().mockResolvedValue(undefined),
			},
			secrets: {
				get: vi.fn().mockResolvedValue(undefined),
				store: vi.fn().mockResolvedValue(undefined),
				delete: vi.fn().mockResolvedValue(undefined),
			},
			workspaceState: {
				get: vi.fn().mockReturnValue(undefined),
				update: vi.fn().mockResolvedValue(undefined),
			},
			extensionPath: "/mock/extension/path",
			globalStorageUri: { fsPath: "/mock/global/storage" },
			extensionUri: { fsPath: "/mock/extension/path" },
		}

		// Create Task instance without auto-starting.
		const task = new Task({
			context: fakeExtensionContext as any,
			provider: mockProvider,
			apiConfiguration: {} as any,
			startTask: false,
		})

		// Create a controllable async iterator that mimics the API stream.
		let nextCallCount = 0
		const iterator = {
			next: vi.fn().mockImplementation(async () => {
				nextCallCount++
				// First two chunks return partial text, then never resolve immediately.
				if (nextCallCount === 1) {
					return { done: false, value: { type: "text", text: "partial 1" } }
				}
				if (nextCallCount === 2) {
					// simulate a pause so the test can request stopStreaming while loop is active
					await new Promise((resolve) => setTimeout(resolve, 80))
					return { done: false, value: { type: "text", text: "partial 2" } }
				}
				// After return() is called, consumers should see done=true
				return { done: true, value: undefined }
			}),
			return: vi.fn().mockImplementation(async (value?: any) => {
				// Immediately mark done
				return { done: true, value }
			}),
			throw: vi.fn(),
		}

		// Provide a mock stream where Symbol.asyncIterator returns our iterator.
		const mockStream = {
			[Symbol.asyncIterator]() {
				return iterator
			},
		}

		// Replace attemptApiRequest on the task instance to return our mock stream.
		;(task as any).attemptApiRequest = vi.fn().mockReturnValue(mockStream)

		// Spy on say so we can detect persistence of the forced message.
		const saySpy = vi.spyOn(task as any, "say")

		// Start processing in background (don't await immediately).
		const runPromise = (task as any).recursivelyMakeClineRequests([{ type: "text", text: "start" }], true)

		// Wait for the loop to begin processing the first chunk.
		await new Promise((resolve) => setTimeout(resolve, 20))

		// Request stop-streaming with a forced message while iterator is mid-stream.
		task.requestStopStreaming("Forced instruction", ["data:image/png;base64,xyz"])

		// Wait for the processing to settle.
		await runPromise

		// Verify that iterator.return() was called to close the stream.
		expect(iterator.return).toHaveBeenCalled()

		// Verify that the forced message was persisted as user_feedback.
		expect(saySpy).toHaveBeenCalled()
		const persistedCalls = (saySpy.mock.calls as any[]).map((c) => c[0])
		expect(persistedCalls).toContain("user_feedback")
	})
})