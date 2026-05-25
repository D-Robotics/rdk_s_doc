import React from 'react';
import { useLocation } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import DocScopeSelectors from '@site/src/components/DocScopeSelectors';

/** pathname 去掉 baseUrl 后的部分，如 /、/en、/RDK、/en/RDK */
function pathAfterBaseUrl(pathname, baseUrl) {
  const base = (baseUrl || '/').replace(/\/$/, '');
  let p = (pathname || '/').replace(/\/$/, '');
  if (!p) p = '/';
  if (base && p.startsWith(base)) {
    p = p.slice(base.length);
  }
  if (!p || p === '/') {
    return '/';
  }
  return p.startsWith('/') ? p : `/${p}`;
}

export default function NavbarItemCustomDocScopeSelectors() {
  const location = useLocation();
  const { siteConfig } = useDocusaurusContext();
  const rest = pathAfterBaseUrl(location.pathname, siteConfig.baseUrl);
  const isHomePage = rest === '/' || rest === '/en';

  if (isHomePage) {
    return null;
  }
  
  return (
    <div className="navbar__item">
      <DocScopeSelectors />
    </div>
  );
}