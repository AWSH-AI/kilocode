import React from "react"
import { render, fireEvent } from "@/utils/test-utils"
import QueuedMessages from "../QueuedMessages"

vi.mock("@src/components/ui", () => ({
	Button: ({ children, onClick, title }: any) => (
		<button title={title} onClick={onClick}>
			{children}
		</button>
	),
}))

describe("QueuedMessages component", () => {
	beforeEach(() => vi.clearAllMocks())

	it("calls onForceSend when the force-send button is clicked", () => {
		const onRemove = vi.fn()
		const onUpdate = vi.fn()
		const onForceSend = vi.fn()

		const queue = [{ id: "msg-1", text: "Hello queued", images: [] }]

		const { getByTitle } = render(
			<QueuedMessages queue={queue} onRemove={onRemove} onUpdate={onUpdate} onForceSend={onForceSend} />,
		)

		const sendButton = getByTitle("chat:forceSend.title")
		fireEvent.click(sendButton)

		expect(onForceSend).toHaveBeenCalledWith(0)
	})
})
