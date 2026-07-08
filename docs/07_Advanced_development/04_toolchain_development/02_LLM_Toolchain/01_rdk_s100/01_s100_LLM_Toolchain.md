---
sidebar_position: 1
sidebar_products: RDK S100
---

# 7.4.2.1 RDK S100 LLM 工具链

## RDK S100 1.0.0 大模型工具链

在 RDK S100/S100P 平台上，D-Robotics_LLM_S100 目前支持以下模型和功能： 

**LLM**
1. DeepSeek-R1-Distill-Qwen：支持 DeepSeek-R1-Distill-Qwen-1.5B 和 DeepSeek-R1-Distill-Qwen-7B，提供模型量化、简单会话、多轮对话、PPL 评估功能。 

2. InternLM2：支持 InternLM2-1.8B，提供模型量化、简单会话、PPL 评估功能。 

3. Qwen2.5：支持 Qwen2.5-1.5B、Qwen2.5-7B、Qwen2.5-1.5B-Instruct 和 Qwen2.5-7B-Instruct，提供模型量化、简单会话、多轮对话（仅 Instruct）、PPL 评估功能。 

**多模态**
1. Qwen2.5-Omni：支持 Qwen2.5-Omni-3B，提供模型量化、离线运行、在线运行功能。

## 下载方式
**D-Robotics_LLM_S100 开发工具包**

```bash 
wget https://d-robotics-aitoolchain.oss-cn-beijing.aliyuncs.com/llm_s100/1.0.0/D-Robotics_LLM_S100_1.0.0_SDK.tar.gz
```

**D-Robotics_LLM_S100 用户手册**

```bash
wget https://d-robotics-aitoolchain.oss-cn-beijing.aliyuncs.com/llm_s100/1.0.0/D-Robotics_LLM_S100_1.0.0_Doc.zip
```

**D-Robotics_LLM_S100 已编译模型**

下载开发工具包后，查看 oellm_runtime/model/resolve_model_nash-m.txt 获取下载链接。

## 模型性能 Benchmark


### 测试条件

- 测试开发板：RDK S100P。

- 性能数据获取：测试单条 prompt，取TTFT（首token延迟）和TPS（平均每秒 Token 数）指标。

- Python版本：Python3.10。

- 运行环境：Linux。

### 实测数据

#### DeepSeek-R1-Distill-Qwen 模型

| model | platform | dtype | seqlen | max context | TTFt(ms) | TPS | memory(GB) |
|-------|----------|-------|--------|-------------|----------|-----|------------|
| DeepSeek-R1-Distill-Qwen-1.5B | S100P | q8 | 256 | 1024 | 109 | 27.08 | 1.7 |
| DeepSeek-R1-Distill-Qwen-1.5B | S100P | q4 | 256 | 1024 | 108 | 39.49 | 1.1 |
| DeepSeek-R1-Distill-Qwen-1.5B | S100P | q8 | 256 | 4096 | 226 | 23.80 | 1.8 |
| DeepSeek-R1-Distill-Qwen-1.5B | S100P | q4 | 256 | 4096 | 224 | 32.35 | 1.2 |
| DeepSeek-R1-Distill-Qwen-7B | S100P | q8 | 256 | 1024 | 544 | 6.76 | 7.4 |


#### InternLM2 模型

| model | platform | dtype | seqlen | max context | TTFt(ms) | TPS | memory(GB) |
|-------|----------|-------|--------|-------------|----------|-----|------------|
| InternLM2-1.8B | S100P | q8 | 256 | 1024 | 132 | 23.83 | 1.8 |

#### Qwen2.5 模型

| model | platform | dtype | seqlen | max context | TTFt(ms) | TPS | memory(GB) |
|-------|----------|-------|--------|-------------|----------|-----|------------|
| Qwen2.5-1.5B | S100P | q8 | 256 | 1024 | 130 | 24.04 | 1.8 |
| Qwen2.5-1.5B-Instruct | S100P | q8 | 256 | 1024 | 130 | 24.40 | 1.8 |
| Qwen2.5-7B | S100P | q8 | 256 | 1024 | 535 | 6.67 | 7.4 |
| Qwen2.5-7B-Instruct | S100P | q8 | 256 | 1024 | 534 | 6.75 | 7.4 |

#### Qwen2.5-Omni 模型

| model | platform | dtype | seqlen | max context | TTFt(ms) | TPS | memory(GB) |
|-------|----------|-------|--------|-------------|----------|-----|------------|
| Qwen2.5-Omni-3B | S100P | q8 | 256 | 2048 | 285 | 14.03 | 5.5 |

