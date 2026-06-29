const STORAGE_KEY = 'cra_v2';

const PLACEHOLDERS = [
  'Drop a thought…',
  'Buy bigger sleep sacks.',
  'Mia liked the purple teether.',
  'James will call insurance next week.',
  'Interesting playground near Shoreline.',
  'Need to renew passport in November.',
];

const SAMPLE_STATE = {
  captures: [
    { id: uid(), text: 'Buy bigger sleep sacks.', createdAt: minsAgo(18) },
    { id: uid(), text: 'Mia liked the purple teether.', createdAt: hoursAgo(3) },
    { id: uid(), text: 'James will call insurance next week.', createdAt: hoursAgo(5) },
    { id: uid(), text: 'Interesting playground near Shoreline.', createdAt: daysAgo(1) },
    { id: uid(), text: 'Need to renew passport in November.', createdAt: daysAgo(2) },
  ],
  today: [
    { id: uid(), text: 'Buy bigger sleep sacks', createdAt: minsAgo(18), completed: false },
    { id: uid(), text: 'Look into passport renewal timeline', createdAt: daysAgo(2), completed: false },
  ],
  waiting: [
    { id: uid(), text: 'James will call insurance', createdAt: hoursAgo(5), completed: false },
  ],
};

let state = { captures: [], today: [], waiting: [] };
let placeholderIndex = 0;

function uid() {
  return crypto.randomUUID();
}

function minsAgo(n) {
  const d = new Date();
  d.setMinutes(d.getMinutes() - n);
  return d.toISOString();
}

function hoursAgo(n) {
  const d = new Date();
  d.setHours(d.getHours() - n);
  return d.toISOString();
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function loadState() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    state = JSON.parse(stored);
    return;
  }
  state = structuredClone(SAMPLE_STATE);
  saveState();
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatTime(iso) {
  const date = new Date(iso);
  const now = new Date();
  const diffMins = Math.floor((now - date) / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24 && date.toDateString() === now.toDateString()) {
    return `${diffHours}h ago`;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function renderBriefing() {
  const activeToday = state.today.filter((i) => !i.completed);
  const waiting = state.waiting;

  let body = '';
  if (activeToday.length === 0 && waiting.length === 0) {
    body = 'A calm day ahead. Drop a thought whenever something comes to mind — no need to organize it yourself.';
  } else {
    const parts = [];
    if (activeToday.length > 0) {
      parts.push(
        `${activeToday.length} thing${activeToday.length === 1 ? '' : 's'} for today`
      );
    }
    if (waiting.length > 0) {
      parts.push(
        `${waiting.length} waiting on others`
      );
    }
    body = `You have ${parts.join(' and ')}. Everything else is safely stored.`;
  }

  document.getElementById('briefing-content').innerHTML = `
    <p class="briefing__greeting">${getGreeting()}</p>
    <p class="briefing__body">${body}</p>
  `;
}

function renderTodayList() {
  const items = [...state.today].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  const list = document.getElementById('today-list');
  const empty = document.getElementById('today-empty');
  const count = document.getElementById('today-count');
  const active = items.filter((i) => !i.completed).length;

  count.textContent = active > 0 ? String(active) : '';

  list.innerHTML = '';
  items.forEach((item) => {
    list.appendChild(createItem(item, 'today'));
  });

  empty.classList.toggle('empty-state--visible', items.length === 0);
}

function renderRecentList() {
  const captures = [...state.captures].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  const list = document.getElementById('recent-list');
  const empty = document.getElementById('recent-empty');
  const count = document.getElementById('recent-count');

  count.textContent = captures.length > 0 ? String(captures.length) : '';

  list.innerHTML = '';
  captures.forEach((entry) => {
    list.appendChild(createRecentEntry(entry));
  });

  empty.classList.toggle('empty-state--visible', captures.length === 0);
}

function createRecentEntry(entry) {
  const li = document.createElement('li');
  li.className = 'recent-entry';
  li.dataset.id = entry.id;

  li.innerHTML = `
    <span class="recent-entry__dot" aria-hidden="true"></span>
    <div class="recent-entry__body">
      <p class="recent-entry__text">${escapeHtml(entry.text)}</p>
      <p class="recent-entry__time">${formatTime(entry.createdAt)}</p>
    </div>
    <button type="button" class="recent-entry__delete" aria-label="Delete">&times;</button>
  `;

  li.querySelector('.recent-entry__delete').addEventListener('click', () => deleteCapture(entry.id));

  return li;
}

function renderWaitingList() {
  const items = [...state.waiting].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  const list = document.getElementById('waiting-list');
  const empty = document.getElementById('waiting-empty');
  const count = document.getElementById('waiting-count');

  count.textContent = items.length > 0 ? String(items.length) : '';

  list.innerHTML = '';
  items.forEach((item) => {
    list.appendChild(createItem(item, 'waiting'));
  });

  empty.classList.toggle('empty-state--visible', items.length === 0);
}

function createItem(item, kind) {
  const li = document.createElement('li');
  li.className = `item${item.completed ? ' item--done' : ''}`;
  li.dataset.id = item.id;

  if (kind === 'today') {
    li.innerHTML = `
      <input type="checkbox" class="item__check" ${item.completed ? 'checked' : ''} aria-label="Mark done">
      <div class="item__body">
        <p class="item__text">${escapeHtml(item.text)}</p>
      </div>
      <button type="button" class="item__delete" aria-label="Remove">&times;</button>
    `;
    li.querySelector('.item__check').addEventListener('change', () => toggleToday(item.id));
    li.querySelector('.item__delete').addEventListener('click', () => dismissToday(item.id));
  } else {
    li.innerHTML = `
      <span class="item__dot" aria-hidden="true"></span>
      <div class="item__body">
        <p class="item__text">${escapeHtml(item.text)}</p>
      </div>
      <button type="button" class="item__delete" aria-label="Remove">&times;</button>
    `;
    li.querySelector('.item__delete').addEventListener('click', () => dismissWaiting(item.id));
  }

  return li;
}

function addCapture(text) {
  const entry = {
    id: uid(),
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };
  state.captures.unshift(entry);
  saveState();
  render();

  const el = document.querySelector(`#recent-list [data-id="${entry.id}"]`);
  if (el) el.classList.add('recent-entry--new');

  return entry;
}

async function sendToN8n(entry) {
  if (!N8N_CAPTURE_WEBHOOK_URL) {
    return null;
  }

  const response = await fetch(N8N_CAPTURE_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: entry.id,
      message: entry.text,
      captured_at: entry.createdAt,
      source: 'chrome_side_panel',
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Webhook request failed');
  }

  return data.message || null;
}

async function submitCapture(text) {
  const entry = addCapture(text);

  try {
    const message = await sendToN8n(entry);
    return message || 'Thought captured.';
  } catch {
    return 'Thought captured.';
  }
}

function deleteCapture(id) {
  state.captures = state.captures.filter((c) => c.id !== id);
  saveState();
  render();
}

function toggleToday(id) {
  const item = state.today.find((i) => i.id === id);
  if (item) {
    item.completed = !item.completed;
    saveState();
    render();
  }
}

function dismissToday(id) {
  state.today = state.today.filter((i) => i.id !== id);
  saveState();
  render();
}

function dismissWaiting(id) {
  state.waiting = state.waiting.filter((i) => i.id !== id);
  saveState();
  render();
}

function showSuccess(message) {
  const el = document.getElementById('capture-saved');
  el.textContent = message;
  el.hidden = false;
  clearTimeout(showSuccess._timer);
  const duration = Math.min(6000, Math.max(2500, message.length * 40));
  showSuccess._timer = setTimeout(() => {
    el.hidden = true;
    el.textContent = 'Thought captured.';
  }, duration);
}

function render() {
  renderBriefing();
  renderTodayList();
  renderWaitingList();
  renderRecentList();
}

function initCaptureInput() {
  const input = document.getElementById('capture-input');

  async function submit() {
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    input.style.height = 'auto';
    const message = await submitCapture(text);
    showSuccess(message);
    input.focus();
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  });

  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = `${input.scrollHeight}px`;
  });

  setInterval(() => {
    placeholderIndex = (placeholderIndex + 1) % PLACEHOLDERS.length;
    if (document.activeElement !== input && !input.value) {
      input.placeholder = PLACEHOLDERS[placeholderIndex];
    }
  }, 5000);
}

loadState();
initCaptureInput();
render();
