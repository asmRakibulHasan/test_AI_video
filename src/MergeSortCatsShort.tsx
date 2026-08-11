import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Audio, Sequence, staticFile } from "remotion";
import { buildMergeSortTrace, MERGE_SORT_CPP } from "./lib/mergeSortTrace";
import { CatBars } from "./components/CatBars";
import { CodePanel } from "./components/CodePanel";
import { Caption } from "./components/Caption";

export type MergeSortCatsProps = {
  values: number[];
  stepHoldFrames: number;
  /**
   * Frames held on the final sorted state after the last step, so the
   * success chime can ring out and the finished array is readable. There
   * is no outro card — the video ends on the sorted cats themselves.
   */
  tailFrames: number;
  /**
   * Optional filename of a music track placed in `public/`, e.g.
   * "bg-music.mp3". Leave as "" for no background music — no music file
   * ships with this project.
   */
  musicSrc: string;
  musicVolume: number;
  /** Plays public/tick.wav (synthesized, ships included) at every step. */
  tickSoundEnabled: boolean;
  tickVolume: number;
  /** Plays public/success.wav (synthesized, ships included) once sorted. */
  successSoundEnabled: boolean;
  successVolume: number;
};

export const mergeSortCatsDefaultProps: MergeSortCatsProps = {
  values: [8, 3, 6, 1, 9, 2, 7, 4],
  stepHoldFrames: 18,
  tailFrames: 55,
  musicSrc: "",
  musicVolume: 0.5,
  tickSoundEnabled: true,
  tickVolume: 0.4,
  successSoundEnabled: true,
  successVolume: 0.8,
};

// Duration = every step, plus a short tail on the sorted state. No intro
// card and no outro card — it starts and ends on the visualization.
export const calculateMergeSortCatsMetadata = ({
  props,
}: {
  props: MergeSortCatsProps;
}) => {
  const steps = buildMergeSortTrace(props.values);
  const durationInFrames = steps.length * props.stepHoldFrames + props.tailFrames;
  return { durationInFrames };
};

export const MergeSortCatsShort: React.FC<MergeSortCatsProps> = ({
  values,
  stepHoldFrames,
  tailFrames,
  musicSrc,
  musicVolume,
  tickSoundEnabled,
  tickVolume,
  successSoundEnabled,
  successVolume,
}) => {
  const frame = useCurrentFrame();
  const steps = useMemo(() => buildMergeSortTrace(values), [values]);
  const maxValue = Math.max(...values);

  const rawStepIndex = Math.floor(frame / stepHoldFrames);
  const stepIndex = Math.min(Math.max(rawStepIndex, 0), steps.length - 1);
  const localFrame = frame - stepIndex * stepHoldFrames;
  const prevStep = steps[Math.max(0, stepIndex - 1)];
  const currentStep = steps[stepIndex];

  // The final "done" step is where the array is fully sorted — the chime
  // fires exactly there, and ticks stop so they don't step on it.
  const finalStepIndex = steps.length - 1;
  const successFrame = finalStepIndex * stepHoldFrames;

  const captionOpacity = interpolate(
    localFrame,
    [0, 6, stepHoldFrames - 6, stepHoldFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // On the final sorted state, hold the caption fully visible instead of
  // fading it out, since the video ends here.
  const isFinalStep = stepIndex === finalStepIndex;
  const finalCaptionOpacity = interpolate(localFrame, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0b1220" }}>
      {musicSrc.length > 0 && <Audio src={staticFile(musicSrc)} volume={musicVolume} />}

      {tickSoundEnabled &&
        steps.slice(0, finalStepIndex).map((_, i) => (
          <Sequence key={i} from={i * stepHoldFrames} durationInFrames={stepHoldFrames}>
            <Audio src={staticFile("tick.wav")} volume={tickVolume} />
          </Sequence>
        ))}

      {successSoundEnabled && (
        <Sequence from={successFrame} durationInFrames={stepHoldFrames + tailFrames}>
          <Audio src={staticFile("success.wav")} volume={successVolume} />
        </Sequence>
      )}

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
          <div
            style={{
              opacity: isFinalStep ? finalCaptionOpacity : captionOpacity,
              marginTop: 16,
            }}
          >
            <Caption text={currentStep.caption} />
          </div>
        </div>

        {/* Bottom ~62% — large, auto-centered C++ */}
        <div
          style={{
            height: "62%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <CodePanel lines={MERGE_SORT_CPP} activeLineIds={currentStep.activeLines} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
