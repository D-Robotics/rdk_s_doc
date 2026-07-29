# sample_camera_diag 使用说明

## 功能概述

`sample_camera_diag` 演示 Camera 诊断（CAM_DIAG）事件回调流程：初始化 Camera / VIN（Serdes 场景下还会创建解串器），通过 `hbn_camera_set_event_callback` 注册回调，再使用 libcam 提供的故障注入接口制造异常，并在 callback 中打印诊断事件。

示例可覆盖以下设备类型的 diag 节点：

| 类型 | 含义 | 典型 diag_id | 典型 module_id |
| ---- | ---- | ------------ | -------------- |
| snr  | Sensor | `0x40xxxxxx` | `0xc00x` |
| des  | 解串器（Deserializer） | `0x1xxxxxxx` | `0xc01x` |
| poc  | POC 电源 | `0x2xxxxxxx` | `0xc02x` |
| ser  | 串行器（Serializer） | `0x3xxxxxxx` | `0xc03x` |
| txs  | Tx Serializer | `0x5xxxxxxx` | `0xc04x` |

:::info 说明
故障注入为测试手段，用于验证诊断链路与事件回调。callback 中 `status=1` 表示上报了故障态事件，不代表传感器硬件本身损坏。
:::

### sample_camera_diag 架构说明

`sample_camera_diag` 示例位于 `/app/multimedia_samples/sample_camera_diag` 下，子目录描述如下：

| 目录 | 描述 |
| ---- | ---- |
| [camera_event_callback](#camera_event_callback) | 注册 camera event callback，注入 diag 故障并打印回调 |

## camera_event_callback

### 代码位置及目录结构

`camera_event_callback` 相关源码路径为 `/app/multimedia_samples/sample_camera_diag/camera_event_callback`，代码结构如下：

```shell
── camera_event_callback
   ├── camera_event_callback.c
   └── Makefile
```

- Makefile：用于编译程序的 Makefile 文件。
- camera_event_callback.c：程序的主要源代码文件。

### 前置条件

示例依赖板端 Camera 诊断功能已开启。若当前镜像中 sensor / deserial 插件未编译 `CAM_DIAG`，会出现“无 snr/des/poc 节点”或注入后无回调的情况。

在源码树 `hobot-camera` 中开启诊断的典型方式：

1. 在 `drivers/sensor/Makefile` 与 `drivers/deserial/Makefile` 中增加：

```makefile
CFLAGS += -DCAM_DIAG
```

2. 确认目标 sensor 驱动中 diag 相关代码为 `#ifdef CAM_DIAG`（而不是 `#if 0`），并正确挂接 `.diag_nodes_init`。

3. 重新编译并安装 `hobot-camera`、`hobot-multimedia-samples` deb 包后，再在板端运行示例。

### 编译

在源码路径下执行 `make` 命令即可完成编译：

```Shell
cd /app/multimedia_samples/sample_camera_diag/camera_event_callback
make
```

### 运行

#### 程序运行方法

直接执行程序 `./camera_event_callback -h` 可以获得帮助信息和支持的 Camera Sensor 列表。

#### 程序参数选项说明

```shell
root@ubuntu:/app/multimedia_samples/sample_camera_diag/camera_event_callback# ./camera_event_callback -h
Usage: camera_event_callback [OPTIONS]
Options:
  -s <sensor_index>      Specify sensor index
  -l <link_port>         Serdes link port: 0:A 1:B 2:C 3:D
  -d <diag_id>           Inject specified diag id (hex), default auto
  -t <type>              Filter diag by device type (list/inject)
                         des|poc|ser|snr|txs, default all types
  -w <seconds>           Max wait time for callback, default 20
  -h                     Show this help message
```

**命令参数说明：**

- `s <sensor_index>`：指定要使用的传感器索引，可通过 `-h` 查看传感器列表。
- `l <link_port>`：指定 Serdes Sensor 连接解串器的端口，`0:A 1:B 2:C 3:D`。Serdes Sensor **必须**指定。
- `d <diag_id>`：指定要注入的 diag id（支持十六进制，如 `0x401031`）。不指定时由程序从 diag dump 中自动选择可用节点。
- `t <type>`：按设备类型过滤节点列表与注入范围。可选：`des` / `poc` / `ser` / `snr` / `txs`。不加 `-t` 时显示并尝试全部类型。
- `w <seconds>`：未收到回调时的额外等待时间，默认 20 秒。
- `h`：显示帮助信息。

:::caution 注意
`-l` 的取值取决于 Serdes Sensor 实际接到解串器的端口，请与硬件连接保持一致。
:::

#### 推荐测试命令

以下以 `ar0820std-1080p30`（示例中 index 为 `3`，请以板端 `-h` 列表为准）为例：

```shell
# 列出全部类型节点，并自动注入第一个可用节点
./camera_event_callback -s 3 -l 0

# 只测试 Sensor diag
./camera_event_callback -s 3 -l 0 -t snr

# 只测试解串器 diag
./camera_event_callback -s 3 -l 0 -t des

# 只测试 POC diag
./camera_event_callback -s 3 -l 0 -t poc
```

:::tip 提示
部分 Sensor（如 ar0820std 部分配置）可能不注册 snr 节点，但 des / poc 仍可用。若需验证 Sensor diag，可换用已启用 snr diag 的 Sensor（如 ovx3cstd、isx031std）。
:::

### 运行效果

下文运行日志基于 `ar0820std-1080p30`，命令为 `./camera_event_callback -s 3 -l 0 ...`。

#### 测试 Sensor diag（`-t snr`）

```shell
root@ubuntu:/app/multimedia_samples/sample_camera_diag/camera_event_callback# ./camera_event_callback -s 3 -l 0 -t snr
[camera_event_callback]: sensor_index=3 name=ar0820std-1080p30 config=linear_1920x1080_yuv_30fps_1lane.c
[camera_event_callback]: hbn_camera_set_event_callback registered
[camera_event_callback]: hbn_camera_start ok
[camera_event_callback]: wait 5 seconds for diag monitor ready ...
[camera_event_callback]: prepare diag inject ...
[camera_event_callback]: diag nodes (type=snr):
[camera_event_callback]: no diag node for type snr
[camera_event_callback]: fault inject finished without callback
[camera_event_callback]: extra wait up to 20 seconds ...
[camera_event_callback]: done, total callback count=0
```

该配置下 **没有 snr 节点**，因此不会触发 sensor 故障回调。若需验证 snr，请换用已注册 sensor diag 的模组。

#### 测试解串器 diag（`-t des`）

```shell
root@ubuntu:/app/multimedia_samples/sample_camera_diag/camera_event_callback# ./camera_event_callback -s 3 -l 0 -t des
[camera_event_callback]: sensor_index=3 name=ar0820std-1080p30 config=linear_1920x1080_yuv_30fps_1lane.c
[camera_event_callback]: hbn_camera_set_event_callback registered
[camera_event_callback]: hbn_camera_start ok
[camera_event_callback]: wait 5 seconds for diag monitor ready ...
[camera_event_callback]: prepare diag inject ...
[camera_event_callback]: diag nodes (type=des):
[camera_event_callback]:   0x00141011 type=des valid=1 status=0x0
[camera_event_callback]:   0x00142011 type=des valid=1 status=0x0
...
[camera_event_callback]: listed 34 node(s) / 54 total
[camera_event_callback]: try diag node 0x141011 type=des valid=1
[camera_event_callback]: inject diag_id=0x141011 hard ret=0
[camera_event_callback]: hard inject from dump, wait up to 2 seconds ...
[camera_event_callback]: event callback received: port=0 type=diag module_id=0xc011 event_id=0x0041 status=1
[camera_event_callback]: event callback received: port=0 type=diag module_id=0xc019 event_id=0x004f status=1
[camera_event_callback]: event callback received: port=0 type=diag module_id=0xc012 event_id=0x0041 status=1
[camera_event_callback]: event callback received: port=0 type=diag module_id=0xc015 event_id=0x0041 status=1
[camera_event_callback]: done, total callback count=4
```

关键日志说明：

| 日志 | 含义 |
| ---- | ---- |
| `hbn_camera_set_event_callback registered` | 事件回调注册成功 |
| `listed 34 node(s) / 54 total` | 过滤后有 34 个 des 节点，全量共 54 个 |
| `inject ... hard ret=0` | 硬注入成功 |
| `module_id=0xc011/0xc012/... status=1` | 收到解串器域诊断故障事件 |
| `total callback count=4` | 一次注入可能触发多条 callback，属正常 |

#### 测试 POC diag（`-t poc`）

```shell
root@ubuntu:/app/multimedia_samples/sample_camera_diag/camera_event_callback# ./camera_event_callback -s 3 -l 0 -t poc
[camera_event_callback]: sensor_index=3 name=ar0820std-1080p30 config=linear_1920x1080_yuv_30fps_1lane.c
[camera_event_callback]: hbn_camera_set_event_callback registered
[camera_event_callback]: hbn_camera_start ok
[camera_event_callback]: wait 5 seconds for diag monitor ready ...
[camera_event_callback]: prepare diag inject ...
[camera_event_callback]: diag nodes (type=poc):
[camera_event_callback]:   0x00240044 type=poc valid=1 status=0x0
...
[camera_event_callback]: listed 20 node(s) / 54 total
[camera_event_callback]: try diag node 0x240044 type=poc valid=1
[camera_event_callback]: inject diag_id=0x240044 hard failed, ret=-65559
[camera_event_callback]: soft inject diag_id=0x240044 ok
[camera_event_callback]: soft inject from dump, wait up to 3 seconds ...
[camera_event_callback]: event callback received: port=0 type=diag module_id=0xc024 event_id=0x0040 status=1
[camera_event_callback]: done, total callback count=1
```

部分 POC 节点不支持硬注入（`hard failed, ret=-65559`），程序会自动尝试 soft inject；收到 `module_id=0xc024`、`status=1` 的 callback，即可认为 POC 诊断链路正常。

#### 不加 `-t`（全部类型）

```shell
root@ubuntu:/app/multimedia_samples/sample_camera_diag/camera_event_callback# ./camera_event_callback -s 3 -l 0
[camera_event_callback]: sensor_index=3 name=ar0820std-1080p30 config=linear_1920x1080_yuv_30fps_1lane.c
[camera_event_callback]: hbn_camera_set_event_callback registered
[camera_event_callback]: hbn_camera_start ok
[camera_event_callback]: wait 5 seconds for diag monitor ready ...
[camera_event_callback]: prepare diag inject ...
[camera_event_callback]: diag nodes (all types):
[camera_event_callback]:   0x00141011 type=des valid=1 status=0x0
...
[camera_event_callback]:   0x00244034 type=poc valid=1 status=0x0
[camera_event_callback]: listed 54 node(s) / 54 total
[camera_event_callback]: try diag node 0x141011 type=des valid=1
[camera_event_callback]: inject diag_id=0x141011 hard ret=0
[camera_event_callback]: hard inject from dump, wait up to 2 seconds ...
[camera_event_callback]: event callback received: port=0 type=diag module_id=0xc011 event_id=0x0041 status=1
[camera_event_callback]: event callback received: port=0 type=diag module_id=0xc019 event_id=0x004f status=1
[camera_event_callback]: event callback received: port=0 type=diag module_id=0xc012 event_id=0x0041 status=1
[camera_event_callback]: event callback received: port=0 type=diag module_id=0xc015 event_id=0x0041 status=1
[camera_event_callback]: done, total callback count=4
```

不加 `-t` 时会列出全部节点（本例 54 = 34 des + 20 poc，无 snr），并按 dump 顺序注入第一个 `valid=1` 节点（通常先命中 des）。若要分别验证，请使用 `-t snr` / `-t des` / `-t poc`。

### 常见问题

#### 1. `no diag node for type snr`

**可能原因：**

- 当前 Sensor 配置本身不注册 snr 节点（如部分 ar0820std 配置）
- sensor 插件未开启 `-DCAM_DIAG`，或驱动中 diag 代码被 `#if 0` 关闭

**处理方法：**

- 验证 des / poc 是否正常（用于确认 CAM_DIAG 框架已启用）
- 换用已启用 snr diag 的 Sensor（如 ovx3cstd、isx031std）
- 检查对应 sensor 驱动是否 `#ifdef CAM_DIAG` 并挂接 `diag_nodes_init`

#### 2. 有节点但 `callback count=0`

**可能原因：**

- 注入的节点 `valid=0`
- 指定的 `-d` 与当前配置不匹配
- diag monitor 尚未就绪（可适当增大 `-w`）

**处理方法：**

- 先不加 `-d`，让程序自动选择 `valid=1` 节点
- 确认日志中存在 `hbn_camera_start ok` 与等待 diag 就绪的提示

#### 3. POC 硬注入失败但 soft 成功

部分 POC 节点不支持硬注入（返回 `-65559`），示例会自动回退到 soft inject。只要 soft inject 后收到 callback，即可认为 POC 链路正常。
