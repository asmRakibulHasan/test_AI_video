import React from "react";
import { T } from "../lib/theme";
import { JOINS, rowCountFor } from "../lib/sqlJoins";

interface JoinRailProps {
  activeIndex: number;
  /** 0..1 fill of the currently active segment. */
  activeProgress: number;
  finished: boolean;
  opacity: number;
}

/**
 * Four horizontal segments that fill left-to-right, instead of a numeric
 * "01 / 04" badge. Completed segments keep their row-count so the finished
 * rail doubles as the summary.
 */
export const JoinRail: React.FC<JoinRailProps> = ({
  activeIndex,
  activeProgress,
  finished,
  opacity,
}) => (
  <div style={{ opacity, display: "flex", gap: 14, padding: "0 60px" }}>
    {JOINS.map((j, i) => {
      const done = finished || i < activeIndex;
      const active = !finished && i === activeIndex;
      const fill = done ? 1 : active ? activeProgress : 0;
      const accent = done ? T.mint : T.amber;

      return (
        <div key={j.kind} style={{ flex: 1 }}>
          <div
            style={{
              height: 8,
              borderRadius: 4,
              backgroundColor: "rgba(255,255,255,0.09)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${fill * 100}%`,
                height: "100%",
                backgroundColor: accent,
                borderRadius: 4,
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 12,
              fontFamily: T.mono,
              fontSize: 19,
              letterSpacing: 1,
              color: done || active ? T.text : T.textDim,
            }}
          >
            <span>{j.kind}</span>
            <span style={{ color: done ? T.mint : "transparent", fontWeight: 700 }}>
              {rowCountFor(j.kind)}
            </span>
          </div>
        </div>
      );
    })}
  </div>
);
