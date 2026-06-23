import React, {useMemo} from 'react';
import clsx from 'clsx';
import {ThemeClassNames} from '@docusaurus/theme-common';
import {translate} from '@docusaurus/Translate';
import Link from '@docusaurus/Link';
import {useLocation} from '@docusaurus/router';
import {useSidebarBreadcrumbs, useDocsSidebar} from '@docusaurus/plugin-content-docs/client';
import {useHomePageRoute} from '@docusaurus/theme-common/internal';
import HomeBreadcrumbItem from '@theme/DocBreadcrumbs/Items/Home';
import DocBreadcrumbsStructuredData from '@theme/DocBreadcrumbs/StructuredData';
import {useDocScopeFilter} from '@site/src/context/DocScopeFilterContext';
import {
  buildBreadcrumbsFromProcessedSidebar,
  processSidebarForDisplay,
} from '@site/src/utils/sidebar-processing';
import styles from './styles.module.css';

function BreadcrumbsItemLink({children, href, isLast}) {
  const className = 'breadcrumbs__link';
  if (isLast) {
    return <span className={className}>{children}</span>;
  }
  return href ? (
    <Link className={className} href={href}>
      <span>{children}</span>
    </Link>
  ) : (
    <span className={className}>{children}</span>
  );
}

function BreadcrumbsItem({children, active}) {
  return (
    <li
      className={clsx('breadcrumbs__item', {
        'breadcrumbs__item--active': active,
      })}>
      {children}
    </li>
  );
}

export default function DocBreadcrumbs() {
  const rawBreadcrumbs = useSidebarBreadcrumbs();
  const docsSidebar = useDocsSidebar();
  const {version, product} = useDocScopeFilter();
  const {pathname} = useLocation();
  const homePageRoute = useHomePageRoute();

  const processedSidebarItems = useMemo(() => {
    return processSidebarForDisplay(docsSidebar?.items, version, product);
  }, [docsSidebar?.items, version, product]);

  const scopedBreadcrumbs = useMemo(() => {
    return buildBreadcrumbsFromProcessedSidebar(
      processedSidebarItems,
      pathname,
      rawBreadcrumbs,
    );
  }, [processedSidebarItems, pathname, rawBreadcrumbs]);

  if (!scopedBreadcrumbs) {
    return null;
  }

  return (
    <>
      <DocBreadcrumbsStructuredData breadcrumbs={scopedBreadcrumbs} />
      <nav
        className={clsx(
          ThemeClassNames.docs.docBreadcrumbs,
          styles.breadcrumbsContainer,
        )}
        aria-label={translate({
          id: 'theme.docs.breadcrumbs.navAriaLabel',
          message: 'Breadcrumbs',
          description: 'The ARIA label for the breadcrumbs',
        })}>
        <ul className="breadcrumbs">
          {homePageRoute && <HomeBreadcrumbItem />}
          {scopedBreadcrumbs.map((item, idx) => {
            const isLast = idx === scopedBreadcrumbs.length - 1;
            const href =
              item.type === 'category' && item.linkUnlisted
                ? undefined
                : item.href;
            return (
              <BreadcrumbsItem key={idx} active={isLast}>
                <BreadcrumbsItemLink href={href} isLast={isLast}>
                  {item.label}
                </BreadcrumbsItemLink>
              </BreadcrumbsItem>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
