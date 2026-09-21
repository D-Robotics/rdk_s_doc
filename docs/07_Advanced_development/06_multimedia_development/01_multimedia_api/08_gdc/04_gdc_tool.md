---
sidebar_position: 4
title: "GDC Tool"
description: "RDK S100/S600 GDC Tool 仿真工具使用说明"
---

# GDC Tool

## GDC Tool 介绍

GDC Tool 是一种可在 PC 上进行处理效果仿真的工具。用户可准备 jpg 图像，load 到 gdc-tool 中进行离线校正，校正完成后可直接保存 bin 文件用于硬件校正，也可保存 layout.json 文件再生成 bin 进行硬件校正。

### GDC Tool 启动

#### 1. Windows 环境

- **安装环境**：依赖 Node.js，参考下载 [https://nodejs.cn/download/](https://nodejs.cn/download/)。
- **工具获取**：从发布包下载 gdc 工具（gdc-tool-xxxx-windows），路径位于发布包 `software_tools/gdc_tools/`。
- **安装依赖**：Windows 命令行进入 gdc 工具目录（如 gdc-tool-gui-xxxx-windows），执行 `npm install express`。
- **启动应用**：在该目录执行 `node.exe app.js`，用 Chrome 浏览器登录 [http://localhost:3000/](http://localhost:3000/)。

#### 2. Unix 环境

- **安装环境**：mac 下 `brew install node`。
- **安装依赖**：在工具目录下执行 `npm install -production`。
- **启动应用**：执行 `node app.js`，打开网页登录 [http://localhost:3000/](http://localhost:3000/)。

#### 3. 开始仿真

使用 GDC Tool 一般需要以下步骤：

![GDC Tool 仿真流程](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/gdc/gdc_tool/image-20250107-164759.png)

上图的绿色箭头和下面的步骤一一对应。

1. 登录网页成功后，上传准备好的 sensor 采集图像。上传前需将 YUV 图像转换为 jpg 图像。
   可用 ffmpeg 转换：

   ```shell
   ffmpeg -s 1920x1080 -pix_fmt yuv420p -i handle_100197_isp_chn0_1920x1080_stride_1920_frameid_0_ts_2411352368066.yuv  output.jpg
   ```

2. 根据使用场景确认变换模式。设置 Transformation 为对应模式；若使用 custom 模式，需同时准备 GDC 矫正标定参数文件上传。
3. 配置 Input 参数，详见 [变换模式参数说明](#变换模式参数说明)。
4. 配置 Output 参数，详见 [变换模式参数说明](#变换模式参数说明)。
5. 配置 Settings 参数，详见 [变换模式参数说明](#变换模式参数说明)。
6. 参数配置成功后点击 Preview 预览，确认是否符合预期。
7. 仿真效果符合预期后，导出 layout.json 文件。
8. 仿真效果符合预期后，也可导出 bin 文件直接使用。

导出文件的使用方法见 sample_gdc 使用说明：

:::doc_scope{products="RDK S100"}
- [sample_gdc 使用说明](../../02_multimedia_sample/05_sample_gdc.md)
:::

:::doc_scope{products="RDK S600"}
- [sample_gdc 使用说明](../../02_multimedia_sample_s600/05_sample_gdc.md)
:::

:::caution 注意
步骤 7 和步骤 8 中导出的 bin 文件和 json 文件二选一即可。
:::

## GDC Tool 中的变换模式

GDC Tool 提供六种变换模式：Affine、Equisolid、Equisolid(cylinder)、Equidistant、Custom、Keystone+dewarping，与软件中的变换模式对应关系见 [GDC Bin 生成 API](./03_gdc_bin_api.md#transformation_t) 中的 transformation_t 描述。

| 变换模式 | 用途 |
|---|---|
| Affine | 线性变换，简单图像旋转，无畸变校正 |
| Equisolid | 全景变换，变换网格最大 |
| Equisolid (cylinder) | 圆柱形变换 |
| Equidistant | 等距变换，变换后距离等距 |
| Keystone + dewarping | 相对 Equidistant 多两个参数 trapezoid_left_angle 和 trapezoid_right_angle，默认 90° 时效果与 Equidistant 一致 |
| Custom | 用户定制变换 |

所有转换类型都有以下三个常用参数 Pan、Tilt、Zoom（以等距变换、输入/输出 1280×720 为例）。下图中蓝色矩形表示仅将特殊参数设置为该值，其他参数保持默认。

### Pan

水平方向（-1280, +1280）通过给定像素数偏移变换网格：

![Pan](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/gdc/gdc_tool/3-1.png)

### Tilt

垂直方向（-720, +720）通过给定像素数偏移变换网格：

![Tilt](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/gdc/gdc_tool/3-2.png)

### Zoom

按给定因子（0, +∞）缩放变换输出：

![Zoom](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/gdc/gdc_tool/3-3.png)

## Affine

### 【功能描述】

提供线性变换。

![Affine](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/gdc/gdc_tool/3-4.png)

### 【成员说明】

| 成员 | 含义 |
|---|---|
| int32_t pan | default 0，不修改 |
| int32_t tilt | default 0，不修改 |
| zoom | 按给定因子缩放变换输出 |
| double angle (rotation) | 0/90/180/270 |

:::caution 注意
- 输入输出尺寸的宽应保持 16 像素对齐。
- zoom 参数在旋转角度为180或270时，需>=1.03
:::

## Equisolid

### 【功能描述】

此转换提供等实体（全景 panoramic）校正，并将结果显示为平面上的投影。

![Equisolid](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/gdc/gdc_tool/3-5.png)

### 【成员说明】

| 成员 | 含义 |
|---|---|
| int32_t pan | default 0，不修改 |
| int32_t tilt | default 0，不修改 |
| zoom | 按给定因子缩放变换输出 |
| double strength | 沿 X 轴的变换强度（非负） |
| double strengthY | 沿 Y 轴的变换强度（非负） |
| double angle (rotation) | 0/90/180/270 |

:::caution 注意
输入输出尺寸的宽应保持 16 像素对齐。
:::

strength x 调试效果（X 轴变换强度，取值 0~+∞）：

![strength x](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/gdc/gdc_tool/3-6.png)

strength y 调试效果（Y 轴变换强度，取值 0~+∞）：

![strength y](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/gdc/gdc_tool/3-7.png)

Rotation 调试效果（取值 -180~180）：

![Rotation](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/gdc/gdc_tool/3-8.png)

## Equisolid(cylinder)

### 【功能描述】

此变换为将结果图像投影到柱面全景图的完整鱼眼帧提供等实体校正。

![Equisolid cylinder](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/gdc/gdc_tool/3-9.png)

### 【成员说明】

| 成员 | 含义 |
|---|---|
| int32_t pan | default 0，不修改 |
| int32_t tilt | default 0，不修改 |
| zoom | 按给定因子缩放变换输出 |
| strength | 变换强度 |
| double angle (rotation) | 0/90/180/270 |

:::caution 注意
输入输出尺寸的宽应保持 16 像素对齐。
:::

strength 调试效果（变换强度，0~+∞）：

![strength](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/gdc/gdc_tool/3-10.png)

rotation 调试效果（-180~+180）：

![rotation](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/gdc/gdc_tool/3-11.png)

## Equidistant

### 【功能描述】

等距变换包含许多参数，允许为投影提供一系列不同的目标平面，使用户可以更自由地选择要变换的鱼眼帧所需区域。

![Equidistant](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/gdc/gdc_tool/3-12.png)

### 【成员说明】

| 成员 | 含义 |
|---|---|
| int32_t pan | 水平方向给定像素数偏移变换网格 |
| int32_t tilt | 垂直方向给定像素数偏移变换网格 |
| zoom | 按给定因子缩放变换输出 |
| double angle (rotation) | 图像旋转角度 |
| double elevation | 投影轴仰角，范围 0~90 |
| double azimuth | 投影轴方位角；elevation 为 0 时方位角无可见效果 |
| int32_t keep_ratio | 打开时 FOV 高度参数被忽略，自动计算以保持水平/垂直相同拉伸强度 |
| double FOV_h | 水平方向输出视场大小（度），有效值 0~180 |
| double FOV_w | 垂直方向输出视场大小（度），有效值 0~180 |
| double cylindricity_y | 目标投影沿 Y 轴球面度，0~1，1 为球形；为 1 且 cylindricity_x 为 0 时投影沿 Y 轴形成圆柱体 |
| double cylindricity_x | 目标投影沿 X 轴球面度，0~1，1 为球形；为 1 且 cylindricity_y 为 0 时投影沿 X 轴形成圆柱体 |

:::caution 注意
- 输入输出尺寸的宽应保持 16 像素对齐。
- 正常视力约 90°。圆柱度为 0 的变换，视场宽高为 180 会导致图像无限拉伸。
- cylindricity_x 和 cylindricity_y 都为 1 时投影为球形；都为 0 时变换为矩形。
:::

elevation 调试效果：

![elevation](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/gdc/gdc_tool/3-13.png)

azimuth 调试效果：

![azimuth](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/gdc/gdc_tool/3-14.png)

rotation 调试效果：

![rotation](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/gdc/gdc_tool/3-15.png)

cylindricity x 调试效果（目标投影沿 X 轴球面度，0~1，1 为球形；为 1 且 cylindricity_y 为 0 时投影沿 X 轴形成圆柱）：

![cylindricity x](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/gdc/gdc_tool/3-16.png)

cylindricity y 调试效果（目标投影沿 Y 轴球面度，0~1，1 为球形；为 1 且 cylindricity_x 为 0 时投影沿 Y 轴形成圆柱体）：

![cylindricity y](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/gdc/gdc_tool/3-17.png)

## Custom

### 【功能描述】

采用 custom 变换后，输入图像中的每个多边形都会变换为正方形。任何形状的四个邻近输入点在转换后都是正方形，但多边形的形状和位置在变换后会发生变化。

![Custom](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/gdc/gdc_tool/3-18.png)

custom 变换用于创建任何内置转换都无法描述的转换。为纠正任意失真，必须向 GDC 工具提供一个特殊的校准文件 config0.txt。如下图

![Custom 校准文件](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/gdc/gdc_tool/3-19.png)

### 【成员说明】

| 成员 | 含义 |
|---|---|
| int32_t pan | 水平方向给定像素数偏移变换网格，default 0 |
| int32_t tilt | 垂直方向给定像素数偏移变换网格，default 0 |
| zoom | 按给定因子缩放变换输出 |
| char custom_file[128] | 采样点文件名称 |
| custom_tranformation_t custom | 解析的自定义转换结构 |

**采样点文件解释**

采样点文件规则：

1. 第一行是像素计算中是否使能 full tile，1 为 enable，0 为 disable。
2. 第二行是使能 full tile 时要跳过的像素数量；需大于 0，数字越小 libgdc 的性能越慢（性能越慢是指 config.bin 的大小更大， libgdc 生成 config.bin 的时间更长）。
3. 第三行是垂直和水平方向采样点个数，第一个值 Y 为垂直方向采样点数，第二个值 X 为水平方向采样点数。
4. 第四行是选中区域的中心点，通常为 (Y-1)/2、(X-1)/2。
5. 标定点必须是大于等于0的 int 或 float 类型、相邻两行的标定点不能重复。 eg.下图是截取的其中的一部分数据图片，第五行到第九行就是标定点在源图的坐标值，格式是 Y: X。以下图为例，一共有1081x1921个标定点。

下图是截取的部分数据，第五行起为采样点在源图的坐标值，格式为 Y:X。一共有 Y×X 个采样点：

![采样点数据](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/gdc/gdc_tool/3-20.png)

6. 采样点必须是等距离的，这意味着输出图片的分辨率取决于采样点的点数。

![采样点分辨率](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/gdc/gdc_tool/3-21.png)

例如输出图片 Width = 100，Height 计算为 340，计算过程：100/height = (96-1)/(324-1)。

下图是更简单的 3×3 坐标点转换示例：

![3x3 坐标点](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/gdc/gdc_tool/3-22.png)

**降采样**

`skip_point` 函数用于判断当前点是否可跳过，达到降采样目的。注意宽高为实际宽高加 1（width + 1, height + 1）：

```c
uint32_t skip_point(uint32_t width, uint32_t height, uint32_t x, uint32_t y)
{
    const uint32_t sample_points = 32;
    uint32_t step_x = floor((ceil(((float)width) / (sample_points - 4)) + 1) / 2.) * 2;
    uint32_t step_y = floor((ceil(((float)height) / (sample_points - 4)) + 1) / 2.) * 2;
    uint32_t grid_fit_x = ((x % step_x == step_x / 2) || (x - 1) % step_x == step_x / 2 ||
             (x % step_x == 0) || (x - 1) % step_x == 0 || x == 0 || x == 1);
    uint32_t grid_fit_y = ((y % step_y == step_y / 2) || (y - 1) % step_y == step_y / 2 ||
             (y % step_y == 0) || (y - 1) % step_y == 0 || y == 0 || y == 1);

    return !((grid_fit_x && grid_fit_y) || (x >= width - 2) || (y >= height - 2));
}
```

使用举例，对宽 608、高 600 采样点做降采样：

```c
int row_start = 0, row_end = 601;
int col_start = 0, col_end = 609;
int necessary_point = 1;

for (int i = row_start; i < row_end; i++) {
    for (int j = col_start; j < col_end; j++) {
        int x = j - col_start;
        int y = i - row_start;

        necessary_point = skip_point(col_end - col_start, row_end - row_start, x, y);
        if (necessary_point) {
            /* idx_x, idx_y 为采样点坐标，必要点写到采样点文件 */
        } else {
            /* 非必要点写 0，相当于跳过该点 */
        }
    }
}
```

## Keystone+dewarping

### 【功能描述】

![Keystone+dewarping](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/gdc/gdc_tool/3-23.png)

### 【成员说明】

| 成员 | 含义 |
|---|---|
| int32_t pan | 水平方向给定像素数偏移变换网格 |
| int32_t tilt | 垂直方向给定像素数偏移变换网格 |
| zoom | 按给定因子缩放变换输出 |
| double angle (rotation) | 图像旋转角度 |
| double elevation | 投影轴仰角，范围 0~90 |
| double azimuth | 投影轴方位角；elevation 为 0 时无可见效果 |
| int32_t keep_ratio | 打开时 FOV 高度参数被忽略，自动计算以保持水平/垂直相同拉伸强度 |
| double FOV_h | 水平方向输出视场大小（度），有效值 0~180 |
| double FOV_w | 垂直方向输出视场大小（度），有效值 0~180 |
| double cylindricity_y | 目标投影沿 Y 轴球面度（0~1），1 为球形；为 1 且 cylindricity_x 为 0 时投影沿 Y 轴形成圆柱体 |
| double cylindricity_x | 目标投影沿 X 轴球面度（0~1），1 为球形；为 1 且 cylindricity_y 为 0 时投影沿 X 轴形成圆柱体 |
| double trapezoid_left_angle | 默认 90，范围 0.1~90；变换网格中左边边界相对底边边界的角度 |
| double trapezoid_right_angle | 默认 90，范围 0.1~90；变换网格中右边边界相对底边边界的角度 |

## 变换模式参数说明 {#变换模式参数说明}

配置文件由 GDC Tool 生成，以 layout.json 存在。不同变换模式有不同参数，以 keystone+dewarping 模式和 custom 模式为例说明配置参数。

### keystone+dewarping 模式

```bash
{
  "inputRes": [
    1920,  /* 输入图像尺寸的宽 */
    1080   /* 输入图像尺寸的高 */
  ],
  "param": {
    "fov": 180,      /* 输入图像的视场角 */
    "diameter": 1080, /* 输入图像的直径，可控制变换网格整体大小 */
    "offsetX": 0,    /* 变换网格水平方向偏移 */
    "offsetY": 0     /* 变换网格垂直方向偏移 */
  },
  "outputRes": [
    1920, /* 输出图像尺寸的宽 */
    1080  /* 输出图像尺寸的高 */
  ],
  "transformations": [
    {
      "transformation": "Dewarp_keystone", /* 变换模式 */
      "position": [ /* 输出图像 ROI 区域 */
        0,    /* 输出 ROI 水平方向偏移 */
        0,    /* 输出 ROI 垂直方向偏移 */
        1920, /* 输出 ROI 的宽 */
        1080  /* 输出 ROI 的高 */
      ],
      "param": {
        "left_base_angle": 90,   /* 默认 90，0.1~90，左边边界相对底边边界的角度 */
        "right_base_angle": 90,  /* 默认 90，0.1~90，右边边界相对底边边界的角度 */
        "azimuth": 90,           /* 投影轴方位角；elevation 为 0 时无可见效果 */
        "elevation": 0,          /* 投影轴仰角，0~90 */
        "rotation": 0,           /* 输出图像旋转角度 */
        "fovWidth": 90,          /* 水平方向输出视场大小（度），0~180 */
        "fovHeight": 90,         /* 垂直方向输出视场大小（度），0~180 */
        "keepRatio": 0,          /* 1 时 fovHeight 被忽略，自动计算保持水平/垂直相同拉伸 */
        "cylindricityX": 1,      /* 目标投影沿 X 轴球面度，0~1，1 为球形 */
        "cylindricityY": 1       /* 目标投影沿 Y 轴球面度，0~1，1 为球形 */
      },
      "ptz": [
        0, /* pan */
        0, /* tilt */
        1  /* zoom */
      ],
      "roi": { /* 输入图像 ROI 区域 */
        "x": 0,
        "y": 0,
        "w": 1920,
        "h": 1080
      }
    }
  ],
  "mode": "semiplanar420",  /* 处理格式 */
  "eccMode": "eccDisabled", /* ecc 模式 */
  "colourspace": "yuv"      /* 数据格式 */
}
```

### custom 模式

```bash
{
  "inputRes": [
    1280, /* 输入宽 */
    720   /* 输入高 */
  ],
  "param": {
    "fov": 192,    /* 视场角 */
    "diameter": 720, /* 直径 */
    "offsetX": 0,
    "offsetY": 0
  },
  "outputRes": [
    560, /* 输出宽 */
    258  /* 输出高 */
  ],
  "transformations": [
    {
      "transformation": "Custom", /* 变换模式 */
      "position": [ /* 输出 ROI */
        0,
        0,
        560,
        258
      ],
      "ptz": [
        0, /* pan */
        0, /* tilt */
        1  /* zoom */
      ],
      "roi": { /* custom 模式下无效 */
        "x": 0,
        "y": 0,
        "w": 0,
        "h": 0
      },
      "param": {
        "customTransformation": "/path_to/camera_0_gdc.txt" /* 坐标点文件路径 */
      }
    }
  ],
  "mode": "semiplanar420",
  "eccMode": "eccDisabled",
  "colourspace": "yuv"
}
```

:::caution 注意
1. ecc mode 统一填写 ecc disabled；可选使能 ecc mode 但无实际效果。
2. 参数为小数时，浮点运算精度需 8 位小数及以上，否则生成的 bin 可能不一致。
3. 填充数据结构或 json 时应包含各模式示例的所有项。
4. 非 custom 模式，配置文件中的 roi 参数代表输入图片的 roi。
5. 配置文件中的 position 参数代表输出图片的 roi。
:::

### Affine

配置文件：

```bash
{
   "inputRes": [1920, 1080],
   "param": { "fov": 160, "diameter": 1080, "offsetX": 0, "offsetY": 0 },
   "outputRes": [1920, 1080],
   "transformations": [
       {
           "transformation": "Affine",
           "position": [0, 0, 1920, 1080],
           "param": { "rotation": 0 },
           "ptz": [0, 0, 1],
           "roi": { "x": 0, "y": 0, "w": 1920, "h": 1080 }
       }
   ],
   "mode": "semiplanar420",
   "eccMode": "eccDisabled",
   "colourspace": "yuv"
}
```

输入图片加变换网格：

![Affine 输入+网格](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/gdc/gdc_tool/3-24.png)

输出图片：

![Affine 输出](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/gdc/gdc_tool/3-25.png)

### Equisolid

配置文件：

```bash
{
   "inputRes": [1920, 1080],
   "param": { "fov": 160, "diameter": 1080, "offsetX": 0, "offsetY": 0 },
   "outputRes": [1920, 1080],
   "transformations": [
       {
           "transformation": "Panoramic",
           "position": [0, 0, 1920, 1080],
           "param": { "strength": 1, "strengthY": 1, "rotation": 0 },
           "ptz": [0, 0, 1],
           "roi": { "x": 0, "y": 0, "w": 1920, "h": 1080 }
       }
   ],
   "mode": "semiplanar420",
   "eccMode": "eccDisabled",
   "colourspace": "yuv"
}
```

输入图片加变换网格：

![Equisolid 输入+网格](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/gdc/gdc_tool/3-26.png)

输出图片：

![Equisolid 输出](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/gdc/gdc_tool/3-27.png)

### Equisolid(cylinder)

配置文件：

```bash
{
   "inputRes": [1920, 1080],
   "param": { "fov": 160, "diameter": 1080, "offsetX": 0, "offsetY": 0 },
   "outputRes": [1920, 1080],
   "transformations": [
       {
           "transformation": "Stereographic",
           "position": [0, 0, 1920, 1080],
           "param": { "strength": 1, "rotation": 0 },
           "ptz": [0, 0, 1],
           "roi": { "x": 0, "y": 0, "w": 1920, "h": 1080 }
       }
   ],
   "mode": "semiplanar420",
   "eccMode": "eccDisabled",
   "colourspace": "yuv"
}
```

输入图片加变换网格：

![Equisolid cylinder 输入+网格](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/gdc/gdc_tool/3-28.png)

输出图片：

![Equisolid cylinder 输出](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/gdc/gdc_tool/3-29.png)

### Equidistant

配置文件：

```bash
{
   "inputRes": [1920, 1080],
   "param": { "fov": 160, "diameter": 1080, "offsetX": 0, "offsetY": 0 },
   "outputRes": [1920, 1080],
   "transformations": [
       {
           "transformation": "Universal",
           "position": [0, 0, 1920, 1080],
           "param": {
               "azimuth": 0, "elevation": 0, "rotation": 0,
               "fovWidth": 90, "fovHeight": 90, "keepRatio": 0,
               "cylindricityX": 1, "cylindricityY": 1
           },
           "ptz": [0, 0, 1],
           "roi": { "x": 0, "y": 0, "w": 1920, "h": 1080 }
       }
   ],
   "mode": "semiplanar420",
   "eccMode": "eccDisabled",
   "colourspace": "yuv"
}
```

输入图片加变换网格：

![Equidistant 输入+网格](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/gdc/gdc_tool/3-30.png)

输出图片：

![Equidistant 输出](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/gdc/gdc_tool/3-31.png)

### Custom

输入 1280×720，输出 560×258。配置文件：

```bash
{
   "inputRes": [1280, 720],
   "param": { "fov": 192, "diameter": 720, "offsetX": 0, "offsetY": 0 },
   "outputRes": [560, 258],
   "transformations": [
       {
           "transformation": "Custom",
           "position": [0, 0, 560, 258],
           "ptz": [0, 0, 1],
           "roi": { "x": 0, "y": 0, "w": 1280, "h": 720 },
           "param": { "customTransformation": "/path_to/camera_0_gdc_config_3.1.txt" }
       }
   ],
   "mode": "semiplanar420",
   "eccMode": "eccDisabled",
   "colourspace": "yuv"
}
```

输入图片加变换网格：

![Custom 输入+网格](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/gdc/gdc_tool/3-32.png)

输出图片：

![Custom 输出](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/gdc/gdc_tool/3-33.png)

### Keystone+dewarping

配置文件：

```bash
{
   "inputRes": [1920, 1080],
   "param": { "fov": 180, "diameter": 1080, "offsetX": 0, "offsetY": 0 },
   "outputRes": [1920, 1080],
   "transformations": [
       {
           "transformation": "Dewarp_keystone",
           "position": [0, 0, 1920, 1080],
           "param": {
               "left_base_angle": 90, "right_base_angle": 90,
               "azimuth": 0, "elevation": 0, "rotation": 0,
               "fovWidth": 90, "fovHeight": 90, "keepRatio": 0,
               "cylindricityX": 1, "cylindricityY": 1
           },
           "ptz": [0, 0, 1],
           "roi": { "x": 0, "y": 0, "w": 1920, "h": 1080 }
       }
   ],
   "mode": "semiplanar420",
   "eccMode": "eccDisabled",
   "colourspace": "yuv"
}
```

输入图片加变换网格：

![Keystone 输入+网格](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/gdc/gdc_tool/3-34.png)

输出图片：

![Keystone 输出](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/gdc/gdc_tool/3-35.png)

## 相关文档

- [GDC 概述](./01_gdc_overview.md)
- [GDC Bin 生成 API](./03_gdc_bin_api.md)
- [GDC API](./02_gdc_api.md)

:::doc_scope{products="RDK S100"}
- [sample_gdc 使用说明](../../02_multimedia_sample/05_sample_gdc.md)
:::

:::doc_scope{products="RDK S600"}
- [sample_gdc 使用说明](../../02_multimedia_sample_s600/05_sample_gdc.md)
:::
