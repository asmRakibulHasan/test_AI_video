# Quicksort Short — Remotion Project

A 1080×1920, caption-only (no voiceover) short visualizing Quicksort step by step:
pivot selection → comparisons → swaps → recursion → sorted. See `SCRIPT.md` for the
full beat-by-beat breakdown.

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
This opens Remotion Studio. Select the `QuicksortShort` composition, scrub the
timeline, and use the Props panel to try different arrays live.

## Render the final MP4
```bash
npm run render
```
Outputs `out/quicksort-short.mp4` at 1080×1920, 30fps — ready to post to
Shorts/Reels/TikTok.

## Customize
Open `src/QuicksortShort.tsx` and edit `quicksortDefaultProps`:
```ts
export const quicksortDefaultProps: QuicksortShortProps = {
  values: [5, 2, 8, 1, 9, 3, 7], // swap in any array of numbers
  introFrames: 45,               // hook duration
  outroFrames: 60,               // CTA duration
  stepHoldFrames: 16,            // how long each algorithm step is held on screen
};
```
The video's total duration is computed automatically from however many steps
your array produces (via `calculateMetadata` in `QuicksortShort.tsx`) — no
manual duration math needed when you change the array.

- **Faster/slower pacing:** lower/raise `stepHoldFrames`.
- **Bigger array:** more elements = more steps = longer video; keep it under
  ~10 elements so the bars stay legible on a phone screen.
- **Colors/branding:** edit the `COLORS` object in `src/components/Bars.tsx`.
- **Adding voiceover later:** generate a TTS track, drop the audio file in
  `public/`, add `<Audio src={staticFile("voiceover.mp3")} />` to
  `QuicksortShort.tsx`, and set `stepHoldFrames`/durations to match the
  narration timing instead of a fixed hold.

## Project structure
```
src/
  index.ts               # registers the Remotion root
  Root.tsx                # registers the QuicksortShort composition
  QuicksortShort.tsx      # main composition: intro / body / outro timing
  components/
    Bars.tsx              # animated bar visualization (tokens slide between slots)
    Caption.tsx            # on-screen caption bubble
  lib/
    quicksortTrace.ts      # precomputes every pivot/compare/swap step
```

## Why precompute the trace?
Remotion renders by asking "what does frame N look like?" for any N, in any
order — so the visualization can't run the algorithm live inside the render
loop. `quicksortTrace.ts` runs the full algorithm once up front and produces
an array of steps; the composition just picks `steps[frame / stepHoldFrames]`.
This is the pattern to reuse for any future algorithm short (sorting, graph
traversal, DP tables, etc.) — swap in a new trace generator, same rendering
shell.
