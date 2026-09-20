/**
 * Extra Algolia facet filters for the navbar product/version selector.
 * Keep in sync with records produced by scripts/algolia-index.mjs.
 */
export function getDocScopeFacetFilters(product, version) {
  const filters = [];
  if (product) {
    filters.push(`product:${product}`);
  }
  if (version) {
    filters.push(`rdk_version:${version}`);
  }
  return filters;
}
