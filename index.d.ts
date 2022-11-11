// Type definitions for pino-tee 0.3
// Project: https://github.com/pinojs/pino-tee#readme
// Definitions by: Joabe Silva <https://github.com/Joabesv>
/// <reference types="node" />

import { Transform } from "node:stream";
import { levels } from "pino";
import { Cloneable } from "cloneable-readable";

declare function PinoTee(options?: TeeOptions_): PinoTee.PinoTeeStream;

interface TeeOptions_ {
  filter: string | number | ((line: typeof levels) => typeof line);
}

declare namespace PinoTee {
  type TeeOptions = TeeOptions_;
  type PinoTeeStream = Cloneable<Transform>;
}

export default PinoTee;
export { PinoTee, TeeOptions_ as PinoTeeOptions };
