#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// build-handbook-index.mjs — generates the Handbook contents pages.
//
// Writes handbook/pt/index.md and handbook/en/index.md, which Pages
// serves at /handbook/pt/ and /handbook/en/. Without them those two
// URLs are 404 and the Handbook has no front door.
//
// Every title is READ FROM THE DOCUMENT, never hand-typed, so renaming
// a document cannot leave a stale contents line. That is the whole
// reason this file exists rather than two hand-written pages.
//
// Jekyll cannot do this job. GitHub Pages' legacy build supplies
// jekyll-titles-from-headings, which takes the FIRST heading — and in
// every Handbook document the first heading is the banner
// ("MANUAL DE GOVERNANÇA DA VALE DA LAMA"), not the title. A Liquid
// contents page would print that same line ten times, and for
// pt/02 — which has no `#` syntax at all — the site name "vdl-orgdev".
// The title is the SECOND non-empty line, which is what we read here.
//
//   node scripts/build-handbook-index.mjs            # write both pages
//   node scripts/build-handbook-index.mjs --check    # exit 1 if stale
//
// --check is for local use and for reading the diff before you commit.
// It is deliberately NOT what CI runs: handbook editors work in the
// GitHub web editor and will never run node, so a failing check would
// only leave a red ✗ that nobody who caused it is able to clear.
// .github/workflows/handbook-index.yml regenerates and commits instead.
// ═══════════════════════════════════════════════════════════════

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// `NN_` with NN numeric and non-zero. This is how en/00_* is excluded:
// the two translation working notes are not Handbook documents, as
// handbook/README.md says. Excluding by pattern rather than by a name
// list means a third working note needs no change here.
const DOC = /^(\d{2})_.+\.md$/;

// Words that stay lowercase when a SHOUTED title is set in normal
// capitals. Only reached for a title written in all caps.
const MINOR = new Set([
  // pt
  "de", "da", "do", "das", "dos", "e", "em", "no", "na", "nos", "nas",
  "a", "o", "as", "os", "para", "com", "por", "ao", "aos",
  // en
  "of", "the", "and", "in", "on", "at", "to", "for", "an", "or", "with", "by",
]);

const isShouted = (s) => !/\p{Ll}/u.test(s) && /\p{Lu}/u.test(s);

// "ROTEIRO ESTRATÉGICO 2026–2031" -> "Roteiro Estratégico 2026–2031"
function unshout(title) {
  return title
    .split(/(\s+)/)
    .map((tok, i) => {
      if (/^\s+$/.test(tok) || !/\p{L}/u.test(tok)) return tok; // keep "2026–2031"
      const lower = tok.toLocaleLowerCase();
      if (i > 0 && MINOR.has(lower)) return lower;
      return lower.charAt(0).toLocaleUpperCase() + lower.slice(1);
    })
    .join("");
}

// The title is the second non-empty line: the first is the Handbook
// banner. Strip any heading marker and any "NN." ordinal — the ordinal
// is already the column beside it, and en/02 has no ordinal at all.
function titleOf(path) {
  const lines = readFileSync(path, "utf8").split(/\r?\n/);
  const full = lines.map((l) => l.trim()).filter((l) => l.length > 0);
  if (full.length < 2) throw new Error(`${path}: no title line (needs a banner and a title)`);
  let t = full[1].replace(/^#+\s*/, "").replace(/^\d{1,2}\.\s*/, "").trim();
  if (!t) throw new Error(`${path}: title line is empty once the heading marker is stripped`);
  return isShouted(t) ? unshout(t) : t;
}

function documents(lang) {
  const dir = join(ROOT, "handbook", lang);
  const found = readdirSync(dir)
    .map((name) => ({ name, m: DOC.exec(name) }))
    .filter(({ m }) => m && m[1] !== "00")
    .map(({ name, m }) => {
      const slug = name.replace(/\.md$/, "");
      return {
        num: m[1],
        slug,
        title: titleOf(join(dir, name)),
        // The .docx is produced by a separate manual step (scripts/md2docx.py),
        // so a document added by hand has none yet. handbook/README.md tells
        // people to add a document and that nobody has to run anything, which
        // is true of this page but not of the .docx — so advertising a download
        // that 404s would make that instruction a trap. Omit the link until the
        // file is there; the push that brings the .docx regenerates this page
        // and the link appears. See issue #14.
        docx: existsSync(join(dir, `${slug}.docx`)),
      };
    })
    .sort((a, b) => a.num.localeCompare(b.num));
  if (!found.length) throw new Error(`handbook/${lang}: no NN_*.md documents found`);
  return found;
}

const COPY = {
  pt: {
    heading: "Manual de Governança da Vale da Lama",
    intro:
      "Os documentos do Manual, por ordem. Cada um abre no navegador; a coluna ao lado descarrega a versão Word.",
    rule: "**A versão portuguesa é o texto que vigora.**",
    other: "[Contents in English →](../en/)",
    cols: ["#", "Documento", "Descarregar"],
    footer:
      "Página gerada a partir dos próprios documentos por `scripts/build-handbook-index.mjs`. Não editar à mão.",
  },
  en: {
    heading: "Vale da Lama Governance Handbook",
    intro:
      "The documents of the Handbook, in order. Each one opens in the browser; the column beside it downloads the Word version.",
    rule:
      "**The Portuguese is the governing text. This English set is a translation of it**, and where the two disagree the Portuguese is the governance document.",
    other: "[Índice em português →](../pt/)",
    cols: ["#", "Document", "Download"],
    footer:
      "Page generated from the documents themselves by `scripts/build-handbook-index.mjs`. Do not edit by hand.",
  },
};

function render(lang) {
  const c = COPY[lang];
  // An empty third cell keeps the table's three columns when there is no .docx.
  const rows = documents(lang).map(
    (d) =>
      `| ${d.num} | [${d.title}](${d.slug}.html) | ${d.docx ? `[.docx](${d.slug}.docx)` : ""} |`,
  );
  // No generated-on date anywhere: a date line would make this file
  // churn on every run and turn the commit log into noise.
  return [
    `# ${c.heading}`,
    "",
    c.intro,
    "",
    `${c.rule} ${c.other}`,
    "",
    `| ${c.cols.join(" | ")} |`,
    "|---|---|---|",
    ...rows,
    "",
    "---",
    "",
    `<sub>${c.footer}</sub>`,
    "",
  ].join("\n");
}

const check = process.argv.includes("--check");
let stale = 0;

for (const lang of ["pt", "en"]) {
  const path = join(ROOT, "handbook", lang, "index.md");
  const next = render(lang);
  let current = null;
  try {
    current = readFileSync(path, "utf8");
  } catch {
    /* not generated yet */
  }

  if (current === next) {
    console.log(`handbook/${lang}/index.md — current`);
    continue;
  }

  if (check) {
    stale++;
    console.error(
      `handbook/${lang}/index.md — STALE: ${current === null ? "missing" : "does not match the documents"}`,
    );
    continue;
  }

  writeFileSync(path, next);
  console.log(`handbook/${lang}/index.md — ${current === null ? "created" : "updated"}`);
}

if (check && stale) {
  console.error(
    `\n${stale} contents page(s) out of date. Run: node scripts/build-handbook-index.mjs`,
  );
  process.exit(1);
}
