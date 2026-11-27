---
sidebar_position: 2
title: "hrut_boardid"
description: "RDK 命令 hrut_boardid 用法"
---

# hrut_boardid

**hrut_boardid** 命令用于获取当前开发板的编号（不同开发板的编号不同）。

:::warning 注意
boardid 会影响到启动时硬件的初始化，请谨慎设置。
:::

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

## 语法说明

```text
hrut_boardid
```

## 常用命令

获取当前开发板的编号：

<DocScope products="RDK S100">

```shell
root@ubuntu:~# hrut_boardid
0x6A84
```

输出说明：
```text
0x   6A          8             4
     ^^          ^             ^
     ||          |             |
  芯片代号   板级电源设计   板级设计版本
```

</DocScope>

<DocScope products="RDK S600">

```shell
root@ubuntu:~# hrut_boardid
0x5131310
```

输出说明：
```text
0x   5131310
     ^^^^^^^
  S600 载板硬件编号（Board Id）
```

</DocScope>
