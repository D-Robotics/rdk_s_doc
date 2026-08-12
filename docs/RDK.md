---
sidebar_position: 0
slug: /RDK
title: D-Robotics RDK 套件
description: RDK S100/S600 套件介绍、资料索引、文档导航、三模式导览、版本发布
---

# D-Robotics RDK 套件

```mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import DocScope from '@site/src/components/DocScope';
```

## 套件介绍

**D-Robotics Developer Kits**，简称 RDK 套件，是基于 D-Robotics 计算平台打造的机器人开发者套件，涵盖硬件板卡与配套软件，帮助开发者快速搭建机器人原型、开展评测与验证。套件硬件产品线包括 RDK X3、RDK X3 Module、RDK X5、RDK Ultra、RDK S100 系列、RDK S600 系列。本手册面向 **RDK S100 / RDK S600**。

RDK OS 是基于 Ubuntu 定制的板端操作系统镜像，烧录后即开箱可用；TogetheROS.Bot（tros.b）机器人中间件预装在镜像内。详见 产品共识（标准仓库）。

:::info 注意
确认系统版本号：`cat /etc/version`；`rdkos_info` 查看板卡与运行时信息。详见 [系统状态查询](./01_Quick_start/03_install_os_and_setup/system_status.md)。
:::

### 产品介绍

<DocScope products="RDK-S100">

**RDK S100 系列** 是一款高性能开发套件，具有 80/128 TOPS 端侧推理算力与 6 核 ARM A78AE 处理能力，支持 2 路 MIPI Camera 接入，4 路 USB 3.0 接口，2 路 PCIe3.0 接口，充分满足各类场景的使用需求。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/image-rdks100-serials.png" alt="产品介绍示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

</DocScope>

<DocScope products="RDK-S600">

**RDK S600 系列** 是一款高性能开发套件，具有 560 TOPS 端侧推理算力与 18 核 ARM A78AE 处理能力，支持 6 路 MIPI Camera 接入，6 路 USB 3.0 接口，4 路 PCIe3.0 接口，充分满足各类场景的使用需求。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/image-rdk_600_v0p1_mainboard_overview.png" alt="产品介绍示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

</DocScope>

## 资料索引

> 系统镜像、工具、硬件资料下载。商业资料请切换 **FTP 下载** 选项，按表格路径在 FTP 服务器获取。

<DocScope products="RDK S100">

:::warning 注意

RDK S100 商业资料请切换至 **FTP下载** 选项，根据表格中的路径，在 FTP 服务器中获取。

:::


<Tabs groupId="download" defaultValue="online">
<TabItem value="online" label="在线下载">



## 系统软件

<div className="table-responsive">

| 名称                                                                                   | 最新版本    | 上传日期   | 说明文档                                                             |
| -------------------------------------------------------------------------------------- | ----------- | ---------- | -------------------------------------------------------------------- |
| [系统镜像](https://archive.d-robotics.cc/downloads/os_images/rdk_s100/)                | RDKS100-V4.0.5_20260507 | 2026-05-07 | 系统镜像。                                                           |
| [BSP 源码包](https://developer.d-robotics.cc/resource)                | RDKS100-V4.0.5_20260507 | 2026-05-07 | BSP 源码包。                                                           |

</div>

<br/><br/>

<!-- <DocScope products="RDK S600">

<div className="table-responsive">

| 名称     | 最新版本    | 上传日期   | 路径                                                                            |
| -------- | ----------- | ---------- | ------------------------------------------------------------------------------- |
| 系统镜像 | V5.1.0 | 2026-06-09 | https://archive.d-robotics.cc/downloads/os_images/rdk_s600/|

</div>

</DocScope> -->


## 工具下载

<div className="table-responsive">

| 名称                                                                                   | 最新版本    | 上传日期   | 说明文档                                                             |
| -------------------------------------------------------------------------------------- | ----------- | ---------- | -------------------------------------------------------------------- |
| [Xburn](https://archive.d-robotics.cc/downloads/software_tools/download_tools/) | V1.2.0      | 2026-05-13 | 系统镜像烧录工具，包含 windows-x64、linux-x64 和 darwin-arm64 版本。 |
| [MCU 交叉编译工具链](https://archive.d-robotics.cc/downloads/software_tools/mcu_toolchain/gcc-arm-none-eabi-10.3-2021.10-x86_64-linux.tar.bz2) | -      | 2026-01-27 | MCU 交叉编译工具链。 |
| [hbplayer](https://archive.d-robotics.cc/downloads/hobotplayer/hbplayerv2.7.zip) | V2.7      | 2026-01-27 | 图像浏览工具。 |
| [CH340 串口驱动程序](https://archive.d-robotics.cc/downloads/software_tools/serial_to_usb_drivers/CH34x_Install_Windows_v3_4.zip) | V3.4      | 2026-03-17 | 串口驱动程序。 |

</div>

<br/><br/>

## 硬件资料



### RDK S100

<div className="table-responsive">

| 名称                                                                                                            | 版本   | 上传日期   | 说明文档                                                  |
| --------------------------------------------------------------------------------------------------------------- | ------ | ---------- | --------------------------------------------------------- |
| [STEP 模型](https://archive.d-robotics.cc/downloads/hardware/rdk_s100/rdk_s100/drobotics_rdk_s100_v1p0.step)    | V1.0.0 | 2025-06-10 | 产品 3D 模型，STEP 格式，便于进行机器人布局，外壳设计等。 |
| [产品渲染图](https://archive.d-robotics.cc/downloads/hardware/rdk_s100/rdk_s100/drobotics_rdk_s100_renders.zip) | V1.0.0 | 2025-06-10 | 产品渲染图片，便于产品材料二次编辑。                      |
| 产品实拍图                                                                                                      | V1.0.0 | 2025-06-10 | 产品实物图，便于进行产品材料二次编辑。                    |

</div>

<br/><br/>

### RDK S100 Camera Expansion Board

<div className="table-responsive">

<table>
  <thead>
    <tr>
      <th>名称</th>
      <th>产品</th>
      <th>下载</th>
      <th>上传日期</th>
      <th>说明文档</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowspan="2">STEP 模型</td>
      <td>相机扩展板</td>
      <td><a href="https://archive.d-robotics.cc/downloads/hardware/rdk_s100/rdk_s100_camera_expansion_board/drobotics_rdk_s100_camera_expansion_board_v1p0.step">STEP 模型</a></td>
      <td>2025-06-10</td>
      <td rowspan="2">产品 3D 模型，STEP 格式，便于进行机器人布局、外壳设计等。</td>
    </tr>
    <tr>
      <td>相机扩展板 12 通道</td>
      <td><a href="https://archive.d-robotics.cc/downloads/hardware/rdk_s100/rdk_s100_camera_expansion_board/rdk_s100_camera_expansion_board_12L/drobotics_rdk_s100_camera_expansion_board_12l_3d_model_v1p0_20260508.STEP">STEP 模型</a></td>
      <td>2026-07-01</td>
    </tr>
    <tr>
      <td rowspan="2">参考设计</td>
      <td>相机扩展板</td>
      <td><a href="https://archive.d-robotics.cc/downloads/hardware/rdk_s100/rdk_s100_camera_expansion_board/drobotics_rdk_s100_camera_expansion_board_reference_design_v1p0.zip">参考设计</a></td>
      <td>2025-06-10</td>
      <td rowspan="2">参考设计。</td>
    </tr>
    <tr>
      <td>相机扩展板 12 通道</td>
      <td><a href="https://archive.d-robotics.cc/downloads/hardware/rdk_s100/rdk_s100_camera_expansion_board/rdk_s100_camera_expansion_board_12L/drobotics_rdk_s100_camera_expansion_board_reference_design.zip">参考设计</a></td>
      <td>2025-07-01</td>
    </tr>
    <tr>
      <td rowspan="2">产品实拍图</td>
      <td>相机扩展板</td>
      <td><a href="https://archive.d-robotics.cc/downloads/hardware/rdk_s100/rdk_s100_camera_expansion_board/drobotics_rdk_s100_camera_expansion_board.7z">产品实拍图</a></td>
      <td>2025-06-10</td>
      <td>产品实物图，便于进行产品材料二次编辑。</td>
    </tr>
    <tr>
      <td>相机扩展板 12 通道</td>
      <td><a href="https://archive.d-robotics.cc/downloads/hardware/rdk_s100/rdk_s100_camera_expansion_board/rdk_s100_camera_expansion_board_12L/d_robotics_rdk_s100_camera_expansion_board_12l_v1_0.7z">产品实拍图</a></td>
      <td>2026-07-01</td>
      <td>产品实物图，便于进行产品材料二次编辑。</td>
    </tr>
    <tr>
      <td>2D 图纸</td>
      <td>相机扩展板 12 通道</td>
      <td><a href="https://archive.d-robotics.cc/downloads/hardware/rdk_s100/rdk_s100_camera_expansion_board/rdk_s100_camera_expansion_board_12L/drobotics_rdk_s100_camera_expansion_board_12l_2d_v1p0_20260508.pdf">2D 图纸</a></td>
      <td>2025-07-01</td>
      <td>2D 图纸。</td>
    </tr>
    <tr>
      <td>产品渲染图</td>
      <td>相机扩展板 12 通道</td>
      <td><a href="https://archive.d-robotics.cc/downloads/hardware/rdk_s100/rdk_s100_camera_expansion_board/rdk_s100_camera_expansion_board_12L/drobotics_rdk_s100_camera_expansion_board_12l.zip">产品渲染图</a></td>
      <td>2025-07-01</td>
      <td>产品渲染图。</td>
    </tr>
  </tbody>
</table>

</div>

<br/><br/>

### RDK S100 MCU Port Expansion Board

<div className="table-responsive">

| 名称                                                                                                                                                                          | 版本   | 上传日期   | 说明文档                                                      |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ---------- | ------------------------------------------------------------- |
| [PCB STEP 模型](https://archive.d-robotics.cc/downloads/hardware/rdk_s100/rdk_s100_mcu_port_expansion_board/drobotics_rdk_s100_mcu_port_expansion_board_v1p0.step)            | V1.0.0 | 2025-06-10 | PCB 板 3D 模型，STEP 格式，便于进行机器人布局，外壳设计等。   |
| [FPC STEP 模型](https://archive.d-robotics.cc/downloads/hardware/rdk_s100/rdk_s100_mcu_port_expansion_board/drobotics_rdk_s100_mcu_port_expansion_board_fpc_v1p0.step)        | V1.0.0 | 2025-06-10 | FPC 排线 3D 模型，STEP 格式，便于进行机器人布局，外壳设计等。 |
| [参考设计](https://archive.d-robotics.cc/downloads/hardware/rdk_s100/rdk_s100_mcu_port_expansion_board/drobotics_rdk_s100_mcu_port_expansion_board_reference_design_v1p0.zip) | V1.0.0 | 2025-06-10 | 参考设计。                                                    |
| 产品渲染图                                                                                                                                                                    | V1.0.0 | 2025-06-10 | 产品渲染图片，便于产品材料二次编辑。                          |
| 产品实拍图                                                                                                                                                                    | V1.0.0 | 2025-06-10 | 产品实物图，便于进行产品材料二次编辑。                        |

</div>

<br/><br/>

## 规格书与设计资料汇总
### RDK S100

<div className="table-responsive">

| 名称                                                                                                            | 版本   | 上传日期   | 说明文档                                                  |
| --------------------------------------------------------------------------------------------------------------- | ------ | ---------- | --------------------------------------------------------- |
| [RDK S100规格书](https://archive.d-robotics.cc/downloads/hardware/rdk_s100/rdk_s100/d_robotics_rdk_s100_board_zh_v1_2.pdf)    | V1.2 | 2026-02-10 | 产品规格、特色、尺寸及型号等详细信息。 |                |

</div>

<br/><br/>

### RDK S100 Camera Expansion Board

<div className="table-responsive">

| 名称                                                                                                                                                                      | 版本   | 上传日期   | 说明文档                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ---------- | --------------------------------------------------------- |
| [RDK S100 相机扩展板规格书](https://archive.d-robotics.cc/downloads/hardware/rdk_s100/rdk_s100_camera_expansion_board/d_robotics_rdk_s100_camera_expansion_board_zh_v1_1.pdf)                | V1.1 | 2025-12-16 | 产品规格、特色、尺寸及型号等详细信息。 |
<!-- | [RDK S100 相机扩展板 12 通道规格书](https://archive.d-robotics.cc/downloads/hardware/rdk_s100/rdk_s100_camera_expansion_board/rdk_s100_camera_expansion_board_12L/d_robotics_rdk_s100_camera_expansion_board_12l_en_v1_0.pdf)                | V1.0 | 2026-07-01 | 产品规格、特色、尺寸及型号等详细信息。 | -->

</div>

<br/><br/>

### RDK S100 MCU Port Expansion Board

<div className="table-responsive">

| 名称                                                                                                                                                                          | 版本   | 上传日期   | 说明文档                                                      |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ---------- | ------------------------------------------------------------- |
| [MCU接口扩展板规格书](https://archive.d-robotics.cc/downloads/hardware/rdk_s100/rdk_s100_mcu_port_expansion_board/d_robotics_rdk_s100_mcu_port__expansion_board_zh_v1_1.pdf)            | V1.1 | 2025-12-16 | 产品规格、特色、尺寸及型号等详细信息。   |

</div>

<br/><br/>

## 认证资料

:::tip 认证资料总仓
📁 [Certification](https://archive.d-robotics.cc/downloads/certification/) - 包含所有产品的认证文件
:::

<div className="table-responsive">
<table>
  <thead>
    <tr>
      <th>🏷️ **产品名称**</th>
      <!-- <th>🇪🇺 **CE RED**</th> -->
      <th>🇪🇺 **CE EMC**</th>
      <th>🇺🇸 **FCC**</th>
      <!-- <th>🇯🇵 **MIC**</th> -->
      <!-- <th>🇨🇳 **SRRC**</th> -->
      <th>🇰🇷 **KCC**</th>
      <th>🇬🇧 **UKCA**</th>
      <th>🇪🇺 **RoHS**</th>
      <!-- <th>🇹🇭 **NBTC**</th>
      <th>🇲🇾 **SIRIM**</th> --> 
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>**RDK S100**</td>
      <!-- <td><a href="https://archive.d-robotics.cc/downloads/certification/RDK_X5/CE-RED210115.pdf">📄 CE RED</a></td> -->
      <td><a href="https://archive.d-robotics.cc/downloads/certification/RDK_S100/RDK_S100/CE/AOC_CE.pdf">📄 CE EMC</a></td>
      <td><a href="https://archive.d-robotics.cc/downloads/certification/RDK_S100/RDK_S100/FCC/FCC_EMC_Report.pdf">📄 FCC</a></td>
      <!-- <td><a href="https://archive.d-robotics.cc/downloads/certification/RDK_X5/D-ROBOTICS%20211-241225%20MIC%20Radio%20Certificate.pdf">📄 MIC</a></td> -->
      <!-- <td><a href="https://archive.d-robotics.cc/downloads/certification/RDK_X5/SRRC.pdf">📄 SRRC</a></td> -->
      <td><a href="https://archive.d-robotics.cc/downloads/certification/RDK_S100/RDK_S100/KCC/KS1E55Y.pdf">📄 KCC</a></td>
      <td><a href="https://archive.d-robotics.cc/downloads/certification/RDK_S100/RDK_S100/UKCA/AOC_UK.pdf">📄 UKCA</a></td>
      <td><a href="https://archive.d-robotics.cc/downloads/certification/RDK_S100/RDK_S100/ROHS/2501Y83065E_RDK_S100_ROHS.pdf">📄 RoHS</a></td>
      <!-- <td><a href="https://archive.d-robotics.cc/downloads/certification/RDK_X5/NBTC.pdf">📄 NBTC</a></td>
      <td><a href="https://archive.d-robotics.cc/downloads/certification/RDK_X5/SIRIM.pdf">📄 SIRIM</a></td> -->
    </tr>
    <tr>
      <td>**RDK S100 SIP**</td>
      <!-- <td><a href="https://archive.d-robotics.cc/downloads/certification/RDK_X3/CE/C03-2402T78337E-RF%20C2%20RED%20210115.pdf">📄 CE RED</a></td> -->
      <td>-</td>
      <td><a href="https://archive.d-robotics.cc/downloads/certification/RDK_S100/RDK_S100_SIP/FCC/S100_SIP_FCC_EMC_Report.pdf">📄 FCC</a></td>
      <!-- <td><a href="https://archive.d-robotics.cc/downloads/certification/RDK_X3/MIC/D-ROBOTICS%20211-240607%20MIC%20Radio%20Certificate.pdf">📄 MIC</a></td> -->
      <!-- <td><a href="https://archive.d-robotics.cc/downloads/certification/RDK_X3/SRRC/SRRC_Approval_RDK_X3.pdf">📄 SRRC</a></td> -->
      <td>-</td>
      <td><a href="https://archive.d-robotics.cc/downloads/certification/RDK_S100/RDK_S100_SIP/UKCA/C34-AOC2502V68690E_for_UK.pdf">📄 UKCA</a></td>
      <td><a href="https://archive.d-robotics.cc/downloads/certification/RDK_S100/RDK_S100_SIP/ROHS/2501Y83065E-M1.pdf">📄 RoHS</a></td>
      <!-- <td>-</td>
      <td>-</td> -->
    </tr>
    <tr>
      <td>**RDK S100 MCU Port Expansion Board**</td>
      <!-- <td><a href="https://archive.d-robotics.cc/downloads/certification/RDK_X3_MD/CE/C03-%202402T78342E-RF%20C2%20RED%20210115.pdf">📄 CE RED</a></td> -->
      <!-- <td>-</td> -->
      <td>-</td>
      <!-- <td><a href="https://archive.d-robotics.cc/downloads/certification/RDK_X3_MD/MIC/D-ROBOTICS%20211-240608%20MIC%20Radio%20Certificate.pdf">📄 MIC</a></td> -->
      <td>-</td>
      <td>-</td>
      <td>-</td>
      <td><a href="https://archive.d-robotics.cc/downloads/certification/RDK_S100/RDK_S100_MCU_Board/ROHS/2501Y83067E_CNAS.PDF">📄 RoHS</a></td>
      <!-- <td>-</td>
      <td>-</td> -->
    </tr>
    <tr>
      <td>**RDK S100 Camera Expansion Board**</td>
      <td><a href="https://archive.d-robotics.cc/downloads/certification/RDK_S100/RDK_S100_Camera_Board/CE/AOC_CE.pdf">📄 CE EMC</a></td>
      <!-- <td>-</td> -->
      <td><a href="https://archive.d-robotics.cc/downloads/certification/RDK_S100/RDK_S100_Camera_Board/FCC/RDK S100_Camera_Expansion_Board_FCC_EMC_Report.pdf">📄 FCC</a></td>
      <!-- <td><a href="https://archive.d-robotics.cc/downloads/certification/RDK_X3_MD/MIC/D-ROBOTICS%20211-240608%20MIC%20Radio%20Certificate.pdf">📄 MIC</a></td> -->
      <!-- <td>-</td> -->
      <td>-</td>
      <td><a href="https://archive.d-robotics.cc/downloads/certification/RDK_S100/RDK_S100_Camera_Board/UKCA/AOC_UK.pdf">📄 UKCA</a></td>
      <td><a href="https://archive.d-robotics.cc/downloads/certification/RDK_S100/RDK_S100_Camera_Board/ROHS/2501Y83066E_CNAS.PDF">📄 RoHS</a></td>
      <!-- <td>-</td>
      <td>-</td> -->
    </tr>
  </tbody>
</table>
</div>

</TabItem>

<TabItem value="ftp" label="FTP下载">

## 系统软件


<div className="table-responsive">
  <table>
    <thead>
      <tr>
        <th>名称</th>
        <th>内容</th>
        <th>下载地址</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td rowspan="2">BSP</td>
        <td>预编译镜像与 deb 包</td>
        <td>/RDKS100_V4.0.5-20260507/RDKS100_LNX_SDK/RDKS100_V4.0.5-20260507/board_support_package/firmwares/</td>
      </tr>
      <tr>
        <td>BSP 源码</td>
        <td>/RDKS100_V4.0.5-20260507/RDKS100_LNX_SDK/RDKS100_V4.0.5-20260507/board_support_package/platform_source_code.tar.gz</td>
      </tr>
      <tr>
        <td rowspan="2">MCU</td>
        <td>MCU 预编译镜像</td>
        <td>/RDKS100_V4.0.5-20260507/RDKS100_LNX_SDK/RDKS100_V4.0.5-20260507/RDKS100_MCU_SDK/board_support_package/firmwares/</td>
      </tr>
      <tr>
        <td>MCU SDK（源码形式）</td>
        <td>/RDKS100_V4.0.5-20260507/RDKS100_LNX_SDK/RDKS100_V4.0.5-20260507/RDKS100_MCU_SDK/board_support_package/mcu-platform_source_code.tar.gz</td>
      </tr>
    </tbody>
  </table>
</div>

<br/><br/>

## 工具下载

<div className="table-responsive">
  <table>
    <thead>
      <tr>
        <th colspan="2">名称</th>
        <!-- <th>最新版本</th> -->
        <th>下载地址</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td colspan="2">Xburn</td>
        <!-- <td>V1.2.1</td> -->
        <td>[下载地址](https://archive.d-robotics.cc/downloads/software_tools/download_tools/)</td>
      </tr>
      <tr>
        <td colspan="2">hbplayer</td>
        <!-- <td>V2.7</td> -->
        <td>/RDKS100_V4.0.5-20260507/RDKS100_LNX_SDK/RDKS100_V4.0.5-20260507/software_tools/hbplayerv2.7.zip</td>
      </tr>
      <tr>
        <td rowspan="2">算法工具链</td>
        <td>OE 开发包</td>
        <!-- <td> V3.7.0</td> -->
        <td>[OE 开发包](./07_Advanced_development/10_algorithm_toolchain/01_algorithm_toolchain/01_overview.md)</td>
      </tr>
      <tr>
        <td>OE-LLM 开发包</td>
        <!-- <td> V1.0.2</td> -->
        <td>[OE-LLM 开发包](./07_Advanced_development/10_algorithm_toolchain/02_LLM_Toolchain/01_rdk_s100/01_s100_LLM_Toolchain.md)</td>
      </tr>
      <tr>
        <td colspan="2">ISP 工具</td>
        <!-- <td> V3.52</td> -->
        <td>工具：RDKS100_V4.0.5-20260507/RDKS100_LNX_SDK/RDKS100_V4.0.5-20260507/software_tools/calibraiton%20tool%20v3.52.zip<br/>手册：/RDKS100_V4.0.5-20260507/RDKS100_LNX_SDK/RDKS100_V4.0.5-20260507/user_manual/</td>
      </tr>
      <tr>
        <td rowspan="2">驱动工具</td>
        <td>winusb drivers</td>
        <!-- <td>-</td> -->
        <td>/RDKS100_V4.0.5-20260507/RDKS100_LNX_SDK/RDKS100_V4.0.5-20260507/software_tools/winusb_drivers/</td>
      </tr>
      <tr>
        <td>serial to usb drivers</td>
        <!-- <td>-</td> -->
        <td>/RDKS100_V4.0.5-20260507/RDKS100_LNX_SDK/RDKS100_V4.0.5-20260507/software_tools/serial_to_usb_drivers/</td>
      </tr>
      <tr>
        <td colspan="2">adb and fastboot</td>
        <!-- <td>-</td> -->
        <td>/RDKS100_V4.0.5-20260507/RDKS100_LNX_SDK/RDKS100_V4.0.5-20260507/software_tools/adb_and_fastboot/</td>
      </tr>
      <tr>
        <td colspan="2">MCU 交叉编译工具链</td>
        <!-- <td>-</td> -->
        <td>/RDKS100_V4.0.5-20260507/RDKS100_LNX_SDK/RDKS100_V4.0.5-20260507/RDKS100_MCU_SDK/cross_compile_toolchain/</td>
      </tr>
    </tbody>
  </table>
</div>

<br/><br/>


## 硬件资料

### RDK S100

<div className="table-responsive">
<table>
  <thead>
    <tr>
      <!-- <th>名称</th> -->
      <th>内容</th>
      <th>下载地址</th>
    </tr>
  </thead>
  <tbody>
    <!-- <tr>
      <td rowspan="2">Brief</td>
      <!-- <td>RDK S600 Module Brief</td> -->
      <!-- <td>/RDKS600_V5.1.0/RDKS600_datasheet_and_design_guide/Datasheet/drobotics_rdk_s600_module_brief_v1p0_zh.pdf</td>
    </tr>
    <tr>
      <!-- <td>RDK S600 Brief</td> -->
      <!-- <td>/RDKS600_V5.1.0/RDKS600_datasheet_and_design_guide/Datasheet/drobotics_rdk_s600_brief_v1p0_zh.pdf</td>
    </tr> --> 
    <tr> 
      <td>Datasheet</td>
      <!-- <td>RDK S600 Module Datasheet</td> -->
      <td>/RDKS100_V4.0.5-20260507/RDKS100_datasheet_and_design_guide/Datasheet/</td>
    </tr>
    <tr>
      <td>Hardware Design Guide</td>
      <!-- <td>RDK_S600_Module_Assembly_Guide</td> -->
      <td>/RDKS100_V4.0.5-20260507/RDKS100_datasheet_and_design_guide/HardwareDesignGuide/</td>
    </tr>
    <tr>
      <td>Hardware Reference Design</td>
      <!-- <td>RDK S600 Module Reference Design</td> -->
      <td>/RDKS100_V4.0.5-20260507/RDKS100_datasheet_and_design_guide/HardwareInterface/</td>
    </tr>
    <tr>
      <td>Pinlist</td>
      <!-- <td>RDK S600 Module 699-Pin B2B Connector Application Note</td> -->
      <td>/RDKS100_V4.0.5-20260507/RDKS100_datasheet_and_design_guide/Pinlist</td>
    </tr>
    <tr>
      <td>Typical Scenario Power Consumption</td>
      <!-- <td>RDK S600 Typical Scenario Power Consumption</td> -->
      <td>/RDKS100_V4.0.5-20260507/RDKS100_datasheet_and_design_guide/TypicalScenarioPowerConsumption/</td>
    </tr>
  </tbody>
</table>
</div>

<br/><br/>

### RDK S100 Camera Expansion Board
<div className="table-responsive">
<table>
  <thead>
    <tr>
      <th>名称</th>
      <!-- <th>内容</th> -->
      <th>下载地址</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Hardware Interface</td>
      <!-- <td>3D 图</td> -->
      <td>/RDKS100_V4.0.5-20260507/RDKS100_datasheet_and_design_guide/HardwareInterface/</td>
    </tr>
    <tr>
      <td>Hardware Reference Design</td>
      <!-- <td>RDK S600 Camera Board Reference Design</td> -->
      <td>/RDKS100_V4.0.5-20260507/RDKS100_datasheet_and_design_guide/HardwareReferenceDesign/</td>
    </tr>
  </tbody>
</table>
</div>

<br/><br/>

### RDK S100 MCU Port Expansion Board

<div className="table-responsive">
<table>
  <thead>
    <tr>
      <th>名称</th>
      <!-- <th>内容</th> -->
      <th>下载地址</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Hardware Interface</td>
      <!-- <td>3D 图</td> -->
      <td>/RDKS100_V4.0.5-20260507/RDKS100_datasheet_and_design_guide/HardwareInterface/</td>
    </tr>
    <tr>
      <td>Hardware Reference Design</td>
      <!-- <td>RDK S600 Camera Board Reference Design</td> -->
      <td>/RDKS100_V4.0.5-20260507/RDKS100_datasheet_and_design_guide/HardwareReferenceDesign/</td>
    </tr>
  </tbody>
</table>
</div>

</TabItem>
</Tabs>

</DocScope>





<DocScope products="RDK S600">



:::warning 注意

RDK S600 商业资料请切换至 **FTP下载** 选项，根据表格中的路径，在 FTP 服务器中获取。

:::



<Tabs groupId="download" defaultValue="online">
<TabItem value="online" label="在线下载">


## 系统软件

<div className="table-responsive">
  <table>
    <thead>
      <tr>
        <th>名称</th>
        <th>最新版本</th>
        <th>上传日期</th>
        <th>说明</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>[系统镜像](https://archive.d-robotics.cc/downloads/os_images/rdk_s600/)</td>
        <td>V5.1.0</td>
        <td>2026-06-22</td>
        <td>预编译镜像与deb包。</td>
      </tr>
       <tr>
        <td>[BSP 源码](https://developer.d-robotics.cc/resource)</td>
        <td>V5.1.0</td>
        <td>2026-06-22</td>
        <td>BSP 源码。</td>
      </tr>
      <tr>
        <td>[MCU Cluster-1 镜像](https://archive.d-robotics.cc/downloads/os_images/rdk_s600/RDKS600-V5.1.0/RDK_MCU_SDK/firmwares/)</td>
        <td>V5.1.0</td>
        <td>2026-06-22</td>
        <td>MCU Cluster-1 预编译镜像。</td>
      </tr>
      <tr>
        <td>[MCU Cluster-1 SDK](https://archive.d-robotics.cc/downloads/os_images/rdk_s600/RDKS600-V5.1.0/RDK_MCU_SDK/mcu-community.tar.gz)</td>
        <td>V5.1.0</td>
        <td>2026-06-22</td>
        <td>MCU Cluster-1 SDK（静态链接库）。</td>
      </tr>
    </tbody>
  </table>
</div>

<br/><br/>

## 工具下载

<div className="table-responsive">
  <table>
    <thead>
      <tr>
        <th colspan="2">名称</th>
        <th>最新版本</th>
        <th>上传日期</th>
        <th>说明</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td colspan="2"><a href="https://archive.d-robotics.cc/downloads/software_tools/download_tools/">Xburn</a></td>
        <td>V1.2.1</td>
        <td>2026-06-12</td>
        <td>镜像烧录工具。</td>
      </tr>
      <tr>
        <td colspan="2"><a href="https://archive.d-robotics.cc/downloads/hobotplayer/">hbplayer</a></td>
        <td>V2.7</td>
        <td>2026-01-27</td>
        <td>图像浏览工具。</td>
      </tr>
      <tr>
        <td rowspan="2">算法工具链</td>
        <td>[OE 开发包](./07_Advanced_development/10_algorithm_toolchain/01_algorithm_toolchain/01_overview.md)</td>
        <td> V3.7.0</td>
        <td>2026-06-22</td>
        <td>OE 开发包。</td>
      </tr>
      <tr>
        <td>[OE LLM 开发包](https://developer.d-robotics.cc/rdk_s_doc/07_Advanced_development/04_toolchain_development/02_LLM_Toolchain/02_rdk_s600?v=5.1.0&p=RDK+S600)</td>
        <td> V1.0.2</td>
        <td>2026-06-22</td>
        <td>OE LLM 开发包。</td>
      </tr>
      <tr>
        <td colspan="2">[winusb_drivers](https://archive.d-robotics.cc/downloads/software_tools/winusb_drivers/)</td>
        <td>-</td>
        <td>2026-06-22</td>
        <td rowspan="2">必要的系统驱动程序，确保设备正常连接和通信。</td>
      </tr>
      <tr>
        <td colspan="2">[serial_to_usb_drivers](https://archive.d-robotics.cc/downloads/software_tools/serial_to_usb_drivers/)</td>
        <td>-</td>
        <td>2026-06-22</td>
      </tr>
      <tr>
        <td colspan="2">[adb_and_fastboot](https://archive.d-robotics.cc/downloads/software_tools/adb_and_fastboot/)</td>
        <td>-</td>
        <td>2026-06-22</td>
        <td>-</td>
      </tr>

    </tbody>
  </table>
</div>

<br/><br/>


## 硬件资料

### RDK S600

<div className="table-responsive">
<table>
  <thead>
    <tr>
      <th>类别</th>
      <th>下载地址</th>
      <th>说明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowspan="2">Brief</td>
      <td><a href="https://archive.d-robotics.cc/downloads/hardware/rdk_s600/rdk_s600/brief/drobotics_rdk_s600_module_brief_v1p0_zh.pdf">RDK S600 Module Brief</a></td>
      <td rowspan="2">产品规格、特色、尺寸及型号等详细信息。</td>
    </tr>
    <tr>
      <td><a href="https://archive.d-robotics.cc/downloads/hardware/rdk_s600/rdk_s600/brief/drobotics_rdk_s600_brief_v1p0_zh.pdf">RDK S600 Brief</a></td>
    </tr>
    <tr>
      <td rowspan="2">3D Model</td>
      <td><a href="https://archive.d-robotics.cc/downloads/hardware/rdk_s600/rdk_s600/3d_model/RDK_S600_Kit_3D_Model_V1P0_20260420.stp">RDK S600 Developer Kit</a></td>
      <td rowspan="2">三维模型。</td>
    </tr>
    <tr>
      <td><a href="https://archive.d-robotics.cc/downloads/hardware/rdk_s600/rdk_s600/3d_model/RDK_S600_3D_Model_Information_Readme_V1P0_20260420.pdf">3D Model Information README</a></td>
    </tr> 
  </tbody>
</table>
</div>

<br/><br/>

### RDK S600 Camera Expansion Board

<div className="table-responsive">
<table>
  <thead>
    <tr>
      <th>类别</th>
      <th>下载地址</th>
      <th>说明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Brief</td>
      <td><a href="https://archive.d-robotics.cc/downloads/hardware/rdk_s600/rdk_s600_camera_expansion_board/drobotics_rdk_s600_camera_expansion_board_brief_v1p0_zh.pdf">RDK S600 Camera Expansion Board Brief</a></td>
      <td>产品规格、特色、尺寸及型号等详细信息。</td>
    </tr>
    <tr>
      <td>Hardware Reference Design</td>
      <td><a href="https://archive.d-robotics.cc/downloads/hardware/rdk_s600/rdk_s600_camera_expansion_board/hardware_reference_design/">RDK S600 Camera Board Reference Design</a></td>
      <td>参考设计资料。</td>
    </tr>
    <tr>
      <td>3D Model</td>
      <td><a href="https://archive.d-robotics.cc/downloads/hardware/rdk_s600/rdk_s600_camera_expansion_board/RDK_S600_CAMERA_EXPANSION_BOARD_3D_Model_V1P0_20260420.STEP">RDK S600 Camera Expansion Board</a></td>
      <td>三维模型。</td>
    </tr>
  </tbody>
</table>
</div>

<br/><br/>

### RDK S600 MCU Port Expansion Board

<div className="table-responsive">
<table>
  <thead>
    <tr>
      <th>类别</th>
      <th>下载地址</th>
      <th>说明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Brief</td>
      <td><a href="https://archive.d-robotics.cc/downloads/hardware/rdk_s600/rdk_s600_mcu_port_expansion_board/drobotics_rdk_s600_mcu_port_expansion_board_brief_v1p0_zh.pdf">RDK S600 MCU Port Expansion Board Brief</a></td>
      <td>产品规格、特色、尺寸及型号等详细信息。</td>
    </tr>
    <tr>
      <td>Hardware Reference Design</td>
      <td><a href="https://archive.d-robotics.cc/downloads/hardware/rdk_s600/rdk_s600_mcu_port_expansion_board/hardware_reference_design/">RDK S600 MCU Board Reference Design</a></td>
      <td>参考设计资料。</td>
    </tr>
    <tr>
      <td>3D Model</td>
      <td><a href="https://archive.d-robotics.cc/downloads/hardware/rdk_s600/rdk_s600_mcu_port_expansion_board/RDK_S600_MCU_PORT_EXPANSION_BOARD_3D_Model_V1P0_20260420.STEP">RDK S600 MCU Port Expansion Board</a></td>
      <td>三维模型。</td>
    </tr>
   
  </tbody>
</table>
</div>
</TabItem>

<TabItem value="ftp" label="FTP下载">

## 系统软件


<div className="table-responsive">
  <table>
    <thead>
      <tr>
        <th>名称</th>
        <th>内容</th>
        <th>下载地址</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td rowspan="3">BSP</td>
        <td>预编译镜像与deb包</td>
        <td>/RDKS600_V5.1.0/RDKS600_LNX_SDK/RDKS600_V5.1.0/board_support_package/firmwares</td>
      </tr>
      <tr>
        <td>BSP源码</td>
        <td>/RDKS600_V5.1.0/RDKS600_LNX_SDK/RDKS600_V5.1.0/board_support_package/platform_source_code.tar.gz</td>
      </tr>
      <tr>
        <td>BSP 源码 MD5</td>
        <td>/RDKS600_V5.1.0/RDKS600_LNX_SDK/RDKS600_V5.1.0/board_support_package/platform_source_code.tar.gz.md5sum</td>
      </tr>
      <tr>
        <td rowspan="2">MCU</td>
        <td>MCU Cluster-1 预编译镜像</td>
        <td>/RDKS600_V5.1.0/RDKS600_LNX_SDK/RDKS600_V5.1.0/RDKS600_MCU_SDK/board_support_package/firmwares/mcu1-product.zip</td>
      </tr>
      <tr>
        <td>MCU Cluster-1 SDK（源码形式）</td>
        <td>/RDKS600_V5.1.0/RDKS600_LNX_SDK/RDKS600_V5.1.0/RDKS600_MCU_SDK/board_support_package/mcu-platform_source_code.tar.gz</td>
      </tr>

    </tbody>
  </table>
</div>

<br/><br/>

## 工具下载

<div className="table-responsive">
  <table>
    <thead>
      <tr>
        <th colspan="2">名称</th>
        <th>最新版本</th>
        <th>下载地址</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td colspan="2">Xburn</td>
        <td>V1.2.1</td>
        <td>/RDKS600_V5.1.0/RDKS600_LNX_SDK/RDKS600_V5.1.0/software_tools/xburn</td>
      </tr>
      <tr>
        <td colspan="2">hbplayer</td>
        <td>V2.7</td>
        <td>/RDKS600_V5.1.0/RDKS600_LNX_SDK/RDKS600_V5.1.0/software_tools/hbplayerv2.7.zip</td>
      </tr>
      <tr>
        <td rowspan="2">算法工具链</td>
        <td>OE 开发包</td>
        <td> V3.7.0</td>
        <td>[OE 开发包](./07_Advanced_development/10_algorithm_toolchain/01_algorithm_toolchain/01_overview.md)</td>
      </tr>
      <tr>
        <td>OE-LLM 开发包</td>
        <td> V1.0.2</td>
        <td>[OE-LLM 开发包](https://developer.d-robotics.cc/rdk_s_doc/07_Advanced_development/04_toolchain_development/02_LLM_Toolchain/02_rdk_s600?v=5.1.0&p=RDK+S600)</td>
      </tr>
      <tr>
        <td colspan="2">ISP 工具</td>
        <td> V3.52</td>
        <td>工具：/RDKS600_V5.1.0/RDKS600_LNX_SDK/RDKS600_V5.1.0/software_tools/calibraiton tool v3.52.zip<br/>手册：/RDKS600_V5.1.0/RDKS600_LNX_SDK/RDKS600_V5.1.0/user_manual/</td>
      </tr>
      <tr>
        <td rowspan="2">驱动工具</td>
        <td>winusb drivers</td>
        <td>-</td>
        <td>/RDKS600_V5.1.0/RDKS600_LNX_SDK/RDKS600_V5.1.0/software_tools/winusb_drivers/</td>
      </tr>
      <tr>
        <td>serial to usb drivers</td>
        <td>-</td>
        <td>/RDKS600_V5.1.0/RDKS600_LNX_SDK/RDKS600_V5.1.0/software_tools/serial_to_usb_drivers/</td>
      </tr>
      <tr>
        <td colspan="2">adb and fastboot</td>
        <td>-</td>
        <td>/RDKS600_V5.1.0/RDKS600_LNX_SDK/RDKS600_V5.1.0/software_tools/adb_and_fastboot/</td>
      </tr>
    </tbody>
  </table>
</div>

<br/><br/>


## 硬件资料

### RDK S600

<div className="table-responsive">
<table>
  <thead>
    <tr>
      <!-- <th>名称</th> -->
      <th>内容</th>
      <th>下载地址</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowspan="2">Brief</td>
      <!-- <td>RDK S600 Module Brief</td> -->
      <td>/RDKS600_V5.1.0/RDKS600_datasheet_and_design_guide/Datasheet/drobotics_rdk_s600_module_brief_v1p0_zh.pdf</td>
    </tr>
    <tr>
      <!-- <td>RDK S600 Brief</td> -->
      <td>/RDKS600_V5.1.0/RDKS600_datasheet_and_design_guide/Datasheet/drobotics_rdk_s600_brief_v1p0_zh.pdf</td>
    </tr>
    <tr>
      <td>Datasheet</td>
      <!-- <td>RDK S600 Module Datasheet</td> -->
      <td>/RDKS600_V5.1.0/RDKS600_datasheet_and_design_guide/Datasheet/RDK_S600_Module_Datasheet_V1.0.1_20260610.pdf</td>
    </tr>
    <tr>
      <td rowspan="6">Hardware Design Guide</td>
      <!-- <td>RDK_S600_Module_Assembly_Guide</td> -->
      <td>/RDKS600_V5.1.0/RDKS600_datasheet_and_design_guide/HardwareDesignGuide/RDK_S600_Module_Assembly_Guide_V1P0_20250610.zip</td>
    </tr>
    <tr>
      <!-- <td>RDK_S600_Module_Hardware_Design_Checklist</td> -->
      <td>/RDKS600_V5.1.0/RDKS600_datasheet_and_design_guide/HardwareDesignGuide/RDK_S600_Module_Hardware_Design_Checklist_V1.0.1_20260610.xlsx</td>
    </tr>
    <tr>
      <!-- <td>RDK S600 Module Hardware Design Guide</td> -->
      <td>/RDKS600_V5.1.0/RDKS600_datasheet_and_design_guide/HardwareDesignGuide/RDK_S600_Module_Hardware_Design_Guide_V1.0.1_20260610.pdf</td>
    </tr>
    <tr>
      <!-- <td>RDK_S600_Module_Pin_Delay</td> -->
      <td>/RDKS600_V5.1.0/RDKS600_datasheet_and_design_guide/HardwareDesignGuide/RDK_S600_Module_Pin_Delay_V1P0_20260422.csv</td>
    </tr>
    <tr>
      <!-- <td>RDK S600 Module Thermal Design Guide</td> -->
      <td>/RDKS600_V5.1.0/RDKS600_datasheet_and_design_guide/HardwareDesignGuide/RDK_S600_Module_Thermal_Design_Guide_V1P0_20260420.pdf</td>
    </tr>
    <tr>
      <!-- <td>RDK_S600_Moudle_Thermal_Simulation_Model</td> -->
      <td>/RDKS600_V5.1.0/RDKS600_datasheet_and_design_guide/HardwareDesignGuide/RDK_S600_Moudle_Thermal_Simulation_Model_V1P0_20260420.tzr</td>
    </tr>
    <tr>
      <td>Hardware Reference Design</td>
      <!-- <td>RDK S600 Module Reference Design</td> -->
      <td>/RDKS600_V5.1.0/RDKS600_datasheet_and_design_guide/HardwareReferenceDesign/RDK_S600_Module_Carrier_Board/</td>
    </tr>
    <tr>
      <td rowspan="3">3D Model</td>
      <!-- <td>RDK S600 Module</td> -->
      <td>/RDKS600_V5.1.0/RDKS600_datasheet_and_design_guide/HardwareReferenceDesign/RDK_S600_3D/RDK_S600_Module_3D_Model_V1P0_20260420.STEP</td>
    </tr>
    <tr>
      <!-- <td>RDK S600 Developer Kit</td> -->
      <td>/RDKS600_V5.1.0/RDKS600_datasheet_and_design_guide/HardwareReferenceDesign/RDK_S600_3D/RDK_S600_Kit_3D_Model_V1P0_20260420.stp</td>
    </tr>
    <tr>
      <!-- <td>3D Model Information README</td> -->
      <td>/RDKS600_V5.1.0/RDKS600_datasheet_and_design_guide/HardwareReferenceDesign/RDK_S600_3D/RDK_S600_3D_Model_Information_Readme_V1P0_20260420.pdf</td>
    </tr>
    <tr>
      <td>Pinlist</td>
      <!-- <td>RDK S600 Module 699-Pin B2B Connector Application Note</td> -->
      <td>/RDKS600_V5.1.0/RDKS600_datasheet_and_design_guide/Pinlist/RDK_S600_Module_699-Pin_B2B_Connector_Application_Note_V1P0_20260428.xlsx</td>
    </tr>
    <tr>
      <td>Typical Scenario Power Consumption</td>
      <!-- <td>RDK S600 Typical Scenario Power Consumption</td> -->
      <td>/RDKS600_V5.1.0/RDKS600_datasheet_and_design_guide/TypicalScenarioPowerConsumption/RDK_S600_Typical_Scenario_Power_Consumption_V1P0_20260428.pdf</td>
    </tr>
  </tbody>
</table>
</div>

<br/><br/>

### RDK S600 Camera Expansion Board
<div className="table-responsive">
<table>
  <thead>
    <tr>
      <th>名称</th>
      <!-- <th>内容</th> -->
      <th>下载地址</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Brief</td>
      <!-- <td>RDK S600 Camera Expansion Board Brief</td> -->
      <td>/RDKS600_V5.1.0/RDKS600_datasheet_and_design_guide/Datasheet/drobotics_rdk_s600_camera_expansion_board_brief_v1p0_zh.pdf</td>
    </tr>
    <tr>
      <td>Hardware Reference Design</td>
      <!-- <td>RDK S600 Camera Board Reference Design</td> -->
      <td>/RDKS600_V5.1.0/RDKS600_datasheet_and_design_guide/HardwareReferenceDesign/RDK_S600_CAMERA_EXPANSION_BOARD/</td>
    </tr>
    <tr>
      <td>3D Model</td>
      <!-- <td>RDK S600 Camera Expansion Board</td> -->
      <td>/RDKS600_V5.1.0/RDKS600_datasheet_and_design_guide/HardwareReferenceDesign/RDK_S600_3D/RDK_S600_CAMERA_EXPANSION_BOARD_3D_Model_V1P0_20260420.STEP</td>
    </tr>
  </tbody>
</table>
</div>

<br/><br/>

### RDK S600 MCU Port Expansion Board

<div className="table-responsive">
<table>
  <thead>
    <tr>
      <th>名称</th>
      <!-- <th>内容</th> -->
      <th>下载地址</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Brief</td>
      <!-- <td>RDK S600 MCU Port Expansion Board Brief</td> -->
      <td>/RDKS600_V5.1.0/RDKS600_datasheet_and_design_guide/Datasheet/drobotics_rdk_s600_mcu_port_expansion_board_brief_v1p0_zh.pdf</td>
    </tr>
    <tr>
      <td>Hardware Reference Design</td>
      <!-- <td>RDK S600 MCU Board Reference Design</td> -->
      <td>/RDKS600_V5.1.0/RDKS600_datasheet_and_design_guide/HardwareReferenceDesign/RDK_S600_MCU_PORT_EXPANSION_BOARD/</td>
    </tr>
    <tr>
      <td>3D Model</td>
      <!-- <td>RDK S600 MCU Port Expansion Board</td> -->
      <td>/RDKS600_V5.1.0/RDKS600_datasheet_and_design_guide/HardwareReferenceDesign/RDK_S600_3D/RDK_S600_MCU_PORT_EXPANSION_BOARD_3D_Model_V1P0_20260420.STEP</td>
    </tr>
  </tbody>
</table>
</div>

</TabItem>
</Tabs>


</DocScope>
## 文档导航

- **第 1 章 [快速开始](/Quick_start)**：硬件介绍、外设连接、烧录、入门配置、远程登录。
- **第 2 章 [系统配置](/System_configuration)**：网络、蓝牙、系统更新、srpi-config、config.txt、显示音频、存储、时钟、用户权限、日志、调试串口。
- **第 3 章 [开发示例](/Demos)**：外设、多媒体、算法（分类/检测/分割/姿态/语音/摄像头推理）demo，C/C++ 与 Python 对照。
- **第 4 章 [简易 API](/Simple_API)**：多媒体与推理的封装层简易接口。
- **第 5 章 [进阶开发](/Advanced_development)**：deb/系统软件/驱动/多媒体/MCU/算法工具链/VDSP（模式 3）。
- **第 6 章 [常见问题](/FAQ)**：按问题域分类的 FAQ。
- **第 7 章 [附录](/Appendix)**：RDK 专属命令与 Linux 命令用法。

## 三模式导览

| 模式 | 读者 | 推荐路径 |
|---|---|---|
| 模式 1 直接使用 | 个人/极客/学生 | 第 1 章快速开始 → 第 2 章系统配置 → 第 3 章开发示例 → 第 4 章简易 API |
| 模式 2 产品集成 | 产品公司研发 | 第 2 章系统配置 + 第 5 章进阶开发中的系统定制（apt/配置层/重制镜像） |
| 模式 3 高度定制 | 商业客户/深度团队 | 第 5 章进阶开发全章（deb/驱动/多媒体/MCU/工具链/VDSP） |

详见 产品共识（标准仓库）§3。

## 版本发布

### RDK S100 版本发布

- [RDKS100_LNX_SDK_V4.0.5_20260507](./10_Release_Note/01_s100/01_v4_0_5_260507.md)
- [RDKS100_LNX_SDK_V4.0.5](./10_Release_Note/01_s100/02_v4_0_5.md)
- [RDKS100_LNX_SDK_V4.0.4](./10_Release_Note/01_s100/03_v4_0_4.md)
- [RDKS100_LNX_SDK_V4.0.3](./10_Release_Note/01_s100/04_v4_0_3.md)
- [RDKS100_LNX_SDK_V4.0.2](./10_Release_Note/01_s100/05_v4_0_2.md)

### RDK S600 版本发布

- [RDKS600_LNX_SDK_V5.1.0](./10_Release_Note/02_s600/03_v5_1_0.md)
- [RDKS600_LNX_SDK_V5.0.1_BETA](./10_Release_Note/02_s600/02_v5_0_1.md)
- [RDKS600_LNX_SDK_V5.0.0_BETA](./10_Release_Note/02_s600/01_v5_0_0.md)

## 生态项目对接

针对基于 RDK 平台的产品开发、行业落地或批量部署项目，设立 **"地瓜生态项目对接中心"** 作为统一协同入口。

当您涉及以下场景时，建议通过该入口提交项目信息：

- 产品化或量产规划
- 系统架构评估与方案确认
- 模块适配与性能优化支持
- 商业项目联合开发
- 批量采购前的技术确认

👉 项目对接入口：[地瓜生态项目对接交流](https://horizonrobotics.feishu.cn/share/base/form/shrcnpxBa3PjdjFmtxZS3tBXw0e)

:::note 说明
本入口适用于明确的项目或商业落地需求。日常技术问题建议优先通过论坛问答或 [FAQ](/FAQ) 章节解决。
:::
