---
sidebar_position: 7
title: "hb_switch_ion.sh"
description: "RDK 命令 hb_switch_ion.sh 用法"
---

# hb_switch_ion.sh

**hb_switch_ion.sh 命令** 用于修改板端 ION 预留内存区域的大小，通过改写设备树（DTB）中 `ion_reserved`、`ion_carveout`、`ion_cma`（S600 另有 `ion_uncache`）的预留范围实现。运行大模型或多路编解码出现 ION 内存不足时，可用它调整分配。

## 语法说明

```bash
sudo hb_switch_ion.sh <bpu_first | cpu_first | balanced | default>
```

## 选项说明

脚本会自动识别板卡型号并按 boardid 选择对应的 DTB，无需手动指定内存大小。

- `bpu_first`：BPU/算法优先。为算法、多媒体预留更多 ION 内存，适合运行大模型或多路编解码的场景。
- `cpu_first`：CPU 优先。为 CPU 与系统预留更多内存，ION 内存分配较小，适合以 CPU 计算为主的场景。
- `balanced`：均衡分配。在 CPU 与算法之间平衡内存分配。
- `default`：恢复默认。从首次执行时自动备份的 `.bak` 文件还原原始 DTB。

## 常用命令

### 切换到 BPU 优先

```bash
sudo hb_switch_ion.sh bpu_first
```

关键输出如下（具体 reg 值因板卡型号而异）：

```text
[INFO] Backup created:/boot/hobot/rdk-s600-mcb-v1p0.dtb.bak
[INFO] ion_reserved reg = <...>
[INFO] ion_carveout reg = <...>
[INFO] ion_cma reg = <...>
[INFO] ion_uncache reg = <...>
[INFO] Update /boot/hobot/rdk-s600-mcb-v1p0.dtb for bpu_first Done!
[INFO] The change will take effect AFTER reboot!
```

看到 `Done!` 与 `AFTER reboot!` 即修改成功，重启后生效。

### 恢复默认分配

```bash
sudo hb_switch_ion.sh default
```

## 注意事项

- 命令修改 `/boot/hobot/` 下的 DTB 文件，需以 `sudo`（root 权限）执行。
- 首次执行会自动备份原始 DTB 为 `.bak` 文件，`default` 时从该备份还原；备份已存在则跳过备份。
- 依赖 `fdtput`（`device-tree-compiler` 包），缺失时脚本会自动执行 `apt install` 安装。
- 修改重启后生效。
- `/boot` 分区使用率 ≥95% 时会拒绝执行，需先执行 `sudo resize2fs /dev/block/platform/by-name/boot_cur` 扩容。
- RDK S100 设置 `bpu_first` 时，脚本会提示内存受限，可能引入随机性能问题。

## 相关文档

- [srpi-config 工具配置](../../02_System_configuration/04_srpi_config/01_overview.md)
- [如何查看当前 ION 内存分配情况](../../07_Advanced_development/04_driver_development/15_driver_hbmem/04_s100_hbmem_debug.md)
