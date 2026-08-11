import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { buildQuicksortTrace } from "./lib/quicksortTrace";
import { Bars } from "./components/Bars";
import { Caption } from "./components/Caption";

export type QuicksortShortProps = {
  values: number[];
  introFrames: number;
  outroFrames: number;
  stepHoldFrames: number;
};

export const quicksortDefaultProps: QuicksortShortProps = {
  values: [5, 2, 8, 1, 9, 3, 7],
  introFrames: 45,
  outroFrames: 60,
  stepHoldFrames: 16,
};

// Remotion calls this before rendering to size the composition based on
// props -- so duration always matches however many steps this array needs.
export const calculateQuicksortMetadata = ({
  props,
}: {
  props: QuicksortShortProps;
}) => {
  const steps = buildQuicksortTrace(props.values);
  const durationInFrames =
    props.introFrames + steps.length * props.stepHoldFrames + props.outroFrames;
  return { durationInFrames };
};

export const QuicksortShort: React.FC<QuicksortShortProps> = ({
  values,
  introFrames,
  outroFrames,
  stepHoldFrames,
}) => {
  const frame = useCurrentFrame();
  const steps = useMemo(() => buildQuicksortTrace(values), [values]);
  const maxValue = Math.max(...values);

  const bodyStart = introFrames;
  const bodyEnd = introFrames + steps.length * stepHoldFrames;

  const inIntro = frame < bodyStart;
  const inOutro = frame >= bodyEnd;

  const rawStepIndex = Math.floor((frame - bodyStart) / stepHoldFrames);
  const stepIndex = Math.min(Math.max(rawStepIndex, 0), steps.length - 1);
  const localFrame = frame - (bodyStart + stepIndex * stepHoldFrames);
  const prevStep = steps[Math.max(0, stepIndex - 1)];
  const currentStep = steps[stepIndex];

  const introOpacity = interpolate(
    frame,
    [0, 15, introFrames - 10, introFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const outroOpacity = interpolate(frame, [bodyEnd, bodyEnd + 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const captionOpacity = interpolate(
    localFrame,
    [0, 6, stepHoldFrames - 6, stepHoldFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0b1220",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {inIntro && (
        <div style={{ opacity: introOpacity, textAlign: "center", padding: "0 60px" }}>
          <div
            style={{
              color: "#ffffff",
              fontSize: 64,
              fontWeight: 800,
              fontFamily: "Inter, Arial, sans-serif",
              lineHeight: 1.2,
            }}
          >
            How Quicksort
            <br />
            Actually Works
          </div>
          <div
            style={{
              color: "#94a3b8",
              fontSize: 30,
              marginTop: 24,
              fontFamily: "Inter, Arial, sans-serif",
            }}
          >
            {values.length} numbers, zero voiceover 👀
          </div>
        </div>
      )}

      {!inIntro && !inOutro && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Bars
            prevStep={prevStep}
            currentStep={currentStep}
            localFrame={localFrame}
            transitionFrames={Math.min(10, stepHoldFrames - 2)}
            maxValue={maxValue}
          />
          <div style={{ opacity: captionOpacity, marginTop: 40 }}>
            <Caption text={currentStep.caption} />
          </div>
        </div>
      )}

      {inOutro && (
        <div style={{ opacity: outroOpacity, textAlign: "center", padding: "0 60px" }}>
          <div
            style={{
              color: "#22c55e",
              fontSize: 56,
              fontWeight: 800,
              fontFamily: "Inter, Arial, sans-serif",
            }}
          >
            Sorted ✅
          </div>
          <div
            style={{
              color: "#e2e8f0",
              fontSize: 30,
              marginTop: 20,
              fontFamily: "Inter, Arial, sans-serif",
            }}
          >
            O(n log n) average time complexity
          </div>
          <div
            style={{
              color: "#64748b",
              fontSize: 26,
              marginTop: 40,
              fontFamily: "Inter, Arial, sans-serif",
            }}
          >
            Follow for more algorithms, visualized
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
