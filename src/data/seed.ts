import { newId } from "../domain/ids";
import type { Collection, Environment, SavedRequest } from "../domain/request";

function hdr(
  key: string,
  value: string,
  enabled = true,
): SavedRequest["headers"][number] {
  return { id: newId(), key, value, enabled };
}

export function seedEnvironment(): Environment {
  return {
    id: "env-lab",
    name: "lab",
    vars: [
      { id: newId(), key: "baseUrl", value: "https://httpbin.org" },
      { id: newId(), key: "token", value: "lab-frame-00" },
    ],
  };
}

export function seedCollection(): Collection {
  const jsonHeader = hdr("Content-Type", "application/json");
  const auth = hdr("X-Lab-Token", "{{token}}");

  const requests: SavedRequest[] = [
    {
      id: newId(),
      name: "GET echo",
      method: "GET",
      url: "{{baseUrl}}/get?frame=1",
      headers: [auth, hdr("Accept", "application/json")],
      body: "",
    },
    {
      id: newId(),
      name: "POST json",
      method: "POST",
      url: "{{baseUrl}}/post",
      headers: [jsonHeader, auth],
      body: '{\n  "probe": "httpbin",\n  "n": 3\n}\n',
    },
    {
      id: newId(),
      name: "GET headers",
      method: "GET",
      url: "{{baseUrl}}/headers",
      headers: [auth],
      body: "",
    },
    {
      id: newId(),
      name: "GET 404",
      method: "GET",
      url: "{{baseUrl}}/status/404",
      headers: [hdr("Accept", "application/json")],
      body: "",
    },
    {
      id: newId(),
      name: "GET uuid",
      method: "GET",
      url: "{{baseUrl}}/uuid",
      headers: [],
      body: "",
    },
  ];

  return {
    id: "col-httpbin",
    name: "httpbin",
    requests,
  };
}
