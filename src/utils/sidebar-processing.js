import {shouldShowInSidebar} from '@site/src/context/sidebar-scope-config';
import {
  flattenSingleChildCategories,
  renumberVisibleItems,
  stripNumberPrefix,
} from '@site/src/utils/sidebar-numbering';

export function normalizeSidebarPath(path) {
  if (!path) return '';
  return String(path)
    .split('#')[0]
    .split('?')[0]
    .replace(/^https?:\/\/[^/]+/i, '')
    .replace(/\/+$/, '')
    .toLowerCase();
}

export function normalizeSidebarPathTail(path) {
  const normalized = normalizeSidebarPath(path);
  if (!normalized) return '';
  return normalized
    .replace(/^\/rdk_s_doc\//, '/')
    .replace(/^\/en\//, '/');
}

function itemSelfContainsVersionsPath(item) {
  const docId = String(item?.docId || '');
  const href = String(item?.href || '');
  const linkHref = String(item?.link?.href || '');
  return (
    docId.includes('/versions/') ||
    href.includes('/versions/') ||
    linkHref.includes('/versions/')
  );
}

function isVersionsSidebarItem(item) {
  const label = stripNumberPrefix(String(item?.label || ''))
    .trim()
    .toLowerCase();
  if (label === 'versions') {
    return true;
  }
  return itemSelfContainsVersionsPath(item);
}

export function filterSidebarItemsByScope(items, version, product) {
  if (!Array.isArray(items)) {
    return [];
  }
  const result = [];
  for (const item of items) {
    if (isVersionsSidebarItem(item)) {
      continue;
    }
    if (item?.type === 'category' && Array.isArray(item.items)) {
      const filteredChildren = filterSidebarItemsByScope(
        item.items,
        version,
        product,
      );
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

export function processSidebarForDisplay(items, version, product) {
  const filtered = filterSidebarItemsByScope(items, version, product);
  const flattened = flattenSingleChildCategories(filtered);
  return renumberVisibleItems(flattened);
}

export function pathsMatchSidebarItem(href, targetPathname) {
  if (!href || !targetPathname) {
    return false;
  }
  const itemPath = normalizeSidebarPath(href);
  const itemPathTail = normalizeSidebarPathTail(href);
  const targetPath = normalizeSidebarPath(targetPathname);
  const targetPathTail = normalizeSidebarPathTail(targetPathname);
  return (
    itemPath === targetPath ||
    itemPath === targetPathTail ||
    itemPathTail === targetPath ||
    itemPathTail === targetPathTail
  );
}

export function findSidebarBreadcrumbPath(items, targetPathname, path = []) {
  if (!Array.isArray(items)) {
    return null;
  }
  for (const item of items) {
    const currentPath = [...path, item];
    if (item.type === 'category' && Array.isArray(item.items)) {
      const found = findSidebarBreadcrumbPath(
        item.items,
        targetPathname,
        currentPath,
      );
      if (found) {
        return found;
      }
    }
    if (pathsMatchSidebarItem(item.href || item.permalink, targetPathname)) {
      return currentPath;
    }
  }
  return null;
}

export function collectVisibleDocLinks(items, output = []) {
  if (!Array.isArray(items)) {
    return output;
  }
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

export function getVersionKind(pathname) {
  const tail = normalizeSidebarPathTail(pathname);
  const matched = tail.match(/\/versions\/(rdk_s600|camera|mcu)\//);
  return matched?.[1] ?? null;
}

export function resolveMainDocPathForVersionPage(pathname, processedItems) {
  const versionKind = getVersionKind(pathname);
  if (!versionKind) {
    return null;
  }

  const orderedDocLinks = collectVisibleDocLinks(processedItems, []);
  const currentTail = normalizeSidebarPathTail(pathname);
  const basePrefix = currentTail.split('/versions/')[0] || '';
  const kindTokenMap = {
    rdk_s600: ['01_rdk_s600_kit', 'rdk_s600_kit'],
    camera: ['02_rdk_s600_camera_expansion_board', 'rdk_s600_camera_expansion_board'],
    mcu: ['03_rdk_s600_mcu_port_expansion_board', 'rdk_s600_mcu_port_expansion_board'],
  };
  const tokens = kindTokenMap[versionKind] || [];

  const matchesToken = (item) => {
    const target = normalizeSidebarPathTail(item.href || item.permalink);
    return tokens.some((token) => target.includes(token));
  };

  let candidate = orderedDocLinks.find((item) => {
    const target = normalizeSidebarPathTail(item.href || item.permalink);
    return (
      target.startsWith(basePrefix) &&
      tokens.some((token) => target.includes(token))
    );
  });

  if (!candidate) {
    candidate = orderedDocLinks.find(matchesToken);
  }

  return candidate
    ? normalizeSidebarPath(candidate.href || candidate.permalink)
    : null;
}

export function sidebarItemToBreadcrumb(item, rawMetaByHref = new Map()) {
  const href = item.href || item.permalink;
  const raw = href ? rawMetaByHref.get(normalizeSidebarPath(href)) : null;
  return {
    label: item.label,
    href,
    type: item.type,
    linkUnlisted: raw?.linkUnlisted ?? item.linkUnlisted,
  };
}

export function collectRawBreadcrumbMeta(breadcrumbs, map = new Map()) {
  if (!Array.isArray(breadcrumbs)) {
    return map;
  }
  for (const item of breadcrumbs) {
    if (item?.href) {
      map.set(normalizeSidebarPath(item.href), item);
    }
  }
  return map;
}

export function buildBreadcrumbsFromProcessedSidebar(
  processedItems,
  pathname,
  rawBreadcrumbs,
) {
  const rawMetaByHref = collectRawBreadcrumbMeta(rawBreadcrumbs);
  let path = findSidebarBreadcrumbPath(processedItems, pathname);

  if (!path && pathname.includes('/versions/')) {
    const mainDocPath = resolveMainDocPathForVersionPage(pathname, processedItems);
    if (mainDocPath) {
      const mainPath = findSidebarBreadcrumbPath(processedItems, mainDocPath);
      const versionTail = rawBreadcrumbs?.[rawBreadcrumbs.length - 1];
      if (mainPath && versionTail) {
        path = [...mainPath, versionTail];
      }
    }
  }

  if (!path) {
    return null;
  }

  return path.map((item) => sidebarItemToBreadcrumb(item, rawMetaByHref));
}
