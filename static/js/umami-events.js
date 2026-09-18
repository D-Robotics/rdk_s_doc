// 站内自定义事件埋点：search / nav-click / cross-product / outbound / search-miss
// 统一事件委托，不改动文档内容。各站 static/ 各放一份，经 docusaurus.config.js scripts 引入。
// search-miss 覆盖四种空结果 UI，全部走「文本匹配 + 弹层/全页独立去重」，不依赖 swizzle：
//   Algolia DocSearch      弹层 .DocSearch-NoResults；全页 <p>「未找到任何结果 / No results were found」
//   docusaurus-search-local 弹层 EmptyTemplate 文案（无稳定类名）；全页 <p>「没有找到任何文档 / No documents were found」
// 注：easyops 的 SearchBar 组件无 getSwizzleConfig，eject 后相对 import 无法解析（构建失败），故不做 swizzle。
(function () {
  "use strict";

  var INTERNAL_DOMAIN = "developer.d-robotics.cc";

  // 空结果文案表：zh 走包内翻译 / Algolia 内置，en 走各仓 i18n/en/code.json 覆盖。
  var MODAL_MISS_TEXTS = ["没有找到任何文档", "No results"]; // 弹层（easyops）
  var PAGE_MISS_TEXTS = [
    "未找到任何结果", "No results were found",      // 全页 · Algolia
    "没有找到任何文档", "No documents were found", // 全页 · easyops
  ];

  function track(name, data) {
    if (typeof window.umami !== "undefined" && typeof window.umami.track === "function") {
      window.umami.track(name, data);
    }
  }

  // 产品 baseUrl 前缀（跨产品跳转判断用）。新增产品线在此补一行。
  var PRODUCTS = [
    { key: "rdk_s", path: "rdk_s_doc" },
    { key: "rdk_x", path: "rdk_x_doc" },
    { key: "doc_center", path: "rdk_doc_center" },
    { key: "model_zoo", path: "model_zoo_doc" },
    { key: "tros", path: "tros_doc" },
    { key: "xburn", path: "xburn_doc" },
    { key: "magicbox", path: "magicbox_doc" },
    { key: "rdk_studio", path: "rdk_studio_doc" },
    { key: "robogo", path: "robogo_doc" },
    { key: "accessories_audio_kit", path: "accessories_audio_kit_doc" },
  ];

  function productOf(pathname) {
    var pn = pathname || "";
    // 无尾斜杠的根路径（/rdk_x_doc）先补成 /rdk_x_doc/，否则前缀匹配会漏报
    if (pn !== "/" && pn.charAt(pn.length - 1) !== "/") pn += "/";
    for (var i = 0; i < PRODUCTS.length; i++) {
      var prefix = "/" + PRODUCTS[i].path + "/";
      if (pn === prefix || pn.indexOf(prefix) === 0) {
        return PRODUCTS[i];
      }
    }
    return null;
  }

  function productOfHref(href) {
    return productOf(href.replace(/^https?:\/\/[^/]+/i, "")); // 去域名只留路径
  }

  // 站外链接：绝对 URL 且域名非本站（developer.d-robotics.cc 及其子域）。
  // 相对路径 / 锚点 / 非 http(s)（mailto:/tel:/javascript:）不算；图床 <img> 非 <a>、天然不触发。
  function outboundHost(href) {
    if (!/^https?:\/\//i.test(href)) return null;
    var host;
    try { host = new URL(href).hostname; } catch (err) { return null; }
    if (!host) return null;
    if (host === INTERNAL_DOMAIN || host.endsWith("." + INTERNAL_DOMAIN)) return null;
    return host;
  }

  // 1) search：搜索框即输即搜、无 submit，debounce 后只上报稳态词。
  // - 本地搜索（docusaurus-search-local）输入框：input.navbar__search-input
  // - Algolia DocSearch 弹层输入框：.DocSearch-Input
  // 门户首页搜索框是 role="searchbox"（跨站意图），同样报 search、带 scope:"portal"。
  function bindSearch(inputSelector, scope) {
    var timer = null;
    document.addEventListener("input", function (e) {
      var el = e.target;
      if (!el || !el.matches || !el.matches(inputSelector)) return;
      clearTimeout(timer);
      timer = setTimeout(function () {
        var q = (el.value || "").trim();
        if (!q) return;
        var data = { query: q };
        if (scope) data.scope = scope;
        track("search", data);
      }, 800);
    }, true);
  }
  bindSearch("input.navbar__search-input", null);
  bindSearch(".DocSearch-Input", null);
  bindSearch('input[role="searchbox"]', "portal");

  // 2) 点击委托：cross-product 优先，其次 outbound，再 nav-click
  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest("a") : null;
    if (!a) return;
    var href = a.getAttribute("href") || "";

    var cur = productOf(location.pathname);
    var tgt = productOfHref(href);
    if (cur && tgt && cur.key !== tgt.key) {
      track("cross-product", { from: cur.key, to: tgt.key, url: href });
      return;
    }

    var host = outboundHost(href);
    if (host) {
      track("outbound", { url: href, domain: host });
    }

    if (a.closest(".navbar")) {
      track("nav-click", { url: href, label: (a.textContent || "").trim().slice(0, 50) });
    }
  });

  // 3) search-miss：空结果，两种 UI 各自独立去重、用 surface 区分（modal / page）。
  function bindSearchMiss() {
    if (typeof MutationObserver === "undefined") return;
    var lastModalQuery = null;
    var lastPageQuery = null;
    var timer = null;

    // 在 root 子树内找「文本恰好等于 texts 之一」的元素。类名是 CSS module 哈希、不可依赖，
    // 故按翻译文案匹配；只扫 span/p，避免命中外层容器拼接出的长文本。
    function textIn(root, texts) {
      if (!root) return "";
      var nodes = root.querySelectorAll("span, p");
      for (var i = 0; i < nodes.length; i++) {
        var t = (nodes[i].textContent || "").trim();
        for (var j = 0; j < texts.length; j++) {
          if (t === texts[j]) return t;
        }
      }
      return "";
    }

    function modalQuery() {
      var input =
        document.querySelector(".DocSearch-Input") ||
        document.querySelector("input.navbar__search-input");
      return input ? (input.value || "").trim() : "";
    }
    function modalMiss() {
      // Algolia DocSearch 弹层
      if (document.querySelector(".DocSearch-NoResults")) return true;
      // docusaurus-search-local 弹层：限定在搜索框容器内，避免误报页面其它同名文本
      return !!textIn(document.querySelector(".navbar__search"), MODAL_MISS_TEXTS);
    }
    function pageQuery() {
      try {
        return (new URLSearchParams(location.search).get("q") || "").trim();
      } catch (err) {
        return "";
      }
    }
    function pageMissText() {
      // 仅在 /search 全页路径上找空结果，避免误报其它页面的同名文本
      if (!/\/search\/?$/.test(location.pathname)) return "";
      return textIn(document, PAGE_MISS_TEXTS);
    }

    function flush() {
      // 弹层空结果
      if (modalMiss()) {
        var mq = modalQuery();
        if (mq && mq !== lastModalQuery) {
          lastModalQuery = mq;
          track("search-miss", { query: mq, surface: "modal" });
        }
      } else {
        lastModalQuery = null;
      }

      // 全页空结果
      if (pageMissText()) {
        var pq = pageQuery();
        if (pq && pq !== lastPageQuery) {
          lastPageQuery = pq;
          track("search-miss", { query: pq, surface: "page" });
        }
      } else {
        lastPageQuery = null;
      }
    }

    var observer = new MutationObserver(function () {
      clearTimeout(timer);
      timer = setTimeout(flush, 300);
    });
    // documentElement 在 <head> 阶段即已存在；document.body 在 async 脚本早跑时可能为 null，observe(null) 会抛错导致 observer 永不建立。
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
  bindSearchMiss();
})();
