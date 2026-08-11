// fix-absolute-links.mjs — 把绝对/根相对链接里的旧 slug 改成新 slug。
// 只改 markdown 链接 ](...) 内的路径，跳过 http(s)/mailto。zh+en。
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(__dirname, "..");
const DOCS = path.join(REPO, "docs");
const EN = path.join(REPO, "i18n/en/docusaurus-plugin-content-docs/current");

// 旧 → 新(按长度降序应用，避免前缀误替)
const REPL = [
	["/Advanced_development/linux_development/kernel_headers", "/Advanced_development/system_software/kernel_headers"],
	["/Advanced_development/linux_development/log_introduction", "/Advanced_development/system_software/log_introduction"],
	["/Advanced_development/linux_development/08_log_introduction", "/Advanced_development/system_software/log_introduction"],
	["/Advanced_development/linux_development/02_kernel_headers", "/Advanced_development/system_software/kernel_headers"],
	["/Advanced_development/03_multimedia_development", "/Advanced_development/multimedia_development"],
	["/Advanced_development/04_toolchain_development", "/Advanced_development/algorithm_toolchain"],
	["/Advanced_development/05_MCU_development", "/Advanced_development/mcu_development"],
	["/Advanced_development/driver_development_s100_s600", "/Advanced_development/driver_development"],
	["/Basic_Application/Image/", "/Demos/peripheral/camera/"],
	["/Basic_Application/", "/Demos/"],
	["/Basic_Development/", "/Simple_API/"],
	["/Quick_start/install_os/", "/Quick_start/install_os_and_setup/"],
	["/System_configuration/network_bluetooth", "/System_configuration/network_config"],
	["rdk_s100_camera_expansion_board", "rdk_camera_expansion_board"],
	// rdk_gen: 从 system_software/kernel_debug 指向 environment_build
	["../rdk_gen#", "../environment_build/03_rdk_gen.md#"],
	["../rdk_gen)", "../environment_build/03_rdk_gen.md)"],
];
REPL.sort((a,b)=>b[0].length-a[0].length);

function walkMd(root,cb){ if(!fs.existsSync(root))return; for(const ent of fs.readdirSync(root,{withFileTypes:true})){ const full=path.join(root,ent.name); if(ent.isDirectory()){ if(!ent.name.startsWith(".")&&ent.name!=="node_modules") walkMd(full,cb);} else if(ent.name.toLowerCase().endsWith(".md")) cb(full);} }
const LINK_RE=/\]\(([^)]+)\)/g;
let touched=0, fixed=0;
function fixFile(full){
	let c=fs.readFileSync(full,"utf8"); const orig=c;
	c=c.replace(LINK_RE,(m,url)=>{
		const t=url.trim();
		if(/^(https?:|\/\/|mailto:|tel:|xref:)/.test(t)) return m;
		let p=t;
		for(const [from,to] of REPL) p=p.split(from).join(to);
		if(p!==t){ fixed++; return "]("+p+")"; }
		return m;
	});
	if(c!==orig){ fs.writeFileSync(full,c); touched++; }
}
walkMd(DOCS,fixFile); walkMd(EN,fixFile);
console.log(`touched=${touched} fixed=${fixed}`);
