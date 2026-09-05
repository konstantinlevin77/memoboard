import { NoteColor, NOTE_COLORS } from '../types.js';
import { Corkboard } from './Corkboard.js';
import { boardStore } from '../storage/boardStore.js';
import { soundManager } from '../utils/audio.js';

export class Desk {
  public element: HTMLElement;
  private wastebasketZone: HTMLElement;
  private corkboard: Corkboard;

  // Active dragging from pad
  private activeGhost: HTMLElement | null = null;
  private activePadColor: NoteColor | null = null;
  private isPeeling = false;

  constructor(corkboard: Corkboard) {
    this.corkboard = corkboard;
    this.element = document.createElement('div');
    this.element.className = 'desk-area';

    // Pads container on left/center
    const padsContainer = document.createElement('div');
    padsContainer.className = 'pads-container';

    const colors: NoteColor[] = ['yellow', 'pink', 'blue', 'green', 'orange'];
    colors.forEach((col) => {
      const pad = this.createPostitPad(col);
      padsContainer.appendChild(pad);
    });

    this.element.appendChild(padsContainer);

    // Wastebasket on right
    this.wastebasketZone = this.createWastebasket();
    this.element.appendChild(this.wastebasketZone);

    // GitHub link anchored to lower right corner
    const githubLink = this.createGithubLink();
    this.element.appendChild(githubLink);

    this.bindGlobalPointerEvents();
  }

  private createPostitPad(color: NoteColor): HTMLElement {
    const pad = document.createElement('div');
    pad.className = 'postit-pad';
    pad.dataset.color = color;
    pad.title = `Grab a ${NOTE_COLORS[color].label} note`;

    const colorConfig = NOTE_COLORS[color];
    pad.style.setProperty('--pad-bg', colorConfig.bg);
    pad.style.setProperty('--pad-border', colorConfig.border);

    const sheets = document.createElement('div');
    sheets.className = 'pad-sheets';

    const topSheet = document.createElement('div');
    topSheet.className = 'pad-top-sheet';

    pad.appendChild(sheets);
    pad.appendChild(topSheet);

    pad.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      this.startPeel(color, e);
    });

    return pad;
  }

  private createWastebasket(): HTMLElement {
    const zone = document.createElement('div');
    zone.className = 'wastebasket-zone';
    zone.title = 'Drag a note here to discard it';

    const bin = document.createElement('div');
    bin.className = 'wastebasket-bin';

    const crumpled = document.createElement('div');
    crumpled.className = 'wastebasket-contents';
    bin.appendChild(crumpled);

    const label = document.createElement('span');
    label.className = 'wastebasket-label';
    label.textContent = 'Trash';

    zone.appendChild(bin);
    zone.appendChild(label);

    return zone;
  }

  private createGithubLink(): HTMLElement {
    const link = document.createElement('a');
    link.className = 'desk-github-link';
    link.href = 'https://github.com/konstantinlevin77/memoboard';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.title = 'MemoBoard on GitHub (konstantinlevin77/memoboard)';
    link.setAttribute('aria-label', 'GitHub repository');

    link.innerHTML = `
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
      </svg>
    `;

    return link;
  }

  private startPeel(color: NoteColor, e: PointerEvent): void {
    this.isPeeling = true;
    this.activePadColor = color;

    // Create ghost note element
    const colorInfo = NOTE_COLORS[color];
    this.activeGhost = document.createElement('div');
    this.activeGhost.className = 'drag-ghost';
    this.activeGhost.style.backgroundColor = colorInfo.bg;
    this.activeGhost.style.border = `1px solid ${colorInfo.border}`;
    this.activeGhost.style.setProperty('--note-shadow', colorInfo.shadow);

    const pin = document.createElement('div');
    pin.className = 'note-pin';
    pin.style.backgroundColor = colorInfo.pin;
    this.activeGhost.appendChild(pin);

    document.body.appendChild(this.activeGhost);
    this.updateGhostPosition(e.clientX, e.clientY);
  }

  private updateGhostPosition(clientX: number, clientY: number): void {
    if (!this.activeGhost) return;
    this.activeGhost.style.left = `${clientX}px`;
    this.activeGhost.style.top = `${clientY}px`;

    // Subtle tilt during flight
    const isOverBoard = this.corkboard.isPointOverCorkboard(clientX, clientY);
    this.activeGhost.style.transform = `translate(-50%, -50%) scale(${isOverBoard ? 1.0 : 0.95}) rotate(2deg)`;
  }

  private bindGlobalPointerEvents(): void {
    window.addEventListener('pointermove', (e) => {
      if (!this.isPeeling || !this.activeGhost) return;
      this.updateGhostPosition(e.clientX, e.clientY);
    });

    window.addEventListener('pointerup', (e) => {
      if (!this.isPeeling) return;
      this.finishPeel(e);
    });

    window.addEventListener('pointercancel', (e) => {
      if (!this.isPeeling) return;
      this.finishPeel(e);
    });
  }

  private finishPeel(e: PointerEvent): void {
    if (!this.isPeeling) return;
    this.isPeeling = false;

    const color = this.activePadColor;
    const ghost = this.activeGhost;
    this.activeGhost = null;
    this.activePadColor = null;

    if (!ghost || !color) return;

    // Check if dropped on the corkboard
    if (this.corkboard.isPointOverCorkboard(e.clientX, e.clientY)) {
      const { xPct, yPct } = this.corkboard.clientToBoardPercent(e.clientX, e.clientY);
      const created = boardStore.createNote(xPct, yPct, color, '');
      ghost.remove();

      soundManager.playPlaceSound();

      // Automatically focus the newly created note's writing area
      setTimeout(() => {
        this.corkboard.focusNote(created.id);
      }, 50);
    } else {
      // Released elsewhere: cancel smoothly
      ghost.style.transition = 'transform 0.2s ease, opacity 0.2s ease';
      ghost.style.transform = 'translate(-50%, -50%) scale(0.2)';
      ghost.style.opacity = '0';
      setTimeout(() => ghost.remove(), 200);
    }
  }

  // Wastebasket check interface
  isOverWastebasket(clientX: number, clientY: number): boolean {
    const rect = this.wastebasketZone.getBoundingClientRect();
    return (
      clientX >= rect.left - 15 &&
      clientX <= rect.right + 15 &&
      clientY >= rect.top - 15 &&
      clientY <= rect.bottom + 15
    );
  }

  setWastebasketHoverState(hovering: boolean): void {
    if (hovering) {
      this.wastebasketZone.classList.add('drag-hover');
    } else {
      this.wastebasketZone.classList.remove('drag-hover');
    }
  }

  discardNoteWithAnimation(noteId: string): void {
    soundManager.playTrashSound();
    const noteEl = document.querySelector(`.note-item[data-id="${noteId}"]`) as HTMLElement;
    if (noteEl) {
      noteEl.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      noteEl.style.transform = 'scale(0.1) rotate(45deg)';
      noteEl.style.opacity = '0';
      setTimeout(() => {
        boardStore.deleteNote(noteId);
      }, 280);
    } else {
      boardStore.deleteNote(noteId);
    }
  }
}
