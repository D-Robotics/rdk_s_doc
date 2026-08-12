---
sidebar_position: 2
sidebar_products: RDK S600
---

# LLM Toolchain_v1.0.5

On the RDK S600 platform, D-Robotics_LLM_S600 currently supports the following models and features:

**LLM**  
- Supports DeepSeek-R1-Distill-Qwen-1.5B and Qwen3-0.6B/1.7B/4B/8B for both single-turn and multi-turn conversations.
- Supports speculative decoding for Qwen3-8B, with both Common and Eagle3 modes.


**VLM**  
Supports Qwen2.5-VL-3B/7B-Instruct and Qwen3-VL-2B/4B/8B-Instruct for multi-image and text processing.


**VLA**  
- Supports Pi0, Pi0.5, and SmolVLA for x86 simulation, on-device inference on S600, and hardware-in-the-loop (HIL) evaluation.
- Supports Spirit1.5 for on-device inference on S600.



**ASR**  
Supports whisper-medium for Chinese and English speech recognition.

**Gemma**  
Supports Gemma-4-E2B-it for multi-image and text understanding.


## Download Methods

**D-Robotics_LLM_S600 Development Toolkit**

```bash 
wget https://d-robotics-aitoolchain.oss-cn-beijing.aliyuncs.com/llm_s600/1.0.5/D-Robotics_LLM_S600_1.0.5_SDK.tar.gz
```

**D-Robotics_LLM_S600 User Manual**

```bash
wget https://d-robotics-aitoolchain.oss-cn-beijing.aliyuncs.com/llm_s600/1.0.5/D-Robotics_LLM_S600_1.0.5_Doc.zip
```

**D-Robotics_LLM_S600 Compiled Models**  

After downloading the development toolkit, refer to `oellm_runtime/model/resolve_model_nash-p.md` for download links.

## Model Performance Benchmark

### Test Conditions

- Test board: RDK S600.

- Operating environment: Linux.

### Statistics

- **model**：Model name.

- **BPU core num**：Number of BPU cores occupied by the model at runtime.

- **qtype**：Quantization precision of the model.

- **sequence length**：Token sequence length processed in a single pass during the prefill stage.

- **max context**：Maximum cumulative token sequence length the model can handle.

- **RTF**: The ratio of the time consumed to process a piece of audio to the actual duration of that audio.

- **TTFT(ms)**：Time to first token.

- **Decode(TPS)**：Number of tokens generated per second during the decode stage.

- **memory(GB)**：The total memory usage of Linux memory and ION memory when the model is running.

### Test Data

#### LLM  Benchmark

**Standard Mode**

General configuration:：

- **BPU core num**：All use 4 BPU cores

- **sequence length**：All use 256

- **max context**：All use 2048

<table>
<colgroup>
<col style={{ width: '25%' }} />
<col style={{ width: '15%' }} />
<col style={{ width: '10%' }} />
<col style={{ width: '10%' }} />
<col style={{ width: '10%' }} />
</colgroup>
<thead>
<tr>
<th><strong>model</strong></th>
<th><strong>qtype</strong></th>
<th><strong>TTFT<br/>(ms)</strong></th>
<th><strong>Decode<br/>(TPS)</strong></th>
<th><strong>memory<br/>(GB)</strong></th>
</tr>
</thead>
<tbody>

<tr>
<td>DeepSeek-R1-Distill-Qwen-1.5B</td>
<td style={{ whiteSpace: 'nowrap' }}>prefill w4<br/>decode w4</td>
<td>45.2</td>
<td>106.06</td>
<td>2.2</td>
</tr>

<tr>
<td>Qwen3-0.6B</td>
<td>prefill w8<br/>decode w8</td>
<td>34.1</td>
<td>112.51</td>
<td>2.0</td>
</tr>

<tr>
<td>Qwen3-1.7B</td>
<td>prefill w4<br/>decode w4</td>
<td>42.4</td>
<td>86.28</td>
<td>2.7</td>
</tr>

<tr>
<td>Qwen3-4B</td>
<td>prefill w4<br/>decode w4</td>
<td>72.6</td>
<td>52.79</td>
<td>4.2</td>
</tr>

<tr>
<td>Qwen3-4B</td>
<td>prefill w8<br/>decode w8</td>
<td>75.4</td>
<td>35.71</td>
<td>5.9</td>
</tr>

<tr>
<td>Qwen3-8B</td>
<td>prefill w4<br/>decode w4</td>
<td>103.5</td>
<td>34.62</td>
<td>6.8</td>
</tr>

</tbody>
</table>

**Speculative Sampling Mode**


General configuration：

- **BPU core num**：All use 4 BPU cores

- **qtype**：The base model all uses w4, and the draft model all uses w8

- **sequence length**：All use 256

- **max context**：All use 2048

:::info

The Decode (TPS) of speculative sampling is not fixed. Here the maximum value after multiple tests is shown.

:::

<table>
<colgroup>
<col style={{ width: '10%' }} />
<col style={{ width: '25%' }} />
<col style={{ width: '20%' }} />
<col style={{ width: '15%' }} />
<col style={{ width: '15%' }} />
<col style={{ width: '15%' }} />
</colgroup>
<thead>
<tr>
<th><strong>mode</strong></th>
<th><strong>base model</strong></th>
<th><strong>draft model</strong></th>
<th><strong>TTFT<br/>(ms)</strong></th>
<th><strong>Decode<br/>(TPS)</strong></th>
<th><strong>memory<br/>(GB)</strong></th>
</tr>
</thead>
<tbody>

<tr>
<td>common</td>
<td>Qwen3-8B_draft_base</td>
<td>Qwen3-0.6B</td>
<td>145.1</td>
<td>44.36</td>
<td>8.1</td>
</tr>

<tr>
<td>eagle3</td>
<td>Qwen3-8B_eagle3_base</td>
<td>Qwen3-8b_eagle3</td>
<td>113.2</td>
<td>90.41</td>
<td>8.0</td>
</tr>

</tbody>
</table>





#### VLM Benchmark

General configuration:

- **Image resolution:** All use 448*448

- **BPU core num:** All use 4 BPU cores

- **max context:** All use 1024

:::info

**TTFT(ms):** The time to first token of the VLM is the sum of the vit processing time and the prefill processing time.

:::

<table>
<colgroup>
<col style={{ width: '15%' }} />
<col style={{ width: '15%' }} />
<col style={{ width: '10%' }} />
<col style={{ width: '15%' }} />
<col style={{ width: '10%' }} />
<col style={{ width: '10%' }} />
</colgroup>
<thead>
<tr>
<th><strong>model</strong></th>
<th><strong>qtype</strong></th>
<th><strong>sequence<br/>length</strong></th>
<th><strong>TTFT<br/>(ms)</strong></th>
<th><strong>Decode<br/>(TPS)</strong></th>
<th><strong>memory<br/>(GB)</strong></th>
</tr>
</thead>
<tbody>

<tr>
<td>Qwen2.5-VL-<br/>3B-Instruct</td>
<td style={{ whiteSpace: 'nowrap' }}>vit w8<br/>prefill w4<br/>decode w4</td>
<td>256</td>
<td style={{ whiteSpace: 'nowrap' }}>vit 38.8<br/>prefill 85.5<br/>all 124.3</td>
<td>70.32</td>
<td>3.6</td>
</tr>

<tr>
<td>Qwen2.5-VL-<br/>3B-Instruct</td>
<td>vit w8<br/>prefill w8<br/>decode w8</td>
<td>256</td>
<td>vit 38.7<br/>prefill 92.6<br/>all 131.3</td>
<td>47.27</td>
<td>4.9</td>
</tr>

<tr>
<td>Qwen2.5-VL-<br/>7B-Instruct</td>
<td>vit w8<br/>prefill w4<br/>decode w4</td>
<td>256</td>
<td>vit 38.9<br/>prefill 130.8<br/>all 169.7</td>
<td>40.63</td>
<td>6.1</td>
</tr>

<tr>
<td>Qwen3-VL-<br/>2B-Instruct</td>
<td>vit w8<br/>prefill w4<br/>decode w4</td>
<td>512</td>
<td>vit 26.2<br/>prefill 62.9<br/>all 89.1</td>
<td>96.79</td>
<td>3.7</td>
</tr>

<tr>
<td>Qwen3-VL-<br/>2B-Instruct</td>
<td>vit w8<br/>prefill w8<br/>decode w8</td>
<td>512</td>
<td>vit 26.1<br/>prefill 66.2<br/>all 92.3</td>
<td>71.79</td>
<td>4.4</td>
</tr>

<tr>
<td>Qwen3-VL-<br/>4B-Instruct</td>
<td>vit w8<br/>prefill w4<br/>decode w4</td>
<td>512</td>
<td>vit 26.4<br/>prefill 136.2<br/>all 162.6</td>
<td>53.45</td>
<td>6.0</td>
</tr>

<tr>
<td>Qwen3-VL-<br/>4B-Instruct</td>
<td>vit w8<br/>prefill w8<br/>decode w8</td>
<td>512</td>
<td>vit 26.4<br/>prefill 138.3<br/>all 164.7</td>
<td>35.87</td>
<td>7.6</td>
</tr>

<tr>
<td>Qwen3-VL-<br/>8B-Instruct</td>
<td>vit w8<br/>prefill w4<br/>decode w4</td>
<td>512</td>
<td>vit 36.5<br/>prefill 179.3<br/>all 215.8</td>
<td>35.1</td>
<td>8.3</td>
</tr>

</tbody>
</table>



#### VLA Benchmark

General configuration:

- **qtype**：All use 8-bit quantization weights

:::info

**all(ms):** The total time consumption of a single on-device run, including the five stages of preprocess, vision, language, action, and postprocess.
:::

<table>
<colgroup>
<col style={{ width: '10%' }} />
<col style={{ width: '10%' }} />
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
<td style={{ whiteSpace: 'nowrap' }}>vision 1<br/>language 4<br/>action 4</td>
<td>97.94</td>
<td>0.74</td>
<td>18.91</td>
<td>39.22</td>
<td>38.69</td>
<td>0.07</td>
<td>4.1</td>
</tr>

<tr>
<td>Pi0.5</td>
<td style={{ whiteSpace: 'nowrap' }}>vision 1<br/>language 4<br/>action 4</td>
<td>149.97</td>
<td>0.72</td>
<td>19.07</td>
<td>61.11</td>
<td>68.62</td>
<td>0.06</td>
<td>4.3</td>
</tr>

<tr>
<td>Smolvla</td>
<td style={{ whiteSpace: 'nowrap' }}>vision 1<br/>language 1<br/>action 1</td>
<td>97.17</td>
<td>3.8</td>
<td>46.54</td>
<td>14.63</td>
<td>32.16</td>
<td>0.02</td>
<td>0.7</td>
</tr>

<tr>
<td>Spirit1.5</td>
<td style={{ whiteSpace: 'nowrap' }}>vision 4<br/>language 4<br/>action 4</td>
<td>148.6</td>
<td>4.18</td>
<td>23.31</td>
<td>57.64</td>
<td>63.46</td>
<td>0.01</td>
<td>5.3</td>
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
<th><strong>RTF</strong></th>
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
<td>0.085</td>
<td>83.3</td>
<td>61.54</td>
<td>1.8</td>
</tr>

</tbody>
</table>


#### GEMMA Benchmark

:::info

**TTFT(ms):** The time to first token of the Gemma model is the sum of the vit processing time and the prefill processing time. Audio processing is not yet supported.

:::

<table>
<colgroup>
<col style={{ width: '13%' }} />
<col style={{ width: '13%' }} />
<col style={{ width: '13%' }} />
<col style={{ width: '10%' }} />
<col style={{ width: '10%' }} />
<col style={{ width: '17%' }} />
<col style={{ width: '10%' }} />
<col style={{ width: '10%' }} />
</colgroup>
<thead>
<tr>
<th><strong>model</strong></th>
<th><strong>BPU<br/>core num</strong></th>
<th><strong>qtype</strong></th>
<th><strong>sequence<br/>length</strong></th>
<th><strong>max context</strong></th>
<th><strong>TTFT<br/>(ms)</strong></th>
<th><strong>Decode<br/>(TPS)</strong></th>
<th><strong>memory<br/>(GB)</strong></th>
</tr>
</thead>
<tbody>

<tr>
<td>gemma-4-<br/>E2B-it<br/>(384*384)</td>
<td>vision 4<br/>prefill 4<br/>decode 4</td>
<td>vision w8<br/>prefill w8<br/>decode w8</td>
<td>512</td>
<td>4096</td>
<td>vit 16.4<br/>prefill 72.3<br/>all 88.7</td>
<td>57.74</td>
<td>8.8</td>
</tr>

</tbody>
</table>


