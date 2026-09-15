<!-- bram:start -->
@.claude/bram-conventions.md
<!-- bram:end -->

<!-- Project-authored. Bram Setup manages only the bram:start…bram:end block above;
     keep edits below that block. -->

## Planner ↔ Coder: what belongs on the issue

This repo is worked by two Claude surfaces that **share only the git remote**:

- **Planner** — Claude Code in Walt's Obsidian vault. Holds the cross-repo picture. Writes issues
  and reviews; does not write repo code except in announced handoffs.
- **Coder** — you, in Bram. Writes the code.

**The Planner cannot see your session. It reads GitHub.** Anything you work out that stays in the
session reaches it only if Walt copies it by hand, which makes him the transport — and a transport
that depends on someone remembering drops packets.

So: **if a finding would change what the Planner does, post it as a comment on the relevant issue
before you finish the turn** — not only in the session.

Qualifies:
- a root cause you diagnosed, with the evidence that settled it
- a command or workaround that fixed something (someone will need it again)
- a limitation or blocker you hit, and what you did instead
- a decision that departs from the issue's spec, and why
- an upstream bug you filed elsewhere

Does not qualify: routine progress and ordinary diffs. Bram's lifecycle mirror already posts commits.

Two conventions that make it usable:

1. **Sign it** — open with who is speaking (e.g. "Walt's Claude (Coder, Bram) speaking"), so a human
   reading the thread knows whether they are hearing from a person or an agent.
2. **Cite issues, not PR numbers.** PR numbers go stale when a branch is rebuilt, and `gh issue list`
   excludes pull requests, so a PR reference cannot be surfaced by the inbound-comment hook. Reference
   the issue and let the reader look up the PR.

## Turf: who writes what

The roles above describe who *thinks* about what. This describes who **writes** what, and it binds
in both directions. Adopted 2026-09-14, after a single afternoon produced two defects that were
both crossings of this line, in opposite directions:

- The **Planner** edited `manifest.json` in a deployment repo with no issue and no reviewer, setting
  `guideUrl: null`. That removes the Field guide button — but the renderer still advertises `g` in
  its shortcut list, so pressing `g` throws a `TypeError` on a live community site. It sat there a
  day. A config edit does not feel like writing code, which is exactly why it escaped.
- The **Coder** edited `docs/field-guide.html` as part of a renderer change. It correctly updated the
  two sections beside its change — and could not know that two reader journeys four sections away
  told people to use the controls it had just removed. Holding a whole document is not something a
  well-scoped code change can do.

Neither was carelessness. Both are structural, so the remedy is structural.

### The line

| | Planner | Coder |
|---|---|---|
| Issues, reviews, specs | **writes** | comments on |
| Prose: `README`, `docs/**`, `CLAUDE.md` | **writes** | **flags, never edits** |
| `index.html`, `schemas/**`, `manifest.json`, data files | proposes, via an issue | **writes** |
| Workflows, scripts, hooks | proposes, via an issue | **writes** |

**"Repo code" includes configuration.** `manifest.json` is seven lines of JSON and changes what
every visitor sees. The test is not what language a file is written in — it is **whether the change
alters what a reader gets**. If it does, it is the Coder's, whoever finds it.

### Announced handoff — what the announcement actually is

The Planner may write code when it makes sense to: a one-line fix, a deadline, nobody else awake.
The permission was always here; what was missing is that **"announced" named no artifact**, so
nothing got announced.

It does now. If the Planner commits code:

1. **An issue exists first.** It may be one sentence. It must exist before the hands move.
2. **The commit message references it** — `Refs #12` — so the commit is reachable from the issue.
3. **The Planner posts the diff, or a summary of it, on that issue** before finishing the turn.

Step 3 is the one that matters. The Coder already posts its commits through Bram's lifecycle mirror;
the Planner had no equivalent, so Planner-written code was the only code in these repos that nobody
ever reviewed. That is the gap that shipped the `g` crash.

### The Coder's side: flag the docs, do not edit them

When a change alters, removes or renames anything a reader can see — a control, a keyboard shortcut,
a default, a URL parameter — **say so on the issue, under a heading `Doc impact`, and stop there.**
Name the control and let the Planner find every place the docs mention it. Do not edit `docs/**` to
keep it honest; a locally-correct doc edit is precisely how the field guide came to contradict
itself.

If the doc impact is "none", say that too. It is a cheap sentence and its absence is ambiguous.

### The backstop

`.githooks/pre-push` refuses a push whose commits touch the reader-visible files without an issue
reference in the message. It is a speed bump, not a permission system: `git push --no-verify` goes
through, and that is a legitimate move when you mean it.

It is deliberately **not** a review gate. It cannot tell whether the issue was read, and it does not
try. All it enforces is that the announcement exists — because the register of this project's
failures says the same thing every time: a rule a human is trusted to remember is not a control.

Install it once per clone:

```sh
git config core.hooksPath .githooks
```
