import React from 'react';
import OriginalDocSidebar from '@theme-original/DocSidebar';
import { useDocScopeFilter } from '@site/src/context/DocScopeFilterContext';
import { shouldShowInSidebar } from '@site/src/context/sidebar-scope-config.js';
import {
  flattenSingleChildCategories,
  renumberVisibleItems,
} from '@site/src/utils/sidebar-numbering';

function filterItems(items, version, product) {
  if (!items) return items;
  const result = [];
  for (const item of items) {
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
