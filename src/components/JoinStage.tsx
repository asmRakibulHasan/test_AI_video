import React from "react";
import { interpolate, Easing } from "remotion";
import { T } from "../lib/theme";
import {
  STUDENTS,
  SCORES,
  isLeftMatched,
  isRightMatched,
  keepsUnmatched,
  matchOf,
  JoinKind,
} from "../lib/sqlJoins";

const W = 960;
const TABLE_W = 400;
const GAP = W - TABLE_W * 2;
const HEADER_H = 52;
const ROW_H = 74;

interface JoinStageProps {
  kind: JoinKind;
  /** 0..1 — arcs draw in, then unmatched rows resolve. */
  linkProgress: number;
}

const rowCenterY = (i: number) => HEADER_H + i * ROW_H + ROW_H / 2;

export const JoinStage: React.FC<JoinStageProps> = ({ kind, linkProgress }) => {
  const keeps = keepsUnmatched(kind);
  const tableH = HEADER_H + Math.max(STUDENTS.length, SCORES.length) * ROW_H;

  const arcDraw = interpolate(linkProgress, [0, 0.55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const verdict = interpolate(linkProgress, [0.5, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const cell = (text: string | number, dim = false, mono = true): React.CSSProperties => ({
    fontFamily: mono ? T.mono : T.sans,
    fontSize: 30,
    color: dim ? T.textDim : T.text,
  });

  const renderTable = (
    title: string,
    cols: string[],
    rows: { key: string; a: string | number; b: string | number; matched: boolean }[],
    side: "left" | "right"
  ) => {
    const kept = side === "left" ? keeps.left : keeps.right;
    return (
      <div style={{ width: TABLE_W }}>
        <div
          style={{
            fontFamily: T.mono,
            fontSize: 21,
            letterSpacing: 3,
            color: side === "left" ? T.amber : T.violet,
            marginBottom: 10,
          }}
        >
          {title}
        </div>
        <div
          style={{
            border: `1px solid ${T.border}`,
            borderRadius: 16,
            overflow: "hidden",
            backgroundColor: T.panel,
          }}
        >
          <div
            style={{
              display: "flex",
              height: HEADER_H,
              alignItems: "center",
              padding: "0 20px",
              gap: 16,
              backgroundColor: "rgba(255,255,255,0.05)",
              borderBottom: `1px solid ${T.borderSoft}`,
            }}
          >
            {cols.map((c) => (
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

          {rows.map((r) => {
            // Unmatched rows: fade toward "dropped" or glow toward "kept",
            // which is the entire lesson of the four join types.
            const unmatchedOpacity = r.matched
              ? 1
              : interpolate(verdict, [0, 1], [0.75, kept ? 1 : 0.28]);
            const ring = r.matched ? T.mint : kept ? T.rose : "transparent";
            const ringAlpha = r.matched ? 1 : verdict;

            return (
              <div
                key={r.key}
                style={{
                  display: "flex",
                  height: ROW_H,
                  alignItems: "center",
                  padding: "0 20px",
                  gap: 16,
                  opacity: unmatchedOpacity,
                  borderBottom: `1px solid ${T.borderSoft}`,
                  boxShadow: r.matched
                    ? `inset 3px 0 0 ${T.mint}`
                    : `inset 3px 0 0 rgba(251,113,133,${ringAlpha * (kept ? 1 : 0)})`,
                  backgroundColor: r.matched
                    ? `rgba(74,222,128,${0.07 * arcDraw})`
                    : kept
                    ? `rgba(251,113,133,${0.06 * verdict})`
                    : "transparent",
                }}
              >
                <div style={{ ...cell(r.a), flex: 1 }}>{r.a}</div>
                <div style={{ ...cell(r.b), flex: 1 }}>{r.b}</div>
                <div
                  style={{
                    width: 26,
                    fontFamily: T.mono,
                    fontSize: 24,
                    color: ring,
                    opacity: ringAlpha,
                    textAlign: "right",
                  }}
                >
                  {r.matched ? "✓" : kept ? "!" : "×"}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={{ position: "relative", width: W }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {renderTable(
          "students",
          ["id", "name"],
          STUDENTS.map((s) => ({
            key: `s${s.id}`,
            a: s.id,
            b: s.name,
            matched: isLeftMatched(s),
          })),
          "left"
        )}
        {renderTable(
          "scores",
          ["student_id", "score"],
          SCORES.map((s) => ({
            key: `c${s.studentId}`,
            a: s.studentId,
            b: s.score,
            matched: isRightMatched(s),
          })),
          "right"
        )}
      </div>

      {/* Curved key-matching arcs drawn in the gap between the tables */}
      <svg
        width={W}
        height={tableH + 40}
        viewBox={`0 0 ${W} ${tableH + 40}`}
        style={{ position: "absolute", left: 0, top: 40, pointerEvents: "none" }}
      >
        {STUDENTS.map((s, li) => {
          const match = matchOf(s);
          if (!match) return null;
          const ri = SCORES.findIndex((c) => c.studentId === match.studentId);
          const x1 = TABLE_W;
          const x2 = TABLE_W + GAP;
          const y1 = rowCenterY(li);
          const y2 = rowCenterY(ri);
          const bow = 46;
          const d = `M ${x1} ${y1} C ${x1 + bow} ${y1}, ${x2 - bow} ${y2}, ${x2} ${y2}`;
          const len = 260;

          return (
            <g key={s.id}>
              <path
                d={d}
                fill="none"
                stroke={T.mint}
                strokeWidth={3}
                strokeLinecap="round"
                strokeDasharray={len}
                strokeDashoffset={len * (1 - arcDraw)}
                opacity={0.9}
              />
              <circle cx={x1} cy={y1} r={5} fill={T.mint} opacity={arcDraw} />
              <circle cx={x2} cy={y2} r={5} fill={T.mint} opacity={arcDraw} />
            </g>
          );
        })}
      </svg>
    </div>
  );
};
