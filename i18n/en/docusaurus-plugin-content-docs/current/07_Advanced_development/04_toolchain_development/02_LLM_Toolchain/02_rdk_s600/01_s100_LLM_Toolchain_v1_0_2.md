---
sidebar_position: 1
sidebar_products: RDK S600
---

# LLM Toolchain_v1.0.2

On the RDK S600 platform, D-Robotics_LLM_S600 currently supports the following models and features:

**LLM**  
Supports single-turn and multi-turn dialogue for DeepSeek-R1-Distill-Qwen-1.5B, and Qwen3-0.6B/1.7B/4B/8B.

**VLM**  
Supports image-text processing for Qwen2.5-VL-3B/7B-Instruct, Qwen3-VL-2B/4B/8B-Instruct, and InternVL2-2B.

**VLA**  
Supports x86 simulation and S600 edge-side inference for Pi0, as well as hardware-in-the-loop experience.

**ASR**  
Supports Chinese and English audio recognition for whisper-medium.

## Download Methods

**D-Robotics_LLM_S600 Development Toolkit**

```bash 
wget https://d-robotics-aitoolchain.oss-cn-beijing.aliyuncs.com/llm_s600/1.0.2/D-Robotics_LLM_S600_1.0.2_SDK.tar.gz
```

**D-Robotics_LLM_S600 User Manual**

```bash
wget https://d-robotics-aitoolchain.oss-cn-beijing.aliyuncs.com/llm_s600/1.0.2/D-Robotics_LLM_S600_1.0.2_Doc.zip
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

#### VLM Benchmark

:::info

TTFT(ms)：The Time to First Token (TTFT) of the VLM is the sum of the ViT processing time and the prefill processing time.

:::

<table>
<colgroup>
<col style={{ width: '15%' }} />
<col style={{ width: '15%' }} />
<col style={{ width: '15%' }} />
<col style={{ width: '10%' }} />
<col style={{ width: '10%' }} />
<col style={{ width: '10%' }} />
<col style={{ width: '10%' }} />
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
<td>Qwen2.5-VL-<br/>3B-Instruct<br/>(448*448)</td>
<td style={{ whiteSpace: "nowrap" }}>vit 4<br/>prefill 4<br/>decode 4</td>
<td style={{ whiteSpace: "nowrap" }}>vit w8<br/>prefill w4<br/>decode w4</td>
<td>1024</td>
<td style={{ whiteSpace: "nowrap" }}>vit 39.1<br/>prefill 86.2<br/>all 125.3</td>
<td>70.4</td>
<td>3.5</td>
</tr>

<tr>
<td>Qwen2.5-VL-<br/>3B-Instruct<br/>(448*448)</td>
<td>vit 4<br/>prefill 4<br/>decode 4</td>
<td>vit w8<br/>prefill w8<br/>decode w8</td>
<td>1024</td>
<td>vit 38.5<br/>prefill 94.8<br/>all 133.3</td>
<td>47.1</td>
<td>5.1</td>
</tr>

<tr>
<td>Qwen2.5-VL-<br/>7B-Instruct<br/>(448*448)</td>
<td>vit 4<br/>prefill 4<br/>decode 4</td>
<td>vit w8<br/>prefill w4<br/>decode w4</td>
<td>1024</td>
<td>vit 39.1<br/>prefill 136.6<br/>all 175.7</td>
<td>40.5</td>
<td>6.1</td>
</tr>

<tr>
<td>Qwen3-VL-<br/>2B-Instruct<br/>(448*448)</td>
<td>vit 4<br/>prefill 4<br/>decode 4</td>
<td>vit w8<br/>prefill w4<br/>decode w4</td>
<td>1024</td>
<td>vit 27.0<br/>prefill 66.3<br/>all 93.3</td>
<td>95.9</td>
<td>3.6</td>
</tr>

<tr>
<td>Qwen3-VL-<br/>2B-Instruct<br/>(448*448)</td>
<td>vit 4<br/>prefill 4<br/>decode 4</td>
<td>vit w8<br/>prefill w8<br/>decode w8</td>
<td>1024</td>
<td>vit 26.6<br/>prefill 69.2<br/>all 95.8</td>
<td>71.3</td>
<td>4.2</td>
</tr>

<tr>
<td>Qwen3-VL-<br/>4B-Instruct<br/>(448*448)</td>
<td>vit 4<br/>prefill 4<br/>decode 4</td>
<td>vit w8<br/>prefill w4<br/>decode w4</td>
<td>1024</td>
<td>vit 26.7<br/>prefill 139.3<br/>all 166.0</td>
<td>53.4</td>
<td>5.8</td>
</tr>

<tr>
<td>Qwen3-VL-<br/>4B-Instruct<br/>(448*448)</td>
<td>vit 4<br/>prefill 4<br/>decode 4</td>
<td>vit w8<br/>prefill w8<br/>decode w8</td>
<td>1024</td>
<td>vit 26.7<br/>prefill 141.6<br/>all 168.3</td>
<td>35.8</td>
<td>7.4</td>
</tr>

<tr>
<td>Qwen3-VL-<br/>8B-Instruct<br/>(448*448)</td>
<td>vit 4<br/>prefill 4<br/>decode 4</td>
<td>vit w8<br/>prefill w4<br/>decode w4</td>
<td>1024</td>
<td>vit 37.2<br/>prefill 198.5<br/>all 235.7</td>
<td>35.1</td>
<td>8.1</td>
</tr>

<tr>
<td>InternVL2-2B<br/>(448*448)</td>
<td>vit 4<br/>prefill 4<br/>decode 4</td>
<td>vit w8<br/>prefill w4<br/>decode w4</td>
<td>1024</td>
<td>vit 32.0<br/>prefill 30.0<br/>all 62.0</td>
<td>119.1</td>
<td>2.0</td>
</tr>

</tbody>
</table>


#### VLA Benchmark

:::info
- all：The total latency of a single on-device run, including five stages: preprocess, vision, language, action, and postprocess.
- vision：The latency measured for the 3-core BPU performing parallel inference on three 224×224 images.
:::

<table>
<colgroup>
<col style={{ width: '10%' }} />
<col style={{ width: '10%' }} />
<col style={{ width: '20%' }} />
<col style={{ width: '10%' }} />
<col style={{ width: '10%' }} />
<col style={{ width: '10%' }} />
<col style={{ width: '10%' }} />
<col style={{ width: '10%' }} />
<col style={{ width: '10%' }} />
<col style={{ width: '10%' }} />
</colgroup>
<thead>
<tr>
<th><strong>model</strong></th>
<th><strong>BPU<br/>core num</strong></th>
<th><strong>qtype</strong></th>
<th><strong>all<br/>(ms)</strong></th>
<th><strong>pre-process<br/>(ms)</strong></th>
<th><strong>vision<br/>(ms)</strong></th>
<th><strong>language<br/>(ms)</strong></th>
<th><strong>action<br/>(ms)</strong></th>
<th><strong>post-process<br/>(ms)</strong></th>
<th><strong>memory<br/>(GB)</strong></th>
</tr>
</thead>
<tbody>

<tr>
<td>Pi0</td>
<td style={{ whiteSpace: "nowrap" }}>vision 1<br/>language 4<br/>action 4</td>
<td style={{ whiteSpace: "nowrap" }}>vision w8<br/>language w8<br/>action w8</td>
<td>98</td>
<td>1.5</td>
<td>18.5</td>
<td>39</td>
<td>38.5</td>
<td>0.05</td>
<td>4.4</td>
</tr>

</tbody>
</table>

#### ASR Benchmark

<table>
<colgroup>
<col style={{ width: '20%' }} />
<col style={{ width: '15%' }} />
<col style={{ width: '15%' }} />
<col style={{ width: '10%' }} />
<col style={{ width: '10%' }} />
<col style={{ width: '10%' }} />
<col style={{ width: '10%' }} />
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
<td>whisper-medium</td>
<td>encode 4<br/>prefill 1<br/>decode 1</td>
<td>encode w8<br/>prefill w8<br/>decode w8</td>
<td>128</td>
<td>110</td>
<td>60.5</td>
<td>1.9</td>
</tr>

</tbody>
</table>
