import React, { useMemo } from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Easing,
  Audio,
  Sequence,
  staticFile,
} from "remotion";
import { TT } from "./lib/treeTheme";
import { buildTreeTrace, CPP_LINES } from "./lib/invertTree";
import { TreeCanvas } from "./components/TreeCanvas";
import { CallStackBar } from "./components/CallStackBar";
import { CppPanel } from "./components/CppPanel";

export type InvertTreeProps = {
  introFrames: number;
  stepFrames: number;
  outroFrames: number;
  tickSoundEnabled: boolean;
  tickVolume: number;
  successSoundEnabled: boolean;
  successVolume: number;
  musicSrc: string;
  musicVolume: number;
};

// 26 + 36*11 + 28 = 450 frames = exactly 15.0s at 30fps.
export const invertTreeDefaultProps: InvertTreeProps = {
  introFrames: 26,
  stepFrames: 11,
  outroFrames: 28,
  tickSoundEnabled: true,
  tickVolume: 0.3,
  successSoundEnabled: true,
  successVolume: 0.8,
  musicSrc: "",
  musicVolume: 0.4,
};

export const calculateInvertTreeMetadata = ({ props }: { props: InvertTreeProps }) => ({
  durationInFrames:
    props.introFrames + buildTreeTrace().length * props.stepFrames + props.outroFrames,
});

export const InvertTreeShort: React.FC<InvertTreeProps> = ({
  introFrames,
  stepFrames,
  outroFrames,
  tickSoundEnabled,
  tickVolume,
  successSoundEnabled,
  successVolume,
  musicSrc,
  musicVolume,
}) => {
  const frame = useCurrentFrame();
  const steps = useMemo(() => buildTreeTrace(), []);

  const bodyStart = introFrames;
  const bodyEnd = bodyStart + steps.length * stepFrames;

  const rawIndex = Math.floor((frame - bodyStart) / stepFrames);
  const index = Math.min(Math.max(rawIndex, 0), steps.length - 1);
  const local = frame - (bodyStart + index * stepFrames);
  const current = steps[index];
  const prev = steps[Math.max(0, index - 1)];

  const fadeIn = interpolate(frame, [0, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const treeIn = interpolate(frame, [6, 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const finished = frame >= bodyEnd - stepFrames;

  // A tick on every step; the chime lands on the final "mirrored" beat.
  const successAt = bodyStart + (steps.length - 1) * stepFrames;

  return (
    <AbsoluteFill style={{ backgroundColor: TT.bg }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(900px 620px at 50% 8%, rgba(56,189,248,0.11), transparent 62%),
                       radial-gradient(800px 700px at 15% 90%, rgba(45,212,191,0.08), transparent 60%),
                       linear-gradient(180deg, ${TT.bg} 0%, ${TT.bgDeep} 100%)`,
        }}
      />

      {musicSrc.length > 0 && <Audio src={staticFile(musicSrc)} volume={musicVolume} />}

      {tickSoundEnabled &&
        steps.slice(0, -1).map((_, i) => (
          <Sequence key={i} from={bodyStart + i * stepFrames} durationInFrames={stepFrames}>
            <Audio src={staticFile("tick.wav")} volume={tickVolume} />
          </Sequence>
        ))}

      {successSoundEnabled && (
        <Sequence from={successAt} durationInFrames={stepFrames + outroFrames}>
          <Audio src={staticFile("success.wav")} volume={successVolume} />
        </Sequence>
      )}

      <AbsoluteFill style={{ padding: "108px 40px 0" }}>
        {/* Brand strip */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 20px",
            fontFamily: TT.mono,
            fontSize: 22,
            letterSpacing: 4,
            opacity: fadeIn,
          }}
        >
          <span style={{ color: TT.done }}>SHOHOJ CODING</span>
          <span style={{ color: TT.textDim }}>DSA · EP 02</span>
        </div>

        {/* Title */}
        <div style={{ padding: "0 20px", marginTop: 22, opacity: fadeIn }}>
          <div
            style={{
              fontFamily: TT.sans,
              fontSize: 72,
              fontWeight: 800,
              color: TT.text,
              letterSpacing: -1.5,
              lineHeight: 1.05,
            }}
          >
            Invert a <span style={{ color: TT.active }}>Binary Tree</span>
          </div>
          <div
            style={{
              fontFamily: TT.mono,
              fontSize: 25,
              color: TT.textMid,
              marginTop: 12,
            }}
          >
            Swap every node's left and right — bottom up.
          </div>
        </div>

        {/* Live caption pill, above the tree instead of below it */}
        <div style={{ padding: "0 20px", marginTop: 26, height: 66, opacity: fadeIn }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 14,
              backgroundColor: "rgba(56,189,248,0.10)",
              border: `1px solid ${TT.border}`,
              borderRadius: 999,
              padding: "13px 26px",
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: finished ? TT.done : TT.active,
              }}
            />
            <div style={{ fontFamily: TT.mono, fontSize: 26, color: TT.text }}>
              {current.caption}
            </div>
          </div>
        </div>

        {/* Tree */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: 26,
            opacity: treeIn,
            transform: `translateY(${interpolate(treeIn, [0, 1], [22, 0])}px)`,
          }}
        >
          <TreeCanvas
            prev={prev}
            current={current}
            localFrame={local}
            transitionFrames={Math.max(4, stepFrames - 2)}
          />
        </div>

        {/* Call stack */}
        <div style={{ padding: "0 20px", marginTop: 42, opacity: fadeIn }}>
          <CallStackBar stack={current.stack} />
        </div>

        {/* C++ */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: 40,
            opacity: treeIn,
          }}
        >
          <CppPanel lines={CPP_LINES} activeLine={current.activeLine} />
        </div>

        <div
          style={{
            marginTop: "auto",
            padding: "0 20px 54px",
            display: "flex",
            justifyContent: "space-between",
            fontFamily: TT.mono,
            fontSize: 21,
            letterSpacing: 2,
            color: TT.textDim,
            opacity: fadeIn,
          }}
        >
          <span>O(n) time · O(h) stack</span>
          <span style={{ color: finished ? TT.done : TT.textDim }}>
            {finished ? "SAVE THIS ↓" : "LeetCode 226"}
          </span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
