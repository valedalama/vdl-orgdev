# Validation sheets — one per circle

**Generated. Do not edit by hand.** Every file here is rewritten by
`scripts/build-validation-sheets.mjs` from the live Notion databases. A sheet that
drifts from the database is worse than none, because it would be trusted in a meeting.

```sh
NOTION_API_KEY=... node scripts/build-validation-sheets.mjs
```

`pt/` is the working language; `en/` is the same sheet for anyone who needs it. Both are
regenerated together.

## What a sheet is for

A circle validates its own record, at its own meeting. The sheet is what gets read out:
who holds what, which of the four core roles are open — and, the distinction that matters,
which ones **do not exist at all**. An absent role record renders as nothing on the map, so
it cannot be noticed by looking; it has to be listed.

The **To check** section is the point of the exercise. It only ever contains things a human
has to decide:

| Flag | Means |
|---|---|
| **NO RECORD** | the circle has no role of that kind — not vacant, absent |
| hand-set status disagrees with computed | `Status (Legacy)` was set by hand and no longer matches occupancy |
| not linked back from the circle | the role exists, but the circle does not point at it — and `build-graph.mjs` reads from the circle side, so **the map cannot see it** |
| linked to more than one circle | a role belongs to one circle; two suggests a mistake or a shared function that needs naming |
| energizes a role but is not a member | the circle's member list and its roles disagree about who is in the circle |
| no written purpose | a role without a purpose cannot be evaluated, filled, or handed over |

## The two directions, and why both are checked

A role record says *"my circle is X"*. A circle record says *"my Secretary is Y"*. Notion lets
either be maintained without the other, and they had drifted apart. The map is built from the
**circle** side, which was the patchier of the two — so a correctly-recorded role could be
entirely invisible on the map. The sheet compares both.

## After a meeting

Change the record in Notion, re-run the generator, and the sheet reflects the decision. The
sheets are not the record; Notion is.
