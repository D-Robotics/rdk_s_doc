import React, { useEffect, useMemo, useRef, useState } from "react";
import Layout from "@theme/Layout";
import { useLocation } from "@docusaurus/router";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { useDocScopeFilter } from "@site/src/context/DocScopeFilterContext";
import {
  collectPagefindBundleCandidates,
  pickReadablePagefindBundle,
  toProductFolder,
} from "@site/src/utils/pagefind-bundle";

function appendScopeQuery(url, { product, version, keyword }, baseUrl = "/") {
  if (!url || !product || !version) return url;
  try {
    const parsed = new URL(url, window.location.origin);
    if (parsed.origin !== window.location.origin) {
      return url;
    }
    const productFolder = toProductFolder(product);
    const base = (baseUrl || "/").replace(/\/$/, "");
    const scopePrefix = `${base}/${productFolder}/${version}/`;
    let pathname = parsed.pathname;
    if (pathname.startsWith(scopePrefix)) {
      pathname = base + "/" + pathname.slice(scopePrefix.length);
    }
    parsed.searchParams.set("v", version);
    parsed.searchParams.set("p", product);
    if (keyword && keyword.trim()) {
      parsed.searchParams.set("q", keyword.trim());
    }
    return pathname + parsed.search + parsed.hash;
  } catch {
    return url;
  }
}

function withBaseUrl(url, baseUrl = "/") {
  const raw = String(url || "").trim();
  if (!raw) return "#";
  const studioOrigin = "https://developer.d-robotics.cc";
  const studioPrefix = "/rdk_studio_doc";
  const normalizeStudioPath = (path) => {
    let p = String(path || "");
    p = p.replace(/\/{2,}/g, "/");
    p = p.replace(/\/index\.html$/i, "/");
    if (p === studioPrefix) return p;
    // remove trailing slash for non-root studio paths
    p = p.replace(/\/+$/g, "");
    return p;
  };
  if (/^https?:\/\//i.test(raw)) {
    try {
      const u = new URL(raw);
      if (u.origin === studioOrigin) {
        u.pathname = normalizeStudioPath(u.pathname);
        return u.toString();
      }
      return raw;
    } catch {
      return raw;
    }
  }
  const basePath = `/${String(baseUrl || "/").replace(/^\/|\/$/g, "")}`;
  let normalized = raw.startsWith("/") ? raw : `/${raw}`;
  if (basePath !== "/" && normalized.startsWith(`${basePath}/`)) {
    normalized = normalized.slice(basePath.length);
  }
  if (!(normalized === studioPrefix || normalized.startsWith(`${studioPrefix}/`))) {
    normalized = `${studioPrefix}${normalized}`;
  }
  normalized = normalizeStudioPath(normalized);
  return `${studioOrigin}${normalized}`;
}

function normalizePathnameFromUrl(url, baseUrl = "/") {
  if (!url || url === "#") return "";
  try {
    const parsed = new URL(url, window.location.origin);
    const base = `/${String(baseUrl || "/").replace(/^\/|\/$/g, "")}`;
    let pathname = parsed.pathname;
    if (base !== "/" && pathname.startsWith(base)) {
      pathname = pathname.slice(base.length) || "/";
    }
    return pathname.replace(/\/+$/, "") || "/";
  } catch {
    return "";
  }
}

function dedupeKeyFromUrl(url, baseUrl = "/") {
  if (!url || url === "#") return "";
  try {
    const parsed = new URL(url, window.location.origin);
    const pathname = normalizePathnameFromUrl(url, baseUrl);
    const hash = parsed.hash || "";
    if (!hash) return "";
    return `${pathname}${hash}`;
  } catch {
    return "";
  }
}

function containsIncrementalSubstring(candidate, term) {
  const normalize = (v) =>
    String(v || "")
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, "")
      .toLowerCase();
  const normalizePlain = (v) =>
    String(v || "")
      .replace(/\s+/g, "")
      .toLowerCase();
  const markedParts = (v) => {
    const text = String(v || "");
    const out = [];
    const re = /<mark[^>]*>(.*?)<\/mark>/gi;
    let m;
    while ((m = re.exec(text))) {
      const seg = normalizePlain(m[1]);
      if (seg) out.push(seg);
    }
    return out;
  };
  const q = normalizePlain(term);
  if (!q) return true;
  const title = normalizePlain(candidate?.title);
  const excerpt = normalizePlain(candidate?.excerpt);
  if (excerpt.includes(q) || title.includes(q)) {
    return true;
  }

  // Pagefind may split Chinese query into multiple mark segments (e.g. 配置 + 向导).
  // If those highlighted parts join to the query in order, treat it as a valid hit.
  const markedJoined = [...markedParts(candidate?.title), ...markedParts(candidate?.excerpt)].join("");
  if (markedJoined && markedJoined.includes(q)) {
    return true;
  }
  // Pagefind excerpt may truncate phrase hits and only keep partial marked tokens.
  // If marked tokens are a meaningful subset of the query, keep this candidate.
  if (markedJoined && q.includes(markedJoined)) {
    return true;
  }
  return false;
}

function resultGroupContainsQuery(data, subResults, term) {
  const normalize = (v) =>
    String(v || "")
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, "")
      .toLowerCase();
  const q = normalize(term);
  if (!q) return true;
  const parts = [
    data?.meta?.title,
    data?.title,
    data?.excerpt,
    ...(Array.isArray(subResults)
      ? subResults.flatMap((x) => [x?.title, x?.excerpt])
      : []),
  ];
  const all = normalize(parts.join(""));
  return all.includes(q);
}

function escapeRegExp(source) {
  return String(source || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeHtml(source) {
  return String(source || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function highlightPlainText(text, term) {
  const raw = String(text || "");
  const q = String(term || "").trim();
  if (!q) return escapeHtml(raw);
  const re = new RegExp(`(${escapeRegExp(q)})`, "gi");
  return raw
    .split(re)
    .map((part, idx) => (idx % 2 === 1 ? `<mark>${escapeHtml(part)}</mark>` : escapeHtml(part)))
    .join("");
}

function highlightExactInHtml(html, term) {
  const q = String(term || "").trim();
  const raw = String(html || "");
  if (!q) return raw;
  const withoutMarks = raw.replace(/<\/?mark[^>]*>/gi, "");
  const re = new RegExp(escapeRegExp(q), "gi");
  return withoutMarks.replace(re, (m) => `<mark>${m}</mark>`);
}

function hideDuplicateResultRows(root, baseUrl = "/", term = "") {
  if (!root) return;
  const q = String(term || "").trim().toLowerCase();
  const links = Array.from(root.querySelectorAll(".pagefind-ui__result-link"));
  const seen = new Set();
  for (const link of links) {
    const href = link.getAttribute("href") || "";
    const keyByAnchor = dedupeKeyFromUrl(href, baseUrl);
    const keyByTitle = `${normalizePathnameFromUrl(href, baseUrl)}|${String(
      link.textContent || "",
    )
      .trim()
      .toLowerCase()}`;
    const key = keyByAnchor || keyByTitle;
    const row =
      link.closest(".pagefind-ui__result-sub-result") ||
      link.closest(".pagefind-ui__result-nested") ||
      link.closest("[class*='subresult']") ||
      link.closest("[class*='sub-result']") ||
      link.closest(".pagefind-ui__result-nested") ||
      link.closest(".pagefind-ui__result");
    if (!row) continue;
    if (q) {
      const rowText = String(row.textContent || "").toLowerCase();
      if (!rowText.includes(q)) {
        row.style.display = "none";
        continue;
      }
    }
    if (seen.has(key)) {
      row.style.display = "none";
      continue;
    }
    seen.add(key);
    if (row.style.display === "none") {
      row.style.display = "";
    }
  }
}

function shouldDropFlattenedCategoryPath(path, allPaths) {
  const segs = path.split("/").filter(Boolean);
  if (segs.length !== 1) return false;
  const slug = segs[0];
  return allPaths.some((otherPath) => {
    if (!otherPath || otherPath === path) return false;
    const otherSegs = otherPath.split("/").filter(Boolean);
    const idx = otherSegs.indexOf(slug);
    return idx > 0 && idx < otherSegs.length - 1;
  });
}

function hideParentPathResults(root, baseUrl = "/") {
  if (!root) return;
  const resultEls = Array.from(root.querySelectorAll(".pagefind-ui__result"));
  const entries = resultEls
    .map((el) => {
      const link = el.querySelector(".pagefind-ui__result-link");
      const href = link?.getAttribute("href") || "";
      return { el, path: normalizePathnameFromUrl(href, baseUrl) };
    })
    .filter((entry) => entry.path);
  const allPaths = entries.map((x) => x.path);

  for (const { el, path } of entries) {
    el.style.display = shouldDropFlattenedCategoryPath(path, allPaths) ? "none" : "";
  }
}

function ensureCss(href) {
  const marker = "data-pagefind-ui-css-search-page";
  const existing = document.querySelector(`link[${marker}="true"]`);
  if (existing && existing.getAttribute("href") === href) return;
  if (existing) existing.remove();
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.setAttribute(marker, "true");
  document.head.appendChild(link);
}

function loadPagefindUiScript(src) {
  return new Promise(async (resolve, reject) => {
    try {
      const resp = await fetch(src, { method: "GET", credentials: "same-origin" });
      if (!resp.ok) {
        reject(new Error(`Pagefind UI not found (${resp.status}): ${src}`));
        return;
      }
      const contentType = (resp.headers.get("content-type") || "").toLowerCase();
      const body = await resp.text();
      const looksLikeHtml =
        contentType.includes("text/html") ||
        /^\s*</.test(body.slice(0, 50));
      if (looksLikeHtml) {
        reject(
          new Error(
            `Invalid Pagefind JS response (received HTML). Check index path: ${src}`,
          ),
        );
        return;
      }
    } catch (e) {
      reject(
        new Error(
          e?.message
            ? `Pagefind UI precheck failed: ${e.message}`
            : "Pagefind UI precheck failed",
        ),
      );
      return;
    }

    const marker = "data-pagefind-ui-script-search-page";
    const existing = document.querySelector(`script[${marker}="true"]`);
    if (existing && existing.getAttribute("src") === src && window.PagefindUI) {
      resolve();
      return;
    }
    if (existing) existing.remove();
    window.PagefindUI = undefined;
    const script = document.createElement("script");
    script.src = src;
    script.defer = true;
    script.setAttribute(marker, "true");
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error(`Failed to load Pagefind UI script: ${src}`));
    document.head.appendChild(script);
  });
}

function useSearchParams() {
  const location = useLocation();
  const params = new URLSearchParams(location.search || "");
  return {
    query: params.get("q") || "",
    tab: params.get("tab") === "studio" ? "studio" : "local",
  };
}

// Temporarily disabled: legacy Pagefind full-page search implementation.
// Kept in place for quick rollback if Algolia is removed.
function SearchPagePagefindDisabled() {
  const { query, tab } = useSearchParams();
  const { product, version } = useDocScopeFilter();
  const { siteConfig } = useDocusaurusContext();
  const staticBaseUrl = siteConfig.baseUrl;
  const standaloneRef = useRef(null);
  const containerRef = useRef(null);
  const localResultsHostRef = useRef(null);
  const instanceRef = useRef(null);
  const pagefindApiRef = useRef(null);
  const studioPagefindApiRef = useRef(null);
  const studioDebounceRef = useRef(null);

  const [error, setError] = useState("");
  const [q, setQ] = useState(String(query || "").trim());
  const [activeTab, setActiveTab] = useState(tab === "studio" ? "studio" : "local");
  const [localResultCount, setLocalResultCount] = useState(0);
  const [localResults, setLocalResults] = useState([]);
  const [localSearchError, setLocalSearchError] = useState("");
  const [studioResults, setStudioResults] = useState([]);
  const [studioError, setStudioError] = useState("");

  const bundleCandidates = useMemo(
    () => collectPagefindBundleCandidates(staticBaseUrl, product, version, { includeFallback: false }),
    [staticBaseUrl, product, version],
  );
  const studioBundlePath = useMemo(
    () => `${String(staticBaseUrl || "/").replace(/\/$/, "")}/rdk_studio_pagefind/`,
    [staticBaseUrl],
  );
  const [resolvedBundlePath, setResolvedBundlePath] = useState(null);

  useEffect(() => {
    let disposed = false;
    if (!containerRef.current || typeof window === "undefined") return undefined;
    setError("");
    setResolvedBundlePath(null);

    async function boot() {
      if (!containerRef.current) return;

      if (instanceRef.current?.destroy) {
        instanceRef.current.destroy();
        instanceRef.current = null;
      }
      containerRef.current.innerHTML = "";

      let chosen;
      try {
        chosen = await pickReadablePagefindBundle(bundleCandidates);
      } catch {
        chosen = null;
      }
      if (disposed) return;

      if (!chosen) {
        setError(
          "未找到当前产品/版本的 Pagefind 索引。请执行 npm run prepare-pagefind-dev 或 npm run build:pagefind:matrix。",
        );
        return;
      }

      setResolvedBundlePath(chosen);

      const scriptSrc = `${chosen}pagefind-ui.js`;
      const cssHref = `${chosen}pagefind-ui.css`;
      ensureCss(cssHref);

      try {
        await loadPagefindUiScript(scriptSrc);
      } catch (e) {
        if (!disposed) {
          setError(e.message || "Pagefind init failed");
          setResolvedBundlePath(null);
        }
        return;
      }

      if (disposed || !containerRef.current || !window.PagefindUI) return;
      instanceRef.current = new window.PagefindUI({
        element: containerRef.current,
        bundlePath: chosen,
        showSubResults: true,
        resetStyles: false,
        translations: {
          placeholder: "搜索",
        },
      });
    }

    boot();

    return () => {
      disposed = true;
      if (studioDebounceRef.current) {
        clearTimeout(studioDebounceRef.current);
        studioDebounceRef.current = null;
      }
      if (instanceRef.current?.destroy) {
        instanceRef.current.destroy();
        instanceRef.current = null;
      }
    };
  }, [bundleCandidates]);

  useEffect(() => {
    if (!containerRef.current) return undefined;
    const root = containerRef.current;
    const bind = () => {
      const input = root.querySelector("input[type='search'], .pagefind-ui__search-input");
      const clearBtn = root.querySelector(".pagefind-ui__search-clear");
      if (!input) return false;
      const onInput = (e) => setQ(e.target.value || "");
      const onChange = (e) => setQ(e.target.value || "");
      const onClear = () => setQ("");
      input.addEventListener("input", onInput);
      input.addEventListener("change", onChange);
      if (clearBtn) clearBtn.addEventListener("click", onClear);
      return () => {
        input.removeEventListener("input", onInput);
        input.removeEventListener("change", onChange);
        if (clearBtn) clearBtn.removeEventListener("click", onClear);
      };
    };

    let unbind = bind();
    if (unbind) return unbind;
    const observer = new MutationObserver(() => {
      if (unbind) return;
      unbind = bind();
      if (unbind) observer.disconnect();
    });
    observer.observe(root, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      if (unbind) unbind();
    };
  }, [bundleCandidates]);

  useEffect(() => {
    if (!containerRef.current) return undefined;
    const root = containerRef.current;
    const term = String(query || "").trim();
    if (!term) return undefined;

    const applyInitialQuery = () => {
      const input = root.querySelector("input[type='search'], .pagefind-ui__search-input");
      if (!input) return false;
      if (input.value !== term) {
        input.value = term;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
      }
      setQ(term);
      return true;
    };

    if (applyInitialQuery()) return undefined;
    const observer = new MutationObserver(() => {
      if (applyInitialQuery()) observer.disconnect();
    });
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [query, resolvedBundlePath]);

  useEffect(() => {
    if (!containerRef.current || !localResultsHostRef.current) return undefined;
    const root = containerRef.current;
    const host = localResultsHostRef.current;

    const moveDrawerAfterTabs = () => {
      const drawer = root.querySelector(".pagefind-ui__drawer");
      if (drawer && drawer.parentElement !== host) {
        host.appendChild(drawer);
      }
      if (drawer) {
        drawer.style.display = "none";
      }
    };

    moveDrawerAfterTabs();
    const observer = new MutationObserver(moveDrawerAfterTabs);
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [resolvedBundlePath, q, activeTab]);

  useEffect(() => {
    pagefindApiRef.current = null;
    setLocalResults([]);
    setLocalResultCount(0);
    setLocalSearchError("");
  }, [resolvedBundlePath]);

  useEffect(() => {
    studioPagefindApiRef.current = null;
    setStudioResults([]);
    setStudioError("");
  }, [studioBundlePath]);

  useEffect(() => {
    const term = (q || "").trim();
    if (!resolvedBundlePath || !term || term.length < 1) {
      setLocalResults([]);
      setLocalResultCount(0);
      setLocalSearchError("");
      return undefined;
    }

    let disposed = false;
    const timer = setTimeout(async () => {
      try {
        if (!pagefindApiRef.current) {
          pagefindApiRef.current = await import(
            /* webpackIgnore: true */ `${resolvedBundlePath}pagefind.js`
          );
          if (pagefindApiRef.current?.options) {
            await pagefindApiRef.current.options({ bundlePath: resolvedBundlePath });
          }
        }

        const response = await pagefindApiRef.current.search(term);
        if (disposed) return;
        const items = [];
        const seenKeys = new Set();
        const seenUrls = new Set();

        const tryAppendCandidate = (candidate, data, forcePass = false) => {
          if (!forcePass && !containsIncrementalSubstring(candidate, term)) {
            return false;
          }
          const scopedUrl = appendScopeQuery(
            candidate?.url || "#",
            { product, version, keyword: term },
            staticBaseUrl,
          );
          if (!scopedUrl || scopedUrl === "#") return false;
          const key = dedupeKeyFromUrl(scopedUrl, staticBaseUrl);
          if (key) {
            if (seenKeys.has(key)) return false;
            seenKeys.add(key);
          } else {
            if (seenUrls.has(scopedUrl)) return false;
            seenUrls.add(scopedUrl);
          }
          items.push({
            title:
              candidate?.title ||
              data?.meta?.title ||
              data?.title ||
              data?.url ||
              "搜索结果",
            url: scopedUrl,
            excerpt: highlightExactInHtml(candidate?.excerpt || data?.excerpt || "", term),
          });
          return true;
        };

        for (const result of response?.results || []) {
          const data = await result.data();
          const subResults =
            typeof result.subResults === "function" ? result.subResults() || [] : [];
          const groupMatched = resultGroupContainsQuery(data, subResults, term);
          const candidates =
            subResults.length > 0
              ? subResults
              : [
                  {
                    url: data?.url || "#",
                    title: data?.meta?.title || data?.title || data?.url || "搜索结果",
                    excerpt: data?.excerpt || "",
                  },
                ];

          let appendedCount = 0;
          for (const candidate of candidates) {
            if (tryAppendCandidate(candidate, data, false)) {
              appendedCount += 1;
            }
          }

          // 子结果都被过滤时，回退父结果，避免命中词仅存在于父摘要时被误丢弃
          if (subResults.length > 0 && appendedCount === 0 && groupMatched) {
            tryAppendCandidate(
              {
                url: data?.url || "#",
                title: data?.meta?.title || data?.title || data?.url || "搜索结果",
                excerpt: data?.excerpt || "",
              },
              data,
              true,
            );
          }
        }

        if (disposed) return;
        setLocalResults(items);
        setLocalResultCount(items.length);
        setLocalSearchError("");
      } catch (e) {
        if (disposed) return;
        setLocalResults([]);
        setLocalResultCount(0);
        setLocalSearchError(e?.message || "本文档搜索暂不可用");
      }
    }, 80);

    return () => {
      disposed = true;
      clearTimeout(timer);
    };
  }, [q, resolvedBundlePath, product, version, staticBaseUrl]);

  useEffect(() => {
    // Drawer 可能被移到 standalone 下的 host，必须用整块区域监听，不能只挂 containerRef
    const shell = standaloneRef.current;
    if (!shell) return undefined;

    const patchLink = (link) => {
      if (!link) return;
      const hrefAttr = link.getAttribute("href");
      if (!hrefAttr) return;
      if (!link.dataset.sfOrigHref) {
        link.dataset.sfOrigHref = hrefAttr;
      }
      const patched = appendScopeQuery(
        link.dataset.sfOrigHref,
        { product, version, keyword: q },
        staticBaseUrl,
      );
      if (patched != null && patched !== "") {
        link.setAttribute("href", patched);
      }
    };

    const patchAllLinks = () => {
      shell.querySelectorAll(".pagefind-ui__result-link").forEach(patchLink);
      hideDuplicateResultRows(shell, staticBaseUrl, q);
      hideParentPathResults(shell, staticBaseUrl);
    };

    const handleClick = (e) => {
      const link = e.target.closest(".pagefind-ui__result-link");
      if (!link || !shell.contains(link)) return;
      patchLink(link);
      const href = link.getAttribute("href");
      if (!href) return;
      try {
        const targetUrl = new URL(href, window.location.origin);
        const currentUrl = new URL(window.location.href);
        const isSamePage =
          targetUrl.pathname === currentUrl.pathname && targetUrl.search === currentUrl.search;
        if (!isSamePage || !targetUrl.hash) return;
        const hash = decodeURIComponent(targetUrl.hash.slice(1));
        const escapedHash =
          typeof CSS !== "undefined" && typeof CSS.escape === "function"
            ? CSS.escape(hash)
            : hash.replace(/"/g, '\\"');
        const targetEl =
          document.getElementById(hash) ||
          document.getElementById(targetUrl.hash.slice(1)) ||
          document.querySelector(`[name="${escapedHash}"]`);
        if (targetEl) {
          e.preventDefault();
          e.stopPropagation();
          targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
          window.history.pushState(null, "", href);
        }
      } catch {
        // ignore
      }
    };

    shell.addEventListener("click", handleClick, true);
    patchAllLinks();

    const observer = new MutationObserver(patchAllLinks);
    observer.observe(shell, { childList: true, subtree: true });

    return () => {
      shell.removeEventListener("click", handleClick, true);
      observer.disconnect();
    };
  }, [bundleCandidates, q, product, version, staticBaseUrl]);

  useEffect(() => {
    const term = (q || "").trim();
    if (studioDebounceRef.current) clearTimeout(studioDebounceRef.current);
    if (!term || term.length < 1) {
      setStudioResults([]);
      setStudioError("");
      return undefined;
    }

    studioDebounceRef.current = setTimeout(async () => {
      try {
        if (!studioPagefindApiRef.current) {
          const src = `${studioBundlePath}pagefind.js`;
          const resp = await fetch(src, {
            credentials: "same-origin",
          });
          if (!resp.ok) {
            throw new Error(
              `RDK Studio pagefind not available (${resp.status}). Run: npm run build:rdk-studio-index`,
            );
          }
          studioPagefindApiRef.current = await import(
            /* webpackIgnore: true */ `${studioBundlePath}pagefind.js`
          );
          if (studioPagefindApiRef.current?.options) {
            await studioPagefindApiRef.current.options({ bundlePath: studioBundlePath });
          }
        }
        const response = await studioPagefindApiRef.current.search(term);
        const hits = [];
        for (const result of response?.results || []) {
          const data = await result.data();
          const parentTitle = String(
            data?.meta?.title || data?.title || data?.url || "RDK Studio",
          ).trim();
          const subResults =
            typeof result.subResults === "function" ? result.subResults() || [] : [];
          const candidates =
            subResults.length > 0
              ? subResults
              : [
                  {
                    url: data?.url || "#",
                    title: parentTitle,
                    excerpt: data?.excerpt || "",
                  },
                ];
          for (const candidate of candidates) {
            hits.push({
              title: String(candidate?.title || parentTitle || "RDK Studio").trim(),
              url: withBaseUrl(candidate?.url || data?.url || "#", staticBaseUrl),
              snippet: candidate?.excerpt || data?.excerpt || parentTitle,
            });
            if (hits.length >= 12) break;
          }
          if (hits.length >= 12) break;
        }
        setStudioResults(hits);
        setStudioError("");
      } catch (e) {
        setStudioResults([]);
        setStudioError(
          e?.message ||
            "RDK Studio pagefind is unavailable. Run: npm run build:rdk-studio-index",
        );
      }
    }, 250);

    return () => {
      if (studioDebounceRef.current) {
        clearTimeout(studioDebounceRef.current);
        studioDebounceRef.current = null;
      }
    };
  }, [q, staticBaseUrl, studioBundlePath]);

  return (
    <Layout title="搜索结果" description="查看所有搜索结果">
      <main className="container margin-vert--lg pagefind-search-page">
        <div
          ref={standaloneRef}
          className={`pagefind-search-standalone pagefind-results-tab-${activeTab}`}
        >
          {error ? <span className="pagefind-search-error">{error}</span> : null}
          <div ref={containerRef} className="pagefind-search" />
          {q.trim().length >= 1 ? (
            <div className="pagefind-search-tabs">
              <button
                type="button"
                className={`pagefind-search-tab${activeTab === "local" ? " is-active" : ""}`}
                onClick={() => setActiveTab("local")}
              >
                本文档结果
              </button>
              <button
                type="button"
                className={`pagefind-search-tab${activeTab === "studio" ? " is-active" : ""}`}
                onClick={() => setActiveTab("studio")}
              >
                RDK Studio 结果
              </button>
            </div>
          ) : null}
          <div ref={localResultsHostRef} className="local-search-results-host">
            {q.trim().length >= 1 && activeTab === "local" ? (
              <div className="local-search-results-block">
                {localSearchError ? (
                  <div className="external-search-error">{localSearchError}</div>
                ) : null}
                {!localSearchError && localResults.length === 0 ? (
                  <div className="external-search-empty">未命中本文档内容</div>
                ) : null}
                {!localSearchError && localResults.length > 0 ? (
                  <ul className="external-search-list">
                    {localResults.map((item, idx) => (
                      <li key={`${item.url}-${idx}`} className="external-search-item">
                        <a href={item.url}>{item.title}</a>
                        {item.excerpt ? (
                          <p dangerouslySetInnerHTML={{ __html: item.excerpt }} />
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}
          </div>
          {q.trim().length >= 1 && activeTab === "studio" ? (
            <div className="external-search-block">
              <div className="external-search-title">RDK Studio 相关结果</div>
              {studioError ? <div className="external-search-error">{studioError}</div> : null}
              {!studioError && studioResults.length === 0 ? (
                <div className="external-search-empty">未命中 RDK Studio 内容</div>
              ) : null}
              {!studioError && studioResults.length > 0 ? (
                <ul className="external-search-list">
                  {studioResults.map((item, idx) => (
                    <li key={`${item.url}-${idx}`} className="external-search-item">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        dangerouslySetInnerHTML={{
                          __html: highlightPlainText(item.title, q),
                        }}
                      />
                      <p
                        dangerouslySetInnerHTML={{
                          __html: highlightExactInHtml(item.snippet, q),
                        }}
                      />
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </div>
      </main>
    </Layout>
  );
}

function SearchPageAlgoliaDisabledNotice() {
  return (
    <Layout title="搜索" description="Algolia 搜索入口">
      <main className="container margin-vert--lg pagefind-search-page">
        <div className="external-search-block" style={{ position: "static", width: "100%" }}>
          <div className="external-search-title">已切换为 Algolia 搜索</div>
          <div className="external-search-empty">
            请使用顶部搜索框进行搜索（旧的 /search Pagefind 页面已临时停用，代码保留在本文件中）。
          </div>
        </div>
      </main>
    </Layout>
  );
}

export default SearchPagePagefindDisabled;
