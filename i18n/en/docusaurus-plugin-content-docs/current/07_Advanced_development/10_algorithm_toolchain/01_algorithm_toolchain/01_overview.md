---
sidebar_position: 1
---

# V3.7.0

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

<DocScope products="RDK S100">

:::info Version Notes
This version corresponds to system software version **4.0.5**. Users can confirm the system software version by running the `cat /etc/version` command on the board.
:::

</DocScope>

<DocScope products="RDK S600">

:::info Version Notes
This version corresponds to system software version **5.1.0**. Users can confirm the system software version by running the `cat /etc/version` command on the board.
:::

</DocScope>

## Toolkit Download

### OE Development Toolkit

**Download URL:**
```bash
wget https://d-robotics-aitoolchain.oss-cn-beijing.aliyuncs.com/oe/3.7.0/oe-package-3.7.0-s100-s600.tgz
```

### OE User Manual

**Online Reading URL:**
👉 [https://toolchain.d-robotics.cc/](https://toolchain.d-robotics.cc/)

**Download URL:**

👉 [OE User Manual V3.7.0 Download](https://archive.d-robotics.cc/toolchain/oe-doc-3.7.0-s100-s600.zip)

## Docker Images

### CPU Docker

**Download URL:**

Method 1: Log in to the Digua Registry server and pull the image online

:::info Note
This login account is a read-only public delivery account; the password is published with each release and can be used directly.
:::

```bash
docker login -u "ccr\$deliver-ronly" registry.d-robotics.cc -p 'VLaeatrjF9yGf6I44trT74zKhUpZSVlr'
docker pull registry.d-robotics.cc/deliver/ai_toolchain_ubuntu_22_s100_s600_cpu:v3.7.0
```
Method 2: Download the offline tar package

```bash
wget https://d-robotics-aitoolchain.oss-cn-beijing.aliyuncs.com/oe/3.7.0/ai_toolchain_ubuntu_22_s100_s600_cpu_v3.7.0.tar
```

### GPU Docker

**Download URL:**

Method 1: Log in to the Digua Registry server and pull the image online
```bash
docker login -u "ccr\$deliver-ronly" registry.d-robotics.cc -p 'VLaeatrjF9yGf6I44trT74zKhUpZSVlr'
docker pull registry.d-robotics.cc/deliver/ai_toolchain_ubuntu_22_s100_s600_gpu:v3.7.0
```
Method 2: Download the offline tar package
```bash
wget https://d-robotics-aitoolchain.oss-cn-beijing.aliyuncs.com/oe/3.7.0/ai_toolchain_ubuntu_22_s100_s600_gpu_v3.7.0.tar
```

## Related Documentation

- [LLM Toolchain](/Advanced_development/algorithm_toolchain/LLM_Toolchain)
- [Algorithm Toolchain V3.2.0 (legacy)](./02_v3_2_0.md)
- [Use Your Own Model](/Demos/demo_support/custom_model)
- [Algorithm Examples](/Demos/algorithm_demo/summary)
