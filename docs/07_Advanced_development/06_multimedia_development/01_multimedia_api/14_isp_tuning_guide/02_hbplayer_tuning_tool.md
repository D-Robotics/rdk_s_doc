---
sidebar_position: 2
title: "hbplayer 和 tuning_tool 工具使用指南"
description: "RDK S100/S600 hbplayer 和 tuning_tool 工具使用指南"
---

# hbplayer 和 tuning_tool 工具使用指南

## hbplayer

hbplayer 是一个 Windows 应用程序，通过 HTTP 协议向主机发送请求并获取板端传输的图像数据。此应用程序的主要功能包含：

- 图像数据的实时显示
- 图像数据离线显示分析

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/isp/hbplayer_main.png" alt="hbplayer 主界面" style={{ width: '100%', maxWidth: '800px', height: 'auto', display: 'block', margin: '0 auto' }} />

### hbplayer 安装及配置

**安装**：

> S100/S600 的 hbplayer 版本号与安装包路径待确认（板端只查到 `libhbplayer.so.1.0.1`，PC 工具在 SDK 交付包 `software_tools/hobotplayer` 目录下）。X5 侧版本为 v3.4.4（`x5_hbplayer_v3.4.4.zip`），此处沿用 X5 的安装流程：

从 SDK 交付包的 `software_tools/hobotplayer` 目录获取 hbplayer 压缩包，解压后进入解压路径，双击运行 `out` 目录下的 `hbplayer.exe` 即可打开主页面：

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/isp/dir_list.png" alt="hbplayer 解压目录" style={{ width: '100%', maxWidth: '800px', height: 'auto', display: 'block', margin: '0 auto' }} />

**网络配置**：

点击左上角图标，在 `dynamic_init_config` 对话框中输入板端 IP 地址。板端 IP 可通过在板端执行 `ifconfig` 查看，填写到 `dynamic_init_config` 输入框后点击 Apply 完成客户端 IP 配置。

### hbplayer 主界面

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/isp/hbplayer_main2.png" alt="hbplayer 主界面" style={{ width: '100%', maxWidth: '1000px', height: 'auto', display: 'block', margin: '0 auto' }} />

| 编号 | 说明 | 备注 |
| --- | --- | --- |
| 1 | 设备 IP 和端口号 | 端口号一般情况下不修改 |
| 2 | 设置 online 模式 raw 的 pack 方式 | NA |
| 3 | 配置 raw 图 msb/lsb 类型 | msb 为高位对齐，lsb 为低位对齐 |
| 4 | 打开配置页面 | NA |
| 5 | 网络传输链接/断开链接 | dynamic-displayer 模式下，连接板侧 server |
| 6 | 查看 raw 图，最多支持 dol4 | 传输 RAW 时可用 |
| 7 | 保存 raw/yuv 图像信息 | 先设置保存的数量，再点击 enable |
| 8 | 保存 yuv 图像信息为 bmp/jpg | 该项支持单张图像保存，格式转换使用 opencv |
| 9 | 配置信息保存 | 配置信息保存后才可以生效 |
| 10 | raw_type 类型 | 支持不同 pattern 的 rggb 格式 |

### hbplayer 静态图像查看功能

hbplayer 工具支持多种格式（raw/yuv/bmp/jpg）的静态图像查看，并提供便捷的参数配置与操作功能。

操作步骤：

1. **选择功能模块**：点击图标 `static-display` 进入静态图像查看功能界面。
2. **配置图像参数**：点击图标 `fileconfig` 进行参数配置，根据需要填写图像的具体参数（例如分辨率、格式等），完成后点击 Apply 保存配置。
3. **选择并显示图像**：点击图标选择要查看的图像文件，图像即会显示在界面中。
4. **图像缩放**：查看图像时可按 Ctrl + 滚轮对图像进行放大或缩小。

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/isp/hbplayer_static_config.png" alt="hbplayer 静态图像查看界面" style={{ width: '100%', maxWidth: '1000px', height: 'auto', display: 'block', margin: '0 auto' }} />

| 编号 | 说明 | 备注 |
| --- | --- | --- |
| 1 | 切换静态图像显示/动态传输显示 | static-display 模式支持静态图像，dynamic-display 模式支持显示数据流 |
| 2 | 配置打开图像的信息 | 只支持框体中可选择的项，图像信息与实际图像不符会显示异常 |
| 3 | 显示图像的大小信息 | 打开需要显示的文件 |

图像参数配置说明：

| 参数 | 说明 |
| --- | --- |
| pic_type | 设置需要打开的图像类型 |
| raw_type | 设置 raw 图是 pack 还是 unpack 类型（unpack 以 uint16_t 保存一个 pixel） |
| yuv_type | yuv_nv12 |
| width | 图像宽度 |
| height | 图像高度 |
| stride | pic_raw 时使用，用于 pic_raw 每行后若干 nop 字符填充 |

> raw/yuv 图像查看时，必须正确配置图像参数（宽度、高度、像素格式等），参数错误将导致图像无法正确打开或显示异常。使用 raw preview 或 save_raw 功能时，需确保 tuning_tool 已发送 raw 数据，并在 hbplayer 端启用 raw_en。

### hbplayer 图像显示调整

hbplayer 查看静态图像时支持简单的图像显示调整功能。点击图标打开 calculation 显示并输入相应的参数，点击 enable 即可对图像进行简单调整。

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/isp/hbplayer_cal.png" alt="hbplayer 图像显示调整" style={{ width: '100%', maxWidth: '800px', height: 'auto', display: 'block', margin: '0 auto' }} />

> 通过鼠标滚轮或 zoom 窗口可实现图像缩放，建议放大倍数不超过 10 倍，否则图像缩放处理会变慢。

### hbplayer FV 曲线功能

该功能用于获取马达位置内的 FV 值，绘制 FV-pos 曲线，需配合 tuning_tool 使用。

- `min focal` 和 `max focal` 分别对应马达的最小值与最大值；`step` 为 min/max focal 之间每次采样运动的间隔，配置完成后点击 Run 即可显示对应区域内的 FV 曲线。
- `Fit` 为曲线适应窗口显示按钮，每次点击后曲线适应窗口。
- `grid_h`/`grid_v` 分别对应水平和垂直方向的网格数量，配置后点击 grid_on 即可在主界面显示网格，可对应 AFMV3 功能。
- `AFMWin ON` 对应 AFMV1 的窗口，点击后可在主界面显示窗口在图像中对应的位置。

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/isp/hbplayer_fv.png" alt="hbplayer FV 曲线功能" style={{ width: '100%', maxWidth: '1000px', height: 'auto', display: 'block', margin: '0 auto' }} />

### dump 文件名称说明

以 raw 数据为例，dump 下来的文件名如 `2026291611170_1_wxh_1920x1080_s_3840_f_445_p_0_c_031.raw`：

- `2026291611170`：时间信息
- `1`：格式信息，1 对应 raw 格式
- `1920x1080`：尺寸
- `s_3840`：stride
- `f_445`：frameid
- `p_0`：pipe id
- `c_0`：channel id
- `31`：dump 文件的累计个数

另外，dol 模式下 tuning_tool 使用 channel id 作为区分长短帧，可通过 `c_x` 标识进行区分。

## tuning_tool

该程序主要为调试图像质量而开发，所以数据流只跑到 ISP，并且默认跑 SIF passthrough ISP 模式。板端脚本位置 `/app/tuning_tool/scripts/run_tuning.sh`（配合同目录的 `tuning_menu.sh` 菜单），可执行程序 `/app/tuning_tool/bin/tuning_bin`，源码在 `source/hobot-camera/tuning_tool/`。建议通过 ssh 窗口运行，否则打印太多、不易分辨 tuning_tool 的输出。

### 运行方法

tuning_tool 有两个入口：菜单式脚本 `run_tuning.sh`（日常使用）和底层程序 `tuning_bin`（脚本最终调用它，参数更全）。

#### 菜单式脚本 run_tuning.sh

直接执行 `run_tuning.sh -h` 可以获得帮助信息：

```text
run_tuning.sh [.sh] [#] [r#] [g#] [G#] [D#] [E] [a] [x#] [n] [-h]
  .sh      -- case menu files, default as tuning_menu.sh
  #        -- menu select index list
  r#       -- runtime seconds
  g#       -- userspace loglevel
  G#       -- kernel loglevel
  D#       -- isp dump(-M 8 -D 1): cnt default
  a        -- run with yuv+raw16(A for yuv+raw12, a# for oth fmt) for hbplayer
  E        -- enable ae_info for isp feedback
  x#       -- show all support items as depth
  n        -- not run, only show info
  -h       -- show this help tips
```

> 注：help 文本里的 `D#` 实际按小写 `d#` 解析、`a` 实际按 `a#` 解析；`E` 在 help 里写作 ae_info，但实际 `E#` 对应 hobotplayer 推流、`b#`/`B#` 才对应 ae_info。

运行脚本进入菜单交互：逐级列出各 sensor 及其 module / res case，输入数字选择、回车选默认项（`@` 标记）、`b` 返回上一级、`q` 退出。

脚本常用参数：

- `#`：菜单选择序号，可逗号分隔多选，也可直接传序号跳过交互（如 `./run_tuning.sh 4 1 r8`）。
- `r#`：运行时长（秒），配合 `timeout` 跑固定时长。
- `g#` / `G#`：userspace / kernel 日志等级，排查问题时调高打印。
- `a#`：以 yuv+raw16 输出给 hbplayer（`A` 为 yuv+raw12），配合 hbplayer 预览并采集 raw。
- `E#` / `e#`：使能 yuv / raw hbplayer 推流。
- `n`：不运行，仅显示信息。

其余脚本参数（`d#`、`b#`/`B#`、`z#`/`Z#`、`y#`/`Y#`、`x#`）会透传给底层 `tuning_bin`，含义见下。

典型用法：

```sh
# 菜单交互式运行
cd /app/tuning_tool/scripts && ./run_tuning.sh

# 直接传菜单序号（第 4 项选 sensor，第 1 项选 module/res，跑 8 秒）
timeout 20 ./run_tuning.sh 4 1 r8
```

运行成功时，内核日志里能看到传感器识别和出流统计，例如：

- 传感器识别：`[SENSOR0]: imx219 release i2c5@0x10`（传感器在 bus5 正确识别并出流）
- 出流统计：`cim_subdev_stop statistics: fs 245 fe 245 of 0 se 0`（8 秒 245 帧 ≈ 30fps，无溢出无错误）
- hbplayer 推流：`start_hbplayer_thread start success`、`create a listener, port is 10086`、`start_dump_server_thread start success`

#### 底层程序 tuning_bin

绕过菜单直接调用 `tuning_bin`，例如关闭 hbplayer 推流做纯出流验证：

```sh
timeout 20 /app/tuning_tool/bin/tuning_bin -m 1 \
  -v /app/tuning_tool/cfg/matrix/tuning_imx219_cim_isp_1080p/vpm_config.json -p 0 \
  -c /app/tuning_tool/cfg/matrix/tuning_imx219_cim_isp_1080p/hb_superdev.json \
  -i 0 -r 8 -E 0 -e 0 -y 0
```

`tuning_bin` 参数：

| 参数 | 说明 |
| --- | --- |
| `-m` | work mode：`1` = sensor（实采 sensor 出流，默认）；`2` = feedback（回灌 raw 文件离线调试，无需接传感器） |
| `-v <path>` | vpm pipeline 配置（`vpm_config.json`）路径 |
| `-p <id>` | pipeline id，对应 `vpm_config.json` 里的 `pipelineN` |
| `-c <path>` | sensor 配置（`hb_superdev.json`）路径 |
| `-i <id>` | 逻辑相机号，对应 `hb_superdev.json` 里的 `port_N` |
| `-r <s>` | 运行时长（秒） |
| `-E <0/1>` | 使能 hobotplayer 推流，配合 PC 端 hbplayer 实时预览 yuv |
| `-e <0/1>` | 使能 raw hobotplayer 推流，配合 hbplayer 查看 raw |
| `-y <0/1>` | 获取 YNR 之后的 yuv，查看降噪后的效果 |
| `-b` / `-B` | 获取 / 设置 ae_info |
| `-z` / `-Z` | 获取 / 设置 context |
| `-n <path>` | raw / context 文件路径 |
| `-F <1/2/3>` | feedback raw 格式：1 = raw8，2 = raw12，3 = raw16 |
| `-l <count>` | feedback 模式循环次数 |
| `-d <count>` | dump 计数（scanf 前） |

### 菜单项

`tuning_menu.sh` 按 sensor 定义菜单项（`ITEM_*`），每个 sensor 下是若干 module（处理模式）和 res（分辨率）case。例如：

- `ITEM_SC230AI_BGGR`：`Raw10_SC230AI_RDK-S100`、`Raw10_SC230AI_DUAL_RDK-S100`
- `ITEM_OVX3C_RGGB`：`Pwl12_LCE_Fov60`、`Pwl12_LCE_Fov60_YNR`、`Pwl12_GA_Fov100` 等
- `ITEM_AR0820_RGGB`：`Pwl12_WS_Fov120` 等，res 含 `4K`、`1080P_BINNING_DIG`、`1080P_BINNING_ANA`、`1080P_SCALING`
- `ITEM_OV9782_RGGB`：`1280X720_120FPS`、`1280X720_30FPS`、`640X360_200FPS` 及对应的 DUAL 多路 case

完整的 sensor 与 case 列表以板端 `/app/tuning_tool/scripts/tuning_menu.sh` 为准。

### 配置说明

tuning_tool 每个 case 由两个配置文件组成：

- `vpm_config.json`：pipeline 配置（CIM / ISP / YNR 通路的输入输出）。其中 `rx_index` 是物理 VCON / MIPI rx 号，直连传感器时等于 i2c bus 号。
- `hb_superdev.json`：sensor 配置（`sensor_name`、`width` / `height`、`format`、`calib_lname`）。其中 `port_N` 是逻辑相机号（对应 `-i` 参数），与 `rx_index` 是两套编号。

S600/S100 的直连 MIPI 传感器 VCON 拓扑：VCON4（bus 4，直连传感器 0）、VCON5（bus 5，直连传感器 1）；VCON0–3 是 deserializer（GMSL）口。传感器插在 VCON5 时 `rx_index` 填 `5`，插在 VCON4 时填 `4`。

另外，YNR 的 hw_id 0/1/2 只支持 2DNR，只有 hw_id 3 支持 3DNR；配置 3DNR 必须用 hw_id 3，否则 `hb_vio_init` 会报 `-325`（VNODE_INIT_FAIL）。

### feedback 回灌

feedback 回灌把采集到的 raw 数据重新灌进 ISP 做离线调试，避免反复上电采集。`ITEM_Feedback` 定义回灌 case 的可选项：

- `format`：`3840x2160_12bit_msb`、`3840x2160_16bit_msb`、`1920x1080_12bit_msb`、`2048x1280_16bit_msb` 等
- `bayer`：`RGGB`、`GRBG`、`RBRG`、`BGGR`
- `bits`：`12`、`16`、`20`、`24`
- `ynr`：`disable`、`enable`

回灌 case 的配置位于 `cfg/` 目录（例如 `tuning_feedback_ddr_isp1_common`），每个 case 包含两个配置文件。

`hb_superdev.json`（sensor 配置）关键字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| sensor_name | 字符串 | sensor 名，回灌用 `dummy` |
| width / height | 数字 | 图像宽高 |
| format | 数字 | 图像格式 |
| fps | 数字 | 帧率 |
| calib_lname | 字符串 | ISP 标定文件名 |

`vpm_config.json`（pipeline 配置）关键字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| rx_index | 数字 | 物理 VCON / MIPI rx 号（直连传感器时 = i2c bus 号） |
| cim_isp_flyby | 数字 | 是否使能 CIM-ISP 硬件直连（0/1） |
| ddr_enable | 数字 | 是否使能 DDR 输出（0/1） |
| buf_num | 数字 | buffer 数量 |

### hbplayer 推流

通过 `-E` / `-e` 参数开启 hbplayer 推流后，tuning_tool 会在板端启动 dump server（端口 10086），并默认发送 yuv 给 hbplayer。启流后，在 PC 端 hbplayer 点击 connect 即可实时 preview 图像；想要结束时，在板端按 `q` 键回车结束。

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/isp/hbplayer_connect.png" alt="hbplayer 连接预览界面" style={{ width: '100%', maxWidth: '1000px', height: 'auto', display: 'block', margin: '0 auto' }} />

若反复打印 `get cim/isp raw data failed -310`（HB_VIO_INVALID_OPERATION），通常是 hbplayer 推流 / raw 回放通道的取数问题（例如无客户端连接、raw 格式不匹配），并非相机链路故障——此时相机链路的 fs/fe 统计仍是正常的。关掉 hbplayer 推流（`-E 0 -e 0 -y 0`）即可确认。

