# Script: "How Quicksort Actually Works"

**Format:** Vertical short (1080×1920), 30fps, ~19.5s, caption-only (no voiceover)
**Array used:** `[5, 2, 8, 1, 9, 3, 7]` → sorts to `[1, 2, 3, 5, 7, 8, 9]` in 30 traced steps

## Beat sheet

| Time | Beat | On-screen | Visual |
|---|---|---|---|
| 0.0–1.5s | **Hook** | "How Quicksort Actually Works" / "7 numbers, zero voiceover 👀" | Title card, fades in/out |
| 1.5–7.9s | **Partition 1** (pivot = 7) | Auto-generated per step (see below) | Bars for 5,2,8,1,9,3,7 — pivot highlighted amber, comparisons cyan, swaps rose, bars slide to new slots |
| 7.9–11.6s | **Partition 2** (pivot = 3, left half) | Auto-generated | Same color language, now on the shrunk left sub-array |
| 11.6–13.2s | **Partition 3** (pivot = 1) | Auto-generated | Final small partition |
| 13.2–16.9s | **Right half** (pivot = 9) | Auto-generated | Mirrors the left-half logic on the right side |
| 16.9–17.5s | **Sorted markers land** | "Sorted! O(n log n) on average" | All bars turn green |
| 17.5–19.5s | **CTA / outro** | "Sorted ✅" / "O(n log n) average time complexity" / "Follow for more algorithms, visualized" | Clean outro card |

## Auto-generated per-step captions (used during the partition beats)
Each of the 30 traced steps shows one of these caption patterns, filled in with
the real numbers as the algorithm runs — you don't write these by hand, they
come out of `quicksortTrace.ts`:
- `Pivot = X (last element)` — when a new pivot is chosen
- `X < pivot?` — during each comparison
- `Yes → move left of pivot` — after a swap that moves an element left
- `Pivot locked into its final spot` — when the pivot is placed
- `Single element — already sorted` — base case of the recursion
- `Sorted! O(n log n) on average` — final frame

## Caption / hashtags for the post itself
> Quicksort, but you can actually *see* it happen. Pick a pivot → smaller left, bigger right → repeat. That's the whole algorithm. 🎯
>
> #coding #algorithms #computerscience #softwareengineering #learntocode #quicksort #dsa #tech

## Reusing this template for future shorts
Swap the array in `quicksortDefaultProps` for a new run of the same algorithm,
or write a new trace generator (same shape as `quicksortTrace.ts`) for a
different algorithm — merge sort, binary search, BFS/DFS, a DP table fill —
and point a copy of `QuicksortShort.tsx` at it. The intro/body/outro shell,
color language, and caption-bubble styling all carry over unchanged.
