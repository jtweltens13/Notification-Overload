# Notification-Overload

`Notification-Overload` is a small browser-based HCI prototype that simulates a student trying to write while notifications compete for attention. The demo is designed to show how different notification policies change whether a message interrupts the user immediately or gets saved for later.

## Overview

The interface presents a student workspace with three tabs:

- `Paper Draft`: a writing surface where the user continues a draft.
- `Source Article`: a reading view with supporting material.
- `Notes`: a research notes area.

As the user types in the draft, the app releases a sequence of sample notifications. Important notifications appear as interrupting toast alerts, while lower-priority notifications are batched into the inbox.

## What The Demo Shows

- Notification interruptions during focused work
- A side inbox for messages that are saved instead of surfaced immediately
- A priority control panel that lets the user decide which notifications may break through
- Different treatment for deadline, person, and schedule-related messages
- A simple static prototype that can be used in demos, class discussions, or usability studies

## How It Works

1. Click `Start Demo`.
2. Begin typing in the `Paper Draft` editor.
3. The app releases the next demo notification roughly every 20 additional characters typed.
4. Each notification is evaluated against the current priority settings.
5. Important notifications appear as toast alerts.
6. Non-important notifications are still stored in the inbox, but they do not interrupt the user.

The inbox separates `Unread` and `Read` messages. The `Priorities` panel lets the user change what counts as interruption-worthy in the middle of the session.

## Priority Rules

Notifications are marked as important when they match the current settings:

- `Deadlines due soon` only interrupts when the message is a deadline and its `dueHours` value is within the selected urgent deadline window.
- `Instructor or advisor messages` interrupts person-to-person messages.
- `Schedule or room changes` interrupts schedule-related updates.
- Source toggles for `Canvas`, `Email`, and `Registrar` decide whether messages from those channels are allowed to break through.

All other notifications are delivered to the inbox without an interrupting toast.

## Running Locally

This project is a static HTML/CSS/JavaScript prototype with no build step and no external dependencies.

### Option 1: Open Directly

Open `index.html` in a browser.

### Option 2: Use A Simple Local Server

From the project root, run:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## File Structure

- `index.html`: markup for the workspace, inbox, priority panel, and modal
- `styles.css`: layout, visual styling, toast/inbox UI, and responsive behavior
- `app.js`: demo data, state management, notification evaluation, and rendering logic

## Interaction Details

- The app starts in a blocked state behind a `Start Demo` modal.
- Restarting the demo resets the draft text, title, notifications, toast stack, and progress.
- The active workspace tab is mirrored in the URL hash so the prototype can deep-link to a tab state.
- The layout includes responsive adjustments for narrower screens.

## Use Cases

- HCI or UX coursework about interruption management
- Demoing notification filtering concepts
- Comparing immediate interruption vs. batching strategies
- Supporting discussion about student attention, productivity, and interface design
