# sample_camera_diag usage instructions

## Function Overview

`sample_camera_diag` demonstrates the Camera diagnostics (CAM_DIAG) event callback flow: it initializes Camera / VIN (and creates a deserializer in Serdes scenarios), registers a callback via `hbn_camera_set_event_callback`, injects faults using libcam test APIs, and prints diagnostic events in the callback.

The sample can cover the following diag device types:

| Type | Meaning | Typical diag_id | Typical module_id |
| ---- | ------- | --------------- | ----------------- |
| snr  | Sensor | `0x40xxxxxx` | `0xc00x` |
| des  | Deserializer | `0x1xxxxxxx` | `0xc01x` |
| poc  | POC power | `0x2xxxxxxx` | `0xc02x` |
| ser  | Serializer | `0x3xxxxxxx` | `0xc03x` |
| txs  | Tx Serializer | `0x5xxxxxxx` | `0xc04x` |

:::info Note
Fault injection is a test method used to verify the diagnostics path and event callback. A callback with `status=1` means a fault event was reported; it does **not** mean the sensor hardware is physically damaged.
:::

### sample_camera_diag Architecture Description

`sample_camera_diag` is located under `/app/multimedia_samples/sample_camera_diag`. The subdirectory is described as follows:

| Directory | Description |
| --------- | ----------- |
| [camera_event_callback](#camera_event_callback) | Registers a camera event callback, injects diag faults, and prints callbacks |

## camera_event_callback

### Code Location and Directory Structure

The source path of `camera_event_callback` is `/app/multimedia_samples/sample_camera_diag/camera_event_callback`. The structure is:

```shell
── camera_event_callback
   ├── camera_event_callback.c
   └── Makefile
```

- Makefile: used to build the program.
- camera_event_callback.c: main source file.

### Prerequisites

The sample requires Camera diagnostics to be enabled on the board. If sensor / deserial plugins in the current image were not built with `CAM_DIAG`, you may see “no snr/des/poc nodes” or no callback after inject.

Typical way to enable diagnostics in the `hobot-camera` source tree:

1. Add the following to `drivers/sensor/Makefile` and `drivers/deserial/Makefile`:

```makefile
CFLAGS += -DCAM_DIAG
```

2. Make sure the target sensor driver uses `#ifdef CAM_DIAG` (not `#if 0`) and correctly binds `.diag_nodes_init`.

3. Rebuild and install the `hobot-camera` and `hobot-multimedia-samples` deb packages, then run the sample on the board.

### Compilation

Run `make` in the source directory:

```shell
cd /app/multimedia_samples/sample_camera_diag/camera_event_callback
make
```

### Execution

#### How to Run the Program

Run `./camera_event_callback -h` to display help information and the supported Camera Sensor list.

#### Program Parameter Options Explanation

```shell
root@ubuntu:/app/multimedia_samples/sample_camera_diag/camera_event_callback# ./camera_event_callback -h
Usage: camera_event_callback [OPTIONS]
Options:
  -s <sensor_index>      Specify sensor index
  -l <link_port>         Serdes link port: 0:A 1:B 2:C 3:D
  -d <diag_id>           Inject specified diag id (hex), default auto
  -t <type>              Filter diag by device type (list/inject)
                         des|poc|ser|snr|txs, default all types
  -w <seconds>           Max wait time for callback, default 20
  -h                     Show this help message
```

**Command Parameter Descriptions:**

- `s <sensor_index>`: Sensor index to use. Check the list with `-h`.
- `l <link_port>`: Serdes Sensor link port on the deserializer, `0:A 1:B 2:C 3:D`. **Mandatory** for Serdes sensors.
- `d <diag_id>`: Specific diag id to inject (hex supported, e.g. `0x401031`). If omitted, the program auto-selects a usable node from the diag dump.
- `t <type>`: Filter listed/injected nodes by device type: `des` / `poc` / `ser` / `snr` / `txs`. Without `-t`, all types are shown and tried.
- `w <seconds>`: Extra wait time when no callback is received. Default is 20 seconds.
- `h`: Show help information.

:::caution Caution
The value of `-l` depends on which deserializer port the Serdes Sensor is physically connected to. Keep it consistent with the hardware wiring.
:::

#### Recommended Test Commands

The following examples use `ar0820std-1080p30` (index `3` in the log below; check the board-side `-h` list for your image):

```shell
# List all node types and auto-inject the first usable node
./camera_event_callback -s 3 -l 0

# Test Sensor diag only
./camera_event_callback -s 3 -l 0 -t snr

# Test deserializer diag only
./camera_event_callback -s 3 -l 0 -t des

# Test POC diag only
./camera_event_callback -s 3 -l 0 -t poc
```

:::tip Tip
Some sensors (for example certain ar0820std configs) may not register snr nodes, while des / poc can still work. To verify Sensor diag, switch to a sensor with snr diag enabled (such as ovx3cstd or isx031std).
:::

### Running Results

The logs below are based on `ar0820std-1080p30`, using `./camera_event_callback -s 3 -l 0 ...`.

#### Test sensor diag (`-t snr`)

```shell
root@ubuntu:/app/multimedia_samples/sample_camera_diag/camera_event_callback# ./camera_event_callback -s 3 -l 0 -t snr
[camera_event_callback]: sensor_index=3 name=ar0820std-1080p30 config=linear_1920x1080_yuv_30fps_1lane.c
[camera_event_callback]: hbn_camera_set_event_callback registered
[camera_event_callback]: hbn_camera_start ok
[camera_event_callback]: wait 5 seconds for diag monitor ready ...
[camera_event_callback]: prepare diag inject ...
[camera_event_callback]: diag nodes (type=snr):
[camera_event_callback]: no diag node for type snr
[camera_event_callback]: fault inject finished without callback
[camera_event_callback]: extra wait up to 20 seconds ...
[camera_event_callback]: done, total callback count=0
```

In this configuration there are **no snr nodes**, so no sensor fault callback is triggered. To verify snr, use a module that has registered sensor diag nodes.

#### Test deserializer diag (`-t des`)

```shell
root@ubuntu:/app/multimedia_samples/sample_camera_diag/camera_event_callback# ./camera_event_callback -s 3 -l 0 -t des
[camera_event_callback]: sensor_index=3 name=ar0820std-1080p30 config=linear_1920x1080_yuv_30fps_1lane.c
[camera_event_callback]: hbn_camera_set_event_callback registered
[camera_event_callback]: hbn_camera_start ok
[camera_event_callback]: wait 5 seconds for diag monitor ready ...
[camera_event_callback]: prepare diag inject ...
[camera_event_callback]: diag nodes (type=des):
[camera_event_callback]:   0x00141011 type=des valid=1 status=0x0
[camera_event_callback]:   0x00142011 type=des valid=1 status=0x0
...
[camera_event_callback]: listed 34 node(s) / 54 total
[camera_event_callback]: try diag node 0x141011 type=des valid=1
[camera_event_callback]: inject diag_id=0x141011 hard ret=0
[camera_event_callback]: hard inject from dump, wait up to 2 seconds ...
[camera_event_callback]: event callback received: port=0 type=diag module_id=0xc011 event_id=0x0041 status=1
[camera_event_callback]: event callback received: port=0 type=diag module_id=0xc019 event_id=0x004f status=1
[camera_event_callback]: event callback received: port=0 type=diag module_id=0xc012 event_id=0x0041 status=1
[camera_event_callback]: event callback received: port=0 type=diag module_id=0xc015 event_id=0x0041 status=1
[camera_event_callback]: done, total callback count=4
```

Key log meanings:

| Log | Meaning |
| --- | ------- |
| `hbn_camera_set_event_callback registered` | Event callback registered successfully |
| `listed 34 node(s) / 54 total` | 34 des nodes after filtering; 54 nodes in total |
| `inject ... hard ret=0` | Hard inject succeeded |
| `module_id=0xc011/0xc012/... status=1` | Received deserializer-domain fault events |
| `total callback count=4` | One inject may trigger multiple callbacks; this is expected |

#### Test POC diag (`-t poc`)

```shell
root@ubuntu:/app/multimedia_samples/sample_camera_diag/camera_event_callback# ./camera_event_callback -s 3 -l 0 -t poc
[camera_event_callback]: sensor_index=3 name=ar0820std-1080p30 config=linear_1920x1080_yuv_30fps_1lane.c
[camera_event_callback]: hbn_camera_set_event_callback registered
[camera_event_callback]: hbn_camera_start ok
[camera_event_callback]: wait 5 seconds for diag monitor ready ...
[camera_event_callback]: prepare diag inject ...
[camera_event_callback]: diag nodes (type=poc):
[camera_event_callback]:   0x00240044 type=poc valid=1 status=0x0
...
[camera_event_callback]: listed 20 node(s) / 54 total
[camera_event_callback]: try diag node 0x240044 type=poc valid=1
[camera_event_callback]: inject diag_id=0x240044 hard failed, ret=-65559
[camera_event_callback]: soft inject diag_id=0x240044 ok
[camera_event_callback]: soft inject from dump, wait up to 3 seconds ...
[camera_event_callback]: event callback received: port=0 type=diag module_id=0xc024 event_id=0x0040 status=1
[camera_event_callback]: done, total callback count=1
```

Some POC nodes do not support hard inject (`hard failed, ret=-65559`). The sample automatically falls back to soft inject. Receiving a callback with `module_id=0xc024` and `status=1` means the POC diagnostics path is working.

#### Without `-t` (all types)

```shell
root@ubuntu:/app/multimedia_samples/sample_camera_diag/camera_event_callback# ./camera_event_callback -s 3 -l 0
[camera_event_callback]: sensor_index=3 name=ar0820std-1080p30 config=linear_1920x1080_yuv_30fps_1lane.c
[camera_event_callback]: hbn_camera_set_event_callback registered
[camera_event_callback]: hbn_camera_start ok
[camera_event_callback]: wait 5 seconds for diag monitor ready ...
[camera_event_callback]: prepare diag inject ...
[camera_event_callback]: diag nodes (all types):
[camera_event_callback]:   0x00141011 type=des valid=1 status=0x0
...
[camera_event_callback]:   0x00244034 type=poc valid=1 status=0x0
[camera_event_callback]: listed 54 node(s) / 54 total
[camera_event_callback]: try diag node 0x141011 type=des valid=1
[camera_event_callback]: inject diag_id=0x141011 hard ret=0
[camera_event_callback]: hard inject from dump, wait up to 2 seconds ...
[camera_event_callback]: event callback received: port=0 type=diag module_id=0xc011 event_id=0x0041 status=1
[camera_event_callback]: event callback received: port=0 type=diag module_id=0xc019 event_id=0x004f status=1
[camera_event_callback]: event callback received: port=0 type=diag module_id=0xc012 event_id=0x0041 status=1
[camera_event_callback]: event callback received: port=0 type=diag module_id=0xc015 event_id=0x0041 status=1
[camera_event_callback]: done, total callback count=4
```

Without `-t`, the sample lists all nodes (here 54 = 34 des + 20 poc, no snr) and injects the first `valid=1` node in dump order (usually des first). To verify each type separately, use `-t snr` / `-t des` / `-t poc`.

### FAQ

#### 1. `no diag node for type snr`

**Possible causes:**

- The current sensor config does not register snr nodes (for example some ar0820std configs)
- The sensor plugin was not built with `-DCAM_DIAG`, or diag code is disabled by `#if 0`

**Workarounds:**

- Check whether des / poc still work (to confirm the CAM_DIAG framework is enabled)
- Switch to a sensor with snr diag enabled (such as ovx3cstd or isx031std)
- Confirm the sensor driver uses `#ifdef CAM_DIAG` and binds `diag_nodes_init`

#### 2. Nodes exist but `callback count=0`

**Possible causes:**

- The injected node has `valid=0`
- The specified `-d` does not match the current config
- The diag monitor is not ready yet (increase `-w` if needed)

**Workarounds:**

- Omit `-d` first and let the sample auto-select a `valid=1` node
- Confirm logs show `hbn_camera_start ok` and the diag ready wait message

#### 3. POC hard inject fails but soft inject succeeds

Some POC nodes do not support hard inject (return `-65559`). The sample falls back to soft inject automatically. If a callback is received after soft inject, the POC path is considered working.
