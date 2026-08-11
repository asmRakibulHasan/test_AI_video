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
  introFrames: 45,
  outroFrames: 70,
  stepHoldFrames: 18,
};
```

Both compositions compute total duration automatically from however many
steps the array produces (via `calculateMetadata`) — no manual duration math
needed when you change the array.

- **Faster/slower pacing:** lower/raise `stepHoldFrames`.
- **Bigger array:** more elements = more steps = longer video; keep it under
  ~8–10 elements so bars/cats stay legible on a phone screen.
- **Colors/branding:** edit the `COLORS` object in `src/components/Bars.tsx`
  or `src/components/CatBars.tsx`.
- **Different pseudocode / language:** edit the `MERGE_SORT_PSEUDOCODE` array
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
    CatBars.tsx                # same sliding logic, rendered as cats sized by value
    CodePanel.tsx              # pseudocode block with active-line highlight
    Caption.tsx                 # on-screen caption bubble (shared by both templates)
  lib/
    quicksortTrace.ts          # precomputes every pivot/compare/swap step
    mergeSortTrace.ts          # precomputes every divide/compare/drain/writeback step
                                 # + exports the C++ pseudocode lines
```

## Why precompute the trace?
Remotion renders by asking "what does frame N look like?" for any N, in any
order — so the visualization can't run the algorithm live inside the render
loop. `quicksortTrace.ts` runs the full algorithm once up front and produces
an array of steps; the composition just picks `steps[frame / stepHoldFrames]`.
This is the pattern to reuse for any future algorithm short (sorting, graph
traversal, DP tables, etc.) — swap in a new trace generator, same rendering
shell.
