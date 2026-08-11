import React from "react";
import { interpolate, Easing } from "remotion";
import type { MergeSortStep } from "../lib/mergeSortTrace";
import { CatIcon } from "./CatIcon";

const STATE_COLORS = {
  default: "#334155", // slate ring
  compare: "#22d3ee", // cyan ring
  sorted: "#22c55e", // green ring
  activeRange: "rgba(245, 158, 11, 0.55)", // amber
};

// Distinct, bright cat colors so every cat is easy to tell apart and pops
// against the dark background — cycled by token id.
const CAT_PALETTE = [
  "#f4a261",
  "#e76f51",
  "#2a9d8f",
  "#e9c46a",
  "#f28482",
  "#8ecae6",
  "#cdb4db",
  "#ffb4a2",
];

const catColorFor = (id: number) => CAT_PALETTE[id % CAT_PALETTE.length];

interface CatBarsProps {
  prevStep: MergeSortStep;
  currentStep: MergeSortStep;
  localFrame: number;
  transitionFrames: number;
  maxValue: number;
  width?: number;
  laneHeight?: number;
}

export const CatBars: React.FC<CatBarsProps> = ({
  prevStep,
  currentStep,
  localFrame,
  transitionFrames,
  maxValue,
  width = 940,
  laneHeight = 300,
}) => {
  const slotCount = currentStep.tokens.length;
  const slotWidth = width / slotCount;

  const prevSlotOf = (id: number) => {
    const idx = prevStep.tokens.findIndex((t) => t.id === id);
    return idx === -1 ? null : idx;
  };

  const progress = interpolate(localFrame, [0, transitionFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const showRangeBox = currentStep.type !== "done";
  const rangeX = currentStep.low * slotWidth;
  const rangeWidth = (currentStep.high - currentStep.low + 1) * slotWidth;

  return (
    <div style={{ position: "relative", width, height: laneHeight + 70 }}>
      {showRangeBox && (
        <div
          style={{
            position: "absolute",
            left: rangeX + 4,
            top: 0,
            width: rangeWidth - 8,
            height: laneHeight + 50,
            border: `3px dashed ${STATE_COLORS.activeRange}`,
            borderRadius: 20,
          }}
        />
      )}

      {currentStep.tokens.map((token, slotIndex) => {
        const prevSlot = prevSlotOf(token.id);
        const fromSlot = prevSlot === null ? slotIndex : prevSlot;
        const x = interpolate(progress, [0, 1], [fromSlot * slotWidth, slotIndex * slotWidth]);

        const minSize = 46;
        const maxSize = 96;
        const size = minSize + (token.value / maxValue) * (maxSize - minSize);

        let ring = STATE_COLORS.default;
        if (currentStep.sortedIndices.includes(slotIndex)) ring = STATE_COLORS.sorted;
        if (currentStep.compareIndices?.includes(slotIndex)) ring = STATE_COLORS.compare;

        return (
          <div
            key={token.id}
            style={{
              position: "absolute",
              bottom: 0,
              left: x,
              width: slotWidth,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: size + 26,
                height: size + 26,
                borderRadius: "50%",
                backgroundColor: `${ring}22`,
                border: `4px solid ${ring}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CatIcon size={size} color={catColorFor(token.id)} />
            </div>
            <div
              style={{
                marginTop: 10,
                color: "#f1f5f9",
                fontSize: 26,
                fontWeight: 700,
                fontFamily: "Inter, Arial, sans-serif",
              }}
            >
              {token.value}
            </div>
          </div>
        );
      })}
    </div>
  );
};
