// set-clean-slugs.mjs — 给新结构目录设干净 slug（剥 0N_ 前缀），覆盖旧遗留 slug。
// 只改指定目录的 _category_.json 的 link.slug，不动 label/position。
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(__dirname, "..");
const DOCS = path.join(REPO, "docs");
const EN = path.join(REPO, "i18n/en/docusaurus-plugin-content-docs/current");

// dir(rel docs/) → 新 slug
const SLUGS = {
	"03_Demos": "/Demos",
	"04_Simple_API": "/Simple_API",
	"01_Quick_start/03_install_os_and_setup": "/Quick_start/install_os_and_setup",
	"01_Quick_start/03_install_os_and_setup/rdk_s100": "/Quick_start/install_os_and_setup/rdk_s100",
	"01_Quick_start/03_install_os_and_setup/rdk_s600": "/Quick_start/install_os_and_setup/rdk_s600",
	"01_Quick_start/04_next_steps": "/Quick_start/next_steps",
	"01_Quick_start/04_next_steps/02_trosb": "/Quick_start/next_steps/trosb",
	"02_System_configuration/03_system_update": "/System_configuration/system_update",
	"02_System_configuration/05_config_txt": "/System_configuration/config_txt",
	"03_Demos/01_peripheral": "/Demos/peripheral",
	"03_Demos/01_peripheral/01_40pin": "/Demos/peripheral/40pin",
	"03_Demos/01_peripheral/01_40pin/01_s100": "/Demos/peripheral/40pin/s100",
	"03_Demos/01_peripheral/01_40pin/02_s600": "/Demos/peripheral/40pin/s600",
	"03_Demos/01_peripheral/02_camera": "/Demos/peripheral/camera",
	"03_Demos/02_multimedia_demo": "/Demos/multimedia_demo",
	"03_Demos/02_multimedia_demo/01_cdev": "/Demos/multimedia_demo/cdev",
	"03_Demos/02_multimedia_demo/02_pydev": "/Demos/multimedia_demo/pydev",
	"03_Demos/03_algorithm_demo": "/Demos/algorithm_demo",
	"03_Demos/03_algorithm_demo/02_classification": "/Demos/algorithm_demo/classification",
	"03_Demos/03_algorithm_demo/03_detection": "/Demos/algorithm_demo/detection",
	"03_Demos/03_algorithm_demo/04_instance_segmentation": "/Demos/algorithm_demo/instance_segmentation",
	"03_Demos/03_algorithm_demo/05_pose": "/Demos/algorithm_demo/pose",
	"03_Demos/03_algorithm_demo/06_speech": "/Demos/algorithm_demo/speech",
	"03_Demos/03_algorithm_demo/07_camera_streaming": "/Demos/algorithm_demo/camera_streaming",
	"03_Demos/04_demo_support": "/Demos/demo_support",
	"04_Simple_API/01_multimedia_api": "/Simple_API/multimedia_api",
	"04_Simple_API/01_multimedia_api/cdev": "/Simple_API/multimedia_api/cdev",
	"04_Simple_API/01_multimedia_api/pydev": "/Simple_API/multimedia_api/pydev",
	"04_Simple_API/02_inference_api": "/Simple_API/inference_api",
	"07_Advanced_development/06_environment_build": "/Advanced_development/environment_build",
	"07_Advanced_development/03_system_software": "/Advanced_development/system_software",
	"07_Advanced_development/03_system_software/01_deb": "/Advanced_development/system_software/deb",
	"07_Advanced_development/03_system_software/02_system_customization": "/Advanced_development/system_software/system_customization",
	"07_Advanced_development/04_driver_development": "/Advanced_development/driver_development",
	"07_Advanced_development/04_driver_development/13_driver_pcie": "/Advanced_development/driver_development/driver_pcie",
	"07_Advanced_development/04_driver_development/15_driver_hbmem": "/Advanced_development/driver_development/driver_hbmem",
	"07_Advanced_development/04_driver_development/16_driver_ethernet": "/Advanced_development/driver_development/driver_ethernet",
	"07_Advanced_development/04_driver_development/06_hardware_unit_test": "/Advanced_development/driver_development/hardware_unit_test",
	"07_Advanced_development/06_multimedia_development": "/Advanced_development/multimedia_development",
	"07_Advanced_development/06_multimedia_development/01_multimedia_api": "/Advanced_development/multimedia_development/multimedia_api",
	"07_Advanced_development/06_multimedia_development/02_multimedia_sample": "/Advanced_development/multimedia_development/multimedia_sample",
	"07_Advanced_development/06_multimedia_development/02_multimedia_sample_s600": "/Advanced_development/multimedia_development/multimedia_sample_s600",
	"07_Advanced_development/11_mcu_development": "/Advanced_development/mcu_development",
	"07_Advanced_development/11_mcu_development/12_mcu_port": "/Advanced_development/mcu_development/mcu_port",
	"07_Advanced_development/10_algorithm_toolchain": "/Advanced_development/algorithm_toolchain",
	"07_Advanced_development/10_algorithm_toolchain/01_algorithm_toolchain": "/Advanced_development/algorithm_toolchain/algorithm_toolchain",
	"07_Advanced_development/10_algorithm_toolchain/02_LLM_Toolchain": "/Advanced_development/algorithm_toolchain/LLM_Toolchain",
	"07_Advanced_development/10_algorithm_toolchain/02_LLM_Toolchain/01_rdk_s100": "/Advanced_development/algorithm_toolchain/LLM_Toolchain/rdk_s100",
	"07_Advanced_development/10_algorithm_toolchain/02_LLM_Toolchain/02_rdk_s600": "/Advanced_development/algorithm_toolchain/LLM_Toolchain/rdk_s600",
};
function upsert(root){
	let n=0;
	for(const [rel,slug] of Object.entries(SLUGS)){
		const dir=path.join(root,rel);
		if(!fs.existsSync(dir)||!fs.statSync(dir).isDirectory()) continue;
		const f=path.join(dir,"_category_.json");
		let obj={};
		if(fs.existsSync(f)){ try{obj=JSON.parse(fs.readFileSync(f,"utf8"));}catch{obj={};} }
		if(!obj.link||obj.link.type!=="generated-index") obj.link={type:"generated-index"};
		obj.link.slug=slug;
		fs.writeFileSync(f, JSON.stringify(obj,null,2)+"\n");
		n++;
	}
	return n;
}
console.log(`slugs set: docs=${upsert(DOCS)} en=${upsert(EN)}`);
