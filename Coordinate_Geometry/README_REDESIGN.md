# Coordinate Geometry Lab: redesign and Animation Studio

Open `CoordinateGeometry.html` in a browser. The page still needs internet access for KaTeX, Chart.js and three.js, as before.

## What was added

| File | What it does |
|---|---|
| `Redesign.css`, `Redesign.js` | The new look: top bar with the School / Intermediate switch, icon tab pills, searchable topic list, restyled cards. It does not touch the maths. |
| `ConceptStudio.js` | The docked **Animation Studio** core: the first 18 animations, the Studio panel, draggable handles, free-play sliders, answers, challenges, and the card detector. |
| `StudioMore1.js` – `StudioMore4.js` | Extra animation modules (tabs 2–4, 5–6, 8–9, 10). Each pushes a function onto `window.__studioParts`; together with the core they give **all 133 cards** an animation tied to the student's own numbers. They must be loaded before `ConceptStudio.js`. |
| `StandardTriangle.js` | The 14 cards for the *Standard Points of a Triangle* tab (the page already loaded this file, but it was missing). Also holds the shared card builder `buildGeoCard()`. |
| `AngleBisectors.js` | The 13 cards for the *Angle Bisectors & Family of Lines* tab. |
| `buttons.js`, `utils.js` | Small edits only: a click handler for tab 6, and graphs that draw a curve as one polyline and hide unlabeled legend entries. Line endings are unchanged (CRLF). |

## How the Studio works

* **Linked mode.** `detectCard()` looks at the card on screen. If all ids of a *binding* exist in it, the matching animation reads those numbers, follows them as the student types, and shows the same answer. Dragging a handle writes the new numbers back into the card's inputs (`binding.set`) and presses its Calculate button.
* **Free play.** If no card is linked (or the student picks "free play"), the Studio shows its own sliders.
* **Wording.** Every scene returns text for `school` (plain words) and `inter` (formulas).

## Adding an animation

Put new scenes in a module like `StudioMore1.js` (`window.__studioParts.push(function (E, scenes, BINDINGS, MORE) {...})`): `scenes` takes scenes, `MORE.extras` / `MORE.hooks` take the extras and hooks, `BINDINGS` takes bindings, and `E.kit` has drawing helpers (half-planes, arrows, arcs, implicit curves, an isometric 3D kit). A binding may also use `sceneOf(p, readRadio, tx)` to pick a scene from a radio button, `present(root)`/`read(root)` for cards with a variable number of inputs, and `text:[ids]` for text boxes. The steps below describe the same pieces for the core file.

1. Push a scene onto `scenes` in `ConceptStudio.js`: `{ id, tab, title, tag, params:[[key,label,default]], f:[schoolFormula, interFormula], fit(P), valid(P), draw(g,t,C,lv,P) -> step text, out(P,lv) -> answer text }`. `t` runs from 0 to 1.
2. Add an entry to `EXTRAS` with `chip`, `marks` (the `t` where each step starts), `ranges` for the sliders, optional `handles(P)` / `drag(P,key,x,y)`, and `challenges` (`{id, text, hint, check(P)}`; each text is `[school, inter]`).
3. Add a hook sentence to `HOOKS`.
4. To link a card, push a binding: `{ scene, ids:[all input ids], get:v => params }`; add a setter with `setterFor(firstId, P => ({id: value}))` if dragging should write back.
5. Check that every challenge is *false* at the starting numbers and *true* for a known answer. A challenge counts only when it changes from false to true.

## Ideas, not code, from open projects

Manim (colour roles and building a figure step by step), JSXGraph and Mafs (draggable points tied to numbers), Mathigon (short interactive steps for school students) and GeoGebra (a figure and its algebra always agree). No code from these projects is used.
