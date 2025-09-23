# Quick Start: Making VS Code Function Like JetBrains IDEs

This quick start guide will help you set up VS Code to function like JetBrains IDEs in just a few minutes.

## Step 1: Install Essential Extensions

### 1. ReSharper for VS Code (for C# developers)

- Search for `C#` by Microsoft in the Extensions marketplace
- Install the extension

### 2. VSCode Neovim (for Vim emulation)

- Search for `VSCode Neovim` in the Extensions marketplace
- Install the extension
- Make sure you have Neovim installed on your system

### 3. Essential Productivity Extensions

Install these extensions from the marketplace:

- `Error Lens` (usernamehw.errorlens)
- `Bookmarks` (alefragnani.bookmarks)
- `Project Manager` (alefragnani.project-manager)
- `TODO Tree` (Gruntfuggly.todo-tree)
- `Material Theme` (Equinusocio.vsc-material-theme)
- `Material Icon Theme` (PKief.material-icon-theme)

## Step 2: Configure VS Code Settings

Copy and paste this configuration into your VS Code settings:

1. Open Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
2. Type `Preferences: Open Settings (JSON)`
3. Paste the following configuration:

```json
{
	// Editor settings
	"editor.fontFamily": "Fira Code, 'Courier New', monospace",
	"editor.fontSize": 14,
	"editor.lineHeight": 1.6,
	"editor.fontLigatures": true,
	"editor.tabSize": 4,
	"editor.insertSpaces": true,
	"editor.renderWhitespace": "boundary",
	"editor.formatOnSave": true,
	"editor.formatOnPaste": true,

	// Workbench settings
	"workbench.colorTheme": "Material Theme Darker",
	"workbench.iconTheme": "material-icon-theme",
	"workbench.editor.enablePreview": false,

	// VSCode Neovim settings
	"vscode-neovim.compositeKeys": {
		"jj": {
			"command": "vscode-neovim.escape"
		}
	},

	// For macOS users
	"keyboard.dispatch": "keyCode"
}
```

## Step 3: Configure Keybindings

1. Open Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
2. Type `Preferences: Open Keyboard Shortcuts (JSON)`
3. Paste the following keybindings:

```json
[
	// Editor navigation
	{
		"key": "ctrl+shift+o",
		"command": "workbench.action.showAllSymbols"
	},
	{
		"key": "ctrl+p",
		"command": "workbench.action.quickOpen"
	},
	{
		"key": "ctrl+shift+f",
		"command": "workbench.action.findInFiles"
	},

	// Editor management
	{
		"key": "ctrl+\\",
		"command": "workbench.action.splitEditor"
	},

	// Terminal
	{
		"key": "ctrl+`",
		"command": "workbench.action.terminal.toggleTerminal"
	},

	// Bookmarks
	{
		"key": "ctrl+alt+k",
		"command": "bookmarks.toggle",
		"when": "editorTextFocus"
	},
	{
		"key": "ctrl+alt+j",
		"command": "bookmarks.jumpToNext",
		"when": "editorTextFocus"
	},
	{
		"key": "ctrl+alt+l",
		"command": "bookmarks.jumpToPrevious",
		"when": "editorTextFocus"
	},

	// Format
	{
		"key": "ctrl+alt+l",
		"command": "editor.action.formatDocument",
		"when": "editorHasDocumentFormattingProvider && editorTextFocus && !editorReadonly"
	},

	// Quick fixes
	{
		"key": "alt+enter",
		"command": "editor.action.quickFix",
		"when": "editorHasCodeActionsProvider && editorTextFocus && !editorReadonly"
	}
]
```

## Step 4: Configure Neovim (if using VSCode Neovim)

1. Create or edit your Neovim configuration file:

    - Linux/macOS: `~/.config/nvim/init.vim`
    - Windows: `~/AppData/Local/nvim/init.vim`

2. Add the following configuration:

```vim
" Basic settings
set number
set relativenumber
set expandtab
set shiftwidth=4
set tabstop=4
set smartcase
set ignorecase
set incsearch
set hlsearch

" Leader key
let mapleader = " "

" VSCode specific configuration
if exists('g:vscode')
    " Navigation
    nnoremap <leader>d <Cmd>call VSCodeNotify('workbench.action.debug.start')<CR>
    nnoremap <leader>f <Cmd>call VSCodeNotify('workbench.action.quickOpen')<CR>
    nnoremap <leader>g <Cmd>call VSCodeNotify('workbench.action.findInFiles')<CR>
    nnoremap <leader>s <Cmd>call VSCodeNotify('workbench.action.showAllSymbols')<CR>

    " Editor actions
    nnoremap <leader>r <Cmd>call VSCodeNotify('editor.action.refactor')<CR>
    nnoremap <leader>rn <Cmd>call VSCodeNotify('editor.action.rename')<CR>

    " Format
    xnoremap = <Cmd>call VSCodeNotify('editor.action.formatSelection')<CR>
    nnoremap = <Cmd>call VSCodeNotify('editor.action.formatSelection')<CR><Esc>

    " Navigate errors
    nnoremap [e <Cmd>call VSCodeNotify('editor.action.marker.prevInFiles')<CR>
    nnoremap ]e <Cmd>call VSCodeNotify('editor.action.marker.nextInFiles')<CR>

    " Split navigation
    nnoremap <C-h> <Cmd>call VSCodeNotify('workbench.action.navigateLeft')<CR>
    nnoremap <C-j> <Cmd>call VSCodeNotify('workbench.action.navigateDown')<CR>
    nnoremap <C-k> <Cmd>call VSCodeNotify('workbench.action.navigateUp')<CR>
    nnoremap <C-l> <Cmd>call VSCodeNotify('workbench.action.navigateRight')<CR>
else
    " Regular Neovim configuration
    set mouse=a
    syntax on
    colorscheme desert
endif
```

## Step 5: Install Fira Code Font (Optional but Recommended)

1. Download Fira Code from: [https://github.com/tonsky/FiraCode](https://github.com/tonsky/FiraCode)
2. Install the font on your system
3. Restart VS Code

## Step 6: macOS Specific Fixes

If you're on macOS, run this command in your terminal to fix key repeat:

```bash
defaults write com.microsoft.VSCode ApplePressAndHoldEnabled -bool false
```

Then restart VS Code.

## Step 7: Basic Usage

### Vim Mode

- Press `Esc` to enter Normal mode
- Press `i` to enter Insert mode
- Press `jj` or `jk` quickly to exit Insert mode
- Use Vim commands for navigation and editing

### Key Features

- **Bookmarks**: `Ctrl+Alt+K` to toggle, `Ctrl+Alt+J/L` to navigate
- **Quick Open**: `Ctrl+P` to find files
- **Find in Files**: `Ctrl+Shift+F`
- **Format Code**: `Ctrl+Alt+L`
- **Quick Fix**: `Alt+Enter`
- **Split Editor**: `Ctrl+\`

### Navigation

- `Ctrl+Shift+O`: Go to symbol in file
- `Ctrl+P`: Quick open files
- `Ctrl+Shift+F`: Find in files
- `F8`: Go to next error
- `Shift+F8`: Go to previous error

## Next Steps

1. **Explore the comprehensive guide** in `vscode-jetbrains-guide.md` for advanced configurations
2. **Customize further** based on your specific needs
3. **Install language-specific extensions** for your development stack
4. **Explore VS Code settings** to fine-tune your experience

## Troubleshooting

### VSCode Neovim Issues

- Make sure Neovim is installed and in your PATH
- Check the VSCode Neovim extension settings for the correct path to Neovim
- Restart VS Code after making configuration changes

### Keybinding Issues

- Check for conflicts with other extensions
- Verify that your keyboard shortcuts don't conflict with system shortcuts
- Use the Command Palette to test if commands work

### Performance Issues

- Disable unused extensions
- Adjust VS Code settings for better performance
- Consider using VS Code Insiders for the latest performance improvements

You're now ready to use VS Code with a JetBrains-like experience!
