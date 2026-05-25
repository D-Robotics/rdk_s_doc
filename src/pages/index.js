import React, { useEffect } from "react";
import { useLocation } from "@docusaurus/router";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

function ensureTrailingSlash(path) {
  const normalized = String(path || "/");
  return normalized.endsWith("/") ? normalized : `${normalized}/`;
}

function removeTrailingSlash(path) {
  if (!path) return "/";
  return path.length > 1 ? path.replace(/\/+$/, "") : path;
}

/**
 * 首页统一重定向到中文 RDK 文档首页。
 * 解决语言检测命中 /en/ 时未进入中文首页的问题。
 */
export default function HomeRedirect() {
  const location = useLocation();
  const { siteConfig, i18n } = useDocusaurusContext();

  useEffect(() => {
    const baseUrl = ensureTrailingSlash(siteConfig.baseUrl);
    const localeSegment = `${i18n.currentLocale}/`;
    const baseUrlAlreadyLocalized =
      removeTrailingSlash(baseUrl).toLowerCase().endsWith(`/${i18n.currentLocale}`.toLowerCase());

    const localePrefix =
      i18n.currentLocale === i18n.defaultLocale
        ? baseUrl
        : baseUrlAlreadyLocalized
          ? baseUrl
          : `${baseUrl}${localeSegment}`;
    const target = `${localePrefix}RDK${location.search}${location.hash}`;
    const normalizedPathname =
      typeof window !== "undefined" ? removeTrailingSlash(window.location.pathname) : "";
    const normalizedTargetPath = removeTrailingSlash(`${localePrefix}RDK`);

    // Use hard redirect to ensure URL path becomes /RDK on static hosting.
    if (typeof window !== "undefined" && normalizedPathname !== normalizedTargetPath) {
      window.location.replace(target);
    }
  }, [location.search, location.hash, siteConfig.baseUrl, i18n.currentLocale, i18n.defaultLocale]);

  return null;
}
