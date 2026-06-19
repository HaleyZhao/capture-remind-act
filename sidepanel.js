const STORAGE_KEY = 'cra_items';
const TYPE_LABELS = { thought: 'Thought', todo: 'Todo', waiting: 'Waiting On' };

const SAMPLE_ITEMS = [
  {
    id: crypto.randomUUID(),
    text: 'Pick up groceries — milk, eggs, bread',
    type: 'todo',
    createdAt: daysAgo(0),
    completed: false,
  },
  {
    id: crypto.randomUUID(),
    text: 'Schedule pediatrician appointment for Emma',
    type: 'todo',
    createdAt: daysAgo(0),
    completed: false,
  },
  {
    id: crypto.randomUUID(),
    text: 'Reply to school about field trip permission slip',
    type: 'todo',
    createdAt: daysAgo(1),
    completed: true,
  },
  {
    id: crypto.randomUUID(),
    text: 'Waiting on plumber to confirm kitchen leak repair',
    type: 'waiting',
    createdAt: daysAgo(2),
    completed: false,
  },
  {
    id: crypto.randomUUID(),
    text: 'Waiting on partner to pick up dry cleaning',
    type: 'waiting',
    createdAt: daysAgo(1),
    completed: false,
  },
  {
    id: crypto.randomUUID(),
    text: 'Remember to buy birthday gift for Grandma',
    type: 'thought',
    createdAt: daysAgo(0),
    completed: false,
  },
  {
    id: crypto.randomUUID(),
    text: 'Idea: weekly family planning check-in on Sundays',
    type: 'thought',
    createdAt: daysAgo(1),
    completed: false,
  },
];

let items = [];
let selectedType = 'thought';

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function loadItems() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    items = JSON.parse(stored);
  } else {
    items = SAMPLE_ITEMS;
    saveItems();
  }
}

function saveItems() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDate(iso) {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function renderBriefing() {
  const todos = items.filter((i) => i.type === 'todo');
  const activeTodos = todos.filter((i) => !i.completed);
  const waiting = items.filter((i) => i.type === 'waiting');
  const thoughts = items
    .filter((i) => i.type === 'thought')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  let summary = '';
  if (activeTodos.length === 0 && waiting.length === 0) {
    summary = 'Your lists are clear. A good day to capture new thoughts or plan ahead.';
  } else {
    const parts = [];
    if (activeTodos.length > 0) {
      parts.push(
        `${activeTodos.length} task${activeTodos.length === 1 ? '' : 's'} on your Today list`
      );
    }
    if (waiting.length > 0) {
      parts.push(
        `${waiting.length} item${waiting.length === 1 ? '' : 's'} waiting on others`
      );
    }
    summary = `You have ${parts.join(' and ')}. Focus on what you can act on today.`;
  }

  let thoughtsHtml = '';
  if (thoughts.length > 0) {
    const thoughtItems = thoughts
      .map((t) => `<p class="briefing__thought">${escapeHtml(t.text)}</p>`)
      .join('');
    thoughtsHtml = `
      <div class="briefing__thoughts">
        <p class="briefing__thoughts-label">Recent thoughts</p>
        ${thoughtItems}
      </div>`;
  }

  document.getElementById('briefing-content').innerHTML = `
    <p class="briefing__greeting">${getGreeting()}</p>
    <p class="briefing__summary">${summary}</p>
    ${thoughtsHtml}
  `;
}

function renderTodayList() {
  const todos = items
    .filter((i) => i.type === 'todo')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const list = document.getElementById('today-list');
  const empty = document.getElementById('today-empty');
  const count = document.getElementById('today-count');

  const active = todos.filter((i) => !i.completed).length;
  count.textContent = active > 0 ? `${active} active` : '';

  list.innerHTML = '';
  todos.forEach((item) => {
    list.appendChild(createTodoElement(item));
  });

  empty.classList.toggle('empty-state--visible', todos.length === 0);
}

function renderWaitingList() {
  const waiting = items
    .filter((i) => i.type === 'waiting')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const list = document.getElementById('waiting-list');
  const empty = document.getElementById('waiting-empty');
  const count = document.getElementById('waiting-count');

  count.textContent = waiting.length > 0 ? `${waiting.length}` : '';

  list.innerHTML = '';
  waiting.forEach((item) => {
    list.appendChild(createWaitingElement(item));
  });

  empty.classList.toggle('empty-state--visible', waiting.length === 0);
}

function createTodoElement(item) {
  const li = document.createElement('li');
  li.className = `item${item.completed ? ' item--done' : ''}`;
  li.dataset.id = item.id;

  li.innerHTML = `
    <input type="checkbox" class="item__check" ${item.completed ? 'checked' : ''} aria-label="Mark done">
    <div class="item__body">
      <p class="item__text">${escapeHtml(item.text)}</p>
      <p class="item__meta">${formatDate(item.createdAt)}</p>
    </div>
    <button type="button" class="item__delete" aria-label="Delete">&times;</button>
  `;

  li.querySelector('.item__check').addEventListener('change', () => toggleComplete(item.id));
  li.querySelector('.item__delete').addEventListener('click', () => deleteItem(item.id));

  return li;
}

function createWaitingElement(item) {
  const li = document.createElement('li');
  li.className = 'item item--waiting';
  li.dataset.id = item.id;

  li.innerHTML = `
    <span class="item__indicator" aria-hidden="true"></span>
    <div class="item__body">
      <p class="item__text">${escapeHtml(item.text)}</p>
      <p class="item__meta">${formatDate(item.createdAt)}</p>
    </div>
    <button type="button" class="item__delete" aria-label="Delete">&times;</button>
  `;

  li.querySelector('.item__delete').addEventListener('click', () => deleteItem(item.id));

  return li;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function addItem(text, type) {
  items.unshift({
    id: crypto.randomUUID(),
    text: text.trim(),
    type,
    createdAt: new Date().toISOString(),
    completed: false,
  });
  saveItems();
  render();
}

function toggleComplete(id) {
  const item = items.find((i) => i.id === id);
  if (item) {
    item.completed = !item.completed;
    saveItems();
    render();
  }
}

function deleteItem(id) {
  items = items.filter((i) => i.id !== id);
  saveItems();
  render();
}

function render() {
  renderBriefing();
  renderTodayList();
  renderWaitingList();
}

function initCaptureForm() {
  const input = document.getElementById('capture-input');
  const captureBtn = document.getElementById('capture-btn');
  const typeButtons = document.querySelectorAll('.type-btn');

  typeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      selectedType = btn.dataset.type;
      typeButtons.forEach((b) => b.classList.remove('type-btn--active'));
      btn.classList.add('type-btn--active');
    });
  });

  captureBtn.addEventListener('click', () => {
    const text = input.value.trim();
    if (!text) return;
    addItem(text, selectedType);
    input.value = '';
    input.focus();
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      captureBtn.click();
    }
  });
}

loadItems();
initCaptureForm();
render();
