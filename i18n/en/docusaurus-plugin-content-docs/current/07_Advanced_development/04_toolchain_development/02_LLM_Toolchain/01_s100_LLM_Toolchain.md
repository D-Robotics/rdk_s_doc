---
sidebar_position: 1
sidebar_products: RDK S100
---

# 7.4.2.1 RDK S100 LLM Toolchain

## RDK S100 1.0.0 Large Model Toolchain

On the RDK S100/S100P platform, D-Robotics_LLM_S100 currently supports the following models and features:

**LLM**
1. DeepSeek-R1-Distill-Qwen: Supports DeepSeek-R1-Distill-Qwen-1.5B and DeepSeek-R1-Distill-Qwen-7B, providing model quantization, simple conversation, multi-turn dialogue, and PPL evaluation features.

2. InternLM2: Supports InternLM2-1.8B, providing model quantization, simple conversation, and PPL evaluation features.

3. Qwen2.5: Supports Qwen2.5-1.5B, Qwen2.5-7B, Qwen2.5-1.5B-Instruct, and Qwen2.5-7B-Instruct, providing model quantization, simple conversation, multi-turn dialogue (Instruct only), and PPL evaluation features.

**Multimodal**
1. Qwen2.5-Omni: Supports Qwen2.5-Omni-3B, providing model quantization, offline operation, and online operation features.

## Download Methods
**D-Robotics_LLM_S100 Development Toolkit**

```bash 
wget https://d-robotics-aitoolchain.oss-cn-beijing.aliyuncs.com/llm_s100/1.0.0/D-Robotics_LLM_S100_1.0.0_SDK.tar.gz
```

**D-Robotics_LLM_S100 User Manual**

```bash
wget https://d-robotics-aitoolchain.oss-cn-beijing.aliyuncs.com/llm_s100/1.0.0/D-Robotics_LLM_S100_1.0.0_Doc.zip
```

**D-Robotics_LLM_S100 Compiled Models**

After downloading the development toolkit, check the oellm_runtime/model/resolve_model_nash-m.txt file for the download link.


## Model Performance Benchmark

### Test Conditions

- Test Development Board: S100P.

- Performance Data Acquisition: Test a single prompt, capturing TTFT (Time To First Token) and TPS (Tokens Per Second) metrics.

- Python Version: Python 3.10.

- Runtime Environment: Linux.

### Measured Data

#### DeepSeek-R1-Distill-Qwen Models

| model | platform | dtype | seqlen | max context | TTFT(ms) | TPS | memory(GB) |
|-------|----------|-------|--------|-------------|----------|-----|------------|
| DeepSeek-R1-Distill-Qwen-1.5B | S100P | q8 | 256 | 1024 | 109 | 27.08 | 1.7 |
| DeepSeek-R1-Distill-Qwen-1.5B | S100P | q4 | 256 | 1024 | 108 | 39.49 | 1.1 |
| DeepSeek-R1-Distill-Qwen-1.5B | S100P | q8 | 256 | 4096 | 226 | 23.80 | 1.8 |
| DeepSeek-R1-Distill-Qwen-1.5B | S100P | q4 | 256 | 4096 | 224 | 32.35 | 1.2 |
| DeepSeek-R1-Distill-Qwen-7B | S100P | q8 | 256 | 1024 | 544 | 6.76 | 7.4 |

#### InternLM2 Models

| model | platform | dtype | seqlen | max context | TTFT(ms) | TPS | memory(GB) |
|-------|----------|-------|--------|-------------|----------|-----|------------|
| InternLM2-1.8B | S100P | q8 | 256 | 1024 | 132 | 23.83 | 1.8 |

#### Qwen2.5 Models

| model | platform | dtype | seqlen | max context | TTFT(ms) | TPS | memory(GB) |
|-------|----------|-------|--------|-------------|----------|-----|------------|
| Qwen2.5-1.5B | S100P | q8 | 256 | 1024 | 130 | 24.04 | 1.8 |
| Qwen2.5-1.5B-Instruct | S100P | q8 | 256 | 1024 | 130 | 24.40 | 1.8 |
| Qwen2.5-7B | S100P | q8 | 256 | 1024 | 535 | 6.67 | 7.4 |
| Qwen2.5-7B-Instruct | S100P | q8 | 256 | 1024 | 534 | 6.75 | 7.4 |

#### Qwen2.5-Omni Models

| model | platform | dtype | seqlen | max context | TTFT(ms) | TPS | memory(GB) |
|-------|----------|-------|--------|-------------|----------|-----|------------|
| Qwen2.5-Omni-3B | S100P | q8 | 256 | 2048 | 285 | 14.03 | 5.5 |