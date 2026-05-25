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
import { visit } from 'unist-util-visit';
import { scopeProductsMatchCurrent } from '../context/doc-scope-product-utils.js';
import { matchVersion, parseVersionScopeList } from '../context/doc-scope-version-utils.js';

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
        return;
      }

      const payload = JSON.stringify({ versions, products });

      // 创建一个新的 div 节点
      const divNode = {
        type: 'mdxJsxFlowElement',
        name: 'div',
        attributes: [
          {
            type: 'mdxJsxAttribute',
            name: 'className',
            value: 'doc-scope'
          },
          {
            type: 'mdxJsxAttribute',
            name: 'data-doc-scope',
            value: payload
          }
        ],
        children: node.children || [],
        position: node.position
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
        return;
      }

      const payload = JSON.stringify({
        versions: scopeMeta.versions,
        products: scopeMeta.products,
      });
      parent.children[index] = {
        type: 'mdxJsxFlowElement',
        name: 'div',
        attributes: [
          {
            type: 'mdxJsxAttribute',
            name: 'className',
            value: 'doc-scope',
          },
          {
            type: 'mdxJsxAttribute',
            name: 'data-doc-scope',
            value: payload,
          },
        ],
        children: node.children || [],
        position: node.position,
      };
    });
  };
}
