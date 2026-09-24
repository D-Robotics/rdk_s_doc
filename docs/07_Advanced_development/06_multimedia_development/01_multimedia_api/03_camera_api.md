---
sidebar_position: 3
title: "相机接口 - Camera"
description: "RDK S100/S600 Camera 采集入口 API（hbn_camera_* / hbn_deserial_* / hbn_txser_*）"
---

# 视频输入 - Camera

## 模块描述

- Camera 是 RDK 多媒体 pipeline 的采集入口。
- 封装 Sensor,Serializer,Deserializer 配置、通道初始化与 VIN 绑定，与 HBN vnode（VIN/ISP/PYM）组成 vflow。

**Camera 接入方式**：

- 支持 MIPI CSI camera 输入 和 Serdes camera 接入两种方式。
- 两种方式都需要通过 attach / detach 接口与 VIN node 绑定和解绑，从而初始化和去初始化 sensor。
  1. MIPI CSI 直接接入：通过 `hbn_camera_attach_to_vin` / `hbn_camera_detach_from_vin` 将 Camera 与 VIN node 绑定/解绑。
  2. Serdes camera 接入：通过 `hbn_deserial_attach_to_vin` / `hbn_deserial_detach_from_vin` 将 deserial 与 VIN node 绑定/解绑，Camera 再 attach 到 deserial。
- 关于 VIN node，见 [视频输入 - VIN](./04_vin_api.md)。

### 硬件框图

**主要组成模块**：

:::doc_scope{products="RDK S100"}
- Serializer：把 sensor 的 MIPI 并行数据转换成串行数据流，通过同轴线缆串联到Deserializer
- Deserializer：把通过同轴线缆的串行数据流转换成并行数据接入S100 MIPI RX
- Sensor：可直接接入S100 MIPI RX 或者 通过 Serializer 串联 Deserializer 接入S100 MIPI RX
- POC：用于给远端 Serializer和sensor 供电
- 控制管脚：I2C、LPWM(同步触发)、reset、deserr(Serdes链路错误上报管脚)
- 下图 S100 连接图例一所示为 最大sensor接入路数样例，S100 连接图例二为 4路sdes和2路mipi的样例
:::

:::doc_scope{products="RDK S100"}
<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/camera/s100_hardware.png?v=20260924b" alt="S100 Camera 硬件数据通路" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />
:::

:::doc_scope{products="RDK S600"}
- Serializer：把 sensor 的 MIPI 并行数据转换成串行数据流，通过同轴线缆串联到Deserializer
- Deserializer：把通过同轴线缆的串行数据流转换成并行数据接入S600 MIPI RX
- Sensor：可直接接入S600 MIPI RX 或者 通过 Serializer 串联 Deserializer 接入S600 MIPI RX
- POC：用于给远端 Serializer和sensor 供电
- 控制管脚：I2C、LPWM(同步触发)、reset、deserr(Serdes链路错误上报管脚)
- 下图 S600 连接图例所示为 最大sensor接入路数样例
:::

:::doc_scope{products="RDK S600"}
<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/camera/s600_hardware.png?v=20260924b" alt="S600 Camera 硬件数据通路" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />
:::


**关键功能**：
:::doc_scope{products="RDK S100"}

- S100 上有3个MIPI RX，分别为 MIPI RX0，MIPI RX1，MIPI RX4。
- S100 MIPI RX支持C/DPHY，DPHY速率 4.5Gbps x 4lane，CPHY速率3.5Gsps x 3trios。
- S100 MIPI RX，每路支持4VC，最多支持12路接入。
- MIPI TX: 2路DPHY，每路为2.5Gbps/lane x 4lane。
:::

:::doc_scope{products="RDK S600"}

- S600 上有6个MIPI RX，分别为MIPI RX0，MIPI RX1，MIPI RX2，MIPI RX3，MIPI RX4，MIPI RX5。
- S600 MIPI RX 每路为DPHY最大4.5Gbps/lane x 4lane，CPHY最大3.5Gsps/trio x 3trio，
- S600 MIPI RX，每路支持4VC，最多支持 24 路接入。
- MIPI TX: 2路DPHY，每路为2.5Gbps/lane x 4lane。

:::


## 参考示例

Camera 接入示例代码可参考 sample_vin：

:::doc_scope{products="RDK S100"}
- [sample_vin 使用说明](../02_multimedia_sample/02_sample_vin.md)
:::

:::doc_scope{products="RDK S600"}
- [sample_vin 使用说明](../02_multimedia_sample_s600/02_sample_vin.md)
:::

## 框架

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/camera/camera-framework.png?v=20260923" alt="Camera 框架分层" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

Camera 框架分为四层：APP、HBN 接口（SENSOR、DESERIAL、TXSER HAL子模块）、driver 和 hardware。

### HBN 接口

- `hbn_camera_xxx()`：开 camera 通道。包括 sensor 配置、serdes 链路建立、挂到 VIN 节点。
- `hbn_deserial_xxx()`：SoC 作为 MIPI 接收端，经 RX_PHY 收外部解串器送来的数据；同时配置外部解串器芯片，如 max9296、max96712。
- `hbn_txser_xxx()`：SoC 作为 MIPI 发送端，经 TX_PHY 把数据发出。

#### SENSOR HAL 子模块

- `SENSOR common`：sensor 框架层，做参数检查与 ops 分发。
- `SENSOR LIBs`：各 sensor 的so库（如 ar0233、ovx8b）。每个 .so 装载该 sensor 的寄存器配置表与控制函数，sensor 初始化、起停流、寄存器读写都在这里。
- `TUNING HAL`：标定与 IQ tuning 入口，把 IQ 参数和标定数据下发给 sensor。
- `CALIB LIBs`：标定库，存放 lens shading、AE/AWB 等标定数据，供 TUNING HAL 读取。

#### DESERIAL HAL 子模块

- `DES common`：deserial 框架层，做参数检查与 ops 分发。
- `DES LIBs`：各解串器芯片so库（max9296、max96712、max96722 等）。配置解串器寄存器、设 MIPI 输出格式与 Link→CSI/VC 映射。
- `POC LIBs`：Power-over-Coax 同轴供电控制库，经同轴线给远端 sensor/serializer 供电并回读状态。

#### TXSER HAL 子模块

- `TXSER common`：txser 框架层，做参数检查与 ops 分发。
- `SER LIBs`：各串行器芯片so库（max9295e、max96717等）。
  - 配置串行器寄存器、MIPI lane 模式、建立 SoC TX_PHY 到远端的串行链路。

### driver

- `I2C dev`：内核 I2C 字符设备，对应用户态 I2C funs。
- `GPIO sysfs`：内核 GPIO sysfs 接口，对应用户态 GPIO funs。
- `SENSOR driver`：sensor 内核驱动，内含三部分：
  - `Sensor Driver`：sensor 寄存器访问与流控。
  - `Sensor IQ Driver`：IQ 参数下发通路。
  - `Sensor STL Driver`：safety/lockstep 监控驱动，对接 SENSOR_ERR 收发错误中断。
- `DERSERIAL Driver`：deserial 内核驱动。
- `ISP Module Control Driver`：ISP 模块控制驱动，管理 ISP 处理通路。

### hardware

- `I2Cs`：I2C 控制器硬件。
- `GPIOs`：GPIO 控制器硬件。
- `SENSOR_ERR`：sensor 错误中断线。
- `RX_PHY`：MIPI 接收 PHY。
- `TX_PHY`：MIPI 发送 PHY。
- `LPWM`：Lite PWM，输出 trigger 与曝光同步信号。

## API 参考

| API 接口 | 接口功能 |
|---|---|
| [hbn_camera_create](#hbn_camera_create) | 根据 camera_config_t 传入的配置创建 camera handle |
| [hbn_camera_destroy](#hbn_camera_destroy) | 根据 camera handle 销毁对应的软件资源 |
| [hbn_camera_attach_to_vin](#hbn_camera_attach_to_vin) | 将 camera 与 vin node 绑定，并初始化 camera 硬件 |
| [hbn_camera_detach_from_vin](#hbn_camera_detach_from_vin) | 将 camera 与 vin node 解绑，并去初始化 |
| [hbn_camera_attach_to_deserial](#hbn_camera_attach_to_deserial) | 将 camera 与 deserial 绑定，并初始化硬件 |
| [hbn_camera_detach_from_deserial](#hbn_camera_detach_from_deserial) | 将 camera 与 deserial 解绑，并去初始化 |
| [hbn_camera_start](#hbn_camera_start) | 配置 camera 寄存器，开始出流 |
| [hbn_camera_stop](#hbn_camera_stop) | 配置 camera 寄存器，关流 |
| [hbn_camera_reset](#hbn_camera_reset) | 重新初始化 sensor 来做 reset |
| [hbn_camera_change_fps](#hbn_camera_change_fps) | 动态切换 sensor 帧率 |
| [hbn_camera_read_register](#hbn_camera_read_register) | 读取 camera 寄存器的值 |
| [hbn_camera_write_register](#hbn_camera_write_register) | 写入 camera 寄存器的值 |
| [hbn_camera_read_registers](#hbn_camera_read_registers) | 批量读取 camera 寄存器 |
| [hbn_camera_write_registers](#hbn_camera_write_registers) | 批量写入 camera 寄存器 |
| [hbn_camera_parse_emb](#hbn_camera_parse_emb) | 解析 embedded raw data 为 embed_info |
| [hbn_camera_update_ae_info](#hbn_camera_update_ae_info) | 更新 ae 信息到 camera sensor 驱动 |
| [hbn_camera_get_sns_info](#hbn_camera_get_sns_info) | 获取 camera sensor 参数信息 |
| [hbn_camera_set_event_callback](#hbn_camera_set_event_callback) | 设置 camera 事件回调函数 |
| [hbn_camera_get_status](#hbn_camera_get_status) | 获取 camera 运行状态 |
| [hbn_camera_get_version](#hbn_camera_get_version) | 获取 camera 库版本信息 |
| [hbn_camera_get_handle](#hbn_camera_get_handle) | 通过 vin handle 或 camera port 获取 camera handle |
| [hbn_camera_init_cfg](#hbn_camera_init_cfg) | 通过 json 配置创建 camera/deserial handle 并绑定 |
| [hbn_deserial_create](#hbn_deserial_create) | 根据配置创建 deserial handle |
| [hbn_deserial_destroy](#hbn_deserial_destroy) | 销毁 deserial 软件资源 |
| [hbn_deserial_attach_to_vin](#hbn_deserial_attach_to_vin) | 将 deserial 与 vin node 绑定 |
| [hbn_deserial_detach_from_vin](#hbn_deserial_detach_from_vin) | 将 deserial 与 vin node 解绑 |
| [hbn_txser_create](#hbn_txser_create) | 根据配置创建串行器 txser handle |
| [hbn_txser_destroy](#hbn_txser_destroy) | 销毁 txser 软件资源 |
| [hbn_txser_attach_to_vin](#hbn_txser_attach_to_vin) | 将 txser 与 vin node 绑定 |
| [hbn_txser_detach_from_vin](#hbn_txser_detach_from_vin) | 将 txser 与 vin node 解绑 |

## API 接口说明

### hbn_camera_create {#hbn_camera_create}

#### 【函数声明】

```c
int32_t hbn_camera_create(camera_config_t *cam_config, camera_handle_t *cam_fd);
```

#### 【参数描述】

- [IN] `camera_config_t *cam_config`：要配置的 camera 参数结构体指针。
- [OUT] `camera_handle_t *cam_fd`：根据配置返回的 fd，作为 camera 的操作 handle。

#### 【返回值】

- 成功：0。
- 失败：负值错误码，参考 [返回值说明](#返回值说明)。

#### 【功能描述】

根据 `camera_config_t` 传入的配置创建 camera handle。

#### 【注意事项】

- API 会对 sensor lib 进行检查，如果 sensor 驱动代码不符合 HBN 框架规范，则会检查报错。
- API 会对 cam_config 进行检查，如果配置不符合 IP 硬件能力，则会检查报错。

### hbn_camera_destroy {#hbn_camera_destroy}

#### 【函数声明】

```c
int32_t hbn_camera_destroy(camera_handle_t cam_fd);
```

#### 【参数描述】

- [IN] `camera_handle_t cam_fd`：camera 的操作 handle，由 `hbn_camera_create` 创建。

#### 【返回值】

- 成功：0。
- 失败：负值错误码。

#### 【功能描述】

根据 camera handle 销毁对应的软件资源。

#### 【注意事项】

- `hbn_camera_destroy` 需要与 `hbn_camera_create` 成对使用。
- 会释放 sensor lib，执行完成后 sensor 将无法正常访问。
- 内部会调用 `hbn_camera_detach_from_vin`，触发 sensor 停流，因此需要在 `hbn_vflow_destroy` 之前调用。

### hbn_camera_attach_to_vin {#hbn_camera_attach_to_vin}

#### 【函数声明】

```c
int32_t hbn_camera_attach_to_vin(camera_handle_t cam_fd, vpf_handle_t vin_fd);
```

#### 【参数描述】

- [IN] `camera_handle_t cam_fd`：camera handle，由 `hbn_camera_create` 创建。
- [IN] `vpf_handle_t vin_fd`：由 `hbn_vnode_open` 创建的 vin node handle。

#### 【返回值】

- 成功：0。
- 失败：负值错误码。

#### 【功能描述】

通过 camera 和 vin node 的 handle，将两者在 vpf 框架中绑定，并对 camera 硬件初始化。无 deserial 时使用此接口。

#### 【注意事项】

- 同一个 camera 不能重复执行 `hbn_camera_attach_to_vin`，否则会报 attach error。

### hbn_camera_detach_from_vin {#hbn_camera_detach_from_vin}

#### 【函数声明】

```c
int32_t hbn_camera_detach_from_vin(camera_handle_t cam_fd);
```

#### 【参数描述】

- [IN] `camera_handle_t cam_fd`：camera handle，由 `hbn_camera_create` 创建。

#### 【返回值】

- 成功：0。
- 失败：负值错误码。

#### 【功能描述】

将 camera 与 vin node 解绑，并做去初始化操作。

#### 【注意事项】

- 需要与 `hbn_camera_attach_to_vin` 成对使用。
- `hbn_camera_destroy` 内部已调用本接口，调用了 `hbn_camera_destroy` 后可不再调用本接口。

### hbn_camera_attach_to_deserial {#hbn_camera_attach_to_deserial}

#### 【函数声明】

```c
int32_t hbn_camera_attach_to_deserial(camera_handle_t cam_fd, deserial_handle_t des_fd, camera_des_link_t link);
```

#### 【参数描述】

- [IN] `camera_handle_t cam_fd`：camera handle，由 `hbn_camera_create` 创建。
- [IN] `deserial_handle_t des_fd`：deserial handle，由 `hbn_deserial_create` 创建。
- [IN] `camera_des_link_t link`：camera 与 deserial 的 link 方式，由 camera 接到哪个 link 决定。

#### 【返回值】

- 成功：0。
- 失败：负值错误码。

#### 【功能描述】

通过 camera 和 deserial 的 handle，将两者绑定，并对 deserial 和 camera 硬件初始化。

#### 【注意事项】

- 硬件上有解串器时才需要调用本接口。
- 执行本接口后无需再执行 `hbn_camera_attach_to_vin`，而是由 deserial 绑定到 vin node。

### hbn_camera_detach_from_deserial {#hbn_camera_detach_from_deserial}

#### 【函数声明】

```c
int32_t hbn_camera_detach_from_deserial(camera_handle_t cam_fd);
```

#### 【参数描述】

- [IN] `camera_handle_t cam_fd`：camera handle，由 `hbn_camera_create` 创建。

#### 【返回值】

- 成功：0。
- 失败：负值错误码。

#### 【功能描述】

将 camera 与 deserial 解绑，并做去初始化操作。

#### 【注意事项】

- 需要与 `hbn_camera_attach_to_deserial` 成对使用。

### hbn_camera_start {#hbn_camera_start}

#### 【函数声明】

```c
int32_t hbn_camera_start(camera_handle_t cam_fd);
```

#### 【参数描述】

- [IN] `camera_handle_t cam_fd`：camera handle，由 `hbn_camera_create` 创建。

#### 【返回值】

- 成功：0。
- 失败：负值错误码。

#### 【功能描述】

配置 camera 寄存器，开始出流。只操作 camera sensor 硬件，不影响内部硬件。

#### 【注意事项】

- camera handle attach 到 vflow 后，本接口可不调用。若调用，必须先 `hbn_vflow_start`，再 `hbn_camera_start`。

### hbn_camera_stop {#hbn_camera_stop}

#### 【函数声明】

```c
int32_t hbn_camera_stop(camera_handle_t cam_fd);
```

#### 【参数描述】

- [IN] `camera_handle_t cam_fd`：camera handle，由 `hbn_camera_create` 创建。

#### 【返回值】

- 成功：0。
- 失败：负值错误码。

#### 【功能描述】

配置 camera 寄存器，关流。只操作 camera sensor 硬件，不影响内部硬件。

#### 【注意事项】

- 需要与 `hbn_camera_start` 成对使用。

### hbn_camera_reset {#hbn_camera_reset}

#### 【函数声明】

```c
int32_t hbn_camera_reset(camera_handle_t cam_fd);
```

#### 【参数描述】

- [IN] `camera_handle_t cam_fd`：camera handle，由 `hbn_camera_create` 创建。

#### 【返回值】

- 成功：0。
- 失败：负值错误码。

#### 【功能描述】

通过重新初始化 sensor 来做 reset。

#### 【注意事项】

- 在 camera attach vin 之前调用：通过 `hbn_camera_attach_to_vin` 给 sensor 初始化，达到 reset 效果。
- 在 camera attach vin 之后调用：依次 sensor stop → deinit → init → start。

### hbn_camera_change_fps {#hbn_camera_change_fps}

#### 【函数声明】

```c
int32_t hbn_camera_change_fps(camera_handle_t cam_fd, int32_t fps);
```

#### 【参数描述】

- [IN] `camera_handle_t cam_fd`：camera handle，由 `hbn_camera_create` 创建。
- [IN] `int32_t fps`：sensor 出图帧率，范围 [1, 120]。

#### 【返回值】

- 成功：0。
- 失败：负值错误码。

#### 【功能描述】

动态切换 sensor 帧率。

#### 【注意事项】

- 该功能需要在 sensor lib 中实现回调 `dynamic_switch_fps`，否则无效。

### hbn_camera_read_register {#hbn_camera_read_register}

#### 【函数声明】

```c
int32_t hbn_camera_read_register(camera_handle_t cam_fd, camera_reg_type_t type, uint32_t reg_addr);
```

#### 【参数描述】

- [IN] `camera_handle_t cam_fd`：camera handle。
- [IN] `camera_reg_type_t type`：寄存器类型（`CAMERA_SENSOR_REG` / `CAMERA_EEPROM_REG`）。
- [IN] `uint32_t reg_addr`：寄存器地址，范围 [0x0, 0xFFFF]。

#### 【返回值】

- 成功：0。
- 失败：负值错误码。

#### 【功能描述】

读取 camera 寄存器的值。硬件信息在 `camera_config_t` 创建时配置，type 需适配所用 sensor。

#### 【注意事项】

- 无。

### hbn_camera_write_register {#hbn_camera_write_register}

#### 【函数声明】

```c
int32_t hbn_camera_write_register(camera_handle_t cam_fd, camera_reg_type_t type, uint32_t reg_addr, uint32_t reg_value);
```

#### 【参数描述】

- [IN] `camera_handle_t cam_fd`：camera handle。
- [IN] `camera_reg_type_t type`：寄存器类型（`CAMERA_SENSOR_REG` / `CAMERA_EEPROM_REG`）。
- [IN] `uint32_t reg_addr`：寄存器地址，范围 [0x0, 0xFFFF]。
- [IN] `uint32_t reg_value`：寄存器值，范围 [0x0, 0xFFFF]。

#### 【返回值】

- 成功：0。
- 失败：负值错误码。

#### 【功能描述】

写入 camera 寄存器的值。

#### 【注意事项】

- 无。

### hbn_camera_read_registers {#hbn_camera_read_registers}

#### 【函数声明】

```c
int32_t hbn_camera_read_registers(camera_handle_t cam_fd, camera_reg_type_t type,
                                   uint32_t *reg_addr, uint32_t *reg_value,
                                   uint32_t size_addr, uint32_t size_value);
```

#### 【参数描述】

- [IN] `camera_handle_t cam_fd`：camera handle。
- [IN] `camera_reg_type_t type`：寄存器类型。
- [IN] `uint32_t *reg_addr`：待读取寄存器地址数组。
- [OUT] `uint32_t *reg_value`：读取到的寄存器值数组。
- [IN] `uint32_t size_addr`：reg_addr 数组大小，0 表示 block 读取，>0 为地址个数，范围 [0, 64]。
- [IN] `uint32_t size_value`：reg_value 数组大小，0 不读取，>0 为读取个数，范围 [0, 64]。

#### 【返回值】

- 成功：0。
- 失败：负值错误码。

#### 【功能描述】

批量读取 camera 寄存器。

#### 【注意事项】

- 无。

### hbn_camera_write_registers {#hbn_camera_write_registers}

#### 【函数声明】

```c
int32_t hbn_camera_write_registers(camera_handle_t cam_fd, camera_reg_type_t type,
                                    uint32_t *reg_addr, uint32_t *reg_value,
                                    uint32_t *reg_hist, uint32_t acount, uint32_t vcount);
```

#### 【参数描述】

- [IN] `camera_handle_t cam_fd`：camera handle。
- [IN] `camera_reg_type_t type`：寄存器类型。
- [IN] `uint32_t *reg_addr`：待写入寄存器地址数组。
- [IN] `uint32_t *reg_value`：待写入寄存器值数组。
- [IN/OUT] `uint32_t *reg_hist`：历史值数组，用于比较与优化存储。
- [IN] `uint32_t acount`：reg_addr 数组大小，0 表示 block，>0 为地址个数。
- [IN] `uint32_t vcount`：reg_value 数组大小，0 不写入，>0 为写入个数。

#### 【返回值】

- 成功：0。
- 失败：负值错误码。

#### 【功能描述】

批量写入 camera 寄存器。

#### 【注意事项】

- 无。

### hbn_camera_parse_emb {#hbn_camera_parse_emb}

#### 【函数声明】

```c
int32_t hbn_camera_parse_emb(camera_handle_t cam_fd, char *embed_raw, struct embed_data_info_s *embed_info);
```

#### 【参数描述】

- [IN] `camera_handle_t cam_fd`：camera handle。
- [IN] `char *embed_raw`：待解析的 embedded raw 数据 buffer。
- [OUT] `struct embed_data_info_s *embed_info`：解析后输出的 embedded info 结构体。

#### 【返回值】

- 成功：0。
- 失败：负值错误码。

#### 【功能描述】

解析 embedded raw data 为 `embed_data_info_s` 结构体。

#### 【注意事项】

- 需 sensor lib 支持对应功能，否则无效。

### hbn_camera_update_ae_info {#hbn_camera_update_ae_info}

#### 【函数声明】

```c
int32_t hbn_camera_update_ae_info(camera_handle_t cam_fd, camera_ae_info_t *ae_info);
```

#### 【参数描述】

- [IN] `camera_handle_t cam_fd`：camera handle。
- [IN] `camera_ae_info_t *ae_info`：待更新的 ae 信息结构体。

#### 【返回值】

- 成功：0。
- 失败：负值错误码。

#### 【功能描述】

更新 ae 信息到 camera sensor 驱动。

#### 【注意事项】

- 需 sensor lib 支持对应功能，否则无效。

### hbn_camera_get_sns_info {#hbn_camera_get_sns_info}

#### 【函数声明】

```c
int32_t hbn_camera_get_sns_info(camera_handle_t cam_fd, camera_param_type_t type, cam_parameter_t *sp);
```

#### 【参数描述】

- [IN] `camera_handle_t cam_fd`：camera handle。
- [IN] `camera_param_type_t type`：参数类型（`CAMERA_SENSOR_PARAM` / `CAMERA_EEPROM_FULL_PARAM`）。
- [OUT] `cam_parameter_t *sp`：输出的 camera 参数结构体。

#### 【返回值】

- 成功：0。
- 失败：负值错误码。

#### 【功能描述】

获取 camera sensor 参数信息。基础参数来自 config，内部参数来自 eeprom 硬件。

#### 【注意事项】

- 需 sensor lib 支持对应功能，否则无效。

### hbn_camera_set_event_callback {#hbn_camera_set_event_callback}

#### 【函数声明】

```c
int32_t hbn_camera_set_event_callback(camera_handle_t cam_fd, void (*event_callback)(cam_event_t *fault_info));
```

#### 【参数描述】

- [IN] `camera_handle_t cam_fd`：camera handle。
- [IN] `void (*event_callback)(cam_event_t *fault_info)`：camera 事件回调函数指针。

#### 【返回值】

- 成功：0。
- 失败：负值错误码。

#### 【功能描述】

设置 camera 事件回调函数。

#### 【注意事项】

- 无。

### hbn_camera_get_status {#hbn_camera_get_status}

#### 【函数声明】

```c
int32_t hbn_camera_get_status(camera_handle_t cam_fd, camera_staus_t *status);
```

#### 【参数描述】

- [IN] `camera_handle_t cam_fd`：camera handle。
- [OUT] `camera_staus_t *status`：camera 运行状态结构体（init / start / link / recovery 等）。

#### 【返回值】

- 成功：0。
- 失败：负值错误码。

#### 【功能描述】

获取 camera 运行状态。

#### 【注意事项】

- 无。

### hbn_camera_get_version {#hbn_camera_get_version}

#### 【函数声明】

```c
int32_t hbn_camera_get_version(camera_handle_t cam_fd, camera_version_type_t type, char *name, char *version);
```

#### 【参数描述】

- [IN] `camera_handle_t cam_fd`：camera handle。
- [IN] `camera_version_type_t type`：库类型（`CAMERA_CAM_VERSION` / `CAMERA_TXSER_VERSION`）。
- [OUT] `char *name`：库名字符串 buffer，可为 NULL（忽略）。
- [OUT] `char *version`：库版本字符串 buffer，大小须大于 `CAMERA_VERSON_LEN_MAX`。

#### 【返回值】

- 成功：0。
- 失败：负值错误码。

#### 【功能描述】

获取 camera 库版本信息。

#### 【注意事项】

- 无。

### hbn_camera_get_handle {#hbn_camera_get_handle}

#### 【函数声明】

```c
camera_handle_t hbn_camera_get_handle(vpf_handle_t vin_fd, int32_t camera_port);
```

#### 【参数描述】

- [IN] `vpf_handle_t vin_fd`：vin handle，若已 attach 则据此获取；可为 NULL。
- [IN] `int32_t camera_port`：camera port index。

#### 【返回值】

- 成功：非 NULL（匹配到的 camera handle）。
- 失败：NULL（未找到）。

#### 【功能描述】

通过 vin handle 或 camera port index 获取对应的 camera handle。优先用 vin handle，无效时用 camera index。

#### 【注意事项】

- 无。

### hbn_camera_init_cfg {#hbn_camera_init_cfg}

#### 【函数声明】

```c
int32_t hbn_camera_init_cfg(const char *cfg_file);
```

#### 【参数描述】

- [IN] `const char *cfg_file`：camera 配置 json 文件路径，包含所有 camera 与 deserial 配置。

#### 【返回值】

- 成功：0。
- 失败：负值错误码。

#### 【功能描述】

通过 json 配置文件初始化 camera，自动创建 camera handle 和 deserial handle 并绑定。

#### 【注意事项】

- 该 API 通过解析 json 创建 camera，与 sample 中非 json 方式接口不同，详情咨询 FAE。

### hbn_deserial_create {#hbn_deserial_create}

#### 【函数声明】

```c
int32_t hbn_deserial_create(deserial_config_t *des_config, deserial_handle_t *des_fd);
```

#### 【参数描述】

- [IN] `deserial_config_t *des_config`：deserial 配置参数结构体指针。
- [OUT] `deserial_handle_t *des_fd`：根据配置创建的 deserial handle。

#### 【返回值】

- 成功：0。
- 失败：负值错误码。

#### 【功能描述】

根据传入的配置创建 deserial handle。

#### 【注意事项】

- 硬件上有解串器时才需要调用本接口。
- 会对 deserial 配置进行检查，超出范围会报错。
- 会对 deserial lib 进行检查，不符合 HBN 架构规范会报错。

### hbn_deserial_destroy {#hbn_deserial_destroy}

#### 【函数声明】

```c
int32_t hbn_deserial_destroy(deserial_handle_t des_fd);
```

#### 【参数描述】

- [IN] `deserial_handle_t des_fd`：deserial handle，由 `hbn_deserial_create` 创建。

#### 【返回值】

- 成功：0。
- 失败：负值错误码。

#### 【功能描述】

根据 deserial handle 销毁对应的软件资源。

#### 【注意事项】

- 需要与 `hbn_deserial_create` 成对使用。

### hbn_deserial_attach_to_vin {#hbn_deserial_attach_to_vin}

#### 【函数声明】

```c
int32_t hbn_deserial_attach_to_vin(deserial_handle_t des_fd, camera_des_link_t link, vpf_handle_t vin_fd);
```

#### 【参数描述】

- [IN] `deserial_handle_t des_fd`：deserial handle，由 `hbn_deserial_create` 创建。
- [IN] `camera_des_link_t link`：deserial 的 link 编号。
- [IN] `vpf_handle_t vin_fd`：要绑定到的 vin node handle。

#### 【返回值】

- 成功：0。
- 失败：负值错误码。

#### 【功能描述】

将 deserial 与 vin node 绑定。

#### 【注意事项】

- 硬件上带有解串器时，camera 与 deserial 绑定，deserial 与 vin node 绑定。

### hbn_deserial_detach_from_vin {#hbn_deserial_detach_from_vin}

#### 【函数声明】

```c
int32_t hbn_deserial_detach_from_vin(deserial_handle_t des_fd, camera_des_link_t link);
```

#### 【参数描述】

- [IN] `deserial_handle_t des_fd`：deserial handle，由 `hbn_deserial_create` 创建。
- [IN] `camera_des_link_t link`：deserial 的 link 编号。

#### 【返回值】

- 成功：0。
- 失败：负值错误码。

#### 【功能描述】

将 deserial 与 vin node 解绑。

#### 【注意事项】

- 需要与 `hbn_deserial_attach_to_vin` 成对使用。

### hbn_txser_create {#hbn_txser_create}

#### 【函数声明】

```c
int32_t hbn_txser_create(txser_config_t *txs_config, txser_handle_t *txs_fd);
```

#### 【参数描述】

- [IN] `txser_config_t *txs_config`：tx serial 配置参数结构体指针。
- [OUT] `txser_handle_t *txs_fd`：根据配置创建的 tx serial handle。

#### 【返回值】

- 成功：0。
- 失败：负值错误码。

#### 【功能描述】

根据传入的配置创建串行器 txser handle。

#### 【注意事项】

- 硬件上有串行器时才需要调用本接口。
- 会对 txser 配置进行检查，超出范围会报错。
- 会对 txser lib 进行检查，不符合 HBN 架构规范会报错。

### hbn_txser_destroy {#hbn_txser_destroy}

#### 【函数声明】

```c
int32_t hbn_txser_destroy(txser_handle_t txs_fd);
```

#### 【参数描述】

- [IN] `txser_handle_t txs_fd`：tx serial handle，由 `hbn_txser_create` 创建。

#### 【返回值】

- 成功：0。
- 失败：负值错误码。

#### 【功能描述】

根据 tx serial handle 销毁对应的软件资源。

#### 【注意事项】

- 需要与 `hbn_txser_create` 成对使用。

### hbn_txser_attach_to_vin {#hbn_txser_attach_to_vin}

#### 【函数声明】

```c
int32_t hbn_txser_attach_to_vin(txser_handle_t txs_fd, camera_txs_csi_t csi, vpf_handle_t vin_fd);
```

#### 【参数描述】

- [IN] `txser_handle_t txs_fd`：tx serial handle，由 `hbn_txser_create` 创建。
- [IN] `camera_txs_csi_t csi`：tx csi index。
- [IN] `vpf_handle_t vin_fd`：要绑定到的 vin node handle。

#### 【返回值】

- 成功：0。
- 失败：负值错误码。

#### 【功能描述】

将 tx serial 与 vin node 绑定。

#### 【注意事项】

- 硬件上有串行器时才需要调用本接口。
- 会对 txser 硬件进行初始化。
- 硬件上带有串行器时，camera 与 txser 绑定，txser 与 vin node 绑定。

### hbn_txser_detach_from_vin {#hbn_txser_detach_from_vin}

#### 【函数声明】

```c
int32_t hbn_txser_detach_from_vin(txser_handle_t txs_fd, camera_txs_csi_t csi);
```

#### 【参数描述】

- [IN] `txser_handle_t txs_fd`：tx serial handle，由 `hbn_txser_create` 创建。
- [IN] `camera_txs_csi_t csi`：tx csi index。

#### 【返回值】

- 成功：0。
- 失败：负值错误码。

#### 【功能描述】

将 tx serial 与 vin node 解绑。

#### 【注意事项】

- 需要与 `hbn_txser_attach_to_vin` 成对使用。

## 数据结构

### camera_config_t {#camera_config_t}

camera 配置结构体，用于 `hbn_camera_create`（源自板端 `hb_camera_data_config.h`）。

| 名称 | 类型 | 最小值 | 最大值 | 默认值 | 含义 | 必选 |
|---|---|---|---|---|---|---|
| name | char[CAMERA_MODULE_NAME_LEN] | - | CAMERA_MODULE_NAME_LEN(108) | - | camera 模组名称，需与 sensor lib 名称对应（如驱动 `libsc1330t.so`，name 为 `sc1330t`） | 是 |
| addr | uint32_t | 0x00 | 0x7f | 0x00 | sensor 设备地址，一般为 i2c 7 位地址 | 是 |
| isp_addr | uint32_t | 0x00 | 0x7f | 0x00 | isp 设备地址（如有） | 否 |
| eeprom_addr | uint32_t | 0x00 | 0x7f | 0x00 | eeprom 设备地址（内参，如有） | 否 |
| serial_addr | uint32_t | 0x00 | 0x7f | 0x00 | serdes 设备地址（如有） | 否 |
| sensor_mode | uint32_t | 1 | 6 | 1 | sensor 工作模式：1=NORMAL_M(linear)；2=DOL2_M(hdr2合1)；3=DOL3_M(hdr3合1)；4=DOL4_M(hdr4合1)；5=PWL_M(hdr内部合成)；6=SLAVE_M(需外部 trigger) | 是 |
| sensor_clk | uint32_t | - | - | 0x00 | sensor clk 时钟配置，目前未生效，备用 | 否 |
| gpio_enable | uint32_t | 0 | 0xFFFFFFFF | 0 | GPIO 操作使能（bit 索引自 VCON），按 bit 使能 gpio 控制 sensor 上下电引脚（如 XSHUTDN），0 不使用 | 是 |
| gpio_level | uint32_t | 0 | 1 | 0 | GPIO 工作电平，按 bit 配置：0=先低后高；1=先高后低。需按 sensor spec 上电时序自定义 | 是 |
| bus_select | uint32_t | 0 | 6 | 0 | sensor i2c number 选择，建议在 dts 配置，此处可省 | 否 |
| bus_timeout | uint32_t | 0 | - | 0 | i2c timeout 配置，配置了 bus_select 才需配 | 否 |
| fps | uint32_t | 0 | 120 | 0 | sensor 帧率 | 是 |
| width | uint32_t | 0 | 8192 | 0 | sensor 出图宽度（pixel） | 是 |
| height | uint32_t | 0 | 4096 | 0 | sensor 出图高度（pixel） | 是 |
| format | uint32_t | - | - | - | sensor 数据类型：RAW8=0x2A；RAW10=0x2B；RAW12=0x2C；YUV422 8-bit=0x1E | 是 |
| flags | uint32_t | 0 | - | 0 | 可选功能：诊断、恢复、debug 等 | 否 |
| extra_mode | uint32_t | 0 | - | 0 | sensor 库内部定制配置，多用于区分模组与功能开关 | 是 |
| config_index | uint32_t | 0 | - | 0 | sensor 库内部定制配置，多用于区分模组与功能开关 | 是 |
| ts_compensate | int32_t | 0 | - | 0 | 时间戳补偿配置 | 否 |
| mipi_cfg | mipi_config_t * | - | - | - | MIPI 配置指针，NULL 时自动从 sensor 驱动 `get_csi_attr` 获取 | 是 |
| calib_lname | char[CAMERA_MODULE_NAME_LEN] | - | - | - | sensor 效果库路径，默认 `/usr/hobot/lib/sensor`，支持自定义路径（总长 ≤100 字节） | 是 |
| sensor_param | char * | - | - | - | sensor 自定义数据指针 | 否 |
| iparam_mode | uint32_t | - | - | - | 预留，备用 | 否 |
| end_flag | uint32_t | - | - | - | 结构体结束标志 | 否 |

### deserial_config_t {#deserial_config_t}

deserial 配置结构体，用于 `hbn_deserial_create`。

| 名称 | 类型 | 最小值 | 最大值 | 默认值 | 含义 | 必选 |
|---|---|---|---|---|---|---|
| name | char[CAMERA_MODULE_NAME_LEN] | - | - | - | deserial 名称，如 `max9296` | 是 |
| addr | uint32_t | 0 | - | - | deserial 设备地址 | 是 |
| gpio_enable_bit | uint32_t | 0 | - | - | GPIO 操作使能位（索引自 VCON） | 是 |
| gpio_level_bit | uint32_t | 0 | - | - | GPIO 工作状态位 | 是 |
| gpio_mfp | uint8_t[CAMERA_DES_GPIO_MAX] | 0 | CAMERA_DES_GPIO_MAX | 0x0 | MFP 的 GPIO 功能选择 | 是 |
| bus_select | uint32_t | 0 | - | - | i2c 总线选择（索引自 VCON） | 是 |
| bus_timeout | uint32_t | 0 | - | - | i2c 超时（毫秒） | 是 |
| lane_mode | uint32_t | 0 | - | - | PHY 的 lane 模式选择 | 是 |
| lane_speed | uint32_t | 0 | - | - | PHY 的 lane 速率 | 是 |
| link_map | uint32_t | 0 | - | - | link 与 CSI/VC 的映射关系 | 是 |
| link_desp | char[CAMERA_DES_LINKMAX][CAMERA_DES_PORTDESP_LEN] | - | - | - | 各 link 连接模组的配置描述，用于多进程 | 是 |
| reset_delay | uint32_t | 0 | - | - | reset 延迟（毫秒） | 是 |
| flags | uint32_t | 0 | - | - | 可选功能标志：诊断、调试等 | 否 |
| poc_cfg | poc_config_t * | - | - | NULL | POC 配置指针，NULL 无 POC 功能 | 否 |
| mipi_cfg | mipi_config_t * | - | - | NULL | MIPI 配置指针，NULL 自动获取 | 否 |
| deserial_param | char * | - | - | NULL | deserial 自定义数据指针 | 否 |
| end_flag | uint32_t | 0 | 0xFFFFFFFF | - | 结构体结束标志 | 是 |

### poc_config_t {#poc_config_t}

POC 配置结构体，作为 `deserial_config_t.poc_cfg` 使用。

| 名称 | 类型 | 最小值 | 最大值 | 默认值 | 含义 | 必选 |
|---|---|---|---|---|---|---|
| name | char[CAMERA_MODULE_NAME_LEN] | - | - | - | POC 名称，如 `max20087` | 是 |
| addr | uint32_t | 0 | - | - | POC 设备地址 | 是 |
| gpio_enable_bit | uint32_t | 0 | - | - | GPIO 操作使能位（索引自 VCON） | 是 |
| gpio_level_bit | uint32_t | 0 | - | - | GPIO 工作状态位 | 是 |
| poc_map | uint32_t | 0 | - | - | POC 与 link 的映射关系 | 是 |
| power_delay | uint32_t | 0 | - | - | POC 开关延迟（毫秒） | 是 |
| end_flag | uint32_t | 0 | 0xFFFFFFFF | - | 结构体结束标志 | 是 |

### handle 类型

| 类型 | 定义 | 含义 |
|---|---|---|
| camera_handle_t | int64_t | camera 操作 handle，由 `hbn_camera_create` 返回 |
| deserial_handle_t | int64_t | deserial handle，由 `hbn_deserial_create` 返回 |
| txser_handle_t | int64_t | tx serial handle，由 `hbn_txser_create` 返回 |

## 返回值说明 {#返回值说明}

Camera/deserial/txser 接口返回 `int32_t`，0 为成功，负值为错误码。常用错误码：

| 错误码 | 宏定义 | 描述 | 常见原因 |
|---|---|---|---|
| 0 | HBN_STATUS_SUCESS | 成功 | - |
| 2 | HBN_STATUS_INVALID_NODETYPE | vnode 类型无效 | 打开 VIN 时类型应为 HB_VIN |
| 3 | HBN_STATUS_INVALID_HWID | 无效硬件 id | VIN hw_id 取值见 [VIN 平台规格](./04_vin_api.md) |
| 8 | HBN_STATUS_INVALID_NULL_PTR | 空指针 | config / handle 指针为空 |
| 9 | HBN_STATUS_INVALID_PARAMETER | 无效参数 | 配置/版本检查失败 |
| 21 | HBN_STATUS_TIMEOUT | 超时 | i2c / sensor 响应超时 |
| 25 | HBN_STATUS_NOMEM | 内存不足 | 资源申请失败 |

通用 HBN 错误码全集见 [HBN 框架](./01_hbn_api.md) 返回值说明。

## 相关文档

- [视频输入 - VIN](./04_vin_api.md)（VIN node、平台规格）
- [HBN 框架](./01_hbn_api.md)（vnode/vflow、返回值）
- [系统概述](./00_system_overview.md)（MIPI RX/CIM 通路）
- 简易 API：[VIO](/Simple_API/multimedia_api/cdev/vio_api)
