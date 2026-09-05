# MemoBoard 📌

> An interactive corkboard that happens to be a website.

MemoBoard is a minimalist, nostalgic digital corkboard designed to feel like an authentic physical object in a warm room rather than a conventional productivity website.

No navigation bars, no dashboards, no accounts, and no "New Note" buttons. Just a corkboard on the wall, pads of blank Post-it notes on the desk, and a wastebasket.

---

## ✨ Features

- **Tactile Drag & Drop**: Peel blank Post-its directly from five colorful desk pads (Soft Yellow, Pastel Pink, Sky Blue, Pale Mint, Warm Peach) and stick them anywhere on the board.
- **In-Place Writing**: Click and write straight onto any note. No modals, forms, or popup dialogs.
- **Physical Disposal**: Drag notes into the desk wastebasket to crumple and discard them.
- **Organic Audio**: Subtle, synthesized Web Audio feedback for placing notes and tossing them in the trash (zero external audio files, 100% offline).
- **Local-First & Private**: Notes are saved directly to your browser via IndexedDB with zero cloud transmission or tracking.
- **Responsive Edge-to-Edge**: Fluid coordinate space allows notes to reach all edges of the board and preserves proportional placement across screen sizes.
- **Controlled Imperfection**: Subtle, deterministic angles (`-2.5°` to `+2.5°`) and soft multi-layered drop shadows.
- **Offline PWA**: Installable as a Progressive Web App that works seamlessly offline.
- **Discreet Archiving**: Click the `MEMOBOARD` stamp on the bottom-right frame or press <kbd>Cmd</kbd> + <kbd>E</kbd> / <kbd>Ctrl</kbd> + <kbd>E</kbd> to export or import a JSON backup.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or newer)
- npm

### Development
```bash
# Clone the repository
git clone https://github.com/konstantinlevin77/memoboard.git
cd memoboard

# Install dependencies
npm install

# Start local dev server
npm run dev
```
Open **[http://localhost:5173/](http://localhost:5173/)** in your browser.

### Build
```bash
# Type check and build production bundle
npm run build

# Preview production build locally
npm run preview
```

### Test
```bash
# Run unit test suite
npm test
```

---

## 🛠 Tech Stack

- **Vanilla TypeScript** & DOM APIs (zero framework bloat, ultra-light bundle < 10 kB gzipped)
- **Vite** for fast modern bundling
- **IndexedDB** for local-first persistent storage
- **Web Audio API** for real-time acoustic synthesis

---

## 📄 License

MIT
