# Algorithm Shorts — Remotion Project

Two 1080×1920, caption-only (no voiceover) shorts, both algorithm visualizations
rendered from a precomputed step trace:

1. **QuicksortShort** — bars, pivot selection → comparisons → swaps → sorted
2. **MergeSortCatsShort** — split-screen: cats (sized by value) on top,
   highlighted C++ pseudocode on bottom, divide → compare → merge → sorted

See `SCRIPT.md` for the Quicksort beat-by-beat breakdown.

## Requirements
- Node.js 18+ and npm
- FFmpeg (Remotion installs its own bundled binary automatically, but a system
  FFmpeg also works)

## Setup
```bash
npm install
```

## Preview (scrub the timeline live in the browser)
```bash
npm start
```
This opens Remotion Studio. Pick `QuicksortShort` or `MergeSortCatsShort` from
the composition list, scrub the timeline, and use the Props panel to try
different arrays live.

## Render the final MP4
```bash
npm run render:quicksort   # -> out/quicksort-short.mp4
npm run render:mergesort   # -> out/merge-sort-cats.mp4
```
Both output 1080×1920, 30fps — ready to post to Shorts/Reels/TikTok.

## Customize

**Quicksort** — edit `quicksortDefaultProps` in `src/QuicksortShort.tsx`:
```ts
export const quicksortDefaultProps: QuicksortShortProps = {
  values: [5, 2, 8, 1, 9, 3, 7], // swap in any array of numbers
  introFrames: 45,               // hook duration
  outroFrames: 60,               // CTA duration
  stepHoldFrames: 16,            // how long each algorithm step is held on screen
};
```

**Merge Sort Cats** — edit `mergeSortCatsDefaultProps` in `src/MergeSortCatsShort.tsx`:
```ts
export const mergeSortCatsDefaultProps: MergeSortCatsProps = {
  values: [8, 3, 6, 1, 9, 2, 7, 4],
  tailFrames: 55,              // hold on the sorted state while the chime rings
  musicSrc: "",                // e.g. "bg-music.mp3" if you add a file to public/
  musicVolume: 0.5,
  tickSoundEnabled: true,      // tick at every algorithm step
  tickVolume: 0.4,
  successSoundEnabled: true,   // chime once sorting completes
  successVolume: 0.8,
};
```
This one has no intro card and no outro card — it starts directly on the
visualization and ends on the final sorted cats. Cats are rendered as real colored SVG shapes (see
`CatIcon.tsx`) rather than the 🐱 emoji — headless Chrome on Linux render
machines often lacks a color-emoji font, which is why the cats were showing
up solid black in the first render. The code panel shows a 9-line window
centered on whichever C++ line is currently active, in a large
monospace font, rather than the full ~25 lines at once.

**Sound effects (ship included, no setup needed):** both are synthesized by
`scripts/generate-audio.mjs` — decaying sine waves written straight to WAV
bytes, not sourced/licensed sounds.
- `public/tick.wav` — a short click at the start of every algorithm step, in
  sync with the code panel and the cats moving.
- `public/success.wav` — a rising C-E-G-C major arpeggio that fires once the
  array is fully sorted. Ticks stop before it so nothing steps on the chime.

Re-run `node scripts/generate-audio.mjs` after editing the frequencies or
durations to change either sound, or set `tickSoundEnabled` /
`successSoundEnabled` to `false` to turn them off.

**Adding background music (no voiceover):** unlike the tick, this one I
can't generate — it needs an actual composed track. Drop an mp3 into
`public/` (see `public/README.md`), then set `musicSrc: "bg-music.mp3"` —
either in `mergeSortCatsDefaultProps` or live in the Studio Props panel. No
music file ships with this project, so only the tick plays until you add one.

Both compositions compute total duration automatically from however many
steps the array produces (via `calculateMetadata`) — no manual duration math
needed when you change the array.

- **Faster/slower pacing:** lower/raise `stepHoldFrames`.
- **Bigger array:** more elements = more steps = longer video; keep it under
  ~8–10 elements so bars/cats stay legible on a phone screen.
- **Colors/branding:** edit the `COLORS` object in `src/components/Bars.tsx`
  or `src/components/CatBars.tsx`.
- **Different code / language:** edit the `MERGE_SORT_CPP` array
  in `src/lib/mergeSortTrace.ts` — keep the same `id`s referenced by
  `activeLines` in each step, or update both together.
- **Adding voiceover later:** generate a TTS track, drop the audio file in
  `public/`, add `<Audio src={staticFile("voiceover.mp3")} />` to the
  composition, and set `stepHoldFrames`/durations to match the narration
  timing instead of a fixed hold.

## Project structure
```
src/
  index.ts                  # registers the Remotion root
  Root.tsx                   # registers both compositions
  QuicksortShort.tsx         # bars template: intro / body / outro timing
  MergeSortCatsShort.tsx     # split-screen template: cats top / code bottom
  components/
    Bars.tsx                 # animated bar visualization (tokens slide between slots)
    CatBars.tsx                # same sliding logic, cats sized by value
    CatIcon.tsx                 # plain SVG cat shape (colored, not emoji-dependent)
    CodePanel.tsx                # windowed C++ view, auto-centers active line
    Caption.tsx                   # on-screen caption bubble (shared by both templates)
  lib/
    quicksortTrace.ts              # precomputes every pivot/compare/swap step
    mergeSortTrace.ts              # precomputes every divide/compare/drain/writeback step
                                     # + exports the C++ source lines
public/
  tick.wav                          # synthesized step tick, ships included
  success.wav                        # synthesized completion chime, ships included
  README.md                           # where to drop a background music file
scripts/
  generate-audio.mjs                  # regenerate both sounds
```

## Why precompute the trace?
Remotion renders by asking "what does frame N look like?" for any N, in any
order — so the visualization can't run the algorithm live inside the render
loop. `quicksortTrace.ts` runs the full algorithm once up front and produces
an array of steps; the composition just picks `steps[frame / stepHoldFrames]`.
This is the pattern to reuse for any future algorithm short (sorting, graph
traversal, DP tables, etc.) — swap in a new trace generator, same rendering
shell.

---

## 3. SqlJoinsShort — "SQL JOINS" for Shohoj Coding

A 15.0s (450 frame) vertical explainer covering all four join types on one
persistent screen. Render:
```bash
npm run render:sqljoins    # -> out/shohoj-sql-joins.mp4
```

### Timeline
| Frames | Beat |
|---|---|
| 0–29 | Header, rail, and stage fade/slide in |
| 30–119 | **INNER JOIN** — 2 rows |
| 120–209 | **LEFT JOIN** — 3 rows |
| 210–299 | **RIGHT JOIN** — 3 rows |
| 300–389 | **FULL OUTER JOIN** — 4 rows |
| 390–449 | Finale: "Same data. Four answers." + recap + `SAVE THIS ↓` |

Within each 90-frame section: query types itself (f4–34) → match arcs draw
and unmatched rows resolve (f30–62) → result rows land one at a time
(from f52, every 9 frames, each with a tick) → row-count badge pops.

### Customize
Edit `sqlJoinsDefaultProps` in `src/SqlJoinsShort.tsx` for pacing, or:
- **Data:** `STUDENTS` / `SCORES` in `src/lib/sqlJoins.ts`. The join results,
  row counts, NULL placement, and rail numbers are all *computed* from that
  data — change the arrays and everything downstream follows automatically.
- **Colors / fonts:** `src/lib/theme.ts` (single token file).
- **Brand text:** `BRAND` and `SERIES` in `src/lib/theme.ts`.

### Bengali text
The tagline is Latin script by default. Headless Chrome on Linux render
machines typically ships no Bengali font, so Bengali would export as empty
tofu boxes — the same class of bug as the black-cat emoji. To use Bengali:
1. Put a Bengali font file (e.g. `NotoSansBengali-Bold.ttf`) in `public/`
2. Add an `@font-face` for it and wait for it to load with
   `@remotion/google-fonts` or `document.fonts.ready` via `delayRender`
3. Swap the tagline string in `src/components/JoinHeader.tsx`

### Files
```
src/SqlJoinsShort.tsx           # composition + 15s timeline
src/lib/sqlJoins.ts             # data + join result computation
src/lib/theme.ts                # design tokens (colors, fonts)
src/components/JoinHeader.tsx   # brand bar + title
src/components/JoinRail.tsx     # 4-segment progress rail
src/components/JoinStage.tsx    # source tables + curved match arcs
src/components/SqlLine.tsx      # typewriter query
src/components/ResultPanel.tsx  # result rows landing + NULL cells
```

---

## 4. InvertTreeShort — "Invert a Binary Tree" for Shohoj Coding

A 15.0s (450 frame) recursion explainer: a 7-node binary tree mirrors itself
bottom-up while a C++ panel highlights the executing line. Render:
```bash
npm run render:inverttree    # -> out/shohoj-invert-tree.mp4
```

### Timeline
| Frames | Beat |
|---|---|
| 0–25 | Brand, title, tree fade/slide in |
| 26–421 | 36 recursion steps × 11 frames each |
| 422–449 | Final mirrored tree holds, chime rings, `SAVE THIS ↓` |

### Node color states
| Color | Meaning |
|---|---|
| Slate (idle) | Not visited yet |
| **Sky** `#38bdf8` | On the call stack right now |
| **Orange** `#fb923c` | The two children being swapped this instant |
| **Teal** `#2dd4bf` | Subtree finished and mirrored |

### How the animation works
Node positions come from an **in-order walk of the current tree** — a node's
x slot is its index in that walk. Swapping two children reverses the walk
for that subtree, so mirrored nodes slide to mirrored positions with no
special-case animation code. Node ids stay stable across steps, so a swap
reads as two chips gliding past each other rather than values blinking.

The trace is verified: starting in-order `1,3,4,5,7,8,9` becomes
`9,8,7,5,4,3,1` — an exact reversal, i.e. a correct full mirror.

### Customize
- **Tree shape/values:** the `build()` function in `src/lib/invertTree.ts`.
  Step count, duration, captions, and layout all follow automatically —
  but note more than 7 nodes gets cramped on a phone screen, and pushes the
  runtime past 15s unless you lower `stepFrames`.
- **Pacing:** `stepFrames` in `invertTreeDefaultProps`.
- **Colors:** `src/lib/treeTheme.ts`.
- **C++ source:** `CPP_LINES` in `src/lib/invertTree.ts` — keep the `id`s in
  sync with the `activeLine` values used in `buildTreeTrace()`.

### Files
```
src/InvertTreeShort.tsx          # composition + 15s timeline
src/lib/invertTree.ts            # tree model, recursion trace, layout, C++ source
src/lib/treeTheme.ts             # cool teal/indigo design tokens
src/components/TreeCanvas.tsx    # animated SVG tree + mirror axis
src/components/CallStackBar.tsx  # live recursion stack chips
src/components/CppPanel.tsx      # C++ panel with syntax highlight
```
