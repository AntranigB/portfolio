// Native dialog supplies Escape handling and focus trapping; restore the opener explicitly.
const dialog = document.querySelector('dialog');
let lightboxOpener;
document.querySelectorAll('[data-lightbox]').forEach(link => {
  link.addEventListener('click', event => {
    if (!dialog || typeof dialog.showModal !== 'function') return;
    event.preventDefault();
    lightboxOpener = link;
    dialog.querySelector('img').src = link.href;
    dialog.querySelector('img').alt = link.querySelector('img').alt;
    dialog.showModal();
  });
});
dialog?.querySelector('button').addEventListener('click', () => dialog.close());
dialog?.addEventListener('click', event => {
  if (event.target === dialog) dialog.close();
});
dialog?.addEventListener('close', () => lightboxOpener?.focus());

// Ordinary visitors get immediate autoplay, without hover or a click.
// Sources are deferred until preferences are known, so reduced motion shows posters.
const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
const previews = [...document.querySelectorAll('.card[data-preview] video')];
const heroes = [...document.querySelectorAll('video[data-auto-play]')];
const toggle = document.querySelector('.preview-toggle');
if (toggle) toggle.hidden = false;
// A pause lasts on this page only; reload/navigation starts previews again.
const forceAutoplay = document.body?.dataset.forceAutoplay === 'true';
let userPaused = null;
const pausedByPreference = () => userPaused ?? (!forceAutoplay && motion.matches);
const shouldPause = () => document.hidden || pausedByPreference();

function loadVideo(video) {
  if (!video.hasAttribute('src') && video.dataset.src) video.src = video.dataset.src;
  video.querySelectorAll('source[data-src]').forEach(source => {
    if (!source.hasAttribute('src')) { source.src = source.dataset.src; video.load(); }
  });
}
function startVideo(video) {
  loadVideo(video);
  video.muted = true;
  const attempt = video.play();
  attempt?.catch(() => video.closest('.card')?.classList.remove('preview-playing'));
}
previews.forEach(video => {
  const reveal = () => video.closest('.card').classList.add('preview-playing');
  video.addEventListener('playing', reveal);
  if (!video.paused && video.readyState >= 2) reveal();
  video.addEventListener('error', () => video.closest('.card').classList.remove('preview-playing'));
});
function syncPlayback() {
  previews.forEach(video => {
    if (shouldPause()) video.pause(); else startVideo(video);
  });
  // Never override a visitor's manual choice on a project-page player.
  heroes.forEach(video => {
    if (shouldPause()) video.pause();
    else if (!video.dataset.manualPlayback) startVideo(video);
  });
  if (toggle) {
    toggle.textContent = pausedByPreference() ? 'Play video previews' : 'Pause video previews';
    toggle.setAttribute('aria-pressed', String(!pausedByPreference()));
  }
}
// Native controls must still work when reduced motion disables automatic playback.
heroes.forEach(video => {
  video.addEventListener('pointerdown', () => { video.dataset.manualPlayback = 'true'; loadVideo(video); });
  video.addEventListener('keydown', () => { video.dataset.manualPlayback = 'true'; loadVideo(video); });
});
toggle?.addEventListener('click', () => {
  userPaused = !pausedByPreference();
  syncPlayback();
});
motion.addEventListener('change', syncPlayback);
document.addEventListener('visibilitychange', syncPlayback);
syncPlayback();

// A small obstacle to basic HTML scrapers, not a privacy or access-control feature.
// The payload is decoded only after a visitor activates the native button.
{
  const reveals = [...document.querySelectorAll('.phone-reveal')];
  reveals.forEach(container => {
    const button = container.querySelector('.phone-reveal-button');
    button?.addEventListener('click', () => {
      try {
        const phone = JSON.parse(atob(container.dataset.phone));
        if (typeof phone.display !== 'string' || !/^[+0-9]+$/.test(phone.dial)) return;
        reveals.forEach(other => {
          const link = other.querySelector('.phone-number');
          const control = other.querySelector('.phone-reveal-button');
          if (!link || !control) return;
          link.textContent = phone.display;
          link.href = 'tel:' + phone.dial;
          link.hidden = false;
          control.hidden = true;
        });
        container.querySelector('.phone-number')?.focus();
      } catch { button.textContent = 'Unable to reveal'; }
    });
  });
}

// Manual slide viewer: only the current slide image is loaded; no slideshow timer.
{
  const refresh = () => {
    document.querySelectorAll('[data-presentation-viewer]').forEach(viewer => {
      if (viewer.dataset.ready) return;
      const slides = [...viewer.querySelectorAll('.slide-source')].map(node => node.dataset.src);
      const image = viewer.querySelector('.presentation-slide');
      const enlarge = viewer.querySelector('.slide-enlarge');
      const previous = viewer.querySelector('[data-slide-prev]');
      const next = viewer.querySelector('[data-slide-next]');
      const counter = viewer.querySelector('.slide-counter');
      if (!slides.length || !image || !previous || !next || !counter) return;
      viewer.dataset.ready = 'true';
      let index = 0;
      const show = target => {
        index = Math.max(0, Math.min(slides.length - 1, target));
        image.src = slides[index];
        image.alt = `PechaKucha presentation, slide ${index + 1} of ${slides.length}`;
        if (enlarge) enlarge.href = slides[index];
        counter.textContent = `Slide ${index + 1} of ${slides.length}`;
        previous.disabled = index === 0;
        next.disabled = index === slides.length - 1;
      };
      previous.addEventListener('click', () => show(index - 1));
      next.addEventListener('click', () => show(index + 1));
      viewer.addEventListener('keydown', event => {
        if (event.key === 'ArrowLeft') { event.preventDefault(); show(index - 1); }
        if (event.key === 'ArrowRight') { event.preventDefault(); show(index + 1); }
      });
    });
  };
  window.PortfolioSlides = {refresh};
  refresh();
}
