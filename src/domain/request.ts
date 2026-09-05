import { newId } from "./ids";

export const HTTP_METHODS = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
  "OPTIONS",
] as const;

export type HttpMethod = (typeof HTTP_METHODS)[number];

export type HeaderPair = {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
};

export type EnvVar = {
  id: string;
  key: string;
  value: string;
};

export type Environment = {
  id: string;
  name: string;
  vars: EnvVar[];
};

export type SavedRequest = {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  headers: HeaderPair[];
  body: string;
};

export type Collection = {
  id: string;
  name: string;
  requests: SavedRequest[];
};

export function emptyHeader(): HeaderPair {
  return { id: newId(), key: "", value: "", enabled: true };
}

export function emptyRequest(name = "untitled"): SavedRequest {
  return {
    id: newId(),
    name,
    method: "GET",
    url: "{{baseUrl}}/",
    headers: [emptyHeader()],
    body: "",
  };
}

export function emptyCollection(name: string): Collection {
  return { id: newId(), name, requests: [] };
}

export function cloneRequest(req: SavedRequest): SavedRequest {
  return {
    ...req,
    id: newId(),
    name: `${req.name} copy`,
    headers: req.headers.map((h) => ({ ...h, id: newId() })),
  };
}
