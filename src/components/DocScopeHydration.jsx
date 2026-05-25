import React, { useLayoutEffect } from 'react';
import { useDocScopeFilter } from '@site/src/context/DocScopeFilterContext';
import { scopeProductsMatchCurrent } from '@site/src/context/doc-scope-product-utils';
import { matchVersion } from '@site/src/context/doc-scope-version-utils';

function matchesScope(spec, version, product) {
  const versions = spec.versions || [];
  const products = spec.products || [];
  const vOk = versions.length === 0 || matchVersion(version, versions);
  const pOk = scopeProductsMatchCurrent(products, product);
  return vOk && pOk;
}

function resolveHeadingByHash(root, hash) {
  const raw = String(hash || '').trim();
  if (!raw.startsWith('#')) return null;
  const idRaw = raw.slice(1);
  if (!idRaw) return null;
  const candidates = [idRaw];
  try {
    const decoded = decodeURIComponent(idRaw);
    if (decoded !== idRaw) {
      candidates.push(decoded);
    }
  } catch {
    // ignore decode errors
  }
  for (const id of candidates) {
    if (!id) continue;
    const escaped =
      typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
        ? CSS.escape(id)
        : id.replace(/["\\]/g, '\\$&');
    const bySelector = root.querySelector(`#${escaped}`);
    if (bySelector) return bySelector;
    const byId = document.getElementById(id);
    if (byId) return byId;
  }
  return null;
}

function syncTocByDocScope(root) {
  const tocLinks = document.querySelectorAll(
    '.theme-doc-toc-desktop a.table-of-contents__link[href^="#"], .theme-doc-toc-mobile a.table-of-contents__link[href^="#"]',
  );
  tocLinks.forEach((link) => {
    const target = resolveHeadingByHash(root, link.getAttribute('href'));
    const visible = Boolean(target) && !target.closest('.doc-scope--hidden');
    const tocItem = link.closest('li');
    if (tocItem) {
      tocItem.classList.toggle('doc-scope-toc-hidden', !visible);
    }
  });
}

/**
 * 根据当前版本/产品，为 .doc-scope 节点切换 doc-scope--hidden（由 remark-doc-scope 注入）。
 */
export default function DocScopeHydration() {
  const { version, product } = useDocScopeFilter();

  useLayoutEffect(() => {
    const root =
      typeof document !== 'undefined'
        ? document.querySelector('.theme-doc-markdown') ||
          document.querySelector('article.markdown') ||
          document.querySelector('article')
        : null;
    if (!root) {
      return;
    }
    root.querySelectorAll('.doc-scope[data-doc-scope]').forEach((el) => {
      const raw = el.getAttribute('data-doc-scope');
      if (!raw) {
        return;
      }
      try {
        const spec = JSON.parse(raw);
        const show = matchesScope(spec, version, product);
        el.classList.toggle('doc-scope--hidden', !show);
      } catch {
        el.classList.remove('doc-scope--hidden');
      }
    });
    syncTocByDocScope(root);
  }, [version, product]);

  return null;
}
