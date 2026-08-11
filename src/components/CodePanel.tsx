import React from "react";
import type { CodeLine } from "../lib/mergeSortTrace";

interface CodePanelProps {
  lines: CodeLine[];
  activeLineIds: number[];
  width?: number;
  windowSize?: number;
}

/**
 * Shows only a `windowSize`-line window of the pseudocode, centered on
 * whichever line is currently active, instead of the full ~22 lines at
 * once. This is what lets the font be large and legible on a phone screen
 * — the panel "scrolls" (snaps, in step with the algorithm) to keep the
 * relevant code always front and center.
 */
export const CodePanel: React.FC<CodePanelProps> = ({
  lines,
  activeLineIds,
  width = 1000,
  windowSize = 9,
}) => {
  const activeIndices = lines
    .map((l, idx) => (activeLineIds.includes(l.id) ? idx : -1))
    .filter((idx) => idx !== -1);

  const centerIndex =
    activeIndices.length > 0
      ? Math.round(activeIndices.reduce((a, b) => a + b, 0) / activeIndices.length)
      : 0;

  const half = Math.floor(windowSize / 2);
  let start = centerIndex - half;
  let end = start + windowSize;
  if (start < 0) {
    end -= start;
    start = 0;
  }
  if (end > lines.length) {
    start -= end - lines.length;
    end = lines.length;
  }
  start = Math.max(0, start);

  const visibleLines = lines.slice(start, end);

  return (
    <div
      style={{
        width,
        backgroundColor: "#0f172a",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 24,
        padding: "36px 40px",
        fontFamily: "Menlo, Consolas, monospace",
        fontSize: 32,
        lineHeight: "44px",
      }}
    >
      {visibleLines.map((line) => {
        const active = activeLineIds.includes(line.id);
        return (
          <div
            key={line.id}
            style={{
              whiteSpace: "pre",
              color: active ? "#facc15" : "#94a3b8",
              backgroundColor: active ? "rgba(250, 204, 21, 0.14)" : "transparent",
              borderRadius: 8,
              padding: "0 10px",
              fontWeight: active ? 700 : 500,
              opacity: active ? 1 : 0.75,
            }}
          >
            {line.text.length > 0 ? line.text : "\u00A0"}
          </div>
        );
      })}
    </div>
  );
};
