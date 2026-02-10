// Content script for AI Study Assistant browser extension
// Runs on all web pages and allows highlighting text to create flashcards

let selectedText = '';
let popupElement = null;

// Listen for text selection
document.addEventListener('mouseup', handleTextSelection);
document.addEventListener('keyup', handleTextSelection);

function handleTextSelection() {
  const selection = window.getSelection();
  const text = selection?.toString().trim();

  if (text && text.length >= 10) {
    selectedText = text;
    showQuickPopup(selection);
  } else {
    hideQuickPopup();
  }
}

function showQuickPopup(selection) {
  hideQuickPopup(); // Remove existing popup

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  // Create popup button
  popupElement = document.createElement('div');
  popupElement.id = 'ai-study-popup';
  popupElement.innerHTML = `
    <button id="create-flashcard-btn">
      📚 Create Flashcard
    </button>
  `;

  // Position above the selection
  popupElement.style.position = 'absolute';
  popupElement.style.top = `${window.scrollY + rect.top - 45}px`;
  popupElement.style.left = `${window.scrollX + rect.left + (rect.width / 2)}px`;
  popupElement.style.transform = 'translateX(-50%)';
  popupElement.style.zIndex = '999999';

  document.body.appendChild(popupElement);

  // Add click listener
  document.getElementById('create-flashcard-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    createFlashcardFromSelection();
  });

  // Hide popup when clicking elsewhere
  setTimeout(() => {
    document.addEventListener('click', hideQuickPopup, { once: true });
  }, 100);
}

function hideQuickPopup() {
  if (popupElement) {
    popupElement.remove();
    popupElement = null;
  }
}

function createFlashcardFromSelection() {
  if (!selectedText) return;

  // Get context (page title and URL)
  const pageTitle = document.title;
  const pageUrl = window.location.href;

  // Send to background script
  chrome.runtime.sendMessage({
    action: 'createFlashcard',
    data: {
      text: selectedText,
      context: {
        title: pageTitle,
        url: pageUrl,
      },
    },
  }, (response) => {
    if (response?.success) {
      showNotification('Flashcard created!', 'success');
    } else {
      showNotification('Failed to create flashcard', 'error');
    }
  });

  hideQuickPopup();
}

function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.className = `ai-study-notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add('show');
  }, 10);

  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Listen for keyboard shortcut
chrome.commands?.onCommand?.addListener?.((command) => {
  if (command === 'create-flashcard') {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    if (text && text.length >= 10) {
      selectedText = text;
      createFlashcardFromSelection();
    }
  }
});

// Listen for context menu
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSelectedText') {
    const selection = window.getSelection();
    sendResponse({ text: selection?.toString().trim() || '' });
  }
});
