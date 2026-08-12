// apply-section-numbers.mjs — 幂等应用 section-map.<chapter>.json 到 docs。
// 对每个路径：.md 设 sidebar_position / H1 首行 / unlisted / sidebar_label / title；
// _category_.json 设 label / position（保留 slug 与 link）。
// 不动 slug，故 A 类操作不断链。用法：node scripts/apply-section-numbers.mjs scripts/section-map.01.json
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(__dirname, "..");

const mapFile = process.argv[2];
if (!mapFile) {
	console.error("usage: node scripts/apply-section-numbers.mjs <section-map.json> [--root=<relpath>] [--pos-only]");
	process.exit(1);
}
const rootArg = process.argv.find((a) => a.startsWith("--root="));
const posOnly = process.argv.includes("--pos-only");
const rootRewrite = rootArg ? rootArg.slice("--root=".length) : null;
const map = JSON.parse(fs.readFileSync(path.resolve(mapFile), "utf8"));

let touched = 0, skipped = 0;
const toRel = (p) => p.replace(/\\/g, "/");

function setFmLine(lines, key, val) {
	// val 为 null => 删除该 key；否则设置（存在则替换，不存在则追加到末尾）
	const idx = lines.findIndex((l) => new RegExp(`^${key}:`).test(l));
	if (val === null || val === undefined) {
		if (idx >= 0) lines.splice(idx, 1);
		return;
	}
	const line = `${key}: ${val}`;
	if (idx >= 0) lines[idx] = line;
	else lines.push(line);
}

function applyMd(full, spec) {
	let content = fs.readFileSync(full, "utf8");
	const orig = content;
	let fmLines = null, bodyStart = 0;
	if (content.startsWith("---\n")) {
		const end = content.indexOf("\n---\n", 4);
		if (end >= 0) {
			fmLines = content.slice(4, end).split("\n");
			bodyStart = end + 5; // skip "\n---\n"
		}
	}
	if (!fmLines) {
		// 无 frontmatter，建一个
		fmLines = [];
		bodyStart = 0;
	}
	if (spec.pos !== undefined) setFmLine(fmLines, "sidebar_position", spec.pos);
	if (spec.unlisted !== undefined) setFmLine(fmLines, "unlisted", spec.unlisted);
	if (!posOnly) {
		if (spec.sidebarLabel !== undefined) setFmLine(fmLines, "sidebar_label", JSON.stringify(spec.sidebarLabel));
		if (spec.title !== undefined) setFmLine(fmLines, "title", JSON.stringify(spec.title));
		if (spec.description !== undefined) setFmLine(fmLines, "description", JSON.stringify(spec.description));
	}

	let body = content.slice(bodyStart);
	if (!posOnly && spec.h1 !== undefined) {
		// 替换 body 中第一个 "# ..." 行
		const h1Idx = body.indexOf("\n# ");
		if (body.startsWith("# ")) {
			const nl = body.indexOf("\n");
			body = "# " + spec.h1 + (nl >= 0 ? body.slice(nl) : "");
		} else if (h1Idx >= 0) {
			const after = body.slice(h1Idx + 1);
			const nl = after.indexOf("\n");
			body = body.slice(0, h1Idx + 1) + "# " + spec.h1 + (nl >= 0 ? after.slice(nl) : "");
		} else {
			// 无 H1，在 body 开头补
			body = "# " + spec.h1 + "\n\n" + body;
		}
	}
	const newContent = "---\n" + fmLines.join("\n") + "\n---\n" + body;
	if (newContent !== orig) {
		fs.writeFileSync(full, newContent);
		return true;
	}
	return false;
}

function applyCat(full, spec) {
	const json = JSON.parse(fs.readFileSync(full, "utf8"));
	let changed = false;
	if (!posOnly && spec.catLabel !== undefined && json.label !== spec.catLabel) { json.label = spec.catLabel; changed = true; }
	if (spec.pos !== undefined && json.position !== spec.pos) { json.position = spec.pos; changed = true; }
	if (changed) fs.writeFileSync(full, JSON.stringify(json, null, 2) + "\n");
	return changed;
}

for (const [rel, spec] of Object.entries(map)) {
	const mappedRel = rootRewrite && rel.startsWith("docs/") ? rootRewrite.replace(/\/$/, "") + "/" + rel.slice("docs/".length) : rel;
	const full = path.join(REPO, mappedRel);
	if (!fs.existsSync(full)) { console.warn(`MISS: ${mappedRel}`); skipped++; continue; }
	const isCat = mappedRel.endsWith("_category_.json");
	const changed = isCat ? applyCat(full, spec) : applyMd(full, spec);
	if (changed) { console.log(`UPD  ${toRel(mappedRel)}`); touched++; }
	else { console.log(`skip ${toRel(mappedRel)}`); skipped++; }
}
console.log(`\n${touched} updated, ${skipped} skipped/missing`);
