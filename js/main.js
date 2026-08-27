/* =====================================================================
   For You — motion
   GSAP + ScrollTrigger only. Native scrolling (safest on mobile).
   ===================================================================== */

/* =====================================================================
   ▼▼▼  EDIT THIS BLOCK — this is the only place you need to touch  ▼▼▼
   ===================================================================== */
const CONFIG = {
  name:     "Friend",                              // their name
  occasion: "on the thing you worked so hard for", // what you're congratulating them for
  from:     "Me",                                  // your name / signoff
  date:     "",                                    // "" = today's date, or write your own

  // The teasing bubbles while the envelope dodges. Last one always opens it.
  dodges: [
    "nope. not yet.",
    "you sure you're ready for this?",
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
  document.title = CONFIG.name === "Friend" ? "For You" : "For " + CONFIG.name;
}

/* ---------------------------------------------------------------------
   preloader
   ------------------------------------------------------------------- */
function runLoader() {
  const loader = $("#loader");
  const count  = $("#loaderCount");
  const bar    = $("#loaderBar");

  clearTimeout(window.__failsafe);

  if (REDUCED) { loader.remove(); document.body.classList.remove("is-locked"); intro(); return; }

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
  const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
  tl.from("#hero .hero__title .w", { yPercent: 118, duration: 1.25, stagger: .09 })
    .to("#hero .eyebrow",  { opacity: 1, y: 0, duration: .9 }, .25)
    .to("#hero .hero__sub", { opacity: 1, y: 0, duration: .9 }, .45)
    .from(".scroll-hint", { opacity: 0, duration: .8 }, .7)
    .fromTo(".scroll-hint__line", { scaleX: 0 }, { scaleX: 1, duration: 1.1 }, .75);

  gsap.to(".scroll-hint__line", {
    scaleX: .3, duration: 1.1, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 2
  });
}

/* ---------------------------------------------------------------------
   generic scroll reveals
   ------------------------------------------------------------------- */
function reveals() {
  // .reveal-up — everything except the hero (hero is handled by intro())
  $$(".reveal-up").forEach(el => {
    if (el.closest("#hero")) return;
    gsap.to(el, {
      opacity: 1, y: 0, duration: 1, ease: "expo.out",
      scrollTrigger: { trigger: el, start: "top 88%" }
    });
  });

  // masked line reveals (#heard)
  $$(".h2--reveal").forEach(h => {
    gsap.from(h.querySelectorAll(".w"), {
      yPercent: 118, duration: 1.15, ease: "expo.out", stagger: .1,
      scrollTrigger: { trigger: h, start: "top 80%" }
    });
  });

  // gentle parallax on the letter paper
  gsap.to(".paper", {
    yPercent: -4, ease: "none",
    scrollTrigger: { trigger: ".sec--letter", start: "top bottom", end: "bottom top", scrub: true }
  });
}

/* ---------------------------------------------------------------------
   2. the gap — pinned horizontal scroll
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
      trigger: sec,
      start: "top top",
      end: () => "+=" + (dist() + window.innerHeight * .5),
      pin: true,
      scrub: 1,
      anticipatePin: 1,
      invalidateOnRefresh: true
    }
  });

  // months light up as they pass
  gsap.to("#months span", {
    opacity: 1, color: "#1c1714", duration: .5, stagger: .12, ease: "none",
    scrollTrigger: {
      trigger: sec, start: "top top",
      end: () => "+=" + dist(), scrub: 1, invalidateOnRefresh: true
    }
  });

  // panels drift for depth
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
   3. chips
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
   5. congratulations
   ------------------------------------------------------------------- */
function congrats() {
  const sec = $("#congrats");

  gsap.from("#mega span", {
    yPercent: 130, opacity: 0, rotate: 6,
    duration: 1.15, ease: "expo.out", stagger: .035,
    scrollTrigger: { trigger: sec, start: "top 62%" }
  });

  gsap.fromTo(".burst",
    { scale: .35, opacity: 0 },
    {
      scale: 1, opacity: 1, duration: 2, ease: "expo.out",
      scrollTrigger: { trigger: sec, start: "top 65%" }
    });

  // marquee
  const row = $("#marqueeRow");
  const word = "congratulations ·";
  row.innerHTML = Array.from({ length: 8 }, () => `<span>${word}</span>`).join("");
  gsap.to(row, { xPercent: -50, duration: 26, ease: "none", repeat: -1 });
}

/* ---------------------------------------------------------------------
   6. THE ENVELOPE — dodge, tease, then open
   ------------------------------------------------------------------- */
function envelope() {
  const stage  = $("#stage");
  const env    = $("#env");
  const flap   = $("#envFlap");
  const seal   = $("#envSeal");
  const letter = $("#envLetter");
  const bubbles = $("#bubbles");
  const giveup = $("#giveup");
  const hint   = $("#envHint");

  let dodges = 0;
  let opened = false;
  let busy   = false;

  /* idle float so it feels alive */
  const idle = gsap.to(env, {
    y: "+=9", rotation: 1.2, duration: 2.6,
    ease: "sine.inOut", repeat: -1, yoyo: true
  });

  /* --- a message bubble near the envelope's old spot --- */
  function bubble(text, gold) {
    const b = document.createElement("div");
    b.className = "bubble" + (gold ? " bubble--gold" : "");
    b.textContent = text;

    const sr = stage.getBoundingClientRect();
    const er = env.getBoundingClientRect();
    // anchor above the envelope, nudged to whichever side has room
    const left = (er.left - sr.left) + er.width * (er.left - sr.left > sr.width * .5 ? -0.05 : 0.55);
    const top  = (er.top  - sr.top)  - 16;

    b.style.left = Math.max(8, Math.min(left, sr.width - 120)) + "px";
    b.style.top  = Math.max(8, top) + "px";
    bubbles.appendChild(b);

    gsap.fromTo(b,
      { opacity: 0, scale: .7, y: 14 },
      { opacity: 1, scale: 1, y: 0, duration: .55, ease: "back.out(2.2)" });

    gsap.to(b, {
      opacity: 0, y: -18, duration: .6, delay: 2.9, ease: "power2.in",
      onComplete: () => b.remove()
    });
  }

  /* --- dodge to a fresh spot inside the stage --- */
  function dodge() {
    const sr = stage.getBoundingClientRect();
    const er = env.getBoundingClientRect();
    const maxX = Math.max(10, (sr.width  - er.width)  / 2 - 10);
    const maxY = Math.max(10, (sr.height - er.height) / 2 - 10);

    const cur = gsap.getProperty(env, "x");
    // jump to the opposite side so it always reads as "running away"
    const dir = cur >= 0 ? -1 : 1;
    const x = dir * gsap.utils.random(maxX * .45, maxX);
    const y = gsap.utils.random(-maxY, maxY) * .6;

    gsap.to(env, {
      x, y,
      rotation: gsap.utils.random(-13, 13),
      duration: .8,
      ease: "elastic.out(1, 0.55)",
      overwrite: "auto"
    });
  }

  /* --- the payoff --- */
  function open() {
    opened = true;
    idle.kill();
    env.classList.add("is-open");
    env.setAttribute("aria-expanded", "true");
    giveup.hidden = true;
    hint.textContent = "…finally.";

    const tl = gsap.timeline({
      defaults: { ease: "expo.out" },
      onComplete: revealLetter
    });

    tl
      // settle back to centre
      .to(env, { x: 0, y: 0, rotation: 0, scale: 1.04, duration: .9, ease: "expo.out" })
      // break the wax seal
      .to(seal, { scale: 1.16, duration: .18, ease: "power2.out" }, "-=0.15")
      .to(seal, { scale: .55, rotation: 26, opacity: 0, duration: .5, ease: "power2.in" })
      // hinge the flap open, then drop it behind the letter
      .to(flap, { rotateX: -168, duration: 1.15, ease: "power3.inOut" }, "-=0.15")
      .set(flap, { zIndex: 1 }, "-=0.62")
      // letter rises out
      .to(letter, { y: "-38%", duration: 1.1, ease: "expo.out" }, "-=0.5")
      .to(letter, { scale: 1.02, duration: .5 }, "-=0.3");
  }

  function revealLetter() {
    const letterSec = $("#letterSec");
    const outro     = $("#outro");
    letterSec.hidden = false;
    outro.hidden     = false;

    gsap.fromTo("#paper",
      { opacity: 0, y: 60, rotateX: 8, scale: .96 },
      { opacity: 1, y: 0, rotateX: 0, scale: 1, duration: 1.4, ease: "expo.out" });

    // handwriting appears line by line
    gsap.fromTo("#paperBody p",
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: .9, stagger: .28, ease: "expo.out", delay: .5 });
    gsap.fromTo(".paper__sign",
      { opacity: 0 }, { opacity: 1, duration: 1, delay: 1.6 });

    ScrollTrigger.refresh();

    // carry them into it
    setTimeout(() => {
      letterSec.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "start" });
    }, 450);
  }

  /* --- the interaction --- */
  function poke() {
    if (opened || busy) return;

    if (dodges < CONFIG.dodges.length) {
      busy = true;
      bubble(CONFIG.dodges[dodges], dodges === CONFIG.dodges.length - 1);
      dodge();
      dodges++;
      if (dodges >= 2) giveup.hidden = false;
      // brief lockout so a fast double-tap doesn't burn two dodges
      setTimeout(() => { busy = false; }, 420);
      return;
    }
    open();
  }

  env.addEventListener("click", poke);
  giveup.addEventListener("click", () => { if (!opened) open(); });

  // keyboard
  env.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); poke(); }
  });

  // if the viewport changes mid-dodge, bring it home
  window.addEventListener("resize", () => {
    if (!opened) gsap.to(env, { x: 0, y: 0, rotation: 0, duration: .4 });
  });
}

/* ---------------------------------------------------------------------
   progress bar + replay
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
horizontalGap();
chips();
congrats();
envelope();
chrome();
runLoader();

window.addEventListener("load", () => ScrollTrigger.refresh());
