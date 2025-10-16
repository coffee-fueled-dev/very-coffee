import { type IGate, type IGateSnapshot } from "./gate.domain";
import type { IQueue } from "./queue.domain";

export type Value = string;
export type Sentinel = `<${number}>`;
export type Key = string;
export type SequencerInput = Value | Sentinel;
export type SequencerOutput = SequencerInput[];

export interface ISequencerConfig<TGates extends IGate[] = IGate[]> {
  name?: string;
  gates: TGates;
  queue: IQueue;
}

export interface ISequencerSnapshot {
  name: string;
  durationMS: number;
  gates: IGateSnapshot[];
}

export interface ISequencer {
  /**
   * The gates used to determine if a sequence should be emitted
   */
  readonly _gates: IGate[];
  /**
   * The queue which receives segmentation results
   */
  readonly _queue: IQueue;
  /**
   * Processes a single int and returns the longest known subsequence if found
   * @param input The value to process or a sentinel
   * @returns Output sequences triggered by the input value
   */
  push(input: SequencerInput): SequencerOutput | void;
  /**
   * Flushes the current state
   * @returns The currently buffered sequences
   */
  flush(): SequencerOutput;
  /**
   * Resets all internal state
   */
  reset(): void;
  /**
   * @returns A snapshot of the internal state
   */
  snapshot(): Promise<ISequencerSnapshot[]>;
  /**
   * The amount of time since the first time push was called for this sequencer
   */
  durationMS: number;
}

export class Sequencer<TGates extends IGate[] = IGate[]> implements ISequencer {
  private _name: string;
  private _timeStart = 0;
  private _previousKey = "";
  private _candidate: SequencerInput[] = [];
  readonly _gates: TGates;
  readonly _queue: IQueue;
  constructor({ name, gates, queue }: ISequencerConfig<TGates>) {
    this._name = name ?? this.constructor.name;
    this._gates = gates ?? [];
    this._queue = queue;
  }

  push: ISequencer["push"] = (input) => {
    this._candidate.push(input);
    const key = `${this._previousKey}${input}`;
    this._queue.push(this._evaluateGates(key, this._previousKey));
    this._previousKey = key;
  };

  private _evaluateGates(
    currentKey: Key,
    previousKey: Key
  ): SequencerOutput | void {
    for (let index = 0; index < this._gates.length; index++) {
      // Continue as long as the gate passes
      if (this._gates[index].evaluate(currentKey, previousKey)) continue;

      // The last input added caused the gate to fail this gate.
      // We reset the candidate to this value and
      // emit the last known candidate
      return this._candidate.splice(0, this._candidate.length - 1);
    }
  }

  flush: ISequencer["flush"] = () => {
    return this._candidate;
  };

  reset: ISequencer["reset"] = () => {
    this._candidate = [];
    this._timeStart = 0;
    this._gates.forEach((gate) => gate.reset());
  };

  snapshot: ISequencer["snapshot"] = async () => {
    return [
      {
        name: this._name,
        gates: await Promise.all(
          this._gates.map(
            async (gate) =>
              (await gate.snapshot()) ?? {
                name: gate.constructor.name,
                ingested: 0,
                passRate: 0,
              }
          )
        ),
        durationMS: performance.now() - this._timeStart,
      },
    ];
  };

  get durationMS(): number {
    return performance.now() - this._timeStart;
  }
}
