# Capture Remind Act

Capture thoughts. Get reminded. Take action.

A Chrome side panel that helps capture ideas, tasks, notes, and reminders in seconds. AI organizes them, surfaces what matters, and helps turn thoughts into action.

## Why

As life gets busier, many important thoughts never become action. Some are tasks, some are reminders, and some are simply things worth remembering later.

Most productivity tools require immediate organization. Capture Remind Act follows a different approach:

**Capture first. Organize later.**

## Initial Use Case

This project started as a personal tool for managing family operations:

* Household chores
* Appointments
* Shopping
* Childcare
* Follow-ups
* Shared family responsibilities

The goal is to reduce mental load by creating a trusted place to quickly capture thoughts and let AI help organize them over time.

## Current Stack

* Chrome Extension Side Panel
* Google Sheets
* Slack
* AI-powered summaries and reminders

## V1

### Capture

* Single input — drop any thought, no categories
* Chronological log of everything captured

### Remind

* Daily briefing
* Surfaced "for you today" and "waiting on" lists (organized behind the scenes)

### Act

* Mark surfaced items done
* Dismiss items that no longer matter

## Philosophy

**Capture first. Organize later.**

The side panel is not a task manager or chatbot. It is a trusted personal operating system — you drop thoughts, and AI plus n8n workflows decide what becomes a log entry, task, reminder, or follow-up.

You never choose whether something is a task, note, or memory. You just capture.

## Local Install

Load the extension in Chrome for local development:

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** (toggle in the top-right corner)
3. Click **Load unpacked**
4. Select the `capture-remind-act` project folder
5. Click the extension icon in the toolbar to open the side panel

### Reset sample data

To start fresh with the default sample items, open the side panel, open DevTools (right-click → Inspect), and run:

```js
localStorage.removeItem('cra_v2');
location.reload();
```

## Project Files

| File | Purpose |
|------|---------|
| `manifest.json` | Chrome Extension Manifest V3 config |
| `background.js` | Opens side panel when the extension icon is clicked |
| `sidepanel.html` | Side panel layout |
| `sidepanel.css` | Styles |
| `sidepanel.js` | App logic and localStorage persistence |
