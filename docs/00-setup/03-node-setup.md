# Node.js + npm Setup

The SAP CAP backend runs on **Node.js**. This doc explains what Node.js is,
why SAP chose it for CAP, and how to install it.

---

## What Is Node.js?

Node.js is a runtime that lets JavaScript run outside the browser — on a server,
or on your developer machine.

You might know JavaScript as "the language that runs in browsers". That was true
until 2009, when Node.js was created. Since then, JavaScript (and its stricter cousin
TypeScript) has become one of the most common languages for building backend services.

SAP CAP supports both Node.js and Java backends. The Node.js version is more commonly
used for new development, which is why we use it here.

**ABAP analogy:** Node.js is the application server. Your `.cds` files define the data model
and service (like ABAP Dictionary + service definitions), and CAP on Node.js serves them
the same way the ABAP application server serves BAPIs and OData services.

---

## What Is npm?

npm (Node Package Manager) is the package manager for Node.js. It's equivalent to what
Maven is for Java — it downloads dependencies (libraries) and manages versions.

When you run `npm install` in a directory with a `package.json` file, npm reads the list
of dependencies and downloads them into a folder called `node_modules/`.

**ABAP analogy:** npm is like maintaining a list of required SAP notes and add-ons —
except it downloads and installs them automatically.

---

## Install Node.js

Use the **LTS** (Long Term Support) version — it's the most stable.

1. Go to https://nodejs.org
2. Download the **LTS** version for Windows
3. Run the installer — accept all defaults
4. When prompted about additional tools (Chocolatey), you can **skip** this for now

---

## Verify the Installation

Open a new terminal (important: new terminal, so it picks up the updated PATH):

```bash
node --version
# Should print something like: v20.11.0

npm --version
# Should print something like: 10.2.4
```

If you see version numbers, Node.js is installed correctly.

---

## Install the SAP CAP CLI

CAP provides a command-line tool called `cds`. Install it globally:

```bash
npm install -g @sap/cds-dk
```

This takes a minute. When it finishes, verify:

```bash
cds --version
# Should print the CDS version
```

---

## The package.json File

Open `src/backend/package.json` in VS Code. It has two important sections:

```json
"dependencies": {
  "@sap/cds": "...",
  "@sap/cds-dk": "...",
  "express": "..."
}
```

- `@sap/cds` — the CAP runtime library
- `express` — the underlying web server (CAP builds on top of it)

**ABAP analogy:** `package.json` is like an application's list of required software components.
SAP deliveries have similar dependency declarations.

---

## Key npm Commands

```bash
npm install                  # Install all dependencies listed in package.json
npm install <package>        # Install a specific package and add it to package.json
npm install -g <package>     # Install globally (available everywhere, not just this project)
npm run <script>             # Run a script defined in package.json's "scripts" section
```
