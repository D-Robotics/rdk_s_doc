#!/usr/bin/env node
/**
 * rdk_s_doc Internal Link Checker (CI)
 * 只检查站内链接和跨仓链接，不检查站外链接。
 * 有断链时 exit 1，无断链时 exit 0。
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = process.cwd();
const RDK_ALL = path.resolve(REPO_ROOT, '..');
const DOCS_DIR = path.join(REPO_ROOT, 'docs');
const I18N_DIR = path.join(REPO_ROOT, 'i18n', 'en', 'docusaurus-plugin-content-docs', 'current');

const CROSS_DOC_MAP = {
  'xburn_doc': path.join(RDK_ALL, 'xburn_doc', 'docs'),
  'rdk_x_doc': path.join(RDK_ALL, 'rdk_x_doc', 'docs'),
  'rdk_studio_doc': path.join(RDK_ALL, 'rdk_studio_doc', 'docs'),
  'tros_doc': path.join(RDK_ALL, 'tros_doc', 'docs'),
  'model_zoo_doc': path.join(RDK_ALL, 'model_zoo_doc', 'docs'),
  'case_doc': path.join(RDK_ALL, 'case_doc', 'docs'),
  'rdk_doc_center': path.join(RDK_ALL, 'rdk_doc_center', 'docs'),
};

// Load github-slugger
const GitHubSlugger = require(path.join(REPO_ROOT, 'node_modules', 'github-slugger'));
function makeSlugger() { return new GitHubSlugger(); }

// ==================== FILE MAP ====================

function walkDir(dir, fileList) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fp = path.join(dir, entry.name);
    if (entry.isDirectory() && !['.git', 'node_modules', 'build', '.docusaurus'].includes(entry.name)) walkDir(fp, fileList);
    else if (entry.isFile() && /\.(md|mdx)$/.test(entry.name)) fileList.push(fp);
  }
}

function buildFileMap(dirs) {
  const map = new Map();
  const allFiles = [];
  for (const dir of dirs) walkDir(dir, allFiles);
  for (const file of allFiles) {
    let rel = path.relative(REPO_ROOT, file).replace(/\\/g, '/');
    rel = rel.replace(/^docs\//, '').replace(/^i18n\/en\/docusaurus-plugin-content-docs\/current\//, '');
    rel = rel.replace(/\.(md|mdx)$/, '');
    rel = rel.split('/').map(s => s.replace(/^\d+_/, '')).join('/');
    if (!map.has(rel)) map.set(rel, []);
    map.get(rel).push(file);
    if (rel.endsWith('/index')) {
      const noIdx = rel.slice(0, -6) || '';
      if (!map.has(noIdx)) map.set(noIdx, []);
      map.get(noIdx).push(file);
    }
  }
  return map;
}

// ==================== HEADINGS ====================

function extractHeadings(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf-8');
  const headings = [];
  for (const line of content.split('\n')) {
    const match = line.match(/^(#{1,6})\s+(.+)/);
    if (!match) continue;
    const text = match[2].trim();
    const customMatch = text.match(/\{#([^}]+)\}$/);
    const cleanText = customMatch ? text.slice(0, customMatch.index).trim() : text;
    const slugText = cleanText.replace(/<[^>]+>/g, '');
    const slug = makeSlugger().slug(slugText);
    headings.push({ slug, customId: customMatch ? customMatch[1] : null });
  }
  return headings;
}

// ==================== LINK EXTRACTION ====================

function extractLinks(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const links = [];
  const seen = new Set();
  function add(type, url, text, line) {
    const key = `${type}:${url}:${line}`;
    if (seen.has(key)) return;
    seen.add(key);
    links.push({ type, url, text, line, file: filePath });
  }
  for (const match of content.matchAll(/\[([^\]]*)\]\(([^)]+)\)/g)) {
    const url = match[2].trim();
    if (url) add('md', url, match[1], content.slice(0, match.index).split('\n').length);
  }
  for (const match of content.matchAll(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>/gi)) {
    const url = match[1].trim();
    if (url) add('html', url, '(HTML)', content.slice(0, match.index).split('\n').length);
  }
  return links;
}

// ==================== CLASSIFY ====================

function classifyLink(url) {
  if (!url || url.startsWith('mailto:') || url.startsWith('javascript:') || url === '#') return 'skip';
  if (/^\d{4}-\d{2}-\d{2}[,\s]/.test(url)) return 'skip';
  if (/^https?:\/\//i.test(url)) {
    if (url.toLowerCase().includes('developer.d-robotics.cc')) return 'cross-doc';
    return 'external'; // skip in CI
  }
  return 'internal';
}

// ==================== VERIFY INTERNAL ====================

function verifyInternalLink(linkUrl, sourceFile, fileMap) {
  const sourceDir = path.dirname(sourceFile);
  let anchor = null, pathOnly = linkUrl;
  const ai = pathOnly.indexOf('#');
  if (ai !== -1) { anchor = pathOnly.slice(ai + 1); pathOnly = pathOnly.slice(0, ai); }

  if (!pathOnly) {
    if (anchor) {
      const headings = extractHeadings(sourceFile);
      if (!headings.find(h => h.slug === anchor || h.customId === anchor))
        return { status: 'broken', reason: `anchor "#${anchor}" not found on this page` };
    }
    return { status: 'ok' };
  }

  let resolvedPath;
  if (pathOnly.startsWith('/')) {
    const isI18n = sourceFile.includes('i18n');
    resolvedPath = path.join(isI18n ? I18N_DIR : DOCS_DIR, pathOnly);
  } else {
    resolvedPath = path.resolve(sourceDir, pathOnly);
  }

  let foundFile = null;
  for (const ext of ['', '.md', '.mdx', '/index.md', '/index.mdx']) {
    const c = resolvedPath + ext;
    if (fs.existsSync(c) && fs.statSync(c).isFile()) { foundFile = c; break; }
  }

  if (!foundFile) {
    let norm = pathOnly.startsWith('/') ? pathOnly.slice(1) : path.relative(DOCS_DIR, resolvedPath).replace(/\\/g, '/');
    if (!fileMap.has(norm)) {
      const i18nRel = path.relative(I18N_DIR, resolvedPath).replace(/\\/g, '/');
      if (fileMap.has(i18nRel)) norm = i18nRel;
    }
    if (fileMap.has(norm)) foundFile = fileMap.get(norm)[0];
    if (!foundFile) {
      const targetSeg = pathOnly.split('/').filter(Boolean).pop() || '';
      for (const [key, files] of fileMap) {
        if (key.split('/').filter(Boolean).pop() === targetSeg) { foundFile = files[0]; break; }
      }
    }
  }

  if (!foundFile) return { status: 'broken', reason: `target file not found: ${pathOnly}` };

  if (anchor) {
    const headings = extractHeadings(foundFile);
    if (!headings.find(h => h.slug === anchor || h.customId === anchor)) {
      return { status: 'broken', reason: `anchor "#${anchor}" not found in ${path.relative(REPO_ROOT, foundFile)}` };
    }
  }

  return { status: 'ok' };
}

// ==================== VERIFY CROSS-DOC ====================

function verifyCrossDocLink(url) {
  const match = url.match(/developer\.d-robotics\.cc\/([^\/?#]+)(\/[^?#]*)?/);
  if (!match) return { status: 'unverifiable', reason: 'not a doc page' };

  const repoKey = match[1];
  let docPath = (match[2] || '').replace(/\/$/, '');
  const qIdx = docPath.indexOf('?'); if (qIdx !== -1) docPath = docPath.slice(0, qIdx);
  const aIdx = docPath.indexOf('#'); let anchor = null;
  if (aIdx !== -1) { anchor = docPath.slice(aIdx + 1); docPath = docPath.slice(0, aIdx); }

  const sourceDir = CROSS_DOC_MAP[repoKey];
  if (!sourceDir) return { status: 'unverifiable', reason: `unknown repo: ${repoKey}` };

  const segments = docPath.split('/').filter(Boolean);
  const stripped = segments.map(s => s.replace(/^\d+_/, ''));

  const candidates = [];
  for (const segs of [segments, stripped]) {
    if (segs.length === 0) continue;
    candidates.push(path.join(sourceDir, ...segs) + '.md');
    candidates.push(path.join(sourceDir, ...segs) + '.mdx');
    candidates.push(path.join(sourceDir, ...segs, 'index.md'));
    candidates.push(path.join(sourceDir, ...segs, 'index.mdx'));
  }

  if (stripped.length > 0) {
    let searchDir = sourceDir;
    for (let i = 0; i < stripped.length - 1; i++) {
      if (!fs.existsSync(searchDir)) { searchDir = ''; break; }
      const found = fs.readdirSync(searchDir, { withFileTypes: true })
        .find(e => e.isDirectory() && e.name.replace(/^\d+_/, '') === stripped[i]);
      searchDir = found ? path.join(searchDir, found.name) : '';
    }
    if (searchDir && fs.existsSync(searchDir)) {
      const lastSeg = stripped[stripped.length - 1];
      for (const entry of fs.readdirSync(searchDir, { withFileTypes: true })) {
        if (entry.isFile() && entry.name.replace(/\.(md|mdx)$/, '').replace(/^\d+_/, '') === lastSeg) {
          candidates.push(path.join(searchDir, entry.name));
        }
      }
    }
  }

  let foundFile = null;
  for (const c of candidates) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) { foundFile = c; break; }
  }

  if (!foundFile) return { status: 'broken', reason: `cross-doc target not found in ${repoKey}: ${docPath}` };

  if (anchor) {
    const headings = extractHeadings(foundFile);
    if (!headings.find(h => h.slug === anchor || h.customId === anchor)) {
      return { status: 'broken', reason: `cross-doc anchor "#${anchor}" not found in ${repoKey}/${path.basename(foundFile)}` };
    }
  }

  return { status: 'ok' };
}

// ==================== MAIN ====================

function main() {
  const fileMap = buildFileMap([DOCS_DIR, I18N_DIR]);

  const allMdFiles = [];
  walkDir(DOCS_DIR, allMdFiles);
  walkDir(I18N_DIR, allMdFiles);

  const allLinks = [];
  for (const file of allMdFiles) allLinks.push(...extractLinks(file));

  const internal = [], crossDoc = [];
  for (const link of allLinks) {
    const c = classifyLink(link.url);
    if (c === 'internal') internal.push(link);
    else if (c === 'cross-doc') crossDoc.push(link);
  }

  function rel(f) { return path.relative(REPO_ROOT, f).replace(/\\/g, '/'); }

  const broken = [];

  for (const link of internal) {
    const result = verifyInternalLink(link.url, link.file, fileMap);
    if (result.status === 'broken') {
      broken.push({ file: rel(link.file), line: link.line, url: link.url, reason: result.reason, type: 'internal' });
    }
  }

  for (const link of crossDoc) {
    const result = verifyCrossDocLink(link.url);
    if (result.status === 'broken') {
      broken.push({ file: rel(link.file), line: link.line, url: link.url, reason: result.reason, type: 'cross-doc' });
    }
  }

  // Print report
  if (broken.length > 0) {
    console.log(`\n=== ${broken.length} broken internal/cross-doc links found ===\n`);
    for (const b of broken) {
      console.log(`  ${b.file}:${b.line}`);
      console.log(`    URL: ${b.url}`);
      console.log(`    Reason: ${b.reason}`);
      console.log();
    }
    console.log(`::error::${broken.length} broken links found`);
    process.exit(1);
  }

  console.log(`\n=== All ${internal.length + crossDoc.length} internal/cross-doc links OK ===`);
  console.log(`  Internal: ${internal.length} OK`);
  console.log(`  Cross-doc: ${crossDoc.length} OK`);
  process.exit(0);
}

main();