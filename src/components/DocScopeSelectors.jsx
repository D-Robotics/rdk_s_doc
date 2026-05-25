import React, { useCallback, useEffect, useId, useRef, useState, useMemo } from 'react';
import { useDocScopeFilter } from '@site/src/context/DocScopeFilterContext';
import { productKeysEqual } from '@site/src/context/doc-scope-product-utils';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

function ScopeMenu({ label, value, options, onPick }) {
  const baseId = useId();
  const labelId = `${baseId}-label`;
  const listId = `${baseId}-list`;
  const rootRef = useRef(null);
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const onDocPointerDown = (e) => {
      if (!rootRef.current?.contains(e.target)) {
        close();
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        close();
      }
    };
    document.addEventListener('mousedown', onDocPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  return (
    <div ref={rootRef} className="doc-scope-menu">
      <span className="doc-scope-menu__label" id={labelId}>
        {label}
      </span>
      <div className="doc-scope-menu__control">
        <button
          type="button"
          className="doc-scope-menu__trigger"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-labelledby={labelId}
          onClick={() => setOpen((o) => !o)}>
          <span className="doc-scope-menu__value">{value}</span>
          <span className="doc-scope-menu__caret" aria-hidden />
        </button>
        {open ? (
          <ul id={listId} className="doc-scope-menu__list" role="listbox" aria-labelledby={labelId}>
            {options.map((opt) => (
              <li key={opt} className="doc-scope-menu__item" role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={productKeysEqual(opt, value)}
                  className={
                    productKeysEqual(opt, value)
                      ? 'doc-scope-menu__option doc-scope-menu__option--active'
                      : 'doc-scope-menu__option'
                  }
                  onClick={() => {
                    onPick(opt);
                    close();
                  }}>
                  {opt}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

/**
 * 文档页顶栏：先选产品，再选该产品支持的版本；与 URL ?v=&p= 同步。
 * 使用自定义下拉而非原生 select，避免嵌入式预览等环境无法弹出原生菜单。
 */
export default function DocScopeSelectors() {
  const { version, product, setVersion, setProduct, matrix, productMatrix } = useDocScopeFilter();
  const { i18n } = useDocusaurusContext();
  const isEnglish = i18n.currentLocale === 'en';
  
  // 获取所有产品列表
  const allProducts = useMemo(() => {
    const productsSet = new Set();
    Object.values(matrix).forEach(products => {
      products.forEach(p => productsSet.add(p));
    });
    return Array.from(productsSet);
  }, [matrix]);
  
  // 获取当前产品支持的版本列表
  const versions = useMemo(() => productMatrix[product] || [], [productMatrix, product]);
  
  // 确保当前版本在产品支持的版本列表中
  const versionValue = useMemo(() => versions.includes(version) ? version : versions[0], [versions, version]);

  return (
    <div className="doc-scope-selectors">
      <ScopeMenu label={isEnglish ? 'Product' : '产品'} value={product} options={allProducts} onPick={setProduct} />
      <ScopeMenu label={isEnglish ? 'Version' : '版本'} value={versionValue} options={versions} onPick={setVersion} />
    </div>
  );
}
