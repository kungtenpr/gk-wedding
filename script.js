// ===== Config =====
const CONFIG = {
  eventStart: '2027-03-20T07:09:00+07:00',
  eventEnd: '2027-03-20T14:00:00+07:00',
  title: 'งานมงคลสมรส วรวี & ปวรรุศ (#GKWEDDING)',
  location: 'หอประชุมสัตตบงกช โรงเรียนอนุบาลไพศาลี',
  // Set to a Google Apps Script Web App URL to collect RSVPs in Google Sheets.
  rsvpEndpoint: '',
  // Background music: drop an mp3 at this path. If the file is missing, the music button stays hidden.
  music: 'audio/bgm.mp3',
  musicVolume: 0.25,
  photos: Array.from({ length: 8 }, (_, i) => `images/photo-${String(i + 1).padStart(2, '0')}.jpg`),
};

// ===== Background music =====
const bgm = document.getElementById('bgm');
const musicBtn = document.getElementById('musicBtn');
let fadeTimer = null;
let userPaused = false;
function fadeTo(target, ms, done) {
  clearInterval(fadeTimer);
  const start = bgm.volume, steps = 30, dt = ms / steps;
  let i = 0;
  fadeTimer = setInterval(() => {
    i++;
    bgm.volume = Math.min(1, Math.max(0, start + (target - start) * (i / steps)));
    if (i >= steps) { clearInterval(fadeTimer); done && done(); }
  }, dt);
}
function setPlayingUI(on) {
  musicBtn.classList.toggle('playing', on);
  musicBtn.setAttribute('aria-pressed', String(on));
}
async function playMusic() {
  if (!CONFIG.music) return;
  if (!bgm.src) bgm.src = CONFIG.music;
  bgm.volume = 0;
  try {
    await bgm.play();
    musicBtn.hidden = false;
    setPlayingUI(true);
    fadeTo(CONFIG.musicVolume, 2500);
  } catch (_) {
    // Missing file → keep the button hidden. Autoplay blocked → show it so the guest can start it.
    if (bgm.error) return;
    musicBtn.hidden = false;
    setPlayingUI(false);
  }
}
function pauseMusic() { fadeTo(0, 600, () => bgm.pause()); setPlayingUI(false); }
bgm.addEventListener('error', () => { musicBtn.hidden = true; });
musicBtn.addEventListener('click', () => {
  if (bgm.paused || musicBtn.getAttribute('aria-pressed') === 'false') { userPaused = false; playMusic(); }
  else { userPaused = true; pauseMusic(); }
});
// Pause when the guest leaves the tab / locks the phone; resume when they come back.
document.addEventListener('visibilitychange', () => {
  if (!bgm.src || userPaused) return;
  if (document.hidden) { if (!bgm.paused) pauseMusic(); }
  else if (bgm.paused) playMusic();
});

// ===== Envelope =====
const envelope = document.getElementById('envelope');
document.getElementById('openBtn').addEventListener('click', () => {
  playMusic(); // started inside the tap, so mobile browsers allow it
  envelope.classList.add('open');
  document.body.classList.remove('locked');
  setTimeout(() => envelope.remove(), 1600);
});

// ===== Countdown =====
const target = new Date(CONFIG.eventStart).getTime();
const cd = Object.fromEntries([...document.querySelectorAll('#countdown b')].map(b => [b.dataset.u, b]));
function tick() {
  let s = Math.max(0, Math.floor((target - Date.now()) / 1000));
  const d = Math.floor(s / 86400); s %= 86400;
  const h = Math.floor(s / 3600); s %= 3600;
  const m = Math.floor(s / 60); s %= 60;
  cd.d.textContent = d; cd.h.textContent = String(h).padStart(2, '0');
  cd.m.textContent = String(m).padStart(2, '0'); cd.s.textContent = String(s).padStart(2, '0');
}
tick(); setInterval(tick, 1000);

// ===== Calendar links =====
const fmt = iso => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
document.getElementById('gcalBtn').href =
  'https://calendar.google.com/calendar/render?action=TEMPLATE' +
  `&text=${encodeURIComponent(CONFIG.title)}` +
  `&dates=${fmt(CONFIG.eventStart)}/${fmt(CONFIG.eventEnd)}` +
  `&location=${encodeURIComponent(CONFIG.location)}`;
const ics = [
  'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//GK Wedding//TH', 'BEGIN:VEVENT',
  `UID:gk-wedding-20270320@invite`, `DTSTAMP:${fmt(new Date().toISOString())}`,
  `DTSTART:${fmt(CONFIG.eventStart)}`, `DTEND:${fmt(CONFIG.eventEnd)}`,
  `SUMMARY:${CONFIG.title}`, `LOCATION:${CONFIG.location}`,
  'END:VEVENT', 'END:VCALENDAR',
].join('\r\n');
document.getElementById('icsBtn').href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));

// ===== Gallery carousel + lightbox =====
const grid = document.getElementById('grid');
const dotsEl = document.getElementById('carDots');
const countEl = document.getElementById('carCount');
const prevBtn = document.querySelector('.car-btn.prev');
const nextBtn = document.querySelector('.car-btn.next');
const slides = CONFIG.photos.map((src, i) => {
  const f = document.createElement('figure');
  f.innerHTML = `<img src="${src}" alt="รูปที่ ${i + 1}" loading="lazy" draggable="false">`;
  f.addEventListener('click', () => openLb(i));
  grid.appendChild(f);
  const d = document.createElement('button');
  d.type = 'button'; d.setAttribute('aria-label', `ไปที่รูปที่ ${i + 1}`);
  d.addEventListener('click', () => goTo(i));
  dotsEl.appendChild(d);
  return f;
});
const dots = [...dotsEl.children];
const centered = () => getComputedStyle(slides[0]).scrollSnapAlign.includes('center');
function goTo(i) {
  const f = slides[Math.max(0, Math.min(i, slides.length - 1))];
  const left = centered() ? f.offsetLeft - (grid.clientWidth - f.offsetWidth) / 2 : f.offsetLeft;
  grid.scrollTo({ left, behavior: 'smooth' });
}
function currentIndex() {
  const ref = centered() ? grid.scrollLeft + grid.clientWidth / 2 : grid.scrollLeft;
  let best = 0, bestD = Infinity;
  slides.forEach((f, i) => {
    const p = centered() ? f.offsetLeft + f.offsetWidth / 2 : f.offsetLeft;
    const d = Math.abs(p - ref); if (d < bestD) { bestD = d; best = i; }
  });
  return best;
}
function updateCarousel() {
  const i = currentIndex();
  // Desktop shows several slides at once: highlight the whole visible range.
  const per = centered() ? 1 : Math.max(1, Math.round(grid.clientWidth / (slides[0].offsetWidth + 18)));
  const last = Math.min(i + per, slides.length) - 1;
  dots.forEach((d, j) => d.classList.toggle('on', j >= i && j <= last));
  countEl.textContent = `${last > i ? `${i + 1}–${last + 1}` : i + 1} / ${slides.length}`;
  prevBtn.disabled = grid.scrollLeft <= 2;
  nextBtn.disabled = grid.scrollLeft >= grid.scrollWidth - grid.clientWidth - 2;
}
grid.addEventListener('scroll', () => requestAnimationFrame(updateCarousel), { passive: true });
window.addEventListener('resize', updateCarousel);
prevBtn.addEventListener('click', () => goTo(currentIndex() - 1));
nextBtn.addEventListener('click', () => goTo(currentIndex() + 1));
grid.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') { e.preventDefault(); goTo(currentIndex() + 1); }
  if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(currentIndex() - 1); }
});
updateCarousel();

const lb = document.getElementById('lightbox');
const lbImg = lb.querySelector('img');
let lbIdx = 0;
function openLb(i) { lbIdx = i; goTo(i); lbImg.src = CONFIG.photos[i]; lb.hidden = false; document.body.style.overflow = 'hidden'; }
function closeLb() { lb.hidden = true; document.body.style.overflow = ''; }
function step(n) { openLb((lbIdx + n + CONFIG.photos.length) % CONFIG.photos.length); }
lb.querySelector('.lb-close').onclick = closeLb;
lb.querySelector('.prev').onclick = e => { e.stopPropagation(); step(-1); };
lb.querySelector('.next').onclick = e => { e.stopPropagation(); step(1); };
lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
document.addEventListener('keydown', e => {
  if (lb.hidden) return;
  if (e.key === 'Escape') closeLb();
  if (e.key === 'ArrowRight') step(1);
  if (e.key === 'ArrowLeft') step(-1);
});
let tx = null;
lb.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
lb.addEventListener('touchend', e => {
  if (tx === null) return;
  const dx = e.changedTouches[0].clientX - tx;
  if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
  tx = null;
});

// ===== Reveal on scroll =====
const io = new IntersectionObserver(entries => {
  entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// ===== Dock nav =====
const dock = document.querySelector('.dock');
const links = [...dock.querySelectorAll('a')];
const secs = links.map(a => document.querySelector(a.getAttribute('href')));
window.addEventListener('scroll', () => {
  dock.classList.toggle('show', window.scrollY > window.innerHeight * 0.6);
  const y = window.scrollY + window.innerHeight * 0.4;
  let cur = 0;
  secs.forEach((s, i) => { if (s && s.offsetTop <= y) cur = i; });
  links.forEach((a, i) => a.classList.toggle('active', i === cur));
}, { passive: true });

// ===== RSVP =====
const form = document.getElementById('rsvpForm');
const msg = document.getElementById('formMsg');
const guestsField = document.getElementById('guestsField');
form.addEventListener('change', e => {
  if (e.target.name === 'attend') guestsField.classList.toggle('disabled', e.target.value === 'no');
});
form.addEventListener('submit', async e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  if (!data.name?.trim() || !data.side || !data.attend) {
    msg.className = 'form-msg err';
    msg.textContent = 'กรุณากรอกชื่อ และเลือกคำตอบให้ครบ';
    return;
  }
  if (data.attend === 'no') data.guests = 0;
  data.submittedAt = new Date().toISOString();
  const btn = form.querySelector('button[type=submit]');
  btn.disabled = true; btn.textContent = 'กำลังส่ง…';
  try {
    if (CONFIG.rsvpEndpoint) {
      await fetch(CONFIG.rsvpEndpoint, { method: 'POST', mode: 'no-cors', body: JSON.stringify(data) });
    } else {
      // Local preview: keep responses in this browser only.
      try {
        const list = JSON.parse(localStorage.getItem('rsvp') || '[]');
        list.push(data); localStorage.setItem('rsvp', JSON.stringify(list));
      } catch (_) { /* storage unavailable */ }
    }
    msg.className = 'form-msg';
    msg.textContent = data.attend === 'yes'
      ? `ขอบคุณค่ะ คุณ${data.name} แล้วพบกันในวันงาน ♡`
      : `ขอบคุณสำหรับคำตอบ คุณ${data.name} ♡`;
    form.reset(); guestsField.classList.remove('disabled');
  } catch (err) {
    msg.className = 'form-msg err';
    msg.textContent = 'ส่งไม่สำเร็จ กรุณาลองใหม่อีกครั้ง';
  } finally {
    btn.disabled = false; btn.textContent = 'ส่งคำตอบ';
  }
});

// ===== Copy account =====
document.getElementById('copyBtn').addEventListener('click', async e => {
  const t = document.getElementById('acctNo').textContent.trim();
  try { await navigator.clipboard.writeText(t); e.target.textContent = 'คัดลอกแล้ว'; }
  catch { e.target.textContent = 'คัดลอกไม่ได้'; }
  setTimeout(() => { e.target.textContent = 'คัดลอก'; }, 1800);
});
