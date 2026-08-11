// fix-cross-dir-links.mjs v2 — 修复跨目录搬迁/改名的相对链接(.md 和 slug 两种)。
// 幂等：先查「当前源目录 + 链接路径」是否已存在，存在则跳过(已正确)。
// 否则用「源旧目录 + 链接路径」解析旧目标，查 git 重命名映射得新目标，相对源新目录重算。
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(__dirname, "..");
const DOCS = path.join(REPO, "docs");
const EN = path.join(REPO, "i18n/en/docusaurus-plugin-content-docs/current");

const out = execSync("git diff --find-renames=60 -M --name-status HEAD~1 HEAD", { cwd: REPO, maxBuffer: 1<<28 }).toString();
const renames = new Map();
for (const line of out.split("\n")) {
	const m = line.match(/^R\d+\t(.*)\t(.*)$/);
	if (m) renames.set(m[1].replace(/\\/g,"/"), m[2].replace(/\\/g,"/"));
}
const inv = new Map();
for (const [o,n] of renames) inv.set(n,o);
console.log(`renames: ${renames.size}`);

function walkMd(root, cb){ if(!fs.existsSync(root))return; for(const ent of fs.readdirSync(root,{withFileTypes:true})){ const full=path.join(root,ent.name); if(ent.isDirectory()){ if(!ent.name.startsWith(".")&&ent.name!=="node_modules") walkMd(full,cb);} else if(ent.name.toLowerCase().endsWith(".md")) cb(full);} }
const LINK_RE=/\]\(([^)]+)\)/g;
let totalFiles=0,touchedFiles=0,fixedLinks=0,unresolved=0; const ul=[];
const repoRel=full=>path.relative(REPO,full).replace(/\\/g,"/");

function fixFile(full){
	totalFiles++;
	let content=fs.readFileSync(full,"utf8"); const orig=content;
	const newRel=repoRel(full);
	const oldRel=inv.get(newRel)||newRel;
	const oldDir=path.dirname(oldRel);
	const newDir=path.dirname(newRel);
	const newDirAbs=path.join(REPO,newDir);

	content=content.replace(LINK_RE,(fullM,urlPart)=>{
		const trimmed=urlPart.trim();
		if(/^(https?:|\/\/|mailto:|tel:|xref:)/.test(trimmed)) return fullM;
		const hashIdx=trimmed.indexOf("#");
		let pathPart=hashIdx>=0?trimmed.slice(0,hashIdx):trimmed;
		const hash=hashIdx>=0?trimmed.slice(hashIdx):"";
		if(!pathPart) return fullM;
		// 跳过根相对(无 ./ 且含 /)的绝对式路径(少见,留给手工)
		if(!pathPart.startsWith(".") && pathPart.includes("/")) {
			// 但可能是 slug 如 01_Quick_start/xxx — 尝试解析
		}
		const hasMd = pathPart.toLowerCase().endsWith(".md")||pathPart.toLowerCase().endsWith(".mdx");
		// 幂等：先按当前源目录解析，存在则跳过
		const probe = hasMd ? pathPart : (pathPart + ".md");
		if(fs.existsSync(path.resolve(newDirAbs, probe))) return fullM;
		// 旧目标(repo-relative)
		const oldTarget = path.normalize(path.join(oldDir, probe)).replace(/\\/g,"/");
		let newTarget = renames.get(oldTarget);
		if(!newTarget){
			// 目标未在映射：旧路径文件仍存在(目标没搬，但源搬了→相对深度要重算)
			if(fs.existsSync(path.join(REPO, oldTarget))) newTarget = oldTarget;
			else {
				// basename 模糊找
				const base=path.basename(oldTarget);
				const hits=[];
				for(const root of [DOCS,EN]){ if(!fs.existsSync(root))continue; const f=execSync(`find "${root}" -name "${base.replace(/"/g,'\\"')}"`,{maxBuffer:1<<24}).toString().trim(); if(f) for(const l of f.split("\n")) if(l) hits.push(l);}
				if(hits.length===1) newTarget=repoRel(hits[0]);
				else { unresolved++; ul.push(`${newRel} : ${pathPart} (old=${oldTarget},hits=${hits.length})`); return fullM; }
			}
		}
		const newTargetAbs=path.join(REPO,newTarget);
		let rel=path.relative(newDirAbs,newTargetAbs).replace(/\\/g,"/");
		if(!rel.startsWith(".")) rel="./"+rel;
		// 保持原形式：原 slug 则去 .md
		let outPath = hasMd ? rel : rel.replace(/\.md$/i,"");
		fixedLinks++;
		return `](${outPath}${hash})`;
	});
	if(content!==orig){ fs.writeFileSync(full,content); touchedFiles++; }
}
console.log("scanning docs/..."); walkMd(DOCS,fixFile);
console.log("scanning en/..."); walkMd(EN,fixFile);
console.log(`files=${totalFiles} touched=${touchedFiles} fixed=${fixedLinks} unresolved=${unresolved}`);
if(ul.length){ console.log("\n--- unresolved(前40) ---"); ul.slice(0,40).forEach(s=>console.log(s)); }
