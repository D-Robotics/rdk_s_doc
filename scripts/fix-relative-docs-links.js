/**
 * 在 renumber-docs-md.js 之后运行：修正仍指向「未编号」文件名的相对 Markdown 链接。
 * node scripts/fix-relative-docs-links.js
 */
const fs = require("fs");
const path = require("path");

const DOCS_ROOT = path.join(__dirname, "../docs");

function coreNameFromFile(filename) {
  const base = filename.replace(/\.md$/i, "");
  return base.replace(/^\d+_/, "");
}

function walkMd(dir, cb) {
  if (!fs.existsSync(dir)) return;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (!ent.name.startsWith(".")) walkMd(full, cb);
    } else if (ent.name.toLowerCase().endsWith(".md")) {
      cb(full);
    }
  }
}

function fixLinksInFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  const dir = path.dirname(filePath);
  const orig = content;

  content = content.replace(/\]\(([^)]+)\)/g, (full, urlPart) => {
    const trimmed = urlPart.trim();
    if (
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("//") ||
      trimmed.startsWith("mailto:")
    ) {
      return full;
    }
    const hashIndex = trimmed.indexOf("#");
    const pathPart = hashIndex >= 0 ? trimmed.slice(0, hashIndex) : trimmed;
    const hash = hashIndex >= 0 ? trimmed.slice(hashIndex) : "";
    if (!pathPart.endsWith(".md")) return full;
    let resolved;
    if (pathPart.startsWith(".")) {
      resolved = path.resolve(dir, pathPart);
    } else if (!pathPart.includes("/") && !pathPart.includes("\\")) {
      resolved = path.join(dir, pathPart);
    } else {
      return full;
    }
    if (fs.existsSync(resolved)) return full;

    const targetDir = path.dirname(resolved);
    const wantedCore = coreNameFromFile(path.basename(resolved));
    if (!fs.existsSync(targetDir)) return full;

    const mds = fs
      .readdirSync(targetDir)
      .filter((f) => f.toLowerCase().endsWith(".md"));
    const match = mds.filter((f) => coreNameFromFile(f) === wantedCore);
    if (match.length !== 1) return full;

    const newRel = path
      .relative(dir, path.join(targetDir, match[0]))
      .replace(/\\/g, "/");
    return `](${newRel}${hash})`;
  });

  if (content !== orig) {
    fs.writeFileSync(filePath, content, "utf8");
    return true;
  }
  return false;
}

function main() {
  let n = 0;
  walkMd(DOCS_ROOT, (fp) => {
    if (fixLinksInFile(fp)) {
      console.log("fixed:", path.relative(DOCS_ROOT, fp));
      n++;
    }
  });
  console.log(`Done. Updated ${n} file(s).`);
}

main();
