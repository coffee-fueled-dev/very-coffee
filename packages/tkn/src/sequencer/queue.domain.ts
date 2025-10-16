import type { SequencerOutput } from "./sequencer.domain";

export type Transform = (input: SequencerOutput[]) => SequencerOutput[];
export type Condition = (queue: SequencerOutput[]) => boolean;

export interface IQueue {
  push(input: SequencerOutput | void): void;
  read(): AsyncGenerator<SequencerOutput, void, unknown>;
}

export class Queue implements IQueue {
  readonly _transforms?: Transform[];
  private _queue: SequencerOutput[] = [];
  private _resolvers: ((value: SequencerOutput) => void)[] = [];
  private _flushCondition: Condition;

  /**
   * @param flushCondition A function that determines if the current members of the queue are ready to be flushed.
   * @param transforms When provided, transforms run on the entire current queue each time push is called.
   */
  constructor(flushCondition: Condition, transforms?: Transform[]) {
    this._transforms = transforms;
    this._flushCondition = flushCondition;
  }

  push: IQueue["push"] = (input) => {
    if (!input) return;
    this._queue.push(input);
    let transformed = this._queue;
    if (this._transforms) {
      for (const transform of this._transforms) {
        transformed = transform(transformed);
      }
    }

    if (!this._flushCondition(this._queue)) return void 0;

    for (const item of this._queue) {
      // If someone is waiting, resolve immediately
      this._resolvers.shift()?.(item) || this._queue.push(item);
    }
  };

  async *read(): ReturnType<IQueue["read"]> {
    while (true) {
      if (this._queue.length > 0) {
        yield this._queue.shift()!;
      } else {
        // Wait for a new element to be pushed
        yield await new Promise<SequencerOutput>((resolve) => {
          this._resolvers.push(resolve);
        });
      }
    }
  }
}
