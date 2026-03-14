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

## Verify the Service is Running

Before opening the frontend, confirm the backend is responding. With `cds watch` running,
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
| Backend required | No | Yes — `cds watch` must be running |

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

1. Start the backend: `cd src/backend && npm run watch`
2. Serve the frontend: `npx serve src/frontend/stage2-fetch` (in a second terminal)
3. Open the URL in your browser — the product table should load with live data
4. Open DevTools → Network → reload → inspect the `Products` request
5. Compare the JSON response to the hardcoded array in Stage 1

When the table loads with real data from the server, you have made your first OData call.
Everything from here — OData query parameters, OpenUI5 data binding — builds on this moment.

---

*Ask Claude: "What is the difference between `fetch()` and XMLHttpRequest?"*
*or: "Show me what the raw HTTP request looks like on the wire when fetch() runs."*
*or: "What happens if the backend is not running when the page loads?"*
