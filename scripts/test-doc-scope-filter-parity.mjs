#!/usr/bin/env node
/**
 * DocScope 筛选解析「同一内核、两处消费」的一致性测试。
 *
 * 解析规则（?v= → ?p= → localStorage → 默认值）只有一份实现：src/context/doc-scope-filter-core.mjs。
 * 客户端直接 import 它；首帧脚本由 doc-scope-product-bootstrap-plugin 在构建期把**同一份源码**
 * 内联进注入的 <script>。于是「两处不一致」这件事只可能来自内联契约被破坏或内核语义被改，
 * 本测试就盯这两点：
 *
 *   1. 内核仍满足可内联契约：除 export 外无 import、无反引号、无美元花括号插值；
 *   2. 矩阵集合不变量：PRODUCT_VERSION_MATRIX 的键 == VERSION_PRODUCT_MATRIX 各版本产品列表的并集
 *      （内核用前者判定「是不是产品名」、用后者判定「属于哪个版本」，集合不一致就会解析出非法组合）；
 *   3. 内核的解析结果 == 首帧脚本在桩 DOM 中实际执行的结果 == 下方固定预期表；
 *   4. 首帧脚本在真实 HTML 压缩链路（html-minifier-terser，选项与 Docusaurus 一致）下行为不变，
 *      且 scoped 构建能折叠掉整个解析内核（该构建的产品已固定，内核纯属白下发）。
 *
 * 运行：npm test
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const CORE_FILE = path.join(ROOT, 'src/context/doc-scope-filter-core.mjs');
const MATRIX_FILE = path.join(ROOT, 'src/context/doc-scope-matrix.json');

const matrix = JSON.parse(fs.readFileSync(MATRIX_FILE, 'utf8'));
const V2P = matrix.VERSION_PRODUCT_MATRIX;
const P2V = matrix.PRODUCT_VERSION_MATRIX;

const core = await import(new URL('../src/context/doc-scope-filter-core.mjs', import.meta.url));
const { buildBootstrapScript } = require(
  path.join(ROOT, 'src/plugins/doc-scope-product-bootstrap-plugin/bootstrap-script.js'),
);

let failed = 0;
function check(ok, label, detail = '') {
  if (!ok) {
    failed += 1;
  }
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${ok || !detail ? '' : `\n      ${detail}`}`);
}

// ---------------------------------------------------------------- 1. 内核可内联契约

const coreSource = fs.readFileSync(CORE_FILE, 'utf8');
const inlineBreakers = [];
if (/^\s*import\b/m.test(coreSource.replace(/^export /gm, ''))) {
  inlineBreakers.push('含 import（内联脚本无法解析模块）');
}
if (coreSource.includes('`')) {
  inlineBreakers.push('含反引号（会提前结束插件拼接用的模板字面量）');
}
if (coreSource.includes('${')) {
  inlineBreakers.push('含 ${（会被模板字面量当插值求值）');
}
check(
  inlineBreakers.length === 0,
  '内核满足可内联契约（无 import / 反引号 / 美元花括号插值）',
  inlineBreakers.join('；'),
);

// ---------------------------------------------------------------- 2. 矩阵集合不变量

const p2vKeys = Object.keys(P2V).sort();
const v2pValues = [...new Set(Object.values(V2P).flat())].sort();
check(
  JSON.stringify(p2vKeys) === JSON.stringify(v2pValues),
  'PRODUCT_VERSION_MATRIX 键集合 == VERSION_PRODUCT_MATRIX 产品值集合',
  `P2V=[${p2vKeys}] V2P值=[${v2pValues}]`,
);
check(
  Object.values(V2P).every((list) => Array.isArray(list) && list.length > 0),
  'VERSION_PRODUCT_MATRIX 每个版本的产品列表都非空',
);

const DEFAULT_VERSION = Object.keys(V2P)[0];
const DEFAULT_PRODUCT = V2P[DEFAULT_VERSION][0];
for (const locale of ['zh-Hans', 'en']) {
  const d = core.defaultsForLocale(V2P, locale);
  check(
    d.version === DEFAULT_VERSION && d.product === DEFAULT_PRODUCT,
    `defaultsForLocale(${locale}) == 矩阵首项 ${DEFAULT_VERSION} / ${DEFAULT_PRODUCT}`,
    `实际 ${d.version} / ${d.product}`,
  );
}
check(
  core.storageKeys('zh-Hans').version === 'doc_scope_version__zh-Hans',
  'storageKeys 键名格式未变（doc_scope_version__<locale>）',
);

// ---------------------------------------------------------------- 桩 DOM：执行首帧脚本

function makeStorage(entries, throwAll) {
  return {
    getItem(key) {
      if (throwAll) {
        throw new Error('SecurityError: localStorage blocked');
      }
      return Object.prototype.hasOwnProperty.call(entries, key) ? entries[key] : null;
    },
  };
}

function makeScope(tokens) {
  const classes = new Set(['doc-scope']);
  return {
    tokens,
    getAttribute: (name) => (name === 'data-scope-products' ? tokens : null),
    classList: {
      toggle(cls, on) {
        if (on) {
          classes.add(cls);
        } else {
          classes.delete(cls);
        }
      },
    },
    get visible() {
      return !classes.has('doc-scope--hidden');
    },
  };
}

/** 模拟 React 渲染出的 <span data-doc-scope-selector="...">文本</span>：单个文本子节点 */
function makeSelector(initial) {
  let writes = 0;
  let value = initial;
  const node = {
    nodeType: 3,
    nextSibling: null,
    get data() {
      return value;
    },
    set data(v) {
      writes += 1; // 写 textContent 会替换文本节点，写 node.data 不会：两者分开计数
      value = String(v);
    },
  };
  return {
    firstChild: node,
    get textContent() {
      return value;
    },
    set textContent(v) {
      writes += 1;
      value = String(v);
    },
    get writes() {
      return writes;
    },
  };
}

/** SSR 渲染出的选择器文本：矩阵默认值（服务端读不到 URL 之外的状态） */
const SSR_SELECTORS = { product: 'RDK S600', version: '5.1.0' };

/** 在桩 DOM 中执行首帧脚本，返回它写到页面上的结果 */
function runBootstrap(
  code,
  { search = '', storage = {}, throwStorage = false, preHidden = false, selectorInit = SSR_SELECTORS },
) {
  const s100 = makeScope('RDK S100');
  const s600 = makeScope('RDK S600');
  const both = makeScope('RDK S600,RDK S100');
  if (preHidden) {
    s600.classList.toggle('doc-scope--hidden', true); // bfcache 残留的相反状态
  }
  const scopes = [s100, s600, both];
  const selectors = {
    product: makeSelector(selectorInit.product),
    version: makeSelector(selectorInit.version),
  };
  const refs = {
    product: selectors.product.firstChild,
    version: selectors.version.firstChild,
  };

  const document = {
    querySelectorAll(selector) {
      if (selector.startsWith('.doc-scope[data-scope-products]')) {
        return scopes;
      }
      const m = selector.match(/^\[data-doc-scope-selector="(\w+)"\]$/);
      return m && selectors[m[1]] ? [selectors[m[1]]] : [];
    },
    getElementById: () => null,
  };

  const ctx = {
    URLSearchParams,
    decodeURIComponent,
    document,
    console,
    window: { location: { search }, localStorage: makeStorage(storage, throwStorage) },
  };
  vm.createContext(ctx);
  vm.runInContext(code, ctx, { filename: 'doc-scope-bootstrap.js' });

  return {
    product: selectors.product.textContent,
    version: selectors.version.textContent,
    // 必须保持 React 建立 hydration 时持有的那个文本节点，否则之后的 state 更新会写到游离节点上
    nodeKept:
      selectors.product.firstChild === refs.product && selectors.version.firstChild === refs.version,
    writes: selectors.product.writes + selectors.version.writes,
    s100: s100.visible,
    s600: s600.visible,
    both: both.visible,
  };
}

// ---------------------------------------------------------------- 压缩链路（与 Docusaurus 一致）

const HTML_MINIFY_OPTIONS = {
  removeComments: false,
  removeRedundantAttributes: false,
  removeEmptyAttributes: false,
  sortAttributes: false,
  sortClassName: false,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  useShortDoctype: true,
  minifyJS: true,
};

let minifyInlineScript = null;
let minifySource = '';
try {
  const { minify } = require('html-minifier-terser'); // Docusaurus 用的就是它
  minifySource = 'html-minifier-terser';
  minifyInlineScript = async (js) => {
    const html = await minify(`<!DOCTYPE html><html><body><script>${js}</script></body></html>`, HTML_MINIFY_OPTIONS);
    const m = html.match(/<script>([\s\S]*?)<\/script>/);
    return m ? m[1] : '';
  };
} catch {
  try {
    const { minify } = require('terser'); // html-minifier-terser 内部也是 terser，选项等价
    minifySource = 'terser（默认选项）';
    minifyInlineScript = async (js) => (await minify(js, {})).code;
  } catch {
    console.log('SKIP  未找到 html-minifier-terser / terser，跳过压缩链路检查\n');
  }
}

/** 同一组构建参数只压缩一次 */
const minifiedCache = new Map();
async function minifiedScript(opts) {
  const key = `${opts.locale}|${opts.buildProduct || ''}|${opts.buildVersion || ''}`;
  if (!minifiedCache.has(key)) {
    minifiedCache.set(key, await minifyInlineScript(buildBootstrapScript(opts)));
  }
  return minifiedCache.get(key);
}

// ---------------------------------------------------------------- 3+4. 用例表

/**
 * expect / coreExpect：{ version, product, s100, s600 }。
 * 固定写死是刻意的——它是语义锚：内核行为若被改动，必须在这里显式更新，而不是被自动化改掉。
 * s100 / s600：正文折叠结果（both 容器必须始终可见，任何用例下都不该被折叠）。
 */
const NON_SCOPED = { locale: 'zh-Hans' };
const SCOPED = { locale: 'zh-Hans', buildProduct: 'RDK S100', buildVersion: '4.0.5' };

const cases = [
  {
    name: '无 URL / 无存储 → 矩阵首项',
    input: {},
    expect: { version: '5.1.0', product: 'RDK S600', s100: false, s600: true },
  },
  {
    name: '?p=RDK%20S100 → 该产品首个版本',
    input: { search: '?p=RDK%20S100' },
    expect: { version: '4.0.5', product: 'RDK S100', s100: true, s600: false },
  },
  {
    // 连字符写法只用于 products="RDK-X5" 这类「系列」声明，URL 的 ?p= 不接受 —— 认不出就回落默认。
    name: '?p=rdk-s100（连字符不是合法产品参数）→ 回落默认',
    input: { search: '?p=rdk-s100' },
    expect: { version: '5.1.0', product: 'RDK S600', s100: false, s600: true },
  },
  {
    name: '?p=RdK+s100（大小写归一）',
    input: { search: '?p=RdK+s100' },
    expect: { version: '4.0.5', product: 'RDK S100', s100: true, s600: false },
  },
  {
    name: '?p=rdk%20%20s100（多空格折叠）',
    input: { search: '?p=rdk%20%20s100' },
    expect: { version: '4.0.5', product: 'RDK S100', s100: true, s600: false },
  },
  {
    name: '?v=4.0.5 → 该版本唯一产品',
    input: { search: '?v=4.0.5' },
    expect: { version: '4.0.5', product: 'RDK S100', s100: true, s600: false },
  },
  {
    name: '?v=5.1.0&p=RDK%20S100 → 版本优先，产品回落到该版本列表内',
    input: { search: '?v=5.1.0&p=RDK%20S100' },
    expect: { version: '5.1.0', product: 'RDK S600', s100: false, s600: true },
  },
  {
    name: '?v=3.0.0（未知版本）→ 回落默认版本',
    input: { search: '?v=3.0.0' },
    expect: { version: '5.1.0', product: 'RDK S600', s100: false, s600: true },
  },
  {
    name: '?v=&p= （参数为空）→ 视为未提供，走存储/默认',
    input: { search: '?v=&p=' },
    expect: { version: '5.1.0', product: 'RDK S600', s100: false, s600: true },
  },
  {
    name: '?v=4.0.5 覆盖存储中的 5.1.0',
    input: {
      search: '?v=4.0.5',
      storage: { 'doc_scope_version__zh-Hans': '5.1.0', 'doc_scope_product__zh-Hans': 'RDK S600' },
    },
    expect: { version: '4.0.5', product: 'RDK S100', s100: true, s600: false },
  },
  {
    name: '存储（当前语言键）',
    input: {
      locale: 'en',
      storage: { 'doc_scope_version__en': '4.0.5', 'doc_scope_product__en': 'RDK S100' },
    },
    expect: { version: '4.0.5', product: 'RDK S100', s100: true, s600: false },
  },
  {
    name: '存储只有 zh-Hans 键，locale=en → 跨语言回落',
    input: {
      locale: 'en',
      storage: { 'doc_scope_version__zh-Hans': '4.0.5', 'doc_scope_product__zh-Hans': 'RDK S100' },
    },
    expect: { version: '4.0.5', product: 'RDK S100', s100: true, s600: false },
  },
  {
    name: '存储历史键名（无 __locale 后缀）',
    input: { storage: { doc_scope_version: '4.0.5', doc_scope_product: 'RDK S100' } },
    expect: { version: '4.0.5', product: 'RDK S100', s100: true, s600: false },
  },
  {
    name: '存储里版本与产品不自洽（4.0.5 + RDK S600）→ 产品回落到该版本列表内',
    input: {
      storage: { 'doc_scope_version__zh-Hans': '4.0.5', 'doc_scope_product__zh-Hans': 'RDK S600' },
    },
    expect: { version: '4.0.5', product: 'RDK S100', s100: true, s600: false },
  },
  {
    name: '存储缺 product 键 → 用该版本列表首项',
    input: { storage: { 'doc_scope_version__zh-Hans': '4.0.5' } },
    expect: { version: '4.0.5', product: 'RDK S100', s100: true, s600: false },
  },
  {
    name: '访问 localStorage 抛异常（隐私模式）→ 回落默认，不崩',
    input: { throwStorage: true },
    expect: { version: '5.1.0', product: 'RDK S600', s100: false, s600: true },
  },
  {
    name: 'bfcache 残留相反折叠状态 → 双向 toggle 纠正',
    input: { preHidden: true },
    expect: { version: '5.1.0', product: 'RDK S600', s100: false, s600: true },
  },
  {
    name: 'scoped 构建：忽略 ?p=RDK%20S600，保持构建固化的产品',
    input: { search: '?p=RDK%20S600' },
    scoped: true,
    expect: { version: '4.0.5', product: 'RDK S100', s100: true, s600: false },
    // 客户端内核不认识「构建固化」概念（Provider 在 hasBuildScope 下不走 parseFilter），
    // 这里显式记下按普通规则会解析成什么，避免把两者的差异当成 bug。
    coreExpect: { version: '5.1.0', product: 'RDK S600' },
  },
  {
    name: 'scoped 构建：忽略存储中的 S600',
    input: {
      storage: { 'doc_scope_version__zh-Hans': '5.1.0', 'doc_scope_product__zh-Hans': 'RDK S600' },
    },
    scoped: true,
    expect: { version: '4.0.5', product: 'RDK S100', s100: true, s600: false },
    coreExpect: { version: '5.1.0', product: 'RDK S600' },
  },
  {
    // scoped 构建的 SSR 渲染的就是固定值：脚本该原样跳过，不做无谓的 DOM 写入。
    name: 'scoped 构建：选择器已是构建固化的值 → 不写 DOM',
    input: {},
    scoped: true,
    selectorInit: { product: 'RDK S100', version: '4.0.5' },
    expect: { version: '4.0.5', product: 'RDK S100', s100: true, s600: false },
    coreExpect: { version: '5.1.0', product: 'RDK S600' },
    noWrites: true,
  },
];

const CONFIGS = [NON_SCOPED, SCOPED];

for (const cfg of CONFIGS) {
  const isScoped = Boolean(cfg.buildProduct && cfg.buildVersion);
  const label = isScoped ? 'scoped 构建' : '普通构建';
  const code = buildBootstrapScript(cfg);

  // 生成的脚本本身就是模板字面量产物：先确认它能被解析，否则只会在构建时才以
  // "Missing semicolon" 之类报出来。
  try {
    new vm.Script(code, { filename: 'doc-scope-bootstrap.js' });
    check(true, `[${label}] 生成的脚本可解析（${code.length} 字节）`);
  } catch (e) {
    check(false, `[${label}] 生成的脚本可解析`, e.message);
  }

  const minified = minifyInlineScript ? await minifiedScript(cfg) : null;

  for (const c of cases) {
    const input = c.input || {};
    if (Boolean(c.scoped) !== isScoped) {
      continue;
    }
    const search = input.search || '';
    const locale = input.locale || cfg.locale;
    const storage = input.storage || {};
    const throwStorage = Boolean(input.throwStorage);
    const preHidden = Boolean(input.preHidden);
    const expect = c.expect;
    const coreExpect = c.coreExpect || expect;

    // 内核（客户端路径）
    const store = makeStorage(storage, throwStorage);
    const coreResult = core.parseFilter(search, locale, {
      v2p: V2P,
      p2v: P2V,
      readStorage: (k) => store.getItem(k),
    });

    // 首帧脚本（原始文本 + 真实压缩链路产物，两者必须行为一致）
    const runOpts = { search, storage, throwStorage, preHidden, selectorInit: c.selectorInit };
    const boot = runBootstrap(code, runOpts);
    const bootMin = minified ? runBootstrap(minified, runOpts) : null;

    const problems = [];
    if (coreResult.version !== coreExpect.version || coreResult.product !== coreExpect.product) {
      problems.push(
        `内核 ${coreResult.version}/${coreResult.product} ≠ 预期 ${coreExpect.version}/${coreExpect.product}`,
      );
    }
    for (const [tag, r] of [[ '首帧脚本', boot ], [ '压缩后脚本', bootMin ]]) {
      if (!r) {
        continue;
      }
      if (r.version !== expect.version || r.product !== expect.product) {
        problems.push(`${tag} ${r.version}/${r.product} ≠ 预期 ${expect.version}/${expect.product}`);
      }
      if (r.s100 !== expect.s100 || r.s600 !== expect.s600) {
        problems.push(
          `${tag} 折叠 S100=${r.s100}/S600=${r.s600} ≠ 预期 S100=${expect.s100}/S600=${expect.s600}`,
        );
      }
      if (!r.both) {
        problems.push(`${tag} 把「两个产品共用」的容器也折叠了`);
      }
      if (!r.nodeKept) {
        problems.push(`${tag} 替换了 React 持有的文本节点（之后切换筛选界面会不再更新）`);
      }
      if (c.noWrites && r.writes !== 0) {
        problems.push(`${tag} 选择器文本已是正确值，却仍写了 ${r.writes} 次`);
      }
      if (!V2P[r.version] || !V2P[r.version].includes(r.product)) {
        problems.push(`${tag} 解析出矩阵里不存在的组合 ${r.version}/${r.product}`);
      }
    }
    check(problems.length === 0, `[${label}] ${c.name}`, problems.join('；'));
  }
}

// ---------------------------------------------------------------- 构建期半配置

// 只设产品不设版本 → 视为非 scoped：仍按 URL / 存储解析。
// 与 docBuildScope.enabled / remark 侧 enabled 的判定一致，半配置不该把产品静默固化下来。
const halfScoped = buildBootstrapScript({ locale: 'zh-Hans', buildProduct: 'RDK S100' });
const halfScopedResult = runBootstrap(halfScoped, { search: '?p=RDK%20S100' });
check(
  halfScopedResult.version === '4.0.5' && halfScopedResult.product === 'RDK S100',
  '只设 DOC_BUILD_PRODUCT 不设 DOC_BUILD_VERSION → 不算 scoped，仍按 URL 解析',
  `实际 ${halfScopedResult.version}/${halfScopedResult.product}`,
);

// ---------------------------------------------------------------- 压缩链路的瘦身保证

if (minifyInlineScript) {
  const normal = await minifiedScript(NON_SCOPED);
  const scoped = await minifiedScript(SCOPED);
  const resolverMarkers = /localStorage|doc_scope_version|parseFilter|defaultsForLocale/;

  check(
    resolverMarkers.test(normal),
    `[普通构建] 压缩后仍保留解析内核（${minifySource}，${normal.length} 字节）`,
    '内核被误判为死代码，URL / localStorage 将不再生效',
  );
  check(
    !resolverMarkers.test(scoped),
    `[scoped 构建] 压缩后折叠掉解析内核（${minifySource}，${scoped.length} 字节）`,
    '解析内核被下发到固定产品的页面，白增体积；多半是 fixed 条件的布尔写法被改了',
  );
}

console.log(`\n${failed === 0 ? '全部通过' : `${failed} 项失败`}`);
process.exit(failed === 0 ? 0 : 1);
