# Stage 7 — A Real Database Behind the Same App

Everything you have built so far — the OData service, all six frontend stages —
runs unchanged in this stage. The only thing that changes is what is behind CAP.

Until now the backend has used SQLite running entirely in memory.
That means every time you stop the app started with `npm run watch`, all data is gone.
A real application needs a real database: data that persists, that you can query
directly, that exists independently of the application layer.

Stage 7 replaces the in-memory SQLite with PostgreSQL running in Docker.
The CAP service does not know or care — it sees the same entity model and
speaks the same OData protocol. Only the database adapter changes.

**ABAP analogy:**
In SAP, an ABAP program talks to the database through the ABAP Database Interface (DBI).
The program is the same whether the system runs on HANA, Oracle, or MaxDB.
CAP's adapter system is the same concept: one config line swaps the database,
the service logic is untouched.

---

## What You Will See

After completing this stage you will have four server processes running alongside your browser:

| Process | How it starts | URL |
|---|---|---|
| PostgreSQL | `docker compose up -d db` | `localhost:5432` (not browseable) |
| pgAdmin | `docker compose up -d pgadmin` | `http://localhost:5050` |
| CAP service | `npm run watch:pg` | `http://localhost:4004` |
| Frontend | `npx serve src/frontend/stage6-openui5-mvc` | `http://localhost:3000` |

```
┌──────────────────────────────────────────────────────────────────────┐
│  Your Browser (Chrome / Edge)                                        │
└────┬─────────────────────┬──────────────────────┬────────────────────┘
     │ 1. GET index.html   │ 2. OData requests    │ 3. browse tables
     ▼                     ▼                      ▼
┌───────────┐   ┌──────────────────────┐   ┌──────────────────────┐
│ npx serve │   │  npm run watch:pg    │   │  pgAdmin             │
│ :3000     │   │  localhost:4004      │   │  localhost:5050      │
│ (static   │   │  CAP / OData         │   │  (Docker)            │
│  files)   │   └──────────┬───────────┘   └──────────┬───────────┘
└───────────┘              │ SQL                      │ SQL
                           └─────────────┬────────────┘
                                         ▼
                           ┌──────────────────────────┐
                           │  PostgreSQL              │
                           │  localhost:5432          │
                           │  (Docker container)      │
                           └──────────────────────────┘
```

The key moment: run a SQL query against `products_db_products` in pgAdmin,
then open the same data via the OData endpoint in the browser.
CAP is a translation layer — the data lives in PostgreSQL either way.

---

## Prerequisites

- Docker Desktop installed and running
  (see `docs/00-setup/05-docker-setup.md`)
- The CAP backend dependencies installed:
  ```bash
  cd src/backend && npm install
  ```
  This picks up `@cap-js/postgres`, the CAP PostgreSQL adapter.

---

## Step 1 — Start PostgreSQL and pgAdmin

```bash
docker compose up -d db pgadmin
```

This starts only the database and pgAdmin — not the CAP backend container.
You will run the CAP service locally with `npm run watch:pg` so you can
still see its logs and it still auto-reloads when you change code.

Verify PostgreSQL is ready:
```bash
docker compose ps
```
The `db` service should show `healthy`.

---

## Step 2 — Deploy the Schema

CAP needs to create the tables and load the seed data into PostgreSQL.
This is a one-time step (or repeat it if you want to reset the data):

```bash
cd src/backend
npm run deploy:pg
```

This runs `cds deploy --profile postgres`, which:
1. Reads your CDS data model (`schema.cds`)
2. Translates it into SQL `CREATE TABLE` statements
3. Executes them against PostgreSQL
4. Runs the seed data from `db/data/*.csv`

You will see output like:
```
Deploying to db [postgres]...
  > CREATE TABLE products_db_products (...)
  > CREATE TABLE products_db_categories (...)
  > INSERT INTO products_db_products ...
```

**ABAP analogy:** This is like running a transport that creates Dictionary objects
(tables) and loads initial data — the equivalent of activating a data dictionary
object and running a data migration program.

---

## Step 3 — Start the CAP Service Against PostgreSQL

```bash
npm run watch:pg
```

This runs `cds watch --profile postgres`. The `[postgres]` profile in `package.json`
overrides the default SQLite connection with the PostgreSQL credentials.
Everything else — the service definition, the custom handlers, the CORS setup — is
identical to `npm run watch`.

You should see:
```
[cds] - connect to db > postgres { host: 'localhost', database: 'odata_learn', ... }
[cds] - serving CatalogService at /odata/v4/catalog
[cds] - server listening on { url: 'http://localhost:4004' }
```

Open `http://localhost:4004/odata/v4/catalog/Products` — same data, same URLs,
same responses as before.

---

## Step 4 — Confirm the UI Works Unchanged

In a second terminal, start the frontend server:

```bash
npx serve src/frontend/stage6-openui5-mvc
```

Open `http://localhost:3000` in your browser. The Stage 6 Fiori app loads and
displays the product list exactly as before.

Nothing in the frontend changed. The UI is still calling
`http://localhost:4004/odata/v4/catalog/Products` — it has no idea whether
CAP is talking to an in-memory SQLite file or a PostgreSQL container. That is
the point: the OData contract between the UI and the service is the same
regardless of what sits behind it.

Open DevTools → Network tab and confirm you still see the same requests:
- `GET /odata/v4/catalog/$metadata`
- `GET /odata/v4/catalog/Products?$count=true&$select=...`

Same URLs, same JSON responses, real database.

---

## Step 5 — Query the Database Directly in pgAdmin

Open `http://localhost:5050` in your browser.

**Log in:**
- Email: `admin@example.com`
- Password: `admin`

**Register the database server:**
1. In the left panel, right-click **Servers** → **Register** → **Server**
2. **General** tab → Name: `learn-odata`
3. **Connection** tab:
   - Host: `db`
   - Port: `5432`
   - Maintenance Database: `odata_learn`
   - Username: `cap_user`
   - Password: `cap_password`
4. Click **Save**

**Browse the tables:**

Expand: `learn-odata` → `Databases` → `odata_learn` → `Schemas` → `public` → `Tables`

You will see tables named `products_db_products`, `products_db_categories`,
`products_db_orders`, `products_db_orderitems`.

CAP derives the table name from the **data model namespace**, not the service name.
The namespace in `db/schema.cds` is `products.db` — CAP replaces the dot with an
underscore and lowercases everything, giving `products_db_` as the prefix.

**ABAP analogy:** Like how SAP Dictionary tables use a naming convention based on
the application component (e.g. `MARA`, `VBAK`) — the prefix encodes where the
table belongs in the data model.

**Run a query:**

Right-click `products_db_products` → **Query Tool**, then:

```sql
SELECT * FROM products_db_products;
```

You are looking at the actual rows that `GET /odata/v4/catalog/Products` returns.
No transformation, no magic — CAP translates the OData request into this SQL query
and returns the result as JSON.

You can also run:
```sql
SELECT p.name, p.price, c.name AS category
FROM products_db_products p
JOIN products_db_categories c ON p.category_id = c.id
ORDER BY p.price DESC;
```

This is the same join that OData `$expand=Category` performs — just written in SQL
instead of a URL parameter.

---

## Step 6 — Demonstrate Persistence

This is what in-memory SQLite cannot show.

1. With the CAP service running against PostgreSQL, note the products in the table
2. Stop the CAP service (`Ctrl+C`)
3. Restart it: `npm run watch:pg`
4. Open `http://localhost:4004/odata/v4/catalog/Products` again

The data is still there. It lives in PostgreSQL, not in the application process.
The application is stateless — it could be restarted, scaled, or replaced, and the
data would be unaffected.

**ABAP analogy:** This is the normal state of affairs in SAP — the application server
can be rebooted without touching the database. What Stage 7 demonstrates is that CAP
follows the same architecture, whereas the in-memory SQLite of the earlier stages did not.

---

## What Changed in the Code

Almost nothing.

| File | Change |
|---|---|
| `package.json` | Added `@cap-js/postgres` dev dependency; `deploy:pg` and `watch:pg` scripts; `[postgres]` config profile |
| `docker-compose.yml` | Added `pgadmin` service |
| Everything else | **Unchanged** |

The CDS data model, the service definition, the custom handlers, `server.js`,
and all six frontend stages are byte-for-byte identical to what they were in Stage 6.

---

## Stopping Everything

```bash
# Stop the CAP service and the UI service
Ctrl+C

# Stop and remove the Docker containers (data is preserved in the volume)
docker compose down

# To also delete the data volume and start fresh next time:
docker compose down -v
```

---

## The Full Picture

You have now built the complete stack:

```
Browser (Stage 1-6)
    │  HTTP + OData URLs
    ▼
CAP Service on Node.js (Stage 4+)
    │  SQL via @cap-js/postgres adapter
    ▼
PostgreSQL in Docker (Stage 7)
```

Each layer speaks a different language:
- Browser speaks OData (URLs with `$filter`, `$expand`, `$top`)
- CAP translates OData into SQL
- PostgreSQL speaks SQL

You have seen all three layers work, and you have seen the same data at each level.
That is the full picture.

---

*Ask Claude: "How would I add a new column to the Products table and see it in the OData response?"*
*or: "What does `cds deploy` generate as SQL? Show me the CREATE TABLE for Products."*
*or: "How is this different from what SAP HANA does in a real BTP deployment?"*
