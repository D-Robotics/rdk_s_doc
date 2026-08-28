#!/usr/bin/env node
/**
 * Crawl the published Docusaurus site and upload DocSearch v3 records.
 *
 * Required: ALGOLIA_ADMIN_API_KEY (Admin or Write key; never commit it)
 * Optional: ALGOLIA_APP_ID / ALGOLIA_INDEX_NAME / ALGOLIA_SITE_URL
 *
 * Usage:
 *   npm run algolia:index
 *   node scripts/algolia-index.mjs --dry-run
 */
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';
import {
  lookupDocScopeConfig,
  normalizeDocIdFromPath,
} from '../src/context/doc-scope-id-utils.mjs';

const require = createRequire(import.meta.url);
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const loadHtml = cheerio.load;

dotenv.config({ path: path.join(repoRoot, '.env') });

const {
  buildSidebarScopeConfig,
} = require('./lib/sidebar-scope-config-generator.js');
const matrix = JSON.parse(
  fs.readFileSync(path.join(repoRoot, 'src/context/doc-scope-matrix.json'), 'utf8'),
);

const APP_ID = process.env.ALGOLIA_APP_ID || '1VU781LYTV';
const INDEX_NAME = process.env.ALGOLIA_INDEX_NAME || 'rdk_s_doc';
const SITE_URL = normalizeSiteUrl(
  process.env.ALGOLIA_SITE_URL || 'https://developer.d-robotics.cc/rdk_s_doc/',
);
const ADMIN_KEY =
  process.env.ALGOLIA_ADMIN_API_KEY || process.env.ALGOLIA_WRITE_API_KEY || '';
const DRY_RUN = process.argv.includes('--dry-run');
const FETCH_CONCURRENCY = Number(process.env.ALGOLIA_FETCH_CONCURRENCY || 8);
const DEFAULT_LOCALE = 'zh-Hans';
const LOCALES = ['zh-Hans', 'en'];

const LEVEL_WEIGHT = {
  lvl0: 100,
  lvl1: 90,
  lvl2: 80,
  lvl3: 70,
  lvl4: 60,
  lvl5: 50,
  lvl6: 40,
  content: 0,
};

const INDEX_SETTINGS = {
  searchableAttributes: [
    'unordered(hierarchy.lvl0)',
    'unordered(hierarchy.lvl1)',
    'unordered(hierarchy.lvl2)',
    'unordered(hierarchy.lvl3)',
    'unordered(hierarchy.lvl4)',
    'unordered(hierarchy.lvl5)',
    'unordered(hierarchy.lvl6)',
    'content',
  ],
  attributesForFaceting: [
    'type',
    'lang',
    'language',
    'version',
    'docusaurus_tag',
    'filterOnly(product)',
    'filterOnly(rdk_version)',
  ],
  attributesToRetrieve: [
    'hierarchy',
    'content',
    'anchor',
    'url',
    'url_without_anchor',
    'type',
    'lang',
    'language',
    'version',
    'docusaurus_tag',
    'product',
    'rdk_version',
  ],
  attributesToHighlight: ['hierarchy', 'content'],
  attributesToSnippet: ['content:10'],
  camelCaseAttributes: ['hierarchy', 'content'],
  distinct: true,
  attributeForDistinct: 'url',
  customRanking: [
    'desc(weight.pageRank)',
    'desc(weight.level)',
    'asc(weight.position)',
  ],
  ranking: ['words', 'filters', 'typo', 'attribute', 'proximity', 'exact', 'custom'],
  highlightPreTag: '<span class="algolia-docsearch-suggestion--highlight">',
  highlightPostTag: '</span>',
  minWordSizefor1Typo: 3,
  minWordSizefor2Typos: 7,
  allowTyposOnNumericTokens: false,
  minProximity: 1,
  ignorePlurals: true,
  advancedSyntax: true,
  attributeCriteriaComputedByMinProximity: true,
  removeWordsIfNoResults: 'allOptional',
  separatorsToIndex: '_',
};

function normalizeSiteUrl(url) {
  const trimmed = String(url || '').trim();
  if (!trimmed) {
    throw new Error('ALGOLIA_SITE_URL is empty');
  }
  return trimmed.endsWith('/') ? trimmed : `${trimmed}/`;
}

function siteOrigin() {
  return new URL(SITE_URL).origin;
}

function getProductVersionPairs() {
  const pairs = [];
  for (const [product, versions] of Object.entries(matrix.PRODUCT_VERSION_MATRIX || {})) {
    for (const version of versions || []) {
      pairs.push({ product, version });
    }
  }
  return pairs;
}

function normalizeProductKey(s) {
  return String(s)
    .trim()
    .toLocaleLowerCase('en-US')
    .replace(/\s+/g, ' ');
}

function normalizeProductSeriesKey(s) {
  if (s == null || typeof s !== 'string') {
    return null;
  }
  const match = s.trim().match(/^rdk\s*-\s*(.+)$/i);
  if (!match) {
    return null;
  }
  const suffix = match[1].trim().replace(/\s+/g, ' ');
  return suffix ? normalizeProductKey(`RDK ${suffix}`) : null;
}

function productBelongsToSeries(currentProduct, seriesKey) {
  const current = normalizeProductKey(currentProduct);
  return current === seriesKey || current.startsWith(`${seriesKey} `);
}

function scopeProductsMatchCurrent(scopeProducts, currentProduct) {
  if (!scopeProducts || scopeProducts.length === 0) {
    return true;
  }
  if (!currentProduct) {
    return false;
  }
  const cur = normalizeProductKey(currentProduct);
  for (const entry of scopeProducts) {
    const seriesKey = normalizeProductSeriesKey(entry);
    if (seriesKey && productBelongsToSeries(currentProduct, seriesKey)) {
      return true;
    }
    if (normalizeProductKey(entry) === cur) {
      return true;
    }
  }
  return false;
}

function compareVersions(v1, v2) {
  const parts1 = String(v1).split('.').map(Number);
  const parts2 = String(v2).split('.').map(Number);
  const maxLength = Math.max(parts1.length, parts2.length);
  for (let i = 0; i < maxLength; i += 1) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    if (p1 < p2) return -1;
    if (p1 > p2) return 1;
  }
  return 0;
}

function matchVersion(currentVersion, versionConfigs) {
  if (!versionConfigs || versionConfigs.length === 0) {
    return true;
  }
  for (const config of versionConfigs) {
    if (typeof config === 'string') {
      if (config === currentVersion) return true;
      continue;
    }
    if (config && typeof config === 'object' && config.version) {
      const op = config.operator != null ? config.operator : '';
      const cmp = compareVersions(currentVersion, config.version);
      if (
        (op === '' && cmp === 0) ||
        (op === '>' && cmp > 0) ||
        (op === '>=' && cmp >= 0) ||
        (op === '<' && cmp < 0) ||
        (op === '<=' && cmp <= 0)
      ) {
        return true;
      }
    }
  }
  return false;
}

function shouldShowDoc(docId, version, product, sidebarConfig) {
  const normalizedId = normalizeDocIdFromPath(docId);
  if (!normalizedId) {
    return true;
  }
  for (const [configPath, scope] of Object.entries(sidebarConfig || {})) {
    if (!scope?.isCategory || !scope.exclude) continue;
    const normalizedConfigPath = normalizeDocIdFromPath(configPath);
    if (
      normalizedId === normalizedConfigPath ||
      normalizedId.startsWith(`${normalizedConfigPath}/`)
    ) {
      return false;
    }
  }
  const docScope = lookupDocScopeConfig(docId, sidebarConfig);
  if (docScope) {
    return (
      matchVersion(version, docScope.versions) &&
      scopeProductsMatchCurrent(docScope.products, product)
    );
  }
  for (const [configPath, scope] of Object.entries(sidebarConfig || {})) {
    if (!scope?.isCategory) continue;
    const normalizedConfigPath = normalizeDocIdFromPath(configPath);
    if (
      normalizedId === normalizedConfigPath ||
      normalizedId.startsWith(`${normalizedConfigPath}/`)
    ) {
      return (
        matchVersion(version, scope.versions) &&
        scopeProductsMatchCurrent(scope.products, product)
      );
    }
  }
  return true;
}

function pairsForScope(spec, pagePairs) {
  const versions = spec?.versions || [];
  const products = spec?.products || [];
  return pagePairs.filter(
    (pair) =>
      matchVersion(pair.version, versions) &&
      scopeProductsMatchCurrent(products, pair.product),
  );
}

function stripProxyEnv() {
  for (const key of [
    'HTTP_PROXY',
    'HTTPS_PROXY',
    'http_proxy',
    'https_proxy',
    'ALL_PROXY',
    'all_proxy',
    'GLOBAL_AGENT_HTTP_PROXY',
    'GLOBAL_AGENT_HTTPS_PROXY',
  ]) {
    delete process.env[key];
  }
}

async function httpGet(url, { headers } = {}) {
  const res = await fetch(url, {
    headers: {
      'user-agent': 'rdk-s-doc-algolia-indexer/1.0',
      accept: 'text/html,application/xml;q=0.9,*/*;q=0.8',
      ...headers,
    },
    redirect: 'follow',
  });
  const text = await res.text();
  return { ok: res.ok, status: res.status, url: res.url, text };
}

function algoliaHeaders(apiKey) {
  return {
    'x-algolia-application-id': APP_ID,
    'x-algolia-api-key': apiKey,
    'content-type': 'application/json',
  };
}

async function algoliaRequest(method, apiPath, body, apiKey) {
  const url = `https://${APP_ID}.algolia.net/1/${apiPath.replace(/^\//, '')}`;
  const doFetch = () =>
    fetch(url, {
      method,
      headers: algoliaHeaders(apiKey),
      body: body == null ? undefined : JSON.stringify(body),
    });

  let res = await doFetch();
  let text = await res.text();
  if (res.status === 403) {
    stripProxyEnv();
    res = await doFetch();
    text = await res.text();
  }
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    throw new Error(
      `Algolia ${method} ${apiPath} failed: ${res.status} ${text.slice(0, 500)}`,
    );
  }
  return json;
}

async function waitTask(taskID, apiKey) {
  if (!taskID) return;
  const started = Date.now();
  while (Date.now() - started < 120000) {
    const json = await algoliaRequest(
      'GET',
      `indexes/${encodeURIComponent(INDEX_NAME)}/task/${taskID}`,
      null,
      apiKey,
    );
    if (json.status === 'published') {
      return;
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(`Timed out waiting for Algolia task ${taskID}`);
}

function canonicalizePageUrl(rawUrl) {
  const u = new URL(rawUrl, SITE_URL);
  u.hash = '';
  u.search = '';
  let href = u.href;
  if (href.endsWith('/index.html')) {
    href = href.slice(0, -'/index.html'.length) + '/';
  }
  return href;
}

function isIndexableUrl(rawUrl) {
  let u;
  try {
    u = new URL(rawUrl, SITE_URL);
  } catch {
    return false;
  }
  if (u.origin !== siteOrigin()) {
    return false;
  }
  const sitePath = new URL(SITE_URL).pathname;
  if (!u.pathname.startsWith(sitePath)) {
    return false;
  }
  const pathname = u.pathname.toLowerCase();
  if (pathname.includes('/search') || pathname.includes('/blog/')) {
    return false;
  }
  if (/\.(png|jpe?g|gif|svg|webp|css|js|json|xml|txt|pdf|zip|ico|map|woff2?)$/i.test(pathname)) {
    return false;
  }
  return true;
}

function localeFromUrl(pageUrl) {
  const sitePath = new URL(SITE_URL).pathname.replace(/\/$/, '');
  const pathname = new URL(pageUrl).pathname;
  const rest = pathname.slice(sitePath.length);
  if (rest === '/en' || rest.startsWith('/en/')) {
    return 'en';
  }
  return DEFAULT_LOCALE;
}

function docIdFromUrl(pageUrl) {
  const sitePath = new URL(SITE_URL).pathname.replace(/\/$/, '');
  let rest = new URL(pageUrl).pathname.slice(sitePath.length);
  rest = rest.replace(/^\/en(?=\/|$)/, '');
  rest = rest.replace(/\/+$/, '').replace(/^\/+/, '');
  if (!rest || rest === 'index.html') {
    return '';
  }
  return normalizeDocIdFromPath(rest);
}

function cleanText(value) {
  return String(value || '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseScopeAttr(raw) {
  if (!raw) {
    return { versions: [], products: [] };
  }
  try {
    const parsed = JSON.parse(raw);
    return {
      versions: Array.isArray(parsed.versions) ? parsed.versions : [],
      products: Array.isArray(parsed.products) ? parsed.products : [],
    };
  } catch {
    return { versions: [], products: [] };
  }
}

function emptyHierarchy() {
  return {
    lvl0: null,
    lvl1: null,
    lvl2: null,
    lvl3: null,
    lvl4: null,
    lvl5: null,
    lvl6: null,
  };
}

function headingAnchor($, el) {
  const id = $(el).attr('id');
  if (id) return id;
  const childId = $(el).find('[id]').first().attr('id');
  return childId || '';
}

function objectIdFor(parts) {
  return createHash('sha1').update(parts.join('|')).digest('hex');
}

function scopeUrl(pageUrl, product, version, anchor) {
  const u = new URL(pageUrl);
  u.searchParams.set('p', product);
  u.searchParams.set('v', version);
  u.hash = anchor ? `#${anchor}` : '';
  return u.toString();
}

function makeRecord({
  pageUrl,
  product,
  version,
  language,
  docusaurusTag,
  hierarchy,
  content,
  type,
  anchor,
  position,
}) {
  const url = scopeUrl(pageUrl, product, version, anchor);
  const urlWithoutAnchor = scopeUrl(pageUrl, product, version, '');
  return {
    objectID: objectIdFor([url, type, content, String(position)]),
    hierarchy,
    content: type === 'content' ? content : '',
    type,
    url,
    url_without_anchor: urlWithoutAnchor,
    anchor: anchor || '',
    language,
    lang: language,
    version: 'current',
    docusaurus_tag: docusaurusTag,
    product,
    rdk_version: version,
    weight: {
      pageRank: 0,
      level: LEVEL_WEIGHT[type] ?? 0,
      position,
    },
  };
}

function extractPageRecords($, pageUrl, pagePairs, language, docusaurusTag) {
  const records = [];
  const article =
    $('article .theme-doc-markdown').first().length
      ? $('article .theme-doc-markdown').first()
      : $('article.markdown').first().length
        ? $('article.markdown').first()
        : $('article').first().length
          ? $('article').first()
          : $('main').first();

  if (!article.length) {
    return records;
  }

  const breadcrumb = cleanText(
    $('.theme-doc-breadcrumbs .breadcrumbs__link').first().text() ||
      $('.menu__link.menu__link--sublist.menu__link--active').last().text() ||
      'Documentation',
  );
  const hierarchy = emptyHierarchy();
  hierarchy.lvl0 = breadcrumb;

  let position = 0;
  let currentAnchor = '';

  const skipClosest =
    'nav, footer, .theme-doc-toc-desktop, .theme-doc-toc-mobile, .pagination-nav, .theme-edit-this-page, .hash-link';

  const nodes = article
    .find('h1, h2, h3, h4, h5, h6, p, li, td')
    .toArray()
    .filter((el) => $(el).closest(skipClosest).length === 0);

  for (const el of nodes) {
    const $el = $(el);
    const tag = (el.tagName || el.name || '').toLowerCase();
    if (tag === 'p' && $el.closest('li, td').length) {
      continue;
    }
    const text = cleanText($el.clone().find('.hash-link, .header-anchor').remove().end().text());
    if (!text) {
      continue;
    }

    const spec = parseScopeAttr($el.closest('[data-doc-scope]').attr('data-doc-scope'));
    const scopedPairs = pairsForScope(spec, pagePairs);
    if (scopedPairs.length === 0) {
      continue;
    }

    if (/^h[1-6]$/.test(tag)) {
      const level = Number(tag.slice(1));
      currentAnchor = headingAnchor($, el);
      for (let lvl = level; lvl <= 6; lvl += 1) {
        hierarchy[`lvl${lvl}`] = null;
      }
      hierarchy[`lvl${level}`] = text;
      const snapshot = { ...hierarchy };
      for (const pair of scopedPairs) {
        records.push(
          makeRecord({
            pageUrl,
            product: pair.product,
            version: pair.version,
            language,
            docusaurusTag,
            hierarchy: snapshot,
            content: '',
            type: `lvl${level}`,
            anchor: currentAnchor,
            position: position++,
          }),
        );
      }
      continue;
    }

    const snapshot = { ...hierarchy };
    for (const pair of scopedPairs) {
      records.push(
        makeRecord({
          pageUrl,
          product: pair.product,
          version: pair.version,
          language,
          docusaurusTag,
          hierarchy: snapshot,
          content: text.slice(0, 5000),
          type: 'content',
          anchor: currentAnchor,
          position: position++,
        }),
      );
    }
  }

  return records;
}

function collectLinks($, pageUrl) {
  const urls = new Set();
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (!href || href.startsWith('mailto:') || href.startsWith('javascript:')) {
      return;
    }
    try {
      const abs = canonicalizePageUrl(new URL(href, pageUrl).toString());
      if (isIndexableUrl(abs)) {
        urls.add(abs);
      }
    } catch {
      // ignore invalid href
    }
  });
  return [...urls];
}

async function loadSitemapUrls() {
  const candidates = [
    new URL('sitemap.xml', SITE_URL).toString(),
    `${SITE_URL}sitemap.xml`,
  ];
  const urls = new Set();
  for (const sitemapUrl of candidates) {
    try {
      const res = await httpGet(sitemapUrl);
      if (!res.ok || !res.text.includes('<loc>')) {
        continue;
      }
      for (const match of res.text.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)) {
        const loc = canonicalizePageUrl(match[1].trim());
        if (isIndexableUrl(loc)) {
          urls.add(loc);
        }
      }
      if (urls.size) {
        console.log(`Loaded ${urls.size} URLs from ${sitemapUrl}`);
        return [...urls];
      }
    } catch (error) {
      console.warn(`Sitemap fetch skipped (${sitemapUrl}): ${error.message}`);
    }
  }
  return [];
}

function startUrls() {
  const urls = new Set([
    SITE_URL,
    new URL('RDK', SITE_URL).toString(),
    new URL('en/RDK', SITE_URL).toString(),
  ]);
  return [...urls].map(canonicalizePageUrl).filter(isIndexableUrl);
}

async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const index = next;
      next += 1;
      results[index] = await fn(items[index], index);
    }
  }
  const n = Math.max(1, Math.min(limit, items.length || 1));
  await Promise.all(Array.from({ length: n }, worker));
  return results;
}

async function crawlSite() {
  const queue = [];
  const seen = new Set();
  const sitemapUrls = await loadSitemapUrls();
  for (const url of [...sitemapUrls, ...startUrls()]) {
    const canonical = canonicalizePageUrl(url);
    if (!seen.has(canonical) && isIndexableUrl(canonical)) {
      seen.add(canonical);
      queue.push(canonical);
    }
  }

  const pages = [];
  let cursor = 0;
  while (cursor < queue.length) {
    const batch = queue.slice(cursor, cursor + FETCH_CONCURRENCY);
    cursor += batch.length;
    const fetched = await mapLimit(batch, FETCH_CONCURRENCY, async (url) => {
      try {
        const res = await httpGet(url);
        if (!res.ok) {
          console.warn(`Skip ${url} (${res.status})`);
          return null;
        }
        return { url: canonicalizePageUrl(res.url || url), html: res.text };
      } catch (error) {
        console.warn(`Skip ${url}: ${error.message}`);
        return null;
      }
    });

    for (const page of fetched) {
      if (!page) continue;
      pages.push(page);
      const $ = loadHtml(page.html);
      for (const link of collectLinks($, page.url)) {
        if (!seen.has(link)) {
          seen.add(link);
          queue.push(link);
        }
      }
    }
    process.stdout.write(`\rCrawled ${pages.length} pages, discovered ${queue.length}`);
  }
  process.stdout.write('\n');
  return pages;
}

async function loadSidebarConfig() {
  const docsDir = path.join(repoRoot, 'docs');
  const i18nEnDocsCurrentDir = path.join(
    repoRoot,
    'i18n/en/docusaurus-plugin-content-docs/current',
  );
  return buildSidebarScopeConfig({
    docsDir,
    i18nEnDocsCurrentDir,
    siteDir: repoRoot,
    verbose: false,
  });
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

async function main() {
  if (!ADMIN_KEY) {
    console.error(
      'Missing ALGOLIA_ADMIN_API_KEY (Admin or Write API key). Copy .env.example to .env and fill it in.',
    );
    process.exit(1);
  }

  console.log(`Site: ${SITE_URL}`);
  console.log(`Index: ${APP_ID} / ${INDEX_NAME}`);
  console.log(`Dry run: ${DRY_RUN}`);

  const allPairs = getProductVersionPairs();
  if (allPairs.length === 0) {
    throw new Error('doc-scope-matrix.json has no product/version pairs');
  }
  console.log(
    `Product/version pairs: ${allPairs.map((p) => `${p.product} ${p.version}`).join(', ')}`,
  );

  const sidebarConfig = await loadSidebarConfig();
  const pages = await crawlSite();
  if (pages.length === 0) {
    throw new Error(`No pages crawled from ${SITE_URL}`);
  }

  const records = [];
  for (const page of pages) {
    const $ = loadHtml(page.html);
    const language =
      $('meta[name="docsearch:language"]').attr('content') ||
      $('html').attr('lang') ||
      localeFromUrl(page.url);
    const docusaurusTag =
      $('meta[name="docsearch:docusaurus_tag"]').attr('content') ||
      'docs-default-current';
    const docId = docIdFromUrl(page.url);
    const pagePairs = allPairs.filter((pair) =>
      shouldShowDoc(docId, pair.version, pair.product, sidebarConfig),
    );
    if (pagePairs.length === 0) {
      continue;
    }
    records.push(
      ...extractPageRecords($, page.url, pagePairs, language, docusaurusTag),
    );
  }

  console.log(`Built ${records.length} records from ${pages.length} pages`);
  if (records.length === 0) {
    throw new Error('No records generated');
  }

  const sample = records.find((r) => r.content) || records[0];
  console.log('Sample record:', {
    url: sample.url,
    language: sample.language,
    docusaurus_tag: sample.docusaurus_tag,
    product: sample.product,
    rdk_version: sample.rdk_version,
    type: sample.type,
  });

  if (DRY_RUN) {
    console.log('Dry run complete; skipping Algolia upload.');
    return;
  }

  console.log('Applying index settings...');
  await algoliaRequest(
    'PUT',
    `indexes/${encodeURIComponent(INDEX_NAME)}/settings`,
    INDEX_SETTINGS,
    ADMIN_KEY,
  );

  console.log('Clearing index...');
  const cleared = await algoliaRequest(
    'POST',
    `indexes/${encodeURIComponent(INDEX_NAME)}/clear`,
    {},
    ADMIN_KEY,
  );
  await waitTask(cleared.taskID, ADMIN_KEY);

  const batches = chunk(records, 1000);
  for (let i = 0; i < batches.length; i += 1) {
    const requests = batches[i].map((record) => ({
      action: 'addObject',
      body: record,
    }));
    const result = await algoliaRequest(
      'POST',
      `indexes/${encodeURIComponent(INDEX_NAME)}/batch`,
      { requests },
      ADMIN_KEY,
    );
    await waitTask(result.taskID, ADMIN_KEY);
    console.log(`Uploaded batch ${i + 1}/${batches.length} (${batches[i].length} records)`);
  }

  const searchKey = process.env.ALGOLIA_SEARCH_API_KEY || 'fb65c6e54a52ce6fba0645bd2630e79b';
  const probePair = allPairs[0];
  const probe = await algoliaRequest(
    'POST',
    `indexes/${encodeURIComponent(INDEX_NAME)}/query`,
    {
      query: 'RDK',
      hitsPerPage: 3,
      facetFilters: [
        `language:${DEFAULT_LOCALE}`,
        'docusaurus_tag:docs-default-current',
        `product:${probePair.product}`,
        `rdk_version:${probePair.version}`,
      ],
    },
    searchKey,
  );
  console.log(
    `Probe query "RDK" + language:${DEFAULT_LOCALE} + docusaurus_tag:docs-default-current + product:${probePair.product} + rdk_version:${probePair.version} => ${probe.nbHits} hits`,
  );
  if (!probe.nbHits) {
    throw new Error(
      `Index upload succeeded but probe query (product:${probePair.product}, rdk_version:${probePair.version}) returned 0 hits`,
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
