/* ============================================================
   CELEBRIA — Admin Dashboard Logic
   Password-protected. Client-side only (static hosting).
   ============================================================ */

/* ---------- CHANGE THIS PASSWORD ---------- */
const ADMIN_PASSWORD = 'Aa@Ganna0hish*';
/* ----------------------------------------- */

const AUTH_KEY = 'celebria_admin_auth';
const AUTH_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

const DEFAULT_TEMPLATES = [
  {
    id: 't1',
    title: 'Royal Swan',
    category: 'VIP',
    event_type: 'Wedding',
    price: '$189',
    desc: 'Elegant swans & gold foil animation with cinematic envelope reveal.',
    thumb: '',
    demo: 'https://demo.celebria.com/royal-swan'
  },
  {
    id: 't2',
    title: 'Minimalist Pearl',
    category: 'Classic',
    event_type: 'Engagement',
    price: '$129',
    desc: 'Clean typography, soft pearl tones, and refined motion design.',
    thumb: '',
    demo: 'https://demo.celebria.com/minimalist-pearl'
  },
  {
    id: 't3',
    title: 'Golden Blossom',
    category: 'Golden',
    event_type: 'Wedding',
    price: '$159',
    desc: 'Blooming florals with interactive photo timeline and soft music.',
    thumb: '',
    demo: 'https://demo.celebria.com/golden-blossom'
  },
  {
    id: 't4',
    title: 'Midnight Velvet',
    category: 'VIP',
    event_type: 'Katb Ktab',
    price: '$169',
    desc: 'Deep tones, gold accents, and dramatic countdown experience.',
    thumb: '',
    demo: 'https://demo.celebria.com/midnight-velvet'
  },
  {
    id: 't5',
    title: 'Ivory Classic',
    category: 'Classic',
    event_type: 'Wedding',
    price: '$149',
    desc: 'Timeless script, soft cream palette, and traditional elegance.',
    thumb: '',
    demo: 'https://demo.celebria.com/ivory-classic'
  },
  {
    id: 't6',
    title: 'Desert Rose',
    category: 'Golden',
    event_type: 'Engagement',
    price: '$139',
    desc: 'Warm earth tones, dried florals, and free-spirited storytelling.',
    thumb: '',
    demo: 'https://demo.celebria.com/desert-rose'
  },
  {
    id: 't7',
    title: 'Celestial Garden',
    category: 'VIP',
    event_type: 'Birthday',
    price: '$199',
    desc: 'Starry night sky, constellation map, and glowing envelope animation.',
    thumb: '',
    demo: 'https://demo.celebria.com/celestial-garden'
  },
  {
    id: 't8',
    title: 'Silk & Stone',
    category: 'Classic',
    event_type: 'Graduation',
    price: '$154',
    desc: 'Architectural lines, stone textures, and understated luxury.',
    thumb: '',
    demo: 'https://demo.celebria.com/silk-stone'
  },
  {
    id: 't9',
    title: 'Little Star',
    category: 'Golden',
    event_type: 'Suboo',
    price: '$119',
    desc: 'Soft pastels and playful animations perfect for a baby’s Suboo.',
    thumb: '',
    demo: 'https://demo.celebria.com/little-star'
  },
  {
    id: 't10',
    title: 'Corporate Luxe',
    category: 'VIP',
    event_type: 'Event',
    price: '$179',
    desc: 'Sleek branding-ready invitation for galas and corporate events.',
    thumb: '',
    demo: 'https://demo.celebria.com/corporate-luxe'
  }
];

const DEFAULT_ORDERS = [
  { id: 'o1', customer: 'Sofia & James', template: 'Royal Swan', date: '2026-06-14', whatsapp: '+1 555 234 5678', status: 'confirmed' },
  { id: 'o2', customer: 'Amelia Chen', template: 'Golden Blossom', date: '2026-09-20', whatsapp: '+1 555 876 5432', status: 'pending' },
  { id: 'o3', customer: 'Elena & Marco', template: 'Midnight Velvet', date: '2026-05-02', whatsapp: '+39 340 123 4567', status: 'completed' }
];

const DEFAULT_SETTINGS = {
  heroTitle: 'Invite Them Into Your Love Story',
  heroSubtitle: 'Premium interactive wedding invitations that feel as special as the day itself. Personalize every detail, share a private link, and create an unforgettable first impression.',
  whatsapp: '15551234567',
  promo: '✨ Free express delivery this month on all packages',
  metric1Value: '50+',
  metric1Label: 'Interactive Templates',
  metric2Value: '24h',
  metric2Label: 'Express Delivery',
  metric3Value: '100%',
  metric3Label: 'Customizable'
};

const VALID_CATEGORIES = ['Classic', 'Golden', 'VIP'];
const VALID_EVENT_TYPES = ['Wedding', 'Engagement', 'Katb Ktab', 'Birthday', 'Suboo', 'Graduation', 'Event'];

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

/** Migrate or seed templates so admin always has valid Classic/Golden/VIP + event_type. */
function getTemplates() {
  const stored = load('celebria_templates', null);
  if (
    Array.isArray(stored) &&
    stored.length > 0 &&
    stored.every(
      t =>
        t &&
        typeof t.title === 'string' &&
        VALID_CATEGORIES.includes(t.category) &&
        VALID_EVENT_TYPES.includes(t.event_type)
    )
  ) {
    return stored;
  }
  // Seed / reset outdated localStorage with hardcoded catalog
  save('celebria_templates', DEFAULT_TEMPLATES);
  return DEFAULT_TEMPLATES.slice();
}

let templates = getTemplates();
let orders = load('celebria_orders', DEFAULT_ORDERS);
let settings = load('celebria_settings', DEFAULT_SETTINGS);

const toastEl = document.getElementById('toast');

function showToast(msg, duration = 2800) {
  if (!toastEl) return;
  toastEl.textContent = msg;
  toastEl.classList.remove('hidden');
  clearTimeout(toastEl._timer);
  toastEl._timer = setTimeout(() => toastEl.classList.add('hidden'), duration);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ---------- Auth ---------- */
function isAuthenticated() {
  try {
    const raw = sessionStorage.getItem(AUTH_KEY);
    if (!raw) return false;
    const { ts } = JSON.parse(raw);
    if (Date.now() - ts > AUTH_TTL_MS) {
      sessionStorage.removeItem(AUTH_KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function setAuthenticated() {
  sessionStorage.setItem(AUTH_KEY, JSON.stringify({ ts: Date.now() }));
}

function clearAuth() {
  sessionStorage.removeItem(AUTH_KEY);
}

function showDashboard() {
  document.getElementById('login-gate').classList.add('hidden');
  document.getElementById('admin-dashboard').classList.remove('hidden');
  templates = getTemplates();
  orders = load('celebria_orders', DEFAULT_ORDERS);
  settings = load('celebria_settings', DEFAULT_SETTINGS);
  renderAdminTemplates();
  renderOrders();
  loadSettingsIntoForm();
}

function showLogin() {
  document.getElementById('login-gate').classList.remove('hidden');
  document.getElementById('admin-dashboard').classList.add('hidden');
  const pw = document.getElementById('admin-password');
  if (pw) pw.value = '';
  document.getElementById('login-error')?.classList.add('hidden');
}

document.getElementById('login-form')?.addEventListener('submit', e => {
  e.preventDefault();
  const pw = document.getElementById('admin-password').value;
  if (pw === ADMIN_PASSWORD) {
    setAuthenticated();
    showDashboard();
    showToast('Welcome back');
  } else {
    document.getElementById('login-error')?.classList.remove('hidden');
    document.getElementById('admin-password').value = '';
    document.getElementById('admin-password').focus();
  }
});

document.getElementById('toggle-pw')?.addEventListener('click', () => {
  const input = document.getElementById('admin-password');
  const icon = document.querySelector('#toggle-pw i');
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    if (icon) icon.className = 'fa-solid fa-eye-slash';
  } else {
    input.type = 'password';
    if (icon) icon.className = 'fa-solid fa-eye';
  }
});

document.getElementById('logout-btn')?.addEventListener('click', () => {
  clearAuth();
  showLogin();
  showToast('Logged out');
});

/* ---------- Admin Nav ---------- */
document.querySelectorAll('.admin-nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.admin-nav-item').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.panel)?.classList.add('active');
  });
});

/* ---------- Templates CRUD ---------- */
function renderAdminTemplates() {
  const body = document.getElementById('admin-templates-body');
  if (!body) return;
  body.innerHTML = templates
    .map(
      t => `
    <tr>
      <td>
        ${
          t.thumb
            ? `<img class="admin-thumb" src="${escapeHtml(t.thumb)}" alt="" referrerpolicy="no-referrer" onerror="this.outerHTML='<div class=\\'admin-thumb admin-thumb-ph\\'><i class=\\'fa-solid fa-gem\\'></i></div>'" />`
            : `<div class="admin-thumb admin-thumb-ph"><i class="fa-solid fa-gem"></i></div>`
        }
      </td>
      <td><strong>${escapeHtml(t.title)}</strong></td>
      <td><span class="tier-badge tier-${escapeHtml((t.category || '').toLowerCase())}">${escapeHtml(t.category)}</span></td>
      <td>${escapeHtml(t.event_type || '—')}</td>
      <td>${escapeHtml(t.price)}</td>
      <td>
        ${
          t.demo
            ? `<a href="${escapeHtml(t.demo)}" target="_blank" rel="noopener" class="demo-link"><i class="fa-solid fa-external-link"></i> Demo</a>`
            : '—'
        }
      </td>
      <td>
        <div class="action-btns">
          <button class="btn-edit" data-edit="${escapeHtml(t.id)}"><i class="fa-solid fa-pen"></i> Edit</button>
          <button class="btn-delete" data-delete="${escapeHtml(t.id)}"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `
    )
    .join('');

  body.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => openTemplateModal(btn.dataset.edit));
  });
  body.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('Delete this template?')) {
        templates = templates.filter(t => t.id !== btn.dataset.delete);
        save('celebria_templates', templates);
        renderAdminTemplates();
        showToast('Template deleted');
      }
    });
  });
}

const templateModal = document.getElementById('template-modal');
const templateForm = document.getElementById('template-form');

function openTemplateModal(editId = null) {
  document.getElementById('template-modal-title').textContent = editId ? 'Edit Template' : 'Add New Template';
  document.getElementById('template-edit-id').value = editId || '';
  if (editId) {
    const t = templates.find(x => x.id === editId);
    if (t) {
      document.getElementById('template-title').value = t.title;
      document.getElementById('template-category').value = t.category;
      document.getElementById('template-event-type').value = t.event_type || 'Wedding';
      document.getElementById('template-price').value = t.price;
      document.getElementById('template-desc').value = t.desc;
      document.getElementById('template-thumb').value = t.thumb || '';
      document.getElementById('template-demo').value = t.demo || '';
    }
  } else {
    templateForm.reset();
    document.getElementById('template-edit-id').value = '';
    document.getElementById('template-category').value = 'Classic';
    document.getElementById('template-event-type').value = 'Wedding';
  }
  templateModal.classList.remove('hidden');
}

document.getElementById('add-template-btn')?.addEventListener('click', () => openTemplateModal());

document.getElementById('reset-templates-btn')?.addEventListener('click', () => {
  if (confirm('Reset all templates to the hardcoded default catalog? This cannot be undone on this browser.')) {
    templates = DEFAULT_TEMPLATES.slice();
    save('celebria_templates', templates);
    renderAdminTemplates();
    showToast('Templates reset to defaults');
  }
});

templateForm?.addEventListener('submit', e => {
  e.preventDefault();
  const id = document.getElementById('template-edit-id').value;
  const data = {
    id: id || 't' + Date.now(),
    title: document.getElementById('template-title').value.trim(),
    category: document.getElementById('template-category').value,
    event_type: document.getElementById('template-event-type').value,
    price: document.getElementById('template-price').value.trim(),
    desc: document.getElementById('template-desc').value.trim(),
    thumb: document.getElementById('template-thumb').value.trim(),
    demo: document.getElementById('template-demo').value.trim()
  };
  if (id) {
    const idx = templates.findIndex(t => t.id === id);
    if (idx !== -1) templates[idx] = data;
  } else {
    templates.push(data);
  }
  save('celebria_templates', templates);
  renderAdminTemplates();
  templateModal.classList.add('hidden');
  showToast(id ? 'Template updated' : 'Template added');
});

/* ---------- Orders ---------- */
function renderOrders() {
  const body = document.getElementById('admin-orders-body');
  if (!body) return;
  body.innerHTML = orders
    .map(
      o => `
    <tr>
      <td><strong>${escapeHtml(o.customer)}</strong></td>
      <td>${escapeHtml(o.template)}</td>
      <td>${escapeHtml(o.date || '—')}</td>
      <td>
        <a href="https://wa.me/${(o.whatsapp || '').replace(/\D/g, '')}" target="_blank" rel="noopener" class="demo-link">
          <i class="fa-brands fa-whatsapp"></i> ${escapeHtml(o.whatsapp)}
        </a>
      </td>
      <td>
        <select class="status-select" data-id="${escapeHtml(o.id)}">
          <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>Pending</option>
          <option value="confirmed" ${o.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
          <option value="completed" ${o.status === 'completed' ? 'selected' : ''}>Completed</option>
          <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
        </select>
      </td>
      <td>
        <div class="action-btns">
          <button class="btn-delete" data-delete-order="${escapeHtml(o.id)}"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `
    )
    .join('');

  body.querySelectorAll('.status-select').forEach(sel => {
    sel.addEventListener('change', () => {
      const order = orders.find(o => o.id === sel.dataset.id);
      if (order) {
        order.status = sel.value;
        save('celebria_orders', orders);
        showToast('Status updated');
      }
    });
  });

  body.querySelectorAll('[data-delete-order]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('Remove this order?')) {
        orders = orders.filter(o => o.id !== btn.dataset.deleteOrder);
        save('celebria_orders', orders);
        renderOrders();
        showToast('Order removed');
      }
    });
  });
}

document.getElementById('add-order-btn')?.addEventListener('click', () => {
  const sample = {
    id: 'o' + Date.now(),
    customer: 'New Couple',
    template: templates[0]?.title || 'Royal Swan',
    date: '2026-12-01',
    whatsapp: '+1 555 000 0000',
    status: 'pending'
  };
  orders.unshift(sample);
  save('celebria_orders', orders);
  renderOrders();
  showToast('Sample order added');
});

/* ---------- Settings ---------- */
function loadSettingsIntoForm() {
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val || '';
  };
  set('setting-hero-title', settings.heroTitle);
  set('setting-hero-subtitle', settings.heroSubtitle);
  set('setting-whatsapp', settings.whatsapp);
  set('setting-promo', settings.promo);
  set('setting-metric1-value', settings.metric1Value);
  set('setting-metric1-label', settings.metric1Label);
  set('setting-metric2-value', settings.metric2Value);
  set('setting-metric2-label', settings.metric2Label);
  set('setting-metric3-value', settings.metric3Value);
  set('setting-metric3-label', settings.metric3Label);
}

document.getElementById('save-settings-btn')?.addEventListener('click', () => {
  settings = {
    heroTitle: document.getElementById('setting-hero-title').value,
    heroSubtitle: document.getElementById('setting-hero-subtitle').value,
    whatsapp: document.getElementById('setting-whatsapp').value,
    promo: document.getElementById('setting-promo').value,
    metric1Value: document.getElementById('setting-metric1-value').value,
    metric1Label: document.getElementById('setting-metric1-label').value,
    metric2Value: document.getElementById('setting-metric2-value').value,
    metric2Label: document.getElementById('setting-metric2-label').value,
    metric3Value: document.getElementById('setting-metric3-value').value,
    metric3Label: document.getElementById('setting-metric3-label').value
  };
  save('celebria_settings', settings);
  showToast('Settings saved — refresh the public site to see changes');
});

/* ---------- Modal close ---------- */
document.querySelectorAll('[data-close]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.getElementById(btn.dataset.close)?.classList.add('hidden');
  });
});
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.add('hidden');
  });
});

/* ---------- Init ---------- */
if (isAuthenticated()) {
  showDashboard();
} else {
  showLogin();
}
