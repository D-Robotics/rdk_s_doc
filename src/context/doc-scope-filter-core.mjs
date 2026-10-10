/**
 * 产品/版本筛选条件的解析内核 —— 客户端与「首帧前内联脚本」共用的唯一实现。
 *
 * 消费方有两处：
 *   1) 客户端直接 import：DocScopeFilterContext.js（parseFilter）与 doc-scope-product-utils.js
 *      （产品名规范化 / product-for-version）。
 *   2) doc-scope-product-bootstrap-plugin 在构建期用 fs 读本文件源码、去掉 export 后内联进注入到
 *      </body> 前的脚本（内联脚本必须自包含、且要早于首屏绘制执行，走不了 import）。
 * 于是这里改一次，客户端与首帧脚本同时生效 —— 不再有第二份需要手工同步的副本。
 *
 * 因此本文件有三条硬约束，改动时必须保持：
 *   - 除 export 外不出现 import/任何模块依赖：矩阵等数据一律由调用方经 deps 传入；
 *   - 不出现反引号与美元花括号插值（本文件被拼进模板字面量，会静默截断生成脚本）；
 *   - 只用 var / function / 下标 for（与被注入脚本的既有风格一致，压缩器行为可预期）。
 *
 * 矩阵约定：PRODUCT_VERSION_MATRIX 的键集合与 VERSION_PRODUCT_MATRIX 各版本列表的并集一致
 * （scripts/test-doc-scope-filter-parity.mjs 会断言这一点）。
 */

export const LEGACY_STORAGE_VERSION = 'doc_scope_version';
export const LEGACY_STORAGE_PRODUCT = 'doc_scope_product';
export const SUPPORTED_STORAGE_LOCALES = ['zh-Hans', 'en'];

/** 矩阵首个版本 */
export function defaultVersion(v2p) {
  var keys = Object.keys(v2p || {});
  return keys.length > 0 ? keys[0] : '';
}

/** 指定版本列表的首个产品 */
export function defaultProduct(v2p, version) {
  var list = v2p && version ? v2p[version] : null;
  return list && list.length > 0 ? list[0] : '';
}

/**
 * 该语言的默认版本/产品。中英文当前都落在矩阵首项；若将来要按语言区分默认值，
 * 在这里分叉即可 —— 客户端与首帧脚本共用本函数，不会再出现两边不一致。
 */
export function defaultsForLocale(v2p, locale) {
  var version = defaultVersion(v2p);
  return { version: version, product: defaultProduct(v2p, version) };
}

/** localStorage 键名：doc_scope_version__<locale> / doc_scope_product__<locale> */
export function storageKeys(locale) {
  return {
    version: LEGACY_STORAGE_VERSION + '__' + locale,
    product: LEGACY_STORAGE_PRODUCT + '__' + locale,
  };
}

/** ?v= 的版本取值：不在矩阵里就回落到该语言默认版本 */
export function normalizeVersionFromQuery(v, locale, v2p) {
  if (v && v2p && v2p[v]) {
    return v;
  }
  var fallback = defaultsForLocale(v2p, locale).version;
  return fallback || defaultVersion(v2p);
}

/** 产品名比较用规范化：大小写（en-US 规则）与多空格不敏感 */
export function normalizeProductKey(s) {
  return String(s)
    .trim()
    .toLocaleLowerCase('en-US')
    .replace(/\s+/g, ' ');
}

/**
 * 将任意大小写/多空格的产品名解析为 PRODUCT_VERSION_MATRIX 的键，认不出返回 null。
 * 注意：规范名集合以 p2v 的键为准（与 VERSION_PRODUCT_MATRIX 的值集一致，有测试断言）。
 */
export function canonicalProductKeyForMatrix(p, p2v) {
  if (p == null || String(p).trim() === '') {
    return null;
  }
  var key = normalizeProductKey(p);
  var keys = Object.keys(p2v || {});
  for (var i = 0; i < keys.length; i += 1) {
    if (normalizeProductKey(keys[i]) === key) {
      return keys[i];
    }
  }
  return null;
}

/** 给定版本下把产品参数解析为该版本列表中的规范项；无法匹配时用列表首项 */
export function productForVersion(pRaw, version, v2p, p2v) {
  var list = v2p ? v2p[version] : null;
  if (!list || list.length === 0) {
    return '';
  }
  if (pRaw == null || String(pRaw).trim() === '') {
    return list[0];
  }
  var canon = canonicalProductKeyForMatrix(pRaw, p2v);
  if (canon) {
    for (var i = 0; i < list.length; i += 1) {
      if (list[i] === canon) {
        return canon;
      }
    }
  }
  for (var j = 0; j < list.length; j += 1) {
    if (normalizeProductKey(list[j]) === normalizeProductKey(pRaw)) {
      return list[j];
    }
  }
  return list[0];
}

/**
 * 读取该语言的已保存选择：当前语言键 → zh-Hans 的历史键 → 其他语言（换语言链接可能丢参数）。
 * 读不到或读到的版本不在矩阵里返回 null。
 * deps: { v2p, p2v, readStorage }，readStorage 由调用方保证不抛（各自内部 catch）。
 */
export function loadFromStorage(locale, deps) {
  var v2p = deps.v2p;
  var v = null;
  var pRaw = null;
  try {
    var keys = storageKeys(locale);
    v = deps.readStorage(keys.version);
    pRaw = deps.readStorage(keys.product);
    if (!v && locale === 'zh-Hans') {
      v = deps.readStorage(LEGACY_STORAGE_VERSION);
      pRaw = deps.readStorage(LEGACY_STORAGE_PRODUCT);
    }
    if (!v) {
      for (var i = 0; i < SUPPORTED_STORAGE_LOCALES.length; i += 1) {
        var other = SUPPORTED_STORAGE_LOCALES[i];
        if (other === locale) {
          continue;
        }
        var otherKeys = storageKeys(other);
        var fv = deps.readStorage(otherKeys.version);
        if (fv) {
          v = fv;
          pRaw = deps.readStorage(otherKeys.product);
          break;
        }
      }
    }
  } catch (e) {
    return null;
  }
  if (v && v2p && v2p[v]) {
    return { version: v, product: productForVersion(pRaw, v, v2p, deps.p2v) };
  }
  return null;
}

/**
 * 解析顺序与优先级（唯一实现）：?v= → ?p= → localStorage → 该语言默认值。
 * deps: { v2p, p2v, readStorage }
 * @param {string} search 形如 "?v=4.0.5&p=RDK%20S100"，可带或不带前导 ?
 * @param {string} locale 当前语言，决定 localStorage 键
 * @returns {{ version: string, product: string }} product 一定属于该版本的列表
 */
export function parseFilter(search, locale, deps) {
  var v2p = deps.v2p;
  var normalized = !search ? '' : search.charAt(0) === '?' ? search.slice(1) : search;
  var q = new URLSearchParams(normalized);
  var vRaw = q.get('v');
  var pRaw = q.get('p');

  if (vRaw) {
    var v = normalizeVersionFromQuery(vRaw, locale, v2p);
    return { version: v, product: productForVersion(pRaw, v, v2p, deps.p2v) };
  }
  if (pRaw != null && String(pRaw).trim() !== '') {
    var canon = canonicalProductKeyForMatrix(pRaw, deps.p2v);
    if (canon) {
      var vers = deps.p2v[canon];
      if (vers && vers.length > 0) {
        return { version: vers[0], product: productForVersion(canon, vers[0], v2p, deps.p2v) };
      }
    }
  }
  var stored = loadFromStorage(locale, deps);
  if (stored) {
    return stored;
  }
  return defaultsForLocale(v2p, locale);
}
