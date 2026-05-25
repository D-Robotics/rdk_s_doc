import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import debounce from "lodash/debounce";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { useDocScopeFilter } from "@site/src/context/DocScopeFilterContext";
import {
  collectPagefindBundleCandidates,
  pickReadablePagefindBundle,
  toProductFolder,
} from "@site/src/utils/pagefind-bundle";

import { search, clearSearchCache } from "./search";
import { highlight } from "./highlight";

export default function Search() {
  const { product, version } = useDocScopeFilter();
  const { siteConfig } = useDocusaurusContext();
  const staticBaseUrl = siteConfig.baseUrl;

  const pagefindApiRef = useRef(null);
  const bundlePathRef = useRef("");
  const [results, setResults] = useState([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const bundleCandidates = useMemo(
    () =>
      collectPagefindBundleCandidates(staticBaseUrl, product, version, {
        includeFallback: true,
      }),
    [staticBaseUrl, product, version],
  );

  useEffect(() => {
    let disposed = false;

    clearSearchCache();
    bundlePathRef.current = "";
    pagefindApiRef.current = null;
    setResults([]);

    async function boot() {
      const chosen = await pickReadablePagefindBundle(bundleCandidates);
      if (disposed || !chosen) return;

      try {
        const api = await import(
          /* webpackIgnore: true */ `${chosen}pagefind.js`
        );
        if (api?.options) {
          await api.options({ bundlePath: chosen });
        }
        if (!disposed) {
          pagefindApiRef.current = api;
          bundlePathRef.current = chosen;
        }
      } catch {
        // pagefind bundle not available
      }
    }

    boot();

    return () => {
      disposed = true;
    };
  }, [bundleCandidates]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const doSearch = useMemo(
    () =>
      debounce(async (value) => {
        setQuery(value);
        setOpen(!!value);

        if (!value) {
          setResults([]);
          return;
        }

        const res = await search(
          pagefindApiRef.current,
          value,
          bundlePathRef.current,
        );
        setResults(res);
      }, 150),
    [],
  );

  const buildResultHref = (rawUrl) => {
    if (!rawUrl) return "#";
    try {
      const origin =
        typeof window !== "undefined" ? window.location.origin : "http://localhost";
      const parsed = new URL(rawUrl, origin);
      const productFolder = toProductFolder(product);
      const base = (staticBaseUrl || "/").replace(/\/$/, "");
      const scopePrefix = `${base}/${productFolder}/${version}/`;
      let pathname = parsed.pathname;
      if (pathname.startsWith(scopePrefix)) {
        pathname = `${base}/${pathname.slice(scopePrefix.length)}`;
      }
      const params = new URLSearchParams(parsed.search);
      params.set("highlight", query);
      return `${pathname}${params.toString() ? `?${params.toString()}` : ""}${parsed.hash || ""}`;
    } catch {
      const sep = rawUrl.includes("?") ? "&" : "?";
      return `${rawUrl}${sep}highlight=${encodeURIComponent(query)}`;
    }
  };

  return (
    <div className="navbar-search-dropdown" ref={containerRef}>
      <input
        className="navbar-search-input"
        placeholder="全局"
        onChange={(e) => doSearch(e.target.value)}
        onFocus={(e) => {
          if (e.target.value) setOpen(true);
        }}
      />

      {open && results.length > 0 && (
        <div className="navbar-search-results">
          {results.slice(0, 10).map((r) => (
            <a
              key={r.url}
              className="navbar-search-result-item"
              href={buildResultHref(r.url)}
              onClick={() => setOpen(false)}
            >
              <div
                className="navbar-search-result-title"
                dangerouslySetInnerHTML={{
                  __html: highlight(r.title, query),
                }}
              />
              <div
                className="navbar-search-result-excerpt"
                dangerouslySetInnerHTML={{
                  __html: highlight(r.excerpt, query),
                }}
              />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}