import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Audio, Sequence, staticFile } from "remotion";
import { buildMergeSortTrace, MERGE_SORT_PSEUDOCODE } from "./lib/mergeSortTrace";
import { CatBars } from "./components/CatBars";
import { CodePanel } from "./components/CodePanel";
import { Caption } from "./components/Caption";

export type MergeSortCatsProps = {
  values: number[];
  outroFrames: number;
  stepHoldFrames: number;
  /**
   * Optional filename of a music track placed in `public/`, e.g.
   * "bg-music.mp3". Leave as "" to render with no audio at all — this
   * project ships without an actual music file, so nothing plays until
   * you add one and set this.
   */
  musicSrc: string;
  musicVolume: number;
  /** Plays public/tick.wav (synthesized, ships included) at every step. */
  tickSoundEnabled: boolean;
  tickVolume: number;
};

export const mergeSortCatsDefaultProps: MergeSortCatsProps = {
  values: [8, 3, 6, 1, 9, 2, 7, 4],
  outroFrames: 70,
  stepHoldFrames: 18,
  musicSrc: "",
  musicVolume: 0.5,
  tickSoundEnabled: true,
  tickVolume: 0.4,
};

// Duration is derived from however many steps this array produces. No
// intro beat anymore — the video starts directly on the visualization.
export const calculateMergeSortCatsMetadata = ({
  props,
}: {
  props: MergeSortCatsProps;
}) => {
  const steps = buildMergeSortTrace(props.values);
  const durationInFrames = steps.length * props.stepHoldFrames + props.outroFrames;
  return { durationInFrames };
};

export const MergeSortCatsShort: React.FC<MergeSortCatsProps> = ({
  values,
  outroFrames,
  stepHoldFrames,
  musicSrc,
  musicVolume,
  tickSoundEnabled,
  tickVolume,
}) => {
  const frame = useCurrentFrame();
  const steps = useMemo(() => buildMergeSortTrace(values), [values]);
  const maxValue = Math.max(...values);

  const bodyEnd = steps.length * stepHoldFrames;
  const inOutro = frame >= bodyEnd;

  const rawStepIndex = Math.floor(frame / stepHoldFrames);
  const stepIndex = Math.min(Math.max(rawStepIndex, 0), steps.length - 1);
  const localFrame = frame - stepIndex * stepHoldFrames;
  const prevStep = steps[Math.max(0, stepIndex - 1)];
  const currentStep = steps[stepIndex];

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
      {musicSrc.length > 0 && <Audio src={staticFile(musicSrc)} volume={musicVolume} />}

      {tickSoundEnabled &&
        steps.map((_, i) => (
          <Sequence key={i} from={i * stepHoldFrames} durationInFrames={stepHoldFrames}>
            <Audio src={staticFile("tick.wav")} volume={tickVolume} />
          </Sequence>
        ))}

      {!inOutro && (
        <AbsoluteFill style={{ flexDirection: "column" }}>
          {/* Top ~38% — cat visualization */}
          <div
            style={{
              height: "38%",
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
            <div style={{ opacity: captionOpacity, marginTop: 16 }}>
              <Caption text={currentStep.caption} />
            </div>
          </div>

          {/* Bottom ~62% — large, auto-centered C++ pseudocode */}
          <div
            style={{
              height: "62%",
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
