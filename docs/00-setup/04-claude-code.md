# Claude Code — Your AI Teaching Companion

Claude Code is a command-line AI assistant that runs inside your terminal and has access
to all the files in your repository. It can read code, explain concepts, suggest changes,
and answer questions — and it has already been briefed on who you are and what you're learning.

---

## Install Claude Code

Claude Code runs on Node.js (which you'll install in the next doc). Once Node is installed:

```bash
npm install -g @anthropic-ai/claude-code
```

That installs the `claude` command globally on your machine.

---

## First-Time Setup

You'll need a Claude account (claude.ai). The first time you run Claude Code, it will
open a browser window and ask you to log in and paste a confirmation code back into the
terminal. No API key needed.

```bash
claude
```

Follow the prompts — it walks you through the authentication step by step.

---

## Open This Repository with Claude Code

In the VS Code integrated terminal (or any terminal), navigate to this repo:

```bash
cd path/to/learn-web-odata
claude
```

Claude Code will start and you'll see a prompt. It automatically reads the `CLAUDE.md`
file at the root of the repo, which tells it:
- Who you are and your background
- What this repo is teaching
- How to frame explanations for you specifically

---

## Try Your First Question

Once Claude Code is running, try:

> *"What is this repo teaching me, and where should I start?"*

It should give you the five-stage learning path framed specifically for an ABAP developer.

Then try:

> *"Open the file src/backend/db/schema.cds and explain what it's defining"*

Claude Code will read the file and explain the data model in terms you'll recognize
from ABAP Dictionary and CDS Views.

---

## Good Questions to Ask During Each Stage

### While setting up:
- *"Is Node.js installed correctly on my machine?"*
- *"What does `npm install` actually do?"*
- *"Explain what `cds watch` is doing when I run it"*

### While reading HTML/JavaScript:
- *"What is the DOM? How is it like a tree structure I might know from ABAP?"*
- *"Walk me through what happens line by line in stage2-fetch/index.html"*
- *"What would happen if I changed this `fetch()` URL?"*

### While working with OData:
- *"What's the ABAP Open SQL equivalent of `$filter=Price gt 100`?"*
- *"Show me what the raw HTTP request looks like when I call this OData endpoint"*
- *"Why does `$expand` exist? What problem does it solve?"*

### When something breaks:
- *"I get this error in the browser console: [paste the error]. What does it mean?"*
- *"The fetch() isn't returning data. Here's what I see: [describe it]. What should I check?"*

---

## How Claude Code Reads Files

Claude Code can read any file in your repo. You don't need to paste code into the chat.
Just say:

> *"Read the file src/frontend/stage3-odata/index.html and explain the filter logic"*

Or point it at a doc:

> *"Read docs/02-odata-concepts/README.md and then quiz me on OData $filter syntax"*

---

## Important: Claude Code vs. Claude.ai

- **Claude.ai** (the website) — general-purpose chat; doesn't know your repo
- **Claude Code** (command line, `claude`) — lives inside your repo, reads your files, knows your context

For this learning path, always use **Claude Code** in the terminal, not the website.

---

## Helpful Shortcuts and Features

| What you want | How to do it |
|---|---|
| Submit your message | `Enter` |
| New line without submitting | `Shift+Enter` |
| Cancel current operation | `Ctrl+C` |
| Exit Claude Code | `Ctrl+D` |
| Scroll back through your prompts | `↑` / `↓` arrow keys |
| Reference a specific file | Type `@` and start typing the filename — Claude Code will autocomplete it |
| Reference a specific folder | Type `@` and type part of the folder path |
| Clear the screen | `/clear` |

### The `@` File Reference

Instead of typing *"read the file src/backend/db/schema.cds"*, you can type `@` and pick the file directly:

> *"Explain @schema.cds to me in ABAP terms"*

Claude Code will pull in the file contents automatically. This works for any file in the repo.

---

*The CLAUDE.md file at the root of this repo tells Claude Code everything it needs to know*
*about you and this learning path. You can open it and read it yourself to see what it says.*
