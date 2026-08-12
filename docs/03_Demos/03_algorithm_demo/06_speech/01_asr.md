---
title: 自动语音识别-ASR (C/C++)
sidebar_position: 1
description: 用 C/C++ 部署 ASR 模型做语音转文字的预装示例
---

# 自动语音识别-ASR (C/C++)

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

本示例演示如何用 `C/C++` 在 BPU 上部署 ASR 语音识别模型，把一段 `.wav` 音频转写成文字并打印。Python 版见 [ASR (Python)](./01_asr_py.md)。

<DocScope products="RDK-S100">

示例代码位于板端 `/app/cdev_demo/bpu/07_speech_sample/01_asr/` 目录下。

:::warning
当前 RDK S100 系统镜像**未内置** `asr.hbm` 模型，运行前需手动下载并放到 `/opt/hobot/model/s100/basic/asr.hbm`，或通过 `--model_path` 指定路径（S100 路径待 S100 板验证）。
:::

</DocScope>
<DocScope products="RDK-S600">

示例代码位于板端 `/app/cdev_demo/bpu/speech_sample/asr/` 目录下，预装模型 `/opt/hobot/model/s600/basic/asr.hbm` 已随镜像就位。

</DocScope>

## 前置条件

- 开发板已烧录 RDK OS 并通过 SSH 登录（见 [远程登录](../../../01_Quick_start/03_install_os_and_setup/remote_login.md)）。
- 预装模型就位：S600 `/opt/hobot/model/s600/basic/asr.hbm`。
- 板端有编译工具链（`cmake`、`make`、`g++`，镜像已预装）。

## 环境依赖

```bash
sudo apt update && sudo apt install libgflags-dev
```

## 编译

```bash
cd /app/cdev_demo/bpu/speech_sample/asr   # S100 改为对应路径
mkdir build && cd build
cmake ..
make -j$(nproc)
```

产物为 `build/asr`。

## 参数说明

| 参数 | 说明 | 默认值 |
|---|---|---|
| `--model_path` | 模型路径（.hbm） | S600: `/opt/hobot/model/s600/basic/asr.hbm` |
| `--audio_file` | 输入音频（.wav/.flac） | `/app/res/assets/chi_sound.wav` |
| `--vocab_file` | 词表（token→id） | `/app/res/labels/vocab.json` |

## 使用方法

```bash
./asr
```

## 运行效果

RDK S600 实测输出（测试音频 `chi_sound.wav`，内容为"我是来自阿里云的大规模语言模型叫做通义千问"）：

```text
[BPU][[BPU_MONITOR]][INFO]BPULib verison(2, 2, 15)[f21ee84]!
[DNN]: 3.13.6_(4.7.5 HBRT)
Full transcription:
我是来自阿里云的大规模语言磨型过叫通意千问||
```

**成功标志**：末尾出现 `Full transcription:` 后跟识别文字。注意 ASR 模型对部分字词会有识别偏差（如"模型→磨型"、"叫做→过叫"），属模型精度限制，非运行错误。

## 软件说明

数据流：读 wav → 重采样到 16kHz → 裁剪/填充到 30000 采样点 → 提取音频 featuremap → BPU 推理 → 解码 token → 用 `vocab.json` 映射成文字。模型输入 `1x30000`，无预处理。

## 常见问题

- **`make` 报错找不到 `gflags`**：装 `libgflags-dev`。
- **结果文字乱/缺字**：ASR 模型精度有限，换更清晰音频可改善。
- **S100 报错找不到 `asr.hbm`**：S100 镜像未内置，需手动下载（见上方 warning）。

## 相关文档

- [Python 版 ASR 示例](./01_asr_py.md)
- [C/C++ demo 编程指南](../../04_demo_support/02_c_cpp_build.md)
- [模型获取与放置](../../04_demo_support/01_model_files.md)
