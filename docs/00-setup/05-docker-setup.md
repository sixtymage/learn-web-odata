# Docker Setup

Docker lets you package an application and everything it needs — runtime, libraries, config —
into a single portable unit called a **container**. Containers run identically on every machine.

**ABAP analogy:** Imagine packaging an entire SAP system — application server, database,
message server — into a box you can start with one command on any machine. That's Docker.
We'll use it in the later stages of this learning path to run a real database locally,
without installing it directly on your machine.

---

## Install Docker Desktop

1. Go to https://www.docker.com/products/docker-desktop
2. Download **Docker Desktop for Windows**
3. Run the installer — it will ask you to restart
4. After restart, Docker Desktop launches automatically (whale icon in the system tray)

**First-time setup:** Docker Desktop will ask about WSL 2 (Windows Subsystem for Linux).
Accept the defaults — Docker uses WSL 2 on Windows for better performance.

---

## Verify Docker Is Running

Open a terminal:

```bash
docker --version
# Docker version 24.x.x, build ...
```

The whale icon in the system tray should be steady, not animated. If it shows
"Docker starting...", wait a moment before continuing.

---

## See It in Action

Run Docker's own "hello world":

```bash
docker run hello-world
```

Docker will:
1. Notice you don't have the `hello-world` image locally
2. Download it automatically from Docker Hub (a public library of images)
3. Start a container from it
4. Print a message explaining exactly what just happened, then exit

The output narrates itself — read it carefully. That sequence (pull image → start container →
run → exit) is the same sequence that happens when we later start a full database server,
just with a more interesting image.

---

*When you reach Stage 5 of the learning path, you'll use Docker to run a PostgreSQL database
and the CAP backend together with a single command. For now, you're set.*
