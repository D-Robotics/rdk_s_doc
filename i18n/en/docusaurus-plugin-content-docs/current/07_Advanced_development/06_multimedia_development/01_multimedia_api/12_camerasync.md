---
sidebar_position: 12
---

# Multi-Camera and Synchronization with Lidar

## Overview

In multi-camera deployment scenarios, synchronization across multiple cameras is typically required to meet algorithmic or application needs. Additionally, synchronization with Lidar is often necessary, which can be achieved via methods such as ETH PPS.

On the S100 platform, the LPWM module is primarily used for camera triggering. It can generate PWM waveforms with configurable delay outputs to calibrate sensor exposure synchronization. Furthermore, it supports multiple external trigger sources, enabling time synchronization with MCU or GPS devices.

This document focuses on the fundamental capabilities of the LPWM module, explaining its working principles and usage methods, and provides typical synchronization solutions for multi-camera and Lidar scenarios for reference in practical projects.

:::info Note

This document describes only one recommended hardware connection scheme for camera and Lidar synchronization. If other hardware configurations are used, users can adapt the configuration methods described herein accordingly.
:::

## Hardware Pathways

### LPWM Module

The S100 platform features a total of 3 LPWM chips, each containing 4 LPWM channels. Please configure according to your actual hardware connections.

The core implementation of camera synchronization on the S100 relies on the LPWM module. It supports various trigger signal sources on the S100 and generates multi-channel configurable PWM signals, which are output to external cameras (optionally forwarded via SerDes), thereby achieving synchronization between the trigger source and cameras, as well as inter-camera synchronization.

Key considerations when using the LPWM include:

- The actual hardware-connected channels in use.
- Selection of the LPWM synchronization trigger source: supports MCU RTC/PPS0/PPS1/ETH PPS0/ETH PPS1/MCU ETH PPS, etc.
- Offset configuration of the LPWM relative to the synchronization trigger source: must be adapted according to frame rate requirements, PPS period, phase requirements, etc.
- Target signal waveform parameters of the LPWM: period, duty_time, etc.
- LPWM advanced features: slow synchronization threshold, adjust_step configuration.

For more details on LPWM module functionality and usage, please refer to: [LPWM Usage](#lpwm)

### LPWM Synchronization Sources

LPWM operating principle: The LPWM is triggered by a PPS signal and acts as a Target-side device on the Trigger Bus. Each LPWM device can independently select its trigger source.

The process of transmitting the PPS signal to the camera trigger (cam-trig) is illustrated below. The PPS trigger connects to the LPWM module, which then outputs a signal to the camera:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/cam_sync/05_camera_sync_01.png" alt="LPWM Synchronization Sources diagram" style={{ width: '80%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />

For more information on PPS synchronization sources, please refer to: [PPS Description](../../03_system_software/11_driver_timesync.md#PPS)

:::info Note

Important notes regarding LPWM trigger source usage:

- Multiple external trigger sources are mutually exclusive; only one can be selected per LPWM module.
- Different LPWM modules can be synchronized by selecting the same external trigger source.
- Different channels within the same LPWM module share the same trigger source but can be configured with different offset/period/duty parameters.
:::

### Multi-Camera Synchronization Connection

For single-S100 camera deployment scenarios, the typical connection diagram is as follows:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/cam_sync/05_camera_sync_02.png" alt="Multi-Camera Synchronization Connection diagram" style={{ width: '100%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />

Key points:

- The S100 trigger source can originate from an external GPS device or network-based ETH PPS.
- Synchronization can also be achieved between the MCU and S100.
- Different LPWMs within the same S100 can select the same synchronization source.
- Different DES (Deserializer) units can connect to different LPWM channels.
- SerDes can transparently transmit LPWM signals to the sensor side via the reverse channel on the Link cable, connecting to FSYNC for synchronization triggering.

### Integration with Lidar

In scenarios involving Lidar, the following connection scheme can be used:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/cam_sync/05_camera_sync_03.png" alt="Integration with Lidar diagram" style={{ width: '100%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />

Key points:

- The S100 trigger source can come from an external GPS device or via network time synchronization methods.
- The Lidar device can align its clock with the S100 using time synchronization protocols (e.g., gPTP).
- Camera synchronization is achieved by triggering the DES via S100’s LPWM output, which then distributes the signal to individual cameras to synchronize exposure/image capture.
- When camera data enters the S100’s CIM module, a timestamp is recorded at the Frame Start moment to mark the frame time.

## Software Solution

### Camera and Lidar Time Alignment Requirements

In scenarios requiring simultaneous use and synchronization of cameras and Lidar, typical functional requirements include:

- Time synchronization between Lidar and S100, ensuring both operate on the same time axis.
- Lidar performs periodic scans based on synchronized time—for example, at 10Hz (100ms period), starting scans precisely at every 100ms interval.
- Cameras use LPWM triggered by the synchronized PPS signal to initiate exposure/readout for each frame, aligning with Lidar scan timing—for example, at 30fps.
- Timestamps of camera image data and Lidar data must reside on the same time axis with a defined alignment relationship to enable sensor fusion.

The desired time alignment objective is illustrated below:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/cam_sync/05_camera_sync_04.png" alt="Camera and Lidar Time Alignment Requirements diagram" style={{ width: '80%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />

At the exact PPS second boundary: LPWM output triggers exposure (if offset is set to 0), and Lidar starts scanning (if start delay is 0).

This software solution adapts to the solid-line hardware connections shown in the diagram above:

- Both S100 and Lidar connect to a network switch, enabling time synchronization over the network.
- Lidar scans at 10Hz, initiating scans precisely at every 100ms mark, with aligned timestamps on its data.
- Multiple cameras connect to the S100 via SerDes and also receive LPWM signals for exposure synchronization triggering.
- The LPWM trigger source uses Acore’s ETH PPS0.

### LPWM Trigger Source Selection

The LPWM module supports multiple trigger sources. For the hardware connection described above, several options remain available; please refer to: [Recommended LPWM Configuration].

In this solution, Acore ETH PPS0 is used as the LPWM trigger source because:

- Both Lidar and S100 use network-based synchronization, allowing PHC time to serve as a unified time axis.
- Acore ETH PPS exhibits the smallest timing error and is therefore recommended as the primary choice.

When using Acore ETH PPS0 in fixed mode, its rising edge has a fixed offset of 536.871ms relative to the PPS second boundary. This offset must be accounted for during configuration. For more details, please refer to: [Acore ETH PPS Description](../../03_system_software/11_driver_timesync.md#Acore_Eth_PPS)

### Camera Synchronization Mode Selection

Sensor exposure output typically operates in either Master mode (autonomous exposure based on configuration; frames are output automatically once streaming starts) or Slave mode (exposure triggered externally; output occurs only after receiving a trigger). By default, Master mode is used, but Slave mode is required for synchronized output.

Below is an example using the AR0820 module to illustrate Slave mode:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/cam_sync/05_camera_sync_05.png" alt="Camera Synchronization Mode Selection diagram" style={{ width: '100%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />

Within Slave mode, multiple synchronization methods exist. The commonly used "shutter sync" mode ensures that images are output at a fixed time after the trigger (guaranteeing Frame Start timestamp alignment) and does not drop incoming trigger signals (i.e., triggers arriving during image output are not ignored).

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/cam_sync/05_camera_sync_06.png" alt="Camera Synchronization Mode Selection diagram" style={{ width: '100%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />

Configuration examples:

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

In practice, enable synchronization functionality according to the `config_index` (requires corresponding implementation in the sensor library).  

:::info Note

The above is only an example for AR0820; other cameras are similar. The camera synchronization function mainly requires the following configurations:

Slave mode: Configure the module's SYNC mode according to actual requirements.

FSYNC selection: Choose an appropriate GPIO as the FSYNC signal based on the module's actual hardware connections. Some modules include an ISP, in which case you only need to configure FSYNC and do not need to set the sensor to Slave mode.
:::

Regarding the FSYNC signal output of the camera, different modules may exhibit different characteristics, such as:

- The FSYNC signal is only used to align exposure output and cannot control frame rate; therefore, the LPWM period must be set to match the actual frame rate.

- The module might operate in pure Slave mode, where no frames are output without an FSYNC signal, or it might only use FSYNC for alignment, meaning frames are still output even without FSYNC.

- Pay attention to the choice of synchronization mode: is it exposure synchronization or frame output synchronization?

- In exposure synchronization, exposure starts simultaneously across cameras. After exposure completes, frames are read out and output immediately. Since output timing depends on exposure duration, timestamps might not be perfectly aligned.

- In frame output synchronization, frames are read out and output simultaneously at a specified moment after exposure, ensuring consistent timestamps. This solution uses frame output synchronization.

- Different modules may have different exposure times, so timestamps after synchronization might still vary slightly.

## Recommended Solution

### Camera and LiDAR Synchronization Alignment Scheme

Based on the aforementioned hardware connections and software approach, the synchronization scheme is as follows:

- Use Acore ETH PPS0 as the trigger source.

- LiDAR begins scanning precisely at every full hundred milliseconds (e.g., 100ms, 200ms, etc.), and its data carries aligned timestamps.

- The camera (using AR0820 as an example) employs SHUTTER SYNC for frame output synchronization with auto-exposure enabled.

- Adjust the LPWM offset to align the phase to full hundred milliseconds. For example, at 30 fps, set offset = 463.129 ms; taking modulo 33.333 ms yields 29.8 ms.

- After correctly configuring the LPWM offset, the camera can synchronize its output precisely at every full hundred milliseconds (every 3 frames), aligning with LiDAR data.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/cam_sync/05_camera_sync_07.png" alt="Camera and LiDAR Synchronization Alignment Scheme diagram" style={{ width: '100%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />

### Camera Configuration

The following is the synchronization configuration for a single AR0820 channel:

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

Synchronization is primarily enabled by setting bit 9 (+512) in `config_index`:

```
{
    "config_0":{
        "port_0":{
            "config_index":512,
        },
    }
}
```

The `trig_pin` under `deserial` configures the MFP index corresponding to the LPWM hardware connection. This requires support from the deserializer library and must also be configured in the JSON as follows:

```
"deserial_gpio": {
        "trig_pin": [5]
},
```

- If one LPWM channel triggers multiple cameras simultaneously, configure only one index value (e.g., MFP5: `[5]`).

- If multiple LPWM channels trigger different cameras separately, configure multiple index values corresponding to multiple links (e.g., MFP5 for Link A and MFP14 for Link B: `[5,14]`).

### Trigger Configuration

LPWM configuration is performed via JSON. Below is a configuration example; for more details, refer to: [LPWM JSON Configuration]

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

## Quick Example

Camera synchronization has no standalone function API; it is implemented by delivering the sensor configuration file plus the LPWM configuration. The minimal configuration flow is as follows (taking AR0820 + ETH PPS0 trigger, 30fps as an example):

1. **Configure the Camera in Slave/Shutter Sync mode**: add 512 (bit9) to `config_index` in the sensor configuration to enable synchronization; configure `deserial_gpio.trig_pin` with the MFP index connected to LPWM.
2. **Configure the LPWM output**: configure `trigger_source=8` (ETH PPS0), `trigger_mode=1` (external trigger), `period=33333us` (1s/30fps), and `offset` according to the formula `1000000 - period * fps + 1`.
3. **Load the configuration and start streaming**: the configuration file is loaded with the sensor library; the LPWM outputs a square wave triggered by PPS, and multiple cameras capture/output frames synchronously.

When `trigger_mode` is set to 1 and `trigger_source` is set to 8, ETH PPS0 is used as the synchronization source.

> Board-side example: `get_vin_data` synchronizes the `lpwm_chn_attr_t` (`hbn_vin_cfg.h`) into the camera configuration for SerDes sensors through `vp_deserial_config_update`; the meaning of each LPWM field is described in the "LPWM Configuration Item Description" section of this chapter.

## Summary

Multi-camera synchronization on the S100 platform is achieved through coordinated hardware connections and software configuration of the LPWM module.

During hardware design, considerations must include varying frame rate requirements, synchronization needs of different camera modules, and selection of external trigger signals.

When bringing up and configuring camera modules, ensure LPWM synchronization passthrough is properly set up over SerDes, configure the sensor in Slave mode, and select an appropriate GPIO as the FSYNC signal to enable synchronized triggering and output.

In LiDAR-camera synchronization scenarios, use ETH PPS0 as the sync source with fixed mode, and correctly calculate and configure the LPWM offset to achieve precise phase alignment.

## LPWM
### Overview of LPWM
LPWM is a signal source similar to PWM, typically used to trigger sensor exposure in the camsys system. LPWM itself requires an external trigger. Upon receiving a trigger signal, it outputs a square wave based on the configured parameters such as period, high-time, and offset, with a frequency ranging from **1 Hz to 500 kHz**, an effective high-level duration from **0 μs to 4095 μs**, and a default precision of **1 μs**.

The S100 integrates **3 LPWM chips**, each containing **4 LPWM channels**. Configuration should be performed according to the actual hardware connections.

The camera hardware synchronization function of the S100 is mainly implemented by the LPWM module. It supports multiple trigger sources for the S100 and generates multi-channel configurable PWM signals for external cameras (which can be forwarded via SerDes), thereby achieving synchronization between the trigger source and cameras, as well as synchronization among multiple cameras.

### LPWM Configuration Items
1. **trigger_mode [0, 1]**: LPWM trigger mode
   - 0: Internal software trigger
   - 1: External trigger

2. **trigger_source [0, 10]**: LPWM trigger source.
   To use an external trigger source, set `trigger_mode = 1`.
   In typical scenarios, use **0** with a default trigger period of 1 second.

| trigger_source Value | Corresponding Trigger Source |
|----------------------|-------------------------------|
| 0                    | aon_rtc_pps                   |
| 1                    | reserve                       |
| 2                    | pps0                          |
| 3                    | pps1                          |
| 4                    | pps2                          |
| 5                    | reserve                       |
| 6                    | pcie0_ptm_pps                 |
| 7                    | pcie1_ptm_pps                 |
| 8                    | acore_eth0_pps                |
| 9                    | acore_eth1_pps                |
| 10                   | mcu_eth_pps                   |

3. **period [2, 1000000) μs**: Period of the LPWM output square wave.
4. **offset [0, 1000000) μs**: Offset time of the first waveform within each trigger cycle. Must be smaller than `period`.
5. **duty_time [0, 4096) μs**: Effective high-level duration of the LPWM output waveform. Must be smaller than `period`.
6. **threshold [0, 65535] μs**: Threshold for slow synchronization. Advanced feature; can usually be ignored.
7. **adjust_step [0, 15]**: Adjustment step per cycle.
   `adjust_time = 2^adjust_step`. Advanced feature; can usually be ignored.

### LPWM Configuration Calculation
The LPWM trigger source is typically PPS with a common period of **1 second**.
After receiving a trigger signal, LPWM first delays by the configured `offset`, then outputs continuous square waves. The waveform period and effective high-level duration are determined by configuration. When the next trigger arrives, the delay and waveform generation repeat.

The `offset` setting depends on the sensor **fps**:
- If 1 second cannot be divided evenly by fps, `offset` must be configured.
- Otherwise, set `offset = 0`.

**Example: 30 fps sensor**

- `period = 1 s / fps = 33333 μs`
- After 30 frames, the total time is 999,990 μs, leaving a **10 μs gap** until the next PPS trigger.
- Therefore, `offset` should be set to **10 μs** (minimum 10 μs, maximum `period - duty_time` μs).
  To be safe, add **1** to the calculated offset; otherwise, LPWM will output 31 pulses within 1 second.

Due to hardware or peripheral differences, PPS may fall in the high-level region.
If slow synchronization is disabled or completed, LPWM must finish the current high-level period before entering the next trigger cycle (and recalculating `offset`).
This may result in fewer waveforms than expected per trigger cycle, causing the sensor frame rate to deviate from the target in exposure-synchronized mode.
In such cases, **increase `offset` appropriately** to ensure PPS always falls in the low-level region and outputs the expected waveform.

```
Period = 1000000 / fps
Offset = 1000000 - Period * fps + 1
```

<img src="http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/03_multimedia_development/02_S100/camsys/lpwm_01.png" alt="LPWM diagram" style={{ width: '100%', maxWidth: "980px", height: "auto", display: "block", margin: "0 auto" }} />

Recommended Configurations
| Usage Scenario       | trigger_source       | trigger_mode | duty_time | offset | period        |
|----------------------|----------------------|--------------|-----------|--------|---------------|
| All 30 fps           | 8(eth0)/9(eth1)      | 1            | 100       | 11     | 33333         |
| All 25 fps           | 8(eth0)/9(eth1)      | 1            | 100       | 11     | 40000         |
| 12.5/25 fps          | 8(eth0)/9(eth1)      | 1            | 100       | 11     | 80000/40000   |
| 30/10 fps            | 8(eth0)/9(eth1)      | 1            | 100       | 11     | 33333/100000  |

### Other Notes
When the MCU RTC function is enabled, the CIM hardware automatically latches the timestamp corresponding to the LPWM trigger signal.
Software synchronizes this timestamp with `global_time` and provides it to the user.
When the sensor operates in **exposure synchronization mode**, this timestamp represents the start time of sensor exposure triggering.

When the sensor is in frame-synchronized output or unsynchronized mode, the sensor exposure start time is **not related** to the LPWM signal.
In other words, there is no correlation between CIM frame start (tv) and LPWM trigger (trig_tv) time.
In this case, the timestamp has no reference value and can be ignored.

In actual use, ensure PPS stably falls in the **low-level region** by appropriately increasing `offset` based on debugging results.
## Related Documentation

- [Image Signal Processing - ISP](/Advanced_development/multimedia_development/multimedia_api/isp_tune_api)
- [Time Synchronization Scheme](/Advanced_development/system_software/driver_timesync)
- [Camera Usage](/Demos/peripheral/camera/mipi_camera)
