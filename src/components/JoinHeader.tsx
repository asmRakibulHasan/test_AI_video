import React from "react";
import { T, BRAND, SERIES } from "../lib/theme";

export const JoinHeader: React.FC<{ opacity: number }> = ({ opacity }) => (
  <div style={{ opacity, padding: "0 60px" }}>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontFamily: T.mono,
        fontSize: 22,
        letterSpacing: 4,
        color: T.textDim,
      }}
    >
      <span style={{ color: T.amber }}>{BRAND}</span>
      <span>{SERIES}</span>
    </div>

    <div style={{ display: "flex", alignItems: "baseline", gap: 18, marginTop: 22 }}>
      <div
        style={{
          fontFamily: T.sans,
          fontSize: 92,
          fontWeight: 800,
          color: T.text,
          letterSpacing: -2,
          lineHeight: 1,
        }}
      >
        SQL <span style={{ color: T.amber }}>JOINS</span>
      </div>
    </div>

    {/*
      Kept in Latin script on purpose: headless Chrome on Linux render
      machines usually has no Bengali font installed, so a Bengali tagline
      renders as empty tofu boxes in the exported mp4 (same class of bug as
      the black-cat emoji). See README for how to enable Bengali properly.
    */}
    <div
      style={{
        fontFamily: T.mono,
        fontSize: 26,
        color: T.violet,
        letterSpacing: 2,
        marginTop: 14,
      }}
    >
      SAME DATA · FOUR DIFFERENT ANSWERS
    </div>
  </div>
);
