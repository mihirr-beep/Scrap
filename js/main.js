/* =====================================================================
   Happy Rakhi — motion
   GSAP + ScrollTrigger only. Native scrolling (safest on mobile).
   ===================================================================== */

/* =====================================================================
   ▼▼▼  EDIT THIS BLOCK — this is the only place you need to touch  ▼▼▼
   ===================================================================== */
const CONFIG = {
  name:     "Didi",               // her name (or "Didi")
  from:     "Jay Swaminarayan",   // the sign-off under the letter
  occasion: "to the one who has had my back since before either of us had a choice",
  date:     "",                   // "" = today's date, or write your own

  // The quiz guarding the envelope. It opens at 3 correct answers,
  // or after all 5 questions regardless. Q3 is rigged: the rating is 5.
  quiz: [
    {
      q: "First — what did we actually DO on Raksha Bandhan?",
      a: ["Tie the rakhi, obviously", "I don't know", "Some grand family ritual"],
      correct: 1,
      right: "Exactly. Nobody remembers. That's our tradition.",
      wrong: "Don't lie. Neither of us knows."
    },
    {
      q: "The smartwatch you gifted me — am I using it?",
      a: ["Yes, every day", "No", "What smartwatch?"],
      correct: 1,
      right: "Correct. It sleeps in a drawer. Peacefully.",
      wrong: "Cute of you to think so. Drawer. Since day one."
    },
    {
      special: "rating",
      q: "What rating does this website get?",
      a: ["3 stars", "4 stars", "5 stars"],
      correct: 2,
      right: "Correct. Obviously.",
      insist: "Are you SURE you don't want to select 5? ⭐",
      thanks: "Thank you for the 5-star rating. ❤️",
      fine:   "Wise choice."
    },
    {
      q: "Who is the favourite child at home?",
      a: ["Me, clearly", "My brother"],
      correct: 0,
      right: "Correct. I've made peace with it.",
      wrong: "Liar. We both know it's you."
    },
    {
      q: "Last one — which is better: cat or dog?",
      a: ["Cat", "Dog", "Depends on the mood"],
      correct: 0,
      right: "Obviously. The interviewer is a cat.",
      wrong: "Wrong. And she heard that."
    }
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

  // light the months up to NOW (August on Rakhi) — the year so far,
  // gone by without a call. SEP–DEC stay dim: still time to fix it.
  const litCount = Math.min(12, new Date().getMonth() + 1);
  let monthsDone = false;
  function lightMonths() {
    if (monthsDone) return;
    monthsDone = true;
    months.slice(0, litCount).forEach((m, i) =>
      setTimeout(() => m.classList.add("lit"), 260 + i * 170));
  }

  function update() {
    const p = sc.scrollLeft / maxScroll();
    bar.style.width = (p * 100).toFixed(1) + "%";
    if (sc.scrollLeft >= sc.clientWidth * .5) lightMonths();   // months panel arriving
    prev.disabled = sc.scrollLeft <= 2;
    next.disabled = sc.scrollLeft >= maxScroll() - 2;
    if (sc.scrollLeft > 40) hint.classList.add("is-gone");
  }
  sc.addEventListener("scroll", update, { passive: true });
  update();

  const go = dir => sc.scrollBy({ left: dir * sc.clientWidth, behavior: "smooth" });
  prev.addEventListener("click", () => { takeOver(); go(-1); });
  next.addEventListener("click", () => { takeOver(); go(1); });

  /* --- auto-play: the story advances by itself while this beat is on
         screen; the first human touch takes over for good --- */
  let timer = null, userTook = false;

  function autoStep() {
    if (sc.scrollLeft >= maxScroll() - 2) { stopAuto(); return; }   // story told
    go(1);
  }
  function startAuto() {
    if (userTook || REDUCED || timer) return;
    timer = setInterval(autoStep, 2800);
    sc.dataset.auto = "on";
  }
  function stopAuto() {
    clearInterval(timer);
    timer = null;
    sc.dataset.auto = "off";
  }
  function takeOver() { userTook = true; stopAuto(); }

  // take over only on real horizontal intent — a thumb resting here while
  // scrolling the page vertically must NOT kill the auto-play
  let tx = 0, ty = 0;
  sc.addEventListener("touchstart", e => {
    tx = e.touches[0].clientX; ty = e.touches[0].clientY;
  }, { passive: true });
  sc.addEventListener("touchmove", e => {
    const dx = e.touches[0].clientX - tx, dy = e.touches[0].clientY - ty;
    if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy)) takeOver();
  }, { passive: true });

  // run only while the section is actually in view
  ScrollTrigger.create({
    trigger: "#gap", start: "top 55%", end: "bottom 45%",
    onToggle: self => self.isActive ? startAuto() : stopAuto()
  });

  // desktop wheel: one tick = one panel, released at the edges so the
  // page's own section snap takes over
  let lock = false;
  sc.addEventListener("wheel", e => {
    const fwd = e.deltaY > 0;
    const atEdge = fwd ? sc.scrollLeft >= maxScroll() - 2 : sc.scrollLeft <= 2;
    if (atEdge || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
    e.preventDefault();
    takeOver();
    if (lock) return;
    lock = true;
    setTimeout(() => { lock = false; }, 480);
    go(fwd ? 1 : -1);
  }, { passive: false });

  return dir => { takeOver(); go(dir); };   // keyboard navigation reuses this
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

  const quizBox = $("#quiz");
  let qi = 0, correct = 0, opened = false, quizStarted = false, resolving = false;

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

  /* a message, stacked in its own reserved row — never covered.
     stay:true = a question that waits to be answered (no auto-fade). */
  function bubble(text, hot, stay) {
    const b = document.createElement("div");
    b.className = "bubble" + (hot ? " bubble--gold" : "");
    b.textContent = text;
    bubbles.appendChild(b);

    // keep the stack short so it always fits the row
    while (bubbles.children.length > 2) bubbles.firstElementChild.remove();

    gsap.fromTo(b,
      { opacity: 0, scale: .8, x: -14 },
      { opacity: 1, scale: 1, x: 0, duration: .5, ease: "back.out(2.4)" });

    if (!stay) {
      gsap.to(b, {
        opacity: 0, x: -10, duration: .5, delay: 4.2, ease: "power2.in",
        onComplete: () => b.remove()
      });
    }
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
    $("#giftSec").hidden = false;      // the letter says there is a box at the last
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

  /* ------------- THE QUIZ — she opens at 3 correct, or after all 5 ------------- */

  function hop() {
    if (REDUCED) return;
    gsap.to(env, { y: "-=16", duration: .18, yoyo: true, repeat: 1, ease: "power2.out", overwrite: "auto" });
  }

  function renderChoices(labels, cb) {
    quizBox.innerHTML = "";
    labels.forEach((label, i) => {
      const btn = document.createElement("button");
      btn.className = "chip";
      btn.textContent = label;
      btn.addEventListener("click", () => { if (!resolving) cb(i); });
      quizBox.appendChild(btn);
    });
    gsap.fromTo(quizBox.children,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: .45, stagger: .07, ease: "expo.out" });
  }

  function nextQuestion(delay) {
    qi++;
    quizBox.innerHTML = "";
    setTimeout(() => { resolving = false; ask(); }, delay);
  }

  function ask() {
    if (opened) return;
    if (correct >= 3) { finish(true); return; }
    if (qi >= CONFIG.quiz.length) { finish(false); return; }
    if (qi >= 3) giveup.hidden = false;          // escape hatch for the impatient
    const q = CONFIG.quiz[qi];
    bubble(q.q, false, true);
    renderChoices(q.a, i => answer(q, i));
  }

  function answer(q, i) {
    resolving = true;

    if (q.special === "rating" && i !== q.correct) {
      // the rating is 5. this is not negotiable.
      bubble(q.insist, false, true);
      renderChoices(["Fine, 5 stars", "No"], sel => {
        resolving = true;
        correct++;                               // rigged either way
        bubble(sel === 1 ? q.thanks : q.fine, true);
        hop();
        nextQuestion(1900);
      });
      resolving = false;                         // the insist choices must be live
      return;
    }

    const ok = i === q.correct;
    if (ok) { correct++; bubble(q.right, true); hop(); }
    else    { bubble(q.wrong); dodge(); }
    nextQuestion(1900);
  }

  function finish(passed) {
    quizBox.innerHTML = "";
    bubble(passed
      ? "Fine. " + correct + " right. The cat approves — opening it."
      : "That was genuinely bad. Opening it anyway — it's Rakhi.", true);
    setTimeout(open, 1300);
  }

  // start once, when this beat scrolls into view
  ScrollTrigger.create({
    trigger: "#envSec", start: "top 60%", once: true,
    onEnter: () => { if (!quizStarted) { quizStarted = true; setTimeout(ask, 700); } }
  });

  // poking the envelope early just makes it run
  env.addEventListener("click", () => {
    if (opened) return;
    bubble("The cat says: answer first.");
    dodge();
  });
  giveup.addEventListener("click", () => { if (!opened) open(); });
  env.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.target.click(); }
  });

  window.addEventListener("resize", () => {
    if (!opened) gsap.to(env, { x: 0, y: 0, rotation: 0, duration: .4 });
  });
}

/* ---------------------------------------------------------------------
   THE GIFT — a rattling box, and what lives inside it
   ------------------------------------------------------------------- */
function gift() {
  const box   = $("#gift");
  const lid   = $("#giftLid");
  const stage = $(".giftstage");
  const hint  = $("#giftHint");
  const liz   = $("#lizard");
  let opened  = false;

  // the box rattles every few seconds — something is alive in there
  const rattle = REDUCED ? null : gsap.timeline({ repeat: -1, repeatDelay: 2.4, delay: 1 })
    .to(box, { rotation: 4, duration: .06, repeat: 5, yoyo: true, ease: "none" })
    .to(box, { rotation: 0, duration: .1 });

  /* a small puff of pink and gold when the lid goes */
  function confetti() {
    const r = box.getBoundingClientRect();
    const sr = stage.getBoundingClientRect();
    const colors = ["#c2255c", "#efb93f", "#e0447f", "#d99a2b"];
    for (let i = 0; i < 14; i++) {
      const s = document.createElement("i");
      s.style.cssText = "position:absolute;width:7px;height:7px;border-radius:50%;pointer-events:none;"
        + "background:" + colors[i % 4] + ";left:" + (r.left - sr.left + r.width / 2) + "px;top:" + (r.top - sr.top + r.height * .2) + "px";
      stage.appendChild(s);
      const a = gsap.utils.random(-Math.PI, 0), d = gsap.utils.random(50, 130);
      gsap.to(s, {
        x: Math.cos(a) * d, y: Math.sin(a) * d + 60, opacity: 0, scale: .4,
        duration: gsap.utils.random(.7, 1.2), ease: "power2.out", onComplete: () => s.remove()
      });
    }
  }

  /* --- she comes out, then the screen is hers --- */
  function releaseLizard() {
    const r = box.getBoundingClientRect();
    liz.hidden = false;
    const w = liz.offsetWidth || 64;
    const startX = r.left + r.width / 2 - w / 2;
    const startY = r.top + r.height * .1;
    gsap.set(liz, { x: startX, y: startY, scale: .25, opacity: 0, rotation: -20 });

    if (REDUCED) { gsap.set(liz, { scale: 1, opacity: 1, rotation: 0 }); return; }

    gsap.timeline({ onComplete: wander })
      .to(liz, { opacity: 1, scale: 1, duration: .5, ease: "back.out(2)" })
      .to(liz, { x: startX - 90, y: startY - 40, rotation: -80, duration: .55, ease: "power1.out" });
  }

  /* dart, freeze, dart again — the most lizard behaviour there is */
  function wander() {
    const w = liz.offsetWidth || 64, h = liz.offsetHeight || 100, pad = 14;
    const x = gsap.utils.random(pad, window.innerWidth  - w - pad);
    const y = gsap.utils.random(pad + 50, window.innerHeight - h - pad);
    const cx = gsap.getProperty(liz, "x"), cy = gsap.getProperty(liz, "y");
    const dx = x - cx, dy = y - cy;
    const dist = Math.hypot(dx, dy);
    const heading = Math.atan2(dy, dx) * 180 / Math.PI + 90;   // svg faces up

    gsap.timeline({ onComplete: () => gsap.delayedCall(gsap.utils.random(.5, 2.4), wander) })
      .to(liz, { rotation: heading + "_short", duration: .16, ease: "power2.out" })
      .to(liz, { x, y, duration: Math.max(.35, dist / 460), ease: "power1.inOut" }, "<")
      .to("#lizImg", {                                         // scuttle while moving
        rotation: 4, transformOrigin: "50% 45%", duration: .07,
        repeat: Math.min(16, Math.max(4, Math.floor(dist / 26))), yoyo: true, ease: "none"
      }, "<")
      .set("#lizImg", { rotation: 0 });
  }

  // tapping her makes her bolt — she is not a fan of you either
  liz.addEventListener("pointerdown", () => {
    if (REDUCED) return;
    gsap.killTweensOf(liz);
    gsap.killTweensOf("#lizImg");
    wander();
  });

  function open() {
    if (opened) return;
    opened = true;
    if (rattle) rattle.kill();
    box.setAttribute("aria-expanded", "true");
    hint.textContent = "wait. is that…";
    confetti();

    gsap.timeline({
      defaults: { ease: "expo.out" },
      onComplete() {
        hint.textContent = "A chhipkali. She lives on this site now — tap her.";
        $("#outro").hidden = false;
        ScrollTrigger.refresh();
      }
    })
      .to(box,  { rotation: 0, scale: 1.06, duration: .3 })
      .to(lid,  { y: -110, rotation: -24, opacity: 0, duration: .9 }, "-=0.05")
      .to(box,  { scale: 1, duration: .5 }, "-=0.5")
      .add(releaseLizard, "-=0.55");
  }

  box.addEventListener("click", open);
  box.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
  });
}

/* ---------------------------------------------------------------------
   the p.s. cards — tap to flip, tap to close
   ------------------------------------------------------------------- */
function secrets() {
  // hidden in plain sight, placed in REVERSE order of weight:
  // the blessing first (hero rakhi), the confession (AUG tile),
  // and the biggest thing said smallest — the final full stop.
  const notes = [
    { sel: "#hang",
      text: "I hope you stay happy. Don't let bad people chase you. Don't marry very early — live life, see the world around. I'll be backing you up if any pressure comes. Don't worry." },
    { sel: "#months span:nth-child(8)",   // AUG — the month that matters
      text: "Sometimes I think I don't talk to you much, or never open up to you as I should have. Let me know what you feel about it." },
    { sel: "#dot",
      text: "Obviously — I love you." }
  ];

  const note = $("#note"), txt = $("#noteText"), cnt = $("#noteCount");
  const found = new Set();

  function show(i, text) {
    found.add(i);
    txt.textContent = text;
    const left = notes.length - found.size;
    cnt.textContent = left === 0
      ? "you found all three."
      : "hidden note " + found.size + " of 3 — " + left + " more hiding";
    note.hidden = false;
    if (!REDUCED) {
      gsap.fromTo(".note__card",
        { rotationY: 85, opacity: 0, scale: .85 },
        { rotationY: 0, opacity: 1, scale: 1, duration: .75, ease: "back.out(1.5)" });
    }
  }

  notes.forEach((n, i) => {
    const el = $(n.sel);
    if (!el) return;
    el.style.pointerEvents = "auto";
    el.addEventListener("click", e => { e.stopPropagation(); show(i, n.text); });
  });

  note.addEventListener("click", () => { note.hidden = true; });
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
gift();
secrets();
chrome();
runLoader();

window.addEventListener("load", () => ScrollTrigger.refresh());
