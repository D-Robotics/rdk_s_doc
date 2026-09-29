---
sidebar_position: 1
title: "V4L2 GMSL SERDES camera 驱动编写说明"
description: "V4L2 GMSL sensor serdes 接口、dtbo、gain LUT、曝光同步与深度相机"
---

# V4L2 GMSL SERDES camera 点亮

## V4L2 GMSL SerDes 接口调用说明

Camsys 支持接入美信加串器的 sensor，camera 子板默认搭载美信解串器 MAX96712。GMSL sensor 同样作为一个 v4l2 subdev 接入 v4l2 框架，这里加串器及解串器驱动为 gmsl sensor 驱动提供操作函数集，不实现为 v4l2 subdev。

![GMSL SerDes 接口框架](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camera_bringup/camera_bringup_11.png)

serdes 相关的数据结构及回调函数定义在 `kernel/include/media/i2c/serdes_core.h`，需要包含该头文件 `#include <media/i2c/serdes_core.h>`。本节以 AR0820C GMSL sensor 为例，介绍 camsys gmsl sensor 开发。

### sensor 结构体新增成员

```c
struct ar0820 {
    // ...
    struct serdes_device *ser_dev;
    struct serdes_device *dser_dev;
    struct serdes_ctx g_ctx;
    // ..
};
```

sensor 驱动需要包含 `ser_dev` 与 `dser_dev` 两个结构体用来操作加串和解串；需要包含 `serdes_ctx g_ctx` 成员用来保存 serdes 相关属性，其中主要使用的结构体成员说明如下：

```c
struct serdes_ctx {
    u32 serdes_csi_link;    // 在 sensor 驱动中保存解串器的 port 值
    u32 ser_reg;            // 加串器 i2c 地址映射目标值
    u32 sdev_reg;           // sensor 实际 i2c 地址
    u32 sdev_def;           // sensor i2c 地址映射目标值
    struct device *sen_dev;
    u32 lane_num;           // sensor 与加串器连接的 mipi data lane 数
    u32 data_type;          // sensor 输出的数据类型
    u32 dst_vc;             // sensor 输出的 virtual channel
};
```

### serdes 回调函数

加串器与解串器都提供了下面的回调函数，供 sensor driver 中调用，调用需要使用 `SERDES_OP` 宏：

```c
/* 默认返回值大于等于 0 代表操作成功，返回值小于 0 则代表操作失败 */
struct serdes_ops {
    /* 加串器和解串器做初始化用，只下一些基础配置 */
    int (*init)(struct serdes_device *serdes_dev);
    /* 目前是给 d457 -> max9295a 做额外初始化用 */
    int (*init_ex)(struct serdes_device *serdes_dev);
    /* 预留 */
    int (*reset)(struct serdes_device *dev);
    /* 将解析的 dts 值通过 serdes_ctx 传递给加串器和解串器 */
    int (*set_ctx)(struct serdes_device *serdes_dev, struct serdes_ctx *ctx);
    /* 用于解串器建立 link 使用 */
    int (*setup_link)(struct serdes_device *serdes_dev, struct device *sen_dev);
    /* 地址重映射期间保证稳定性，配套使用 */
    int (*remote_contrl_get)(struct serdes_device *serdes_dev, struct device *sen_dev);
    int (*remote_contrl_put)(struct serdes_device *serdes_dev);
    /* 加串器调用，重新映射加串器和 sensor 的 i2c 地址 */
    int (*map_addr)(struct serdes_device *serdes_dev);
    /* 加串器拉高/拉低某个 mfp */
    int (*enable_mfp)(struct serdes_device *serdes_dev, uint8_t gpio_index);
    int (*clear_mfp)(struct serdes_device *serdes_dev, uint8_t gpio_index);
    /* 解串器打开 mipi tx，开始出流 */
    int (*set_stream)(struct serdes_device *serdes_dev, struct device *sen_dev, int enable);
    /* 解串器和加串器配置 gmsl video pipe 属性 */
    int (*set_pipe)(struct serdes_device *serdes_dev, struct device *sen_dev);
    /* 针对复杂场景，灵活配置 pipe */
    int (*set_pipe_ex)(struct serdes_device *serdes_dev, struct device *sen_dev,
                       uint8_t pipe, uint8_t vc_id, uint8_t data_type);
    /* 通过 vc 值查看解串器是否还有空余 pipe */
    int (*get_pipe_id)(struct serdes_device *serdes_dev, uint8_t vc_id);
    /* 释放对应的 video pipe */
    int (*release_pipe_id)(struct serdes_device *serdes_dev, uint8_t pipe_id);
};
```

**在 sensor probe 中调用 serdes ops 做初始化：**

```c
// 分别调用 set_ctx 与加解串器建立软件上的链接关系
ret = SERDES_OP(priv->ser_dev, set_ctx, priv->ser_dev, &priv->g_ctx);
ret = SERDES_OP(priv->dser_dev, set_ctx, priv->dser_dev, &priv->g_ctx);

// 调用 ops 做 link、addr、pipe、mfp 等初始化
ret = SERDES_OP(priv->dser_dev, init, priv->dser_dev);
ret = SERDES_OP(priv->dser_dev, setup_link, priv->dser_dev, sen_dev);
ret = SERDES_OP(priv->dser_dev, remote_contrl_get, priv->dser_dev, sen_dev);
ret = SERDES_OP(priv->ser_dev, map_addr, priv->ser_dev);
ret = SERDES_OP(priv->dser_dev, remote_contrl_put, priv->dser_dev);
ret = SERDES_OP(priv->ser_dev, init, priv->ser_dev);
ret = SERDES_OP(priv->ser_dev, set_pipe, priv->ser_dev, sen_dev);
ret = SERDES_OP(priv->dser_dev, set_pipe, priv->dser_dev, sen_dev);
ret = SERDES_OP(priv->ser_dev, clear_mfp, priv->ser_dev, priv->mfp_reset);
ret = SERDES_OP(priv->ser_dev, enable_mfp, priv->ser_dev, priv->mfp_reset);
```

**在 s_stream 中配置解串器开流、加串器 mfp 使能等：**

```c
SERDES_OP(priv->ser_dev, enable_mfp, priv->ser_dev, priv->mfp_trigger);
SERDES_OP(priv->dser_dev, set_stream, priv->dser_dev, sen_dev, 1);
```

### sensor device tree

RDK S100 v4l2 gmsl sensor 默认加载 0820C 的 dts，gmsl sensor 设备树组织格式如下：

```dts
ar0820@11 {
    compatible = "d-robotics,ar0820";
    reg = <0x11>;      // map 后的地址
    addr = <0x10>;     // sensor i2c 实际地址
    // ...
    mfp-reset = <0>;   // reset 连接到加串器的 mfp
    mfp-trigger = <7>; // trigger pin 链接到加串器的 mfp
    d-robotics,serdes-ser-device = <&ser_a>;  // 链接至 linkA 上的加串
    d-robotics,serdes-dser-device = <&dser>;   // 接入 deserial
    status = "okay";

    port {
        cam_0_to_mipi_csi4: endpoint {    // 接入 mipi rx4
            remote-endpoint = <&mipi_csi4_from_cam_0>;
            virtual-channel = <0>;
        };
    };
};
```

## Sensor dtbo 文件编写配置说明

uboot 支持 DTB Overlay 功能，可以在不修改当前启动使用的 dts 文件的情况下，通过编写配置对应的 dtbo 文件，对当前启动使用的 dtb 文件进行增/改（不支持删减）。

### sensor dtbo 文件生成

**1. 编写 dtso 文件**

```c
/* 注意 node 的名称和地址在不同平台上可能不一致 */
#include <dt-bindings/gpio/gpio.h>

/dts-v1/;
/plugin/;

/ {
    fragment@1 {
        target-path = "/soc/i2c@39450000/";
        __overlay__ {
            status = "okay";
            d457@11 {
                compatible = "intel,d4xx";
                reg = <0x11>;
                def-addr = <0x10>;
                width = <640>;
                height = <480>;
                cam-type = "Depth";
                data_type = <0x2e>;
                lane_num = <2>;
                vc_id = <0>;
                d-robotics,serdes-ser-device = <&ser_a>;
                d-robotics,serdes-dser-device = <&dser>;
                status = "okay";

                port {
                    sensor_0_to_mipi_csi4: endpoint {
                        remote-endpoint = <&mipi_csi4_from_sensor_0>;
                        virtual-channel = <0>;
                    };
                };
            };
        };
    };
};
```

**2. 在板端编译生成 dtbo**

安装 dtc 工具：

```bash
sudo apt install device-tree-compiler -y
```

预处理 dtso 文件（当 dtso 中 include 头文件或有定义时才需要）：

```bash
# 获取 dts 头文件路径
HEADER_DIR=$(find /usr/src -maxdepth 1 -type d -name "linux-headers-*" | sort -Vr | head -n 1)
DTS_HEAD_PATH="$HEADER_DIR/include"

# 将编写的 dtso 文件预处理生成 dtbi 文件
cpp -nostdinc -I "$DTS_HEAD_PATH" sample.dtso > sample.dtbi
```

编译生成 dtbo 文件：

```bash
# 如果有 dtbi 文件
dtc -q -@ -I dts -O dtb -o sample.dtbo sample.dtbi

# 如果没有 dtbi 文件，直接从 dtso 生成
dtc -q -@ -I dts -O dtb -o sample.dtbo sample.dtso
```

### sensor dtbo 开机自动生效配置

1. 将编译生成的 dtbo 文件放置到 `/boot/overlays` 目录下。若板端没有该目录，用户可自行添加，或通过安装 `hobot-camera.deb` 来获取目录和 sensor dtbo 文件。

2. 修改 `/boot/config.txt` 文件，配置要添加的 dtbo 文件：

   ```
   dtbo_file_path=/overlays/v0p5_d457_2v_depth_color.dtbo
   ```

3. 重启板子，使能配置的 dtbo 文件。在 debug 版本的 uboot log 中可以检查加载 dtbo 的情况。

## Sensor gain LUT 表编写说明

RAW 格式的 sensor，对接到 ISP 图像系统，除了编写 sensor v4l2 驱动，另外需要制作一个 so，存放 sensor 增益 lut 转换表，包括 again lut、dgain lut 等。

人眼对亮度的感知更接近对数尺度而非线性尺度，dB 单位更符合这种感知。sensor 增益 lut 表存放的 gain 数组需要存放 db 单位连续的 sensor gain 寄存器配置值，供 ISP 调节 sensor 增益时找到对应的 sensor 寄存器值，下发到 sensor。

以 imx219 为例，v4l2 sensor lut so 制作目录在 SDK 中位于 `hobot-camera/v4l2/v4l2_helper/imx219_v4l2`：

1. 添加 `<sensor_name>_camera_helper.c` 文件、Makefile 及版本文件 `version.mk`
2. 在 `xxx_helper.c` 文件中制作 again lut 表及 dgain lut 表：

```c
static uint32_t imx219_again_lut[] = {
    0x00,   // 0db
    0x05,   // 约 0.2db
    0x0B,   // 约 0.4db
    0x0F,   // 约 0.6db
    0x15,   // 约 0.8db
    // ...
    0xE7,   // 约 20.4db
    0xE8,   // 约 20.6db
    0xffff, // end flag
};

static uint32_t imx219_dgain_lut[] = {
    0x0100,  // 0db
    0x0106,  // 约 0.2db
    0x010c,  // 约 0.4db
    // ...
    0x0fd9,  // 约 24.0db
    0xffff,  // end flag
};
```

:::note
lut 表最后一个成员固定为 0xffff。lut 表为一个 uint32 类型的数组，最多 256 个成员，每个成员为 gain 寄存器的配置值，相邻成员对应的 db 要连续。
:::

3. 编写 again/dgain index to reg callback 函数及获取 callback 的接口：

```c
typedef uint32_t (*AGainIndexToReg_t)(uint8_t);
typedef uint32_t (*DGainIndexToReg_t)(uint8_t);

typedef struct {
    AGainIndexToReg_t again_index_to_reg_callback;
    DGainIndexToReg_t dgain_index_to_reg_callback;
} Callbacks;

uint32_t again_index_to_reg_function(uint8_t isp_index)
{
    if (isp_index >= sizeof(imx219_again_lut) / sizeof(uint32_t))
        isp_index = sizeof(imx219_again_lut) / sizeof(uint32_t) - 1;
    return imx219_again_lut[isp_index];
}

uint32_t dgain_index_to_reg_function(uint8_t isp_index)
{
    if (isp_index >= sizeof(imx219_dgain_lut) / sizeof(uint32_t))
        isp_index = sizeof(imx219_dgain_lut) / sizeof(uint32_t) - 1;
    return imx219_dgain_lut[isp_index];
}

Callbacks cb = {again_index_to_reg_function, dgain_index_to_reg_function};

Callbacks *get_index_to_reg_callbacks() {
    return &cb;
}
```

生成的 so 命名为 `lib<sensor_name>_v4l2.so`，运行时会自动匹配并 dlopen 该 so，调用符号最终获取到 lut 表。

## 曝光同步 sensor 驱动说明

S100/S600 camsys serdes 提供了 trigger 相关接口，sensor 驱动中可以调用来配置 lpwm 硬件、使能 lpwm。硬件同步曝光目前仅支持 gmsl sensor，sensor dts 中需要配置正确的 trigger mfp 管脚。

在 sensor 的初始化配置 format 格式中调用 trigger_cfg 下发 lpwm 配置：

```c
// period 单位为 ns，计算方式为 (1000000/fps)*1000
// duty 单位为 ns，没有特殊要求可以配置为 10000
SERDES_OP(priv->dser_dev, trigger_cfg, priv->dser_dev, sen_dev, period, duty);
```

在 stream 开关流时，调用 trigger_enable 打开或关闭 lpwm 输出：

```c
SERDES_OP(priv->dser_dev, trigger_enable, priv->dser_dev, sen_dev, enable);
```

## 深度相机点亮注意事项

目前 camera 支持使用 RealSense D457 和奥比中仁 Gemini 335Lg 两款 GMSL 形式的深度相机，该部分针对深度相机相比较其他普通 GMSL 相机的差异点做出说明。

### 限制

- 只支持获取深度数据（depth）和颜色数据（color），**不支持获取 IR 数据**。
  - Gemini 335Lg 通过官方 SDK 额外获取 IMU 数据。
  - D457 在本方案中不支持获取 IMU 数据。
- 每 1 路数据通路都会占用解串器的 1 个输入 port。

:::doc_scope{products="RDK S100"}
- RDK S100 camera 子板默认搭载 1 路解串器，最多支持 4 路数据流（例如 depth + color 组合为 2 路）。
:::

:::doc_scope{products="RDK S600"}
- RDK S600 camera 子板最大可支持 4 路解串器，最多支持 16 路数据流。
:::

接入不同路数的相机，或 D457 与 335Lg 组合使用时，需要自行适配 dtb overlay，确保每一路的 I2C 地址、虚拟通道（VC）、port 绑定关系正确。D457 和 335Lg 固件本身也存在问题，具体遗留问题请参考官网的说明与 release note。

### dtb overlay 文件编写和添加

参考上面 [dtbo 编写说明](#sensor-dtbo-文件编写配置说明)，主要注意点参考下面的代码注释：

```c
// D457 depth 输出（port_a, vc_id=0）
d457@11 {
    compatible = "intel,d4xx";
    reg = <0x11>;           // 映射后的 i2c 地址
    def-addr = <0x10>;     // d457 实际的 i2c 物理地址
    width = <640>;
    height = <480>;
    cam-type = "Depth";    // d457 输出数据类型，可选 Depth, RGB
    data_type = <0x2e>;    // Depth -> 0x2e, RGB -> 0x1e
    lane_num = <2>;       // d457 mipi lane 数，固定 2 lane
    vc_id = <0>;          // 解串器送给 SoC 对应的 mipi 虚拟通道
    d-robotics,serdes-ser-device = <&ser_a>;  // 接到 port_a，输出 depth
    d-robotics,serdes-dser-device = <&dser>;
    status = "okay";
    port {
        d457_0_to_mipi_csi4: endpoint {
            remote-endpoint = <&mipi_csi4_from_d457_0>;
            virtual-channel = <0>;
        };
    };
};

// D457 RGB 输出（port_a, vc_id=1）
d457@12 {
    compatible = "intel,d4xx";
    reg = <0x12>;
    def-addr = <0x10>;
    width = <640>;
    height = <480>;
    cam-type = "RGB";
    data_type = <0x1e>;
    lane_num = <2>;
    vc_id = <1>;
    d-robotics,serdes-ser-device = <&ser_a>;  // 接到 port_a，输出 rgb
    d-robotics,serdes-dser-device = <&dser>;
    status = "okay";
    port {
        d457_1_to_mipi_csi4: endpoint {
            remote-endpoint = <&mipi_csi4_from_d457_1>;
            virtual-channel = <1>;
        };
    };
};

// D457 depth 输出（port_c, vc_id=2）
d457@13 {
    compatible = "intel,d4xx";
    reg = <0x13>;
    def-addr = <0x10>;
    width = <640>;
    height = <480>;
    cam-type = "Depth";
    data_type = <0x2e>;
    lane_num = <2>;
    vc_id = <2>;
    d-robotics,serdes-ser-device = <&ser_c>;
    d-robotics,serdes-dser-device = <&dser>;
    status = "okay";
    port {
        d457_2_to_mipi_csi4: endpoint {
            remote-endpoint = <&mipi_csi4_from_d457_2>;
            virtual-channel = <2>;
        };
    };
};

// D457 RGB 输出（port_c, vc_id=3）
d457@14 {
    compatible = "intel,d4xx";
    reg = <0x14>;
    def-addr = <0x10>;
    width = <640>;
    height = <480>;
    cam-type = "RGB";
    data_type = <0x1e>;
    lane_num = <2>;
    vc_id = <3>;
    d-robotics,serdes-ser-device = <&ser_c>;
    d-robotics,serdes-dser-device = <&dser>;
    status = "okay";
    port {
        d457_3_to_mipi_csi4: endpoint {
            remote-endpoint = <&mipi_csi4_from_d457_3>;
            virtual-channel = <3>;
        };
    };
};
```

:::note
- `cam-type` 与 `data_type` 必须匹配，否则 Depth/RGB 会解析失败。
- `vc_id` 规划需与每路 depth/color 的数量对应，避免多个流抢占同一个虚拟通道。
- 需要注意 `d-robotics,serdes-ser-device` 的 `ser_a`/`ser_c` 对应物理接线与实际要对应。
:::

### 板端支持的 dtb overlay

| dtbo 文件                                                           | 说明                                                                           |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `s100_d457_rx4_4v_dpeth.dtbo`                                       | RDK S100 官方 camera 扩展板，通过 MIPI RX4 接入 4 路 D457，获取 4 路深度图     |
| `s100_12v_camera_board_d457_rx4_portAC_rx1_portAC_depth_color.dtbo` | RDK S100 12 路 GMSL 扩展板，RX4 + RX1 接入 4 路 D457，获取 4 路深度 + 4 路 RGB |
| `s100_335lg_rx4_2v_portA_portB_depth_color.dtbo`                    | RDK S100 官方 camera 扩展板，RX4 接入 2 路 335Lg，获取 2 路深度 + 2 路 RGB     |
| `s600_335lg_rx2_portAC_rx3_portAC_depth_color.dtbo`                 | RDK S600 camera 扩展板，RX2 + RX3 接入 4 路 335Lg，获取 4 路深度 + 4 路 RGB    |
| `s600_d457_rx2_portAC_rx3_portAC_depth_color.dtbo`                  | RDK S600 camera 扩展板，RX2 + RX3 接入 4 路 D457，获取 4 路深度 + 4 路 RGB     |

### 切换到 V4L2 模式

加载 camsys V4L2 ko，注意需要加载对应的深度相机 ko：D457 为 `d457.ko`，335Lg 为 `g300.ko`。

### 修改官方 SDK

D457 和 335Lg 官方 SDK 是针对其他平台做的适配，在 RDK 平台上正常运行需要修改 SDK 源码。

- D457 SDK 官网：[librealsense](https://github.com/realsenseai/librealsense)
- 335Lg SDK 官网：[OrbbecSDK_v2](https://github.com/orbbec/OrbbecSDK_v2)

**D457 修改 diff：**

```diff
--- a/src/linux/backend-v4l2.cpp
+++ b/src/linux/backend-v4l2.cpp
@@ -1745,7 +1745,12 @@ namespace librealsense
             std::string driver_str = reinterpret_cast<char*>(cap.driver);
             size_t pos = driver_str.find("tegra");
-            return pos != std::string::npos;
+            size_t pos_vs = driver_str.find("vs");
+            if (pos != std::string::npos || pos_vs != std::string::npos) {
+                return true;
+            }
+            return false;
         }
```

**335Lg 修改 diff：**

```diff
--- a/src/platform/usb/uvc/ObV4lGmslDevicePort.cpp
+++ b/src/platform/usb/uvc/ObV4lGmslDevicePort.cpp
@@ -1779,7 +1779,7 @@
-#define GMSL_MIPI_DEVICE_TAG "platform:tegra-capture-vi"
+#define GMSL_MIPI_DEVICE_TAG "platform"
```

### D457 建立软链接

:::note
D457 官方 SDK 内部通过固定的 `/dev/video-rs-*` 设备名称进行匹配，因此需要手动建立软链接。路数或 video 节点编号变化时，需同步调整软链接指向。
:::

以 RDK S100 2 路 depth + 2 路 color 为例：

```bash
# modprobe vid_v4l2 scene=0, 此时 mipi rx4 从 video2 开始
ln -s /dev/video2 /dev/video-rs-depth-0
ln -s /dev/video3 /dev/video-rs-color-0
ln -s /dev/video4 /dev/video-rs-depth-1
ln -s /dev/video5 /dev/video-rs-color-1
# video0 和 video1 为 RX0/RX1，目前没有使用
# 增加 imu 软链接是为了 RDK S100 平台适配 librealsense
ln -s /dev/video0 /dev/video-rs-imu-0
ln -s /dev/video0 /dev/video-rs-imu-1
```

### 预览

- **D457**：SDK 编译完成后，终端输入 `realsense-viewer`，添加 D457 设备即可预览。viewer 默认显示一路 D457，多路数据点击左上角 Add Source 按钮添加。

  ![D457 预览效果](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camera_bringup/camera_bringup_16.png)

- **335Lg**：SDK 编译完成后，启动 viewer 并查看 depth 和 color 图像。

  ![335Lg 预览效果](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camera_bringup/camera_bringup_17.png)
