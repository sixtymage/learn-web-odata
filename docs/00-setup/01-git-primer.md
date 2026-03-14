# Git Primer — For ABAP Developers

If you've spent your career in SAP, you've used version control — but probably not Git.
SAP has its own transport system (STMS), and older repositories use CTS or even manual
changelists. Git is different in one important way: **it's distributed**.

---

## Installation

Download and install Git from [https://git-scm.com/downloads](https://git-scm.com/downloads).
Accept the defaults during installation.

After installing, open a terminal and confirm it worked:

```bash
git --version
# → git version 2.x.x
```

---

## First-Time Configuration

Before you make your first commit, tell Git who you are. Every commit is stamped with
this identity — it's how GitHub knows which commits belong to your account.

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

Use the same email address as your GitHub account.

To confirm the settings were saved:

```bash
git config --global --list
# → user.name=Your Name
# → user.email=you@example.com
```

You only need to do this once per machine.

### Line Endings (Windows only)

Windows traditionally uses CR+LF (`\r\n`) to end lines in text files. Linux and macOS use
LF (`\n`) only. This causes noise in diffs and occasional tool failures when a repo is shared
across platforms.

This repo's `.gitattributes` file instructs Git to store and check out all text files with
LF endings, regardless of your OS. VS Code and all the tools in this stack handle LF correctly
on Windows — you won't notice the difference, but it prevents a class of subtle problems.

You don't need to configure anything. It's handled automatically.

---

## The Core Difference: Distributed vs. Centralized

In SAP's transport system, there is one central system that holds the truth.
You lock an object, change it, and release it to the next system in the landscape.

Git has **no central lock**. Every developer has a full copy of the entire history on their
own machine. You work locally, commit changes to your local copy, then push to a shared
server (like GitHub or Azure DevOps) when you're ready.

Think of it this way:
- SAP transports: like a shared document that only one person can edit at a time
- Git: like everyone has their own copy; you merge changes together when done

---

## The Key Concepts

### Repository (repo)
A folder that Git is tracking. This folder is a repo — Git stores its data in the hidden
`.git/` subfolder. You don't need to touch that directly.

### Commit
A saved snapshot of your changes. Every commit has:
- A unique ID (a hash like `5709149`)
- A message describing what you changed
- The actual diff (what was added/removed)

A commit is permanent. Unlike saving a file, you can always go back to any commit.

### Branch
A line of development. The main line is called `main` (or `master` in older repos).
You create branches to work on a feature without disturbing the main line.

In this repo, you'll mostly stay on `main`. Branches matter more in team settings.

### Remote
The copy of the repo on a server (GitHub, Azure DevOps, etc.). Your local changes
don't exist there until you `push` them.

---

## The Three Commands You'll Use Most

```bash
# See what's changed (what files have been modified)
git status

# Stage your changes (mark them ready to commit)
git add .           # Add everything
git add myfile.js   # Add one specific file

# Save a snapshot with a message
git commit -m "Add product list to stage2-fetch"

# Send your commits to the remote server
git push
```

> Don't worry if the command line feels unfamiliar. VS Code has a built-in Git panel
> (the branch icon in the left sidebar) that gives you a point-and-click interface for
> all of the above — staging files, writing a commit message, and pushing — without
> touching the terminal. The commands above are here so you understand what's happening
> under the hood; day to day you may never need to type them.

---

## The Usual Workflow

```
edit files → git add → git commit → git push
```

That's 90% of what you'll do day to day.

---

## Checking History

```bash
# See recent commits
git log --oneline

# See exactly what changed in the last commit
git show

# See what changed in a specific file
git log --oneline -- src/frontend/stage2-fetch/index.html
```

---

## If Something Goes Wrong

**"I accidentally changed a file and want to undo it"**
```bash
git restore myfile.js        # Undo changes to one file
git restore .                # Undo all changes (careful!)
```

**"I want to see what I changed before committing"**
```bash
git diff                     # Show unstaged changes
git diff --staged            # Show staged (add-ed) changes
```

---

## What This Repo Already Has

The repo was set up with an initial commit. You can see it:

```bash
git log --oneline
# 5709149 Initial commit
```

As you work through the exercises, you can commit your changes. It's good practice —
it means you can always go back if something breaks.

---

## SAP Transport System vs. Git — Quick Comparison

| SAP Transports | Git |
|---|---|
| Central lock on objects | No locks; everyone works in parallel |
| Transport = bundle of changes | Commit = snapshot of changes |
| Dev → QA → Prod landscape | Main branch → deployed environment |
| Release transport to move changes | `git push` to share; CI/CD to deploy |
| Can't easily go back | Any past commit is one command away |

---

*Ask Claude (once it is installed): "Show me what git commands I'd run to save my changes to stage2-fetch."*
