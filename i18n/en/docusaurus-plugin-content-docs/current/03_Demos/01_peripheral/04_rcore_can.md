---
title: "CAN Application"
sidebar_position: 4
description: "CAN bus send/receive examples on RDK S100/S600, no system code modification required"
---

# CAN Application

This example demonstrates sending and receiving data over the CAN bus on the RDK development board, without modifying system code. Two approaches are provided on the board: a HAL-based CAN example and a SocketCAN-based example.

> For CAN driver debugging, see [CAN Driver Development](../../07_Advanced_development/11_mcu_development/09_mcu_can.md).

## Environment Preparation

- The development board has RDK OS flashed and booted
- The CAN bus is connected (CAN_H/CAN_L + common ground)
- If using a CAN analyzer, it is connected and the baud rate is configured

## Code Location

On-board path: `/app/Can/`

```text
Can/
├── can_get/         # HAL approach: receive CAN data
├── can_send/        # HAL approach: send CAN data
├── can_multi_ch/    # HAL approach: multi-channel send/receive
└── socketcan/       # SocketCAN approach: stress test
```

Source code path: `2-rdk_s600_source_code/source/hobot-io-samples/debian/app/Can/` (S600) or `1-rdk_s100_source_code/source/hobot-io-samples/debian/app/Can/` (S100).

> The sample directories differ slightly between S100 and S600: S100 uses `can_fast_bidir` while S600 uses `socketcan`; the rest (`can_get`/`can_send`/`can_multi_ch`) are the same.

## Build and Run

### HAL Approach

```bash
# Send (target is the IPCF channel name, default bypass; canid is the CAN channel number)
cd /app/Can/can_send
make
./canhal_send bypass 2

# Receive
cd /app/Can/can_get
make
./canhal_get bypass

# Multi-channel
cd /app/Can/can_multi_ch
make
./can_multi_ch
```

Parameter description for the HAL approach examples:

- `canhal_send <target> <canid>`: `target` is the IPCF channel name (corresponds to `bypass` configured in `config/ipcf_channel.json`), `canid` is the CAN channel number.
- `canhal_get <target>`: the receiving side only needs to specify `target`.
- `can_multi_ch` supports parameters such as `-t <can_type>` (0 standard frame / 1 extended frame / 2 FD standard frame / 3 FD extended frame), `-l <can_length>` (8 / 64) and `-n <frame count>`, e.g. `./can_multi_ch -t 2 -l 64 -n 5`.

### SocketCAN Approach

SocketCAN uses the standard Linux Socket interface and requires no dedicated HAL:

```bash
cd /app/Can/socketcan
make
sudo ./can_stress -i can0 -f 1 -l 64 -t 0x100 -r 0x100 -p 1 -w 1000 -L -D 60
```

A Python version is also available (parameter semantics are the same as the C version):

```bash
sudo python3 can_stress.py -i can0 -f 1 -l 64 -t 0x100 -r 0x100 -p 1 -w 1000 -L -D 60 -S 1
```

:::tip SocketCAN

- The SocketCAN approach is compatible with standard Linux CAN tools (`cansend`, `candump`), with no extra API learning cost.
- Before running, the CAN module must be loaded and the CAN interface configured (e.g. `ip link set can0 ...`); see `socketcan/README.md` for the specific steps and parameters.

:::

## Code Walkthrough

### HAL Approach (`can_get`/`can_send`)

- `can_get.c` — calls the CAN HAL interfaces to initialize the CAN channel and reads CAN frames in a loop
- `can_send.c` — calls the CAN HAL interfaces to initialize the CAN channel and sends CAN frames
- `can_multi_ch/main.cpp` — simultaneous send/receive on multiple channels

### SocketCAN Approach (`socketcan/can_stress.c`)

- Uses the standard Linux Socket API (`socket`/`bind`/`read`/`write`); the CAN controller is mapped to the `can0`/`can1` network interfaces

## Runtime Result

Running the HAL send example `./canhal_send bypass 2` produces the following output (the IPCF channel is initialized successfully; if the peer MCU/receiver is not connected, sending returns an error code):

```text
root@drobot:/app/Can/can_send# ./canhal_send bypass 2
group name is bypass
[INFO][hb_ipcf_hal.cpp] [channel] bypass [ins] 0 [id] 4 init success.
[INFO][hb_ipcf_hal.cpp] [channel] bypass [ins] 0 [id] 4 config success.
[CANHAL][ERROR] HorizonHal_IPCF_Send of id:0 failed, ret is -14
canSendMsgFrame failed ret: -14
Send end, send package total: 1 frame total: 1
```

- After `can_send` sends a CAN frame, the `can_get` side can receive the corresponding data
- In the SocketCAN approach, `candump can0` can be used to verify reception

## FAQ

### Send Fails With "canSendMsgFrame failed ret: -14"

**Symptom**: The HAL send example prints `[CANHAL][ERROR] HorizonHal_IPCF_Send ... failed` and `canSendMsgFrame failed ret: -14`.

**Cause**: The peer MCU/receiver is not connected.

**Solution**: Confirm the CAN bus is connected (CAN_H/CAN_L plus common ground), and the receiver is ready.

### SocketCAN Cannot Send or Receive Data

**Symptom**: The SocketCAN example cannot send or receive CAN data normally.

**Cause**: The CAN module was not loaded and the CAN interface was not configured before running.

**Solution**: Load the CAN module and configure the CAN interface first (e.g. `ip link set can0 ...`); see `socketcan/README.md` for the specific steps and parameters.

## Related Documentation

- [CAN Driver Development](../../07_Advanced_development/11_mcu_development/09_mcu_can.md)
- [C/C++ Demo Programming Guide](../04_demo_support/02_c_cpp_build.md)
