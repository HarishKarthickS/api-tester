import type { ReactNode } from "react";

type EmptyKind = "collection" | "frames" | "request" | "payload" | "bytes" | "fault";

const COPY: Record<EmptyKind, { title: string; body: string }> = {
  collection: {
    title: "No frames loaded",
    body: "Capture a collection to fill this list.",
  },
  frames: {
    title: "Empty capture",
    body: "This collection has no requests. Add a frame or reload the httpbin seed.",
  },
  request: {
    title: "No request selected",
    body: "Pick a frame on the left to edit method, URL, headers, and body.",
  },
  payload: {
    title: "No payload",
    body: "Bytes show here after a send — offset, hex, ASCII, then pretty JSON.",
  },
  bytes: {
    title: "Empty body",
    body: "The response carried no bytes to dump.",
  },
  fault: {
    title: "Transport fault",
    body: "Check URL, CORS, or that the host is reachable.",
  },
};

export function EmptyPane({
  kind,
  detail,
  children,
}: {
  kind: EmptyKind;
  detail?: string;
  children?: ReactNode;
}) {
  const copy = COPY[kind];
  return (
    <div className={`idle-fill ${kind === "fault" ? "fault-box" : ""}`}>
      <strong>{copy.title}</strong>
      {detail ? <span className="detail">{detail}</span> : null}
      <span>{copy.body}</span>
      {children}
    </div>
  );
}
