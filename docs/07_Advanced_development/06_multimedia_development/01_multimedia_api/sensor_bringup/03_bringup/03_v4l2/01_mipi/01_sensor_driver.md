---
sidebar_position: 1
title: "V4L2 mipi sensor 驱动编写说明"
description: "v4l2 subdev 驱动框架：私有结构体、回调 ops、probe、device tree"
---

# V4L2 sensor 驱动编写说明

S100 Camsys sensor v4l2 驱动软件框架为标准的 v4l2 sub device 驱动。

![V4L2 sensor 驱动框架](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/multimedia_api/sensor_bringup/v4l2_sensor_driver/screenshot-20261023-160236.png)

下面以 IMX219 驱动为例，介绍 MIPI 直连 sensor v4l2 驱动开发流程，imx219 驱动源码位于：`kernel/drivers/media/i2c/imx219.c`。

## 定义 sensor 私有结构体

imx219 私有结构体如下：

```c
struct imx219 {
	struct v4l2_subdev sd;
	struct media_pad pad;
	struct i2c_client *i2c_client;
	...
	struct v4l2_ctrl *xxx_ctrl;
	...
};
```

- sd：v4l2 sub device 句柄，用于操作 subdev ops。
- pad：media pad，用于和后级模块建立 media 链接关系。
- i2c_client：i2c client 句柄，用来通过 i2c 总线与 sensor 交互。
- xxx_ctrl：v4l2 控制属性，例如 exposure、flip、blank 控制，非必须实现。

## V4L2 回调函数实现

符合 v4l2 标准的 sensor 驱动需要实现一些 ops 函数，V4L2 框架会通过 ops 函数控制 sensor。

```c
static const struct v4l2_subdev_ops imx219_subdev_ops = {
	.core = &imx219_core_ops,
	.video = &imx219_video_ops,
	.pad = &imx219_pad_ops,
};
```

实现 v4l2 subdev ops 回调，其中包含 core ops、video ops、pad ops。

```c
static const struct v4l2_subdev_pad_ops imx219_pad_ops = {
	.enum_mbus_code = imx219_enum_mbus_code,
	.get_fmt = imx219_get_pad_format,
	.set_fmt = imx219_set_pad_format,
	.enum_frame_size = imx219_enum_frame_size,
};
```

pad ops 定义了一些格式配置、格式协商的回调接口，必须实现。

```c
static const struct v4l2_subdev_video_ops imx219_video_ops = {
	.s_stream = imx219_set_stream,
};
```

video ops 主要定义了 sensor 开关流的接口，必须实现。

```c
static const struct v4l2_subdev_core_ops imx219_core_ops = {
	.subscribe_event = v4l2_ctrl_subdev_subscribe_event,
	.unsubscribe_event = v4l2_event_subdev_unsubscribe,
};
```

core ops 定义了一些如 ioctl event 实现等，可选实现。

```c
static const struct v4l2_subdev_internal_ops imx219_internal_ops = {
	.open = imx219_open,
};
```

internal ops 主要定义了一些 ops 用于管理子设备的生命周期，按需实现 open、close、release 等回调。

## sensor probe 函数

```c
static int imx219_probe(struct i2c_client *client)
{
	imx219 = devm_kzalloc(&client->dev, sizeof(*imx219), GFP_KERNEL); // 1
	if (!imx219)
		return -ENOMEM;
	...
	v4l2_i2c_subdev_init(&imx219->sd, client, &imx219_subdev_ops);  // 2

	imx219->sd.flags |= V4L2_SUBDEV_FL_HAS_DEVNODE |
				V4L2_SUBDEV_FL_HAS_EVENTS;
	imx219->sd.entity.function = MEDIA_ENT_F_CAM_SENSOR;
	imx219->pad.flags = MEDIA_PAD_FL_SOURCE;
	ret = media_entity_pads_init(&imx219->sd.entity, 1, &imx219->pad);  // 3

	ret = v4l2_async_register_subdev_sensor(&imx219->sd);  // 4
	...
}
```

1. 初始化 sensor 结构体，分配内存。
2. 初始化一个 v4l2 subdev，并绑定到 I2C client。
3. 初始化 media entity 的 pad 信息，让 media controller 知道当前 sensor 有一个输出 pad，可以连接到后级模块。
4. 异步注册，把当前 sensor subdev 注册到 v4l2 框架。

## sensor device tree

S100 默认加载 imx219 设备树，设备树组织格式如下面所示。如果接入其他的 mipi sensor，需要以 dts overlay 的方式覆盖掉 imx219 的 dts。

```dts
&i2c1 {
	status = "okay";

	imx219@10 {
		status = "okay";
		compatible = "sony,imx219";
		...
		reg = <0x10>; // sensor i2c 地址
		...
		port {
			cam_to_mipi_csi0: endpoint {  // MIPI 相关属性
				remote-endpoint = <&rdk_s100_mipi_csi0_from_cam>;  // 对接到 mipi RX0
				clock-lanes = <0>;
				data-lanes = <1 2>;
				link-frequencies =
					/bits/ 64 <456000000>;
				virtual-channel = <0>;
			};
		};
	};
};

&mipi_host0 {
	ports {
		port@0 {
			rdk_s100_mipi_csi0_from_sensor0: endpoint {
				remote-endpoint = <&sensor0_to_mipi_csi0>;
				clock-lanes = <0>;
				data-lanes = <1 2>;    // mipi data lane 为 2 lane
				lane-rate = <1728>;    // mipi 速率
				vc_id = <0>;           // sensor 输出的 virtual channel
				emb-en = <1>;          // sensor 输出是否包含 embedded data
			};
		};
	};
};
```
