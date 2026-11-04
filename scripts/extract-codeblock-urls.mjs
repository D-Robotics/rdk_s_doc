#!/usr/bin/env node
// 从 fenced code block 里抽取「自家域名」的链接，生成一份 lychee 输入文件。
//
// 为什么单独做：lychee 默认跳过 .md/.mdx 的 fenced code block，正文巡检查不到这些链接；
// 而代码块恰恰是读者会照抄执行的部分（下载命令、apt 源、镜像地址），坏了后果更重。
//
// 规则：
//   1. 只扫 ``` / ~~~ 围栏内的行，正文链接交给日常巡检，不重复查。
//   2. 只保留自家域名：*.d-robotics.cc、rdk-doc.oss-cn-beijing.aliyuncs.com、
//      d-robotics-aitoolchain.oss-cn-beijing.aliyuncs.com、d-robotics.github.io。
//      第三方示例（pip install、github clone、dashscope、qianwen-res 等）整类跳过——
//      它们是教程里的示例地址，失效不代表文档有问题，还会被反爬/限流。
//   3. apt 源根地址（archive.d-robotics.cc/ubuntu-xxx）本身返回 404 是正常的，
//      apt 实际请求的是 /dists/<代号>/。所以按同一行出现的代号（focal/jammy/noble）
//      改写成 <base>/dists/<代号>/Release 再校验；行内没有代号就跳过（无法判定）。
//   4. `Apt-Sources:` 开头的是 apt-cache 输出快照（历史元数据），不是可用链接，跳过。
//   5. 去掉 markdown 链接残留：代码块里写成 [url](url) 时只保留第一个 url。
//
// 用法：node scripts/extract-codeblock-urls.mjs <输出文件> <目录> [目录...]

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [outFile, ...roots] = process.argv.slice(2);
if (!outFile || roots.length === 0) {
  console.error('usage: node extract-codeblock-urls.mjs <out.md> <dir> [dir...]');
  process.exit(2);
}

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
      // 5. [url](url) 残留：截到 "](" 为止
      let url = raw.split('](')[0].replace(/[.,;:)\]}>，。、）】」"']+$/, '');
      let parsed;
      try {
        parsed = new URL(url);
      } catch {
        continue;
      }
      if (!OWN_HOST.test(parsed.hostname)) continue;

      // 3. apt 源根地址改写
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

const uniq = new Set();
let scanned = 0;
for (const root of roots) {
  for (const f of walk(root)) {
    scanned++;
    for (const u of urlsInCodeBlocks(readFileSync(f, 'utf8'))) uniq.add(u);
  }
}

const sorted = [...uniq].sort();
writeFileSync(
  outFile,
  [
    `# 代码块内自家域名链接（${scanned} 个文件，${sorted.length} 个唯一 URL）`,
    '',
    ...sorted.map((u) => `- <${u}>`),
    '',
  ].join('\n')
);
console.log(`scanned ${scanned} files, extracted ${sorted.length} unique URLs -> ${outFile}`);
