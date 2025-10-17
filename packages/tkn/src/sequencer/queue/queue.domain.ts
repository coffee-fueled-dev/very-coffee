import type { SequencerOutput } from "../sequencer.domain";
import {
  BoundedHistory,
  UnboundedHistory,
  type IQueueHistory,
} from "./history.domain";

export type Transform = (input: SequencerOutput[]) => SequencerOutput[];
export type Condition = (queue: SequencerOutput[]) => boolean;

export interface IQueue {
  push(input: SequencerOutput | void): void;
  read(): AsyncGenerator<SequencerOutput, void, unknown>;
  /**
   * The history of the queue
   */
  history: SequencerOutput[];
}

export class Queue implements IQueue {
  readonly _transforms?: Transform[];
  private _queue: SequencerOutput[] = [];
  private _resolvers: ((value: SequencerOutput) => void)[] = [];
  private _flushCondition: Condition;
  private _history?: IQueueHistory;

  /**
   * @param flushCondition A function that determines if the current members of the queue are ready to be flushed.
   * @param transforms When provided, transforms run on the entire current queue each time push is called.
   * @param history Optional history tracking configuration
   */
  constructor({
    flushCondition,
    transforms,
    historyOptions,
  }: {
    flushCondition: Condition;
    transforms?: Transform[];
    historyOptions?: { bounded: true; maxLength: number } | { bounded: false };
  }) {
    this._transforms = transforms;
    this._flushCondition = flushCondition;

    if (historyOptions) {
      this._history = historyOptions.bounded
        ? new BoundedHistory(historyOptions.maxLength)
        : new UnboundedHistory();
    }
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

    // Drain queue to waiting resolvers and track history
    while (this._queue.length > 0 && this._resolvers.length > 0) {
      const item = this._queue.shift()!;
      const resolver = this._resolvers.shift()!;
      if (this._history) {
        this._history.push(item);
      }
      resolver(item);
    }
  };

  async *read(): ReturnType<IQueue["read"]> {
    while (true) {
      if (this._queue.length > 0) {
        const item = this._queue.shift()!;
        if (this._history) {
          this._history.push(item);
        }
        yield item;
      } else {
        // Wait for a new element to be pushed
        yield await new Promise<SequencerOutput>((resolve) => {
          this._resolvers.push(resolve);
        });
      }
    }
  }

  get history(): SequencerOutput[] {
    return this._history?.get() ?? [];
  }
}
