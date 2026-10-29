import { PRODUCT_VERSION_MATRIX, VERSION_PRODUCT_MATRIX } from './doc-scope-matrix.js';
import {
  canonicalProductKeyForMatrix,
  normalizeProductKey,
  productForVersion,
} from './doc-scope-filter-core.mjs';

// 产品名规范化 / product-for-version 的唯一实现在 doc-scope-filter-core.mjs：
// 首帧前内联脚本内联的是同一份源码，改那里即两边同时生效。本文件只做「绑定矩阵」的薄封装，
// 供 UI 与构建期消费。
export { normalizeProductKey };

/** @param {string|null|undefined} a
 * @param {string|null|undefined} b
 * @returns {boolean} 是否与矩阵中的同一产品等价（大小写 / 多空格不敏感）
 */
export function productKeysEqual(a, b) {
  if (a == null || b == null) {
    return false;
  }
  return normalizeProductKey(a) === normalizeProductKey(b);
}

/**
 * products 中使用 RDK-X5 / RDK-X3 这类写法表示“整个产品系列”。
 * 与 RDK X5 这种带空格的精确产品名区分开，避免误匹配 Module/Pro 等变体。
 * @param {string|null|undefined} s
 * @returns {string|null}
 */
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

function productBelongsToSeries(currentProductCanonical, seriesKey) {
  const current = normalizeProductKey(currentProductCanonical);
  return current === seriesKey || current.startsWith(`${seriesKey} `);
}

/**
 * 将任意大小写/多空格的产品名解析为矩阵中的规范名称；无法识别时返回 null
 * @param {string|null|undefined} input
 * @returns {string|null}
 */
export function resolveCanonicalProduct(input) {
  return canonicalProductKeyForMatrix(input, PRODUCT_VERSION_MATRIX);
}

/**
 * 给定版本下，将 URL / localStorage 等产品参数解析为该版本列表中的规范项；无法匹配时用列表首项
 * @param {string|null|undefined} pRaw
 * @param {string} version
 * @returns {string}
 */
export function resolveProductForVersion(pRaw, version) {
  return productForVersion(pRaw, version, VERSION_PRODUCT_MATRIX, PRODUCT_VERSION_MATRIX);
}

/**
 * 将任意字符串解析为 PRODUCT_VERSION_MATRIX 的键（规范产品名）
 * @param {string|null|undefined} p
 * @returns {string|null}
 */
export function resolveCanonicalProductKeyForMatrix(p) {
  return canonicalProductKeyForMatrix(p, PRODUCT_VERSION_MATRIX);
}

/**
 * 侧边栏 / doc_scope 配置中的产品列表：逐项规范化为矩阵中的写法。
 * RDK-X5 / RDK-X3 这类连字符写法保留为系列匹配规则，运行时匹配该系列下所有产品。
 * 无法映射则保留 trim 后的原文，运行时仍可按大小写匹配。
 * @param {string[]} products
 * @returns {string[]}
 */
export function normalizeScopeProductList(products) {
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

/**
 * 配置中的 products 是否包含当前产品：空 / 缺省表示不限制（匹配全部）
 * - "RDK X5" 精确匹配 RDK X5
 * - "RDK X5 Module" 精确匹配 RDK X5 Module
 * - "RDK-X5" 匹配 RDK X5 系列，如 RDK X5 / RDK X5 Module / RDK X5 Pro
 * @param {string[]|null|undefined} scopeProducts
 * @param {string|null|undefined} currentProductCanonical
 */
export function scopeProductsMatchCurrent(scopeProducts, currentProductCanonical) {
  if (!scopeProducts || scopeProducts.length === 0) {
    return true;
  }
  if (currentProductCanonical == null || String(currentProductCanonical).trim() === '') {
    return false;
  }
  const cur = normalizeProductKey(currentProductCanonical);
  for (const entry of scopeProducts) {
    const seriesKey = normalizeProductSeriesKey(entry);
    if (seriesKey && productBelongsToSeries(currentProductCanonical, seriesKey)) {
      return true;
    }

    const canon = resolveCanonicalProduct(entry);
    if (canon && normalizeProductKey(canon) === cur) {
      return true;
    }
    if (normalizeProductKey(entry) === cur) {
      return true;
    }
  }
  return false;
}
