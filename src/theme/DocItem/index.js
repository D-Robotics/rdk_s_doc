import React, { useEffect, useLayoutEffect, useMemo } from "react";
import { useHistory, useLocation } from "@docusaurus/router";
import { useDocsSidebar } from "@docusaurus/plugin-content-docs/client";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import useBaseUrl from "@docusaurus/useBaseUrl";
import DocItem from "@theme-original/DocItem";
import DocScopeHydration from "@site/src/components/DocScopeHydration";
import GiscusComments from "./GiscusComments";
import { useDocScopeFilter } from "@site/src/context/DocScopeFilterContext";
import { shouldShowDoc, findFirstVisibleDoc } from "@site/src/context/sidebar-scope-config";
import { isMultiInstanceDocsRoute } from "@site/src/utils/docs-route-utils";
import {
  flattenSingleChildCategories,
  findDocDisplayNumber,
  renumberVisibleItems,
  stripNumberPrefix,
} from "@site/src/utils/sidebar-numbering";

function normalizePath(path) {
  if (!path) return "";
  return String(path)
    .split("#")[0]
    .split("?")[0]
    .replace(/^https?:\/\/[^/]+/i, "")
    .replace(/\/+$/, "")
    .toLowerCase();
}

function normalizePathTail(path) {
  return normalizePath(path)
    .replace(/^\/rdk_s_doc\//, "/")
    .replace(/^\/en\//, "/");
}

function splitPathSegments(path) {
  return normalizePathTail(path).split("/").filter(Boolean);
}

function commonPrefixScore(a, b) {
  const aSegs = splitPathSegments(a);
  const bSegs = splitPathSegments(b);
  const max = Math.min(aSegs.length, bSegs.length);
  let score = 0;
  while (score < max && aSegs[score] === bSegs[score]) {
    score += 1;
  }
  return score;
}

function findClosestVisibleDoc(items, version, product, currentPathname) {
  if (!items || !Array.isArray(items)) {
    return null;
  }
  const visibleLinks = [];

  function walk(list) {
    for (const item of list) {
      if (item.type === "link" && item.docId) {
        if (shouldShowDoc(item.docId, version, product) && item.href) {
          visibleLinks.push(item.href);
        }
      }
      if (item.type === "category" && item.items) {
        walk(item.items);
      }
    }
  }

  walk(items);
  if (visibleLinks.length === 0) {
    return null;
  }

  let best = null;
  let bestScore = -1;
  for (const href of visibleLinks) {
    const score = commonPrefixScore(currentPathname, href);
    if (score > bestScore) {
      best = href;
      bestScore = score;
    }
  }

  return best || visibleLinks[0];
}

function filterItems(items, version, product) {
  if (!Array.isArray(items)) return items;
  const result = [];
  for (const item of items) {
    if (item.type === "category" && item.items) {
      const filtered = filterItems(item.items, version, product);
      if (filtered.length > 0) {
        result.push({ ...item, items: filtered });
      }
      continue;
    }
    if (shouldShowDoc(item.docId || "", version, product)) {
      result.push(item);
    }
  }
  return result;
}

export default function DocItemWrapper(props) {
  const { siteConfig, i18n } = useDocusaurusContext();
  const { version, product } = useDocScopeFilter();
  const history = useHistory();
  const location = useLocation();
  const sidebar = useDocsSidebar();
  const homeUrl = useBaseUrl("/");

  const docId = props?.content?.metadata?.id || "";

  const skipSidebarScope = isMultiInstanceDocsRoute(
    location.pathname,
    siteConfig.baseUrl,
    i18n.currentLocale,
    i18n.defaultLocale,
  );

  const visible = skipSidebarScope || shouldShowDoc(docId, version, product);
  const filteredRenumberedSidebar = useMemo(() => {
    if (!sidebar?.items || skipSidebarScope) return null;
    const filtered = filterItems(sidebar.items, version, product);
    const flattened = flattenSingleChildCategories(filtered);
    return renumberVisibleItems(flattened);
  }, [sidebar, skipSidebarScope, version, product]);
  const currentDocDisplayNumber = useMemo(() => {
    if (!filteredRenumberedSidebar) return null;
    return findDocDisplayNumber(filteredRenumberedSidebar, docId);
  }, [filteredRenumberedSidebar, docId]);
  const renumberedDocTitle = useMemo(() => {
    const rawMetaTitle = props?.content?.metadata?.title || "";
    const plain = stripNumberPrefix(rawMetaTitle).trim();
    if (!plain || !currentDocDisplayNumber) return null;
    return `${currentDocDisplayNumber} ${plain}`;
  }, [props?.content?.metadata?.title, currentDocDisplayNumber]);
  const patchedContent = useMemo(() => {
    const originalContent = props?.content;
    if (!originalContent || !renumberedDocTitle) {
      return originalContent;
    }
    const currentTitle = originalContent?.metadata?.title || "";
    if (!currentTitle || currentTitle === renumberedDocTitle) {
      return originalContent;
    }

    function WrappedContent(mdxProps) {
      return React.createElement(originalContent, mdxProps);
    }

    Object.assign(WrappedContent, originalContent, {
      metadata: {
        ...originalContent.metadata,
        title: renumberedDocTitle,
      },
    });

    return WrappedContent;
  }, [props?.content, renumberedDocTitle]);

  useEffect(() => {
    if (skipSidebarScope || visible || !sidebar?.items) {
      return;
    }
    const preferredHref =
      findClosestVisibleDoc(sidebar.items, version, product, location.pathname) ||
      findFirstVisibleDoc(sidebar.items, version, product);
    if (preferredHref) {
      const currentSearch = window.location.search;
      history.replace(preferredHref + currentSearch);
    } else {
      history.replace(`${homeUrl}${location.search}${location.hash}`);
    }
  }, [visible, history, sidebar, skipSidebarScope, homeUrl, location.pathname, location.search, location.hash, version, product]);

  useLayoutEffect(() => {
    if (!visible || skipSidebarScope || !currentDocDisplayNumber) {
      return;
    }
    const root =
      typeof document !== "undefined"
        ? document.querySelector(".theme-doc-markdown") ||
          document.querySelector("article.markdown") ||
          document.querySelector("article")
        : null;
    const h1 = root?.querySelector("h1");
    if (!h1) return;

    const rawTitle = (h1.textContent || "").trim();
    if (!rawTitle) return;
    const plainTitle = stripNumberPrefix(rawTitle).trim();
    if (!plainTitle) return;

    const nextTitle = `${currentDocDisplayNumber} ${plainTitle}`;
    if (rawTitle !== nextTitle) {
      h1.textContent = nextTitle;
    }
  }, [visible, skipSidebarScope, currentDocDisplayNumber, docId]);

  if (!visible) {
    return null;
  }

  return (
    <>
      <DocScopeHydration />
      <DocItem {...props} content={patchedContent || props.content} />
      <GiscusComments />
    </>
  );
}
