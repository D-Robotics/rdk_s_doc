---
sidebar_position: 3
title: "MediaCodec 应用场景"
description: "RDK S100/S600 MediaCodec 典型应用场景与链路图"
---

# MediaCodec 应用场景

## 单路编码

单路编码场景如下图所示。Scenario0 是简单场景，从 eMMC 中读取 YUV 视频/图像文件，经过 VPU 硬件编码输出的 H26x 码流或 JPU 硬件编码输出的 Jpeg 图像，最后保存为文件存储到 eMMC。Scenario1 是串联前后级模块的复杂场景，将摄像头采集的数据编码压缩后进行保存或通过网络和 PCIe 传输。

![单路编码场景](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/media_codec/scene-enc-single.png)

## 单路解码

单路解码场景如下图所示。Scenario0 是简单场景，从 eMMC 中读取 H26x 码流/Jpeg 图像文件，经过 VPU 或 JPU 硬件解码输出的 YUV 数据，最后保存为文件存储到 eMMC。Scenario1 是串联前后级模块的复杂场景，通过网络或 PCIe 接收已编码的视频或图像数据，经过 VPU 或 JPU 硬件解码后使用 IDE 显示播放。

![单路解码场景](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/media_codec/scene-dec-single.png)

## 多路编码

多路编码场景如下图所示，Scenario0 是文件输入的简单场景，Scenario1 是串联前后级模块的复杂场景，需要注意的是在 Scenario1 场景要综合考虑链路中各个模块的能力限制。

![多路编码场景](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/media_codec/scene-enc-multi.png)

## 多路解码

多路解码场景如下图所示，Scenario0 是文件输入的简单场景，Scenario1 是串联前后级模块的复杂场景，需要注意的是在 Scenario1 场景要综合考虑链路中各个模块的能力限制。

![多路解码场景](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/media_codec/scene-dec-multi.png)

## 编解码 sample

可参考 [sample_codec 使用说明](/Advanced_development/multimedia_development/multimedia_sample/sample_codec)。

## 相关文档

- [MediaCodec 常见问题](/Advanced_development/multimedia_development/multimedia_api/mediacodec/faq)
- [MediaCodec 调试指南](/Advanced_development/multimedia_development/multimedia_api/debug_guide/mediacodec_debug_guide)
