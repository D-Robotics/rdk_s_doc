/**
 * 生成「首帧前修正」bootstrap 脚本，由插件以文本形式注入 postBodyTags 同步执行。
 *
 * 服务的都是同一类问题：服务端渲染时读不到 URL 之外的任何用户状态（localStorage），
 * 只能渲染矩阵默认值（首个版本 + 其首个产品，当前为 5.1.0 / RDK S600）。首屏绘制只依赖
 * HTML，早于 JS 加载与 hydration 提交，所以默认值会先被画出来、随后才被纠正，表现为跳变。
 * 这里把纠正提到 HTML 解析阶段，即首屏绘制之前：
 *
 * 1. 正文：两个产品的 .doc-scope 同时展开 → 浏览器按这个高度做完锚点定位后才折叠，
 *    锚点上移、视口不动，表现为锚点跳转定位错误。这里提前折叠，早于浏览器锚点定位。
 * 2. 顶栏选择器：产品 / 版本先显示默认值再跳变，闪一下。这里提前把文本写成解析结果。
 *
 * 两处都必须由本脚本在解析阶段完成，不能等 hydration：React 18 的 hydration 只对**文本**
 * 差异做提交期纠正（HostText 走 markUpdate，见 react-dom 的 prepareToHydrateHostTextInstance），
 * **属性**差异（这里正是 className）在 18.3 只报 dev 告警、不改写 DOM，故折叠类不会被 hydration
 * 补上；而文本即使会被纠正，也发生在首屏绘制之后，同样是可见的闪烁。
 *
 * 本脚本以构建期固化的信息为准：markdown 侧由 remark-doc-scope.js 输出 data-scope-products
 * （规范产品名列表），做纯字符串比较，不把 scopeProductsMatchCurrent 的匹配语义
 * （大小写不敏感、RDK-X5 系列写法）复制进来；解析 URL / localStorage 的部分与
 * DocScopeFilterContext.parseFilter() 同序同语义。
 *
 * 产品解析逻辑整体收在 resolveFilter() 内：scoped 构建（DOC_BUILD_PRODUCT / DOC_BUILD_VERSION）
 * 下两个值都是字面量，压缩器会把三元表达式折叠成常量并丢弃该函数及其矩阵，
 * 不会为固定产品白白下发一份用不到的解析代码。
 */

const rawMatrix = require('../../context/doc-scope-matrix.json');

const { VERSION_PRODUCT_MATRIX, PRODUCT_VERSION_MATRIX } = rawMatrix;

function firstKey(obj) {
  return Object.keys(obj)[0] || '';
}

/**
 * @param {{ locale: string, buildProduct?: string, buildVersion?: string }} options
 *   locale 取 Docusaurus 当前语言（决定 localStorage 键名）；
 *   buildProduct / buildVersion 非空表示 scoped 构建，此时正文已按产品裁剪、产品固定，
 *   必须忽略 URL 与 localStorage —— 否则会按用户偏好折叠掉本次构建特意保留的正文。
 *   这与 DocScopeFilterProvider 在 hasBuildScope 下强制使用 buildScope 的行为一致。
 * @returns {string}
 */
function buildBootstrapScript({ locale, buildProduct = '', buildVersion = '' }) {
  const defaultVersion = firstKey(VERSION_PRODUCT_MATRIX);
  const defaultProduct = (VERSION_PRODUCT_MATRIX[defaultVersion] || [])[0] || '';

  return `(function () {
  var LOCALE = ${JSON.stringify(locale)};
  var DEF_V = ${JSON.stringify(defaultVersion)};
  var DEF_P = ${JSON.stringify(defaultProduct)};
  var FIXED_V = ${JSON.stringify(buildVersion)};
  var FIXED_P = ${JSON.stringify(buildProduct)};

  // 与 DocScopeFilterContext 的 parseFilter() 同序：?v= → ?p= → localStorage → 默认值。
  // 返回值与客户端的 {version, product} 一致：product 一定属于该版本的列表。
  function resolveFilter() {
    var V2P = ${JSON.stringify(VERSION_PRODUCT_MATRIX)};
    var P2V = ${JSON.stringify(PRODUCT_VERSION_MATRIX)};

    function norm(s) {
      return String(s == null ? "" : s).trim().toLowerCase().replace(/\\s+/g, " ");
    }

    var canon = {};
    Object.keys(P2V).forEach(function (k) { canon[norm(k)] = k; });

    function productForVersion(pRaw, version) {
      var list = V2P[version];
      if (!list || !list.length) return "";
      if (pRaw == null || String(pRaw).trim() === "") return list[0];
      var c = canon[norm(pRaw)];
      if (c && list.indexOf(c) !== -1) return c;
      for (var i = 0; i < list.length; i += 1) {
        if (norm(list[i]) === norm(pRaw)) return list[i];
      }
      return list[0];
    }

    function readStorage(key) {
      try { return window.localStorage.getItem(key); } catch (e) { return null; }
    }

    function fromStorage() {
      var v = readStorage("doc_scope_version__" + LOCALE);
      var p = readStorage("doc_scope_product__" + LOCALE);
      if (!v && LOCALE === "zh-Hans") {
        v = readStorage("doc_scope_version");
        p = readStorage("doc_scope_product");
      }
      if (!v) {
        var others = LOCALE === "en" ? ["zh-Hans"] : ["en"];
        for (var i = 0; i < others.length; i += 1) {
          var fv = readStorage("doc_scope_version__" + others[i]);
          if (fv) {
            v = fv;
            p = readStorage("doc_scope_product__" + others[i]);
            break;
          }
        }
      }
      return v ? { version: v, product: p } : null;
    }

    var q = new URLSearchParams(String(window.location.search || "").replace(/^\\?/, ""));
    var vRaw = q.get("v");
    var pRaw = q.get("p");
    if (vRaw) {
      var v1 = V2P[vRaw] ? vRaw : DEF_V;
      return { version: v1, product: productForVersion(pRaw, v1) };
    }
    if (pRaw != null && String(pRaw).trim() !== "") {
      var c = canon[norm(pRaw)];
      if (c && P2V[c] && P2V[c].length) {
        var v2 = P2V[c][0];
        return { version: v2, product: productForVersion(c, v2) };
      }
    }
    var stored = fromStorage();
    if (stored && V2P[stored.version]) {
      return { version: stored.version, product: productForVersion(stored.product, stored.version) };
    }
    return { version: DEF_V, product: DEF_P };
  }

  // 顶栏「产品 / 版本」的显示文本，写法必须与 DocScopeSelectors.syncSelectorText 一致：
  // 只改既有文本节点的 data，不替换节点，否则 React 持有的文本节点引用失效，
  // 之后切换产品/版本时界面就再也不更新了。
  function patchSelector(kind, value) {
    if (!value) return;
    var els = document.querySelectorAll('[data-doc-scope-selector="' + kind + '"]');
    for (var i = 0; i < els.length; i += 1) {
      var el = els[i];
      if (el.textContent === value) continue;
      var node = el.firstChild;
      if (node && node.nodeType === 3 && !node.nextSibling) {
        node.data = value;
      } else {
        el.textContent = value;
      }
    }
  }

  // TOC 中指向被折叠章节的条目同理先行隐藏，避免首屏闪出另一套产品的目录项。
  function syncToc() {
    var links = document.querySelectorAll(
      ".theme-doc-toc-desktop a.table-of-contents__link[href^='#'], .theme-doc-toc-mobile a.table-of-contents__link[href^='#']"
    );
    for (var i = 0; i < links.length; i += 1) {
      var item = links[i].closest("li");
      if (!item) continue;
      var raw = String(links[i].getAttribute("href") || "").slice(1);
      var id = raw;
      try { id = decodeURIComponent(raw); } catch (e) { /* 解码失败则用原值 */ }
      var target = document.getElementById(id);
      if (!target) continue;
      var hidden = target.closest(".doc-scope--hidden") || target.closest("[role='tabpanel'][hidden]");
      item.classList.toggle("doc-scope-toc-hidden", !!hidden);
    }
  }

  try {
    // 固定条件必须算成布尔值再进三元，压缩器才会在 scoped 构建里把条件折叠掉、
    // 进而删除 resolveFilter 及其矩阵。实测字符串条件（FIXED_V && FIXED_P ? …）以及
    // (FIXED_P !== "") && (FIXED_V !== "") 这种复合条件都不会被折叠，别改写法。
    // 注意：本字符串是模板字面量，注释里不能出现反引号或美元花括号。
    // 只设产品不设版本时视为非 scoped 构建，与 docBuildScope / remark 侧 enabled 的判定一致。
    var fixed = FIXED_P !== "" && FIXED_V !== "";
    var filter = fixed ? { version: FIXED_V, product: FIXED_P } : resolveFilter();

    patchSelector("product", filter.product);
    patchSelector("version", filter.version);

    var scopes = document.querySelectorAll(".doc-scope[data-scope-products]");
    if (scopes.length) {
      for (var i = 0; i < scopes.length; i += 1) {
        var tokens = String(scopes[i].getAttribute("data-scope-products") || "").split(",");
        // 双向切换：bfcache 恢复时可能残留上一次的折叠状态。
        scopes[i].classList.toggle("doc-scope--hidden", tokens.indexOf(filter.product) === -1);
      }
      syncToc();
    }
  } catch (e) {
    // 解析失败时保持服务端原样，交给 DocScopeHydration / DocScopeSelectors 兜底。
  }
})();`;
}

module.exports = { buildBootstrapScript };
