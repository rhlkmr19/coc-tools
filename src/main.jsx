// ============================================
// Clash Intelligence Pro – Entry Point
// ============================================
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/animations.css';

// ─── Service Worker Registration ───────────────────────
const registerCustomSW = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      console.log('[ClashIntel] Custom SW registered:', reg.scope);

      // Listen for messages from the custom SW
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'NOTIFICATION_CLICK') {
          const customEvent = new CustomEvent('sw-notification-click', {
            detail: event.data
          });
          window.dispatchEvent(customEvent);
        }
      });
    } catch (err) {
      console.warn('[ClashIntel] Custom SW registration failed:', err);
    }
  }
};

// Register after first paint
if (document.readyState === 'complete') {
  registerCustomSW();
} else {
  window.addEventListener('load', registerCustomSW);
}

// ─── Request Notification Permission (non-blocking) ────
const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    // Delay prompt so it doesn't fire on first load
    setTimeout(async () => {
      try {
        await Notification.requestPermission();
      } catch {
        // User denied or browser blocked — silently continue
      }
    }, 5000);
  }
};

requestNotificationPermission();

// ─── Mount React App ───────────────────────────────────
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
