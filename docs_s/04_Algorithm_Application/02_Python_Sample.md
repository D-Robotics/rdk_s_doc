---
sidebar_position: 2
id: python-sample
title: 参考示例（python）
sidebar_label: 4.2 参考示例（python）
---

# 参考示例（python）

本项目包含多个基于 Python 编写的 AI 示例程序，适用于 RDK S100平台，覆盖图像分类、目标检测、实例分割、姿态估计、OCR、语音识别等常见 AI 任务。示例使用 `.hbm` 格式的量化模型进行推理，便于开发者快速验证模型效果并开展应用开发。

## 概述
### 环境要求
本项目基于 Python 编写并依赖多个第三方库。请确保您的环境满足以下要求：

#### Python 环境
- Python 版本：建议使用 Python 3.10.x（当前已在 3.10.12 下测试通过）

#### 依赖库
- 依赖库列表
    | 库名           | 说明                                          | 推荐版本          |
    |----------------|----------------------------------------------|------------------|
    | numpy          | 科学计算库，用于张量、矩阵处理                  | >=1.26.4         |
    | opencv-python  | 图像处理和可视化（cv2）                        | >=4.11.0.86      |
    | scipy          | 包含数学函数库，如 softmax                     | >=1.15.3         |
- 依赖安装
    ```bash
    # 安装依赖
    pip install -r requirements.txt
    ```
- 注意

    **以上依赖库列表和安装文件仅列举了模型运行的基本库，部分示例程序需要额外的三方库，可通过相应示例的README.md文档或此文档的相应章节查看。**

#### 其他组件
- hbm_rumtime：用于加载和运行`.hbm`模型，系统默认已安装，如需自行安装可参考 [4.1 Python 接口](./01_Python_API.md#41-python-接口) 部分。


- Hobot VIO：用于访问相机图像流（hobot_vio，如 libsrcampy）


### 目录结构
    ```text
    .
    ├── 01_classification_sample/        # 图像分类样例
    ├── 02_detection_sample/             # 目标检测样例
    ├── 03_instance_segmentation_sample/ # 实例分割样例
    ├── 04_pose_sample/                  # 姿态估计样例
    ├── 05_open_instance_seg_sample/     # 开放词表实例分割样例
    ├── 06_lane_detection_sample/        # 车道线检测样例
    ├── 07_speech_sample/                # 语音识别样例
    ├── 08_OCR_sample/                   # OCR 文字识别样例
    ├── 09_usb_camera_sample/            # USB 摄像头 + 目标检测样例
    ├── 10_mipi_camera_sample/           # MIPI 摄像头 + 目标检测样例
    ├── 11_web_display_camera_sample/    # 摄像头 + Web + 目标检测样例
    ├── assets/                          # 测试用图片、音频等资源
    ├── labels/                          # 各类模型所需标签文件
    ├── utils/                           # 通用预处理、后处理工具模块
    ├── requirements.txt                 # Python 环境依赖
    └── README.md                        # 顶层使用说明文档（本文件）
    ```

### 快速运行
以图像分类示例 resnet18 为例：
+ 进入sample目录
    ```bash
    cd 01_classification_sample/01_resnet18
    ```
+ 运行模型
    ``` bash
    python3 resnet18.py \
    --model-path resnet18_224x224_nv12.hbm \
    --test-img ../../assets/zebra_cls.jpg
    ```
+ 查看结果
    ``` bash
    Top-5 Predictions:
    zebra: 0.9979
    impala, Aepyceros melampus: 0.0005
    cheetah, chetah, Acinonyx jubatus: 0.0005
    gazelle: 0.0004
    prairie chicken, prairie grouse, prairie fowl: 0.0002
    ```

### 通用工具说明
项目中使用了统一的工具模块以简化样例开发，路径为 utils/：

* preprocess_utils.py：图像预处理，如 resize、颜色格式转换等

* postprocess_utils.py：模型后处理逻辑，如 NMS、框变换等

* draw_utils.py：绘制检测框、关键点、分割掩码等

* common_utils.py：模型信息打印、颜色定义等

### 注意事项
* 所有示例程序均使用`.hbm`格式模型，需配合平台`hbm_runtime`的python推理接口使用。

* assets/ 文件夹中包含所有示例所需测试图像、音频等资源。

* labels/ 文件夹中存放各类模型使用的标签文件，如 COCO 类别名、ImageNet 标签等。

* 注意：各子目录下提供的`README.md`会详细介绍对应模型所需环境说明、命令行参数、运行方式等内容。

## ResNet18 图像分类示例

本示例演示如何使用`hbm_runtime`的python接口部署`ResNet18`模型进行图像分类推理。适用于搭载BPU芯片的 RDK S100设备。

### 模型说明
- 简介：

  ResNet（Residual Network）是由微软研究院提出的一种深层卷积神经网络架构，其核心思想是引入“残差连接（Residual Connection）”，通过跨层的快捷连接缓解了深层网络中的梯度消失问题，从而能有效训练数十甚至上百层的深度网络。本示例采用的 ResNet18 是其中的一种较轻量级变种，具有 18 层结构，广泛应用于图像分类、特征提取等任务。
- HBM模型名称：resnet18_224x224_nv12.hbm

- 输入格式：NV12，大小为 224x224

- 输出：1000 类别的 softmax 概率分布

- 模型下载地址（程序自动下载）：

    ```bash
    https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_s100/ResNet/resnet18_224x224_nv12.hbm
    ```

### 功能说明
- 模型加载

    使用 `hbm_runtime` 加载指定模型，解析输入输出名称和形状，用于后续推理。

- 输入预处理

    将 BGR 图像 resize 到 224x224, 转换为 NV12 格式（Y、UV 分离）。

- 推理执行

    通过 .run() 方法完成模型前向推理，支持可选调度参数（优先级、核心绑定）。

- 结果后处理

    读取输出 tensor，解析 top-K 分类结果（Top-5），显示类别标签和概率值。

### 环境依赖
本样例无特殊环境需求，只需确保安装了pydev中的环境依赖即可。
```bash
pip install -r ../../requirements.txt
```

### 目录结构
```text
.
├── resnet18.py                 # 主程序，使用 `hbm_runtime` 调用 ResNet18 进行分类
└── README.md                   # 使用说明
```

### 参数说明
| 参数           | 说明                                                     | 默认值                                      |
|----------------|----------------------------------------------------------|---------------------------------------------|
| `--model-path` | 模型文件路径（.hbm 格式）                                | `resnet18_224x224_nv12.hbm`                 |
| `--test-img`   | 测试图片路径                                            | `../../assets/zebra_cls.jpg`                |
| `--label-file` | 类别标签映射文件路径                                     | `../../labels/imagenet1000_clsidx_to_labels.txt` |
| `--priority`   | 模型优先级（0~255，越大优先级越高）                      | `0`                                         |
| `--bpu-cores`  | 推理使用的 BPU 核心编号列表（如 `--bpu-cores 0 1`）     | `[0]`                                       |


### 快速运行
- 运行模型
    - 使用默认参数
        ```bash
        python resnet18.py
        ```
    - 指定参数运行
        ```bash
        python resnet18.py \
        --model-path resnet18_224x224_nv12.hbm \
        --test-img ../../assets/zebra_cls.jpg \
        --label-file ../../labels/imagenet1000_clsidx_to_labels.txt
        ```

- 查看结果
    ```bash
    Top-5 Predictions:
    zebra: 0.9979
    impala, Aepyceros melampus: 0.0005
    cheetah, chetah, Acinonyx jubatus: 0.0005
    gazelle: 0.0004
    prairie chicken, prairie grouse, prairie fowl: 0.0002
    ```

### 注意事项
- 若指定模型路径不存在，程序将尝试自动下载模型。


## MobileNetV2 图像分类示例

本示例展示如何使用基于 BPU 部署的 `MobileNetV2` 模型进行图像分类任务，使用 `hbm_runtime` 进行推理。

### 模型说明
- 简介：

    MobileNetV2 是一种轻量级卷积神经网络，由 Google 于 2018 年提出，设计用于在移动设备上实现高效的图像识别。其引入了 Inverted Residual 和 Linear Bottleneck 的结构，以降低计算量并提升性能。MobileNetV2 非常适合部署在边缘设备和资源受限场景中，用于图像分类、检测等任务。本示例使用的 MobileNetV2 模型为 224×224 输入、支持 NV12 格式的 BPU 量化模型。

- HBM 模型名称： mobilenetv2_224x224_nv12.hbm

- 输入格式： NV12，大小为 224x224（Y、UV 分离）

- 输出： 1000 类别的 softmax 概率分布（符合 ImageNet 1000 类标准）

- 模型下载地址（程序自动下载）：

    ```bash
    https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_s100/MobileNet/mobilenetv2_224x224_nv12.hbm
    ```
### 功能说明
- 模型加载

    使用 `hbm_runtime` 加载模型文件，提取模型名称、输入输出名称及其对应 shape 信息。

- 输入预处理

    将输入图像从 BGR 格式 resize 到 224x224 后，转换为硬件要求的 NV12 格式（Y 与 UV 分离），形成字典结构输入，适配推理接口。

- 推理执行

    调用 .run() 方法执行推理，支持设置 BPU 运行核心（如 core0/core1）及推理优先级（0~255）。

- 结果后处理

    获取模型输出 tensor，解析 softmax 概率并显示 top-K（默认 top-5）预测结果，输出对应的类别名称和概率。

### 环境依赖
本样例无特殊环境需求，只需确保安装了pydev中的环境依赖即可。
```bash
pip install -r ../../requirements.txt
```

### 目录结构

```text
.
├── mobilenetv2.py              # 主推理脚本
└── README.md                   # 使用说明
```

### 参数说明
| 参数           | 说明                                                     | 默认值                                      |
|----------------|----------------------------------------------------------|---------------------------------------------|
| `--model-path` | 模型文件路径（.hbm 格式）                                  | `mobilenetv2_224x224_nv12.hbm`                 |
| `--test-img`   | 测试图片路径                                              | `../../assets/zebra_cls.jpg`                |
| `--label-file` | 类别标签映射文件路径                                       | `../../labels/imagenet1000_clsidx_to_labels.txt` |
| `--priority`   | 模型优先级（0~255，越大优先级越高）                         | `0`                                         |
| `--bpu-cores`  | 推理使用的 BPU 核心编号列表（如 `--bpu-cores 0 1`）         | `[0]`                                       |


### 快速运行
- 运行模型
    - 使用默认参数
        ```bash
        python mobilenetv2.py
        ```
    - 指定参数运行
        ```bash
        python mobilenetv2.py \
        --model-path mobilenetv2_224x224_nv12.hbm \
        --test-img ../../assets/zebra_cls.jpg \
        --label-file ../../labels/imagenet1000_clsidx_to_labels.txt
        ```
- 查看结果
    ```bash
    Top-5 Predictions:
    zebra: 0.8916
    tiger, Panthera tigris: 0.0028
    hartebeest: 0.0018
    jaguar, panther, Panthera onca, Felis onca: 0.0016
    tiger cat: 0.0016
    ```

### 注意事项
- 若指定模型路径不存在，程序将尝试自动下载模型。

## YOLOv5X 目标检测示例

本示例展示如何在 BPU 上使用量化后的 YOLOv5X 模型执行图像目标检测。支持前处理、后处理、NMS 以及最终的目标框绘制和结果保存。


### 模型说明
- 简介：

    YOLOv5 是一类高性能的目标检测模型，其名称代表 "You Only Look Once"，可实现单次前向推理完成目标定位与分类。YOLOv5X 是其中最大的变体，具备更多的网络参数，检测精度高，适用于对准确率要求较高的场景。YOLOv5 模型将输入图像映射为多个网格，每个网格预测多个 anchor 的类别和边界框。本模型已量化为适用于BPU芯片的 HBM 格式，输入尺寸为 672×672 的 NV12 图像。

- HBM 模型名称： yolov5x_672x672_nv12.hbm

- 输入格式： NV12，大小为 672x672（Y、UV 分离）

- 输出： N 个目标框，每个目标包含 (类别索引、概率、坐标框) 三元组


### 功能说明
- 模型加载

    通过 `hbm_runtime` 加载 yolov5x 量化模型，解析模型名称、输入输出名称、形状与量化参数等信息，为后续推理配置做好准备。

- 输入预处理

    将输入图像 resize 到 672x672 后转换为 NV12 格式（Y、UV 分离），并以嵌套字典形式组织输入，以适配推理接口。

- 推理执行

    利用 .run() 方法运行推理过程，支持设置推理优先级和 BPU 核心绑定（如 core0/core1 等）。

- 结果后处理

    - 对输出 tensor 进行 dequant 去量化；

    - 解码 YOLO 输出，得到预测框、置信度、类别索引；

    - 根据 score 阈值进行初筛；

    - 应用 NMS（非极大值抑制）去除冗余框；

    - 将预测框坐标映射回原图尺寸；

    - 叠加检测框并保存结果图像。


### 环境依赖
本样例无特殊环境需求，只需确保安装了pydev中的环境依赖即可。
```bash
pip install -r ../../requirements.txt
```

### 目录结构

```text
.
├── yolov5x.py                  # 主推理脚本
└── README.md                   # 使用说明
```

### 参数说明

| 参数           | 说明                                                     | 默认值                                      |
|----------------|----------------------------------------------------------|---------------------------------------------|
| `--model-path` | 模型文件路径（.hbm 格式）                                  | `/opt/hobot/model/s100/basic/yolov5x_672x672_nv12.hbm` |
| `--test-img`   | 测试图片路径                                              | `../../assets/kite.jpg`                     |
| `--label-file` | 类别标签路径（每行一个类别）                                | `../../labels/coco_classes.names`           |
| `--img-save-path` | 检测结果图像保存路径                                    | `result.jpg`                                |
| `--priority`  | 模型调度优先级（0~255）                                     | `0`                                         |
| `--bpu-cores` | 使用的 BPU 核心编号列表（如 `--bpu-cores 0 1`）              | `[0]`                                      |
| `--nms-thres`   | 非极大值抑制（NMS）阈值                                    | `0.45`                                    |
| `--score-thres` | 置信度阈值                                                | `0.25`                                    |


### 快速运行
- 运行模型
    - 使用默认参数
        ```bash
        python yolov5x.py
        ```
    - 指定参数运行
        ```bash
        python yolov5x.py \
            --model-path yolov5x_672x672_nv12.hbm \
            --test-img ../../assets/kite.jpg \
            --label-file ../../labels/coco_classes.names \
            --img-save-path result.jpg \
            --priority 0 \
            --bpu-cores 0 \
            --nms-thres 0.45 \
            --score-thres 0.25
        ```
- 查看结果

    运行成功后，会将目标检测框绘制在原图上，并保存到 --img-save-path 指定路径
    ```bash
    [Saved] Result saved to: result.jpg
    ```

### 注意事项
- 若指定模型路径不存在，可尝试去`/opt/hobot/model/s100/basic/`查找。

## YOLOv11 目标检测示例

本示例基于 YOLOv11 模型，通过 `hbm_runtime` 接口完成图像的目标检测。支持图像预处理、推理、后处理（包含解码、置信度过滤、NMS）以及结果图像保存。

### 模型说明
- 简介：

    YOLOv11 是一款轻量级的 anchor-based 目标检测模型，融合了 anchor-free 与 anchor-based 思想，具备快速推理和精确定位的能力。该模型在回归阶段采用离散分桶（regression bin）方式，结合 softmax 分类和解码机制来提升定位精度。YOLOv11 适用于实时场景下的小模型部署，如安防监控、工业检测等任务。

- HBM 模型名称： yolo11n_detect_nashe_640x640_nv12.hbm

- 输入格式： NV12 格式，大小为 640x640（Y、UV 分离）

- 输出： 多尺度特征图，每层包含类别得分张量和边界框离散回归张量，最终输出为目标框位置、类别 ID 和置信度分数

- 模型下载地址（程序自动下载）：

    ```bash
    https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_s100/ultralytics_YOLO/yolo11n_detect_nashe_640x640_nv12.hbm
    ```

### 功能说明
- 模型加载

    使用 `hbm_runtime` 接口加载 YOLOv11 量化模型，提取输入输出名称、形状、量化信息等模型元数据，供后续推理流程使用。

- 输入预处理

    将原始 BGR 图像 resize 为 640×640，转换为 NV12 格式（Y、UV 分离），构造输入张量嵌套字典，适配推理接口要求。

- 推理执行

    通过 .run() 方法运行前向推理，可指定调度参数（推理优先级、BPU 核心绑定）。输出包含多个尺度分支的分类张量与回归张量。

- 结果后处理

    - 将量化输出反量化为 float32；

    - 对每个尺度分支进行分类分数筛选，保留超过设定置信度阈值的候选框；

    - 使用多分桶回归算法进行边框解码；

    - 合并所有尺度的候选框并应用 NMS（非极大值抑制）去除冗余框；

    - 将检测框从模型输入坐标系映射回原图尺寸；

    - 可选地绘制检测结果并保存图像文件。

### 环境依赖
本样例无特殊环境需求，只需确保安装了pydev中的环境依赖即可。
```bash
pip install -r ../../requirements.txt
```

### 目录结构
```text
.
├── yolov11.py                  # 主推理脚本
└── README.md                   # 使用说明
```

### 参数说明
| 参数名           | 说明                                                         | 默认值                                         |
|------------------|--------------------------------------------------------------|------------------------------------------------|
| `--model-path`    | 模型文件路径（.hbm 格式）                                    | `yolo11n_detect_nashe_640x640_nv12.hbm`        |
| `--test-img`      | 输入测试图片路径                                             | `../../assets/kite.jpg`                        |
| `--label-file`    | 类别标签文件路径（每行一个类别名称）                         | `../../labels/coco_classes.names`              |
| `--img-save-path` | 检测结果图像保存路径                                         | `result.jpg`                                   |
| `--priority`      | 模型调度优先级（0~255，数值越大优先级越高）                  | `0`                                            |
| `--bpu-cores`     | 使用的 BPU 核心编号列表（如 `--bpu-cores 0 1`）             | `[0]`                                          |
| `--nms-thres`     | 非极大值抑制（NMS）的 IoU 阈值                                | `0.45`                                         |
| `--score-thres`   | 置信度过滤阈值（低于该值的目标将被过滤）                      | `0.25`                                         |


### 快速运行
- 运行模型
    - 使用默认参数
        ```bash
        python yolov11.py
        ```
    - 指定参数运行
        ```bash
        python yolov11.py \
            --model-path yolo11n_detect_nashe_640x640_nv12.hbm \
            --test-img ../../assets/kite.jpg \
            --label-file ../../labels/coco_classes.names \
            --img-save-path result.jpg \
            --priority 0 \
            --bpu-cores 0 \
            --nms-thres 0.45 \
            --score-thres 0.25 \
        ```
- 查看结果

    运行成功后，会将目标检测框绘制在原图上，并保存到 --img-save-path 指定路径
    ```bash
    [Saved] Result saved to: result.jpg
    ```

### 注意事项
- 若指定模型路径不存在，程序将尝试自动下载模型。

## UNetMobileNet 语义分割示例

本示例展示了如何基于 `hbm_runtime` 在 BPU 上运行 UNet-MobileNet 语义分割模型，支持图像预处理、推理、后处理（解析输出并叠加彩色分割掩码）等功能。

### 模型说明
- 简介：

    UNet 是一种经典的语义分割网络结构，采用编码器-解码器架构，在医学图像分析等领域表现出色。本示例使用 MobileNet 作为编码器主干网络，以降低模型复杂度并加快推理速度，适用于边缘设备上的实时分割任务。模型输出为每个像素的类别标签，用于实现城市街景分割等应用。

- HBM 模型名称： unet_mobilenet_1024x2048_nv12.hbm

- 输入格式： NV12，大小为 1024x2048（Y、UV 平面分离）

- 输出： 尺寸与输入一致的分割图，每个像素点对应一个 0~18 的类别编号（共 19 类）

### 功能说明
- 模型加载

    使用 `hbm_runtime` 加载量化后的语义分割模型，提取模型名、输入输出张量名称、形状与量化信息等元数据。

- 输入预处理

    原始图像以 BGR 格式加载后被缩放至 1024×2048，转换为 NV12 格式（Y/UV 分离），并封装为推理接口要求的输入字典结构。

- 推理执行

    使用 .run() 方法执行模型前向推理，支持设定调度参数如 BPU 核心分配与优先级。输出为类别 logits 张量。

- 结果后处理

    - 对输出张量取 argmax 得到每个像素所属类别；

    - 将预测图 resize 到输入图大小；

    - 恢复为原图尺寸并映射到指定颜色调色板；

    - 使用设定的 alpha 融合系数与原图进行混合，生成分割可视化图；

    - 最终图像包含分割结果的直观覆盖图，可保存或展示。

### 环境依赖
本样例无特殊环境需求，只需确保安装了pydev中的环境依赖即可。
```bash
pip install -r ../../requirements.txt
```

### 目录结构
```text
.
├── unet_mobilenet.py           # 主推理脚本
└── README.md                   # 使用说明
```

### 参数说明

| 参数名               | 说明                                      | 默认值                                 |
| ----------------- | --------------------------------------- | ----------------------------------- |
| `--model-path`    | 模型文件路径（.hbm 格式）                              | `/opt/hobot/model/s100/basic/unet_mobilenet_1024x2048_nv12.hbm` |
| `--test-img`      | 输入测试图像路径                                      | `../../assets/segmentation.png`     |
| `--img-save-path` | 推理后结果图像保存路径                                  | `result.jpg`                        |
| `--priority`      | 模型优先级（0\~255，越大优先级越高）                    | `0`                                 |
| `--bpu-cores`     | 指定运行模型的 BPU 核心编号列表（如 `--bpu-cores 0 1`） | `[0]`                               |
| `--alpha-f`       | 可视化融合系数，`0.0=仅显示掩码`，`1.0=仅原图`           | `0.75`                              |


### 快速运行
- 运行模型
    - 使用默认参数
        ```bash
        python unet_mobilenet.py
        ```
    - 指定参数运行
        ```bash
        python unet_mobilenet.py \
        --model-path /opt/hobot/model/s100/basic/unet_mobilenet_1024x2048_nv12.hbm \
        --test-img ../../assets/segmentation.png \
        --img-save-path result.jpg \
        --alpha-f 0.75 \
        --priority 0 \
        --bpu-cores 0
        ```
- 查看结果

    运行成功后，会将结果绘制在原图上，并保存到 --img-save-path 指定路径
    ```bash
    [Saved] Result saved to: result.jpg
    ```


## YOLOv11 语义分割示例

本示例展示了如何基于 `hbm_runtime` 在 BPU 上运行 YOLOv11 语义分割模型，支持图像预处理、推理、后处理（解析输出并叠加彩色分割掩码）等功能。

### 模型说明
- 简介：

    YOLOv11 是一款轻量级目标检测与实例分割模型，基于 YOLO 系列设计并融合了 anchor-free 与 anchor-based 思想结构与回归分箱（distributional regression）策略。本模型为其实例分割变体，支持同时输出边界框、类别概率和高质量的像素级掩膜，适用于实时场景中的多对象检测与分割任务。

- HBM 模型名称： yolo11n_seg_nashe_640x640_nv12.hbm

- 输入格式： NV12 格式图像（Y/UV 分离），尺寸为 640x640

- 输出：

    - 目标检测结果（bounding box + 类别 + 分数）

    - 实例分割掩膜（每个目标对应一张 mask）


- 模型下载地址（程序自动下载）：

    ```bash
    https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_s100/ultralytics_YOLO/yolo11n_seg_nashe_640x640_nv12.hbm
    ```
### 功能说明
- 模型加载

    使用 `hbm_runtime` 加载量化后的 YOLOv11 实例分割模型，并解析输入输出张量的名称、形状、量化参数等运行时元数据。

- 输入预处理

    将输入 BGR 图像缩放至 640×640，并转换为 NV12 格式（Y、UV 平面分离），以适配模型输入要求。

- 推理执行

    通过 .run() 方法触发前向推理，并支持通过接口设定调度参数（BPU 核绑定与优先级）。推理输出包含多个尺度的类别分数、边界框回归、掩膜系数以及全局掩膜原型张量。

- 结果后处理

    - 使用阈值筛选检测候选，并解码边界框与掩膜系数；

    - 合并各尺度输出，应用 NMS 筛选最终目标；

    - 利用掩膜原型与系数恢复出每个目标的掩膜；

    - 掩膜及边界框均被缩放回原始图像尺寸；

    - 支持可选形态学操作（开操作）以优化掩膜边缘；

    - 最终输出为边框、类别、分数与像素级实例掩膜。

### 环境依赖
本样例无特殊环境需求，只需确保安装了pydev中的环境依赖即可。
```bash
pip install -r ../../requirements.txt
```

### 目录结构
```text
.
├── yolov11_seg.py              # 主推理脚本
└── README.md                   # 使用说明
```

### 参数说明
| 参数                | 说明                    | 默认值 |
|--------------------|-----------------------------|--------------------------------------|
| `--model-path`     | 模型文件路径（.hbm 格式）     | `yolo11n_seg_nashe_640x640_nv12.hbm` |
| `--test-img`       | 测试图片路径                 | `../../assets/office_desk.jpg`        |
| `--label-file`     | 分类标签文件                 | `../../labels/coco_classes.names`     |
| `--img-save-path`  | 输出结果图片保存路径          | `result.jpg`                          |
| `--priority`       | 模型优先级 (0~255)           | `0`                                   |
| `--bpu-cores`      | BPU 核心编号                 | `[0]`                                 |
| `--nms-thres`      | NMS IoU 队值间值             | `0.7`                                 |
| `--score-thres`    | 精度阈值                     | `0.25`                                |
| `--is-open`        | 是否对分割结果进行形态形象处理 | `True`                                |
| `--is-point`       | 是否在边缘处绘制边线上的点     | `True`                                |

### 快速运行
- 运行模型
    - 使用默认参数
        ```bash
        python yolov11_seg.py
        ```
    - 指定参数运行
        ```bash
        python yolov11_seg.py \
        --model-path yolo11n_seg_nashe_640x640_nv12.hbm \
        --test-img ../../assets/office_desk.jpg \
        --label-file ../../labels/coco_classes.names \
        --img-save-path result.jpg \
        --priority 0 \
        --bpu-cores 0 \
        --nms-thres 0.7 \
        --score-thres 0.25 \
        --is-open True \
        --is-point True
        ```
- 查看结果

    运行成功后，会将结果绘制在原图上，并保存到 --img-save-path 指定路径
    ```bash
    [Saved] Result saved to: result.jpg
    ```

### 注意事项
- 若指定模型路径不存在，程序将尝试自动下载模型。


## YOLOv11 姿态估计示例

本示例展示了如何基于 `hbm_runtime` 在 BPU 上运行 YOLOv11 姿态估计模型，实现人体关键点检测与可视化。支持模型预处理、推理执行与后处理（含关键点解码、边界框绘制、关键点标注）。

### 模型说明
- 简介：

    YOLOv11 Pose 是一款高效的轻量级人体关键点检测模型，支持同时进行目标检测与姿态估计（多关键点预测）。它基于 YOLO anchor-free 结构并集成 Distribution Focal Loss（DFL）以增强边界框与关键点的定位精度，适用于实时应用场景中的多人体姿态识别任务。

- HBM 模型名称： yolo11n_pose_nashe_640x640_nv12.hbm

- 输入格式： NV12 格式图像（Y、UV 分离），尺寸为 640×640

- 输出：

    - 每个人的边界框坐标（xyxy）

    - 关键点位置（K×2，x/y 坐标）

    - 每个关键点的置信度得分

    - 支持 COCO 人体关键点格式（常见为 17 点）

- 模型下载地址（程序自动下载）：

    ```bash
    https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_s100/ultralytics_YOLO/yolo11n_pose_nashe_640x640_nv12.hbm
    ```
### 功能说明
- 模型加载

    使用 `hbm_runtime` 加载指定的 YOLOv11 姿态估计模型，自动解析模型的输入输出张量名称、形状与量化参数。

- 输入预处理

    将输入的 BGR 图像 resize 到 640×640，并转为 NV12 格式（Y、UV 分离），用于模型推理。

- 推理执行

    调用 .run() 接口执行推理，同时支持设置运行优先级和 BPU 核心绑定，通过 set_scheduling_params() 实现。

- 结果后处理

    - 解码多尺度输出中的边界框（使用 DFL 分箱解码）；

    - 解码关键点位置与置信度（K×2 + K）；

    - 使用 NMS 去除冗余检测框；

    - 将关键点坐标和边界框映射回原始图像尺寸；

    - 提供阈值控制仅显示高置信度关键点；

    - 支持图像可视化，包括检测框与关键点绘制。


### 环境依赖
本样例无特殊环境需求，只需确保安装了pydev中的环境依赖即可。
```bash
pip install -r ../../requirements.txt
```

### 目录结构
```text
.
├── yolov11pose.py              # 主推理脚本
└── README.md                   # 使用说明
```

### 参数说明
| 参数名                | 说明                                              | 默认值                                |
| ------------------ | --------------------------------------------------- | ------------------------------------- |
| `--model-path`     | 模型文件路径（`.hbm` 格式）                           | `yolo11n_pose_nashe_640x640_nv12.hbm` |
| `--test-img`       | 测试图像路径                                         | `../../assets/bus.jpg`                |
| `--label-file`     | 类别标签路径，每行一个类别名称                         | `../../labels/coco_classes.names`     |
| `--img-save-path`  | 检测结果保存路径                                     | `result.jpg`                          |
| `--priority`       | 模型调度优先级（0\~255，数值越大优先级越高）           | `0`                                   |
| `--bpu-cores`      | 推理所使用的 BPU 核心编号列表（如：`--bpu-cores 0 1`） | `[0]`                                 |
| `--nms-thres`      | 非极大值抑制（NMS）中的 IoU 阈值                      | `0.7`                                 |
| `--score-thres`    | 目标置信度阈值（低于该值的目标将被过滤）               | `0.25`                                |
| `--kpt-conf-thres` | 关键点可视化置信度阈值（低于该值的关键点将不显示）      | `0.5`                                 |

### 快速运行
- 运行模型
    - 使用默认参数
        ```bash
        python yolov11pose.py
        ```
    - 指定参数运行
        ```bash
        python yolov11pose.py \
        --model-path yolo11n_pose_nashe_640x640_nv12.hbm \
        --test-img ../../assets/bus.jpg \
        --label-file ../../labels/coco_classes.names \
        --img-save-path result.jpg \
        --priority 0 \
        --bpu-cores 0 \
        --score-thres 0.25 \
        --nms-thres 0.7 \
        --kpt-conf-thres 0.5
        ```
- 查看结果

    运行成功后，会将结果绘制在原图上，并保存到 --img-save-path 指定路径
    ```bash
    [Saved] Result saved to: result.jpg
    ```

### 注意事项
- 若指定模型路径不存在，程序将尝试自动下载模型。

## YOLO-EV11 实例分割示例

本示例展示了如何使用 `hbm_runtime` 在 BPU 上运行 YOLO-EV11 实例分割模型。程序实现了从输入图像的预处理、模型推理、后处理到结果可视化的完整流程。

### 模型说明
- 简介：

    YOLO-EV11 是一款高效能的端侧实例分割模型，适用于开放词汇物体检测与分割任务。该模型通过多尺度特征提取、密集分类和原型掩膜生成，有效识别图像中的物体并输出精细的实例分割结果。本示例使用的是 YOLO-EV11 的轻量级版本，输入图像为 640x640，支持 4585 类的广义物体分类与分割。

- HBM模型名称：yoloe_11s_seg_pf_nashe_640x640_nv12.hbm

- 输入格式：NV12，大小为 640x640

- 输出：

    - 检测框（xyxy 格式）

    - 类别 ID 和置信度分数

    - 实例分割掩膜（每个实例一个独立掩膜）

- 模型下载地址（程序自动下载）：

    ```bash
    https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_s100/ultralytics_YOLO/yoloe_11s_seg_pf_nashe_640x640_nv12.hbm
    ```
### 功能说明
- 模型加载

    使用 `hbm_runtime` 加载指定量化模型，解析输入输出名称、形状、量化参数等元信息。

- 输入预处理

    将 BGR 图像 resize 到 640x640，转换为 NV12 格式（Y、UV 分离），构造成推理输入张量。

- 推理执行

    调用 .run() 接口执行前向推理，支持设置运行优先级和 BPU 核绑定等调度策略。

- 结果后处理

    对多尺度输出进行后处理，包括：

    - 分类置信度筛选（基于 score threshold）

    - DFL 边框解码

    - 掩膜原型融合与掩膜生成

    - NMS 过滤与结果融合

    - 将检测框和掩膜缩放回原图尺寸

    - 支持可选的掩膜开运算（形态学处理）与边界轮廓绘制

### 环境依赖
本样例无特殊环境需求，只需确保安装了pydev中的环境依赖即可。
```bash
pip install -r ../../requirements.txt
```

### 目录结构
```text
.
├── yoloEv11_seg.py             # 主推理脚本
└── README.md                   # 使用说明
```

### 参数说明
| 参数名               | 说明                                     | 默认值                                       |
| ----------------- | ------------------------------------------ | ----------------------------------------- |
| `--model-path`    | BPU 量化模型路径（\*.hbm）                  | `yoloe_11s_seg_pf_nashe_640x640_nv12.hbm` |
| `--test-img`      | 输入测试图像路径                            | `../../assets/office_desk.jpg`            |
| `--label-file`    | 类别标签文件路径（每行一个类别）             | `../../labels/coco_extended.names`        |
| `--img-save-path` | 推理结果图像保存路径                        | `result.jpg`                              |
| `--priority`      | 模型调度优先级（0\~255）                    | `0`                                       |
| `--bpu-cores`     | 使用的 BPU 核心编号（如 `--bpu-cores 0 1`） | `[0]`                                     |
| `--nms-thres`     | 非极大值抑制（NMS）的 IoU 阈值              | `0.7`                                     |
| `--score-thres`   | 目标检测置信度阈值                          | `0.25`                                    |
| `--is-open`       | 是否对掩码进行形态学操作（开操作）           | `False`                                   |
| `--is-point`      | 是否绘制掩码边缘轮廓点                      | `False`                                   |


### 快速运行
- 运行模型
    - 使用默认参数
        ```bash
        python yoloEv11_seg.py
        ```
    - 指定参数运行
        ```bash
        python yoloEv11_seg.py \
        --model-path yoloe_11s_seg_pf_nashe_640x640_nv12.hbm \
        --priority 0 \
        --bpu-cores 0 \
        --test-img ../../assets/office_desk.jpg \
        --label-file ../../labels/coco_extended.names \
        --img-save-path result.jpg \
        --nms-thres 0.7 \
        --score-thres 0.25 \
        --is-open False \
        --is-point False
        ```
- 查看结果

    运行成功后，会将结果绘制在原图上，并保存到 --img-save-path 指定路径
    ```bash
    [Saved] Result saved to: result.jpg
    ```

### 注意事项
- 若指定模型路径不存在，程序将尝试自动下载模型。

## LaneNet 车道线检测示例

本示例基于 `hbm_runtime` 运行 LaneNet 模型，实现车道线的实例分割与二值分割，并将结果图像保存到本地。

### 模型说明
- 简介：

    LaneNet 是一种用于实时车道线检测的语义分割模型。LaneNet 在图像预处理上采用归一化与标准化方式，适合自动驾驶与 ADAS 系统中的道路场景分析。本示例使用的是量化版本模型 lanenet256x512.hbm，支持 BPU 推理加速。

- HBM模型名称：lanenet256x512.hbm

- 输入格式：RGB，大小为 256x512，归一化到 [0,1] 后进行标准化

- 输出：

    - instance_seg_logits：用于区分不同车道线的 3 通道图

    - binary_seg_pred：二值分割结果，表示车道区域的位置

- 模型下载地址（程序自动下载）：

    ```bash
    https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_s100/Lanenet/lanenet256x512.hbm
    ```

#### 功能说明
- 模型加载

    使用 `hbm_runtime` 加载 LaneNet 模型，自动解析输入输出信息和量化参数。

- 输入预处理

    将输入图像转换为 RGB 格式，调整到 256x512 尺寸，并使用 ImageNet 均值与标准差进行归一化和标准化处理，最终转为 NCHW 格式并添加 batch 维度。

- 推理执行

    使用 .run() 方法进行推理，输出包括 instance 特征图和二值掩膜图，支持优先级与 BPU 核调度设置。

- 结果后处理

    对输出 tensor 进行 reshape 与归一化：

    - instance_seg_logits：输出三通道图像用于可视化每个车道实例

    - binary_seg_pred：输出单通道二值图，用于提取车道区域

### 环境依赖
本样例无特殊环境需求，只需确保安装了pydev中的环境依赖即可。
```bash
pip install -r ../../requirements.txt
```

### 目录结构
```text
.
├── lanenet.py                  # 主推理脚本
└── README.md                   # 使用说明
```

### 参数说明
| 参数名            | 说明                                      | 默认值                      |
| -------------- | ------------------------------------------- | ------------------------ |
| `--model-path` | 模型文件路径，`.hbm` 格式                     | `lanenet256x512.hbm`     |
| `--priority`   | 模型运行优先级，范围 0\~255，数值越大优先级越高 | `0`                      |
| `--bpu-cores`  | 指定用于运行模型的 BPU 核心编号                | `[0]`                    |
| `--test-img`   | 测试图像路径                                  | `../../assets/input.jpg` |

### 快速运行
- 运行模型
    - 使用默认参数
        ```bash
        python lanenet.py
        ```
    - 指定参数运行
        ```bash
        python lanenet.py \
        --model-path lanenet256x512.hbm \
        --priority 0 \
        --bpu-cores 0 \
        --test-img ../../assets/input.jpg
        ```
- 查看结果

    运行成功后，会将结果绘制出来，保存到 instance_pred.png 和 binary_pred.png
    ```bash
    Results saved to: instance_pred.png and binary_pred.png
    ```

### 注意事项
- 若指定模型路径不存在，程序将尝试自动下载模型。

## ASR 自动语音识别示例

本示例基于 `hbm_runtime` 推理引擎运行语音识别模型，实现对 .wav 格式语音文件的自动转写，输出对应的文字内容。


### 模型说明
- 简介：

    ASR（Automatic Speech Recognition）自动语音识别模型用于将音频信号转换为文本。输入为单通道语音波形（经过采样率转换和标准化处理），输出为字符级别的 token 序列。配合字典（vocab）文件使用，可实现中文语音转写。本示例使用量化后的 .hbm 模型。

- HBM模型名称：asr.hbm

- 输入格式：音频波形，单通道，采样率为 16kHz，最大长度为 30000（样本点）

- 输出：字符 token 的概率分布（logits），通过 argmax 解码后映射为识别文本

- 模型下载地址（程序自动下载）：

    ```bash
    https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_s100/asr/asr.hbm
    ```
### 功能说明
- 模型加载

    使用 `hbm_runtime` 加载 ASR 模型，并自动解析模型输入输出形状和量化信息。

- 输入预处理

    使用 SoundFile 读取音频（支持 .wav），将音频：

    - 转为单通道
    - 重采样至目标采样率（默认 16kHz）
    - 标准化为零均值单位方差（z-score）
    - 补零或截断至固定长度（如 30000）
    - 支持生成器方式处理长音频，实现流式识别。

- 推理执行

    采用 .run() 方法完成推理，输出 logits 张量。

- 结果后处理

    使用 np.argmax() 从输出 logits 中获取 token 索引，结合 vocab 字典文件（JSON 格式）映射为字符，输出最终识别文本。


### 环境依赖
- 确保安装了pydev中的环境依赖
    ```bash
    pip install -r ../../requirements.txt
    ```
- 安装soundfile包
    ```bash
    pip install soundfile==0.13.1
    ```

### 目录结构
```text
01_asr/
├── asr.py                      # 主推理脚本
```

### 参数说明
| 参数名            | 说明                                          | 默认值                  |
| ----------------- | -------------------------------------------- | ----------------------------|
| `--model-path`    | 模型路径（`.hbm` 格式）                        | `asr.hbm`                    |
| `--audio-file`    | 输入音频文件（支持 `.wav` 或 `.flac`）         | `../../assets/chi_sound.wav` |
| `--vocab-file`    | 词表文件，映射 token → id                     | `../../labels/vocab.json`    |
| `--priority`      | 推理优先级，0\~255，数值越大越优先             | `0`                           |
| `--bpu-cores`   ` | 指定使用哪些 BPU 核心（如：`--bpu-cores 0 1`） | `[0]`                         |
| `--audio_maxlen`  | 音频裁剪/填充后的固定长度（单位：采样点数）     | `30000`                         |
| `--new_rate`      | 目标采样率，音频会自动重采样为该采样率          | `16000`                         |


### 快速运行
- 运行模型
    - 使用默认参数
        ```bash
        python asr.py
        ```
    - 指定参数运行
        ```bash
        python asr.py \
        --model-path asr.hbm \
        --audio-file ../../assets/chi_sound.wav \
        --vocab-file ../../labels/vocab.json \
        --priority 0 \
        --bpu-cores 0 \
        --audio_maxlen 30000 \
        --new_rate 16000
        ```
- 查看结果

    运行成功后，会将结果打印出来
    ```bash
    我是来自阿里云的大规模语言磨型过叫通意千问||
    ```

### 注意事项
- 若指定模型路径不存在，程序将尝试自动下载模型。

## PaddleOCR 推理示例

本示例基于 `hbm_runtime` 推理引擎运行 PaddleOCR 模型进行文本检测与识别，支持中文场景的 OCR 识别与可视化。


### 模型说明
- 简介：

    本示例实现了基于 PaddleOCR v3 的中文文字检测与识别（两阶段 OCR）任务。整体流程包括检测文字区域（检测模型）与逐区域识别文字内容（识别模型）。

- HBM 模型名称：

- 检测模型（Detection）：cn_PP-OCRv3_det_infer-deploy_640x640_nv12.hbm

- 识别模型（Recognition）：cn_PP-OCRv3_rec_infer-deploy_48x320_rgb.hbm

- 输入格式：

    - 检测模型：BGR 图像 → resize 到 640×640，转换为 NV12 格式（Y、UV 分离）

    - 识别模型：旋转裁剪后的 BGR 文本块图像 → resize 到 48×320，归一化、转为 RGB 格式

- 输出：

    - 检测模型：分割概率图（1×1×H×W），后处理得到文本框坐标

    - 识别模型：字符 token 的 logits，CTC 解码后得到识别文本字符串

- 模型下载地址（程序自动下载）：

    ```bash
    # 检测模型
    https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_s100/paddle_ocr/cn_PP-OCRv3_det_infer-deploy_640x640_nv12.hbm
    # 识别模型
    https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_s100/paddle_ocr/cn_PP-OCRv3_rec_infer-deploy_48x320_rgb.hbm
    ```
### 功能说明
- 模型加载

    使用 `hbm_runtime` 分别加载文字检测与识别模型，并解析输入输出名称和形状信息，支持设置推理优先级与 BPU 核绑定。

- 输入预处理

    - 检测模型：将原图 resize 到 640×640，并转换为 NV12 格式（用于 BPU 推理）。

    - 识别模型：将每个旋转裁剪后的文本块 resize 到 48×320，转为 RGB 格式并归一化，最终转为 NCHW 结构。

- 推理执行

    调用 .run() 方法进行前向推理，输出包括概率图（检测）与 logits（识别）。

- 结果后处理

    - 检测模型：

        - 对概率图二值化（使用设定阈值）

        - 查找文本区域轮廓并扩张

        - 提取旋转框并裁剪图像区域

    - 识别模型：

        - 使用 CTCLabelDecode 对 logits 解码，映射为文字字符串

    最终将识别结果以红色文字标注在空白图中，与原图拼接可视化。

### 环境依赖
- 确保安装了pydev中的环境依赖
    ```bash
    pip install -r ../../requirements.txt
    ```
- 安装OCR处理所需的包
    ```bash
    pip install pyclipper==1.3.0.post6 Pillow==9.0.1 paddlepaddle
    ```

### 目录结构
```text
.
├── FangSong.ttf                # 中文显示用字体
├── paddle_ocr.py               # 主程序，完成文本检测与识别
├── postprocess/                # 后处理逻辑（排序、合并、解码等）
└── README.md                   # 使用说明
```

### 参数说明
| 参数名                | 默认值                                        | 说明                             |
| ------------------ | ----------------------------------------------- | -------------------------------- |
| `--det-model-path` | `cn_PP-OCRv3_det_infer-deploy_640x640_nv12.hbm` | 文本检测模型路径                  |
| `--rec-model-path` | `cn_PP-OCRv3_rec_infer-deploy_48x320_rgb.hbm`   | 文本识别模型路径                  |
| `--priority`       | `0`                                             | 模型推理优先级，数值越大优先级越高  |
| `--bpu-cores`      | `[0]`                                           | 指定运行推理的 BPU 核心索引        |
| `--test-img`       | `../../assets/gt_2322.jpg`                      | 输入图像路径                      |
| `--label-file`     | `../../labels/ppocr_keys_v1.txt`                | 文本识别所需标签文件路径           |
| `--img-save-path`  | `result.jpg`                                    | 推理结果图像的保存路径             |
| `--threshold`      | `0.5`                                           | 文本区域二值化的阈值               |
| `--ratio-prime`    | `2.7`                                           | 文本框膨胀系数，用于检测框的形态调整 |

### 快速运行
- 运行模型
    - 使用默认参数
        ```bash
        python paddle_ocr.py
        ```
    - 指定参数运行
        ```bash
        python paddle_ocr.py \
        --det-model-path cn_PP-OCRv3_det_infer-deploy_640x640_nv12.hbm \
        --rec-model-path cn_PP-OCRv3_rec_infer-deploy_48x320_rgb.hbm \
        --test-img ../../assets/gt_2322.jpg \
        --label-file ../../labels/ppocr_keys_v1.txt \
        --img-save-path result.jpg \
        --priority 0 \
        --bpu-cores 0 \
        --threshold 0.5 \
        --ratio-prime 2.7
        ```
- 查看结果

    运行成功后，会将结果绘制在原图上，并保存到 --img-save-path 指定路径
    ```bash
    [Saved] Result saved to: result.jpg
    ```

### 注意事项
- 若指定模型路径不存在，程序将尝试自动下载模型。

## YOLOv5X USB Camera Inference 推理示例

基于 `hbm_runtime` 的 YOLOv5X 实时推理示例，支持通过 USB 摄像头读取画面并进行目标检测，并以全屏方式可视化检测结果。

### 功能说明
- 模型加载

    通过 `hbm_runtime` 加载指定的 .hbm 模型文件，提取模型名称、输入输出形状、量化信息等。

- 摄像头采集

    自动扫描 /dev/video* 下的设备，打开第一个可用的 USB 摄像头，设置为 MJPEG 编码、1080p 分辨率、30 FPS。

- 图像预处理

    将 BGR 图像 resize 至模型输入分辨率（letterbox 模式或普通缩放），并转换为 NV12 格式。

- 推理执行

    通过 run() 方法提交输入张量，在 BPU 上完成模型前向计算。

- 后处理

    包括量化输出解码、候选框筛选（按 score 阈值过滤）、NMS 去重，以及坐标还原回原始图像大小。

- 可视化显示

    将检测框及其类别、置信度绘制在图像上，并在窗口中全屏显示，支持实时处理和退出控制。

### 模型说明
    参考 [YOLOv5X 目标检测示例小结](./02_Python_Sample.md#yolov5x-目标检测示例)。

### 环境依赖
- 确保安装了pydev中的环境依赖
    ```bash
    pip install -r ../requirements.txt
    ```

### 目录结构
```text
.
├── usb_camera_yolov5x.py       # 主程序
└── README.md                   # 使用说明
```

### 参数说明
| 参数名           | 说明                              | 默认值                                                    |
| --------------- | --------------------------------- | ------------------------------------------------------ |
| `--model-path`  | BPU 量化模型路径（`.hbm`）          | `/opt/hobot/model/s100/basic/yolov5x_672x672_nv12.hbm` |
| `--priority`    | 推理优先级（0\~255，255为最高）     | `0`                                                    |
| `--bpu-cores`   | BPU 核心索引列表（如 `0 1`）        | `[0]`                                                  |
| `--label-file`  | 类别标签文件路径                    | `../labels/coco_classes.names`                         |
| `--nms-thres`   | 非极大值抑制的 IoU 阈值             | `0.45`                                                 |
| `--score-thres` | 检测置信度阈值                      | `0.25`                                                 |


### 快速运行
注意：该程序需运行在桌面环境。
- 运行模型
    - 使用默认参数
        ```bash
        python usb_camera_yolov5.py
        ```
    - 指定参数运行
        ```bash
        python usb_camera_yolov5x.py \
        --model-path /opt/hobot/model/s100/basic/yolov5x_672x672_nv12.hbm \
        --priority 0 \
        --bpu-cores 0 \
        --label-file ../labels/coco_classes.names \
        --nms-thres 0.45 \
        --score-thres 0.25
        ```
- 退出运行

    按Q键退出

- 查看结果

    运行成功后，屏幕会实时显示目标检测图像

### 注意事项
- 该程序需运行在桌面环境。

- 若指定模型路径不存在，可尝试去`/opt/hobot/model/s100/basic/`查找。


## YOLOv5X MIPI Camera Inference 推理示例

基于 `hbm_runtime` 的 YOLOv5X 实时推理示例，支持通过 MIPI 摄像头读取画面并进行目标检测，并以全屏方式可视化检测结果。

### 功能说明

- 模型加载

    通过 `hbm_runtime` 加载 `.hbm` 格式模型，初始化输入输出信息;

- 摄像头采集

    使用 `srcampy.Camera()` 初始化 VIO 摄像头，采集 1920×1080 分辨率 NV12 图像;

- HDMI 显示

    使用 `srcampy.Display()` 绑定图像输出通道，实现实时显示;

- 图像预处理

    对 NV12 格式图像进行分离、缩放、转换为 BPU 所需张量格式;

- BPU 推理

    通过 `run()` 方法调用 BPU 执行推理任务;

- 结果后处理

    包括输出解码、置信度筛选、NMS 抑制、坐标缩放;

- 可视化显示

    将检测框和类别文本绘制到 overlay 层;


### 模型说明
    参考 [YOLOv5X 目标检测示例小结](./02_Python_Sample.md#yolov5x-目标检测示例)。


### 环境依赖
- 确保安装了pydev中的环境依赖
    ```bash
    pip install -r ../requirements.txt
    ```

### 目录结构

```text
.
├── mipi_camera_yolov5x.py      # 主程序
└── README.md                   # 使用说明
```

### 参数说明
| 参数名           | 说明                              | 默认值                                                    |
| --------------- | --------------------------------- | ------------------------------------------------------ |
| `--model-path`  | BPU 量化模型路径（`.hbm`）          | `/opt/hobot/model/s100/basic/yolov5x_672x672_nv12.hbm` |
| `--priority`    | 推理优先级（0\~255，255为最高）     | `0`                                                    |
| `--bpu-cores`   | BPU 核心索引列表（如 `0 1`）        | `[0]`                                                  |
| `--label-file`  | 类别标签文件路径                    | `../labels/coco_classes.names`                         |
| `--nms-thres`   | 非极大值抑制的 IoU 阈值             | `0.45`                                                 |
| `--score-thres` | 检测置信度阈值                      | `0.25`                                                 |


### 快速运行
注意：该程序需运行在桌面环境。
- 运行模型
    - 使用默认参数
        ```bash
        python mipi_camera_yolov5x.py
        ```
    - 指定参数运行
        ```bash
        python mipi_camera_yolov5x.py \
        --model-path /opt/hobot/model/s100/basic/yolov5x_672x672_nv12.hbm \
        --priority 0 \
        --bpu-cores 0 \
        --label-file ../labels/coco_classes.names \
        --nms-thres 0.45 \
        --score-thres 0.25
        ```
- 退出运行

    在命令行输入Ctrl C

- 查看结果

    运行成功后，屏幕会实时显示目标检测图像

### 注意事项
- 该程序需运行在桌面环境。

- 若指定模型路径不存在，可尝试去`/opt/hobot/model/s100/basic/`查找。

## YOLOv5X WebSocket 推理示例

本示例展示了如何在含有 HBM 加速器和 VIO 摄像头模块的嵌入式平台（如 RDK S100）上，使用 YOLOv5X 模型进行目标检测，并通过 WebSocket 实时推送 JPEG 图像和检测框。

### 功能说明

- 模型加载

    初始化 `hbm_runtime`，加载模型，获取输入/输出名称和尺寸

- 前处理 (Preprocess)

    将原始的 NV12 图像分割为 Y/UV 通道，缩放到模型需求尺寸，生成正确格式的输入 Tensor

- 模型推理 (Inference)

    调用.run() 执行 BPU 推理

- 后处理 (Postprocess)

    解码推理结果，扫除缺乏精度和应用 NMS，将结果缩放回原图尺寸

- 相机管理 (CameraManager)

    打开相机，获取原始图像或模型尺寸图像，进行 JPEG 编码

- WebSocket 服务器

    接受网页端连接，持续获取相机图像，执行检测并给网页端返回 Protocol Buffer 结果

### 模型说明
    参考 [YOLOv5X 目标检测示例小结](./02_Python_Sample.md#yolov5x-目标检测示例)。

### 环境依赖
- 确保安装了pydev中的环境依赖
    ```bash
    pip install -r ../requirements.txt
    ```
- 安装WebSocket的包
    ```bash
    pip install websockets==15.0.1 protobuf==3.20.3
    ```

### 目录结构
```text
.
├── mipi_camera_web_yolov5x.py      # 主程序
└── README.md                       # 使用说明
```

### 参数说明
| 参数名           | 说明                              | 默认值                                                    |
| --------------- | --------------------------------- | ------------------------------------------------------ |
| `--model-path`  | BPU 量化模型路径（`.hbm`）          | `/opt/hobot/model/s100/basic/yolov5x_672x672_nv12.hbm` |
| `--priority`    | 推理优先级（0\~255，255为最高）     | `0`                                                    |
| `--bpu-cores`   | BPU 核心索引列表（如 `0 1`）        | `[0]`                                                  |
| `--label-file`  | 类别标签文件路径                    | `../labels/coco_classes.names`                         |
| `--nms-thres`   | 非极大值抑制的 IoU 阈值             | `0.45`                                                 |
| `--score-thres` | 检测置信度阈值                      | `0.25`                                                 |


### 快速运行
- 启动服务
    ```bash
    # 1. 进入webservice目录
    cd webservice/

    # 2. 启动服务
    sudo ./sbin/nginx -p .
    ```
- 运行模型
    - 回到当前目录
        ```bash
        cd ..
        ```
    - 使用默认参数
        ```bash
        python mipi_camera_web_yolov5x.py
        ```
    - 指定参数运行
        ```bash
        python mipi_camera_web_yolov5x.py \
        --model-path /opt/hobot/model/s100/basic/yolov5x_672x672_nv12.hbm \
        --priority 0 \
        --bpu-cores 0 \
        --label-file ../labels/coco_classes.names \
        --nms-thres 0.45 \
        --score-thres 0.25
        ```

- 查看结果

    运行成功后，通过访问web展示端：http://IP

- 退出运行

    在命令行输入Ctrl C

### 注意事项
- 若指定模型路径不存在，可尝试去`/opt/hobot/model/s100/basic/`查找。
