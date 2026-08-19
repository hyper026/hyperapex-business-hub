const API_BASE = window.HYPERAPEX_API_BASE || 'http://localhost:4000';
const token = sessionStorage.getItem('hyperapex_token');

if (!token) window.location.replace('login.html');

async function api(path, options = {}) {
  const headers = {...(options.headers || {}), Authorization: `Bearer ${token}`};
  const response = await fetch(`${API_BASE}${path}`, {...options, headers});
  if (response.status === 401) {
    sessionStorage.clear();
    window.location.replace('login.html');
    throw new Error('Authentication required.');
  }
  return response;
}

async function loadServices() {
  const grid = document.getElementById('serviceGrid');
  try {
    const response = await api('/api/services');
    if (!response.ok) throw new Error('Service request failed');
    const services = await response.json();
    document.getElementById('servicesCount').textContent = services.length;
    grid.innerHTML = services.map(service => `<article class="service-card"><p class="eyebrow">${escapeHtml(service.category)}</p><h3>${escapeHtml(service.name)}</h3><p>${escapeHtml(service.description || '')}</p></article>`).join('');
  } catch (_error) {
    grid.innerHTML = '<p>Unable to load services.</p>';
  }
}

async function loadClients() {
  const counter = document.getElementById('clientsCount');
  try {
    const response = await api('/api/clients');
    if (!response.ok) throw new Error('Client request failed');
    const clients = await response.json();
    counter.textContent = clients.length;
  } catch (_error) {
    counter.textContent = '—';
  }
}

function setupUser() {
  const user = JSON.parse(sessionStorage.getItem('hyperapex_user') || 'null');
  if (user) {
    const heading = document.querySelector('.topbar h1');
    if (heading) heading.textContent = `Welcome, ${user.full_name.split(' ')[0]}`;
  }
  const logout = document.querySelector('.logout');
  logout?.addEventListener('click', (event) => {
    event.preventDefault();
    sessionStorage.clear();
    window.location.href = 'login.html';
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
}

setupUser();
loadServices();
loadClients();
