import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { buildMergeSortTrace, MERGE_SORT_PSEUDOCODE } from "./lib/mergeSortTrace";
import { CatBars } from "./components/CatBars";
import { CodePanel } from "./components/CodePanel";
import { Caption } from "./components/Caption";

export type MergeSortCatsProps = {
  values: number[];
  introFrames: number;
  outroFrames: number;
  stepHoldFrames: number;
};

export const mergeSortCatsDefaultProps: MergeSortCatsProps = {
  values: [8, 3, 6, 1, 9, 2, 7, 4],
  introFrames: 45,
  outroFrames: 70,
  stepHoldFrames: 18,
};

// Duration is derived from however many steps this array produces, same
// pattern as QuicksortShort.
export const calculateMergeSortCatsMetadata = ({
  props,
}: {
  props: MergeSortCatsProps;
}) => {
  const steps = buildMergeSortTrace(props.values);
  const durationInFrames =
    props.introFrames + steps.length * props.stepHoldFrames + props.outroFrames;
  return { durationInFrames };
};

export const MergeSortCatsShort: React.FC<MergeSortCatsProps> = ({
  values,
  introFrames,
  outroFrames,
  stepHoldFrames,
}) => {
  const frame = useCurrentFrame();
  const steps = useMemo(() => buildMergeSortTrace(values), [values]);
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
    <AbsoluteFill style={{ backgroundColor: "#0b1220" }}>
      {inIntro && (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          <div style={{ opacity: introOpacity, textAlign: "center", padding: "0 60px" }}>
            <div
              style={{
                color: "#ffffff",
                fontSize: 60,
                fontWeight: 800,
                fontFamily: "Inter, Arial, sans-serif",
                lineHeight: 1.2,
              }}
            >
              Merge Sort,
              <br />
              With Cats 🐱
            </div>
            <div
              style={{
                color: "#94a3b8",
                fontSize: 28,
                marginTop: 20,
                fontFamily: "Inter, Arial, sans-serif",
              }}
            >
              O(n log n) — guaranteed, every time
            </div>
          </div>
        </AbsoluteFill>
      )}

      {!inIntro && !inOutro && (
        <AbsoluteFill style={{ flexDirection: "column" }}>
          {/* Top 50% — cat visualization */}
          <div
            style={{
              height: "50%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CatBars
              prevStep={prevStep}
              currentStep={currentStep}
              localFrame={localFrame}
              transitionFrames={Math.min(12, stepHoldFrames - 2)}
              maxValue={maxValue}
            />
            <div style={{ opacity: captionOpacity, marginTop: 20 }}>
              <Caption text={currentStep.caption} />
            </div>
          </div>

          {/* Bottom 50% — C++ pseudocode with active-line highlight */}
          <div
            style={{
              height: "50%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderTop: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <CodePanel lines={MERGE_SORT_PSEUDOCODE} activeLineIds={currentStep.activeLines} />
          </div>
        </AbsoluteFill>
      )}

      {inOutro && (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
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
              O(n log n) — worst case, every time
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
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
