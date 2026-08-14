---
sidebar_position: 4
title: "PCIe 用户态 High Level API 介绍"
description: "PCIe 用户态 High Level API 介绍"
---
# PCIe 用户态 High Level API 介绍

## 模块概述

`libhbpciehl`（PCIe High Level API，动态库 `libhbpciehl.so`）基于 Low Level
API（`libhbpcie.so`）封装，抽象出通用的 topic / subscribe / publish 概念，
屏蔽不同系列地瓜芯片的硬件差异，让用户能够更加便捷地使用 PCIe 进行数据通信。

- **功能定位**：在 RC 与 EP 之间通过 topic 进行数据收发（publish / subscribe）。
- **接口层级**：本篇为【底层 API】，基于 `libhbpcie.so` 的原语层封装，非业务封装层。
- **适用场景**：双板/多板 PCIe 直连进行大块数据通信（如图像、featuremap 搬运）。
- **适用读者**：模式 3 商业客户/深度团队，需要直接操作 PCIe 数据通道的开发者。
- **前置条件**：已完成 PCIe 链路配置与驱动加载（见
  [PCIe kernel 配置](./03_s100x_pcie_sw_setup.md)），并了解
  [PCIe 软件架构](./02_s100x_pcie_sw_arch.md)。
- **规格参数**：单条 topic 为全双工通道；DMA 传输 weight 取值范围 `1~31`（WRR 加权轮询仲裁）。
- **兼容性**：适用硬件 Ultra/Super 系列（含 RDK S100/S600），软件版本 0.1.0 起。

主要支持如下功能：

- 数据的发送（publish）
- 数据的接收（subscribe）
- 发送/接收 Buffer 的管理
  - 使用内建 buffer
  - 使用用户申请的 buffer（要求物理地址连续）

## API 清单

| 函数 | 功能 |
|---|---|
| `pcieInit` | 初始化 topic 资源，创建 handler |
| `pcieDeInit` | 释放 handler 及其申请的资源 |
| `pcieGetMaxTopicSize` | 获取支持的最大 topic 数量 |
| `pciePublish` | 设置为发布（publish）模式 |
| `pcieSubscribe` | 设置为订阅（subscribe）模式 |
| `pcieGetMaxInnerBufSize` | 获取内建 buffer 的最大尺寸 |
| `pcieAllocInnerBuf` | 申请内建发送/接收 buffer |
| `pcieRegisterUserBuf` | 注册用户 buffer（要求物理地址连续） |
| `pcieStartRecv` | 注册接收回调并开始接收数据 |
| `pcieSendData` | 发送数据给订阅方 |

## 快速示例

发送方和接收方的流程如下图：

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_s100/pcie/hl_process.png" alt="图片描述" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

### Publisher（chip#0）

```c
void main()
{
    uint32_t size;
    void *addr;
    uint64_t phys;
    pcieHandler ph;
    void *UserBuffer;
    uint64_t UserBufferPhys;

    /* connect chip1 topic0 */
    pcieInit(&ph, 1, 0);

    pciePublish(ph);

    if (useInnerBuffer) {
        pcieGetMaxInnerBufSize(ph, &size);
        pcieAllocInnerBuf(ph, size, &addr, &phys);
        /* fill user data to inner buffer */
        ...

    } else {
        /* prepare the User data */
        ...
        /* use data in user buffer */
        pcieRegisterUserBuf(ph, UserBufferPhys, size);
    }

    pcieSendData(ph, size);

    pcieDeInit(ph);

    return;
}
```

### Subscriber（chip#1）

```c
void recvDataHandler(pcieHandler ph, uint32_t RecvSize, void *pData)
{
    /* deal with the received data */
    ...
}

void main()
{
    void *pData;
    pcieHandler ph;
    uint32_t size;
    void *addr;
    uint64_t phys;

    /* connect chip0 topic0 */
    pcieInit(&ph, 0, 0);

    pcieSubscribe(ph);

    if (useInnerBuffer) {
        pcieGetMaxInnerBufSize(ph, &size);
        pcieAllocInnerBuf(ph, size, &addr, &phys);
    } else {
        /* alloc user buff */
        ...
        pcieRegisterUserBuf(ph, UserBufferPhys, size);
    }

    pcieStartRecv(ph, recvDataHandler, pData);

    /* wait for receiving data */
    while (1) {
        sleep(1);
    }

    pcieDeInit(ph);

    return;
}
```

## 接口详解

所有接口返回值统一遵循以下约定：返回 `0` 表示成功，返回大于 `0` 的错误码表示失败（错误码见[返回值说明](#返回值说明)）。

### pcieInit

**【函数原型】**

```c
pcieErrCode pcieInit(pcieHandler *ph, uint8_t chipID, uint8_t topicID);
```

**【功能描述】**

初始化 topic 资源，创建 `pcieHandler` 句柄。在调用其他接口前必须先执行。
配置文件优先级：先取环境变量 `HB_PCIE_HL_CONFIG_FILE`，未设置则根据系统信息
自动探测。

**【参数】**

| 参数 | 类型 | 说明 |
|---|---|---|
| ph | `pcieHandler *` | 输出参数，返回创建的 handler |
| chipID | `uint8_t` | 发布到或订阅自的对端芯片 ID |
| topicID | `uint8_t` | topic ID，从 0 开始 |

**【返回值】**

`0` 成功；`>0` 失败。

**【注意事项】**

同一个 topic 同一时刻只能被一端发布、一端订阅，重复初始化同一 topic 会返回 `ERR_TOPIC_NOT_AVAILABLE`。

### pcieDeInit

**【函数原型】**

```c
pcieErrCode pcieDeInit(pcieHandler ph);
```

**【功能描述】**

释放 `pcieInit` 申请的全部资源。

**【参数】**

| 参数 | 类型 | 说明 |
|---|---|---|
| ph | `pcieHandler` | `pcieInit` 返回的 handler |

**【返回值】**

`0` 成功；`>0` 失败。

### pcieGetMaxTopicSize

**【函数原型】**

```c
pcieErrCode pcieGetMaxTopicSize(pcieHandler ph, uint8_t *topicSize);
```

**【功能描述】**

获取支持的最大 topic 数量。topic 编号从 0 开始。

**【参数】**

| 参数 | 类型 | 说明 |
|---|---|---|
| ph | `pcieHandler` | handler |
| topicSize | `uint8_t *` | 输出参数，返回最大 topic 数量 |

**【返回值】**

`0` 成功；`>0` 失败。

### pciePublish

**【函数原型】**

```c
pcieErrCode pciePublish(pcieHandler ph, uint8_t weight);
```

**【功能描述】**

设置当前 handler 为发布（publish）模式。

**【参数】**

| 参数 | 类型 | 说明 |
|---|---|---|
| ph | `pcieHandler` | handler |
| weight | `uint8_t` | DMA 传输优先级，范围 `1~31` |

**【返回值】**

`0` 成功；`>0` 失败。

**【注意事项】**

DMA 控制器采用加权轮询（WRR）仲裁选择下一个服务通道，各传输带宽按 weight 加权共享。

### pcieSubscribe

**【函数原型】**

```c
pcieErrCode pcieSubscribe(pcieHandler ph);
```

**【功能描述】**

设置当前 handler 为订阅（subscribe）模式。

**【参数】**

| 参数 | 类型 | 说明 |
|---|---|---|
| ph | `pcieHandler` | handler |

**【返回值】**

`0` 成功；`>0` 失败。

### pcieGetMaxInnerBufSize

**【函数原型】**

```c
pcieErrCode pcieGetMaxInnerBufSize(pcieHandler ph, uint32_t *size);
```

**【功能描述】**

获取内建 buffer 的最大尺寸，供 `pcieAllocInnerBuf` 使用。

**【参数】**

| 参数 | 类型 | 说明 |
|---|---|---|
| ph | `pcieHandler` | handler |
| size | `uint32_t *` | 输出参数，返回内建 buffer 最大尺寸 |

**【返回值】**

`0` 成功；`>0` 失败。

### pcieAllocInnerBuf

**【函数原型】**

```c
pcieErrCode pcieAllocInnerBuf(pcieHandler ph, uint32_t size,
                              void **virtualAddr, uint64_t *physAddr);
```

**【功能描述】**

申请内建 buffer：publish 模式下作为发送 buffer，subscribe 模式下作为接收 buffer。

**【参数】**

| 参数 | 类型 | 说明 |
|---|---|---|
| ph | `pcieHandler` | handler |
| size | `uint32_t` | buffer 大小 |
| virtualAddr | `void **` | 输出参数，返回虚拟地址 |
| physAddr | `uint64_t *` | 输出参数，返回物理地址 |

**【返回值】**

`0` 成功；`>0` 失败。

**【注意事项】**

内建 buffer 与用户 buffer 二选一，二者都注册会返回 `ERR_INNER_BUFFER_ALLOCED`。

### pcieRegisterUserBuf

**【函数原型】**

```c
pcieErrCode pcieRegisterUserBuf(pcieHandler ph, uint64_t physAddr,
                                uint32_t size);
```

**【功能描述】**

使用用户申请的 buffer 作为发送或接收 buffer。

**【参数】**

| 参数 | 类型 | 说明 |
|---|---|---|
| ph | `pcieHandler` | handler |
| physAddr | `uint64_t` | 用户 buffer 物理地址（要求物理地址连续） |
| size | `uint32_t` | buffer 大小 |

**【返回值】**

`0` 成功；`>0` 失败。

### pcieStartRecv

**【函数原型】**

```c
pcieErrCode pcieStartRecv(pcieHandler ph, recvDataCallBack fun,
                          void *funData);
```

**【功能描述】**

注册接收回调函数，开始从发布方接收数据。回调类型为：

```c
typedef void (*recvDataCallBack)(pcieHandler ph, uint32_t size,
                                 void *privateData);
```

**【参数】**

| 参数 | 类型 | 说明 |
|---|---|---|
| ph | `pcieHandler` | handler |
| fun | `recvDataCallBack` | 接收数据回调函数 |
| funData | `void *` | 回调函数私有数据，回调时透传 |

**【返回值】**

`0` 成功；`>0` 失败。

**【注意事项】**

回调函数执行期间接收 buffer 处于 busy 状态，回调返回后恢复为 idle。

### pcieSendData

**【函数原型】**

```c
pcieErrCode pcieSendData(pcieHandler ph, uint32_t size);
```

**【功能描述】**

发送数据给订阅方。

**【参数】**

| 参数 | 类型 | 说明 |
|---|---|---|
| ph | `pcieHandler` | handler |
| size | `uint32_t` | 发送数据大小 |

**【返回值】**

`0` 成功；`>0` 失败。

**【注意事项】**

发送大小不能超过已申请/注册的 buffer 大小，否则返回 `ERR_SEND_SIZE_INVALID`。

## 返回值说明

`pcieErrCode` 定义如下：

| 错误码 | 描述 |
|---|---|
| `ERR_NONE` | 成功 |
| `ERR_PARAMETER_INVALID` | 参数无效 |
| `ERR_HANDLER_INVALID` | handler 无效 |
| `ERR_CONFIG_FILE_NOT_EXIST` | 配置文件不存在 |
| `ERR_CONFIG_FILE_INVALID` | 配置文件内容错误 |
| `ERR_CHIP_ID_INVALID` | chip ID 无效 |
| `ERR_CHIP_NOT_FOUND` | 配置中未找到该芯片 |
| `ERR_CHIP_NOT_READY` | 芯片未就绪（未出现在 PCI 总线上） |
| `ERR_OUT_OF_MEM` | 内存不足 |
| `ERR_BAR_REQUEST_FAIL` | 申请 BAR 资源失败 |
| `ERR_DMA_REQUEST_FAIL` | 申请 DMA 资源失败 |
| `ERR_TOPIC_NOT_AVAILABLE` | topic 已被占用 |
| `ERR_TOPIC_ID_INVALID` | topic ID 无效 |
| `ERR_RECV_HANDLER_INSTALL_FAIL` | 注册接收回调失败 |
| `ERR_INNERBUF_NOT_READY` | 内建 buffer 未就绪 |
| `ERR_IOMMU_MAP_FAIL` | IOMMU 映射失败 |
| `ERR_MMAP_FAIL` | mmap 失败 |
| `ERR_OPERATION_INVALID` | 操作无效 |
| `ERR_FEATURE_NOT_SUPPORT` | 功能不支持 |
| `ERR_SUBSCRIBE_NOT_EXIST` | 订阅方不存在 |
| `ERR_RECV_BUF_NOT_READY` | 接收 buffer 未申请或未注册 |
| `ERR_RECV_BUF_IN_BUSY` | 接收 buffer 使用中 |
| `ERR_MUTEX_INIT_FAIL` / `ERR_MUTEX_LOCK_FAIL` / `ERR_MUTEX_UNLOCK_FAIL` | 互斥锁初始化/加锁/解锁失败 |
| `ERR_DMA_XFER_FAIL` | DMA 传输失败 |
| `ERR_INTERRUPT_TRIGGER_FAIL` | 触发中断失败 |
| `ERR_USER_BUFFER_REGISTERED` | 用户 buffer 已注册 |
| `ERR_INNER_BUFFER_ALLOCED` | 内建 buffer 已申请 |
| `ERR_BUFFER_NOT_AVAILABLE` | 内建或用户 buffer 未就绪 |
| `ERR_SEND_SIZE_INVALID` | 发送大小无效 |
| `ERR_PTHREAD_OPERATION_FAIL` | 线程操作失败 |
| `ERR_IOMMU_UNMAP_FAIL` | IOMMU 解除映射失败 |
| `ERR_INNERBUF_CACHE_FAIL` | 内建 buffer cache clean/invalid 失败 |

## 相关文档

- [PCIe 软件架构](./02_s100x_pcie_sw_arch.md)
- [PCIe kernel 配置](./03_s100x_pcie_sw_setup.md)
- [PCIe 硬件规格](./01_s100x_pcie_hw_guide.md)
- [搭建开发环境](../../06_environment_build/01_environment_build.md)
