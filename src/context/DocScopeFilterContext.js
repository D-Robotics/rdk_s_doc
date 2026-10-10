import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { useHistory, useLocation } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { PRODUCT_VERSION_MATRIX, VERSION_PRODUCT_MATRIX } from './doc-scope-matrix.js';
import {
  LEGACY_STORAGE_PRODUCT,
  LEGACY_STORAGE_VERSION,
  SUPPORTED_STORAGE_LOCALES,
  defaultProduct,
  defaultVersion,
  defaultsForLocale as coreDefaultsForLocale,
  normalizeVersionFromQuery as coreNormalizeVersionFromQuery,
  parseFilter as coreParseFilter,
  storageKeys,
} from './doc-scope-filter-core.mjs';
import {
  resolveCanonicalProductKeyForMatrix,
  resolveProductForVersion,
} from './doc-scope-product-utils.js';

export { PRODUCT_VERSION_MATRIX, VERSION_PRODUCT_MATRIX } from './doc-scope-matrix.js';

// 解析规则（URL → localStorage → 默认值）、键名、默认值来源全部来自 doc-scope-filter-core.mjs：
// 首帧前注入的内联脚本内联的是同一份源码，改内核即两边同时生效，这里只做「绑定矩阵」的薄封装。
const CORE_DEPS = {
  v2p: VERSION_PRODUCT_MATRIX,
  p2v: PRODUCT_VERSION_MATRIX,
  readStorage(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null; // localStorage 不可用（隐私模式等）
    }
  },
};

/** 中英文统一默认到同一产品/版本（矩阵首项） */
const DEFAULT_VERSION_ZH = defaultVersion(VERSION_PRODUCT_MATRIX);
const DEFAULT_PRODUCT_ZH = defaultProduct(VERSION_PRODUCT_MATRIX, DEFAULT_VERSION_ZH);

const defaultsForLocale = (locale) => coreDefaultsForLocale(VERSION_PRODUCT_MATRIX, locale);
const normalizeVersionFromQuery = (v, locale) =>
  coreNormalizeVersionFromQuery(v, locale, VERSION_PRODUCT_MATRIX);
const parseFilter = (search, locale) => coreParseFilter(search, locale, CORE_DEPS);

const defaultCtx = {
  version: DEFAULT_VERSION_ZH,
  product: DEFAULT_PRODUCT_ZH,
  setVersion: () => {},
  setProduct: () => {},
  matrix: VERSION_PRODUCT_MATRIX,
};

export const DocScopeFilterContext = createContext(defaultCtx);

export function useDocScopeFilter() {
  return useContext(DocScopeFilterContext);
}

function saveToStorage(version, product, locale) {
  try {
    const targets = new Set([locale, ...SUPPORTED_STORAGE_LOCALES]);
    targets.forEach((loc) => {
      const { version: vk, product: pk } = storageKeys(loc);
      localStorage.setItem(vk, version);
      localStorage.setItem(pk, product);
    });
    // Keep legacy keys in sync to avoid old sessions causing drift.
    localStorage.setItem(LEGACY_STORAGE_VERSION, version);
    localStorage.setItem(LEGACY_STORAGE_PRODUCT, product);
  } catch (e) {
    // localStorage 不可用时忽略
  }
}

// parseFilter 的实现已移入 doc-scope-filter-core.mjs（与首帧内联脚本共用同一份源码），
// 上面已按名绑定为薄封装。

function replaceSearch(history, location, nextSearch) {
  const search = nextSearch && nextSearch.length ? (nextSearch.startsWith('?') ? nextSearch : `?${nextSearch}`) : '';
  if (location.search === search) {
    return;
  }
  history.replace({
    pathname: location.pathname,
    search,
    hash: location.hash,
    state: location.state,
  });
}

function normalizePathname(pathname) {
  const p = String(pathname || '');
  if (p.length > 1 && p.endsWith('/')) {
    return p.slice(0, -1);
  }
  return p;
}

export function DocScopeFilterProvider({ children }) {
  const location = useLocation();
  const history = useHistory();
  const { i18n, siteConfig } = useDocusaurusContext();
  const locale = i18n.currentLocale;
  const buildScope = siteConfig?.customFields?.docBuildScope;
  const hasBuildScope = Boolean(
    buildScope?.enabled && buildScope?.product && buildScope?.version,
  );

  useEffect(() => {
    if (hasBuildScope) {
      return;
    }
    const base = String(siteConfig?.baseUrl || '/');
    const baseNoSlash = normalizePathname(base);
    const pathnameNoSlash = normalizePathname(location.pathname);
    const enRoot = normalizePathname(`${base}en/`);

    // 仅在站点入口做默认中文兜底：
    // /rdk_x_doc/ 或 /rdk_x_doc/en/ -> /rdk_x_doc/RDK
    if (pathnameNoSlash === baseNoSlash || pathnameNoSlash === enRoot) {
      history.replace(`${base}RDK${location.search}${location.hash}`);
    }
  }, [
    hasBuildScope,
    history,
    location.pathname,
    location.search,
    location.hash,
    siteConfig?.baseUrl,
  ]);

  const { version, product: productFromUrl } = useMemo(() => {
    if (hasBuildScope) {
      return {
        version: normalizeVersionFromQuery(buildScope.version, locale),
        product: buildScope.product,
      };
    }
    return parseFilter(location.search, locale);
  }, [hasBuildScope, buildScope?.version, buildScope?.product, location.search, locale]);

  const def = defaultsForLocale(locale);

  const product = useMemo(() => {
    const k = resolveCanonicalProductKeyForMatrix(productFromUrl);
    if (k) {
      return k;
    }
    return productFromUrl && String(productFromUrl).trim() !== ''
      ? productFromUrl
      : def.product;
  }, [productFromUrl, def.product]);

  useEffect(() => {
    if (hasBuildScope) {
      return;
    }

    const next = new URLSearchParams(
      location.search && location.search.startsWith('?')
        ? location.search.slice(1)
        : location.search || '',
    );

    const normalizedVersion = normalizeVersionFromQuery(version, locale);
    const normalizedProduct = resolveProductForVersion(product, normalizedVersion);

    const currentV = next.get('v');
    const currentP = next.get('p');
    const canonicalCurrentP = resolveCanonicalProductKeyForMatrix(currentP || '');
    const canonicalExpectedP = resolveCanonicalProductKeyForMatrix(normalizedProduct || '');

    let changed = false;
    if (currentV !== normalizedVersion) {
      next.set('v', normalizedVersion);
      changed = true;
    }
    if (canonicalCurrentP !== canonicalExpectedP) {
      next.set('p', normalizedProduct);
      changed = true;
    }

    if (!changed) {
      return;
    }

    replaceSearch(history, location, next.toString());
  }, [
    hasBuildScope,
    history,
    location.pathname,
    location.search,
    locale,
    product,
    version,
  ]);

  useEffect(() => {
    if (hasBuildScope) {
      return;
    }
    saveToStorage(version, product, locale);
  }, [version, product, locale, hasBuildScope]);

  const setVersion = useCallback(
    (v) => {
      if (hasBuildScope) {
        return;
      }
      const newV = normalizeVersionFromQuery(v, locale);
      const list =
        VERSION_PRODUCT_MATRIX[newV] || VERSION_PRODUCT_MATRIX[def.version] || [];
      if (list.length === 0) {
        return;
      }
      const nextP = list[0];
      const next = new URLSearchParams(location.search);
      next.set('v', newV);
      next.set('p', nextP);
      replaceSearch(history, location, `?${next.toString()}`);
    },
    [location, history, locale, def.version, hasBuildScope],
  );

  const setProduct = useCallback(
    (p) => {
      if (hasBuildScope) {
        return;
      }
      const canonical = resolveCanonicalProductKeyForMatrix(p);
      if (!canonical) {
        return;
      }
      const versions = PRODUCT_VERSION_MATRIX[canonical];
      if (!versions || versions.length === 0) {
        return;
      }
      const nextV = versions[0];
      const next = new URLSearchParams(location.search);
      next.set('v', nextV);
      next.set('p', canonical);
      replaceSearch(history, location, `?${next.toString()}`);
    },
    [location, history, hasBuildScope],
  );

  const value = useMemo(
    () => ({
      version,
      product,
      setVersion,
      setProduct,
      matrix: VERSION_PRODUCT_MATRIX,
      productMatrix: PRODUCT_VERSION_MATRIX,
    }),
    [version, product, setVersion, setProduct],
  );

  return <DocScopeFilterContext.Provider value={value}>{children}</DocScopeFilterContext.Provider>;
}
