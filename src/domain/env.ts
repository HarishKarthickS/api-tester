const TOKEN = /\{\{\s*([A-Za-z_][A-Za-z0-9_]*)\s*\}\}/g;

export function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(TOKEN, (full, key: string) => {
    if (Object.prototype.hasOwnProperty.call(vars, key)) {
      return vars[key] ?? "";
    }
    return full;
  });
}

export function envMap(
  vars: { key: string; value: string }[],
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const row of vars) {
    const k = row.key.trim();
    if (k) out[k] = row.value;
  }
  return out;
}

export function unresolvedTokens(text: string, vars: Record<string, string>): string[] {
  const missing: string[] = [];
  const seen = new Set<string>();
  for (const match of text.matchAll(TOKEN)) {
    const key = match[1];
    if (!key || seen.has(key)) continue;
    seen.add(key);
    if (!Object.prototype.hasOwnProperty.call(vars, key)) missing.push(key);
  }
  return missing;
}
