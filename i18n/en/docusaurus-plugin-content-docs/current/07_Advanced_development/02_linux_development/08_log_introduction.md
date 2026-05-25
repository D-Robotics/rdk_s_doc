---
sidebar_position: 8
title: "7.2.8 Log User Guide"
---

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

# 7.2.8 Log User Guide

## Log System Partition Planning

### Log Partitions

| Category | Log Type | Storage Location | Max Single Log Size | Number of Log Files | Compressed | Content |
|---|---|---|---|---|---|---|
| Basic system log | kernel | `/var/log/` | NA | 4 | Yes | Kernel, driver, and syslog log information |
| Basic system log | pstore | `/log/pstore` | 4M | 100 | No | Kernel crash log information |
| Basic system log | coredump | `/log/coredump` | NA | NA | No | Application crash coredump files; directory size limited to 2 GB |
| Basic system log | coredump | `/log/stackdump` | NA | 20 | No | Application crash log information |
| Basic system log | remoteproc | `/log/dsp0` | 1M | 200 | No | Log output from DSP0 firmware |
| Basic system log | remoteproc | `/log/bl31` | 1M | 200 | No | Log output from BL31 firmware |
| Basic system log | remoteproc | `/log/optee` | 1M | 200 | No | Log output from OP-TEE firmware |
| Basic system log | remoteproc | `/log/mcu*` | 2M | 200 | No | Log output from MCU firmware |
| Basic system log | remoteproc | `/log/bpu0` | 1M | 200 | No | Log output from BPU0 firmware |
| Basic system log | remoteproc | `/log/hsm` | 1M | 200 | No | Log output from HSM firmware |
| Basic system log | remoteproc | `/log/uboot` | 8KB | 100 | No | Log output from U-Boot |
| Basic system log | reset | `/log/reset_reason.txt` | 1M | 1 | No | Records the reason for each system boot |
| Basic system log | reset | `/log/reset_count.txt` | 4KB | 1 | No | Records the current system reboot count |
| ALOG system | ALOG | `/log/usr` | 2M | 200 | No | Log information from ALOG interfaces |
| systemd | journal | `/log/journal` | NA | NA | No | systemd journal; total size approximately 100 MB |

### Log Content

1.  Kernel Log
    -   Kernel logs: transferred to the `/var/log/` directory through rsyslog
    -   pstore
        log: when the kernel crashes and reboots, logs in the `/sys/fs/pstore` directory are moved to `/log/pstore`, recording kernel logs before and after a system panic
2.  Boot reason log
    -   reset_reason.txt field descriptions:
        -   poweroff: normal power-on after waiting 30 seconds after power-off (longer power-off time is required below -10°C)
        -   hwreset: reboot triggered by pulling the reset pin
        -   ddrtrainfail: reboot caused by DDR training failure
        -   pmicwdt: reboot caused by PMIC watchdog
        -   mreboot: normal MCU reboot
        -   mpanic: MCU panic reboot
        -   mwdt: watchdog reset caused by system hang for various reasons
        -   mhlost: reboot caused by Acore heartbeat loss
        -   deepsleep: deep sleep reboot
        -   lightsleep: light sleep wake-up
        -   scpreboot: normal SCP reboot
        -   splreboot: normal SPL reboot
        -   splpanic: SPL panic reboot
        -   freboot: normal BL31 reboot
        -   fpanic: BL31 panic reboot
        -   oreboot: normal OP-TEE reboot
        -   opanic: OP-TEE panic reboot
        -   ureboot: normal U-Boot reboot
        -   upanic: U-Boot panic reboot
        -   kreboot: normal kernel reboot
        -   kpanic: kernel panic reboot
        -   lmbistfail: reboot caused by hardware BIST failure
        -   sblpanic: SBL panic reboot
        -   mbdiso: reboot caused by BDISO error
        -   offsleep: reboot caused by main off + MCU sleep
        -   mainreboot: main reboot
        -   invalidtemp: reboot caused by abnormal temperature
    -   reset_count.txt: current system reboot count, cycling from 0 to 9999
3.  remoteproc log
    -   dsp*: log output from dsp* firmware
    -   bl31: log output from BL31 firmware
    -   optee: log output from OP-TEE firmware
    -   mcu: log output from MCU firmware
    -   bpu*: log output from bpu* firmware
    -   hsm: log output from HSM firmware, stored with encryption
    -  uboot: log output from U-Boot

4.  ALOG system
    -   Log information printed through the `pr_*` interfaces of the libalog library
    -   Application software is recommended to use the `pr_*` interfaces of the libalog library
5.  systemd journal log
    -   Logs generated during systemd operation; currently configured for 100 MB, but actual usage may be slightly larger, approximately 102 MB
    -   systemd
        journal may lose logs from the current boot when handling abnormal power loss, abnormal system time, and similar situations
6.  Application crash log
    -   coredump: stores a memory snapshot of a process at the moment of sudden crash, dumping memory, register state, call stack, and other information into files in this directory; recommended to disable in mass production
    -   stackdump: enabled in debug builds; stores state information of systemd service processes at the moment of sudden crash with smaller space usage

## Log Management

### Log Processes

1.  Process information
    -   The on-board log process information is shown below. Log processes may differ across devices; refer to the actual command output:

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

    -  kernel: rsyslog

        -  Retrieves messages recorded by the kernel and transfers them to files

    -  usr: ALOG (libalog.so) and logcat

        -  Writes log information to the log buffer through ALOG `pr_*` interfaces; logcat reads log information from the log buffer and writes it to files

    -  remoteproc_log: hrut_remoteproc_log, hsm_log, and optee_log processes

        -  Retrieves log information from MCU, DSP, BL31, BPU, HSM, and OP-TEE through remoteproc nodes and writes it to files

    -  Log management: hobot-log and hobot-log-rename.py

        -  Log recording: records reset, pstore, and U-Boot log information

        -  Log management: every 10 minutes, transfers raw log files into fixed-format files and manages storage space in each partition directory;
         when the fixed capacity is exceeded, older files are deleted

2.  Startup sequence
    -   The hobot-log-daemon.service starts automatically at boot, launches the hobot-log daemon, starts related log services, and manages logs. The startup sequence is as follows:

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
              |- Start related log services and module log recording processes
              |- hobot-log-rename.py script performs log renaming, archiving, and space management
        ```

### Log Management Methods

Log file generation and directory space management are mainly handled by hobot-log and hobot-log-rename.py.

1.  Log management
    -   Capacity control:
        -   The hobot-log script configures log file size and count limits for each module. These limits are passed as arguments to each module log process. For per-module log file limits, see: [Log Partitions](#log-partitions)
        -   Each module process manages its own log file size and count limits. When limits are exceeded, the oldest files are deleted
    -   Log file renaming and archiving:
        -   At startup, U-Boot and pstore logs are transferred with the following naming formats:
            -   SuperSoC_Uboot-count-time.Log: when the system starts, U-Boot
                logs are transferred to the U-Boot archive directory
            -   SuperSoC_Pstore-count-time (folder): when the system starts, if the previous boot was abnormal, a folder in this format is created and the corresponding abnormal log information is recorded in it
        -   During runtime, log files are renamed and archived by the hobot-log-rename.py process. Every 10 minutes, `message.*` files in each module directory are renamed and archived to the module archive directory, and old files in the archive directory are deleted according to capacity control
            -   This process is started by the hobot-log-rename.service service and manages each module according to the configuration file `/log/hb_log_rename.conf` generated by hobot-log
            -   If you do not want log files to be renamed during runtime, disable auto-start of this service by modifying `hbre/boot-utils/hb-init-scripts/DEBIAN/postinst`
            -   After disabling it, if you still want to rename and archive current log files, you can manually run: `python3 /usr/bin/hobot-log-rename.py /log -m manual`
            -   Log file renaming format:
                -   Example: SuperSoC_Usr-0003~2025_05_06_08_01_00_131599.Log
                -   Naming convention: [board]_[module]-[count]-[time]\_\<inode>.Log
                    -   board: SuperSoC
                    -   module: Usr, Uboot, Pstore, etc., with the first letter capitalized
                    -   count: 4-digit number from 0000 to 9999; in the example above, it represents the 3rd reboot
                    -   time: such as 2025_05_06_08_01_00
                    -   inode: such as 131599; normally omitted unless multiple files transferred in the same second would cause naming conflicts, in which case the inode number is added for distinction

    -   Kernel logs are managed by the Ubuntu built-in rsyslog service, so kernel log management is described separately here.
        -   Capacity control:
            -   Individual `kern.log` file size is not limited
            -   Logs rotate weekly
            -   The system retains at most 4 historical log files
        -   Log archiving:
            -   When log rotation occurs, the current log file is renamed and archived by number. Archiving principle: when `kern.log` reaches the rotation period, logrotate renames `kern.log` to `kern.log.1`, creates a new `kern.log`, and rsyslog continues writing logs. When the maximum count is exceeded, the oldest log file is deleted
            -   To reduce disk usage, the system compresses historical logs. Compression strategy: the most recent rotated log is decompressed one rotation later
        - Parameter configuration:
            -   If you do not want to use Ubuntu default configuration parameters for log management, modify the configuration in `/etc/logrotate.d/rsyslog`.
            ```text
            {
                rotate 4  // Maximum number of historical log files to retain
                weekly      // Rotation period
                missingok   // Continue rotating even if a log file is missing
                notifempty  // Do not rotate if the current log is empty
                compress    // Compress with gzip
                delaycompress   // When used with compress, compressed logs are delayed by one rotation
                sharedscripts
                postrotate
                        /usr/lib/rsyslog/rsyslog-rotate
                endscript
            }
            ```

2.  Customizing the log system
    -   Modifying log size and count
        -   Modify log size in hobot-log by changing the definitions of `ROTATESIZE` and `ROTATESIZE_REMOTE`; unit is KB
        -   Modify log count in hobot-log by changing the definitions of `ROTATEGENS_USR`, `ROTATEGENS_REMOTE`, `UBOOT_LOGMAX`, and `PSTORE_LOGMAX`, which correspond to usr, remoteproc_log, U-Boot, and pstore log count limits respectively. Current values are 200, 200, 100, and 100
        -   systemd journal
            log size is configured in the source script `debian/source/scripts/general.sh` by modifying the `SystemMaxUse` value. Note that `SystemMaxFileSize` multiplied by `SystemMaxFiles` should be greater than `SystemMaxUse`
    -   Modifying log naming
        -   The current naming convention is [board]_[module]-[count]-[time]\_\<inode>.Log. Modify the prefix and suffix, that is [board]\_[module] and .Log, in the hobot-log script. Modify [count] and [time] in the hobot-log-rename.py script, involving the `get_reset_count` and `get_file_time` functions
    -   Trimming log processes
        -   You can add or remove log processes by adding or removing systemd log
            services through modifications to `hbre/boot-utils/hb-init-scripts/DEBIAN/postinst`. Some log-related services are listed below:

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

        -   Using hobot-log-logcat.service as an example, here is how to control log service startup and shutdown on the device:

            ```Shell
            # Enable service auto-start at boot
            systemctl enable hobot-log-logcat.service
            # Disable service auto-start at boot
            systemctl disable hobot-log-logcat.service
            # Check service status
            systemctl status hobot-log-logcat.service
            # Start service
            systemctl start hobot-log-logcat.service
            # Stop service
            systemctl stop hobot-log-logcat.service
            ```
3.  Log time
    -   hobot-log provides a feature to wait for time synchronization to complete, ensuring accurate timestamps in logs. This feature can be configured through the ``YEAR_LIMIT`` and ``WAIT_FOR_TIMESYNC_TIMEOUT`` variables, which set the threshold for successful time synchronization and the timeout respectively. Note that the default time on Debian systems is the release date of that Debian version. Therefore, whenever the Debian version is updated, ``YEAR_LIMIT`` should be updated accordingly to a value greater than that release date. In general, configure it to the latest date.

## Recommended Log Interface Usage

### Kernel

1.  In drivers, the following interfaces are recommended: dev_err, dev_warn, dev_info, dev_dbg.
2.  When there is no device structure, use the following interfaces: pr_error, pr_warn, pr_info,
    pr_debug.
3.  pr_debug and dev_dbg can be enabled dynamically as follows.
    -   ``echo "file drivers/mmc/host/* +p" >
        /sys/kernel/debug/dynamic_debug/control``
    -   ``echo "module mmc_core +p" >
        /sys/kernel/debug/dynamic_debug/control``
    -   ``echo "func mmc_detect_change +p" >
        /sys/kernel/debug/dynamic_debug/control``
4.  For prints that may repeat very frequently after an error, use the following interfaces.
    -   printk_once: print only once
    -   printk_ratelimited: limit print frequency; by default, at most 10 prints every 5 seconds
5.  Printing sensitive kernel addresses.
    -   Use %pK instead of %p for sensitive kernel addresses.
        After setting `/proc/sys/kernel/kptr_restrict` to 2, printed addresses appear as all zeros

### Applications

1.  The pr interfaces are recommended. Supported print levels are `pr_verbose`, `pr_debug`, `pr_info`, `pr_warn`, `pr_err`, `pr_fatal`, `pr_verbose_with_tag`, `pr_debug_with_tag`, `pr_info_with_tag`, `pr_warn_with_tag`, `pr_err_with_tag`, and `pr_fatal_with_tag`.

2.  When using pr*
    interfaces, each module can define the `LOG_TAG` macro to print its module name when outputting logs. logcat supports filtering logs by tag. It can be passed through the Makefile, for example: `DLOG_TAG=camera`; or declared at the beginning of the code.

3.  When using pr*
    _tag interfaces, each module can print its module name through the first parameter when outputting logs. logcat supports filtering logs by tag.

4.  The log system supports one 2 MB log_main buffer and one 256 KB log_radio buffer. The log_main buffer is recommended.

    -   When LOG_TAG is "HTC_RIL", "RIL", "IMS", "AT", "GSM", "STK", "CDMA", "PHONE", or "SMS", logs are saved to the log_radio buffer; all others are saved to the log_main buffer.

5.  Code example and test results:

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
    # Test results:
    root@ubuntu:/# ./logtest

    # Without filtering:
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

    Filter with -s *:F
    root@ubuntu:/# logcat -s *:F
    logcat test start !!!
    --------- beginning of /dev/log_main
    F/tag     (21590): ********1********

    Filter with -s *:E
    root@ubuntu:/# logcat -s *:E
    logcat test start !!!
    --------- beginning of /dev/log_main
    E/alog_test(21590): ********4********
    E/tag     (21590): ********4********
    F/tag     (21590): ********1********

    Filter with -s tag:E
    root@ubuntu:/# logcat -s tag:E
    logcat test start !!!
    --------- beginning of /dev/log_main
    E/tag     (21590): ********4********
    F/tag     (21590): ********1********
    ```

### MCU

The `LogSync`, `LogNotice`, and `LogAsync` interfaces support outputting logs to the serial port and transferring them to Acore.

Temporary file nodes for transfer to Acore are located at `/proc/remoteproc_mcu0` and `/proc/remoteproc_mcu1`. Acore starts the hrut_remoteproc_log process to periodically retrieve logs from proc nodes and write them to `/log/mcu*` message files for transfer.

Because a single file can store only a limited amount of logs, and the message log stored before reboot is overwritten when the log process starts after reboot, a log management mechanism is implemented to support log file renaming and archiving. For details, see: [Log Management](#log-management).

1.  LogSync is used for synchronous printing of lower-priority logs.

When using the LogSync interface in a debug image, logs are output normally to the serial port and transferred to Acore. In a release image, logs are not output to the serial port; only transfer to Acore is retained.

2.  LogNotice is used for synchronous printing of higher-priority logs.

LogNotice outputs logs to both the serial port and Acore in both debug and release images.

3.  LogAsync is used for asynchronous printing.

LogAsync follows the same output principles as LogSync.

**Interface Usage**

Add `Service/Log` to the build path and include the header file `Log.h` under `Service/Log/Common/inc/` to call the LogSync, LogNotice, and LogAsync interfaces.

Serial port output and Acore transfer are controlled by the two macros `LOG_SEND_TO_UART` and `LOG_SEND_TO_ACORE` in `Service/Log/Config/inc/Log_Cfg.h`:

```c
#define LOG_SEND_TO_ACORE  (STD_ON)
#ifdef MCU_RELEASE
   #define LOG_SEND_TO_UART   (STD_OFF)    // LogSync and LogAsync serial output is disabled; necessary information is printed temporarily through LogNotice by enabling the serial path.
#else
   #define LOG_SEND_TO_UART   (STD_ON)     // LogSync, LogNotice, and LogAsync serial output is always enabled.
#endif
```

For MCU Log usage notes, see: [Introduction to MCU Log](../05_mcu_development/01_basic_information.md#introduction-to-mcu-log).

### DSP

1.  The `DSP_ERR`, `DSP_WARN`, `DSP_INFO`, and `DSP_DBG` interfaces are recommended.

## Log Usage Notes

### Log Debugging Notes

1.  During debugging, large volumes of logs can be saved separately to prevent loss and facilitate review
    -   Kernel logs: `dmesg -w > /userdata/dmesg.log &`
    -   ALOG logs: `logcat -v time -f /userdata/logcat.log &`
2.  Producing more logs than the rotate count within each transfer cycle (10 min) can cause log loss
    -   Only necessary logs should be output first
    -   If more logs are output, consider the required size when setting the rotate count
3.  Do not view logs in real time on the serial port or SSH window. Log loss may occur because slow output causes overwrite. If necessary, use an SSH window to view logs in real time.
    -   For example, if the kernel outputs "logcat lost
        message" while using logcat on the serial port in real time, log loss has occurred.

<DocScope products="RDK S100">
4.  S100 logs are written to storage devices. Considering the limited lifespan of storage devices and the impact of large log volumes on
    IO/CPU performance, only necessary logs should be output. Production releases should not output large volumes of debug logs.
    -   For example, when the S100 storage device is eMMC (64 GB, MLC, 3000 erase cycles), writing 10 MB of logs
        per minute consumes 27% of its lifespan over ten years of continuous operation; write amplification may consume even more.
</DocScope>
<DocScope products="RDK S600">
4.  S600 logs are written to storage devices. Considering the limited lifespan of storage devices and the impact of large log volumes on
    IO/CPU performance, only necessary logs should be output. Production releases should not output large volumes of debug logs.
    -   For example, when the S600 storage device is eMMC (64 GB, MLC, 3000 erase cycles), writing 10 MB of logs
        per minute consumes 27% of its lifespan over ten years of continuous operation; write amplification may consume even more.
</DocScope>

### logcat Usage

1.  logcat command format

| # | Parameter | Description |
|---|---|---|
| 1 | `-b \<buffer>` | Load an available log buffer for viewing, such as event and radio; default is main |
| 2 | `-c` | Clear all logs in the buffer and exit (use `-g` after clearing to view the buffer) |
| 3 | `-d` | Dump logs from the buffer to the screen and exit |
| 4 | `-f \<filename>` | Output logs to the specified file `<filename>`; default is standard output (stdout) |
| 5 | `-g` | Print the log buffer size and exit |
| 6 | `-n \<count>` | Set the maximum number of logs `<count>`; default is 4; must be used with the `-r` option |
| 7 | `-r \<kbytes>` | Rotate the log file every `<kbytes>` output; default is 16; must be used with the `-f` option |
| 8 | `-s` | Set filter |
| 9 | `-v \<format>` | Set the output format of log messages; default is brief format |

## Log Debug

### How to Preserve Valid Logs During a System Crash

1.  When a system panic crash occurs, the pstore mechanism can store kernel log information from the panic in the pstore directory. However, BL31 and MCU panic information cannot be saved; please note this.

### How to Effectively Retrieve Logs at the Time of an Issue

1.  File names in the log partition include the last modification time of the corresponding log file. You can search the files for logs at the time of the issue.
