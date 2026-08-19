const API_BASE = window.HYPERAPEX_API_BASE || 'http://localhost:4000';
const token = sessionStorage.getItem('hyperapex_token');
if (!token) window.location.replace('login.html');

async function api(path, options = {}) {
  const headers = {...(options.headers || {}), Authorization: `Bearer ${token}`};
  const response = await fetch(`${API_BASE}${path}`, {...options, headers});
  if (response.status === 401) { sessionStorage.clear(); window.location.replace('login.html'); throw new Error('Authentication required.'); }
  return response;
}

async function loadServices() {
  const grid = document.getElementById('serviceGrid');
  try {
    const response = await api('/api/services');
    if (!response.ok) throw new Error();
    const services = await response.json();
    document.getElementById('servicesCount').textContent = services.length;
    grid.innerHTML = services.map(s => `<article class="service-card"><p class="eyebrow">${escapeHtml(s.category)}</p><h3>${escapeHtml(s.name)}</h3><p>${escapeHtml(s.description || '')}</p></article>`).join('');
  } catch (_error) { grid.innerHTML = '<p>Unable to load services.</p>'; }
}

async function loadClients() {
  const rows = document.getElementById('clientRows');
  try {
    const response = await api('/api/clients');
    if (!response.ok) throw new Error();
    const clients = await response.json();
    document.getElementById('clientsCount').textContent = clients.length;
    rows.innerHTML = clients.length ? clients.map(c => `<tr><td>${escapeHtml(c.name)}</td><td>${escapeHtml(c.client_type)}</td><td>${escapeHtml(c.email || '—')}</td><td>${escapeHtml(c.phone || '—')}</td><td>${escapeHtml(c.status)}</td></tr>`).join('') : '<tr><td colspan="5">No clients yet.</td></tr>';
  } catch (_error) { rows.innerHTML = '<tr><td colspan="5">Unable to load clients.</td></tr>'; }
}

function setupClientForm() {
  const form = document.getElementById('clientForm');
  document.getElementById('showClientForm').addEventListener('click', () => { form.hidden = false; document.getElementById('clientName').focus(); });
  document.getElementById('cancelClient').addEventListener('click', () => { form.reset(); form.hidden = true; });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const message = document.getElementById('clientMessage');
    message.textContent = 'Saving…';
    try {
      const response = await api('/api/clients', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({
        client_type: document.getElementById('clientType').value,
        name: document.getElementById('clientName').value.trim(),
        email: document.getElementById('clientEmail').value.trim() || null,
        phone: document.getElementById('clientPhone').value.trim() || null,
        address: document.getElementById('clientAddress').value.trim() || null,
        notes: document.getElementById('clientNotes').value.trim() || null
      })});
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to save client.');
      message.textContent = 'Client saved successfully.';
      form.reset();
      setTimeout(() => { form.hidden = true; message.textContent = ''; }, 700);
      loadClients();
    } catch (error) { message.textContent = error.message; }
  });
}

function setupUser() {
  const user = JSON.parse(sessionStorage.getItem('hyperapex_user') || 'null');
  if (user) document.querySelector('.topbar h1').textContent = `Welcome, ${user.full_name.split(' ')[0]}`;
  document.querySelector('.logout')?.addEventListener('click', event => { event.preventDefault(); sessionStorage.clear(); window.location.href = 'login.html'; });
}
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char])); }
setupUser(); setupClientForm(); loadServices(); loadClients();
