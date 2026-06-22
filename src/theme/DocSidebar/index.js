import React from 'react';
import OriginalDocSidebar from '@theme-original/DocSidebar';
import { useDocScopeFilter } from '@site/src/context/DocScopeFilterContext';
import { shouldShowInSidebar } from '@site/src/context/sidebar-scope-config.js';
import {
  flattenSingleChildCategories,
  stripNumberPrefix,
  renumberVisibleItems,
} from '@site/src/utils/sidebar-numbering';

function itemSelfContainsVersionsPath(item) {
  const docId = String(item?.docId || '');
  const href = String(item?.href || '');
  const linkHref = String(item?.link?.href || '');
  if (
    docId.includes('/versions/') ||
    href.includes('/versions/') ||
    linkHref.includes('/versions/')
  ) {
    return true;
  }
  return false;
}

function isVersionsSidebarItem(item) {
  const label = stripNumberPrefix(String(item?.label || '')).trim().toLowerCase();
  if (label === 'versions') {
    return true;
  }
  // Only filter current item itself; do not recursively hide parents.
  return itemSelfContainsVersionsPath(item);
}

function filterItems(items, version, product) {
  if (!items) return items;
  const result = [];
  for (const item of items) {
    if (isVersionsSidebarItem(item)) {
      continue;
    }
    if (item.type === 'category' && item.items) {
      const filtered = filterItems(item.items, version, product);
      if (filtered.length > 0) {
        result.push({ ...item, items: filtered });
      }
      continue;
    }
    if (shouldShowInSidebar(item, version, product)) {
      result.push(item);
    }
  }
  return result;
}

export default function DocSidebar(props) {
  const { version, product } = useDocScopeFilter();

  const sidebar = props.sidebar;
  let processedSidebar;

  if (Array.isArray(sidebar)) {
    const filtered = filterItems(sidebar, version, product);
    const flattened = flattenSingleChildCategories(filtered);
    processedSidebar = renumberVisibleItems(flattened);
  } else if (sidebar && sidebar.items) {
    const filtered = filterItems(sidebar.items, version, product);
    const flattened = flattenSingleChildCategories(filtered);
    processedSidebar = { ...sidebar, items: renumberVisibleItems(flattened) };
  } else {
    processedSidebar = sidebar;
  }

  return <OriginalDocSidebar {...props} sidebar={processedSidebar} />;
}
