---
sidebar_position: 1---

# 5.7.1.1 算法工具链 V3.7.0

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

<DocScope products="RDK S100">

:::info 版本说明
该版本对应系统软件 **4.0.5** 版本，用户可在板端执行 `cat /etc/version` 命令确认系统软件版本号。
:::

</DocScope>

<DocScope products="RDK S600">

:::info 版本说明
该版本对应系统软件 **5.1.0** 版本，用户可在板端执行 `cat /etc/version` 命令确认系统软件版本号。
:::

</DocScope>

## 工具包下载

### OE 开发工具包

**下载地址：**
```bash
wget https://d-robotics-aitoolchain.oss-cn-beijing.aliyuncs.com/oe/3.7.0/oe-package-3.7.0-s100-s600.tgz
```

### OE 用户手册


**在线阅读地址：**
👉 [https://toolchain.d-robotics.cc/](https://toolchain.d-robotics.cc/)

**下载地址：**
<!-- ```bash
wget -c ftp://oeftp@sdk.d-robotics.cc/oe_v3.2.0/s100~3.2.0-oe-doc.zip --ftp-password=Oeftp~123$%
```   -->

👉 [OE用户手册 3.7.0 版本下载](https://archive.d-robotics.cc/toolchain/oe-doc-3.7.0-s100-s600.zip)

## Docker 镜像

### CPU Docker

**下载地址：**

方法1. 登录地瓜 Registry 服务器在线拉取镜像

```bash
docker login -u "ccr\$deliver-ronly" registry.d-robotics.cc -p 'VLaeatrjF9yGf6I44trT74zKhUpZSVlr'
docker pull registry.d-robotics.cc/deliver/ai_toolchain_ubuntu_22_s100_s600_cpu:v3.7.0
```
方法2. 下载离线tar包

```bash
wget https://d-robotics-aitoolchain.oss-cn-beijing.aliyuncs.com/oe/3.7.0/ai_toolchain_ubuntu_22_s100_s600_cpu_v3.7.0.tar
```

### GPU Docker

**下载地址：**

方法1. 登录地瓜 Registry 服务器在线拉取镜像
```bash
docker login -u "ccr\$deliver-ronly" registry.d-robotics.cc -p 'VLaeatrjF9yGf6I44trT74zKhUpZSVlr'
docker pull registry.d-robotics.cc/deliver/ai_toolchain_ubuntu_22_s100_s600_gpu:v3.7.0
```
方法2. 下载离线 tar 包
```bash
wget https://d-robotics-aitoolchain.oss-cn-beijing.aliyuncs.com/oe/3.7.0/ai_toolchain_ubuntu_22_s100_s600_gpu_v3.7.0.tar
```

## 相关文档

- [5.7.2 LLM 工具链](/Advanced_development/algorithm_toolchain)
- [3.4.4 使用自己的模型](/Demos/demo_support/custom_model)
- [3.3 算法示例](/Demos/algorithm_demo/summary)
