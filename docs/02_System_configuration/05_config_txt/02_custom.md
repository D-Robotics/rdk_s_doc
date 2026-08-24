---
title: "自定义 config.txt"
sidebar_position: 2
description: "如何创建和修改 RDK config.txt 配置文件"
---

# 自定义 config.txt

config.txt 是 RDK 的启动配置文件，用于在 U-Boot 阶段配置内核启动参数、DTS 节点、DTB Overlay 等，无需重新编译固件即可调整系统行为。

## 文件位置

config.txt 默认路径为 `/boot/config.txt`，位于启动分区（boot 分区）。出厂镜像中该文件默认为空（0 字节），配置项需按需自行添加。

## 格式规则

- 每行一条配置：`<key>=<value>`
- 第一个 `=` 后的所有内容均为该 key 的值
- 单行不超过 1024 字符
- 以 `#` 开头的行为注释

```text
# 这是一个注释
bootargs=isolcpus=1-2
loglevel=8
```

## 修改方法

### 方法 1：板端直接编辑

boot 分区已通过 `/dev/block/platform/by-name/boot_cur` 挂载到 `/boot`
（见 `/etc/fstab`），通常无需手动挂载。若未挂载，执行 `mount /boot` 即可。

```bash
# 若 /boot 未挂载，先挂载（依赖 /etc/fstab 中的 by-name/boot_cur 条目）
mount /boot

# 编辑 config.txt
vi /boot/config.txt

# 保存后重启生效
reboot
```

### 方法 2：通过 U-Boot 命令行

在启动时按任意键进入 U-Boot 命令行，使用 `setenv` 临时修改（优先级高于 config.txt）。与 config.txt 的 `bootargs=` 追加语义不同，`setenv bootargs` 会整体替换该环境变量，覆盖默认 cmdline（`root=`、`console=` 等关键参数），追加参数需引用已有值：

```text
# U-Boot 命令行（追加内核参数，保留默认 cmdline）
setenv bootargs ${bootargs} isolcpus=1-2 loglevel=8
boot
```

:::warning 优先级
完整环境变量优先级：`setenv（U-Boot 手动）` > `config.txt（配置文件）` > `saveenv（上次保存）`
:::

:::warning AVB 冲突
修改启动分区内容与 AVB（Android Verified Boot）要求冲突。AVB 默认不使能；如已使能 AVB，则不能使用 config.txt。
:::

## 配置生效

config.txt 在每次启动时由 U-Boot 自动读取并解析。修改后**重启开发板**即可生效，无需重新烧录固件。

## 验证

- 挂载就绪：`mount | grep /boot` 能看到 boot 分区已挂载，或 `vi /boot/config.txt` 能正常读写。
- 配置生效：修改后 `reboot`，重启后用 `cat /proc/cmdline` 查看 bootargs、`ls /proc/device-tree/soc/` 查看 fdt 节点确认生效。

## 常见问题

### 编辑 config.txt 时提示只读或找不到文件

**原因**：boot 分区未挂载，或无写权限。

**解决**：执行 `mount /boot` 挂载（依赖 `/etc/fstab` 中 by-name/boot_cur 条目），并用 `sudo` 编辑。

### 追加参数后丢失默认 cmdline

**原因**：在 U-Boot 用 `setenv bootargs` 会整体替换环境变量，覆盖 `root=`/`console=` 等默认参数。

**解决**：追加参数用 `setenv bootargs ${bootargs} <新增参数>` 引用已有值。

### AVB 使能时修改不生效

**原因**：修改启动分区内容与 AVB 校验冲突。

**解决**：AVB 使能时不能使用 config.txt，先关闭 AVB。

## 相关文档

- [config.txt 使用指南](./01_usage.md)
- [常用配置项参考](./03_common_options.md)
- [启动相关配置](./04_boot_options.md)
