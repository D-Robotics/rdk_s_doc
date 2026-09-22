---
sidebar_position: 3
title: "Log 使用指南"
description: "RDK S100/S600 系统 Log 分区规划、log 抓取方式与内核日志配置"
---

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

# Log 使用指南

## 概述

Log 系统负责收集、存储与归档开发板各模块（内核、MCU、DSP、BL31、OP-TEE、U-Boot、ALOG、systemd 等）运行日志，并提供按时间、按模块的查询与容量管控能力。日志由两套机制分别管理：地瓜 `hobot-log` 负责模块日志的轮转、归档与容量管控，Ubuntu 自带的 `rsyslog` 与 `systemd journal` 负责内核及系统日志。

### 日志存放位置

| 位置 | 所在分区 | 主要管理方 | 内容 |
|------|----------|------------|------|
| `/log` | 独立 `log` 分区（约 4 GiB） | `hobot-log` + `hobot-log-rename.py` | 各模块 log、`archive` 归档、pstore、coredump、stackdump、reset 记录 |
| `/var/log` | rootfs | Ubuntu `rsyslog` + `logrotate` | `kern.log`、`syslog` 等内核与系统日志 |

各模块的目录、单个文件大小与数量限制见 [Log 分区](#log-分区)。

### 阅读指引

| 我想…… | 看这一节 |
|--------|----------|
| 了解日志有哪些、存在哪里、保留多久 | [Log 系统分区规划](#log-系统分区规划) |
| 查看/启停日志进程，定制容量与命名 | [Log 管理](#log-管理) |
| 在代码里打日志（内核 / 应用 / MCU / DSP） | [Log 接口使用推荐](#log-接口使用推荐) |
| 排查日志丢失、日志写太多等问题 | [Log 使用注意](#log-使用注意)、[常见问题](#常见问题) |
| 用命令查看内核与 systemd 日志 | [系统日志查看](/System_configuration/system_log) |

**适用读者**：模式 3 深度定制开发者（商业客户/深度团队）——需要定位驱动、固件或应用问题的研发、测试工程师。

**前置条件**

- 已烧录 RDK OS 并可登录板端（SSH 或调试串口）；
- 了解 Linux 日志基础（`dmesg`、`logcat`、`systemd journal`）；
- 需要定制日志容量或命名时，能修改并重新编译 `hobot-utils`（`hobot-log`、`hobot-log-rename.py`）。

**与其他模块关系**

- 板端日志查看入口见《[系统日志查看](/System_configuration/system_log)》；
- 内核命令细节见《[Linux 命令 dmesg](/Appendix/linux-command-manual/dmesg)》；
- MCU 侧 log 接口见《[MCU 基础信息](../11_mcu_development/01_basic_information.md#mcu-log-简介)》的「MCU Log 简介」；
- 本指南不涉及云端日志上报与日志平台对接。

## Log 系统分区规划

### Log 分区

| 分类 | log 类型 | 存储位置 | 单个 log 最大大小 | log 文件数量 | 是否压缩 | 服务 / 配置常量 | 内容 |
|---|---|---|---|---|---|---|---|
| 基础系统 log | kernel | `/var/log/` | NA | 4 | 是 | `rsyslog` + `logrotate`（`rotate 4` / `weekly`） | 内核、驱动、syslog 的 log 信息 |
| 基础系统 log | pstore | `/log/pstore` | 4M | 100 | 否 | `hobot-log`（`PSTORE_LOGMAX`） | 内核 crash 的 log 信息 |
| 基础系统 log | coredump | `/log/coredump` | NA | NA | 否 | `hobot-log`（`CORE_DUMP_LOG_DIR_SIZE`） | 应用 crash 的 coredump 文件，目录大小限制 2G |
| 基础系统 log | coredump | `/log/stackdump` | NA | 20 | 否 | `hobot-stackdump.service`（debug 版本） | 应用 crash 的 log 信息 |
| 基础系统 log | remoteproc | `/log/dsp0` | 1M | 200 | 否 | `hobot-log-dsp0.service`（`ROTATESIZE_REMOTE` / `ROTATEGENS_REMOTE`） | DSP0 固件输出的 log 信息 |
| 基础系统 log | remoteproc | `/log/bl31` | 1M | 200 | 否 | `hobot-log-bl31.service`（`ROTATESIZE_REMOTE` / `ROTATEGENS_REMOTE`） | BL31 固件输出的 log 信息 |
| 基础系统 log | remoteproc | `/log/optee` | 1M | 200 | 否 | `hobot-log-optee.service`（`ROTATESIZE_REMOTE` / `ROTATEGENS_REMOTE`） | OP-TEE 固件输出的 log 信息 |
| 基础系统 log | remoteproc | `/log/mcu*` | 2M | 200 | 否 | `hobot-log-mcu.service`（`ROTATESIZE` / `ROTATEGENS_REMOTE`） | mcu 固件输出的 log 信息 |
| 基础系统 log | remoteproc | `/log/bpu0` | 1M | 200 | 否 | `hobot-log-bpu0.service`（`ROTATESIZE_REMOTE` / `ROTATEGENS_REMOTE`） | bpu0 固件输出的 log 信息 |
| 基础系统 log | remoteproc | `/log/hsm` | 1M | 200 | 否 | `hobot-log-hsm.service`（`ROTATESIZE_REMOTE` / `ROTATEGENS_REMOTE`） | hsm 固件输出的 log 信息 |
| 基础系统 log | remoteproc | `/log/uboot` | 8KB | 100 | 否 | `hobot-log`（`UBOOT_LOGMAX`） | U-Boot 输出的 log 信息 |
| 基础系统 log | reset | `/log/reset_reason.txt` | 1M | 1 | 否 | `hobot-log`（`RESET_REASON_MAX`） | 记录每次系统启动原因 |
| 基础系统 log | reset | `/log/reset_count.txt` | 4KB | 1 | 否 | `hobot-log`（`RESET_COUNT_MAX`） | 记录当前系统重启次数 |
| ALOG 系统 | ALOG | `/log/usr` | 2M | 200 | 否 | `hobot-log-logcat.service`（`ROTATESIZE` / `ROTATEGENS_USR`） | ALOG 接口的 log 信息 |
| systemd | journal | `/log/journal` | NA | NA | 否 | `hobot-log`（`journald`） | systemd journal，总大小约 100MB |

### Log 内容

#### Kernel Log

- 内核 log：通过 rsyslog 转存到 `/var/log/` 目录下
- pstore log：当内核 crash 重启时，移动 `/sys/fs/pstore` 目录日志到 `/log/pstore` 目录下，记录系统 panic 前后的内核日志
    - 除直接拷贝 ramoops 原始文件外，还会生成以下解析文件：
        - `sched-ramoops-0`：由 `hrut_sched_log_parse` 解析后的调度日志
        - `optee-ramoops-0`：由 `optee_log -p` 导出的 OP-TEE 日志
        - `lantinhv-ramoops-0`：LantinHV 上一次启动日志（来自 `/proc/lantin_log/prev_boot_log`，该节点存在时才会生成）

#### 启动原因 log

`reset_reason.txt`：每次启动追加一条记录，格式为 `<时间>: <重启原因> <版本号> <重启次数>`：

```text
2026-06-05-23-36-32: poweroff 		5.1.1 	0000
```

重启原因取值如下（以固件实际输出为准）：

| 分类 | 取值 | 说明 |
|------|------|------|
| 电源/硬件 | `poweroff` | 断电后重新上电（零下 10 度以下需要更长的断电时间） |
| 电源/硬件 | `hwreset` | 拉 reset pin 重启 |
| 电源/硬件 | `pmicwdt` | PMIC watchdog 重启 |
| 电源/硬件 | `lmbistfail` | 硬件 BIST 失败重启 |
| 电源/硬件 | `invalidtemp` | 异常温度重启 |
| DDR | `ddrtrainfail` | DDR training 失败重启 |
| 休眠 | `deepsleep` | 深睡眠重启 |
| 休眠 | `lightsleep` | 浅睡眠唤醒 |
| 休眠 | `offsleep` | main off + MCU sleep 重启 |
| MCU | `mreboot` | MCU 正常重启 |
| MCU | `mpanic` | MCU panic 重启 |
| MCU | `mwdt` | 系统各种原因导致的 hang 住引起的 watchdog 复位 |
| MCU | `mhlost` | Acore 丢心跳重启 |
| MCU | `mbdiso` | bdiso 错误重启 |
| SCP | `scpreboot` | SCP 正常重启 |
| SPL/SBL | `splreboot` | SPL 正常重启 |
| SPL/SBL | `splpanic` | SPL panic 重启 |
| SPL/SBL | `sblpanic` | SBL panic 重启 |
| BL31 | `freboot` | BL31 正常重启 |
| BL31 | `fpanic` | BL31 panic 重启 |
| OP-TEE | `oreboot` | OP-TEE 正常重启 |
| OP-TEE | `opanic` | OP-TEE panic 重启 |
| U-Boot | `ureboot` | U-Boot 正常重启 |
| U-Boot | `upanic` | U-Boot panic 重启 |
| Kernel | `kreboot` | Kernel 正常重启 |
| Kernel | `kpanic` | Kernel panic 重启 |
| 其他 | `mainreboot` | main reboot 重启 |

`reset_count.txt`：当前系统重启次数，0 到 9999 循环计数。

#### remoteproc log

涵盖 dsp*、bl31、optee、mcu、bpu*、hsm、uboot 等固件输出的 log，各模块的目录与容量见 [Log 分区](#log-分区)；其中 hsm 日志加密保存。

#### ALOG 系统

- 使用 libalog 库的 pr_*接口打印的 log 信息
- 应用软件推荐使用 libalog 库的 pr_*接口

#### systemd journal log

- systemd 运行过程中的日志，目前配置大小 100MB，实际占用会更大，大约达到 102MB
- systemd journal 在应对异常掉电、系统时间异常等情况时，可能会出现丢失本次启动日志的情况

:::warning
systemd journal 在异常掉电、系统时间异常等情况下可能丢失本次启动日志；对掉电敏感的场景不要只依赖 journal，建议同时保留 `hobot-log` 的归档日志。
:::

#### 应用 crash log

- coredump：储存进程在突然崩溃那一刻的内存快照，会把进程此刻内存、寄存器状态、运行堆栈等信息转储保存在该目录文件中，量产建议关闭
- stackdump：debug 版本开启，储存 systemd 服务进程在突然崩溃那一刻的状态信息，占用空间小

:::warning
`coredump` 会保存进程崩溃时的完整内存快照，占用空间大且可能包含敏感数据，量产版本建议关闭；`stackdump` 仅在 debug 版本开启。
:::

## Log 管理

### Log 进程

1.  进程信息
    - 板端 log 进程运行信息如下，不同设备的 log 进程有所区别，以实际命令结果为准：

    ```bash
    root@ubuntu:/userdata# ps -ef | grep log | grep -v -e grep -e login -e dbus-daemon
    root        1083       1  0 11:16 ?        00:00:00 /bin/bash /usr/bin/hobot-log
    root        1514       1  0 11:16 ?        00:00:00 /bin/sh /usr/bin/hobot-log-start bl31
    root        1518    1514  0 11:16 ?        00:00:00 hrut_remoteproc_log -b /dev/bl31_log_dev -f /log/bl31/message -r 1024 -n 200
    root        1520       1  0 11:16 ?        00:00:00 /bin/sh /usr/bin/hobot-log-start bpu0
    root        1521       1  0 11:16 ?        00:00:00 /bin/sh /usr/bin/hobot-log-start dsp0
    root        1523    1520  0 11:16 ?        00:00:00 hrut_remoteproc_log -b /proc/bpu0_msg -f /log/bpu0/message -r 1024 -n 200
    root        1525       1  0 11:16 ?        00:00:00 /bin/sh /usr/bin/hobot-init-hb_hsm_log_server.sh
    root        1526    1521  0 11:16 ?        00:00:00 hrut_remoteproc_log -b /sys/class/remoteproc/remoteproc_vdsp0/log -f /log/dsp0/message -r 1024 -n 200
    root        1527       1  0 11:16 ?        00:00:00 /bin/sh /usr/bin/hobot-log-start logcat
    root        1529       1  0 11:16 ?        00:00:00 /bin/sh /usr/bin/hobot-log-start mcu
    root        1530    1527  0 11:16 ?        00:00:00 logcat -v time -f /log/usr/message -r2048 -n 200
    root        1531       1  0 11:16 ?        00:00:00 /bin/sh /usr/bin/hobot-log-start optee
    root        1536    1529  0 11:16 ?        00:00:00 hrut_remoteproc_log -b /proc/remoteproc_mcu0 -f /log/mcu0/message -r 2048 -n 200
    root        1538    1525  0 11:16 ?        00:00:00 /bin/sh /usr/bin/hobot-log-start hsm
    root        1539       1  0 11:16 ?        00:00:00 python3 /usr/bin/hobot-log-rename.py /log -m auto
    root        1541    1529  0 11:16 ?        00:00:00 hrut_remoteproc_log -b /proc/remoteproc_mcu1 -f /log/mcu1/message -r 2048 -n 200
    root        1542       1  0 11:16 ?        00:00:00 /usr/hobot/bin/syslogd -n -O /log/kernel/message -s 2048 -b 200
    root        1545       1  0 11:16 ?        00:00:00 /bin/sh /usr/bin/hobot-log-start klogd
    root        1546    1538  0 11:16 ?        00:00:00 hsm_log -f /log/hsm/message -r 1024 -n 200
    root        1547    1531  0 11:16 ?        00:00:00 optee_log -f /log/optee/message -r 1024 -n 200
    ```

    - kernel： rsyslog

        - 获取内核记录的消息，将消息数据转存到文件中

    - usr： ALOG(libalog.so)和 logcat

        - 通过 ALOG 接口 pr_*向 log buffer 写入 log 信息，logcat 从 log buffer 中获取 log 信息，将其写入文件中

    - remoteproc_log：hrut_remoteproc_log、hsm_log、optee_log 进程

        - 通过 remoteproc 节点获取 MCU，DSP，BL31，BPU，HSM，OPTEE 的 log 信息，将其写入文件中

    - 日志管理：hobot-log 和 hobot-log-rename.py

        - log 记录：记录 reset，pstore，uboot 的 log 信息

        - log 管理：定期每 10 分钟将原始 log 文件转存成固定格式文件，管控各个分区目录的存储空间，超过固定容量会进行删除，删除时间比较早产生的文件

2.  启动顺序
    - hobot-log-daemon.service 服务开机自启，启动 hobot-log 守护进程，去启动相关 log 服务，并管理日志，主要流程如下：

        ```text
        |- /usr/bin/hobot-log
              |- calculate_rotate_num(shell function)                # 生成 rotate 参数与 /tmp/hb_log.conf
              |- make_log_dir(shell function)                        # 创建 log 与 stackdump 目录
              |- record_reset_count(shell function)                  # 记录/递增重启次数
              |- system_config(shell function)                       # 配置 coredump 的 core_pattern
              |- create_log_rename_config(shell function)            # 生成 /log/hb_log_rename.conf
              |- record_reset_reason(shell function)                 # 记录本次重启原因（仅首次启动）
              |- message_rotate_and_add_resetcount(shell function)   # 轮转 message 并写入 resetcount
              |- wait_for_timesync(shell function)                   # 等待时间同步，保证日志时间戳准确
              |- update_time_resetreason(shell function)             # 回填 reset_reason.txt 的当前时间
              |- set_pstore(shell function)                          # 归档异常重启的 pstore 日志
              |- set_mrdump(shell function)                          # mpanic 时归档 MCU ramdump
              |- set_uboot(shell function)                           # 归档 U-Boot 日志
              |- systemd_journal_config(shell function)              # 配置 journal 目录并 flush
              |- systemd-notify --ready                              # 通知 systemd 守护进程就绪
              |- 启动各模块日志记录进程（由 hobot-log-*.service 负责）
              |- hobot-log-rename.py 脚本进行日志重命名归档、空间管理
              （守护进程进入维护循环，每 600s 清理 coredump/stackdump）
        ```

### Log 管理方式

log 的文件生成和目录空间管控主要是由 hobot-log 和 hobot-log-rename.py 去管理的。

1.  log 管理
    - 容量管控：
        - 在 hobot-log 脚本中配置了各个模块的日志文件大小和数量限制，这些限制会通过入参传递给各个模块日志进程。每个模块日志文件限制说明见：[Log 分区](#log-分区)
        - 各个模块的进程管理各自的日志文件大小和数量限制，超过限制后会删除产生时间比较早的文件
    - log 文件重命名归档：
        - 启动时，转存 uboot 和 pstore log，命名格式如下：
            - `SuperSoC_Uboot-<count>-<time>.Log`：当系统启动时，将 uboot log 转存到 uboot 的 archive 目录下
            - `SuperSoC_Pstore-<count>-<time>`（文件夹）：当系统启动时，如果检测到上次系统是异常重启，则创建该格式文件夹，并将对应的异常 log 信息记录到该文件夹下
        - 运行时，log 文件通过 hobot-log-rename.py 进程重命名归档，每 10 分钟各模块目录下的 `message.*` 文件重命名归档到模块的 archive 目录下，并根据容量管控删除 archive 目录下旧文件
            - 该进程由 hobot-log-rename.service 服务启动，根据 hobot-log 生成的配置文件 `/log/hb_log_rename.conf` 管理各模块
            - 如果不希望运行过程中重命名日志文件，通过修改 `source/hobot-configs/debian/DEBIAN/postinst` 文件，关闭该服务自启
            - 关闭后如果还希望对当前的 log 文件重命名归档，可以手动执行如下命令：`python3 /usr/bin/hobot-log-rename.py /log -m manual`
            - log 文件重命名格式如下：
                - 示例：SuperSoC_Usr-0003-2025_05_06_08_01_00.Log
                - 命名说明：[board]_[module]-[count]-[time].Log
                    - board：SuperSoC
                    - module：Usr，Uboot，Pstore 等首字母大写
                    - count：4 位数字，0000 到 9999，示例中代表第 3 次重启
                    - time：如 2025_05_06_08_01_00
                    - inode：正常情况下没有；只有当同一秒内转存多个文件、归档后目标文件名重合时，才会给先前的文件追加 `-<inode>` 以作区分，例如 SuperSoC_Usr-0003-2025_05_06_08_01_00-131599.Log

    - 内核日志使用 ubuntu 系统自带的 rsyslog 服务管理，因此这里对内核 log 管理方式做单独介绍。
        - 容量管控：
            - 不会限制单个 kern.log 的大小
            - 日志每周进行一次轮转
            - 系统最多保留 4 个历史日志文件
        - log 归档：
            - 当日志轮转发生时，当前日志文件会按照编号进行重命名归档。归档原则：kern.log 达到轮转周期，logrotate 将 kern.log 重命名为 kern.log.1，创建新的 kern.log，rsyslog 继续写入日志。当超过最大数量限制后，最开始产生的日志文件会被删除
            - 为减少磁盘占用，系统会对历史日志进行压缩。压缩策略：最近一次轮转日志延迟一轮再压缩
        - 参数配置：
            - 如果用不想使用 ubuntu 默认配置参数来配置日志管理策略，可以通过修改 `/etc/logrotate.d/rsyslog` 文件中的配置实现。
            ```text
            {
                rotate 4  //最大保留历史日志文件个数
                weekly      //轮转周期
                missingok   //如果日志丢失，不报错继续滚动下一个日志
                notifempty  //当前日志为空时，不进行轮转
                compress    //通过gzip压缩
                delaycompress   //和compress一起使用时，转储的日志文件到下一次转储时才压缩
                sharedscripts
                postrotate
                        /usr/lib/rsyslog/rsyslog-rotate
                endscript
            }
            ```

2.  定制 log 系统
    - log 大小和数量修改
        - 日志大小在 hobot-log 中修改，修改 `ROTATESIZE` 和 `ROTATESIZE_REMOTE` 变量的定义，单位是 KB
        - 日志数量在 hobot-log 中修改，修改 `ROTATEGENS_USR、ROTATEGENS_REMOTE、UBOOT_LOGMAX、PSTORE_LOGMAX` 变量的定义，对应的分别是 usr、remoteproc_log、uboot、pstore 的日志数量限制，当前值分别是 200、200、100、100
        - systemd journal log 大小通过 `/etc/systemd/journald.conf` 中的 `SystemMaxUse` 配置（默认注释，使用 systemd 默认值），同时需要注意文件大小 SystemMaxFileSize 和文件数量 SystemMaxFiles 限制相乘要大于 SystemMaxUse
    - log 命名修改
        - 当前命名规范是 `[board]_[module]-[count]-[time].Log`（重名时追加 `-<inode>`），在 hobot-log 脚本中修改前缀和尾缀，即 `[board]_[module]` 和 `.Log`。在 hobot-log-rename.py 脚本中修改 `[count]` 和 `[time]`，涉及 `get_reset_count` 和 `get_file_time` 两个函数
    - log 进程的裁剪
        - 可以通过增减 systemd 的 log service，来增减 log 进程，通过修改 `source/hobot-configs/debian/DEBIAN/postinst` 文件实现。部分 log 相关服务如下：

            ```bash
            /etc/systemd/system/basic.target.wants/hobot-log-bl31.service
            /etc/systemd/system/basic.target.wants/hobot-log-bl31-timesync.service
            /etc/systemd/system/basic.target.wants/hobot-log-bpu0.service
            /etc/systemd/system/basic.target.wants/hobot-log-daemon.service
            /etc/systemd/system/basic.target.wants/hobot-log-dsp0.service
            /etc/systemd/system/basic.target.wants/hobot-log-hsm.service
            /etc/systemd/system/basic.target.wants/hobot-log-logcat.service
            /etc/systemd/system/basic.target.wants/hobot-log-mcu.service
            /etc/systemd/system/basic.target.wants/hobot-log-optee.service
            ```

        - 以 hobot-log-logcat.service 为例，介绍设备端如何控制 log 服务启停：

            ```bash
            # 开启服务开机自启
            systemctl enable hobot-log-logcat.service
            # 关闭服务开机自启
            systemctl disable hobot-log-logcat.service
            # 查看服务状态
            systemctl status hobot-log-logcat.service
            # 启动服务
            systemctl start hobot-log-logcat.service
            # 停止服务
            systemctl stop hobot-log-logcat.service
            ```
3.  log 时间
    - hobot-log 提供了等待时间同步完成的功能，以确保日志中的时间戳准确。该功能可通过 `YEAR_LIMIT` 和 `WAIT_FOR_TIMESYNC_TIMEOUT` 两个变量进行配置，分别用于设定时间同步成功的阈值以及超时时间。需要注意的是，Debian 系统的默认时间为其发行版本的发布时间。因此，在每次更新 Debian 版本时，应相应修改 `YEAR_LIMIT` 的值，使其大于该版本的发布时间。通常情况下，将其配置为最新日期即可。

### hrut_log_utils 工具

`hrut_log_utils` 是日志轮转与空间清理的底层工具，`hobot-log` 与 `hobot-log-rename.py` 的容量管控最终都通过它执行。常用子命令：

| 子命令 | 用法 | 说明 |
|--------|------|------|
| `rotate` | `hrut_log_utils rotate <log_dir> <num_files>` | 按文件数轮转目录下的 message 文件 |
| `add_resetcount` | `hrut_log_utils add_resetcount <log_dir> <reset_count>` | 在日志文件末行写入 `resetcount:` 标记，供归档时解析重启次数 |
| `del_by_cnt` | `hrut_log_utils del_by_cnt <log_dir> <max_files>` | 目录内文件数超过上限时删除最旧的文件 |
| `del_by_cnt_keyword` | `hrut_log_utils del_by_cnt_keyword <log_dir> <keyword> <max_files>` | 按关键字分组限制文件数，例如 coredump 中的 `vdsp0`/`vdsp1` 各限 20 个 |
| `del_by_size` | `hrut_log_utils del_by_size <log_dir> <max_size(KB)>` | 目录总大小超过上限时删除最旧的文件，例如 coredump 目录限制为 2G |

示例：

```bash
# 不带参数执行可查看用法
hrut_log_utils

# 将 /log/coredump 目录限制为 2G（2097152 KB）
hrut_log_utils del_by_size /log/coredump 2097152
```

## Log 接口使用推荐

不同模块推荐使用的接口不同，速查如下：

| 模块 | 推荐接口 | 输出去向 | 详见 |
|------|----------|----------|------|
| Kernel（有 device 结构） | `dev_err` / `dev_warn` / `dev_info` / `dev_dbg` | `/var/log/kern.log`、`dmesg` | [Kernel](#kernel) |
| Kernel（无 device 结构） | `pr_err` / `pr_warn` / `pr_info` / `pr_debug` | 同上 | [Kernel](#kernel) |
| 应用程序 | libalog 的 `pr_*` 接口 | `log_main` → `/log/usr` | [应用程序](#应用程序) |
| MCU | `LogSync` / `LogNotice` / `LogAsync` | 串口、`/proc/remoteproc_mcu*` → `/log/mcu*` | [MCU](#mcu) |
| DSP | `DSP_ERR` / `DSP_WARN` / `DSP_INFO` / `DSP_DBG` | `/log/dsp*` | [DSP](#dsp) |

### Kernel

1. 有设备结构（`struct device`）时用 `dev_*`，无设备结构时用 `pr_*`。内核日志级别（数值越小越严重）与对应接口如下：

| 级别 | 无 device | 有 device | 说明 |
|------|-----------|-----------|------|
| 0 | `pr_emerg` | `dev_emerg` | 系统不可用 |
| 1 | `pr_alert` | `dev_alert` | 需要立即处理 |
| 2 | `pr_crit` | `dev_crit` | 严重错误 |
| 3 | `pr_err` | `dev_err` | 错误 |
| 4 | `pr_warn` | `dev_warn` | 警告 |
| 5 | `pr_notice` | `dev_notice` | 正常但值得注意 |
| 6 | `pr_info` | `dev_info` | 提示信息 |
| 7 | `pr_debug` | `dev_dbg` | 调试信息，默认不输出 |

    注意：内核没有 `pr_error`，错误级别请使用 `pr_err`。

2. `pr_debug`、`dev_dbg` 默认不输出，可通过 dynamic debug 动态开启（示例：开启 `drivers/mmc/host` 下所有文件、`mmc_core` 模块、`mmc_detect_change` 函数）：

    ```bash
    echo "file drivers/mmc/host/* +p" > /sys/kernel/debug/dynamic_debug/control
    echo "module mmc_core +p" > /sys/kernel/debug/dynamic_debug/control
    echo "func mmc_detect_change +p" > /sys/kernel/debug/dynamic_debug/control
    ```

3. 出错后可能重复非常多次的打印，使用限流接口：

    - `printk_once`：只打印一次；
    - `printk_ratelimited`：按速率限制，默认每 5 秒最多打印 10 次。

4. 内核敏感地址打印：

    - 用 `%pK` 替代 `%p`；
    - 将 `/proc/sys/kernel/kptr_restrict` 配置为 2 后，`%pK` 打印为全 0；
    - 注意内核 4.15 起 `%p` 默认输出哈希值，需要受限的真实地址时应使用 `%pK`。

### 应用程序

应用程序使用 libalog 的 `pr_*` 接口打日志，`logcat` 从 log buffer 读取后写入 `/log/usr`。

1. 可用接口按级别从低到高为 `pr_verbose`、`pr_debug`、`pr_info`、`pr_warn`、`pr_err`、`pr_fatal`，以及对应的 `*_with_tag` 版本 `pr_verbose_with_tag`、`pr_debug_with_tag`、`pr_info_with_tag`、`pr_warn_with_tag`、`pr_err_with_tag`、`pr_fatal_with_tag`。

2. 模块名（tag）有两种指定方式，`logcat` 支持按 tag 筛选（`logcat -s <tag>:<level>`）：

    - 定义 `LOG_TAG` 宏：可通过 Makefile 传入（如 `DLOG_TAG=camera`），或在代码开头 `#define LOG_TAG "..."`；
    - 使用 `*_with_tag` 接口：把 tag 作为第一个参数传入。

3. 日志缓冲区由内核 ALOG 驱动注册，共 4 个：

| 缓冲区 | 设备节点 | 大小 | 用途 |
|--------|----------|------|------|
| `log_main` | `/dev/log_main` | 2MB | 默认缓冲区，建议业务日志统一使用 |
| `log_system` | `/dev/log_system` | 256KB | system |
| `log_radio` | `/dev/log_radio` | 256KB | 通信相关 tag |
| `log_events` | `/dev/log_events` | 256KB | events |

    当 `LOG_TAG` 为 `HTC_RIL`、`RIL`、`IMS`、`AT`、`GSM`、`STK`、`CDMA`、`PHONE`、`SMS` 时，日志写入 `log_radio`；其余 tag 写入 `log_main`。

    不带 `-b` 时 `logcat` 只读取 `log_main`；读取其它缓冲区需传完整节点名（如 `logcat -b log_radio -g`），详见 [logcat 使用](#logcat-使用)。

4. 代码示例：

    ```c
    //gcc logtest.c -o logtest -L . -lalog -I /usr/hobot/include/
    #define LOG_TAG "alog_test"
    #include <stdio.h>
    #include <logging.h>

    int main(int argc, char **argv)
    {
        pr_verbose("*ALOG test start*\n");
        pr_debug("********1********\n");
        pr_info("********2********\n");
        pr_warn("********3********\n");
        pr_err("********4********\n");
        pr_verbose("*ALOG test end***\n");
        return 0;
    }
    ```

    测试结果（`logcat` 中级别显示为 `V/D/I/W/E/F`）：

    ```bash
    root@ubuntu:/# ./logtest

    # 不设置过滤
    root@ubuntu:/# logcat
    logcat test start !!!
    --------- beginning of /dev/log_main
    V/alog_test(21590): *ALOG test start*
    D/alog_test(21590): ********1********
    I/alog_test(21590): ********2********
    W/alog_test(21590): ********3********
    E/alog_test(21590): ********4********
    V/tag     (21590): ********1********
    D/tag     (21590): ********1********
    I/tag     (21590): ********2********
    W/tag     (21590): ********3********
    E/tag     (21590): ********4********
    F/tag     (21590): ********1********
    V/alog_test(21590): *ALOG test end***

    # 设置过滤 -s *:F
    root@ubuntu:/# logcat -s *:F
    logcat test start !!!
    --------- beginning of /dev/log_main
    F/tag     (21590): ********1********

    # 设置过滤 -s *:E
    root@ubuntu:/# logcat -s *:E
    logcat test start !!!
    --------- beginning of /dev/log_main
    E/alog_test(21590): ********4********
    E/tag     (21590): ********4********
    F/tag     (21590): ********1********

    # 设置过滤 -s tag:E
    root@ubuntu:/# logcat -s tag:E
    logcat test start !!!
    --------- beginning of /dev/log_main
    E/tag     (21590): ********4********
    F/tag     (21590): ********1********
    ```

### MCU

`LogSync` / `LogNotice` / `LogAsync` 由 `Service/Log` 提供，既可将 log 输出到串口，也可转存到 Acore。转存节点为 `/proc/remoteproc_mcu0`、`/proc/remoteproc_mcu1`，Acore 会启动 `hrut_remoteproc_log` 进程周期性读取并写入 `/log/mcu*` 的 message 文件；文件的重命名归档与容量管控见 [Log 管理](#log-管理)。

| 接口 | 打印方式 | 串口输出 | 转存 Acore |
|------|----------|----------|------------|
| `LogSync` | 同步 | debug 镜像开启；release 镜像关闭 | 是 |
| `LogNotice` | 同步 | debug / release 均开启 | 是 |
| `LogAsync` | 异步 | 同 `LogSync` | 是 |

**接口使用说明**

编译路径添加 `Service/Log`，代码引用 `Service/Log/Common/inc/` 下的头文件 `Log.h`，即可调用 `LogSync`、`LogNotice`、`LogAsync`。

串口与 Acore 通路由 `Service/Log/Config/inc/Log_Cfg.h` 中的 `LOG_SEND_TO_UART`、`LOG_SEND_TO_ACORE` 控制：

```c
/* S100/S100P/S600/S300/S20 均为 STD_ON */
#define LOG_SEND_TO_ACORE  (STD_ON)

#if (defined MCU_RELEASE) && (!defined MCU1_ELF)
    /* MCU0 在 release 镜像关闭串口通路；必要信息可通过 LogNotice 临时开启串口打印 */
    #define LOG_SEND_TO_UART   (STD_OFF)
#else
    /* 其余情况（含 MCU1 的 release ELF）串口通路始终开启 */
    #define LOG_SEND_TO_UART   (STD_ON)
#endif
```

注意：关闭串口的条件是 `MCU_RELEASE && !MCU1_ELF`，即 **MCU1 在 release 镜像下仍会向串口输出**。

MCU Log 使用注意事项，请参考：[MCU Log 简介](../11_mcu_development/01_basic_information.md#mcu-log-简介)。

### DSP

推荐使用 `DSP_ERR`、`DSP_WARN`、`DSP_INFO`、`DSP_DBG` 接口（由 DSP 侧 SDK 提供，接口定义见对应头文件）。

## Log 使用注意

### Log 调试注意点

1.  调试时大量日志可以单独保存，防止丢失，方便查看
    - 内核日志：`dmesg -w > /userdata/dmesg.log &`
    - ALOG 日志：`logcat -v time -f /userdata/logcat.log &`
2.  每个转存周期（10min）内产生超过轮转数量的日志会造成日志丢失
    - 首先应只输出必要的日志
    - 如果输出较多 log，在设置轮转数量时，要考虑好所需大小
3.  不要在串口窗口实时查看日志。可能会发现丢日志，原因是输出慢，覆盖导致。如果必须，建议在 ssh 窗口实时查看日志。
    - 比如使用 logcat 在串口实时查看输出，内核若输出"logcat lost message"，则说明有日志丢失。

<DocScope products="RDK S100">
4.  S100 日志写入存储设备保存。考虑到存储设备的寿命有限和大量存储日志对 IO/CPU 性能的影响，应只输出必要的日志，正式版本不应输出大量调试日志。
    - 比如当 S100 存储设备是 eMMC（64GB、MLC、3000 次擦写）时，若每分钟写入 10MB 日志，则连续工作十年消耗 27%寿命，考虑写入放大，消耗更多。
</DocScope>
<DocScope products="RDK S600">
4.  S600 日志写入存储设备保存。考虑到存储设备的寿命有限和大量存储日志对 IO/CPU 性能的影响，应只输出必要的日志，正式版本不应输出大量调试日志。
    - 比如当 S600 存储设备是 UFS 3.1（64GB 或 256GB）时，若每分钟写入 10MB 日志，则连续工作十年同样会消耗一定的存储寿命，考虑写入放大，消耗更多。
</DocScope>

:::warning
日志会持续写入存储设备，长期大量输出调试日志会消耗存储寿命并影响 IO/CPU 性能，正式版本只应输出必要日志；排查时建议先把现场日志拷出再清理，避免被滚动策略删除。
:::

### logcat 使用

1.  logcat 命令格式

| # | 参数 | 描述 |
|---|---|---|
| 1 | `-b <buffer>` | 加载指定的日志缓冲区。本平台需传完整节点名 `log_main`、`log_system`、`log_radio`、`log_events`；不带该参数时默认读取 `log_main` |
| 2 | `-c` | 清除缓冲区中的全部日志并退出（清除完后可以使用 `-g` 查看缓冲区） |
| 3 | `-d` | 将缓冲区的 log 转存到屏幕中然后退出 |
| 4 | `-f <filename>` | 将 log 输出到指定的文件 `<filename>`，默认为标准输出（stdout） |
| 5 | `-g` | 打印日志缓冲区的大小并退出 |
| 6 | `-n <count>` | 设置日志的最大数目 `<count>`，默认值是 4，需要和 `-r` 选项一起使用 |
| 7 | `-r <kbytes>` | 每输出 `<kbytes>` 时轮转日志文件，默认值是 16，需要和 `-f` 选项一起使用 |
| 8 | `-s` | 设置过滤器 |
| 9 | `-v <format>` | 设置日志消息的输出格式，默认是短格式 |

:::info
`logcat -h` 的帮助文本列出的是 `main`/`system`/`radio`/`events`，但本平台实现会把它拼成 `/dev/<buffer>` 路径，短名会报 `Unable to open log device`；请使用 `log_main`、`log_system`、`log_radio`、`log_events` 完整节点名。其中 `log_main` 为 2MB，其余 3 个各 256KB，不带 `-b` 时默认读取 `log_main`。
:::

```bash
# 查看 main 缓冲区大小
logcat -g

# 查看 radio/system/events 缓冲区（注意需用完整节点名）
logcat -b log_radio -g
logcat -b log_system -g
logcat -b log_events -g
```

## Log debug

### 死机情况如何保存有效日志记录

1.  在出现系统 panic 死机的时候，pstore 的机制是可以将发生 panic 的内核 log 信息存储到 pstore 的目录中的，但 BL31 和 mcu 的 panic 信息没法保存，需要注意。

### 有效获取问题时刻日志

1.  在 Log 分区中的文件的命名字段中包含对应 log 文件的最后修改时间的信息，可以去文件中查找问题时刻的 log。

## 常见问题

### 串口实时查看日志出现丢失

**原因**：串口输出速度较慢，实时日志量过大时打印会被覆盖，内核会提示 `logcat lost message`。

**解决**：改为在 SSH 窗口查看日志；或只输出必要日志、适当增大轮转数量。

### 日志占用过多存储寿命

**原因**：大量调试日志持续写入存储设备（如 eMMC / UFS），产生写入放大后消耗存储寿命。

**解决**：正式版本只输出必要日志，不输出大量调试日志；按需裁剪 log 服务与日志级别。

### 死机时部分模块日志缺失

**原因**：pstore 机制只能保存发生 panic 的内核日志，BL31 与 MCU 的 panic 信息无法保存。

**解决**：排查死机时以 pstore 内核日志为准，MCU/BL31 侧信息通过串口或转存 Acore 的方式在运行时留存。

## 相关文档

- [系统日志查看](/System_configuration/system_log)
- [Linux 命令 dmesg](/Appendix/linux-command-manual/dmesg)
