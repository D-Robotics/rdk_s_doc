import React, {useEffect, useMemo} from 'react';
import {translate} from '@docusaurus/Translate';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {PageMetadata} from '@docusaurus/theme-common';
import Layout from '@theme/Layout';
import NotFoundContent from '@theme/NotFound/Content';

/**
 * Static hosts serve the default-locale 404.html for every missing path.
 * Missing /en/ URLs are sent to the English build's 404.html so the navbar,
 * footer, and copy are English.
 */
function getLocaleRedirects(baseUrl, locales) {
  return locales.map((locale) => ({
    prefix: `${baseUrl}${locale}/`,
    target: `${baseUrl}${locale}/404.html`,
  }));
}

function findRedirectTarget(pathname, redirects) {
  for (const {prefix, target} of redirects) {
    if (pathname.startsWith(prefix) && !pathname.startsWith(target)) {
      return target;
    }
  }
  return null;
}

function createRedirectScript(redirects) {
  return `(function () {
  try {
    var redirects = ${JSON.stringify(redirects)};
    for (var i = 0; i < redirects.length; i += 1) {
      var pathname = window.location.pathname;
      if (pathname.indexOf(redirects[i].prefix) === 0 && pathname.indexOf(redirects[i].target) !== 0) {
        window.location.replace(redirects[i].target);
        return;
      }
    }
  } catch (error) {}
})();`;
}

export default function NotFound() {
  const {i18n, siteConfig} = useDocusaurusContext();
  const {baseUrl} = siteConfig;
  const {currentLocale, defaultLocale, locales} = i18n;

  const redirects = useMemo(() => {
    if (currentLocale !== defaultLocale) {
      return [];
    }
    return getLocaleRedirects(
      baseUrl,
      locales.filter((locale) => locale !== defaultLocale),
    );
  }, [baseUrl, currentLocale, defaultLocale, locales]);

  useEffect(() => {
    if (redirects.length === 0) {
      return;
    }
    const target = findRedirectTarget(window.location.pathname, redirects);
    if (target) {
      window.location.replace(target);
    }
  }, [redirects]);

  const title = translate({
    id: 'theme.NotFound.title',
    message: '找不到页面',
    description: 'The title of the 404 page',
  });

  return (
    <>
      {redirects.length > 0 && (
        <script
          dangerouslySetInnerHTML={{__html: createRedirectScript(redirects)}}
        />
      )}
      <PageMetadata title={title} />
      <Layout>
        <NotFoundContent />
      </Layout>
    </>
  );
}
