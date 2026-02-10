// Popup script for AI Study Assistant extension

const APP_URL = 'https://ai-prompt-generator-beta.vercel.app';

document.addEventListener('DOMContentLoaded', loadPendingFlashcards);

document.getElementById('sync-btn').addEventListener('click', syncToApp);
document.getElementById('clear-btn').addEventListener('click', clearFlashcards);
document.getElementById('open-app-btn').addEventListener('click', openApp);

async function loadPendingFlashcards() {
  const result = await chrome.storage.local.get(['pendingFlashcards']);
  const pending = result.pendingFlashcards || [];

  if (pending.length === 0) {
    document.getElementById('pending-section').style.display = 'none';
    document.getElementById('empty-state').style.display = 'block';
    return;
  }

  document.getElementById('pending-section').style.display = 'block';
  document.getElementById('empty-state').style.display = 'none';
  document.getElementById('count-badge').textContent = pending.length;

  const listElement = document.getElementById('flashcard-list');
  listElement.innerHTML = '';

  pending.forEach((flashcard) => {
    const item = document.createElement('div');
    item.className = 'flashcard-item';
    item.innerHTML = `
      <div class="flashcard-text">${flashcard.text.slice(0, 100)}${flashcard.text.length > 100 ? '...' : ''}</div>
      <div class="flashcard-source">
        🌐 ${flashcard.context.title.slice(0, 40)}${flashcard.context.title.length > 40 ? '...' : ''}
      </div>
    `;
    listElement.appendChild(item);
  });
}

async function syncToApp() {
  const result = await chrome.storage.local.get(['pendingFlashcards']);
  const pending = result.pendingFlashcards || [];

  if (pending.length === 0) {
    alert('No flashcards to sync');
    return;
  }

  // Open the app with flashcards data in URL parameters
  const flashcardsJson = encodeURIComponent(JSON.stringify(pending));
  const url = `${APP_URL}?import=extension&data=${flashcardsJson}`;

  chrome.tabs.create({ url });

  // Clear pending flashcards
  await chrome.storage.local.set({ pendingFlashcards: [] });
  chrome.action.setBadgeText({ text: '' });

  // Reload popup to show empty state
  loadPendingFlashcards();
}

async function clearFlashcards() {
  if (!confirm('Clear all pending flashcards?')) {
    return;
  }

  await chrome.storage.local.set({ pendingFlashcards: [] });
  chrome.action.setBadgeText({ text: '' });
  loadPendingFlashcards();
}

function openApp() {
  chrome.tabs.create({ url: APP_URL });
}
