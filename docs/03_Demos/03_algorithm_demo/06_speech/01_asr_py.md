---
title: 自动语音识别-ASR (Python)
sidebar_position: 1
description: 用 hbm_runtime Python 接口部署 ASR 模型做语音转文字的预装示例
---

# 自动语音识别-ASR (Python)

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

本示例演示如何用 `hbm_runtime` 的 Python 接口在 BPU 上部署 ASR 语音识别模型，把一段 `.wav` 音频转写成文字并打印。

<DocScope products="RDK-S100">

示例代码位于板端 `/app/pydev_demo/07_speech_sample/01_asr/` 目录下。

:::warning
当前 RDK S100 系统镜像**未内置** `asr.hbm` 模型，运行本示例前需手动下载并放到 `/opt/hobot/model/s100/basic/asr.hbm`，或通过 `--model-path` 指定路径（S100 路径待 S100 板验证）。
:::

</DocScope>
<DocScope products="RDK-S600">

示例代码位于板端 `/app/pydev_demo/speech_sample/asr/` 目录下，预装模型 `/opt/hobot/model/s600/basic/asr.hbm` 已随镜像就位。

</DocScope>

## 前置条件

- 开发板已烧录 RDK OS 并通过 SSH 登录（见 [远程登录](../../../01_Quick_start/03_install_os_and_setup/remote_login.md)）。
- 预装模型就位：S600 `/opt/hobot/model/s600/basic/asr.hbm`。
- 安装 `soundfile`（音频读取，镜像未预装）：

```bash
pip install soundfile --break-system-packages   # S600
# pip install soundfile                          # S100
```

## 参数说明

| 参数 | 说明 | 默认值 |
|---|---|---|
| `--model-path` | 模型路径（.hbm） | S600: `/opt/hobot/model/s600/basic/asr.hbm` |
| `--audio-file` | 输入音频（.wav/.flac） | `/app/res/assets/chi_sound.wav` |
| `--vocab-file` | 词表（token→id） | `/app/res/labels/vocab.json` |
| `--priority` | 推理优先级（0~255） | `0` |
| `--bpu-cores` | BPU 核心编号列表 | `[0]` |
| `--audio_maxlen` | 音频裁剪/填充后的固定长度（采样点数） | `30000` |
| `--new_rate` | 目标采样率（自动重采样） | `16000` |

## 使用方法

<DocScope products="RDK-S600">

```bash
cd /app/pydev_demo/speech_sample/asr
python asr.py
```

</DocScope>

运行成功后，识别出的文字会打印到终端。

## 运行效果

以下是 RDK S600 上的实测输出（测试音频 `chi_sound.wav`，内容为"我是来自阿里云的大规模语言模型叫做通义千问"）：

```text
Model Description:
 - asr: {"MARCH": "nash-p", "INPUT_SHAPE": "1x30000",
   "INPUT_TYPE_RT": "featuremap", "NORM_TYPE": "no_preprocess", ...}

=== Scheduling Parameters ===
asr:
  priority    : 0
  bpu_cores   : [-1]
  deviceId    : 0

我是来自阿里云的大规模语言磨型过叫通意千问||
```

**成功标志**：末尾打印出识别文字（如上）。注意 ASR 模型对部分字词会有识别偏差（如"模型→磨型"、"叫做→过叫"），属模型本身的精度限制，非运行错误。

## 软件说明

数据流：读 wav（`soundfile`）→ 重采样到 16kHz → 裁剪/填充到 30000 采样点 → 提取音频 featuremap → BPU 推理 → 解码 token → 用 `vocab.json` 映射成文字。模型输入 `1x30000`，无预处理（`no_preprocess`）。

## 常见问题

- **`ModuleNotFoundError: No module named 'soundfile'`**：按"前置条件"安装 `soundfile`。
- **结果文字乱/缺字**：ASR 模型精度有限，换更清晰的音频可改善；确认音频采样率与 `--new_rate 16000` 匹配。
- **S100 报错找不到 `asr.hbm`**：S100 镜像未内置，需手动下载（见上方 warning）。

## 相关文档

- [C/C++ 版 ASR 示例](./01_asr.md)
- [模型获取与放置](../../04_demo_support/01_model_files.md)
- [Python demo 编程指南](../../04_demo_support/03_python_build.md)
