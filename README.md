# vdl-orgdev

The OrgDev system for **Quinta Vale da Lama, Lda.** — a Holacracy-derived governance implementation.
Notion holds the structure; this repo holds everything else.

**Live org map:** https://valedalama.github.io/vdl-orgdev/

---

## Start here

**Português: [README.pt.md](README.pt.md)** — the Portuguese entry point. The Handbook is a
Portuguese document and most of the people who use it work in Portuguese; that page is the front
door, not a translation of this one.

| You are | Read |
|---|---|
| New to the governance system | [`handbook/en/01_Who_We_Are_EN.md`](handbook/en/01_Who_We_Are_EN.md), then 03, 04 and the glossary in 09 |
| A Circle Secretary | [`docs/en/secretary-manual.md`](docs/en/secretary-manual.md) — the working guide · [português](docs/pt/manual-do-secretario.md) (definitive) |
| Looking for the Handbook | [`handbook/pt/`](handbook/pt/) (definitive) · [`handbook/en/`](handbook/en/) (translation) |
| Administering Notion | [`docs/data-entry-sop.md`](docs/data-entry-sop.md), [`docs/admin-guide.md`](docs/admin-guide.md) |
| Working on the code | the rest of this page |

> ⚠️ **The map and the Handbook do not yet agree.** The Handbook describes four Circles — Anchor,
> Operations, Casa, Regenerative Farm. The map, generated from Notion, shows nine at two levels,
> under different names, and does not show the Anchor Circle at all. These are two portraits taken
> at different moments, not a bug. **Reconciling them is a governance decision** and is on the
> agenda for the first Governance Meeting. **Until then the Handbook is what holds.**

**Which governs, when they disagree:** the Handbook and adopted Policies first, then the Register of
Adopted Variations (document 05), then the [Holacracy Constitution
v5.0](https://www.holacracy.org/constitution/5-0/) as residual. A divergence not in the Register is
a defect, not a rule. See handbook documents 04 and 10.

> Renamed from `vdl-orgmap` on 2026-08-15, when this repo became the single home for OrgDev code and
> documentation. **The GitHub repo URL redirects (301); the old Pages URL does not** —
> `ludwa6.github.io/vdl-orgmap/` now returns 404. Renaming before the staff rollout was the point:
> no bookmarks to break.

---

## The one rule

> **Every file is either *written* or *generated*. Generated files live under a `generated/` path and
> carry a do-not-edit header. Nothing is both.**

Drift in this project has always come from the same place: a hand-written document describing a live
system. The schema documentation was wrong in four places within six months of being written, which
is why it is now generated rather than maintained.

## Layout

| Path | What | Written or generated |
|---|---|---|
| `index.html` | The org map — the staff-facing surface | written |
| `graph.json` | The org graph, from Notion. **Git history is the structural audit trail** | **generated** |
| `docs/` | SOP, admin guide, backlog, schema context | written |
| `docs/generated/` | Live Notion schema | **generated** |
| `scripts/` | Build scripts and the validator | written |
| `handbook/` | `.md` / `.docx` exports of the governance handbook (Tier 2 audit trail) | exported |
| `archive/` | Superseded material, kept for history — **not reference** | frozen |

## The three tiers

| Tier | Content | Changes | Home |
|---|---|---|---|
| 1 — Constitution | Holacracy v5.0 + the Register of Adopted Variations | almost never | the Constitution |
| 2 — Narrative | Purpose, Values, how we work, glossary | rarely, by a human | the handbook |
| 3 — **Structure** | Circles, Roles, Domains, Accountabilities, Policies, assignments | **every Governance Meeting** | **Notion** |

Tier 3 is the fast-moving layer and the only one with a machine-readable home. The map and the
enumerated sections of the handbook are both generated from it.

## Credentials

`NOTION_API_KEY` lives in **GitHub Actions secrets only** — never in this repo, never in the browser.
This repo is public and generates its data from a credentialled source; all access goes through
`process.env` in the build scripts.

## Status — 2026-08-15

- `scripts/replit-proxy-DEPRECATED/` is the retired Express proxy. Nothing runs it: the map has been
  served from `graph.json` since 2026-08-14. Kept only until the org migration, which deletes it.
  It is being replaced by a scheduled GitHub Action that commits `graph.json`. **It stays until the
  Action is proven against its output** — 23 nodes / 26 edges as of 2026-08-14.
- `docs/schema-current.md` is still the hand-written February version. It is superseded by
  `docs/generated/schema.md` as soon as `build-schema.mjs` exists.
