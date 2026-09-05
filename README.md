# api-tester

HTTP client with a collection tree, request editor, and response pane. Dark IDE chrome, IBM Plex Sans Condensed + Fira Code. Cyan is reserved for success status.

Seeded with an **httpbin** collection (`{{baseUrl}}` → `https://httpbin.org`). Headers and the URL interpolate `{{env}}` tokens. History keeps the last 40 exchanges in `localStorage`.

## Run

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173). You should see **httpbin** on the left, a GET editor in the middle, and an empty response until you hit **Send**.

```bash
npm run build
npm run preview
```

## Notes

- `GET 404` is in the seed so you can watch a failed status in the response pane.
- **Clear requests** empties the collection; **Load sample collection** restores the seed.
- Unresolved `{{tokens}}` are blocked — they never fire a half-built request.

![api-tester](docs/bench.png)
