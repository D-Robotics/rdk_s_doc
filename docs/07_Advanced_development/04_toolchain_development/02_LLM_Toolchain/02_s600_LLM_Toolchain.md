---
sidebar_position: 1
sidebar_products: RDK S600
---

# 7.4.2.2 RDK S600 LLM 工具链

## RDK S600 1.0.2 大模型工具链  

在 RDK S600 平台上，D-Robotics_LLM_S600 目前支持以下模型和功能：

**LLM**  
支持 DeepSeek-R1-Distill-Qwen-1.5B，Qwen3-0.6B/1.7B/4B/8B 的单轮对话和多轮对话。

**VLM**  
支持 Qwen2.5-VL-3B/7B-Instruct，Qwen3-VL-2B/4B/8B-Instruct，InternVL2-2B 的图像文本处理。

**VLA**  
支持 Pi0 的 x86 仿真运行和 S600 端侧推理，以及硬件在环体验。


**ASR**  
支持 whisper-medium 的中英文音频识别。

## 下载方式

**D-Robotics_LLM_S600 开发工具包**

```bash 
wget https://d-robotics-aitoolchain.oss-cn-beijing.aliyuncs.com/llm_s600/1.0.2/D-Robotics_LLM_S600_1.0.2_SDK.tar.gz
```

**D-Robotics_LLM_S600 用户手册**

```bash
wget https://d-robotics-aitoolchain.oss-cn-beijing.aliyuncs.com/llm_s600/1.0.2/D-Robotics_LLM_S600_1.0.2_Doc.zip
```

**D-Robotics_LLM_S600 已编译模型**  

下载开发工具包后，查看 oellm_runtime/model/resolve_model_nash-p.md 获取下载链接。


## 模型性能 Benchmark


### 测试条件

- 测试开发板：RDK S600

- 运行环境：Linux

### 统计信息

- model：模型名。

- BPU core num：模型运行时占用的BPU核数量。

- qtype：模型的量化精度。

- max context：模型累计能处理的token序列最大长度。

- TTFT(ms)：首字生成时间。

- Decode(TPS)：Decode阶段每秒生成的token数。

- memory(GB)：模型的内存占用量。

### 实测数据

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

