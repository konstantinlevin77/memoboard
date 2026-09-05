import './styles/board.css';
import { Corkboard } from './components/Corkboard.js';
import { Desk } from './components/Desk.js';
import { ExportImportModal } from './components/ExportImport.js';
import { boardStore } from './storage/boardStore.js';

async function bootstrap() {
  const root = document.getElementById('app');
  if (!root) {
    console.error('MemoBoard: #app root element not found!');
    return;
  }

  // Clear any existing content in #app
  root.innerHTML = '';

  const scene = document.createElement('div');
  scene.id = 'scene';

  // 1. Corkboard on the wall
  const corkboard = new Corkboard();

  // 2. Desk with blank Post-it pads and wastebasket
  const desk = new Desk(corkboard);

  // Connect wastebasket drop detection
  corkboard.setWastebasketChecker({
    isOverWastebasket: (cx, cy) => desk.isOverWastebasket(cx, cy),
    onDropOverWastebasket: (noteId) => desk.discardNoteWithAnimation(noteId),
    setHoverState: (hovering) => desk.setWastebasketHoverState(hovering)
  });

  // 3. Subtle archival modal (accessed via bottom-right stamp or Ctrl/Cmd+E)
  const modal = new ExportImportModal();

  scene.appendChild(corkboard.element);
  scene.appendChild(desk.element);
  scene.appendChild(modal.element);

  root.appendChild(scene);

  // Initialize storage
  try {
    await boardStore.init();
  } catch (err) {
    console.warn('Storage initialization fallback:', err);
  }

  // Handle service worker registration
  if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    if (import.meta.env.PROD) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.debug('ServiceWorker registration skipped:', err);
      });
    } else {
      // In development, unregister any stale service workers that could intercept Vite
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const reg of registrations) {
          reg.unregister();
        }
      });
    }
  }
}

// Module scripts are deferred by default, meaning DOMContentLoaded may have already fired
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => bootstrap());
} else {
  bootstrap();
}
