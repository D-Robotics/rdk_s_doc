import React, {useMemo} from 'react';
import clsx from 'clsx';
import {ThemeClassNames} from '@docusaurus/theme-common';
import {translate} from '@docusaurus/Translate';
import Link from '@docusaurus/Link';
import {useLocation} from '@docusaurus/router';
import {useSidebarBreadcrumbs, useDocsSidebar} from '@docusaurus/plugin-content-docs/client';
import {useHomePageRoute} from '@docusaurus/theme-common/internal';
import HomeBreadcrumbItem from '@theme/DocBreadcrumbs/Items/Home';
import DocBreadcrumbsStructuredData from '@theme/DocBreadcrumbs/StructuredData';
import {useDocScopeFilter} from '@site/src/context/DocScopeFilterContext';
import {shouldShowInSidebar} from '@site/src/context/sidebar-scope-config';
import {
  flattenSingleChildCategories,
  renumberVisibleItems,
} from '@site/src/utils/sidebar-numbering';
import styles from './styles.module.css';

function filterItemsByScope(items, version, product) {
  if (!Array.isArray(items)) {
    return [];
  }
  const result = [];
  for (const item of items) {
    if (item?.type === 'category' && Array.isArray(item.items)) {
      const filteredChildren = filterItemsByScope(item.items, version, product);
      if (filteredChildren.length > 0) {
        result.push({...item, items: filteredChildren});
      }
      continue;
    }
    if (shouldShowInSidebar(item, version, product)) {
      result.push(item);
    }
  }
  return result;
}

function processSidebarItems(items, version, product) {
  const filtered = filterItemsByScope(items, version, product);
  const flattened = flattenSingleChildCategories(filtered);
  return renumberVisibleItems(flattened);
}

function normalizePath(path) {
  if (!path) return '';
  return String(path)
    .split('#')[0]
    .split('?')[0]
    .replace(/^https?:\/\/[^/]+/i, '')
    .replace(/\/+$/, '')
    .toLowerCase();
}

function normalizePathTail(path) {
  const normalized = normalizePath(path);
  if (!normalized) return '';
  return normalized
    .replace(/^\/rdk_s_doc\//, '/')
    .replace(/^\/en\//, '/');
}

function collectLabelMap(items, map = new Map()) {
  if (!Array.isArray(items)) return map;
  for (const item of items) {
    const permalink = item?.href || item?.permalink || null;
    if (permalink && item?.label) {
      map.set(normalizePath(permalink), item.label);
      map.set(normalizePathTail(permalink), item.label);
    }
    if (item?.type === 'category' && Array.isArray(item.items)) {
      collectLabelMap(item.items, map);
    }
  }
  return map;
}

function resolveLabelFromMap(labelMap, href, fallbackPathname) {
  if (href) {
    const key = normalizePath(href);
    const keyTail = normalizePathTail(href);
    return labelMap.get(key) || labelMap.get(keyTail) || null;
  }
  if (fallbackPathname) {
    const current = normalizePath(fallbackPathname);
    const currentTail = normalizePathTail(fallbackPathname);
    return labelMap.get(current) || labelMap.get(currentTail) || null;
  }
  return null;
}

function BreadcrumbsItemLink({children, href, isLast}) {
  const className = 'breadcrumbs__link';
  if (isLast) {
    return <span className={className}>{children}</span>;
  }
  return href ? (
    <Link className={className} href={href}>
      <span>{children}</span>
    </Link>
  ) : (
    <span className={className}>{children}</span>
  );
}

function BreadcrumbsItem({children, active}) {
  return (
    <li
      className={clsx('breadcrumbs__item', {
        'breadcrumbs__item--active': active,
      })}>
      {children}
    </li>
  );
}

export default function DocBreadcrumbs() {
  const breadcrumbs = useSidebarBreadcrumbs();
  const docsSidebar = useDocsSidebar();
  const {version, product} = useDocScopeFilter();
  const {pathname} = useLocation();
  const homePageRoute = useHomePageRoute();

  const processedSidebarItems = useMemo(() => {
    return processSidebarItems(docsSidebar?.items, version, product);
  }, [docsSidebar?.items, version, product]);

  const labelMap = useMemo(() => {
    return collectLabelMap(processedSidebarItems, new Map());
  }, [processedSidebarItems]);

  const scopedBreadcrumbs = useMemo(() => {
    if (!breadcrumbs) return null;
    return breadcrumbs.map((item, idx) => {
      const isLast = idx === breadcrumbs.length - 1;
      const mapped = resolveLabelFromMap(labelMap, item?.href, isLast ? pathname : null);
      return mapped ? {...item, label: mapped} : item;
    });
  }, [breadcrumbs, labelMap, pathname]);

  if (!scopedBreadcrumbs) {
    return null;
  }

  return (
    <>
      <DocBreadcrumbsStructuredData breadcrumbs={scopedBreadcrumbs} />
      <nav
        className={clsx(
          ThemeClassNames.docs.docBreadcrumbs,
          styles.breadcrumbsContainer,
        )}
        aria-label={translate({
          id: 'theme.docs.breadcrumbs.navAriaLabel',
          message: 'Breadcrumbs',
          description: 'The ARIA label for the breadcrumbs',
        })}>
        <ul className="breadcrumbs">
          {homePageRoute && <HomeBreadcrumbItem />}
          {scopedBreadcrumbs.map((item, idx) => {
            const isLast = idx === scopedBreadcrumbs.length - 1;
            const href =
              item.type === 'category' && item.linkUnlisted
                ? undefined
                : item.href;
            return (
              <BreadcrumbsItem key={idx} active={isLast}>
                <BreadcrumbsItemLink href={href} isLast={isLast}>
                  {item.label}
                </BreadcrumbsItemLink>
              </BreadcrumbsItem>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
