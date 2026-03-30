// ═══════════════════════════════════════
//  ADYAR GARDEN — main.js
// ═══════════════════════════════════════

/* ── Navbar scroll effect ── */
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  });
}

/* ── Hamburger menu ── */
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
  // Close on link click
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

/* ── Scroll Reveal ── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.scroll-reveal').forEach(el => revealObserver.observe(el));

/* ── Animated counters ── */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  if (!target) return;
  const duration = 1800;
  const start = performance.now();
  const tick = (now) => {
    const t = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.floor(ease * target);
    if (t < 1) requestAnimationFrame(tick);
    else el.textContent = target;
  };
  requestAnimationFrame(tick);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.stat-num[data-target]').forEach(animateCounter);
      counterObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });

const statsBar = document.querySelector('.stats-bar');
if (statsBar) counterObserver.observe(statsBar);

/* ── Gallery filter ── */
function filterGallery(category) {
  const items = document.querySelectorAll('.gallery-item');
  const buttons = document.querySelectorAll('.filter-btn');

  buttons.forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');

  items.forEach(item => {
    const show = category === 'all' || item.dataset.category === category;
    item.style.display = show ? 'block' : 'none';
    if (show) {
      item.style.animation = 'none';
      item.offsetHeight; // reflow
      item.style.animation = 'fadeIn .4s ease forwards';
    }
  });
}
window.filterGallery = filterGallery;

/* ── Gallery lightbox ── */
const lightbox = document.querySelector('.lightbox');
const lightboxImg = document.querySelector('.lightbox img');
const lightboxClose = document.querySelector('.lightbox-close');

if (lightbox && lightboxImg) {
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const src = item.querySelector('img')?.src;
      if (src) {
        lightboxImg.src = src;
        lightbox.classList.add('active');
      }
    });
  });
  lightboxClose?.addEventListener('click', () => lightbox.classList.remove('active'));
  lightbox.addEventListener('click', e => { if (e.target === lightbox) lightbox.classList.remove('active'); });
}

/* ── Smooth scroll for anchor links ── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

/* ── Gallery fade-in keyframe ── */
const style = document.createElement('style');
style.textContent = `@keyframes fadeIn { from { opacity:0; transform:scale(.97); } to { opacity:1; transform:scale(1); } }`;
document.head.appendChild(style);
