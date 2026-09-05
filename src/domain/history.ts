export type HistoryEntry = {
  id: string;
  at: number;
  method: string;
  url: string;
  status: number | null;
  ok: boolean;
  ms: number;
  error?: string;
};

export const HISTORY_CAP = 40;

export function pushHistory(
  list: HistoryEntry[],
  entry: HistoryEntry,
): HistoryEntry[] {
  return [entry, ...list].slice(0, HISTORY_CAP);
}
