/* ============================================================
   CELEBRIA — Public Landing Page Logic
   ============================================================ */

const DEFAULT_TEMPLATES = [
  { id: 't1', title: 'Royal Swan', category: 'Luxury', price: '$189', desc: 'Elegant swans & gold foil animation with cinematic envelope reveal.', thumb: '', demo: 'https://demo.celebria.com/royal-swan' },
  { id: 't2', title: 'Minimalist Pearl', category: 'Minimalist', price: '$129', desc: 'Clean typography, soft pearl tones, and refined motion design.', thumb: '', demo: 'https://demo.celebria.com/minimalist-pearl' },
  { id: 't3', title: 'Golden Blossom', category: 'Floral', price: '$159', desc: 'Blooming florals with interactive photo timeline and soft music.', thumb: '', demo: 'https://demo.celebria.com/golden-blossom' },
  { id: 't4', title: 'Midnight Velvet', category: 'Modern', price: '$169', desc: 'Deep tones, gold accents, and dramatic countdown experience.', thumb: '', demo: 'https://demo.celebria.com/midnight-velvet' },
  { id: 't5', title: 'Ivory Classic', category: 'Classic', price: '$149', desc: 'Timeless script, soft cream palette, and traditional elegance.', thumb: '', demo: 'https://demo.celebria.com/ivory-classic' },
  { id: 't6', title: 'Desert Rose', category: 'Bohemian', price: '$139', desc: 'Warm earth tones, dried florals, and free-spirited storytelling.', thumb: '', demo: 'https://demo.celebria.com/desert-rose' },
  { id: 't7', title: 'Celestial Garden', category: 'Luxury', price: '$199', desc: 'Starry night sky, constellation map, and glowing envelope animation.', thumb: '', demo: 'https://demo.celebria.com/celestial-garden' },
  { id: 't8', title: 'Silk & Stone', category: 'Modern', price: '$154', desc: 'Architectural lines, stone textures, and understated luxury.', thumb: '', demo: 'https://demo.celebria.com/silk-stone' }
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

let templates = load('celebria_templates', DEFAULT_TEMPLATES);
let orders = load('celebria_orders', []);
let settings = load('celebria_settings', DEFAULT_SETTINGS);

const toastEl = document.getElementById('toast');

function showToast(msg, duration = 2800) {
  toastEl.textContent = msg;
  toastEl.classList.remove('hidden');
  clearTimeout(toastEl._timer);
  toastEl._timer = setTimeout(() => toastEl.classList.add('hidden'), duration);
}

/* ---------- Templates Grid ---------- */
function renderPublicTemplates() {
  const grid = document.getElementById('template-grid');
  if (!grid) return;
  grid.innerHTML = templates.map(t => `
    <article class="template-card">
      <div class="template-thumb">
        ${t.thumb
          ? `<img src="${escapeAttr(t.thumb)}" alt="${escapeAttr(t.title)}" />`
          : `<div class="template-thumb-placeholder"><i class="fa-solid fa-gem"></i><br>${escapeHtml(t.title)}</div>`
        }
      </div>
      <div class="template-body">
        <span class="template-category">${escapeHtml(t.category)}</span>
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
  `).join('');

  document.querySelectorAll('.select-package').forEach(btn => {
    btn.addEventListener('click', () => {
      const tmpl = templates.find(t => t.id === btn.dataset.id);
      openInquiryModal(tmpl ? tmpl.title : '');
    });
  });
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

/* ---------- Settings → Landing ---------- */
function applySettingsToLanding() {
  const sub = document.querySelector('.hero-subtitle');
  if (sub) sub.textContent = settings.heroSubtitle;

  const m1v = document.getElementById('metric1-value');
  const m1l = document.getElementById('metric1-label');
  const m2v = document.getElementById('metric2-value');
  const m2l = document.getElementById('metric2-label');
  const m3v = document.getElementById('metric3-value');
  const m3l = document.getElementById('metric3-label');
  if (m1v) m1v.textContent = settings.metric1Value;
  if (m1l) m1l.textContent = settings.metric1Label;
  if (m2v) m2v.textContent = settings.metric2Value;
  if (m2l) m2l.textContent = settings.metric2Label;
  if (m3v) m3v.textContent = settings.metric3Value;
  if (m3l) m3l.textContent = settings.metric3Label;

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
  sel.innerHTML = '<option value="">Select a package...</option>' +
    templates.map(t => `<option value="${escapeAttr(t.title)}">${escapeHtml(t.title)} — ${escapeHtml(t.price)}</option>`).join('');
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
  document.getElementById('inquiry-modal').classList.remove('hidden');
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
  document.getElementById('inquiry-modal').classList.add('hidden');
  showToast('Inquiry submitted! We\'ll contact you soon.');
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
templates = load('celebria_templates', DEFAULT_TEMPLATES);
settings = load('celebria_settings', DEFAULT_SETTINGS);
renderPublicTemplates();
populateInquirySelect();
applySettingsToLanding();
