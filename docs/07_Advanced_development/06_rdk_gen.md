---
sidebar_position: 06
---
# 7.6 构建系统开发指南

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

:::info BSP 源码包

BSP 源码包下载地址参见： [系统软件](../01_Quick_start/download.md#系统软件)（需要注册登录）

:::

:::tip 商业支持
商业版提供更完整的功能支持、更深入的硬件能力开放和专属的定制内容。为确保内容合规、安全交付，我们将通过以下方式开放商业版访问权限。

商业版本获取流程：
1. 填写问卷：提交您的机构信息、使用场景等基本情况
2. 签署保密协议（NDA）：我们将根据提交信息与您联系，双方确认后签署保密协议
3. 内容释放：完成协议签署后，我们将通过私有渠道为您开放商业版本资料

如您希望获取商业版内容，请点击下方链接填写问卷，我们将在 3 ～ 5 个工作日内与您联系：
https://horizonrobotics.feishu.cn/share/base/form/shrcnpBby71Y8LlixYF2N3ENbre
:::


## 7.6.1 概述
本章节主要针对需要对 RDK 构建系统进行定制化修改的介绍，rdk_gen 的使用说明，请参考 rdk_gen 仓库的 README.md。

基本的使用说明：
``` bash
# 在线镜像构建，从地瓜及第三方APT源下载依赖的deb包
sudo ./pack_image.sh

# 离线镜像构建，只安装out/product/deb_packages下的deb包，使用此选项时请确保out/product/deb_packages内的deb符合预期，同时out/product/rootfs_packages下已有预编译根文件系统包
sudo ./pack_image.sh -l

# 仅搭建deb包编译环境，不打包镜像
sudo ./pack_images.sh -p

# 构建所有deb包
./mk_debs.sh

# 构建特定deb包，以hobot-configs为例
./mk_debs.sh hobot-configs
```

## 7.6.2 根文件系统预编译包构建说明
根文件系统由 multistrap+chroot 构建生成。

### multistrap
#### 官方文档
  - [Debian Wiki | Multistrap](https://wiki.debian.org/Multistrap)
  - [Debian manpage](https://manpages.debian.org/bookworm/multistrap/multistrap.1.en.html)

#### 工具简介
总结而言，`multistrap`是独立于`debbootstrap`工具的另一套 debian/Ubuntu 等以 apt 源为基础生成根文件系统的工具。它基于一个/多个配置文件定义生成根文件系统所使用的 apt 源，以及需要默认生成哪些包。
与`debootstrap`最大的区别有以下几点：
1. 灵活性：`multistrap`允许用户完全自定义新生成的根文件系统内的所有包，包括 apt 源内标记为必选的包，但是用户需要自行保证根文件系统的完整性和可用性；
2. 生成流程：`multistrap`不同于`debbootstrap`，它的生成流程可以概括为以下几个步骤，最大的区别在于第四步，`multistrap`只进行包的解压缩，没有对包进行配置（也就是执行[pre/post]install 脚本）：
  1. 读取配置文件
  2. 根据配置文件从获取指定的 apt 源的元数据
  3. 根据配置文件尝试下载指定的包
  4. 根据配置文件解压缩指定的包
在地瓜提供的`multistrap`编译脚本中，我们基于实践经验，通过使用`binfmt-support + chroot`，在 sudo 权限下实现了对包的配置，以达到用户制作的根文件系统可以直接烧录上板使用。

#### 配置文件简介
`multistrap`的配置文件支持单文件/多文件两种形式。多文件情况下可以通过"include"字段将基础版本所包含的所有内容添加上后，只针对特定版本进行配置，极大的方便了多文件系统的维护工作。
以下章节内容的配置文件路径：`samplefs/configs`:
```bash
$ tree samplefs/configs/
samplefs/configs/
├── jammy-base.conf
├── jammy-desktop.conf
├── jammy-server.conf
├── noble-base.conf
├── noble-desktop.conf
└── pip-requirements.list

0 directories, 6 files
```

:::info 平台选择
- **RDK S100**: 使用 `jammy-*` 配置文件（Ubuntu 22.04）
- **RDK S600**: 使用 `noble-*` 配置文件（Ubuntu 24.04）
:::

##### 基本格式介绍
详细的字段介绍请参考官方文档，这里主要针对地瓜的配置文件中的重要配置进行说明。
1. 字段：`key1=value1`的格式，定义了某个字段"key1"的值为"value1"
2. 字段集（stanza/section）：通过定义"`[Some-Section]`"来归集从该行开始，到下一个"`[Next-Section]`"为止中间所有字段为一个"`Section`"

重点字段介绍：
- include
  - 定义需要 include 的配置文件的路径
- bootstrap
  - 定义生成根文件系统所使用的 apt 源和要下载并解压缩的包所在的字段集
- aptsources
  - 定义生成的根文件系统中路径/etc/sources.list.d/内会保存的 apt 源所在的字段集。**注意**，这个源不一定需要与 bootstrap 中用于生成根文件系统的源保持一致，但我们强烈建议 aptsources 定义的 apt 源是 bootstrap 定义的源的超集。
- source/suite/components/omitdebsrc
  - 定义 apt 源使用的关键字。可以参考[apt源格式定义](https://manpages.ubuntu.com/manpages/xenial/man5/sources.list.5.html)
  - source：apt 源的根链接，与 apt 源格式的"uri"字段匹配
  - suite：apt 源的 suite，与 apt 源格式的"suite"字段匹配，一般代表该源对应的系统 code name+属性，例如 Ubuntu 的 jammy/focal/noble/jammy-updates/noble-security
  - components：apt 源的 component，与 apt 源格式的"component"字段匹配，同样可以添加多个
  - omitdebsrc：拉取 apt 元数据及包时，是否下载 deb 包对应的 src 包，一般配置为"true"，即不下载 deb 包对应的 src 包，以加速构建。
- packages
  - 用于定义需要拉取的包的字段，一个 packages 字段可以定义多个包，包之间以空格分隔，多个 packages 字段的合集会作为最终的包定义。
##### 多文件配置示例

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<DocScope products="RDK S100">
请参考代码路径`samplefs/configs/jammy-desktop.conf`
</DocScope>
<DocScope products="RDK S600">
请参考代码路径`samplefs/configs/noble-desktop.conf`
</DocScope>

### RDK 的实现
#### 配置文件设计
RDK 上，multistrap 的配置文件默认根据平台分为多个部分：

<DocScope products="RDK S100">

- jammy-base.conf：用于配置 RDK S100通用的默认根文件系统配置，包括使用的 apt 源，RDK S100所有版本默认包含的包等；
- jammy-desktop.conf：用于配置 RDK S100桌面版根文件系统基于 jammy-base.conf 新增的包；
- jammy-server.conf：用于配置 RDK S100服务器版根文件系统基于 jammy-base.conf 新增的包；

</DocScope>
<DocScope products="RDK S600">

- noble-base.conf：用于配置 RDK S600通用的默认根文件系统配置，包括使用的 apt 源，RDK S600所有版本默认包含的包等；
- noble-desktop.conf：用于配置 RDK S600桌面版根文件系统基于 noble-base.conf 新增的包；
</DocScope>

#### 构建流程说明
用户一般使用`samplefs/make_ubuntu_samplefs.sh`脚本来进行根文件系统的构建，如果使用 sudo 调用该脚本，则根文件系统构建过程会包括对包的配置，耗时会显著增加。

如果不使用 sudo 调用该脚本，则构建过程不会包括对包的配置，耗时会相对减少，但是首次启动需要在板端使用命令`rm -rf /var/lock/* ; dpkg --configure -a --force-confdef --force-confold ; systemctl enable /etc/systemd/system/S*.service`命令来初始化系统并重启以确保系统正常工作。

:::info **提示**
推荐**使用 sudo**调用 samplefs/make_ubuntu_samplefs.sh。
:::

调用`samplefs/make_ubuntu_samplefs.sh`脚本需要在 samplefs 目录下进行。

在不添加参数的情况下直接在使用`sudo ./make_ubuntu_samplefs.sh`：

<DocScope products="RDK S100">

脚本默认构建桌面版镜像，也就是使用`jammy-desktop.conf`文件来构建根文件系统。

</DocScope>
<DocScope products="RDK S600">

脚本默认构建桌面版镜像，也就是使用`noble-desktop.conf`文件来构建根文件系统。

</DocScope>

指定使用的配置文件的命令：`sudo ./make_ubuntu_samplefs.sh build <config_file_name>`，例如新增的配置文件为：`new-desktop.conf`，则命令就是：`sudo ./make_ubuntu_samplefs.sh build new-desktop.conf`，`new-desktop.conf`文件需要放到`samplefs/configs`文件夹内。

脚本构建流程图如下：
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_rdk_gen/samplefs_flowchart.png" alt="samplefs_flowchart" style={{ width: '100%' }} />

#### 裁剪/自定义根文件系统的方法
:::info 提示
apt 源(deb 包的 control 信息)中的 Priority 字段会区分裁剪/自定义的流程。
multistrap 默认会将所有 Priority 为"Required"的包进行安装。
地瓜定义 important 包也会被安装。
:::

##### 仅裁剪/自定义 apt 优先级不为"important"/"required"的包

<DocScope products="RDK S100">

用户直接在 samplefs/configs/jammy-base.conf 等配置文件的各个"packages"字段中删除自己不需要的包，或者定义一个新的字段集，并在"[General]"字段集的"boostrap"字段中去掉原有字段集并添加自己的字段集即可。

</DocScope>
<DocScope products="RDK S600">

用户直接在 samplefs/configs/noble-base.conf 等配置文件的各个"packages"字段中删除自己不需要的包，或者定义一个新的字段集，并在"[General]"字段集的"boostrap"字段中去掉原有字段集并添加自己的字段集即可。

</DocScope>

##### 需要裁剪/自定义 apt 优先级为"important"/"required"的包
**注意**：一般来说各个 apt 源的维护者会将他们认为该系统（Ubuntu/Debian 的各个版本）的最小集的包的优先级标为"Required"，但是是可以进一步裁剪的。进行这种程度的根文件系统裁剪时，用户需要**自己保证根文件系统的完整性和可用性**。

步骤如下：
1. 在`[Gerneral]`字段集中添加`omitrequired=true`；
2. 在`Packages`中对所有需要添加的包进行定义。

## 7.6.3 RDK deb 包构建流程说明
### 简介
RDK 默认以 deb 包的形式来管理用户层的地瓜定制功能。在 SDK 的 source/目录下保存了所有地瓜定制功能的 deb 包构建的源码。

### 构建脚本介绍
构建 deb 的入口脚本为`mk_debs.sh`，该脚本位于 SDK 包的根目录。用户可以通过该脚本构建仓库内的 deb 包。

### deb 包源码目录
`source`下的目录，除`bootloader`，`kernel`，`hobot-drivers`外均为地瓜定制化功能的 deb 包的构建源码。其中`hobot-spdev`，`hobot-camera`，`hobot-io`等目录内包含了相应动态库的源码，通过 mk_debs.sh 脚本构建这两个包时，对应的源码会被编译。
deb 包源码目录的基本结构（以 hobot-configs 为例）内会包括：
```bash
hobot-configs/
├── LICENSE          # deb包源码的License信息
├── README.md        # deb包的简单说明
├── VERSION          # deb包的版本号，以major.minor.patch的形式保存，编译时默认添加时间戳
└── debian           # deb包的根目录，相当于板端安装时的根目录
    ├── DEBIAN       # deb包的元数据信息
    |   ├── postinst # deb包标准脚本之一，在dpkg安装的拷贝步骤后执行
    │   ├── postrm   # deb包标准脚本之一，在dpkg删除的文件删除步骤后执行
    │   ├── preinst  # deb包标准脚本之一，在dpkg安装的拷贝步骤前执行
    │   └── prerm    # deb包标准脚本之一，在dpkg删除的文件删除步骤前执行
    ├── etc          # 具体需要拷贝到根文件系统的文件，根据实际情况创建即可。相对"debian"的目录，就是相对根文件系统的目录，例如这个目录就会被安装到板端/etc目录下
    ├── lib          # 具体需要拷贝到根文件系统的文件，根据实际情况创建即可。
    └── usr          # 具体需要拷贝到根文件系统的文件，根据实际情况创建即可。
```

包含源码的 deb 包目录，则会在 debian 目录之外，新增源码目录，如 hobot-camera：
```bash
hobot-camera/
├── LICENSE
├── README.md
├── VERSION
├── debian
│   ├── DEBIAN
│   ├── etc
│   └── usr
├── drivers             # 需要编译的源码目录
│   ├── Makefile        # 源码编译的入口Makefile
│   ├── deserial        # 源码子目录
│   ├── inc
│   └── sensor
├── lib -> ../hobot-multimedia/debian/usr/hobot/lib # 方便编译的源码软连接
├── sensor_calibration       # Sensor tuning库，下列库仅为示例，以实际情况为准
│   └── lib_imx219_linear.so
└── tuning_tool              # 地瓜提供的Sensor tuning工具
    ├── bin
    ├── cfg
    ├── control_tool
    ├── res
    └── scripts
```
### 构建流程说明
详细流程请参考`mk_debs.sh`脚本实现，以下是一个简略的流程图：
<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_rdk_gen/mk_debs_flowchart.png" alt="mk_debs_flowchart" style={{ width: '100%' }} />

### 自定义 deb 包流程说明
1. 在`source/`文件夹下，新建对应包的包名（dpkg 内的 package name）命名的文件夹，这里以"new_package"为例；
2. 在`source/new_package`文件夹下，新建`debian`文件夹，里面创建4个脚本文件，这4个脚本文件可以为空：
    - preinst：安装 new_package 包拷贝前需要执行的脚本；
    - postinst：安装 new_package 包拷贝执行完成后需要执行的脚本；
    - prerm：移除 new_package 包执行删除命令前需要执行的脚本；
    - postrm：移除 new_package 包执行删除命令后需要执行的脚本。
3. 如果需要在`mk_debs.sh`不带入参时自动对该包进行编译，则在`mk_debs.sh`脚本的`deb_pkg_list`变量内添加`new_package`字段；
4. 在`mk_debs.sh`脚本的`make_debian_deb`函数的`switch`内添加`new_package`的`case`：
     - 在`case`内调度`gen_control_file`函数，生成构建 deb 包所需要的 control 文件；
     - 在`case`内调度`sed`命令，将默认的"depends"字段替换为真正的 deb 依赖。假设`new_package`的依赖为`dep_pkg1`和`dep_pkg2`；
       - 如果有依赖，则使用`sed -i 's/Depends: .*$/Depends: dep_pkg1,dep_pkg2/' "${deb_dst_dir}"/DEBIAN/control;`
       - 如果没有依赖，则使用`sed -i 's/Depends: .*$/Depends: /' "${deb_dst_dir}"/DEBIAN/control;`
     - (可选)如果该 deb 在打包前，需要进行源码编译，则进行源码编译命令的调度，请注意最终的所有输出，均需要输出到`out/build/debs/new_pkg/debian/`目录下;
     - 置位`is_allowed=1`

## 7.6.4 deb 包编入镜像流程说明
在镜像构建的过程中，deb 包会被编入板端根文件系统内。

### 在线镜像构建
#### 流程说明
当`pack_image.sh`不添加-l 选项进行调度时，会进入在线镜像构建流程。流程介绍如下：
1. 从`pack_image.sh`的`DEFAULT_CONFIG`字段获取当前的默认编译配置文件，例如 S100为`build_params/ubuntu-22.04_desktop_rdk-s100_release.conf`，S600为`build_params/ubuntu-24.04_desktop_rdk-s600_release.conf`；
     - 该配置文件可以通过-c 选项指定
2. 从编译配置文件内获取`RDK_DPKG_DEB_PKG_LIST`字段；
3. chroot 到`out/deploy/rootfs`目录下：
   1. 根据`RDK_DPKG_DEB_PKG_LIST`字段从现有板端 apt 源内尝试下载所有 deb 包；
   2. 安装所有 deb 包；

#### 添加额外 deb 包的方法
1. 找到需要安装的包名；
2. 在指定的编译配置文件内的`RDK_DPKG_DEB_PKG_LIST`变量内添加对应的包名。

:::info 提示
获取报名的方法请参考[获取所需deb包名的方法](#get_package_name)
:::

### 离线镜像构建
#### 流程说明
当`pack_image.sh`添加-l 选项进行调度时，会进入离线镜像构建流程。流程介绍如下：
1. chroot：
   1. 根据`out/product/deb_packages`内现有的 deb 包，对每个 deb 包进行安装；

#### 添加额外 deb 包的方法
1. 找到需要安装的包名；
2. 执行以下命令将对应包下载到`out/product/deb_packages`
```bash
cd out/product/deb_packages
apt download <package names>
```

:::info 提示
获取报名的方法请参考[获取所需deb包名的方法](#get_package_name)
:::

### 获取所需 deb 包名的方法{#get_package_name}
包名可以通过两个方式获取：
1. 仅知道需要的文件且 host 没有安装过该包：
   - 建议通过 Google/Baidu 等搜索引擎确认该文件所属的 deb 包名，并确认该 deb 包所属的 apt 源，参考流程如下：
     - 在[debian.org](https://www.debian.org/distrib/packages)上通过文件名确认 deb 包名，注意需要在"Search the contents of packages"一节进行搜索；
     - 确认包名后，在[Ubuntu Launchpad](https://launchpad.net/ubuntu/+search)上搜索具体的包归属的源，确认 jammy/jammy-updates（S100）或 noble/noble-updates（S600）的 main/universe/multiverse 等 components 中有该包；
2. 知道需要的文件，且 host 端有安装过：
   - 可以通过`dpkg -S <filename>`命令获取包名。

## 7.6.5 自定义分区说明

<DocScope products="RDK S100">

RDK S100的分区定义文件保存在`source/bootloader/device/rdk/s100/partition_config_files`文件夹下，默认使用的分区表为：`source/bootloader/device/rdk/s100/partition_config_files/s100-gpt.json`

</DocScope>
<DocScope products="RDK S600">

RDK S600的分区定义文件保存在`source/bootloader/device/rdk/s600/partition_config_files`文件夹下，默认使用的分区表为：`source/bootloader/device/rdk/s600/partition_config_files/s600-gpt.json`

</DocScope>

<DocScope products="RDK S100">

```json
{
	"global": {
		"antirollbackUpdate_host": true,
		"antirollbackUpdate_hsm": false,
		"ab_sync": false,
		"backup_dir": "/tmp/ota/backup",
		"AB_part_a": "_a",
		"AB_part_b": "_b",
		"BAK_part_bak": "_bak"
	},
	"fpt": "fpt_common",                //------------------//
	"recovery": "recovery_common",      //                  //
	"misc": "misc_common",              //                  //
	"HB_APDP":"HB_APDP_common",         //                  //
	"keystorage": "keystorage_common",  //                  //
	"HSM_FW": "HSM_FW_common",          //  miniboot_flash  //
	"HSM_RCA": "HSM_RCA_common",        //                  //
	"keyimage": "keyimage_common",      //                  //
	"SBL": "SBL_common",                //                  //
	"scp": "scp_common",                //                  //
	"spl": "spl_common",                //                  //
	"MCU": "MCU_common",                //------------------//

	"quickboot": "quickboot_common",    //------------------// //------------------//
	"veeprom": "veeprom_common",        //                  // //                  //
	"ubootenv": "ubootenv_common",      //                  // //                  //
	"acore_cfg": "acore_cfg_common",    //   miniboot_emmc  // //                  //
	"bl31": "bl31_common",              //                  // //     emmc_disk    //
	"optee": "optee_common",            //                  // //                  //
	"uboot": "uboot_common",            //------------------// //                  //
	"boot": "boot_common",                                     //                  //
	"ota": "ota_common",                                       //                  //
	"log": "log_common",                                       //                  //
	"userdata": "userdata_common",                             //                  //
	"system": "system_common"                                  //------------------//
}
```

</DocScope>
<DocScope products="RDK S600">

```json
{
	"global": {
		"antirollbackUpdate_host": true,
		"antirollbackUpdate_hsm": false,
		"ab_sync": false,
		"backup_dir": "/tmp/ota/backup",
		"AB_part_a": "_a",
		"AB_part_b": "_b",
		"BAK_part_bak": "_bak"
	},
	"fpt": "fpt_common",                //------------------//
	"recovery": "recovery_common",      //                  //
	"misc": "misc_common",              //                  //
	"HB_APDP":"HB_APDP_common",         //                  //
	"keystorage": "keystorage_common",  //                  //
	"HSM_FW": "HSM_FW_common",          //  miniboot_flash  //
	"HSM_RCA": "HSM_RCA_common",        //                  //
	"keyimage": "keyimage_common",      //                  //
	"SBL": "SBL_common",                //                  //
	"spl": "spl_common",                //                  //
	"MCU": "MCU_common",                //------------------//

	"quickboot": "quickboot_common",    //------------------// //------------------//
	"veeprom": "veeprom_common",        //                  // //                  //
	"ubootenv": "ubootenv_common",      //                  // //                  //
	"acore_cfg": "acore_cfg_common",    //   miniboot_emmc  // //                  //
	"bl31": "bl31_common",              //                  // //     emmc_disk    //
	"optee": "optee_common",            //                  // //                  //
	"uboot": "uboot_common",            //------------------// //                  //
	"boot": "boot_common",                                     //                  //
	"ota": "ota_common",                                       //                  //
	"log": "log_common",                                       //                  //
	"userdata": "userdata_common",                             //                  //
	"system": "system_common"                                  //------------------//
}
```

</DocScope>


### 默认镜像及分区介绍
1. miniboot_flash：保存在 RDK Nor Flash 上的基础启动镜像，包括 HSM/MCU0等系统组件的镜像；
2. miniboot_emmc：保存在 RDK eMMC 上的基础启动镜像，包括 BL31/Uboot 等系统组件的镜像；
3. emmc_disk：RDK eMMC 上的完整镜像，会包含 miniboot_emmc，编译时会自动转换为安卓 Sparse 镜像（[安卓Sparse镜像说明（第三方网站，仅供参考）](https://www.2net.co.uk/tutorial/android-sparse-image-format)）以减小系统储存空间占用；

### 配置文件说明
整体分区表的配置分为全局共享配置和分区单独配置，其中全局共享配置放在"global"字段中，这是对所有分区都有效的配置。
**支持的全局参数：**
- `antirollbackUpdate_host`：是否更新 host 的 anti-rollback 版本，true 或 false；
- `antirollbackUpdate_hsm`：是否更新 hsm 的 anti-rollback 版本，true 或 false；
- `ab_sync`：地瓜内部 reserved 字段；
- `backup_dir`：hsm 备份目录；
- `AB_part_a`：AB 分区的 A 分区后缀；
- `AB_part_b`：AB 分区的 B 分区后缀；
- `BAK_part_bak`：备份分区后缀；

分区单独配置使用"分区名"："分区配置类型"的形式，可以根据需要选择不同的分区配置类型。 例如：boot 分区就需要首先在分区全局配置中添加 boot 分区的描述，然后在对应的 sub_config 文件夹中创建`boot.json`，并在其中定义`boot_common`：

<DocScope products="RDK S100">

在`source/bootloader/device/rdk/s100/partition_config_files/sub_config`文件夹中创建`boot.json`：

</DocScope>
<DocScope products="RDK S600">

在`source/bootloader/device/rdk/s600/partition_config_files/sub_config`文件夹中创建`boot.json`：

</DocScope>

```json
{
	"boot_common": {
		"components":[
			"${TARGET_DEPLOY_DIR}/rootfs/boot/:60m"
		],
		"pre_cmd": [
			"pack_boot.sh;[ $? -ne 0 ] && exit 1;rm -rf ${TARGET_DEPLOY_DIR}/rootfs/boot/System.map*"
		],
		"post_cmd": [
			"pack_avb_img.sh boot boot"
		],
		"fs_type": "ext4",
		"medium": "emmc",
		"ota_is_update": false,
		"ota_update_mode": "image",
		"part_type": "AB",
		"part_type_guid": "C12A7328-F81F-11D2-BA4B-00A0C93EC93B",
		"size": "60m"
	},
	"boot_ota": {
		"components":[
			"${TARGET_DEPLOY_DIR}/rootfs/boot/:60m"
		],
		"pre_cmd": [
			"pack_boot.sh;[ $? -ne 0 ] && exit 1;rm -rf ${TARGET_DEPLOY_DIR}/rootfs/boot/System.map*"
		],
		"post_cmd": [
			"pack_avb_img.sh boot boot"
		],
		"fs_type": "ext4",
		"medium": "emmc",
		"ota_is_update": true,
		"ota_update_mode": "image",
		"part_type": "AB",
		"part_type_guid": "C12A7328-F81F-11D2-BA4B-00A0C93EC93B",
		"size": "60m"
	}
}
```
**支持的分区参数：**
- `depends`：表示分区依赖关系，当前分区的制作需要依赖哪些分区制作完成，列表的形式，在其中添加依赖的分区名；
- `components`：表示当前分区需要包含哪些内容，可以是子镜像路径或文件目录，文件目录会做成文件系统，当前支持的文件系统有 ext4和 fat16，在路径后使用":"表示当前这一部分在分区中所占的大小。子镜像可以为多个，子镜像建议放在 out/xxx/deploy 下的对应分区的目录中；
- `components_nose`：非安全启动镜像组件；
- `pre_cmd`：在根据 component 内容制作镜像以前需要执行的命令；
- `post_cmd`：在根据 component 内容制作完镜像之后需要执行的命令；
- `fs_type`：镜像类型，None/ext4/fat16/misc；
- `medium`：镜像位于 emmc/nor；
- `ota_is_update`：全量 ota 包是否包含；
- `ota_update_mode`：分区的 OTA 升级方式；image 为镜像升级，默认值，image_diff 为镜像差分；
- `is_rootfs`：是否是 rootfs 分区；
- `part_type`：分区类型，当前支持 AB，BAK，PERMANENT；
- `size`：表示分区的大小，单位可以是 k, m, g；
- `magic`：表示分区的 magic，只针对添加 flash 镜像头的分区镜像有效；
- `have_anti_ver`：当前分区镜像中是否包含 antirollback 版本，true 或 false；
- `load_addr`：表示镜像的加载地址，只针对添加 flash 镜像头的分区镜像有效；
- `entry_addr`：表示镜像的入口地址，只针对添加 flash 镜像头的分区镜像有效；
- `nose_support`：非安全启动镜像支持；

:::info 提示
1. JSON 文件中的分区顺序即为板端实际分区顺序；
2. 分区大小需要根据该分区所属储存介质的扇区大小做对齐；
:::

### 分区修改说明

<DocScope products="RDK S100">
RDK S100支持变更 eMMC/UFS 上的分区，只需添加或删除或修改分区配置对应的分区字段。对于 flash 分区，如有变更需求，请联系地瓜。
</DocScope>
<DocScope products="RDK S600">
RDK S600支持变更 eMMC/UFS 上的分区，只需添加或删除或修改分区配置对应的分区字段。对于 flash 分区，如有变更需求，请联系地瓜。
</DocScope>

:::warning 分区修改注意事项
1. 分区表中，`log`及其以前的分区为启动分区，原则上不建议修改。
2. 其他分区，如`userdata`，`system`等，可以自由调整大小，如果新增分区，注意调整`fstab`文件以确保分区被正常挂载；
:::

分区表修改后，需要经过以下步骤生效：
1. 构建 hobot-miniboot deb 包：
	```shell
	# In RDK Source Root Directory
	./mk_debs.sh hobot-miniboot
	```
2. 本地构建镜像：
	```shell
	# In RDK Source Root Directory
	sudo ./pack_image.sh -l
	```
## 7.6.6 emmc/ufs/NVMe 镜像编译须知
### 使用地瓜自带 ubuntu-22.04_desktop_rdk-s100_XXX.conf 说明
针对 eMMC、UFS 和 NVMe 存储介质，其对应的驱动程序通过不同的配置变量进行区分。因此，在编译前需根据实际使用的存储颗粒，对编译配置文件进行相应修改。

以 S100平台为例，必须修改以下两个配置文件：
1. /build_params/ubuntu-22.04_desktop_rdk-s100_beta.conf
2. /build_params/ubuntu-22.04_desktop_rdk-s100_release.conf

在这两个文件中，将`RDK_DISK_MEDIUM`变量的值设置为与实际存储颗粒对应的类型：

```shell
# 对应emmc颗粒
export RDK_DISK_MEDIUM="emmc"

# 对应ufs颗粒
export RDK_DISK_MEDIUM="ufs"

# 对应NVMe
export RDK_DISK_MEDIUM="nvme"
```

### 使用自己编写的 conf 文件说明
如果客户自己写了 conf 文件，需要进行2步操作：
1. 文件中要带有`RDK_DISK_MEDIUM`变量，并将`RDK_DISK_MEDIUM`变量的值设置为与实际存储颗粒对应的类型：
```shell
# 对应emmc颗粒
export RDK_DISK_MEDIUM="emmc"

# 对应ufs颗粒
export RDK_DISK_MEDIUM="ufs"

# 对应NVMe
export RDK_DISK_MEDIUM="nvme"
```
2. 修改 S100编译系统中5处引用到 conf 文件的地方，以 release 版本为例，
- `download_deb_packages.sh`：
```shell
  DEFAULT_CONFIG="${HR_LOCAL_DIR}/build_params/ubuntu-22.04_desktop_rdk-s100_release.conf"
```
- `download_samplefs.sh`：
```shell
  DEFAULT_CONFIG="${HR_LOCAL_DIR}/build_params/ubuntu-22.04_desktop_rdk-s100_release.conf"
```
- `mk_kernel.sh`：
```shell
  DEFAULT_CONFIG="${HR_LOCAL_DIR}/build_params/ubuntu-22.04_desktop_rdk-s100_release.conf"
```
- `pack_image.sh`：
```shell
  DEFAULT_CONFIG="${HR_LOCAL_DIR}/build_params/ubuntu-22.04_desktop_rdk-s100_release.conf"
```
- `mk_uboot.sh`：
```shell
  DEFAULT_CONFIG="${HR_LOCAL_DIR}/../../build_params/ubuntu-22.04_desktop_rdk-s100_release.conf"
```

### 修改完 conf 文件后的编译流程
修改完之后，进行编译 uboot/spl 并更新 miniboot/bootloader，并整体编译
```shell
# cd到源码根目录，做hobot-miniboot deb包
./mk_debs.sh hobot-miniboot # deb包的生成路径是out/product/deb_packages/hobot-miniboot_4.0.Z-xxx_arm64.deb

# 编译disk镜像
sudo ./pack_image.sh -l  #编译时使用本地的deb包，一定要加 -l 才是编译使用本地的包，否则使用的是远端包。
```

:::warning NVMe 启动注意事项
- 仅在 RDKS100 V0P6及其以上版本支持 NVMe 启动，板子上[D13:D12]设置为[1:0]
- 在 NVMe 模式下编译出的 miniboot_flash 镜像，仅支持 NVMe 启动，其他模式均不支持；在 eMMC/UFS 模式下编译出的 miniboot_flash 镜像，支持 NVMe 启动
- 下载工具1.1.10及其以后版本，才支持 NVMe 镜像烧写
:::
