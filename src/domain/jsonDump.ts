const HEX_WIDTH = 16;

function toBytes(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

function hexByte(n: number): string {
  return n.toString(16).padStart(2, "0");
}

function asciiCell(n: number): string {
  if (n >= 32 && n <= 126) return String.fromCharCode(n);
  return ".";
}

export function prettyJson(raw: string): { pretty: string; isJson: boolean } {
  const trimmed = raw.trim();
  if (!trimmed) return { pretty: "", isJson: false };
  try {
    return { pretty: JSON.stringify(JSON.parse(trimmed), null, 2), isJson: true };
  } catch {
    return { pretty: raw, isJson: false };
  }
}

export type HexLine = {
  offset: string;
  hex: string;
  ascii: string;
};

export function hexDump(text: string): HexLine[] {
  const bytes = toBytes(text);
  const lines: HexLine[] = [];
  for (let i = 0; i < bytes.length; i += HEX_WIDTH) {
    const slice = bytes.slice(i, i + HEX_WIDTH);
    const hexParts: string[] = [];
    let ascii = "";
    for (let j = 0; j < HEX_WIDTH; j++) {
      const b = slice[j];
      if (b === undefined) {
        hexParts.push("  ");
        ascii += " ";
      } else {
        hexParts.push(hexByte(b));
        ascii += asciiCell(b);
      }
      if (j === 7) hexParts.push("");
    }
    lines.push({
      offset: i.toString(16).padStart(4, "0"),
      hex: hexParts.join(" ").replace(/\s+/g, " ").trimEnd(),
      ascii,
    });
  }
  return lines;
}

export function formatStatusClass(status: number | null): "ok" | "fail" | "idle" {
  if (status == null) return "idle";
  if (status >= 200 && status < 300) return "ok";
  return "fail";
}
