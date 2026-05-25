---
sidebar_position: 1
sidebar_products: RDK S600
---

# 7.4.2.2 RDK S600 LLM Toolchain

## RDK S600 1.0.0 Large Model Toolchain  

On the RDK S600 platform, D-Robotics_LLM_S600 currently supports the following models and functionalities:

**LLM**  
Supports single-turn and multi-turn conversations for DeepSeek-R1-Distill-Qwen-1.5B, Qwen3~0.6B/1.7B/4B/8B.

**VLM**  
Supports image and text processing for Qwen2.5-VL-3B/7B-Instruct, Qwen3-VL-2B/4B/8B-Instruct, InternVL2~2B.

**VLA**  
Supports x86 emulation and S600 edge-side inference for Pi0, as well as hardware-in-the-loop experiences.

**ASR**  
Supports Chinese and English audio recognition for whisper-medium.

## Download Methods

**D-Robotics_LLM_S600 Development Toolkit**

```bash 
wget https://d-robotics-aitoolchain.oss-cn-beijing.aliyuncs.com/llm_s600/1.0.0/D-Robotics_LLM_S600_1.0.0_SDK.tar.gz
```

**D-Robotics_LLM_S600 User Manual**

```bash
wget https://d-robotics-aitoolchain.oss-cn-beijing.aliyuncs.com/llm_s600/1.0.0/D-Robotics_LLM_S600_1.0.0_Doc.zip
```

**D-Robotics_LLM_S600 Compiled Models**  

After downloading the development toolkit, refer to `oellm_runtime/model/resolve_model_nash-p.md` for download links.


## Model Performance Benchmark


### Test Conditions

- Development Board: RDK S600

- Operating Environment: Linux

### Metrics and Statistics

- model: Name of the model.

- BPU core num: Number of BPU (Brain Processing Unit) cores utilized during model execution.

- qtype: Quantization precision of the model.

- max context: Maximum cumulative token sequence length the model can handle.

- TTFT(ms): Time To First Token; the latency for generating the first token.

- Decode(TPS): Tokens Per Second; the generation rate during the decoding stage.

- memory(GB): Memory usage of the model.


### Measured Data

<table>
<colgroup>
<col style={{ width: '20%' }} />
<col style={{ width: '15%' }} />
<col style={{ width: '6%' }} />
<col style={{ width: '6%' }} />
<col style={{ width: '12%' }} />
<col style={{ width: '12%' }} />
<col style={{ width: '12%' }} />
<col style={{ width: '12%' }} />
</colgroup>
<thead>
<tr>
<th><strong>model</strong></th>
<th><strong>BPU<br/>core num</strong></th>
<th><strong>qtype</strong></th>
<th><strong>max context</strong></th>
<th><strong>TTFT<br/>(ms)</strong></th>
<th><strong>Decode<br/>(TPS)</strong></th>
<th><strong>memory<br/>(GB)</strong></th>
</tr>
</thead>
<tbody>

<tr>
<td>DeepSeek-R1-Distill-Qwen-1.5B</td>
<td>prefill 2<br/>decode 2</td>
<td style={{ whiteSpace: "nowrap" }}>prefill w4<br/>decode w4</td>
<td>4096</td>
<td>68.9</td>
<td>92.4</td>
<td>2.2</td>
</tr>

<tr>
<td>Qwen3-0.6B</td>
<td>prefill 4<br/>decode 4</td>
<td>prefill w8<br/>decode w8</td>
<td>4096</td>
<td>75.4</td>
<td>92.9</td>
<td>3.0</td>
</tr>

<tr>
<td>Qwen3-1.7B</td>
<td>prefill 4<br/>decode 4</td>
<td>prefill w4<br/>decode w4</td>
<td>4096</td>
<td>91.2</td>
<td>75.0</td>
<td>3.7</td>
</tr>

<tr>
<td>Qwen3-4B</td>
<td>prefill 4<br/>decode 4</td>
<td>prefill w4<br/>decode w4</td>
<td>4096</td>
<td>232.1</td>
<td>45.8</td>
<td>6.6</td>
</tr>

<tr>
<td>Qwen3-4B</td>
<td>prefill 4<br/>decode 4</td>
<td>prefill w8<br/>decode w8</td>
<td>4096</td>
<td>235.3</td>
<td>32.3</td>
<td>8.3</td>
</tr>

<tr>
<td>Qwen3-8B</td>
<td>prefill 4<br/>decode 4</td>
<td>prefill w4<br/>decode w4</td>
<td>4096</td>
<td>283.6</td>
<td>31.4</td>
<td>9.1</td>
</tr>

</tbody>
</table>
