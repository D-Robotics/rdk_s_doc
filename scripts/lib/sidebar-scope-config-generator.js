/**
 * Scan docs / i18n docs and generate sidebar product/version visibility config
 * (shared by Docusaurus plugin and CLI).
 */
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const matrixJsonPath = path.join(__dirname, '../../src/context/doc-scope-matrix.json');
const { VERSION_PRODUCT_MATRIX } = require(matrixJsonPath);

const GENERATED_SIDEBAR_CONFIG_ALIAS = '@generated/generated-sidebar-config.json';
const GENERATED_SIDEBAR_CONFIG_FILENAME = 'generated-sidebar-config.json';

function getGeneratedSidebarConfigPath(siteDir) {
  return path.join(siteDir, '.docusaurus', GENERATED_SIDEBAR_CONFIG_FILENAME);
}

function normalizeProductKey(s) {
  return String(s)
    .trim()
    .toLocaleLowerCase('en-US')
    .replace(/\s+/g, ' ');
}

let _canonicalLookup = null;
function getCanonicalLookup() {
  if (!_canonicalLookup) {
    const map = new Map();
    for (const list of Object.values(VERSION_PRODUCT_MATRIX)) {
      for (const canonical of list) {
        map.set(normalizeProductKey(canonical), canonical);
      }
    }
    _canonicalLookup = map;
  }
  return _canonicalLookup;
}

function resolveCanonicalProduct(input) {
  if (input == null || String(input).trim() === '') {
    return null;
  }
  return getCanonicalLookup().get(normalizeProductKey(input)) ?? null;
}

function normalizeScopeProductList(products) {
  if (!Array.isArray(products)) {
    return [];
  }
  return products.map((p) => {
    if (typeof p !== 'string') {
      return p;
    }
    const c = resolveCanonicalProduct(p);
    return c ?? p.trim();
  });
}

function normalizeProductSeriesKey(s) {
  if (s == null || typeof s !== 'string') {
    return null;
  }
  const match = s.trim().match(/^rdk\s*-\s*(.+)$/i);
  if (!match) {
    return null;
  }
  const suffix = match[1].trim().replace(/\s+/g, ' ');
  if (!suffix) {
    return null;
  }
  return normalizeProductKey(`RDK ${suffix}`);
}

function productBelongsToSeries(productEntry, seriesKey) {
  const current = normalizeProductKey(productEntry);
  return current === seriesKey || current.startsWith(`${seriesKey} `);
}

function mergeProducts(existingProducts, incomingProducts) {
  const merged = normalizeScopeProductList([
    ...(Array.isArray(existingProducts) ? existingProducts : []),
    ...(Array.isArray(incomingProducts) ? incomingProducts : []),
  ]);

  const deduped = [];
  const seen = new Set();
  for (const entry of merged) {
    const key = normalizeProductKey(entry);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    deduped.push(entry);
  }

  const seriesKeys = deduped
    .map((entry) => normalizeProductSeriesKey(entry))
    .filter(Boolean);
  if (seriesKeys.length === 0) {
    return deduped;
  }

  return deduped.filter((entry) => {
    const isSeriesEntry = Boolean(normalizeProductSeriesKey(entry));
    if (isSeriesEntry) {
      return true;
    }
    return !seriesKeys.some((seriesKey) => productBelongsToSeries(entry, seriesKey));
  });
}

function versionConfigKey(config) {
  if (typeof config === 'string') {
    return `str::${config.trim()}`;
  }
  if (config && typeof config === 'object') {
    const op = String(config.operator || '').trim();
    const version = String(config.version || '').trim();
    return `obj::${op}::${version}`;
  }
  return `raw::${String(config)}`;
}

function mergeVersions(existingVersions, incomingVersions) {
  const merged = [
    ...(Array.isArray(existingVersions) ? existingVersions : []),
    ...(Array.isArray(incomingVersions) ? incomingVersions : []),
  ];
  const out = [];
  const seen = new Set();
  for (const entry of merged) {
    const key = versionConfigKey(entry);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    out.push(entry);
  }
  return out;
}

function mergeScopeConfig(existingScope, incomingScope) {
  if (!existingScope) {
    return incomingScope;
  }
  return {
    exclude: Boolean(existingScope.exclude || incomingScope.exclude),
    versions: mergeVersions(existingScope.versions, incomingScope.versions),
    products: mergeProducts(existingScope.products, incomingScope.products),
    isCategory: Boolean(existingScope.isCategory || incomingScope.isCategory),
  };
}

function parseVersionExpression(versionStr) {
  if (!versionStr || typeof versionStr !== 'string') {
    return null;
  }

  let trimmed = versionStr.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    trimmed = trimmed.slice(1, -1).trim();
  }

  const match = trimmed.match(/^(>=|<=|>|<)?\s*(\d+(?:\.\d+)*)$/);
  if (!match) {
    return null;
  }

  return {
    operator: match[1] || '',
    version: match[2],
    original: versionStr,
  };
}

function parseScopeList(value) {
  if (value == null) return [];

  if (Array.isArray(value)) {
    return value.map((v) => {
      if (typeof v === 'string') {
        const parsed = parseVersionExpression(v);
        return parsed || { operator: '', version: v, original: v };
      }
      return v;
    });
  }

  const s = String(value).trim();
  if (s === '' || s === '*') return [];

  return s
    .split(/[,，]/)
    .map((x) => x.trim())
    .filter(Boolean)
    .map((v) => {
      const parsed = parseVersionExpression(v);
      return parsed || { operator: '', version: v, original: v };
    });
}

function extractFrontMatter(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const frontMatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!frontMatterMatch) {
      return null;
    }

    const frontMatter = {};
    frontMatterMatch[1].split(/\r?\n/).forEach((line) => {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 1).trim();
        frontMatter[key] = value;
      }
    });
    return frontMatter;
  } catch {
    return null;
  }
}

function extractSidebarScopeConfig(filePath) {
  try {
    const config = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    if (config.exclude === true) {
      return {
        exclude: true,
        versions: [],
        products: [],
      };
    }
    if (config.versions || config.products) {
      return {
        versions: parseScopeList(config.versions),
        products: Array.isArray(config.products)
          ? config.products
          : typeof config.products === 'string'
            ? config.products.split(/[,，]/).map((x) => x.trim()).filter(Boolean)
            : [],
      };
    }
    return null;
  } catch {
    return null;
  }
}

function formatVersions(versions) {
  if (!versions || versions.length === 0) return 'all versions';
  return versions
    .map((v) => {
      if (typeof v === 'object' && v.operator) {
        return `${v.operator} ${v.version}`;
      }
      return typeof v === 'object' ? v.version : v;
    })
    .join(', ');
}

function scanDirectory(dir, baseDir, config, idUtils, verbose) {
  if (!fs.existsSync(dir)) {
    return;
  }

  for (const item of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      scanDirectory(fullPath, baseDir, config, idUtils, verbose);
      continue;
    }

    if (item === '_sidebar_scope.json' || item === '_sidebar_scope_.json') {
      const scopeConfig = extractSidebarScopeConfig(fullPath);
      if (!scopeConfig) {
        continue;
      }

      const folderPath = path.relative(baseDir, path.dirname(fullPath)).replace(/\\/g, '/');
      const folderId = idUtils.normalizeDocIdFromPath(folderPath);
      const productsNorm = normalizeScopeProductList(scopeConfig.products);
      config[folderId] = mergeScopeConfig(config[folderId], {
        exclude: Boolean(scopeConfig.exclude),
        versions: scopeConfig.versions,
        products: productsNorm,
        isCategory: true,
      });

      if (verbose) {
        console.log(`Folder scope found: ${folderPath}`);
        console.log(`  folderId: ${folderId}`);
        console.log(`  versions: ${formatVersions(scopeConfig.versions)}`);
        console.log(`  products: ${productsNorm.join(', ') || 'all products'}`);
      }
      continue;
    }

    if (!item.endsWith('.md')) {
      continue;
    }

    const frontMatter = extractFrontMatter(fullPath);
    if (!frontMatter || (!frontMatter.sidebar_versions && !frontMatter.sidebar_products)) {
      continue;
    }

    const relativePath = path
      .relative(baseDir, fullPath)
      .replace(/\.md$/, '')
      .replace(/\\/g, '/');
    const scopeKeys = idUtils.collectDocScopeKeys(relativePath, frontMatter.id);
    const versions = parseScopeList(frontMatter.sidebar_versions);

    let products = [];
    if (frontMatter.sidebar_products) {
      if (typeof frontMatter.sidebar_products === 'string') {
        let productsStr = frontMatter.sidebar_products.trim();
        if (
          (productsStr.startsWith('"') && productsStr.endsWith('"')) ||
          (productsStr.startsWith("'") && productsStr.endsWith("'"))
        ) {
          productsStr = productsStr.slice(1, -1).trim();
        }
        products = productsStr.split(/[,，]/).map((x) => x.trim()).filter(Boolean);
      } else {
        products = frontMatter.sidebar_products;
      }
    }

    const productsNorm = normalizeScopeProductList(products);
    const nextScope = { versions, products: productsNorm };
    for (const key of scopeKeys) {
      config[key] = mergeScopeConfig(config[key], nextScope);
    }

    if (verbose) {
      console.log(`Doc scope found: ${relativePath}`);
      console.log(`  docId keys: ${scopeKeys.join(', ')}`);
      console.log(`  versions: ${formatVersions(versions)}`);
      console.log(`  products: ${productsNorm.join(', ') || 'all products'}`);
    }
  }
}

function validateSidebarScopeConfig(config) {
  const errors = [];
  for (const key of Object.keys(config)) {
    if (/^\d+_/.test(key) || /\/\d+_/.test(key)) {
      errors.push(`Config key "${key}" contains an unstripped numeric prefix`);
    }
    if (key !== key.toLowerCase()) {
      errors.push(`Config key "${key}" should be lowercase`);
    }
  }
  return errors;
}

async function loadDocScopeIdUtils(siteDir) {
  const modulePath = path.join(siteDir, 'src/context/doc-scope-id-utils.mjs');
  return import(pathToFileURL(modulePath).href);
}

async function buildSidebarScopeConfig({ docsDir, i18nEnDocsCurrentDir, siteDir, verbose = false }) {
  const { collectDocScopeKeys, normalizeDocIdFromPath } = await loadDocScopeIdUtils(siteDir);
  const idUtils = { collectDocScopeKeys, normalizeDocIdFromPath };
  const config = {};

  if (fs.existsSync(docsDir)) {
    if (verbose) {
      console.log('Scanning docs directory:');
    }
    scanDirectory(docsDir, docsDir, config, idUtils, verbose);
    if (verbose) {
      console.log('');
    }
  }
  if (i18nEnDocsCurrentDir && fs.existsSync(i18nEnDocsCurrentDir)) {
    if (verbose) {
      console.log('Scanning i18n/en/docusaurus-plugin-content-docs/current directory:');
    }
    scanDirectory(i18nEnDocsCurrentDir, i18nEnDocsCurrentDir, config, idUtils, verbose);
    if (verbose) {
      console.log('');
    }
  }

  return config;
}

async function buildAndWriteSidebarScopeConfig({
  configFilePath,
  docsDir,
  i18nEnDocsCurrentDir,
  siteDir,
  verbose = false,
}) {
  if (verbose) {
    console.log('Starting doc scan...\n');
  }

  const config = await buildSidebarScopeConfig({
    docsDir,
    i18nEnDocsCurrentDir,
    siteDir,
    verbose,
  });

  const errors = validateSidebarScopeConfig(config);
  if (errors.length > 0) {
    console.error('\nConfig validation failed:\n');
    for (const err of errors) {
      console.error(`  - ${err}`);
    }
    console.error('');
    throw new Error('Sidebar scope config validation failed');
  }

  if (verbose) {
    console.log('Config validation passed.\n');
  }

  const configDir = path.dirname(configFilePath);
  fs.mkdirSync(configDir, { recursive: true });
  fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2), 'utf-8');

  if (verbose) {
    console.log(`Config file generated: ${configFilePath}`);
    console.log(`Total config entries: ${Object.keys(config).length}\n`);
  }

  return config;
}

module.exports = {
  GENERATED_SIDEBAR_CONFIG_ALIAS,
  GENERATED_SIDEBAR_CONFIG_FILENAME,
  getGeneratedSidebarConfigPath,
  buildSidebarScopeConfig,
  buildAndWriteSidebarScopeConfig,
  validateSidebarScopeConfig,
};
