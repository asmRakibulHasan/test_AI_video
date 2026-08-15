import React from "react";
import { interpolate, Easing } from "remotion";
import { TT, colorFor } from "../lib/treeTheme";
import { CANVAS_W, CANVAS_H, TreeStep } from "../lib/invertTree";

interface TreeCanvasProps {
  prev: TreeStep;
  current: TreeStep;
  localFrame: number;
  transitionFrames: number;
}

const R = 34; // node half-size (rounded squares, not circles)

export const TreeCanvas: React.FC<TreeCanvasProps> = ({
  prev,
  current,
  localFrame,
  transitionFrames,
}) => {
  const t = interpolate(localFrame, [0, transitionFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  // Nodes keep stable ids across steps, so a swap reads as two chips
  // gliding past each other rather than values blinking in place.
  const posOf = (id: number) => {
    const a = prev.nodes.find((n) => n.id === id);
    const b = current.nodes.find((n) => n.id === id)!;
    if (!a) return { x: b.x, y: b.y };
    return { x: interpolate(t, [0, 1], [a.x, b.x]), y: interpolate(t, [0, 1], [a.y, b.y]) };
  };

  return (
    <svg
      width={CANVAS_W}
      height={CANVAS_H}
      viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
      style={{ overflow: "visible" }}
    >
      {/* Mirror axis — the visual thesis of the whole video */}
      <line
        x1={CANVAS_W / 2}
        y1={10}
        x2={CANVAS_W / 2}
        y2={CANVAS_H - 20}
        stroke={TT.axis}
        strokeWidth={2}
        strokeDasharray="10 12"
      />

      {current.edges.map((e) => {
        const a = posOf(e.from);
        const b = posOf(e.to);
        const midY = (a.y + b.y) / 2;
        // Gentle S-curve instead of a straight segment.
        const d = `M ${a.x} ${a.y + R} C ${a.x} ${midY}, ${b.x} ${midY}, ${b.x} ${b.y - R}`;
        const child = current.nodes.find((n) => n.id === e.to)!;
        const lit = child.state !== "idle";
        return (
          <path
            key={`${e.from}-${e.to}`}
            d={d}
            fill="none"
            stroke={lit ? colorFor(child.state) : "rgba(148,180,255,0.22)"}
            strokeWidth={lit ? 3 : 2}
            strokeLinecap="round"
            opacity={lit ? 0.85 : 0.5}
          />
        );
      })}

      {current.nodes.map((n) => {
        const p = posOf(n.id);
        const c = colorFor(n.state);
        const glow = n.state === "idle" ? 0 : 1;
        return (
          <g key={n.id} transform={`translate(${p.x}, ${p.y})`}>
            {glow > 0 && (
              <rect
                x={-R - 7}
                y={-R - 7}
                width={(R + 7) * 2}
                height={(R + 7) * 2}
                rx={22}
                fill="none"
                stroke={c}
                strokeWidth={2}
                opacity={0.35}
              />
            )}
            <rect
              x={-R}
              y={-R}
              width={R * 2}
              height={R * 2}
              rx={18}
              fill={n.state === "idle" ? TT.panel : c}
              stroke={n.state === "idle" ? "rgba(148,180,255,0.25)" : c}
              strokeWidth={2}
            />
            <text
              x={0}
              y={11}
              textAnchor="middle"
              fontFamily={TT.mono}
              fontSize={32}
              fontWeight={700}
              fill={n.state === "idle" ? TT.idleText : "#06121f"}
            >
              {n.value}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
