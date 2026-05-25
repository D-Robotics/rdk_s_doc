const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const repoRoot = path.resolve(__dirname, "..");
const docsDir = path.join(repoRoot, "docs");
const generatedScopePath = path.join(
  repoRoot,
  "src",
  "context",
  "generated-sidebar-config.json",
);

function toProductFolder(product) {
  return String(product)
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^\w.-]/g, "_");
}

function normalizeProductKey(s) {
  return String(s)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function normalizeProductSeriesKey(s) {
  if (s == null || typeof s !== "string") {
    return null;
  }
  const match = s.trim().match(/^rdk\s*-\s*(.+)$/i);
  if (!match) {
    return null;
  }
  const suffix = match[1].trim().replace(/\s+/g, " ");
  if (!suffix) {
    return null;
  }
  return normalizeProductKey(`RDK ${suffix}`);
}

function productBelongsToSeries(currentProduct, seriesKey) {
  const current = normalizeProductKey(currentProduct);
  return current === seriesKey || current.startsWith(`${seriesKey} `);
}

function compareVersions(v1, v2) {
  const parts1 = String(v1).split(".").map(Number);
  const parts2 = String(v2).split(".").map(Number);
  const maxLength = Math.max(parts1.length, parts2.length);
  for (let i = 0; i < maxLength; i += 1) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    if (p1 < p2) return -1;
    if (p1 > p2) return 1;
  }
  return 0;
}

function versionMatchesOperator(currentVersion, operator, version) {
  const cmp = compareVersions(currentVersion, version);
  switch (operator) {
    case ">":
      return cmp > 0;
    case ">=":
      return cmp >= 0;
    case "<":
      return cmp < 0;
    case "<=":
      return cmp <= 0;
    case "":
    default:
      return cmp === 0;
  }
}

function matchVersion(currentVersion, versionConfigs) {
  if (!versionConfigs || versionConfigs.length === 0) {
    return true;
  }
  for (const config of versionConfigs) {
    if (typeof config === "string") {
      if (config === currentVersion) return true;
      continue;
    }
    if (typeof config === "object" && config != null && config.version) {
      const op = config.operator != null ? config.operator : "";
      if (versionMatchesOperator(currentVersion, op, config.version)) {
        return true;
      }
    }
  }
  return false;
}

function scopeProductsMatchCurrent(scopeProducts, currentProduct) {
  if (!scopeProducts || scopeProducts.length === 0) {
    return true;
  }
  const cur = normalizeProductKey(currentProduct);
  for (const entry of scopeProducts) {
    const seriesKey = normalizeProductSeriesKey(entry);
    if (seriesKey && productBelongsToSeries(currentProduct, seriesKey)) {
      return true;
    }
    if (normalizeProductKey(entry) === cur) {
      return true;
    }
  }
  return false;
}

function normalizeDocId(relPathWithoutExt) {
  const normalizedParts = relPathWithoutExt
    .toLowerCase()
    .split("/")
    .map((part) => part.replace(/^\d+_/, ""));
  return normalizedParts.join("/");
}

function scopeMatches(scope, version, product) {
  const vMatch = matchVersion(version, scope.versions || []);
  const pMatch = scopeProductsMatchCurrent(scope.products || [], product);
  return vMatch && pMatch;
}

function shouldShowDocByGeneratedConfig(docId, generatedConfig, version, product) {
  const direct = generatedConfig[docId];
  if (direct && !direct.isCategory) {
    return scopeMatches(direct, version, product);
  }

  let bestCategoryScope = null;
  let bestLen = -1;
  for (const [configPath, scope] of Object.entries(generatedConfig)) {
    if (!scope?.isCategory) {
      continue;
    }
    if (docId === configPath || docId.startsWith(`${configPath}/`)) {
      if (configPath.length > bestLen) {
        bestLen = configPath.length;
        bestCategoryScope = scope;
      }
    }
  }

  if (bestCategoryScope) {
    return scopeMatches(bestCategoryScope, version, product);
  }
  return true;
}

function copyFileSync(sourceFile, targetFile) {
  fs.mkdirSync(path.dirname(targetFile), { recursive: true });
  fs.copyFileSync(sourceFile, targetFile);
}

function buildScopedDocs(sourceDir, targetDir, generatedConfig, version, product) {
  fs.rmSync(targetDir, { recursive: true, force: true });
  fs.mkdirSync(targetDir, { recursive: true });

  const walk = (curSourceDir) => {
    const entries = fs.readdirSync(curSourceDir, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(curSourceDir, entry.name);
      const relPath = path.relative(sourceDir, srcPath);
      const targetPath = path.join(targetDir, relPath);

      if (entry.isDirectory()) {
        walk(srcPath);
        continue;
      }

      const isMarkdown = entry.name.endsWith(".md") || entry.name.endsWith(".mdx");
      if (!isMarkdown) {
        copyFileSync(srcPath, targetPath);
        continue;
      }

      const relUnix = relPath.replace(/\\/g, "/").replace(/\.(md|mdx)$/i, "");
      const docId = normalizeDocId(relUnix);
      const visible = shouldShowDocByGeneratedConfig(
        docId,
        generatedConfig,
        version,
        product,
      );
      if (visible) {
        copyFileSync(srcPath, targetPath);
      }
    }
  };

  walk(sourceDir);
}

function runBuild() {
  const product = process.env.DOC_BUILD_PRODUCT?.trim();
  const version = process.env.DOC_BUILD_VERSION?.trim();
  if (!product || !version) {
    console.error("DOC_BUILD_PRODUCT / DOC_BUILD_VERSION is required.");
    process.exit(1);
  }

  const outDir = process.env.DOC_BUILD_OUT_DIR?.trim();
  if (!outDir) {
    console.error("DOC_BUILD_OUT_DIR is required.");
    process.exit(1);
  }
  const outDirAbs = path.resolve(outDir);
  fs.rmSync(outDirAbs, { recursive: true, force: true });
  fs.mkdirSync(outDirAbs, { recursive: true });

  if (!fs.existsSync(generatedScopePath)) {
    console.error(
      `generated scope config missing: ${generatedScopePath}. Run generate-sidebar-config first.`,
    );
    process.exit(1);
  }
  const generatedConfig = JSON.parse(fs.readFileSync(generatedScopePath, "utf8"));

  const productFolder = toProductFolder(product);
  const scopedDocsDir = path.join(
    repoRoot,
    ".docusaurus",
    "scoped-docs",
    productFolder,
    version,
    "docs",
  );

  buildScopedDocs(docsDir, scopedDocsDir, generatedConfig, version, product);
  console.log(
    `[build:scope] docs filtered: product=${product}, version=${version}, docsDir=${scopedDocsDir}`,
  );
  if (process.env.DOC_BUILD_FILTER_ONLY === "1") {
    return;
  }

  const docusaurusBin = require.resolve("@docusaurus/core/bin/docusaurus.mjs");
  const args = [docusaurusBin, "build", "--out-dir", outDirAbs];
  console.log(`[build:scope] product=${product}, version=${version}, outDir=${outDir}`);

  const result = spawnSync(process.execPath, args, {
    stdio: "inherit",
    cwd: repoRoot,
    env: {
      ...process.env,
      DOC_BUILD_PRODUCT: product,
      DOC_BUILD_VERSION: version,
      DOCS_OVERRIDE_DIR: scopedDocsDir,
    },
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

runBuild();
