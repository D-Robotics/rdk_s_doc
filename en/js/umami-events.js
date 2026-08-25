// 站内自定义事件埋点：search / nav-click / cross-product（外链走 Umami 后台 Links 规则，不在此）
// 统一事件委托，不改动文档内容。各站 static/ 各放一份，经 docusaurus.config.js scripts 引入。
(function () {
  "use strict";

  function track(name, data) {
    if (typeof window.umami !== "undefined" && typeof window.umami.track === "function") {
      window.umami.track(name, data);
    }
  }

  // 产品 baseUrl 前缀（跨产品跳转判断用）。新增产品线在此补一行。
  // 含暂未装埋点脚本的仓（xburn/magicbox/rdk_studio/robogo），仅作跳转目标（to）识别。
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

  // 1) search：本地搜索框即输即搜、无 submit，debounce 后只上报稳态词。
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
  bindSearch('input[role="searchbox"]', "portal");

  // 2/3) 点击委托：cross-product 优先，其次 nav-click
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

    if (a.closest(".navbar")) {
      track("nav-click", { url: href, label: (a.textContent || "").trim().slice(0, 50) });
    }
  });
})();
