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

  myCity:   "here",          // your city
  herCity:  "there",         // her city
  distance: "a long way",    // e.g. "1,412 km"

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
  const date = CONFIG.date || new Date().toLocaleDateString(undefined, {
    day: "numeric", month: "long", year: "numeric"
  });
  const map = {
    name: CONFIG.name, from: CONFIG.from, occasion: CONFIG.occasion, date,
    myCity: CONFIG.myCity, herCity: CONFIG.herCity, distance: CONFIG.distance
  };
  $$("[data-fill]").forEach(el => {
    const v = map[el.dataset.fill];
    if (v) el.textContent = v;
  });
}

/* ---------------------------------------------------------------------
   preloader — a thread winding onto a spool
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
      v: 100, duration: 1.6, ease: "power2.inOut",
      onUpdate() {
        const n = Math.round(state.v);
        count.textContent = n;
        gsap.set(ring, { strokeDashoffset: len * (1 - n / 100) });
      }
    })
    .to(".loader__inner, .loader__spin", { opacity: 0, y: -14, duration: .5, ease: "power2.in" }, "+=0.15")
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
   hero — the arc between two cities
   ------------------------------------------------------------------- */
function intro() {
  const arc = $("#arcPath");
  const len = arc.getTotalLength();
  gsap.set(arc, { strokeDasharray: len, strokeDashoffset: len });

  gsap.timeline({ defaults: { ease: "expo.out" } })
    .from("#hero .giant .w", { yPercent: 118, duration: 1.3, stagger: .09 })
    .to("#hero .over", { opacity: 1, y: 0, duration: .9 }, .2)
    .to("#hero .lede", { opacity: 1, y: 0, duration: .9 }, .45)
    .to(arc, { strokeDashoffset: 0, duration: 2.2, ease: "power2.inOut" }, .3)
    .from(".city", { opacity: 0, scale: .6, duration: .9, stagger: .16 }, .9)
    .from(".hint", { opacity: 0, duration: .8 }, 1.2);

  gsap.to(".hint i", {
    scaleX: .3, duration: 1.1, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 2.2
  });
}

/* ---------------------------------------------------------------------
   KNOT RAIL — the thread is the navigation
   ------------------------------------------------------------------- */
function rail() {
  const list = $("#railList");
  const fill = $("#railFill");
  const secs = $$("[data-knot]");

  const dots = secs.map((sec, i) => {
    const li = document.createElement("li");
    li.className = "rail__item";

    const btn = document.createElement("button");
    btn.className = "rail__dot";
    btn.type = "button";
    btn.setAttribute("aria-label", sec.dataset.knot);

    const tip = document.createElement("span");
    tip.className = "rail__tip";
    tip.textContent = sec.dataset.knot;

    // locked beats (the letter, the outro) stay unreachable until earned
    if (sec.hidden) { btn.disabled = true; li.dataset.locked = "1"; }

    btn.addEventListener("click", () => {
      if (btn.disabled) return;
      sec.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "start" });
    });

    li.append(btn, tip);
    list.appendChild(li);
    return btn;
  });

  function setActive(i) {
    dots.forEach((d, j) => {
      d.classList.toggle("is-on", j === i);
      d.classList.toggle("is-done", j < i);
    });
  }

  secs.forEach((sec, i) => {
    ScrollTrigger.create({
      trigger: sec, start: "top 55%", end: "bottom 55%",
      onToggle: self => { if (self.isActive) setActive(i); }
    });
  });
  setActive(0);

  gsap.to(fill, {
    height: "100%", ease: "none",
    scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: .5 }
  });

  // called once the letter is unlocked
  return function unlock() {
    secs.forEach((sec, i) => {
      if (!sec.hidden && dots[i].disabled) {
        dots[i].disabled = false;
        delete dots[i].closest(".rail__item").dataset.locked;
      }
    });
  };
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
   the distance — pinned horizontal scroll
   ------------------------------------------------------------------- */
function horizontalGap() {
  const track = $("#htrack");
  const sec   = $("#gap");
  const hbar  = $("#hbarFill");
  if (!track) return;

  const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);

  const st = {
    trigger: sec, start: "top top",
    end: () => "+=" + dist(), scrub: 1, invalidateOnRefresh: true
  };

  gsap.to(track, {
    x: () => -dist(), ease: "none",
    scrollTrigger: {
      trigger: sec, start: "top top",
      end: () => "+=" + (dist() + window.innerHeight * .4),
      pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true
    }
  });

  gsap.to(hbar,          { width: "100%", ease: "none", scrollTrigger: st });
  gsap.to("#months span", { opacity: 1, duration: .5, stagger: .12, ease: "none", scrollTrigger: st });
  gsap.to(".swipe",      { opacity: 0, ease: "none",
    scrollTrigger: { trigger: sec, start: "top top", end: () => "+=" + dist() * .3, scrub: 1 } });
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
function envelope(unlockRail) {
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

  // the circle breathes so it reads as someone waiting
  if (!REDUCED) {
    gsap.to(me, { scale: 1.07, duration: 1.9, repeat: -1, yoyo: true, ease: "sine.inOut" });
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
    gsap.fromTo(me, { scale: 1.16 }, { scale: 1, duration: .6, ease: "elastic.out(1,.5)" });

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
    if (unlockRail) unlockRail();

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
const unlockRail = rail();
reveals();
horizontalGap();
chips();
celebrate();
envelope(unlockRail);
chrome();
runLoader();

window.addEventListener("load", () => ScrollTrigger.refresh());
