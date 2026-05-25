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
  resolveCanonicalProductKeyForMatrix,
  resolveProductForVersion,
} from './doc-scope-product-utils.js';

export { PRODUCT_VERSION_MATRIX, VERSION_PRODUCT_MATRIX } from './doc-scope-matrix.js';

function getFirstVersionKey() {
  const versions = Object.keys(VERSION_PRODUCT_MATRIX || {});
  return versions.length > 0 ? versions[0] : '';
}

function getFirstProductForVersion(version) {
  if (!version || !VERSION_PRODUCT_MATRIX[version] || VERSION_PRODUCT_MATRIX[version].length === 0) {
    return '';
  }
  return VERSION_PRODUCT_MATRIX[version][0];
}

/** 中英文统一默认到同一产品/版本（矩阵首项） */
const DEFAULT_VERSION_ZH = getFirstVersionKey();
const DEFAULT_PRODUCT_ZH = getFirstProductForVersion(DEFAULT_VERSION_ZH);
const DEFAULT_VERSION_EN = DEFAULT_VERSION_ZH;
const DEFAULT_PRODUCT_EN = DEFAULT_PRODUCT_ZH;

const LEGACY_STORAGE_VERSION = 'doc_scope_version';
const LEGACY_STORAGE_PRODUCT = 'doc_scope_product';
const SUPPORTED_STORAGE_LOCALES = ['zh-Hans', 'en'];

function storageKeys(locale) {
  return {
    version: `${LEGACY_STORAGE_VERSION}__${locale}`,
    product: `${LEGACY_STORAGE_PRODUCT}__${locale}`,
  };
}

function defaultsForLocale(locale) {
  if (locale === 'en') {
    return { version: DEFAULT_VERSION_EN, product: DEFAULT_PRODUCT_EN };
  }
  return { version: DEFAULT_VERSION_ZH, product: DEFAULT_PRODUCT_ZH };
}

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

function normalizeVersionFromQuery(v, locale) {
  const fallback = defaultsForLocale(locale).version || getFirstVersionKey();
  if (v && VERSION_PRODUCT_MATRIX[v]) {
    return v;
  }
  return fallback;
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

function loadFromStorage(locale) {
  try {
    const { version: vk, product: pk } = storageKeys(locale);
    let v = localStorage.getItem(vk);
    let pRaw = localStorage.getItem(pk);
    if (!v && locale === 'zh-Hans') {
      v = localStorage.getItem(LEGACY_STORAGE_VERSION);
      pRaw = localStorage.getItem(LEGACY_STORAGE_PRODUCT);
    }
    // Cross-locale fallback: language switch links may drop query params.
    if (!v) {
      for (const fallbackLocale of SUPPORTED_STORAGE_LOCALES) {
        if (fallbackLocale === locale) continue;
        const { version: fvk, product: fpk } = storageKeys(fallbackLocale);
        const fv = localStorage.getItem(fvk);
        const fp = localStorage.getItem(fpk);
        if (fv) {
          v = fv;
          pRaw = fp;
          break;
        }
      }
    }
    if (v && VERSION_PRODUCT_MATRIX[v]) {
      const p = resolveProductForVersion(pRaw, v);
      return { version: v, product: p };
    }
  } catch (e) {
    // localStorage 不可用时忽略
  }
  return null;
}

/**
 * 从 URL 查询参数解析版本和产品，如果没有则从 localStorage 读取，最后使用默认值。
 * 产品名任意大小写均可（如 rdK X3）会通过矩阵规范为正式写法。
 */
function parseFilter(search, locale) {
  const normalized = !search
    ? ''
    : search.startsWith('?')
      ? search.slice(1)
      : search;
  const q = new URLSearchParams(normalized);
  const vRaw = q.get('v');
  const pRaw = q.get('p');

  if (vRaw) {
    const v = normalizeVersionFromQuery(vRaw, locale);
    const p = resolveProductForVersion(pRaw, v);
    return { version: v, product: p };
  }
  if (pRaw != null && String(pRaw).trim() !== '') {
    const canon = resolveCanonicalProductKeyForMatrix(pRaw);
    if (canon) {
      const vers = PRODUCT_VERSION_MATRIX[canon];
      if (vers && vers.length > 0) {
        const v = vers[0];
        const p = resolveProductForVersion(canon, v);
        return { version: v, product: p };
      }
    }
  }
  const stored = loadFromStorage(locale);
  if (stored) {
    return stored;
  }
  return defaultsForLocale(locale);
}

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
