/* =====================================================================
   Happy Rakhi — motion
   GSAP + ScrollTrigger only. Native scrolling (safest on mobile).
   ===================================================================== */

/* =====================================================================
   ▼▼▼  EDIT THIS BLOCK — this is the only place you need to touch  ▼▼▼
   ===================================================================== */
const CONFIG = {
  name:     "Didi",          // her name (or "Didi")
  from:     "Me",            // your name
  occasion: "to the one who has had my back since before either of us had a choice",
  date:     "",              // "" = today's date, or write your own

  // The teasing bubbles while the envelope dodges. The last one always opens it.
  dodges: [
    "nope. not yet.",
    "you were always this impatient.",
    "okay okay okay — just open it."
  ]
};
/* =====================================================================
   ▲▲▲  END EDIT  ▲▲▲
   ===================================================================== */

gsap.registerPlugin(ScrollTrigger);

const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

/* ---------------------------------------------------------------------
   content fill
   ------------------------------------------------------------------- */
function fillContent() {
  const now = new Date();
  const date = CONFIG.date || now.toLocaleDateString(undefined, {
    day: "numeric", month: "long", year: "numeric"
  });
  const map = {
    name: CONFIG.name, from: CONFIG.from, occasion: CONFIG.occasion,
    date, year: String(now.getFullYear())
  };
  $$("[data-fill]").forEach(el => {
    const v = map[el.dataset.fill];
    if (v) el.textContent = v;
  });
}

/* ---------------------------------------------------------------------
   preloader — a thread winding into a ring
   ------------------------------------------------------------------- */
function runLoader() {
  const loader = $("#loader");
  const count  = $("#loaderCount");
  const ring   = $("#loaderRing");

  if (REDUCED) {
    clearTimeout(window.__failsafe);
    loader.remove();
    document.body.classList.remove("is-locked");
    intro();
    return;
  }

  document.body.classList.add("is-locked");

  const len = ring.getTotalLength();
  gsap.set(ring, { strokeDasharray: len, strokeDashoffset: len });

  const state = { v: 0 };

  gsap.timeline()
    .to(state, {
      v: 100, duration: 1.5, ease: "power2.inOut",
      onUpdate() {
        const n = Math.round(state.v);
        count.textContent = n;
        gsap.set(ring, { strokeDashoffset: len * (1 - n / 100) });
      }
    })
    .to(".loader__inner, .loader__spin", { opacity: 0, y: -14, duration: .5, ease: "power2.in" }, "+=0.1")
    .to(loader, {
      yPercent: -100, duration: 1, ease: "expo.inOut",
      onComplete() {
        clearTimeout(window.__failsafe);
        loader.remove();
        document.body.classList.remove("is-locked");
        ScrollTrigger.refresh();
      }
    }, "-=0.15")
    .add(intro, "-=0.55");
}

/* ---------------------------------------------------------------------
   hero — the rakhi drops in and swings from the garland
   ------------------------------------------------------------------- */
function intro() {
  gsap.timeline({ defaults: { ease: "expo.out" } })
    .from("#hero .giant .w", { yPercent: 118, duration: 1.25, stagger: .09 })
    .to("#hero .over", { opacity: 1, y: 0, duration: .9 }, .2)
    .to("#hero .lede", { opacity: 1, y: 0, duration: .9 }, .45)
    .from("#hang", { y: -220, opacity: 0, duration: 1.5, ease: "expo.out" }, .35)
    .from(".hint", { opacity: 0, duration: .8 }, 1.1);

  if (!REDUCED) {
    // gentle pendulum, hinged where the thread meets the garland
    gsap.fromTo("#hang",
      { rotation: -3.5, transformOrigin: "50% 0" },
      { rotation: 3.5, duration: 2.6, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 1.6 });
  }

  // drifts up and away as you leave the hero
  gsap.to("#hang", {
    y: 90, ease: "none",
    scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true }
  });

  gsap.to(".hint i", {
    scaleX: .3, duration: 1.1, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 2.2
  });
}

/* ---------------------------------------------------------------------
   generic scroll reveals
   ------------------------------------------------------------------- */
function reveals() {
  $$(".reveal-up").forEach(el => {
    if (el.closest("#hero")) return;                 // hero is handled by intro()
    gsap.to(el, {
      opacity: 1, y: 0, duration: 1, ease: "expo.out",
      scrollTrigger: { trigger: el, start: "top 88%" }
    });
  });

  $$(".lines").forEach(h => {
    gsap.from(h.querySelectorAll(".w"), {
      yPercent: 118, duration: 1.15, ease: "expo.out", stagger: .1,
      scrollTrigger: { trigger: h, start: "top 78%" }
    });
  });
}

/* ---------------------------------------------------------------------
   the distance — a native sideways carousel.
   Swipe on a phone; on desktop the wheel walks it one panel at a time
   until it runs out, then hands the gesture back to the page.
   ------------------------------------------------------------------- */
function horizontalGap() {
  const sc     = $("#hscroll");
  const bar    = $("#hbarFill");
  const hint   = $("#swipeHint");
  const prev   = $("#hPrev");
  const next   = $("#hNext");
  const months = $$("#months span");
  if (!sc) return;

  const maxScroll = () => Math.max(1, sc.scrollWidth - sc.clientWidth);

  function update() {
    const p = sc.scrollLeft / maxScroll();
    bar.style.width = (p * 100).toFixed(1) + "%";
    const lit = Math.round(p * months.length);
    months.forEach((m, i) => m.classList.toggle("lit", i < lit));
    prev.disabled = sc.scrollLeft <= 2;
    next.disabled = sc.scrollLeft >= maxScroll() - 2;
    if (sc.scrollLeft > 40) hint.classList.add("is-gone");
  }
  sc.addEventListener("scroll", update, { passive: true });
  update();

  const go = dir => sc.scrollBy({ left: dir * sc.clientWidth, behavior: "smooth" });
  prev.addEventListener("click", () => go(-1));
  next.addEventListener("click", () => go(1));

  // desktop wheel: one tick = one panel, released at the edges so the
  // page's own section snap takes over
  let lock = false;
  sc.addEventListener("wheel", e => {
    const fwd = e.deltaY > 0;
    const atEdge = fwd ? sc.scrollLeft >= maxScroll() - 2 : sc.scrollLeft <= 2;
    if (atEdge || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
    e.preventDefault();
    if (lock) return;
    lock = true;
    setTimeout(() => { lock = false; }, 480);
    go(fwd ? 1 : -1);
  }, { passive: false });

  return go;   // keyboard navigation reuses this
}

/* ---------------------------------------------------------------------
   keyboard — arrows move one beat (or one panel, inside the carousel)
   ------------------------------------------------------------------- */
function keys(goPanel) {
  const gap = $("#gap");

  const gapInView = () => {
    const r = gap.getBoundingClientRect();
    return r.top > -innerHeight * .4 && r.top < innerHeight * .4;
  };

  window.addEventListener("keydown", e => {
    if (e.target.closest("input,textarea")) return;

    if (e.key === "ArrowRight" && gapInView()) { e.preventDefault(); goPanel(1); return; }
    if (e.key === "ArrowLeft"  && gapInView()) { e.preventDefault(); goPanel(-1); return; }

    const dir = (e.key === "ArrowDown" || e.key === "PageDown") ? 1
              : (e.key === "ArrowUp"   || e.key === "PageUp")   ? -1 : 0;
    if (!dir) return;
    e.preventDefault();

    const secs = $$("main > .sec:not([hidden])");
    const cur = secs.reduce((best, s) =>
      Math.abs(s.getBoundingClientRect().top) < Math.abs(best.getBoundingClientRect().top) ? s : best);
    const target = secs[secs.indexOf(cur) + dir];
    if (target) target.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "start" });
  });
}

/* ---------------------------------------------------------------------
   chips
   ------------------------------------------------------------------- */
function chips() {
  const reply = $("#chipReply");
  $$(".chip").forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".chip").forEach(b => b.classList.remove("is-picked"));
      btn.classList.add("is-picked");
      gsap.fromTo(btn, { scale: .94 }, { scale: 1, duration: .5, ease: "back.out(3)" });
      reply.textContent = btn.dataset.reply;
      gsap.fromTo(reply, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .7, ease: "expo.out" });
    });
  });
}

/* ---------------------------------------------------------------------
   happy rakhi
   ------------------------------------------------------------------- */
function celebrate() {
  const sec = $("#rakhiSec");

  gsap.from("#mega span", {
    yPercent: 130, opacity: 0, rotate: 6,
    duration: 1.15, ease: "expo.out", stagger: .045,
    scrollTrigger: { trigger: sec, start: "top 62%" }
  });

  gsap.fromTo(".glow", { scale: .35, opacity: 0 }, {
    scale: 1, opacity: 1, duration: 2, ease: "expo.out",
    scrollTrigger: { trigger: sec, start: "top 65%" }
  });

  const row = $("#marqueeRow");
  row.innerHTML = Array.from({ length: 8 }, () => "<span>happy rakhi ·</span>").join("");
  gsap.to(row, { xPercent: -50, duration: 26, ease: "none", repeat: -1 });
}

/* ---------------------------------------------------------------------
   THE ENVELOPE — dodge, tease, then open
   ------------------------------------------------------------------- */
function envelope() {
  const stage   = $("#stage");
  const env     = $("#env");
  const flap    = $("#envFlap");
  const seal    = $("#envSeal");
  const letter  = $("#envLetter");
  const rakhi   = $("#envRakhi");
  const bubbles = $("#bubbles");
  const me      = $("#me");
  const giveup  = $("#giveup");
  const hint    = $("#envHint");

  let dodges = 0, opened = false, busy = false;

  gsap.set(rakhi, { scale: .82, y: 0 });

  const idle = gsap.to(env, {
    y: "+=8", rotation: 1.2, duration: 2.6,
    ease: "sine.inOut", repeat: -1, yoyo: true
  });

  // the circle is a character, not a sticker: it bobs while it waits…
  // (idle owns y; chase owns x/rotation/scaleX/scaleY — no overwrite fights)
  if (!REDUCED) {
    gsap.to(me, { y: -7, duration: 1.7, repeat: -1, yoyo: true, ease: "sine.inOut" });
  }

  /* …and lunges after the envelope whenever it bolts */
  function chase(dir) {
    gsap.timeline()
      .to(me, { x: dir * 26, rotation: dir * 14, scaleX: 1.18, scaleY: .85,
                duration: .3, ease: "power2.out", overwrite: "auto" })
      .to(me, { x: 0, rotation: 0, scaleX: 1, scaleY: 1,
                duration: .9, ease: "elastic.out(1,.45)" });
  }

  /* a message, stacked in its own reserved row — never covered */
  function bubble(text, hot) {
    const b = document.createElement("div");
    b.className = "bubble" + (hot ? " bubble--gold" : "");
    b.textContent = text;
    bubbles.appendChild(b);

    // keep the stack short so it always fits the row
    while (bubbles.children.length > 2) bubbles.firstElementChild.remove();

    gsap.fromTo(b,
      { opacity: 0, scale: .8, x: -14 },
      { opacity: 1, scale: 1, x: 0, duration: .5, ease: "back.out(2.4)" });

    gsap.to(b, {
      opacity: 0, x: -10, duration: .5, delay: 4.2, ease: "power2.in",
      onComplete: () => b.remove()
    });
  }

  /* dodge — the stage is full-bleed, so it has real room to run */
  function dodge() {
    const sr = stage.getBoundingClientRect();
    const er = env.getBoundingClientRect();
    const maxX = Math.max(24, (sr.width  - er.width)  / 2 - 12);
    const maxY = Math.max(18, (sr.height - er.height) / 2 - 12);

    const cur = gsap.getProperty(env, "x");
    const dir = cur >= 0 ? -1 : 1;                     // always bolts to the far side

    gsap.to(env, {
      x: dir * gsap.utils.random(maxX * .74, maxX),     // commit to the distance
      y: gsap.utils.random(-maxY, maxY) * .8,
      rotation: gsap.utils.random(-15, 15),
      duration: .85, ease: "elastic.out(1, 0.5)", overwrite: "auto"
    });
    chase(dir);                                         // the circle goes after it
  }

  /* the payoff */
  function open() {
    opened = true;
    idle.kill();
    env.classList.add("is-open");
    env.setAttribute("aria-expanded", "true");
    giveup.hidden = true;
    hint.textContent = "…finally.";

    gsap.timeline({ defaults: { ease: "expo.out" }, onComplete: revealLetter })
      .to(env,    { x: 0, y: 0, rotation: 0, scale: 1.04, duration: .9 })
      .to(seal,   { scale: 1.16, duration: .18, ease: "power2.out" }, "-=0.15")
      .to(seal,   { scale: .55, rotation: 26, opacity: 0, duration: .5, ease: "power2.in" })
      .to(flap,   { rotateX: -168, duration: 1.15, ease: "power3.inOut" }, "-=0.15")
      .set(flap,  { zIndex: 1 }, "-=0.62")
      .to(letter, { y: "-38%", duration: 1.1 }, "-=0.5")
      .to(rakhi,  { opacity: 1, y: "-58%", x: "-18%", rotate: -13, scale: 1, duration: 1.15 }, "-=0.85")
      .to(letter, { scale: 1.02, duration: .5 }, "-=0.3");
  }

  function revealLetter() {
    const letterSec = $("#letterSec");
    $("#outro").hidden = false;
    letterSec.hidden = false;

    gsap.fromTo("#paper",
      { opacity: 0, y: 60, rotateX: 8, scale: .96 },
      { opacity: 1, y: 0, rotateX: 0, scale: 1, duration: 1.4, ease: "expo.out" });
    gsap.fromTo(".paper__rakhi",
      { opacity: 0, scale: .7, rotate: 40 },
      { opacity: 1, scale: 1, rotate: 13, duration: 1.2, ease: "back.out(1.6)", delay: .35 });
    gsap.fromTo("#paperBody p",
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: .9, stagger: .28, ease: "expo.out", delay: .5 });
    gsap.fromTo(".paper__sign", { opacity: 0 }, { opacity: 1, duration: 1, delay: 1.6 });

    ScrollTrigger.refresh();
    setTimeout(() => {
      letterSec.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "start" });
    }, 450);
  }

  function poke() {
    if (opened || busy) return;

    if (dodges < CONFIG.dodges.length) {
      busy = true;
      bubble(CONFIG.dodges[dodges], dodges === CONFIG.dodges.length - 1);
      dodge();
      dodges++;
      if (dodges >= 2) giveup.hidden = false;
      setTimeout(() => { busy = false; }, 430);   // a fast double-tap shouldn't burn two
      return;
    }
    open();
  }

  env.addEventListener("click", poke);
  giveup.addEventListener("click", () => { if (!opened) open(); });
  env.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); poke(); }
  });

  window.addEventListener("resize", () => {
    if (!opened) gsap.to(env, { x: 0, y: 0, rotation: 0, duration: .4 });
  });
}

/* ---------------------------------------------------------------------
   progress + replay
   ------------------------------------------------------------------- */
function chrome() {
  gsap.to("#progressBar", {
    width: "100%", ease: "none",
    scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: true }
  });
  $("#replay").addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: REDUCED ? "auto" : "smooth" });
  });
}

/* ---------------------------------------------------------------------
   boot
   ------------------------------------------------------------------- */
fillContent();
reveals();
keys(horizontalGap() || (() => {}));
chips();
celebrate();
envelope();
chrome();
runLoader();

window.addEventListener("load", () => ScrollTrigger.refresh());
