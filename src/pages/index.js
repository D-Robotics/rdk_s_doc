import React from "react";
import Head from "@docusaurus/Head";
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
 * 站点根路径静态重定向到对应语言首页：
 * - /rdk_s_doc/ -> /rdk_s_doc/RDK
 * - /rdk_s_doc/en/ -> /rdk_s_doc/en/RDK
 *
 * 使用 meta/script 在页面首屏阶段完成跳转，避免先闪现 404。
 */
export default function HomeRedirect() {
  const { siteConfig, i18n } = useDocusaurusContext();
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
  const defaultTarget = `${localePrefix}RDK`;

  return (
    <>
      <Head>
        <meta httpEquiv="refresh" content={`0; url=${defaultTarget}`} />
        <script>{`(function(){var target='${defaultTarget}';if(window.location.search||window.location.hash){target+=window.location.search+window.location.hash;}window.location.replace(target);})();`}</script>
      </Head>
      <noscript>
        <meta httpEquiv="refresh" content={`0; url=${defaultTarget}`} />
      </noscript>
    </>
  );
}
