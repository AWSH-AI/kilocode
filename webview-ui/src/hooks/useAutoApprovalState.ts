import { useMemo } from "react"

interface AutoApprovalToggles {
	alwaysAllowReadOnly?: boolean
	alwaysAllowWrite?: boolean
	alwaysAllowExecute?: boolean
	alwaysAllowBrowser?: boolean
	alwaysAllowMcp?: boolean
	alwaysAllowModeSwitch?: boolean
	alwaysAllowSubtasks?: boolean
	alwaysApproveResubmit?: boolean
	alwaysAllowFollowupQuestions?: boolean
	alwaysAllowUpdateTodoList?: boolean
}

export function useAutoApprovalState(toggles: AutoApprovalToggles, autoApprovalEnabled?: boolean) {
	const hasEnabledOptions = useMemo(() => {
		const hasEnabled = Object.values(toggles).some((value) => !!value)
		return hasEnabled
	}, [toggles])

	const effectiveAutoApprovalEnabled = useMemo(() => {
		const effective = hasEnabledOptions && (autoApprovalEnabled ?? false)
		return effective
	}, [hasEnabledOptions, autoApprovalEnabled])

	return {
		hasEnabledOptions,
		effectiveAutoApprovalEnabled,
	}
}
