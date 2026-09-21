---
sidebar_position: 3
title: "GDC Bin 生成 API"
description: "RDK S100/S600 GDC bin 文件生成接口与数据结构"
---

# GDC Bin 生成 API

## 模块描述

- GDC bin 生成 API 用于生成 GDC bin 文件。
- 通过 `hbn_gen_gdc_cfg`（window 式）或 `gdc_cfg_bin_gen`（json 式）生成 GDC bin，通过 `hbn_free_gdc_cfg` 释放 bin 的 buffer。
- 通常与 GDC Tool 结合使用：GDC Tool 各变换模式生成的 layout.json 都可经本接口生成 GDC bin。GDC Tool 使用见 [GDC Tool](./04_gdc_tool.md)。

### 操作流程

1. 用 GDC Tool 生成 layout.json 后，通过 `gdc_cfg_bin_gen` 生成 GDC bin 文件，参考示例 `sample_gdc/2-generate_bin`。
2. 将生成的 GDC bin 读入 hbmem 分配的内存，通过 `hbn_vnode_set_attr` 设入 GDC 节点。
3. 启动 GDC 节点处理图像，处理后保存结果到文件。
4. 处理完成后通过 `hbn_free_gdc_cfg` 释放存放 GDC bin 的 buffer。

使用 custom 变换的方式需要提前准备目标图像并生成标定参数，可参考示例 `sample_gdc/1-custom_config` 提前生成标定参数，再继续上述流程。

## 参考示例

GDC 部分示例代码可参考：

:::doc_scope{products="RDK S100"}
- [sample_gdc 使用说明](../../02_multimedia_sample/05_sample_gdc.md)
:::

:::doc_scope{products="RDK S600"}
- [sample_gdc 使用说明](../../02_multimedia_sample_s600/05_sample_gdc.md)
:::

## API 参考

以下 API 用于 GDC bin 生成，GDC 模块控制 API 见 [GDC API](./02_gdc_api.md)。

| API 接口 | 接口功能 |
|---|---|
| [hbn_gen_gdc_cfg](#hbn_gen_gdc_cfg) | 由 param/window 参数生成 GDC bin 到内存 buf |
| [gdc_cfg_bin_gen](#gdc_cfg_bin_gen) | 读取 layout.json 生成 GDC bin，可落盘或存内存 buf |
| [gdc_parse_json](#gdc_parse_json) | 解析 layout.json 文本为 param_t/window_t 结构（底层原语） |
| [hbn_free_gdc_cfg](#hbn_free_gdc_cfg) | 释放上述接口分配的 bin buf |

### hbn_gen_gdc_cfg {#hbn_gen_gdc_cfg}

#### 【函数声明】

```c
int32_t hbn_gen_gdc_cfg(const param_t *gdc_param, const window_t *windows,
                         uint32_t wnd_num, void **cfg_buf, uint64_t *cfg_size);
```

#### 【功能描述】

以 window 方式生成 GDC bin，存入 `cfg_buf`，大小存入 `cfg_size`。内部分配，调用方用 `hbn_free_gdc_cfg` 释放。

#### 【参数描述】

- [IN] `param_t *gdc_param`：GDC 公共参数（分辨率、格式等），见 [param_t](#param_t)。
- [IN] `window_t *windows`：window 参数数组，见 [window_t](#window_t)。
- [IN] `uint32_t wnd_num`：window 数目。
- [OUT] `void **cfg_buf`：生成的 GDC bin，内部分配。
- [OUT] `uint64_t *cfg_size`：GDC bin 大小（字节）。

#### 【返回值】

- 成功：0。
- 失败：负值错误码，参考 [GDC API 返回值说明](./02_gdc_api.md#返回值说明)。

### gdc_cfg_bin_gen {#gdc_cfg_bin_gen}

#### 【函数声明】

```c
int gdc_cfg_bin_gen(const char *layout_file, char *config_file,
                    void **cfg_buf, uint64_t *config_size);
```

#### 【功能描述】

读取 layout.json，生成 GDC bin。`config_file` 非空时同时落盘为 bin 文件。buf 由内部分配，用 `hbn_free_gdc_cfg` 释放。板端示例见 `sample_gdc/2-generate_bin`。

#### 【参数描述】

- [IN] `const char *layout_file`：json 配置文件路径。
- [IN] `char *config_file`：生成的 gdc.bin 落盘路径，可为 NULL（只存内存）。
- [OUT] `void **cfg_buf`：生成的 GDC bin，内部分配。
- [OUT] `uint64_t *config_size`：GDC bin 大小（字节）。

#### 【返回值】

- 成功：0。
- 失败：负值错误码。

### gdc_parse_json {#gdc_parse_json}

#### 【函数声明】

```c
int32_t gdc_parse_json(const char *buf, param_t *param,
                       window_t **wnds, uint32_t *wnd_cnt);
void gdc_parse_json_clean(window_t **wnds, uint32_t wnd_num);
```

#### 【功能描述】

把 json 文本解析为 `param_t` 与 `window_t` 数组，是 `gdc_cfg_bin_gen` 的底层原语。解析后可用 `hbn_gen_gdc_cfg` 直接生成 bin。`wnds` 用完调 `gdc_parse_json_clean` 释放。

#### 【参数描述】

- [IN] `const char *buf`：json 文本内容。
- [OUT] `param_t *param`：公共参数结构。
- [OUT] `window_t **wnds`：window 数组，内部分配。
- [OUT] `uint32_t *wnd_cnt`：window 数目。

#### 【返回值】

- 成功：0。
- 失败：负值错误码。

### hbn_free_gdc_cfg {#hbn_free_gdc_cfg}

#### 【函数声明】

```c
int32_t hbn_free_gdc_cfg(uint32_t *cfg_buf);
```

#### 【功能描述】

释放 `hbn_gen_gdc_cfg` 或 `gdc_cfg_bin_gen` 分配的 bin buf。

#### 【参数描述】

- [IN] `uint32_t *cfg_buf`：待释放的 bin buffer 地址。

#### 【返回值】

- 成功：0。
- 失败：负值错误码。

## 数据结构

### param_t {#param_t}

| 名称 | 类型 | 含义 |
|---|---|---|
| format | frame_format_t | 处理图像格式，GDC 实际使用 `FMT_SEMIPLANAR_420`（NV12） |
| in | resolution_t | 实际输入图像尺寸 |
| out | resolution_t | 实际输出图像尺寸 |
| x_offset | int32_t | 输入区域沿 x 轴的偏移像素数，默认 0 |
| y_offset | int32_t | 输入区域沿 y 轴的偏移像素数，默认 0 |
| diameter | int32_t | 输入圆形区域（鱼眼画面）像素直径，一般与 input.height 一致 |
| fov | double | 视场角度，影响源网格曲率，视场越大透视变形越大 |

### window_t {#window_t}

| 名称 | 类型 | 默认值 | 含义 |
|---|---|---|---|
| out_r | rect_t | - | 输出区域信息 |
| transform | transformation_t | 0 | 使用的变换模式 |
| input_roi_r | rect_t | - | 输入 roi 区域 |
| pan | int32_t | - | 以输出图为中心的水平方向目标位移（像素） |
| tilt | int32_t | - | 以输出图为中心的垂直方向目标位移（像素） |
| zoom | double | - | 目标缩放系数 |
| strength | double | 1.0 | x 方向变换强度 |
| strengthY | double | 1.0 | y 方向变换强度 |
| angle | double | 0 | 主投影轴绕自身旋转的角度 |
| elevation | double | 0 | 主投影轴的俯仰角 |
| azimuth | double | 0 | 主投影轴的方位角（从北方向顺时针） |
| keep_ratio | int32_t | 1 | 水平/垂直方向保持相同拉伸强度 |
| FOV_h | double | 90 | 输出视场垂直尺寸（度） |
| FOV_w | double | 90 | 输出视场水平尺寸（度） |
| cylindricity_y | double | 0 | 垂直方向投影形状的圆柱度 |
| cylindricity_x | double | 0 | 水平方向投影形状的圆柱度 |
| custom_file[128] | char | - | custom 模式下的自定义转换描述文件 |
| custom | custom_tranformation_t | - | 自定义模式下的转换信息 |
| trapezoid_left_angle | double | 0 | 梯形底与斜边之间的左锐角 |
| trapezoid_right_angle | double | 0 | 梯形底与斜边之间的右锐角 |
| check_compute | uint8_t | - | 保留 |

### transformation_t {#transformation_t}

| 名称 | 含义 |
|---|---|
| PANORAMIC | 全景变换 |
| CYLINDRICAL | 圆柱变换 |
| STEREOGRAPHIC | 立体投影，输出为圆柱全景图 |
| UNIVERSAL | 等距变换（Equidistant） |
| CUSTOM | 用户定制变换，可定制网格 |
| AFFINE | 线性变换（含 180° 旋转） |
| DEWARP_KEYSTONE | 梯形校正+去畸变 |

### frame_format_t {#frame_format_t}

| 名称 | 含义 |
|---|---|
| FMT_UNKNOWN | 未知格式 |
| FMT_LUMINANCE | 暂不支持 |
| FMT_PLANAR_444 | 暂不支持 |
| FMT_PLANAR_420 | 暂不支持 |
| FMT_SEMIPLANAR_420 | NV12 |
| FMT_GDC_MAX | - |

### rect_t / resolution_t / point_t

| 结构体 | 字段 | 类型 | 含义 |
|---|---|---|---|
| rect_t | x / y | int32_t | 起始点坐标，必须为偶数 |
| rect_t | w / h | int32_t | 宽 / 高，必须为偶数 |
| resolution_t | w / h | uint32_t | 宽 / 高（像素） |
| point_t | x / y | double | x / y 坐标 |

### custom_tranformation_t

| 名称 | 类型 | 含义 |
|---|---|---|
| full_tile_calc | uint8_t | 是否开启分块计算；使能后 libgdcbin 额外分块做 min/max 计算，tile 越多精度越高、生成越慢 |
| tile_incr_x | uint16_t | x 方向 tile 步进 |
| tile_incr_y | uint16_t | y 方向 tile 步进 |
| w | int32_t | 自定义网格水平方向点数 |
| h | int32_t | 自定义网格垂直方向点数 |
| centerx | double | x 轴中心，通常为水平点数的一半 |
| centery | double | y 轴中心，通常为垂直点数的一半 |
| *points | point_t | 转换序列，数量 = w×h |

## 相关文档

- [GDC 概述](./01_gdc_overview.md)
- [GDC Tool](./04_gdc_tool.md)
- [GDC API](./02_gdc_api.md)

:::doc_scope{products="RDK S100"}
- [sample_gdc 使用说明](../../02_multimedia_sample/05_sample_gdc.md)
:::

:::doc_scope{products="RDK S600"}
- [sample_gdc 使用说明](../../02_multimedia_sample_s600/05_sample_gdc.md)
:::
