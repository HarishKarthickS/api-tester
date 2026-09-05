import { useEffect, useMemo, useState } from "react";
import { newId } from "../domain/ids";
import { pushHistory, type HistoryEntry } from "../domain/history";
import { hexDump, prettyJson } from "../domain/jsonDump";
import {
  emptyHeader,
  emptyRequest,
  HTTP_METHODS,
  type Collection,
  type Environment,
  type HeaderPair,
  type HttpMethod,
  type SavedRequest,
} from "../domain/request";
import { executeCall, prepareCall, type CallResult } from "../domain/send";
import { loadBench, saveBench } from "../data/store";
import { seedCollection, seedEnvironment } from "../data/seed";
import { EmptyPane } from "./EmptyPane";
import "./bench.css";

export function App() {
  const initial = useMemo(() => loadBench(), []);
  const [collections, setCollections] = useState<Collection[]>(initial.collections);
  const [env, setEnv] = useState<Environment>(initial.env);
  const [history, setHistory] = useState<HistoryEntry[]>(initial.history);
  const [colId, setColId] = useState<string | null>(initial.selectedCollectionId);
  const [reqId, setReqId] = useState<string | null>(initial.selectedRequestId);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<CallResult | null>(null);
  const [prepNote, setPrepNote] = useState<string | null>(null);
  const [dumpTab, setDumpTab] = useState<"hex" | "json">("hex");

  const collection = collections.find((c) => c.id === colId) ?? collections[0] ?? null;
  const request = collection?.requests.find((r) => r.id === reqId) ?? null;

  useEffect(() => {
    saveBench({
      collections,
      env,
      history,
      selectedCollectionId: colId,
      selectedRequestId: reqId,
    });
  }, [collections, env, history, colId, reqId]);

  function patchRequest(patch: Partial<SavedRequest>) {
    if (!collection || !request) return;
    setCollections((cols) =>
      cols.map((c) =>
        c.id !== collection.id
          ? c
          : {
              ...c,
              requests: c.requests.map((r) => (r.id === request.id ? { ...r, ...patch } : r)),
            },
      ),
    );
  }

  function patchHeader(id: string, patch: Partial<HeaderPair>) {
    if (!request) return;
    patchRequest({
      headers: request.headers.map((h) => (h.id === id ? { ...h, ...patch } : h)),
    });
  }

  async function send() {
    if (!request) return;
    const { call, missing } = prepareCall(request, env);
    if (missing.length > 0) {
      setPrepNote(`unresolved tokens: ${missing.map((m) => `{{${m}}}`).join(", ")}`);
      setResult(null);
      return;
    }
    if (!call.url.trim()) {
      setPrepNote("URL is empty");
      setResult(null);
      return;
    }
    setPrepNote(null);
    setBusy(true);
    const out = await executeCall(call);
    setBusy(false);
    setResult(out);
    setHistory((h) =>
      pushHistory(h, {
        id: newId(),
        at: Date.now(),
        method: call.method,
        url: call.url,
        status: out.status,
        ok: out.ok && !out.error,
        ms: out.ms,
        error: out.error,
      }),
    );
    setDumpTab(out.error ? "json" : "hex");
  }

  function addRequest() {
    if (!collection) return;
    const next = emptyRequest(`frame ${collection.requests.length + 1}`);
    setCollections((cols) =>
      cols.map((c) =>
        c.id === collection.id ? { ...c, requests: [...c.requests, next] } : c,
      ),
    );
    setReqId(next.id);
    setResult(null);
  }

  function dropFrames() {
    if (!collection) return;
    setCollections((cols) =>
      cols.map((c) => (c.id === collection.id ? { ...c, requests: [] } : c)),
    );
    setReqId(null);
    setResult(null);
    setPrepNote(null);
  }

  function reloadSeed() {
    const col = seedCollection();
    setCollections([col]);
    setEnv(seedEnvironment());
    setColId(col.id);
    setReqId(col.requests[0]?.id ?? null);
    setHistory([]);
    setResult(null);
    setPrepNote(null);
  }

  const pretty = prettyJson(result?.bodyText ?? "");
  const hex = hexDump(pretty.pretty || result?.bodyText || "");

  return (
    <div className="bench">
      <header className="mast">
        <span>api-tester</span>
        <span className="sep">//</span>
        <span>http frame bench</span>
        <span className="sep">·</span>
        <span>env {env.name}</span>
        <span className="sep">·</span>
        <span>{busy ? "tx" : "idle"}</span>
      </header>
      <div className="panes">
        <section className="pane" aria-label="collection">
          <div className="pane-head">
            <span>Collection</span>
            <span>n={collection?.requests.length ?? 0}</span>
          </div>
          <div className="pane-body">
            {collections.length === 0 || !collection ? (
              <EmptyPane kind="collection">
                <button className="ghost" type="button" onClick={reloadSeed}>
                  Load httpbin
                </button>
              </EmptyPane>
            ) : (
              <>
                <div className="col-name">{collection.name}</div>
                {collection.requests.length === 0 ? (
                  <EmptyPane kind="frames">
                    <button className="ghost" type="button" onClick={addRequest}>
                      Add frame
                    </button>
                    <button className="ghost" type="button" onClick={reloadSeed}>
                      Reload httpbin
                    </button>
                  </EmptyPane>
                ) : (
                  collection.requests.map((r, i) => (
                    <button
                      key={r.id}
                      type="button"
                      className={`req-row ${r.id === request?.id ? "active" : ""}`}
                      onClick={() => {
                        setReqId(r.id);
                        setResult(null);
                        setPrepNote(null);
                      }}
                    >
                      <span className="idx">{String(i).padStart(2, "0")}</span>
                      <span className={`method ${r.method.toLowerCase()}`}>{r.method}</span>
                      <span className="req-name">{r.name}</span>
                    </button>
                  ))
                )}
                <div className="pane-actions">
                  <button className="ghost" type="button" onClick={addRequest}>
                    Add frame
                  </button>
                  <button className="ghost" type="button" onClick={dropFrames}>
                    Drop frames
                  </button>
                </div>
                <div className="hist-head">History</div>
                {history.length === 0 ? (
                  <p className="hist-empty">No exchanges yet.</p>
                ) : (
                  history.map((h) => (
                    <div key={h.id} className={`hist-row ${h.ok ? "ok" : "fail"}`}>
                      <span>{h.method}</span>
                      <span>{h.status ?? "err"}</span>
                      <span>{h.ms}ms</span>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </section>

        <section className="pane" aria-label="request">
          <div className="pane-head">
            <span>Request</span>
            <span>{request ? request.method : "idle"}</span>
          </div>
          <div className="pane-body request-form">
            {!request ? (
              <EmptyPane kind="request" />
            ) : (
              <>
                <label className="field">
                  <span>Name</span>
                  <input
                    value={request.name}
                    onChange={(e) => patchRequest({ name: e.target.value })}
                  />
                </label>
                <div className="url-row">
                  <select
                    value={request.method}
                    onChange={(e) => patchRequest({ method: e.target.value as HttpMethod })}
                  >
                    {HTTP_METHODS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <input
                    className="url"
                    value={request.url}
                    onChange={(e) => patchRequest({ url: e.target.value })}
                    spellCheck={false}
                  />
                  <button className="send" type="button" disabled={busy} onClick={() => void send()}>
                    {busy ? "…" : "Send"}
                  </button>
                </div>
                {prepNote ? <p className="fault">{prepNote}</p> : null}
                <div className="subhead">Headers</div>
                <table className="hdrs">
                  <thead>
                    <tr>
                      <th />
                      <th>Key</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {request.headers.map((h) => (
                      <tr key={h.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={h.enabled}
                            onChange={(e) => patchHeader(h.id, { enabled: e.target.checked })}
                          />
                        </td>
                        <td>
                          <input
                            value={h.key}
                            onChange={(e) => patchHeader(h.id, { key: e.target.value })}
                            spellCheck={false}
                          />
                        </td>
                        <td>
                          <input
                            value={h.value}
                            onChange={(e) => patchHeader(h.id, { value: e.target.value })}
                            spellCheck={false}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  className="ghost"
                  type="button"
                  onClick={() => patchRequest({ headers: [...request.headers, emptyHeader()] })}
                >
                  Add header
                </button>
                <div className="subhead">Body</div>
                <textarea
                  className="body"
                  value={request.body}
                  onChange={(e) => patchRequest({ body: e.target.value })}
                  spellCheck={false}
                  rows={8}
                />
                <div className="subhead">Env {env.name}</div>
                {env.vars.map((v) => (
                  <div key={v.id} className="env-row">
                    <input
                      value={v.key}
                      onChange={(e) =>
                        setEnv({
                          ...env,
                          vars: env.vars.map((x) =>
                            x.id === v.id ? { ...x, key: e.target.value } : x,
                          ),
                        })
                      }
                      spellCheck={false}
                    />
                    <input
                      value={v.value}
                      onChange={(e) =>
                        setEnv({
                          ...env,
                          vars: env.vars.map((x) =>
                            x.id === v.id ? { ...x, value: e.target.value } : x,
                          ),
                        })
                      }
                      spellCheck={false}
                    />
                  </div>
                ))}
                <button
                  className="ghost"
                  type="button"
                  onClick={() =>
                    setEnv({
                      ...env,
                      vars: [...env.vars, { id: newId(), key: "", value: "" }],
                    })
                  }
                >
                  Add var
                </button>
              </>
            )}
          </div>
        </section>

        <section className="pane" aria-label="dump">
          <div className="pane-head">
            <span>Dump</span>
            <span>
              {result?.error
                ? "fault"
                : result?.status != null
                  ? `${result.status} ${result.statusText} · ${result.ms}ms`
                  : "hex / json"}
            </span>
          </div>
          <div className="pane-body dump">
            {!result ? (
              <EmptyPane kind="payload" />
            ) : result.error ? (
              <EmptyPane kind="fault" detail={result.error} />
            ) : (
              <>
                <div className="dump-tabs">
                  <button
                    type="button"
                    className={dumpTab === "hex" ? "on" : ""}
                    onClick={() => setDumpTab("hex")}
                  >
                    Hex
                  </button>
                  <button
                    type="button"
                    className={dumpTab === "json" ? "on" : ""}
                    onClick={() => setDumpTab("json")}
                  >
                    JSON
                  </button>
                </div>
                {result.status != null && result.status >= 400 ? (
                  <p className="fault">HTTP {result.status} {result.statusText}</p>
                ) : null}
                {dumpTab === "hex" ? (
                  hex.length === 0 ? (
                    <EmptyPane kind="bytes" />
                  ) : (
                    <pre className="hex">
                      {hex.map((line) => (
                        <div key={line.offset}>
                          <span className="off">{line.offset}</span>
                          <span className="hx">{line.hex}</span>
                          <span className="asc">{line.ascii}</span>
                        </div>
                      ))}
                    </pre>
                  )
                ) : (
                  <pre className="json">{pretty.pretty || "(empty)"}</pre>
                )}
              </>
            )}
          </div>
        </section>
      </div>
      <footer className="foot">
        <span>
          {request ? `${request.method} ${request.url}` : "ready"}
        </span>
        <span>history {history.length}</span>
      </footer>
    </div>
  );
}
