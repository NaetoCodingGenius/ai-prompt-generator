// Background script for AI Study Assistant extension

const APP_URL = 'https://ai-prompt-generator-beta.vercel.app';

// Create context menu
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'create-flashcard',
    title: 'Create Flashcard from "%s"',
    contexts: ['selection'],
  });
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'create-flashcard' && info.selectionText) {
    createFlashcard(info.selectionText, tab);
  }
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'createFlashcard') {
    createFlashcard(request.data.text, sender.tab, request.data.context)
      .then(() => sendResponse({ success: true }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async response
  }
});

// Handle keyboard command
chrome.commands.onCommand.addListener((command) => {
  if (command === 'create-flashcard') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      chrome.tabs.sendMessage(tab.id, { action: 'getSelectedText' }, (response) => {
        if (response?.text) {
          createFlashcard(response.text, tab);
        }
      });
    });
  }
});

async function createFlashcard(text, tab, context) {
  // Store in local storage
  const flashcard = {
    id: Date.now().toString(),
    text: text,
    front: '', // User will fill this in
    back: text, // Default to selected text
    context: {
      title: context?.title || tab?.title || '',
      url: context?.url || tab?.url || '',
    },
    createdAt: Date.now(),
  };

  // Get existing pending flashcards
  const result = await chrome.storage.local.get(['pendingFlashcards']);
  const pending = result.pendingFlashcards || [];

  // Add new flashcard
  pending.push(flashcard);

  // Save back to storage
  await chrome.storage.local.set({ pendingFlashcards: pending });

  // Update badge
  chrome.action.setBadgeText({ text: pending.length.toString() });
  chrome.action.setBadgeBackgroundColor({ color: '#6366f1' });

  // Show notification
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon-128.png',
    title: 'Flashcard Created',
    message: `"${text.slice(0, 50)}${text.length > 50 ? '...' : ''}"`,
  });

  return flashcard;
}

// Clear badge when popup is opened
chrome.action.onClicked.addListener(() => {
  chrome.action.setBadgeText({ text: '' });
});
