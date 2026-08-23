---
sidebar_position: 5
title: "模型、算法与工具链"
description: "模型、算法与工具链 常见问题与排查"
---

# 模型、算法与工具链

:::tip 🛠️ 工具链和系统下载指引

工具链问题建议优先使用最新版本。相关下载资源请参考：[下载资源汇总](../RDK.md#资料索引)

:::

本节主要解答与地瓜机器人 RDK 平台上智能模型部署、算法开发、以及算法工具链使用相关的常见疑问。

### Q1: 使用算法工具链遇到问题，在提问时需要提供哪些信息？
**A:** 当您在使用地瓜机器人算法工具链遇到问题并寻求技术支持时，为了帮助快速定位问题，请尽量提供以下完整信息：
1.  **目标 RDK 硬件平台及处理器架构：** 例如 RDK S100 (BPU Nash-e), Super100P (BPU Nash-m)。
2.  **算法工具链转换环境信息：**
    * `horizon_nn` 包版本 (通过 `pip list | grep horizon` 查看)。
    * Python 版本 (例如 Py3.8, Py3.10)。
    * 使用的工具链 Docker 镜像版本（如果使用 Docker）。
3.  **原始模型文件：** 提供您的 ONNX 模型文件（或其他原始格式模型文件）。
4.  **模型转换相关文件：**
    * 转换时使用的 `yaml` 配置文件。
    * 完整的模型转换工具日志或类似日志文件。
    * 用于 PTQ 量化的校准数据集（或其生成方法和少量样本）。
5.  **板端部署相关文件：**
    * 板端部署的代码片段或完整项目。
    * 板端运行时的具体报错信息和日志。
    * RDK 板卡的系统版本信息（通过 `rdkos_info` 命令获取）。
6.  **详细的问题复现步骤：** 清晰地描述如何一步步操作才能重现您遇到的问题。
7.  **预期行为与实际行为：** 描述您期望得到的结果以及实际观察到的现象。

**注意：** 很多常见问题可能在工具链的旧版本中存在，而已在新版本中修复。建议优先使用官方最新发布的 Docker 镜像和工具链版本。
* **Docker 镜像下载与挂载参考：**
    * [Docker镜像下载帖](https://developer.d-robotics.cc/forumDetail/136488103547258769)
    * [Docker挂载方法帖](https://developer.d-robotics.cc/forumDetail/228559182180396619)
* 如果问题复杂，建议将完整的开发机转换项目、板端部署项目以及详细的错误复现方式，通过网盘等形式分享给技术支持人员。

### Q2: 进行 AI 算法开发有哪些推荐的官方资源？
**A:**
1.  **RDK 用户手册 - 算法工具链章节：** 这是最基础也是最重要的参考资料，详细介绍了工具链的安装、使用流程、各项工具的功能和参数等。
    * 通用入口：[https://developer.d-robotics.cc/rdk_doc/04_toolchain_development](https://developer.d-robotics.cc/rdk_doc/04_toolchain_development) (请以官方最新文档为准)
2.  **RDK Model Zoo (模型仓库)：** 官方提供的模型示例库，包含了多种常见智能模型在 RDK 平台上的移植、优化、量化和部署示例代码及教程。
    * GitHub 仓库：[https://github.com/D-Robotics/rdk_model_zoo](https://github.com/D-Robotics/rdk_model_zoo)
3.  **地瓜开发者社区 - 资源中心：** 社区的资源中心板块通常会汇总各类开发资源，包括工具链、SDK、示例代码、技术文档、教程视频等。
    * 社区资源中心入口：[https://developer.d-robotics.cc/resource](https://developer.d-robotics.cc/resource)

### Q3: 算法工具链的 Docker 镜像是基于 Ubuntu 20.04制作的，这会影响转换产物（如.bin 或.hbm 模型文件）在 RDK 板端 Ubuntu 22.04系统上运行吗？
**A:** 通常**不会影响**。
地瓜机器人 OpenExplorer 提供的算法工具链 Docker 镜像虽然可能基于 Ubuntu 20.04制作，但其主要作用是提供一个隔离的、包含所有必要转换工具和依赖库的**模型转换环境**。
它生成的模型文件（如`.bin`用于 PTQ，`.hbm`用于 QAT）是针对 RDK 板卡上特定 BPU 架构的二进制指令和权重数据。这些模型文件本身与运行它们的 RDK 板卡操作系统的 Ubuntu 版本（无论是20.04还是22.04）是解耦的，只要板卡上的 Runtime 库（如`libdnn.so`等 BPU 驱动和推理库）与模型转换时使用的工具链版本兼容即可。

### Q4: 如何在 RDK 平台上部署 YOLO 系列模型（如 YOLOv5, YOLOv8, YOLOv10）？
**A:** 地瓜机器人官方和社区提供了丰富的 YOLO 系列模型在 RDK 平台上的部署教程和示例。

* **YOLO 系列模型部署建议：**
    * 建议优先参考 [RDK Model Zoo](https://github.com/D-Robotics/rdk_model_zoo) 中与当前 S 系列平台对应的示例。
    * 若使用自训练模型，请先确认导出 ONNX 输出节点格式与板端后处理实现一致。
    * 对于性能优化，建议重点关注预处理、后处理和多线程流水线配置。

* **通用资源：** 强烈建议查阅 **RDK Model Zoo** ([https://github.com/D-Robotics/rdk_model_zoo](https://github.com/D-Robotics/rdk_model_zoo))，其中包含了多种 YOLO 版本（及其他主流模型）的官方部署示例、预处理/后处理代码、以及性能优化技巧。

### Q5: YOLOv5部署时遇到 `can't reshape xxx in (84,84,3,85)` 类似的错误，如何解决？
**A:** 这个错误通常是由于后处理代码中预设的**类别数量 (num_classes)** 与您实际模型训练和导出的类别数量不匹配导致的。
例如，`85` 通常代表 `(x, y, w, h, confidence + num_classes)`，如果您的模型是基于 COCO 数据集（80类）训练的，那么 `num_classes` 就是80，总共是 `5 + 80 = 85` 个输出通道。如果您训练的是自定义类别数量的模型（例如10类），那么这里应该是 `5 + 10 = 15`。
* **解决方法：** 找到您使用的 YOLOv5后处理代码文件（通常是一个 Python 脚本），修改其中定义的类别数量参数，使其与您模型的实际类别数一致。
* **参考：** 上述 [YOLOv5s v2.0训练与转化博客](https://developer.d-robotics.cc/forumDetail/163807123501918330) 中可能也包含了相关类别数修改的说明。

### Q6: YOLOv5部署时，检测结果出现数量非常多且不规则的检测框，是什么原因？
**A:** 这通常是由于 ONNX 模型的输出头结构与板端后处理代码的预期不匹配。
* **可能原因1：输出头未按 BPU 要求修改。**
    * 较高版本的 YOLOv5（例如 tag 2.0以上）官方导出的 ONNX 模型，其输出层可能包含了特征解码部分（例如直接输出检测框坐标和类别得分），或者没有将大、中、小三个特征图的输出分开。
    * 地瓜机器人 RDK BPU 部署通常要求 ONNX 模型的输出是原始的特征图，并且这三个特征图是作为独立的输出节点。
    * **示例图（上为错误，下为部分正确但仍需调整）：**
        <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/08_FAQ/image/AI_toolchain/3.png" alt="YOLOv5错误输出头示例" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />
        <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/08_FAQ/image/AI_toolchain/4.jfif" alt="YOLOv5错误输出头示例" style={{ width: '60%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} /> 
      *上图：未分离特征图，包含解码。下图：分离了特征图，但可能错误添加了 Sigmoid 或未转 NHWC。*
* **解决方法：**
    * 您需要修改 YOLOv5的导出脚本（通常是`models/yolo.py`或类似文件），确保在导出 ONNX 模型时：
        1.  移除模型末尾的检测头（解码层、NMS 等）。
        2.  将三个不同尺度的特征图（P3, P4, P5或对应层）作为独立的输出节点。
        3.  确保输出的维度顺序符合工具链要求（例如，有时需要从 NCHW 转换为 NHWC）。
        4.  不要在最终输出层后错误地添加不必要的激活函数（如 Sigmoid），除非后处理代码明确需要。
    * **参考教程：** [高版本YOLOv5输出层修改指南](https://developer.d-robotics.cc/forumDetail/177840589839214598) 详细介绍了如何修改。

### Q7: YOLOv5部署时，检测结果出现有周期性排列规律的异常检测框，是什么原因？
**A:**
* **可能原因：输出维度与后处理不匹配。**
    * 如果您使用的 YOLOv5模型（例如公版的 tag 2.0以下版本）在导出 ONNX 时，每个输出头的维度是5维的（例如 `[batch, num_anchors, grid_h, grid_w, (x,y,w,h,conf+classes)]` 或者是 `[batch, num_anchors* (5+num_classes), grid_h, grid_w]` 展平的形式）。
    * 而地瓜机器人 BPU 工具链在编译这类模型时，如果直接使用，可能会因为维度处理或后处理代码的预期，导致将某个维度截断或错误解析，从而出现周期性排列的异常检测框。
    * **示例图：**
        <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/08_FAQ/image/AI_toolchain/5.png" alt="YOLOv5周期性异常检测框示例" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} /> * **解决方法：**
    * 推荐的做法是在导出 ONNX 模型时，将输出转换为明确的四维张量（例如 NHWC 格式：`[batch, grid_h, grid_w, num_anchors*(5+num_classes)]`），并且在板端的后处理代码中，再根据这个 NHWC 的输出格式进行正确的解析和解码（例如，将其 reshape 回5维或进行相应的 anchors 计算）。
    * 确保您的后处理逻辑与 ONNX 模型的最终输出维度和排列方式完全匹配。

### Q8: YOLOv5部署时，检测框的位置出现整体偏移，是什么原因？
**A:**
1.  **渲染尺寸与图像原始尺寸不匹配：**
    * 后处理代码计算出的检测框坐标通常是相对于模型输入图像的尺寸（例如640x640）。如果您在显示结果时，将这些坐标直接绘制在一个不同尺寸的原始图像或显示画布上，而没有进行相应的缩放和平移变换，就会导致检测框位置偏移。
    * **解决方法：** 确保在渲染检测框之前，将模型输出的坐标按比例（`原始图像宽/模型输入宽`，`原始图像高/模型输入高`）映射回原始图像的坐标系。如果模型输入前有 padding 操作，反向映射时也需要考虑去除 padding 的影响。
2.  **Anchors 不匹配：**
    * YOLOv5的检测框解码依赖于预设的锚框（anchors）。如果在模型训练时使用了一组 anchors，但在后处理代码中使用了另一组不同的 anchors（或者 anchors 的顺序、缩放方式不一致），会导致解码出的检测框位置和大小不正确。
    * **解决方法：** 确保后处理代码中使用的 anchors 参数（通常是18个数字，代表3个特征图上每层3个 anchors 的宽高）与模型训练时使用的 anchors 完全一致。

### Q9: YOLOv5部署时，检测框都异常地聚集在图像的左上角，可能是什么原因？
**A:**
* **可能原因：后处理库参数传递问题 (特指某些系统版本中的示例)。**
    * 在 RDK OS 3.0.0及以上版本系统中，`/app/pydev_demo/07_yolov5_sample` 等示例中可能使用了 CPython 封装的后处理库。如果模型训练的类别数量等关键参数没有正确地传递给这个后处理库的初始化或调用接口，可能会导致解码逻辑错误，出现检测框聚集在左上角的现象。
    * **示例图：**
        <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/08_FAQ/image/AI_toolchain/7.png" alt="YOLOv5检测框聚集左上角示例" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} /> * **解决方法：**
    * **推荐使用 RDK Model Zoo 中的后处理：** 对于 YOLOv5等模型的验证和部署，强烈建议参考或直接使用 **RDK Model Zoo** ([https://github.com/D-Robotics/rdk_model_zoo](https://github.com/D-Robotics/rdk_model_zoo)) 中提供的后处理代码。Model Zoo 中的实现通常更健壮、更优化，并且与工具链的配合更紧密。
    * **检查参数传递：** 如果您坚持使用板载示例的后处理，请仔细检查示例代码，确保所有必要的参数（如类别数、输入分辨率、anchors、置信度阈值、NMS 阈值等）都已正确配置并传递给了后处理函数或类。

### Q10: 运行 RDK 板载的 `/app/pydev_demo/07_yolov5_sample` 示例时，如果使用自己的模型，报 `Segmentation fault` (段错误)，怎么办？
**A:**
* **原因：** 板载的官方示例程序（如 `07_yolov5_sample`）通常是**针对其自带的预转换好的 `.bin` 模型进行适配和测试的**。这个示例的预处理、模型加载、BPU 推理调用以及后处理逻辑，都是围绕那个特定的自带模型设计的。
* 如果您用自己的（可能结构、输入输出、后处理逻辑都不同的）YOLOv5模型替换了示例中的 `.bin` 文件，而没有相应地修改示例代码中的预处理、后处理或模型参数部分，就非常容易因为数据格式不匹配、内存访问越界等原因导致 `Segmentation fault`。
* **解决方法：**
    1.  **不要直接替换 bin 文件就期望能运行：** 原则上，对于自己训练和转换的模型，您需要编写或修改与之配套的完整推理程序（包括预处理、BPU 推理接口调用、后处理）。
    2.  **参考 RDK Model Zoo：** 对于 YOLOv5这类常见模型，强烈建议参考 **RDK Model Zoo** ([https://github.com/D-Robotics/rdk_model_zoo](https://github.com/D-Robotics/rdk_model_zoo)) 中对应模型的部署示例。Model Zoo 通常会提供更通用、更清晰的预处理和后处理代码实现，您可以基于这些代码来适配您自己的模型。
    3.  **理解后处理：** 仔细学习 YOLOv5的后处理原理（包括 anchors 解码、置信度过滤、NMS 等），并确保您的后处理代码与您模型输出特征图的格式、维度、内容完全对应。

### Q11: 模型推理检测不出任何结果，或者结果远差于预期，应该从哪些方面进行排查（Pipeline 检查流程）？
**A:** 
当模型部署后效果不佳或无输出时，需要系统性地检查整个推理流程（Pipeline）：

1.  **数据预处理 (Preprocessing) 检查：**
    * **与训练时是否一致：** 这是最关键的一点。确保部署时的预处理操作（如 resize 方式、归一化参数、均值方差、颜色空间转换如 RGB/BGR、letterbox 的 padding 方式和颜色等）与模型训练时所用的预处理**完全一致**。任何细微的差异都可能导致模型性能急剧下降。
    * **可视化预处理结果：** 将预处理后的图像数据保存下来（例如，如果输入是图片，就保存处理后的图片；如果是 numpy 数组，就将其可视化），与训练时送入模型的数据进行对比，看是否一致。
    * **工具链`yaml`配置：** 在使用地瓜机器人工具链进行模型转换（PTQ）时，`yaml`配置文件中会有预处理相关的参数（如`norm_type`, `mean_value`, `std_value`等）。确保这些参数的设置能够正确地“抵消”掉您在将校准数据送入工具链之前所做的预处理，使得工具链看到的校准数据与模型训练时第一层卷积前的输入分布一致。

2.  **模型转换过程检查：**
    * **工具链版本：** 使用官方推荐的最新稳定版算法工具链。
    * **`yaml`配置：** 仔细检查模型转换时的`yaml`配置文件，确保所有参数（如输入节点名、输出节点名、输入数据类型、输入布局、模型类型、BPU 架构等）都设置正确。
    * **校准数据集 (PTQ)：**
        * 校准数据集的质量和代表性对 PTQ 量化后的模型精度至关重要。数据集应与实际应用场景的数据分布相似。
        * 校准数据的预处理方式如前所述，必须与部署时一致（或者说，送入工具链的校准数据应是“逆预处理”后的，以便工具链内部进行正确的量化校准）。
    * **量化敏感层分析：** 如果 PTQ 后精度下降较多，可以使用工具链提供的精度分析工具（如层与层比对，dump 各层数据）来定位哪些层对量化比较敏感，然后尝试混合精度量化（部分层使用更高精度或浮点）或 QAT（量化感知训练）。
    * **转换日志：** 仔细阅读模型转换过程中工具链输出的完整日志，查找是否有任何错误、警告或提示信息。

3.  **BPU 推理与板端 Runtime 检查：**
    * **输入数据准备：** 确保送入板端 BPU 推理接口的数据与模型转换时定义的输入格式（layout, data type, shape）完全一致。
    * **内存管理：** 检查输入输出 Buffer 的分配、拷贝是否正确，有无内存踩踏或越界。
    * **Runtime 版本：** 确保板端使用的 BPU 驱动和 Runtime 库 (`libdnn.so`等) 版本与模型转换时使用的工具链版本兼容。
    * **API 调用：** 检查 BPU 推理 API 的调用顺序、参数设置是否正确。

4.  **后处理 (Postprocessing) 检查：**
    * **与模型输出匹配：** 确保后处理代码的逻辑（如解析输出特征图、解码检测框、应用 NMS、阈值处理等）与模型转换后实际输出节点的格式、维度、含义完全匹配。
    * **参数一致性：** 后处理中使用的各种参数（如 anchors, 类别数, 置信度阈值, NMS 阈值, score_threshold 等）必须与模型设计和训练时一致。
    * **坐标映射：** 如果有必要，确保将模型输出的坐标正确映射回原始图像尺寸。
    * **逻辑错误：** 仔细检查后处理代码是否存在逻辑 bug。

5.  **端到端验证：**
    * **使用已知输入和输出：** 最好能有一组训练集或验证集中的样本，您知道其对应的正确检测结果（Ground Truth）。用这些样本通过您的整个部署 Pipeline，对比实际输出与期望输出。
    * **逐模块验证：** 如果可能，将整个 Pipeline 拆分成预处理、模型推理、后处理等模块，对每个模块的输入输出进行单独验证。

### Q12: 板端`hrt_*`系列性能分析工具（如`hrt_model_exec`, `hrt_bpu_monitor`等）如何获取？
**A:** 地瓜机器人 RDK 的系统镜像中，或者随算法工具链/SDK 发布的包中，通常会包含一些用于板端模型执行、性能分析和调试的命令行工具，它们一般以 `hrt_` (Horizon Robotics Tool) 开头。
* **查找位置：**
    * 这些工具可能预装在 RDK 系统镜像的 `/usr/bin` 或 `/opt/hobot/bin` 等路径下。
    * 也可能包含在您下载的算法工具链包（解压后）的某个子目录中（例如 `ddk/package/board/<target_os>/bin/` 或类似路径），您需要将这些工具手动拷贝到板卡的某个可执行路径下（如 `/usr/local/bin`）或直接在板卡上指定其完整路径运行。
* **官方资源帖：** 地瓜开发者社区通常会有专门的帖子或文档说明这些板端工具的获取方式和使用方法。例如，此帖曾提供相关信息：
    [板端hrt_*工具下载及使用说明](https://developer.d-robotics.cc/forumDetail/228559182180396599) (请确认链接及内容的最新有效性)
* **常用工具：**
    * `hrt_model_exec`: 用于在板端执行转换好的 `.bin` 模型，进行推理验证和性能测试。
    * `hrt_bpu_monitor` (或 `hrut_somstatus`, `bpu_predict_xN_sample` 中的性能打印部分): 用于监控 BPU 的实时使用率、频率、温度等状态。
    * 其他特定调试工具。

请查阅最新的 RDK 文档或社区资源，以获取这些工具的准确信息和下载方式。

### 算法模型上板错误及解决方法

【问题】 

  ```bash
  (common.h:79): HR:ERROR: op_name:xxx invalid attr key xxx
  ```

✅ 【解答】 

- 发生此错误的原因可能是 libDNN 暂不支持该 op 的某个属性。针对此错误，您可以根据我们提供的算子支持列表中的内容进行替换或联系 D-Robotics 对此进行开发评估。

【问题】 

  ```bash
  (hb_dnn_ndarray.cpp:xxx): data type of ndarray do not match specified type. NDArray dtype_: n, given：m
  ```

✅ 【解答】 

- 发生此错误的原因可能是 libDNN 暂不支持该输入类型（后续我们将逐步把算子约束前移至模型转换阶段提醒）。针对此错误，您可以根据我们提供的算子支持列表中的内容进行替换或联系 D-Robotics 对此进行开发评估。

【问题】 

  ```bash
  (validate_util.cpp:xxx)：tensor aligned shape size is xxx , but tensor hbSysMem memSize is xxx, tensor hbSysMem memSize should >= tensor aligned shape size!
  ```

✅ 【解答】 

- 发生此错误的原因可能是输入数据申请内存不足。针对此错误，请使用 hbDNNTensorProperties.alignedByteSize 来申请内存空间。

【问题】 

  ```bash
  (bpu_model_info.cpp:xxx): HR:ERROR: hbm model input feature names must be equal to graph node input names
  ```

✅ 【解答】 

- 针对此错误，请您完整更新最新版本的工具链 SDK 开发包。

### 模型量化及上板使用技巧

#### 示例 YOLOv5x 模型使用说明

1. YOLOv5x 模型：

  - 可以从 URL:[yolov5-2.0](https://github.com/ultralytics/yolov5/releases/tag/v2.0) 中下载相应的 pt 文件。

    在 clone 代码时，请确认您使用的 Tags 是 ``v2.0`` ，否则将导致转换失败。

  - md5sum 码:

|           **md5sum**             | **File**   |
| -------------------------------- | -----------|
| 2e296b5e31bf1e1b6b8ea4bf36153ea5 | yolov5l.pt |
| 16150e35f707a2f07e7528b89c032308 | yolov5m.pt |
| 42c681cf466c549ff5ecfe86bcc491a0 | yolov5s.pt |
| 069a6baa2a741dec8a2d44a9083b6d6e | yolov5x.pt |

  - 为了更好地适配后处理代码，我们在 ONNX 模型导出前对 Github 代码做了如下修改
    （代码参见：[https://github.com/ultralytics/yolov5/blob/v2.0/models/yolo.py](https://github.com/ultralytics/yolov5/blob/v2.0/models/yolo.py) ）：

```python

    def forward(self, x):
        # x = x.copy()  # for profiling
        z = []  # inference output
        self.training |= self.export
        for i in range(self.nl):
            x[i] = self.m[i](x[i])  # conv
            bs, _, ny, nx = x[i].shape  # x(bs,255,20,20) to x(bs,3,20,20,85)
            #  x[i] = x[i].view(bs, self.na, self.no, ny, nx).permute(0, 1, 3, 4, 2).contiguous()
            x[i] = x[i].permute(0, 2, 3, 1).contiguous()
```

-   **说明:** 
      去除了每个输出分支尾部从4维到5维的 reshape（即不将 channel 从255拆分成3x85），然后将 layout 从 NHWC 转换成 NCHW 再输出。

    以下左图为修改前的模型某一输出节点的可视化图，右图则为修改后的对应输出节点可视化图。

    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/08_FAQ/image/multimedia/yolov5.png" alt="YOLOv5 示意图" style={{ width: '70%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

- 下载完成后通过脚本 https://github.com/ultralytics/yolov5/blob/v2.0/models/export.py 进行 pt 文件到 ONNX 文件的转换。

-    **注意事项**

      在使用 export.py 脚本时，请注意：

      1. 由于 D-Robotics AI 工具链支持的 ONNX opset 版本为 ``10`` 和 ``11``，请将 ``torch.onnx.export`` 的 ``opset_version`` 参数根据您要使用的版本进行修改。
      2. 将 ``torch.onnx.export`` 部分的默认输入名称参数由 ``'images'`` 
         改为 ``'data'``，与模型转换示例包的 YOLOv5x 示例脚本保持一致。
      3. 将 ``parser.add_argument`` 部分中默认的数据输入尺寸640x640改为模型转换示例包 YOLOv5x 示例中的672x672。

#### 模型精度调优 checklist{#checklist}

请严格按照下图中步骤1~5来进行模型精度验证并保留每个步骤的代码和结果：

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/08_FAQ/image/multimedia/model_accuracy_check.png" alt="模型精度检查" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

**在进行排查前，请确认当前模型转换所用的 Docker 镜像或转换环境版本，并保留版本信息**

##### 1. 验证浮点 onnx 模型的推理结果

进入模型转换环境，来测试浮点 onnx 模型(特指从 DL 框架导出的 onnx 模型)的单张结果，此步骤结果应与训练后的模型推理结果完全一致（nv12格式除外，可能会引入少许差异）

可参考如下示例代码步骤，来确认浮点 onnx 模型的推理的步骤、数据预处理、后处理代码是否正确！

```python  

  from horizon_tc_ui import HB_ONNXRuntime
  import numpy as np
  import cv2

  def preprocess(input_name):
      # BGR->RGB、Resize、CenterCrop···      
      # HWC->CHW      
      # normalization      
      return data

  def main(): 
      # 加载模型文件
      sess = HB_ONNXRuntime(model_file=MODEL_PATH)
      # 获取输入&输出节点名称
      input_names = [input.name for input in sess.get_inputs()]
      output_names = [output.name for output in sess.get_outputs()]
      # 准备模型输入数据
      feed_dict = dict()
      for input_name in input_names:
          feed_dict[input_name] = preprocess(input_name)
          
      # 原始浮点onnx，数据dtype=float32     
      outputs = sess.run_feature(output_names, feed_dict, input_offset=0)     
      
      # 后处理
      postprocess(outputs)
          
  if __name__ == '__main__':
      main()

```

##### 2. 验证 yaml 配置文件以及前、后处理代码的正确性

测试 original_float.onnx 模型的单张结果，应与浮点 onnx 模型推理结果完全一致（nv12格式除外，由于 nv12数据本身有损，可能会引入少许差异）

使用开源工具 Netron 打开 ``original_float.onnx`` 模型，并查看预处理节点 ``HzPreprocess`` 算子的详细属性，获取我们 ``数据预处理`` 需要的参数：``data_format`` 和 ``input_type``。

由于 HzPreprocess 节点的存在，会使得转换后的模型其预处理操作可能会和原始模型有所不同，该算子是在进行模型转换时，根据 yaml 配置文件中的配置参数（input_type_rt、input_type_train 以及 norm_type、mean_value、scale_value）来决定是否为模型加入 HzPreprocess 节点，预处理节点的生成细节，请参考 PTQ 原理及步骤详解章节的 ``norm_type 配置参数说明`` 内容，另外预处理节点会出现在转换过程产生的所有产物中。

理想状态下，这个 HzPreprocess 节点应该完成 input_type_rt 到 input_type_train 的完整转换， 但实际情况是整个 type 转换过程需要使用 D-Robotics AI 芯片硬件完成，但 ONNX 模型里面并没有包含硬件转换的部分，因此 ONNX 的真实输入类型会使用一种中间类型，这种中间类型就是硬件对 input_type_rt 的处理结果类型， 故针对图像输入数据类型为：RGB/BGR/NV12/YUV444/GRAY，并且数据 dtype= uint8的模型时，在预处理代码中需要做 ``-128`` 的操作，``featuremap`` 数据类型因为使用的是 float32，因此预处理代码中 ``不需要-128`` 的操作； original_float.onnx 的数据 layout(NCHW/NHWC)会保持和原始浮点模型的输入 layout 一致。 

可参考如下示例代码步骤，来确认 original_float.onnx 模型的推理的步骤、数据预处理、后处理代码是否正确！

**数据预处理部分建议参考使用 D-Robotics 模型转换 ``horizon_model_convert_sample`` 示例包中的 caffe、onnx 等示例模型的预处理步骤方法**

```python

  from horizon_tc_ui import HB_ONNXRuntime
  import numpy as np
  import cv2

  def preprocess(input_name):
      # BGR->RGB、Resize、CenterCrop···      
      # HWC->CHW（通过onnx模型输入节点的具体shape来判断是否需要做layout转换）
      # normalization（若已通过yaml文件将norm操作放入了模型中，则不要在预处理中做重复操作）
      #-128（图像输入模型，仅在使用hb_session.run接口时需要自行在预处理完成-128，其他接口通过input_offset控制即可）
      return data

  def main(): 
      # 加载模型文件
      sess = HB_ONNXRuntime(model_file=MODEL_PATH)
      # 获取输入&输出节点名称
      input_names = [input.name for input in sess.get_inputs()]
      output_names = [output.name for output in sess.get_outputs()]
      # 准备模型输入数据
      feed_dict = dict()
      for input_name in input_names:
          feed_dict[input_name] = preprocess(input_name)
      #图像输入的模型（RGB/BGR/NV12/YUV444/GRAY），数据dtype= uint8     
      outputs = sess.run(output_names, feed_dict, input_offset=128)         
      # featuremap模型，数据dtype=float32, 若模型输入非featuremap，请注释掉下行代码！
      outputs = sess.run_feature(output_names, feed_dict, input_offset=0)     
      # 后处理
      postprocess(outputs)
          
  if __name__ == '__main__':
      main()

```

##### 3. 验证模型的图优化阶段未引入精度误差

测试 optimize_float.onnx 模型的单张结果，应与 original_float.onnx 推理结果完全一致

使用开源工具 Netron 打开 ``optimize_float.onnx`` 模型，并查看预处理节点 ``HzPreprocess`` 算子的详细属性，获取我们数据预处理需要的参数：``data_format``和 ``input_type``; 

optimize_float.onnx 模型的推理可参考如下示例代码步骤，来确认 optimize_float.onnx 模型的推理的步骤、数据预处理、后处理代码是否正确！

**数据预处理部分建议参考使用 D-Robotics 模型转换 ``horizon_model_convert_sample`` 示例包中的 caffe、onnx 等示例模型的预处理步骤方法**

```python

  from horizon_tc_ui import HB_ONNXRuntime
  import numpy as np
  import cv2

  def preprocess(input_name):
      # BGR->RGB、Resize、CenterCrop···      
      # HWC->CHW（通过onnx模型输入节点的具体shape来判断是否需要做layout转换）
      # normalization（若已通过yaml文件将norm操作放入了模型中，则不要在预处理中做重复操作）
      #-128（图像输入模型，仅在使用hb_session.run接口时需要自行在预处理完成-128，其他接口通过input_offset控制即可）
      return data

  def main(): 
      # 加载模型文件
      sess = HB_ONNXRuntime(model_file=MODEL_PATH)
      # 获取输入&输出节点名称
      input_names = [input.name for input in sess.get_inputs()]
      output_names = [output.name for output in sess.get_outputs()]
      # 准备模型输入数据
      feed_dict = dict()
      for input_name in input_names:
          feed_dict[input_name] = preprocess(input_name)
      #图像输入的模型（RGB/BGR/NV12/YUV444/GRAY），数据dtype= uint8     
      outputs = sess.run(output_names, feed_dict, input_offset=128)         
      # featuremap模型，数据dtype=float32, 若模型输入非featuremap，请注释掉下行代码！
      outputs = sess.run_feature(output_names, feed_dict, input_offset=0)     
      # 后处理
      postprocess(outputs)
          
  if __name__ == '__main__':
      main()

```

##### 4. 验证量化精度是否满足预期  

测试 quantized.onnx 的精度指标。

使用开源工具 Netron 打开 ``quantized.onnx`` 模型，并查看预处理节点 ``HzPreprocess`` 算子的详细属性，获取我们数据预处理需要的参数：``data_format``和 ``input_type``; 

quantized.onnx 模型的推理可参考如下示例代码步骤，来确认 quantized.onnx 模型的推理的步骤、数据预处理、后处理代码是否正确！

**数据预处理部分建议参考使用 D-Robotics 模型转换 ``horizon_model_convert_sample`` 示例包中的 caffe、onnx 等示例模型的预处理步骤方法**

```python

  from horizon_tc_ui import HB_ONNXRuntime
  import numpy as np
  import cv2

  def preprocess(input_name):
      # BGR->RGB、Resize、CenterCrop···      
      # HWC->CHW（通过onnx模型输入节点的具体shape来判断是否需要做layout转换）
      # normalization（若已通过yaml文件将norm操作放入了模型中，则不要在预处理中做重复操作）
      #-128（图像输入模型，仅在使用hb_session.run接口时需要自行在预处理完成-128，其他接口通过input_offset控制即可）
      return data

  def main(): 
      # 加载模型文件
      sess = HB_ONNXRuntime(model_file=MODEL_PATH)
      # 获取输入&输出节点名称
      input_names = [input.name for input in sess.get_inputs()]
      output_names = [output.name for output in sess.get_outputs()]
      # 准备模型输入数据
      feed_dict = dict()
      for input_name in input_names:
          feed_dict[input_name] = preprocess(input_name)
      #图像输入的模型（RGB/BGR/NV12/YUV444/GRAY），数据dtype= uint8     
      outputs = sess.run(output_names, feed_dict, input_offset=128)         
      # featuremap模型，数据dtype=float32, 若模型输入非featuremap，请注释掉下行代码！
      outputs = sess.run_feature(output_names, feed_dict, input_offset=0)     
      # 后处理
      postprocess(outputs)
          
  if __name__ == '__main__':
      main()

```

##### 5. 确保模型编译过程无误且板端推理代码正确

使用 ``hb_model_verifier`` 工具验证 quantized.onnx 和.bin 的一致性，模型输出应至少满足小数点后2~3位对齐

hb_model_verifier 工具（详细介绍可参考）的使用方法，请参考 PTQ 原理及步骤详解章节的 ``hb_model_verifier 工具`` 内容。

若模型一致性校验通过，则请仔细检查开发板端的前、后处理代码！

若 quantized.onnx 与.bin 模型一致性校验失败，请联系 D-Robotics 技术人员

#### 模型量化 yaml 配置文件模板

#### 定点.bin 模型上板多 batch 使用说明

- 1.模型转换时，在 yaml 配置文件里通过 input_batch 配置 batch_size；
- 2.上板 bin 模型输入时，以原始模型维度1×3×224×224，修改 input_batch 为10，也就是10×3×224×224这个维度举例：
- 准备数据：

    Image 图像数据：设置 ``aligned_shape = valid_shape`` ，然后按单张数据准备的方式，把10张图片依次按顺序写入申请的内存空间；

    FeatureMap 数据：按 aligned_shape 把数据 padding 好，然后按单 batch 数据准备的方式，把10份数据依次按顺序写入申请的内存空间，模型推理流程和单 batch 模型推理流程一致；
