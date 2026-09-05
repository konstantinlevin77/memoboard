import type { Note, BoardData } from '../types.js';

const DB_NAME = 'memoboard_db';
const DB_VERSION = 1;
const STORE_NAME = 'notes';
const FALLBACK_KEY = 'memoboard_notes_backup';

export class BoardStorage {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private isIndexedDBAvailable = false;

  constructor() {
    this.isIndexedDBAvailable = typeof indexedDB !== 'undefined';
  }

  private getDB(): Promise<IDBDatabase> {
    if (!this.isIndexedDBAvailable) {
      return Promise.reject(new Error('IndexedDB not supported'));
    }

    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            store.createIndex('createdAt', 'createdAt', { unique: false });
            store.createIndex('zIndex', 'zIndex', { unique: false });
          }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => {
          console.warn('Failed to open IndexedDB, falling back to localStorage', request.error);
          reject(request.error);
        };
      });
    }

    return this.dbPromise;
  }

  async getAllNotes(): Promise<Note[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();

        req.onsuccess = () => {
          const notes: Note[] = req.result || [];
          // Sort by zIndex ascending so order is consistent
          notes.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
          resolve(notes);
        };
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('Using localStorage fallback for getAllNotes', e);
      const raw = localStorage.getItem(FALLBACK_KEY);
      if (!raw) return [];
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
  }

  async saveNote(note: Note): Promise<void> {
    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(note);

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('Using localStorage fallback for saveNote', e);
      const notes = await this.getAllNotes();
      const idx = notes.findIndex((n) => n.id === note.id);
      if (idx >= 0) {
        notes[idx] = note;
      } else {
        notes.push(note);
      }
      localStorage.setItem(FALLBACK_KEY, JSON.stringify(notes));
    }
  }

  async deleteNote(id: string): Promise<void> {
    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(id);

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('Using localStorage fallback for deleteNote', e);
      const notes = await this.getAllNotes();
      const filtered = notes.filter((n) => n.id !== id);
      localStorage.setItem(FALLBACK_KEY, JSON.stringify(filtered));
    }
  }

  async clearAllNotes(): Promise<void> {
    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.clear();

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('Using localStorage fallback for clearAllNotes', e);
      localStorage.removeItem(FALLBACK_KEY);
    }
  }

  async exportBoard(): Promise<BoardData> {
    const notes = await this.getAllNotes();
    return {
      version: 1,
      notes
    };
  }

  async importBoard(data: BoardData): Promise<Note[]> {
    if (!data || !Array.isArray(data.notes)) {
      throw new Error('Invalid board data format');
    }

    await this.clearAllNotes();
    for (const note of data.notes) {
      await this.saveNote(note);
    }
    return this.getAllNotes();
  }
}

export const boardStorage = new BoardStorage();
