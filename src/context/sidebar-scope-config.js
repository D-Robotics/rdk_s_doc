import { scopeProductsMatchCurrent } from './doc-scope-product-utils.js';
import { matchVersion } from './doc-scope-version-utils.js';

/**
 * 侧边栏显示范围配置
 * 仅通过 Front Matter 配置方式控制章节目录展示
 *
 * 支持两种配置方式：
 * 1. 在 Markdown 文件的 Front Matter 中配置（控制单个文档）
 * 2. 在 _sidebar_scope.json 中配置（控制整个文件夹）
 *
 * 使用方式：
 * 
 * 方式1：在 Markdown 文件的 Front Matter 中配置
 * ---
 * sidebar_versions: 3.5.0
 * sidebar_products: RDK X5
 * ---
 * 
 * 或使用版本范围表达式：
 * ---
 * sidebar_versions: ">= 3.0.0"
 * sidebar_products: RDK X5
 * ---
 * 
 * 方式2：在文件夹中创建 _sidebar_scope.json 文件
 * {
 *   "versions": [">= 3.0.0"],
 *   "products": ["RDK X5"]
 * }
 *
 * 配置说明：
 * - versions: 该文档在哪些版本下显示，支持版本范围表达式
 *   - "3.0.0" - 精确匹配
 *   - "> 3.0.0" - 大于 3.0.0
 *   - ">= 3.0.0" - 大于等于 3.0.0
 *   - "< 3.5.0" - 小于 3.5.0
 *   - "<= 3.5.0" - 小于等于 3.5.0
 * - products: 该文档在哪些产品下显示；省略或空数组 [] 表示所有产品都显示；名称与矩阵比对时不区分大小写，多余空格会规整后匹配
 *   - "RDK X5" 精确匹配 RDK X5 手册
 *   - "RDK X5 Module" 精确匹配 RDK X5 Module 手册
 *   - "RDK-X5" 匹配 RDK X5 系列产品，如 RDK X5 / RDK X5 Module / RDK X5 Pro
 * 
 * 注意：不要在 _category_.json 中添加自定义字段，Docusaurus 不支持。
 * 请使用单独的 _sidebar_scope.json 文件。
 */

// 从 Front Matter 生成的配置（通过 remark 插件自动生成）
let generatedFrontmatterConfig = {};
try {
  // 尝试加载生成的配置文件
  const configModule = require('./generated-sidebar-config.json');
  generatedFrontmatterConfig = configModule || {};
} catch (e) {
  // 配置文件不存在时使用空对象
  generatedFrontmatterConfig = {};
}

/**
 * 将路径转换为 Docusaurus docId 格式
 * - 转换为小写
 * - 去除数字前缀（如 02_02_02_Quick_start 变成 quick_start）
 * @param {string} path 路径
 * @returns {string} docId 格式的路径
 */
function normalizeDocId(path) {
  if (!path) return '';
  
  const parts = path.toLowerCase().split('/');
  
  const normalizedParts = parts.map(part => {
    // 去除数字前缀（如 02_02_02_Quick_start -> 02_02_Quick_start）
    return part.replace(/^\d+_/, '');
  });
  
  return normalizedParts.join('/');
}

/**
 * 检查指定 docId 的文档是否应该在当前版本/产品下显示
 * @param {string} docId 文档 ID
 * @param {string} version 当前版本
 * @param {string} product 当前产品
 * @returns {boolean} 是否显示
 */
export function shouldShowDoc(docId, version, product) {
  const normalizedId = normalizeDocId(docId);

  // 1. 先检查文档级别的精确匹配
  if (generatedFrontmatterConfig[normalizedId]) {
    const scope = generatedFrontmatterConfig[normalizedId];
    const vMatch = matchVersion(version, scope.versions);
    const pMatch = scopeProductsMatchCurrent(scope.products, product);
    return vMatch && pMatch;
  }

  // 2. 检查文件夹级别的匹配（文档路径是否属于某个配置的文件夹）
  for (const [configPath, scope] of Object.entries(generatedFrontmatterConfig)) {
    if (!scope.isCategory) continue;
    
    const normalizedConfigPath = normalizeDocId(configPath);
    
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
  return shouldShowDoc(rawDocId, version, product);
}
