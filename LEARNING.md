# Start Here — Learning Path

Welcome. This repository teaches you the modern SAP web stack — Fiori, OData, and SAP CAP —
from first principles, with no magic and no skipped steps.

**You already understand SAP deeply. This repo builds a bridge to the web side.**

---

## How to Use This Repo

You have two companions as you work through this:

1. **These docs** — each `docs/` folder has a README that explains the concepts before you touch code
2. **Claude Code** — your AI assistant, already primed to teach *you specifically*

### Using Claude Code

Once Claude Code is running in this repository (see [`docs/00-setup/03-claude-code.md`](docs/00-setup/03-claude-code.md)),
you can ask it anything:

- *"Explain what fetch() is doing in stage2-fetch/index.html"*
- *"What's the ABAP equivalent of $filter?"*
- *"Why does CAP generate the OData service automatically?"*
- *"What would happen if I removed the `$expand` from this URL?"*
- *"Something isn't working — here's what I see in the browser console..."*

**There are no bad questions.** This repo was written specifically to be taught by Claude Code.

---

## The Learning Path

### Weekend 1

#### Step 0 — Setup ([`docs/00-setup/`](docs/00-setup/))

Work through these in order. Each is short with exact commands.

1. [`01-git-primer.md`](docs/00-setup/01-git-primer.md) — Git concepts (no DVCS in the ABAP world — this will be new)
2. [`02-vscode-setup.md`](docs/00-setup/02-vscode-setup.md) — VS Code + SAP CDS extension + SAP Fiori Tools
3. [`03-claude-code.md`](docs/00-setup/03-claude-code.md) — Install Claude Code, open this repo, try your first question
4. [`04-node-setup.md`](docs/00-setup/04-node-setup.md) — Node.js and npm (the runtime the CAP backend uses)
5. [`05-docker-setup.md`](docs/00-setup/05-docker-setup.md) — Docker Desktop (used in the final stage)

#### Step 1 — Web Basics ([`docs/01-web-basics/`](docs/01-web-basics/) + [`src/frontend/stage1-basics/`](src/frontend/stage1-basics/))

Start here to understand what the browser actually is and does.

- Read [`docs/01-web-basics/README.md`](docs/01-web-basics/README.md)
- Open [`src/frontend/stage1-basics/index.html`](src/frontend/stage1-basics/index.html) in your browser
- Read the code. Ask Claude to explain anything that isn't clear.

**Goal:** Render a hardcoded product list in the browser. No network calls yet.

#### Step 2 — Live Data with fetch() ([`src/frontend/stage2-fetch/`](src/frontend/stage2-fetch/))

- Start the backend: `cd src/backend && npm install && cds watch`
- Open `http://localhost:4004` and explore what CAP generated
- Read [`src/frontend/stage2-fetch/index.html`](src/frontend/stage2-fetch/index.html)
- Update it (or ask Claude to walk you through it) to fetch live data

**Goal:** Product list is now fetched from a real OData endpoint.

---

### Weekend 2

#### Step 3 — OData Queries ([`docs/02-odata-concepts/`](docs/02-odata-concepts/) + [`src/frontend/stage3-odata/`](src/frontend/stage3-odata/))

- Read [`docs/02-odata-concepts/README.md`](docs/02-odata-concepts/README.md)
- Open [`src/frontend/stage3-odata/index.html`](src/frontend/stage3-odata/index.html)
- Use the filter controls to construct and fire OData queries by hand

**Goal:** You know exactly what `$filter`, `$select`, `$expand` do at the URL level.

#### Step 4 — OpenUI5 ([`docs/04-sapui5-intro/`](docs/04-sapui5-intro/) + [`src/frontend/stage4-openui5/`](src/frontend/stage4-openui5/))

- Read [`docs/04-sapui5-intro/README.md`](docs/04-sapui5-intro/README.md)
- Open [`src/frontend/stage4-openui5/index.html`](src/frontend/stage4-openui5/index.html)
- See how ODataModel binding replaces the manual fetch() you wrote

**Goal:** You understand what the Fiori framework is doing for you — because you did it first.

#### Step 5 — Docker / Three-Tier ([`docs/00-setup/05-docker-setup.md`](docs/00-setup/05-docker-setup.md))

- Read the Docker doc
- Run `docker compose up`
- Browser → CAP service → PostgreSQL: the production shape

**Goal:** You can picture the architecture of a real SAP BTP application.

---

## Quick Reference

```
docs/
  00-setup/       Setup guides (Git, VS Code, Claude Code, Node.js, Docker)
  01-web-basics/  HTTP, HTML, JavaScript, JSON
  02-odata-concepts/ OData URL syntax and conventions
  03-cap-intro/   What SAP CAP is and why it exists
  04-sapui5-intro/ OpenUI5 and Fiori data binding

src/
  backend/        SAP CAP service — the OData backend
  frontend/
    stage1-basics/  No network; hardcoded data
    stage2-fetch/   fetch() against CAP
    stage3-odata/   OData query params, interactive
    stage4-openui5/ OpenUI5 ODataModel + list binding
```

---

*If you get stuck at any point, open a terminal in this directory and ask Claude Code.*
*It has read every file in this repo and knows your background.*
