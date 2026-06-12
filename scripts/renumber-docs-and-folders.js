/**
 * Add 01_ / 02_ prefixes to folders and .md files based on sidebar_position
 * (missing position goes last), then by name sorting.
 * Core name removes leading \\d+_ to avoid duplicate prefixes.
 *
 * Usage: node scripts/renumber-docs-and-folders.js [target-dir]
 *   Default target: docs/
 *   You can pass another target, e.g. i18n/en/docusaurus-plugin-content-docs/current
 *
 * After completion run: npm run generate-sidebar-config
 */
const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.resolve(__dirname, "..");
const DOCS_ROOT = path.join(REPO_ROOT, "docs");

/** Read position from _category_.json */
function getCategoryPosition(dirPath) {
  const catFile = path.join(dirPath, "_category_.json");
  if (!fs.existsSync(catFile)) return Number.POSITIVE_INFINITY;
  try {
    const content = fs.readFileSync(catFile, "utf8");
    const json = JSON.parse(content);
    if (typeof json.position === "number") return json.position;
    if (typeof json.sidebar_position === "number") return json.sidebar_position;
  } catch {}
  return Number.POSITIVE_INFINITY;
}

/** Read sidebar_position from .md front matter */
function getMdPosition(filePath) {
  let raw;
  try {
    raw = fs.readFileSync(filePath, "utf8");
  } catch {
    return Number.POSITIVE_INFINITY;
  }
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return Number.POSITIVE_INFINITY;
  const fm = m[1];
  for (const line of fm.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("sidebar_position")) continue;
    const v = trimmed.split(":").slice(1).join(":").trim();
    const n = parseInt(String(v).replace(/['"]/g, ""), 10);
    if (Number.isFinite(n)) return n;
  }
  return Number.POSITIVE_INFINITY;
}

/** Remove leading numeric prefix */
function stripNumberPrefix(name) {
  return name.replace(/^\d+_/, "");
}

/** Get processable entries in current directory (folders and .md files) */
function getDirEntries(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const items = [];

  for (const ent of entries) {
    const name = ent.name;
    // 跳过隐藏文件/文件夹
    if (name.startsWith(".")) continue;
    // 跳过特殊文件
    if (name === "_sidebar_scope.json") continue;

    const fullPath = path.join(dir, name);

    if (ent.isDirectory()) {
      // Folder: use _category_.json position
      const pos = getCategoryPosition(fullPath);
      items.push({
        type: "dir",
        name,
        fullPath,
        pos,
        core: stripNumberPrefix(name),
      });
    } else if (ent.isFile() && name.toLowerCase().endsWith(".md")) {
      // .md file: use front matter position
      const pos = getMdPosition(fullPath);
      items.push({
        type: "file",
        name,
        fullPath,
        pos,
        core: stripNumberPrefix(name.replace(/\.md$/i, "")) + ".md",
      });
    }
  }

  return items;
}

/** Plan renames for a single directory */
function planDirectory(dir) {
  const items = getDirEntries(dir);
  if (items.length === 0) return [];

  // 排序：先按 position，再按名称
  items.sort((a, b) => {
    if (a.pos !== b.pos) return a.pos - b.pos;
    return a.core.localeCompare(b.core, "en");
  });

  const plans = [];
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const n = i + 1;
    const pad = String(n).padStart(2, "0");

    if (it.type === "dir") {
      const newName = `${pad}_${it.core}`;
      if (it.name !== newName) {
        plans.push({
          type: "dir",
          from: it.fullPath,
          to: path.join(dir, newName),
          oldName: it.name,
          newName,
        });
      }
    } else {
      const newName = `${pad}_${it.core}`;
      if (it.name !== newName) {
        plans.push({
          type: "file",
          from: it.fullPath,
          to: path.join(dir, newName),
          oldName: it.name,
          newName,
        });
      }
    }
  }

  return plans;
}

/** Two-phase rename (avoid name conflicts) */
function twoPhaseRename(plans) {
  if (plans.length === 0) return;

  const temps = [];
  plans.forEach((p, i) => {
    const tmp = path.join(path.dirname(p.from), `.__reorder_tmp_${i}_${p.oldName}`);
    fs.renameSync(p.from, tmp);
    temps.push({ tmp, to: p.to });
  });

  temps.forEach(({ tmp, to }) => {
    fs.renameSync(tmp, to);
  });
}

/** Collect all directories (deep to shallow, process children first) */
function walkDirs(root) {
  const out = [];
  function walk(d) {
    out.push(d);
    for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
      if (!ent.isDirectory()) continue;
      if (ent.name.startsWith(".")) continue;
      walk(path.join(d, ent.name));
    }
  }
  walk(root);
  return out.sort((a, b) => b.split(path.sep).length - a.split(path.sep).length);
}

/** Build path mapping table */
function buildPathMap(plans, docsRoot) {
  const map = new Map();
  for (const p of plans) {
    const fromRel = path.relative(docsRoot, p.from).replace(/\\/g, "/");
    const toRel = path.relative(docsRoot, p.to).replace(/\\/g, "/");

    // For folders, map folder path
    if (p.type === "dir") {
      map.set(fromRel + "/", toRel + "/");
    }
    map.set(fromRel, toRel);

    // Also keep core-name mapping (without prefixes) for link fixes
    const fromCore = stripNumberPrefix(p.oldName);
    const toCore = stripNumberPrefix(p.newName);
    if (fromCore !== p.oldName) {
      // If original name had prefix, also map core name to new path
      map.set(fromCore, toRel);
    }
  }
  return map;
}

/** Fix links across repository */
function fixLinks(pathMap, docsRoot) {
  const fromList = [...pathMap.keys()].sort((a, b) => b.length - a.length);

  const exts = new Set([
    ".md", ".mdx", ".js", ".jsx", ".ts", ".tsx", ".json", ".yml", ".yaml",
  ]);
  const skipDirs = new Set(["node_modules", "build", ".git"]);

  function shouldScan(p) {
    const base = path.basename(p);
    if (base.startsWith(".")) return false;
    for (const seg of p.split(path.sep)) {
      if (skipDirs.has(seg)) return false;
    }
    const ext = path.extname(p).toLowerCase();
    return exts.has(ext);
  }

  function walkRepo(dir, cb) {
    if (!fs.existsSync(dir)) return;
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        if (skipDirs.has(ent.name)) continue;
        walkRepo(full, cb);
      } else if (shouldScan(full)) {
        cb(full);
      }
    }
  }

  let touched = 0;
  walkRepo(REPO_ROOT, (fullPath) => {
    let content = fs.readFileSync(fullPath, "utf8");
    const orig = content;

    for (const fromRel of fromList) {
      const toRel = pathMap.get(fromRel);
      // 使用正则替换路径
      const fromEsc = fromRel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      content = content.replace(new RegExp(fromEsc, "g"), toRel);
    }

    if (content !== orig) {
      fs.writeFileSync(fullPath, content, "utf8");
      touched++;
    }
  });

  return touched;
}

function processDirectory(targetDir, label) {
  if (!fs.existsSync(targetDir)) {
    console.error(`${label} not found: ${targetDir}`);
    return 0;
  }

  const dirs = walkDirs(targetDir);
  const allPlans = [];

  for (const dir of dirs) {
    const plans = planDirectory(dir);
    if (plans.length === 0) continue;

    console.log(`\n${path.relative(REPO_ROOT, dir)} (${plans.length} rename(s))`);
    plans.forEach((p) => {
      console.log(`  ${p.oldName} -> ${p.newName}`);
    });

    twoPhaseRename(plans);
    allPlans.push(...plans);
  }

  if (allPlans.length === 0) {
    console.log(`No changes needed for ${label}.`);
    return 0;
  }

  console.log(`\n${label}: ${allPlans.length} item(s) renamed.`);

  // 构建路径映射并修复链接
  const pathMap = buildPathMap(allPlans, targetDir);
  const touched = fixLinks(pathMap, targetDir);

  return touched;
}

function main() {
  // Parse CLI arguments
  const args = process.argv.slice(2);
  let targetDir = DOCS_ROOT;
  let label = "docs";

  if (args.length > 0) {
    // Use specified target directory
    targetDir = path.resolve(REPO_ROOT, args[0]);
    label = path.relative(REPO_ROOT, targetDir);
  }

  const touched = processDirectory(targetDir, label);

  if (touched > 0) {
    console.log(`\nUpdated link references in ${touched} file(s).`);
    console.log("Run: npm run generate-sidebar-config");
  }
}

main();
