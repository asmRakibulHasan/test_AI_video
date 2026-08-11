export type StepType =
  | "divide"
  | "base-case"
  | "compare"
  | "drain-left"
  | "drain-right"
  | "writeback"
  | "done";

export interface Token {
  id: number;
  value: number;
}

export interface MergeSortStep {
  tokens: Token[];
  low: number;
  mid: number | null;
  high: number;
  compareIndices: [number, number] | null;
  sortedIndices: number[];
  activeLines: number[];
  type: StepType;
  caption: string;
}

export interface CodeLine {
  id: number;
  text: string;
}

// Real, compilable C++ (not pseudo-syntax) shown in the bottom panel.
// Line `id`s are referenced by each MergeSortStep's `activeLines` so the
// panel can highlight whichever line is executing for that step.
export const MERGE_SORT_CPP: CodeLine[] = [
  { id: 1, text: "#include <vector>" },
  { id: 2, text: "using namespace std;" },
  { id: 3, text: "" },
  { id: 4, text: "void merge(vector<int>& a, int l, int m, int r) {" },
  { id: 5, text: "    vector<int> tmp;" },
  { id: 6, text: "    int i = l, j = m + 1;" },
  { id: 7, text: "    while (i <= m && j <= r) {" },
  { id: 8, text: "        if (a[i] <= a[j])" },
  { id: 9, text: "            tmp.push_back(a[i++]);" },
  { id: 10, text: "        else" },
  { id: 11, text: "            tmp.push_back(a[j++]);" },
  { id: 12, text: "    }" },
  { id: 13, text: "    while (i <= m) tmp.push_back(a[i++]);" },
  { id: 14, text: "    while (j <= r) tmp.push_back(a[j++]);" },
  { id: 15, text: "    for (int k = l; k <= r; ++k)" },
  { id: 16, text: "        a[k] = tmp[k - l];" },
  { id: 17, text: "}" },
  { id: 18, text: "" },
  { id: 19, text: "void mergeSort(vector<int>& a, int l, int r) {" },
  { id: 20, text: "    if (l >= r) return;" },
  { id: 21, text: "    int mid = l + (r - l) / 2;" },
  { id: 22, text: "    mergeSort(a, l, mid);" },
  { id: 23, text: "    mergeSort(a, mid + 1, r);" },
  { id: 24, text: "    merge(a, l, mid, r);" },
  { id: 25, text: "}" },
];

/**
 * Runs top-down merge sort on `input`, logging one MergeSortStep per
 * divide point, comparison, drain, and writeback. Precomputed once up
 * front (same pattern as quicksortTrace.ts) so rendering stays a pure
 * function of frame -> step index.
 */
export function buildMergeSortTrace(input: number[]): MergeSortStep[] {
  const tokens: Token[] = input.map((value, id) => ({ id, value }));
  const steps: MergeSortStep[] = [];
  const sorted = new Set<number>();

  const snapshot = (partial: Omit<MergeSortStep, "tokens" | "sortedIndices">) => {
    steps.push({
      tokens: tokens.map((t) => ({ ...t })),
      sortedIndices: Array.from(sorted).sort((a, b) => a - b),
      ...partial,
    });
  };

  function merge(low: number, mid: number, high: number) {
    let i = low;
    let j = mid + 1;
    const temp: Token[] = [];

    while (i <= mid && j <= high) {
      snapshot({
        low,
        mid,
        high,
        compareIndices: [i, j],
        activeLines: [7, 8],
        type: "compare",
        caption: `${tokens[i].value} vs ${tokens[j].value}`,
      });
      if (tokens[i].value <= tokens[j].value) {
        temp.push(tokens[i]);
        i++;
      } else {
        temp.push(tokens[j]);
        j++;
      }
    }

    if (i <= mid) {
      snapshot({
        low,
        mid,
        high,
        compareIndices: null,
        activeLines: [13],
        type: "drain-left",
        caption: "Copy remaining left run",
      });
      while (i <= mid) {
        temp.push(tokens[i]);
        i++;
      }
    }

    if (j <= high) {
      snapshot({
        low,
        mid,
        high,
        compareIndices: null,
        activeLines: [14],
        type: "drain-right",
        caption: "Copy remaining right run",
      });
      while (j <= high) {
        temp.push(tokens[j]);
        j++;
      }
    }

    for (let k = low; k <= high; k++) {
      tokens[k] = temp[k - low];
    }
    for (let k = low; k <= high; k++) {
      sorted.add(k);
    }
    snapshot({
      low,
      mid,
      high,
      compareIndices: null,
      activeLines: [15, 16],
      type: "writeback",
      caption: "Merged run written back — sorted",
    });
  }

  function mergeSort(low: number, high: number) {
    if (low >= high) {
      if (low === high) sorted.add(low);
      snapshot({
        low,
        mid: null,
        high,
        compareIndices: null,
        activeLines: [20],
        type: "base-case",
        caption: "Single element — already sorted",
      });
      return;
    }
    const mid = Math.floor((low + high) / 2);
    snapshot({
      low,
      mid,
      high,
      compareIndices: null,
      activeLines: [21],
      type: "divide",
      caption: `Split [${low}..${high}] at mid`,
    });
    mergeSort(low, mid);
    mergeSort(mid + 1, high);
    merge(low, mid, high);
  }

  if (tokens.length > 1) {
    mergeSort(0, tokens.length - 1);
  } else if (tokens.length === 1) {
    sorted.add(0);
  }

  steps.push({
    tokens: tokens.map((t) => ({ ...t })),
    low: 0,
    mid: null,
    high: tokens.length - 1,
    compareIndices: null,
    sortedIndices: tokens.map((_, idx) => idx),
    activeLines: [],
    type: "done",
    caption: "Sorted! O(n log n) — guaranteed, every time",
  });

  return steps;
}
