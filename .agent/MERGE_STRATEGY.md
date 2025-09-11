# AWSH Kilocode Merge Strategy

## Overview

This document outlines the proven strategy for merging upstream kilocode changes into our AWSH fork while preserving custom branding and optimizations.

## Last Successful Merge

- **Date**: January 2025
- **Upstream Commits**: 328 commits merged
- **Version**: 4.86.0 → 4.92.1
- **Strategy**: Merge with conflict resolution (not cherry-pick)

## Why Merge Strategy Works Better Than Cherry-Pick

### Cherry-Pick Issues Encountered:

- **Structural conflicts**: Our fork has deleted files (image components, wrapper files)
- **Rebranding conflicts**: Extensive localization and branding changes
- **Memory optimization conflicts**: Custom memory management code conflicts
- **High failure rate**: Most cherry-picks failed due to complex conflicts

### Merge Strategy Advantages:

- **Preserves history**: Maintains complete commit history from upstream
- **Handles structural changes**: Git merge handles file deletions and additions better
- **Selective conflict resolution**: Can choose which version to keep for each conflict
- **Comprehensive integration**: Brings in all related changes together

## Step-by-Step Merge Process

### 1. Preparation

```bash
# Navigate to your fork
cd /path/to/awsh-kilocode

# Add upstream remote (if not already added)
git remote add upstream /path/to/original-kilocode

# Fetch latest changes
git fetch upstream
```

### 2. Create Backup and Working Branch

```bash
# Create backup of current state
git checkout -b backup-before-merge

# Create working branch for merge
git checkout -b merge-upstream-changes

# Commit any uncommitted changes
git add .
git commit -m "WIP: Save current changes before merge"
```

### 3. Execute Merge

```bash
# Perform the merge
git merge upstream/main
```

### 4. Conflict Resolution Strategy

#### Critical Files to Preserve AWSH Branding:

- `package.json` - Keep AWSH publisher and package names
- `src/package.json` - Preserve AWSH branding, update version
- `webview-ui/src/i18n/locales/*/kilocode.json` - Keep AWSH references
- `src/core/webview/ClineProvider.ts` - Preserve AWSH branding in comments

#### Files to Accept Upstream Changes:

- `src/core/task/Task.ts` - Accept upstream error handling improvements
- `src/core/tools/newTaskTool.ts` - Accept upstream tool improvements
- `src/services/ghost/index.ts` - Accept upstream service improvements
- `src/shared/ExtensionMessage.ts` - Accept upstream message handling
- `src/api/providers/constants.ts` - Accept upstream provider updates
- `webview-ui/src/components/cloud/CloudView.tsx` - Accept upstream cloud features
- `webview-ui/src/components/kilocode/helpers.ts` - Accept upstream helper functions

#### Hybrid Resolution (Keep Both):

- `webview-ui/src/context/ExtensionStateContext.tsx` - Merge custom settings with upstream image generation settings
- `src/core/webview/ClineProvider.ts` - Keep memory optimizations + upstream message queue features

### 5. Conflict Resolution Commands

#### For files where you want to keep AWSH branding:

```bash
# Manually edit the file to resolve conflicts
# Keep AWSH references, accept upstream functionality
git add <filename>
```

#### For files where you want upstream changes:

```bash
# Accept upstream version
git checkout --theirs <filename>
git add <filename>
```

#### For complex files requiring manual resolution:

```bash
# Edit file manually, then:
git add <filename>
```

### 6. Install Dependencies and Test

```bash
# Install new dependencies
pnpm install

# Run linting to ensure no issues
pnpm lint

# Test the build
pnpm build
```

### 7. Complete Merge

```bash
# Commit the merge
git commit -m "Merge upstream kilocode changes (X commits)

- Added [list major new features]
- Preserved AWSH branding and custom optimizations
- Updated to version X.X.X"
```

## Key Features Added in Last Merge

### Major New Functionality:

- **JetBrains Support**: Complete plugin infrastructure
- **Cloud Services**: Authentication and cloud integration
- **Image Generation**: AI-powered image generation capabilities
- **Checkpoint System**: Task recovery and state management
- **New Providers**: Vercel AI Gateway and other providers
- **Message Queue**: Enhanced message handling system
- **Bug Fixes**: Hundreds of stability and performance improvements

### Preserved Custom Features:

- **AWSH Branding**: All UI elements maintain AWSH identity
- **Memory Optimizations**: Custom memory management preserved
- **Package Configuration**: AWSH publisher and package names
- **Documentation**: Custom documentation and branding references

## Conflict Resolution Patterns

### Pattern 1: Branding Conflicts

```diff
<<<<<<< HEAD
- "publisher": "awsh-ai",
- "version": "4.86.0",
=======
- "publisher": "kilocode",
- "version": "4.92.1",
>>>>>>> upstream/main
```

**Resolution**: Keep AWSH publisher, accept upstream version

### Pattern 2: Localization Conflicts

```diff
<<<<<<< HEAD
- "description": "When enabled, AWSH Code will automatically trigger..."
=======
- "description": "When enabled, Kilo Code will automatically trigger..."
>>>>>>> upstream/main
```

**Resolution**: Keep AWSH branding in descriptions

### Pattern 3: Feature Addition Conflicts

```diff
<<<<<<< HEAD
- commands: [],
- alwaysAllowFollowupQuestions: false,
=======
- openRouterImageApiKey: "",
- kiloCodeImageApiKey: "",
>>>>>>> upstream/main
```

**Resolution**: Keep both custom settings and new upstream features

### Pattern 4: Memory Optimization Conflicts

```diff
<<<<<<< HEAD
- // Load taskHistory on-demand from disk storage instead of global state
- taskHistory: await this.getTaskHistoryOnDemand(),
=======
- messageQueue: this.getCurrentTask()?.messageQueueService?.messages,
- taskHistory: (taskHistory || []).filter(...).sort(...),
>>>>>>> upstream/main
```

**Resolution**: Keep memory optimizations, add upstream message queue features

## Testing Checklist

After merge completion:

- [ ] Extension builds successfully (`pnpm build`)
- [ ] Linting passes (`pnpm lint`)
- [ ] AWSH branding appears correctly in UI
- [ ] Memory optimizations still function
- [ ] New features (JetBrains, cloud, etc.) are available
- [ ] No regression in existing functionality

## Rollback Strategy

If issues are discovered:

```bash
# Switch back to backup branch
git checkout backup-before-merge

# Or reset to pre-merge state
git reset --hard HEAD~1
```

## Future Merge Considerations

### When to Merge:

- **Major version updates** (e.g., 4.9x → 5.0x)
- **Significant new features** (JetBrains, cloud services)
- **Critical bug fixes** and security updates
- **Performance improvements**

### When to Cherry-Pick Instead:

- **Single bug fixes** that don't conflict with our changes
- **Simple feature additions** that don't touch our modified files
- **Documentation updates** that don't affect branding

### Preparation for Next Merge:

1. **Document current custom changes** in this file
2. **Test current functionality** before starting merge
3. **Create comprehensive backup** before merge
4. **Update this strategy** based on new learnings

## Lessons Learned

### What Worked Well:

- **Merge strategy** handled complex conflicts better than cherry-pick
- **Selective conflict resolution** preserved custom features while gaining upstream benefits
- **Comprehensive testing** caught issues early
- **Backup strategy** provided safety net

### What to Improve:

- **Automated conflict resolution** for common patterns
- **Better documentation** of custom changes before merge
- **Incremental testing** during conflict resolution
- **Automated rollback** if critical issues detected

## Maintenance Notes

- **Update this document** after each successful merge
- **Document new custom features** as they're added
- **Track upstream changes** that might affect our customizations
- **Regular testing** of merge compatibility

---

_Last updated: January 2025_
_Next review: Before next major upstream merge_
