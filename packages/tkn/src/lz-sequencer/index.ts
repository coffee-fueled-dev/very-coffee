import { Queue, Sequencer } from "../sequencer";
import { Bounded } from "./dictionary/bounded";
import { Unbounded } from "./dictionary/unbounded";
import { LZGate } from "./lz-gate";

export { LZGate, type LZGateConfig, type LZCustomMetrics } from "./lz-gate";

export interface LZSequencerProperties {
  cacheOptions?: { bounded: true; max: number } | { bounded: false };
  historyOptions?: { bounded: true; maxLength: number } | { bounded: false };
  emissionPolicy?: "immediate"; // TODO: add other policies
}
export const createLZSequencer = (
  properties?: LZSequencerProperties
): Sequencer<LZGate[]> => {
  const cache = properties?.cacheOptions?.bounded
    ? new Bounded(properties.cacheOptions.max)
    : new Unbounded();

  const gate = new LZGate({ cache });

  const queue = new Queue({
    flushCondition: (queue) => queue.length > 0,
    historyOptions: properties?.historyOptions,
  });

  const sequencer = new Sequencer({
    gates: [gate],
    queue,
  });

  return sequencer;
};
