#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// build-graph.mjs — generates graph.json from Notion.
//
// Replaces the Replit proxy (scripts/replit-proxy-DEPRECATED/).
// Same transformation, no server: queries the Circles and People
// databases and writes the graph the map renders.
//
// Run:  NOTION_API_KEY=... node scripts/build-graph.mjs
// CI:   .github/workflows/refresh-graph.yml, on a schedule and on demand.
// ═══════════════════════════════════════════════════════════════
import { writeFileSync } from "node:fs";

const NOTION_API = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";
const OUT = new URL("../graph.json", import.meta.url).pathname;

// database_id form, required by /v1/databases/{id}/query
const DB_IDS = {
  circles: "2de36f74-3758-81bf-83c8-c9c69b114bc4",
  people: "b981cd95-342b-4eb5-afa8-f38ac85c6c15",
  roles: "2de36f74-3758-8138-b40c-d2bbdb243419",
};

// The elected-and-appointed core. These are drawn always, because a governance
// meeting needs to see them — including, especially, the empty ones. Everything
// else is a Defined Role and appears when its circle is selected.
const CORE_ROLE_TYPES = ["Circle Lead", "Facilitator", "Secretary", "Circle Rep"];

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

async function buildGraphData() {
  const [circlePages, peoplePages, rolePages] = await Promise.all([
    queryDatabase(DB_IDS.circles),
    queryDatabase(DB_IDS.people),
    queryDatabase(DB_IDS.roles),
  ]);

  const nodes = [];
  const edges = [];
  const circleIdMap = {};

  circlePages.forEach((page, i) => {
    const props = page.properties;
    const name = extractText(props["Name"]);
    if (name === "Circle [Name]") return;           // template row
    const shortId = `circle-${i}`;
    circleIdMap[page.id] = shortId;
    nodes.push({
      id: shortId,
      notionId: page.id,
      name,
      purpose: extractText(props["Purpose"]),
      status: extractSelect(props["Status"]) || "Active",
      nodeType: "circle",
      level: extractRelationIds(props["Super-circle"]).length > 0 ? 1 : 0,
      superCircleNotionIds: extractRelationIds(props["Super-circle"]),
      circleLeadRoleNotionIds: extractRelationIds(props["Circle Lead"]),
      circleRepRoleNotionIds: extractRelationIds(props["Circle Rep"]),
    });
  });

  const notionToNode = {};
  nodes.forEach((n) => { notionToNode[n.notionId] = n; });

  // Depth is how far a circle sits below the anchor, walked all the way up
  // rather than guessed from its parent's parent. The previous version looked
  // one generation up and capped at 2, which is correct for a three-level
  // holarchy and silently wrong for a fourth — and a holarchy that cannot
  // count its own depth cannot be drawn as one.
  const depthOf = (n, seen = new Set()) => {
    if (!n || n.superCircleNotionIds.length === 0) return 0;
    if (seen.has(n.notionId)) {
      console.warn(`cycle in Super-circle at "${n.name}" — treating it as top level`);
      return 0;                                     // a cycle is bad data, not a hang
    }
    seen.add(n.notionId);
    return 1 + depthOf(notionToNode[n.superCircleNotionIds[0]], seen);
  };
  nodes.forEach((n) => { if (n.nodeType === "circle") n.level = depthOf(n); });

  const roleIdMap = {};
  rolePages.forEach((page, i) => {
    const props = page.properties;
    const name = extractText(props["Name"]);
    if (!name) return;
    const roleType = extractSelect(props["Role Type"]) || "Defined Role";
    const shortId = `role-${i}`;
    roleIdMap[page.id] = shortId;
    nodes.push({
      id: shortId,
      notionId: page.id,
      // Role names carry their circle ("circleLead: Farm Ops"), which is noise
      // once the node sits beside that circle. Core roles show their type.
      name: CORE_ROLE_TYPES.includes(roleType) ? roleType : name,
      fullName: name,
      purpose: extractText(props["Purpose"]),
      nodeType: "role",
      roleType,
      core: CORE_ROLE_TYPES.includes(roleType),
      domainCount: extractRelationIds(props["Domains"]).length,
      accountabilityCount: extractRelationIds(props["Accountabilities"]).length,
      circleNotionIds: extractRelationIds(props["Circle"]),
      status: extractSelect(props["Status (Legacy)"]) || "Active",
    });
  });

  peoplePages.forEach((page, i) => {
    const props = page.properties;
    // "Energizes Roles" is the canonical People↔Roles relation (mirrors
    // "Energized By" on Roles). "Roles" is a legacy relation kept for
    // backward compatibility; merge both so no assignment is missed.
    const canonical = extractRelationIds(props["Energizes Roles"]);
    const legacy = extractRelationIds(props["Roles"]);
    nodes.push({
      id: `person-${i}`,
      notionId: page.id,
      name: extractText(props["First Name"]) || extractText(props["Name"]),
      fullName: extractText(props["Name"]),
      status: extractSelect(props["Person Status"]) || "Active",
      nodeType: "person",
      circleMembershipNotionIds: extractRelationIds(props["Circle Memberships"]),
      roleNotionIds: [...new Set([...canonical, ...legacy])],
    });
  });

  // sub-circle edges
  nodes.filter((n) => n.nodeType === "circle").forEach((n) => {
    (n.superCircleNotionIds || []).forEach((pid) => {
      if (circleIdMap[pid]) {
        edges.push({ source: n.id, target: circleIdMap[pid], type: "subcircle", label: "Sub-circle of" });
      }
    });
  });

  // A role sits in its circle. Sub-typed so the renderer can tell the
  // constitutional seats apart from everything else.
  const roleNodes = nodes.filter((n) => n.nodeType === "role");
  roleNodes.forEach((r) => {
    (r.circleNotionIds || []).forEach((cid) => {
      if (circleIdMap[cid]) {
        edges.push({
          source: r.id, target: circleIdMap[cid], type: "holds",
          roleType: r.roleType, core: r.core, label: r.roleType,
        });
      }
    });
  });

  // A person energizes a role. Never a circle: that collapse is what made a
  // vacant role invisible, because an unheld role produced no edge at all.
  const people = nodes.filter((n) => n.nodeType === "person");
  people.forEach((p) => {
    (p.roleNotionIds || []).forEach((rid) => {
      if (roleIdMap[rid]) {
        edges.push({ source: p.id, target: roleIdMap[rid], type: "energizes", label: "Energizes" });
      }
    });
  });

  // A role nobody energizes is vacant — now a fact about a node that exists,
  // rather than an absence of edges that nothing can draw.
  const held = new Set(edges.filter((e) => e.type === "energizes").map((e) => e.target));
  roleNodes.forEach((r) => { r.vacant = !held.has(r.id); });

  // Circle membership recorded on the circle but NOT via any role in it. Kept
  // as its own edge type, off by default, because where it appears it is
  // usually a disagreement between two records rather than extra information.
  people.forEach((p) => {
    (p.circleMembershipNotionIds || []).forEach((cid) => {
      const circleId = circleIdMap[cid];
      if (!circleId) return;
      const viaRole = roleNodes.some(
        (r) => (p.roleNotionIds || []).includes(r.notionId) &&
               (r.circleNotionIds || []).some((c) => circleIdMap[c] === circleId));
      if (!viaRole) {
        edges.push({ source: p.id, target: circleId, type: "member", label: "Member, no role recorded" });
      }
    });
  });

  const cleanNodes = nodes.map((n) => ({
    id: n.id,
    name: n.name,
    fullName: n.fullName || n.name,
    purpose: n.purpose || "",
    status: n.status,
    nodeType: n.nodeType,
    level: n.level,
    roleType: n.roleType,
    core: n.core,
    vacant: n.vacant,
    domainCount: n.domainCount,
    accountabilityCount: n.accountabilityCount,
    notionUrl: `https://notion.so/${n.notionId.replace(/-/g, "")}`,
  }));

  return {
    nodes: cleanNodes,
    edges,
    meta: {
      circleCount: cleanNodes.filter((n) => n.nodeType === "circle").length,
      personCount: cleanNodes.filter((n) => n.nodeType === "person").length,
      roleCount: cleanNodes.filter((n) => n.nodeType === "role").length,
      vacantRoleCount: cleanNodes.filter((n) => n.nodeType === "role" && n.vacant).length,
      edgeCount: edges.length,
      // NOTE: deliberately no timestamp. A timestamp would make every run a
      // commit, so the git history would record when the job ran rather than
      // when the organisation changed. The commit date already says the former.
      source: "Notion API — generated by scripts/build-graph.mjs",
    },
  };
}

const graph = await buildGraphData();
writeFileSync(OUT, JSON.stringify(graph, null, 2) + "\n");
console.error(
  `graph.json: ${graph.meta.circleCount} circles, ${graph.meta.roleCount} roles ` +
  `(${graph.meta.vacantRoleCount} vacant), ${graph.meta.personCount} people, ${graph.meta.edgeCount} edges`,
);
