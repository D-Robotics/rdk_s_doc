---
sidebar_position: 11
---

# 7.5.12 Eth User Guide

```mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import DocScope from '@site/src/components/DocScope';
```

## Overview

### Hardware Features

- Maximum data transfer rate: 1000 Mbps

- Supports full-duplex flow control (including IEEE 802.3x Pause packets and Priority flow control)

- Supports network statistics

- Supports Ethernet frame timestamps defined by IEEE 1588-2002/1588-2008

- Supports PPS (pulse-per-second) output

- Supports programmable Ethernet frame length, up to 16 KB

### Assumptions and Limitations

<DocScope products="RDK S100">
- Up to 6 FIFOs are supported in each of the transmit and receive directions.
</DocScope>
<DocScope products="RDK S600">
- Up to 8 FIFOs are supported in each of the transmit and receive directions.
</DocScope>
- Data larger than the available buffer size of the controller in use cannot be transmitted. Larger data must be transmitted using the Internet Protocol (IP) and Transmission Control Protocol (TCP).

- The length of a single received frame (including the 14-byte Ethernet header and 4-byte FCS) must be less than or equal to the configured RX buffer length.

- Module clock frequency is 250 MHz; PTP clock period is 20 ns.

## Code Paths

<DocScope products="RDK S100">
- `McalCdd/Ethernet/inc` — Header files
- `McalCdd/Ethernet/src/Eth.c` — Public API interface
- `McalCdd/Ethernet/src/Eth_Interrupt.c` — Interrupt callback handler interface
- `McalCdd/Ethernet/src/Mac_Lld.c` — Register control interface wrapper for API calls
- `Config/McalCdd/gen_s100_sip_B_mcu1/Ethernet/src/Eth_PBcfg.c` — Eth post-build configuration for public API initialization
- `Config/McalCdd/gen_s100_sip_B_mcu1/Ethernet/src/Mac_Ip_PBcfg.c` — MAC driver post-build configuration; static dependency of `Eth_PBcfg.c`
- `samples/Eth/Eth_Test/Eth_test.c` — Eth functional test sample
</DocScope>
<DocScope products="RDK S600">
- `McalCdd/Ethernet/inc` — Header files
- `McalCdd/Ethernet/src/Eth.c` — Public API interface
- `McalCdd/Ethernet/src/Eth_Interrupt.c` — Interrupt callback handler interface
- `McalCdd/Ethernet/src/Mac_Lld.c` — Register control interface wrapper for API calls
- `Config/McalCdd/gen_s600_md_mcu1/Ethernet/src/Eth_PBcfg.c` — Eth post-build configuration for public API initialization
- `Config/McalCdd/gen_s600_md_mcu1/Ethernet/src/Mac_Ip_PBcfg.c` — Eth post-build configuration for public API initialization
- `samples/Eth/Eth_Test/Eth_test.c` — Eth functional test sample
</DocScope>

## Application Sample

The following uses `samples/Eth/Eth_Test/Eth_test.c` sending an ARP packet as an example:

### Data Transmission

The `Eth_test.c` test program sends a constructed ARP packet. Use Wireshark on a PC to capture packets and verify that data is received correctly. IP addresses are fixed by default and cannot be modified dynamically.

```
0xd4, 0xfd, 0x9b, 0xae, 0x48, 0xf5, //Sender MAC address: d4:fd:9b:ae:48:f5  //MCU
0xC0, 0xA8, 0x01, 0x32,             //Sender IP address: 192.168.1.50
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, //Target MAC address: 00:00:00:00:00:00  //PC
0xC0, 0xA8, 0x01, 0xf,             //Target IP address: 192.168.1.15
```

- Pseudocode call flow

```
Eth_ProvideTxBuffer // Allocate buffer
Eth_Transmit // Send data
Eth_TxConfirmation // Release buffer
```

- Test procedure

After system startup, only Eth initialization is completed by default. Data transmission steps:

```
# Enable periodic EthTest_Mainfunc calls
setvar Eth_Test 1

# eth up
setvar eth_contrMode 1
setvar eth_testCase 3

# Send ARP packet
setvar eth_testCase 14
```

### Data Reception

Print received packets through the serial port in `EthIf_RxIndication`. Reference:

```
if(eth_getIngressTsFlag)
{
    eth_getIngressTsFlag = FALSE;
    /* QT-S01-API-60105 QT-S01-API-60106 QT-S01-API-60107 QT-S01-API-60194 */
    Eth_GetIngressTimeStamp(CtrlIdx,DataPtr,&Eth_TimeQual,&Eth_TimeStamp);
    //LogSync("Ingress timestamp quality: %s\r\n", (Eth_TimeQual==ETH_VALID)?"ETH_VALID":"ETH_INVALID");
    //LogSync("Ingress timestamp: %ds: %dns\r\n", ((uint32)(Eth_TimeStamp.secondsHi) << 16) + Eth_TimeStamp.seconds, Eth_TimeStamp.nanoseconds);
    if(Eth_TimeStamp.secondsHi!=0 || Eth_TimeStamp.nanoseconds!=0)
    {
        eth_checkIngressTsFlg=TRUE;
    }
}

if (count % 100 == 0) {
    LogSync("Eth packet is received, FrameType: %x, IsBroadcast: %s\r\n", FrameType, (IsBroadcast==TRUE)?"TRUE":"FALSE");
    LogSync("DstMac: %x-%x-%x-%x-%x-%x\r\n", *(DataPtr-14),*(DataPtr-13),*(DataPtr-12),*(DataPtr-11),*(DataPtr-10),*(DataPtr-9));
    LogSync("SrcMac: %x-%x-%x-%x-%x-%x\r\n", PhysAddrPtr[0],PhysAddrPtr[1],PhysAddrPtr[2],PhysAddrPtr[3],PhysAddrPtr[4],PhysAddrPtr[5]);
}
count++;
if(FrameType==0x800)
{
    LogSync("IP header checksum:%x,%x\r\n",DataPtr[10],DataPtr[11]);
    if(DataPtr[9]==0x11)//UDP
    {
        LogSync("UDP checksum:%x,%x\r\n",DataPtr[26],DataPtr[27]);
        eth_checkCksFlg=TRUE;
    }
    else if(DataPtr[9]==0x6)//tcp
    {
        LogSync("TCP checksum:%x,%x\r\n",DataPtr[36],DataPtr[37]);
        eth_checkCksFlg=TRUE;
    }
}
```

### Important Notes

- The default data transfer mode is polling. In polling mode, after transmitting with `Eth_Transmit`, call `Eth_TxConfirmation` to release the allocated buffer.
- The PHY must be de-asserted from reset before `Eth_Init` to ensure successful initialization. Pull the PHY reset pin high before Eth initialization.

### Application Programming Interface

#### void Eth_Init( const Eth_ConfigType* CfgPtr )

```
Description：Initializes the Ethernet Driver.

Sync/Async: Synchronous
Parameters(in)
    CfgPtr: Points to the implementation specific structure
Parameters(inout)
    None
Parameters(out)
    None
Return value：None
```

#### Std_ReturnType Eth_SetControllerMode(uint8 CtrlIdx, Eth_ModeType CtrlMode)

```
Description：Enables / disables the indexed controller.

Sync/Async: Asynchronous
Parameters(in)
    CtrlIdx: Index of the controller within the context of the Ethernet Driver
    CtrlMode: ETH_MODE_DOWN: disable the controller; ETH_MODE_ACTIVE: enable the controller
Parameters(inout)
    None
Parameters(out)
    None
Return value：Std_ReturnType
    E_OK: success
    E_NOT_OK: controller mode could not be changed
```

#### Std_ReturnType Eth_GetControllerMode(uint8 CtrlIdx, Eth_ModeType* CtrlModePtr)

```
Description：Enables / disables the indexed controller.

Sync/Async: Synchronous
Parameters(in)
    CtrlIdx: Index of the controller within the context of the Ethernet Driver
Parameters(inout)
    CtrlModePtr: ETH_MODE_DOWN: disable the controller; ETH_MODE_ACTIVE: enable the controller
Parameters(out)
    None
Return value：Std_ReturnType
    E_OK: success
    E_NOT_OK: controller mode could not be obtained
```

#### void Eth_GetPhysAddr(uint8 CtrlIdx, uint8* PhysAddrPtr)

```
Description：Obtains the physical source address used by the indexed controller.

Sync/Async: Synchronous
Parameters(in)
    CtrlIdx: Index of the controller within the context of the Ethernet Driver
Parameters(inout)
    PhysAddrPtr: Physical source address (MAC address) in network byte order
Parameters(out)
    None
Return value：None
```

#### void Eth_SetPhysAddr(uint8 CtrlIdx, const uint8* PhysAddrPtr)

```
Description：Sets the physical source address used by the indexed controller.

Sync/Async: Synchronous
Parameters(in)
    CtrlIdx: Index of the controller within the context of the Ethernet Driver
    PhysAddrPtr: Pointer to memory containing the physical source address (MAC address) in network byte order
Parameters(inout)
    None
Parameters(out)
    None
Return value：None
```

#### Std_ReturnType Eth_GetCurrentTime(uint8 CtrlIdx, Eth_TimeStampQualType* timeQualPtr, Eth_TimeStampType* timeStampPtr)

:::info Note
Eth_GetCurrentTime may be called within an exclusive area.
:::

```
Description：Returns a time value out of the HW registers according to the capability of the HW. Is the HW resolution is lower than the Eth_TimeStampType resolution resp.range, than an the remaining bits will be filled with 0.

Sync/Async: Synchronous
Parameters(in)
    CtrlIdx: Index of the controller within the context of the Ethernet Driver
Parameters(inout)
    None
Parameters(out)
    timeQualPtr: Quality of HW time stamp, e.g. based on current drift
    timeStampPtr: Current time stamp
Return value：Std_ReturnType
    E_OK: success
    E_NOT_

```

#### BufReq_ReturnType Eth_ProvideTxBuffer(uint8 CtrlIdx, uint8 Priority, Eth_BufIdxType *BufIdxPtr, uint8 **BufPtr, uint16 *LenBytePtr)

```
Description：Provides access to a transmit buffer of the FIFO related to the specified priority.

Sync/Async: Synchronous
Parameters(in)
    CtrlIdx: Index of the controller
    Priority: Frame priority for transmit buffer FIFO selection
Parameters(inout)
    LenBytePtr: In: desired length in bytes, out: granted length in bytes
Parameters(out)
    BufIdxPtr: Index to the granted buffer resource. To be used for subsequent requests
    BufPtr: Pointer to the granted buffer
Return value：BufReq_ReturnType
    BUFREQ_OK: success
    BUFREQ_E_NOT_OK: development error detected
    BUFREQ_E_BUSY: all buffers in use
    BUFREQ_E_OVFL: requested buffer too large
```

#### Std_ReturnType Eth_Transmit(uint8 CtrlIdx, Eth_BufIdxType BufIdx, Eth_FrameType FrameType, boolean TxConfirmation, uint16 LenByte, const uint8* PhysAddrPtr)

```
Description：Description：Triggers transmission of a previously filled transmit buffer.

Sync/Async: Synchronous
Parameters(in)
    CtrlIdx: Index of the controller
    BufIdx: Index of the buffer resource
    FrameType: Ethernet frame type
    TxConfirmation: Activates transmission confirmation
    LenByte: Data length in byte
    PhysAddrPtr: Physical target address (MAC address) in network byte order
Parameters(inout)
    None
Parameters(out)
    None
Return value：Std_ReturnType
    E_OK: success
    E_NOT_OK: transmission failed
```

#### Void Eth_Receive(uint8 CtrlIdx, uint8 FifoIdx, Eth_RxStatusType* RxStatusPtr)

```
Description：Receive a frame from the related fifo.

Sync/Async: Synchronous
Parameters(in)
    CtrlIdx: Index of the controller
    FifoIdx: Specifies the related fifo
Parameters(inout)
    None
Parameters(out)
    RxStatusPtr: Indicates whether a frame has been received and if so, whether more frames are available for the related fifo.
Return value：None
```

#### void Eth_TxConfirmation(uint8 CtrlIdx)

```
Description：Triggers frame transmission confirmation.

Sync/Async: Synchronous
Parameters(in)
    CtrlIdx: Index of the controller
Parameters(inout)
    None
Parameters(out)
    None
Return value：None
```

#### Std_ReturnType Eth_EnableSnapshot(uint8 CtrlIdx, GMAC_PPS_SOURCE PpsSource)

```
Description：Set snapshot source.

Sync/Async: Asynchronous
Parameters(in)
    CtrlIdx: Index of the addresses ETH controller
    PpsSource: Index of the PPS Source
Parameters(inout)
    None
Parameters(out)
    None
Return value：Std_ReturnType
    E_OK: success
    E_NOT_OK: failed
```

#### Std_ReturnType Eth_GetSnapshotTime(uint8 CtrlIdx, Eth_TimeStampType * TimeStampPtr)

```
Description：Get snapshot time of PHC.

Sync/Async: Asynchronous
Parameters(in)
    CtrlIdx: Index of the addresses ETH controller
    TimeStampPtr: Snapshot Time of PHC
Parameters(inout)
    None
Parameters(out)
    None
Return value：Std_ReturnType
    E_OK: success
    E_NOT_OK: failed
```
