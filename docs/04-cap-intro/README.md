# SAP CAP Introduction — The Backend Framework

SAP CAP (Cloud Application Programming model) is the framework that runs the backend
in this repository. It reads your data model (defined in CDS) and automatically exposes
it as an OData service — no boilerplate needed.

---

## What Problem Does CAP Solve?

Before CAP, building an OData service in SAP required:
- Defining entity types manually in SEGW (SAP Gateway Service Builder)
- Writing GET_ENTITY, GET_ENTITYSET methods for every entity
- Handling paging, filtering, and sorting yourself
- Separately maintaining the data model in the ABAP Dictionary

CAP collapses all of this. You define your data model once in CDS, and CAP:
- Creates the OData service automatically
- Handles `$filter`, `$orderby`, `$top`, `$skip`, `$expand` automatically
- Manages the database (creates tables, handles SQL)
- Adds features like authentication, logging, and multitenancy as opt-ins

**ABAP analogy:** CAP is like having RAP (RESTful Application Programming model) in ABAP —
you define the business object and the framework generates the OData service.

---

## CDS — Core Data Services

CDS is the language CAP uses to define data models and services.
It exists in both the ABAP world and the CAP world, but the CAP version is simpler.

**ABAP analogy:** Think of CDS entities as ABAP Dictionary tables — you define
the fields and their types, and the framework creates the physical storage.
(If you've also worked with ABAP CDS Views, the syntax will feel very familiar,
but Dictionary-level thinking is enough to follow everything here.)

---

## The Data Model: `db/schema.cds`

Open `src/backend/db/schema.cds`.

```cds
namespace products.db;

entity Categories {
    key ID   : Integer;
        Name : String(100);
}

entity Products {
    key ID          : Integer;
        Name        : String(200);
        Category    : Association to Categories;
        Price       : Decimal(10, 2);
        Stock       : Integer;
}
```

Each `entity` becomes a database table. CAP creates the table automatically when you start
the service (using SQLite in dev mode).

`Association to Categories` is a foreign key relationship — like an ABAP CDS JOIN or a
VBAK/VBAP relationship. When you use `$expand=Category` in OData, CAP follows this association.

---

## The Service Definition: `srv/catalog.cds`

Open `src/backend/srv/catalog.cds`.

```cds
using products.db from '../db/schema';

service CatalogService @(path: '/odata/v4/catalog') {
    entity Products  as projection on products.db.Products;
    entity Categories as projection on products.db.Categories;
    entity Orders    as projection on products.db.Orders;
    entity OrderItems as projection on products.db.OrderItems;
}
```

This is the service definition. It:
- Declares a service called `CatalogService` at the path `/odata/v4/catalog`
- Exposes entities as **projections** (views) of the underlying database entities

Why projections and not direct exposure? It's a separation of concerns:
- `db/schema.cds` is the physical data model (tables)
- `srv/catalog.cds` is the service API (what the outside world sees)

You could expose only some fields, or rename them, or add calculated fields —
all without touching the database schema. This separation of "physical model" from
"service API" is the same principle as ABAP's distinction between Dictionary tables
and the views or BAPIs that expose them to the outside world.

---

## Starting the Backend

```bash
cd src/backend
npm install      # first time only
npm run watch
```

The watch command (`npm run watch`) does three things:
1. Creates an in-memory SQLite database and runs the CDS schema against it (creates tables)
2. Loads sample data from `db/data/` CSV files (if present)
3. Starts an HTTP server on port 4004 and watches for file changes (auto-restarts on save)

When you see:
```
[cds] - serving CatalogService { path: '/odata/v4/catalog' }
[cds] - launched in: ...ms
[cds] - server listening on { url: 'http://localhost:4004' }
```

...the service is running. Open http://localhost:4004 in a browser.

---

## What CAP Does with Your OData Queries

In Stage 3 you ran OData queries from the browser and saw the results.
CAP was handling every one of those queries automatically — no custom code.
Here is what it was actually doing behind the scenes for each query option:

| OData query option | SQL CAP generates |
|---|---|
| `$filter=Price gt 500` | `WHERE Price > 500` |
| `$select=Name,Price` | `SELECT Name, Price` |
| `$orderby=Price desc` | `ORDER BY Price DESC` |
| `$top=5&$skip=5` | `LIMIT 5 OFFSET 5` |
| `$expand=Category` | `LEFT JOIN Categories ON Products.Category_ID = Categories.ID` |

You wrote none of that SQL. You declared the data model in `db/schema.cds`,
declared the service in `srv/catalog.cds`, and CAP derived everything else.

**ABAP analogy:** This is what RAP does in modern ABAP — you define the Business Object,
and the framework generates the OData service and translates query options into Open SQL.
Before RAP, you wrote each GET_ENTITY and GET_ENTITYSET method by hand in SEGW.
CAP is the equivalent leap forward for Node.js backends.

---

## The Metadata Document

```
http://localhost:4004/odata/v4/catalog/$metadata
```

Open this. It's XML that describes your entire service — every entity, every property,
every relationship. It's machine-readable but also human-readable if you know what to look for.

This is how the ODataModel in OpenUI5 knows the structure of your service without you
telling it explicitly. It reads `$metadata` first.

---

## Custom Handlers (`srv/catalog.js`)

CAP's auto-generated behaviour covers most use cases. When you need custom logic —
validation, calculated fields, calling external systems — you add a service handler.

**Important:** `catalog.js` is JavaScript, but it does not run in the browser.
It runs on the Node.js server, alongside the CDS runtime.
The browser sends an HTTP request; this code intercepts it on the server
before the database is touched. You have been writing JavaScript that runs
*in* the browser (stages 1–3). This is JavaScript that runs *behind* it.

**ABAP analogy:** This is like implementing a BAdI in a Business Object —
the framework calls your code at defined hook points (before/after read, create, update, delete).

Open `src/backend/srv/catalog.js`. The three handlers already there are:

| Hook | Entity | What it does |
|---|---|---|
| `before CREATE` | `Orders` | Sets `Date` automatically if not provided |
| `after READ` | `Products` | Adds a calculated `StockStatus` field (`In Stock` / `Low Stock` / `Out of Stock`) |
| `before CREATE` | `OrderItems` | Checks the product exists and has sufficient stock before saving |

### Exercise: Add a Profanity Filter

A `before READ` hook on `Products` runs before every query — including those
triggered by `$filter=contains(Name,'...')` from the Stage 3 app.

The handler already added to `catalog.js` looks like this:

```javascript
this.before("READ", Products, (req) => {
    const BLOCKED = ["fuck", "shit", "bastard"];
    const rawParams = JSON.stringify(req._.query || {}).toLowerCase();
    const found = BLOCKED.find((word) => rawParams.includes(word));
    if (found) {
        req.error(400, "That search term is not permitted.");
    }
});
```

`req._.query` is the raw OData query params from the HTTP request — the `$filter`,
`$select`, `$orderby` etc. as plain strings, before CAP parses them into its internal
format. Stringifying it lets us scan the entire query string, including any filter values,
in one pass.

`req.error(400, "...")` sends an HTTP 400 response to the caller and stops all
further processing. The database is never queried.

The full exercise — including testing this handler and adding your own word — is at the end of this doc.

---

## Sample Data

The `db/data/` folder contains CSV files with initial data.
CAP loads these automatically when starting in dev mode.

File naming convention: `<namespace>-<EntityName>.csv`

For example: `products.db-Products.csv`

```csv
ID,Name,Category_ID,Price,Stock
1,Laptop Pro 15,1,1299.99,45
2,Wireless Mouse,2,29.99,230
```

---

## CAP in Production (vs. Dev)

In dev mode (SQLite), the database is recreated every time you start.
In production or Stage 5 (Docker/PostgreSQL), the database persists.

The CDS model doesn't change between environments — only the database connection.
This is the key design principle of CAP: environment-independent data model.

---

---

## Exercise: Stage 4

This exercise has three parts: test the existing profanity filter, extend it with your own
word, and commit the change using git. You will be editing server-side JavaScript and
seeing the effect immediately in the browser — no rebuild, no restart.

---

### Part 1 — Test the existing filter

**What you need running:**

- **Terminal 1:** Start a fresh instance of the backend — even if it is already running, stop it first (`Ctrl+C`) and restart it, so you are certain the latest code is loaded:
  ```bash
  cd src/backend
  npm run watch
  ```
- **Terminal 2:** `npx serve src/frontend/stage3-odata` (stop Stage 2's server first with `Ctrl+C` if still running — and yes, this is intentionally the Stage 3 UI. Stage 4 is a server-side change only; the UI does not need to change at all)

Open the Stage 3 app in your browser.

**Steps:**

1. In the **Name contains** filter, type `fuck` and click **Run Query**
2. You should see the message `That search term is not permitted.` in red in the results area — not a generic error, the exact message from the server
3. Open DevTools (**F12** → **Network** tab), find the `Products` request and confirm the status is `400`
4. Clear the filter and run a normal query (e.g. Name contains `Laptop`) to confirm the service still works

---

### Part 2 — Add a word to the filter

Now you will make a code change.

**Step 1 — Open the file**

In VS Code, open `src/backend/srv/catalog.js`.

Find the `BLOCKED` array near the top of the `before("READ", Products, ...)` handler:

```javascript
const BLOCKED = ["fuck", "shit", "bastard"];
```

**Step 2 — Add a word**

Add `"crap"` to the array:

```javascript
const BLOCKED = ["fuck", "shit", "bastard", "crap"];
```

Save the file (`Ctrl+S`).

**Step 3 — Watch the server reload**

Switch to Terminal 1. You should see the server restart automatically:

```
[cds] - server listening on { url: 'http://localhost:4004' }
```

This is the watch mode doing its job — the same auto-reload you would get when
saving a `.cds` file. Your change is live without any manual restart.

**Step 4 — Test your new word**

Back in the Stage 3 app, type `crap` in the Name contains filter and click **Run Query**.
You should get the same 400 error. The word you added is now blocked.

---

### Part 3 — Commit the change with git

You have made a real code change to the repository. Now commit it properly.

**Step 1 — See what changed**

Open a terminal (you can use a third terminal, or reuse one that is free) and run:

```bash
git status
```

You should see `catalog.js` listed under "Changes not staged for commit". That tells you
git has noticed the file was modified, but you have not told git to include it yet.

**Step 2 — Review the diff**

```bash
git diff src/backend/srv/catalog.js
```

You will see something like:

```diff
-    const BLOCKED = ["fuck", "shit", "bastard"];
+    const BLOCKED = ["fuck", "shit", "bastard", "crap"];
```

Lines starting with `-` are what was there before. Lines starting with `+` are your change.
This is git's way of showing exactly what is different — equivalent to a transport comparison in SAP.

**Step 3 — Stage the file**

```bash
git add src/backend/srv/catalog.js
```

Run `git status` again. The file has moved from "Changes not staged" to
"Changes to be staged". Staging means "I want this change included in my next commit."
You can stage multiple files separately before committing — useful when you have
unrelated changes you want in different commits.

**Step 4 — Commit**

```bash
git commit -m "Add 'crap' to profanity filter"
```

Run `git status` one more time. The working tree should be clean — no pending changes.

Your change is now recorded in the repository history. Run `git log --oneline -5` to
see your commit alongside the others.

---

*Ask Claude: "What is the difference between `git add` and `git commit`?"*
*or: "Show me all the hooks CAP supports — what else could I intercept?"*
*or: "How would I write a handler that logs every query to the console?"*
