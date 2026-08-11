// set-category-positions.mjs — 给目标目录 upsert _category_.json 的 position(+label)。
// position 决定 renumber-docs-and-folders 的目录排序与 0N_ 前缀。
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(__dirname, "..");
const DOCS = path.join(REPO, "docs");
const EN = path.join(REPO, "i18n/en/docusaurus-plugin-content-docs/current");

// dir 相对 docs/ → [position, label]
const MAP = {
	// 章级
	"01_Quick_start": [1, "1. 快速开始"],
	"02_System_configuration": [2, "2. 系统配置"],
	"03_Demos": [3, "3. 开发示例"],
	"04_Simple_API": [4, "4. 简易 API"],
	"07_Advanced_development": [5, "5. 进阶开发"],
	"08_FAQ": [6, "6. 常见问题"],
	"09_Appendix": [7, "7. 附录"],
	// 第1章
	"01_Quick_start/01_hardware_introduction": [1, "1.1 硬件介绍"],
	"01_Quick_start/01_hardware_introduction/01_rdk_s100": [1, "1.1.1 RDK S100"],
	"01_Quick_start/01_hardware_introduction/01_rdk_s100/02_rdk_s100_camera_expansion_board": [1, "1.1.2.1 相机扩展板"],
	"01_Quick_start/01_hardware_introduction/02_rdk_s600": [2, "1.1.1 RDK S600"],
	"01_Quick_start/03_install_os_and_setup": [3, "1.3 烧录系统与配置"],
	"01_Quick_start/03_install_os_and_setup/rdk_s100": [1, "S100"],
	"01_Quick_start/03_install_os_and_setup/rdk_s600": [2, "S600"],
	"01_Quick_start/04_next_steps": [4, "1.4 下一步"],
	"01_Quick_start/04_next_steps/02_trosb": [2, "1.4.2 TogetheROS.Bot"],
	// 第2章
	"02_System_configuration/03_system_update": [3, "2.3 系统更新"],
	"02_System_configuration/05_config_txt": [5, "2.5 config.txt"],
	// 第3章
	"03_Demos/01_peripheral": [1, "3.1 外设应用示例"],
	"03_Demos/01_peripheral/01_40pin": [1, "3.1.1 扩展引脚应用"],
	"03_Demos/01_peripheral/01_40pin/01_s100": [1, "S100"],
	"03_Demos/01_peripheral/01_40pin/02_s600": [2, "S600"],
	"03_Demos/01_peripheral/02_camera": [2, "3.1.2 摄像头使用"],
	"03_Demos/02_multimedia_demo": [2, "3.2 多媒体示例"],
	"03_Demos/02_multimedia_demo/01_cdev": [1, "3.2.1 C 语言示例"],
	"03_Demos/02_multimedia_demo/02_pydev": [2, "3.2.2 Python 示例"],
	"03_Demos/03_algorithm_demo": [3, "3.3 算法示例"],
	"03_Demos/03_algorithm_demo/02_classification": [2, "3.3.2 图像分类"],
	"03_Demos/03_algorithm_demo/03_detection": [3, "3.3.3 目标检测"],
	"03_Demos/03_algorithm_demo/04_instance_segmentation": [4, "3.3.4 实例分割"],
	"03_Demos/03_algorithm_demo/05_pose": [5, "3.3.5 姿态估计"],
	"03_Demos/03_algorithm_demo/06_speech": [6, "3.3.6 自动语音识别"],
	"03_Demos/03_algorithm_demo/07_camera_streaming": [7, "3.3.7 摄像头+推理"],
	"03_Demos/04_demo_support": [4, "3.4 示例编程指南"],
	// 第4章
	"04_Simple_API/01_multimedia_api": [1, "4.1 多媒体"],
	"04_Simple_API/01_multimedia_api/cdev": [1, "4.1.1 C 接口"],
	"04_Simple_API/01_multimedia_api/pydev": [2, "4.1.2 Python 接口"],
	"04_Simple_API/02_inference_api": [2, "4.2 算法推理"],
	// 第5章
	"07_Advanced_development/01_hardware_development": [1, "5.1 硬件开发"],
	"07_Advanced_development/06_environment_build": [2, "5.2 开发环境与编译"],
	"07_Advanced_development/03_system_software": [3, "5.3 系统软件开发"],
	"07_Advanced_development/03_system_software/01_deb": [1, "5.3.1 deb 包开发"],
	"07_Advanced_development/03_system_software/02_system_customization": [2, "5.3.2 系统定制"],
	"07_Advanced_development/04_driver_development": [4, "5.4 驱动开发指南"],
	"07_Advanced_development/04_driver_development/13_driver_pcie": [10, "5.4.10 PCIe"],
	"07_Advanced_development/04_driver_development/15_driver_hbmem": [12, "5.4.12 HBMEM"],
	"07_Advanced_development/04_driver_development/16_driver_ethernet": [13, "5.4.13 以太网"],
	"07_Advanced_development/04_driver_development/06_hardware_unit_test": [18, "5.4.18 驱动功能单元测试"],
	"07_Advanced_development/06_multimedia_development": [5, "5.5 多媒体开发指南"],
	"07_Advanced_development/06_multimedia_development/01_multimedia_api": [1, "5.5.1 多媒体 API 参考"],
	"07_Advanced_development/06_multimedia_development/02_multimedia_sample": [2, "5.5.2 多媒体 sample"],
	"07_Advanced_development/06_multimedia_development/02_multimedia_sample_s600": [3, "S600 sample"],
	"07_Advanced_development/11_mcu_development": [6, "5.6 MCU 开发指南"],
	"07_Advanced_development/11_mcu_development/12_mcu_port": [13, "5.6.13 PORT 模块"],
	"07_Advanced_development/10_algorithm_toolchain": [7, "5.7 算法工具链开发指南"],
	"07_Advanced_development/10_algorithm_toolchain/01_algorithm_toolchain": [1, "5.7.1 算法工具链"],
	"07_Advanced_development/10_algorithm_toolchain/02_LLM_Toolchain": [2, "5.7.2 LLM 工具链"],
	"07_Advanced_development/10_algorithm_toolchain/02_LLM_Toolchain/01_rdk_s100": [1, "RDK S100"],
	"07_Advanced_development/10_algorithm_toolchain/02_LLM_Toolchain/02_rdk_s600": [2, "RDK S600"],
	// 第7章
	"09_Appendix/rdk-command-manual": [1, "7.1 RDK 专属命令"],
	"09_Appendix/linux-command-manual": [2, "7.2 Linux 命令"],
	// 版本发布
	"10_Release_Note/01_s100": [1, "RDK S100 版本发布"],
	"10_Release_Note/02_s600": [2, "RDK S600 版本发布"],
};

function upsert(root) {
	let n = 0;
	for (const [rel, [pos, label]] of Object.entries(MAP)) {
		const dir = path.join(root, rel);
		if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) continue;
		const f = path.join(dir, "_category_.json");
		let obj = {};
		if (fs.existsSync(f)) {
			try { obj = JSON.parse(fs.readFileSync(f, "utf8")); } catch { obj = {}; }
		}
		obj.position = pos;
		if (!obj.label || obj.label === "") obj.label = label;
		// link.description 给 generated-index 卡片用
		if (!obj.link) obj.link = { type: "generated-index" };
		if (!obj.link.description) obj.link.description = label;
		fs.writeFileSync(f, JSON.stringify(obj, null, 2) + "\n");
		n++;
	}
	return n;
}
const a = upsert(DOCS);
const b = upsert(EN);
console.log(`upserted docs=${a} en=${b}`);
