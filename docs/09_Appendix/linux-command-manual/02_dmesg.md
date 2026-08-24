---
sidebar_position: 2
title: "dmesg"
description: "Linux 命令 dmesg 用法"
---

# dmesg

`dmesg` 命令用于查看或控制内核环形缓冲区。

kernel 会将内核启动日志存储在 ring buffer 中。您若是开机时来不及查看信息，可利用 dmesg 来查看。

## 语法说明

```
 dmesg [options]

       dmesg -C / dmesg --clear
       dmesg -c / dmesg --read-clear [options]
```

------

## 选项说明

- -c, --read-clear　显示信息后，清除 ring buffer 中的内容。
- -C, --clear　清除 ring buffer 中的内容。

## 常用命令

- 显示所有 ring buffer 中的内核日志内容

  ```
  dmesg
  ```

  预期输出（节选）：

  ```text
  [    0.000000] Booting Linux on physical CPU 0x0000040000 [0x410fd423]
  [    0.000000] Linux version 6.1.158-rt58-DR-5.1.0-2606102106-g369e4b-gb66940 (aarch64-none-linux-gnu-gcc) #38 SMP PREEMPT_RT Wed Jun 10 21:07:32 CST 2026
  [    0.000000] Machine model: D-Robotics RDK S600 MCB V0p2
  [    0.000000] earlycon: uart8250 at MMIO32 0x000000003484c000 (options '')
  ```

- 把内核日志保存到文件中

  ```
  dmesg > kernel.log
  ```

- 清空缓存日志，在调试驱动时，可以减少日志内容

  ```
  dmesg -C
  ```

  

