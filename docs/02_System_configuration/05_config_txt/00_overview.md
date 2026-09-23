---
title: "config.txt 配置指南"
sidebar_position: 0
description: "RDK config.txt 启动配置总览：文件格式、常用配置项、修改方法与典型示例"
---

# config.txt 配置指南

config.txt 是 RDK 的启动配置文件，由 U-Boot 在启动阶段自动读取，用于配置内核启动参数（`bootargs`/`loglevel`）、动态修改 DTS 节点、应用 DTB Overlay 等，无需重新编译固件即可调整系统行为。本文面向使用 RDK 板卡的开发者，汇总 config.txt 的位置、格式、常用配置项、修改方法与典型示例；深度定制（新增配置项）见 [config.txt 解析开发指南](./01_parser_dev.md)。

## 配置文件

- **默认路径**：`/boot/config.txt`，位于 boot 分区；出厂镜像中默认为空文件，配置项需按需添加。
- **格式**：每行一条 `<key>=<value>`，第一个 `=` 之后的全部内容均为该 key 的值；以 `#` 开头的行为注释。
- **限制**：单行不超过 1024 字符；配置不会被保存为 U-Boot 默认配置，每次启动由 U-Boot 重新读取。

:::warning 注意事项

- **优先级**：U-Boot 内手动 `setenv` 的配置优先级高于配置文件。完整优先级：`setenv > config.txt > saveenv`。
- **AVB 冲突**：修改启动分区内容与 AVB（Android Verified Boot）校验冲突，AVB 使能时不能使用 config.txt（AVB 默认不使能）。

:::

## 修改方法

boot 分区已通过 `/dev/block/platform/by-name/boot_cur` 挂载到 `/boot`（见 `/etc/fstab`），通常无需手动挂载：

```bash
mount /boot              # 若未挂载，先挂载
vi /boot/config.txt      # 编辑配置
reboot                   # 重启生效
```

## 常用配置项

| 分类 | 配置项 | 说明 | 示例 |
| --- | --- | --- | --- |
| 内核启动参数 | `bootargs` | 追加内核 cmdline 参数（追加到默认 cmdline 末尾，不覆盖默认参数） | `bootargs=isolcpus=1-2` |
| 内核启动参数 | `loglevel` | 内核启动打印等级（0-8） | `loglevel=8` |
| DTS 节点控制 | `fdt-enable` | 使能 DTS 节点（分号分隔多节点） | `fdt-enable=/soc/uart@394C0000;` |
| DTS 节点控制 | `fdt-disable` | 失能 DTS 节点 | `fdt-disable=/soc/i2c@3932000;` |
| DTS 属性修改 | `fdt-setprop` | 设置节点属性（`/节点路径 属性名 值`，分号分隔多条） | `fdt-setprop=/soc/uart@394C0000 status "okay"` |
| DTS 属性修改 | `fdt-remove` | 删除节点或属性（`节点路径` 或 `节点路径 属性名`，分号分隔） | `fdt-remove=/soc/i2c@3932000;` |
| DTB Overlay | `dtbo_file_path` | 应用 DTB Overlay 文件（相对 boot 分区，分号分隔多个） | `dtbo_file_path=/spi0_cs1_dev.dtbo` |
| DTB Overlay | `dtbo_dev_part` | Overlay 文件所在分区（`<设备号>:<16 进制分区号>`） | `dtbo_dev_part=0:0x10` |

> 表中 DTS 节点地址为 S100 示例（如 `uart@394C0000`），S600 的节点地址不同（如 `uart@3484A000`），以板端 `/proc/device-tree/soc/` 下实际节点名为准。

## 典型配置示例

### 配置内核 bootargs

```text
# CPU 隔离：将 CPU 1-2 隔离给实时任务
bootargs=isolcpus=1-2
```

### 修改内核启动打印等级

```text
# 内核打印等级（0-8）
loglevel=8
```

### 使能或失能 DTS 节点

```text
# 使能 UART 节点
fdt-enable=/soc/uart@394C0000;

# 失能 I2C 节点
fdt-disable=/soc/i2c@3932000;
```

:::info 提示

- 配置行末尾的分号不可省略。
- DTS 节点全路径可在板端获取，写入配置时需补行首 `/`：

```bash
realpath --relative-to=/proc/device-tree/ /proc/device-tree/soc/uart@394C0000
# 输出 soc/uart@394C0000，写入配置时写为 /soc/uart@394C0000
```

:::

### 应用 DTB Overlay

DTB Overlay 文件可在不修改当前 dts 的情况下，对当前 dtb 进行增/改（不支持删减）。

DTB Overlay 源文件（`.dtso`）示例，在 `spi0` 下新增一个从设备节点：

```dts
/*
 * Sample dtb overlay source file
 * spi0_cs1_dev.dtso
 */
/dts-v1/;
/plugin/;

&spi0 {
	slave@1 {
		compatible = "sample-compatible-str";
		spi-max-frequency = <32000000>;
		reg = <1>;
	};
};
```

> 需按从设备实际情况修改 `compatible`（从设备实际驱动的 compatible 字段）和 `spi-max-frequency`（从设备支持的最高速度）。

编译并放入 boot 分区（Host 端或板端均可）：

```bash
# 安装编译器（若未安装）
sudo apt install device-tree-compiler -y

# 编译 .dtso 为 .dtbo
dtc -I dts -O dtb -o ~/rdk_dtbo/spi0_cs1_dev.dtbo ~/rdk_dtbo/spi0_cs1_dev.dtso

# 复制到 boot 分区
sudo cp ~/rdk_dtbo/spi0_cs1_dev.dtbo /boot
```

> 编译过程中的 `Warning` 级别打印一般可忽略。

在 config.txt 中引用（相对 boot 分区路径）：

```text
dtbo_file_path=/spi0_cs1_dev.dtbo
```

重启后，设备树 `spi@39800000` 路径下生成新的从设备节点即生效：

```bash
ls /proc/device-tree/soc/spi@39800000/slave@1/
# 输出：compatible  name  reg  spi-max-frequency
```

#### 自定义 Overlay 所在分区（dtbo_dev_part）

`dtbo_dev_part` 用于指定 Overlay 文件所在分区，格式为 `<设备号>:<16 进制分区号>`。RDK S100 默认设备号为 `0`，分区号通过 `/dev/block/platform/by-name/` 获取。以 `userdata` 分区为例：

```text
dtbo_dev_part=0:0x10
```

获取分区号：

```bash
ls -l /dev/block/platform/by-name/userdata
# 输出：.../userdata -> /dev/mmcblk0p16，即分区号为 0x10
```

## 自定义配置文件位置

默认读取 `/boot/config.txt`；如需自定义配置文件名、分区或介质，可在 U-Boot 命令行设置环境变量（每个变量均可单独使用）：

| 环境变量 | 作用 | 示例 |
| --- | --- | --- |
| `boot_config_f` | 改变配置文件名 | `setenv boot_config_f test.txt` |
| `boot_config_dev_part` | 改变配置文件分区（`<设备号>:<16 进制分区号>`） | `setenv boot_config_dev_part 0:0xd` |
| `boot_config_intf` | 改变配置文件存储介质 | `setenv boot_config_intf scsi` |

设置后执行 `saveenv` 保存，下次启动生效。

## 验证

- `bootargs`/`loglevel`：重启后 `cat /proc/cmdline` 确认追加的内核参数已生效。
- `fdt-enable`/`fdt-disable`：重启后 `ls /proc/device-tree/soc/` 确认目标节点出现或消失。
- DTB Overlay：重启后 `ls /proc/device-tree/soc/spi@39800000/slave@1/` 能看到 `compatible`、`reg` 等属性即生效。

## 常见问题

### 配置修改后未生效

**原因**：U-Boot 内 `setenv` 手动配置的优先级高于配置文件，配置文件被覆盖。

**解决**：检查 U-Boot 是否用 `setenv` 覆盖了同名变量；优先级为 `setenv > config.txt > saveenv`。

### 追加 bootargs 后丢失默认 cmdline

**原因**：在 U-Boot 用 `setenv bootargs` 会整体替换环境变量，覆盖 `root=`、`console=` 等默认参数。

**解决**：config.txt 的 `bootargs=` 会追加到默认 cmdline 末尾；U-Boot 内追加用 `setenv bootargs ${bootargs} <新增参数>`。

### S100 示例在 S600 上找不到节点

**原因**：示例 DTS 节点地址为 S100，S600 的节点地址不同。

**解决**：以板端 `/proc/device-tree/soc/` 下实际节点名为准。

### 使能 AVB 后配置失效

**原因**：修改启动分区内容与 AVB 校验冲突，AVB 使能时 config.txt 不可用。

**解决**：AVB 默认不使能；如已使能需先关闭 AVB，或改用其它配置入口。

## 相关文档

- [config.txt 解析开发指南](./01_parser_dev.md)
- [srpi-config](../04_srpi_config/01_overview.md)
