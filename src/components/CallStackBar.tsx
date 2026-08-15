import React from "react";
import { TT } from "../lib/treeTheme";

/**
 * Live recursion stack as chips. The reference-style videos leave the call
 * stack implicit in the node colors; showing it explicitly is what makes
 * "recursion" click for beginners — you watch it grow and unwind.
 */
export const CallStackBar: React.FC<{ stack: number[]; maxDepth?: number }> = ({
  stack,
  maxDepth = 3,
}) => {
  const slots = Array.from({ length: maxDepth }, (_, i) => stack[i]);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div
        style={{
          fontFamily: TT.mono,
          fontSize: 20,
          letterSpacing: 3,
          color: TT.textDim,
          width: 132,
        }}
      >
        CALL STACK
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        {slots.map((v, i) => {
          const filled = v !== undefined;
          const isTop = filled && i === stack.length - 1;
          return (
            <React.Fragment key={i}>
              {i > 0 && (
                <div style={{ color: filled ? TT.active : TT.idle, fontSize: 22 }}>›</div>
              )}
              <div
                style={{
                  minWidth: 58,
                  height: 52,
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: TT.mono,
                  fontSize: 26,
                  fontWeight: 700,
                  color: filled ? (isTop ? "#06121f" : TT.text) : TT.idle,
                  backgroundColor: isTop ? TT.active : filled ? "rgba(56,189,248,0.14)" : "transparent",
                  border: `2px ${filled ? "solid" : "dashed"} ${
                    filled ? TT.active : "rgba(148,180,255,0.16)"
                  }`,
                }}
              >
                {filled ? v : "·"}
              </div>
            </React.Fragment>
          );
        })}
        <div
          style={{
            marginLeft: 12,
            fontFamily: TT.mono,
            fontSize: 20,
            color: TT.textDim,
          }}
        >
          depth {stack.length}
        </div>
      </div>
    </div>
  );
};
