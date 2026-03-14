# fetch() and the CAP Backend — Connecting Browser to Server

Stage 1 had no network. This stage adds the backend and makes the first real HTTP call.
By the end, your browser will be fetching live data from a running CAP service.

---

## Starting the CAP Backend

The backend is a Node.js process that reads your CDS files and serves an OData endpoint.
Start it with:

```bash
cd src/backend
npm install       # first time only — downloads dependencies
npm run watch     # starts the server in watch mode (auto-restarts on file changes)
```

A successful start looks like this:

```
[cds] - serving CatalogService { path: '/odata/v4/catalog' }
[cds] - server listening on { url: 'http://localhost:4004' }
```

**What `watch` mode does:** Like an ABAP report with auto-activation — every time you save
a `.cds` file, CAP recompiles and restarts automatically. You do not need to stop and
restart manually during development.

**The in-memory database:** CAP loads your CSV files from `db/data/` into a SQLite database
in memory each time it starts. There is no database to install or configure.
The data resets on every restart, which is intentional for a development environment.

---

## Serving the HTML Page

The CAP backend serves *data*. It does not serve your HTML file.
That is a second, separate process.

In Stage 1 you double-clicked `index.html` directly. That works when there are no network
calls, but in Stage 2 the page uses `fetch()` — and browsers block `fetch()` from
`file://` URLs for security reasons. The page must be delivered over HTTP, which means
you need a server to deliver it.

`npx serve` is that server. It is a minimal static file server: give it a folder,
and it will serve whatever files are in that folder over HTTP. It knows nothing about
OData, CAP, or your data model. Its only job is to hand the HTML file to the browser
when asked.

```bash
npx serve src/frontend/stage2-fetch
```

It will print a local URL — typically `http://localhost:3000`. That is the address
your browser will use to load the page.

Note that `npx serve` does not need to be installed first — `npx` downloads and runs
it on demand. Leave this terminal running alongside your `npm run watch` terminal.

---

## Three Processes, Two Servers

When you run Stage 2, three separate things are running at once:

```
┌──────────────────────┐                    ┌──────────────────────┐
│                      │  1. GET index.html  │                      │
│                      │ ──────────────────► │   npx serve          │
│   Your Browser       │ ◄────────────────── │   localhost:3000     │
│   (Chrome / Edge)    │    HTML + JS files  │   static file server │
│                      │                     └──────────────────────┘
│                      │  2. GET /Products
│                      │ ──────────────────► ┌──────────────────────┐
│                      │ ◄────────────────── │   npm run watch      │
└──────────────────────┘  JSON { value:[...]}│   localhost:4004     │
                                             │   CAP OData service  │
                                             └──────────────────────┘
```

**Step 1 — page load:** The browser asks `npx serve` for `index.html`. It gets back the
HTML and JavaScript. At this point, no data has moved yet.

**Step 2 — data fetch:** The JavaScript in the page runs `fetch()`, which sends a second
HTTP request — this time to the CAP backend on port 4004. CAP queries its in-memory
SQLite database and returns the product data as JSON.

The browser never talks to a database directly. It only ever makes HTTP requests.
The two servers are completely independent — `npx serve` knows nothing about OData,
and the CAP backend knows nothing about your HTML file.

**ABAP analogy:** This is the same split as SAP's three-tier architecture:
- Browser ≈ SAP GUI (thin client, just renders what it receives)
- `npx serve` ≈ the ICM (Web Dispatcher, serves static content)
- CAP backend ≈ the Application Server ABAP (runs business logic, queries the database)

In Stage 5, `npx serve` goes away entirely — the CAP server will serve both the static
files and the OData endpoint, just as a real SAP system does.

---

## Verify the Service is Running

Before opening the frontend, confirm the backend is responding. With `npm run watch` running,
open a browser and go to:

```
http://localhost:4004/odata/v4/catalog/Products
```

You should see raw JSON — your product data, directly from the service. No UI, no JavaScript,
just the server responding to an HTTP GET request.

**ABAP analogy:** This is like calling an RFC function module directly in SE37 to check
it returns the right data before building the Dynpro on top of it.

---

## fetch() — Making HTTP Requests from JavaScript

In Stage 1, data came from a hardcoded JavaScript array. In Stage 2, it comes from the
server via `fetch()` — the browser's built-in function for making HTTP requests.

```javascript
const response = await fetch("http://localhost:4004/odata/v4/catalog/Products");
const data = await response.json();
const products = data.value;  // OData always wraps collections in { "value": [...] }
```

**ABAP analogy:** `fetch()` is like calling a remote function module (RFC).
You call it, the program pauses until the response arrives, then you process the result.

### Why `await`?

Network calls take time — milliseconds, but still time. JavaScript does not block
while waiting. Instead it uses **Promises** — a way of saying "do this, then when it's
done, run the next step."

`async`/`await` is the readable syntax for working with Promises:

```javascript
async function loadProducts() {        // 'async' marks this function as asynchronous
    const response = await fetch(url); // 'await' pauses here until the response arrives
    const data = await response.json();// 'await' again — the body also streams asynchronously
    renderProducts(data.value);
}
```

Without `await`, `fetch()` would return immediately with a Promise object, not the data.
You would be trying to render a Promise instead of an array — a common beginner mistake.

**ABAP analogy:** This is like an asynchronous RFC (aRFC) where execution continues
after the CALL FUNCTION but the RECEIVE block waits for the result before processing.

---

## What the OData Response Looks Like

Every OData collection response wraps its data in a `value` array:

```json
{
  "@odata.context": "$metadata#Products",
  "value": [
    { "ID": 1, "Name": "Laptop Pro 15", "Category_ID": 1, "Price": 1299.99, "Stock": 45 },
    { "ID": 2, "Name": "Laptop Air 13", "Category_ID": 1, "Price": 999.99,  "Stock": 32 }
  ]
}
```

Notice `Category_ID` is just a number — the foreign key. The full Category record is not
included unless you ask for it with `$expand=Category`. That is exactly what Stage 3 covers.

---

## What Changed from Stage 1

Open `src/frontend/stage2-fetch/index.html` alongside `src/frontend/stage1-basics/index.html`.
The differences are intentionally minimal:

| | Stage 1 | Stage 2 |
|---|---|---|
| Data source | Hardcoded `const products = [...]` | `fetch()` from the CAP endpoint |
| `renderProducts()` | Identical | Identical — same function, untouched |
| Network calls | Zero | One GET request per page load |
| Backend required | No | Yes — `npm run watch` must be running |

The `renderProducts()` function is the same in both stages. This is deliberate:
**the data source changed, but the rendering logic did not.** This is separation of concerns —
one function fetches data, a different function displays it.

---

## Watching the Request in DevTools

1. Open Stage 2 in the browser
2. Press **F12** → **Network** tab
3. Reload the page
4. Click the `Products` request in the list
5. Click **Response** — you'll see the raw JSON the browser received

This is the same JSON you saw when you opened the URL directly in the browser.
The only difference is that JavaScript caught it this time and built the table from it.

The Network tab is your most important debugging tool. When a Fiori app misbehaves,
this is where you look first — it shows you exactly what was requested and what came back.

---

## Exercise: Stage 2

You need two terminals running before you open the browser.

**Terminal 1 — data server:**
```bash
cd src/backend
npm run watch
```
Wait until you see `server listening on { url: 'http://localhost:4004' }`.

**Terminal 2 — page server:**
```bash
npx serve src/frontend/stage2-fetch
```
Note the URL it prints (typically `http://localhost:3000`).

**Browser:**

1. Open the URL from Terminal 2
2. The product table should load with live data
3. Open DevTools → **Network** tab → reload the page
4. You should see two requests: one for `index.html` (from port 3000), one for `Products` (from port 4004)
5. Click the `Products` request → **Response** tab → examine the JSON
6. Compare it to the hardcoded array in `src/frontend/stage1-basics/index.html`

When the table loads with real data from the server, you have made your first OData call.
Everything from here — OData query parameters, OpenUI5 data binding — builds on this moment.

---

*Ask Claude: "What is the difference between `fetch()` and XMLHttpRequest?"*
*or: "Show me what the raw HTTP request looks like on the wire when fetch() runs."*
*or: "What happens if the backend is not running when the page loads?"*
