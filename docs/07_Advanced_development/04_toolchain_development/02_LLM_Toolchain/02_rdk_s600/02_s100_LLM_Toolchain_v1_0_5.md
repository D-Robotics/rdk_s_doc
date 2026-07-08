---
sidebar_position: 2
sidebar_products: RDK S600
---

# 大模型工具链_v1.0.5

在 RDK S600 平台上，D-Robotics_LLM_S600 目前支持以下模型和功能：

**LLM**  
- 支持 DeepSeek-R1-Distill-Qwen-1.5B 和 Qwen3-0.6B/1.7B/4B/8B 的单轮对话和多轮对话。
- 支持 Qwen3-8B 的投机采样，包含 common 和 eagle3 两种模式。


**VLM**  
支持 Qwen2.5-VL-3B/7B-Instruct 和 Qwen3-VL-2B/4B/8B-Instruct 的多图和文本处理。


**VLA**  
- 支持 Pi0/Pi0.5/Smolvla 的 x86 仿真运行，RDK S600 端侧推理，以及硬件在环体验。
- 支持 Spirit1.5 的 RDK S600 端侧推理。


**ASR**  
支持 whisper-medium 的中英文音频识别。


**GEMMA**  
支持 gemma-4-E2B-it 的多图和文本处理。



## 下载方式

**D-Robotics_LLM_S600 开发工具包**

```bash 
wget https://d-robotics-aitoolchain.oss-cn-beijing.aliyuncs.com/llm_s600/1.0.5/D-Robotics_LLM_S600_1.0.5_SDK.tar.gz
```

**D-Robotics_LLM_S600 用户手册**

```bash
wget https://d-robotics-aitoolchain.oss-cn-beijing.aliyuncs.com/llm_s600/1.0.5/D-Robotics_LLM_S600_1.0.5_Doc.zip
```

**D-Robotics_LLM_S600 已编译模型**  

下载开发工具包后，查看 oellm_runtime/model/resolve_model_nash-p.md 获取下载链接。


## 模型性能 Benchmark


### 测试条件

- 测试开发板：RDK S600。

- 运行环境：Linux。

### 统计信息

- **model**：模型名。

- **BPU core num**：模型运行时占用的BPU核数量。

- **qtype**：模型的量化精度。

- **sequence length**：Prefill阶段单次处理的token序列长度。

- **max context**：模型累计能处理的token序列最大长度。

- **RTF**: 处理一段音频所消耗的时间与该音频实际时长的比值。

- **TTFT(ms)**：首字生成时间。

- **Decode(TPS)**：Decode阶段每秒生成的token数。

- **memory(GB)**：模型运行时，Linux内存和ION内存的占用总量。

### 实测数据

#### LLM 性能 Benchmark

**标准模式**

通用配置：

- **BPU core num**：均使用 4 核 BPU

- **sequence length**：均使用 256

- **max context**：均使用 2048

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
<td style={{ whiteSpace: "nowrap" }}>prefill w4<br/>decode w4</td>
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

**投机采样模式**


通用配置：

- **BPU core num**：均使用 4 核 BPU

- **qtype**：base 模型均使用 w4，draft 模型均使用 w8

- **sequence length**：均使用 256

- **max context**：均使用 2048

:::info 说明

投机采样的 Decode (TPS)  不固定，这里展示多次测试后的最大值。

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





#### VLM 性能 Benchmark


通用配置：

- **图像分辨率**：均使用 448*448

- **BPU core num**：均使用 4 核 BPU

- **max context**：均使用 1024

:::info 说明

**TTFT(ms)**：VLM 的首字生成时间为 vit 处理时间和 prefill 处理时间总和。

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
<td style={{ whiteSpace: "nowrap" }}>vit w8<br/>prefill w4<br/>decode w4</td>
<td>256</td>
<td style={{ whiteSpace: "nowrap" }}>vit 38.8<br/>prefill 85.5<br/>all 124.3</td>
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



#### VLA 性能 Benchmark

通用配置：

**qtype**：均使用 8 bit 量化权重

:::info 说明

**all(ms)**：端侧单次运行总耗时，包含 preprocess，vision，language，action，postprocess 五个阶段。

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
<td style={{ whiteSpace: "nowrap" }}>vision 1<br/>language 4<br/>action 4</td>
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
<td style={{ whiteSpace: "nowrap" }}>vision 1<br/>language 4<br/>action 4</td>
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
<td style={{ whiteSpace: "nowrap" }}>vision 1<br/>language 1<br/>action 1</td>
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
<td style={{ whiteSpace: "nowrap" }}>vision 4<br/>language 4<br/>action 4</td>
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



#### ASR 性能 Benchmark

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


#### GEMMA 性能 Benchmark

:::info 说明

- **TTFT(ms)**：Gemma 的首字生成时间为 vit 处理时间和 prefill 处理时间总和。
- 音频处理暂未支持。

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




