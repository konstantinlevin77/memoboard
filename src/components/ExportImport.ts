import { boardStore } from '../storage/boardStore.js';
import { soundManager } from '../utils/audio.js';

export class ExportImportModal {
  public element: HTMLElement;
  private isOpen = false;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'modal-backdrop';

    const card = document.createElement('div');
    card.className = 'modal-card';

    const title = document.createElement('h2');
    title.className = 'modal-title';
    title.textContent = 'MemoBoard Archive';

    const desc = document.createElement('p');
    desc.className = 'modal-desc';
    desc.textContent = 'All notes are stored securely on this device. You can export a JSON backup to keep safe or import an existing archive.';

    const actions = document.createElement('div');
    actions.className = 'modal-actions';

    // Export button
    const exportBtn = document.createElement('button');
    exportBtn.className = 'modal-btn';
    exportBtn.textContent = 'Export Board Backup (.json)';
    exportBtn.addEventListener('click', () => this.handleExport());

    // Import file input & button
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json,application/json';
    fileInput.style.display = 'none';
    fileInput.addEventListener('change', (e) => this.handleImportFile(e));

    const importBtn = document.createElement('button');
    importBtn.className = 'modal-btn';
    importBtn.textContent = 'Import Board Archive';
    importBtn.addEventListener('click', () => fileInput.click());

    // Sound toggle button
    const soundBtn = document.createElement('button');
    soundBtn.className = 'modal-btn';
    soundBtn.textContent = soundManager.getMuted() ? '🔇 Sound Effects: Muted' : '🔈 Sound Effects: Enabled';
    soundBtn.addEventListener('click', () => {
      const isMuted = soundManager.toggleMute();
      soundBtn.textContent = isMuted ? '🔇 Sound Effects: Muted' : '🔈 Sound Effects: Enabled';
      if (!isMuted) {
        soundManager.playPlaceSound();
      }
    });

    // Clear board button
    const clearBtn = document.createElement('button');
    clearBtn.className = 'modal-btn danger';
    clearBtn.textContent = 'Clear All Notes';
    clearBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all notes from this board?')) {
        const notes = boardStore.getNotes();
        notes.forEach((n) => boardStore.deleteNote(n.id));
        this.close();
      }
    });

    actions.appendChild(exportBtn);
    actions.appendChild(importBtn);
    actions.appendChild(soundBtn);
    actions.appendChild(clearBtn);
    actions.appendChild(fileInput);

    const closeRow = document.createElement('div');
    closeRow.className = 'modal-close-row';
    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-btn-close';
    closeBtn.textContent = 'Done';
    closeBtn.addEventListener('click', () => this.close());
    closeRow.appendChild(closeBtn);

    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(actions);
    card.appendChild(closeRow);

    this.element.appendChild(card);

    // Close on clicking backdrop
    this.element.addEventListener('click', (e) => {
      if (e.target === this.element) this.close();
    });

    // Listen to custom event or keyboard shortcuts
    window.addEventListener('open-memoboard-menu', () => this.open());
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        this.toggle();
      }
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  open(): void {
    this.isOpen = true;
    this.element.classList.add('open');
  }

  close(): void {
    this.isOpen = false;
    this.element.classList.remove('open');
  }

  toggle(): void {
    if (this.isOpen) this.close();
    else this.open();
  }

  private async handleExport(): Promise<void> {
    try {
      const json = await boardStore.exportBoard();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `memoboard-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed', err);
      alert('Failed to export board.');
    }
  }

  private handleImportFile(e: Event): void {
    const input = e.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        await boardStore.importBoard(text);
        alert('Board archive restored successfully!');
        this.close();
      } catch (err) {
        console.error('Failed to parse board file', err);
        alert('Failed to import: file is not a valid MemoBoard backup.');
      }
    };
    reader.readAsText(file);
    input.value = '';
  }
}
