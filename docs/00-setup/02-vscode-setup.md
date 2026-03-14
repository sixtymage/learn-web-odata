# VS Code Setup — Editor + SAP Extensions

VS Code (Visual Studio Code) is the standard editor for SAP CAP development.
It's free, runs on Windows, and has excellent extensions for CDS and Fiori.

---

## Install VS Code

1. Go to https://code.visualstudio.com
2. Click **Download for Windows**
3. Run the installer — accept all defaults
4. Launch VS Code

When it opens, you'll see a **Welcome** tab. Close it.

---

## Open This Repository

**File → Open Folder** → navigate to the `learn-web-odata` folder → click **Select Folder**

VS Code will show the folder structure on the left side (the Explorer panel).
This is your working view for the entire learning path.

---

## Install the SAP Extensions

Extensions add language support, syntax highlighting, code completion, and tools.
Install these two:

### 1. SAP CDS Language Support

This gives you syntax highlighting and autocompletion for `.cds` files
(the files that define the CAP data model and service).

- Press `Ctrl+Shift+X` to open the Extensions panel
- Search for: **SAP CDS Language Support**
- Publisher should be **SAP**
- Click **Install**

### 2. SAP Fiori Tools — Extension Pack

This is optional for the early stages but useful later. It includes:
- Fiori application generator
- Service modeler
- Annotation modeler

- In the Extensions panel, search for: **SAP Fiori Tools**
- Publisher should be **SAP**
- Click **Install**

### 3. Live Server

This launches a local web server so you can open HTML files in your browser
with a real URL (`http://localhost:...`) instead of a plain file path.

This matters from Stage 2 onward — browsers block `fetch()` calls made from
plain `file://` paths, so you need a local server to test network requests.

- In the Extensions panel, search for: **Live Server**
- Publisher should be **Ritwick Dey**
- Click **Install**

Once installed, right-click any `index.html` in the Explorer panel →
**Open with Live Server**. It opens the file in your browser and auto-refreshes
when you save changes.

---

## Useful VS Code Features

### Integrated Terminal

You'll run commands (`cds watch`, `npm install`, etc.) from a terminal inside VS Code.

- **Terminal → New Terminal** (or `Ctrl+`\``)
- This opens a terminal at the root of your repo — exactly where you need it

### The Explorer (File Tree)

Left sidebar, top icon. Shows all files and folders. Click any file to open it.

### Split Editor

If you want to see a doc and the code side by side:
- Right-click a file in the Explorer → **Open to the Side**

### Command Palette

`Ctrl+Shift+P` — type anything to find any VS Code command. Useful to know it exists.

---

## Verify CDS Extension Is Working

Open `src/backend/db/schema.cds` in VS Code.
You can navigate there quickly with `Ctrl+P` — type `schema.cds` and press Enter.
(This works for any file in the repo — faster than clicking through the Explorer.)

You should see:
- Keywords like `entity`, `String`, `Integer` highlighted in colour
- If you hover over an entity name, you get a tooltip

If the file looks like plain text (no colour), the CDS extension isn't installed correctly.
Try reloading VS Code: `Ctrl+Shift+P` → **Reload Window**.

---

## Recommended Settings (Optional)

Press `Ctrl+,` to open Settings. These are worth enabling:

- **Auto Save:** Set to `afterDelay` — files save automatically, you won't lose changes
- **Format on Save:** Useful for keeping code tidy

---

*Ask Claude: "Can you explain what the schema.cds file is doing?"*
*(Claude can read the file and explain it in detail — try it once Claude is installed.)*
