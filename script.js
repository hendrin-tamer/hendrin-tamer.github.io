const root = document.documentElement;
const $ = id => document.getElementById(id);
const themeBtn = $("themeBtn");
const navLinks = $("navLinks");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(pointer: fine)").matches;
const random = (min, max) => min + Math.random() * (max - min);

// localStorage can be blocked (private mode), so wrap it
function load(key) { try { return localStorage.getItem(key); } catch { return null; } }
function save(key, value) { try { localStorage.setItem(key, value); } catch {} }

// ----- Language (English / Deutsch / العربية / Kurdî) -----
// English comes from the HTML itself; the rest from translations.js
const i18nEls = [...document.querySelectorAll("[data-i18n]")];
const english = Object.fromEntries(i18nEls.map(el => [el.dataset.i18n, el.innerHTML]));
const langBtn = $("langBtn");
const langMenu = $("langMenu");

function setLang(lang) {
  if (lang !== "en" && !translations[lang]) lang = "en";
  const dict = lang === "en" ? english : { ...english, ...translations[lang] };
  i18nEls.forEach(el => { el.innerHTML = dict[el.dataset.i18n]; });
  root.lang = lang;
  root.dir = lang === "ar" ? "rtl" : "ltr";
  $("langLabel").textContent = lang.toUpperCase();
  langMenu.querySelectorAll("button").forEach(b => b.classList.toggle("active", b.dataset.lang === lang));
  save("lang", lang);
}
function toggleLangMenu(open) {
  langMenu.classList.toggle("open", open);
  langBtn.setAttribute("aria-expanded", open);
}
langBtn.addEventListener("click", e => { e.stopPropagation(); toggleLangMenu(!langMenu.classList.contains("open")); });
langMenu.addEventListener("click", e => {
  const btn = e.target.closest("button[data-lang]");
  if (!btn) return;
  setLang(btn.dataset.lang);
  toggleLangMenu(false);
});
document.addEventListener("click", () => toggleLangMenu(false));
setLang(load("lang") || "en");

// ----- Theme (pastel light by default, "midnight castle" dark) -----
function setTheme(theme) {
  root.dataset.theme = theme;
  themeBtn.textContent = theme === "dark" ? "☀️" : "🌙";
  save("theme", theme);
}
themeBtn.addEventListener("click", () => setTheme(root.dataset.theme === "dark" ? "light" : "dark"));
setTheme(load("theme") || "light");

// ----- Mobile menu -----
$("menuBtn").addEventListener("click", () => navLinks.classList.toggle("open"));
navLinks.querySelectorAll("a").forEach(a => a.addEventListener("click", () => navLinks.classList.remove("open")));

// ----- Typewriters: "Hello, World!" terminal + neon job titles -----
function typeOnce(el, text, speed, done) {
  let i = 0;
  (function step() {
    el.textContent = text.slice(0, ++i);
    if (i < text.length) setTimeout(step, speed); else if (done) done();
  })();
}
const roles = ["Full-Stack Developer", "Creative Coder", "UI/UX Dreamer", "Software Tester", "Laravel & React Wizard"];
const typed = $("typed");
let roleIndex = 0, charIndex = roles[0].length, deleting = true;
function typeRoles() {
  typed.textContent = roles[roleIndex].slice(0, charIndex);
  if (deleting) {
    charIndex--;
    if (charIndex === 0) { deleting = false; roleIndex = (roleIndex + 1) % roles.length; }
  } else {
    charIndex++;
    if (charIndex > roles[roleIndex].length) { deleting = true; setTimeout(typeRoles, 1800); return; }
  }
  setTimeout(typeRoles, deleting ? 40 : 85);
}
if (reduceMotion) {
  $("helloText").textContent = '"Hello, World! ✨"';
} else {
  setTimeout(() => typeOnce($("helloText"), '"Hello, World! ✨"', 90), 600);
  setTimeout(typeRoles, 3000);
}

// ----- Floating sparkles, stars and code brackets in the background -----
if (!reduceMotion) {
  const symbols = ["✦", "✧", "★", "♡", "{ }", "</>", "✨", "⋆", "( )", "♛"];
  const colors = ["#e8679a", "#f6c5d4", "#d4bef2", "#8c7bdf", "#f2c879"];
  const count = innerWidth < 600 ? 14 : 28;
  const box = $("floaties");
  for (let i = 0; i < count; i++) {
    const f = document.createElement("span");
    f.className = "floaty";
    f.textContent = symbols[i % symbols.length];
    f.style.setProperty("--x", `${random(0, 100)}%`);
    f.style.setProperty("--s", `${random(12, 26)}px`);
    f.style.setProperty("--c", colors[i % colors.length]);
    f.style.setProperty("--d", `${random(14, 30)}s`);
    f.style.setProperty("--delay", `${random(-30, 0)}s`);
    f.style.setProperty("--drift", `${random(-80, 80)}px`);
    box.appendChild(f);
  }
}

// ----- Glitter trail following the cursor (desktop only) -----
if (finePointer && !reduceMotion) {
  const colors = ["#e8679a", "#f6c5d4", "#d4bef2", "#8c7bdf", "#f2c879", "#ffffff"];
  let last = 0;
  addEventListener("mousemove", e => {
    const now = performance.now();
    if (now - last < 28) return;
    last = now;
    const g = document.createElement("span");
    g.className = "glitter";
    g.style.left = `${e.clientX}px`;
    g.style.top = `${e.clientY}px`;
    g.style.setProperty("--size", `${random(6, 14)}px`);
    g.style.setProperty("--c", colors[Math.floor(Math.random() * colors.length)]);
    g.style.setProperty("--dx", `${random(-30, 30)}px`);
    g.style.setProperty("--dy", `${random(10, 45)}px`);
    document.body.appendChild(g);
    g.addEventListener("animationend", () => g.remove());
  }, { passive: true });

  // 3D tilt on the profile photo
  const visual = $("heroVisual");
  const tilt = $("photoTilt");
  visual.addEventListener("mousemove", e => {
    const r = visual.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    tilt.style.transform = `rotateY(${x * 18}deg) rotateX(${-y * 18}deg) scale(1.03)`;
  });
  visual.addEventListener("mouseleave", () => { tilt.style.transform = ""; });
}

// ----- Project boxes: tap to open on touch screens -----
document.querySelectorAll(".box").forEach(box => {
  box.addEventListener("click", () => { if (!finePointer) box.classList.toggle("open"); });
  box.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); box.classList.toggle("open"); } });
});

// ----- Scroll reveal + count-up numbers -----
function countUp(el) {
  const target = +el.dataset.count;
  const start = performance.now();
  (function step(now) {
    const p = Math.min((now - start) / 1400, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(step);
  })(start);
}
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("visible");
    entry.target.querySelectorAll("[data-count]").forEach(countUp);
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 90}ms`;
  // remove the stagger once shown, so hover effects react instantly
  el.addEventListener("transitionend", () => { el.style.transitionDelay = ""; }, { once: true });
  revealObserver.observe(el);
});

// ----- Navbar state, progress bar, back-to-top, active link -----
const sections = [...document.querySelectorAll("main section[id]")];
function onScroll() {
  const y = scrollY;
  const max = document.body.scrollHeight - innerHeight;
  $("progress").style.width = `${max > 0 ? (y / max) * 100 : 0}%`;
  $("nav").classList.toggle("scrolled", y > 20);
  $("toTop").classList.toggle("show", y > 600);
  const current = sections.filter(s => s.offsetTop - 120 <= y).pop();
  navLinks.querySelectorAll("a").forEach(a => a.classList.toggle("active", current && a.hash === `#${current.id}`));
}
addEventListener("scroll", onScroll, { passive: true });
onScroll();

// ----- "Send a Wish" form: opens the visitor's email app, no server needed -----
$("wishForm").addEventListener("submit", e => {
  e.preventDefault();
  const form = e.currentTarget;
  const { name, email, message } = Object.fromEntries(new FormData(form));
  const subject = `✨ A wish from ${name}`;
  const body = `${message}\n\n— ${name} (${email})`;
  const toast = $("toast");
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
  location.href = `mailto:${form.dataset.to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

$("year").textContent = new Date().getFullYear();
