import { Note, NoteColor } from '../types.js';
import { boardStorage } from './db.js';

type Listener = (notes: Note[]) => void;

export class BoardStore {
  private notes: Note[] = [];
  private listeners: Set<Listener> = new Set();
  private maxZIndex = 10;
  private saveDebounceTimers: Map<string, number> = new Map();

  async init(): Promise<Note[]> {
    const rawNotes = await boardStorage.getAllNotes();

    if (rawNotes.length === 0) {
      const starter1 = this.createNote(
        0.25,
        0.2,
        'yellow',
        'Grab a post it, put it somewhere you want, very simple.'
      );
      starter1.rotation = -1.5;
      boardStorage.saveNote(starter1);

      const starter2 = this.createNote(
        0.55,
        0.28,
        'pink',
        'Drag the post it to the bin to remove.'
      );
      starter2.rotation = 1.8;
      boardStorage.saveNote(starter2);

      return this.notes;
    }

    // Migrate any legacy notes that used 1600x950 absolute pixels to 0..1 normalized coords
    // and update default starter notes text if untouched
    this.notes = rawNotes.map((n) => {
      let x = n.x;
      let y = n.y;
      let text = n.text;

      if (text === 'Welcome to MemoBoard 📌\n\nClick to type, or drag me anywhere.') {
        text = 'Grab a post it, put it somewhere you want, very simple.';
        boardStorage.saveNote({ ...n, text });
      } else if (text === 'Grab a blank Post-it from the desk below.\n\nDrop notes on the trash bin to discard.') {
        text = 'Drag the post it to the bin to remove.';
        boardStorage.saveNote({ ...n, text });
      }

      if (x > 1.0) {
        x = Math.max(0, Math.min(1, x / 1600));
      }
      if (y > 1.0) {
        y = Math.max(0, Math.min(1, y / 950));
      }
      return {
        ...n,
        x: Math.max(0, Math.min(1, x)),
        y: Math.max(0, Math.min(1, y))
      };
    });

    if (this.notes.length > 0) {
      this.maxZIndex = Math.max(...this.notes.map((n) => n.zIndex || 1), 10);
    }
    this.notify();
    return this.notes;
  }

  getNotes(): Note[] {
    return [...this.notes];
  }

  getNote(id: string): Note | undefined {
    return this.notes.find((n) => n.id === id);
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.getNotes());
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    const current = this.getNotes();
    this.listeners.forEach((fn) => fn(current));
  }

  createNote(x: number, y: number, color: NoteColor, initialText: string = ''): Note {
    this.maxZIndex += 1;
    // Generate deterministic subtle rotation between -2.5 and +2.5 degrees
    const randomAngle = (Math.random() * 5.0 - 2.5);
    const rotation = Math.round(randomAngle * 10) / 10;

    // Clamp normalized coordinates between 0.0 and 1.0
    const clampedX = Math.max(0, Math.min(1, x));
    const clampedY = Math.max(0, Math.min(1, y));

    const note: Note = {
      id: 'note_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7),
      text: initialText,
      x: clampedX,
      y: clampedY,
      rotation,
      color,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      zIndex: this.maxZIndex
    };

    this.notes.push(note);
    this.notify();
    boardStorage.saveNote(note);
    return note;
  }

  bringToFront(id: string): void {
    const note = this.notes.find((n) => n.id === id);
    if (!note) return;

    this.maxZIndex += 1;
    note.zIndex = this.maxZIndex;
    note.updatedAt = Date.now();
    this.notify();
    this.debounceSave(note);
  }

  updatePosition(id: string, x: number, y: number): void {
    const note = this.notes.find((n) => n.id === id);
    if (!note) return;

    note.x = Math.max(0, Math.min(1, x));
    note.y = Math.max(0, Math.min(1, y));
    note.updatedAt = Date.now();
    this.notify();
    this.debounceSave(note);
  }

  updateText(id: string, text: string): void {
    const note = this.notes.find((n) => n.id === id);
    if (!note) return;

    note.text = text;
    note.updatedAt = Date.now();
    this.notify();
    this.debounceSave(note);
  }

  deleteNote(id: string): void {
    const idx = this.notes.findIndex((n) => n.id === id);
    if (idx === -1) return;

    this.notes.splice(idx, 1);
    if (this.saveDebounceTimers.has(id)) {
      clearTimeout(this.saveDebounceTimers.get(id));
      this.saveDebounceTimers.delete(id);
    }
    this.notify();
    boardStorage.deleteNote(id);
  }

  async exportBoard(): Promise<string> {
    const data = await boardStorage.exportBoard();
    return JSON.stringify(data, null, 2);
  }

  async importBoard(jsonString: string): Promise<void> {
    const data = JSON.parse(jsonString);
    this.notes = await boardStorage.importBoard(data);
    this.maxZIndex = Math.max(...this.notes.map((n) => n.zIndex || 1), 10);
    this.notify();
  }

  private debounceSave(note: Note): void {
    if (this.saveDebounceTimers.has(note.id)) {
      clearTimeout(this.saveDebounceTimers.get(note.id));
    }

    const timer = window.setTimeout(() => {
      boardStorage.saveNote(note);
      this.saveDebounceTimers.delete(note.id);
    }, 200);

    this.saveDebounceTimers.set(note.id, timer);
  }
}

export const boardStore = new BoardStore();
