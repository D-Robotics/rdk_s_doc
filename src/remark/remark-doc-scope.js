/**
 * 将 Markdown 容器指令 :::doc_scope 转为带 data-doc-scope 的 div，
 * 供运行时根据「版本 + 产品」双层选择显示/隐藏（共用段落写在指令外，只维护一份）。
 *
 * 写法：
 * :::doc_scope{versions="3.0.0,3.5.0" products="RDK X3"}
 * 仅在这些版本且产品命中时显示的正文…
 * :::
 *
 * - versions / products 为英文逗号分隔；省略或写 * 表示不限制该维度。
 * - versions 支持精确版本及范围：3.0.0、> 3.0.0、>= 3.5.0、< 3.5.0、<= 3.5.0（与 sidebar_versions 一致）。
 * - products 中 "RDK X5" 为精确匹配，"RDK-X5" 为 RDK X5 系列匹配。
 * - 指令名使用 doc_scope，避免与 Docusaurus 内置 :::tip 等冲突。
 */
import { SKIP, visit } from 'unist-util-visit';
import { PRODUCT_VERSION_MATRIX } from '../context/doc-scope-matrix.js';
import { scopeProductsMatchCurrent } from '../context/doc-scope-product-utils.js';
import { matchVersion, parseVersionScopeList } from '../context/doc-scope-version-utils.js';

const ALL_CANONICAL_PRODUCTS = Object.keys(PRODUCT_VERSION_MATRIX);

/**
 * 构建期固化「本作用域命中哪些产品」，供首屏前的 bootstrap 脚本做纯字符串比较，
 * 避免把 scopeProductsMatchCurrent 的匹配语义（大小写不敏感、RDK-X5 系列写法）复制进内联脚本。
 * 带版本条件的作用域返回 null：版本语义留在运行时，仍由 DocScopeHydration 处理。
 */
function scopeProductTokens(versions, products) {
  if (versions && versions.length > 0) {
    return null;
  }
  return ALL_CANONICAL_PRODUCTS.filter((p) => scopeProductsMatchCurrent(products, p));
}

/**
 * 作用域 div 的属性，两个 visit 分支（:::doc_scope 指令 / <DocScope> JSX）共用。
 */
function scopeDivAttributes(versions, products) {
  const tokens = scopeProductTokens(versions, products);
  const attributes = [
    { type: 'mdxJsxAttribute', name: 'className', value: 'doc-scope' },
    {
      type: 'mdxJsxAttribute',
      name: 'data-doc-scope',
      value: JSON.stringify({ versions, products }),
    },
    // 产品可见性在 hydration 之前就由 bootstrap 脚本按 data-scope-products 折叠，
    // React 首帧的 className 与此不一致属于预期，不要报 hydration 警告。
    { type: 'mdxJsxAttribute', name: 'suppressHydrationWarning', value: null },
  ];
  if (tokens) {
    attributes.push({
      type: 'mdxJsxAttribute',
      name: 'data-scope-products',
      value: tokens.join(','),
    });
  }
  return attributes;
}

function parseScopeList(value) {
  if (value == null) return [];
  const s = String(value).trim();
  if (s === '' || s === '*') return [];
  return s
    .split(/[,，]/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function normalizeScopeMeta({ versions, products }) {
  return {
    versions: parseVersionScopeList(versions),
    products: parseScopeList(products),
  };
}

function shouldRenderInBuild(scopeMeta, buildScope) {
  if (!buildScope || !buildScope.product || !buildScope.version) {
    return true;
  }
  const vOk = matchVersion(buildScope.version, scopeMeta.versions);
  const pOk = scopeProductsMatchCurrent(scopeMeta.products, buildScope.product);
  return vOk && pOk;
}

/** @returns {import('unified').Plugin} */
export default function remarkDocScope() {
  const buildScope =
    process.env.DOC_BUILD_PRODUCT?.trim() && process.env.DOC_BUILD_VERSION?.trim()
      ? {
          product: process.env.DOC_BUILD_PRODUCT.trim(),
          version: process.env.DOC_BUILD_VERSION.trim(),
        }
      : null;

  return (tree) => {
    visit(tree, 'containerDirective', (node, index, parent) => {
      if (node.name !== 'doc_scope') return;

      const attrs = node.attributes || {};
      const scopeMeta = normalizeScopeMeta({
        versions: attrs.versions,
        products: attrs.products,
      });
      const versions = scopeMeta.versions;
      const products = scopeMeta.products;
      const shouldRender = shouldRenderInBuild(scopeMeta, buildScope);

      if (buildScope && parent && index != null) {
        parent.children.splice(index, 1, ...(shouldRender ? node.children || [] : []));
        // 必须显式指定下一个 index：就地替换会改变兄弟节点下标，默认的 index++ 会跳过
        // 紧邻的下一个兄弟（`<DocScope>` 成对相邻是主要写法），那个块就会原样留给 React
        // 渲染，scoped 构建下等于把该块内容连同另一套产品一起发出去。
        return [SKIP, index];
      }

      // 创建一个新的 div 节点
      const divNode = {
        type: 'mdxJsxFlowElement',
        name: 'div',
        attributes: scopeDivAttributes(versions, products),
        children: node.children || [],
        position: node.position,
      };

      // 替换原始节点
      if (parent && index !== null) {
        parent.children[index] = divNode;
      }
    });

    visit(tree, 'mdxJsxFlowElement', (node, index, parent) => {
      if (node.name !== 'DocScope' || !parent || index == null) {
        return;
      }
      const attrs = node.attributes || [];
      const versionsAttr = attrs.find((attr) => attr?.type === 'mdxJsxAttribute' && attr.name === 'versions');
      const productsAttr = attrs.find((attr) => attr?.type === 'mdxJsxAttribute' && attr.name === 'products');
      const versionsValue = typeof versionsAttr?.value === 'string' ? versionsAttr.value : '';
      const productsValue = typeof productsAttr?.value === 'string' ? productsAttr.value : '';
      const scopeMeta = normalizeScopeMeta({
        versions: versionsValue,
        products: productsValue,
      });

      if (buildScope) {
        const shouldRender = shouldRenderInBuild(scopeMeta, buildScope);
        parent.children.splice(index, 1, ...(shouldRender ? node.children || [] : []));
        return [SKIP, index];
      }

      parent.children[index] = {
        type: 'mdxJsxFlowElement',
        name: 'div',
        attributes: scopeDivAttributes(scopeMeta.versions, scopeMeta.products),
        children: node.children || [],
        position: node.position,
      };
    });
  };
}
