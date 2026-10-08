const { buildBootstrapScript } = require('./bootstrap-script');

/**
 * 在 </body> 前注入一段内联脚本，把「按产品折叠 .doc-scope」与「顶栏产品/版本显示值」
 * 从 hydration 之后提前到 HTML 解析阶段：前者消除首屏闪现另一套产品正文、以及由此导致的
 * 锚点定位错误，后者消除选择器先显示默认产品/版本再跳变的闪烁。
 *
 * 与之配套的是 remark-doc-scope.js 在作用域 div 上输出的 data-scope-products
 * （构建期算好的规范产品名列表）与 DocScopeSelectors 上的 data-doc-scope-selector；
 * 匹配语义与解析规则保持一致，详见 bootstrap-script.js 的说明。
 *
 * @param {import('@docusaurus/types').LoadContext} context
 */
function docScopeProductBootstrapPlugin(context) {
  const locale = context.i18n?.currentLocale || 'zh-Hans';
  // scoped 构建（DOC_BUILD_PRODUCT / DOC_BUILD_VERSION）下正文已按产品裁剪，产品必须固定，
  // 不能再让 URL / localStorage 参与判断。
  const buildProduct = process.env.DOC_BUILD_PRODUCT?.trim() || '';
  const buildVersion = process.env.DOC_BUILD_VERSION?.trim() || '';

  return {
    name: 'doc-scope-product-bootstrap-plugin',

    injectHtmlTags() {
      return {
        postBodyTags: [
          {
            tagName: 'script',
            innerHTML: buildBootstrapScript({ locale, buildProduct, buildVersion }),
          },
        ],
      };
    },
  };
}

module.exports = docScopeProductBootstrapPlugin;
