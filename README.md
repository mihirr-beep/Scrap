# For You

A handmade, mobile-first congratulations site. Static HTML/CSS/JS + GSAP. No build step.

## Editing your content

Everything you need to change lives in two places:

1. **`js/main.js`** — the `CONFIG` block at the very top: their name, the occasion,
   your signoff, and the teasing bubble messages the envelope shows while it dodges.
2. **`index.html`** — the block marked `EDIT ME — WRITE THIS YOURSELF` inside
   `.paper__body`. That is the letter. Write it yourself; that is the whole point.

## Local preview

```
python -m http.server 5500
```

Then open http://localhost:5500

## Assets

`assets/img/` holds real photographic materials (blush envelope paper, a gold wax
seal cut out with an organic alpha edge, white paper stock, grain). The envelope is
assembled in CSS from those materials rather than being one flat photo, so its flap
can actually hinge open in 3D.

Photo source: Pexels (free to use, no attribution required).
