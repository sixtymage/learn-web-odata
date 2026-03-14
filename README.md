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

## Starting from Scratch?

If you're reading this on GitHub and don't yet have any tools installed, start here.
You can read this page and the setup docs directly in GitHub — no download needed yet.

**Step 1 — Install Git**

Git is the version control tool that lets you download this repo (and track your own changes).
Install it from [https://git-scm.com/downloads](https://git-scm.com/downloads) — accept the defaults.

For first-time configuration, see [docs/00-setup/01-git-primer.md](docs/00-setup/01-git-primer.md)
(readable here on GitHub).

**Step 2 — Clone this repo**

Once Git is installed, open a terminal (Git Bash or Windows Terminal) and run:

```bash
git clone https://github.com/sixtymage/learn-web-odata.git
cd learn-web-odata
```

This downloads the entire repo to your machine.

**Step 3 — Follow LEARNING.md**

Open [`LEARNING.md`](LEARNING.md) — it walks you through the rest of the setup
(VS Code, Node.js, Claude Code, Docker) and then into the learning stages.

---

## Stack

| Layer | Technology | Notes |
|---|---|---|
| Backend | SAP CAP (Node.js) | CDS data model → OData service, automatic |
| Frontend (stages 1–3) | Plain HTML + `fetch()` | No framework; exposes raw HTTP/OData |
| Frontend (stages 5–6) | OpenUI5 (CDN) | The open-source Fiori framework; no build step |
| Database (dev) | SQLite (CAP built-in) | Zero setup; recreated on each run of the watch command |
| Database (Docker) | PostgreSQL | Real three-tier setup in Stage 7 |

---

## Learning Path

| Step | What you do | What you learn |
|---|---|---|
| Setup | `docs/00-setup/` | Git, VS Code + SAP extensions, Claude Code, Node.js, Docker |
| Stage 1 | Open `stage1-basics/index.html` in browser | HTML, JavaScript, the DOM — client side, no network |
| Stage 2 | `npm run watch` then open `stage2-fetch/` | `fetch()`, async/await, live OData endpoint |
| Stage 3 | Open `stage3-odata/` with backend running | `$filter`, `$select`, `$orderby`, `$expand` — by hand |
| Stage 4 | Edit `srv/catalog.js` | CAP custom handlers — server-side JS, git commit workflow |
| Stage 5 | Open `stage5-openui5/` | ODataModel, data binding — the library does what you just wrote |
| Stage 6 | Open `stage6-openui5-mvc/` | Same app with XML views + MVC — the real Fiori structure |
| Stage 7 | `docker compose up` | Three-tier architecture: browser → CAP → PostgreSQL |

**Start here: [`LEARNING.md`](LEARNING.md)**

---

## Repository Structure

```
learn-web-odata/
├── LEARNING.md              ← Start here
├── docs/
│   ├── 00-setup/            Git, VS Code, Claude Code, Node.js, Docker
│   ├── 01-web-basics/       HTTP, HTML, JavaScript, JSON
│   ├── 02-fetch-and-cap/    fetch(), async/await, CAP backend
│   ├── 03-odata-concepts/   $filter, $select, $expand and friends
│   ├── 04-cap-intro/        CDS models, service definitions, custom handlers
│   ├── 05-sapui5-intro/     ODataModel, data binding, Fiori context
│   ├── 06-openui5-mvc/      XML views, MVC structure, real Fiori pattern
│   └── 07-docker-postgres/  Docker, PostgreSQL, three-tier architecture
├── src/
│   ├── backend/             SAP CAP service
│   │   ├── db/schema.cds    Products, Categories, Orders, OrderItems
│   │   ├── srv/catalog.cds  OData service definition
│   │   └── srv/catalog.js   Custom handlers (validation, calculated fields)
│   └── frontend/
│       ├── stage1-basics/   Hardcoded data — HTML and JS fundamentals
│       ├── stage2-fetch/    Live data via fetch()
│       ├── stage3-odata/    Interactive OData query builder
│       ├── stage5-openui5/      OpenUI5 ODataModel + list binding
│       └── stage6-openui5-mvc/  XML views + MVC — real Fiori structure
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
- *"What's actually happening between `npm run watch` starting and my first fetch() call?"*

See [`docs/00-setup/04-claude-code.md`](docs/00-setup/04-claude-code.md) for install instructions.

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
