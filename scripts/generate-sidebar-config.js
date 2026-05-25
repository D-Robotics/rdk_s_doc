/**
 * 预构建脚本：扫描所有文档文件和 _sidebar_scope.json，提取 Front Matter 配置，生成侧边栏配置文件
 * 在每次构建前运行，确保配置文件是最新的
 * 
 * 重要：生成的路径格式与 Docusaurus 的 docId 格式一致
 * - 转换为小写
 * - 去除数字前缀（如 02_02_02_Quick_start 变成 quick_start）
 * 
 * 支持两种配置方式：
 * 1. 在 Markdown 文件的 Front Matter 中配置（控制单个文档）
 * 2. 在 _sidebar_scope.json 中配置（控制整个文件夹）
 * 
 * 支持版本范围表达式：
 * - "3.0.0" - 精确匹配
 * - "> 3.0.0" - 大于 3.0.0
 * - ">= 3.0.0" - 大于等于 3.0.0
 * - "< 3.5.0" - 小于 3.5.0
 * - "<= 3.5.0" - 小于等于 3.5.0
 */
const fs = require('fs');
const path = require('path');

const matrixJsonPath = path.join(__dirname, '../src/context/doc-scope-matrix.json');
const { VERSION_PRODUCT_MATRIX } = require(matrixJsonPath);

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

/**
 * 与 src/context/doc-scope-product-utils.js 逻辑一致，供 Node 脚本使用（共享 doc-scope-matrix.json）。
 * RDK-X5 / RDK-X3 这类连字符写法表示整个产品系列，不能规范化为精确产品 RDK X5 / RDK X3。
 */
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

  // 先去重（大小写/空格不敏感）
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

  // 系列优先：存在 RDK-X3 / RDK-X5 时，吞并该系列下的精确产品配置
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
    versions: mergeVersions(existingScope.versions, incomingScope.versions),
    products: mergeProducts(existingScope.products, incomingScope.products),
    isCategory: Boolean(existingScope.isCategory || incomingScope.isCategory),
  };
}

const configFilePath = path.join(__dirname, '../src/context/generated-sidebar-config.json');
const docsDir = path.join(__dirname, '../docs');
/** 英文翻译文档根目录（结构同 docs/，生成的 docId 与主站一致，后扫描可覆盖同名条目的 Front Matter） */
const i18nEnDocsCurrentDir = path.join(
  __dirname,
  '../i18n/en/docusaurus-plugin-content-docs/current',
);

/**
 * 解析版本范围表达式
 * @param {string} versionStr 版本字符串
 * @returns {object} 版本配置对象
 */
function parseVersionExpression(versionStr) {
  if (!versionStr || typeof versionStr !== 'string') {
    return null;
  }
  
  // 去除引号和空格
  let trimmed = versionStr.trim();
  
  // 去除字符串两端的引号（如果有）
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    trimmed = trimmed.slice(1, -1).trim();
  }
  
  // 匹配操作符和版本号
  const match = trimmed.match(/^(>=|<=|>|<)?\s*(\d+(?:\.\d+)*)$/);
  
  if (!match) {
    return null;
  }
  
  const operator = match[1] || '';
  const version = match[2];
  
  return {
    operator,
    version,
    original: versionStr
  };
}

/**
 * 解析版本列表，支持范围表达式
 * @param {string|Array} value 版本配置
 * @returns {Array} 版本配置数组
 */
function parseScopeList(value) {
  if (value == null) return [];
  
  // 如果是数组，处理每个元素
  if (Array.isArray(value)) {
    return value.map(v => {
      if (typeof v === 'string') {
        const parsed = parseVersionExpression(v);
        return parsed || { operator: '', version: v, original: v };
      }
      return v;
    });
  }
  
  // 如果是字符串，按逗号分隔
  const s = String(value).trim();
  if (s === '' || s === '*') return [];
  
  return s.split(/[,，]/)
    .map(x => x.trim())
    .filter(Boolean)
    .map(v => {
      const parsed = parseVersionExpression(v);
      return parsed || { operator: '', version: v, original: v };
    });
}

/**
 * 从 Markdown 文件中提取 Front Matter
 */
function extractFrontMatter(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const frontMatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    
    if (!frontMatterMatch) {
      return null;
    }
    
    const frontMatterText = frontMatterMatch[1];
    const frontMatter = {};
    
    // 解析 Front Matter
    frontMatterText.split(/\r?\n/).forEach(line => {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 1).trim();
        frontMatter[key] = value;
      }
    });
    
    return frontMatter;
  } catch (e) {
    return null;
  }
}

/**
 * 从 _sidebar_scope.json 中提取配置
 */
function extractSidebarScopeConfig(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const config = JSON.parse(content);
    
    if (config.versions || config.products) {
      return {
        versions: parseScopeList(config.versions),
        products: Array.isArray(config.products) ? config.products : 
                  (typeof config.products === 'string' ? config.products.split(/[,，]/).map(x => x.trim()).filter(Boolean) : [])
      };
    }
    
    return null;
  } catch (e) {
    return null;
  }
}

/**
 * 将路径转换为 Docusaurus docId 格式
 * - 转换为小写
 * - 去除数字前缀（如 02_02_02_Quick_start 变成 quick_start）
 */
function toDocId(relativePath) {
  const parts = relativePath.split('/');
  
  const docIdParts = parts.map(part => {
    // 去除数字前缀（如 02_02_02_Quick_start -> 02_02_Quick_start）
    return part.replace(/^\d+_/, '');
  });
  
  const docId = docIdParts.join('/').toLowerCase();
  
  return docId;
}

/**
 * 格式化版本配置用于显示
 */
function formatVersions(versions) {
  if (!versions || versions.length === 0) return '所有版本';
  
  return versions.map(v => {
    if (typeof v === 'object' && v.operator) {
      return `${v.operator} ${v.version}`;
    }
    return typeof v === 'object' ? v.version : v;
  }).join(', ');
}

/**
 * 扫描目录中的所有 Markdown 文件和 _sidebar_scope.json
 */
function scanDirectory(dir, baseDir, config) {
  if (!fs.existsSync(dir)) {
    return;
  }
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // 递归扫描子目录
      scanDirectory(fullPath, baseDir, config);
    } else if (item === '_sidebar_scope.json') {
      // 处理 _sidebar_scope.json 文件
      const scopeConfig = extractSidebarScopeConfig(fullPath);
      
      if (scopeConfig) {
        // 计算文件夹的相对路径
        const folderPath = path.relative(baseDir, path.dirname(fullPath)).replace(/\\/g, '/');
        
        // 转换为 Docusaurus docId 格式
        const folderId = toDocId(folderPath);
        
        const productsNorm = normalizeScopeProductList(scopeConfig.products);

        const nextScope = {
          versions: scopeConfig.versions,
          products: productsNorm,
          isCategory: true // 标记这是文件夹级别的配置
        };
        config[folderId] = mergeScopeConfig(config[folderId], nextScope);
        
        console.log(`✓ 找到文件夹配置: ${folderPath}`);
        console.log(`  folderId: ${folderId}`);
        console.log(`  版本: ${formatVersions(scopeConfig.versions)}`);
        console.log(`  产品: ${productsNorm.join(', ') || '所有产品'}`);
      }
    } else if (item.endsWith('.md')) {
      // 处理 Markdown 文件
      const frontMatter = extractFrontMatter(fullPath);
      
      if (frontMatter && (frontMatter.sidebar_versions || frontMatter.sidebar_products)) {
        // 计算相对路径（相对于当前扫描根目录，如 docs/ 或 i18n/.../current/）
        const relativePath = path.relative(baseDir, fullPath).replace(/\.md$/, '').replace(/\\/g, '/');
        
        // 转换为 Docusaurus docId 格式
        const docId = toDocId(relativePath);
        
        const versions = parseScopeList(frontMatter.sidebar_versions);
        
        // 解析产品列表，去除引号
        let products = [];
        if (frontMatter.sidebar_products) {
          if (typeof frontMatter.sidebar_products === 'string') {
            // 去除引号
            let productsStr = frontMatter.sidebar_products.trim();
            if ((productsStr.startsWith('"') && productsStr.endsWith('"')) ||
                (productsStr.startsWith("'") && productsStr.endsWith("'"))) {
              productsStr = productsStr.slice(1, -1).trim();
            }
            products = productsStr.split(/[,，]/).map(x => x.trim()).filter(Boolean);
          } else {
            products = frontMatter.sidebar_products;
          }
        }
        
        const productsNorm = normalizeScopeProductList(products);

        const nextScope = {
          versions: versions,
          products: productsNorm,
        };
        config[docId] = mergeScopeConfig(config[docId], nextScope);
        
        console.log(`✓ 找到文档配置: ${relativePath}`);
        console.log(`  docId: ${docId}`);
        console.log(`  版本: ${formatVersions(versions)}`);
        console.log(`  产品: ${productsNorm.join(', ') || '所有产品'}`);
      }
    }
  }
}

/**
 * 主函数
 */
function main() {
  console.log('开始扫描文档文件...\n');
  
  const config = {};
  
  // 扫描 docs 目录
  if (fs.existsSync(docsDir)) {
    console.log('扫描 docs 目录:');
    scanDirectory(docsDir, docsDir, config);
    console.log('');
  }
  
  // 扫描英文 i18n current 目录（与 watch-sidebar-config 监听范围一致）
  if (fs.existsSync(i18nEnDocsCurrentDir)) {
    console.log('扫描 i18n/en/docusaurus-plugin-content-docs/current 目录:');
    scanDirectory(i18nEnDocsCurrentDir, i18nEnDocsCurrentDir, config);
    console.log('');
  }
  
  // 验证配置文件中的所有 key 格式
  console.log('验证配置文件格式...\n');
  let hasErrors = false;
  for (const key of Object.keys(config)) {
    // 检查 key 是否包含数字前缀（如 02_02_02_Quick_start）
    if (/^\d+_/.test(key) || /\/\d+_/.test(key)) {
      console.error(`❌ 错误: 配置 key "${key}" 包含未去除的数字前缀`);
      hasErrors = true;
    }
    
    // 检查 key 是否为大写
    if (key !== key.toLowerCase()) {
      console.error(`❌ 错误: 配置 key "${key}" 应该全部小写`);
      hasErrors = true;
    }
  }
  
  if (hasErrors) {
    console.error('\n❌ 配置文件格式验证失败，请检查生成脚本\n');
    process.exit(1);
  }
  
  console.log('✅ 配置文件格式验证通过\n');
  
  // 保存配置文件
  const configDir = path.dirname(configFilePath);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  
  fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2), 'utf-8');
  
  console.log(`配置文件已生成: ${configFilePath}`);
  console.log(`共找到 ${Object.keys(config).length} 个配置\n`);
}

main();
