import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
  Audio,
  Sequence,
  staticFile,
} from "remotion";
import { T } from "./lib/theme";
import { JOINS, resultRowsFor, rowCountFor, sqlFor } from "./lib/sqlJoins";
import { JoinHeader } from "./components/JoinHeader";
import { JoinRail } from "./components/JoinRail";
import { JoinStage } from "./components/JoinStage";
import { SqlLine } from "./components/SqlLine";
import { ResultPanel } from "./components/ResultPanel";

export type SqlJoinsProps = {
  introFrames: number;
  sectionFrames: number;
  finaleFrames: number;
  tickSoundEnabled: boolean;
  tickVolume: number;
  successSoundEnabled: boolean;
  successVolume: number;
  musicSrc: string;
  musicVolume: number;
};

// 30 + 4*90 + 60 = 450 frames = exactly 15.0s at 30fps.
export const sqlJoinsDefaultProps: SqlJoinsProps = {
  introFrames: 30,
  sectionFrames: 90,
  finaleFrames: 60,
  tickSoundEnabled: true,
  tickVolume: 0.32,
  successSoundEnabled: true,
  successVolume: 0.8,
  musicSrc: "",
  musicVolume: 0.4,
};

export const calculateSqlJoinsMetadata = ({ props }: { props: SqlJoinsProps }) => ({
  durationInFrames: props.introFrames + JOINS.length * props.sectionFrames + props.finaleFrames,
});

export const SqlJoinsShort: React.FC<SqlJoinsProps> = ({
  introFrames,
  sectionFrames,
  finaleFrames,
  tickSoundEnabled,
  tickVolume,
  successSoundEnabled,
  successVolume,
  musicSrc,
  musicVolume,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bodyStart = introFrames;
  const bodyEnd = bodyStart + JOINS.length * sectionFrames;
  const finished = frame >= bodyEnd;

  const rawIndex = Math.floor((frame - bodyStart) / sectionFrames);
  const index = Math.min(Math.max(rawIndex, 0), JOINS.length - 1);
  const local = frame - (bodyStart + index * sectionFrames);
  const spec = JOINS[index];
  const rows = resultRowsFor(spec.kind);
  const sql = sqlFor(spec);

  // --- Section beat map (per sectionFrames) --------------------------------
  const typed = interpolate(local, [4, 34], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const linkProgress = interpolate(local, [30, 62], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rowsStart = 52;
  const rowsPerFrame = 9;
  const landed = finished
    ? rows.length
    : Math.max(0, Math.min(rows.length, (local - rowsStart) / rowsPerFrame));
  const showBadge = landed >= rows.length && local > rowsStart;

  // Heading swaps with a small spring on each new section.
  const headingIn = spring({
    frame: local,
    fps,
    config: { damping: 200, stiffness: 90 },
    durationInFrames: 16,
  });

  const introOpacity = interpolate(frame, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const stageIn = interpolate(frame, [8, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const finaleT = interpolate(frame, [bodyEnd, bodyEnd + 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Ticks fire when each result row lands; the chime lands on the finale.
  const tickFrames: number[] = [];
  if (tickSoundEnabled) {
    JOINS.forEach((j, si) => {
      const base = bodyStart + si * sectionFrames + rowsStart;
      for (let r = 0; r < rowCountFor(j.kind); r++) {
        tickFrames.push(base + r * rowsPerFrame);
      }
    });
  }

  const activeProgress = interpolate(local, [rowsStart, sectionFrames - 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: T.bg }}>
      {/* Warm radial glow + vignette */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(1100px 700px at 50% 12%, rgba(246,169,43,0.10), transparent 65%),
                       radial-gradient(900px 800px at 80% 85%, rgba(167,139,250,0.09), transparent 60%),
                       linear-gradient(180deg, ${T.bg} 0%, ${T.bgDeep} 100%)`,
        }}
      />

      {musicSrc.length > 0 && <Audio src={staticFile(musicSrc)} volume={musicVolume} />}

      {tickFrames.map((f, i) => (
        <Sequence key={i} from={f} durationInFrames={12}>
          <Audio src={staticFile("tick.wav")} volume={tickVolume} />
        </Sequence>
      ))}

      {successSoundEnabled && (
        <Sequence from={bodyEnd} durationInFrames={finaleFrames}>
          <Audio src={staticFile("success.wav")} volume={successVolume} />
        </Sequence>
      )}

      <AbsoluteFill style={{ paddingTop: 120 }}>
        <JoinHeader opacity={introOpacity} />

        <div style={{ marginTop: 44 }}>
          <JoinRail
            activeIndex={index}
            activeProgress={activeProgress}
            finished={finished}
            opacity={introOpacity}
          />
        </div>

        {/* Hero join name — swaps per section instead of a static 4-row list */}
        <div style={{ padding: "0 60px", marginTop: 54, height: 132 }}>
          {!finished ? (
            <div
              style={{
                opacity: headingIn,
                transform: `translateY(${interpolate(headingIn, [0, 1], [16, 0])}px)`,
              }}
            >
              <div
                style={{
                  fontFamily: T.sans,
                  fontSize: 64,
                  fontWeight: 800,
                  color: T.text,
                  letterSpacing: -1,
                }}
              >
                {spec.label}
                <span style={{ color: T.amber, fontSize: 34, marginLeft: 16, fontWeight: 600 }}>
                  {spec.tagline}
                </span>
              </div>
              <div
                style={{
                  fontFamily: T.mono,
                  fontSize: 26,
                  color: T.textMid,
                  marginTop: 12,
                }}
              >
                {spec.rule}
              </div>
            </div>
          ) : (
            <div style={{ opacity: finaleT }}>
              <div
                style={{
                  fontFamily: T.sans,
                  fontSize: 60,
                  fontWeight: 800,
                  color: T.mint,
                  letterSpacing: -1,
                }}
              >
                Same data. Four answers.
              </div>
              <div
                style={{
                  fontFamily: T.mono,
                  fontSize: 26,
                  color: T.textMid,
                  marginTop: 12,
                }}
              >
                INNER 2 · LEFT 3 · RIGHT 3 · FULL 4
              </div>
            </div>
          )}
        </div>

        <div
          style={{
            marginTop: 38,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 44,
            opacity: stageIn,
            transform: `translateY(${interpolate(stageIn, [0, 1], [24, 0])}px)`,
          }}
        >
          <SqlLine
            before={sql.before}
            keyword={sql.keyword}
            after={sql.after}
            typed={finished ? 1 : typed}
            showCursor={!finished && typed < 1}
          />
          <JoinStage kind={spec.kind} linkProgress={finished ? 1 : linkProgress} />
          <ResultPanel
            rows={rows}
            landed={landed}
            fps={fps}
            countBadge={showBadge || finished ? rows.length : null}
          />
        </div>

        <div
          style={{
            marginTop: "auto",
            padding: "0 60px 64px",
            display: "flex",
            justifyContent: "space-between",
            fontFamily: T.mono,
            fontSize: 22,
            letterSpacing: 2,
            color: T.textDim,
            opacity: introOpacity,
          }}
        >
          <span>3 students · 3 scores · 1 unmatched each side</span>
          <span style={{ color: finished ? T.amber : T.textDim }}>
            {finished ? "SAVE THIS ↓" : "SHOHOJ CODING"}
          </span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
