# Happy Rakhi

A handmade, mobile-first Raksha Bandhan site, brother to sister.
Static HTML/CSS/JS + GSAP. No build step.

## Editing your content

Two places only:

1. **`js/main.js`** — the `CONFIG` block at the very top: her name, your name,
   your line for her, the two city labels, the distance, and the teasing bubble
   messages the envelope shows while it dodges.
2. **`index.html`** — the block marked `EDIT ME — WRITE THIS YOURSELF` inside
   `.paper__body`. That is the letter. Write it yourself; that is the whole point.

## The idea

A rakhi is a thread. Distance is a gap. A thread crossing a gap is the whole
story, so the thread is both the structure and the navigation: each beat is a
knot on the rail down the right edge, and scroll progress fills it in.

Eight beats, one per screen. Every section is exactly one viewport tall and the
scroll snaps to it, so you never land halfway between two of them.

## Local preview

```
python -m http.server 5500
```

Then open http://localhost:5500

## Assets

`assets/img/` holds real photographic materials — blush envelope paper, a gold
wax seal cut out with an organic alpha edge, a real rakhi keyed off a saturation
mask, white paper stock, and grain. 209KB total.

The envelope is assembled in CSS from those materials rather than being one flat
photo, so its flap can actually hinge open in 3D. A flat photo cannot animate.

Photo sources: Pexels (free to use, no attribution required).
