import type { IGate, IGateConfig } from "../sequencer";
import type { IDictionary } from "./dictionary/dictionary.domain";

export interface LZGateConfig extends IGateConfig {
  cache: IDictionary;
  stats?: boolean;
}

export type LZCustomMetrics = {
  cacheUtilization: number;
};

export class LZGate implements IGate<LZCustomMetrics> {
  _ingested = 0;
  _passed = 0;
  _name: string;
  _cache: IDictionary;
  _stats?: boolean;

  constructor({ name = "LZGate", cache, stats }: LZGateConfig) {
    this._name = name ?? this.constructor.name;
    this._cache = cache;
    this._stats = stats;
  }

  // Simple LZ-style inclusion heuristic
  evaluate: IGate<LZCustomMetrics>["evaluate"] = (current) => {
    if (!this._stats) return this._cache.merge(current);
    this._ingested += 1;
    const wasKnown = this._cache.merge(current);
    if (wasKnown) this._passed += 1;
    return wasKnown;
  };

  reset = (): void => {
    this._cache.clear();
  };

  snapshot: IGate<LZCustomMetrics>["snapshot"] = async () => ({
    name: this._name,
    passRate: this._passed / this._ingested,
    ingested: this._ingested,
    customMetrics: {
      cacheUtilization: this._cache.size,
    },
  });
}

export const createLZGate = (config: LZGateConfig) => new LZGate(config);
