import "./bench.css";

export function App() {
  return (
    <div className="bench">
      <header className="mast">
        <span>api-tester</span>
        <span className="sep">//</span>
        <span>http frame bench</span>
        <span className="sep">·</span>
        <span>env lab</span>
      </header>
      <div className="panes">
        <section className="pane" aria-label="collection">
          <div className="pane-head">
            <span>Collection</span>
            <span>n=0</span>
          </div>
          <div className="pane-body">
            <div className="idle-fill">
              <strong>No frames loaded</strong>
              Capture a collection to fill this list.
            </div>
          </div>
        </section>
        <section className="pane" aria-label="request">
          <div className="pane-head">
            <span>Request</span>
            <span>idle</span>
          </div>
          <div className="pane-body">
            <div className="idle-fill">
              <strong>No request selected</strong>
              Pick a frame on the left to edit method, URL, headers, and body.
            </div>
          </div>
        </section>
        <section className="pane" aria-label="dump">
          <div className="pane-head">
            <span>Dump</span>
            <span>hex / json</span>
          </div>
          <div className="pane-body">
            <div className="idle-fill">
              <strong>No payload</strong>
              Bytes show here after a send — offset, hex, ASCII, then pretty JSON.
            </div>
          </div>
        </section>
      </div>
      <footer className="foot">
        <span>ready</span>
        <span>history 0</span>
      </footer>
    </div>
  );
}
