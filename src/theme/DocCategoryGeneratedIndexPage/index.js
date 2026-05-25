import React, {useEffect, useMemo} from 'react';
import {PageMetadata} from '@docusaurus/theme-common';
import {useCurrentSidebarCategory, useDocsSidebar} from '@docusaurus/plugin-content-docs/client';
import {useHistory, useLocation} from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';
import DocCardList from '@theme/DocCardList';
import DocPaginator from '@theme/DocPaginator';
import DocVersionBanner from '@theme/DocVersionBanner';
import DocVersionBadge from '@theme/DocVersionBadge';
import DocBreadcrumbs from '@theme/DocBreadcrumbs';
import Heading from '@theme/Heading';
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
    if (item.type === 'category' && Array.isArray(item.items)) {
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

function collectVisiblePermalinks(items, output = new Set()) {
  if (!Array.isArray(items)) {
    return output;
  }
  for (const item of items) {
    if (item?.href) {
      output.add(item.href);
    }
    if (item?.permalink) {
      output.add(item.permalink);
    }
    if (item?.type === 'category' && Array.isArray(item.items)) {
      collectVisiblePermalinks(item.items, output);
    }
  }
  return output;
}

function collectOrderedSidebarLinks(items, output = []) {
  if (!Array.isArray(items)) {
    return output;
  }
  for (const item of items) {
    const permalink = item?.href || item?.permalink || null;
    if (permalink) {
      output.push({
        title: item.label || '',
        permalink,
      });
    }
    if (item?.type === 'category' && Array.isArray(item.items)) {
      collectOrderedSidebarLinks(item.items, output);
    }
  }
  return output;
}

function findFirstVisiblePermalink(items) {
  if (!Array.isArray(items)) {
    return null;
  }
  for (const item of items) {
    const permalink = item?.href || item?.permalink || null;
    if (permalink) {
      return permalink;
    }
    if (item?.type === 'category' && Array.isArray(item.items)) {
      const nested = findFirstVisiblePermalink(item.items);
      if (nested) {
        return nested;
      }
    }
  }
  return null;
}

function splitPathSegments(path) {
  return normalizePathTail(path).split('/').filter(Boolean);
}

function commonPrefixScore(a, b) {
  const aSegs = splitPathSegments(a);
  const bSegs = splitPathSegments(b);
  const max = Math.min(aSegs.length, bSegs.length);
  let score = 0;
  while (score < max && aSegs[score] === bSegs[score]) {
    score += 1;
  }
  return score;
}

function findClosestVisiblePermalink(items, currentPathname) {
  const ordered = collectOrderedSidebarLinks(items, []);
  if (ordered.length === 0) return null;
  const current = normalizePathTail(currentPathname);
  let best = null;
  let bestScore = -1;

  for (const entry of ordered) {
    const target = entry?.permalink;
    if (!target) continue;
    const score = commonPrefixScore(current, target);
    if (score > bestScore) {
      best = target;
      bestScore = score;
    }
  }

  return best || ordered[0]?.permalink || null;
}

function normalizePermalink(permalink) {
  if (!permalink) return '';
  return String(permalink)
    .split('#')[0]
    .split('?')[0]
    .replace(/^https?:\/\/[^/]+/i, '')
    .replace(/\/+$/, '')
    .toLowerCase();
}

function normalizePathTail(permalink) {
  const normalized = normalizePermalink(permalink);
  if (!normalized) return '';
  // 兼容有/无 baseUrl 与有/无 locale 前缀的场景
  return normalized
    .replace(/^\/rdk_s_doc\//, '/')
    .replace(/^\/en\//, '/');
}

function isPermalinkVisible(permalink, visiblePermalinks) {
  if (!permalink) return false;
  const normalized = normalizePermalink(permalink);
  const tail = normalizePathTail(permalink);
  if (visiblePermalinks.has(normalized) || visiblePermalinks.has(tail)) {
    return true;
  }
  for (const candidate of visiblePermalinks) {
    if (
      candidate.endsWith(normalized) ||
      normalized.endsWith(candidate) ||
      candidate.endsWith(tail) ||
      tail.endsWith(candidate)
    ) {
      return true;
    }
  }
  return false;
}

function filterNavItemByVisibility(navItem, visiblePermalinks) {
  if (!navItem?.permalink) {
    return navItem ?? null;
  }
  if (isPermalinkVisible(navItem.permalink, visiblePermalinks)) {
    return navItem;
  }
  return null;
}

function matchesCurrentPath(permalink, current, currentTail) {
  if (!permalink) return false;
  const normalized = normalizePermalink(permalink);
  const tail = normalizePathTail(permalink);
  return (
    normalized === current ||
    normalized === currentTail ||
    tail === current ||
    tail === currentTail
  );
}

function findCurrentCategoryLabel(items, current, currentTail) {
  if (!Array.isArray(items)) return null;
  for (const item of items) {
    if (item?.type === 'category') {
      const permalink = item?.href || item?.permalink || null;
      if (matchesCurrentPath(permalink, current, currentTail)) {
        return item?.label || null;
      }
      if (Array.isArray(item.items)) {
        const found = findCurrentCategoryLabel(item.items, current, currentTail);
        if (found) return found;
      }
    }
  }
  return null;
}

function findCurrentCategoryItems(items, current, currentTail) {
  if (!Array.isArray(items)) return null;
  for (const item of items) {
    if (item?.type === 'category') {
      const permalink = item?.href || item?.permalink || null;
      if (matchesCurrentPath(permalink, current, currentTail)) {
        return Array.isArray(item.items) ? item.items : [];
      }
      if (Array.isArray(item.items)) {
        const found = findCurrentCategoryItems(item.items, current, currentTail);
        if (found) return found;
      }
    }
  }
  return null;
}

function useGeneratedIndexDisplayTitle(categoryGeneratedIndex) {
  const docsSidebar = useDocsSidebar();
  const location = useLocation();
  const {version, product} = useDocScopeFilter();
  const current = normalizePermalink(location.pathname);
  const currentTail = normalizePathTail(location.pathname);

  const processedSidebarItems = useMemo(
    () => processSidebarItems(docsSidebar?.items, version, product),
    [docsSidebar?.items, version, product],
  );

  return useMemo(() => {
    const sidebarLabel = findCurrentCategoryLabel(processedSidebarItems, current, currentTail);
    return sidebarLabel || categoryGeneratedIndex.title;
  }, [processedSidebarItems, current, currentTail, categoryGeneratedIndex.title]);
}

function DocCategoryGeneratedIndexPageMetadata({categoryGeneratedIndex, displayTitle}) {
  return (
    <PageMetadata
      title={displayTitle || categoryGeneratedIndex.title}
      description={categoryGeneratedIndex.description}
      keywords={categoryGeneratedIndex.keywords}
      image={useBaseUrl(categoryGeneratedIndex.image)}
    />
  );
}

function DocCategoryGeneratedIndexPageContent({categoryGeneratedIndex, displayTitle}) {
  const category = useCurrentSidebarCategory();
  const docsSidebar = useDocsSidebar();
  const history = useHistory();
  const location = useLocation();
  const {version, product} = useDocScopeFilter();
  const current = normalizePermalink(location.pathname);
  const currentTail = normalizePathTail(location.pathname);

  const processedSidebarItems = useMemo(
    () => processSidebarItems(docsSidebar?.items, version, product),
    [docsSidebar?.items, version, product],
  );

  const filteredItems = useMemo(() => {
    const fromFullTree = findCurrentCategoryItems(processedSidebarItems, current, currentTail);
    if (fromFullTree) {
      return fromFullTree;
    }
    // Fallback: use local category subtree if matching node not found in full tree.
    return processSidebarItems(category?.items, version, product);
  }, [processedSidebarItems, current, currentTail, category?.items, version, product]);
  const currentCategoryItems = useMemo(
    () => findCurrentCategoryItems(processedSidebarItems, current, currentTail),
    [processedSidebarItems, current, currentTail],
  );

  useEffect(() => {
    // 仅在“当前分类不可见且卡片列表确实为空”时兜底跳转，避免误伤可见子目录场景。
    const hasVisibleCards = Array.isArray(filteredItems) && filteredItems.length > 0;
    if (currentCategoryItems !== null || hasVisibleCards) {
      return;
    }
    const nearestVisible =
      findClosestVisiblePermalink(processedSidebarItems, location.pathname) ||
      findFirstVisiblePermalink(processedSidebarItems);
    if (!nearestVisible) {
      return;
    }
    const target = `${nearestVisible}${location.search || ''}`;
    const currentPath = normalizePermalink(location.pathname);
    const targetPath = normalizePermalink(nearestVisible);
    if (targetPath && currentPath !== targetPath) {
      history.replace(target);
    }
  }, [
    currentCategoryItems,
    filteredItems,
    processedSidebarItems,
    location.pathname,
    location.search,
    history,
  ]);

  const visiblePermalinks = useMemo(() => {
    const raw = collectVisiblePermalinks(processedSidebarItems);
    const normalized = new Set();
    for (const p of raw) {
      normalized.add(normalizePermalink(p));
      normalized.add(normalizePathTail(p));
    }
    return normalized;
  }, [processedSidebarItems]);

  const orderedLinks = useMemo(() => {
    return collectOrderedSidebarLinks(processedSidebarItems, []);
  }, [processedSidebarItems]);

  useEffect(() => {
    if (typeof document === 'undefined' || !displayTitle) return;
    const separator = ' | ';
    const currentTitle = document.title || '';
    const suffix = currentTitle.includes(separator)
      ? currentTitle.split(separator).slice(1).join(separator)
      : '';
    const nextTitle = suffix ? `${displayTitle}${separator}${suffix}` : displayTitle;
    if (document.title !== nextTitle) {
      document.title = nextTitle;
    }
  }, [displayTitle]);

  const {previous, next} = useMemo(() => {
    const index = orderedLinks.findIndex((entry) => {
      const p = normalizePermalink(entry.permalink);
      const t = normalizePathTail(entry.permalink);
      return p === current || p === currentTail || t === current || t === currentTail;
    });

    if (index >= 0) {
      return {
        previous: index > 0 ? orderedLinks[index - 1] : null,
        next: index < orderedLinks.length - 1 ? orderedLinks[index + 1] : null,
      };
    }

    const canFilterNavigation = visiblePermalinks.size > 0;
    return {
      previous: canFilterNavigation
        ? filterNavItemByVisibility(
            categoryGeneratedIndex.navigation.previous,
            visiblePermalinks,
          )
        : categoryGeneratedIndex.navigation.previous,
      next: canFilterNavigation
        ? filterNavItemByVisibility(
            categoryGeneratedIndex.navigation.next,
            visiblePermalinks,
          )
        : categoryGeneratedIndex.navigation.next,
    };
  }, [
    orderedLinks,
    categoryGeneratedIndex.navigation.previous,
    categoryGeneratedIndex.navigation.next,
    visiblePermalinks,
    current,
    currentTail,
  ]);

  return (
    <div className={styles.generatedIndexPage}>
      <DocVersionBanner />
      <DocBreadcrumbs />
      <DocVersionBadge />
      <header>
        <Heading as="h1" className={styles.title}>
          {displayTitle}
        </Heading>
        {categoryGeneratedIndex.description && <p>{categoryGeneratedIndex.description}</p>}
      </header>
      <article className="margin-top--lg">
        <DocCardList items={filteredItems} className={styles.list} />
      </article>
      <footer className="margin-top--md">
        <DocPaginator previous={previous} next={next} />
      </footer>
    </div>
  );
}

export default function DocCategoryGeneratedIndexPage(props) {
  const displayTitle = useGeneratedIndexDisplayTitle(props.categoryGeneratedIndex);
  return (
    <>
      <DocCategoryGeneratedIndexPageMetadata {...props} displayTitle={displayTitle} />
      <DocCategoryGeneratedIndexPageContent {...props} displayTitle={displayTitle} />
    </>
  );
}
