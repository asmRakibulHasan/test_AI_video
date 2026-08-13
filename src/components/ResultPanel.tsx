import React from "react";
import { interpolate, spring, Easing } from "remotion";
import { T } from "../lib/theme";
import type { ResultRow } from "../lib/sqlJoins";

const W = 960;
const ROW_H = 72;
const HEADER_H = 54;
const MAX_ROWS = 4;

interface ResultPanelProps {
  rows: ResultRow[];
  /** How many rows have landed so far (fractional — the fraction animates the newest row in). */
  landed: number;
  fps: number;
  countBadge: number | null;
}

const NullCell: React.FC = () => (
  <div
    style={{
      flex: 1,
      fontFamily: T.mono,
      fontSize: 26,
      fontStyle: "italic",
      color: T.rose,
      backgroundImage: `repeating-linear-gradient(45deg, ${T.roseDim} 0 6px, transparent 6px 12px)`,
      borderRadius: 6,
      padding: "6px 10px",
      marginRight: 8,
    }}
  >
    NULL
  </div>
);

export const ResultPanel: React.FC<ResultPanelProps> = ({ rows, landed, fps, countBadge }) => {
  return (
    <div style={{ width: W, position: "relative" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 10,
        }}
      >
        <div style={{ fontFamily: T.mono, fontSize: 21, letterSpacing: 3, color: T.mint }}>
          result
        </div>
        {countBadge !== null && (
          <div
            style={{
              fontFamily: T.mono,
              fontSize: 24,
              fontWeight: 700,
              color: T.bgDeep,
              backgroundColor: T.mint,
              borderRadius: 10,
              padding: "6px 16px",
            }}
          >
            {countBadge} ROWS
          </div>
        )}
      </div>

      <div
        style={{
          border: `1px solid ${T.border}`,
          borderRadius: 16,
          overflow: "hidden",
          backgroundColor: "rgba(255,255,255,0.03)",
          height: HEADER_H + MAX_ROWS * ROW_H,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            height: HEADER_H,
            alignItems: "center",
            padding: "0 22px",
            gap: 12,
            backgroundColor: "rgba(255,255,255,0.05)",
            borderBottom: `1px solid ${T.borderSoft}`,
          }}
        >
          {["id", "name", "student_id", "score"].map((c) => (
            <div
              key={c}
              style={{
                flex: 1,
                fontFamily: T.mono,
                fontSize: 20,
                letterSpacing: 1,
                color: T.textDim,
              }}
            >
              {c}
            </div>
          ))}
        </div>

        {rows.map((r, i) => {
          if (i >= Math.ceil(landed)) return null;
          const rowProgress = Math.min(1, Math.max(0, landed - i));
          const enter = spring({
            frame: rowProgress * 14,
            fps,
            config: { damping: 200, stiffness: 120 },
            durationInFrames: 14,
          });
          const y = interpolate(enter, [0, 1], [26, 0]);
          const hasNull = r.left === null || r.right === null;

          return (
            <div
              key={i}
              style={{
                display: "flex",
                height: ROW_H,
                alignItems: "center",
                padding: "0 22px",
                gap: 12,
                opacity: enter,
                transform: `translateY(${y}px)`,
                borderBottom: `1px solid ${T.borderSoft}`,
                backgroundColor: hasNull ? "rgba(251,113,133,0.05)" : "rgba(74,222,128,0.05)",
              }}
            >
              {r.left ? (
                <>
                  <div style={{ flex: 1, fontFamily: T.mono, fontSize: 28, color: T.text }}>
                    {r.left.id}
                  </div>
                  <div style={{ flex: 1, fontFamily: T.mono, fontSize: 28, color: T.text }}>
                    {r.left.name}
                  </div>
                </>
              ) : (
                <>
                  <NullCell />
                  <NullCell />
                </>
              )}
              {r.right ? (
                <>
                  <div style={{ flex: 1, fontFamily: T.mono, fontSize: 28, color: T.text }}>
                    {r.right.studentId}
                  </div>
                  <div style={{ flex: 1, fontFamily: T.mono, fontSize: 28, color: T.text }}>
                    {r.right.score}
                  </div>
                </>
              ) : (
                <>
                  <NullCell />
                  <NullCell />
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
