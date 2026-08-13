import React from "react";
import { T } from "../lib/theme";

interface SqlLineProps {
  before: string;
  keyword: string;
  after: string;
  /** 0..1 across the whole statement. */
  typed: number;
  showCursor: boolean;
}

export const SqlLine: React.FC<SqlLineProps> = ({
  before,
  keyword,
  after,
  typed,
  showCursor,
}) => {
  const full = before + keyword + after;
  const shown = Math.round(full.length * typed);

  const b = before.slice(0, Math.min(shown, before.length));
  const k = keyword.slice(0, Math.max(0, Math.min(shown - before.length, keyword.length)));
  const a = after.slice(0, Math.max(0, shown - before.length - keyword.length));

  return (
    <div
      style={{
        width: 960,
        backgroundColor: "rgba(255,255,255,0.045)",
        border: `1px solid ${T.border}`,
        borderLeft: `4px solid ${T.amber}`,
        borderRadius: 14,
        padding: "24px 28px",
        fontFamily: T.mono,
        fontSize: 28,
        lineHeight: "40px",
        color: T.textMid,
        whiteSpace: "pre-wrap",
        minHeight: 92,
        boxSizing: "border-box",
      }}
    >
      {b}
      <span style={{ color: T.amber, fontWeight: 700 }}>{k}</span>
      {a}
      {showCursor && (
        <span
          style={{
            display: "inline-block",
            width: 14,
            height: 28,
            backgroundColor: T.amber,
            transform: "translateY(4px)",
            marginLeft: 2,
          }}
        />
      )}
    </div>
  );
};
