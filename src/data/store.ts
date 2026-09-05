import type { HistoryEntry } from "../domain/history";
import type { Collection, Environment } from "../domain/request";
import { seedCollection, seedEnvironment } from "./seed";

const KEY = "api-tester.v1";

export type PersistedBench = {
  collections: Collection[];
  env: Environment;
  history: HistoryEntry[];
  selectedCollectionId: string | null;
  selectedRequestId: string | null;
};

export function defaultBench(): PersistedBench {
  const col = seedCollection();
  return {
    collections: [col],
    env: seedEnvironment(),
    history: [],
    selectedCollectionId: col.id,
    selectedRequestId: col.requests[0]?.id ?? null,
  };
}

export function loadBench(): PersistedBench {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultBench();
    const parsed = JSON.parse(raw) as Partial<PersistedBench>;
    const base = defaultBench();
    return {
      collections:
        Array.isArray(parsed.collections) && parsed.collections.length > 0
          ? parsed.collections
          : base.collections,
      env: parsed.env ?? base.env,
      history: Array.isArray(parsed.history) ? parsed.history : [],
      selectedCollectionId: parsed.selectedCollectionId ?? base.selectedCollectionId,
      selectedRequestId: parsed.selectedRequestId ?? base.selectedRequestId,
    };
  } catch {
    return defaultBench();
  }
}

export function saveBench(state: PersistedBench): void {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function clearBench(): void {
  localStorage.removeItem(KEY);
}
