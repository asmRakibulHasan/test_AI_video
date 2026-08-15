/**
 * Cool teal / indigo system on deep slate — deliberately distinct both
 * from the warm amber palette of the SQL video and from the near-black +
 * orange look most recursion explainers use.
 */
export const TT = {
  bg: "#0b1120",
  bgDeep: "#070c17",
  panel: "#111a2e",
  border: "rgba(148,180,255,0.14)",
  borderSoft: "rgba(148,180,255,0.08)",

  idle: "#334155",
  idleText: "#94a3b8",
  active: "#38bdf8", // sky — on the call stack
  swap: "#fb923c", // orange — mid-swap
  done: "#2dd4bf", // teal — subtree finished
  axis: "rgba(56,189,248,0.28)",

  text: "#e8eefc",
  textMid: "#9fb0cd",
  textDim: "#64748b",

  hl: "rgba(56,189,248,0.16)",
  hlBar: "#38bdf8",

  sans: "Inter, 'Helvetica Neue', Arial, sans-serif",
  mono: "'JetBrains Mono', Menlo, Consolas, monospace",
};

export const colorFor = (state: string): string => {
  switch (state) {
    case "active":
      return TT.active;
    case "swapping":
      return TT.swap;
    case "done":
      return TT.done;
    default:
      return TT.idle;
  }
};
