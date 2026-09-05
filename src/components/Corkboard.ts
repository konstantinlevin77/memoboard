import { Note, NOTE_WIDTH, NOTE_HEIGHT } from '../types.js';
import { boardStore } from '../storage/boardStore.js';
import { NoteElement } from './NoteElement.js';
import { soundManager } from '../utils/audio.js';

export interface DropWastebasketChecker {
  isOverWastebasket: (clientX: number, clientY: number) => boolean;
  onDropOverWastebasket: (noteId: string) => void;
  setHoverState: (hovering: boolean) => void;
}

export class Corkboard {
  public element: HTMLElement;
  private corkSurface: HTMLElement;
  private boardContainer: HTMLElement;
  private noteElements: Map<string, NoteElement> = new Map();
  private wastebasketChecker: DropWastebasketChecker | null = null;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'wall-area';

    const frame = document.createElement('div');
    frame.className = 'corkboard-frame';

    this.corkSurface = document.createElement('div');
    this.corkSurface.className = 'cork-surface';

    this.boardContainer = document.createElement('div');
    this.boardContainer.className = 'board-container';

    this.corkSurface.appendChild(this.boardContainer);
    frame.appendChild(this.corkSurface);

    // Frame brass maker mark
    const stamp = document.createElement('div');
    stamp.className = 'frame-stamp';
    stamp.textContent = 'MEMOBOARD';
    stamp.title = 'MemoBoard Options';
    stamp.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('open-memoboard-menu'));
    });
    frame.appendChild(stamp);

    this.element.appendChild(frame);

    this.initResizeObserver();
    this.bindStore();
  }

  setWastebasketChecker(checker: DropWastebasketChecker): void {
    this.wastebasketChecker = checker;
  }

  private initResizeObserver(): void {
    const ro = new ResizeObserver(() => this.repositionAllNotes());
    ro.observe(this.corkSurface);
    window.addEventListener('resize', () => this.repositionAllNotes());
  }

  private repositionAllNotes(): void {
    for (const [id, comp] of this.noteElements.entries()) {
      const note = boardStore.getNote(id);
      if (note) {
        const { px, py } = this.percentToPixels(note.x, note.y);
        comp.setPosition(px, py);
      }
    }
  }

  percentToPixels(xPct: number, yPct: number): { px: number; py: number } {
    const rect = this.corkSurface.getBoundingClientRect();
    const maxX = Math.max(0, rect.width - NOTE_WIDTH);
    const maxY = Math.max(0, rect.height - NOTE_HEIGHT);
    const px = Math.round(xPct * maxX);
    const py = Math.round(yPct * maxY);
    return { px, py };
  }

  clientToBoardPercent(clientX: number, clientY: number): { xPct: number; yPct: number } {
    const rect = this.corkSurface.getBoundingClientRect();
    const maxX = Math.max(1, rect.width - NOTE_WIDTH);
    const maxY = Math.max(1, rect.height - NOTE_HEIGHT);

    const px = clientX - rect.left - NOTE_WIDTH / 2;
    const py = clientY - rect.top - NOTE_HEIGHT / 2;

    const xPct = Math.max(0, Math.min(1, px / maxX));
    const yPct = Math.max(0, Math.min(1, py / maxY));
    return { xPct, yPct };
  }

  isPointOverCorkboard(clientX: number, clientY: number): boolean {
    const rect = this.corkSurface.getBoundingClientRect();
    return (
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom
    );
  }

  private bindStore(): void {
    boardStore.subscribe((notes) => {
      this.syncNotes(notes);
    });
  }

  private syncNotes(notes: Note[]): void {
    const currentIds = new Set(notes.map((n) => n.id));

    // Remove deleted notes
    for (const [id, comp] of this.noteElements.entries()) {
      if (!currentIds.has(id)) {
        comp.element.remove();
        this.noteElements.delete(id);
      }
    }

    // Add or update existing notes
    for (const note of notes) {
      const { px, py } = this.percentToPixels(note.x, note.y);

      if (this.noteElements.has(note.id)) {
        const comp = this.noteElements.get(note.id)!;
        comp.updateData(note, px, py);
      } else {
        const comp = new NoteElement(note, px, py, {
          onDragStart: () => {
            // Drag started
          },
          onDragMove: (_n, cx, cy) => {
            if (this.wastebasketChecker) {
              const isOver = this.wastebasketChecker.isOverWastebasket(cx, cy);
              this.wastebasketChecker.setHoverState(isOver);
            }

            // Realtime position update inside corkboard - edge to edge
            const rect = this.corkSurface.getBoundingClientRect();
            const rawPx = cx - rect.left - NOTE_WIDTH / 2;
            const rawPy = cy - rect.top - NOTE_HEIGHT / 2;

            const maxX = Math.max(0, rect.width - NOTE_WIDTH);
            const maxY = Math.max(0, rect.height - NOTE_HEIGHT);

            // Allow moving from edge to edge (0 to maxX, 0 to maxY)
            const clampedPx = Math.max(0, Math.min(maxX, rawPx));
            const clampedPy = Math.max(0, Math.min(maxY, rawPy));

            comp.setPosition(clampedPx, clampedPy);
          },
          onDragEnd: (n, cx, cy) => {
            if (this.wastebasketChecker) {
              this.wastebasketChecker.setHoverState(false);
              if (this.wastebasketChecker.isOverWastebasket(cx, cy)) {
                this.wastebasketChecker.onDropOverWastebasket(n.id);
                return;
              }
            }

            // Drop on corkboard
            const { xPct, yPct } = this.clientToBoardPercent(cx, cy);
            boardStore.updatePosition(n.id, xPct, yPct);
            soundManager.playPlaceSound();
          }
        });

        this.boardContainer.appendChild(comp.element);
        this.noteElements.set(note.id, comp);
      }
    }
  }

  focusNote(id: string): void {
    const comp = this.noteElements.get(id);
    if (comp) {
      comp.focusText();
    }
  }
}
