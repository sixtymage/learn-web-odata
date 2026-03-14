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

Once Claude Code is running in this repository (see [`docs/00-setup/04-claude-code.md`](docs/00-setup/04-claude-code.md)),
you can ask it anything:

- *"Explain what fetch() is doing in stage2-fetch/index.html"*
- *"What's the ABAP equivalent of $filter?"*
- *"Why does CAP generate the OData service automatically?"*
- *"What would happen if I removed the `$expand` from this URL?"*
- *"Something isn't working — here's what I see in the browser console..."*

**There are no bad questions.** This repo was written specifically to be taught by Claude Code.

---

## The Learning Path

#### Step 0 — Setup ([`docs/00-setup/`](docs/00-setup/))

Work through these in order. Each is short with exact commands.

1. [`01-git-primer.md`](docs/00-setup/01-git-primer.md) — Install Git, configure your name and email, learn the key concepts
2. **Clone this repo** — once Git is installed, open a terminal and run:
   ```bash
   git clone https://github.com/sixtymage/learn-web-odata.git
   cd learn-web-odata
   ```
3. [`02-vscode-setup.md`](docs/00-setup/02-vscode-setup.md) — Install VS Code, open the repo, add the SAP extensions
4. [`03-node-setup.md`](docs/00-setup/03-node-setup.md) — Install Node.js and npm (required for Claude Code and the CAP backend)
5. [`04-claude-code.md`](docs/00-setup/04-claude-code.md) — Install Claude Code, authenticate, open this repo, try your first question
6. [`05-docker-setup.md`](docs/00-setup/05-docker-setup.md) — Docker Desktop (used in the final stage only — can leave this until then)

#### Step 1 — Web Basics ([`docs/01-web-basics/`](docs/01-web-basics/) + [`src/frontend/stage1-basics/`](src/frontend/stage1-basics/))

Start here to understand what the browser actually is and does.

- Read [`docs/01-web-basics/README.md`](docs/01-web-basics/README.md)
- Open [`src/frontend/stage1-basics/index.html`](src/frontend/stage1-basics/index.html) in your browser
- Read the code. Ask Claude to explain anything that isn't clear.

**Goal:** Render a hardcoded product list in the browser. No network calls yet.

#### Step 2 — Live Data with fetch() ([`src/frontend/stage2-fetch/`](src/frontend/stage2-fetch/))

- Start the backend: `cd src/backend && npm install && npm run watch`
- Open `http://localhost:4004` and explore what CAP generated
- Read [`src/frontend/stage2-fetch/index.html`](src/frontend/stage2-fetch/index.html)
- Update it (or ask Claude to walk you through it) to fetch live data

**Goal:** Product list is now fetched from a real OData endpoint.

#### Step 3 — OData Queries ([`docs/03-odata-concepts/`](docs/03-odata-concepts/) + [`src/frontend/stage3-odata/`](src/frontend/stage3-odata/))

- Read [`docs/03-odata-concepts/README.md`](docs/03-odata-concepts/README.md)
- Open [`src/frontend/stage3-odata/index.html`](src/frontend/stage3-odata/index.html)
- Use the filter controls to construct and fire OData queries by hand

**Goal:** You know exactly what `$filter`, `$select`, `$expand` do at the URL level.

#### Step 4 — CAP Custom Handlers ([`docs/04-cap-intro/`](docs/04-cap-intro/))

- Read [`docs/04-cap-intro/README.md`](docs/04-cap-intro/README.md)
- Edit `src/backend/srv/catalog.js` to add a word to the profanity filter
- Stage and commit the change with git

**Goal:** You understand server-side JavaScript in CAP, and have done a real code change under git.

#### Step 5 — OpenUI5 ([`docs/05-sapui5-intro/`](docs/05-sapui5-intro/) + [`src/frontend/stage5-openui5/`](src/frontend/stage5-openui5/))

- Read [`docs/05-sapui5-intro/README.md`](docs/05-sapui5-intro/README.md)
- Open [`src/frontend/stage5-openui5/index.html`](src/frontend/stage5-openui5/index.html)
- See how ODataModel binding replaces the manual fetch() you wrote

**Goal:** You understand what the Fiori framework is doing for you — because you did it first.

#### Step 6 — XML Views + MVC ([`docs/06-openui5-mvc/`](docs/06-openui5-mvc/) + [`src/frontend/stage6-openui5-mvc/`](src/frontend/stage6-openui5-mvc/))

- Read [`docs/06-openui5-mvc/README.md`](docs/06-openui5-mvc/README.md)
- Open `src/frontend/stage6-openui5-mvc/` — the Stage 5 app rewritten with XML views and a controller
- Compare `view/Main.view.xml` to Stage 5's control construction code

**Goal:** You understand the MVC structure used in all real Fiori apps.

#### Step 7 — Docker / Three-Tier ([`docs/07-docker-postgres/`](docs/07-docker-postgres/))

- Read [`docs/07-docker-postgres/README.md`](docs/07-docker-postgres/README.md)
- Run `docker compose up`
- Browser → CAP service → PostgreSQL: the production shape

**Goal:** You can picture the architecture of a real SAP BTP application.

---

## Quick Reference

```
docs/
  00-setup/           01-git-primer, 02-vscode-setup, 03-node-setup, 04-claude-code, 05-docker-setup
  01-web-basics/      HTTP, HTML, JavaScript, JSON
  02-fetch-and-cap/   fetch(), async/await, CAP backend
  03-odata-concepts/  OData URL syntax and query options
  04-cap-intro/       CDS models, service definitions, custom handlers
  05-sapui5-intro/    OpenUI5 and Fiori data binding
  06-openui5-mvc/     XML views and MVC structure
  07-docker-postgres/ Docker, PostgreSQL, three-tier architecture

src/
  backend/        SAP CAP service — the OData backend
  frontend/
    stage1-basics/  No network; hardcoded data
    stage2-fetch/   fetch() against CAP
    stage3-odata/   OData query params, interactive
    stage5-openui5/     OpenUI5 ODataModel + list binding
    stage6-openui5-mvc/ XML views + MVC structure
```

---

*If you get stuck at any point, open a terminal in this directory and ask Claude Code.*
*It has read every file in this repo and knows your background.*
