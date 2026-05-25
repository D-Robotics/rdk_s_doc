/**
 * 历史：曾支持多套 plugin-content-docs 与独立路由前缀；当前仅此主手册实例。
 * 当前站点仅保留主手册（routeBasePath: "/"），无附加 docs 前缀。
 */
export const MULTI_INSTANCE_DOC_PREFIXES = new Set();

/**
 * 当前路径是否属于「非主手册」的独立 docs 插件。
 * @param {string} pathname window.location 风格，含 baseUrl
 * @param {string} baseUrl 站点 baseUrl，如 "/rdk_x_doc/"
 * @param {string} currentLocale
 * @param {string} defaultLocale
 */
export function isMultiInstanceDocsRoute(pathname, baseUrl, currentLocale, defaultLocale) {
  const base = (baseUrl || "/").replace(/\/$/, "");
  let rest = pathname || "/";
  if (base && rest.startsWith(base)) {
    rest = rest.slice(base.length) || "/";
  }
  const parts = rest.split("/").filter(Boolean);
  let i = 0;
  if (parts[i] === currentLocale && currentLocale !== defaultLocale) {
    i += 1;
  }
  const first = parts[i];
  return Boolean(first && MULTI_INSTANCE_DOC_PREFIXES.has(first));
}
