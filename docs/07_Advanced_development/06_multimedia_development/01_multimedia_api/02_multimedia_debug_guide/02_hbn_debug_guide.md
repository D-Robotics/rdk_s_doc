---
sidebar_position: 2
title: HBN 调试指南
description: 多媒体 HBN pipeline 统计节点、日志与系统级故障定位
---

# HBN 调试指南

## 统计信息节点

统计节点分布在 sysfs（`/sys/class/vps/flow/`）、debugfs（`/sys/kernel/debug/`）与 procfs（`/proc`）下，是系统级调试的主要观测手段。下列路径与命令以板端实测为准，平台特定值见各节 `DocScope` 标注。

### vflow 通路统计（帧率、延时、丢帧）

vflow 通路的帧率、延时、丢帧统计分布在 `/sys/class/vps/flow/` 下，分别由 `fps_stats`、`delay_stats`、`drop_stats` 三个文件承载，各表以 `flowid`/`module`/`ctx_id`/`chn` 标识通路与通道；`/sys/kernel/debug/vps/vio_stats` 为三表的合并汇总视图（部分驱动版本运行时不实时刷新，排查以 `flow/*` 为准）。

```bash
cat /sys/class/vps/flow/fps_stats      # 帧率
cat /sys/class/vps/flow/delay_stats   # 延时
cat /sys/class/vps/flow/drop_stats     # 丢帧统计
cat /sys/class/vps/flow/drop_info     # 丢帧帧明细（最近丢帧的 frameid）
```

<DocScope products="RDK S600">

`fps_stats` 输出示例（pipeline 运行中，IMX219 单路 vin4→isp3→ynr3→pym3）：

```text
flowid    module    ctx_id    chn      fcount   avg_fps   cur_fps
0         vin4      0         
                              0            363    30.448     0.000
                              8            362    30.416     0.000
0         ynr3      0         
                              0            362    30.416     0.000
0         pym3      0         
                              0            362    30.416     0.000
                              8            362    30.421     0.000
```

</DocScope>

<DocScope products="RDK S100">

`fps_stats` 输出示例（pipeline 运行中，IMX219 单路 vin0→isp1→ynr1→pym1）：

```text
flowid    module    ctx_id    chn      fcount   avg_fps   cur_fps
0         vin0      0         
                              0           665    30.428     0.000
                              8           664    30.411     0.000
0         ynr1      0         
                              0           664    30.411     0.000
                              8           664    30.414     0.000
0         pym1      0         
                              0           664    30.411     0.000
                              8           664    30.414     0.000
```

</DocScope>

<DocScope products="RDK S600">

`delay_stats` 输出各通道帧延时（单位 ms），示例如下（pipeline 运行中）：

```text
flowid    module    ctx_id    chn   cur_delay_ms min_delay_ms avg_delay_ms max_delay_ms
0         vin4      0         
                              0                0            0            0            0
                              8               20           20           20           20
0         ynr3      0         
                              0               20           20           20           20
0         pym3      0         
                              0               20           20           20           20
                              8               22           22           22           22
```

</DocScope>

<DocScope products="RDK S100">

`delay_stats` 输出各通道帧延时（单位 ms），示例如下（pipeline 运行中）：

```text
flowid    module    ctx_id    chn   cur_delay_ms min_delay_ms avg_delay_ms max_delay_ms
0         vin0      0         
                              0                0            0            0            0
                              8               20           20           20           20
0         ynr1      0         
                              0               20           20           20           20
                              8               22           22           22           22
0         pym1      0         
                              0               20           20           20           20
                              8               22           22           22           22
```

</DocScope>

<DocScope products="RDK S600">

`drop_stats` 按通道列出 `hw drop`/`sw drop`/`user drop` 计数，示例如下（pipeline 运行中，无丢帧）：

```text
flowid    module    ctx_id    chn  drop_type   drop_cnt   avg_fps   cur_fps
0         vin4      0         
                              0    hw drop            0     0.000     0.000
                              0    sw drop            0     0.000     0.000
                              0    user drop          0     0.000     0.000
0         pym3      0         
                              0    hw drop            0     0.000     0.000
                              0    sw drop            0     0.000     0.000
                              0    user drop          0     0.000     0.000
```

</DocScope>

<DocScope products="RDK S100">

`drop_stats` 按通道列出 `hw drop`/`sw drop`/`user drop` 计数，示例如下（pipeline 运行中，无丢帧）：

```text
flowid    module    ctx_id    chn  drop_type   drop_cnt   avg_fps   cur_fps
0         vin0      0         
                              0    hw drop            0     0.000     0.000
                              0    sw drop            0     0.000     0.000
                              0    user drop          0     0.000     0.000
0         pym1      0         
                              0    hw drop            0     0.000     0.000
                              0    sw drop            0     0.000     0.000
                              0    user drop          0     0.000     0.000
```

</DocScope>

`drop_info` 输出最近若干丢帧的 frameid，无丢帧时各槽位为 `F00000000`，并给出 `head_index` 与 `last_drop_frameid`，用于定位具体丢在第几帧：

```text
pipe 0: [F00000000] [F00000000] [F00000000] [F00000000] [F00000000] [F00000000] 
      : head_index 0 last_drop_frameid 0 
```

pipeline 未运行时三张统计表（`fps_stats`/`delay_stats`/`drop_stats`）仅输出表头，`drop_info` 为空。

字段说明：

- `flowid`/`module`/`ctx_id`/`chn` 标识一条通路的某个输出通道，定位问题时先用这四列锁定目标。
- `fcount` 为累计帧数。若 `fcount` 不增长，说明该通道无数据产出，向上游排查。
- `avg_fps`/`cur_fps` 为平均与当前帧率。`cur_fps` 为 0 但 `fcount` 增长，通常表示采集在跑但输出被阻塞或未及时取走。
- `cur_delay_ms`/`min_delay_ms`/`avg_delay_ms`/`max_delay_ms` 为该通道帧延时统计，单位毫秒。`max_delay_ms` 异常大时关注下游处理或取帧是否及时。
- `drop_type` 分 `hw drop`（硬件丢）、`sw drop`（软件丢）、`user drop`（用户未及时取走丢）。`drop_cnt` 增长对应不同层面的丢帧，是卡顿排查的首要指标。

### 时间戳信息

`/sys/class/vps/flow/vio_delay` 输出每条通路最近若干帧的时间戳，列为 FS（帧开始）/ FE（帧结束）/ QB（取帧）/ DQ（出帧），单位秒、纳秒精度，是定位帧时序与同步抖动的依据：

```bash
cat /sys/class/vps/flow/vio_delay
```

输出示例：

```text
------------------------------- pipe 0 vio info -------------------------------
frameid  module FS              FE              QB              DQ
00000001 vin    00322673.775402 00322673.795849 00322673.795888 00322673.775377
00000002 vin    00322673.808294 00322673.828748 00322673.828782 00322673.808285
00000003 vin    00322673.841204 00322673.861661 00322673.861698 00322673.841194

00000001 isp    00322673.795884 00322673.797801 00322673.797803 00322673.797797
00000002 isp    00322673.828780 00322673.830686 00322673.830687 00322673.830683
00000003 isp    00322673.861695 00322673.863599 00322673.863600 00322673.863595
```

`module` 列随通路延伸依次出现 `vin`→`isp`→`ynr`→`pym` 等节点，逐行对比相邻节点的 FS/FE 即可定位某段时序异常。多路同步与 PPS 秒脉冲同步机制见 [多路 Camera 及与 Lidar 同步](../12_camerasync.md)。

### vflow 通路信息

`/sys/class/vps/flow/path_stat` 输出当前在跑通路的节点连接拓扑，用于确认 pipeline 实际建链是否与预期一致：

```bash
cat /sys/class/vps/flow/path_stat
```

输出示例：

<DocScope products="RDK S600">

```text
(active)[S0] vin4_C0*-m2m-isp3_C0*-otf-ynr3_C0(dma)-otf-pym3_C0(dma)
```

</DocScope>

<DocScope products="RDK S100">

```text
(active)[S0] vin0_C0*-m2m-isp1_C0*-otf-ynr1_C0(dma)-otf-pym1_C0(dma)
```

</DocScope>

- `S[N]` 为 flowid；`active`/`inactive` 标识该通路是否在跑（停止后会保留上一次建链并标为 `inactive`）。
- 节点名后数字为硬件 hw_id，`C[N]` 为软件 ctx_id，`*` 标记入口节点。
- `dma` 表示该节点输出落 DDR，`m2m` 表示 offline 送往后级，`otf` 表示直连后级。

### 帧率信息

`/sys/class/vps/flow/fps` 按通路输出各 vnode 输入/输出通道的帧率，用于快速确认整链每个节点是否在出帧：

```bash
cat /sys/class/vps/flow/fps
```

输出示例（pipeline 运行中）：

<DocScope products="RDK S600">

```text
Flow0 FPS
vin4 ctx 0: | ich0 31 | och0 31 | och1  0 | och3  0 | och4  0 |
isp3 ctx 0: | ich0  0 | och0  0 |
ynr3 ctx 0: | ich0 31 | ich1  0 | och0 31 |
pym3 ctx 0: | ich0 31 | och0 31 |
```

</DocScope>

<DocScope products="RDK S100">

```text
Flow0 FPS
vin0 ctx 0: | ich0  30 | och0  30 | och1   0 | och3   0 | och4   0 |
isp1 ctx 0: | ich0   0 | och0   0 |
ynr1 ctx 0: | ich0  30 | ich1   0 | och0  30 |
pym1 ctx 0: | ich0  30 | och0  30 |
```

</DocScope>

`ich`/`och` 为输入/输出通道，后接帧率；`0` 表示该通道未出帧。与 `fps_stats` 互补：`fps_stats` 给累计 `fcount` 与平均/当前帧率，`flow/fps` 直观展示每个节点各通道的实时帧率，便于定位相邻节点间的丢帧位置。debugfs 下 `/sys/kernel/debug/vps/fps` 为同功能的汇总视图。

### 驱动 buffer 状态

帧管理器（frame manager）的 buffer 状态反映内存占用与流转健康度：

```bash
cat /sys/kernel/debug/vps/fmgr_stats
```

输出示例（pipeline 运行中）：

<DocScope products="RDK S600">

```text
----------------------------------------------------------
flowid    module    cid chn   FREE   REQ   PRO   COM  USED
----------------------------------------------------------
0         vin4      0   0      16     0     0     0     0
0         vin4      0   8       0     4     2     0     0
0         isp3      0   0      10     0     0     0     6
0         ynr3      0   1      13     1     0     1     1
0         ynr3      0   8       0     1     0     0     2
0         pym3      0   8       0     3     0     0     0
```

</DocScope>

<DocScope products="RDK S100">

```text
----------------------------------------------------------
flowid    module    cid chn   FREE   REQ   PRO   COM  USED
----------------------------------------------------------
0         vin0      0   0       16     0     0     0     0
0         vin0      0   8        0     4     2     0     0
0         isp1      0   0       10     0     0     0     6
0         isp1      0   8       16     0     0     0     0
0         ynr1      0   0       16     0     0     0     0
0         ynr1      0   1       13     1     0     1     1
0         ynr1      0   8        0     1     0     0     2
0         pym1      0   0       16     0     0     0     0
0         pym1      0   8        0     3     0     0     0
```

</DocScope>

字段为各状态 buffer 计数：`FREE`（空闲）、`REQ`（已申请）、`PRO`（处理中）、`COM`（完成）、`USED`（占用）。若 `USED` 持续增长而 `FREE` 减少，提示 buffer 回流慢或泄漏，是卡顿与内存问题的排查依据。

### MIPI 接收（Camera 输入）调试信息

相机 MIPI 接收侧（RX）的调试节点位于 `/sys/class/vps/mipi_hostN/`（sysfs，`N` 为路号），用于观测 RX 实际运行配置与错误计数。

<DocScope products="RDK S600">

RDK S600 实测 `/sys/class/vps/` 下有 `mipi_host0` 至 `mipi_host5` 共 6 路 MIPI RX 接收。
</DocScope>

<DocScope products="RDK S100">

RDK S100 实测 `/sys/class/vps/` 下有 `mipi_host0`、`mipi_host1`、`mipi_host4` 共 3 路 MIPI RX 接收。
</DocScope>

<DocScope products="RDK S600">

```bash
cat /sys/class/vps/mipi_host4/status/cfg      # 实际运行配置，未使用时显示 not inited
cat /sys/class/vps/mipi_host4/status/icnt     # 各类错误中断计数
cat /sys/class/vps/mipi_host4/status/regs     # 寄存器转储：VERSION/N_LANES/PHY/INT_ST_* 等
cat /sys/class/vps/mipi_host4/status/info     # 端口、模式、lane、irq 号等运行信息
```

> 路号以 sensor 实际接入为准。RDK S600 实测 IMX219 接在 `mipi_host4`，下文命令与输出示例均取自该路。

</DocScope>

<DocScope products="RDK S100">

```bash
cat /sys/class/vps/mipi_host0/status/cfg      # 实际运行配置，未使用时显示 not inited
cat /sys/class/vps/mipi_host0/status/icnt     # 各类错误中断计数
cat /sys/class/vps/mipi_host0/status/regs     # 寄存器转储：VERSION/N_LANES/PHY/INT_ST_* 等
cat /sys/class/vps/mipi_host0/status/info     # 端口、模式、lane、irq 号等运行信息
```

> 路号以 sensor 实际接入为准。RDK S100 实测 IMX219 接在 `mipi_host0`，下文命令与输出示例均取自该路。

</DocScope>

`status/cfg` 为实际运行配置，未使用时显示 `not inited`；IMX219 运行时输出如下：

<DocScope products="RDK S600">

```text
phy            : 0 dphy
lane           : 2
datatype       : 0x12b
fps            : 30
mclk           : 24 -> ignore
mipiclk        : 1728 Mbps -> 864Mbps/lane
width          : 1920
height         : 1080
linelenth      : 3555
framelenth     : 1620
settle         : 0
channel_num    : 4
channel_sel[0] : 0
channel_sel[1] : 1
channel_sel[2] : 2
channel_sel[3] : 3
```

</DocScope>

<DocScope products="RDK S100">

```text
phy            : 0 dphy
lane           : 2
datatype       : 0x12b
fps            : 30
mclk           : 24 -> ignore
mipiclk        : 1728 Mbps -> 864Mbps/lane
width          : 1920
height         : 1080
linelenth      : 3555
framelenth     : 1620
settle         : 0
ppi_pg         : 0
hsaTime        : 8
hbpTime        : 8
hsdTime        : 1
channel_num    : 4
channel_sel[0] : 0
channel_sel[1] : 1
channel_sel[2] : 2
channel_sel[3] : 3
```

</DocScope>

`status/icnt` 为各类错误中断计数，正常应全为 0，非 0 表示 MIPI 链路存在错误；运行时输出如下（无错误，全 0）：

```text
st_main        : 0
phy_fatal      : 0
pkt_fatal      : 0
frm_fatal      : 0
bndry_frm_fatal: 0
seq_frm_fatal  : 0
crc_frm_fatal  : 0
pld_crc_fatal  : 0
data_id        : 0
ecc_corrected  : 0
phy            : 0
pkt            : 0
line           : 0
ipi            : 0
ipi2           : 0
ipi3           : 0
ipi4           : 0
ipi5           : 0
ipi6           : 0
ipi7           : 0
ipi8           : 0
ap_generic     : 0
ap_ipi         : 0
ap_ipi2        : 0
ap_ipi3        : 0
ap_ipi4        : 0
ap_ipi5        : 0
ap_ipi6        : 0
ap_ipi7        : 0
ap_ipi8        : 0
logger_err     : 0
```

`status/regs` 为 MIPI RX 寄存器转储，用于核对 lane 数、PHY 状态与中断位。`N_LANES` 为 0 基（`0x1` 即 2 lane，与 `cfg` 的 `lane:2` 对应）；`PHY_RX`/`PHY_STOPSTATE` 反映 PHY 链路状态，正常接收时非 0；各 `INT_ST_*` 为中断状态位，正常为 0，`INT_MSK_*` 为对应中断掩码。节选如下：

<DocScope products="RDK S600">

```text
0x000: 0x30313533  - VERSION
0x004: 0x1         - N_LANES
0x008: 0x1         - CSI2_RESETN
0x040: 0x1         - PHY_SHUTDOWNZ
0x044: 0x1         - DPHY_RSTZ
0x048: 0x30000     - PHY_RX
0x04c: 0x3         - PHY_STOPSTATE
0x088: 0x12b       - IPI_DATA_TYPE
0x00c: 0x0         - INT_ST_MAIN
0x0e0: 0x0         - INT_ST_PHY_FATAL
0x0f0: 0x0         - INT_ST_PKT_FATAL
0x110: 0x0         - INT_ST_PHY
0x140: 0x0         - INT_ST_IPI
0x0e4: 0x7010f     - INT_MSK_PHY_FATAL
0x144: 0x7f        - INT_MSK_IPI
```

</DocScope>

<DocScope products="RDK S100">

```text
0x000: 0x30313533  - VERSION
0x004: 0x1         - N_LANES
0x008: 0x1         - CSI2_RESETN
0x040: 0x1         - PHY_SHUTDOWNZ
0x044: 0x1         - DPHY_RSTZ
0x048: 0x10000     - PHY_RX
0x04c: 0x10003     - PHY_STOPSTATE
0x088: 0x12b       - IPI_DATA_TYPE
0x00c: 0x0         - INT_ST_MAIN
0x0e0: 0x0         - INT_ST_PHY_FATAL
0x0f0: 0x0         - INT_ST_PKT_FATAL
0x110: 0x0         - INT_ST_PHY
0x140: 0x0         - INT_ST_IPI
0x0e4: 0x7010f     - INT_MSK_PHY_FATAL
0x144: 0x7f        - INT_MSK_IPI
```

</DocScope>

`status/info` 输出端口、`hw_mode`、`mode`、`lane_mode`、寄存器基址、`irq` 号与 `state`，用于确认硬件实例绑定与资源；`state` 为 `2(start)` 表示已启动，`0(default)` 为未启动：

<DocScope products="RDK S600">

```text
port           : 4
hw_mode        : g4:0 l4/4 i4
mode           : alone
lane_mode      : 0(4lane)
reg            : 0x37c20000 +0x10000
iomem          : ffff80001a7a0000
phy_reg        : 0x37300000 +0x40000
phy_iomem      : ffff80001bd40000
irq            : 149
state          : 2(start)
```

</DocScope>

<DocScope products="RDK S100">

```text
port           : 0
hw_mode        : g0:0 l4/4 i4
mode           : alone
lane_mode      : 0(4lane)
reg            : 0x37420000 +0x10000
iomem          : ffff80000ce60000
phy_reg        : 0x37200000 +0x40000
phy_iomem      : ffff800010d00000
irq            : 103
state          : 2(start)
```

</DocScope>

- `param/irq_cnt` 默认为 10，为避免大量错误打印会限制报错中断数；排查时可用 `echo 0xffffffff > /sys/class/vps/mipi_hostN/param/irq_cnt`（N 为实际接入路号）放开限制后再观察。
- MIPI RX 无独立的帧开始/结束（FS/FE）中断，”是否有流”以 CIM 的 FS/FE 中断为准（见 [视频输入 - VIN](../04_vin_api.md)）。

### MIPI 发送（Display 输出）调试信息

MIPI 发送侧（CSI TX / DSI TX）用于 Display 输出，节点位于 `/sys/kernel/debug/mipi_csi_dev0/` 与 `/sys/kernel/debug/mipi_dsi_host0/`。

```bash
ls /sys/kernel/debug/mipi_csi_dev0/
# config  curr_irq  idi_fifo  ipi_fifo  trace_log  vpg_hbp  vpg_hfp  vpg_hs  vpg_vbp  vpg_vfp  vpg_vs
cat /sys/kernel/debug/mipi_csi_dev0/config    # CSI TX 配置
cat /sys/kernel/debug/mipi_dsi_host0/config
```

debugfs 下发送侧另有 `mipi_csi_dev1`（文件清单与 `mipi_csi_dev0` 相同）、`csi_panel0`、`csi_panel1`、`mipi_tx_dphy` 节点；`mipi_dsi_host0/` 下仅 `config`、`curr_irq`、`irq_status` 三个文件。

无显示输出任务时，`mipi_csi_dev0/config` 实测各字段为 0，CSI TX 通路工作时填入实际值：

```text
  MIPI DEV 0 config:
	 enable: 0
	 mipiclk: 0
	 lane: 0
	 datatype: 0
	 width: 0
	 height: 0
	 linelenth: 0
	 framelenth: 0
	 ipi_lines: 0
	 settle: 0
	 lpclk_mode: 0
	 vpg: 0
	 vpg_mode: 0
	 vpg_hsyncpkt_en: 0
```

`mipi_dsi_host0/config` 结构同（DSI 侧字段含 `color_coding`/`hline`/`hbp`/`hsa`/`vfp`/`vbp`/`vsa`/`lp_cmd_en`/`video_mode` 等），无显示输出任务时实测同样全为 0：

```text
  MIPI DSI 0 config:
	 enable: 0
	 mipiclk: 0
	 lane: 0
	 color_coding: 0
	 width: 0
	 height: 0
	 hline: 0
	 hbp: 0
	 hsa: 0
	 vfp: 0
	 vbp: 0
	 vsa: 0
	 lp_cmd_en: 0
	 video_mode: 0
	 vpg: 0
```

接 HDMI 显示器并启动桌面后，显示输出经 `mipi_dsi_host0`，`config` 填入实际值，时序与 DRM 当前模式一致（下例 1280×720@60）；此时 `mipi_csi_dev0/config` 保持全 0，`curr_irq` 为 0，`idi_fifo`/`ipi_fifo` 输出 `normal`：

```text
  MIPI DSI 0 config:
	 enable: 1
	 mipiclk: 1871
	 lane: 4
	 color_coding: 5
	 width: 1280
	 height: 720
	 hline: 1650
	 hbp: 220
	 hsa: 40
	 vfp: 5
	 vbp: 20
	 vsa: 5
	 lp_cmd_en: 0
	 video_mode: 2
	 vpg: 0
```

- `config` 为 CSI TX 当前配置，`curr_irq` 为中断计数，`trace_log` 为事件打印。
- `idi_fifo`/`ipi_fifo` 为 FIFO 状态，溢出会导致丢帧。
- `vpg_*` 为测试图发生器参数，用于无屏自测 TX 发送侧。
- 显示输出经 DRM（`/sys/kernel/debug/dri/128/state`，HDMI/Writeback 连接器）观测；`mipi_dsi_host0/config` 在显示输出运行时填入实际值（接 HDMI 屏即填入），`mipi_csi_dev0/config` 在 CSI TX 通路工作时填入。
- CSI TX / DSI TX 在 `/proc/interrupts` 中对应 `mipi_csi_dev0`、`mipi_csi_dev1`、`mipi_dsi_host0` 行。Display 输出调试细节见 [显示输出 - DISP](../09_disp_api.md)。

### ISP 调试信息

ISP 调试节点分布在 procfs 与 sysfs：

```bash
ls /proc/ | grep hb_isp
# hb_isp  hb_isp_hw1  hb_isp_hw2  hb_isp_hw3
ls /sys/class/isp_control/
ls /sys/class/isp_sbuf/    # 共享 buffer 状态，按实际 ISP 实例查阅子节点
```

`ls /sys/class/isp_control/` 实测输出（按 `isp_hw{N}_control{0..11}` 命名，`N` 为硬件实例号，此处按硬件实例分组节选）：

<DocScope products="RDK S600">

```text
isp_hw0_control0   isp_hw0_control1   isp_hw0_control2   ...   isp_hw0_control11
isp_hw1_control0   isp_hw1_control1   isp_hw1_control2   ...   isp_hw1_control11
isp_hw2_control0   isp_hw2_control1   isp_hw2_control2   ...   isp_hw2_control11
isp_hw3_control0   isp_hw3_control1   isp_hw3_control2   ...   isp_hw3_control11
```

</DocScope>

<DocScope products="RDK S100">

```text
isp_hw0_control0   isp_hw0_control1   isp_hw0_control2   ...   isp_hw0_control11
isp_hw1_control0   isp_hw1_control1   isp_hw1_control2   ...   isp_hw1_control11
```

</DocScope>

`/sys/class/isp_sbuf/` 同构，为 `isp_hw{0..3}_sbuf{0..11}`（RDK S100 为 `isp_hw{0,1}_sbuf{0..11}`）。

`/proc/hb_isp*` 为各 ISP 硬件实例的统计与状态，按 slot（上下文）输出。运行 IMX219 单路时活跃实例的输出节选如下（S600 活跃实例为 `hb_isp_hw3`（即 `isp3`），S100 为 `hb_isp_hw1`）：

<DocScope products="RDK S600">

```text
fw_ctx_count      active          inactive
12                1               11
sched_mode
soft_manual
----------------------------------------------------------------------------------------------
safety_slots      counter         10s/counter
enable            208             0
----------------------------------------------------------------------------------------------
slot      flow_id         base_litmmu     base_phy        data_width  buf_num
4         0               0xff0a4000      0x4208244000      10          3
slot      usecase         mode            s_Width   s_Height
4         remote          native          1920      1080
slot      axi_output      stream_output
4         disable         yuv420
slot      awb_usernum     awb_busynum     awb_freenum
4         0               4               0
slot      ae_usernum      ae_busynum      ae_freenum
4         0               4               0
slot      cur_ustime      max_ustime      min_ustime       avg_ustime
4         1874            1879            1869             1872
slot      input_counter   10s/input_frame mcbe_counter     10s/mcbe_frame
4         0               0               208              0
```

</DocScope>

<DocScope products="RDK S100">

```text
fw_ctx_count      active          inactive
12                2               10
sched_mode
soft_manual
----------------------------------------------------------------------------------------------
safety_slots      counter         10s/counter
enable            1561            304
----------------------------------------------------------------------------------------------
slot      flow_id         base_litmmu     base_phy        data_width  buf_num
0         1               0xff820000      0x401f00000       10          3
slot      usecase         mode            s_Width   s_Height
0         local           native          1920      1080
slot      axi_output      stream_output
0         disable         yuv420
slot      awb_usernum     awb_busynum     awb_freenum
0         0               4               0
slot      ae_usernum      ae_busynum      ae_freenum
0         0               4               0
slot      cur_ustime      max_ustime      min_ustime       avg_ustime
0         2076            2088            2067             2073
slot      input_counter   10s/input_frame mcbe_counter     10s/mcbe_frame
0         365             303             364              304
```

</DocScope>

`active`/`inactive` 表示该 ISP 实例上下文中有多少在跑/空闲；`flow_id` 非 `255` 的 slot 为活跃上下文；`awb_busynum`/`ae_busynum` 非 0 表示 AWB/AE 模块在运行；`cur_ustime`/`avg_ustime` 为 ISP 单帧处理耗时（μs），`mcbe_counter` 为 ISP 输出帧计数，是 ISP 是否出图的一手依据。

<DocScope products="RDK S600">

RDK S600 实测 `/proc/` 下有 `hb_isp`、`hb_isp_hw1`、`hb_isp_hw2`、`hb_isp_hw3` 共 4 个 ISP 硬件实例节点，`/sys/class/isp_control/` 下为 `isp_hw{0..3}_control{0..11}`。
</DocScope>

<DocScope products="RDK S100">

RDK S100 板端实测 `/proc/` 下有 `hb_isp`、`hb_isp_hw1` 共 2 个 ISP 硬件实例节点，`/sys/class/isp_control/` 下为 `isp_hw{0,1}_control{0..11}`。
</DocScope>

图像异常时优先查 ISP 节点，调参细节见 [图像信号处理 - ISP](../05_isp/02_isp_hbn_api.md)。

### 中断统计信息

整体中断分布查看 `/proc/interrupts`，重点关注 vpu、jpu、isp、mipi 相关行：

```bash
cat /proc/interrupts | grep -iE "vpu|jpu|isp|mipi"
```

输出示例如下（每行中间为各 CPU 核心计数，此处省略各核计数以保持可读）：

<DocScope products="RDK S600">

RDK S600 实测共 18 核，活跃 ISP 实例为 `hb_isp3`：

```text
126:  0  0 ... 0   GICv3 659 Edge   36050000.jpu
127:  252 256 ... 252  GICv3 656 Level  36020000.vpu
156:  0  0 ... 0   GICv3 113 Level  37e10000.mipi_csi_dev0
158:  0  0 ... 0   GICv3 111 Level  37e20000.mipi_csi_dev1
161:  0  0 ... 0   GICv3 112 Level  37e30000.mipi_dsi_host0
195:  21 25 ... 28  GICv3 90 Level   hb_isp3
```

</DocScope>

<DocScope products="RDK S100">

RDK S100 板端实测共 6 核（Cortex-A78AE），每行 6 列 CPU 核心计数；IRQ 号与 GIC 中断号均与 S600 不同。计数为自启动累计值——`cim`、`vpu`、`hb_isp1` 因曾运行过采集/编码 pipeline 而非 0，其余未运行模块为 0：

```text
 92:  660  862  793  754  780  786   GICv3 142 Level  36020000.vpu
 95:    0    0    0    0    0    0   GICv3 143 Edge   36030000.jpu
100: 1486 1473 1649 1587 1514 1595   GICv3 151 Level  cim
101:    0    0    0    0    0    0   GICv3 161 Level  cim
102:    0    0    0    0    0    0   GICv3 170 Level  cim
103:    0    0    0    0    0    0   GICv3 150 Level  37420000.mipi_host
104:    0    0    0    0    0    0   GICv3 160 Level  37620000.mipi_host
105:    0    0    0    0    0    0   GICv3 165 Level  37c20000.mipi_host
117:    0    0    0    0    0    0   GICv3 145 Level  hb_isp0
122: 2449 2245 2356 2232 2471 2203   GICv3 154 Level  hb_isp1
126:    0    0    0    0    0    0   GICv3 174 Level  37e10000.mipi_csi_dev0
128:    0    0    0    0    0    0   GICv3 173 Level  37e30000.mipi_dsi_host0
```

</DocScope>

中断计数不增长与对应模块未工作直接相关，是快速定位”模块是否在动”的第一手依据。

## 日志与动态调试

除统计节点外，用户态日志与内核动态打印是另一类观测手段。

### 用户态日志

- 在运行 sample 的同一 shell 设置日志级别环境变量（`export LOGLEVEL=4` 为 VIN 日志，1=ERR/2=WARN/3=INFO/4=DEBUG；`CAM_LOGLEVEL`/`VPF_LOGLEVEL` 分别控制 libcam/libvpf 日志），具体变量是否生效以 sample 实现为准。
- 查看用户态日志：`logcat`（或 `logcat -f logcat.txt` 落盘）；内核侧 `dmesg | grep -iE "cim|mipi|isp|pym"`。
- 历史日志位于 `/log/usr/`。

### 内核动态调试

通过 `dynamic_debug` 按模块或文件打开内核打印，`+p` 打开、`-p` 关闭。板端可用模块示例如下：

```bash
echo 'module hobot_cim +p' > /sys/kernel/debug/dynamic_debug/control       # CIM
echo 'module hobot_pym_jplus +p' > /sys/kernel/debug/dynamic_debug/control  # PYM
echo 'module hobot_isp +p' > /sys/kernel/debug/dynamic_debug/control        # ISP
echo 'module hobot_stitch +p' > /sys/kernel/debug/dynamic_debug/control     # Stitch
echo 'module hobot_idu_drm +p' > /sys/kernel/debug/dynamic_debug/control    # IDU(Display)
dmesg | grep -i cim                                                         # 查看打印
echo 'module hobot_cim -p' > /sys/kernel/debug/dynamic_debug/control       # 关闭
```

也可按源文件粒度（`echo 'file hobot_dev_cim.c +p' > ...`）或函数粒度（`echo 'func cim_wait_event +p' > ...`）控制。打开后配合 `dmesg` 观察对应模块的帧事件与错误打印。

## 系统级故障定位

本节给出跨模块故障的定位思路。定位时遵循“按链路逐段排查、先看通路再看模块”的原则。

### 无图像输出

按采集链路从上游到下游逐段确认：

1. 查 MIPI RX：`cat /sys/class/vps/mipi_hostN/status/icnt`（N 为 sensor 实际接入路号，IMX219 实测接 `mipi_host4`）各计数是否为 0，`status/cfg` 是否为 `not inited`。`cfg` 未初始化或 `icnt` 非 0，说明 MIPI RX 未通或有错误，问题在 sensor 或 MIPI 链路（接线和供电、sensor 初始化、VIN/JSON 配置）。
2. 查 CIM/VIN：MIPI RX 无独立 FS/FE 中断，“是否有流”以 CIM 的中断与帧事件打印为准。打开 CIM 驱动调试打印 `echo 'module hobot_cim +p' > /sys/kernel/debug/dynamic_debug/control`，再 `dmesg | grep -i cim` 看是否有帧事件；无则 sensor 未出图或 CIM 配置不符。排查完把 `+p` 改 `-p` 关闭。
3. 查 vflow 通路：`cat /sys/class/vps/flow/fps_stats` 中目标 `flowid` 的 `fcount` 是否增长。不增长则问题在 VIN/ISP 入口。
4. 查 ISP 层：`/proc/hb_isp*` 节点确认 ISP 是否出图。
5. 查输出侧：若 ISP/PYM 有帧而显示或编码无输出，查 Display 与 Codec 节点。

<DocScope products="RDK S600">

详细模块调试见 [视频输入 - VIN](../04_vin_api.md) 与[Sunrise camera 开发说明](../../02_multimedia_sample_s600/11_sunrise_camera_develop_guide.md)。

</DocScope>

<DocScope products="RDK S100">

详细模块调试见 [视频输入 - VIN](../04_vin_api.md) 与[Sunrise camera 开发说明](../../02_multimedia_sample/11_sunrise_camera_develop_guide.md)。

</DocScope>

### 花屏或颜色异常

图像出现花屏、偏色或撕裂时，重点查 ISP、PYM、GDC 三处：

- ISP 输出格式与 buffer 配置是否匹配，见 [图像信号处理 - ISP](../05_isp/02_isp_hbn_api.md)。
- PYM 下采样参数与输入分辨率是否匹配，见 [视频处理框架 - PYM](../07_vpf_pym_api.md)。
- GDC 矫正参数是否正确，见 [畸变矫正 - GDC](../08_gdc/01_gdc_overview.md)。
- MIPI FIFO 是否溢出（`idi_fifo`/`ipi_fifo`），溢出会造成行场错位。

### 卡顿与丢帧

卡顿与丢帧优先看三组数据：

1. `flow/drop_stats` 的 `drop_type` 与 `drop_cnt`：`hw drop` 多为带宽或处理能力不足，`sw drop` 多为软件调度，`user drop` 为取帧不及时。
2. `flow/delay_stats` 的 `max_delay_ms`：异常大说明某环节拥塞。
3. `fmgr_stats` 的 `USED`/`FREE`：`USED` 居高不下说明 buffer 回流慢，需排查下游是否及时释放。

### 多路同步异常

多路 Camera 或与外设同步异常时，查时间戳与 PPS（Pulse Per Second）秒脉冲的同步状态：

- `flow/vio_delay` 通路表中的时间戳信息（FS/FE/QB/DQ）。
- 时间同步机制与配置见 [多路 Camera 及与 Lidar 同步](../12_camerasync.md)。

## 常见问题

### fps_stats 中某通道 fcount 增长但 cur_fps 为 0

**原因**：采集在运行，但输出帧未被下游及时取走，帧在 buffer 中堆积。

**解决**：检查下游消费者是否正常运行、是否及时调用取帧接口；查 `fmgr_stats` 的 `USED` 是否堆积。

### fmgr_stats 中 USED 持续增长

**原因**：下游未及时归还 buffer，或存在 buffer 泄漏。

**解决**：确认取帧后是否正确释放；检查 pipeline 是否有节点未正常停止导致 buffer 未回收。

### MIPI RX icnt 非 0 或无图

**原因**：sensor 未出图或 MIPI 链路未通，`mipi_hostN/status/icnt`（N 为实际接入路号）出现非 0 计数。

**解决**：确认 sensor 供电与初始化、MIPI 接线与配置、SerDes 链路；查 `mipi_hostN/status/cfg` 实际配置是否与预期一致；CIM 侧用 `echo 'module hobot_cim +p' > /sys/kernel/debug/dynamic_debug/control` 打开帧事件打印确认是否有流。
