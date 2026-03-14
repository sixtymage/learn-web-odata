# Docker Setup — Three-Tier Architecture

Docker is used in **Stage 5** of this learning path, after you've worked through the
frontend stages. This doc explains what Docker is, why it matters, and how to run
the full three-tier setup for this repo.

---

## What Is Docker?

Docker lets you package an application and everything it needs (runtime, libraries, config)
into a single portable unit called a **container**. Containers run the same way on every
machine — no "it works on my laptop" problems.

**ABAP analogy:** Imagine if you could package an entire SAP system — application server,
database, message server — into a box that you could start with one command on any machine.
That's what Docker does for Node.js applications and databases.

---

## Why Docker in This Repo?

The earlier stages use CAP with an in-memory SQLite database — simple, zero setup.
But in a real three-tier application:

```
Browser (client)
    ↕ HTTP/OData
CAP Service (application server)
    ↕ SQL
PostgreSQL (database)
```

Docker lets us run a real PostgreSQL database locally without installing it directly
on your machine. The `docker-compose.yml` file in this repo starts both the CAP service
and a PostgreSQL database with one command.

---

## Install Docker Desktop

1. Go to https://www.docker.com/products/docker-desktop
2. Download **Docker Desktop for Windows**
3. Run the installer — it will ask you to restart
4. After restart, Docker Desktop launches automatically (look for the whale icon in the system tray)

**First-time setup:** Docker Desktop will ask about WSL 2 (Windows Subsystem for Linux).
Accept the defaults — Docker uses WSL 2 on Windows for better performance.

---

## Verify Docker Is Running

Open a terminal:

```bash
docker --version
# Docker version 24.x.x, build ...

docker compose version
# Docker Compose version v2.x.x
```

Also verify Docker Desktop is running — the whale icon in the system tray should be steady
(not animated). If it shows "Docker starting...", wait a moment.

---

## Understanding `docker-compose.yml`

Open `docker-compose.yml` at the root of this repo. It defines two services:

```yaml
services:
  db:        # PostgreSQL database
  backend:   # CAP service connected to that database
```

When you run `docker compose up`, Docker:
1. Downloads the PostgreSQL image (if not already cached)
2. Starts a PostgreSQL container with the configured database, user, and password
3. Builds the CAP service container from `src/backend/`
4. Starts the CAP service, which connects to PostgreSQL

**ABAP analogy:** This is like starting a mini SAP landscape — database layer (like DB2 or HANA)
and application layer (like the ABAP application server) — with one command.

---

## Running the Three-Tier Setup

From the root of this repo:

```bash
docker compose up
```

You'll see logs from both containers streaming in the terminal.

When you see something like:
```
backend  | [cds] - serving CatalogService { path: '/odata/v4/catalog' }
```

The CAP service is running and connected to PostgreSQL. Open:
- http://localhost:4004/odata/v4/catalog — service root
- http://localhost:4004/odata/v4/catalog/Products — product data

To stop:
```bash
Ctrl+C          # Stop the containers
docker compose down   # Remove the containers (data is preserved in a volume)
```

---

## Key Docker Concepts

| Concept | What It Is | ABAP Analogy |
|---|---|---|
| Image | A template for a container | Like an SAP installation source |
| Container | A running instance of an image | Like a running SAP system instance |
| Volume | Persistent storage for a container | Like the database files on disk |
| Compose file | Defines multiple containers and how they connect | Like a system landscape definition |

---

## CAP + PostgreSQL — What Changes

In the earlier stages, CAP uses SQLite (an in-memory/file-based database — no setup needed).
When Docker runs, CAP switches to PostgreSQL based on environment variables set in
`docker-compose.yml`.

The **CDS data model doesn't change**. CAP handles the difference between SQLite and
PostgreSQL automatically. This is the key insight: your data model is separate from
the database technology underneath it.

---

## Troubleshooting

**"Cannot connect to the Docker daemon"**
Docker Desktop isn't running. Find the whale icon in the system tray and click it.

**"Port 4004 is already in use"**
You have `cds watch` running in another terminal. Stop it first (`Ctrl+C`), then try again.

**"Port 5432 is already in use"**
Something else is using the PostgreSQL port. Check for a local PostgreSQL installation.

---

*Ask Claude: "Explain what the docker-compose.yml file in this repo is doing, step by step."*
