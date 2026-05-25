/**
 * 将章节目录前缀 06→04、07→05、08→06、09→07、10→08 后，更新 Markdown/JSON 中的路径引用。
 * 不会修改 https:// 与 http:// URL 内的片段（保留 CDN 图片路径不变）。
 *
 * 用法: node scripts/update-chapter-path-refs.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const REPLACEMENTS = [
  ["10_Release_Note", "08_Release_Note"],
  ["09_Appendix", "07_Appendix"],
  ["08_FAQ", "06_FAQ"],
  ["07_Advanced_development", "05_Advanced_development"],
  ["06_Application_case", "04_Application_case"],
];

/** 替换不在 http(s) URL 内的协议相对片段 */
function replacePreservingHttpUrls(text, from, to) {
  const re = /https?:\/\/[\w\-./?#%&=+~:@[\]!$'()*,;]+/gi;
  const out = [];
  let last = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    out.push(text.slice(last, m.index).split(from).join(to));
    out.push(m[0]);
    last = m.index + m[0].length;
  }
  out.push(text.slice(last).split(from).join(to));
  return out.join("");
}

function walk(dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      if (name === "node_modules" || name === ".git" || name === "build" || name === ".docusaurus") continue;
      walk(p, acc);
    } else if (/\.(md|mdx|json)$/i.test(name) && !p.includes(`${path.sep}node_modules${path.sep}`)) {
      acc.push(p);
    }
  }
  return acc;
}

const i18nCurrent = path.join(root, "i18n", "en", "docusaurus-plugin-content-docs", "current");
const runModes = {
  all: [path.join(root, "docs"), i18nCurrent, path.join(root, "src")],
  "only-i18n": [i18nCurrent],
  "only-docs": [path.join(root, "docs")],
};

const mode = process.argv.includes("--only-i18n")
  ? "only-i18n"
  : process.argv.includes("--only-docs")
    ? "only-docs"
    : "all";

const dirs = runModes[mode];

let changed = 0;
for (const base of dirs) {
  if (!fs.existsSync(base)) continue;
  const files = walk(base);
  for (const file of files) {
    let text = fs.readFileSync(file, "utf8");
    let next = text;
    for (const [from, to] of REPLACEMENTS) {
      next = replacePreservingHttpUrls(next, from, to);
    }
    if (next !== text) {
      fs.writeFileSync(file, next, "utf8");
      changed++;
    }
  }
}

console.log(
  `[${mode}] Updated ${changed} files (CDN http(s) URLs preserved). Targets: ${dirs.join(", ")}`,
);
