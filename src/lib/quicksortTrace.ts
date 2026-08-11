export type StepType = "pivot" | "compare" | "swap" | "sorted" | "done";

export interface Token {
  id: number;
  value: number;
}

export interface QuicksortStep {
  tokens: Token[];
  low: number;
  high: number;
  pivotIndex: number | null;
  compareIndex: number | null;
  swapIndices: [number, number] | null;
  sortedIndices: number[];
  type: StepType;
  caption: string;
}

/**
 * Runs Lomuto-partition quicksort on `input`, logging one QuicksortStep
 * per pivot pick / comparison / swap. The full trace is precomputed here
 * (not during render) so the Remotion composition can stay a pure
 * function of `frame` -> deterministic rendering.
 */
export function buildQuicksortTrace(input: number[]): QuicksortStep[] {
  const tokens: Token[] = input.map((value, id) => ({ id, value }));
  const steps: QuicksortStep[] = [];
  const sorted = new Set<number>();

  const snapshot = (partial: Omit<QuicksortStep, "tokens" | "sortedIndices">) => {
    steps.push({
      tokens: tokens.map((t) => ({ ...t })),
      sortedIndices: Array.from(sorted).sort((a, b) => a - b),
      ...partial,
    });
  };

  function partition(low: number, high: number): number {
    const pivotValue = tokens[high].value;
    snapshot({
      low,
      high,
      pivotIndex: high,
      compareIndex: null,
      swapIndices: null,
      type: "pivot",
      caption: `Pivot = ${pivotValue} (last element)`,
    });

    let i = low - 1;
    for (let j = low; j < high; j++) {
      snapshot({
        low,
        high,
        pivotIndex: high,
        compareIndex: j,
        swapIndices: null,
        type: "compare",
        caption: `${tokens[j].value} < ${pivotValue}?`,
      });
      if (tokens[j].value < pivotValue) {
        i++;
        [tokens[i], tokens[j]] = [tokens[j], tokens[i]];
        snapshot({
          low,
          high,
          pivotIndex: high,
          compareIndex: null,
          swapIndices: [i, j],
          type: "swap",
          caption: `Yes → move left of pivot`,
        });
      }
    }

    [tokens[i + 1], tokens[high]] = [tokens[high], tokens[i + 1]];
    snapshot({
      low,
      high,
      pivotIndex: i + 1,
      compareIndex: null,
      swapIndices: [i + 1, high],
      type: "swap",
      caption: `Pivot locked into its final spot`,
    });
    sorted.add(i + 1);
    return i + 1;
  }

  function quicksort(low: number, high: number) {
    if (low > high) return;
    if (low === high) {
      sorted.add(low);
      snapshot({
        low,
        high,
        pivotIndex: null,
        compareIndex: null,
        swapIndices: null,
        type: "sorted",
        caption: `Single element — already sorted`,
      });
      return;
    }
    const p = partition(low, high);
    quicksort(low, p - 1);
    quicksort(p + 1, high);
  }

  if (tokens.length > 1) {
    quicksort(0, tokens.length - 1);
  } else if (tokens.length === 1) {
    sorted.add(0);
  }

  steps.push({
    tokens: tokens.map((t) => ({ ...t })),
    low: 0,
    high: tokens.length - 1,
    pivotIndex: null,
    compareIndex: null,
    swapIndices: null,
    sortedIndices: tokens.map((_, idx) => idx),
    type: "done",
    caption: "Sorted! O(n log n) on average",
  });

  return steps;
}
