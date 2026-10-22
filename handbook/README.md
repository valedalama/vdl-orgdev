# handbook — the Governance Handbook

**The Markdown files in this directory are the Handbook.** Not a copy of it, not an export of it —
the document itself. Everything else is generated from them.

> **Changed on 2026-08-20.** Until that date the `.pages` files were the source and this directory
> held read-only exports. That is now reversed. The reason is in §*Why it was inverted* below; the
> practical consequence is that **an edit made to a `.pages` file no longer reaches the Handbook.**

## Read it online

- **Português (o texto que vigora):** <https://valedalama.github.io/vdl-orgdev/handbook/pt/>
- **English (a translation):** <https://valedalama.github.io/vdl-orgdev/handbook/en/>

Each contents page lists the ten documents in order. Every document opens in the browser and can
be downloaded as Word (`.docx`). These are the links to give people; the map's **Read the Handbook**
button opens the Portuguese one.

---

## What is here

| | |
|---|---|
| `pt/*.md` | The **definitive** Portuguese Handbook. This is the source. |
| `en/*.md` | The English Handbook — a translation of the Portuguese, human-accepted, not machine-refreshed |
| `pt/index.md`, `en/index.md` | **Generated.** The contents pages above, built from the documents' own titles by `scripts/build-handbook-index.mjs`. Not Handbook documents. Do not edit |
| `pt/*.docx`, `en/*.docx` | **Generated.** Produced by `scripts/md2docx.py`. Do not edit |
| `en/00_*.md` | Working notes about the translation, not Handbook documents |

**The contents pages look after themselves.** When a document is added, removed or retitled, the
*Handbook contents pages* workflow rebuilds both pages and commits them within a minute or two of the
push. Nobody runs anything for the contents pages. To add a document, name it `NN_Title.md` and
put its title on the line after the banner, as the existing ten do. Its row appears without a Word
download until someone runs `scripts/md2docx.py` and pushes the `.docx`; the download link then
appears on the next rebuild.

**The Portuguese wins.** Where the two language sets disagree, the Portuguese is the governance
document and the English is a translation of it.

## The rule

> **Change the Markdown. Regenerate the rest. Never edit a generated file.**

```
handbook/pt/*.md  ──scripts/md2docx.py──▶  .docx  ──Pages, by hand──▶  .pages / .pdf
       │
       └─ the source: what a Governance Meeting adopts, what git diffs, what the map is checked against
```

To produce the whole set after an accepted revision:

```
python3 scripts/md2docx.py --all
scripts/handbook-roundtrip.sh          # proves the .docx lost nothing
```

`.pages` and `.pdf` stay a manual step: open the `.docx` in Pages and export. Pages has no
scriptable *export as Pages* verb, so nobody has automated that leg and nobody should pretend to.

## Two checks worth running

**`scripts/handbook-parity.sh <pt-term> [en-term]`** — the Handbook is one document in two
languages, and an edit applied to `pt/` and not to `en/` is an edit that has not landed. This makes
"applied in both languages" something you run rather than something you remember. It exists because
on 2026-08-15 the restaurant-name correction went into the Portuguese only, was reported as done,
and stood wrong for five days.

**`scripts/handbook-roundtrip.sh`** — renders every `.docx` back to markdown and compares. Content
must match exactly; blank-line placement may differ. Run it after touching either converter, and
before sending a `.docx` to a person.

## Why it was inverted

The old arrangement had a real reason: Nita authors in Apple Pages, and `.pages` is a zip of
compressed protobuf that git can store but cannot diff. Exporting to Markdown gave the question
*"what did document 05 say in June?"* an answer it never had before.

What it could not give was a **single** source. A document that is authored in one place and
recorded in another has two states, and the two drift — which is the failure this repo's one rule
exists to prevent, and which had already happened: on 2026-08-15 a correction reached the Portuguese
set and not the English one.

Making Markdown the source resolves that, and buys three things:

- **Governance decisions and documents move through the same door.** A change from a Governance
  Meeting and a change typed into GitHub are the same kind of change, reviewable the same way.
- **Every format becomes an output.** `.docx` for people who want Word, `.pages` for Nita, `.pdf`
  for printing and circulation — all generated, never separately maintained.
- **The Handbook can be the source for the structure, too.** Until it is adopted, the Domains,
  Accountabilities and Policies in documents 05–08 are canonical, and Notion is corrected from
  them, not the reverse (decided 2026-10-21; see the repository README, *The three tiers*). That
  is only workable because the Handbook is a text file a script can read.

## The consequence, stated plainly

**Nita's editing route changes, and that is a people question, not a technical one.** Her `.pages`
files are now outputs. If she keeps editing them, the Handbook has two sources again and the drift
returns.

The route that works today, and the one this round used: **she reviews and comments on a document,
and her comments are applied to the Markdown.** She keeps the tool she knows; the repo keeps one
source. Editing directly on GitHub is the eventual target, after the training — not a prerequisite
for it.

## What this is not

It is **not** the live record of who fills what. Role assignments change at every Governance
Meeting and are kept in Notion. The Handbook is the narrative layer (Purpose, Values, how we work,
the glossary) and, **until it is adopted, the canonical statement of the structure**: each
Circle's Purpose, Domains, Accountabilities and Policies. After adoption, the Decision Log takes
over that job. See the three tiers in the repository README.
