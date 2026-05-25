import React, { useEffect, useRef } from "react";
import { useLocation } from "@docusaurus/router";

function getHighlightKeyword() {
  if (typeof window === "undefined") return "";
  const params = new URLSearchParams(window.location.search);
  return (params.get("highlight") || "").trim();
}

function highlightPage(keyword) {
  if (!keyword) return 0;

  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        if (!node.parentElement) return NodeFilter.FILTER_REJECT;
        const tag = node.parentElement.tagName.toLowerCase();
        if (["script", "style", "code", "pre", "kbd", "samp", "var"].includes(tag)) {
          return NodeFilter.FILTER_REJECT;
        }
        if (node.parentElement.classList.contains("search-highlight")) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    },
  );

  let matchCount = 0;

  while (walker.nextNode()) {
    const node = walker.currentNode;
    const text = node.textContent || "";

    if (text.toLowerCase().includes(keyword.toLowerCase())) {
      const span = document.createElement("span");
      span.innerHTML = text.replace(
        new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"),
        `<mark class="search-highlight">$&</mark>`,
      );
      matchCount++;
      node.parentNode.replaceChild(span, node);
    }
  }

  return matchCount;
}

function scrollToFirstHighlight() {
  const first = document.querySelector("mark.search-highlight");
  if (first) {
    first.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

export default function SearchHighlight() {
  const location = useLocation();
  const highlightedRef = useRef(false);

  useEffect(() => {
    highlightedRef.current = false;
  }, [location.pathname, location.search, location.hash]);

  useEffect(() => {
    const keyword = getHighlightKeyword();
    if (!keyword) return undefined;

    if (highlightedRef.current) return undefined;

    const timer = setTimeout(() => {
      const count = highlightPage(keyword);
      if (count > 0) {
        scrollToFirstHighlight();
        highlightedRef.current = true;
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [location.pathname, location.search, location.hash]);

  return null;
}