# learn-web-odata

A compressed, progressive learning repo for experienced SAP/ABAP developers getting up
to speed on the modern SAP web stack: **OData, SAP CAP, and Fiori/OpenUI5**.

The guiding principle: **nothing should feel like magic**. Each stage builds directly on
the last, so that when the framework abstractions arrive, you already know what they're doing.

---

## Who This Is For

Developers who know SAP deeply — ABAP, Business Objects, the transport system —
but have little or no web frontend experience (and no prior CDS Views exposure needed).
This repo builds the bridge.

Every concept is explained in terms you already know. HTTP calls are RFC calls.
`$filter` is a WHERE clause. `$expand` is a JOIN. CAP services are Business Objects
with auto-generated OData exposure.

---

## Stack

| Layer | Technology | Notes |
|---|---|---|
| Backend | SAP CAP (Node.js) | CDS data model → OData service, automatic |
| Frontend (stages 1–3) | Plain HTML + `fetch()` | No framework; exposes raw HTTP/OData |
| Frontend (stage 4) | OpenUI5 (CDN) | The open-source Fiori framework; no build step |
| Database (dev) | SQLite (CAP built-in) | Zero setup; recreated on each `cds watch` |
| Database (Docker) | PostgreSQL | Real three-tier setup in Stage 5 |

---

## Learning Path

### Weekend 1

| Step | What you do | What you learn |
|---|---|---|
| Setup | `docs/00-setup/` | Git, VS Code + SAP extensions, Claude Code, Node.js, Docker |
| Stage 1 | Open `stage1-basics/index.html` in browser | HTML, JavaScript, the DOM — client side, no network |
| Stage 2 | `cds watch` then open `stage2-fetch/` | `fetch()`, async/await, live OData endpoint |

### Weekend 2

| Step | What you do | What you learn |
|---|---|---|
| Stage 3 | Open `stage3-odata/` with backend running | `$filter`, `$select`, `$orderby`, `$expand` — by hand |
| Stage 4 | Open `stage4-openui5/` | ODataModel, data binding — the library does what you just wrote |
| Stage 5 | `docker compose up` | Three-tier architecture: browser → CAP → PostgreSQL |

**Start here: [`LEARNING.md`](LEARNING.md)**

---

## Quick Start

```bash
# 1. Install the SAP CAP CLI (once)
npm install -g @sap/cds-dk

# 2. Start the backend
cd src/backend
npm install
cds watch
# → OData service running at http://localhost:4004

# 3. Open a frontend stage — no build step
# Right-click index.html in VS Code → Open with Live Server
# OR serve locally:
npx serve src/frontend/stage2-fetch

# 4. Full three-tier setup (Stage 5)
docker compose up
```

---

## Repository Structure

```
learn-web-odata/
├── LEARNING.md              ← Start here
├── docs/
│   ├── 00-setup/            Git, VS Code, Claude Code, Node.js, Docker
│   ├── 01-web-basics/       HTTP, HTML, JavaScript, JSON
│   ├── 02-odata-concepts/   $filter, $select, $expand and friends
│   ├── 03-cap-intro/        CDS models, service definitions, cds watch
│   └── 04-sapui5-intro/     ODataModel, data binding, Fiori context
├── src/
│   ├── backend/             SAP CAP service
│   │   ├── db/schema.cds    Products, Categories, Orders, OrderItems
│   │   ├── srv/catalog.cds  OData service definition
│   │   └── srv/catalog.js   Custom handlers (validation, calculated fields)
│   └── frontend/
│       ├── stage1-basics/   Hardcoded data — HTML and JS fundamentals
│       ├── stage2-fetch/    Live data via fetch()
│       ├── stage3-odata/    Interactive OData query builder
│       └── stage4-openui5/  OpenUI5 ODataModel + list binding
└── docker-compose.yml       CAP + PostgreSQL
```

---

## Using Claude Code

This repo is written to be taught by [Claude Code](https://claude.ai/code).
The `CLAUDE.md` at the root primes it with your learner profile and the full
context of the learning path.

Once Claude Code is running in this directory, ask it anything:

- *"Explain what `$expand` does and what the ABAP equivalent is"*
- *"Walk me through stage3-odata/index.html line by line"*
- *"Something's not working — here's what I see in the browser console..."*
- *"What's actually happening between `cds watch` starting and my first fetch() call?"*

See [`docs/00-setup/03-claude-code.md`](docs/00-setup/03-claude-code.md) for install instructions.

---

## Data Domain

Products & Orders — directly analogous to SAP Materials Management and Sales & Distribution:

```
Categories  (ID, Name)
Products    (ID, Name, Category → Categories, Price, Stock)
Orders      (ID, Customer, Date, Status)
OrderItems  (ID, Order → Orders, Product → Products, Quantity, UnitPrice)
```

Rich enough to demonstrate `$expand=Items($expand=Product)` without being overwhelming.
