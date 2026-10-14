/* ============================================================
   CELEBRIA — Public Landing Page Logic
   Hardcoded templates so every visitor sees the same catalog.
   ============================================================ */

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

/** Prefer stored templates only if they match the new schema; else hardcoded defaults (multi-device safe). */
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
  return DEFAULT_TEMPLATES.slice();
}

let templates = getTemplates();
let orders = load('celebria_orders', []);
let settings = load('celebria_settings', DEFAULT_SETTINGS);

let filterCategory = 'All';
let filterEventType = 'All';

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

function escapeAttr(str) {
  return escapeHtml(str).replace(/'/g, '&#39;');
}

function getFilteredTemplates() {
  return templates.filter(t => {
    const catOk = filterCategory === 'All' || t.category === filterCategory;
    const evtOk = filterEventType === 'All' || t.event_type === filterEventType;
    return catOk && evtOk;
  });
}

/* ---------- Templates Grid ---------- */
function renderPublicTemplates() {
  const grid = document.getElementById('template-grid');
  if (!grid) return;

  const list = getFilteredTemplates();

  if (list.length === 0) {
    grid.innerHTML = `
      <div class="templates-empty">
        <i class="fa-solid fa-filter-circle-xmark"></i>
        <p>No templates match these filters. Try another package or occasion.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = list
    .map(
      t => `
    <article class="template-card" data-category="${escapeAttr(t.category)}" data-event-type="${escapeAttr(t.event_type)}">
      <div class="template-thumb">
        ${
          t.thumb
            ? `<img src="${escapeAttr(t.thumb)}" alt="${escapeAttr(t.title)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" />
               <div class="template-thumb-placeholder" style="display:none"><i class="fa-solid fa-gem"></i><br>${escapeHtml(t.title)}</div>`
            : `<div class="template-thumb-placeholder"><i class="fa-solid fa-gem"></i><br>${escapeHtml(t.title)}</div>`
        }
      </div>
      <div class="template-body">
        <div class="template-tags">
          <span class="template-category tier-${escapeAttr(t.category.toLowerCase())}">${escapeHtml(t.category)}</span>
          <span class="template-event">${escapeHtml(t.event_type)}</span>
        </div>
        <h3 class="template-title">${escapeHtml(t.title)}</h3>
        <p class="template-desc">${escapeHtml(t.desc)}</p>
        <div class="template-price">${escapeHtml(t.price)}</div>
        <div class="template-actions">
          <a href="${escapeAttr(t.demo || '#')}" class="btn btn-outline" target="_blank" rel="noopener">
            <i class="fa-solid fa-eye"></i> Preview Demo
          </a>
          <button class="btn btn-primary select-package" data-id="${escapeAttr(t.id)}">
            <i class="fa-solid fa-check"></i> Select Package
          </button>
        </div>
      </div>
    </article>
  `
    )
    .join('');

  document.querySelectorAll('.select-package').forEach(btn => {
    btn.addEventListener('click', () => {
      const tmpl = templates.find(t => t.id === btn.dataset.id);
      openInquiryModal(tmpl ? tmpl.title : '');
    });
  });
}

/* ---------- Filters ---------- */
function setActiveFilter(group, value) {
  document.querySelectorAll(`[data-filter-group="${group}"] .filter-btn`).forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filterValue === value);
  });
}

function initFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.closest('[data-filter-group]')?.dataset.filterGroup;
      const value = btn.dataset.filterValue;
      if (!group) return;
      if (group === 'category') {
        filterCategory = value;
        setActiveFilter('category', value);
      } else if (group === 'event') {
        filterEventType = value;
        setActiveFilter('event', value);
      }
      renderPublicTemplates();
    });
  });

  // Optional mobile <select> fallbacks
  const catSelect = document.getElementById('filter-category-select');
  const evtSelect = document.getElementById('filter-event-select');
  if (catSelect) {
    catSelect.addEventListener('change', () => {
      filterCategory = catSelect.value;
      setActiveFilter('category', filterCategory);
      renderPublicTemplates();
    });
  }
  if (evtSelect) {
    evtSelect.addEventListener('change', () => {
      filterEventType = evtSelect.value;
      setActiveFilter('event', filterEventType);
      renderPublicTemplates();
    });
  }
}

/* ---------- Settings → Landing ---------- */
function applySettingsToLanding() {
  const sub = document.querySelector('.hero-subtitle');
  if (sub) sub.textContent = settings.heroSubtitle;

  const map = [
    ['metric1-value', settings.metric1Value],
    ['metric1-label', settings.metric1Label],
    ['metric2-value', settings.metric2Value],
    ['metric2-label', settings.metric2Label],
    ['metric3-value', settings.metric3Value],
    ['metric3-label', settings.metric3Label]
  ];
  map.forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el && val != null) el.textContent = val;
  });

  const wa = (settings.whatsapp || '').replace(/\D/g, '');
  const links = [
    { id: 'wa-hero-btn', text: "Hi Celebria, I'd like to order a digital invitation" },
    { id: 'wa-cta-btn', text: "Hi Celebria, I'd like to start my invitation" },
    { id: 'wa-footer-btn', text: 'Hi Celebria' }
  ];
  links.forEach(({ id, text }) => {
    const el = document.getElementById(id);
    if (el && wa) el.href = `https://wa.me/${wa}?text=${encodeURIComponent(text)}`;
  });
}

/* ---------- Inquiry Modal ---------- */
function populateInquirySelect() {
  const sel = document.getElementById('inquiry-template');
  if (!sel) return;
  const current = sel.value;
  sel.innerHTML =
    '<option value="">Select a package...</option>' +
    templates
      .map(
        t =>
          `<option value="${escapeAttr(t.title)}">${escapeHtml(t.title)} — ${escapeHtml(t.category)} / ${escapeHtml(t.event_type)} — ${escapeHtml(t.price)}</option>`
      )
      .join('');
  if (current) sel.value = current;
}

function openInquiryModal(preselect = '') {
  const form = document.getElementById('inquiry-form');
  if (form) form.reset();
  populateInquirySelect();
  if (preselect) {
    const sel = document.getElementById('inquiry-template');
    if (sel) sel.value = preselect;
  }
  document.getElementById('inquiry-modal')?.classList.remove('hidden');
}

document.getElementById('open-inquiry-form')?.addEventListener('click', () => openInquiryModal());

document.getElementById('inquiry-form')?.addEventListener('submit', e => {
  e.preventDefault();
  const newOrder = {
    id: 'o' + Date.now(),
    customer: document.getElementById('inquiry-name').value.trim(),
    template: document.getElementById('inquiry-template').value || 'General Inquiry',
    date: document.getElementById('inquiry-date').value || '',
    whatsapp: document.getElementById('inquiry-whatsapp').value.trim(),
    status: 'pending',
    message: document.getElementById('inquiry-message')?.value.trim() || '',
    createdAt: new Date().toISOString()
  };
  orders = load('celebria_orders', []);
  orders.unshift(newOrder);
  save('celebria_orders', orders);
  document.getElementById('inquiry-modal')?.classList.add('hidden');
  showToast("Inquiry submitted! We'll contact you soon.");
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

/* ---------- FAQ ---------- */
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.parentElement;
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!wasOpen) item.classList.add('open');
  });
});

/* ---------- Navbar ---------- */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar?.classList.toggle('scrolled', window.scrollY > 40);
});

const mobileBtn = document.getElementById('mobile-menu-btn');
const mobileNav = document.getElementById('mobile-nav');
mobileBtn?.addEventListener('click', () => mobileNav?.classList.toggle('open'));
mobileNav?.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => mobileNav.classList.remove('open'));
});

/* ---------- Init ---------- */
templates = getTemplates();
settings = load('celebria_settings', DEFAULT_SETTINGS);
initFilters();
renderPublicTemplates();
populateInquirySelect();
applySettingsToLanding();
