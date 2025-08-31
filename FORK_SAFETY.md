# Fork Safety Configuration

This repository is a fork of [Kilo Code](https://github.com/Kilo-Org/kilocode) and has been configured to prevent accidental pushes to the original repository.

## Repository Configuration

### Remote Setup
- **origin**: Points to your fork at `https://github.com/AWSH-AI/kilocode.git`
- **upstream**: Points to the original repository at `https://github.com/Kilo-Org/kilocode.git`

### Safety Measures

1. **Pre-push Hook**: A git hook prevents pushing to the original Kilo Code repository
2. **Local Git Config**: Push default is set to current branch only
3. **Remote URL Validation**: The pre-push hook validates the remote URL before allowing pushes

## Working with the Repository

### Pushing Changes
```bash
# This will push to your fork (AWSH-AI/kilocode)
git push origin main

# Or simply (since origin is your fork)
git push
```

### Pulling Updates from Original
```bash
# Fetch updates from the original repository
git fetch upstream

# Merge updates into your main branch
git merge upstream/main
```

### Checking Remote Configuration
```bash
# View all remotes
git remote -v

# Should show:
# origin    https://github.com/AWSH-AI/kilocode.git (fetch)
# origin    https://github.com/AWSH-AI/kilocode.git (push)
# upstream  https://github.com/Kilo-Org/kilocode.git (fetch)
# upstream  https://github.com/Kilo-Org/kilocode.git (push)
```

## Safety Features

### Pre-push Hook
The `.git/hooks/pre-push` script will:
- ✅ Allow pushes to your fork (AWSH-AI/kilocode)
- ❌ Block pushes to the original repository (Kilo-Org/kilocode)
- ⚠️ Warn about unknown remote URLs

### Error Messages
If you accidentally try to push to the wrong repository, you'll see:
```
❌ ERROR: Attempting to push to the original Kilo Code repository!
This is not allowed. Please ensure your origin points to your fork:
   git remote set-url origin https://github.com/AWSH-AI/kilocode.git
```

## Development Workflow

1. **Make changes** in your local repository
2. **Commit changes** with descriptive messages
3. **Push to your fork** - this will be automatically validated
4. **Create pull requests** from your fork to contribute back (if desired)

## Troubleshooting

### If the pre-push hook fails
1. Check your remote configuration: `git remote -v`
2. Ensure origin points to your fork: `git remote set-url origin https://github.com/AWSH-AI/kilocode.git`
3. Try pushing again

### If you need to update from the original repository
```bash
git fetch upstream
git merge upstream/main
git push origin main
```

## Important Notes

- **Never push directly to Kilo-Org/kilocode** - this is prevented by the safety measures
- **Always work on your fork** - all changes should go through your fork first
- **Keep your fork updated** - regularly pull from upstream to stay current
- **Use descriptive commit messages** - this helps with tracking changes

---
**Fork Safety Configuration**: January 2025
**Repository**: AWSH-AI/kilocode
**Original**: Kilo-Org/kilocode
