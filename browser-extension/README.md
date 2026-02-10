# AI Study Assistant Browser Extension

Create flashcards from any website instantly by highlighting text!

## Features

- 📝 Highlight text on any webpage to create flashcards
- ⌨️ Keyboard shortcut: Ctrl+Shift+F (Cmd+Shift+F on Mac)
- 🔄 Right-click context menu integration
- 📊 Track pending flashcards with badge counter
- 🔗 One-click sync to AI Study Assistant web app

## Installation

### Chrome/Edge (Dev Mode)

1. Open `chrome://extensions` (or `edge://extensions`)
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `browser-extension` folder
5. Done! The extension icon should appear in your toolbar

### Firefox (Temporary)

1. Open `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Navigate to `browser-extension` folder
4. Select `manifest.json`
5. Done! (Note: Temporary add-ons are removed when Firefox restarts)

## How to Use

1. **Highlight Text**: Select any text on a webpage (at least 10 characters)
2. **Create Flashcard**: Click the "📚 Create Flashcard" popup button
3. **Sync to App**: Click the extension icon, then "Sync to App"
4. **Study**: The flashcards will be imported into your AI Study Assistant

### Keyboard Shortcut

- Windows/Linux: `Ctrl + Shift + F`
- Mac: `Cmd + Shift + F`

### Context Menu

Right-click on selected text → "Create Flashcard from..."

## Publishing

### Chrome Web Store

1. Create icons (16x16, 48x48, 128x128)
2. Zip the extension folder
3. Upload to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
4. Fill in store listing details
5. Submit for review

### Firefox Add-ons

1. Zip the extension folder (exclude README.md)
2. Upload to [Firefox Add-ons Developer Hub](https://addons.mozilla.org/developers/)
3. Fill in listing details
4. Submit for review

## Files Structure

```
browser-extension/
├── manifest.json       # Extension configuration
├── background.js       # Background service worker
├── content.js         # Injected into web pages
├── content.css        # Styles for injected UI
├── popup.html         # Extension popup UI
├── popup.js           # Popup logic
└── icons/
    ├── icon-16.png    # 16x16 icon
    ├── icon-48.png    # 48x48 icon
    └── icon-128.png   # 128x128 icon
```

## Development

- The extension stores pending flashcards in `chrome.storage.local`
- Communication between components uses Chrome's messaging API
- Content script injects a floating button when text is selected
- Background script manages context menus and storage

## Permissions Explained

- `activeTab`: Access to current webpage (only when you click the extension)
- `storage`: Save pending flashcards locally
- `contextMenus`: Add right-click menu option
- `host_permissions`: Connect to AI Study Assistant web app

## Future Enhancements

- [ ] AI-powered automatic front/back generation
- [ ] Support for image flashcards
- [ ] Offline mode with IndexedDB
- [ ] Customizable keyboard shortcuts
- [ ] Dark mode support
- [ ] Export to Anki/Quizlet formats
