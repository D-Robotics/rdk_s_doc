import {shouldShowInSidebar} from '@site/src/context/sidebar-scope-config';

/**
 * 解析类似 "1.5 显示屏使用" / "1. 快速开始" 的标签。
 */
export function parseNumberedLabel(label) {
  if (typeof label !== 'string') return null;
  const trimmed = label.trim();
  const match = trimmed.match(/^(\d+(?:\.\d+)*)(?:\s*[.。．、-]\s*|\s+)(.+)$/);
  if (!match) return null;
  return {
    prefix: match[1],
    rest: match[2].trim(),
  };
}

/**
 * 去掉标题中的数字前缀。
 */
export function stripNumberPrefix(label) {
  const parsed = parseNumberedLabel(label);
  return parsed ? parsed.rest : label;
}

/**
 * 根据当前可见侧边栏项重排章节编号，避免过滤后出现断号（如 1.4 -> 1.6）。
 * 仅修改 label 显示，不影响文档路径与 docId。
 */
export function renumberVisibleItems(items, parentPrefix = '') {
  if (!Array.isArray(items)) return items;
  let serial = 0;

  return items.map((item) => {
    const next = { ...item };
    const plain = stripNumberPrefix(String(item.label || '')).trim();

    // 顶层裸 link（首页等非章条目）不编号；category 与所有子级条目一律按位置编号。
    // 不依赖 label 里是否预置数字种子（去硬编码后 label 为纯文字，编号由位置生成）。
    const isTopLevelLink = parentPrefix === '' && item.type === 'link';
    let ownPrefix = parentPrefix;
    if (isTopLevelLink) {
      next.label = plain;
    } else {
      serial += 1;
      ownPrefix = parentPrefix ? `${parentPrefix}.${serial}` : `${serial}`;
      next.label = `${ownPrefix} ${plain}`;
    }

    if (item.type === 'category' && Array.isArray(item.items)) {
      next.items = renumberVisibleItems(item.items, ownPrefix);
    }

    return next;
  });
}

/**
 * 从（已重排编号的）侧边栏中获取当前文档显示编号。
 */
export function findDocDisplayNumber(items, targetDocId) {
  if (!Array.isArray(items) || !targetDocId) return null;
  for (const item of items) {
    if (item.type === 'link' && item.docId === targetDocId) {
      const parsed = parseNumberedLabel(item.label);
      return parsed?.prefix ?? null;
    }
    if (item.type === 'category' && Array.isArray(item.items)) {
      const found = findDocDisplayNumber(item.items, targetDocId);
      if (found) return found;
    }
  }
  return null;
}

function shouldFlattenParentWithSingleChild(parent, child) {
  if (!parent || !child) return false;
  if (parent.type !== 'category') return false;

  // 过滤后父 category 只剩一个可见子项时直接扁平化。
  // 编号前缀不再作为判断依据：编号现由 renumberVisibleItems 按位置生成，且总在 flatten 之后执行。
  return true;
}

/**
 * 扁平化“只剩一个可见子项”的中间目录：
 * 例如过滤后 1.2 下只剩 1.2.1，则侧栏不展示 1.2，直接展示该子项。
 */
export function flattenSingleChildCategories(items) {
  if (!Array.isArray(items)) return items;
  const result = [];

  for (const item of items) {
    if (item.type === 'category' && Array.isArray(item.items)) {
      const flattenedChildren = flattenSingleChildCategories(item.items);
      if (flattenedChildren.length === 0) {
        continue;
      }

      const next = { ...item, items: flattenedChildren };
      if (flattenedChildren.length === 1) {
        const onlyChild = flattenedChildren[0];
        if (shouldFlattenParentWithSingleChild(next, onlyChild)) {
          result.push(onlyChild);
          continue;
        }
      }
      result.push(next);
      continue;
    }
    result.push(item);
  }

  return result;
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
