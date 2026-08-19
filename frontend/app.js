const API_BASE = window.HYPERAPEX_API_BASE || 'http://localhost:4000';

async function loadServices() {
  const grid = document.getElementById('serviceGrid');
  try {
    const response = await fetch(`${API_BASE}/api/services`);
    if (!response.ok) throw new Error('Service request failed');
    const services = await response.json();
    document.getElementById('servicesCount').textContent = services.length;
    grid.innerHTML = services.map(service => `
      <article class="service-card">
        <p class="eyebrow">${escapeHtml(service.category)}</p>
        <h3>${escapeHtml(service.name)}</h3>
        <p>${escapeHtml(service.description || '')}</p>
      </article>
    `).join('');
  } catch (_error) {
    grid.innerHTML = '<p>Connect the API and database to load the service catalogue.</p>';
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char]));
}

loadServices();
