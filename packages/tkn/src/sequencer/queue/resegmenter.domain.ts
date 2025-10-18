import type { SequencerOutput } from "../sequencer.domain";

export interface IResegmenter {
  evaluate(segments: SequencerOutput[]): {
    segments: SequencerOutput[];
    skipped: boolean;
  };
}

export abstract class Resegmenter implements IResegmenter {
  evaluate: IResegmenter["evaluate"] = (segments) => {
    if (this.skipWhen(segments)) return { skipped: true, segments };
    return { skipped: false, segments: this.transform(segments) };
  };
  protected abstract transform(input: SequencerOutput[]): SequencerOutput[];
  protected abstract skipWhen(segments: SequencerOutput[]): boolean;
}
