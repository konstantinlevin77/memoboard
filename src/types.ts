export type NoteColor = 'yellow' | 'pink' | 'blue' | 'green' | 'orange';

export interface Note {
  id: string;
  text: string;
  x: number; // Normalized coordinate X (0.0 to 1.0 relative to corkboard width)
  y: number; // Normalized coordinate Y (0.0 to 1.0 relative to corkboard height)
  rotation: number; // Deterministic subtle angle between -2.5° and +2.5°
  color: NoteColor;
  createdAt: number;
  updatedAt: number;
  zIndex: number;
}

export interface BoardData {
  version: number;
  notes: Note[];
}

export const NOTE_WIDTH = 220;
export const NOTE_HEIGHT = 210;

export const NOTE_COLORS: Record<NoteColor, { bg: string; border: string; shadow: string; label: string; pin: string }> = {
  yellow: {
    bg: '#fef08a',
    border: '#fde047',
    shadow: 'rgba(217, 119, 6, 0.25)',
    label: 'Soft Yellow',
    pin: '#b91c1c'
  },
  pink: {
    bg: '#fbcfe8',
    border: '#f472b6',
    shadow: 'rgba(219, 39, 119, 0.22)',
    label: 'Pastel Pink',
    pin: '#2563eb'
  },
  blue: {
    bg: '#bae6fd',
    border: '#7dd3fc',
    shadow: 'rgba(2, 132, 199, 0.22)',
    label: 'Sky Blue',
    pin: '#d97706'
  },
  green: {
    bg: '#bbf7d0',
    border: '#86efac',
    shadow: 'rgba(22, 163, 74, 0.22)',
    label: 'Pale Mint',
    pin: '#9333ea'
  },
  orange: {
    bg: '#fed7aa',
    border: '#fdba74',
    shadow: 'rgba(234, 88, 12, 0.22)',
    label: 'Warm Peach',
    pin: '#059669'
  }
};
