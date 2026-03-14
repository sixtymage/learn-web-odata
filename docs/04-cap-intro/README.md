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
    const query = JSON.stringify(req.query).toLowerCase();
    const found = BLOCKED.find((word) => query.includes(word));
    if (found) {
        req.error(400, "That search term is not permitted.");
    }
});
```

`req.query` is the parsed OData query in CAP's internal format. Stringifying it
lets us scan the entire query — filter values, field names, search terms — in one pass.

`req.error(400, "...")` sends an HTTP 400 response to the caller and stops all
further processing. The database is never queried.

**Try it:**

1. Make sure `npm run watch` is running (it will have reloaded automatically when `catalog.js` was saved)
2. Open the Stage 3 app
3. Type `fuck` in the **Name contains** filter and click **Run Query**
4. The error message `That search term is not permitted.` should appear in the results area
5. Open DevTools → Network → confirm the response status is `400`

Then compare with a network error (stop the backend entirely) — that shows a different
message prompting you to restart the server. The UI distinguishes between
"the server rejected your request" and "the server is not running".

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

*Ask Claude: "Explain exactly what happens between `npm run watch` starting and the first*
*fetch() request arriving at the Products endpoint."*
