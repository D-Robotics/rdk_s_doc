import React from 'react';
import DocPaginator from '@theme-original/DocPaginator';
import {useLocation} from '@docusaurus/router';
import {useDocsSidebar} from '@docusaurus/plugin-content-docs/client';
import type {Props} from '@theme/DocPaginator';
import {useDocScopeFilter} from '../../context/DocScopeFilterContext';
import {shouldShowInSidebar} from '../../context/sidebar-scope-config';
import {
  flattenSingleChildCategories,
  renumberVisibleItems,
} from '../../utils/sidebar-numbering';

function containsChinese(text: string): boolean {
  return /[\u4e00-\u9fff]/.test(text);
}

type SidebarItem = {
  type?: string;
  label?: string;
  href?: string;
  permalink?: string;
  docId?: string;
  items?: SidebarItem[];
};

function titleCaseWord(word: string): string {
  const lower = word.toLowerCase();
  const acronymMap: Record<string, string> = {
    faq: 'FAQs',
    os: 'OS',
    sdk: 'SDK',
    api: 'API',
    bpu: 'BPU',
    cpu: 'CPU',
    gpu: 'GPU',
    ros: 'ROS',
    tros: 'TROS',
    rdk: 'RDK',
    i2c: 'I2C',
    spi: 'SPI',
    uart: 'UART',
    gpio: 'GPIO',
  };
  if (acronymMap[lower]) {
    return acronymMap[lower];
  }
  if (/^x\d+$/i.test(word)) {
    return word.toUpperCase();
  }
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function deriveEnglishTitleFromPermalink(permalink: string): string | null {
  const cleanPath = String(permalink || '')
    .split('#')[0]
    .split('?')[0]
    .replace(/\/+$/, '');
  if (!cleanPath) return null;

  const segments = cleanPath.split('/').filter(Boolean);
  if (segments.length === 0) return null;

  let slug = segments[segments.length - 1];
  if (slug === 'en' && segments.length > 1) {
    slug = segments[segments.length - 2];
  }

  slug = decodeURIComponent(slug)
    .replace(/\.(md|mdx|html)$/i, '')
    .replace(/^\d+(?:[_-]\d+)*[_-]+/, '')
    .trim();

  if (!slug) return null;

  const words = slug
    .replace(/[_-]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map(titleCaseWord);

  if (words.length === 0) return null;
  return words.join(' ');
}

function extractNumberPrefix(title: string): string | null {
  const numbered = String(title || '').trim().match(/^(\d+(?:\.\d+)*)\s*[. ]\s*/);
  return numbered?.[1] ?? null;
}

function looksLikeUnderscoreCodeTitle(title: string): boolean {
  return /(?:^|\s)\d+_\d+_|[A-Za-z]_[A-Za-z]/.test(title);
}

function normalizePath(path: string | undefined): string {
  if (!path) return '';
  return String(path)
    .split('#')[0]
    .split('?')[0]
    .replace(/\/+$/, '')
    .toLowerCase();
}

function normalizePathTail(path: string | undefined): string {
  return normalizePath(path)
    .replace(/^\/tros_doc\//, '/')
    .replace(/^\/en\//, '/');
}

function filterSidebarItemsByScope(
  items: SidebarItem[] | undefined,
  version: string,
  product: string,
): SidebarItem[] {
  if (!Array.isArray(items)) return [];
  const result: SidebarItem[] = [];
  for (const item of items) {
    if (item.type === 'category' && Array.isArray(item.items)) {
      const children = filterSidebarItemsByScope(item.items, version, product);
      if (children.length > 0) {
        result.push({...item, items: children});
      }
      continue;
    }
    if (shouldShowInSidebar(item, version, product)) {
      result.push(item);
    }
  }
  return result;
}

function processSidebarItems(
  items: SidebarItem[] | undefined,
  version: string,
  product: string,
): SidebarItem[] {
  const filtered = filterSidebarItemsByScope(items, version, product);
  const flattened = flattenSingleChildCategories(filtered as any);
  return renumberVisibleItems(flattened as any) as SidebarItem[];
}

function collectVisibleDocLinks(items: SidebarItem[] | undefined, output: SidebarItem[] = []): SidebarItem[] {
  if (!Array.isArray(items)) return output;
  for (const item of items) {
    if (item.type === 'link' && item.docId && (item.href || item.permalink)) {
      output.push(item);
    }
    if (item.type === 'category' && Array.isArray(item.items)) {
      collectVisibleDocLinks(item.items, output);
    }
  }
  return output;
}

function normalizePaginatorTitle(
  title: string | undefined,
  permalink: string,
  locale: string,
): string | undefined {
  if (!title) return title;
  if (locale !== 'en') {
    return title;
  }

  const problematic = containsChinese(title) || looksLikeUnderscoreCodeTitle(title);
  if (!problematic) {
    return title;
  }

  const derived = deriveEnglishTitleFromPermalink(permalink);
  if (!derived) {
    return title;
  }

  const numberPrefix = extractNumberPrefix(title);
  if (numberPrefix) {
    return `${numberPrefix}. ${derived}`;
  }
  return derived;
}

export default function DocPaginatorWrapper(props: Props): JSX.Element {
  const { pathname } = useLocation();
  const { previous, next } = props;
  const docsSidebar = useDocsSidebar();
  const { version, product } = useDocScopeFilter();
  
  const getCurrentLocale = () => {
    if (pathname.includes('/en/')) return 'en';
    return 'zh';
  };
  
  const currentLocale = getCurrentLocale();

  const processedSidebarItems = processSidebarItems(
    (docsSidebar?.items as SidebarItem[] | undefined),
    version,
    product,
  );
  const orderedDocLinks = collectVisibleDocLinks(processedSidebarItems, []);
  const currentPath = normalizePath(pathname);
  const currentPathTail = normalizePathTail(pathname);

  const currentIndex = orderedDocLinks.findIndex((item) => {
    const itemPath = normalizePath((item.href || item.permalink) as string);
    const itemPathTail = normalizePathTail((item.href || item.permalink) as string);
    return (
      itemPath === currentPath ||
      itemPath === currentPathTail ||
      itemPathTail === currentPath ||
      itemPathTail === currentPathTail
    );
  });

  const autoPrevious =
    currentIndex > 0
      ? {
          title: orderedDocLinks[currentIndex - 1].label || previous?.title,
          permalink: (orderedDocLinks[currentIndex - 1].href || orderedDocLinks[currentIndex - 1].permalink) as string,
        }
      : null;

  const autoNext =
    currentIndex >= 0 && currentIndex < orderedDocLinks.length - 1
      ? {
          title: orderedDocLinks[currentIndex + 1].label || next?.title,
          permalink: (orderedDocLinks[currentIndex + 1].href || orderedDocLinks[currentIndex + 1].permalink) as string,
        }
      : null;

  // When current doc exists in filtered sidebar, trust filtered pagination result
  // (including null for first/last item) to avoid showing hidden next/previous docs.
  const hasFilteredPagination = orderedDocLinks.length > 0 && currentIndex >= 0;

  const baseNext = hasFilteredPagination ? autoNext : next ?? null;
  const customNext = baseNext
    ? {
        ...baseNext,
        title: normalizePaginatorTitle(baseNext.title, baseNext.permalink, currentLocale),
      }
    : null;

  const basePrevious = hasFilteredPagination ? autoPrevious : previous ?? null;
  const customPrevious = basePrevious
    ? {
        ...basePrevious,
        title: normalizePaginatorTitle(basePrevious.title, basePrevious.permalink, currentLocale),
      }
    : null;

  return (
    <DocPaginator
      previous={customPrevious}
      next={customNext}
    />
  );
}