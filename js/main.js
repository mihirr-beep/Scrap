/* =====================================================================
   Happy Rakhi — motion
   GSAP + ScrollTrigger only. Native scrolling (safest on mobile).
   ===================================================================== */

/* =====================================================================
   ▼▼▼  EDIT THIS BLOCK — this is the only place you need to touch  ▼▼▼
   ===================================================================== */
const CONFIG = {
  name:     "Didi",   // her name (or "Didi")
  occasion: "to the one who has had my back since before either of us had a choice",
  from:     "Me",     // your name
  date:     "",       // "" = today's date, or write your own

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
  const map = { name: CONFIG.name, occasion: CONFIG.occasion, from: CONFIG.from, date };
  $$("[data-fill]").forEach(el => {
    const v = map[el.dataset.fill];
    if (v) el.textContent = v;
  });
}

/* ---------------------------------------------------------------------
   preloader
   ------------------------------------------------------------------- */
function runLoader() {
  const loader = $("#loader");
  const count  = $("#loaderCount");
  const bar    = $("#loaderBar");

  if (REDUCED) {
    clearTimeout(window.__failsafe);
    loader.remove(); document.body.classList.remove("is-locked"); intro(); return;
  }

  document.body.classList.add("is-locked");
  const state = { v: 0 };

  gsap.timeline()
    .to(state, {
      v: 100, duration: 1.7, ease: "power2.inOut",
      onUpdate() {
        const n = Math.round(state.v);
        count.textContent = n;
        bar.style.width = n + "%";
      }
    })
    .to(".loader__inner, .loader__bar", { opacity: 0, y: -14, duration: .5, ease: "power2.in" }, "+=0.15")
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
   hero intro
   ------------------------------------------------------------------- */
function intro() {
  gsap.timeline({ defaults: { ease: "expo.out" } })
    .from("#hero .hero__title .w", { yPercent: 118, duration: 1.25, stagger: .09 })
    .to("#hero .eyebrow",   { opacity: 1, y: 0, duration: .9 }, .25)
    .to("#hero .hero__sub", { opacity: 1, y: 0, duration: .9 }, .45)
    .from(".scroll-hint", { opacity: 0, duration: .8 }, .7)
    .fromTo(".scroll-hint__line", { scaleX: 0 }, { scaleX: 1, duration: 1.1 }, .75);

  gsap.to(".scroll-hint__line", {
    scaleX: .3, duration: 1.1, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 2
  });
}

/* ---------------------------------------------------------------------
   the rakhi thread, drawn as you scroll
   ------------------------------------------------------------------- */
function thread() {
  const path = $("#threadPath");
  if (!path) return;
  const len = path.getTotalLength();
  gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
  gsap.to(path, {
    strokeDashoffset: 0, ease: "none",
    scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: .6 }
  });
}

/* ---------------------------------------------------------------------
   generic scroll reveals
   ------------------------------------------------------------------- */
function reveals() {
  $$(".reveal-up").forEach(el => {
    if (el.closest("#hero")) return;            // hero is handled by intro()
    gsap.to(el, {
      opacity: 1, y: 0, duration: 1, ease: "expo.out",
      scrollTrigger: { trigger: el, start: "top 88%" }
    });
  });

  $$(".h2--reveal").forEach(h => {
    gsap.from(h.querySelectorAll(".w"), {
      yPercent: 118, duration: 1.15, ease: "expo.out", stagger: .1,
      scrollTrigger: { trigger: h, start: "top 80%" }
    });
  });

  gsap.to(".paper", {
    yPercent: -4, ease: "none",
    scrollTrigger: { trigger: ".sec--letter", start: "top bottom", end: "bottom top", scrub: true }
  });
}

/* ---------------------------------------------------------------------
   the gap — pinned horizontal scroll
   ------------------------------------------------------------------- */
function horizontalGap() {
  const track = $("#htrack");
  const sec   = $("#gap");
  if (!track) return;

  const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);

  gsap.to(track, {
    x: () => -dist(),
    ease: "none",
    scrollTrigger: {
      trigger: sec, start: "top top",
      end: () => "+=" + (dist() + window.innerHeight * .5),
      pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true
    }
  });

  gsap.to("#months span", {
    opacity: 1, color: "#1c1714", duration: .5, stagger: .12, ease: "none",
    scrollTrigger: {
      trigger: sec, start: "top top",
      end: () => "+=" + dist(), scrub: 1, invalidateOnRefresh: true
    }
  });

  $$(".hpanel").forEach((p, i) => {
    gsap.fromTo(p, { y: i % 2 ? 26 : -26 }, {
      y: 0, ease: "none",
      scrollTrigger: {
        trigger: sec, start: "top top",
        end: () => "+=" + dist(), scrub: 1, invalidateOnRefresh: true
      }
    });
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
  const sec = $("#congrats");

  gsap.from("#mega span", {
    yPercent: 130, opacity: 0, rotate: 6,
    duration: 1.15, ease: "expo.out", stagger: .045,
    scrollTrigger: { trigger: sec, start: "top 62%" }
  });

  gsap.fromTo(".burst", { scale: .35, opacity: 0 }, {
    scale: 1, opacity: 1, duration: 2, ease: "expo.out",
    scrollTrigger: { trigger: sec, start: "top 65%" }
  });

  const row = $("#marqueeRow");
  row.innerHTML = Array.from({ length: 8 }, () => "<span>happy rakhi ·</span>").join("");
  gsap.to(row, { xPercent: -50, duration: 26, ease: "none", repeat: -1 });
}

/* ---------------------------------------------------------------------
   the figure — a flat cutout made to feel dimensional
   Swap assets/img/person.webp for a real background-removed photo.
   ------------------------------------------------------------------- */
const Figure = (() => {
  let img, glow, fig, qx, qy, ready = false;

  function init() {
    fig  = $("#figure"); img = $("#figureImg"); glow = $(".figure__glow");
    if (!fig || REDUCED) return;

    qx = gsap.quickTo(img, "x", { duration: .7, ease: "power3" });
    qy = gsap.quickTo(img, "y", { duration: .7, ease: "power3" });

    // breathing, so it never looks like a dead sticker
    gsap.to(img, { scale: 1.03, duration: 3.6, repeat: -1, yoyo: true, ease: "sine.inOut" });
    gsap.fromTo(fig,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1.2, ease: "expo.out",
        scrollTrigger: { trigger: "#envSec", start: "top 55%" } });

    // desktop: follow the pointer
    window.addEventListener("pointermove", e => {
      if (e.pointerType === "touch") return;
      ready = true;                              // stop the idle sway fighting the pointer
      apply((e.clientX / window.innerWidth - .5) * 2, (e.clientY / window.innerHeight - .5) * 2);
    }, { passive: true });

    // gentle idle sway when nothing is driving it
    gsap.to({ t: 0 }, {
      t: Math.PI * 2, duration: 9, repeat: -1, ease: "none",
      onUpdate() {
        if (ready) return;                       // real tilt takes over
        const t = this.targets()[0].t;
        apply(Math.sin(t) * .35, Math.cos(t * .7) * .2);
      }
    });
    ready = false;
  }

  function apply(nx, ny) {
    nx = gsap.utils.clamp(-1, 1, nx);
    ny = gsap.utils.clamp(-1, 1, ny);
    qx(nx * 15); qy(ny * 10);
    gsap.to(glow, { x: nx * -7, y: ny * -5, duration: .9, overwrite: "auto" });
    gsap.to(fig,  { rotationY: nx * 8, rotationX: -ny * 6, duration: .9, overwrite: "auto" });
  }

  /* iOS needs this asked for from inside a real tap */
  function requestTilt() {
    if (REDUCED) return;
    const DOE = window.DeviceOrientationEvent;
    if (!DOE) return;

    const listen = () => {
      window.addEventListener("deviceorientation", e => {
        if (e.gamma == null && e.beta == null) return;
        ready = true;
        apply((e.gamma || 0) / 38, ((e.beta || 0) - 40) / 38);
      }, { passive: true });
    };

    if (typeof DOE.requestPermission === "function") {
      DOE.requestPermission().then(r => { if (r === "granted") listen(); }).catch(() => {});
    } else {
      listen();
    }
  }

  return { init, requestTilt };
})();

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
  const giveup  = $("#giveup");
  const hint    = $("#envHint");

  let dodges = 0, opened = false, busy = false, askedTilt = false;

  gsap.set(rakhi, { scale: .82, y: 0 });

  const idle = gsap.to(env, {
    y: "+=9", rotation: 1.2, duration: 2.6,
    ease: "sine.inOut", repeat: -1, yoyo: true
  });

  /* a bubble, stacked upward beside the figure (CSS handles layout) */
  function bubble(text, gold) {
    const b = document.createElement("div");
    b.className = "bubble" + (gold ? " bubble--gold" : "");
    b.textContent = text;
    bubbles.appendChild(b);

    gsap.fromTo(b,
      { opacity: 0, scale: .7, x: -16 },
      { opacity: 1, scale: 1, x: 0, duration: .55, ease: "back.out(2.2)" });

    gsap.to(b, {
      opacity: 0, x: -12, duration: .55, delay: 3.4, ease: "power2.in",
      onComplete: () => b.remove()
    });
  }

  /* dodge to a fresh spot inside the stage */
  function dodge() {
    const sr = stage.getBoundingClientRect();
    const er = env.getBoundingClientRect();
    const maxX = Math.max(10, (sr.width  - er.width)  / 2 - 10);
    const maxY = Math.max(10, (sr.height - er.height) / 2 - 10);

    const cur = gsap.getProperty(env, "x");
    const dir = cur >= 0 ? -1 : 1;              // always runs to the other side

    gsap.to(env, {
      x: dir * gsap.utils.random(maxX * .45, maxX),
      y: gsap.utils.random(-maxY, maxY) * .55,
      rotation: gsap.utils.random(-13, 13),
      duration: .8, ease: "elastic.out(1, 0.55)", overwrite: "auto"
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
      .to(env,   { x: 0, y: 0, rotation: 0, scale: 1.04, duration: .9 })
      .to(seal,  { scale: 1.16, duration: .18, ease: "power2.out" }, "-=0.15")
      .to(seal,  { scale: .55, rotation: 26, opacity: 0, duration: .5, ease: "power2.in" })
      .to(flap,  { rotateX: -168, duration: 1.15, ease: "power3.inOut" }, "-=0.15")
      .set(flap, { zIndex: 1 }, "-=0.62")
      .to(letter, { y: "-38%", duration: 1.1 }, "-=0.5")
      // the rakhi comes out too, sitting proud of the letter
      .to(rakhi, { opacity: 1, y: "-58%", x: "-18%", rotate: -13, scale: 1, duration: 1.15 }, "-=0.85")
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
    if (!askedTilt) { askedTilt = true; Figure.requestTilt(); }   // must ride a real tap
    if (opened || busy) return;

    if (dodges < CONFIG.dodges.length) {
      busy = true;
      bubble(CONFIG.dodges[dodges], dodges === CONFIG.dodges.length - 1);
      dodge();
      dodges++;
      if (dodges >= 2) giveup.hidden = false;
      setTimeout(() => { busy = false; }, 420);   // a fast double-tap shouldn't burn two
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
thread();
reveals();
horizontalGap();
chips();
celebrate();
Figure.init();
envelope();
chrome();
runLoader();

window.addEventListener("load", () => ScrollTrigger.refresh());
