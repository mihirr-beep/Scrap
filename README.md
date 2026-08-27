# Happy Rakhi

A handmade, mobile-first Raksha Bandhan site, brother to sister.
Static HTML/CSS/JS + GSAP. No build step.

## Editing your content

Two places only:

1. **`js/main.js`** — the `CONFIG` block at the very top: her name, your name,
   your line for her, the two city labels, the distance, and the teasing bubble
   messages the envelope shows while it dodges.
2. **`index.html`** — the letter inside `.paper__body`. It is already the
   sender's own words; edit it there if anything changes.

## The look

Wedding-card palette: blush white, rani pink, gold, deep plum ink. Type is
Rozha One (Indian Type Foundry) over Karla, with Kalam for the handwriting.
A toran garland runs along the top of the hero and the real rakhi hangs from
it on a gold thread, swinging gently.

Eight beats, one per screen. Section snapping is mandatory with
`scroll-snap-stop: always`: a flick moves exactly one story beat, and you can
never stop between two. The distance chapter is a native sideways carousel
inside its screen — swipe on a phone, mouse wheel or the arrow buttons on a
desktop, arrow keys everywhere.

## Local preview

```
python -m http.server 5500
```

Then open http://localhost:5500

## Assets

`assets/img/` holds real photographic materials — blush envelope paper, a gold
wax seal cut out with an organic alpha edge, a real rakhi keyed off a saturation
mask, and white paper stock. 138KB total.

The envelope is assembled in CSS from those materials rather than being one flat
photo, so its flap can actually hinge open in 3D. A flat photo cannot animate.

Photo sources: Pexels (free to use, no attribution required).

## The finale

The letter promises a box at the last. The box rattles. Opening it releases a
chhipkali (hand-drawn SVG) that darts and freezes her way around the whole
screen forever — tap her and she bolts. Sibling gift-giving at its finest.
