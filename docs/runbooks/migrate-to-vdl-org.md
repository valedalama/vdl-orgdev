# Runbook — moving this repo to a Vale da Lama organisation

Why: the Handbook, the org map and the Notion structure behind them are the **company's**
governance system, but today the repo sits under a personal GitHub account and the Notion databases
sit in a personal workspace. Neither survives its owner being unavailable. This runbook moves
ownership without moving the architecture, which is already right.

Reasoning and the alternatives considered are in the vault note *vdl-orgdev Enterprise Deployment —
Moving Ownership off Walt (2026-08-29)*. This file is the procedure.

> **Steps 1, 2 and 4 are done — 29 August 2026.** The repository now lives at
> `valedalama/vdl-orgdev` and the map at <https://valedalama.github.io/vdl-orgdev/>. What each step
> actually taught is recorded below, because the next repository to move will hit the same things.
> **Steps 0, 3 and 5 remain open**, and all three need a person signed in.

---

## 0. The people question — STILL OPEN

`graph.json` published to Pages carries the first name of everyone in the organisation, and
[issue #2](https://github.com/valedalama/vdl-orgdev/issues/2) will add roles on top — a public
description of who holds what authority.

| | Means | Cost |
|---|---|---|
| stay public | nothing changes | the staff map is world-readable, permanently |
| split | structure public, people private | two repos; contradicts the one-repo decision |
| private | Pages served to organisation members only | the organisation is on the **Free** plan, and Pages from a private repository needs a paid one |

**Correction to an earlier draft of this runbook**, which said deciding late would mean re-creating
the organisation. It would not: an organisation's plan is a billing setting that can be changed at
any time without touching its identity, its repositories or its URLs. Deciding late costs a plan
change, not a migration. The decision is still worth making deliberately — it just is not a trap.

## 1. The organisation — DONE

`valedalama` already existed, created 2020-02-05, with Walt as sole member and admin. It holds nine
repositories, most of them dormant since 2018–2024.

**A caution for the next time this check is run:** querying `api.github.com/users/<name>` returns
200 for an organisation as readily as for a person, so a name you already own reads as "taken". Ask
whether the account is *yours* before concluding you need a different name.

## 2. Transfer the repository — DONE

```sh
gh api -X POST repos/ludwa6/vdl-orgdev/transfer -f new_owner=valedalama
```

Completed in under six seconds, carrying issues, the open pull request, Pages, both workflows and
the repository secret. `github.com/ludwa6/vdl-orgdev` still redirects.

⚠️ **GitHub redirects the repository, but not Pages.** `https://ludwa6.github.io/vdl-orgdev/` began
returning 404 the moment the transfer completed. So step 4 is urgent rather than tidy-up: until it
runs, every published link to the map is dead.

## 3. Re-set the Notion credential — OPEN

**Verified 2026-08-29 on the real transfer: repository secrets DO survive.** `NOTION_API_KEY`
came through with its original timestamp intact, and the daily workflow kept running. So this step
is not a repair — it is the moment to stop sharing one credential between two purposes: the key in
use today belongs to an integration named for a desktop app, so rotating it for governance would
silently break the other use.

1. Create a **new Notion integration**, owned by the organisation, shared to only the nine OrgDev
   databases: Circles, People, Roles, Domains, Accountabilities, Policies, Decision Log, Meetings,
   Tensions.
2. `gh secret set NOTION_API_KEY --repo <ORG>/vdl-orgdev`
3. `gh workflow run refresh-graph.yml --repo <ORG>/vdl-orgdev` — wait for green.
4. Only then revoke the old key.

## 4. Repoint everything — DONE

```sh
./scripts/repoint-namespace.sh valedalama --write
git remote set-url origin git@github.com:valedalama/vdl-orgdev.git
```

11 references across 6 files — this repository and the OrgMap Lab schemas next door. The script
deliberately leaves the vault alone: dated notes record what was true on the day, and rewriting them
falsifies the record.

Still to do by hand: the **unposted** Discussion #1 draft addressed to Nita and the Secretaries.
Repoint it before it is posted.

## 5. Notion teamspace, then invite — OPEN

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
