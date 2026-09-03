/* =========================================================
   LOGOVILAGE — main.js
   Content (portfolio, pricing, blog, site text, custom logo)
   loads at runtime from content/*.json — exactly what the
   admin panel (Decap CMS) edits. Also drives the premium
   interaction layer: custom cursor, grain, magnetic buttons,
   hero word reveal, scroll reveal.
   ========================================================= */

// ---------- Helpers ----------
async function loadJSON(path) {
  try {
    const res = await fetch(path + '?v=' + Date.now());
    if (!res.ok) throw new Error('Failed to load ' + path);
    return await res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
}
function escapeHTML(str = '') {
  return str.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}
function fmtDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

/* =========================================================
   AMBIENT LAYER — grain, custom cursor, magnetic buttons
   ========================================================= */
function initAmbient() {
  const grain = document.createElement('div');
  grain.className = 'grain-layer';
  document.body.appendChild(grain);

  if (window.matchMedia && window.matchMedia('(pointer: fine)').matches) {
    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    document.body.appendChild(dot);
    let x = 0, y = 0, cx = 0, cy = 0;
    window.addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; });
    (function loop() {
      cx += (x - cx) * 0.18; cy += (y - cy) * 0.18;
      dot.style.transform = `translate(${cx}px, ${cy}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    })();
    document.addEventListener('mousedown', () => dot.classList.add('clicking'));
    document.addEventListener('mouseup', () => dot.classList.remove('clicking'));
    document.addEventListener('mouseover', e => {
      if (e.target.closest('a, button, .plot, .price-card, .blog-card')) dot.classList.add('hovering');
    });
    document.addEventListener('mouseout', e => {
      if (e.target.closest('a, button, .plot, .price-card, .blog-card')) dot.classList.remove('hovering');
    });
  }
}

function initMagnetic() {
  const strength = 14;
  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const relX = e.clientX - r.left - r.width / 2;
      const relY = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${(relX / r.width) * strength}px, ${(relY / r.height) * strength}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
}

function initNavAndReveal() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
      toggle.classList.toggle('active');
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.classList.remove('active');
    }));
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal, .plot').forEach(el => io.observe(el));
  window.__revealObserver = io;
}

/* =========================================================
   SITE-WIDE TEXT + LOGO
   ========================================================= */
async function hydrateSiteText() {
  const data = await loadJSON('content/site.json');
  if (!data) return;
  document.querySelectorAll('[data-site]').forEach(el => {
    const key = el.getAttribute('data-site');
    if (data[key] !== undefined) el.innerHTML = escapeHTML(data[key]).replace(/\n/g, '<br>');
  });
  document.querySelectorAll('[data-site-href]').forEach(el => {
    const key = el.getAttribute('data-site-href');
    if (key === 'contact_email' && data.contact_email) el.href = 'mailto:' + data.contact_email;
    if (key === 'contact_phone' && data.contact_phone) el.href = 'tel:' + data.contact_phone.replace(/\s+/g, '');
    if (key === 'whatsapp' && data.whatsapp) el.href = 'https://wa.me/' + data.whatsapp.replace(/\D/g, '');
  });
  // Custom uploaded logo overrides the default animated mark, everywhere .logo-mark appears
  if (data.logo_image) {
    document.querySelectorAll('.logo-mark').forEach(el => {
      el.innerHTML = `<img class="custom-logo" src="${data.logo_image}" alt="Logovilage">`;
    });
  }
}

// Splits the hero heading into words for a staggered reveal on load
async function hydrateHeroWords() {
  const el = document.querySelector('[data-hero-title]');
  if (!el) return;
  const data = await loadJSON('content/site.json');
  const text = (data && data.hero_title) || el.textContent.trim();
  el.innerHTML = text.split(' ').map((w, i) =>
    `<span class="word" style="animation-delay:${(i * 0.09 + 0.15).toFixed(2)}s">${escapeHTML(w)}</span>`
  ).join(' ');
}

/* =========================================================
   PORTFOLIO ("Our Work")
   ========================================================= */
function slugify(str = '') {
  return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
function plotCard(item, i) {
  const coord = 'PLOT ' + String.fromCharCode(65 + Math.floor(i / 10)) + (i % 10 + 1);
  const slug = item.slug || slugify(item.title);
  return `
  <a class="plot" href="work-detail.html?slug=${encodeURIComponent(slug)}">
    <span class="plot-coord">${coord} — ${escapeHTML(item.category || '')}</span>
    <img class="plot-img" src="${item.image || 'https://placehold.co/600x450/1C1428/E24FDD?text=Add+image'}" alt="${escapeHTML(item.title || '')}" loading="lazy">
    <h3>${escapeHTML(item.title || 'Untitled project')}</h3>
    <p>${escapeHTML(item.description || '')}</p>
    <span class="plot-tag">View case study →</span>
  </a>`;
}
async function hydrateWork(limit) {
  const grid = document.querySelector('[data-work-grid]');
  if (!grid) return;
  const data = await loadJSON('content/work.json');
  const items = (data && data.items) || [];
  if (!items.length) { grid.innerHTML = `<div class="plot"><p>Portfolio items you add in the admin panel will appear here.</p></div>`; return; }
  const shown = limit ? items.slice(0, limit) : items;
  grid.innerHTML = shown.map(plotCard).join('');
  grid.querySelectorAll('.plot').forEach(el => window.__revealObserver && window.__revealObserver.observe(el));
}

/* =========================================================
   PRICING
   ========================================================= */
function priceCard(pkg) {
  return `
  <div class="price-card ${pkg.highlighted ? 'highlight' : ''}">
    ${pkg.highlighted ? '<span class="price-badge">Most chosen</span>' : ''}
    <span class="price-tagline">${escapeHTML(pkg.tagline || '')}</span>
    <h3>${escapeHTML(pkg.name || '')}</h3>
    <div class="price-amount">${escapeHTML(pkg.price || '')} <span>/ project</span></div>
    <ul>${(pkg.features || []).map(f => `<li>${escapeHTML(f)}</li>`).join('')}</ul>
    <a href="contact.html" class="btn ${pkg.highlighted ? 'btn-primary' : 'btn-outline'}" style="width:100%;justify-content:center;">Start this package</a>
  </div>`;
}
async function hydratePricing() {
  const grid = document.querySelector('[data-pricing-grid]');
  if (!grid) return;
  const data = await loadJSON('content/pricing.json');
  const packages = (data && data.packages) || [];
  if (!packages.length) { grid.innerHTML = '<p>Pricing packages will appear here once added in the admin panel.</p>'; return; }
  grid.innerHTML = packages.map(priceCard).join('');
}

/* =========================================================
   CASE STUDY (work detail page)
   ========================================================= */
async function hydrateWorkDetail() {
  const wrap = document.querySelector('[data-work-detail]');
  if (!wrap) return;
  const params = new URLSearchParams(location.search);
  const slug = params.get('slug');
  const data = await loadJSON('content/work.json');
  const items = (data && data.items) || [];
  const item = items.find(w => (w.slug || slugify(w.title)) === slug);
  if (!item) {
    wrap.innerHTML = '<div class="container"><p>This project could not be found. <a href="work.html">Back to all work</a></p></div>';
    return;
  }
  document.title = item.title + ' — Logovilage Case Study';
  const bodyHTML = (typeof marked !== 'undefined' && item.body) ? marked.parse(item.body) : (item.body ? `<p>${escapeHTML(item.body)}</p>` : '');
  const gallery = (item.gallery || []).map(g => {
    const src = typeof g === 'string' ? g : g.image;
    const caption = typeof g === 'string' ? '' : (g.caption || '');
    return `<figure><img src="${src}" alt="${escapeHTML(item.title)}" loading="lazy">${caption ? `<figcaption>${escapeHTML(caption)}</figcaption>` : ''}</figure>`;
  }).join('');
  wrap.innerHTML = `
    <div class="container page-hero">
      <span class="eyebrow">${escapeHTML(item.category || '')}</span>
      <h1>${escapeHTML(item.title)}</h1>
      <div class="case-meta">
        ${item.client ? `<div><span>Client</span><b>${escapeHTML(item.client)}</b></div>` : ''}
        ${item.year ? `<div><span>Year</span><b>${escapeHTML(item.year)}</b></div>` : ''}
        <div><span>Category</span><b>${escapeHTML(item.category || '')}</b></div>
      </div>
    </div>
    <div class="container case-cover"><img src="${item.image || 'https://placehold.co/1200x675/1C1428/E24FDD?text=Logovilage'}" alt="${escapeHTML(item.title)}"></div>
    <div class="container post-body">${bodyHTML || `<p>${escapeHTML(item.description || '')}</p>`}</div>
    ${gallery ? `<div class="container case-gallery">${gallery}</div>` : ''}
    <div class="container" style="max-width:70ch;margin-top:20px;"><a href="work.html" class="btn btn-outline">← Back to all work</a></div>
  `;
}

/* =========================================================
   BLOG
   ========================================================= */
function blogCard(post) {
  return `
  <a class="blog-card" href="blog-post.html?slug=${encodeURIComponent(post.slug)}">
    <img src="${post.cover || 'https://placehold.co/640x400/1C1428/E24FDD?text=Add+cover'}" alt="${escapeHTML(post.title || '')}" loading="lazy">
    <span class="blog-date">${fmtDate(post.date)}</span>
    <h3>${escapeHTML(post.title || 'Untitled post')}</h3>
    <p>${escapeHTML(post.excerpt || '')}</p>
    <span class="blog-read">Read the story →</span>
  </a>`;
}
async function hydrateBlogList(limit) {
  const grid = document.querySelector('[data-blog-grid]');
  if (!grid) return;
  const data = await loadJSON('content/blogs.json');
  let posts = (data && data.posts) || [];
  posts = posts.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
  if (!posts.length) { grid.innerHTML = '<p>Your blog posts will appear here once published in the admin panel.</p>'; return; }
  const shown = limit ? posts.slice(0, limit) : posts;
  grid.innerHTML = shown.map(blogCard).join('');
}
async function hydrateBlogPost() {
  const wrap = document.querySelector('[data-blog-post]');
  if (!wrap) return;
  const params = new URLSearchParams(location.search);
  const slug = params.get('slug');
  const data = await loadJSON('content/blogs.json');
  const posts = (data && data.posts) || [];
  const post = posts.find(p => p.slug === slug);
  if (!post) {
    wrap.innerHTML = '<div class="container"><p>This post could not be found. <a href="blog.html">Back to all posts</a></p></div>';
    return;
  }
  document.title = post.title + ' — Logovilage Blog';
  const bodyHTML = (typeof marked !== 'undefined') ? marked.parse(post.body || '') : `<p>${escapeHTML(post.body || '')}</p>`;
  wrap.innerHTML = `
    <div class="container page-hero">
      <span class="eyebrow">${fmtDate(post.date)}</span>
      <h1>${escapeHTML(post.title)}</h1>
    </div>
    <div class="container post-hero"><img src="${post.cover || 'https://placehold.co/1200x500/1C1428/E24FDD?text=Logovilage'}" alt="${escapeHTML(post.title)}"></div>
    <div class="container post-body">${bodyHTML}</div>
    <div class="container" style="max-width:70ch;margin-top:50px;"><a href="blog.html" class="btn btn-outline">← Back to all posts</a></div>
  `;
}

/* =========================================================
   CONTACT FORM (Web3Forms) — works on any static host,
   no backend needed. Get a free access key at web3forms.com
   ========================================================= */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  const statusBox = document.getElementById('formStatus');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = 'Sending...';
    btn.disabled = true;
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form)))
      });
      const data = await res.json();
      statusBox.style.display = 'block';
      if (data.success) {
        statusBox.innerHTML = "Thanks — your message is in. We'll reply within one working day.";
        statusBox.style.color = 'var(--gold)';
        form.reset();
      } else {
        statusBox.innerHTML = 'Something went wrong sending that — please email us directly instead.';
        statusBox.style.color = 'var(--stone)';
      }
    } catch (err) {
      statusBox.style.display = 'block';
      statusBox.innerHTML = 'Something went wrong sending that — please email us directly instead.';
      statusBox.style.color = 'var(--stone)';
    }
    btn.textContent = originalText;
    btn.disabled = false;
  });
}

/* =========================================================
   BOOT
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  initAmbient();
  initNavAndReveal();
  initMagnetic();
  initContactForm();
  hydrateSiteText();
  hydrateHeroWords();
  hydrateWork(document.body.dataset.workLimit ? Number(document.body.dataset.workLimit) : undefined);
  hydrateWorkDetail();
  hydratePricing();
  hydrateBlogList(document.body.dataset.blogLimit ? Number(document.body.dataset.blogLimit) : undefined);
  hydrateBlogPost();
});
