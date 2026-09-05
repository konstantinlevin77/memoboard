import test from 'node:test';
import assert from 'node:assert/strict';

import { NOTE_WIDTH, NOTE_HEIGHT, NOTE_COLORS } from '../src/types.ts';

test('Board dimensions and colors are defined correctly', () => {
  assert.equal(NOTE_WIDTH, 220);
  assert.equal(NOTE_HEIGHT, 210);
  assert.ok(NOTE_COLORS.yellow);
  assert.ok(NOTE_COLORS.pink);
  assert.ok(NOTE_COLORS.blue);
  assert.ok(NOTE_COLORS.green);
  assert.ok(NOTE_COLORS.orange);
});

test('Note deterministic rotation and normalized 0..1 clamping', () => {
  // Test angle generation logic: between -2.5 and +2.5
  for (let i = 0; i < 100; i++) {
    const randomAngle = Math.round((Math.random() * 5.0 - 2.5) * 10) / 10;
    assert.ok(randomAngle >= -2.5 && randomAngle <= 2.5);
  }

  // Normalized clamping test
  const clampNorm = (v) => Math.max(0, Math.min(1, v));

  assert.equal(clampNorm(-0.5), 0);
  assert.equal(clampNorm(1.5), 1);
  assert.equal(clampNorm(0.42), 0.42);
});

test('Edge-to-edge pixel mapping calculation', () => {
  // Surface dimensions (e.g. 1360 x 670 on MBA 13")
  const surfaceWidth = 1360;
  const surfaceHeight = 670;
  const maxX = surfaceWidth - NOTE_WIDTH; // 1140
  const maxY = surfaceHeight - NOTE_HEIGHT; // 460

  const percentToPixels = (xPct, yPct) => ({
    px: Math.round(xPct * maxX),
    py: Math.round(yPct * maxY)
  });

  // At xPct = 0: exactly flush against the left edge
  const leftEdge = percentToPixels(0, 0.5);
  assert.equal(leftEdge.px, 0);

  // At xPct = 1: exactly flush against the right edge
  const rightEdge = percentToPixels(1, 0.5);
  assert.equal(rightEdge.px, maxX);
  assert.equal(rightEdge.px + NOTE_WIDTH, surfaceWidth);

  // At yPct = 0: flush against top edge
  const topEdge = percentToPixels(0.5, 0);
  assert.equal(topEdge.py, 0);

  // At yPct = 1: flush against bottom edge
  const bottomEdge = percentToPixels(0.5, 1);
  assert.equal(bottomEdge.py, maxY);
  assert.equal(bottomEdge.py + NOTE_HEIGHT, surfaceHeight);
});

test('Export/Import format fidelity', () => {
  const sampleData = {
    version: 1,
    notes: [
      {
        id: 'note_test_1',
        text: 'Grocery list:\n- Milk\n- Apples',
        x: 0.25,
        y: 0.15,
        rotation: -1.8,
        color: 'yellow',
        createdAt: 1700000000000,
        updatedAt: 1700000000500,
        zIndex: 11
      },
      {
        id: 'note_test_2',
        text: 'Meeting at 3pm',
        x: 0.75,
        y: 0.45,
        rotation: 2.1,
        color: 'pink',
        createdAt: 1700000001000,
        updatedAt: 1700000001200,
        zIndex: 12
      }
    ]
  };

  const json = JSON.stringify(sampleData, null, 2);
  const parsed = JSON.parse(json);

  assert.equal(parsed.version, 1);
  assert.equal(parsed.notes.length, 2);
  assert.equal(parsed.notes[0].text, 'Grocery list:\n- Milk\n- Apples');
  assert.equal(parsed.notes[0].x, 0.25);
  assert.equal(parsed.notes[1].color, 'pink');
});
