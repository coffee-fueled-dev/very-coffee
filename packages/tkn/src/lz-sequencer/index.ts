import { Queue, Sequencer } from "@/sequencer";
import { Bounded } from "./dictionary/bounded";
import { Unbounded } from "./dictionary/unbounded";
import { LZGate } from "./lz-gate";

export const createLZSequencer = (
  cacheOptions: { bounded: true; max: number } | { bounded: false },
  _emissionPolicy: "immediate" // TODO: add other policies
) => {
  const cache = cacheOptions.bounded
    ? new Bounded(cacheOptions.max)
    : new Unbounded();

  const gate = new LZGate({ cache });

  const queue = new Queue((queue) => queue.length > 0);

  const sequencer = new Sequencer({
    gates: [gate],
    queue,
  });

  return sequencer;
};
