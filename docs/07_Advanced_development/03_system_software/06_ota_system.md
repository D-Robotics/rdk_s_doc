---
sidebar_position: 6
title: "系统 OTA 升级"
description: "系统 OTA 升级"
---

# 系统 OTA 升级

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

## 概述

**OTA** ：（ Over-the-Air Technology，空中下载技术）是指通过无线网络实现远程软件升级的技术。最早由 Android 系统引入到手机设备中， OTA 技术大幅简化了传统软件升级过程，无需通过计算机连接设备，用户可直接在设备上下载并安装更新。这一技术极大地方便了用户，提高了设备维护的效率。

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/image/ota/ota_intro.png" alt="概述示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

- 在 OTA 的广义应用中，可以划分为云端和设备端两个主要组成部分。云端部分负责处理设备的升级请求，包括执行升级校验、下发升级包以及收集升级结果等任务。而设备端则主要依赖云端下发的升级包，完成系统软件（ FOTA， Firmware Over-the-Air）或应用程序（ SOTA， Software Over-the-Air）的更新与升级。
- 本文旨在提供底层设备端 OTA 的用户手册，详细阐述 OTA 在底层系统软件和应用程序升级中的机制及其实现方法，同时提供相关的开发指导。需要特别指出的是，通过 OTA 升级的系统软件与应用程序，主要是指更新存储在外部存储器（如 eMMC ）中的数据。
- OTA 的对外交付物主要为一套 API 及其相应的实现库（如 `libupdate.so`），该库实现了底层烧写校验等关键功能。上层的 OTA 服务架构则由客户方实现，用以对接客户的云端服务。在成功从云端下载升级包后， OTA 服务会通过调用 `libupdate.so` 中的接口，实现版本的升级和校验等操作，从而确保设备能够顺利、安全地完成软件更新。

**缩略语**

| 缩略语   | 英文全称                         | 中文解释                  |
|----------|---------------------------------|--------------------------|
| SoC      | System on Chip                  | 片上系统                  |
| BL[x]    | Boot Loader Stage [x]           | 启动的阶段 x              |
| SPL      | Secondary Program Loader        | 二级程序加载器            |
| GPT      | GUID Partition Table            | GUID 磁盘分区表           |
| FPT      | Flash Partition Table           | 闪存分区表                |
| GUID     | Globally Unique IDentifier      | 全局唯一标识符            |
| RSA      | RSA Algorithm                   | RSA 公开密钥密码体制      |
| eMMC     | embedded MultiMedia Card        | 嵌入式非易失性存储器       |

## 系统分区表

OTA 时，将以分区为单位对目标分区进行更新，这些分区按照不同的类型做如下区分：

| 分区类型   | 属性 | 升级方式 | 举例 |
|-----------|------|---------|------|
| 持久化分区 | 参数分区：一般存储系统运行时需要加载的一些配置文件和参数等数据。如分区表中的 ubootenv 等 <br /><br /> 用户分区：指与系统启动无关的分区。一般在系统启动后才会被挂载，如 userdata 分区 | 单分区一般没有镜像， 分区数据需要长期保存， 不支持 OTA 升级。| ubootenv, veeprom, userdata |
| AB 分区 | 前缀同名且尾缀带 _a 和 _b 的分区称做 AB 分区。 | AB 分区交替升级。 | boot_a, boot_b |
| BAK 分区 | 前缀同名且尾缀带 `bak` 的分区称作 BAK 分区，主要构成为 1 个主分区和若干个备份分区。 | BAK 分区只升级主分区，主分区升级并验证成功后，将主分区内容同步到备份分区。 |SBL, SBL_bak|

## 开启 OTA

RDK 默认不开启 OTA 功能，如需开启请按如下流程操作：

:::warning
开启 OTA 会同时更换分区表（新增 `vbmeta` 分区，`system` 由单分区变为 A/B 双分区）与 U-Boot 配置。改完配置重新编译后，**必须对设备整机重新烧录一次**，否则设备上的分区表与升级包不一致，OTA 会在分区校验阶段被直接中止。

在线 miniboot 升级（`rdk-miniboot-update`）只适用于非 OTA 镜像，不会写入 `vbmeta`、也不会调整 GPT，无法替代整机烧录。
:::

1. 开启 OTA 前，若未编译过工程、没有生成 `out` 目录，需先编译工程或建立编译环境：
        ```bash
        # 编译工程，生成镜像
        sudo ./pack_image.sh

        # 仅建立编译环境
        sudo ./pack_image.sh -p
        ```

    注意：`-p` 只搭建 deb 编译环境、不生成镜像，但它同样会清空已有的 `out/product/img_packages` 目录，请提前备份。
2. 配置 build_params 中对应平台的 conf 文件：

    <DocScope products="RDK S100">
    将 `build_params` 目录下的 `ubuntu-22.04_desktop_rdk-s100_beta.conf` 和 `ubuntu-22.04_desktop_rdk-s100_release.conf` 中的 `PARTITION_FILE` 配置为 OTA 版本：`export PARTITION_FILE="s100-ota-gpt.json"`，`RDK_DM_VERIFY_ENABLE` 配置为开启：`export RDK_DM_VERIFY_ENABLE="yes"`；
    </DocScope>
    <DocScope products="RDK S600">
    将 `build_params` 目录下的 `ubuntu-24.04_desktop_rdk-s600_beta.conf`、`ubuntu-24.04_server_rdk-s600_beta.conf`、`ubuntu-24.04_desktop_rdk-s600_release.conf` 和 `ubuntu-24.04_server_rdk-s600_release.conf`（可根据情况只修改用到的 conf）中的 `PARTITION_FILE` 配置为 OTA 版本：`export PARTITION_FILE="s600-ota-gpt.json"`，`RDK_DM_VERIFY_ENABLE` 配置为开启：`export RDK_DM_VERIFY_ENABLE="yes"`；
    </DocScope>

    注意：`pack_image.sh` 不带 `-c` 时默认读取 desktop beta 的 conf，而 `mk_debs.sh` 打包使用的是 desktop release 的 conf。若只修改了 release/server 的 conf，编译时必须显式用 `-c` 指定该 conf，否则修改不会生效。

3. 配置对应平台 board mk 文件中的 `RDK_OTA` 变量：

    <DocScope products="RDK S100">
    将 `source/bootloader/device/rdk/s100` 目录下的 `board_s100_debug.mk` 和 `board_s100_release.mk` 文件中的 `RDK_OTA` 变量配置为开启 `export RDK_OTA="yes"`；
    </DocScope>
    <DocScope products="RDK S600">
    将 `source/bootloader/device/rdk/s600` 目录下的 `board_s600_debug.mk` 和 `board_s600_release.mk` 文件中的 `RDK_OTA` 变量配置为开启 `export RDK_OTA="yes"`；
    </DocScope>

4. 编译
   - 制作新的 miniboot 的 deb 包
        ```bash
        ./mk_debs.sh hobot-miniboot
        ```

     该命令会重新编译 miniboot 与 U-Boot（而不是只重新打包 deb），并按 OTA 配置生成新的分区表。
   - 重新编译本地镜像，用 `-c` 指定第 2 步修改过的 conf
        ```bash
        # 以 desktop release 为例
        sudo ./pack_image.sh -l -c build_params/ubuntu-24.04_desktop_rdk-s600_release.conf
        ```

5. 整机重新烧录

   将新生成的 `out/product/img_packages/`（如 `ufs_disk.img`、miniboot 相关镜像）整机烧录到设备。只有完成这一步，设备上的 GPT 与 U-Boot 才与 OTA 镜像匹配，后续才能通过 OTA 升级。

## 根文件系统说明（OTA 模式）

### 概述

开启 OTA 后，系统采用 system + overlayfs 的根文件系统结构。
该方案通过将系统只读部分与用户可写部分分离，使用户既可以在根文件系统中进行写操作，又能保证 system 分区 以只读方式挂载，从而在保证系统稳定与安全的同时，支持 system 分区 在 OTA 升级时进行差分更新。

### OverlayFS 简要说明

OverlayFS 是一种联合文件系统（UnionFS），可将多个目录合并为一个统一的视图。
在 overlayfs 中：

- Lowerdir（下层）：只读层，提供系统的基础文件内容；

- Upperdir（上层）：可写层，保存用户的修改、增删文件；

- Merged（合并层）：提供给用户统一访问的挂载点视图。

当文件被修改或删除时，操作仅在 Upperdir 中生效，而 Lowerdir 保持不变。系统在访问时会优先读取 Upperdir 的文件，从而实现增量覆盖与只读保护的效果。

### 根文件系统结构方案

本系统采用以下分区结构实现 overlayfs：

| 分区类型             | 挂载角色 | 权限   | 说明                                               |
| ------------------- | -------- | ----- | -------------------------------------------------- |
| `system_A` / `system_B` | Lowerdir | 只读   | 系统基础文件所在分区，AB 双分区结构以支持无缝 OTA 升级 |
| overlay             | Upperdir | 读写   | 用户数据及修改保存区，不参与 OTA 升级                 |
| root (`/`)          | Merged   | 合并视图 | 提供统一的根目录访问视图                           |

根文件系统的挂载逻辑如下：

- `system_A` / `system_B`：通过 OTA 升级实现系统内容的更新；

- overlay 分区：作为 overlayfs 的上层目录，保存运行时和用户的修改；

- 根目录 /：用户看到的文件系统合并视图。

### overlay 的启用方式

overlayfs 并非由用户态手工挂载，而是由 U-Boot 与 initramfs 协作完成：

1. U-Boot 启动时按分区布局决定根设备：

   - 若存在单分区 `system`（非 OTA 布局），按 `root=<system> rw rootfstype=ext4 rootwait` 正常读写启动；
   - 若存在 `system_a` / `system_b`（OTA 布局），则设置 `root=<当前 slot 的 system 分区> ro rootfstype=ext4 rootflags=noload rootwait overlayroot=<overlay 分区>`。

2. initramfs 的 `10-prepare-overlay` 脚本读取 cmdline 中的 `overlayroot=`；当 overlay 分区还不是 ext4 时，自动执行 `mkfs.ext4` 格式化。

3. 随后由 `overlayroot` 脚本把 `system_<slot>` 作为 lowerdir、`overlay` 分区作为 upperdir 联合挂载为 `/`。

因此，只有使用 OTA 分区表（含 `overlay` 分区）的镜像才会以 `system + overlayfs` 方式启动；普通镜像仍然是单 `system` 分区读写挂载。

### 注意事项

1. 初次烧录行为

    整机烧录时，overlay 分区会被格式化，`system_A` / `system_B` 分区写入只读系统镜像，此后系统启动时会自动建立 overlayfs 合并层。

2. OTA 升级行为

    OTA 升级时仅更新 system 分区内容，不改动 overlay 分区。用户的配置、应用安装或修改文件将被保留。

3. 文件覆盖优先级

    若用户手动修改了 /etc/xxx 等文件，该修改将被写入 overlay 分区。即使 OTA 升级更新了 system 分区中的同名文件，升级后系统仍优先显示用户修改版本（overlay 优先级更高）。

## OTA 打包工具

**本文档以 ZIP 格式 的 OTA 包为示例进行说明。除非特别说明，TAR（img 经 Zstandard 压缩）格式 的使用方法与 ZIP 格式完全一致，仅需将文档中的 .zip 后缀替换为 .zst.tar 即可。**

当前 OTA 包支持 zip 格式和 img 经 zstd 压缩后的 tar 格式，后缀分别为.zip 和.zst.tar。.zst.tar 将 img 压缩成 img.zst，更高压缩比，更快的解压速度，同时利用 tar 格式支持索引。

### ota_tools 目录介绍

OTA 打包工具位于 ota_tools/ 路径下。该目录包含 OTA 包构建所需的核心工具和脚本，该文件夹包含的内容如下：
```bash
tree
.
├── hdiffz                 # 用于生成 OTA 差分镜像的二进制差分工具
├── hooks                  # OTA 分区升级前/后的 Hook 脚本目录
│   ├── README.md          # Hook 脚本使用说明及命名规范
│   ├── postinst_MCU.sh    # MCU 分区升级完成后的后处理脚本
│   └── preinst_MCU.sh     # MCU 分区升级前的前处理脚本
├── hpatchz                # 用于应用 OTA 差分镜像的二进制补丁工具
├── mk_otapackage.py       # OTA 升级包构建主脚本
├── ota_pack_tool.sh       # OTA 升级包构建流程的 Shell 封装脚本
├── ota_process            # OTA 升级核心处理逻辑目录
├── ota_sign.py            # OTA 升级包签名脚本
├── parse_env.py           # 构建环境与配置解析脚本
├── part_ota_cmd.json      # 分区 OTA 升级命令与配置描述文件
├── private_key.pem        # OTA 升级包签名使用的私钥（请妥善保管）
└── zstd.py                # Zstandard 压缩/解压辅助模块
```
其中 hooks 目录用于提供分区烧写前和烧写后的自动执行脚本，可用于在升级过程中插入自定义处理逻辑。在使用打包工具前，建议先了解 hooks 目录的作用和使用方式。

#### OTA 升级 Hook 机制

- Hook 脚本放置位置

    hooks 目录用于存放 OTA 分区升级过程中的前置 / 后置处理脚本，用于在分区烧写前或烧写后执行一些自定义逻辑，包括但不限于：

    - 升级前的环境检查

    - 数据备份与迁移

    **如果某个分区不需要任何前后处理逻辑，对应的脚本文件可以省略。**

- 脚本命名规则（必须遵守）

    为确保脚本能够被正确打包并在 OTA 升级过程中执行，脚本文件名必须严格遵循以下命名规则，否则将无法被识别和加入升级包。

    - 分区烧写前脚本（Pre-install Hook）

        ```text
        preinst_<分区名>.sh
        ```

    - 分区烧写后脚本（Post-install Hook）

        ```bash
        postinst_<分区名>.sh
        ```

    不符合上述命名规则的脚本文件将不会被加入 OTA 升级包，也不会在升级过程中被执行。

    脚本文件名中的 `<分区名>` 必须 与 OTA 系统中使用的分区名称完全一致，如果不确定分区名称，可通过 `out/product/img_packages/ota_tools/ota_info.json` 文件中的 `base_name` 字段进行确认。

- 使用示例

    以 MCU 分区为例

    - 打开 `out/product/img_packages/ota_tools/ota_info.json` 文件，查看 `MCU` 部分的 `base_name` 字段，确认分区名称。

        **以下仅为示例，不与实际代码挂钩，实际分区表请参考源码**
        ```json

            "MCU_a_S600_V1.0": {
                "base_name": "MCU",
                "out": "/home/zxs/s600/source/bootloader/out/target/product/img_packages/MCU_S600_V1.0.img",
                "medium": "nor",
                "nose_support": null,
                "secure": true,
                "part_type": "AB",
                "multi_img": true,
                "life_img": false,
                "multi_key": false,
                "have_anti_ver": null,
                "size": 6291456,
                "ota_update_mode": "image"
            }

        ```

    - 在 hooks 目录下创建以下脚本：

        ```text
        hooks/
        ├── preinst_MCU.sh     # 分区烧写前执行
        ├── postinst_MCU.sh    # 分区烧写后执行
        ```

    如果该分区不需要任何前置或后置处理逻辑，则无需创建任何脚本文件。

- 注意事项

    - Hook 脚本为 可选项，不存在时会自动跳过执行。

    - 仅会识别并处理位于 hooks 目录下、且命名规范正确的脚本文件。

    - 请确保脚本内容具备正确的执行逻辑和必要的错误处理。

    - 根据系统配置，脚本执行失败可能会导致 OTA 升级流程中断，请谨慎编写脚本逻辑。

#### OTA 打包工具使用方法

一般使用位于 `ota_tools/` 路径下的 `ota_pack_tool.sh` 制作所需的 OTA 升级包，支持 OTA 升级包解包，解包后重打包，制作升级包以及制作差分包等。

使用方法如下：
```bash
Usage: ./ota_pack_tool.sh [OPTIONS]...
Options:
  -x, -unpack <ota_package>        Unpack the given OTA package file. (compress inferred from suffix)
  -r, -repack [-t <tar|zip>]       Repack the files into a new OTA package. (default: tar)
  -c, -create <pack_type> -d <source_dir> [-t <tar|zip>]
       Generate OTA package by source dir or img_packages. (default: tar)
       <pack_type>: sys, sys_signed, miniboot_signed ... etc.
       <source_dir>: sys or sys_signed require img dir.
       (e.g.)run "./ota_pack_tool.sh -c sys -d ../out/product/img_packages/ -t tar"
  -i, -inc <pack_type> -old <old_pkg> -new <new_pkg>
       Create an incremental OTA package. (compress inferred from suffix of -old)
       <pack_type>: sys, sys_signed.
       <old_pkg>, <new_pkg>: ota pack, xxx.zip or xxx.zst.tar.
       (e.g.)run "./ota_pack_tool.sh -i sys -old all_in_one_old.zip -new all_in_one_new.zip".
  -h, -help                                 Display this help message.
```

#### OTA 制作普通升级包

通过如下命令可以制作系统升级包:

```bash
# tar格式升级包(-t参数省略)，sys_signed代表打包secure版本升级包
 ./ota_pack_tool.sh -c sys_signed -d ~/s600/out/product/img_packages/

# zip格式升级包
./ota_pack_tool.sh -c sys_signed -d ~/s600/out/product/img_packages -t zip
```
生成的 OTA 升级包将输出到 `out/product/ota_packages` 目录，在该目录下，您将看到 `zip` 或 `.zst.tar` 结尾的升级包和 `signature` 结尾的升级包的签名文件：
```bash
all_in_one_signed.signature     #secure 升级包签名文件
all_in_one_signed.zst.tar       #secure 升级包文件
```

#### OTA 制作差分升级包

:::warning
差分升级依赖已经烧录到设备上的旧镜像包。计划使用差分升级时，**请务必长期保存对应的旧镜像包**，避免丢失或损坏。
:::

可以通过 ota_pack_tool 制作 all_in_one_signed_inc.zip 系统差分包，制作时使用的 OTA 配置文件与 `ota_process` 均为 new 包解压所得。

1. 差分升级作用

    节省流量，并不节省升级时间。

2. 差分升级原理

    利用差分算法，得出新老镜像差分镜像，升级时差分还原到对向分区。（flash 介质的镜像不差分，其体积仅数 M，且 flash 读取慢）。差分库：`hpatchz`。支持的镜像：OTA 镜像包中的所有非 flash 介质的镜像。

3. 差分升级的限制
   - flash 上的分区不支持差分升级；
   - boot 分区有写入行为，不支持差分升级；
   - 只有镜像包的大小大于 10M 时才支持差分升级；
   - 需要差分升级的分区如需挂载时，必须以只读方式挂载，且挂载时应添加 noload 选项，否则会出现 md5 校验失败的问题；
4. 制作差分升级包

    - 差分镜像升级时需要依赖已经烧录的旧镜像包，因此，在计划使用差分升级时，**请务必妥善保存旧镜像包避免丢失或损坏**。
   ```bash
    # 基于all_in_one_signed_old.zip制作all_in_one_signed_new.zip的差分包all_in_one_signed_inc.zip
    ./ota_pack_tool.sh -i sys_signed -old all_in_one_signed_old.zip -new all_in_one_signed_new.zip
   ```

#### OTA 升级包解包与重打包

升级包解包指令为：
```bash
./ota_pack_tool.sh -x all_in_one_signed.zip
```
- 升级包解包后，可以更新 `out/deploy/ota_deploy/unpack` 下的镜像，重新制作 OTA 包，使用的 OTA 配置文件与 `ota_process` 均位于 `out/deploy/ota_deploy/unpack` 目录，该方法无法修改 OTA 配置文件 `gpt.conf`。

升级包重打包指令为：
```bash
./ota_pack_tool.sh -r -t zip
```
- 打包的源文件夹路径为：out/deploy/ota_deploy/unpack
- 打包后的目标文件路径为：out/product/ota_packages

### 签名密钥

签名所用的私钥 `private_key.pem` 放置在工程的：`ota_tools` 目录。签名所用的公钥 `public_key.pem` 放置在工程的：`source/bootloader/miniboot/ota_flash_tools/` 目录，在设备端该公钥的路径为 /usr/hobot/share/ota/public_key.pem。

如果需要替换为自己的密钥，步骤如下：

- 私钥生成：

  ```bash
  openssl genrsa -out private_key.pem 4096
  ```

- 公钥生成：

  ```bash
  openssl rsa -RSAPublicKey_out -in private_key.pem  -out public_key.pem
  ```

- 替换路径 `source/bootloader/miniboot/ota_flash_tools/` 下的 `public_key.pem` 以及替换路径 `ota_tools/` 下的 `private_key.pem`.
- 执行下列命令重新编译

    ```bash
    #回到项目的顶层目录，制作miniboot的deb包
    ./mk_debs.sh hobot-miniboot

    #编译本地项目
    sudo ./pack_image.sh -l
    ```

**注意**：
- 打包生成的 OTA 包默认命名为 all_in_one_xxx。升级程序会对包名进行校验，包名中必须包含 "all_in_one" 关键字。此外，包名中不得包含以下关键字："app"、"APP"、"middleware"、"param"。

### OTA 升级包介绍

#### 升级包结构

<DocScope products="RDK S100">
```bash
Archive:  all_in_one_signed.zip
  Length      Date    Time    Name
---------  ---------- -----   ----
     1047  2025-05-14 12:11   gpt.conf
     5326  2025-05-14 12:11   data.json
   526336  2025-05-13 20:37   HSM_FW_signed.img
   264192  2025-05-13 20:37   HSM_RCA_signed.img
   264192  2025-05-13 20:37   keyimage_signed.img
   264192  2025-05-13 20:37   keyimage_ohp_signed.img
   526336  2025-05-13 20:37   scp_signed.img
   526336  2025-05-13 20:37   spl_signed.img
  1312768  2025-05-13 20:37   MCU_S100_V1.0_signed.img
   256288  2025-05-13 20:37   acore_cfg.img
   348928  2025-05-13 20:37   bl31.img
   986080  2025-05-13 20:37   optee.img
  1076928  2025-05-13 20:37   uboot.img
 36388864  2025-05-13 20:37   boot.img
8589934592  2025-05-13 20:37   system.img
   310144  2025-05-13 19:47   ota_process
---------                     -------
8632992549                     16 files
```

</DocScope>
<DocScope products="RDK S600">
```bash
Archive:  all_in_one_signed.zip
  Length      Date    Time    Name
---------  ---------- -----   ----
     1069  2025-12-01 18:15   gpt.conf
     5619  2025-12-01 18:15   data.json
   526336  2025-12-01 18:03   HSM_FW_L0_signed.img
   264192  2025-12-01 18:03   HSM_RCA_L0_signed.img
   264192  2025-12-01 18:03   keyimage_signed.img
   264192  2025-12-01 18:03   SBL_signed.img
   788480  2025-12-01 18:03   spl_signed.img
  1312768  2025-12-01 18:03   MCU_S600_V1.0_signed.img
   342592  2025-12-01 18:03   acore_cfg.img
   601088  2025-12-01 18:03   bl31.img
   891840  2025-12-01 18:03   optee.img
  1080064  2025-12-01 18:03   uboot.img
     2752  2025-12-01 18:06   vbmeta.img
125829120  2025-12-01 18:05   boot.img
9828880384  2025-12-01 18:05   system.img
   337560  2025-11-27 20:23   ota_process
---------                     -------
9961392248                     16 files
```

</DocScope>

上述内容展示了当前 OTA 升级包中的文件结构，主要包括以下四类文件。镜像文件的数量会根据实际配置有所增减。

|    文件      |    描述      |
|--------------|-------------|
|   `gpt.conf`   | 分区表文件   |
|  `data.json`   | OTA 配置文件 |
|    *.img     | 各分区镜像   |
| `ota_process`  | OTA 烧写程序 |

#### OTA 配置文件

OTA 升级包中包含一个名为 `data.json` 的配置文件。该文件在编译时生成，其中包含了升级包的分区信息和镜像信息。

通用配置

| 配置                    | 类型      | 功能                     |
|-------------------------|----------|--------------------------|
| backup_dir              | arr[obj] | HSM 备份目录               |
| ab_sync                 | str      | reserved 字段,默认固定 false |
| nor_sign                | bool     | NOR Flash 镜像签名校验开关   |
| update_partition        | arr[str] | 升级分区                   |
| partition_info          | arr[str] | 各分区配置                 |

各分区配置（ partition_info）

| 配置           | 类型     | 功能                                              |
|----------------|----------|--------------------------------------------------|
| md5sum         | arr[obj] | 各镜像 MD5 值                                     |
| md5_scope      | arr[obj] | 各镜像 MD5 校验长度                                |
| medium         | str      | 所在外存介质 (NOR/eMMC/NAND)                       |
| part_type      | str      | 分区类型 (AB/BAK/GOLDEN)                          |
| upgrade_method | str      | 升级方式 (image)                                  |
| imgname        | str      | 镜像名，仅支持以 `.img/.bin/.ubifs` 为后缀的文件    |

以下是一个 `data.json` 文件的示例：

<DocScope products="RDK S100">

```json
{
    "antirollbackUpdate_host": false,
    "antirollbackUpdate_hsm": false,
    "backup_dir": "/tmp/ota/backup",
    "ab_sync": false,
    "update_partition": [
        "HSM_FW",
        "HSM_RCA",
        "keyimage",
        "scp",
        "spl",
        "MCU",
        "acore_cfg",
        "bl31",
        "optee",
        "uboot",
        "boot",
        "system"
    ],
    "nor_sign": true,
    "partition_info": {
        "HSM_FW": {
            "md5sum": {
                "HSM_FW_signed.img": "3e19e04f97e0cb4e37899958e3aec34f"
            },
            "md5_scope": {
                "HSM_FW_signed.img": 524288
            },
            "medium": "nor",
            "part_type": "BAK",
            "have_anti_ver": null,
            "upgrade_method": "image",
            "imgname": "HSM_FW_signed.img"
        },
        "HSM_RCA": {
            "md5sum": {
                "HSM_RCA_signed.img": "9b2f9cb4d00586dd49112f50fdb90952"
            },
            "md5_scope": {
                "HSM_RCA_signed.img": 262144
            },
            "medium": "nor",
            "part_type": "BAK",
            "have_anti_ver": null,
            "upgrade_method": "image",
            "imgname": "HSM_RCA_signed.img"
        },
        "keyimage": {
            "md5sum": {
                "keyimage_signed.img": "df28a9900fa504a90a4c85368cb7879d",
                "keyimage_ohp_signed.img": "af81665e36a9a274084e2dc02b7a3830"
            },
            "md5_scope": {
                "keyimage_signed.img": 262144,
                "keyimage_ohp_signed.img": 262144
            },
            "medium": "nor",
            "part_type": "BAK",
            "have_anti_ver": null,
            "upgrade_method": "image",
            "imgname": "keyimage%s_signed.img"
        },
        "scp": {
            "md5sum": {
                "scp_signed.img": "6ea63e573ae3bb50dc8cb0052c29fddb"
            },
            "md5_scope": {
                "scp_signed.img": 524288
            },
            "medium": "nor",
            "part_type": "AB",
            "have_anti_ver": null,
            "upgrade_method": "image",
            "imgname": "scp_signed.img"
        },
        "spl": {
            "md5sum": {
                "spl_signed.img": "ba48f24f989de1ddbc6eb3aedd139b4f"
            },
            "md5_scope": {
                "spl_signed.img": 524288
            },
            "medium": "nor",
            "part_type": "AB",
            "have_anti_ver": null,
            "upgrade_method": "image",
            "imgname": "spl_signed.img"
        },
        "MCU": {
            "md5sum": {
                "MCU_S100_V1.0_signed.img": "d44784323de5f5d57fa606ea178fd854"
            },
            "md5_scope": {
                "MCU_S100_V1.0_signed.img": 1310720
            },
            "medium": "nor",
            "part_type": "AB",
            "have_anti_ver": null,
            "upgrade_method": "image",
            "imgname": "MCU_S100_V1.0_signed.img"
        },
        "acore_cfg": {
            "md5sum": {
                "acore_cfg.img": "fe36a8ad522a2ca5ee811da8208828ef"
            },
            "md5_scope": {
                "acore_cfg.img": 256288
            },
            "medium": "emmc",
            "part_type": "AB",
            "have_anti_ver": null,
            "upgrade_method": "image",
            "imgname": "acore_cfg.img"
        },
        "bl31": {
            "md5sum": {
                "bl31.img": "5be617cd08128e89318f61964696509a"
            },
            "md5_scope": {
                "bl31.img": 348928
            },
            "medium": "emmc",
            "part_type": "AB",
            "have_anti_ver": null,
            "upgrade_method": "image",
            "imgname": "bl31.img"
        },
        "optee": {
            "md5sum": {
                "optee.img": "f0f663462f523f9e8722e0c26d29209e"
            },
            "md5_scope": {
                "optee.img": 986080
            },
            "medium": "emmc",
            "part_type": "AB",
            "have_anti_ver": null,
            "upgrade_method": "image",
            "imgname": "optee.img"
        },
        "uboot": {
            "md5sum": {
                "uboot.img": "78b07c6a4264bd757c4d992e2dc0ee0b"
            },
            "md5_scope": {
                "uboot.img": 1076928
            },
            "medium": "emmc",
            "part_type": "AB",
            "have_anti_ver": null,
            "upgrade_method": "image",
            "imgname": "uboot.img"
        },
        "boot": {
            "md5sum": {
                "boot.img": "aca98db8136ad4f1d55cd3e7bdb4c856"
            },
            "md5_scope": {
                "boot.img": 36388864
            },
            "medium": "emmc",
            "part_type": "AB",
            "have_anti_ver": null,
            "upgrade_method": "image",
            "imgname": "boot.img"
        },
        "system": {
            "md5sum": {
                "system.img": "a6f61c86ae0045ad3167b3daf7c33b3a"
            },
            "md5_scope": {
                "system.img": 8589934592
            },
            "medium": "emmc",
            "part_type": "AB",
            "have_anti_ver": null,
            "upgrade_method": "image",
            "imgname": "system.img"
        }
    }
}
```

</DocScope>
<DocScope products="RDK S600">
```json
{
    "antirollbackUpdate_host": true,
    "antirollbackUpdate_hsm": false,
    "backup_dir": "/tmp/ota/backup",
    "sys_version": "None",
    "ab_sync": false,
    "update_partition": [
        "HSM_FW",
        "HSM_RCA",
        "keyimage",
        "SBL",
        "spl",
        "MCU",
        "acore_cfg",
        "bl31",
        "optee",
        "uboot",
        "vbmeta",
        "boot",
        "system"
    ],
    "nor_sign": true,
    "partition_info": {
        "HSM_FW": {
            "md5sum": {
                "HSM_FW_L0_signed.img": "a3f9c37c0d7e52cb083952442bdf7d6a"
            },
            "md5_scope": {
                "HSM_FW_L0_signed.img": 524288
            },
            "medium": "nor",
            "part_type": "BAK",
            "have_anti_ver": null,
            "upgrade_method": "image",
            "imgname": "HSM_FW_L0_signed.img"
        },
        "HSM_RCA": {
            "md5sum": {
                "HSM_RCA_L0_signed.img": "1dd1d254fd5e0e20c2713fdcc843682a"
            },
            "md5_scope": {
                "HSM_RCA_L0_signed.img": 262144
            },
            "medium": "nor",
            "part_type": "BAK",
            "have_anti_ver": null,
            "upgrade_method": "image",
            "imgname": "HSM_RCA_L0_signed.img"
        },
        "keyimage": {
            "md5sum": {
                "keyimage_signed.img": "4e2c05cee532d05eb4c9cff0d142d0b2"
            },
            "md5_scope": {
                "keyimage_signed.img": 262144
            },
            "medium": "nor",
            "part_type": "BAK",
            "have_anti_ver": null,
            "upgrade_method": "image",
            "imgname": "keyimage_signed.img"
        },
        "SBL": {
            "md5sum": {
                "SBL_signed.img": "850841d2aa725381dc775c17e1deece5"
            },
            "md5_scope": {
                "SBL_signed.img": 262144
            },
            "medium": "nor",
            "part_type": "BAK",
            "have_anti_ver": null,
            "upgrade_method": "image",
            "imgname": "SBL_signed.img"
        },
        "spl": {
            "md5sum": {
                "spl_signed.img": "f53f121bb10c4e506ec8225728e26623"
            },
            "md5_scope": {
                "spl_signed.img": 786432
            },
            "medium": "nor",
            "part_type": "AB",
            "have_anti_ver": null,
            "upgrade_method": "image",
            "imgname": "spl_signed.img"
        },
        "MCU": {
            "md5sum": {
                "MCU_S600_V1.0_signed.img": "43543ddbda842e44684eb14134d29571"
            },
            "md5_scope": {
                "MCU_S600_V1.0_signed.img": 1310720
            },
            "medium": "nor",
            "part_type": "AB",
            "have_anti_ver": null,
            "upgrade_method": "image",
            "imgname": "MCU_S600_V1.0_signed.img"
        },
        "acore_cfg": {
            "md5sum": {
                "acore_cfg.img": "2eeecd965de917d734d4f947de5c4388"
            },
            "md5_scope": {
                "acore_cfg.img": 342592
            },
            "medium": "emmc",
            "part_type": "AB",
            "have_anti_ver": null,
            "upgrade_method": "image",
            "imgname": "acore_cfg.img"
        },
        "bl31": {
            "md5sum": {
                "bl31.img": "26f405587f38c0cf90c89f89f498079e"
            },
            "md5_scope": {
                "bl31.img": 601088
            },
            "medium": "emmc",
            "part_type": "AB",
            "have_anti_ver": null,
            "upgrade_method": "image",
            "imgname": "bl31.img"
        },
        "optee": {
            "md5sum": {
                "optee.img": "50a1d2c6bd4e90028a100094ff6151bd"
            },
            "md5_scope": {
                "optee.img": 891840
            },
            "medium": "emmc",
            "part_type": "AB",
            "have_anti_ver": null,
            "upgrade_method": "image",
            "imgname": "optee.img"
        },
        "uboot": {
            "md5sum": {
                "uboot.img": "11a04d4a5e7cbef696c5ed1f245232f7"
            },
            "md5_scope": {
                "uboot.img": 1080064
            },
            "medium": "emmc",
            "part_type": "AB",
            "have_anti_ver": null,
            "upgrade_method": "image",
            "imgname": "uboot.img"
        },
        "vbmeta": {
            "md5sum": {
                "vbmeta.img": "2651efe9e881f540b19957ad8fdb7413"
            },
            "md5_scope": {
                "vbmeta.img": 2752
            },
            "medium": "emmc",
            "part_type": "AB",
            "have_anti_ver": true,
            "upgrade_method": "image",
            "imgname": "vbmeta.img"
        },
        "boot": {
            "md5sum": {
                "boot.img": "b0f94362d2e0a29cd15b3d226395b27b"
            },
            "md5_scope": {
                "boot.img": 125829120
            },
            "medium": "emmc",
            "part_type": "AB",
            "have_anti_ver": null,
            "upgrade_method": "image",
            "imgname": "boot.img"
        },
        "system": {
            "md5sum": {
                "system.img": "bd4f5a4210d6ea641a00f9fa0abc69ac"
            },
            "md5_scope": {
                "system.img": 9828880384
            },
            "medium": "emmc",
            "part_type": "AB",
            "have_anti_ver": null,
            "upgrade_method": "image",
            "imgname": "system.img"
        }
    }
}
```

</DocScope>

通过以上配置， OTA 升级包能够确保每个分区的镜像在升级过程中被正确校验和更新。

## OTA 实现详解

### OTA 流程

以下流程以 `ota_tool` 中实现为例（开发者实现可参考此工具）。

- 准备阶段：

    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/image/ota/ota_tool_sequence_step1.png" alt="OTA 流程示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

- 升级阶段：

    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/image/ota/ota_tool_sequence_step2.png" alt="OTA 流程示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

- 验证阶段：

    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/image/ota/ota_tool_sequence_step3.png" alt="OTA 流程示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

### OTA 状态机

#### 升级包的状态

状态存储在 OTA 进程空间，以下是流程说明：
```c
/**
 * @enum otahl_update_result
 * @brief ota upgrade result
 * @NO{S21E03C02}
 */
typedef enum otahl_update_result {
    OTA_UPGRADE_NOT_START = 0, /**< OTA upgrade not start */
    OTA_UPGRADE_IN_PROGRESS, /**< OTA upgrading */
    OTA_UPGRADE_SUCCESS, /**< OTA upgrade success*/
    OTA_UPGRADE_FAILED, /**< OTA upgrade failed*/
} otahl_update_result_e;
```

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/image/ota/ota_package_state.png" alt="升级包的状态示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

#### OTA 升级流程的状态

状态存储在 veeprom，以下是流程说明：
```c
typedef enum ota_update_flag {
    OTA_FLAG_NORMAL = 0,     // normal 状态
    OTA_FLAG_BURN,           // 烧写状态
    OTA_FLAG_VERIFY,         // 待验证状态
    OTA_FLAG_VERIFIED,       // 已验证状态
} ota_update_flag_e;
```

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/image/ota/ota_upgrade_state.png" alt="OTA 升级流程的状态示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

#### misc （AB 状态机）

1. 区域分配

    本平台使用 Android AB 机制来应用 AB 系统，下面的信息都是对于该机制的部分原理介绍，详细原理请参考：https://source.android.google.cn/docs/core/ota?hl=zh-cn

    bootloader_message_ab 总共占 4K： 其中 AB 使用的 bootloader_control 位于 struct bootloader_message_ab->slot_suffix 处，占 32 个字节。
    ```c
    struct bootloader_message_ab {
        struct bootloader_message message;
        char              slot_suffix[32];
        char              update_channel[128];

        // Round up the entire struct to 4096-byte.
        char reserved[1888];
    };

    /**
    * Be cautious about the struct size change, in case we put anything post
    * bootloader_message_ab struct (b/29159185).
    */
    #if (__STDC_VERSION__ >= 201112L) || defined(__cplusplus)
    static_assert(sizeof(struct bootloader_message_ab) == 4096,
            "struct bootloader_message_ab size changes");
    #endif
    ```

2. AB 结构体数据
    ```c
    #define ARRAY_32    (32U)

    struct slot_metadata {
        // Slot priority with 15 meaning highest priority, 1 lowest
        // priority and 0 the slot is unbootable.
        uint8_t priority : 4;
        // Number of times left attempting to boot this slot.
        uint8_t tries_remaining : 3;
        // 1 if this slot has booted successfully, 0 otherwise.
        uint8_t successful_boot : 1;
        // 1 if this slot is corrupted from a dm-verity corruption, 0 otherwise.
        uint8_t verity_corrupted : 1;
        // Reserved for further use.
        uint8_t reserved : 7;
    } __attribute__((packed));

    struct bootloader_control {
        // NUL terminated active slot suffix.
        char slot_suffix[4];
        // Bootloader Control AB magic number (see BOOT_CTRL_MAGIC).
        uint32_t magic;
        // Version of struct being used (see BOOT_CTRL_VERSION).
        uint8_t version;
        // Number of slots being managed.
        uint8_t nb_slot : 3;
        // Number of times left attempting to boot recovery.
        uint8_t recovery_tries_remaining : 3;
        // Ensure 4-bytes alignment for slot_info field.
        uint8_t reserved0[2];
        // Per-slot information.  Up to 4 slots.
        struct slot_metadata slot_info[4];
        // Reserved for further use.
        uint8_t reserved1[8];
        // CRC32 of all 28 bytes preceding this field (little endian
        // format).
        uint32_t crc32_le;
    } __attribute__((packed));
    ```

3. 状态机说明

    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/image/ota/ab_state.png" alt="misc （AB 状态机）示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />
- 状态 1：默认状态，AB slot 都可以启动。b 的优先级高于 a，默认从 b 启动。

- 状态 2：升级状态（烧写状态），a slot 不可启动且 boot success 为 0。

- 状态 3：烧写成功，还未重启，这个时候将要升级的 slot 设置为 active 状态，将当前 slot 设置为非 active 状态（调整优先级）。

- 状态 4：重启验证成功，将 a 设置为 success boot 状态。

#### veeprom 区域

OTA 升级的状态机存储在此区域，以下是 OTA 中对此区域的应用：

```c
#define VEEPROM_OTA_STAT_OFFSET \
    (1024) /**< offset 0f OTA status in the veeprom partition */
#define VEEPROM_OTA_STAT_SIZE \
    (2048) /**< size of OTA status in the veeprom partition */

#define VEEPROM_RECOVERY_STAT_OFFSET \
    (VEEPROM_OTA_STAT_OFFSET +   \
     VEEPROM_OTA_STAT_SIZE) /**< offset 0f recovery information in the veeprom partition */
#define VEEPROM_RECOVERY_STAT_SIZE \
    (128) /**< size 0f recovery information in the veeprom partition */
```

1.  OTA 区域

    起始位置：1024

    大小：2048

    作用：OTA 状态存储

    存储数据如下：

    ```c
    /**
    * @ota_status_t
    * @brief ota status
    * @NO{S21E03C04U}
    */
    typedef struct ota_status_s {
        uint32_t           magic;               /**< magic number */
        ota_update_flag_e  up;
        ota_update_flag_e  up_system;           /**< system partition update flag */
        ota_update_flag_e  up_backup;           /**< backup partition update flag */
        ota_update_flag_e  up_app;              /**< app partition update flag */
        ota_update_flag_e  up_middleware;       /**< middleware partition update flag */
        ota_update_flag_e  up_param;            /**< param partition update flag */
        ota_update_owner_e owner;
        uint32_t           next_slot;           /**< expect slot for next boot */
        update_part_t      update_part;
        uint8_t            reserved[ARRAY_32];
        uint32_t           crc32_le;            /**< crc verify value */
    } ota_status_t;
    ```

### 启动状态切换

下图说明正常启动时 A/B slot 是如何切换的（有没有 OTA 都是这个流程）
    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/image/ota/boot_slot_select.png" alt="启动状态切换示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

- 启动时，ROM boot count 自动累加(该标记在 aon 域，下电时复位)

- OTA 升级时设置要更新的 slot 优先级为 15，另一个 slot 为 14。设置要升级的 slot 重试次数为 1，slot 损坏为 0

- OTA 启动验证成功时该 slot 标记为 successboot，启动失败时该 slot 标记为已损坏

- 从未标记 successboot 的 slot 启动时将会消耗一次重试次数，重试次数为 0 或被标记损坏会跳过此 slot

### 重启验证与回滚

<DocScope products="RDK S100">
S100 参考实现中，OTA 升级完重启之后启动到内核会触发 systemd 的 OTA 服务来执行重启检查，来完成完整的 OTA 流程（实际上是执行 `ota_tool -b`）
</DocScope>
<DocScope products="RDK S600">
S600 参考实现中，OTA 升级完重启之后启动到内核会触发 systemd 的 OTA 服务来执行重启检查，来完成完整的 OTA 流程（实际上是执行 `ota_tool -b`）
</DocScope>
    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/image/ota/ota_boot_check_state.png" alt="重启验证与回滚示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

:::warning
镜像烧写完成、但尚未调用 `otaMarkOTASuccessful` 标记成功之前，若发生任何重启，AB 状态机不会把新 slot 标记为 boot_successful，下次仍会从旧版本 slot 启动，本次升级判定失败。请避免在验证阶段中途重启。
:::

### 分区烧写方式

:::warning
升级过程中禁止断电、重启或对目标分区执行其它写入操作，否则可能导致分区损坏、设备无法启动。
:::

    OTA 以分区为单位来进行升级，每个要升级的分区都有自己的镜像，升级时主要是将该镜像写入到外部存储器对应的分区上。在镜像类型上又分为全镜像与差分镜像两种形式。

#### 全镜像升级

  - 全镜像指的是提供的目标分区完整镜像，升级时将镜像直接写到外部存储器对应分区的方式。

#### 差分镜像升级

  - 差分镜像是通过差分算法对原始镜像和目标镜像进行差分计算得到的镜像。差分一般会提取目标镜像与原始镜像之间的差异信息，精简冗余信息。通过差分得到的镜像大小一般会远远小于目标镜像（具体大小取决于原始与目标之间的差异度，差异越小，镜像越小），可用于节省流量。
<DocScope products="RDK S100">
  - 当差分升级时，S100 OTA 会根据差分镜像和板端原始分区数据通过逆差分还原成目标镜像，并写入到对应的外部存储器分区，完成最终的升级。
  - S100 上使用的是开源的差分算法工具 `hdiffz/hpatchz`，详细信息请参考：[github | HDiffPatch](https://github.com/sisong/HDiffPatch)。
</DocScope>
<DocScope products="RDK S600">
  - 当差分升级时，S600 OTA 会根据差分镜像和板端原始分区数据通过逆差分还原成目标镜像，并写入到对应的外部存储器分区，完成最终的升级。
  - S600 上使用的是开源的差分算法工具 `hdiffz/hpatchz`，详细信息请参考：[github | HDiffPatch](https://github.com/sisong/HDiffPatch)。
</DocScope>

### OTA 安全保护措施

#### 分区校验

    OTA 支持对镜像中的 fpt/GPT 分区文件校验，通过与当前系统的 fpt/GPT 分区进行对比，验证 fpt/GPT 分区表是否有调整，如果 fpt/GPT 分区有调整，则停止升级。
    - OTA 升级包含有通过编译系统生成的分区文件 `gpt.conf`，具体内容格式如下：
        ```bash
        fpt:0:262143:0
        recovery:262144:6291455:0
        misc:6291456:6553599:0
        HB_APDP:6553600:6815743:0
        keystorage:6815744:7340031:0
        HSM_FW:7340032:7864319:0
        HSM_FW_bak:7864320:8388607:0
        HSM_RCA:8388608:8650751:0
        ···
        ```
    <DocScope products="RDK S100">
    - 由于 S100 分区支持最后一个分区的自动扩展，其结束地址会动态变化，所以校验 GPT 只校验到 userdata 分区，且最后一个分区一般不含镜像，不影响正常使用。
    </DocScope>
    <DocScope products="RDK S600">
    - 由于 S600 分区支持最后一个分区的自动扩展，其结束地址会动态变化，所以校验 GPT 只校验到 userdata 分区，且最后一个分区一般不含镜像，不影响正常使用。
    </DocScope>

#### dm-verity 与 AVB

开启 OTA 时要求把 `RDK_DM_VERIFY_ENABLE` 配置为 `yes`，它与 OTA 分区表是**绑定关系**：只有 OTA 分区表才包含 `vbmeta` 分区，非 OTA 分区表没有该分区；若只把开关置为 `yes` 而分区表不是 OTA 版本，编译阶段就会因找不到 `vbmeta` 分区而报错。

该开关会带来以下变化：

- `boot` 分区：追加 AVB hash footer，并在内核 cmdline 中加入 `bootverify`；

- `system` 分区：生成 dm-verity hash tree，并追加 hashtree footer；

- 生成 `vbmeta` 分区，聚合 `boot` / `system` 的校验描述符；

- U-Boot 启动时校验 `boot` / `vbmeta`，根文件系统以只读 `system_<slot>` + `overlay` 的方式挂载。

相关构建产物：

| 产物 | 说明 |
|------|------|
| `vbmeta.img` | vbmeta 分区镜像 |
| `out/deploy/vbmeta/vbmeta_boot.img` | boot 分区的 AVB 描述符 |
| `out/deploy/vbmeta/vbmeta_system.img` | system 分区的 AVB 描述符 |
| `out/deploy/vbmeta/hash_system.txt` | system 分区的 dm-verity 哈希表信息 |
| `out/deploy/vbmeta/dm_verity.conf` | dm-verity 映射配置 |

### 典型升级流程

1. OTA Service 从云端下载并校验升级包，并调用 `otaInitLib` 初始化动态库。

2. 调用 `otaRequestStart` 发起升级。该 API 会解压升级包中的 `ota_process` 程序，并 fork 一个进程，执行 `ota_process` 程序进行实际烧写。同时，该 API 还会创建文件锁（防止同时存在多次升级）、创建 pipe 文件（用于和 `ota_process` 通信）。另外，该 API 还会创建一个线程，用于定期读取 pipe，获取实时升级进度、升级结果、升级分区等信息。

3. 子进程升级阶段，OTA Service 可以调用 `otaGetResult` 获取升级结果、调用 `otaGetProgress` 获取升级进度、调用 `otaGetUpdatingImageName` 获取正在升级的镜像。

4. 当 `otaGetResult` 返回 `OTA_UPGRADE_SUCCESS` 时，代表镜像烧写成功，需要进入校验阶段。

5. 调用 `otaSetPartition` 将下次启动分区设置为对向分区，并执行重启流程。

6. 重启后，OTA Service 调用 `otaGetOwnerFlag` 获取升级 owner，如果 owner 为 OTA Service，则 OTA Service 为该次升级的校验负责，进入校验流程。

7. 调用 `otaCheckUpdate`，获取升级结果。该 API 主要会检查镜像是否完整写入、是否从期望 AB slot、Backup slot 启动。

8. 调用 `otaMarkOTASuccessful`，标记当前分区启动成功。该 API 操作 AB 状态机，将本 slot 标记为 boot_successful，保证后续从该 slot 启动。若在此步骤前发生任何重启，则下次将从旧版本镜像所在 slot 启动，升级失败。

9. 调用 `otaPartitionSync`，进行 BAK 分区的主备同步。

10. 调用 `otaClearFlags` 清除升级标记，结束升级。

    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/image/ota/otaservice.png" alt="典型升级流程示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

## OTA 升级端介绍

### `ota_tool` 使用

**此处以 ZIP 格式 的 OTA 包为示例进行说明。除非特别说明，TAR（img 经 Zstandard 压缩）格式 的使用方法与 ZIP 格式完全一致，仅需将文档中的 .zip 后缀替换为 .zst.tar 即可。**

在板端可通过 `ota_tool` 手动发起 OTA 升级，输入 `ota_tool -h` 指令可查询详细的参数说明。

```bash
ota_tool Usage:
   -v, --version                      get this library's version.
   -b, --boot                         check ota update status when boot.
   -s, --setpartition [partition]     set A/B slot partition, 0--A; 1--B.
   -g, --getpartition                 get A/B slot partition, 0--A; 1--B.
   -p, --package [package_path]       specify the path of package, the package paths can be relative or absolute, it's length must be smaller than 64 bytes.
   -n, --noreboot                     request ota without reboot.
   -c, --checksign                    signature check.
   -i, --signature                    signature information file.
   -k, --skip_set_partition           skipping setting partition to the opposite.
   -h, --help                         Display this help screen.
```

使用 `ota_tool` 进行升级前，需要将 OTA 升级包上传至板端。

参数介绍：

- `-h` 用于获取帮助信息。
- `-v` 用于获取 `libupdate.so` 的版本号。
- `-b` 启动后检查升级结果（系统启动时会自动进行此检查，用户无需干预）。
- `-s` 设置下次启动的 A/B slot，0 表示 A，1 表示 B。
- `-g` 获取当前 A/B slot。
- `-p` 指定升级包，可传相对或绝对路径；**路径长度必须小于 64 字节**。
- `-n` 升级成功后不进行自动重启。
- `-c` 启用包完整性验证。
- `-i` 指定签名文件（必须跟在 `-p` 参数后面）。
- `-k` 跳过“把下次启动分区切换到对向分区”的动作，便于调试或由外部流程接管分区切换。

举例：

```bash
# 全量升级，不验证包完整性
ota_tool -p all_in_one_signed.zip

# 全量升级，验证包完整性
ota_tool -c -p all_in_one_signed.zip -i all_in_one_signed.signature

# 差分升级，不验证包完整性
ota_tool -p all_in_one_signed_inc.zip

# 差分升级，验证包完整性
ota_tool -c -p all_in_one_signed_inc.zip -i all_in_one_signed_inc.signature
```

### `ota_tool` 实现

`ota_tool` 使用 C 语言实现，源码仅 otainterface.c 一个文件。 实现了获取系统软件版本、升级结果检查、设置/获取 AB slot、OTA 升级、强制升级、OTA 包签名校验等功能。

若-c 参数传入，则使用传入的签名文件对升级包进行签名校验。

最后，调用 ota_update_all_img 启动升级。

#### ota_update_all_img

```c
static int32_t ota_update_all_img(const char *zip_path)
{
     int32_t progress = 0;

     uint8_t             slot = 0;
     uint8_t             next_slot = 0;
     int32_t             ret = 0;
     ota_update_result_e result = 0;
     char                part_name[ARRAY_32] = { 0 };

     ret = otaGetPartition(&slot);
     if (ret < 0) {
             return ret;
     }

     if (slot == 2) {
             next_slot = 0;
             printf("The slot [%d] to be burned\n", next_slot);
     } else {
             next_slot = 1 - slot;
             printf("The slot [%d] to be burned\n", next_slot);
     }

     ret = otaInitLib();
     if (ret < 0) {
             printf("error:init failed!\n");
             return ret;
     }

     ret = otaRequestStart(zip_path, OTA_TOOL);
     if (ret < 0) {
             printf("error: start ota update failed!\n");
             ret = -1;
             goto err;
     }
     while (otaGetResult() != OTA_UPGRADE_SUCCESS && otaGetResult() != OTA_UPGRADE_FAILED) {
             progress = otaGetProgress();
             result = otaGetResult();
             otaGetUpdatingImageName(part_name, sizeof(part_name));

             if (result == UPGRADE_FAILED) {
                     printf("error: ota update failed!\n");
                     ret = -1;
                     break;
             }
             OTA_show_Process_Bar(part_name, progress,
                                  "OTA is upgrading ...");
             usleep(100 * 1000);
     }

err:
     if (otaGetResult() == OTA_UPGRADE_SUCCESS) {
             ret = otaSetPartition(next_slot);
             if (ret < 0) {
                     printf("error: set partition failed!\n");
                     return ret;
             }
             if (g_is_reboot == true) {
                     printf("reboot system!\n");
                     ota_system_exe("reboot");
             } else {
                     printf("ota update success and waiting for reboot!\n");
             }
     }
     otaDeinitLib();

     return ret;
}
```

1. 调用 `otaGetPartition` 获取当前所在 AB slot

2. 调用 `otaInitLib` 初始化 `libupdate.so`

3. 调用 `otaRequestStart` 并传入升级包和 owner(OTA_TOOL)，开始升级

4. 等待 `otaGetResult` 的结果为 `OTA_UPGRADE_SUCCESS` 或 `OTA_UPGRADE_FAILED` 。等待过程中，调用 `otaGetProgress` 、 `otaGetResult` 、 `otaGetUpdatingImageName` 获取升级进度、升级结果、正在升级的镜像，并调用 OTA_show_Process_Bar 打印到控制台

5. 若升级结果 `otaGetResult` 为 `OTA_UPGRADE_SUCCESS` ，则认为升级成功，调用 `otaSetPartition` 设置 AB slot 到对向 slot ，然后重启 SoC

    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/image/ota/otatool-ota_update_all_img.png" alt="ota_update_all_img 示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

升级流程结束重启后，应启动 `ota_tool` -b 对升级结果进行检查校验，并进行后续操作。

#### ota_boot_check

<DocScope products="RDK S100">
S100 启动后，会启动一个 `hobot-otatool.service` 服务，该服务调用了 `ota_tool -b`，该选项会检查 `/ota/ota_tool_force_upgrade` 文件是否存在，若存在，则进入升级流程（该进程会重新调用升级命令）。若该文件不存在，则进入升级校验流程 `ota_boot_check`
</DocScope>
<DocScope products="RDK S600">
S600 启动后，会启动一个 `hobot-otatool.service` 服务，该服务调用了 `ota_tool -b`，该选项会检查 `/ota/ota_tool_force_upgrade` 文件是否存在，若存在，则进入升级流程（该进程会重新调用升级命令）。若该文件不存在，则进入升级校验流程 `ota_boot_check`
</DocScope>
```c
int32_t ota_boot_check(void)
{
     int32_t               ret = 0;
     enum ota_update_owner owner = 0;

     if ((ret = otaInitLib()) != 0) {
             printf("error: init failed!\n");
             goto exit;
     }

     if ((ret = otaGetOwnerFlag(&owner)) != 0) {
             printf("error: Get owner flag failed!\n");
             goto exit;
     }

     if (owner == NORMAL_BOOT) {
             printf("Normal boot\n");
             if ((ret = otaMarkOTASuccessful()) != 0) {
                     printf("error: mark boot success failed\n");
             }
             return ret;
     }

     if (owner != OTA_TOOL) {
             printf("ota_tool is not owner, owner is [%d]\n", owner);
             return 0;
     }

     if ((ret = otaCheckUpdate()) != 0) {
             printf("error: boot check failed\n");
             goto exit;
     }

     if ((ret = otaMarkOTASuccessful()) != 0) {
             printf("error: mark boot success failed\n");
             goto exit;
     }

     if ((ret = otaPartitionSync()) != 0) {
             printf("error: partition sync failed\n");
             goto exit;
     }

     ret = otaDeinitLib();

exit:
     otaClearFlags();
     return ret;
}
```
1. 调用 `otaInitLib`

2. 调用 `otaGetOwnerFlag` 获取升级 owner

3. 若 owner 为 NORMAL_BOOT ，则调用 `otaMarkOTASuccessful` 标记启动成功，然后退出

4. 若 owner 不为 OTA_TOOL ，则正常退出

5. 调用 `otaCheckUpdate` 获取升级结果。若升级结果异常，则调用 `otaClearFlags` 清除 OTA 标记，终止 OTA 流程

6. 调用 `otaMarkOTASuccessful` 标记启动成功

7. 调用 `otaPartitionSync` 进行 AB 分区、 BAK 分区同步

    <img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/image/ota/otatool-ota_boot_check.png" alt="ota_boot_check 示意图" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

### 强制升级

除在命令行通过 `-p` 指定升级包外，`ota_tool` 还支持“强制升级”文件：

- 默认路径：`/ota/ota_tool_force_upgrade`；
- 文件内容：本次要升级的 OTA 包路径。

当该文件存在时，`ota_tool -b`（开机时由 `hobot-otatool.service` 自动执行）会读取其内容并进入升级流程；文件不存在时则走正常的升级校验流程 `ota_boot_check`。

典型用法：

```bash
# 1. 将升级包上传到板端
# 2. 把升级包路径写入强制升级文件
echo "/ota/all_in_one_signed.zip" > /ota/ota_tool_force_upgrade

# 3. 触发检查（正常开机时由 hobot-otatool.service 自动执行）
ota_tool -b
```

:::warning
强制升级完成后应删除 `/ota/ota_tool_force_upgrade`，否则每次开机都会重复触发升级。

文件中的升级包路径长度超限会报错。
:::

### AB 状态排查工具

除 `ota_tool` 外，系统还提供 `hrut_boot_control`，用于直接读写 misc 分区中的 AB 槽位状态，可在 OTA 校验异常时人工确认或复位：

```bash
hrut_boot_control -g          # 获取当前 slot
hrut_boot_control -s 0        # 设置当前 slot 为 A（1 为 B）
hrut_boot_control -d          # 将 AB slot 状态恢复为默认值
```

## OTA API 介绍

<DocScope products="RDK S100">
S100 提供底层刷写库 `libupdate.so`，实现了一套跨平台的 API，用于烧写 OTA 包。
</DocScope>
<DocScope products="RDK S600">
S600 提供底层刷写库 `libupdate.so`，实现了一套跨平台的 API，用于烧写 OTA 包。
</DocScope>

底软基于 OTA HighLevel API 开发了 `ota_tool` 工具。

头文件：hobot_ota_hl.h

链接库：`libupdate.so`

### 动态库接口错误码列表

```c
enum ota_err_e {
    OTA_SUCCESS = 0,
    OTAERR_IO,
    OTAERR_PLAT_UNSUPPORT,
    OTAERR_REPEAT,
    OTAERR_MUTEX_INIT_LOCK_ERR,
    OTAERR_NOTINIT,
    OTAERR_NULLPOINTER,
    OTAERR_SHORTBUF,
    OTAERR_THREAD_CREATE,
    OTAERR_RANGE,
    OTAERR_STAGE,
    OTAERR_IMAGE_WRITE,
    OTAERR_BOOT_FAILED,
    OTAERR_VEEPROM,
    OTAERR_FILE_TYPE,
    OTAERR_UNZIP,
    OTAERR_NO_EXISTS,
    OTAERR_MALLOC,
    OTAERR_VERIFY,
    OTAERR_IMG_SIZE,
    OTAERR_UPDATE_STATUS,
};
```

### Interface List

| 接口原型 | 描述 |
|----------|------|
| `int32_t otaInitLib(void);` | 动态库初始化 |
| `int32_t otaDeinitLib(void);` | 动态库反初始化 |
| `int32_t otaGetLibVersion(char *version, int32_t len);` | 获取动态库版本 |
| `int32_t otaRequestStart(const char *image_name, enum ota_update_owner owner);` | 启动升级线程 |
| `int32_t otaGetResult(void);` | 获取升级状态和结果 |
| `int32_t otaGetProgress(void);` | 获取升级进度 |
| `int32_t otaGetUpdatingImageName(char *image_name, int32_t len);` | 获取正在升级的包 |
| `int32_t otaGetPartition(uint8_t *partition);` | 获取当前启动的 AB 分区 |
| `int32_t otaSetPartition(uint8_t partition);` | 设置下次启动的 AB 分区 |
| `int32_t otaGetOwnerFlag(enum ota_update_owner *owner);` | 获取 OTA owner（重启后） |
| `int32_t otaMarkOTASuccessful();` | 标记 OTA 升级成功（重启后） |
| `int32_t otaCheckUpdate();` | 检查是否升级成功（重启后） |
| `int32_t otaPartitionSync(void);` | AB 分区、BAK 分区同步 |
| `int32_t otaInitSecImg(const char *zip_path, ota_sec_info_t *sec_info);` | 初始化 HSM 安全镜像信息 |
| `int32_t otaVerifySecImg(ota_sec_info_t *sec_info);` | 认证 HSM 安全镜像升级 |
| `void otaClearFlags(void);` | 结束升级，清除 OTA 标志 |
| `int otaNotifyMCU(hl_ota_msg msg);` | 通知 MCU 执行 OTA 相关动作 |

### Interface: `otaInitLib`

| 接口名     | int32_t otaInitLib(void); |
|:---------|:-------------|
| 接口形式   | c 函数接口    |
| 输入参数   | N/A           |
| 输出参数   | N/A           |
| 返回值     | 0: 成功；<br/> -OTAERR_REPEAT:重复初始化 |
| 功能描述   | 板端刷写接口动态库初始化，主要进行全局结构体 g_upgrade_info 的初始化 |

**示例代码**
```c
#include <stdio.h>
#include <hobot_ota_hl.h>
int main(void) {
    int32_t ret;
    ret = otaInitLib();
    if (ret != 0) {
        printf("otaInitLib return: %d\n", ret);
        return ret;
    }
    ret = otaDeinitLib();
    if (ret != 0) {
        printf("otaDeinitLib return: %d\n", ret);
        return ret;
    }
    return 0;
}
```

### Interface: `otaDeinitLib`

| 接口名   | int32_t otaDeinitLib(void); |
|:---------|:--------------------------|
| 接口形式 | c 函数接口                |
| 输入参数 | N/A                       |
| 输出参数 | N/A                       |
| 返回值   | 0: 成功；<br/>-OTAERR_NOTINIT: 当前未初始化，不能调用反初始化 |
| 功能描述 | 反初始化            |

**示例代码**

参考 `otaInitLib`

### Interface: `otaGetLibVersion`

| 接口名   | int32_t otaGetLibVersion(char *version, int32_t len); |
|:---------|:----------------------------------------------|
| 接口形式 | c 函数接口                                    |
| 输入参数 | len: 传入的 buffer 长度                       |
| 输出参数 | version: 用于存储 version 信息。version 以三段式字符串形式返回（如：1.0.0） |
| 返回值   | 0: 成功；<br/> -OTAERR_NULLPOINTER: version 空指针；<br/> -OTAERR_SHORTBUF: 传入的 buffer 过小 |
| 功能描述 | 获取本动态库版本                              |

**示例代码**
```c
#include <stdio.h>
#include <hobot_ota_hl.h>
int main(void) {
    int32_t ret;
    char version[128];
    ret = otaGetLibVersion(version, sizeof(version));
    if (ret != 0) {
        return ret;
    }
    printf("version: %s\n", version);
}
```

### Interface: `otaRequestStart`

| 接口名   | int32_t otaRequestStart(const char *image_name, enum ota_update_owner owner); |
|:---------|:---------------------------------------------------------------------|
| 接口形式 | c 函数接口                                                           |
| 输入参数 | image_name: 升级包绝对路径。支持多种不同类型的包同时传入，用分号隔开。<br/>owner: 发起本次升级的进程，owner 由 enum ota_update_owner 定义|
| 输出参数 | N/A                                                                   |
| 返回值   | 0: 成功；<br/>-OTAERR_NULLPOINTER：image_name 空指针；<br/>-OTAERR_RANGE：owner 设置错误，超出当前定义范围；<br/>-OTAERR_NOTINIT：未初始化本动态库；<br/>-OTAERR_REPEAT：当前有其他进程正在升级；<br/>-OTAERR_IO：IO 失败；<br/>-OTAERR_THREAD_CREATE：线程创建失败 |
| 功能描述 | 启动升级进程，对传入的 image_name 进行升级，并设置当前升级所有者       |

**示例代码**
```c
#include <stdio.h>
#include <hobot_ota_hl.h>
int main(void) {
    int32_t ret;
    int32_t result;
    int32_t progress;
    char imgname[256];
    uint8_t cur_part;
    ret = otaInitLib();
    if (ret != 0) {
        printf("otaInitLib return: %d\n", ret);
        return ret;
    }
    ret = otaRequestStart("/ota/all_in_one-secure_signed.zip", OTA_TOOL);
    if (ret != 0) {
        printf("otaRequestStart return: %d\n", ret);
        return ret;
    }
    do {
        result = otaGetResult();
        ret = otaGetUpdatingImageName(imgname, sizeof(imgname));
        if (ret != 0) {
            printf("otaGetUpdatingImageName return: %d\n", ret);
        }
        progress = otaGetProgress();
        printf("current image: %s, progress: %d\n", imgname, progress);
        sleep(1);
    } while(result != OTA_UPGRADE_SUCCESS && result != OTA_UPGRADE_FAILED);

    ret = otaGetPartition(&cur_part);
    if (ret != 0) {
        printf("otaGetPartition returned with %d\n", ret);
    }
    ret = otaSetPartition(1 - cur_part);
    if (ret != 0) {
        printf("otaSetPartition returned with %d\n", ret);
    }
    /* Then reboot system */
    return 0;
}
```

### Interface: `otaGetResult`

| 接口名   | int32_t otaGetResult(void);                                                 |
|:---------|:-------------------------------------------------------------------|
| 接口形式 | c 函数接口                                                         |
| 输入参数 | N/A                                                                 |
| 输出参数 | N/A                                                                 |
| 返回值   | -OTAERR_NOTINIT: 未初始化本动态库<br/>`OTA_UPGRADE_NOT_START`：升级未开始；<br/>`OTA_UPGRADE_IN_PROGRESS`：升级中；<br/>`OTA_UPGRADE_SUCCESS`：升级结束，成功；<br/>`OTA_UPGRADE_FAILED`: 升级结束，失败 |
| 功能描述 | 获取升级结果|

**示例代码**

参考 `otaRequestStart`

### Interface: `otaGetProgress`

| 接口名       | 	int32_t otaGetProgress(void); |
|:---------|:-------------|
| 接口形式     | c 函数接口                                       |
| 输入参数     | N/A                                             |
| 输出参数     | N/A                                             |
| 返回值       | 0 ~ 100: 当前升级进度(%)<br/>-OTAERR_NOTINIT: 未初始化本动态库 |
| 描述         | 获取当前升级进度                               |

**示例代码**

参考 `otaRequestStart`

### Interface: `otaGetUpdatingImageName`

| 接口名       | int32_t otaGetUpdatingImageName(char *image_name, int32_t len); |
|:---------|:-------------|
| 接口形式     | c 函数接口                                     |
| 输入参数     | len: buffer 长度                               |
| 输出参数     | image_name: 用于存放结果的 buffer。<br/>image_name 可能出现的内容：idle_state–升级未开始，<br/>all_img_finish–升级完成，app_param–应用参数，其他以”.img”结尾的包名。 |
| 返回值       | 0：成功<br/>-OTAERR_NULLPOINTER：image_name 空指针<br/>-OTAERR_NOTINIT：本动态库未初始化<br/>-OTAERR_SHORTBUF：buffer 长度太短 |
| 描述         | 获取当前正在升级的镜像                       |

**示例代码**

参考 `otaRequestStart`

### Interface: `otaGetPartition`

| 接口名       | int32_t otaGetPartition(uint8_t *partition); |
| :------------ | :------------------------------------------- |
| 接口形式     | c 函数接口                                   |
| 输入参数     | N/A                                         |
| 输出参数     | partition：用于接收当前分区的变量地址。<br/>*partition=0：当前为 A 分区，*partition=1：当前为 B 分区 |
| 返回值       | 0:成功<br/>-OTAERR_NULLPOINTER: partition 为空指针<br/>-OTAERR_IO: io 错误，请重试 |
| 描述         | 获取当前启动 AB 分区                         |

**示例代码**

参考 `otaRequestStart`

### Interface: `otaSetPartition`

| 接口名       | int32_t otaSetPartition(uint8_t partition); |
| :------------ | :------------------------------------------- |
| 接口形式     | c 函数接口                                   |
| 输入参数     | partition：下次启动分区。0：A 分区，1：B 分区 |
| 输出参数     | N/A                                         |
| 返回值       | 0:成功<br/>-OTAERR_NOTINIT：本动态库未初始化<br/>-OTAERR_RANGE: partition 范围错误，partition 范围为 0 和 1<br/>-OTAERR_IO: io 错误，请重试<br/>-OTAERR_STAGE: 当前升级阶段不支持。升级过程中或升级失败不支持 |
| 描述         | 设置下次启动 AB 分区                         |

**示例代码**

参考 `otaRequestStart`

### Interface: `otaGetOwnerFlag`

| 接口名       | int32_t otaGetOwnerFlag(enum ota_update_owner *owner); |
| :------------ | :------------------------------------------ |
| 接口形式     | c 函数接口                                  |
| 输入参数     | N/A                                        |
| 输出参数     | owner：接收当前升级 owner 的变量。请参考 enum ota_update_owner |
| 返回值       | OTA_SUCCESS:成功<br/> -OTAERR_NOTINIT:未初始化<br/> -OTAERR_NULLPOINTER: partition 为空指针<br/> -OTAERR_IO:io 错误,请重试 |
| 描述         | 获取当前升级 owner                          |

**示例代码**

```c
static int check_and_mark(void) {
    enum ota_update_owner owner;
    int32_t ret;
    ret = otaGetOwnerFlag(&owner);
    if (ret != 0) {
            printf("otaGetOwnerFlag returned with %d\n", ret);
            return -1;
    }
    if (owner != OTA_TOOL) {
            printf("The OTA update is not launched by ota_tool, owner: %d\n", owner);
            return -1;
    }
    ret = otaCheckUpdate();
    if (ret == -OTAERR_IMAGE_WRITE) {
            printf("ota_tool: OTA image write failed, is there a reboot during update?\n");
            goto clearFlags;
    }
    if (ret == -OTAERR_BOOT_FAILED) {
            printf("ota_tool: The new package boot failed. Please check the packages\n");
            goto clearFlags;
    }
    if (ret != 0) {
            printf("otaCheckUpdate returned with %d\n", ret);
            goto clearFlags;
    }
    ret = otaMarkOTASuccessful();
    if (ret != 0) {
            printf("otaMarkOTASuccessful returned with %d\n", ret);
            goto clearFlags;
    }
    ret = otaPartitionSync();
    if (ret != 0) {
            printf("otaPartitionSync returned with %d\n", ret);
            goto clearFlags;
    }
clearFlags:
    otaClearFlags();
    return ret;
}
```

### Interface: `otaMarkOTASuccessful`

| 接口名       | int32_t otaMarkOTASuccessful(); |
| :------------ | :---------------------------------------- |
| 接口形式     | c 函数接口                                |
| 输入参数     | N/A                                      |
| 输出参数     | N/A                                      |
| 返回值       | 0:成功<br/>-OTAERR_NOTINIT: 未初始化<br/>-OTAERR_IO: io 错误，请重试 |
| 描述         | 标记本次升级成功                          |

**示例代码**

参考 `otaGetOwnerFlag`

### Interface: `otaCheckUpdate`

| 接口名       | int32_t otaCheckUpdate(); |
| :------------ | :---------------------------------------- |
| 接口形式     | c 函数接口                                |
| 输入参数     | N/A                                      |
| 输出参数     | N/A                                      |
| 返回值       | 0:成功<br/>-OTAERR_IO: io 错误，请重试<br/>-OTAERR_STAGE: 未进行升级<br/>-OTAERR_IMAGE_WRITE: 镜像写入失败<br/>-OTAERR_BOOT_FAILED: 新镜像启动失败或未切换分区 |
| 描述         | 检查本次升级是否成功                      |

**示例代码**

参考 `otaGetOwnerFlag`

### Interface: `otaClearFlags`

| 接口名       | void otaClearFlags(void); |
| :------------ | :---------------------------------------- |
| 接口形式     | c 函数接口                                |
| 输入参数     | N/A                                      |
| 输出参数     | N/A                                      |
| 返回值       | N/A                                      |
| 描述         | 清除 OTA flags                           |

**示例代码**

参考 `otaGetOwnerFlag`

### Interface: `otaPartitionSync`

| 接口名       | int32_t otaPartitionSync(void); |
| :------------ | :---------------------------------------- |
| 接口形式     | c 函数接口                                |
| 输入参数     | N/A                                      |
| 输出参数     | N/A                                      |
| 返回值       | 0：成功<br/> -OTAERR_NOTINIT：未初始化<br/> -OTAERR_IO：IO 错误 <br/>-OTAERR_REPEAT：与其他升级进程冲突 |
| 描述         | AB 分区、BAK 分区同步                      |

**示例代码**

参考 `otaGetOwnerFlag`

### 安全镜像与 MCU 联动

除上述通用接口外，`hobot_ota_hl.h` 还提供了一组用于 HSM 安全镜像校验与 MCU 联动的接口。相关类型定义如下：

```c
typedef enum sec_update_type {
    SEC_FW = 0xD2,   /**< SEC firmware */
    SEC_RCA,         /**< SEC RCA */
} ota_sec_update_type_e;

typedef struct ota_sec_img_s {
    ota_sec_update_type_e sec_type;       /**< secure image type */
    char    cert_path[ARRAY_128];         /**< OTA cert path, reserved */
    char    img_path[ARRAY_128];          /**< secure image path, filled by lib */
    uint8_t nouce[ARRAY_32];              /**< nouce, filled by lib */
    uint8_t signature[ARRAY_64];          /**< signature, filled by service */
} ota_sec_img_t;

typedef struct ota_sec_info_s {
    uint8_t       num;                    /**< secure number */
    ota_sec_img_t img_info[ARRAY_2];      /**< secure image struct */
} ota_sec_info_t;

typedef enum hl_ota_msg {
    HL_MCU_START_OTA = 0,   /**< notify MCU to start OTA */
    HL_MCU_POST_OTA,        /**< notify MCU OTA finished */
    HL_MCU_ABORT_OTA,       /**< notify MCU to abort OTA */
    HL_MCU_PRE_REBOOT,      /**< notify MCU before reboot */
    HL_MCU_CMD_CNT,
} hl_ota_msg;
```

### Interface: `otaInitSecImg`

| 接口名   | int32_t otaInitSecImg(const char *zip_path, ota_sec_info_t *sec_info); |
|:---------|:----------------------------------------------------------------------|
| 接口形式 | c 函数接口                                                            |
| 输入参数 | zip_path: 升级包路径；<br/>sec_info: 安全镜像信息结构体指针             |
| 输出参数 | sec_info：由动态库填充安全镜像路径与随机数（nouce）                     |
| 返回值   | 0: 成功；<br/>-OTAERR_NOTINIT: 未初始化；<br/>-OTAERR_NULLPOINTER: 空指针；<br/>-OTAERR_IO: IO 错误 |
| 功能描述 | 初始化 HSM 安全镜像信息并向 HSM 申请随机数，供上层填充签名使用          |

**示例代码**

由 OTA Service 调用 `otaInitSecImg`，对返回的 `signature` 字段填充签名后，再调用 `otaVerifySecImg`。

### Interface: `otaVerifySecImg`

| 接口名   | int32_t otaVerifySecImg(ota_sec_info_t *sec_info); |
|:---------|:--------------------------------------------------|
| 接口形式 | c 函数接口                                        |
| 输入参数 | sec_info: 已填充签名信息的安全镜像结构体指针        |
| 输出参数 | N/A                                               |
| 返回值   | 0: 成功；<br/>-OTAERR_NOTINIT: 未初始化；<br/>-OTAERR_NULLPOINTER: 空指针；<br/>-OTAERR_IO: IO 错误 |
| 功能描述 | 认证 HSM 安全镜像升级                             |

**示例代码**

参考 `otaInitSecImg`。

### Interface: `otaNotifyMCU`

| 接口名   | int otaNotifyMCU(hl_ota_msg msg); |
|:---------|:---------------------------------|
| 接口形式 | c 函数接口                        |
| 输入参数 | msg: 需要通知 MCU 的事件，取值见 `hl_ota_msg` |
| 输出参数 | N/A                              |
| 返回值   | 0: 成功；<br/>负数: 失败          |
| 功能描述 | 通知 MCU 执行 OTA 相关动作（开始升级、升级完成、中止升级、重启前处理） |

**示例代码**

```c
#include <stdio.h>
#include <hobot_ota_hl.h>

int notify_mcu(hl_ota_msg msg) {
    int ret = otaNotifyMCU(msg);
    if (ret != 0) {
        printf("otaNotifyMCU(%d) returned with %d\n", msg, ret);
    }
    return ret;
}
```

## 常见问题

### 差分升级出现 md5 校验失败

**原因**：需要差分升级的分区若被挂载，未以只读方式挂载或未加 `noload` 选项。

**解决**：将相关分区以只读方式挂载，并添加 `noload` 选项后重新升级。

### 升级因分区校验失败而停止

**原因**：升级包内的 `gpt.conf` 与当前系统分区表不一致，分区表发生了调整。

**解决**：核对并恢复分区表（或重新整机烧录），使分区表与升级包一致。

### 升级包未被升级程序识别

**原因**：升级程序按关键字对升级包的**完整路径**做大小写敏感的子串匹配。路径中必须包含 `all_in_one`（`all_in_one_full` 也会被识别），且不得出现 `app`、`APP`、`middleware`、`param`。

由于匹配的是完整路径，不仅包名，**所在目录名**也不能包含上述禁止关键字。例如把包放在 `/data/app/` 下，或路径中出现 `wrapper`（包含子串 `app`），都会被误判。

**解决**：把升级包放到不含禁止关键字的目录（如 `/ota/`），按命名规范重命名后重新发起升级。

### 升级后回滚到旧版本

**原因**：镜像烧写后、标记成功（`otaMarkOTASuccessful`）前发生重启，AB 状态机未将新 slot 标记为 boot_successful。

**解决**：走完整验证流程，确保新镜像启动校验并通过后再完成升级；避免在验证阶段中途重启。

## 相关文档

- [主版本升级与固件](/System_configuration/system_update/upgrade_firmware)
- [miniboot 升级](/Advanced_development/system_software/ota_miniboot)
