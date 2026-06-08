import { scopeProductsMatchCurrent } from './doc-scope-product-utils.js';
import {
  lookupDocScopeConfig,
  normalizeDocIdFromPath,
} from './doc-scope-id-utils.js';
import { matchVersion } from './doc-scope-version-utils.js';

/**
 * 侧边栏显示范围配置
 * 由 sidebar-scope-config-plugin 在 build/start 时生成至 .docusaurus/generated-sidebar-config.json
 * （不进 git；开发时 watch-sidebar-config 也会更新同一文件）
 */

let generatedFrontmatterConfig = {};
try {
  const configModule = require('@generated/generated-sidebar-config.json');
  generatedFrontmatterConfig = configModule || {};
} catch {
  generatedFrontmatterConfig = {};
}

function isExcludedFromSidebar(docId) {
  const normalizedId = normalizeDocIdFromPath(docId);
  for (const [configPath, scope] of Object.entries(generatedFrontmatterConfig)) {
    if (!scope.isCategory || !scope.exclude) continue;
    const normalizedConfigPath = normalizeDocIdFromPath(configPath);
    if (
      normalizedId.startsWith(normalizedConfigPath + '/') ||
      normalizedId === normalizedConfigPath
    ) {
      return true;
    }
  }
  return false;
}

/**
 * 检查指定 docId 的文档是否应该在当前版本/产品下显示（页面访问用）
 * @param {string} docId 文档 ID
 * @param {string} version 当前版本
 * @param {string} product 当前产品
 * @returns {boolean} 是否显示
 */
export function shouldShowDoc(docId, version, product) {
  const normalizedId = normalizeDocIdFromPath(docId);

  // 1. 文档级匹配：支持文件路径 key 与 front matter id 两种写法
  const docScope = lookupDocScopeConfig(docId, generatedFrontmatterConfig);
  if (docScope) {
    const vMatch = matchVersion(version, docScope.versions);
    const pMatch = scopeProductsMatchCurrent(docScope.products, product);
    return vMatch && pMatch;
  }

  // 2. 检查文件夹级别的匹配（文档路径是否属于某个配置的文件夹）
  for (const [configPath, scope] of Object.entries(generatedFrontmatterConfig)) {
    if (!scope.isCategory) continue;
    
    const normalizedConfigPath = normalizeDocIdFromPath(configPath);
    
    if (normalizedId.startsWith(normalizedConfigPath + '/') || normalizedId === normalizedConfigPath) {
      const vMatch = matchVersion(version, scope.versions);
      const pMatch = scopeProductsMatchCurrent(scope.products, product);
      return vMatch && pMatch;
    }
  }

  return true;
}

/**
 * 从侧边栏项目中递归查找第一个可见文档的路径
 * @param {Array} items 侧边栏项目数组
 * @param {string} version 当前版本
 * @param {string} product 当前产品
 * @returns {string|null} 第一个可见文档的 href，如果没有则返回 null
 */
export function findFirstVisibleDoc(items, version, product) {
  if (!items || !Array.isArray(items)) {
    return null;
  }

  for (const item of items) {
    if (item.type === 'link' && item.docId) {
      if (shouldShowDoc(item.docId, version, product)) {
        return item.href || null;
      }
    }

    if (item.type === 'category' && item.items) {
      const found = findFirstVisibleDoc(item.items, version, product);
      if (found) {
        return found;
      }
    }
  }

  return null;
}

/**
 * 检查文档是否应该显示（侧边栏用）
 * @param {object} item 侧边栏项
 * @param {string} version 当前版本
 * @param {string} product 当前产品
 * @returns {boolean} 是否显示
 */
export function shouldShowInSidebar(item, version, product) {
  const rawDocId = item.docId || '';
  if (isExcludedFromSidebar(rawDocId)) {
    return false;
  }
  return shouldShowDoc(rawDocId, version, product);
}
