import React from "react";
import type { CodeLine } from "../lib/mergeSortTrace";

interface CodePanelProps {
  lines: CodeLine[];
  activeLineIds: number[];
  width?: number;
}

export const CodePanel: React.FC<CodePanelProps> = ({ lines, activeLineIds, width = 940 }) => {
  return (
    <div
      style={{
        width,
        backgroundColor: "#0f172a",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20,
        padding: "22px 26px",
        fontFamily: "Menlo, Consolas, monospace",
        fontSize: 23,
        lineHeight: "32px",
      }}
    >
      {lines.map((line) => {
        const active = activeLineIds.includes(line.id);
        return (
          <div
            key={line.id}
            style={{
              whiteSpace: "pre",
              color: active ? "#facc15" : "#cbd5e1",
              backgroundColor: active ? "rgba(250, 204, 21, 0.12)" : "transparent",
              borderRadius: 6,
              padding: "0 8px",
              fontWeight: active ? 700 : 400,
            }}
          >
            {line.text.length > 0 ? line.text : "\u00A0"}
          </div>
        );
      })}
    </div>
  );
};
