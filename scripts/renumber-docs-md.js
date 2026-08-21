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

/**
 * 重排规则（第一性原理，2026-08-21 P3 重写）：
 * 目录内 .md 文件与子目录共享同一套排序序列（Docusaurus 中文件按 sidebar_position、
 * 子目录按 _category_.json 的 position 参与混合排序）。重排时：
 * 1. 文件 + 子目录混合按 position 排序，编号反映真实位次；
 * 2. 子目录占用的编号被跳过（文件不能与子目录同名）；
 * 3. C/py 配对（01_x.md + 01_x_py.md）共享同一序号；
 * 4. 00 起始目录（存在 00_ 前缀文件）保持 00 基线；
 * 5. 首页 RDK.md（显式 slug /RDK）不重命名。
 * 不做黑名单——所有规则内生于排序逻辑。
 */

function isZeroBasedDir(dir) {
  // 00 起始设计：存在 sidebar_position: 0 的 .md 文件（如 00_code_release.md）
  try {
    const ents = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of ents) {
      if (!e.isFile() || !e.name.toLowerCase().endsWith(".md")) continue;
      if (extractSidebarPosition(path.join(dir, e.name)) === 0) return true;
    }
    return false;
  } catch {
    return false;
  }
}

function isPyFile(filename) {
  return /_py\.md$/i.test(filename);
}

function pyPairOf(filename) {
  // 01_x_py.md -> 01_x.md（去 _py 后缀）
  return filename.replace(/_py\.md$/i, ".md");
}

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

function dirPosition(dir, name) {
  // 子目录的排序号：_category_.json 的 position
  try {
    const cfgPath = path.join(dir, name, "_category_.json");
    const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
    if (Number.isFinite(cfg.position)) return cfg.position;
  } catch {
    /* 无 _category_ 的目录排最后 */
  }
  return Number.POSITIVE_INFINITY;
}

function planDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  // 收集文件 + 子目录
  const items = [];
  for (const e of entries) {
    if (e.name.startsWith(".")) continue;
    const full = path.join(dir, e.name);
    if (e.isFile() && e.name.toLowerCase().endsWith(".md")) {
      items.push({
        kind: "file",
        full,
        name: e.name,
        pos: extractSidebarPosition(full),
        core: coreNameFromFile(e.name),
      });
    } else if (e.isDirectory()) {
      items.push({
        kind: "dir",
        full,
        name: e.name,
        pos: dirPosition(dir, e.name),
        core: coreNameFromFile(e.name),
      });
    }
  }

  const files = items.filter((i) => i.kind === "file");
  if (files.length === 0) return [];

  // 目录占用的编号集合（文件不得与之同名同号）
  const dirNames = new Set(items.filter((i) => i.kind === "dir").map((i) => i.name));
  // 已存在的文件/目录名（冲突检测）
  const existingNames = new Set(items.map((i) => i.name));
  // 子目录占用的前缀编号（文件不得与子目录同号，如 03_rdk_s600.md vs 03_expansion_board/）
  const dirPrefixes = new Set(
    items
      .filter((i) => i.kind === "dir")
      .map((i) => i.name.match(/^(\d+)_/)?.[1])
      .filter(Boolean)
  );

  // 00 起始目录：position 0 的文件用 00 前缀（序号 = position）
  const zeroBased = isZeroBasedDir(dir);

  // 计算每个文件的目标名：前缀 = position（pad 2 位）
  // 非 00 起始目录中 position 0 视为无效（跳过，保持原名）
  const target = new Map(); // name -> newName
  const eligible = files.filter((f) => f.name !== "RDK.md" && !isPyFile(f.name));
  for (const f of eligible) {
    if (!Number.isFinite(f.pos)) continue;
    if (f.pos < 0) continue;
    if (!zeroBased && f.pos === 0) continue;
    const pad = String(f.pos).padStart(2, "0");
    target.set(f.name, `${pad}_${f.core}.md`);
  }

  // py 篇跟随同名 C 篇前缀
  for (const pf of files.filter((f) => isPyFile(f.name))) {
    const cName = pyPairOf(pf.name);
    const cNew = target.get(cName);
    if (cNew) {
      const m = cNew.match(/^(\d+)_(.+)$/);
      if (m) target.set(pf.name, `${m[1]}_${pf.core}.md`);
    }
  }

  // 生成计划：目标名不同 + 不与现有条目/子目录前缀冲突
  const plans = [];
  for (const f of files) {
    const newName = target.get(f.name);
    if (!newName || newName === f.name) continue;
    // 目标名不能与目录名或其它文件同名
    if (dirNames.has(newName)) continue;
    if (existingNames.has(newName) && newName !== f.name) continue;
    // 目标前缀不能与子目录前缀重复（同目录同号冲突）
    const newPrefix = newName.match(/^(\d+)_/)?.[1];
    if (newPrefix && dirPrefixes.has(newPrefix)) continue;
    plans.push({
      from: f.full,
      to: path.join(dir, newName),
      oldName: f.name,
      newName,
    });
  }
  return plans;
}

function twoPhaseRenameInDir(dir, plans) {
  if (plans.length === 0) return;
  if (process.env.DRY_RUN) {
    return; // 预览模式：只打印不执行
  }
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

  // i18n 镜像根：与 docs/ 同相对路径的 .md 做同样重命名，避免中英文文件名错位
  const I18N_ROOT = path.join(
    REPO_ROOT,
    "i18n",
    "en",
    "docusaurus-plugin-content-docs",
    "current"
  );

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

    // 同步重命名 i18n 镜像（若存在）
    const i18nDir = path.join(I18N_ROOT, path.relative(DOCS_ROOT, dir));
    if (fs.existsSync(i18nDir)) {
      // 仅同步 i18n 侧实际存在的同名文件（docs 侧已重命名，这里以 i18n 为准）
      const i18nPlans = plans
        .map((p) => ({
          from: path.join(i18nDir, p.oldName),
          to: path.join(i18nDir, p.newName),
          oldName: p.oldName,
          newName: p.newName,
        }))
        .filter((p) => fs.existsSync(p.from));
      if (i18nPlans.length > 0) {
        console.log(
          `  [i18n] ${path.relative(I18N_ROOT, i18nDir)} (${i18nPlans.length} rename(s))`
        );
        i18nPlans.forEach((p) =>
          console.log(`    ${p.oldName} -> ${p.newName}`)
        );
        // two-phase 重命名（from/to 在 i18nDir 下）
        if (process.env.DRY_RUN) {
          // 预览模式：只打印不执行
        } else {
        const temps = [];
        i18nPlans.forEach((p, i) => {
          const tmp = path.join(i18nDir, `.__reorder_tmp_${i}_${p.oldName}`);
          fs.renameSync(p.from, tmp);
          temps.push({ tmp, to: p.to });
        });
        temps.forEach(({ tmp, to }) => {
          fs.renameSync(tmp, to);
        });
        }
      }
    }
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
