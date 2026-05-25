import React, { useEffect, useMemo, useRef, useState } from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { useDocScopeFilter } from "@site/src/context/DocScopeFilterContext";
import {
  collectPagefindBundleCandidates,
  pickReadablePagefindBundle,
  toProductFolder,
} from "@site/src/utils/pagefind-bundle";
import {
  search as tokenizedSearch,
  clearSearchCache,
} from "@site/src/components/Search/search";

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
  // 优先保留 Pagefind 原始的 <mark> 标记
  if (raw.includes("<mark")) return raw;
  // 只有当 Pagefind 没有提供标记时，才用正则重新高亮
  const re = new RegExp(escapeRegExp(q), "gi");
  return raw.replace(re, (m) => `<mark>${m}</mark>`);
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

function dropParentPathResults(items, baseUrl = "/") {
  if (!Array.isArray(items) || items.length <= 1) return items || [];
  const withPath = items.map((item) => ({
    ...item,
    _path: normalizePathnameFromUrl(item.url, baseUrl),
  }));
  const allPaths = withPath.map((x) => x._path).filter(Boolean);
  return withPath
    .filter((item) => {
      if (!item._path || item._path === "/") return true;
      return !shouldDropFlattenedCategoryPath(item._path, allPaths);
    })
    .map(({ _path, ...rest }) => rest);
}

function ensureCss(href) {
  const marker = "data-pagefind-ui-css";
  const existing = document.querySelector(`link[${marker}="true"]`);
  if (existing && existing.getAttribute("href") === href) {
    return;
  }
  if (existing) {
    existing.remove();
  }
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

    const marker = "data-pagefind-ui-script";
    const existing = document.querySelector(`script[${marker}="true"]`);
    if (existing && existing.getAttribute("src") === src && window.PagefindUI) {
      resolve();
      return;
    }
    if (existing) {
      existing.remove();
    }
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

export default function PagefindSearch({
  mode = "navbar",
  initialQuery = "",
  initialTab = "local",
}) {
  const { product, version } = useDocScopeFilter();
  const { siteConfig } = useDocusaurusContext();
  const staticBaseUrl = siteConfig.baseUrl;
  const searchPageUrl = useBaseUrl("/search");
  const containerRef = useRef(null);
  const instanceRef = useRef(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState(String(initialQuery || "").trim());
  const [localResults, setLocalResults] = useState([]);
  const [localSearchError, setLocalSearchError] = useState("");
  const [studioResults, setStudioResults] = useState([]);
  const [studioError, setStudioError] = useState("");
  const [activeResultTab, setActiveResultTab] = useState(
    initialTab === "studio" ? "studio" : "local",
  );
  const [localResultCount, setLocalResultCount] = useState(0);
  const pagefindApiRef = useRef(new Map());
  const studioPagefindApiRef = useRef(null);
  const studioDebounceRef = useRef(null);

  const bundleCandidates = useMemo(
    () => collectPagefindBundleCandidates(staticBaseUrl, product, version, { includeFallback: true }),
    [staticBaseUrl, product, version],
  );
  const [resolvedBundlePath, setResolvedBundlePath] = useState(null);
  const fallbackBundlePath = useMemo(
    () => `${String(staticBaseUrl || "/").replace(/\/$/, "")}/pagefind/`,
    [staticBaseUrl],
  );
  const studioBundlePath = useMemo(
    () => `${String(staticBaseUrl || "/").replace(/\/$/, "")}/rdk_studio_pagefind/`,
    [staticBaseUrl],
  );

  useEffect(() => {
    pagefindApiRef.current = new Map();
    // 必须同步清空模块级 search cache，否则切换产品/版本后
    // 输入相同关键词会拿到上一个 scope 的缓存命中
    clearSearchCache();
    setLocalResults([]);
    setLocalSearchError("");
  }, [bundleCandidates]);

  useEffect(() => {
    studioPagefindApiRef.current = null;
    setStudioResults([]);
    setStudioError("");
  }, [studioBundlePath]);

  useEffect(() => {
    let disposed = false;
    setError("");
    setResolvedBundlePath(null);

    async function boot() {
      if (!containerRef.current || typeof window === "undefined") {
        return;
      }

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

      if (disposed || !containerRef.current || !window.PagefindUI) {
        return;
      }
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
      const onInput = (e) => setQuery(e.target.value || "");
      const onChange = (e) => setQuery(e.target.value || "");
      const onClear = () => setQuery("");
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
    const term = (query || "").trim();
    if (studioDebounceRef.current) {
      clearTimeout(studioDebounceRef.current);
    }
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
              snippet: candidate?.excerpt || data?.excerpt || "",
            });
            if (hits.length >= 6) break;
          }
          if (hits.length >= 6) break;
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
  }, [query, staticBaseUrl, studioBundlePath]);

  useEffect(() => {
    const term = (query || "").trim();
    if (mode !== "navbar") return undefined;
    if (!resolvedBundlePath) {
      return undefined;
    }
    if (!term || term.length < 1) {
      setLocalResults([]);
      setLocalSearchError("");
      setLocalResultCount(0);
      return undefined;
    }

    let disposed = false;
    const timer = setTimeout(async () => {
      try {
        const getApiForBundle = async (bundlePath) => {
          if (!bundlePath) return null;
          const cachedApi = pagefindApiRef.current.get(bundlePath);
          if (cachedApi) return cachedApi;
          const api = await import(
            /* webpackIgnore: true */ `${bundlePath}pagefind.js`
          );
          if (api?.options) {
            await api.options({ bundlePath });
          }
          pagefindApiRef.current.set(bundlePath, api);
          return api;
        };

        const primaryApi = await getApiForBundle(resolvedBundlePath);
        let tokenizedResults = await tokenizedSearch(
          primaryApi,
          term,
          resolvedBundlePath,
        );

        const shouldTryFallback =
          (!tokenizedResults || tokenizedResults.length === 0) &&
          fallbackBundlePath &&
          fallbackBundlePath !== resolvedBundlePath;
        if (shouldTryFallback) {
          const fallbackApi = await getApiForBundle(fallbackBundlePath);
          const fallbackResults = await tokenizedSearch(
            fallbackApi,
            term,
            fallbackBundlePath,
          );
          if (fallbackResults?.length) {
            tokenizedResults = fallbackResults;
          }
        }

        if (disposed) return;
        const items = [];
        const seenKeys = new Set();
        const seenUrls = new Set();

        for (const r of tokenizedResults) {
          if (items.length >= 20) break;
          const rawUrl = r.url || "#";
          const scopedUrl = appendScopeQuery(
            rawUrl,
            { product, version, keyword: term },
            staticBaseUrl,
          );
          const dedupeKey = dedupeKeyFromUrl(scopedUrl, staticBaseUrl);
          if (!scopedUrl || scopedUrl === "#") continue;
          if (dedupeKey) {
            if (seenKeys.has(dedupeKey)) continue;
            seenKeys.add(dedupeKey);
          } else {
            if (seenUrls.has(scopedUrl)) continue;
            seenUrls.add(scopedUrl);
          }
          items.push({
            title: r.title || "搜索结果",
            url: scopedUrl,
            excerpt: highlightExactInHtml(r.excerpt || "", term),
          });
        }

        if (disposed) return;
        const filteredItems = dropParentPathResults(items, staticBaseUrl);
        setLocalResultCount(filteredItems.length);
        setLocalResults(filteredItems);
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
  }, [mode, query, resolvedBundlePath, fallbackBundlePath, product, version, staticBaseUrl]);

  useEffect(() => {
    const term = (query || "").trim();
    if (term.length < 1) {
      setLocalResultCount(0);
      setLocalResults([]);
      setLocalSearchError("");
    }
  }, [query, mode]);

  useEffect(() => {
    if (mode !== "navbar" || !containerRef.current) return;
    setQuery("");
    setLocalResults([]);
    setLocalSearchError("");
    setStudioResults([]);
    setStudioError("");
    setLocalResultCount(0);

    const root = containerRef.current;
    const input = root.querySelector("input[type='search'], .pagefind-ui__search-input");
    if (input) {
      input.value = "";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }, [product, version, mode]);

  useEffect(() => {
    if (!containerRef.current) return undefined;
    const root = containerRef.current;
    const term = String(initialQuery || "").trim();
    if (!term) return undefined;

    const applyInitialQuery = () => {
      const input = root.querySelector("input[type='search'], .pagefind-ui__search-input");
      if (!input) return false;
      if (input.value !== term) {
        input.value = term;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
      }
      setQuery(term);
      return true;
    };

    if (applyInitialQuery()) return undefined;

    const observer = new MutationObserver(() => {
      if (applyInitialQuery()) observer.disconnect();
    });
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [initialQuery, resolvedBundlePath]);

  const handleViewAllResults = () => {
    const term = (query || "").trim();
    const params = new URLSearchParams();
    if (term) params.set("q", term);
    if (activeResultTab) params.set("tab", activeResultTab);
    const suffix = params.toString() ? `?${params.toString()}` : "";
    window.location.href = `${searchPageUrl}${suffix}`;
  };

  const handleLocalResultClick = (e, url) => {
    try {
      const targetUrl = new URL(url, window.location.origin);
      const currentUrl = new URL(window.location.href);
      const isSamePage = targetUrl.pathname === currentUrl.pathname && targetUrl.search === currentUrl.search;
      if (isSamePage && targetUrl.hash) {
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
          targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
          window.history.pushState(null, "", url);
        }
      }
    } catch {
      // ignore
    }
  };

  const renderResultTabs = (inlineInPanel = false) => (
    <div
      className="pagefind-search-tabs"
      style={
        inlineInPanel
          ? {
              position: "static",
              width: "100%",
              margin: 0,
              borderRadius: "12px 12px 0 0",
              boxShadow: "none",
            }
          : undefined
      }
    >
      <button
        type="button"
        className={`pagefind-search-tab${activeResultTab === "local" ? " is-active" : ""}`}
        onClick={() => setActiveResultTab("local")}
      >
        本文档结果
      </button>
      <button
        type="button"
        className={`pagefind-search-tab${activeResultTab === "studio" ? " is-active" : ""}`}
        onClick={() => setActiveResultTab("studio")}
      >
        RDK Studio 结果
      </button>
    </div>
  );

  useEffect(() => {
    if (mode === "navbar") return undefined;
    if (!containerRef.current) return undefined;
    const root = containerRef.current;

    const updateLocalCount = () => {
      const messageEl = root.querySelector(".pagefind-ui__message");
      const messageText = String(messageEl?.textContent || "");
      const totalMatch = messageText.match(/(\d[\d,]*)/);
      if (totalMatch?.[1]) {
        const parsed = Number(totalMatch[1].replace(/,/g, ""));
        if (Number.isFinite(parsed)) {
          setLocalResultCount(parsed);
          return;
        }
      }
      const visibleCount = root.querySelectorAll(".pagefind-ui__result").length;
      setLocalResultCount(visibleCount);
    };

    updateLocalCount();
    const observer = new MutationObserver(updateLocalCount);
    observer.observe(root, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [resolvedBundlePath, query, mode]);

  useEffect(() => {
    if (mode !== "page" || !containerRef.current) return undefined;
    const root = containerRef.current;
    const wrapEl = root.parentElement;
    if (!wrapEl) return undefined;

    const forcePageLayout = () => {
      const drawer = root.querySelector(".pagefind-ui__drawer");
      if (drawer) {
        Object.assign(drawer.style, {
          position: "static",
          inset: "auto",
          top: "auto",
          right: "auto",
          width: "100%",
          maxWidth: "none",
          marginTop: "0",
          display: "block",
          overflow: "visible",
        });
      }
      const resultsArea = root.querySelector(".pagefind-ui__results-area");
      if (resultsArea) {
        Object.assign(resultsArea.style, {
          width: "100%",
          minWidth: "0",
          flex: "none",
          marginTop: "0",
        });
      }
      const filterPanel = root.querySelector(".pagefind-ui__filter-panel");
      if (filterPanel) {
        filterPanel.style.display = "none";
      }
    };

    forcePageLayout();
    const observer = new MutationObserver(forcePageLayout);
    observer.observe(wrapEl, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [mode, resolvedBundlePath, query, activeResultTab, localResultCount, studioResults.length]);

  return (
    <div
      className={`pagefind-search-wrap pagefind-mode-${mode} pagefind-results-tab-${activeResultTab}`}
    >
      {error ? <span className="pagefind-search-error">{error}</span> : null}
      <div ref={containerRef} className="pagefind-search" />
      {query.trim().length >= 1 && mode === "navbar" ? (
        <div
          style={{
            position: "fixed",
            top: "calc(var(--ifm-navbar-height, 60px) + 12px)",
            right: "16px",
            width: "min(720px, 90vw)",
            zIndex: 11010,
          }}
        >
          {renderResultTabs(true)}
        </div>
      ) : null}
      {query.trim().length >= 1 && mode !== "navbar" ? renderResultTabs(false) : null}
      {query.trim().length >= 1 ? (
        <>
          {mode === "navbar" && activeResultTab === "local" ? (
            <div
              className="navbar-local-search-block"
              style={{
                position: "fixed",
                top: "calc(var(--ifm-navbar-height, 60px) + 44px)",
                right: "16px",
                width: "min(720px, 90vw)",
                maxHeight: "min(62vh, 620px)",
                overflowY: "auto",
                zIndex: 11000,
              }}
            >
              {localSearchError ? (
                <div className="navbar-local-search-empty">{localSearchError}</div>
              ) : null}
              {!localSearchError && localResults.length === 0 ? (
                <div className="navbar-local-search-empty">未命中本文档内容</div>
              ) : null}
              {!localSearchError && localResults.length > 0 ? (
                <ul className="navbar-local-search-list">
                  {localResults.map((item, idx) => (
                    <li key={`${item.url}-${idx}`} className="navbar-local-search-item">
                      <a href={item.url} onClick={(e) => handleLocalResultClick(e, item.url)}>
                        {item.title}
                      </a>
                      {item.excerpt ? <p dangerouslySetInnerHTML={{ __html: item.excerpt }} /> : null}
                    </li>
                  ))}
                </ul>
              ) : null}
              <div className="pagefind-view-all-wrap">
                <button type="button" className="pagefind-view-all-btn" onClick={handleViewAllResults}>
                  查看所有结果
                </button>
              </div>
            </div>
          ) : null}
          {activeResultTab === "studio" ? (
            <div
              className="external-search-block"
              style={
                mode === "page"
                  ? {
                      position: "static",
                      right: "auto",
                      top: "auto",
                      width: "100%",
                      maxWidth: "none",
                      marginTop: 0,
                    }
                  : undefined
              }
            >
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
                          __html: highlightPlainText(item.title, query),
                        }}
                      />
                      <p
                        dangerouslySetInnerHTML={{
                          __html: highlightExactInHtml(item.snippet, query),
                        }}
                      />
                    </li>
                  ))}
                </ul>
              ) : null}
              {mode === "navbar" ? (
                <div className="pagefind-view-all-wrap">
                  <button type="button" className="pagefind-view-all-btn" onClick={handleViewAllResults}>
                    查看所有结果
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
