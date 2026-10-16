/* ============================================================
   CELEBRIA — Admin Dashboard Logic
   Auth: Supabase Auth (email + password). Only the admin user you
         create in Supabase can sign in; sign-ups should be disabled.
   Data: templates + orders live in Supabase (shared across devices).
         Row Level Security enforces that only the signed-in admin can
         read/modify orders and templates.
   ============================================================ */

const FALLBACK_TEMPLATES = [
  { id: 't1', title: 'Royal Swan', category: 'VIP', event_type: 'Wedding', price: '$189', desc: 'Elegant swans & gold foil animation with cinematic envelope reveal.', thumb: '', demo: 'https://demo.celebria.com/royal-swan' },
  { id: 't2', title: 'Minimalist Pearl', category: 'Classic', event_type: 'Engagement', price: '$129', desc: 'Clean typography, soft pearl tones, and refined motion design.', thumb: '', demo: 'https://demo.celebria.com/minimalist-pearl' },
  { id: 't3', title: 'Golden Blossom', category: 'Golden', event_type: 'Wedding', price: '$159', desc: 'Blooming florals with interactive photo timeline and soft music.', thumb: '', demo: 'https://demo.celebria.com/golden-blossom' },
  { id: 't4', title: 'Midnight Velvet', category: 'VIP', event_type: 'Katb Ktab', price: '$169', desc: 'Deep tones, gold accents, and dramatic countdown experience.', thumb: '', demo: 'https://demo.celebria.com/midnight-velvet' },
  { id: 't5', title: 'Ivory Classic', category: 'Classic', event_type: 'Wedding', price: '$149', desc: 'Timeless script, soft cream palette, and traditional elegance.', thumb: '', demo: 'https://demo.celebria.com/ivory-classic' },
  { id: 't6', title: 'Desert Rose', category: 'Golden', event_type: 'Engagement', price: '$139', desc: 'Warm earth tones, dried florals, and free-spirited storytelling.', thumb: '', demo: 'https://demo.celebria.com/desert-rose' },
  { id: 't7', title: 'Celestial Garden', category: 'VIP', event_type: 'Birthday', price: '$199', desc: 'Starry night sky, constellation map, and glowing envelope animation.', thumb: '', demo: 'https://demo.celebria.com/celestial-garden' },
  { id: 't8', title: 'Silk & Stone', category: 'Classic', event_type: 'Graduation', price: '$154', desc: 'Architectural lines, stone textures, and understated luxury.', thumb: '', demo: 'https://demo.celebria.com/silk-stone' },
  { id: 't9', title: 'Little Star', category: 'Golden', event_type: 'Suboo', price: '$119', desc: 'Soft pastels and playful animations perfect for a baby\u2019s Suboo.', thumb: '', demo: 'https://demo.celebria.com/little-star' },
  { id: 't10', title: 'Corporate Luxe', category: 'VIP', event_type: 'Event', price: '$179', desc: 'Sleek branding-ready invitation for galas and corporate events.', thumb: '', demo: 'https://demo.celebria.com/corporate-luxe' }
];

const DEFAULT_SETTINGS = {
  heroTitle: 'Invite Them Into Your Love Story',
  heroSubtitle: 'Premium interactive wedding invitations that feel as special as the day itself. Personalize every detail, share a private link, and create an unforgettable first impression.',
  whatsapp: '15551234567',
  promo: '\u2728 Free express delivery this month on all packages',
  metric1Value: '50+', metric1Label: 'Interactive Templates',
  metric2Value: '24h', metric2Label: 'Express Delivery',
  metric3Value: '100%', metric3Label: 'Customizable'
};

/* ---------- Helpers ---------- */

function load(key, fallback) {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
  catch { return fallback; }
}
function save(key, data) { localStorage.setItem(key, JSON.stringify(data)); }

let supabaseClient = null;
function getClient() {
  if (supabaseClient) return supabaseClient;
  const cfg = window.CELEBRIA_SUPABASE || {};
  if (!cfg.url || !cfg.anonKey || cfg.url.includes('YOUR_SUPABASE') || cfg.anonKey.includes('YOUR_SUPABASE')) return null;
  if (!window.supabase || typeof window.supabase.createClient !== 'function') {
    console.error('Supabase SDK not loaded');
    return null;
  }
  supabaseClient = window.supabase.createClient(cfg.url, cfg.anonKey);
  return supabaseClient;
}

function requireClient() {
  const client = getClient();
  if (!client) throw new Error('Supabase is not configured (js/supabase-config.js)');
  return client;
}

function escapeHtml(str) {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function showToast(msg, duration = 2800) {
  const toastEl = document.getElementById('toast');
  if (!toastEl) return;
  toastEl.textContent = msg;
  toastEl.classList.remove('hidden');
  clearTimeout(toastEl._timer);
  toastEl._timer = setTimeout(() => toastEl.classList.add('hidden'), duration);
}

/* ---------- Mapping ---------- */

function mapTemplate(row) {
  return { id: row.id, title: row.title, category: row.category, event_type: row.event_type, price: row.price || '', desc: row.description || '', thumb: row.thumb || '', demo: row.demo || '' };
}
function toTemplateRow(t) {
  return { id: t.id, title: t.title, category: t.category, event_type: t.event_type, price: t.price || '', description: t.desc || '', thumb: t.thumb || '', demo: t.demo || '' };
}
function mapOrder(row) {
  return {
    id: row.id,
    customer: row.customer,
    template: row.template,
    date: row.event_date || '',
    whatsapp: row.whatsapp || '',
    message: row.message || '',
    status: row.status,
    createdAt: row.created_at
  };
}

/* ---------- Templates (Supabase) ---------- */

let templates = [];
let orders = [];
let settings = load('celebria_settings', DEFAULT_SETTINGS);

async function fetchTemplates() {
  const client = requireClient();
  const { data, error } = await client.from('templates')
    .select('id, title, category, event_type, price, description, thumb, demo, created_at')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []).map(mapTemplate);
}

async function insertTemplate(t) {
  const { data, error } = await requireClient().from('templates').insert([toTemplateRow(t)]).select().single();
  if (error) throw error;
  return mapTemplate(data);
}

async function updateTemplate(t) {
  const { data, error } = await requireClient().from('templates').update(toTemplateRow(t)).eq('id', t.id).select().single();
  if (error) throw error;
  return mapTemplate(data);
}

async function deleteTemplate(id) {
  const { error } = await requireClient().from('templates').delete().eq('id', id);
  if (error) throw error;
}

async function seedDefaultsIfEmpty() {
  const client = requireClient();
  const { count, error } = await client.from('templates').select('id', { count: 'exact', head: true });
  if (error) throw error;
  if (count && count > 0) return false;
  const { error: insertError } = await client.from('templates').insert(FALLBACK_TEMPLATES.map(toTemplateRow));
  if (insertError) throw insertError;
  return true;
}

async function refreshTemplates() {
  try {
    templates = await fetchTemplates();
    renderAdminTemplates();
  } catch (err) {
    console.error(err);
    showToast('Failed to load templates: ' + (err.message || err));
  }
}

/* ---------- Orders (Supabase) ---------- */

async function refreshOrders() {
  try {
    const { data, error } = await requireClient().from('orders')
      .select('id, customer, template, event_date, whatsapp, message, status, created_at')
      .order('created_at', { ascending: false });
    if (error) throw error;
    orders = (data || []).map(mapOrder);
    renderOrders();
  } catch (err) {
    console.error(err);
    showToast('Failed to load orders: ' + (err.message || err));
  }
}

async function updateOrderStatus(id, status) {
  const { error } = await requireClient().from('orders').update({ status }).eq('id', id);
  if (error) throw error;
}

async function deleteOrder(id) {
  const { error } = await requireClient().from('orders').delete().eq('id', id);
  if (error) throw error;
}

async function insertTestOrder() {
  const { error } = await requireClient().from('orders').insert([{
    customer: 'Test Couple',
    template: templates[0]?.title || 'Royal Swan',
    event_date: '2026-12-01',
    whatsapp: '+1 555 000 0000',
    message: 'Test order created from admin',
    status: 'pending'
  }]);
  if (error) throw error;
}

/* ---------- Auth (Supabase) ---------- */

function showLogin() {
  document.getElementById('login-gate').classList.remove('hidden');
  document.getElementById('admin-dashboard').classList.add('hidden');
  const pw = document.getElementById('admin-password');
  if (pw) pw.value = '';
  document.getElementById('login-error')?.classList.add('hidden');
}

async function showDashboard() {
  document.getElementById('login-gate').classList.add('hidden');
  document.getElementById('admin-dashboard').classList.remove('hidden');
  settings = load('celebria_settings', DEFAULT_SETTINGS);
  loadSettingsIntoForm();
  const body = document.getElementById('admin-templates-body');
  if (body) body.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:32px;color:#6b6b6b"><i class="fa-solid fa-spinner fa-spin"></i> Loading\u2026</td></tr>';
  try {
    if (await seedDefaultsIfEmpty()) showToast('Default templates seeded');
  } catch (err) {
    console.error(err);
  }
  await refreshTemplates();
  await refreshOrders();
}

document.getElementById('login-form')?.addEventListener('submit', async e => {
  e.preventDefault();
  const client = getClient();
  const errEl = document.getElementById('login-error');
  const btn = e.currentTarget.querySelector('button[type="submit"]');
  if (!client) {
    errEl.textContent = 'Supabase is not configured. Check js/supabase-config.js.';
    errEl.classList.remove('hidden');
    return;
  }
  const email = document.getElementById('admin-email').value.trim();
  const password = document.getElementById('admin-password').value;
  if (btn) btn.disabled = true;
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (btn) btn.disabled = false;
  if (error) {
    errEl.textContent = 'Incorrect email or password. Please try again.';
    errEl.classList.remove('hidden');
    document.getElementById('admin-password').value = '';
    document.getElementById('admin-password').focus();
    return;
  }
  errEl.classList.add('hidden');
  await showDashboard();
  showToast('Welcome back');
});

document.getElementById('toggle-pw')?.addEventListener('click', () => {
  const input = document.getElementById('admin-password');
  const icon = document.querySelector('#toggle-pw i');
  if (!input) return;
  if (input.type === 'password') { input.type = 'text'; if (icon) icon.className = 'fa-solid fa-eye-slash'; }
  else { input.type = 'password'; if (icon) icon.className = 'fa-solid fa-eye'; }
});

document.getElementById('logout-btn')?.addEventListener('click', async () => {
  await getClient()?.auth.signOut();
  showLogin();
  showToast('Logged out');
});

/* ---------- Navigation ---------- */

let ordersTimer = null;
document.querySelectorAll('.admin-nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.admin-nav-item').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.panel)?.classList.add('active');
    if (btn.dataset.panel === 'orders-panel') refreshOrders();
  });
});
// Keep the orders list fresh while the admin is looking at it
ordersTimer = setInterval(() => {
  if (document.getElementById('orders-panel')?.classList.contains('active') &&
      !document.getElementById('admin-dashboard')?.classList.contains('hidden')) {
    refreshOrders();
  }
}, 60000);

/* ---------- Templates UI ---------- */

function renderAdminTemplates() {
  const body = document.getElementById('admin-templates-body');
  if (!body) return;
  if (!templates.length) {
    body.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px;color:#6b6b6b">No templates yet. Add one or use Reset to Defaults.</td></tr>';
    return;
  }
  body.innerHTML = templates.map(t => `
    <tr>
      <td>${t.thumb
        ? `<img class="admin-thumb" src="${escapeHtml(t.thumb)}" alt="" referrerpolicy="no-referrer" onerror="this.outerHTML='<div class=\\'admin-thumb admin-thumb-ph\\'><i class=\\'fa-solid fa-gem\\'></i></div>'" />`
        : `<div class="admin-thumb admin-thumb-ph"><i class="fa-solid fa-gem"></i></div>`}</td>
      <td><strong>${escapeHtml(t.title)}</strong></td>
      <td><span class="tier-badge tier-${escapeHtml((t.category || '').toLowerCase())}">${escapeHtml(t.category)}</span></td>
      <td>${escapeHtml(t.event_type || '\u2014')}</td>
      <td>${escapeHtml(t.price)}</td>
      <td>${t.demo ? `<a href="${escapeHtml(t.demo)}" target="_blank" rel="noopener" class="demo-link"><i class="fa-solid fa-external-link"></i> Demo</a>` : '\u2014'}</td>
      <td><div class="action-btns">
        <button class="btn-edit" data-edit="${escapeHtml(t.id)}"><i class="fa-solid fa-pen"></i> Edit</button>
        <button class="btn-delete" data-delete="${escapeHtml(t.id)}"><i class="fa-solid fa-trash"></i></button>
      </div></td>
    </tr>
  `).join('');

  body.querySelectorAll('[data-edit]').forEach(btn => btn.addEventListener('click', () => openTemplateModal(btn.dataset.edit)));
  body.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Delete this template from the database?')) return;
      try {
        await deleteTemplate(btn.dataset.delete);
        templates = templates.filter(t => t.id !== btn.dataset.delete);
        renderAdminTemplates();
        showToast('Template deleted');
      } catch (err) {
        console.error(err);
        showToast('Delete failed: ' + (err.message || err));
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

document.getElementById('reset-templates-btn')?.addEventListener('click', async () => {
  if (!confirm('Seed default templates if the table is empty? Existing rows are kept.')) return;
  try {
    const seeded = await seedDefaultsIfEmpty();
    showToast(seeded ? 'Default templates seeded' : 'Table already has templates; nothing changed');
    await refreshTemplates();
  } catch (err) {
    console.error(err);
    showToast('Seed failed: ' + (err.message || err));
  }
});

templateForm?.addEventListener('submit', async e => {
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
  const submitBtn = templateForm.querySelector('button[type="submit"]');
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Saving\u2026'; }
  try {
    if (id) {
      const updated = await updateTemplate(data);
      const idx = templates.findIndex(t => t.id === id);
      if (idx !== -1) templates[idx] = updated; else templates.push(updated);
      showToast('Template updated');
    } else {
      const created = await insertTemplate(data);
      templates.push(created);
      showToast('Template added');
    }
    renderAdminTemplates();
    templateModal.classList.add('hidden');
  } catch (err) {
    console.error(err);
    showToast('Save failed: ' + (err.message || err));
  } finally {
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Save Template'; }
  }
});

/* ---------- Orders UI ---------- */

function renderOrders() {
  const body = document.getElementById('admin-orders-body');
  if (!body) return;
  if (!orders.length) {
    body.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:24px;color:#6b6b6b">No orders or inquiries yet.</td></tr>';
    return;
  }
  body.innerHTML = orders.map(o => `
    <tr title="${escapeHtml(o.message)}">
      <td><strong>${escapeHtml(o.customer)}</strong></td>
      <td>${escapeHtml(o.template)}</td>
      <td>${escapeHtml(o.date || '\u2014')}</td>
      <td><a href="https://wa.me/${escapeHtml((o.whatsapp || '').replace(/\D/g, ''))}" target="_blank" rel="noopener" class="demo-link"><i class="fa-brands fa-whatsapp"></i> ${escapeHtml(o.whatsapp)}</a></td>
      <td>
        <select class="status-select" data-id="${escapeHtml(o.id)}">
          <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>Pending</option>
          <option value="confirmed" ${o.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
          <option value="completed" ${o.status === 'completed' ? 'selected' : ''}>Completed</option>
          <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
        </select>
      </td>
      <td><div class="action-btns"><button class="btn-delete" data-delete-order="${escapeHtml(o.id)}"><i class="fa-solid fa-trash"></i></button></div></td>
    </tr>
  `).join('');

  body.querySelectorAll('.status-select').forEach(sel => {
    sel.addEventListener('change', async () => {
      try {
        await updateOrderStatus(sel.dataset.id, sel.value);
        const order = orders.find(o => o.id === sel.dataset.id);
        if (order) order.status = sel.value;
        showToast('Status updated');
      } catch (err) {
        console.error(err);
        showToast('Update failed: ' + (err.message || err));
        refreshOrders();
      }
    });
  });

  body.querySelectorAll('[data-delete-order]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Remove this order?')) return;
      try {
        await deleteOrder(btn.dataset.deleteOrder);
        orders = orders.filter(o => o.id !== btn.dataset.deleteOrder);
        renderOrders();
        showToast('Order removed');
      } catch (err) {
        console.error(err);
        showToast('Delete failed: ' + (err.message || err));
      }
    });
  });
}

document.getElementById('add-order-btn')?.addEventListener('click', async () => {
  try {
    await insertTestOrder();
    showToast('Test order added');
    refreshOrders();
  } catch (err) {
    console.error(err);
    showToast('Could not add test order: ' + (err.message || err));
  }
});

/* ---------- Settings (browser-local; see README) ---------- */

function loadSettingsIntoForm() {
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
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
  showToast('Settings saved on this browser only');
});

/* ---------- Modals ---------- */

document.querySelectorAll('[data-close]').forEach(btn => {
  btn.addEventListener('click', () => document.getElementById(btn.dataset.close)?.classList.add('hidden'));
});
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.add('hidden'); });
});

/* ---------- Boot ---------- */

(async function boot() {
  const client = getClient();
  if (!client) {
    showLogin();
    document.getElementById('login-error').textContent = 'Supabase is not configured. Check js/supabase-config.js.';
    document.getElementById('login-error').classList.remove('hidden');
    return;
  }
  const { data } = await client.auth.getSession();
  if (data.session) await showDashboard();
  else showLogin();

  client.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT' || !session) showLogin();
  });
})();
