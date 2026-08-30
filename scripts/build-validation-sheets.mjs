#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// build-validation-sheets.mjs — one validation sheet per circle,
// generated from Notion, in Portuguese and English.
//
// A circle validates its own record at its own meeting. The sheet is
// what gets read out: who holds what, which of the four constitutional
// seats are open, and — the distinction that matters — which seats do
// not exist at all, because an absent record renders as nothing and so
// is invisible on the map.
//
// Generated, never hand-edited: a validation sheet that drifts from the
// database is worse than none, since it would be trusted in a meeting.
//
// Run:  NOTION_API_KEY=... node scripts/build-validation-sheets.mjs
// ═══════════════════════════════════════════════════════════════
import { writeFileSync, mkdirSync } from "node:fs";

const NOTION_API = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";
const OUT_DIR = new URL("../docs/generated/validation/", import.meta.url).pathname;

const DB_IDS = {
  circles: "2de36f74-3758-81bf-83c8-c9c69b114bc4",
  people: "b981cd95-342b-4eb5-afa8-f38ac85c6c15",
  roles: "2de36f74-3758-8138-b40c-d2bbdb243419",
};

// Holacracy's elected + appointed core. A circle that lacks one of these
// has a governance gap, whether the seat is empty or was never created.
const CORE_SEATS = ["Circle Lead", "Facilitator", "Secretary", "Circle Rep"];

const KEY = process.env.NOTION_API_KEY;
if (!KEY) {
  console.error("NOTION_API_KEY is not set.");
  process.exit(1);
}

async function queryDatabase(databaseId) {
  const results = [];
  let cursor;
  do {
    const body = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;
    const res = await fetch(`${NOTION_API}/databases/${databaseId}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${KEY}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Notion API ${res.status}: ${await res.text()}`);
    const data = await res.json();
    results.push(...data.results);
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);
  return results;
}

const extractText = (p) =>
  !p ? ""
    : p.type === "title" && p.title?.length ? p.title.map((t) => t.plain_text).join("")
    : p.type === "rich_text" && p.rich_text?.length ? p.rich_text.map((t) => t.plain_text).join("")
    : "";
const extractRelationIds = (p) => (!p || p.type !== "relation" ? [] : p.relation.map((r) => r.id));
const extractSelect = (p) => (!p || p.type !== "select" || !p.select ? null : p.select.name);
const extractFormula = (p) => (!p || p.type !== "formula" ? null : p.formula[p.formula.type]);

const slug = (s) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
   .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// ─────────────────────────────────────────────────────────── wording
const T = {
  pt: {
    title: "Folha de validação", generated: "Gerado automaticamente a partir do Notion",
    donotedit: "NÃO EDITAR À MÃO — este ficheiro é regenerado. Corrija no Notion, não aqui.",
    purpose: "Propósito", superCircle: "Super-círculo", subCircles: "Sub-círculos",
    coreSeats: "Os quatro papéis nucleares", seat: "Papel", holder: "Quem energiza",
    status: "Estado", defined: "Papéis definidos", none: "— nenhum —",
    missing: "**SEM REGISTO** — o papel não existe na base de dados",
    open: "— em aberto —",
    flags: "A verificar nesta reunião", nothing: "Nada assinalado — o registo está consistente.",
    ask: "Perguntas para o círculo",
    q: ["Cada pessoa listada acima continua neste papel?",
        "Falta algum papel que o círculo exerce na prática mas não está registado?",
        "Algum papel listado já não é necessário?",
        "Os papéis nucleares em falta ou em aberto — quem os assume, e quando se elege?"],
    legacyMismatch: "estado registado à mão (`{a}`) não coincide com o estado calculado (`{b}`)",
    noPurpose: "papel sem propósito escrito",
    notMember: "energiza um papel deste círculo mas não consta dos membros do círculo",
    multiCircle: "está ligado a mais do que um círculo ({n})",
    notLinkedBack: "existe, mas o círculo não aponta para ele no campo `{f}` — o mapa lê deste lado, por isso não o vê",
    seatMulti: "o campo `{f}` do círculo aponta para {n} papéis; deveria apontar para um",
  },
  en: {
    title: "Validation sheet", generated: "Generated from Notion",
    donotedit: "DO NOT EDIT BY HAND — this file is regenerated. Fix it in Notion, not here.",
    purpose: "Purpose", superCircle: "Super-circle", subCircles: "Sub-circles",
    coreSeats: "The four core roles", seat: "Role", holder: "Energized by",
    status: "Status", defined: "Defined roles", none: "— none —",
    missing: "**NO RECORD** — the role does not exist in the database",
    open: "— open —",
    flags: "To check in this meeting", nothing: "Nothing flagged — the record is consistent.",
    ask: "Questions for the circle",
    q: ["Is each person listed above still in that role?",
        "Is the circle doing work that has no role recorded for it?",
        "Is any role listed no longer needed?",
        "For the core roles missing or open — who takes them, and when is the election?"],
    legacyMismatch: "hand-set status (`{a}`) disagrees with the computed status (`{b}`)",
    noPurpose: "role has no written purpose",
    notMember: "energizes a role in this circle but is not listed among its members",
    multiCircle: "is linked to more than one circle ({n})",
    notLinkedBack: "exists, but the circle does not point at it from `{f}` — the map reads from that side, so it cannot see it",
    seatMulti: "the circle's `{f}` field points at {n} roles; it should point at one",
  },
};

// ─────────────────────────────────────────────────────────── build
const [circles, people, roles] = await Promise.all([
  queryDatabase(DB_IDS.circles),
  queryDatabase(DB_IDS.people),
  queryDatabase(DB_IDS.roles),
]);

const personName = new Map(people.map((p) => [p.id, extractText(p.properties["Name"])]));
const circleName = new Map(circles.map((c) => [c.id, extractText(c.properties["Name"])]));

const roleRows = roles.map((r) => {
  const p = r.properties;
  const holders = [
    ...extractRelationIds(p["Energized By"]),
    ...extractRelationIds(p["People"]),
  ];
  return {
    name: extractText(p["Name"]),
    type: extractSelect(p["Role Type"]),
    purpose: extractText(p["Purpose"]),
    circles: extractRelationIds(p["Circle"]),
    legacy: extractSelect(p["Status (Legacy)"]),
    computed: extractFormula(p["Role Status"]),
    holders: [...new Set(holders)].map((id) => personName.get(id) || "?"),
  };
});

function sheet(circle, lang) {
  const t = T[lang];
  const p = circle.properties;
  const name = extractText(p["Name"]);
  const mine = roleRows.filter((r) => r.circles.includes(circle.id));
  const members = extractRelationIds(p["Circle Members"])
    .map((id) => personName.get(id)).filter(Boolean);

  const superIds = extractRelationIds(p["Super-circle"]);
  const subs = circles.filter((c) => extractRelationIds(c.properties["Super-circle"]).includes(circle.id));

  const L = [];
  L.push(`# ${name} — ${t.title}`);
  L.push("");
  L.push(`> ${t.donotedit}`);
  L.push(`> ${t.generated} · ${new Date().toISOString().slice(0, 10)}`);
  L.push("");
  if (extractText(p["Purpose"])) L.push(`**${t.purpose}:** ${extractText(p["Purpose"])}`, "");
  L.push(`**${t.superCircle}:** ${superIds.map((i) => circleName.get(i)).join(", ") || t.none}`);
  L.push(`**${t.subCircles}:** ${subs.map((c) => extractText(c.properties["Name"])).join(", ") || t.none}`);
  L.push("");

  // the four seats, with absent distinguished from empty
  L.push(`## ${t.coreSeats}`);
  L.push("");
  L.push(`| ${t.seat} | ${t.holder} | ${t.status} |`);
  L.push("|---|---|---|");
  for (const seat of CORE_SEATS) {
    const r = mine.find((x) => x.type === seat);
    if (!r) L.push(`| **${seat}** | ${t.missing} | — |`);
    else L.push(`| **${seat}** | ${r.holders.join(", ") || t.open} | ${r.computed || "—"} |`);
  }
  L.push("");

  const defined = mine.filter((r) => !CORE_SEATS.includes(r.type));
  L.push(`## ${t.defined}`);
  L.push("");
  if (!defined.length) L.push(t.none);
  else {
    L.push(`| ${t.seat} | ${t.holder} | ${t.purpose} |`);
    L.push("|---|---|---|");
    for (const r of defined.sort((a, b) => a.name.localeCompare(b.name)))
      L.push(`| ${r.name} | ${r.holders.join(", ") || t.open} | ${r.purpose || "—"} |`);
  }
  L.push("");

  // flags — only things a human should look at
  const flags = [];

  // Roles carry "my circle is X"; circles carry "my Secretary is Y". Either can be
  // maintained without the other, and build-graph.mjs reads the circle side.
  const SEAT_FIELD = { "Circle Lead": "Circle Lead", "Facilitator": "Facilitator",
                       Secretary: "Secretary", "Circle Rep": "Circle Rep" };
  for (const [seat, field] of Object.entries(SEAT_FIELD)) {
    const linked = extractRelationIds(p[field]);
    const roleSide = mine.find((x) => x.type === seat);
    if (linked.length > 1)
      flags.push(t.seatMulti.replace("{f}", field).replace("{n}", linked.length));
    if (roleSide && linked.length === 0)
      flags.push(`\`${roleSide.name}\` — ${t.notLinkedBack.replace("{f}", field)}`);
  }

  for (const r of mine) {
    if (r.circles.length > 1)
      flags.push(`\`${r.name}\` — ${t.multiCircle.replace("{n}", r.circles.map((i) => circleName.get(i)).join(", "))}`);
    if (r.legacy && r.computed && r.legacy !== r.computed)
      flags.push(`\`${r.name}\` — ${t.legacyMismatch.replace("{a}", r.legacy).replace("{b}", r.computed)}`);
    if (!r.purpose) flags.push(`\`${r.name}\` — ${t.noPurpose}`);
    for (const h of r.holders)
      if (members.length && !members.includes(h))
        flags.push(`**${h}** — ${t.notMember} (\`${r.name}\`)`);
  }
  L.push(`## ${t.flags}`);
  L.push("");
  L.push(flags.length ? [...new Set(flags)].map((f) => `- ${f}`).join("\n") : t.nothing);
  L.push("");
  L.push(`## ${t.ask}`);
  L.push("");
  t.q.forEach((q, i) => L.push(`${i + 1}. ${q}`));
  L.push("");
  return L.join("\n");
}

let written = 0;
for (const lang of ["pt", "en"]) {
  mkdirSync(`${OUT_DIR}${lang}`, { recursive: true });
  for (const c of circles) {
    const name = extractText(c.properties["Name"]);
    writeFileSync(`${OUT_DIR}${lang}/${slug(name)}.md`, sheet(c, lang));
    written++;
  }
}
console.log(`wrote ${written} sheets (${circles.length} circles x 2 languages) to docs/generated/validation/`);
