---
sidebar_position: 12
title: "Multi-Camera and Synchronization with Lidar"
description: "Multi-Camera and Synchronization with Lidar"
---

# Multi-Camera and Synchronization with Lidar

> **Level description**: This chapter covers the low-level multimedia API (the on-board Camera synchronization framework), explaining the multi-camera timestamp synchronization mechanism. It is intended for advanced developers who need to directly operate the multimedia pipeline (Mode 3). If you only need the encapsulated capture/codec/display functionality, see Chapter 4 [Simple API](/Simple_API/multimedia_api/cdev/vio_api) (Mode 1).

> **Platform codename note**: Compatibility annotations in this document follow the original wording of the underlying header files. XJ3/J3 and Ultra are earlier-generation upstream platform codenames; X5 denotes the current upstream product line (not these two boards); Super/J6 are the codenames of the architecture family shared by this product line (board-verified: S100/S600 share the same family, with S600 in a multi-core form). An `HW:` list indicates the interface's applicable range across upstream platform generations, where the Super generation corresponds to this product line (inherited from upstream annotations, not verified per-interface on board); `SW` is the upstream software version number — for RDK releases see the Release Notes. Interfaces without codenames are inherited from upstream and not individually verified on RDK.

## Overview

In multi-camera deployment scenarios, synchronization across multiple cameras is typically required to meet algorithmic or application needs. Additionally, synchronization with Lidar is often necessary, which can be achieved via methods such as ETH PPS.

On the S100 platform, the LPWM module is primarily used for camera triggering. It can generate PWM waveforms with configurable delay output to calibrate sensor exposure synchronization, and it supports multiple external trigger sources, enabling time synchronization with MCU or GPS devices.

This document focuses on the fundamental capabilities of the LPWM module, describing its principles and usage, and provides a typical synchronization scheme for multi-camera and Lidar scenarios for reference in practical projects.

:::info Note

This document is based on only one hardware connection scheme for Camera and Lidar, and provides a recommended scheme as reference. If other hardware is used, you can adapt it by referring to the configuration usage in this document.
:::

## Software Abstraction

### LPWM Module

LPWM is a PWM-like signal source, generally used in the camsys system to trigger sensor exposure. LPWM itself also requires external triggering. After receiving a trigger signal, it outputs a square wave with a frequency of 1Hz to 500KHz, an active high level of 0us to 4095us, and a default precision of 1us, according to the configured period, high-time, offset and other parameters.

The S100 has a total of 3 LPWM chips, and each LPWM chip has 4 LPWM channels. Configure them according to the actual hardware connection.

The camera synchronization feature on the S100 primarily relies on the LPWM module. It supports multiple trigger sources on the S100 and produces multi-channel configurable PWM signals that are output to external cameras (optionally forwarded via SerDes), thereby achieving synchronization between the trigger source and the cameras, as well as synchronization among all cameras.

The main points to note when using LPWM are:

- The channel configured for the actual hardware connection.
- The LPWM sync trigger source selection: supports MCU RTC/PPS0/PPS1/ETH PPS0/ETH PPS1/MCU ETH PPS, etc.
- The LPWM offset configuration based on the sync trigger source: it must be adapted according to frame rate requirements, PPS period, phase requirements, etc.
- The LPWM target signal waveform: period, duty_time, and other parameters.
- The LPWM extended features: slow synchronization threshold, adjust_step configuration.

### LPWM Sync Source

LPWM working principle: LPWM is triggered by a PPS trigger source. As the Target-side device on the Trigger Bus, each LPWM device can independently select its trigger source.

The process of transmitting the PPS signal to cam-trig is shown below. The PPS trigger connects to the LPWM module, triggering LPWM output, and the LPWM output connects to the camera:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/cam_sync/05_camera_sync_01.png" alt="PPS signal to cam-trig flow diagram" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

For more about the sync source PPS, refer to: [PPS Description](../../03_system_software/11_driver_timesync.md#PPS).

:::info Note

Notes on using LPWM trigger sources:

- Multiple external trigger sources are single-select; one LPWM module can only use one of them.
- Different LPWMs are synchronized through the external trigger source; they can be synchronized after selecting the same source.
- Different channels of the same LPWM module use the same trigger source but can configure different offset/period/duty parameters.
:::

### LPWM Configuration Item Description

1. trigger_mode [0, 1]: LPWM trigger mode. 0 is internal software trigger, 1 is external trigger.

2. trigger_source [0, 10]: LPWM trigger source. To use an external trigger source, set trigger_mode to 1. In general scenarios use 0; the trigger period defaults to 1s.

| trigger_source value | Corresponding trigger source |
|-------------------|-------------|
| 0                 | aon_rtc_pps |
| 1                 | reserve |
| 2                 | pps0 |
| 3                 | pps1 |
| 4                 | pps2 |
| 5                 | reserve |
| 6                 | pcie0_ptm_pps |
| 7                 | pcie1_ptm_pps |
| 8                 | acore_eth0_pps |
| 9                 | acore_eth1_pps |
| 10                | mcu_eth_pps |

3. period [2, 1000000)us: Period of the square wave output by LPWM.

4. offset [0, 1000000)us: Offset time of the first waveform in each trigger period of LPWM; must be smaller than the period value.

5. duty_time [0, 4096)us: Active high level time of the LPWM output waveform; must be smaller than the period value.

6. threshold [0, 65535]us: Slow synchronization threshold, an advanced feature that can generally be ignored.

7. adjust_step [0, 15]: Each adjustment time adjust_time = 2^adjust_step; an advanced feature that can generally be ignored.

### LPWM Configuration Calculation

The LPWM trigger source is PPS, with a common period of 1s. After receiving a trigger signal, LPWM first performs an offset time shift, then outputs a continuous square wave whose period and active level time are determined by the configuration. When the next trigger signal arrives, the offset and wave output repeat.

The offset setting depends on the sensor fps. If the fps is not divisible by 1s, an offset must be set; otherwise the offset is set to 0.

In a common scenario with a 30fps sensor, period should be set to 1s/fps = 33333us. After running 30 frames, the sensor reaches 999,990us, leaving a 10us gap to the next PPS trigger. Therefore the offset should be set to 10us (at least 10us, and at most period - duty_time us; to be safe, add 1 to the calculated offset), otherwise lpwm will emit 31 square waves within 1s.

Due to hardware or peripheral differences, the PPS may fall into the high-level region. If slow synchronization is disabled, or after slow synchronization succeeds, the high-level region must be traversed before entering the next trigger period (i.e., the offset is recalculated). In this case the number of LPWM waveforms within a trigger period may not reach the expected count, causing the sensor frame rate to fall short of expectations. You can increase the offset appropriately to ensure the PPS always falls in the low-level region and outputs the expected waveform.

```
Period = 1000000 / fps
Offset = 1000000 - Period * fps + 1
```

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/lpwm_01.png" alt="LPWM diagram" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

#### Recommended Configurations

| Scenario | trigger_source | trigger_mode | duty_time | offset | period |
|---------|----------------|--------------|-----------|--------|--------|
| All 30fps | 8(eth0)/9(eth1) | 1 | 100 | 11 | 33333 |
| All 25fps | 8(eth0)/9(eth1) | 1 | 100 | 11 | 40000 |
| 12.5/25fps | 8(eth0)/9(eth1) | 1 | 100 | 11 | 80000/40000 |
| 30/10fps | 8(eth0)/9(eth1) | 1 | 100 | 11 | 33333/100000 |

## Hardware Path

### Multi-Camera Synchronization Connection

For a single-S100 camera deployment, the typical connection is as follows:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/cam_sync/05_camera_sync_02.png" alt="Multi-camera synchronization connection diagram" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

Where:

- The S100 trigger source can come from an external GPS device or network ETH PPS.
- The MCU and S100 can also be synchronized.
- Different LPWMs within the same S100 can be synchronized by selecting the same sync source.
- Different DES can connect to different LPWM channels.
- SerDes can transparently forward the LPWM signal to the sensor side through the reverse channel on the Link cable, connecting it as FSYNC for sync triggering.

### Connection with Lidar

In scenarios that use Lidar, the connection scheme is as follows:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/cam_sync/05_camera_sync_03.png" alt="Lidar connection scheme diagram" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

Where:

- The S100 trigger source can come from an external GPS device or via methods such as network time synchronization.
- The Lidar device can align its clock to the same source as the S100 through corresponding time synchronization (e.g., gPTP).
- Camera synchronization is achieved by the S100 LPWM output triggering the DES, which then distributes to each camera for synchronized exposure/output.
- When camera data is input to the CIM module within the S100, a timestamp is stamped at the Frame Start moment to record that frame's time.

## Synchronization Scheme

### Camera and Lidar Time Alignment Requirements

For scenarios where Camera and Lidar are used together and must be synchronized, the general functional requirements are:

- Lidar and S100 are time-synchronized and work on the same time axis.
- Lidar can start periodic scanning on demand based on the synchronized time. Taking 10Hz (100ms period) as an example, it can start scanning at every whole hundred ms.
- The camera uses the synchronized-time PPS as the LPWM trigger source to trigger exposure/readout of each frame, aligning with the Lidar scan time. Here 30fps is used as an example.
- The camera image data timestamp must be on the same time axis as the Lidar data timestamp, with a certain alignment relationship for fusion.

The expected time alignment target is as follows:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/cam_sync/05_camera_sync_04.png" alt="Camera and Lidar time alignment target diagram" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

At each whole PPS second: LPWM outputs and exposes (if offset is 0), and Lidar starts scanning (if start is 0).

Here the software scheme adapts the hardware scheme connected by solid lines in the above connection diagram:

- The S100 and the Lidar device are both connected to a network switch and synchronized over the network.
- The Lidar scan frequency is 10Hz, starting at each whole hundred ms, with data carrying aligned timestamps.
- Multiple cameras connect to the S100 via SerDes, and are also connected to LPWM for triggering camera exposure synchronization.
- The LPWM trigger source uses the Acore ETH PPS0.

### LPWM Trigger Source Selection

The LPWM module has multiple trigger sources to choose from. For the above hardware connection, several sources are still available; refer to: [LPWM recommended configurations](#recommended-configurations).

This scheme uses Acore ETH PPS0 as the LPWM trigger source:

- It and the Lidar both use network synchronization, so the PHC time can be used as the unified time axis.
- Acore ETH PPS has the smallest error; it is recommended to use it first.

When using the Acore ETH PPS0 sync source in fixed mode, its rising edge has a fixed offset of 536.871ms relative to the whole PPS second, which must be taken into account when calculating and configuring the offset. For more, refer to: [Acore ETH PPS Description](../../03_system_software/11_driver_timesync.md#Acore\_Eth\_PPS).

### Camera Sync Mode Selection

Sensor exposure output generally has Master mode (actively outputs exposure; as long as streaming starts, frames are output automatically according to configuration) and Slave mode (waits for trigger exposure output; only outputs after triggering). For normal operation, Master mode is used by default, while Slave mode is used for synchronized output.

The following uses the AR0820 module as an example to describe Slave mode:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/cam_sync/05_camera_sync_05.png" alt="AR0820 module Slave mode timing diagram" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

The same slave mode also has multiple synchronization methods. The commonly used one is shutter sync: this mode outputs frames at a fixed time after triggering (guaranteeing FS timestamp alignment), and does not lose the trigger signal (i.e., if a trigger arrives during frame output, it is not ignored).

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/cam_sync/05_camera_sync_06.png" alt="shutter sync mode timing diagram" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

The configuration is as follows:

```
// See: source/hobot-camera/drivers/sensor/ar0820/inc/ar0820_setting.h
uint16_t ar0820_trigger_standard_setting[] = {
    //0x301A, 0x0058, // RESET_REGISTER_RESET,RESET_REGISTER_STDBY_EOF
    0x301A, 0x0958, // RESET_REGISTER_GPI_EN, FORCED_PLL_ON
    0x31C6, 0x2000, // MASK_FRAMER_STANDBY
    0x30B0, 0x8100, // PIXCLK_ON
    0x30CE, 0x0000, // TRIGGER STANDARD MODE
    0x30CE, 0x0000, // TRIGGER STANDARD MODE
};
uint16_t ar0820_trigger_shutter_sync_setting[] = {
    //0x301A, 0x0058, // RESET_REGISTER_RESET,RESET_REGISTER_STDBY_EOF
    0x301A, 0x095C, // RESET_REGISTER_GPI_EN, FORCED_PLL_ON, STREAM
    0x31C6, 0x2000, // MASK_FRAMER_STANDBY
    0x30B0, 0x8100, // PIXCLK_ON
    0x30CE, 0x0120, // TRIGGER SHUTTER SYNC MODE
    0x30CE, 0x0120, // TRIGGER SHUTTER SYNC MODE
};
uint16_t ar0820_trigger_gpio_setting[][8] = {
    {
        0x340A, 0x00EE, // GPIO0_INPUT_ENABLE
        0x340A, 0x00EE, // GPIO0_INPUT_ENABLE
        0x340C, 0x0002, // GPIO_ISEL
        0x340E, 0x2100, // GPIO_OSEL
    },
    {
        0x340A, 0x00DD, // GPIO1_INPUT_ENABLE
        0x340A, 0x00DD, // GPIO1_INPUT_ENABLE
        0x340C, 0x0008, // GPIO_ISEL
        0x340E, 0x2100, // GPIO_OSEL
    },
    {
        0x340A, 0x00BB, // GPIO2_INPUT_ENABLE
        0x340A, 0x00BB, // GPIO2_INPUT_ENABLE
        0x340C, 0x0020, // GPIO_ISEL
        0x340E, 0x2010, // GPIO_OSEL
    },
    {
        0x340A, 0x0077, // GPIO3_INPUT_ENABLE
        0x340A, 0x0077, // GPIO3_INPUT_ENABLE
        0x340C, 0x0080, // GPIO_ISEL
        0x340E, 0x0210, // GPIO_OSEL
    },
};
```

In actual use, enable the synchronization feature according to config_index (the sensor library must have a corresponding implementation).

:::info Note

The above is only an example for AR0820; other cameras are similar. The main configurations for camera synchronization here are:

- Slave mode: configure the module's SYNC mode according to actual requirements.
- FSYNC selection: according to the module's actual hardware connection, select a normal GPIO as FSYNC. Some modules include an ISP, in which case you only need to configure FSYNC and do not need to configure the sensor to Slave mode.
:::

For the camera FSYNC signal output, different modules may have different characteristics, such as:

- The FSYNC signal is only used to align exposure output and cannot control the frame rate, so the LPWM period must match the actual frame rate.
- It may be a pure Slave mode, where no frame is output without an FSYNC signal, or it may only be used for alignment, where frames are output even without FSYNC.
- Pay attention to the choice of sync mode: is it exposure sync or output sync?
- For exposure sync, the exposure moments are synchronized, and frames are read out immediately after exposure. The output time is affected by the exposure time, so the timestamps may not be completely consistent.
- For output sync, frames are read out at the same specified moment after exposure, which guarantees consistent timestamps. This scheme uses output sync.
- Different modules may have different exposure times, so the output timestamps may be inconsistent after synchronization.

### Synchronization Alignment Scheme

Based on the above hardware connection and software scheme, the synchronization scheme is as follows:

- Use Acore ETH PPS0 triggering.
- Lidar starts scanning at each whole hundred ms, with data carrying aligned timestamps.
- The camera (taking AR0820 as an example) uses SHUTTER SYNC output sync with auto exposure.
- Use the LPWM offset to adjust the phase to whole hundred ms. For example, at 30fps, offset=463.129ms modulo 33.333ms = 29.8ms.
- After the offset is correctly configured, the camera can output synchronously at whole hundred ms (every 3 frames), aligning with the Lidar data.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/cam_sync/05_camera_sync_07.png" alt="Camera and Lidar synchronization alignment scheme diagram" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

### Camera Configuration

The following is the synchronization configuration for a single AR0820:

```
{
     "deserial_0": {
     "deserial_name": "max96712",
     "deserial_addr": "0x29",
     "deserial_gpio": {
             "camerr_pin": [4, 6, 8, 10],
             "trig_pin": [5]
     },
     "poc": {
             "poc_addr": "0x28",
             "poc_map": "0x1320"
     }
 },
     "port_0": {
     "sensor_name": "ar0820std",
     "serial_addr": "0x41",
     "sensor_addr": "0x11",
     "eeprom_addr": "0x51",
     "sensor_mode": 5,
     "fps": 30,
     "width": 3840,
     "height": 2160,
     "extra_mode": 5,
     "config_index": 512,
     "deserial_index": 0,
     "deserial_port": 0
 }
}
```

The synchronization enable here is mainly completed by config_index bit9 (+512):

```
{
    "config_0":{
        "port_0":{
            "config_index":512,
        },
    }
}
```

The trig_pin under Deserial configures the MFP index to which LPWM connects on the hardware. The deserial library must support it, and it is configured in the json:

```
"deserial_gpio": {
        "trig_pin": [5]
},
```

- If one LPWM triggers multiple cameras simultaneously, only one index value is needed, such as MFP5: [5].
- If multiple LPWMs trigger different cameras separately, multiple index values corresponding to multiple Links are needed, such as MFP5-A, MFP14-B: [5,14].

### Trigger Configuration

LPWM configuration is done via json. An example configuration is as follows; for more, refer to: [LPWM Configuration Item Description](#lpwm-configuration-item-description):

```
{
    "lpwm_chn0": {
        "trigger_source": 8,
        "trigger_mode": 1,
        "period": 33333,
        "offset": 29800,
        "duty_time": 100,
        "threshold": 0,
        "adjust_step": 0
    },
    "lpwm_chn1": {
        "trigger_source": 8,
        "trigger_mode": 1,
        "period": 33333,
        "offset": 29800,
        "duty_time": 100,
        "threshold": 0,
        "adjust_step": 0
    },
    "lpwm_chn2": {
        "trigger_source": 8,
        "trigger_mode": 1,
        "period": 33333,
        "offset": 29800,
        "duty_time": 100,
        "threshold": 0,
        "adjust_step": 0
    },
    "lpwm_chn3": {
        "trigger_source": 8,
        "trigger_mode": 1,
        "period": 33333,
        "offset": 29800,
        "duty_time": 100,
        "threshold": 0,
        "adjust_step": 0
    }
}
```

If trigger_mode is set to 1 and trigger_source is set to 8, ETH PPS0 is used for synchronization.

## Quick Example

Camera synchronization has no independent function API; it is implemented through sensor configuration files + LPWM configuration. The minimal configuration flow is as follows (using AR0820 + ETH PPS0 trigger at 30fps as an example):

1. **Configure the camera to Slave/Shutter Sync mode**: In the sensor configuration, add 512 (bit9) to `config_index` to enable sync; configure `deserial_gpio.trig_pin` with the MFP index to which LPWM connects.
2. **Configure LPWM output**: Configure `trigger_source=8` (ETH PPS0), `trigger_mode=1` (external trigger), `period=33333us` (1s/30fps), and `offset` using the formula `1000000 - period * fps + 1`.
3. **Load the configuration and start streaming**: The configuration file is loaded by the sensor library; LPWM outputs a square wave triggered by PPS, and multiple cameras synchronize exposure/output.

```json
{
    "port_0": {
        "sensor_name": "ar0820std",
        "config_index": 512,
        "fps": 30,
        "deserial_port": 0
    },
    "deserial_0": {
        "deserial_gpio": { "trig_pin": [5] }
    },
    "lpwm_chn0": {
        "trigger_source": 8, "trigger_mode": 1,
        "period": 33333, "offset": 29800, "duty_time": 100,
        "threshold": 0, "adjust_step": 0
    }
}
```

> On-board sample: `get_vin_data` syncs `lpwm_chn_attr_t` (`hbn_vin_cfg.h`) to the camera configuration through `vp_deserial_config_update` for SerDes sensors. For the meaning of each LPWM field, see [LPWM Configuration Item Description](#lpwm-configuration-item-description).

## FAQ

### What does the frame timestamp mean in sync mode?

When the MCU RTC feature is enabled, the CIM hardware automatically latches the timestamp corresponding to the LPWM trigger signal, and the software synchronizes this time with global_time before providing it to the user. When the sensor works in exposure sync mode, this timestamp represents the time when the sensor's triggered exposure starts.

When the sensor works in output sync or unsynchronized mode, the sensor exposure start time is unrelated to the LPWM signal, i.e., there is no relationship between the CIM frame start (tv) and the LPWM trigger (trig_tv) time. In this case the value has no reference value and does not need attention.

### What if the frame rate is unexpected under exposure sync?

Due to hardware or peripheral differences, the PPS may fall into the high-level region. If slow synchronization is disabled, or after slow synchronization succeeds, the high-level region must be traversed before entering the next trigger period, which may cause the number of LPWM waveforms within a trigger period to fall short of expectations and thus affect the sensor frame rate.

In actual use, ensure that the PPS stably falls in the low-level region, so you can appropriately increase the offset based on actual debugging.

## Related Documentation

- [Image Signal Processing - ISP](./05_isp_tune_api.md)
- [Time Synchronization Scheme](../../03_system_software/11_driver_timesync.md)
- [Camera Usage](../../../03_Demos/01_peripheral/02_camera/01_mipi_camera.md)