import { Note, NOTE_COLORS } from '../types.js';
import { boardStore } from '../storage/boardStore.js';

export interface NoteDragCallbacks {
  onDragStart: (note: Note) => void;
  onDragMove: (note: Note, clientX: number, clientY: number) => void;
  onDragEnd: (note: Note, clientX: number, clientY: number) => void;
}

export class NoteElement {
  public element: HTMLElement;
  private textarea: HTMLTextAreaElement;
  private note: Note;
  private callbacks: NoteDragCallbacks;
  private isPointerDown = false;
  private isDragging = false;
  private startClientX = 0;
  private startClientY = 0;
  private DRAG_THRESHOLD = 5;

  constructor(note: Note, initialPx: number, initialPy: number, callbacks: NoteDragCallbacks) {
    this.note = note;
    this.callbacks = callbacks;
    this.element = document.createElement('div');
    this.element.className = 'note-item';
    this.element.dataset.id = note.id;

    // Apply color styling
    const colorInfo = NOTE_COLORS[note.color] || NOTE_COLORS.yellow;
    this.element.style.backgroundColor = colorInfo.bg;
    this.element.style.border = `1px solid ${colorInfo.border}`;
    this.element.style.setProperty('--note-shadow', colorInfo.shadow);

    // Pushpin element
    const pin = document.createElement('div');
    pin.className = 'note-pin';
    pin.style.backgroundColor = colorInfo.pin;
    this.element.appendChild(pin);

    // In-place text area
    this.textarea = document.createElement('textarea');
    this.textarea.className = 'note-text';
    this.textarea.placeholder = 'Write here...';
    this.textarea.value = note.text;
    this.textarea.spellcheck = false;
    this.element.appendChild(this.textarea);

    // Subtle delete button
    const menu = document.createElement('div');
    menu.className = 'note-context-menu';
    const delBtn = document.createElement('button');
    delBtn.className = 'note-delete-btn';
    delBtn.title = 'Remove note';
    delBtn.innerHTML = '&times;';
    delBtn.addEventListener('pointerdown', (e) => e.stopPropagation());
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      boardStore.deleteNote(this.note.id);
    });
    menu.appendChild(delBtn);
    this.element.appendChild(menu);

    this.bindEvents();
    this.updateRender(initialPx, initialPy);
  }

  private bindEvents(): void {
    // Text changes
    this.textarea.addEventListener('input', () => {
      boardStore.updateText(this.note.id, this.textarea.value);
    });

    // Don't drag while actively editing/selecting text inside textarea
    this.textarea.addEventListener('pointerdown', (e) => {
      if (document.activeElement === this.textarea) {
        e.stopPropagation();
      }
    });

    // Pointer events on note container
    this.element.addEventListener('pointerdown', (e) => this.handlePointerDown(e));
    this.element.addEventListener('pointermove', (e) => this.handlePointerMove(e));
    this.element.addEventListener('pointerup', (e) => this.handlePointerUp(e));
    this.element.addEventListener('pointercancel', (e) => this.handlePointerUp(e));
  }

  private handlePointerDown(e: PointerEvent): void {
    if (e.button !== 0) return;

    this.isPointerDown = true;
    this.isDragging = false;
    this.startClientX = e.clientX;
    this.startClientY = e.clientY;

    boardStore.bringToFront(this.note.id);
  }

  private handlePointerMove(e: PointerEvent): void {
    if (!this.isPointerDown) return;

    const dx = e.clientX - this.startClientX;
    const dy = e.clientY - this.startClientY;

    if (!this.isDragging) {
      if (Math.hypot(dx, dy) > this.DRAG_THRESHOLD) {
        this.isDragging = true;
        this.element.setPointerCapture(e.pointerId);
        this.element.classList.add('is-dragging');
        if (document.activeElement === this.textarea) {
          this.textarea.blur();
        }
        this.callbacks.onDragStart(this.note);
      }
    }

    if (this.isDragging) {
      this.callbacks.onDragMove(this.note, e.clientX, e.clientY);
    }
  }

  private handlePointerUp(e: PointerEvent): void {
    if (!this.isPointerDown) return;

    if (this.isDragging) {
      try {
        this.element.releasePointerCapture(e.pointerId);
      } catch {
        // Safe ignore
      }
      this.element.classList.remove('is-dragging');
      this.isDragging = false;
      this.callbacks.onDragEnd(this.note, e.clientX, e.clientY);
    } else {
      this.textarea.focus();
    }

    this.isPointerDown = false;
  }

  updateData(note: Note, px: number, py: number): void {
    this.note = note;
    if (this.textarea.value !== note.text && document.activeElement !== this.textarea) {
      this.textarea.value = note.text;
    }
    this.updateRender(px, py);
  }

  setPosition(px: number, py: number): void {
    this.element.style.left = `${px}px`;
    this.element.style.top = `${py}px`;
  }

  updateRender(px: number, py: number): void {
    this.setPosition(px, py);
    this.element.style.transform = `rotate(${this.note.rotation}deg)`;
    this.element.style.zIndex = `${this.note.zIndex || 1}`;
  }

  focusText(): void {
    this.textarea.focus();
  }
}
