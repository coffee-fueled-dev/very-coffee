import type { Key } from "../../sequencer";

export interface IDictionary {
  /**
   * Upsert a key in the cache
   * @param input The key to upsert
   *
   * @returns true if the input was already present in the dictionary
   */
  merge(input: Key): boolean;
  clear(): void;
  size: number;
}
