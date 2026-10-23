---
sidebar_position: 1
sidebar_products: RDK S600
---

# 大模型工具链_v2.0.0

D-Robotics_LLM_2.0.0 版本适用于 S600 V5.1.0 及以上版本计算平台。


## 主要功能

**自定义模型部署**  
- 覆盖校准、量化、编译完整环节，生成用于端侧部署的模型产物。
- 非官方适配模型，可按适配流程自行扩展完成量化部署，无需等待官方适配。


**Agent 辅助开发**  
- 附量化、部署、排障等丰富的 Agent Skills，主流 AI 编程助手可直接调用，高效完成模型落地。


**VLA 支持**  
- 覆盖 VLA 模型量化、调试、部署与 C++ 集成的完整链路。


**量化加速方案**  
- 支持 w4/w8 量化规格，以及投机采样等进阶加速方案。
- 量化各阶段及板端精度可评测验证，保障精度对齐。


**端侧推理引擎**  
- 支持文本、多模态、动作生成等模型的端侧推理，LLM/VLM 支持 Eagle3/DFlash 推理加速功能。
- 支持多会话并行推理、上下文前缀缓存匹配、生成打断等推理特性，提供分级 C++ API 用于自定义开发集成。
- 内置 OpenAI 兼容 HTTP 服务，支持流式输出、工具调用与多模态输入，可直接对外提供推理服务。


## 已适配模型

- **LLM**：MiniCPM5-2B，Phi-4-mini，Qwen2.5-3B、Qwen3-0.6B/1.7B/4B/8B
- **VLM**：Qwen2.5-VL-3B/7B，Qwen3-VL-2B/4B/8B，Qwen3.5-2B/4B/9B，InternVL2-2B/2.5-1B/3.5-1B
- **OMNI**：Gemma4-E2B/E4B
- **ASR**：Qwen3-ASR-0.6/1.7B，whisper-small/medium
- **VLA**：Pi0/0.5，Smolvla，Spirit1.5


## 下载地址

- [**下载 LLM 开发工具包**](https://d-robotics-aitoolchain.oss-cn-beijing.aliyuncs.com/llm/2.0.0/D-Robotics_LLM_2.0.0_S600_S100_SDK.tar.gz)

- [**用户手册在线阅读地址**](https://developer.d-robotics.cc/oe_llm_s600_doc/guide/sdk_introduction.html)

- **D-Robotics_LLM 已支持模型**  

    下载开发工具包后：

    - 查看 oellm_runtime_s600/model/resolve_model_s600.md，获取 S600 的端侧模型下载链接。
    - 查看 oellm_runtime_s100/model/resolve_model_s100.md，获取 S100P/S100 的端侧模型下载链接。

## 模型性能 benchmark

[**模型性能 benchmark**](https://developer.d-robotics.cc/oe_llm_s600_doc/guide/benchmark/note.html)
