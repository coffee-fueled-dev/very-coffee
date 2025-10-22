import {
  createLZSequencer,
  type LZSequencerProperties,
  type SequencerOutput,
} from "@very-coffee/tkn";
import { useCallback, useMemo, useState } from "react";

export const useLZSequencer = (
  options?: Omit<LZSequencerProperties, "historyOptions" | "emissionPolicy">
) => {
  const [isRunning, setIsRunning] = useState(false);
  const [history, setHistory] = useState<SequencerOutput[]>([]);

  const sequencer = useMemo(
    () => createLZSequencer(options),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const push = useCallback(
    (input: string) => {
      sequencer.push(input);
    },
    [sequencer]
  );

  const flush = useCallback(async () => {
    await sequencer.flush();
  }, [sequencer]);

  const startReader = useCallback(async () => {
    const reader = sequencer.read();
    for await (const segment of reader) {
      setHistory((prev) => [...prev, segment]);
    }
  }, [sequencer]);

  const reset = useCallback(
    (keepMemory: boolean = false) => {
      if (!keepMemory) {
        sequencer.reset();
      }
      setHistory([]);
      setIsRunning(false);
    },
    [sequencer]
  );

  const durationMS = sequencer.durationMS;

  return {
    push,
    flush,
    startReader,
    reset,
    history,
    durationMS,
    isRunning,
    setIsRunning,
  };
};
