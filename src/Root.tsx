import React from "react";
import { Composition } from "remotion";
import {
  QuicksortShort,
  quicksortDefaultProps,
  calculateQuicksortMetadata,
} from "./QuicksortShort";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="QuicksortShort"
      component={QuicksortShort}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={600}
      defaultProps={quicksortDefaultProps}
      calculateMetadata={calculateQuicksortMetadata}
    />
  );
};
