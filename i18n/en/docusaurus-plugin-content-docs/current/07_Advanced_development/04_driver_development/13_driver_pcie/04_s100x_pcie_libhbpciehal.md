---
sidebar_position: 4
title: "Introduction to PCIe User-Space High Level API"
description: "Introduction to PCIe User-Space High Level API"
---
# Introduction to PCIe User-Space High Level API

## Overview

`libhbpciehl` (PCIe High Level API, the `libhbpciehl.so` shared library) is built on top of the Low Level API (`libhbpcie.so`). It abstracts the general topic / subscribe / publish concepts and shields the hardware differences among different series of computing platforms, making it easier for users to use PCIe for data communication.

- **Positioning**: Sends and receives data (publish / subscribe) between RC and EP through topics.
- **Interface level**: This document covers the low-level API, which wraps the primitive layer of `libhbpcie.so` rather than the business encapsulation layer.
- **Applicable scenarios**: Large-block data communication over direct PCIe connections between two or more boards (such as moving images and feature maps).
- **Target Audience**: Developers in Mode 3 (business customers / deep teams) who need to operate the PCIe data channel directly.
- **Prerequisites**: PCIe link configuration and driver loading must be completed (see [PCIe Kernel Configuration](./03_s100x_pcie_sw_setup.md)), and you should be familiar with the [PCIe Software Architecture](./02_s100x_pcie_sw_arch.md).
- **Specifications**: Each topic is a full-duplex channel; the DMA transfer `weight` ranges from `1` to `31` (WRR weighted round-robin arbitration).
- **Compatibility**: Applies to Ultra/Super series hardware (including RDK S100/S600), starting from software version 0.1.0.

The main supported features are:

- Data sending (publish)
- Data receiving (subscribe)
- Send/Receive buffer management
  - Using built-in buffers
  - Using user-allocated buffers (requires physically contiguous addresses)

## API List

| Function | Description |
|---|---|
| `pcieInit` | Initializes topic resources and creates a handler |
| `pcieDeInit` | Releases the handler and the resources it requested |
| `pcieGetMaxTopicSize` | Gets the maximum number of supported topics |
| `pciePublish` | Sets publish mode |
| `pcieSubscribe` | Sets subscribe mode |
| `pcieGetMaxInnerBufSize` | Gets the maximum size of the built-in buffer |
| `pcieAllocInnerBuf` | Allocates a built-in send/receive buffer |
| `pcieRegisterUserBuf` | Registers a user buffer (requires physically contiguous addresses) |
| `pcieStartRecv` | Registers the receive callback and starts receiving data |
| `pcieSendData` | Sends data to the subscriber |

## Quick Example

The flow for the sender and receiver is shown in the figure below:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_s100/pcie/hl_process.png" alt="Diagram description" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

### Publisher(chip#0)

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

### Subscriber(chip#1)

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

## API Interface Description

All interfaces follow the same return value convention: returning `0` indicates success, and returning an error code greater than `0` indicates failure (see [Return Value Description](#return-value-description) for the error codes).

### pcieInit

**Function Declaration**

```c
pcieErrCode pcieInit(pcieHandler *ph, uint8_t chipID, uint8_t topicID);
```

**Description**

Initializes topic resources and creates a `pcieHandler` handle. This must be called before any other interface. Configuration file priority: first check the `HB_PCIE_HL_CONFIG_FILE` environment variable; if it is not set, auto-detect based on system information.

**Parameter Description**

| Parameter | Type | Description |
|---|---|---|
| ph | `pcieHandler *` | Output parameter, returns the created handler |
| chipID | `uint8_t` | ID of the peer chip to publish to or subscribe from |
| topicID | `uint8_t` | Topic ID, starting from 0 |

**Return Value**

`0` success; `>0` failure.

**Notes**

The same topic can only be published by one end and subscribed by another end at a time. Re-initializing the same topic returns `ERR_TOPIC_NOT_AVAILABLE`.

### pcieDeInit

**Function Declaration**

```c
pcieErrCode pcieDeInit(pcieHandler ph);
```

**Description**

Releases all resources requested by `pcieInit`.

**Parameter Description**

| Parameter | Type | Description |
|---|---|---|
| ph | `pcieHandler` | Handler returned by `pcieInit` |

**Return Value**

`0` success; `>0` failure.

### pcieGetMaxTopicSize

**Function Declaration**

```c
pcieErrCode pcieGetMaxTopicSize(pcieHandler ph, uint8_t *topicSize);
```

**Description**

Gets the maximum number of supported topics. Topic numbering starts from 0.

**Parameter Description**

| Parameter | Type | Description |
|---|---|---|
| ph | `pcieHandler` | Handler |
| topicSize | `uint8_t *` | Output parameter, returns the maximum number of topics |

**Return Value**

`0` success; `>0` failure.

### pciePublish

**Function Declaration**

```c
pcieErrCode pciePublish(pcieHandler ph, uint8_t weight);
```

**Description**

Sets the current handler to publish mode.

**Parameter Description**

| Parameter | Type | Description |
|---|---|---|
| ph | `pcieHandler` | Handler |
| weight | `uint8_t` | DMA transfer priority, range `1`~`31` |

**Return Value**

`0` success; `>0` failure.

**Notes**

The DMA controller uses weighted round-robin (WRR) arbitration to select the next service channel; the bandwidth of each transfer is shared according to its weight.

### pcieSubscribe

**Function Declaration**

```c
pcieErrCode pcieSubscribe(pcieHandler ph);
```

**Description**

Sets the current handler to subscribe mode.

**Parameter Description**

| Parameter | Type | Description |
|---|---|---|
| ph | `pcieHandler` | Handler |

**Return Value**

`0` success; `>0` failure.

### pcieGetMaxInnerBufSize

**Function Declaration**

```c
pcieErrCode pcieGetMaxInnerBufSize(pcieHandler ph, uint32_t *size);
```

**Description**

Gets the maximum size of the built-in buffer for use by `pcieAllocInnerBuf`.

**Parameter Description**

| Parameter | Type | Description |
|---|---|---|
| ph | `pcieHandler` | Handler |
| size | `uint32_t *` | Output parameter, returns the maximum size of the built-in buffer |

**Return Value**

`0` success; `>0` failure.

### pcieAllocInnerBuf

**Function Declaration**

```c
pcieErrCode pcieAllocInnerBuf(pcieHandler ph, uint32_t size,
                              void **virtualAddr, uint64_t *physAddr);
```

**Description**

Allocates a built-in buffer: it serves as the send buffer in publish mode and the receive buffer in subscribe mode.

**Parameter Description**

| Parameter | Type | Description |
|---|---|---|
| ph | `pcieHandler` | Handler |
| size | `uint32_t` | Buffer size |
| virtualAddr | `void **` | Output parameter, returns the virtual address |
| physAddr | `uint64_t *` | Output parameter, returns the physical address |

**Return Value**

`0` success; `>0` failure.

**Notes**

Choose either the built-in buffer or the user buffer; registering both returns `ERR_INNER_BUFFER_ALLOCED`.

### pcieRegisterUserBuf

**Function Declaration**

```c
pcieErrCode pcieRegisterUserBuf(pcieHandler ph, uint64_t physAddr,
                                uint32_t size);
```

**Description**

Uses a user-allocated buffer as the send or receive buffer.

**Parameter Description**

| Parameter | Type | Description |
|---|---|---|
| ph | `pcieHandler` | Handler |
| physAddr | `uint64_t` | Physical address of the user buffer (must be physically contiguous) |
| size | `uint32_t` | Buffer size |

**Return Value**

`0` success; `>0` failure.

### pcieStartRecv

**Function Declaration**

```c
pcieErrCode pcieStartRecv(pcieHandler ph, recvDataCallBack fun,
                          void *funData);
```

**Description**

Registers the receive callback function and starts receiving data from the publisher. The callback type is:

```c
typedef void (*recvDataCallBack)(pcieHandler ph, uint32_t size,
                                 void *privateData);
```

**Parameter Description**

| Parameter | Type | Description |
|---|---|---|
| ph | `pcieHandler` | Handler |
| fun | `recvDataCallBack` | Receive data callback function |
| funData | `void *` | Private data for the callback function, passed through during the callback |

**Return Value**

`0` success; `>0` failure.

**Notes**

During callback execution, the receive buffer is in the busy state; after the callback returns, it is restored to idle.

### pcieSendData

**Function Declaration**

```c
pcieErrCode pcieSendData(pcieHandler ph, uint32_t size);
```

**Description**

Sends data to the subscriber.

**Parameter Description**

| Parameter | Type | Description |
|---|---|---|
| ph | `pcieHandler` | Handler |
| size | `uint32_t` | Size of the data to send |

**Return Value**

`0` success; `>0` failure.

**Notes**

The send size cannot exceed the size of the allocated/registered buffer; otherwise `ERR_SEND_SIZE_INVALID` is returned.

## Return Value Description

`pcieErrCode` is defined as follows:

| Error Code | Description |
|---|---|
| `ERR_NONE` | Success |
| `ERR_PARAMETER_INVALID` | Invalid parameter |
| `ERR_HANDLER_INVALID` | Invalid handler |
| `ERR_CONFIG_FILE_NOT_EXIST` | Configuration file does not exist |
| `ERR_CONFIG_FILE_INVALID` | Invalid configuration file content |
| `ERR_CHIP_ID_INVALID` | Invalid chip ID |
| `ERR_CHIP_NOT_FOUND` | Chip not found in configuration |
| `ERR_CHIP_NOT_READY` | Chip not ready (not present on the PCI bus) |
| `ERR_OUT_OF_MEM` | Out of memory |
| `ERR_BAR_REQUEST_FAIL` | Failed to request BAR resources |
| `ERR_DMA_REQUEST_FAIL` | Failed to request DMA resources |
| `ERR_TOPIC_NOT_AVAILABLE` | Topic is already occupied |
| `ERR_TOPIC_ID_INVALID` | Invalid topic ID |
| `ERR_RECV_HANDLER_INSTALL_FAIL` | Failed to register the receive callback |
| `ERR_INNERBUF_NOT_READY` | Built-in buffer not ready |
| `ERR_IOMMU_MAP_FAIL` | IOMMU mapping failed |
| `ERR_MMAP_FAIL` | mmap failed |
| `ERR_OPERATION_INVALID` | Invalid operation |
| `ERR_FEATURE_NOT_SUPPORT` | Feature not supported |
| `ERR_SUBSCRIBE_NOT_EXIST` | Subscriber does not exist |
| `ERR_RECV_BUF_NOT_READY` | Receive buffer not allocated or not registered |
| `ERR_RECV_BUF_IN_BUSY` | Receive buffer in use |
| `ERR_MUTEX_INIT_FAIL` / `ERR_MUTEX_LOCK_FAIL` / `ERR_MUTEX_UNLOCK_FAIL` | Mutex initialization / locking / unlocking failed |
| `ERR_DMA_XFER_FAIL` | DMA transfer failed |
| `ERR_INTERRUPT_TRIGGER_FAIL` | Failed to trigger the interrupt |
| `ERR_USER_BUFFER_REGISTERED` | User buffer already registered |
| `ERR_INNER_BUFFER_ALLOCED` | Built-in buffer already allocated |
| `ERR_BUFFER_NOT_AVAILABLE` | Built-in or user buffer not ready |
| `ERR_SEND_SIZE_INVALID` | Invalid send size |
| `ERR_PTHREAD_OPERATION_FAIL` | Thread operation failed |
| `ERR_IOMMU_UNMAP_FAIL` | IOMMU unmapping failed |
| `ERR_INNERBUF_CACHE_FAIL` | Built-in buffer cache clean/invalid failed |

## Related Documentation

- [PCIe Software Architecture](./02_s100x_pcie_sw_arch.md)
- [PCIe Kernel Configuration](./03_s100x_pcie_sw_setup.md)
- [PCIe Hardware Specifications](./01_s100x_pcie_hw_guide.md)
- [Set Up the Development Environment](../../06_environment_build/01_environment_build.md)