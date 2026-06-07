# Introduction to PCIe User-Space High Level API

URL: https://developer.d-robotics.cc/rdk_s_doc/en/Advanced_development/linux_development/driver_development_super/driver_pcie/s100x_pcie_libhbpciehal

## Overview

The High Level API (libhbpciehl.so) is built on top of the Low Level API (libhbpcie.so). It abstracts the general concepts of topic / subscribe / publish, shielding the hardware differences among different series of Dijiang chips, allowing users to communicate data over PCIe more conveniently.

The main supported features include:

- Data sending (publish)
- Data receiving (subscribe)
- Send/Receive buffer management
- Using built-in buffers
- Using user-allocated buffers (requires physically contiguous addresses)

## API List

```c
pcieErrCode pcieInit(pcieHandler *ph, uint8_t chipID, uint8_t topicID);
pcieErrCode pcieDeInit(pcieHandler ph);
pcieErrCode pcieGetMaxTopicSize(pcieHandler ph, uint8_t *topicSize);
pcieErrCode pciePublish(pcieHandler ph, uint8_t weight);
pcieErrCode pcieSubscribe(pcieHandler ph);
pcieErrCode pcieGetMaxInnerBufSize(pcieHandler ph, uint32_t *size);
pcieErrCode pcieAllocInnerBuf(pcieHandler ph, uint32_t size, void **virtualAddr, uint64_t *physAddr);
pcieErrCode pcieRegisterUserBuf(pcieHandler ph, uint64_t physAddr, uint32_t size);
pcieErrCode pcieStartRecv(pcieHandler ph, recvDataCallBack fun, void *funData);
pcieErrCode pcieSendData(pcieHandler ph, uint32_t size);
```

## Usage Flow

The flow for the sender and receiver is shown in the following diagram:

![Diagram description](https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_s100/pcie/hl_process.png)
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
        pcieAllocInnerBuf(ph, &addr, &phys, size);
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
        pcieAllocInnerBuf(ph, &addr, &phys, size);
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
