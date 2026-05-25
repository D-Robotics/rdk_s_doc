---
sidebar_position: 1
---

# 7.1.1 硬件资料

```mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import DocScope from '@site/src/components/DocScope';
```

本章节提供产品手册和设计资料，帮助开发者全面了解产品，并为硬件设计工作提供指导。

<DocScope products="RDK S600">

:::warning 注意

对于 RDK S600 Early Access 用户，请先阅读：[**RDK S600 早期试用说明（Early Access Note）**](https://horizonrobotics.feishu.cn/wiki/IHX3wmvS8iWM5vkEcIqcBmY7nAd?from=from_copylink)

:::

:::warning 注意

RDK S600 资料请根据表格中的路径，在 FTP 服务器中获取。

:::

</DocScope>



<DocScope products="RDK S100">



| 名称                                                                                                            | 版本   | 上传日期   | 说明文档                                                  |
| --------------------------------------------------------------------------------------------------------------- | ------ | ---------- | --------------------------------------------------------- |
| [STEP 模型](https://archive.d-robotics.cc/downloads/hardware/rdk_s100/rdk_s100/drobotics_rdk_s100_v1p0.step)    | V1.0.0 | 2025-06-10 | 产品 3D 模型，STEP 格式，便于进行机器人布局，外壳设计等。 |
| [产品渲染图](https://archive.d-robotics.cc/downloads/hardware/rdk_s100/rdk_s100/drobotics_rdk_s100_renders.zip) | V1.0.0 | 2025-06-10 | 产品渲染图片，便于产品材料二次编辑。                      |
| 产品实拍图                                                                                                      | V1.0.0 | 2025-06-10 | 产品实物图，便于进行产品材料二次编辑。                    |

</DocScope>
<DocScope products="RDK S600">

<table>
  <thead>
    <tr>
      <th>名称</th>
      <th>版本</th>
      <th>上传日期</th>
      <th>路径</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowspan="2">Brief (Module)</td>
      <td>-</td>
      <td>2025/12/20</td>
      <td>**V0P1:** RDKS600_datasheet_and_design_guide/Datasheet/drobotics_s600_module_brief_v0p1_zh_251216.pdf</td>
    </tr>
    <tr>
      <td>-</td>
      <td>2026/3/12</td>
      <td>**V0P2:** RDKS600_datasheet_and_design_guide/Datasheet/drobotics_s600_module_brief_v0p2_260306.pdf</td>
    </tr>
    <tr>
      <td>Brief (Kit)</td>
      <td>-</td>
      <td>2025/12/20</td>
      <td>RDKS600_datasheet_and_design_guide/Datasheet/drobotics_rdk_s600_brief_v0p1_zh_251216.pdf</td>
    </tr>
    <tr>
      <td>Datasheet (Module)</td>
      <td>V0.1</td>
      <td>2026/3/12</td>
      <td>RDKS600_datasheet_and_design_guide/Datasheet/D-Robotics_RDK_S600_Module_Datasheet_V0P1_20260122.pdf</td>
    </tr>
    <tr>
      <td>硬件设计指南 (Module)</td>
      <td>V0.1</td>
      <td>2026/3/12</td>
      <td>RDKS600_datasheet_and_design_guide/HardwareDesignGuide/D-Robotics_RDK_S600_Module_Hardware_Design_Guide_V0P1_0122.pdf</td>
    </tr>
    <tr>
      <td>热设计指南</td>
      <td>V0.1</td>
      <td>2026/3/12</td>
      <td>RDKS600_datasheet_and_design_guide/HardwareDesignGuide/D-Robotics_RDK_S600_Module_Thermal_Simulation_Constraints_Checklist_V0P1_20260105.xlsx</td>
    </tr>
    <tr>
      <td>699 Pin B2B 连接器使用说明 (Module)</td>
      <td>V0.1</td>
      <td>2026/3/12</td>
      <td>RDKS600_datasheet_and_design_guide/Pinlist/D-Robotics_RDK_S600_Module_699-Pin_B2B_Connector_Application_Note_V0P1_20251219.xlsx</td>
    </tr>
    <tr>
      <td>参考设计 (Carrier Board)</td>
      <td>-</td>
      <td>2026/3/12</td>
      <td>**V0P2:** RDKS600_datasheet_and_design_guide/HardwareReferenceDesign/RDK_S600_Module_Carrier_Board/RDK_S600_Module_Carrier_Board_Release_V0P2.XXX</td>
    </tr>
    <tr>
      <td>STEP 模型(kit)</td>
      <td>-</td>
      <td>2026/3/12</td>
      <td>**V0P2:** RDKS600_datasheet_and_design_guide/HardwareReferenceDesign/RDK_S600_3D/</td>
    </tr>
    <tr>
      <td>STEP 模型 (Module)</td>
      <td>-</td>
      <td>2026/3/12</td>
      <td>**V0P2:** RDKS600_datasheet_and_design_guide/HardwareReferenceDesign/RDK_S600_3D/RDK_S600_Module_3D_V0P2_20260105.zip</td>
    </tr>
    <tr>
      <td rowspan="2">典型场景功耗计算</td>
      <td>-</td>
      <td>2026/3/12</td>
      <td>**V0P1:** RDKS600_datasheet_and_design_guide/TypicalScenarioPowerConsumption/D-Robotics_RDK_S600_Power_V0P1_20251222.pdf</td>
    </tr>
    <tr>
      <td>-</td>
      <td>2026/3/12</td>
      <td>**V0P2:** D-Robotics_RDK_S600_Typical_Scenario_Power_Consumption_V0P2_20260122.pdf</td>
    </tr>
  </tbody>
</table>

</DocScope>

## Camera Expansion Board

<DocScope products="RDK S100">

| 名称                                                                                                                                                                      | 版本   | 上传日期   | 说明文档                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ---------- | --------------------------------------------------------- |
| [STEP 模型](https://archive.d-robotics.cc/downloads/hardware/rdk_s100/rdk_s100_camera_expansion_board/drobotics_rdk_s100_camera_expansion_board_v1p0.step)                | V1.0.0 | 2025-06-10 | 产品 3D 模型，STEP 格式，便于进行机器人布局，外壳设计等。 |
| [参考设计](https://archive.d-robotics.cc/downloads/hardware/rdk_s100/rdk_s100_camera_expansion_board/drobotics_rdk_s100_camera_expansion_board_reference_design_v1p0.zip) | V1.0.0 | 2025-06-10 | 参考设计。                                                |
| 产品渲染图                                                                                                                                                                | V1.0.0 | 2025-06-10 | 产品渲染图片，便于产品材料二次编辑。                      |
| 产品实拍图                                                                                                                                                                | V1.0.0 | 2025-06-10 | 产品实物图，便于进行产品材料二次编辑。                    |

</DocScope>
<DocScope products="RDK S600">

<table>
  <thead>
    <tr>
      <th>名称</th>
      <th>版本</th>
      <th>上传日期</th>
      <th>路径</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowspan="2">Brief</td>
      <td>V0.2</td>
      <td>2025/12/20</td>
      <td>**V0P2:** RDKS600_datasheet_and_design_guide/Datasheet/drobotics_rdk_s600_camera_expansion_board_brief_v0p2_251219.pdf</td>
    </tr>
    <tr>
      <td>V0.3</td>
      <td>2026/3/12</td>
      <td>**V0P3:** RDKS600_datasheet_and_design_guide/Datasheet/drobotics_rdk_s600_camera_expansion_board_brief_v0p3_260311.pdf</td>
    </tr>
    <tr>
      <td rowspan="2">参考设计</td>
      <td>-</td>
      <td>2026/3/12</td>
      <td>**V0P2:** RDKS600_datasheet_and_design_guide/HardwareReferenceDesign/RDK_S600_CAMERA_EXPANSION_BOARD/RDK_S600_CAMERA_EXPANSION_BOARD_V0P2.XXX</td>
    </tr>
    <tr>
      <td>-</td>
      <td>2026/3/16</td>
      <td>**V0P3:** RDKS600_datasheet_and_design_guide/HardwareReferenceDesign/RDK_S600_CAMERA_EXPANSION_BOARD/RDK_S600_CAMERA_EXPANSION_BOARD_V0P3.XXX</td>
    </tr>
  </tbody>
</table>
</DocScope>

## MCU Port Expansion Board

<DocScope products="RDK S100">

| 名称                                                                                                                                                                          | 版本   | 上传日期   | 说明文档                                                      |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ---------- | ------------------------------------------------------------- |
| [PCB STEP 模型](https://archive.d-robotics.cc/downloads/hardware/rdk_s100/rdk_s100_mcu_port_expansion_board/drobotics_rdk_s100_mcu_port_expansion_board_v1p0.step)            | V1.0.0 | 2025-06-10 | PCB 板 3D 模型，STEP 格式，便于进行机器人布局，外壳设计等。   |
| [FPC STEP 模型](https://archive.d-robotics.cc/downloads/hardware/rdk_s100/rdk_s100_mcu_port_expansion_board/drobotics_rdk_s100_mcu_port_expansion_board_fpc_v1p0.step)        | V1.0.0 | 2025-06-10 | FPC 排线 3D 模型，STEP 格式，便于进行机器人布局，外壳设计等。 |
| [参考设计](https://archive.d-robotics.cc/downloads/hardware/rdk_s100/rdk_s100_mcu_port_expansion_board/drobotics_rdk_s100_mcu_port_expansion_board_reference_design_v1p0.zip) | V1.0.0 | 2025-06-10 | 参考设计。                                                    |
| 产品渲染图                                                                                                                                                                    | V1.0.0 | 2025-06-10 | 产品渲染图片，便于产品材料二次编辑。                          |
| 产品实拍图                                                                                                                                                                    | V1.0.0 | 2025-06-10 | 产品实物图，便于进行产品材料二次编辑。                        |

</DocScope>
<DocScope products="RDK S600">

<table>
  <thead>
    <tr>
      <th>名称</th>
      <th>版本</th>
      <th>上传日期</th>
      <th>路径</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowspan="2">Brief</td>
      <td>V0.2</td>
      <td>2025/12/20</td>
      <td>**V0P2:** RDKS600_datasheet_and_design_guide/Datasheet/drobotics_rdk_s600_mcu_port_expansion_board_v0p2_251219.pdf</td>
    </tr>
    <tr>
      <td>V0.3</td>
      <td>2026/3/12</td>
      <td>**V0P3:** RDKS600_datasheet_and_design_guide/Datasheet/drobotics_rdk_s600_mcu_port_expansion_board_v0p3_260311.pdf</td>
    </tr>
    <tr>
      <td>参考设计</td>
      <td>-</td>
      <td>2026/3/12</td>
      <td>**V0P3:** RDKS600_datasheet_and_design_guide/HardwareReferenceDesign/RDK_S600_MCU_PORT_EXPANSION_BOARD/RDK_S600_MCU_PORT_EXPANSION_BOARD_V0P3.XXX</td>
    </tr>
  </tbody>
</table>

</DocScope>
