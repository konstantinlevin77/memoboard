# MemoBoard

## 1. Product Concept

MemoBoard is a minimalist, nostalgic digital corkboard.

The entire experience should feel like interacting with a **real physical corkboard in a warm, slightly nostalgic room**, rather than using a conventional productivity website.

The core interaction is extremely simple:

1. Open MemoBoard.
2. See a corkboard mounted on a wall.
3. See blank Post-it notes sitting on a desk beneath the board.
4. Pick up a Post-it.
5. Drag it onto the corkboard.
6. Write something on it.
7. Move it around whenever desired.
8. Close the website.
9. Return later and find everything exactly where it was.

There should be **almost no conventional UI**.

The product should feel like an object, not an application.

---

# 2. Design Philosophy

The most important design principle is:

> **Do not make a website that looks like a corkboard. Make an interactive corkboard that happens to be a website.**

The user should not feel like they are operating a productivity application.

Avoid conventional SaaS/productivity patterns.

There should be:

- No traditional top navigation bar
- No sidebar
- No dashboard
- No visible settings menu by default
- No large title
- No onboarding screens
- No prominent buttons
- No cards containing UI controls
- No unnecessary text
- No excessive animations
- No conventional "Create Note" button

The interface should communicate itself visually.

A blank Post-it sitting on the desk is the equivalent of a "Create Note" button.

The corkboard itself is the workspace.

---

# 3. Visual Direction

The visual style should be:

- Nostalgic
- Warm
- Analog
- Slightly imperfect
- Cozy
- Tactile
- Minimal
- Personal

Think of an old study room, bedroom, workshop, or home office with a corkboard mounted on the wall.

The environment should feel believable rather than overly polished.

### Materials

The scene can contain:

- A warm wall background
- A wooden corkboard frame
- Realistic cork texture
- A wooden desk at the bottom of the viewport
- A small collection/pile of blank Post-it notes on the desk
- Optional stationery such as a pencil, paper scraps, tape, or push pins

These secondary objects should remain subtle.

The Post-its are the main interactive object.

---

# 4. Composition

The page should essentially be one continuous scene.

A possible composition:

```text
┌──────────────────────────────────────────────┐
│                                              │
│              WALL / BACKGROUND               │
│                                              │
│       ┌────────────────────────────┐         │
│       │                            │         │
│       │       CORKBOARD            │         │
│       │                            │         │
│       │   [note]                   │         │
│       │                 [note]     │         │
│       │          [note]             │         │
│       │                            │         │
│       └────────────────────────────┘         │
│                                              │
│──────────────────────────────────────────────│
│                     DESK                     │
│                                              │
│        🟨  🟨  🟦  🟨                       │
│          blank Post-its                     │
│                                              │
└──────────────────────────────────────────────┘
```

The exact composition should be responsive.

On desktop, the corkboard should dominate the viewport.

On smaller screens, the scene should adapt rather than becoming a conventional responsive website.

---

# 5. Post-it Interaction

This is the central interaction.

There should be a visible supply of blank Post-it notes on the desk.

The user can pick one up and drag it onto the board.

When a Post-it is picked up:

- It should visually separate from the desk.
- Its shadow can become slightly stronger.
- It can move naturally with the pointer.
- It should feel like the user is physically holding it.

Do not use exaggerated animations.

A subtle lift is sufficient.

When released onto the board:

- The note remains where it was dropped.
- It can have a tiny randomized rotation.
- It should cast a subtle shadow.
- It should look slightly imperfect.

For example:

```text
Note A:  -2° rotation
Note B:   1° rotation
Note C:   3° rotation
Note D:  -1° rotation
```

Do not make every note perfectly aligned.

---

# 6. Creating Notes

The user should not have to press a "New Note" button.

The act of taking a blank Post-it from the desk and putting it onto the board creates the note.

Once placed, the user should be able to write on it.

Possible interaction:

- Click/tap a placed Post-it.
- It becomes editable.
- The user types directly onto it.

The editing interface should remain visually integrated with the Post-it.

Avoid a modal dialog.

Avoid a separate text editor.

Avoid a form.

The Post-it itself is the text editor.

---

# 7. Moving Notes

Existing notes should be draggable.

The user can grab a Post-it and move it anywhere on the corkboard.

Notes should be allowed to:

- Overlap
- Sit at slightly different angles
- Occupy different areas
- Be positioned imperfectly

The system should remember the exact position.

The board should not automatically reorganize notes.

The user's arrangement is part of their personal board.

---

# 8. Deleting Notes

Deletion should ideally preserve the physical metaphor.

Do not immediately introduce a visible trash icon or conventional delete button unless necessary.

Possible interaction:

- Drag a note toward a wastebasket on the desk.
- Drop it there to delete it.

Alternatively, a subtle secondary interaction such as right-click/context menu can provide deletion.

The first version should prioritize simplicity.

If a trash mechanism makes the interface feel cluttered, use a minimal context interaction instead.

---

# 9. Persistence

There should be **no application backend**.

All board data must remain on the user's device/browser.

The server only needs to deliver the static web application.

The application should store things such as:

```text
note ID
text
x position
y position
rotation
color
creation time
optional size
```

The preferred storage mechanism is **IndexedDB**.

Do not build a backend database.

Do not create user accounts.

Do not require authentication.

Do not transmit the user's notes to a server.

The architecture should effectively be:

```text
                    memoboard.com
                          │
                          ▼
                  Static web hosting
                          │
                          ▼
                    HTML / CSS / JS
                          │
                          ▼
                     User browser
                          │
                          ▼
                       IndexedDB
                          │
                          ▼
                  User's local board
```

The user's board should persist between sessions.

If they close the browser and return later, their board should still exist.

---

# 10. Privacy Model

The product should be local-first.

The fundamental privacy promise is:

> Your board stays on your device.

There should be no server-side database containing user notes.

No account system should exist in the MVP.

No analytics system should inspect note contents.

No note content should be sent to an external API.

Be careful with third-party services and analytics libraries. If analytics are eventually introduced, they must not collect note contents or personally identifiable information.

---

# 11. Offline Capability

The application should ideally function offline after the initial load.

Implement the application as a Progressive Web App if practical.

Static assets can be cached using a service worker.

The intended experience is:

```text
First visit
    ↓
Download application
    ↓
Create notes
    ↓
Close browser
    ↓
Return later
    ↓
Board still exists
```

Ideally:

```text
Internet unavailable
        ↓
Open installed/cached MemoBoard
        ↓
Board still works
```

Offline functionality is desirable but should not compromise the simplicity of the MVP.

---

# 12. No Traditional UI

The application should have essentially no visible application chrome.

Avoid:

```text
┌──────────────────────────────────────────────┐
│ MemoBoard     Home   Settings   Account      │
├──────────────────────────────────────────────┤
│                                              │
│                 BOARD                        │
│                                              │
└──────────────────────────────────────────────┘
```

Instead:

```text
┌──────────────────────────────────────────────┐
│                                              │
│                                              │
│              [ CORKBOARD ]                   │
│                                              │
│                                              │
│                                              │
│                    DESK                      │
│             🟨 🟨 🟨                         │
└──────────────────────────────────────────────┘
```

The absence of UI is intentional.

---

# 13. Animation Philosophy

Animation should be restrained.

This is not a game and should not feel like a game.

Avoid:

- Bouncy UI
- Excessive easing
- Particle effects
- Elaborate physics
- Floating animations
- Attention-grabbing transitions
- Excessive hover effects

Use small physical cues:

### Picking up a note

```text
normal → slightly lifted → drag
```

### Dropping a note

```text
drag → subtle settling movement → stationary
```

### Hovering

Potentially a very subtle shadow/lift.

The goal is to make the interaction feel tactile, not animated.

---

# 14. Physical Imperfection

Perfect digital geometry would hurt the aesthetic.

Introduce controlled randomness.

For each note:

- Slight random rotation
- Slight variation in position
- Slight variation in shadow
- Potentially small texture variation
- Different Post-it colors

However, randomness must be deterministic after creation.

Once a note receives a rotation of `-2.3°`, that rotation should be stored and remain the same.

The board should not rearrange itself every time it loads.

---

# 15. Post-it Colors

Start with a small set.

For example:

- Faded yellow
- Pale pink
- Light blue
- Pale green
- Warm orange

Avoid extremely saturated modern UI colors.

The colors should look like physical paper.

Potentially include slightly different shades rather than perfectly uniform digital colors.

---

# 16. Responsive Behavior

Desktop is the primary experience.

The board should occupy most of the viewport.

However, mobile/touch interaction should be considered from the beginning.

Touch should support:

- Picking up notes
- Dragging notes
- Placing notes
- Editing text

Do not simply shrink the desktop interface.

The scene should remain a coherent physical composition.

On mobile, the desk and board can be rearranged vertically or scaled appropriately.

---

# 17. Data Model

A simple note model could be:

```js
{
    id: "uuid",
    text: "Buy milk",
    x: 420,
    y: 180,
    rotation: -2.1,
    color: "yellow",
    createdAt: 1757070000000
}
```

The board itself could contain:

```js
{
    notes: [...],
    version: 1
}
```

Use a persistent client-side storage abstraction rather than coupling the UI directly to IndexedDB everywhere.

For example:

```text
UI
 ↓
Board State
 ↓
Storage Layer
 ↓
IndexedDB
```

This makes future migrations easier.

---

# 18. Suggested Technology

Keep the technology simple.

Recommended initial stack:

- HTML
- CSS
- JavaScript or TypeScript
- Vite
- IndexedDB

React is not necessary.

A framework can be used if there is a strong reason, but the application is intentionally small and DOM/pointer interactions are central.

Avoid introducing a backend.

Avoid unnecessary infrastructure.

Possible deployment:

- Static hosting
- Custom domain
- HTTPS

The domain simply serves the application.

---

# 19. Important Technical Considerations

### Coordinate system

The board should have its own coordinate system.

Notes should be stored relative to the board rather than simply storing raw viewport coordinates.

This prevents notes from moving unexpectedly when the browser is resized.

For example:

```text
Board:
width = 1200
height = 700

Note:
x = 430
y = 210
```

When the viewport changes, transform the board appropriately while preserving the note's relative location.

### Pointer events

Use Pointer Events rather than implementing separate mouse and touch systems where possible.

The same interaction should work with:

- Mouse
- Trackpad
- Touch
- Stylus

### Text editing

Do not allow drag behavior to interfere with text selection/editing.

Distinguish between:

```text
grab note
```

and:

```text
edit note
```

The interaction should feel natural.

---

# 20. Persistence Behavior

Save changes immediately or with a very small debounce.

Important events:

- Note created
- Note moved
- Note edited
- Note deleted
- Note color changed

A browser refresh must not lose data.

A browser restart must not lose data.

Closing the tab must not lose data.

---

# 21. Export / Recovery

Although the application should have no backend, provide a way to recover the user's board eventually.

A low-profile option could allow:

```text
Export board
Import board
```

This does not need to be prominent in the MVP.

Export could produce a JSON file containing the board state.

This is especially useful because local browser storage is not equivalent to permanent backup.

Do not clutter the main interface with this functionality.

It could live behind a very subtle interaction or settings area.

---

# 22. MVP Scope

The first version should contain only:

### Environment

- Wall
- Corkboard
- Wooden frame
- Desk
- Blank Post-its

### Interaction

- Pick up blank Post-it
- Drag onto board
- Create note
- Edit note
- Move note
- Delete note
- Persist note

### Technical

- IndexedDB
- Responsive layout
- Pointer/touch interaction
- Static deployment
- Optional PWA/offline support

That's enough.

---

# 23. Explicit Non-Goals

Do NOT implement these in the MVP:

- User accounts
- Authentication
- Backend API
- Cloud database
- Social features
- Collaboration
- Sharing boards
- Comments
- Likes
- Notifications
- Calendar integration
- Task management
- AI
- Search
- Tags
- Categories
- Productivity analytics
- Gamification
- Complex animations
- Infinite whiteboard functionality
- Drawing tools
- Shapes
- Connectors/arrows
- File uploads

MemoBoard should remain extremely focused.

---

# 24. Product Personality

The product should feel like:

> "I have a little corkboard on my wall."

Not:

> "I have another productivity app."

The user should feel a small sense of ownership when they arrange their notes.

The board should feel personal.

It should be possible to create something messy, asymmetric, and imperfect.

That imperfection is part of the experience.

---

# 25. Success Criteria

The project succeeds if a first-time visitor can understand the interaction without instructions.

Ideally, the user should immediately think:

> "Oh, I can grab that."

Then:

> "I can put it here."

Then:

> "I can write on it."

There should be almost no learning curve.

The application should feel satisfying even when the user has only one or two notes.

The visual environment should be attractive enough that someone might want to leave the board open on their desktop.

---

# 26. Overall Experience

The final experience should be approximately:

```text
OPEN WEBSITE

        ↓

See a warm physical environment

        ↓

Notice the corkboard

        ↓

Notice blank Post-its on the desk

        ↓

Grab one

        ↓

Place it on the board

        ↓

Write

        ↓

Leave it there

        ↓

Come back tomorrow

        ↓

"It's still here."
```

That simplicity is the product.

Do not add complexity merely because the underlying technology makes it possible.


