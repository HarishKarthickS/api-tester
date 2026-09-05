import type { ReactNode } from "react";

type EmptyKind = "collection" | "frames" | "request" | "payload" | "bytes" | "fault";

const COPY: Record<EmptyKind, { title: string; body: string }> = {
  collection: {
    title: "No collection",
    body: "Load a sample collection to start sending requests.",
  },
  frames: {
    title: "No requests",
    body: "This collection is empty. Add a request or load the httpbin sample.",
  },
  request: {
    title: "No request selected",
    body: "Choose a request from the collection to edit method, URL, headers, and body.",
  },
  payload: {
    title: "No response yet",
    body: "Send a request to see status, headers, and body here.",
  },
  bytes: {
    title: "Empty body",
    body: "The response had no content.",
  },
  fault: {
    title: "Request failed",
    body: "Check the URL, CORS, or that the host is reachable.",
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
