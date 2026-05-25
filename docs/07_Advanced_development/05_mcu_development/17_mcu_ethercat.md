---
sidebar_position: 17
---

# 7.5.18 EtherCAT 用户手册

```mdx-code-block

import DocScope from '@site/src/components/DocScope';

```

## 1. 概述

<DocScope products="RDK S100">
本模块基于开源 **SOEM**（Simple Open EtherCAT Master）库，针对搭载 **FreeRTOS** 的嵌入式 MCU 平台（S100）进行了移植与适配。主要特性如下：
</DocScope>
<DocScope products="RDK S600">
本模块基于开源 **SOEM**（Simple Open EtherCAT Master）库，针对搭载 **FreeRTOS** 的嵌入式 MCU 平台（S600）进行了移植与适配。主要特性如下：
</DocScope>

| 特性 | 说明 |
|------|------|
| EtherCAT 主站 | 实现完整的 EtherCAT MainDevice（主站）功能 |
| 实时调度 | 通过 FreeRTOS 任务实现周期性过程数据收发 |
| 硬件适配 | 通过 McalCdd/Ethernet（`Eth.h`）驱动底层以太网收发 |
| 邮箱协议 | 支持 CoE、FoE、EoE、SoE、AoE 邮箱协议 |
| 分布式时钟 | 支持 DC 同步，提供 PI 控制器进行时钟对齐 |
| 从站诊断 | 支持从站状态检测、自动恢复与重配 |
| Shell 接口 | 提供交互式命令行测试入口 |

---

## 2. 软件架构

| 层级 | 模块 / 文件 | 说明 | 对外接口 |
|------|------------|------|---------|
| **用户应用层** | `ec_sample/src/ec_sample.c` | EtherCAT 完整运行示例，包含实时任务、检测任务与启动流程 | `EtherCAT_Sample_Start()` / Shell `Ec_Sample_Test` |
| **用户应用层** | `slaveinfo/src/slaveinfo.c` | 从站信息扫描、SDO 读写工具 | `EtherCAT_SlaveInfo_Start()` / Shell `Ec_SlaveInfo`、`Ec_SlaveOP` |
| **SOEM 核心层** | `core/src/ec_main.c` | 主站初始化、状态机、邮箱收发、EEPROM 读写 | `ecx_init` / `ecx_readstate` / `ecx_writestate` 等 |
| **SOEM 核心层** | `core/src/ec_config.c` | 从站自动枚举与 PDO 映射配置 | `ecx_config_init` / `ecx_config_map_group` |
| **SOEM 核心层** | `core/src/ec_coe.c` | CoE（CANopen over EtherCAT）SDO 读写、对象字典查询 | `ecx_SDOread` / `ecx_SDOwrite` / `ecx_readODlist` |
| **SOEM 核心层** | `core/src/ec_dc.c` | 分布式时钟（DC）配置与同步 | `ecx_configdc` |
| **SOEM 核心层** | `core/src/ec_foe.c` | FoE（File over EtherCAT）文件传输 | `ecx_FOEread` / `ecx_FOEwrite` |
| **SOEM 核心层** | `core/src/ec_eoe.c` | EoE（Ethernet over EtherCAT）以太网隧道 | `ecx_EOEsend` / `ecx_EOErecv` |
| **SOEM 核心层** | `core/src/ec_soe.c` | SoE（Servo over EtherCAT）伺服参数访问 | `ecx_SoEread` / `ecx_SoEwrite` |
| **SOEM 核心层** | `core/src/ec_base.c` | 底层 EtherCAT 帧构造与收发 | `ecx_send_processdata` / `ecx_receive_processdata` |
| **SOEM 核心层** | `core/src/ec_print.c` | 错误码与状态码转可读字符串 | `ec_ALstatuscode2string` / `ecx_elist2string` |
| **OSAL 抽象层** | `osal/src/osal.c` | OS 时间、任务、互斥锁的 FreeRTOS 适配实现 | `osal_usleep` / `osal_mutex_lock` 等 |
| **OSHW/NIC 层** | `oshw/src/nicdrv.c` | 网络收发适配，将 SOEM 帧操作映射到 McalCdd/Ethernet API | `ecx_setupnic` / `ecx_outframe` / `ecx_inframe` |
| **OSHW/NIC 层** | `oshw/src/oshw.c` | 字节序转换工具（大小端互转） | `oshw_htons` / `oshw_ntohs` |
| **硬件层** | 以太网控制器 Controller 0 | 物理网口，收发 EtherCAT 帧（ETH 类型 `0x88A4`） | McalCdd `Eth_Transmit` / `Eth_Receive_ethercat` |

---

## 3. 目录结构

```
McalCdd/EtherCAT/
├── SConscript                  # 顶层构建脚本
├── README.md                   # 原始说明
├── core/                       # SOEM 核心源码
│   ├── SConscript
│   ├── src/
│   │   ├── ec_main.c           # 主功能：初始化、状态机、邮箱
│   │   ├── ec_config.c         # 从站自动配置（PDO 映射）
│   │   ├── ec_coe.c            # CoE（CANopen over EtherCAT）SDO 操作
│   │   ├── ec_dc.c             # 分布式时钟（DC）配置
│   │   ├── ec_eoe.c            # EoE（Ethernet over EtherCAT）
│   │   ├── ec_foe.c            # FoE（File over EtherCAT）
│   │   ├── ec_soe.c            # SoE（Servo over EtherCAT）
│   │   ├── ec_base.c           # 底层帧操作
│   │   └── ec_print.c          # 调试打印工具
│   └── inc/
│       ├── nicdrv.h            # NIC 驱动接口
│       ├── osal.h              # OSAL 接口
│       ├── osal_defs.h         # OSAL 类型定义
│       ├── oshw.h              # OS/HW 工具接口
│       └── soem/
│           ├── soem.h          # 总头文件（一键包含）
│           ├── ec_main.h       # 数据结构与主 API 声明
│           ├── ec_type.h       # 基本类型、枚举、宏
│           ├── ec_options.h    # 编译期配置参数
│           ├── ec_coe.h        # CoE API 声明
│           ├── ec_config.h     # 配置 API 声明
│           ├── ec_dc.h         # DC API 声明
│           ├── ec_eoe.h        # EoE API 声明
│           ├── ec_foe.h        # FoE API 声明
│           ├── ec_soe.h        # SoE API 声明
│           └── ec_print.h      # 打印工具声明
├── osal/                       # FreeRTOS OSAL 实现
│   ├── SConscript
│   └── src/osal.c
└── oshw/                       # 硬件驱动适配
    ├── SConscript
    └── src/
        ├── nicdrv.c            # McalCdd/Ethernet NIC 驱动
        └── oshw.c              # 字节序工具

samples/EtherCAT/
├── SConscript
├── ec_sample/
│   ├── SConscript
│   └── src/ec_sample.c        # 基本运行示例
└── slaveinfo/
    ├── SConscript
    └── src/slaveinfo.c        # 从站信息扫描示例
```

---

## 4. 关键数据结构

### 4.1 ecx_contextt — 主站上下文

所有 SOEM API 均以此结构体的指针作为第一个参数。应用层需声明一个该类型的静态变量：

```c
static ecx_contextt ctx;
```

主要成员：

| 成员 | 类型 | 说明 |
|------|------|------|
| `port` | `ecx_portt` | 网络端口（含帧缓冲、互斥锁） |
| `slavelist[]` | `ec_slavet[EC_MAXSLAVE]` | 从站列表，下标 0 为广播虚拟从站 |
| `slavecount` | `int` | 实际发现的从站数量 |
| `grouplist[]` | `ec_groupt[EC_MAXGROUP]` | 从站分组信息 |
| `ecaterror` | `boolean` | 是否存在 EtherCAT 错误 |
| `DCtime` | `int64` | 从站 DC 时间（ns） |
| `ENI` | `ec_enit *` | EtherCAT 网络信息（可选） |
| `FOEhook` | 函数指针 | FoE 数据回调钩子 |
| `EOEhook` | 函数指针 | EoE 数据回调钩子 |
| `manualstatechange` | `int` | 0=自动状态转换，1=手动控制 |
| `overlappedMode` | `boolean` | 重叠模式（适用于 TI ESC） |
| `packedMode` | `boolean` | 紧凑 PDO 映射模式 |

### 4.2 ec_slavet — 从站信息

| 成员 | 说明 |
|------|------|
| `state` | 当前从站状态（`ec_state` 枚举值） |
| `ALstatuscode` | AL 状态码，错误时提供具体原因 |
| `configadr` | 配置地址（站地址） |
| `eep_man` / `eep_id` / `eep_rev` | EEPROM 中的厂商/产品/版本信息 |
| `Obytes` / `Ibytes` | 输出/输入字节数 |
| `outputs` / `inputs` | 指向 IOmap 中对应区域的指针 |
| `hasdc` | 是否支持分布式时钟 |
| `CoEdetails` | CoE 功能标志位 |
| `mbx_proto` | 支持的邮箱协议位掩码 |
| `islost` | 从站是否已丢失连接 |
| `name` | 从站可读名称字符串 |

### 4.3 ec_groupt — 从站分组

| 成员 | 说明 |
|------|------|
| `Obytes` / `Ibytes` | 整组输出/输入字节数 |
| `outputsWKC` / `inputsWKC` | 期望的工作计数器值 |
| `docheckstate` | 需要执行状态检查标志 |
| `hasdc` | 组内是否有 DC 从站 |

---

## 5. 从站状态机

EtherCAT 从站遵循以下状态机（ESM）：

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

各状态对应枚举值：

| 枚举值 | 数值 | 说明 |
|--------|------|------|
| `EC_STATE_NONE` | 0x00 | 无效状态 |
| `EC_STATE_INIT` | 0x01 | 初始化 |
| `EC_STATE_PRE_OP` | 0x02 | 预运行 |
| `EC_STATE_BOOT` | 0x03 | 引导状态（固件更新） |
| `EC_STATE_SAFE_OP` | 0x04 | 安全运行（只读 PDO） |
| `EC_STATE_OPERATIONAL` | 0x08 | 运行（全双工 PDO） |
| `EC_STATE_ERROR` | 0x10 | 错误/ACK |

写状态示例：

```c
/* 请求所有从站进入 OPERATIONAL */
ctx.slavelist[0].state = EC_STATE_OPERATIONAL;
ecx_writestate(&ctx, 0);
/* 等待确认（超时 2s） */
ecx_statecheck(&ctx, 0, EC_STATE_OPERATIONAL, EC_TIMEOUTSTATE);
```

---

## 6. API 参考

### 6.1 初始化与关闭

#### `ecx_init`

```c
int ecx_init(ecx_contextt *context, const char *ifname);
```

初始化 EtherCAT 主站，打开底层网络接口。

| 参数 | 说明 |
|------|------|
| `context` | 主站上下文指针 |
| `ifname` | 网络接口名称（嵌入式平台填 `NULL`，默认使用控制器 0） |

**返回值**：成功返回非零值，失败返回 0。

```c
int rv = ecx_init(&ctx, NULL);
if (rv == 0) {
    /* 初始化失败 */
}
```

#### `ecx_close`

```c
void ecx_close(ecx_contextt *context);
```

关闭主站，释放底层网络资源。

---

### 6.2 从站配置

#### `ecx_config_init`

```c
int ecx_config_init(ecx_contextt *context);
```

扫描总线上的所有从站，将其配置至 PRE_OP 状态，填充 `ctx.slavelist[]` 和 `ctx.slavecount`。

**返回值**：发现的从站数量。

#### `ecx_config_map_group`

```c
int ecx_config_map_group(ecx_contextt *context, void *pIOmap, uint8 group);
```

为指定分组的所有从站配置 PDO 映射，将输入/输出区域映射到 `pIOmap` 缓冲区。

| 参数 | 说明 |
|------|------|
| `context` | 主站上下文 |
| `pIOmap` | IO 映射缓冲区（建议 4096 字节） |
| `group` | 分组编号（0 表示默认分组） |

**返回值**：映射成功的 IO 字节总数。

```c
static uint8 IOmap[4096];
int map_result = ecx_config_map_group(&ctx, IOmap, 0);
```

配置完成后可获取期望工作计数器：

```c
ec_groupt *group = &ctx.grouplist[0];
int expectedWKC = (group->outputsWKC * 2) + group->inputsWKC;
```

#### `ecx_reconfig_slave`

```c
int ecx_reconfig_slave(ecx_contextt *context, uint16 slave, int timeout);
```

重新配置指定从站（用于故障恢复）。成功返回值 >= `EC_STATE_PRE_OP`。

#### `ecx_recover_slave`

```c
int ecx_recover_slave(ecx_contextt *context, uint16 slave, int timeout);
```

恢复已丢失连接的从站。

---

### 6.3 状态管理

#### `ecx_readstate`

```c
int ecx_readstate(ecx_contextt *context);
```

读取所有从站当前状态，更新 `ctx.slavelist[i].state`。

**返回值**：最低优先级从站的状态值。

#### `ecx_writestate`

```c
int ecx_writestate(ecx_contextt *context, uint16 slave);
```

向指定从站写入 `ctx.slavelist[slave].state` 中设置的目标状态。`slave=0` 时广播到所有从站。

#### `ecx_statecheck`

```c
uint16 ecx_statecheck(ecx_contextt *context, uint16 slave, uint16 reqstate, int timeout);
```

轮询等待从站达到目标状态，直到超时。

| 参数 | 说明 |
|------|------|
| `slave` | 从站编号，0=所有 |
| `reqstate` | 期望的目标状态 |
| `timeout` | 超时时间（微秒），建议使用 `EC_TIMEOUTSTATE`（2s） |

**返回值**：当前达到的状态值。

---

### 6.4 过程数据（PDO）

PDO 通信是 EtherCAT 实时数据交换的核心，须在专用实时任务中周期性调用。

#### `ecx_send_processdata`

```c
int ecx_send_processdata(ecx_contextt *context);
```

发送所有分组的过程数据帧（将 `outputs` 区域内容发送到从站）。

#### `ecx_receive_processdata`

```c
int ecx_receive_processdata(ecx_contextt *context, int timeout);
```

接收过程数据响应帧（将从站输入更新至 `inputs` 区域）。

**返回值**：工作计数器（WKC）。应与 `expectedWKC` 比较以检测通信异常。

#### `ecx_send_processdata_group` / `ecx_receive_processdata_group`

分组版本，只操作指定分组：

```c
int ecx_send_processdata_group(ecx_contextt *context, uint8 group);
int ecx_receive_processdata_group(ecx_contextt *context, uint8 group, int timeout);
```

#### PDO 数据访问

配置映射完成后，可通过 `ec_slavet` 中的指针直接读写 PDO 数据：

```c
ec_slavet *slave = &ctx.slavelist[1];

/* 写输出数据（主站 → 从站） */
memcpy(slave->outputs, &my_output, slave->Obytes);

/* 读输入数据（从站 → 主站） */
memcpy(&my_input, slave->inputs, slave->Ibytes);
```

---

### 6.5 邮箱协议（CoE / SDO）

#### SDO 读取

```c
int ecx_SDOread(ecx_contextt *context,
                uint16 slave, uint16 index, uint8 subindex,
                boolean CA, int *psize, void *p, int timeout);
```

从指定从站读取一个 SDO 对象。

| 参数 | 说明 |
|------|------|
| `slave` | 从站编号（1 起） |
| `index` | 对象字典索引 |
| `subindex` | 子索引 |
| `CA` | 是否使用完整访问（Complete Access） |
| `psize` | 传入缓冲区大小，返回实际读取字节数 |
| `p` | 数据缓冲区指针 |
| `timeout` | 超时（µs），建议 `EC_TIMEOUTRXM`（700ms） |

**返回值**：工作计数器（> 0 表示成功）。

```c
uint32_t vendor_id = 0;
int size = sizeof(vendor_id);
int wkc = ecx_SDOread(&ctx, 1, 0x1018, 0x01, FALSE, &size, &vendor_id, EC_TIMEOUTRXM);
```

#### SDO 写入

```c
int ecx_SDOwrite(ecx_contextt *context,
                 uint16 Slave, uint16 Index, uint8 SubIndex,
                 boolean CA, int psize, const void *p, int Timeout);
```

向指定从站写入一个 SDO 对象。

```c
uint16_t mode = 0x0008; /* 例如：设置运行模式 */
ecx_SDOwrite(&ctx, 1, 0x6060, 0x00, FALSE, sizeof(mode), &mode, EC_TIMEOUTRXM);
```

#### 邮箱处理任务

对于支持 CoE 的从站，须在循环任务中定期调用邮箱处理函数：

```c
ecx_mbxhandler(&ctx, 0, 4);  /* 处理分组 0，最多 4 条消息 */
```

将从站加入循环邮箱处理：

```c
ecx_slavembxcyclic(&ctx, slave_index);
```

#### CoE 对象字典查询

```c
/* 读取对象字典列表 */
ec_ODlistt ODlist;
ecx_readODlist(&ctx, slave, &ODlist);

/* 读取对象描述 */
ecx_readODdescription(&ctx, item, &ODlist);

/* 读取对象条目信息 */
ec_OElistt OElist;
ecx_readOE(&ctx, item, &ODlist, &OElist);
```

---

### 6.6 分布式时钟（DC）

#### `ecx_configdc`

```c
int ecx_configdc(ecx_contextt *context);
```

配置所有支持 DC 的从站的分布式时钟，使其与第一个 DC 从站同步。应在 `ecx_config_map_group` 之后调用。

#### DC 时间同步（PI 控制器）

应用层通常使用 PI 控制器将本地系统时钟与 DC 时间对齐，示例见 `ec_sample.c`：

```c
static float pgain = 0.01f;
static float igain = 0.00002f;
static int64 syncoffset = 500000; /* 500µs 偏移 */

void ec_sync(int64 reftime, int64 cycletime, int64 *offsettime)
{
    static int64 integral = 0;
    int64 delta = (reftime - syncoffset) % cycletime;
    if (delta > (cycletime / 2)) delta -= cycletime;
    integral += -delta;
    *offsettime = (int64)((-delta * pgain) + (integral * igain));
}
```

在实时任务中使用：

```c
if (ctx.slavelist[0].hasdc && (wkc > 0))
{
    ec_sync(ctx.DCtime, cycletime, &toff);
}
```

---

### 6.7 错误处理

#### 错误栈操作

```c
/* 检查是否有未读错误 */
boolean ecx_iserror(ecx_contextt *context);

/* 从错误栈弹出一个错误 */
boolean ecx_poperror(ecx_contextt *context, ec_errort *Ec);
```

`ec_errort` 结构体：

| 成员 | 说明 |
|------|------|
| `Time` | 错误发生时间 |
| `Slave` | 产生错误的从站编号 |
| `Index` / `SubIdx` | CoE 对象索引/子索引 |
| `Etype` | 错误类型（`ec_err_type` 枚举） |
| `AbortCode` | SDO 中止代码（CoE 错误时有效） |

错误类型枚举：

| 枚举值 | 说明 |
|--------|------|
| `EC_ERR_TYPE_SDO_ERROR` | SDO 错误 |
| `EC_ERR_TYPE_EMERGENCY` | 紧急报文 |
| `EC_ERR_TYPE_PACKET_ERROR` | 数据包错误 |
| `EC_ERR_TYPE_FOE_ERROR` | FoE 错误 |
| `EC_ERR_TYPE_SOE_ERROR` | SoE 错误 |
| `EC_ERR_TYPE_MBX_ERROR` | 邮箱错误 |

---

## 7. 快速入门：ec_sample

`samples/EtherCAT/ec_sample/src/ec_sample.c` 提供了一个完整的 EtherCAT 主站运行示例，展示了从初始化到运行再到关闭的全流程。

### 7.1 总体流程

```
EtherCAT_Sample_Start(cycle_time_us)
       │
       ├─ xTaskCreate("ECAT_RT", ecatthread, ...)      ← 最高优先级
       ├─ xTaskCreate("ECAT_CHK", ecatcheck, ...)      ← 低优先级
       └─ xTaskCreate("ECAT_BRINGUP", EtherCAT_Bringup_Task, ...)
                │
                └─ ecatbringup()
                        ├─ ecx_init(&ctx, NULL)
                        ├─ ecx_config_init(&ctx)
                        ├─ ecx_config_map_group(&ctx, IOmap, 0)
                        ├─ ecx_configdc(&ctx)
                        ├─ ecx_slavembxcyclic()        ← 注册 CoE 从站
                        ├─ ecx_writestate() → OPERATIONAL
                        ├─ [运行循环 500×20ms]
                        └─ ecx_writestate() → SAFE_OP → INIT
```

### 7.2 启动函数

```c
/**
 * 启动 EtherCAT 示例
 * @param cycle_time_us  周期时间（微秒），传 0 则使用默认 1000µs
 * @return 0 = 成功
 */
int EtherCAT_Sample_Start(int cycle_time_us);
```

### 7.3 实时任务（ecatthread）

运行在最高 FreeRTOS 优先级，周期性执行：

```c
void ecatthread(void *pvParameters)
{
    /* 等待映射完成 */
    while (!mappingdone) osal_usleep(100);

    /* 获取初始时间基准 */
    osal_get_monotonic_time(&ts);

    while (1)
    {
        /* 计算并等待下一周期开始时刻 */
        add_time_ns(&ts, cycletime + toff);
        osal_monotonic_sleep(&ts);

        if (dorun > 0)
        {
            wkc = ecx_receive_processdata(&ctx, EC_TIMEOUTRET);

            /* DC 时间同步 */
            if (ctx.slavelist[0].hasdc && (wkc > 0))
                ec_sync(ctx.DCtime, cycletime, &toff);

            /* 邮箱处理 */
            ecx_mbxhandler(&ctx, 0, 4);

            ecx_send_processdata(&ctx);
        }

        vTaskDelay(1);
    }
}
```

### 7.4 故障检测任务（ecatcheck）

运行在低优先级（每 10ms 执行一次），负责监控和恢复异常从站：

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
                    /* 清除错误 ACK */
                else if (slave->state == EC_STATE_SAFE_OP)
                    /* 推回 OPERATIONAL */
                else if (slave->state > EC_STATE_NONE)
                    ecx_reconfig_slave(...);  /* 重配 */
                else if (slave->islost)
                    ecx_recover_slave(...);   /* 恢复 */
            }
        }
        vTaskDelay(pdMS_TO_TICKS(10));
    }
}
```

### 7.5 FreeRTOS 任务参数汇总

| 任务名 | 函数 | 栈大小 | 优先级 |
|--------|------|--------|--------|
| `ECAT_RT` | `ecatthread` | `configMINIMAL_STACK_SIZE × 8` | `configMAX_PRIORITIES - 1`（最高） |
| `ECAT_CHK` | `ecatcheck` | `configMINIMAL_STACK_SIZE × 8` | `tskIDLE_PRIORITY + 1` |
| `ECAT_BRINGUP` | `EtherCAT_Bringup_Task` | `configMINIMAL_STACK_SIZE × 10` | `configMAX_PRIORITIES - 2` |

> **注意**：`ecx_config_map_group` 会消耗较大栈空间，因此 Bringup 任务使用了更大的栈。

---

## 8. 从站信息查询：slaveinfo

`samples/EtherCAT/slaveinfo/src/slaveinfo.c` 提供了扫描并打印总线上所有从站详细信息的工具。

### 8.1 启动函数

```c
/**
 * 启动从站信息扫描
 * @param sdo_flag  是否打印 SDO 对象字典信息
 * @param map_flag  是否打印 PDO 映射信息
 */
void EtherCAT_SlaveInfo_Start(boolean sdo_flag, boolean map_flag);
```

### 8.2 输出内容

扫描完成后将逐一打印每个从站的以下信息：

- 从站编号、名称
- 厂商 ID、产品码、修订号、序列号
- 输出/输入字节数
- 支持的邮箱协议（CoE / FoE / EoE / SoE / AoE）
- SM（同步管理器）配置
- FMMU 配置
- DC 支持情况与参数
- PDO 映射详情（`-map` 标志）
- 对象字典条目（`-sdo` 标志）

### 8.3 SDO 操作命令

通过 Shell 命令可直接执行 SDO 读写：

```c
/**
 * @param slave    从站编号
 * @param index    对象索引（十六进制）
 * @param subindex 子索引
 * @param value    写入值（读操作时忽略）
 * @param action   1=读, 2=写
 */
int Ec_SlaveOP(uint16 slave, uint16 index, uint8 subindex, uint8 value, uint16 action);
```

---

## 9. Shell 命令接口

两个示例程序均通过 `SHELL_EXPORT_CMD` 宏向 Shell 系统注册了命令，可在运行时直接调用：

### `Ec_Sample_Test`

```
Ec_Sample_Test [ifname] [cyc_time_us]
```

启动 EtherCAT 示例（`ifname` 参数已废弃，`cyc_time_us=0` 使用默认 1ms 周期）。

示例：
```
Ec_Sample_Test "" 2000    # 2ms 周期运行
Ec_Sample_Test "" 0       # 默认 1ms 周期
```

### `Ec_SlaveInfo`

```
Ec_SlaveInfo [-sdo] [-map]
```

扫描并打印从站信息。可选参数：
- `-sdo`：同时打印 SDO 对象字典
- `-map`：同时打印 PDO 映射

### `Ec_SlaveOP`

```
Ec_SlaveOP <slave> <index> <subindex> <value> <action>
```

直接对从站执行 SDO 读（`action=1`）或写（`action=2`）操作。

---

## 10. 平台适配层

### 10.1 OSAL（操作系统抽象层）

**文件**：`osal/src/osal.c`

将 SOEM 对操作系统的依赖抽象为统一接口，当前实现基于 **FreeRTOS**。

| OSAL 函数 | FreeRTOS 实现 | 说明 |
|-----------|--------------|------|
| `osal_usleep(usec)` | `vTaskDelay(pdMS_TO_TICKS(...))` | 微秒级睡眠 |
| `osal_get_monotonic_time(ts)` | `xTaskGetTickCount()` | 获取单调时间 |
| `osal_monotonic_sleep(ts)` | `vTaskDelay(target_ticks - now)` | 绝对时间睡眠 |
| `osal_timer_start(t, us)` | 计算截止时间点 | 启动定时器 |
| `osal_timer_is_expired(t)` | 与当前时间比较 | 检查超时 |
| `osal_mutex_create()` | `xSemaphoreCreateMutex()` | 创建互斥锁 |
| `osal_mutex_lock(m)` | `xSemaphoreTake(portMAX_DELAY)` | 加锁 |
| `osal_mutex_unlock(m)` | `xSemaphoreGive()` | 解锁 |
| `osal_thread_create(...)` | `xTaskCreate(..., tskIDLE_PRIORITY+1)` | 创建普通线程 |
| `osal_thread_create_rt(...)` | `xTaskCreate(..., MAX_PRIORITIES-1)` | 创建实时线程 |
| `osal_malloc(size)` | `pvPortMalloc(size)` | 内存分配 |
| `osal_free(ptr)` | `vPortFree(ptr)` | 内存释放 |

### 10.2 OSHW / NIC 驱动层

**文件**：`oshw/src/nicdrv.c`

将 SOEM 对网络硬件的依赖适配到 McalCdd/Ethernet 驱动（`Eth.h`）。

#### 底层平台接口

| 函数 | 说明 |
|------|------|
| `ec_plat_init(ifname)` | 初始化 Eth 控制器（调用 `Eth_Init` + `Eth_SetControllerMode(ACTIVE)`） |
| `ec_plat_close()` | 关闭 Eth 控制器（`Eth_SetControllerMode(DOWN)`） |
| `ec_plat_send(frame, len)` | 发送帧（`Eth_ProvideTxBuffer` + `Eth_Transmit`） |
| `ec_plat_recv(frame, maxlen)` | 接收帧（`Eth_Receive_ethercat`，超时 10ms） |

#### 关键配置

```c
#define ETH_FRAME_TYPE_ECAT  0x88A4U  /* EtherCAT 帧类型 */
#define ETH_CONTROLLER_IDX   0U       /* 使用控制器 0 */
#define ETH_TX_PRIORITY      0U       /* 发送优先级 */
#define ETH_RX_BUFFER_SIZE   1536U    /* 接收缓冲区大小 */
```

#### SOEM NIC 接口（上层调用）

| 函数 | 说明 |
|------|------|
| `ecx_setupnic(port, ifname, secondary)` | 初始化端口，创建互斥锁，设置帧缓冲 |
| `ecx_closenic(port)` | 关闭端口 |
| `ecx_outframe(port, idx, stacknumber)` | 发送指定索引的帧 |
| `ecx_inframe(port, idx, stacknumber)` | 接收并解析指定索引的帧 |
| `ecx_waitinframe(port, idx, timeout)` | 等待接收指定索引帧，支持超时 |
| `ecx_srconfirm(port, idx, timeout)` | 发送并确认（带重试） |

---

## 11. 配置宏参考

所有配置宏定义于 `core/inc/soem/ec_options.h`：

| 宏名 | 默认值 | 说明 |
|------|--------|------|
| `EC_MAXSLAVE` | 200 | 最大从站数量 |
| `EC_MAXGROUP` | 2 | 最大分组数量 |
| `EC_MAXBUF` | 16 | 每通道帧缓冲数量 |
| `EC_MAXMBX` | 1486 | 邮箱最大字节数 |
| `EC_MBXPOOLSIZE` | 32 | 邮箱池大小 |
| `EC_MAXEEPDO` | 0x200 | EEPROM PDO 条目最大数 |
| `EC_MAXSM` | 8 | 每从站最大 SM 数 |
| `EC_MAXFMMU` | 4 | 每从站最大 FMMU 数 |
| `EC_MAXNAME` | 40 | 可读名称最大长度 |
| `EC_MAXODLIST` | 1024 | 对象字典列表最大条目 |
| `EC_MAXOELIST` | 256 | 对象条目列表最大条目 |
| `EC_MAX_MAPT` | 1 | 映射并发线程数 |
| `EC_LOGGROUPOFFSET` | 16 | 分组逻辑地址偏移（2^16） |
| `EC_MAXELIST` | 64 | 错误列表最大条目 |
| `EC_MAXIOSEGMENTS` | 64 | 每组最大 IO 分段数 |

---

## 12. 超时常量参考

定义于 `core/inc/soem/ec_options.h`：

| 常量 | 值（µs） | 适用场景 |
|------|---------|---------|
| `EC_TIMEOUTRET` | 2,000 | 普通帧收发超时 |
| `EC_TIMEOUTRET3` | 6,000 | 三重重试超时 |
| `EC_TIMEOUTSAFE` | 20,000 | 安全传输（无线等） |
| `EC_TIMEOUTEEP` | 20,000 | EEPROM 读写超时 |
| `EC_TIMEOUTTXM` | 20,000 | 邮箱发送超时 |
| `EC_TIMEOUTRXM` | 700,000 | 邮箱接收超时（SDO 等） |
| `EC_TIMEOUTSTATE` | 2,000,000 | 状态切换超时 |

---

## 13. 常见问题与故障排查

### Q1：`ecx_init` 返回 0，初始化失败

**可能原因**：
- `Eth_Init` 或 `Eth_SetControllerMode` 调用失败
- 控制器 0 未正确配置或未上电
- MCU网口速率和从站网口速率不一致

**排查**：
1. 确认 McalCdd/Ethernet 模块已正确初始化（`Eth_Platform_Inited` 标志）
2. 检查硬件连接和以太网控制器配置
3. 检查MCU网口速率与从站速率是否一致

---

### Q2：`ecx_config_init` 返回 0，未发现从站

**可能原因**：
- 网线未连接或从站未上电
- 以太网帧类型不匹配（应为 `0x88A4`）
- 接收滤波器未放通 EtherCAT 帧
- MCU网口速率和从站网口速率不一致

**排查**：
1. 确认物理连接正常
2. 检查 `ETH_FRAME_TYPE_ECAT` 宏是否为 `0x88A4`
3. 检查 `Eth_Receive_ethercat` 是否被正确实现，能收到 EtherCAT 帧
4. 检查MCU网口速率与从站速率是否一致
---

### Q3：WKC 持续与 expectedWKC 不符

**可能原因**：
- 从站通信中断（掉线/复位）
- 周期时间过短，从站来不及响应
- IOmap 映射不一致

**排查**：
1. 检查 `ecatcheck` 任务日志，确认是否有 `slave lost` 告警
2. 适当增大 `cycletime`（如从 1ms 改为 2ms）
3. 调用 `ecx_readstate` 逐从站检查 `state` 和 `ALstatuscode`

---

### Q4：从站卡在 SAFE_OP，无法进入 OPERATIONAL

**可能原因**：
- PDO 映射错误（`map_result` 为 0 或异常）
- 从站 `ALstatuscode` 报错

**排查**：
1. 打印 `map_result` 和 `expectedWKC`
2. 执行 `ecx_readstate` 后打印每个从站的 `ALstatuscode`
3. 常见 ALstatuscode：
   - `0x001B`：无效邮箱配置
   - `0x001D`：SM 配置无效
   - `0x001E`：无效 SM3 配置（输出 PDO）

---

### Q5：栈溢出（Stack Overflow）

`ecx_config_map_group` 会递归处理从站 EEPROM 数据，消耗较大栈空间。

**解决方法**：
- 确保 Bringup 任务使用足够大的栈：`configMINIMAL_STACK_SIZE * 10` 或更大
- 在任务执行前后调用 `uxTaskGetStackHighWaterMark` 监控栈使用情况

---

### Q6：如何在运行时读写 SDO

SDO 操作可以在任意任务中调用（非实时安全，不应在 `ecatthread` 中调用）：

```c
uint32_t value = 0;
int size = sizeof(value);
/* 读取从站 1，对象 0x1018 子索引 0x02（修订号） */
int wkc = ecx_SDOread(&ctx, 1, 0x1018, 0x02, FALSE, &size, &value, EC_TIMEOUTRXM);
if (wkc > 0)
{
    LOG_INFO("Revision: 0x%08X\n", value);
}
```

---

### Q7：如何通过 FoE 更新从站固件

1. 将从站切换到 BOOT 状态：
   ```c
   ctx.slavelist[slave].state = EC_STATE_BOOT;
   ecx_writestate(&ctx, slave);
   ecx_statecheck(&ctx, slave, EC_STATE_BOOT, EC_TIMEOUTSTATE);
   ```
2. 调用 FoE 写入接口（参见 `ec_foe.h`）
3. 完成后将从站切回 INIT → PRE_OP → SAFE_OP → OPERATIONAL

---

---

## 14. 测试用例

本章仅介绍 `samples/EtherCAT/` 目录下通过 Shell 注册的 **3 条命令**的使用方法。所有操作均在串口 Shell 交互界面中完成，无需修改代码。

> **通用前置条件**（适用于全部测试用例）：
> - 目标板已上电，串口 Shell 可正常交互
> - 至少一台 EtherCAT 从站通过网线连接至板卡以太网口（控制器 0）
> - 工程编译时已启用 `USE_SHELL_CMD` 宏

---

### Shell 命令速查

| 命令 | 来源文件 | 功能 |
|------|---------|------|
| `Ec_SlaveInfo` | `slaveinfo/src/slaveinfo.c` | 扫描从站信息，可附加 `-sdo` / `-map` 选项 |
| `Ec_SlaveOP` | `slaveinfo/src/slaveinfo.c` | SDO 读（upload）/ 写（download） |
| `Ec_Sample_Test` | `ec_sample/src/ec_sample.c` | 启动 EtherCAT 完整运行示例 |

---

### Ec_SlaveInfo：从站基本信息扫描

**测试目的**：扫描总线，打印所有从站的基本硬件信息。

**命令格式**：

```
Ec_SlaveInfo -sdo
Ec_SlaveInfo -map
Ec_SlaveInfo -sdo -map
```

> 注意：`Ec_SlaveInfo` 必须至少带一个参数（`-sdo` 或 `-map`），不带参数会打印用法提示并退出。

**各参数含义**：

| 参数 | 说明 |
|------|------|
| `-sdo` | 打印从站 CoE 对象字典（SDO 信息），需从站支持 CoE |
| `-map` | 打印从站 PDO 映射（IO 点位列表） |
| `-sdo -map` | 同时打印两者 |

**操作步骤**：

1. 只看从站基础信息和 PDO 映射（速度较快，约 2～5 秒）：

   ```
   Ec_SlaveInfo -map
   ```

2. 只看对象字典（耗时较长，依从站对象数量约 10～60 秒）：

   ```
   Ec_SlaveInfo -sdo
   ```

3. 完整查询（同时包含 PDO 映射和对象字典）：

   ```
   Ec_SlaveInfo -sdo -map
   ```

**预期日志输出**（以 `-map` 为例）：

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

**判定标准**：

| 检查项 | 通过条件 |
|--------|---------|
| 从站发现 | 日志出现 `N slaves found and configured.`（N ≥ 1） |
| 基础信息 | 每个从站打印出 `Name`、`Output size`、`Input size`、`State` |
| PDO 映射（`-map`） | 打印出 `SM2 outputs` 或 `SM3 inputs` 的地址/索引/位宽列表 |
| 对象字典（`-sdo`） | 打印出 CoE 对象列表，至少包含 `0x1000`、`0x1018` |
| 正常结束 | 日志出现 `End slaveinfo, close socket` |

**用法错误提示**（不带任何参数时）：

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


### Ec_SlaveOP upload：SDO 读取

**测试目的**：通过 Shell 命令直接读取从站指定 SDO 对象的当前值。

**命令格式**：

```
Ec_SlaveOP upload <slave> <index> <subindex>
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `upload` | 固定字符串 | 执行读操作 |
| `<slave>` | 整数（0 起） | 从站位置编号，**从 0 开始**（内部 +1 转换为配置地址） |
| `<index>` | 十六进制整数 | 对象字典索引，如 `0x1018` |
| `<subindex>` | 整数 | 子索引，如 `1` |

> **注意**：`Ec_SlaveOP` 的 `slave` 参数从 **0** 开始，内部会自动 +1 对应第 1 台从站。

**操作步骤**：

读取第 1 台从站（`slave=0`）的led8的value（`0x7010:08`）：

```
Ec_SlaveOP upload 0 0x7010 8
```

**预期日志输出**：

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

**判定标准**：

| 检查项 | 通过条件 |
|--------|---------|
| 从站发现 | 日志出现 `N slaves found and configured.`（N ≥ 1） |
| 读取成功 | 日志出现 `value == 0xXXXXXXXX` 和 `SDO read operation successful` |
| 无错误 | 无 `SDO read operation failed` 或 `timeout` |

**用法错误提示**（参数不正确时）：

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

### Ec_SlaveOP download：SDO 写入

**测试目的**：通过 Shell 命令向从站指定 SDO 对象写入新值，并通过回读确认写入生效。

**命令格式**：

```
Ec_SlaveOP download <slave> <index> <subindex> <value>
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `download` | 固定字符串 | 执行写操作 |
| `<slave>` | 整数（0 起） | 从站位置编号，**从 0 开始** |
| `<index>` | 十六进制整数 | 对象字典索引 |
| `<subindex>` | 整数 | 子索引 |
| `<value>` | 整数 | 写入的值（十进制或十六进制均可） |

> **注意**：写入操作在从站切换到 SAFE_OP 状态后执行，操作完成后从站会被关闭（`ecx_close`）。

**操作步骤**：

**示例 1**：向第 1 台从站写入输出控制字（`0x7010:0x08`），设置为 `1`：

```
Ec_SlaveOP download 0 0x7010 8 1
```

**验证步骤**：写入后立即回读确认：

```
Ec_SlaveOP upload 0 0x7010 8
```

**预期日志输出**（写入流程）：

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

**预期日志输出**（回读验证）：

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

**判定标准**：

| 检查项 | 通过条件 |
|--------|---------|
| 写入成功 | 日志出现 `SDO write operation successful` |
| 回读一致 | `upload` 回读值与 `download` 写入值相同 |
| 无错误 | 无 `SDO write operation failed` 或 `Failed to reach SAFE_OP` |

**常见失败原因**：

| 现象 | 原因 | 处理方式 |
|------|------|---------|
| `Failed to reach SAFE_OP state for SDO write` | 从站未连接或初始化失败 | 检查网线与从站电源 |
| `SDO write operation failed` | 对象只读，或值越界 | 先用 `-sdo` 确认访问权限和数据类型范围 |
| `No slaves found for SDO write` | 总线无从站 | 检查物理连接 |

---

### Ec_Sample_Test：默认周期运行

**测试目的**：验证 EtherCAT 主站完整运行流程，包括初始化、PDO 数据交换以及自动关闭，使用默认 1ms 周期。

**命令格式**：

```
Ec_Sample_Test <ifname> <cyc_time_us>
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `<ifname>` | 字符串 | 网络接口名（已废弃，填空字符串 `""` 即可，驱动固定使用控制器 0） |
| `<cyc_time_us>` | 整数（µs） | PDO 通信周期，填 `0` 使用默认值 1000µs（1ms） |

**操作步骤**：

使用默认 1ms 周期启动：

```
Ec_Sample_Test "" 0
```

**运行说明**：
- 命令执行后创建 3 个 FreeRTOS 任务，立即返回 Shell（任务在后台运行）
- `ECAT_BRINGUP` 任务负责完成初始化并推进到 OPERATIONAL 状态
- `ECAT_RT` 任务以最高优先级每 1ms 执行一次 PDO 收发
- `ECAT_CHK` 任务以低优先级每 10ms 轮询从站健康状态
- 系统在 OPERATIONAL 状态下运行约 **10 秒**（500 次 × 20ms 循环），然后自动退出到 INIT 并清理任务

**预期日志输出（完整流程）**：

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

**日志关键字段说明**：

| 字段 | 含义 |
|------|------|
| `cycle` | 当前 PDO 周期计数（每 100 次打印一行） |
| `Wck` | 本次 PDO 帧的工作计数器（WKC），正常时应等于 `expectedWKC` |
| `DCtime` | 从 DC 参考从站读取的当前时间戳（ns） |
| `dt` | 本地系统时钟与 DC 时钟的误差（ns），PI 控制器会将其收敛到接近 0 |

**判定标准**：

| 检查项 | 通过条件 |
|--------|---------|
| 从站发现 | `N slaves found and configured.`（N ≥ 1） |
| 进入运行 | 出现 `EtherCAT OP` |
| WKC 正常 | `Wck` 值稳定等于预期值，不持续为 0 |
| DC 收敛 | `dt` 值随循环次数逐渐减小（若从站有 DC 支持） |
| 正常退出 | 依次出现 `EtherCAT to SAFE_OP` → `EtherCAT to INIT` → `EtherCAT bringup completed` |

---
