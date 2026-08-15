import React from "react";
import { TT } from "../lib/treeTheme";
import type { CodeLine } from "../lib/invertTree";

const KEYWORDS = ["return", "if", "nullptr", "swap"];
const TYPES = ["TreeNode"];

/** Minimal C++ tokenizer — enough for these seven lines, no dependency. */
const tokenize = (text: string) => {
  const parts = text.split(/(\b\w+\b|[^\w\s]|\s+)/g).filter((s) => s.length > 0);
  return parts.map((p, i) => {
    let color = TT.text;
    if (KEYWORDS.includes(p)) color = "#f472b6";
    else if (TYPES.includes(p)) color = "#2dd4bf";
    else if (p === "invertTree") color = "#facc15";
    else if (/^(root|left|right)$/.test(p)) color = "#93c5fd";
    else if (/^[(){};*,>\-!]+$/.test(p)) color = TT.textDim;
    return (
      <span key={i} style={{ color }}>
        {p}
      </span>
    );
  });
};

export const CppPanel: React.FC<{ lines: CodeLine[]; activeLine: number; width?: number }> = ({
  lines,
  activeLine,
  width = 1000,
}) => (
  <div
    style={{
      width,
      backgroundColor: TT.panel,
      border: `1px solid ${TT.border}`,
      borderRadius: 22,
      padding: "30px 0",
      fontFamily: TT.mono,
      fontSize: 31,
      lineHeight: "54px",
      boxSizing: "border-box",
    }}
  >
    {lines.map((line) => {
      const active = line.id === activeLine;
      return (
        <div
          key={line.id}
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: active ? TT.hl : "transparent",
            borderLeft: `6px solid ${active ? TT.hlBar : "transparent"}`,
            paddingLeft: 22,
          }}
        >
          <div
            style={{
              width: 52,
              color: active ? TT.hlBar : TT.textDim,
              fontSize: 24,
              flexShrink: 0,
            }}
          >
            {line.id}
          </div>
          <div style={{ whiteSpace: "pre", opacity: active ? 1 : 0.72 }}>
            {tokenize(line.text)}
          </div>
        </div>
      );
    })}
  </div>
);
