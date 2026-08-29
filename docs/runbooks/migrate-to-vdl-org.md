# Runbook — moving this repo to a Vale da Lama organisation

Why: the Handbook, the org map and the Notion structure behind them are the **company's**
governance system, but today the repo sits under a personal GitHub account and the Notion databases
sit in a personal workspace. Neither survives its owner being unavailable. This runbook moves
ownership without moving the architecture, which is already right.

Reasoning and the alternatives considered are in the vault note *vdl-orgdev Enterprise Deployment —
Moving Ownership off Walt (2026-08-29)*. This file is the procedure.

**Steps 1, 3 and 5 need a person signed in. Nothing in them can be done by a script or an API key.**

---

## 0. Decide the people question first

`graph.json` published to Pages carries the first names of everyone in the organisation, and
[issue #2](https://github.com/ludwa6/vdl-orgdev/issues/2) will add roles on top — which is a public
description of who holds what authority. Three options, and **the plan for the organisation depends
on which one is chosen**:

| | Means | Cost |
|---|---|---|
| stay public | nothing changes | the staff map is world-readable, permanently |
| split | structure public, people private | two repos; contradicts the one-repo decision |
| private | Pages served to organisation members only | needs a paid GitHub plan |

Decide this before step 1. Changing it afterwards means re-creating the organisation.

## 1. Create the organisation

Names confirmed free on 2026-08-29: `vale-da-lama`, `quintavaledalama`, `vdl-governance`.
`valedalama` is taken. Precedent: `barlavento-eco`, which holds a domain in trust for its community.

## 2. Transfer the repository

Do this **before inviting anyone**. Transferring with collaborators attached is messier, and the
Pages URL then changes once rather than twice.

```sh
gh api -X POST repos/ludwa6/vdl-orgdev/transfer -f new_owner=<ORG>
```

Then confirm Pages rebuilt at `https://<ORG>.github.io/vdl-orgdev/`, and that the daily
`refresh-graph` workflow is still listed under Actions.

## 3. Re-set the Notion credential

Assume repository secrets did **not** survive the transfer, and re-set regardless — it is harmless
if they did. This is also the moment to stop sharing one credential between two purposes: the key in
use today belongs to an integration named for a desktop app, so rotating it for governance would
silently break the other use.

1. Create a **new Notion integration**, owned by the organisation, shared to only the nine OrgDev
   databases: Circles, People, Roles, Domains, Accountabilities, Policies, Decision Log, Meetings,
   Tensions.
2. `gh secret set NOTION_API_KEY --repo <ORG>/vdl-orgdev`
3. `gh workflow run refresh-graph.yml --repo <ORG>/vdl-orgdev` — wait for green.
4. Only then revoke the old key.

## 4. Repoint everything

```sh
./scripts/repoint-namespace.sh <ORG>            # dry run
./scripts/repoint-namespace.sh <ORG> --write
git remote set-url origin git@github.com:<ORG>/vdl-orgdev.git
```

The script covers this repo and the OrgMap Lab schemas next door. It deliberately leaves the vault
alone: dated notes are a record of what was true on the day, and rewriting them falsifies the
record. The living notes are repointed by hand, and the migration plan names which.

One thing the script cannot know about: the **unposted** Discussion #1 draft addressed to Nita and
the secretaries. Repoint it before it is posted.

## 5. Notion teamspace, then invite

The Notion API has no teamspace endpoints — all of this is done in the Notion interface.

1. Create a Vale da Lama teamspace and move the nine databases into it.
2. Add the two Secretaries as members of that teamspace only.
3. Share the new integration from step 3 with the teamspace.

A teamspace inside the existing workspace costs nothing and gets the Secretaries editing today. A
genuinely company-owned workspace is a separate migration; the teamspace is reversible, the
workspace is the real answer.

Then invite: **Notion for editing, the Pages URL for reading.** A GitHub account is deliberately not
required at this stage — keeping Notion as the write surface is what makes that true. Editing the
Handbook on GitHub comes after training.

## What this does not change

- Adoption of the Handbook is a Governance Meeting, not a deployment. The Register's blank adoption
  date stays blank until that meeting.
- The `.pages` / `.pdf` leg is still manual.
- Issue #2 is still open: until roles are nodes, the map cannot show a role nobody holds, which is
  the thing a Governance Meeting most needs to see.
