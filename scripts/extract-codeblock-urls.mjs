#!/usr/bin/env node
// 从 fenced code block 里抽取「自家域名」的链接，按来源文件分别输出，供 lychee 按来源分组报错。
//
// 为什么按来源分文件：lychee 的报错以「Errors in <输入文件>」分组。单文件输入时只能说
// 「在 codeblock-links.md 第 4 行」，读者无法定位到文档；按来源路径镜像目录后，报错直接显示
//   codeblock-links/docs/08_FAQ/01_hardware_and_system.md
// 即源码位置（去掉 codeblock-links/ 前缀就是文档路径）。
//
// 规则：
//   1. 只扫 ``` / ~~~ 围栏内的行，正文链接交给日常巡检，不重复查。
//   2. 只保留自家域名：*.d-robotics.cc、rdk-doc.oss-cn-beijing.aliyuncs.com、
//      d-robotics-aitoolchain.oss-cn-beijing.aliyuncs.com、d-robotics.github.io。
//      第三方示例（pip install、github clone、dashscope 等）整类跳过。
//   3. apt 源根地址（archive.d-robotics.cc/ubuntu-xxx）本身返回 404 是正常的，apt 实际请求的是
//      /dists/<代号>/。所以按同一行出现的代号（focal/jammy/noble）改写成
//      <base>/dists/<代号>/Release 再校验；行内没有代号就跳过（无法判定）。
//   4. `Apt-Sources:` 开头的是 apt-cache 输出快照（历史元数据），不是可用链接，跳过。
//   5. 去掉 markdown 链接残留：代码块里写成 [url](url) 时只保留第一个 url。
//
// 同一个 URL 出现在中英文两个文件时，lychee 会去重，只报在第一个出现的文件下。
//
// 用法：node scripts/extract-codeblock-urls.mjs <输出目录> <目录> [目录...]

import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';

const [outDir, ...roots] = process.argv.slice(2);
if (!outDir || roots.length === 0) {
  console.error('usage: node extract-codeblock-urls.mjs <outDir> <dir> [dir...]');
  process.exit(2);
}
if (basename(outDir) !== 'codeblock-links') {
  console.error(`refusing to clean ${outDir}: output dir must be named codeblock-links`);
  process.exit(2);
}
rmSync(outDir, { recursive: true, force: true });

const OWN_HOST =
  /(^|\.)d-robotics\.cc$|^rdk-doc\.oss-cn-beijing\.aliyuncs\.com$|^d-robotics-aitoolchain\.oss-cn-beijing\.aliyuncs\.com$|^d-robotics\.github\.io$/i;
const APT_ROOT = /^\/(ubuntu|debian)[^/]*$/;
const CODENAME = /\b(focal|jammy|noble|bionic|xenial)\b/;

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    if (e.name === 'node_modules' || e.name === '.git') continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(md|mdx)$/i.test(e.name)) out.push(p);
  }
  return out;
}

function urlsInCodeBlocks(text) {
  const found = [];
  let fence = null;
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*(`{3,}|~{3,})(.*)$/);
    if (m) {
      if (!fence) fence = m[1][0];
      else if (m[1][0] === fence) fence = null;
      continue;
    }
    if (!fence) continue;
    if (/^\s*Apt-Sources:/i.test(line)) continue;

    for (const raw of line.match(/https?:\/\/[^\s<>"'`]+/g) || []) {
      let url = raw.split('](')[0].replace(/[.,;:)\]}>，。、）】」"']+$/, '');
      let parsed;
      try {
        parsed = new URL(url);
      } catch {
        continue;
      }
      if (!OWN_HOST.test(parsed.hostname)) continue;
      if (APT_ROOT.test(parsed.pathname)) {
        const code = line.match(CODENAME);
        if (!code) continue;
        const base = `${parsed.protocol}//${parsed.host}${parsed.pathname}`;
        url = `${base}/dists/${code[1]}/Release`;
      }
      found.push(url);
    }
  }
  return found;
}

let scanned = 0;
let written = 0;
const total = new Set();
for (const root of roots) {
  for (const f of walk(root)) {
    scanned++;
    const urls = [...new Set(urlsInCodeBlocks(readFileSync(f, 'utf8')))].sort();
    if (urls.length === 0) continue;
    urls.forEach((u) => total.add(u));
    const dest = join(outDir, f);
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(
      dest,
      [`# 代码块内自家域名链接（来源：${f}）`, '', ...urls.map((u) => `- <${u}>`), ''].join('\n')
    );
    written++;
  }
}
mkdirSync(outDir, { recursive: true });
if (written === 0) {
  writeFileSync(join(outDir, 'README.md'), '# 本次扫描没有命中任何自家域名链接\n');
}
console.log(`scanned ${scanned} files, ${written} with links, ${total.size} unique URLs -> ${outDir}/`);
