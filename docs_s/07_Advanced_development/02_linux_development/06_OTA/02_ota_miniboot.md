---
sidebar_position: 2
---

# miniboot 升级

:::note
- 此部分所介绍的miniboot升级，不依赖OTA分区表，可在非OTA镜像中使用；
- miniboot升级需重启后生效；
:::


## 概述
为满足系统单独升级 miniboot 更新需求，miniboot 升级方案采用基于 OTA（Over-The-Air）技术的分区级更新机制，对 miniboot 所涉及的关键分区进行安全、可控的版本更新。该方案重点关注系统安全性、升级可靠性以及非可升级分区的稳定性，确保在任何升级异常情况下系统都不会变砖，能够自动恢复并继续启动。

## 特点
本方案具有以下三个核心特性：

- 仅升级 miniboot 相关的 BAK 分区与采用 A/B 机制的分区

    miniboot 中的分区分为 Permanent、BAK 和 A/B 三种类型。其中 Permanent 分区属于关键永久区，正常情况下不会被更新，且更新频率极低。为了保证系统稳定性与避免误操作造成不可恢复的 brick 风险，本方案仅支持对 BAK 分区和 A/B 分区进行 OTA 升级，而不会触碰 Permanent 分区。具体参与升级的分区包括：`
HSM_FW、HSM_RCA、keyimage、SBL、scp、spl、MCU、acore_cfg、bl31、optee、uboot`。

- 使用板端 ota_tool 完成升级，具备完善的校验与恢复机制

    在设备端执行升级操作时，采用系统内置的 ota_tool 工具，该工具提供完整的升级流程管理，包括：分区包校验、分区写入保护、升级状态记录、失败回滚等机制。无论是异常掉电、升级中断还是数据损坏，都能保证系统自动回退至可正常启动的版本，从而确保设备在升级失败情况下不会变砖。

- 自动处理 Boot 分区的 A/B 切换同步问题

    OTA 升级完成后，系统重启会触发 miniboot 的 A/B 分区切换。Boot 分区本身亦采用 A/B 结构，但在本次升级计划中 Boot 分区并不包含在升级范围内，理论上会产生“升级后的系统切到未升级的 Boot 分区”的风险。为避免 Boot 分区 AB 两侧内容不一致导致启动失败，ota_tool 内部提供了对未升级 A/B 分区自动进行同步拷贝的功能，确保 Boot 分区两侧保持完全一致，从根本上解决了该风险。

- 此方法不支持升级分区表

    此方案升级之前会对比升级包中的分区表和设备中的分区表信息，如不一致会退出升级，因此对于有分区表改动的升级需使用地瓜工具整烧完成，参考：[系统烧录](/rdk_s/Quick_start/install_os/rdk_s100)。

整体而言，本方案基于灵活的 OTA 升级能力、严格的校验机制以及完善的回滚策略，实现了 miniboot 分区的安全更新，同时最大限度降低系统升级过程中的风险，OTA升级的原理及详细介绍可参考 [系统 OTA 升级](./01_ota_system.md)部分。


## 使用方法

### 更新miniboot包

    1. 在板端更新hobot-miniboot包
    ```bash
    sudo apt update
    sudo apt-get install -y hobot-miniboot
    ```

### 板端升级
    更新miniboot包后，启动升级的方式有两种：
    1. 通过`rdk-miniboot-update`命令升级
        - 可以在命令后直接设置是否重启的选项
        ```bash
            # 升级后立即重启
            rdk-miniboot-update --reboot y

            # 升级后不立即重启
            rdk-miniboot-update --reboot n
        ```
        - 也可以不带任何参数，交互式确定重启方式
        ```bash
            rdk-miniboot-update
        ```

    2. 通过srpi-config的方式升级
        此方法可参考[srpi-config](../../../02_System_configuration/02_srpi-config.md#system-options)中Update miniboot部分。
