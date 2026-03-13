---
sidebar_position: 8
---

# 7.2.8 Log使用指南

## Log系统分区规划

### Log分区

| 分类 | log类型 | 存储位置 | 单个log最大大小 | log文件数量 | 是否压缩 | 内容 |
|---|---|---|---|---|---|---|
| 基础系统log | kernel | `/var/log/` | NA | 4 | 是 | 内核、驱动、syslog的log信息 |
| 基础系统log | pstore | `/log/pstore` | 4M | 100 | 否 | 内核crash的log信息 |
| 基础系统log | coredump | `/log/coredump` | NA | NA | 否 | 应用crash的coredump文件，目录大小限制2G |
| 基础系统log | coredump | `/log/stackdump` | NA | 20 | 否 | 应用crash的log信息 |
| 基础系统log | remoteproc | `/log/dsp0` | 1M | 200 | 否 | DSP0固件输出的log信息 |
| 基础系统log | remoteproc | `/log/bl31` | 1M | 200 | 否 | BL31固件输出的log信息 |
| 基础系统log | remoteproc | `/log/optee` | 1M | 200 | 否 | optee固件输出的log信息 |
| 基础系统log | remoteproc | `/log/mcu*` | 2M | 200 | 否 | mcu固件输出的log信息 |
| 基础系统log | remoteproc | `/log/bpu0` | 1M | 200 | 否 | bpu0固件输出的log信息 |
| 基础系统log | remoteproc | `/log/hsm` | 1M | 200 | 否 | hsm固件输出的log信息 |
| 基础系统log | remoteproc | `/log/uboot` | 8KB | 100 | 否 | uboot输出的log信息 |
| 基础系统log | reset | `/log/reset_reason.txt` | 1M | 1 | 否 | 记录每次系统启动原因 |
| 基础系统log | reset | `/log/reset_count.txt` | 4KB | 1 | 否 | 记录当前系统重启次数 |
| ALOG系统 | ALOG | `/log/usr` | 2M | 200 | 否 | ALOG接口的log信息 |
| systemd | journal | `/log/journal` | NA | NA | 否 | systemd journal，总大小约100MB |

### Log内容

1.  Kernel Log
    -   内核log：通过rsyslog转存到`/var/log/`目录下
    -   pstore
        log：当内核crash重启时，移动`/sys/fs/pstore`目录日志到`/log/pstore`目录下，记录系统panic前后的内核日志
2.  启动原因log
    -   reset_reason.txt信息介绍：
        -   poweroff：断电后等待30s后正常上电（零下10度以下需要断电时间更长）
        -   hwreset：拉reset pin重启
        -   ddrtrainfail：ddr training失败重启
        -   pmicwdt：pmic watchdog重启
        -   mreboot：mcu正常重启
        -   mpanic：mcu panic重启
        -   mwdt：系统各种原因导致的hang住引起的watchdog复位
        -   mhlost：Acore丢心跳重启
        -   deepsleep：深睡眠重启
        -   lightsleep：浅睡眠唤醒
        -   scpreboot：scp正常重启
        -   splreboot：spl正常重启
        -   splpanic：spl panic重启
        -   freboot：bl31正常重启
        -   fpanic：bl31 panic重启
        -   oreboot：optee正常重启
        -   opanic：optee panic重启
        -   ureboot：uboot正常重启
        -   upanic：uboot panic重启
        -   kreboot：kernel正常重启
        -   kpanic：kernel panic重启
        -   lmbistfail：硬件bist失败重启
        -   sblpanic：sbl panic重启
        -   mbdiso：bdiso错误重启
        -   offsleep：main off + mcu sleep重启
        -   mainreboot：main reboot重启
        -   invalidtemp：异常温度重启
    -   reset_count.txt：当前系统重启次数，0到9999循环计数
3.  remoteproc log
    -   dsp*：dsp*固件输出的log信息
    -   bl31：bl31固件输出的log信息
    -   optee：optee固件输出的log信息
    -   mcu：mcu固件输出的log信息
    -   bpu*：bpu*固件输出的log信息
    -   hsm：hsm固件输出的log信息，加密保存
    -  uboot：uboot输出的log信息

4.  ALOG系统
    -   使用libalog库的pr_*接口打印的log信息
    -   应用软件推荐使用libalog库的pr_*接口
5.  systemd journal log
    -   systemd运行过程中的日志，目前配置大小100MB，实际占用会更大，大约达到102MB
    -   systemd
        journal在应对异常掉电、系统时间异常等情况时，可能会出现丢失本次启动日志的情况
6.  应用crash log
    -   coredump：储存进程在突然崩溃那一刻的内存快照，会把进程此刻内存、寄存器状态、运行堆栈等信息转储保存在该目录文件中，量产建议关闭
    -   stackdump：debug版本开启，储存systemd服务进程在突然崩溃那一刻的状态信息，占用空间小

## Log管理

### Log进程

1.  进程信息
    -   板端log进程运行信息如下，不同设备的log进程有所区别，以实际命令结果为准：

    ```Shell
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

    -  kernel： rsyslog

        -  获取内核记录的消息，将消息数据转存到文件中

    -  usr： ALOG(libalog.so)和logcat

        -  通过ALOG接口pr_*向log buffer写入log信息，logcat从log buffer中获取log信息，将其写入文件中

    -  remoteproc_log：hrut_remoteproc_log、hsm_log、optee_log进程

        -  通过remoteproc节点获取MCU，DSP，BL31，BPU，HSM，OPTEE的log信息，将其写入文件中

    -  日志管理：hobot-log和hobot-log-rename.py

        -  log记录：记录reset，pstore，uboot的log信息

        -  log管理：定期每10分钟将原始log文件转存成固定格式文件，管控各个分区目录的存储空间，
         超过固定容量会进行删除，删除时间比较早产生的文件

2.  启动顺序
    -   hobot-log-daemon.service服务开机自启，启动hobot-log守护进程，去启动相关log服务，并管理日志，启动顺序如下：

        ```Shell
        |- /usr/bin/hobot-log
              |- record_reset_count(shell function)
              |- record_reset_reason(shell function)
              |- message_rotate_and_add_resetcount(shell function)
              |- wait_for_timesync(shell function)
              |- set_pstore(shell function)
              |- set_uboot(shell function)
              |- systemd_journal_config(shell function)
              |- check_first_log(shell function)
              |- 启动相关log服务，启动各个模块日志记录进程
              |- hobot-log-rename.py脚本进行日志重命名归档、空间管理
        ```

### Log管理方式

log的文件生成和目录空间管控主要是由hobot-log和hobot-log-rename.py去管理的。

1.  log管理
    -   容量管控：
        -   在hobot-log脚本中配置了各个模块的日志文件大小和数量限制，这些限制会通过入参传递给各个模块日志进程。每个模块日志文件限制说明见：[log分区](#log分区)
        -   各个模块的进程管理各自的日志文件大小和数量限制，超过限制后会删除产生时间比较早的文件
    -   log文件重命名归档：
        -   启动时，转存uboot和pstore log，命名格式如下：
            -   SuperSoC_Uboot-count-time.Log：当系统启动时，将uboot
                log转存到uboot的archive目录下
            -   SuperSoC_Pstore-count-time（文件夹）：当系统启动时，如果检测到上次系统是异常重启，则创建该格式文件夹，并将对应的异常log信息记录到该文件夹下
        -   运行时，log文件通过hobot-log-rename.py进程重命名归档，每10分钟各模块目录下的message.*文件重命名归档到模块的archive目录下，并根据容量管控删除archive目录下旧文件
            -   该进程由hobot-log-rename.service服务启动，根据hobot-log生成的配置文件`/log/hb_log_rename.conf`管理各模块
            -   如果不希望运行过程中重命名日志文件，通过修改`hbre/boot-utils/hb-init-scripts/DEBIAN/postinst`文件，关闭该服务自启
            -   关闭后如果还希望对当前的log文件重命名归档，可以手动执行如下命令：`python3 /usr/bin/hobot-log-rename.py /log -m manual`
            -   log文件重命名格式如下：
                -   示例：SuperSoC_Usr-0003-2025_05_06_08_01_00_131599.Log
                -   命名说明：[board]_[module]-[count]-[time]\_\<inode>.Log
                    -   board：SuperSoC
                    -   module：Usr，Uboot，Pstore等首字母大写
                    -   count：4位数字，0000到9999，示例中代表第3次重启
                    -   time：如2025_05_06_08_01_00
                    -   inode：如131599，但正常情况下没有，只有当出现同一秒转存多个文件命名存在重合时，加入inode号来做区分

    -   内核日志使用ubuntu系统自带的rsyslog服务管理，因此这里对内核log管理方式做单独介绍。
        -   容量管控：
            -   不会限制单个kern.log的大小
            -   日志每周进行一次轮转
            -   系统最多保留4个历史日志文件
        -   log归档：
            -   当日志轮转发生时，当前日志文件会按照编号进行重命名归档。归档原则：kern.log达到轮转周期，logrotate将kern.log重命名为kern.log.1，创建新的kern.log，rsyslog继续写入日志。当超过最大数量限制后，最开始产生的日志文件会被删除
            -   为减少磁盘占用，系统会对历史日志进行压缩。压缩策略：最近一次轮转日志延迟一轮再解压缩
        - 参数配置：
            -   如果用不想使用ubuntu默认配置参数来配置日志管理策略，可以通过修改`/etc/logrotate.d/rsyslog`文件中的配置实现。
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

2.  定制log系统
    -   log大小和数量修改
        -   日志大小在hobot-log中修改，修改`ROTATESIZE`和`ROTATESIZE_REMOTE`变量的定义，单位是KB
        -   日志数量在hobot-log中修改，修改`ROTATEGENS_USR、ROTATEGENS_REMOTE、UBOOT_LOGMAX、PSTORE_LOGMAX`变量的定义，对应的分别是usr、remoteproc_log、uboot、pstore的日志数量限制，当前值分别是200、200、100、100
        -   systemd journal
            log大小配置在源码`debian/source/scripts/general.sh`脚本中修改SystemMaxUse值，同时需要注意文件大小SystemMaxFileSize和文件数量SystemMaxFiles限制相乘要大于SystemMaxUse
    -   log命名修改
        -   当前命名规范是[board]_[module]-[count]-[time]\_\<inode>.Log，在hobot-log脚本中修改前缀和尾缀，即[board]\_[module]和.Log。在hobot-log-rename.py脚本中修改[count]和[time]，涉及`get_reset_count`和`get_file_time`两个函数
    -   log进程的裁剪
        -   可以通过增减systemd的log
            service，来增减log进程，通过修改`hbre/boot-utils/hb-init-scripts/DEBIAN/postinst`文件实现。部分log相关服务如下：

            ```Shell
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

        -   以hobot-log-logcat.service为例，介绍设备端如何控制log服务启停：

            ```Shell
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
3.  log时间
    -   hobot-log提供了等待时间同步完成的功能，以确保日志中的时间戳准确。该功能可通过``YEAR_LIMIT和WAIT_FOR_TIMESYNC_TIMEOUT两``个变量进行配置，分别用于设定时间同步成功的阈值以及超时时间。需要注意的是，Debian系统的默认时间为其发行版本的发布时间。因此，在每次更新Debian版本时，应相应修改``YEAR_LIMIT``的值，使其大于该版本的发布时间。通常情况下，将其配置为最新日期即可。

## Log接口使用推荐

### Kernel

1.  在驱动中推荐使用如下接口dev_err, dev_warn, dev_info, dev_dbg。
2.  没有设备结构的场合使用如下接口pr_error, pr_warn, pr_info,
    pr_debug。
3.  pr_debug，dev_dbg可通过如下方法动态开启。
    -   ``echo "file drivers/mmc/host/* +p" >
        /sys/kernel/debug/dynamic_debug/control``
    -   ``echo "module mmc_core +p" >
        /sys/kernel/debug/dynamic_debug/control``
    -   ``echo "func mmc_detect_change +p" >
        /sys/kernel/debug/dynamic_debug/control``
4.  对于出错后可能重复非常多次的打印，用如下接口。
    -   printk_once： 只打印一次
    -   printk_ratelimited： 限制每秒打印次数，默认每5秒最多打印10次
5.  内核敏感地址打印方法。
    -   内核敏感地址使用%pK替代%p,
        配置`/proc/sys/kernel/kptr_restrict`为2后，打印地址为全0

### 应用程序

1.  推荐使用pr的接口，对应的打印级别有`pr_verbose、pr_debug、pr_info、pr_warn、pr_err、pr_fatal、pr_verbose_with_tag、pr_debug_with_tag、pr_info_with_tag、pr_warn_with_tag、pr_err_with_tag、pr_fatal_with_tag`。

2.  使用pr*
    接口时，各个模块在输出Log时，可以通过定义LOG_TAG宏来打印自身模块名，logcat支持使用tag筛选日志。其可通过Makefile传入，如：`DLOG_TAG=camera`；或者在代码开头声明。

3.  使用pr*
    _tag接口时，各个模块在输出Log时，可以通过第一个参数来打印自身模块名，logcat支持使用tag筛选日志。

4.  log系统支持1个2MB的log_main缓冲区，1个256KB的log_radio缓冲区，建议使用log_main缓冲区。

    -   当LOG_TAG是"HTC_RIL"、"RIL"、"IMS"、"AT"、"GSM"、"STK"、"CDMA"、"PHONE"、"SMS"时，日志保存到log_radio缓冲区，其他的都保存到log_main缓冲区。

5.  代码示例和测试结果如下：

    ```c
    //gcc logtest.c -o logtest -L . -lalog -I /usr/hobot/include/
    #define LOG_TAG "alog_test"
    #include <stdio.h>
    #include <logging.h>

    int main(int argc, char **argv)
    {
       pr_verbose("*ALOG test start*n");
       pr_debug("********1********n");
       pr_info("********2********n");
       pr_warn("********3********n");
       pr_err("********4********n");
       pr_verbose("*ALOG test end***n");
       return 0;
    }
    ```

    ```Shell
    # 测试结果：
    root@ubuntu:/# ./logtest

    # 不设置过滤：
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

    设置过滤-s *:F
    root@ubuntu:/# logcat -s *:F
    logcat test start !!!
    --------- beginning of /dev/log_main
    F/tag     (21590): ********1********

    设置过滤-s *:E
    root@ubuntu:/# logcat -s *:E
    logcat test start !!!
    --------- beginning of /dev/log_main
    E/alog_test(21590): ********4********
    E/tag     (21590): ********4********
    F/tag     (21590): ********1********

    设置过滤-s tag:E
    root@ubuntu:/# logcat -s tag:E
    logcat test start !!!
    --------- beginning of /dev/log_main
    E/tag     (21590): ********4********
    F/tag     (21590): ********1********
    ```

### MCU

`LogSync/LogNotice/LogAsync`接口支持将log输出到串口以及转存到Acore。

其中，转存到Acore的临时文件节点在：`/proc/remoteproc_mcu0`和`/proc/remoteproc_mcu1`，Acore会启动hrut_remoteproc_log进程周期性的获取proc节点中的日志写入`/log/mcu*`的messag文件实现转存。

由于单个文件可以存储的日志大小有限，加上重启后上一次存储的message日志会被启动的log进程重写覆盖。所以实现了log管理机制支持对log文件重命名归档，具体描述见：[log管理](#log管理)。

1.  LogSync用于同步打印优先级较低的日志。

在debug镜像中使用LogSync接口，日志会正常输出到串口和转存到Acore。在release镜像中不会向串口输出，只保留转存到Acore的功能。

2.  LogNotice用于同步打印优先级较高的日志。

LogNotice无论是在debug还是release镜像，日志都会正常输出到串口和转存到Acore。

3.  LogAsync用于异步打印。

LogAsync输出原则同LogSync。

**接口使用说明**

编译路径添加`Service/Log`，代码引用`Service/Log/Common/inc/`下的头文件`Log.h`，即可调用LogSync、LogNotice以及LogAsync接口。

串口打印和转存Acore的功能由`Service/Log/Config/inc/Log_Cfg.h`中的两个宏`LOG_SEND_TO_UART`和`LOG_SEND_TO_ACORE`控制：

```c
#define LOG_SEND_TO_ACORE  (STD_ON)
#ifdef MCU_RELEASE
   #define LOG_SEND_TO_UART   (STD_OFF)    // LogSync 和 LogAsync 打印到串口通路关闭，必要信息将通过 LogNotice 临时开启串口通路来打印。
#else
   #define LOG_SEND_TO_UART   (STD_ON)     // LogSync、LogNotice以及LogAsync 打印到串口通路始终开启。
#endif
```

MCU Log使用注意事项，请参考：[MCU Log简介](../05_mcu_development/01_S100/01_basic_information.md#mcu-log简介)。

### DSP

1.  推荐使用`DSP_ERR、DSP_WARN、DSP_INFO、DSP_DBG`接口。

## Log使用注意

### Log调试注意点

1.  调试时大量日志可以单独保存，防止丢失，方便查看
    -   内核日志：`dmesg -w > /userdata/dmesg.log &`
    -   ALOG日志：`logcat -v time -f /userdata/logcat.log &`
2.  每个转存周期（10min）内产生超过rotate数量的日志会造成日志丢失
    -   首先应只输出必要的日志
    -   如果输出较多log，在设置rotate的数量时候，要考虑好所需大小
3.  不要在串口、ssh窗口实时查看日志。可能会发现丢日志，原因是输出慢，覆盖导致。如果必须，建议ssh窗口实时查看日志。
    -   比如使用logcat在串口实时查看输出，内核若输出"logcat lost
        message"，则说明有日志丢失。
4.  S100/S600日志写入存储设备保存。考虑到存储设备的寿命有限和大量存储日志对
    IO/CPU性能的影响，应只输出必要的日志，正式版本不应输出大量调试日志。
    -   比如当 S100/S600 存储设备是eMMC（64GB、MLC、3000次擦写）时，若每分钟写入10MB
        日志，则连续工作十年消耗27%寿命，考虑写入放大，消耗更多。

### logcat使用

1.  logcat命令格式

| # | 参数 | 描述 |
|---|---|---|
| 1 | `-b <buffer>` | 加载一个可使用的日志缓冲区供查看，比如 event 和 radio，默认值是 main |
| 2 | `-c` | 清除缓冲区中的全部日志并退出（清除完后可以使用 `-g` 查看缓冲区） |
| 3 | `-d` | 将缓冲区的 log 转存到屏幕中然后退出 |
| 4 | `-f <filename>` | 将 log 输出到指定的文件 `<filename>`，默认为标准输出（stdout） |
| 5 | `-g` | 打印日志缓冲区的大小并退出 |
| 6 | `-n <count>` | 设置日志的最大数目 `<count>`，默认值是 4，需要和 `-r` 选项一起使用 |
| 7 | `-r <kbytes>` | 每输出 `<kbytes>` 时轮替日志文件，默认值是 16，需要和 `-f` 选项一起使用 |
| 8 | `-s` | 设置过滤器 |
| 9 | `-v <format>` | 设置日志消息的输出格式，默认是短格式 |

## Log debug

### 死机情况如何保存有效日志记录

1.  在出现系统panic死机的时候，pstore的机制是可以将发生panic的内核log信息存储到pstore的目录中的，但BL31和mcu的panic信息没法保存，需要注意。

### 有效获取问题时刻日志

1.  在log分区中的文件的命名字段中包含对应log文件的最后修改时间的信息，可以去文件中查找问题时刻的log。
