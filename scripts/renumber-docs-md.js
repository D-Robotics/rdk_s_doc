/**
 * 按目录内 sidebar_position（缺省排后）+ 核心文件名排序，为 docs 下 .md 添加 01_ / 02_ 前缀。
 * 核心名：去掉 .md 与开头的 \\d+_，避免重复前缀。
 *
 * 用法：node scripts/renumber-docs-md.js
 *
 * 完成后请执行：npm run generate-sidebar-config
 */
const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.resolve(__dirname, "..");
const DOCS_ROOT = path.join(REPO_ROOT, "docs");

function extractSidebarPosition(filePath) {
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

function coreNameFromFile(filename) {
  const base = filename.replace(/\.md$/i, "");
  return base.replace(/^\d+_/, "");
}

function planDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const mds = entries.filter((e) => e.isFile() && e.name.toLowerCase().endsWith(".md"));
  if (mds.length === 0) return [];

  const items = mds.map((e) => {
    const fp = path.join(dir, e.name);
    return {
      full: fp,
      name: e.name,
      pos: extractSidebarPosition(fp),
      core: coreNameFromFile(e.name),
    };
  });

  items.sort((a, b) => {
    if (a.pos !== b.pos) return a.pos - b.pos;
    return a.core.localeCompare(b.core, "en");
  });

  const plans = [];
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const n = i + 1;
    const pad = String(n).padStart(2, "0");
    const newName = `${pad}_${it.core}.md`;
    if (it.name !== newName) {
      plans.push({ from: it.full, to: path.join(dir, newName), oldName: it.name, newName });
    }
  }
  return plans;
}

function twoPhaseRenameInDir(dir, plans) {
  if (plans.length === 0) return;
  const temps = [];
  plans.forEach((p, i) => {
    const tmp = path.join(dir, `.__reorder_tmp_${i}_${p.oldName}`);
    fs.renameSync(p.from, tmp);
    temps.push({ tmp, to: p.to });
  });
  temps.forEach(({ tmp, to }) => {
    fs.renameSync(tmp, to);
  });
}

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

function main() {
  if (!fs.existsSync(DOCS_ROOT)) {
    console.error("docs/ not found");
    process.exit(1);
  }

  const dirs = walkDirs(DOCS_ROOT);
  const allPlans = [];

  for (const dir of dirs) {
    const plans = planDirectory(dir);
    if (plans.length === 0) continue;
    console.log(`\n${path.relative(REPO_ROOT, dir)} (${plans.length} rename(s))`);
    plans.forEach((p) =>
      console.log(`  ${p.oldName} -> ${p.newName}`)
    );
    twoPhaseRenameInDir(dir, plans);
    allPlans.push(...plans);
  }

  if (allPlans.length === 0) {
    console.log("No filename changes needed.");
    return;
  }

  // 构建替换表：相对 docs/ 的路径（正斜杠）
  const map = new Map();
  for (const p of allPlans) {
    const fromRel = path.relative(DOCS_ROOT, p.from).replace(/\\/g, "/");
    const toRel = path.relative(DOCS_ROOT, p.to).replace(/\\/g, "/");
    map.set(fromRel, toRel);
  }

  const fromList = [...map.keys()].sort((a, b) => b.length - a.length);

  /** 更新仓库内文本中的相对链接 */
  const exts = new Set([
    ".md",
    ".mdx",
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".json",
    ".yml",
    ".yaml",
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
      const toRel = map.get(fromRel);
      const fromEsc = fromRel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      content = content.replace(new RegExp(fromEsc, "g"), toRel);
    }
    if (content !== orig) {
      fs.writeFileSync(fullPath, content, "utf8");
      touched++;
    }
  });

  console.log(`\nUpdated link references in ${touched} file(s).`);
  console.log("Run: npm run generate-sidebar-config");
}

main();
