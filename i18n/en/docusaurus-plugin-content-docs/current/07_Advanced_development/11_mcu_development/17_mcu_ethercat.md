---
sidebar_position: 17
---

# 7.5.18 EtherCAT User Guide

```mdx-code-block

import DocScope from '@site/src/components/DocScope';

```

## 1. Overview

<DocScope products="RDK S100">
This module is based on the open-source **SOEM** (Simple Open EtherCAT Master) library, ported and adapted for the embedded MCU platform (S100) running **FreeRTOS**. Main features:
</DocScope>
<DocScope products="RDK S600">
This module is based on the open-source **SOEM** (Simple Open EtherCAT Master) library, ported and adapted for the embedded MCU platform (S600) running **FreeRTOS**. Main features:
</DocScope>

| Feature | Description |
|------|------|
| EtherCAT master | Implements full EtherCAT MainDevice (master) functionality |
| Real-time scheduling | Periodic process data send/receive via FreeRTOS tasks |
| Hardware adaptation | Low-level Ethernet TX/RX through McalCdd/Ethernet (`Eth.h`) |
| Mailbox protocols | Supports CoE, FoE, EoE, SoE, and AoE mailbox protocols |
| Distributed clock | DC synchronization supported, with a PI controller for clock alignment |
| Slave diagnostics | Slave state detection, automatic recovery, and reconfiguration |
| Shell interface | Interactive command-line test entry points |

---

## 2. Software architecture

| Layer | Module / file | Description | Public interface |
|------|------------|------|---------|
| **Application** | `ec_sample/src/ec_sample.c` | Full EtherCAT sample: real-time task, check task, and startup flow | `EtherCAT_Sample_Start()` / Shell `Ec_Sample_Test` |
| **Application** | `slaveinfo/src/slaveinfo.c` | Slave scan, SDO read/write utilities | `EtherCAT_SlaveInfo_Start()` / Shell `Ec_SlaveInfo`, `Ec_SlaveOP` |
| **SOEM core** | `core/src/ec_main.c` | Master init, state machine, mailbox, EEPROM read/write | `ecx_init` / `ecx_readstate` / `ecx_writestate`, etc. |
| **SOEM core** | `core/src/ec_config.c` | Auto slave enumeration and PDO mapping | `ecx_config_init` / `ecx_config_map_group` |
| **SOEM core** | `core/src/ec_coe.c` | CoE (CANopen over EtherCAT) SDO read/write, object dictionary queries | `ecx_SDOread` / `ecx_SDOwrite` / `ecx_readODlist` |
| **SOEM core** | `core/src/ec_dc.c` | Distributed clock (DC) configuration and sync | `ecx_configdc` |
| **SOEM core** | `core/src/ec_foe.c` | FoE (File over EtherCAT) file transfer | `ecx_FOEread` / `ecx_FOEwrite` |
| **SOEM core** | `core/src/ec_eoe.c` | EoE (Ethernet over EtherCAT) Ethernet tunneling | `ecx_EOEsend` / `ecx_EOErecv` |
| **SOEM core** | `core/src/ec_soe.c` | SoE (Servo over EtherCAT) servo parameter access | `ecx_SoEread` / `ecx_SoEwrite` |
| **SOEM core** | `core/src/ec_base.c` | Low-level EtherCAT frame build/send/receive | `ecx_send_processdata` / `ecx_receive_processdata` |
| **SOEM core** | `core/src/ec_print.c` | Error/status codes to human-readable strings | `ec_ALstatuscode2string` / `ecx_elist2string` |
| **OSAL** | `osal/src/osal.c` | FreeRTOS adaptation for OS time, tasks, mutex | `osal_usleep` / `osal_mutex_lock`, etc. |
| **OSHW / NIC** | `oshw/src/nicdrv.c` | Network I/O: maps SOEM frame ops to McalCdd/Ethernet API | `ecx_setupnic` / `ecx_outframe` / `ecx_inframe` |
| **OSHW / NIC** | `oshw/src/oshw.c` | Byte order helpers (endian conversion) | `oshw_htons` / `oshw_ntohs` |
| **Hardware** | Ethernet controller 0 | Physical port, EtherCAT frames (EtherType `0x88A4`) | McalCdd `Eth_Transmit` / `Eth_Receive_ethercat` |

---

## 3. Directory layout

```
McalCdd/EtherCAT/
├── SConscript                  # Top-level build script
├── README.md                   # Original notes
├── core/                       # SOEM core sources
│   ├── SConscript
│   ├── src/
│   │   ├── ec_main.c           # Main: init, state machine, mailbox
│   │   ├── ec_config.c         # Auto slave config (PDO mapping)
│   │   ├── ec_coe.c            # CoE (CANopen over EtherCAT) SDO ops
│   │   ├── ec_dc.c             # Distributed clock (DC) config
│   │   ├── ec_eoe.c            # EoE (Ethernet over EtherCAT)
│   │   ├── ec_foe.c            # FoE (File over EtherCAT)
│   │   ├── ec_soe.c            # SoE (Servo over EtherCAT)
│   │   ├── ec_base.c           # Low-level frame operations
│   │   └── ec_print.c          # Debug print helpers
│   └── inc/
│       ├── nicdrv.h            # NIC driver interface
│       ├── osal.h              # OSAL interface
│       ├── osal_defs.h         # OSAL type definitions
│       ├── oshw.h              # OS/HW utility interface
│       └── soem/
│           ├── soem.h          # Umbrella header (include-all)
│           ├── ec_main.h       # Data structures and main API
│           ├── ec_type.h       # Basic types, enums, macros
│           ├── ec_options.h    # Compile-time options
│           ├── ec_coe.h        # CoE API declarations
│           ├── ec_config.h     # Config API declarations
│           ├── ec_dc.h         # DC API declarations
│           ├── ec_eoe.h        # EoE API declarations
│           ├── ec_foe.h        # FoE API declarations
│           ├── ec_soe.h        # SoE API declarations
│           └── ec_print.h      # Print helper declarations
├── osal/                       # FreeRTOS OSAL implementation
│   ├── SConscript
│   └── src/osal.c
└── oshw/                       # Hardware driver adaptation
    ├── SConscript
    └── src/
        ├── nicdrv.c            # McalCdd/Ethernet NIC driver
        └── oshw.c              # Byte-order utilities

samples/EtherCAT/
├── SConscript
├── ec_sample/
│   ├── SConscript
│   └── src/ec_sample.c        # Basic run sample
└── slaveinfo/
    ├── SConscript
    └── src/slaveinfo.c        # Slave info scan sample
```

---

## 4. Key data structures

### 4.1 ecx_contextt — Master context

All SOEM APIs take a pointer to this structure as the first argument. The application should declare one static instance:

```c
static ecx_contextt ctx;
```

Main members:

| Member | Type | Description |
|------|------|------|
| `port` | `ecx_portt` | Network port (frame buffers, mutex) |
| `slavelist[]` | `ec_slavet[EC_MAXSLAVE]` | Slave list; index 0 is the broadcast logical slave |
| `slavecount` | `int` | Number of slaves discovered |
| `grouplist[]` | `ec_groupt[EC_MAXGROUP]` | Per-group slave information |
| `ecaterror` | `boolean` | Whether an EtherCAT error is pending |
| `DCtime` | `int64` | Slave DC time (ns) |
| `ENI` | `ec_enit *` | EtherCAT Network Information (optional) |
| `FOEhook` | Function pointer | FoE data callback hook |
| `EOEhook` | Function pointer | EoE data callback hook |
| `manualstatechange` | `int` | 0 = automatic state transitions, 1 = manual |
| `overlappedMode` | `boolean` | Overlapped mode (for TI ESC) |
| `packedMode` | `boolean` | Compact PDO mapping mode |

### 4.2 ec_slavet — Slave information

| Member | Description |
|------|------|
| `state` | Current slave state (`ec_state` enum) |
| `ALstatuscode` | AL status code; gives the reason when in error |
| `configadr` | Configured station address |
| `eep_man` / `eep_id` / `eep_rev` | Vendor / product / revision from EEPROM |
| `Obytes` / `Ibytes` | Output / input byte counts |
| `outputs` / `inputs` | Pointers into the IOmap regions |
| `hasdc` | Whether distributed clock is supported |
| `CoEdetails` | CoE capability flags |
| `mbx_proto` | Bitmask of supported mailbox protocols |
| `islost` | Whether the slave is considered lost |
| `name` | Human-readable slave name string |

### 4.3 ec_groupt — Slave group

| Member | Description |
|------|------|
| `Obytes` / `Ibytes` | Total output / input bytes for the group |
| `outputsWKC` / `inputsWKC` | Expected working counter values |
| `docheckstate` | Flag to run state checking |
| `hasdc` | Whether any slave in the group has DC |

---

## 5. Slave state machine

EtherCAT slaves follow this state machine (ESM):

```
  INIT (0x01)
     │
     ▼  I→P
  PRE_OP (0x02)
     │
     ▼  P→S
  SAFE_OP (0x04)
     │
     ▼  S→O
  OPERATIONAL (0x08)
```

Enum values:

| Enum | Value | Description |
|--------|------|------|
| `EC_STATE_NONE` | 0x00 | Invalid |
| `EC_STATE_INIT` | 0x01 | Init |
| `EC_STATE_PRE_OP` | 0x02 | Pre-operational |
| `EC_STATE_BOOT` | 0x03 | BOOT (firmware update) |
| `EC_STATE_SAFE_OP` | 0x04 | Safe-op (input PDO only) |
| `EC_STATE_OPERATIONAL` | 0x08 | Operational (full PDO) |
| `EC_STATE_ERROR` | 0x10 | Error / ACK |

Write-state example:

```c
/* Request all slaves to enter OPERATIONAL */
ctx.slavelist[0].state = EC_STATE_OPERATIONAL;
ecx_writestate(&ctx, 0);
/* Wait for acknowledgment (2 s timeout) */
ecx_statecheck(&ctx, 0, EC_STATE_OPERATIONAL, EC_TIMEOUTSTATE);
```

---

## 6. API reference

### 6.1 Init and shutdown

#### `ecx_init`

```c
int ecx_init(ecx_contextt *context, const char *ifname);
```

Initializes the EtherCAT master and opens the low-level network interface.

| Parameter | Description |
|------|------|
| `context` | Master context pointer |
| `ifname` | Interface name (use `NULL` on this embedded platform; controller 0 is default) |

**Return value:** Non-zero on success, 0 on failure.

```c
int rv = ecx_init(&ctx, NULL);
if (rv == 0) {
    /* Initialization failed */
}
```

#### `ecx_close`

```c
void ecx_close(ecx_contextt *context);
```

Shuts down the master and releases low-level network resources.

---

### 6.2 Slave configuration

#### `ecx_config_init`

```c
int ecx_config_init(ecx_contextt *context);
```

Scans the bus, configures all slaves to PRE_OP, and fills `ctx.slavelist[]` and `ctx.slavecount`.

**Return value:** Number of slaves found.

#### `ecx_config_map_group`

```c
int ecx_config_map_group(ecx_contextt *context, void *pIOmap, uint8 group);
```

Configures PDO mapping for all slaves in a group and maps inputs/outputs into `pIOmap`.

| Parameter | Description |
|------|------|
| `context` | Master context |
| `pIOmap` | IOmap buffer (4096 bytes recommended) |
| `group` | Group index (0 = default group) |

**Return value:** Total mapped IO bytes on success.

```c
static uint8 IOmap[4096];
int map_result = ecx_config_map_group(&ctx, IOmap, 0);
```

After mapping, compute the expected working counter:

```c
ec_groupt *group = &ctx.grouplist[0];
int expectedWKC = (group->outputsWKC * 2) + group->inputsWKC;
```

#### `ecx_reconfig_slave`

```c
int ecx_reconfig_slave(ecx_contextt *context, uint16 slave, int timeout);
```

Reconfigures one slave (fault recovery). Success returns a value greater than or equal to `EC_STATE_PRE_OP`.

#### `ecx_recover_slave`

```c
int ecx_recover_slave(ecx_contextt *context, uint16 slave, int timeout);
```

Recovers a slave that was marked lost.

---

### 6.3 State management

#### `ecx_readstate`

```c
int ecx_readstate(ecx_contextt *context);
```

Reads current state for all slaves and updates `ctx.slavelist[i].state`.

**Return value:** State of the lowest-priority slave.

#### `ecx_writestate`

```c
int ecx_writestate(ecx_contextt *context, uint16 slave);
```

Writes the target state from `ctx.slavelist[slave].state` to the slave. `slave == 0` broadcasts to all.

#### `ecx_statecheck`

```c
uint16 ecx_statecheck(ecx_contextt *context, uint16 slave, uint16 reqstate, int timeout);
```

Polls until the slave reaches `reqstate` or times out.

| Parameter | Description |
|------|------|
| `slave` | Slave index; 0 = all |
| `reqstate` | Target state |
| `timeout` | Timeout in microseconds; `EC_TIMEOUTSTATE` (2 s) is typical |

**Return value:** State actually reached.

---

### 6.4 Process data (PDO)

PDO traffic is the core of real-time EtherCAT exchange; call send/receive periodically from a dedicated real-time task.

#### `ecx_send_processdata`

```c
int ecx_send_processdata(ecx_contextt *context);
```

Sends process-data frames for all groups (master outputs to slaves).

#### `ecx_receive_processdata`

```c
int ecx_receive_processdata(ecx_contextt *context, int timeout);
```

Receives process-data responses (slave inputs into the `inputs` regions).

**Return value:** Working counter (WKC). Compare with `expectedWKC` to detect communication issues.

#### `ecx_send_processdata_group` / `ecx_receive_processdata_group`

Per-group variants:

```c
int ecx_send_processdata_group(ecx_contextt *context, uint8 group);
int ecx_receive_processdata_group(ecx_contextt *context, uint8 group, int timeout);
```

#### Accessing PDO data

After mapping, use the pointers in `ec_slavet`:

```c
ec_slavet *slave = &ctx.slavelist[1];

/* Write outputs (master → slave) */
memcpy(slave->outputs, &my_output, slave->Obytes);

/* Read inputs (slave → master) */
memcpy(&my_input, slave->inputs, slave->Ibytes);
```

---

### 6.5 Mailbox protocols (CoE / SDO)

#### SDO read

```c
int ecx_SDOread(ecx_contextt *context,
                uint16 slave, uint16 index, uint8 subindex,
                boolean CA, int *psize, void *p, int timeout);
```

Reads one SDO object from a slave.

| Parameter | Description |
|------|------|
| `slave` | Slave index (starts at 1) |
| `index` | Object dictionary index |
| `subindex` | Subindex |
| `CA` | Complete Access |
| `psize` | In: buffer size; out: bytes read |
| `p` | Data buffer |
| `timeout` | Timeout (µs); `EC_TIMEOUTRXM` (700 ms) is typical |

**Return value:** WKC (greater than 0 means success).

```c
uint32_t vendor_id = 0;
int size = sizeof(vendor_id);
int wkc = ecx_SDOread(&ctx, 1, 0x1018, 0x01, FALSE, &size, &vendor_id, EC_TIMEOUTRXM);
```

#### SDO write

```c
int ecx_SDOwrite(ecx_contextt *context,
                 uint16 Slave, uint16 Index, uint8 SubIndex,
                 boolean CA, int psize, const void *p, int Timeout);
```

Writes one SDO object to a slave.

```c
uint16_t mode = 0x0008; /* e.g. set operation mode */
ecx_SDOwrite(&ctx, 1, 0x6060, 0x00, FALSE, sizeof(mode), &mode, EC_TIMEOUTRXM);
```

#### Mailbox handler task

For CoE-capable slaves, call the mailbox handler regularly from a loop:

```c
ecx_mbxhandler(&ctx, 0, 4);  /* Group 0, up to 4 messages */
```

Register a slave for cyclic mailbox handling:

```c
ecx_slavembxcyclic(&ctx, slave_index);
```

#### CoE object dictionary listing

```c
/* Read object dictionary list */
ec_ODlistt ODlist;
ecx_readODlist(&ctx, slave, &ODlist);

/* Read object description */
ecx_readODdescription(&ctx, item, &ODlist);

/* Read object entry information */
ec_OElistt OElist;
ecx_readOE(&ctx, item, &ODlist, &OElist);
```

---

### 6.6 Distributed clock (DC)

#### `ecx_configdc`

```c
int ecx_configdc(ecx_contextt *context);
```

Configures DC for all DC-capable slaves, aligned to the first DC slave. Call after `ecx_config_map_group`.

#### DC time sync (PI controller)

Applications often align the local clock to DC time with a PI loop; see `ec_sample.c`:

```c
static float pgain = 0.01f;
static float igain = 0.00002f;
static int64 syncoffset = 500000; /* 500 µs offset */

void ec_sync(int64 reftime, int64 cycletime, int64 *offsettime)
{
    static int64 integral = 0;
    int64 delta = (reftime - syncoffset) % cycletime;
    if (delta > (cycletime / 2)) delta -= cycletime;
    integral += -delta;
    *offsettime = (int64)((-delta * pgain) + (integral * igain));
}
```

Use from the real-time task:

```c
if (ctx.slavelist[0].hasdc && (wkc > 0))
{
    ec_sync(ctx.DCtime, cycletime, &toff);
}
```

---

### 6.7 Error handling

#### Error stack

```c
/* Check for pending errors */
boolean ecx_iserror(ecx_contextt *context);

/* Pop one error from the stack */
boolean ecx_poperror(ecx_contextt *context, ec_errort *Ec);
```

`ec_errort` members:

| Member | Description |
|------|------|
| `Time` | Time of the error |
| `Slave` | Slave index |
| `Index` / `SubIdx` | CoE object index / subindex |
| `Etype` | Error type (`ec_err_type`) |
| `AbortCode` | SDO abort code (when CoE-related) |

Error type enum:

| Enum | Description |
|--------|------|
| `EC_ERR_TYPE_SDO_ERROR` | SDO error |
| `EC_ERR_TYPE_EMERGENCY` | Emergency message |
| `EC_ERR_TYPE_PACKET_ERROR` | Packet error |
| `EC_ERR_TYPE_FOE_ERROR` | FoE error |
| `EC_ERR_TYPE_SOE_ERROR` | SoE error |
| `EC_ERR_TYPE_MBX_ERROR` | Mailbox error |

---

## 7. Quick start: ec_sample

`samples/EtherCAT/ec_sample/src/ec_sample.c` is a full EtherCAT master sample from init through run to shutdown.

### 7.1 Overall flow

```
EtherCAT_Sample_Start(cycle_time_us)
       │
       ├─ xTaskCreate("ECAT_RT", ecatthread, ...)      ← Highest priority
       ├─ xTaskCreate("ECAT_CHK", ecatcheck, ...)      ← Low priority
       └─ xTaskCreate("ECAT_BRINGUP", EtherCAT_Bringup_Task, ...)
                │
                └─ ecatbringup()
                        ├─ ecx_init(&ctx, NULL)
                        ├─ ecx_config_init(&ctx)
                        ├─ ecx_config_map_group(&ctx, IOmap, 0)
                        ├─ ecx_configdc(&ctx)
                        ├─ ecx_slavembxcyclic()        ← Register CoE slaves
                        ├─ ecx_writestate() → OPERATIONAL
                        ├─ [Run loop 500×20 ms]
                        └─ ecx_writestate() → SAFE_OP → INIT
```

### 7.2 Start function

```c
/**
 * Start EtherCAT sample
 * @param cycle_time_us  Cycle time in microseconds; 0 uses default 1000 µs
 * @return 0 on success
 */
int EtherCAT_Sample_Start(int cycle_time_us);
```

### 7.3 Real-time task (ecatthread)

Runs at the highest FreeRTOS priority and executes periodically:

```c
void ecatthread(void *pvParameters)
{
    /* Wait until mapping completes */
    while (!mappingdone) osal_usleep(100);

    /* Initial time base */
    osal_get_monotonic_time(&ts);

    while (1)
    {
        /* Compute and wait for next cycle start */
        add_time_ns(&ts, cycletime + toff);
        osal_monotonic_sleep(&ts);

        if (dorun > 0)
        {
            wkc = ecx_receive_processdata(&ctx, EC_TIMEOUTRET);

            /* DC time sync */
            if (ctx.slavelist[0].hasdc && (wkc > 0))
                ec_sync(ctx.DCtime, cycletime, &toff);

            /* Mailbox handling */
            ecx_mbxhandler(&ctx, 0, 4);

            ecx_send_processdata(&ctx);
        }

        vTaskDelay(1);
    }
}
```

### 7.4 Fault-check task (ecatcheck)

Runs at low priority (every 10 ms), monitors and recovers misbehaving slaves:

```c
void ecatcheck(void *pvParameters)
{
    while (1)
    {
        if (inOP && ((dowkccheck > 2) || ctx.grouplist[0].docheckstate))
        {
            ecx_readstate(&ctx);
            for (int i = 1; i <= ctx.slavecount; i++)
            {
                if (slave->state == (EC_STATE_SAFE_OP + EC_STATE_ERROR))
                    /* Clear error ACK */
                else if (slave->state == EC_STATE_SAFE_OP)
                    /* Push back to OPERATIONAL */
                else if (slave->state > EC_STATE_NONE)
                    ecx_reconfig_slave(...);  /* Reconfigure */
                else if (slave->islost)
                    ecx_recover_slave(...);   /* Recover */
            }
        }
        vTaskDelay(pdMS_TO_TICKS(10));
    }
}
```

### 7.5 FreeRTOS task parameters

| Task name | Function | Stack size | Priority |
|--------|------|--------|--------|
| `ECAT_RT` | `ecatthread` | `configMINIMAL_STACK_SIZE × 8` | `configMAX_PRIORITIES - 1` (highest) |
| `ECAT_CHK` | `ecatcheck` | `configMINIMAL_STACK_SIZE × 8` | `tskIDLE_PRIORITY + 1` |
| `ECAT_BRINGUP` | `EtherCAT_Bringup_Task` | `configMINIMAL_STACK_SIZE × 10` | `configMAX_PRIORITIES - 2` |

> **Note:** `ecx_config_map_group` uses significant stack; the bring-up task uses a larger stack for that reason.

---

## 8. Slave info: slaveinfo

`samples/EtherCAT/slaveinfo/src/slaveinfo.c` scans the bus and prints detailed information for each slave.

### 8.1 Start function

```c
/**
 * Start slave information scan
 * @param sdo_flag  Print SDO object dictionary
 * @param map_flag  Print PDO mapping
 */
void EtherCAT_SlaveInfo_Start(boolean sdo_flag, boolean map_flag);
```

### 8.2 Printed content

After the scan, each slave prints:

- Slave index and name
- Vendor ID, product code, revision, serial
- Output / input byte counts
- Supported mailbox protocols (CoE / FoE / EoE / SoE / AoE)
- SM (sync manager) configuration
- FMMU configuration
- DC support and parameters
- PDO mapping details (`-map`)
- Object dictionary entries (`-sdo`)

### 8.3 SDO shell command

```c
/**
 * @param slave    Slave index
 * @param index    Object index (hex)
 * @param subindex Subindex
 * @param value    Write value (ignored for read)
 * @param action   1 = read, 2 = write
 */
int Ec_SlaveOP(uint16 slave, uint16 index, uint8 subindex, uint8 value, uint16 action);
```

---

## 9. Shell commands

Both samples register commands with `SHELL_EXPORT_CMD`:

### `Ec_Sample_Test`

```
Ec_Sample_Test [ifname] [cyc_time_us]
```

Runs the EtherCAT sample (`ifname` is deprecated; `cyc_time_us == 0` selects the default 1 ms cycle).

Examples:

```
Ec_Sample_Test "" 2000    # 2 ms cycle
Ec_Sample_Test "" 0       # Default 1 ms cycle
```

### `Ec_SlaveInfo`

```
Ec_SlaveInfo [-sdo] [-map]
```

Scans and prints slave information. Options:

- `-sdo`: include SDO object dictionary
- `-map`: include PDO mapping

### `Ec_SlaveOP`

```
Ec_SlaveOP <slave> <index> <subindex> <value> <action>
```

Direct SDO read (`action=1`) or write (`action=2`).

---

## 10. Platform adaptation

### 10.1 OSAL

**File:** `osal/src/osal.c`

Abstracts OS services for SOEM; current port uses **FreeRTOS**.

| OSAL function | FreeRTOS implementation | Description |
|-----------|--------------|------|
| `osal_usleep(usec)` | `vTaskDelay(pdMS_TO_TICKS(...))` | Microsecond sleep |
| `osal_get_monotonic_time(ts)` | `xTaskGetTickCount()` | Monotonic time |
| `osal_monotonic_sleep(ts)` | `vTaskDelay(target_ticks - now)` | Absolute sleep |
| `osal_timer_start(t, us)` | Computes deadline | Start timer |
| `osal_timer_is_expired(t)` | Compare to now | Timeout check |
| `osal_mutex_create()` | `xSemaphoreCreateMutex()` | Create mutex |
| `osal_mutex_lock(m)` | `xSemaphoreTake(portMAX_DELAY)` | Lock |
| `osal_mutex_unlock(m)` | `xSemaphoreGive()` | Unlock |
| `osal_thread_create(...)` | `xTaskCreate(..., tskIDLE_PRIORITY+1)` | Normal thread |
| `osal_thread_create_rt(...)` | `xTaskCreate(..., MAX_PRIORITIES-1)` | RT thread |
| `osal_malloc(size)` | `pvPortMalloc(size)` | Allocate |
| `osal_free(ptr)` | `vPortFree(ptr)` | Free |

### 10.2 OSHW / NIC

**File:** `oshw/src/nicdrv.c`

Maps SOEM NIC operations onto McalCdd/Ethernet (`Eth.h`).

#### Platform hooks

| Function | Description |
|------|------|
| `ec_plat_init(ifname)` | Init Eth controller (`Eth_Init` + `Eth_SetControllerMode(ACTIVE)`) |
| `ec_plat_close()` | Shutdown (`Eth_SetControllerMode(DOWN)`) |
| `ec_plat_send(frame, len)` | Transmit (`Eth_ProvideTxBuffer` + `Eth_Transmit`) |
| `ec_plat_recv(frame, maxlen)` | Receive (`Eth_Receive_ethercat`, 10 ms timeout) |

#### Key macros

```c
#define ETH_FRAME_TYPE_ECAT  0x88A4U  /* EtherCAT EtherType */
#define ETH_CONTROLLER_IDX   0U       /* Use controller 0 */
#define ETH_TX_PRIORITY      0U       /* TX priority */
#define ETH_RX_BUFFER_SIZE   1536U    /* RX buffer size */
```

#### SOEM NIC API (upper layer)

| Function | Description |
|------|------|
| `ecx_setupnic(port, ifname, secondary)` | Init port, mutex, frame buffers |
| `ecx_closenic(port)` | Close port |
| `ecx_outframe(port, idx, stacknumber)` | Send frame at index |
| `ecx_inframe(port, idx, stacknumber)` | Receive/parse frame at index |
| `ecx_waitinframe(port, idx, timeout)` | Wait for frame with timeout |
| `ecx_srconfirm(port, idx, timeout)` | Send with confirmation (retries) |

---

## 11. Configuration macros

Defined in `core/inc/soem/ec_options.h`:

| Macro | Default | Description |
|------|--------|------|
| `EC_MAXSLAVE` | 200 | Maximum slaves |
| `EC_MAXGROUP` | 2 | Maximum groups |
| `EC_MAXBUF` | 16 | Frame buffers per channel |
| `EC_MAXMBX` | 1486 | Max mailbox size (bytes) |
| `EC_MBXPOOLSIZE` | 32 | Mailbox pool size |
| `EC_MAXEEPDO` | 0x200 | Max EEPROM PDO entries |
| `EC_MAXSM` | 8 | Max sync managers per slave |
| `EC_MAXFMMU` | 4 | Max FMMUs per slave |
| `EC_MAXNAME` | 40 | Max readable name length |
| `EC_MAXODLIST` | 1024 | Max OD list entries |
| `EC_MAXOELIST` | 256 | Max OE list entries |
| `EC_MAX_MAPT` | 1 | Concurrent mapping threads |
| `EC_LOGGROUPOFFSET` | 16 | Group logical address offset (2^16) |
| `EC_MAXELIST` | 64 | Max error list entries |
| `EC_MAXIOSEGMENTS` | 64 | Max IO segments per group |

---

## 12. Timeout constants

From `core/inc/soem/ec_options.h`:

| Constant | Value (µs) | Typical use |
|------|---------|---------|
| `EC_TIMEOUTRET` | 2,000 | Normal frame I/O |
| `EC_TIMEOUTRET3` | 6,000 | Triple-retry timeout |
| `EC_TIMEOUTSAFE` | 20,000 | Safe transmission (wireless, etc.) |
| `EC_TIMEOUTEEP` | 20,000 | EEPROM access |
| `EC_TIMEOUTTXM` | 20,000 | Mailbox transmit |
| `EC_TIMEOUTRXM` | 700,000 | Mailbox receive (SDO, etc.) |
| `EC_TIMEOUTSTATE` | 2,000,000 | State transition |

---

## 13. FAQ and troubleshooting

### Q1: `ecx_init` returns 0

**Possible causes:**

- `Eth_Init` or `Eth_SetControllerMode` failed
- Controller 0 not configured or not powered
- MCU and slave Ethernet speeds do not match

**Checks:**

1. Confirm McalCdd/Ethernet initialized (`Eth_Platform_Inited`)
2. Check cabling and controller configuration
3. Match MCU port speed to the slave

---

### Q2: `ecx_config_init` returns 0 (no slaves)

**Possible causes:**

- Cable unplugged or slave off
- Wrong EtherType (must be `0x88A4`)
- RX filter blocking EtherCAT frames
- Speed mismatch

**Checks:**

1. Verify physical link
2. Confirm `ETH_FRAME_TYPE_ECAT` is `0x88A4`
3. Confirm `Eth_Receive_ethercat` receives frames
4. Match port speeds

---

### Q3: WKC does not match `expectedWKC`

**Possible causes:**

- Slave link lost / reset
- Cycle time too short
- IOmap inconsistent

**Checks:**

1. Watch `ecatcheck` logs for `slave lost`
2. Increase `cycletime` (e.g. 1 ms → 2 ms)
3. Call `ecx_readstate` and inspect `state` / `ALstatuscode` per slave

---

### Q4: Stuck in SAFE_OP, cannot reach OPERATIONAL

**Possible causes:**

- PDO mapping error (`map_result` zero or wrong)
- `ALstatuscode` reports an error

**Checks:**

1. Log `map_result` and `expectedWKC`
2. After `ecx_readstate`, print each slave `ALstatuscode`
3. Common codes:
   - `0x001B`: Invalid mailbox configuration
   - `0x001D`: Invalid SM configuration
   - `0x001E`: Invalid SM3 configuration (outputs)

---

### Q5: Stack overflow

`ecx_config_map_group` walks slave EEPROM recursively and needs a large stack.

**Mitigation:**

- Give the bring-up task enough stack: `configMINIMAL_STACK_SIZE * 10` or more
- Use `uxTaskGetStackHighWaterMark` before/after tasks run

---

### Q6: Reading/writing SDO at runtime

SDO calls may run from any task (not real-time safe—avoid inside `ecatthread`):

```c
uint32_t value = 0;
int size = sizeof(value);
/* Read slave 1, object 0x1018 sub 0x02 (revision) */
int wkc = ecx_SDOread(&ctx, 1, 0x1018, 0x02, FALSE, &size, &value, EC_TIMEOUTRXM);
if (wkc > 0)
{
    LOG_INFO("Revision: 0x%08X\n", value);
}
```

---

### Q7: FoE firmware update

1. Move the slave to BOOT:

   ```c
   ctx.slavelist[slave].state = EC_STATE_BOOT;
   ecx_writestate(&ctx, slave);
   ecx_statecheck(&ctx, slave, EC_STATE_BOOT, EC_TIMEOUTSTATE);
   ```

2. Call FoE write APIs (see `ec_foe.h`)
3. Return the slave through INIT → PRE_OP → SAFE_OP → OPERATIONAL

---

---

## 14. Test cases

This section covers the **three** Shell-registered commands under `samples/EtherCAT/`. All steps use the serial Shell; no code changes are required.

> **Common prerequisites** (all tests):
> - Board powered, serial Shell responsive
> - At least one EtherCAT slave cabled to the board Ethernet port (controller 0)
> - Firmware built with `USE_SHELL_CMD` enabled

---

### Shell command cheat sheet

| Command | Source file | Purpose |
|------|---------|------|
| `Ec_SlaveInfo` | `slaveinfo/src/slaveinfo.c` | Scan slaves; optional `-sdo` / `-map` |
| `Ec_SlaveOP` | `slaveinfo/src/slaveinfo.c` | SDO upload / download |
| `Ec_Sample_Test` | `ec_sample/src/ec_sample.c` | Full EtherCAT sample |

---

### Ec_SlaveInfo: basic slave scan

**Goal:** Scan the bus and print basic hardware data for each slave.

**Syntax:**

```
Ec_SlaveInfo -sdo
Ec_SlaveInfo -map
Ec_SlaveInfo -sdo -map
```

> `Ec_SlaveInfo` requires at least one flag (`-sdo` or `-map`); with none, it prints usage and exits.

**Flags:**

| Flag | Meaning |
|------|------|
| `-sdo` | Print CoE object dictionary (needs CoE) |
| `-map` | Print PDO mapping (IO bit/byte layout) |
| `-sdo -map` | Both |

**Steps:**

1. Basic info + PDO mapping only (faster, about 2–5 s):

   ```
   Ec_SlaveInfo -map
   ```

2. Object dictionary only (slower, about 10–60 s depending on slave):

   ```
   Ec_SlaveInfo -sdo
   ```

3. Full (`-map` + `-sdo`):

   ```
   Ec_SlaveInfo -sdo -map
   ```

**Expected log excerpt** (`-map` example):

```
D-Robotics:/$ [0115.275660 0]INFO: Starting EtherCAT SDO write operation
[0115.275739 0]INFO: intmbxpool mbxp: mutex:
[0115.276190 0]INFO: ec_config_init
[0115.285230 0]INFO: ec_config_init wkc == 1
[0115.298250 0]INFO: ec_config_init context->slavecount == 1
[0115.434372 0]INFO: ec_config_map_group IOmap: group:216031240
[0115.435387 0]INFO:  >Slave 1, configadr 1001, state 2
[0115.436381 0]INFO: getmbx item:0 mbx:0x0CC52480
[0115.437401 0]INFO: dropmbx item:0 mbx:
[0115.438394 0]INFO: getmbx item:1 mbx:0x0CC52A4F
[0115.439400 0]INFO: dropmbx item:1 mbx:
[0115.440385 0]INFO: getmbx item:2 mbx:0x0CC5301E
[0115.441400 0]INFO: dropmbx item:2 mbx:
[0115.442390 0]INFO: getmbx item:3 mbx:0x0CC535ED
[0115.443424 0]INFO: dropmbx item:3 mbx:
[0115.444389 0]INFO: getmbx item:4 mbx:0x0CC53BBC
[0115.445410 0]INFO: dropmbx item:4 mbx:
[0115.448400 0]INFO: getmbx item:5 mbx:0x0CC5418B
[0115.449417 0]INFO: dropmbx item:5 mbx:
[0115.450395 0]INFO: getmbx item:6 mbx:0x0CC5475A
[0115.451410 0]INFO: dropmbx item:6 mbx:
[0115.452393 0]INFO: getmbx item:7 mbx:0x0CC54D29
[0115.453435 0]INFO: dropmbx item:7 mbx:
[0115.454399 0]INFO: getmbx item:8 mbx:0x0CC552F8
[0115.455420 0]INFO: dropmbx item:8 mbx:
[0115.458410 0]INFO: getmbx item:9 mbx:0x0CC558C7
[0115.459427 0]INFO: dropmbx item:9 mbx:
[0115.460405 0]INFO: getmbx item:10 mbx:0x0CC55E96
[0115.461420 0]INFO: dropmbx item:10 mbx:
[0115.464405 0]INFO: getmbx item:11 mbx:0x0CC56465
[0115.465441 0]INFO: dropmbx item:11 mbx:
[0115.465507 0]INFO:   CoE Osize:16 Isize:528
[0115.465757 0]INFO:   SM programming
[0115.466404 0]INFO:     SM2 Type:3 StartAddr:4x Flags:8x
[0115.467421 0]INFO:     SM3 Type:4 StartAddr:4x Flags:8x
...
[0131.040524 0]INFO:  UNSIGNED32   data16X 0x2X
[0131.040990 0]INFO: End slaveinfo, close socket
[0131.041543 0]INFO: Slaveinfo task completed
```

**Pass criteria:**

| Check | Pass if |
|--------|---------|
| Discovery | Log shows `N slaves found and configured.` (N ≥ 1) |
| Basics | Each slave prints `Name`, `Output size`, `Input size`, `State` |
| PDO (`-map`) | `SM2 outputs` or `SM3 inputs` address/index/width lines appear |
| SDO (`-sdo`) | CoE list includes at least `0x1000`, `0x1018` |
| Clean exit | `End slaveinfo, close socket` appears |

**Usage error** (no arguments):

```
Input error, please check the entered characters!
Usage:
  Ec_SlaveInfo <-sdo> <-map>
    -sdo: print SDO info
    -map: print mapping
  Examples:
  Ec_SlaveInfo -sdo -map - print SDO info and mapping
  Ec_SlaveInfo -sdo - print SDO info
  Ec_SlaveInfo -map - print mapping
```


### Ec_SlaveOP upload: SDO read

**Goal:** Read the current value of one SDO via Shell.

**Syntax:**

```
Ec_SlaveOP upload <slave> <index> <subindex>
```

| Argument | Type | Description |
|------|------|------|
| `upload` | Literal | Read (upload) |
| `<slave>` | Integer (0-based) | Slave position; **starts at 0** (internally +1 for EtherCAT address) |
| `<index>` | Hex | Object index, e.g. `0x1018` |
| `<subindex>` | Integer | Subindex, e.g. `1` |

> **Note:** `slave` is **0-based**; internally it maps to physical slave 1 when you pass `0`.

**Example:** Read led8 value on the first slave (`0x7010:08`):

```
Ec_SlaveOP upload 0 0x7010 8
```

**Expected log:**

```
D-Robotics:/$ Ec_SlaveOP upload 0 0x7010 8

D-Robotics:/$ [0238.504638 0]INFO: Starting EtherCAT SDO write operation
[0238.504717 0]INFO: intmbxpool mbxp: mutex:
[0238.505168 0]INFO: ec_config_init
[0238.514190 0]INFO: ec_config_init wkc == 1
[0238.527181 0]INFO: ec_config_init context->slavecount == 1
[0238.663320 0]INFO: ec_config_map_group IOmap: group:216031240
[0238.664339 0]INFO:  >Slave 1, configadr 1001, state 2
[0238.665328 0]INFO: getmbx item:0 mbx:0x0CC52480
[0238.666330 0]INFO: dropmbx item:0 mbx:
[0238.667326 0]INFO: getmbx item:1 mbx:0x0CC52A4F
[0238.668340 0]INFO: dropmbx item:1 mbx:
[0238.669348 0]INFO: getmbx item:2 mbx:0x0CC5301E
[0238.670335 0]INFO: dropmbx item:2 mbx:
[0238.671330 0]INFO: getmbx item:3 mbx:0x0CC535ED
[0238.672344 0]INFO: dropmbx item:3 mbx:
[0238.673333 0]INFO: getmbx item:4 mbx:0x0CC53BBC
[0238.674367 0]INFO: dropmbx item:4 mbx:
[0238.675334 0]INFO: getmbx item:5 mbx:0x0CC5418B
[0238.676349 0]INFO: dropmbx item:5 mbx:
[0238.677340 0]INFO: getmbx item:6 mbx:0x0CC5475A
[0238.678343 0]INFO: dropmbx item:6 mbx:
[0238.679361 0]INFO: getmbx item:7 mbx:0x0CC54D29
[0238.680353 0]INFO: dropmbx item:7 mbx:
...
[0238.708362 0]INFO: getmbx item:13 mbx:0x0CC57003
[0238.709399 0]INFO: dropmbx item:13 mbx:
[0238.709463 0]INFO: value == 0x0
[0238.709583 0]INFO: SDO read operation successful
[0238.710159 0]INFO: EtherCAT SDO write task completed
```

**Pass criteria:**

| Check | Pass if |
|--------|---------|
| Discovery | `N slaves found and configured.` (N ≥ 1) |
| Read OK | `value == 0xXXXXXXXX` and `SDO read operation successful` |
| No faults | No `SDO read operation failed` or `timeout` |

**Usage error** (bad args):

```
Input error, please check the entered characters!
Usage:
  Ec_SlaveCtl <download/upload> <slave> <index> <subindex> <value>
    download/upload: spi bus id
    slave: slave number
    index: index to write
    subindex: subindex to write or read
    value: the data written or the value obtained.
  Examples:
  Ec_SlaveCtl download 0 0x7010 0x8 1 - Set subindex 0x8 of 0x7010 to 1.
```

---

### Ec_SlaveOP download: SDO write

**Goal:** Write a new SDO value and verify by reading back.

**Syntax:**

```
Ec_SlaveOP download <slave> <index> <subindex> <value>
```

| Argument | Type | Description |
|------|------|------|
| `download` | Literal | Write (download) |
| `<slave>` | Integer (0-based) | Slave position, **starts at 0** |
| `<index>` | Hex | Object index |
| `<subindex>` | Integer | Subindex |
| `<value>` | Integer | Value in decimal or hex |

> **Note:** The write path moves the slave to SAFE_OP first; when finished the stack calls `ecx_close`.

**Example 1:** Set output control for slave 1 (`0x7010:08`) to `1`:

```
Ec_SlaveOP download 0 0x7010 8 1
```

**Verify:**

```
Ec_SlaveOP upload 0 0x7010 8
```

**Expected log (write path):**

```
D-Robotics:/$ Ec_SlaveOP download 0 0x7010 8 1

D-Robotics:/$ [0317.724882 0]INFO: Starting EtherCAT SDO write operation
[0317.724962 0]INFO: intmbxpool mbxp: mutex:
[0317.725415 0]INFO: ec_config_init
[0317.734450 0]INFO: ec_config_init wkc == 1
[0317.747428 0]INFO: ec_config_init context->slavecount == 1
[0317.883567 0]INFO: ec_config_map_group IOmap: group:216031240
[0317.884597 0]INFO:  >Slave 1, configadr 1001, state 2
[0317.885574 0]INFO: getmbx item:0 mbx:0x0CC52480
[0317.886577 0]INFO: dropmbx item:0 mbx:
[0317.887568 0]INFO: getmbx item:1 mbx:0x0CC52A4F
[0317.888587 0]INFO: dropmbx item:1 mbx:
[0317.889595 0]INFO: getmbx item:2 mbx:0x0CC5301E
[0317.890581 0]INFO: dropmbx item:2 mbx:
[0317.891578 0]INFO: getmbx item:3 mbx:0x0CC535ED
[0317.892590 0]INFO: dropmbx item:3 mbx:
[0317.893584 0]INFO: getmbx item:4 mbx:0x0CC53BBC
[0317.894613 0]INFO: dropmbx item:4 mbx:
[0317.895580 0]INFO: getmbx item:5 mbx:0x0CC5418B
[0317.896592 0]INFO: dropmbx item:5 mbx:
[0317.897587 0]INFO: getmbx item:6 mbx:0x0CC5475A
[0317.898589 0]INFO: dropmbx item:6 mbx:
[0317.899601 0]INFO: getmbx item:7 mbx:0x0CC54D29
[0317.900599 0]INFO: dropmbx item:7 mbx:
[0317.901592 0]INFO: getmbx item:8 mbx:0x0CC552F8
[0317.902593 0]INFO: dropmbx item:8 mbx:
[0317.903589 0]INFO: getmbx item:9 mbx:0x0CC558C7
[0317.904633 0]INFO: dropmbx item:9 mbx:
[0317.905590 0]INFO: getmbx item:10 mbx:0x0CC55E96
[0317.906597 0]INFO: dropmbx item:10 mbx:
[0317.907593 0]INFO: getmbx item:11 mbx:0x0CC56465
[0317.908609 0]INFO: dropmbx item:11 mbx:
[0317.908675 0]INFO:   CoE Osize:16 Isize:48
[0317.908915 0]INFO:   SM programming
[0317.909615 0]INFO:     SM2 Type:3 StartAddr:4x Flags:8x
[0317.910587 0]INFO:     SM3 Type:4 StartAddr:4x Flags:8x
[0317.910665 0]INFO:   OUTPUT MAPPING
[0317.911040 0]INFO:     FMMU 0
[0317.911398 0]INFO:       SM2
[0317.912590 0]INFO:     slave 1 Outputs  startbit 216031240
[0317.912669 0]INFO:  =Slave 1, INPUT MAPPING
[0317.913121 0]INFO:     FMMU 1
[0317.913504 0]INFO:       SM3
[0317.914616 0]INFO:     Inputs  startbit 216031242
[0317.914686 0]INFO:  =Slave 1, MBXSTATUS MAPPING
[0317.916593 0]INFO: IOmapSize 9
[0317.926610 0]INFO: getmbx item:12 mbx:0x0CC56A34
[0317.927624 0]INFO: dropmbx item:12 mbx:
[0317.928608 0]INFO: getmbx item:13 mbx:0x0CC57003
[0317.929650 0]INFO: dropmbx item:13 mbx:
[0317.929714 0]INFO: SDO write operation successful
[0317.930041 0]INFO: EtherCAT SDO write task completed
```

**Expected log (read-back):**

```
[0338.976953 0]INFO:     Inputs  startbit 216031242
[0338.977023 0]INFO:  =Slave 1, MBXSTATUS MAPPING
[0338.978932 0]INFO: IOmapSize 9
[0338.988949 0]INFO: getmbx item:12 mbx:0x0CC56A34
[0338.989947 0]INFO: dropmbx item:12 mbx:
[0338.990947 0]INFO: getmbx item:13 mbx:0x0CC57003
[0338.991977 0]INFO: dropmbx item:13 mbx:
[0338.992041 0]INFO: value == 0x1
[0338.992161 0]INFO: SDO read operation successful
[0338.992737 0]INFO: EtherCAT SDO write task completed
```

**Pass criteria:**

| Check | Pass if |
|--------|---------|
| Write OK | `SDO write operation successful` |
| Read-back | `upload` returns the same value as `download` |
| No faults | No `SDO write operation failed` or `Failed to reach SAFE_OP` |

**Common failures:**

| Symptom | Cause | Action |
|------|------|---------|
| `Failed to reach SAFE_OP state for SDO write` | No slave / init failed | Cable and power |
| `SDO write operation failed` | Read-only object or out-of-range value | Inspect with `-sdo` |
| `No slaves found for SDO write` | Empty bus | Physical link |

---

### Ec_Sample_Test: default cycle

**Goal:** Exercise full master flow—init, PDO exchange, auto shutdown—at the default 1 ms cycle.

**Syntax:**

```
Ec_Sample_Test <ifname> <cyc_time_us>
```

| Argument | Type | Description |
|------|------|------|
| `<ifname>` | String | Deprecated; pass `""`; driver uses controller 0 |
| `<cyc_time_us>` | Integer (µs) | PDO period; `0` = default 1000 µs (1 ms) |

**Steps — default 1 ms:**

```
Ec_Sample_Test "" 0
```

**Runtime behavior:**

- Command returns immediately after creating three FreeRTOS tasks
- `ECAT_BRINGUP` runs initialization and reaches OPERATIONAL
- `ECAT_RT` runs PDO I/O each 1 ms at highest priority
- `ECAT_CHK` polls slave health every 10 ms
- After ~**10 s** in OP (500 × 20 ms), the sample drops to INIT and cleans up

**Full-flow log example:**

```
D-Robotics:/$ Ec_Sample_Test
[065.290630 0]INFO: SOEM (Simple Open EtherCAT Master) ec_sample
[065.290708 0]INFO: Starting EtherCAT sample with cycle time: 1000000 us
[065.292044 0]INFO: Starting EtherCAT bringup task with stack size: 720
[065.292440 0]INFO: Initial stack high water mark: 836
[065.292895 0]INFO: EtherCAT Startup
[065.293313 0]INFO: intmbxpool mbxp: mutex:
[065.293834 0]INFO: ec_config_init

D-Robotics:/$ [065.302668 0]INFO: ec_config_init wkc == 1
[065.315680 0]INFO: ec_config_init context->slavecount == 1
[065.451817 0]INFO: Calling ecx_config_map_group (this may cause stack overflow)
[065.452062 0]INFO: ec_config_map_group IOmap: group:214037844
[065.453824 0]INFO:  >Slave 1, configadr 1001, state 2
[065.454827 0]INFO: getmbx item:0 mbx:0x0CC81198
[065.455835 0]INFO: dropmbx item:0 mbx:
[065.456826 0]INFO: getmbx item:1 mbx:0x0CC81767
[065.457846 0]INFO: dropmbx item:1 mbx:
[065.458837 0]INFO: getmbx item:2 mbx:0x0CC81D36
[065.459839 0]INFO: dropmbx item:2 mbx:
[065.460830 0]INFO: getmbx item:3 mbx:0x0CC82305
[065.461849 0]INFO: dropmbx item:3 mbx:
[065.462835 0]INFO: getmbx item:4 mbx:0x0CC828D4
[065.463846 0]INFO: dropmbx item:4 mbx:
[065.464834 0]INFO: getmbx item:5 mbx:0x0CC82EA3
[065.465855 0]INFO: dropmbx item:5 mbx:
...
[078.509090 0]INFO: EtherCAT operational loop completed
[078.509159 0]INFO: EtherCAT to SAFE_OP
[078.512061 0]INFO: EtherCAT to INIT
[078.514184 0]INFO: Final stack high water mark: 702
[078.514252 0]INFO: EtherCAT bringup completed
```

**Log field meanings:**

| Field | Meaning |
|------|------|
| `cycle` | PDO cycle counter (one line every 100 cycles) |
| `Wck` | WKC for the PDO frame; should track `expectedWKC` |
| `DCtime` | DC reference time (ns) |
| `dt` | Local vs DC clock error (ns); PI loop drives this toward 0 |

**Pass criteria:**

| Check | Pass if |
|--------|---------|
| Discovery | `N slaves found and configured.` (N ≥ 1) |
| OP | `EtherCAT OP` appears |
| WKC | `Wck` stable and non-zero |
| DC | `dt` shrinks over cycles when DC is present |
| Shutdown | `EtherCAT to SAFE_OP` → `EtherCAT to INIT` → `EtherCAT bringup completed` |

---
