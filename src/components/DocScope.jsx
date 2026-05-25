import React from 'react';
import { useDocScopeFilter } from '@site/src/context/DocScopeFilterContext';
import { scopeProductsMatchCurrent } from '@site/src/context/doc-scope-product-utils';
import { matchVersion, parseVersionScopeList } from '@site/src/context/doc-scope-version-utils';

/**
 * 根据版本和产品条件显示内容的组件
 * @param {Object} props - 组件属性
 * @param {string} props.versions - 逗号分隔的版本列表，支持范围表达式
 * @param {string} props.products - 逗号分隔的产品列表；RDK X5 精确匹配单个产品，RDK-X5 匹配整个 RDK X5 系列
 * @param {React.ReactNode} props.children - 要显示的内容
 * 
 * @example
 * // 精确版本匹配
 * <DocScope versions="3.5.0" products="RDK X5">
 *   内容
 * </DocScope>
 * 
 * @example
 * // 版本范围匹配
 * <DocScope versions=">= 3.5.0" products="RDK X5">
 *   内容
 * </DocScope>
 * 
 * @example
 * // 多个版本
 * <DocScope versions=">= 3.0.0, 3.5.0" products="RDK X5">
 *   内容
 * </DocScope>
 */
export default function DocScope({ versions, products, children }) {
  const { version, product } = useDocScopeFilter();

  // 解析版本和产品列表
  const versionConfigs = parseVersionScopeList(versions);
  const productList = products ? products.split(',').map(p => p.trim()) : [];

  // 检查是否匹配条件
  const versionMatch = matchVersion(version, versionConfigs);
  const productMatch = scopeProductsMatchCurrent(productList, product);

  // 如果不匹配条件，返回 null
  if (!versionMatch || !productMatch) {
    return null;
  }

  // 如果匹配条件，返回子内容
  return <div className="doc-scope">{children}</div>;
}
