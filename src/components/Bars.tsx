import React from "react";
import { interpolate, Easing } from "remotion";
import type { QuicksortStep } from "../lib/quicksortTrace";

const COLORS = {
  default: "#475569", // slate
  pivot: "#f59e0b", // amber
  compare: "#22d3ee", // cyan
  swap: "#f43f5e", // rose
  sorted: "#22c55e", // green
};

interface BarsProps {
  prevStep: QuicksortStep;
  currentStep: QuicksortStep;
  localFrame: number;
  transitionFrames: number;
  maxValue: number;
  width?: number;
  maxBarHeight?: number;
}

export const Bars: React.FC<BarsProps> = ({
  prevStep,
  currentStep,
  localFrame,
  transitionFrames,
  maxValue,
  width = 900,
  maxBarHeight = 560,
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

  return (
    <div style={{ position: "relative", width, height: maxBarHeight + 40 }}>
      {currentStep.tokens.map((token, slotIndex) => {
        const prevSlot = prevSlotOf(token.id);
        const fromSlot = prevSlot === null ? slotIndex : prevSlot;
        const x = interpolate(progress, [0, 1], [fromSlot * slotWidth, slotIndex * slotWidth]);
        const barHeight = (token.value / maxValue) * maxBarHeight;

        let color = COLORS.default;
        if (currentStep.sortedIndices.includes(slotIndex)) color = COLORS.sorted;
        if (currentStep.pivotIndex === slotIndex) color = COLORS.pivot;
        if (currentStep.compareIndex === slotIndex) color = COLORS.compare;
        if (currentStep.swapIndices?.includes(slotIndex)) color = COLORS.swap;

        return (
          <div
            key={token.id}
            style={{
              position: "absolute",
              bottom: 0,
              left: x + 8,
              width: slotWidth - 16,
              height: barHeight,
              backgroundColor: color,
              borderRadius: 10,
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
              paddingTop: 12,
              color: "white",
              fontSize: 34,
              fontWeight: 700,
              fontFamily: "Inter, Arial, sans-serif",
            }}
          >
            {token.value}
          </div>
        );
      })}
    </div>
  );
};
