import React from "react";
import { Composition } from "remotion";
import {
  QuicksortShort,
  quicksortDefaultProps,
  calculateQuicksortMetadata,
} from "./QuicksortShort";
import {
  MergeSortCatsShort,
  mergeSortCatsDefaultProps,
  calculateMergeSortCatsMetadata,
} from "./MergeSortCatsShort";
import {
  SqlJoinsShort,
  sqlJoinsDefaultProps,
  calculateSqlJoinsMetadata,
} from "./SqlJoinsShort";

export const RemotionRoot: React.FC = () => {
  return (
    <>
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
      <Composition
        id="MergeSortCatsShort"
        component={MergeSortCatsShort}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={600}
        defaultProps={mergeSortCatsDefaultProps}
        calculateMetadata={calculateMergeSortCatsMetadata}
      />
      <Composition
        id="SqlJoinsShort"
        component={SqlJoinsShort}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={450}
        defaultProps={sqlJoinsDefaultProps}
        calculateMetadata={calculateSqlJoinsMetadata}
      />
    </>
  );
};
