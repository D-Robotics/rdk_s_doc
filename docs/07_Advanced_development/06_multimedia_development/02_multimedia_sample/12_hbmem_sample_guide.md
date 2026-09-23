---
sidebar_position: 12
title: "sample_hbmem 使用说明"
description: "sample_hbmem 使用说明 板端示例使用说明"
---

# sample_hbmem 使用说明

## 功能概述

`sample_hbmem` 完成 [hbmem API](/Advanced_development/multimedia_development/multimedia_api/hbmem) 的使用示例，包括 com buffer、graphic buffer、graphic buffer group、queue、pool、share pool 的创建使用，多进程共享等。

## 代码位置及目录结构


代码位置：/app/multimedia_samples/sample_hbmem

目录结构：
```text
/app/multimedia_samples/sample_hbmem/
|-- Makefile
|-- sample.c
|-- sample_alloc.c
|-- sample_common.c
|-- sample_common.h
|-- sample_pool.c
|-- sample_queue.c
|-- sample_share.c
`-- sample_share_pool.c
```

## 编译

### 编译命令

在源码路径下执行 `make` 命令即可完成编译：

```Shell
cd /app/multimedia_samples/sample_hbmem/
make
```

### 编译说明

本 sample 主要依赖 libhbmem 提供的头文件：

```c
#include <hb_mem_mgr.h>
#include <hb_mem_err.h>
```

编译依赖的库有如下：

```makefile
LIBS += -lpthread -lhbmem -lalog -ldl -lstdc++
```

## 运行

### 运行方法
直接执行程序 ./sample_hbmem 可以获得帮助信息：
```c
 ./sample_hbmem
Options:
  -m                     Specify sample use cases
  -h                     Show this help message
Usage: ./sample_hbmem -m <index>
***************  Sample Mode Lists  ***************
index:  1       sample_mode:    Alloc Com Buf
index:  2       sample_mode:    Alloc Com Buf With Cache
index:  3       sample_mode:    Alloc Com Buf With Heapmask
index:  4       sample_mode:    Alloc Graph Buf
index:  5       sample_mode:    Alloc Graph Buf With Heapmask
index:  6       sample_mode:    Share Com Buffer
index:  7       sample_mode:    Share Com Buffer Fork Process Scenario
index:  8       sample_mode:    Share Graph Buffer
index:  9       sample_mode:    Share Graph Buffer Fork Process Scenario
index:  10      sample_mode:    Share Pool Fork Process Scenario
index:  11      sample_mode:    Share Pool
index:  12      sample_mode:    Change Com Graph Buf
index:  13      sample_mode:    Alloc Graph Buf Group
index:  14      sample_mode:    Alloc Graph Buf Group With Heapmask
index:  15      sample_mode:    Share Com Buffer Use Consume Cnt
index:  16      sample_mode:    Share Graph Buffer Use Consume Cnt
index:  17      sample_mode:    Share Graph Buffer Group
index:  18      sample_mode:    Share Graph Buffer Group Use Consume Cnt
index:  19      sample_mode:    Share Graph Buffer Group Fork Process Scenario
index:  20      sample_mode:    Queue Producer Consumer
index:  21      sample_mode:    Pool
index:  22      sample_mode:    Com Buf User Consume Cnt
index:  23      sample_mode:    Graph Buf User Consume Cnt
***************************************************
```

### 运行参数说明

- `-m` 指定 sample_mode, 不同数字的含义解释如下：

| sample_mode | 功能解释 | 执行命令 |
| ----------- | -------- | -------- |
| 1 | 创建 com buffer | `./sample_hbmem -m 1` |
| 2 | 创建 cache，noncached com buffer，赋值，比较耗时 | `./sample_hbmem -m 2` |
| 3 | 在各个 heaps 里，创建 com buffer | `./sample_hbmem -m 3` |
| 4 | 创建 graph buffer | `./sample_hbmem -m 4` |
| 5 | 在各个 heaps 里，创建 graph buffer | `./sample_hbmem -m 5` |
| 6 | 进程内 common buffer 共享 | `./sample_hbmem -m 6` |
| 7 | 进程间 common buffer 共享 | `./sample_hbmem -m 7` |
| 8 | 进程内 graphic buffer 共享 | `./sample_hbmem -m 8` |
| 9 | 进程间 graphic buffer 共享 | `./sample_hbmem -m 9` |
| 10 | 进程间 share pool 共享 | `./sample_hbmem -m 10` |
| 11 | share pool 使用 | `./sample_hbmem -m 11` |
| 12 | 在 graphic buffer 与 common buffer 之间实现 buffer 转换 | `./sample_hbmem -m 12` |
| 13 | 创建 graph buffer group | `./sample_hbmem -m 13` |
| 14 | 在各个 heaps 里，创建 graph buffer group | `./sample_hbmem -m 14` |
| 15 | 进程内 common buffer 共享，consume_cnt | `./sample_hbmem -m 15` |
| 16 | 进程内 graphic buffer 共享，consume_cnt | `./sample_hbmem -m 16` |
| 17 | 进程内 graphic buffer group 共享 | `./sample_hbmem -m 17` |
| 18 | 进程内 graphic buffer group 共享，consume_cnt | `./sample_hbmem -m 18` |
| 19 | 进程间 graphic buffer group 共享 | `./sample_hbmem -m 19` |
| 20 | buffer queue 使用 | `./sample_hbmem -m 20` |
| 21 | pool 使用 | `./sample_hbmem -m 21` |
| 22 | 增加 common buffer 用户态引用计数 | `./sample_hbmem -m 22` |
| 23 | 增加 graphic buffer 用户态引用计数 | `./sample_hbmem -m 23` |

### 运行效果

#### Alloc Com Buf
```sh
root@drobot:/app/multimedia_samples/sample_hbmem# ./sample_hbmem -m 1
sample_mode = 1
=================================================
Ready to sample_alloc_com_buf
alloc com buf, share_id: 22
[144826:144826] Do system command sudo sh -c 'cat /sys/kernel/debug/ion/clients/144826*'.
       heap_name:    size_in_bytes :  handle refcount :    handle import :       buffer ptr :  buffer refcount :  buffer share id : buffer share count
         ion_cma:           400000 :                1 :                1 : ffff0042e6a61d00 :                3:               22 :                1

-------------------------------------------------------------------------
          total            400000
-------------------------------------------------------------------------
[144826:144826] Do system command sudo sh -c 'cat /sys/kernel/debug/ion/heaps/ion_cma | grep -w 144826 | grep -w sample_hbmem'.
         ion_cma     sample_hbmem           144826          4194304
    sample_hbmem           144826           144826            other          4194304                0          no-label               22       41c0000000
[144826:144826] Result 0.
free com buf
[144826:144826] Do system command sudo sh -c 'cat /sys/kernel/debug/ion/clients/144826*'.
       heap_name:    size_in_bytes :  handle refcount :    handle import :       buffer ptr :  buffer refcount :  buffer share id : buffer share count
-------------------------------------------------------------------------
          total                 0
-------------------------------------------------------------------------
[144826:144826] Do system command sudo sh -c 'cat /sys/kernel/debug/ion/heaps/ion_cma | grep -w 144826 | grep -w sample_hbmem'.
[144826:144826] Result 256.
sample_alloc_com_buf done
=================================================
```

#### Alloc Com Buf With Cache
```sh
root@drobot:/app/multimedia_samples/sample_hbmem# ./sample_hbmem -m 2
sample_mode = 2
=================================================
Ready to sample_alloc_com_buf_with_cache
memset uncached buf(size:4194304) use time: 280896
memset   cached buf(size:4194304) use time: 95715
sample_alloc_com_buf_with_cache done
=================================================
```

#### Alloc Com Buf With Heapmask
```sh
root@drobot:/app/multimedia_samples/sample_hbmem# ./sample_hbmem -m 3
sample_mode = 3
=================================================
Ready to sample_alloc_com_buf_with_heapmask
alloc com buf form ion_cma, size: 1048576
[144865:144865] Do system command sudo sh -c 'cat /sys/kernel/debug/ion/clients/144865*'.
       heap_name:    size_in_bytes :  handle refcount :    handle import :       buffer ptr :  buffer refcount :  buffer share id : buffer share count
     ion_uncache:           100000 :                1 :                1 : ffff0042887ff300 :                3:               22 :                1

-------------------------------------------------------------------------
          total            100000
-------------------------------------------------------------------------
[144865:144865] Do system command sudo sh -c 'cat /sys/kernel/debug/ion/heaps/ion_cma | grep -w 144865 | grep -w sample_hbmem'.
[144865:144865] Result 256.
free com buf

alloc com buf form carveout, size: 1048576
[144865:144865] Do system command sudo sh -c 'cat /sys/kernel/debug/ion/clients/144865*'.
       heap_name:    size_in_bytes :  handle refcount :    handle import :       buffer ptr :  buffer refcount :  buffer share id : buffer share count
     ion_uncache:           100000 :                1 :                1 : ffff0042887ff300 :                3:               22 :                1

-------------------------------------------------------------------------
          total            100000
-------------------------------------------------------------------------
[144865:144865] Do system command sudo sh -c 'cat /sys/kernel/debug/ion/heaps/carveout | grep -w 144865 | grep -w sample_hbmem'.
[144865:144865] Result 256.
free com buf

alloc com buf form cma_reserved, size: 1048576
[144865:144865] Do system command sudo sh -c 'cat /sys/kernel/debug/ion/clients/144865*'.
       heap_name:    size_in_bytes :  handle refcount :    handle import :       buffer ptr :  buffer refcount :  buffer share id : buffer share count
     ion_uncache:           100000 :                1 :                1 : ffff0042887ff300 :                3:               22 :                1

-------------------------------------------------------------------------
          total            100000
-------------------------------------------------------------------------
[144865:144865] Do system command sudo sh -c 'cat /sys/kernel/debug/ion/heaps/cma_reserved | grep -w 144865 | grep -w sample_hbmem'.
[144865:144865] Result 256.
free com buf

sample_alloc_com_buf_with_heapmask done
=================================================
```

#### Alloc Graph Buf
```sh
root@drobot:/app/multimedia_samples/sample_hbmem# ./sample_hbmem -m 4
sample_mode = 4
=================================================
Ready to sample_alloc_graph_buf
graph_buf.plane_cnt: 2, graph_buf.format: 8, graph_buf.width: 1280, graph_buf.height: 720, graph_buf.stride: 0, graph_buf.vstride: 0, graph_buf.stride: 0, graph_buf.flags: 17
[144902:144902] Do system command sudo sh -c 'cat /sys/kernel/debug/ion/clients/144902*'.
       heap_name:    size_in_bytes :  handle refcount :    handle import :       buffer ptr :  buffer refcount :  buffer share id : buffer share count
     ion_uncache:            f0000 :                1 :                1 : ffff0042e6ca6100 :                3:               22 :                1

     ion_uncache:            80000 :                1 :                1 : ffff0042e6ca6d00 :                3:               23 :                1

-------------------------------------------------------------------------
          total            170000
-------------------------------------------------------------------------
[144902:144902] Do system command sudo sh -c 'cat /sys/kernel/debug/ion/heaps/ion_cma | grep -w 144902 | grep -w sample_hbmem'.
[144902:144902] Result 256.
sample_alloc_graph_buf done
=================================================
```

#### Alloc Graph Buf With Heapmask
```sh
root@drobot:/app/multimedia_samples/sample_hbmem# ./sample_hbmem -m 5
sample_mode = 5
=================================================
Ready to sample_alloc_graph_buf_with_heapmask
alloc graph buf form ion_cma
graph_buf.plane_cnt: 2, graph_buf.format: 8, graph_buf.width: 1280, graph_buf.height: 720, graph_buf.stride: 0, graph_buf.vstride: 0, graph_buf.stride: 0, graph_buf.flags: 17
[144915:144915] Do system command sudo sh -c 'cat /sys/kernel/debug/ion/clients/144915*'.
       heap_name:    size_in_bytes :  handle refcount :    handle import :       buffer ptr :  buffer refcount :  buffer share id : buffer share count
     ion_uncache:            f0000 :                1 :                1 : ffff0042e6a61a00 :                3:               22 :                1

     ion_uncache:            80000 :                1 :                1 : ffff0042e6a64b00 :                3:               23 :                1

-------------------------------------------------------------------------
          total            170000
-------------------------------------------------------------------------
[144915:144915] Do system command sudo sh -c 'cat /sys/kernel/debug/ion/heaps/ion_cma | grep -w 144915 | grep -w sample_hbmem'.
[144915:144915] Result 256.
alloc graph buf form carveout
graph_buf.plane_cnt: 2, graph_buf.format: 8, graph_buf.width: 1280, graph_buf.height: 720, graph_buf.stride: 0, graph_buf.vstride: 0, graph_buf.stride: 0, graph_buf.flags: 4294967313
[144915:144915] Do system command sudo sh -c 'cat /sys/kernel/debug/ion/clients/144915*'.
       heap_name:    size_in_bytes :  handle refcount :    handle import :       buffer ptr :  buffer refcount :  buffer share id : buffer share count
     ion_uncache:            f0000 :                1 :                1 : ffff0042d7417b00 :                3:               22 :                1

     ion_uncache:            80000 :                1 :                1 : ffff0042d7418f00 :                3:               23 :                1

-------------------------------------------------------------------------
          total            170000
-------------------------------------------------------------------------
[144915:144915] Do system command sudo sh -c 'cat /sys/kernel/debug/ion/heaps/carveout | grep -w 144915 | grep -w sample_hbmem'.
[144915:144915] Result 256.
alloc graph buf form cma_reserved
graph_buf.plane_cnt: 2, graph_buf.format: 8, graph_buf.width: 1280, graph_buf.height: 720, graph_buf.stride: 0, graph_buf.vstride: 0, graph_buf.stride: 0, graph_buf.flags: 17179869201
[144915:144915] Do system command sudo sh -c 'cat /sys/kernel/debug/ion/clients/144915*'.
       heap_name:    size_in_bytes :  handle refcount :    handle import :       buffer ptr :  buffer refcount :  buffer share id : buffer share count
     ion_uncache:            80000 :                1 :                1 : ffff0042d7417b00 :                3:               23 :                1

     ion_uncache:            f0000 :                1 :                1 : ffff0042d7418f00 :                3:               22 :                1

-------------------------------------------------------------------------
          total            170000
-------------------------------------------------------------------------
[144915:144915] Do system command sudo sh -c 'cat /sys/kernel/debug/ion/heaps/cma_reserved | grep -w 144915 | grep -w sample_hbmem'.
[144915:144915] Result 256.
sample_alloc_graph_buf_with_heapmask done
=================================================
```

#### Share Com Buffer
```sh
root@drobot:/app/multimedia_samples/sample_hbmem# ./sample_hbmem -m 6
sample_mode = 6
=================================================
Ready to sample_share_com_buffer
alloc com buf, share_id: 22
import com buf, share_id: 22
[144953:144953] Do system command sudo sh -c 'cat /sys/kernel/debug/ion/clients/144953*'.
       heap_name:    size_in_bytes :  handle refcount :    handle import :       buffer ptr :  buffer refcount :  buffer share id : buffer share count
     ion_uncache:            10000 :                2 :                2 : ffff004288cbd800 :                4:               22 :                2

-------------------------------------------------------------------------
          total             10000
-------------------------------------------------------------------------
[144953:144953] Do system command sudo sh -c 'cat /sys/kernel/debug/ion/heaps/ion_cma | grep -w 144953 | grep -w sample_hbmem'.
[144953:144953] Result 256.
free com buf
[144953:144953] Do system command sudo sh -c 'cat /sys/kernel/debug/ion/clients/144953*'.
       heap_name:    size_in_bytes :  handle refcount :    handle import :       buffer ptr :  buffer refcount :  buffer share id : buffer share count
     ion_uncache:            10000 :                1 :                1 : ffff004288cbd800 :                3:               22 :                1

-------------------------------------------------------------------------
          total             10000
-------------------------------------------------------------------------
[144953:144953] Do system command sudo sh -c 'cat /sys/kernel/debug/ion/heaps/ion_cma | grep -w 144953 | grep -w sample_hbmem'.
[144953:144953] Result 256.
free import buf
[144953:144953] Do system command sudo sh -c 'cat /sys/kernel/debug/ion/clients/144953*'.
       heap_name:    size_in_bytes :  handle refcount :    handle import :       buffer ptr :  buffer refcount :  buffer share id : buffer share count
-------------------------------------------------------------------------
          total                 0
-------------------------------------------------------------------------
[144953:144953] Do system command sudo sh -c 'cat /sys/kernel/debug/ion/heaps/ion_cma | grep -w 144953 | grep -w sample_hbmem'.
[144953:144953] Result 256.
sample_share_com_buffer done
=================================================
```

#### Share Com Buffer Fork Process Scenario
```sh
root@drobot:/app/multimedia_samples/sample_hbmem# ./sample_hbmem -m 7
sample_mode = 7
=================================================
Ready to sample_share_com_buffer_fork_process_scenario
alloc graph buf form ion_cma
socketpair: 0
[144990:142984] In parent process.
[144991:144990] In child process.
parent write share buf: parent test common buf share.
share_consume_cnt: 0
[144990:142984] parent send msg 1
[144991:144990] child recv msg 1
child read share buf: parent test common buf share.
share_consume_cnt: 1
child write share buf: child test common buf share.
[144991:144990] child send msg 2
[144990:142984] parent recv msg 2
parent read share buf: child test common buf share.
[144990:142984] parent send msg 3
[144991:144990] child recv msg 3
share_consume_cnt: 0
[144990:142984] parent quit
[144991:144990] child quit
alloc graph buf form carveout
socketpair: 0
[144990:142984] In parent process.
[144992:144990] In child process.
parent write share buf: parent test common buf share.
share_consume_cnt: 0
[144990:142984] parent send msg 1
[144992:144990] child recv msg 1
child read share buf: parent test common buf share.
share_consume_cnt: 1
child write share buf: child test common buf share.
[144992:144990] child send msg 2
[144990:142984] parent recv msg 2
parent read share buf: child test common buf share.
[144990:142984] parent send msg 3
[144992:144990] child recv msg 3
share_consume_cnt: 0
[144990:142984] parent quit
[144992:144990] child quit
alloc graph buf form cma_reserved
socketpair: 0
[144990:142984] In parent process.
[144993:144990] In child process.
parent write share buf: parent test common buf share.
share_consume_cnt: 0
[144990:142984] parent send msg 1
[144993:144990] child recv msg 1
child read share buf: parent test common buf share.
share_consume_cnt: 1
child write share buf: child test common buf share.
[144993:144990] child send msg 2
[144990:142984] parent recv msg 2
parent read share buf: child test common buf share.
[144990:142984] parent send msg 3
[144993:144990] child recv msg 3
share_consume_cnt: 0
[144990:142984] parent quit
[144993:144990] child quit
sample_share_com_buffer_fork_process_scenario done
=================================================
```

#### Share Graph Buffer
```sh
root@drobot:/app/multimedia_samples/sample_hbmem# ./sample_hbmem -m 8
sample_mode = 8
=================================================
Ready to sample_share_graph_buffer
alloc graph buf, share_id0: 22, share_id1: 23, share_id2: 23
import graph buf, share_id0: 22, share_id1: 23, share_id2: 23
[144994:144994] Do system command sudo sh -c 'cat /sys/kernel/debug/ion/clients/144994*'.
       heap_name:    size_in_bytes :  handle refcount :    handle import :       buffer ptr :  buffer refcount :  buffer share id : buffer share count
     ion_uncache:            80000 :                2 :                2 : ffff004288cb9d00 :                4:               23 :                2

     ion_uncache:            f0000 :                2 :                2 : ffff004288cbd800 :                4:               22 :                2

-------------------------------------------------------------------------
          total            170000
-------------------------------------------------------------------------
[144994:144994] Do system command sudo sh -c 'cat /sys/kernel/debug/ion/heaps/ion_cma | grep -w 144994 | grep -w sample_hbmem'.
[144994:144994] Result 256.
free graph buf
[144994:144994] Do system command sudo sh -c 'cat /sys/kernel/debug/ion/clients/144994*'.
       heap_name:    size_in_bytes :  handle refcount :    handle import :       buffer ptr :  buffer refcount :  buffer share id : buffer share count
     ion_uncache:            80000 :                1 :                1 : ffff004288cb9d00 :                3:               23 :                1

     ion_uncache:            f0000 :                1 :                1 : ffff004288cbd800 :                3:               22 :                1

-------------------------------------------------------------------------
          total            170000
-------------------------------------------------------------------------
[144994:144994] Do system command sudo sh -c 'cat /sys/kernel/debug/ion/heaps/ion_cma | grep -w 144994 | grep -w sample_hbmem'.
[144994:144994] Result 256.
free import buf
[144994:144994] Do system command sudo sh -c 'cat /sys/kernel/debug/ion/clients/144994*'.
       heap_name:    size_in_bytes :  handle refcount :    handle import :       buffer ptr :  buffer refcount :  buffer share id : buffer share count
-------------------------------------------------------------------------
          total                 0
-------------------------------------------------------------------------
[144994:144994] Do system command sudo sh -c 'cat /sys/kernel/debug/ion/heaps/ion_cma | grep -w 144994 | grep -w sample_hbmem'.
[144994:144994] Result 256.
sample_share_graph_buffer done
=================================================
```

#### Share Graph Buffer Fork Process Scenario
```sh
root@drobot:/app/multimedia_samples/sample_hbmem# ./sample_hbmem -m 9
sample_mode = 9
=================================================
Ready to sample_share_graph_buffer_fork_process_scenario
alloc graph buf form ion_cma
socketpair: 0
[145031:142984] In parent process.
[145032:145031] In child process.
parent write share buf: parent test graph buf share.
share_consume_cnt: 0
[145031:142984] parent send msg 1
[145032:145031] child recv msg 1
child read share buf: parent test graph buf share.
share_consume_cnt: 1
child write share buf: child test common buf share.
[145032:145031] child send msg 2
[145031:142984] parent recv msg 2
parent read share buf: child test common buf share.
[145031:142984] parent send msg 3
[145032:145031] child recv msg 3
share_consume_cnt: 0
[145031:142984] parent quit
[145032:145031] child quit
alloc graph buf form carveout
socketpair: 0
[145031:142984] In parent process.
[145033:145031] In child process.
parent write share buf: parent test graph buf share.
share_consume_cnt: 0
[145031:142984] parent send msg 1
[145033:145031] child recv msg 1
child read share buf: parent test graph buf share.
share_consume_cnt: 1
child write share buf: child test common buf share.
[145033:145031] child send msg 2
[145031:142984] parent recv msg 2
parent read share buf: child test common buf share.
[145031:142984] parent send msg 3
[145033:145031] child recv msg 3
share_consume_cnt: 0
[145031:142984] parent quit
[145033:145031] child quit
alloc graph buf form cma_reserved
socketpair: 0
[145031:142984] In parent process.
[145034:145031] In child process.
parent write share buf: parent test graph buf share.
share_consume_cnt: 0
[145031:142984] parent send msg 1
[145034:145031] child recv msg 1
child read share buf: parent test graph buf share.
share_consume_cnt: 1
child write share buf: child test common buf share.
[145034:145031] child send msg 2
[145031:142984] parent recv msg 2
parent read share buf: child test common buf share.
[145031:142984] parent send msg 3
[145034:145031] child recv msg 3
share_consume_cnt: 0
[145031:142984] parent quit
[145034:145031] child quit
sample_share_graph_buffer_fork_process_scenario done
=================================================
```

#### Share Pool Fork Process Scenario
```sh
root@drobot:/app/multimedia_samples/sample_hbmem# ./sample_hbmem -m 10
sample_mode = 10
=================================================
Ready to sample_share_pool_fork_process_scenario
[145035:142984] In parent process.
[145036:145035] In child process.
[145035:145035] Do system command sudo sh -c 'cat /sys/kernel/debug/ion/clients/145035*'.
       heap_name:    size_in_bytes :  handle refcount :    handle import :       buffer ptr :  buffer refcount :  buffer share id : buffer share count
     ion_uncache:            20000 :                1 :                1 : ffff0042e6a61200 :                3:               23 :                1

     ion_uncache:            20000 :                1 :                1 : ffff0042e6a62900 :                3:               22 :                1

     ion_uncache:            20000 :                1 :                1 : ffff0042e6a66200 :                3:               25 :                1

     ion_uncache:            20000 :                1 :                1 : ffff0042e6a6d500 :                3:               26 :                1

     ion_uncache:            20000 :                1 :                1 : ffff0042e6a6e200 :                3:               24 :                1

-------------------------------------------------------------------------
          total             a0000
-------------------------------------------------------------------------
[145035:145035] Do system command sudo sh -c 'cat /sys/kernel/debug/ion/heaps/ion_cma | grep -w 145035 | grep -w sample_hbmem'.
[145035:145035] Result 256.
hb_mem_share_pool_alloc_buf 0 0xfffd65ea0000
hb_mem_share_pool_alloc_buf 1 0xfffd65ec0000
hb_mem_share_pool_alloc_buf 2 0xfffd65ee0000
hb_mem_share_pool_alloc_buf 3 0xfffd65f00000
hb_mem_share_pool_alloc_buf 4 0xfffd66260000
[145035:142984] parent send msg 1
[145036:145035] child recv msg 1
[145036:145035] child send msg 2
[145035:142984] parent recv msg 2
free 0 0xfffd65ea0000
[145035:142984] parent pool.avail_buf_cnt: 0
free 1 0xfffd65ec0000
[145035:142984] parent pool.avail_buf_cnt: 1
free 2 0xfffd65ee0000
[145035:142984] parent pool.avail_buf_cnt: 2
free 3 0xfffd65f00000
[145035:142984] parent pool.avail_buf_cnt: 3
free 4 0xfffd66260000
[145035:142984] parent pool.avail_buf_cnt: 4
[145035:142984] parent send msg 3
[145036:145035] child recv msg 3
[145036:145035] child send msg 4
[145035:142984] parent recv msg 4
[145035:142984] parent pool.avail_buf_cnt: 5
[145036:145035] child quit
[145035:142984] parent quit
sample_share_pool_fork_process_scenario done
=================================================
```

#### Share Pool
```sh
root@drobot:/app/multimedia_samples/sample_hbmem# ./sample_hbmem -m 11
sample_mode = 11
=================================================
Ready to sample_share_pool
pool.avail_buf_cnt: 9
pool.avail_buf_cnt: 8
pool.avail_buf_cnt: 7
pool.avail_buf_cnt: 6
pool.avail_buf_cnt: 5
pool.avail_buf_cnt: 4
pool.avail_buf_cnt: 3
pool.avail_buf_cnt: 2
pool.avail_buf_cnt: 1
pool.avail_buf_cnt: 0
pool.avail_buf_cnt: 1
pool.avail_buf_cnt: 2
pool.avail_buf_cnt: 3
pool.avail_buf_cnt: 4
pool.avail_buf_cnt: 5
pool.avail_buf_cnt: 6
pool.avail_buf_cnt: 7
pool.avail_buf_cnt: 8
pool.avail_buf_cnt: 9
pool.avail_buf_cnt: 10
sample_share_pool done
=================================================
```

#### Change Com Graph Buf
```sh
root@drobot:/app/multimedia_samples/sample_hbmem# ./sample_hbmem -m 12
sample_mode = 12
=================================================
Ready to sample_alloc_graph_buf_group_heapmask
----alloc graphic buffer done!----
the data in graphic buffer:
size: 0x1fa400
flags: 0x8000011
fd: 4
share id: 22
virt_addr: 0x0xfffc2c480000
paddr: 0x420abd0000
----change graphic buffer to common buffer done!----
the data in new common buffer:
size: 0x2f7600
flags: 0x8000011
fd: 4
share id: 22
virt_addr: 0x0xfffc2c480000
paddr: 0x420abd0000
----alloc common buffer done!----
the data in common buffer:
size: 0x10000
flags: 0x8000011
fd: 5
share id: 23
virt_addr: 0x0xfffc2cad0000
paddr: 0x420aed0000
----change common buffer to graphic buffer done!----
the data in new graphic buffer:
size: 0x10000
flags: 0x8000011
fd: 5
share id: 23
virt_addr: 0x0xfffc2cad0000
paddr: 0x420aed0000
sample_alloc_graph_buf_group_heapmask done
=================================================
```

#### Alloc Graph Buf Group
```sh
root@drobot:/app/multimedia_samples/sample_hbmem# ./sample_hbmem -m 13
sample_mode = 13
=================================================
Ready to sample_alloc_graph_buf_with_heapmask
[145054:145054] Do system command sudo sh -c 'cat /sys/kernel/debug/ion/clients/145054*'.
       heap_name:    size_in_bytes :  handle refcount :    handle import :       buffer ptr :  buffer refcount :  buffer share id : buffer share count
     ion_uncache:            f0000 :                1 :                1 : ffff0042f21f4800 :                3:               30 :                1

     ion_uncache:            80000 :                1 :                1 : ffff0042f21f5d00 :                3:               33 :                1

     ion_uncache:            f0000 :                1 :                1 : ffff0042f21f6400 :                3:               36 :                1

     ion_uncache:            80000 :                1 :                1 : ffff0042f21f7300 :                3:               25 :                1

     ion_uncache:            f0000 :                1 :                1 : ffff0042f21f7c00 :                3:               28 :                1

     ion_uncache:            f0000 :                1 :                1 : ffff0042f21f8000 :                3:               34 :                1

     ion_uncache:            80000 :                1 :                1 : ffff0042f21f8100 :                3:               37 :                1

     ion_uncache:            80000 :                1 :                1 : ffff0042f21f8500 :                3:               27 :                1

     ion_uncache:            f0000 :                1 :                1 : ffff0042f21f8a00 :                3:               24 :                1

     ion_uncache:            80000 :                1 :                1 : ffff0042f21f9200 :                3:               35 :                1

     ion_uncache:            f0000 :                1 :                1 : ffff0042f21fa800 :                3:               22 :                1

     ion_uncache:            80000 :                1 :                1 : ffff0042f21fb600 :                3:               29 :                1

     ion_uncache:            80000 :                1 :                1 : ffff0042f21fbb00 :                3:               23 :                1

     ion_uncache:            f0000 :                1 :                1 : ffff0042f21fbc00 :                3:               32 :                1

     ion_uncache:            f0000 :                1 :                1 : ffff0042f21fc000 :                3:               26 :                1

     ion_uncache:            80000 :                1 :                1 : ffff0042f21fd800 :                3:               31 :                1

-------------------------------------------------------------------------
          total            b80000
-------------------------------------------------------------------------
[145054:145054] Do system command sudo sh -c 'cat /sys/kernel/debug/ion/heaps/ion_cma | grep -w 145054 | grep -w sample_hbmem'.
[145054:145054] Result 256.
sample_alloc_graph_buf_group done
=================================================
```

#### Alloc Graph Buf Group With Heapmask
```sh
root@drobot:/app/multimedia_samples/sample_hbmem# ./sample_hbmem -m 14
sample_mode = 14
=================================================
Ready to sample_alloc_graph_buf_group_heapmask
alloc graph buf group form ion_cma
[145067:145067] Do system command sudo sh -c 'cat /sys/kernel/debug/ion/clients/145067*'.
       heap_name:    size_in_bytes :  handle refcount :    handle import :       buffer ptr :  buffer refcount :  buffer share id : buffer share count
     ion_uncache:            80000 :                1 :                1 : ffff0042f21f4800 :                3:               29 :                1

     ion_uncache:            f0000 :                1 :                1 : ffff0042f21f5d00 :                3:               26 :                1

     ion_uncache:            80000 :                1 :                1 : ffff0042f21f6400 :                3:               23 :                1

     ion_uncache:            f0000 :                1 :                1 : ffff0042f21f7300 :                3:               34 :                1

     ion_uncache:            80000 :                1 :                1 : ffff0042f21f7c00 :                3:               31 :                1

     ion_uncache:            80000 :                1 :                1 : ffff0042f21f8000 :                3:               25 :                1

     ion_uncache:            f0000 :                1 :                1 : ffff0042f21f8100 :                3:               22 :                1

     ion_uncache:            f0000 :                1 :                1 : ffff0042f21f8500 :                3:               32 :                1

     ion_uncache:            80000 :                1 :                1 : ffff0042f21f8a00 :                3:               35 :                1

     ion_uncache:            f0000 :                1 :                1 : ffff0042f21f9200 :                3:               24 :                1

     ion_uncache:            80000 :                1 :                1 : ffff0042f21fa800 :                3:               37 :                1

     ion_uncache:            f0000 :                1 :                1 : ffff0042f21fb600 :                3:               30 :                1

     ion_uncache:            f0000 :                1 :                1 : ffff0042f21fbb00 :                3:               36 :                1

     ion_uncache:            80000 :                1 :                1 : ffff0042f21fbc00 :                3:               27 :                1

     ion_uncache:            80000 :                1 :                1 : ffff0042f21fc000 :                3:               33 :                1

     ion_uncache:            f0000 :                1 :                1 : ffff0042f21fd800 :                3:               28 :                1

-------------------------------------------------------------------------
          total            b80000
-------------------------------------------------------------------------
[145067:145067] Do system command sudo sh -c 'cat /sys/kernel/debug/ion/heaps/ion_cma | grep -w 145067 | grep -w sample_hbmem'.
[145067:145067] Result 256.
alloc graph buf group form carveout
[145067:145067] Do system command sudo sh -c 'cat /sys/kernel/debug/ion/clients/145067*'.
       heap_name:    size_in_bytes :  handle refcount :    handle import :       buffer ptr :  buffer refcount :  buffer share id : buffer share count
     ion_uncache:            f0000 :                1 :                1 : ffff0042f21f4800 :                3:               30 :                1

     ion_uncache:            80000 :                1 :                1 : ffff0042f21f5d00 :                3:               33 :                1

     ion_uncache:            f0000 :                1 :                1 : ffff0042f21f6400 :                3:               36 :                1

     ion_uncache:            80000 :                1 :                1 : ffff0042f21f7300 :                3:               25 :                1

     ion_uncache:            f0000 :                1 :                1 : ffff0042f21f7c00 :                3:               28 :                1

     ion_uncache:            f0000 :                1 :                1 : ffff0042f21f8000 :                3:               34 :                1

     ion_uncache:            80000 :                1 :                1 : ffff0042f21f8100 :                3:               37 :                1

     ion_uncache:            80000 :                1 :                1 : ffff0042f21f8500 :                3:               27 :                1

     ion_uncache:            f0000 :                1 :                1 : ffff0042f21f8a00 :                3:               24 :                1

     ion_uncache:            80000 :                1 :                1 : ffff0042f21f9200 :                3:               35 :                1

     ion_uncache:            f0000 :                1 :                1 : ffff0042f21fa800 :                3:               22 :                1

     ion_uncache:            80000 :                1 :                1 : ffff0042f21fb600 :                3:               29 :                1

     ion_uncache:            80000 :                1 :                1 : ffff0042f21fbb00 :                3:               23 :                1

     ion_uncache:            f0000 :                1 :                1 : ffff0042f21fbc00 :                3:               32 :                1

     ion_uncache:            f0000 :                1 :                1 : ffff0042f21fc000 :                3:               26 :                1

     ion_uncache:            80000 :                1 :                1 : ffff0042f21fd800 :                3:               31 :                1

-------------------------------------------------------------------------
          total            b80000
-------------------------------------------------------------------------
[145067:145067] Do system command sudo sh -c 'cat /sys/kernel/debug/ion/heaps/carveout | grep -w 145067 | grep -w sample_hbmem'.
[145067:145067] Result 256.
alloc graph buf group form cma_reserved
[145067:145067] Do system command sudo sh -c 'cat /sys/kernel/debug/ion/clients/145067*'.
       heap_name:    size_in_bytes :  handle refcount :    handle import :       buffer ptr :  buffer refcount :  buffer share id : buffer share count
     ion_uncache:            80000 :                1 :                1 : ffff0042f21f4800 :                3:               29 :                1

     ion_uncache:            f0000 :                1 :                1 : ffff0042f21f5d00 :                3:               26 :                1

     ion_uncache:            80000 :                1 :                1 : ffff0042f21f6400 :                3:               23 :                1

     ion_uncache:            f0000 :                1 :                1 : ffff0042f21f7300 :                3:               34 :                1

     ion_uncache:            80000 :                1 :                1 : ffff0042f21f7c00 :                3:               31 :                1

     ion_uncache:            80000 :                1 :                1 : ffff0042f21f8000 :                3:               25 :                1

     ion_uncache:            f0000 :                1 :                1 : ffff0042f21f8100 :                3:               22 :                1

     ion_uncache:            f0000 :                1 :                1 : ffff0042f21f8500 :                3:               32 :                1

     ion_uncache:            80000 :                1 :                1 : ffff0042f21f8a00 :                3:               35 :                1

     ion_uncache:            f0000 :                1 :                1 : ffff0042f21f9200 :                3:               24 :                1

     ion_uncache:            80000 :                1 :                1 : ffff0042f21fa800 :                3:               37 :                1

     ion_uncache:            f0000 :                1 :                1 : ffff0042f21fb600 :                3:               30 :                1

     ion_uncache:            f0000 :                1 :                1 : ffff0042f21fbb00 :                3:               36 :                1

     ion_uncache:            80000 :                1 :                1 : ffff0042f21fbc00 :                3:               27 :                1

     ion_uncache:            80000 :                1 :                1 : ffff0042f21fc000 :                3:               33 :                1

     ion_uncache:            f0000 :                1 :                1 : ffff0042f21fd800 :                3:               28 :                1

-------------------------------------------------------------------------
          total            b80000
-------------------------------------------------------------------------
[145067:145067] Do system command sudo sh -c 'cat /sys/kernel/debug/ion/heaps/* | grep -w 145067 | grep -w sample_hbmem'.
     ion_uncache     sample_hbmem           145067         12058624
    sample_hbmem           145067           145067            other           524288                0          no-label               29       420b110000
    sample_hbmem           145067           145067            other           983040                0          no-label               26       420aeb0000
    sample_hbmem           145067           145067            other           524288                0          no-label               23       420acc0000
    sample_hbmem           145067           145067            other           983040                0          no-label               34       420b470000
    sample_hbmem           145067           145067            other           524288                0          no-label               31       420b280000
    sample_hbmem           145067           145067            other           524288                0          no-label               25       420ae30000
    sample_hbmem           145067           145067            other           983040                0          no-label               22       420abd0000
    sample_hbmem           145067           145067            other           983040                0          no-label               32       420b300000
    sample_hbmem           145067           145067            other           524288                0          no-label               35       420b560000
    sample_hbmem           145067           145067            other           983040                0          no-label               24       420ad40000
    sample_hbmem           145067           145067            other           524288                0          no-label               37       420b6d0000
    sample_hbmem           145067           145067            other           983040                0          no-label               30       420b190000
    sample_hbmem           145067           145067            other           983040                0          no-label               36       420b5e0000
    sample_hbmem           145067           145067            other           524288                0          no-label               27       420afa0000
    sample_hbmem           145067           145067            other           524288                0          no-label               33       420b3f0000
    sample_hbmem           145067           145067            other           983040                0          no-label               28       420b020000
     ion_uncache     sample_hbmem           145067         12058624
    sample_hbmem           145067           145067            other           524288                0          no-label               29       420b110000
    sample_hbmem           145067           145067            other           983040                0          no-label               26       420aeb0000
    sample_hbmem           145067           145067            other           524288                0          no-label               23       420acc0000
    sample_hbmem           145067           145067            other           983040                0          no-label               34       420b470000
    sample_hbmem           145067           145067            other           524288                0          no-label               31       420b280000
    sample_hbmem           145067           145067            other           524288                0          no-label               25       420ae30000
    sample_hbmem           145067           145067            other           983040                0          no-label               22       420abd0000
    sample_hbmem           145067           145067            other           983040                0          no-label               32       420b300000
    sample_hbmem           145067           145067            other           524288                0          no-label               35       420b560000
    sample_hbmem           145067           145067            other           983040                0          no-label               24       420ad40000
    sample_hbmem           145067           145067            other           524288                0          no-label               37       420b6d0000
    sample_hbmem           145067           145067            other           983040                0          no-label               30       420b190000
    sample_hbmem           145067           145067            other           983040                0          no-label               36       420b5e0000
    sample_hbmem           145067           145067            other           524288                0          no-label               27       420afa0000
    sample_hbmem           145067           145067            other           524288                0          no-label               33       420b3f0000
    sample_hbmem           145067           145067            other           983040                0          no-label               28       420b020000
[145067:145067] Result 0.
sample_alloc_graph_buf_group_heapmask done
=================================================
```

#### Share Com Buffer Use Consume Cnt
```sh
root@drobot:/app/multimedia_samples/sample_hbmem# ./sample_hbmem -m 15
sample_mode = 15
=================================================
Ready to sample_share_com_buffer_use_consume_cnt
in_buf used by process[145104]
share_consume_cnt: 1
Testing hb_mem_wait_consume_status timeout function...
[ERROR][][mem_log.c:104] [1121620.85274][145104:145104][MEM_ALLOCATOR] <hb_mem_wait_consume_status:5644> Fail to wait share information(ret=-16777209).
hb_mem_wait_consume_status timeout OK
sample_share_com_buffer_use_consume_cnt done
=================================================
```

#### Share Graph Buffer Use Consume Cnt
```sh
root@drobot:/app/multimedia_samples/sample_hbmem# ./sample_hbmem -m 16
sample_mode = 16
=================================================
Ready to sample_share_graph_buffer_use_consume_cnt
in_buf used by process[145105]
share_consume_cnt: 1
Testing hb_mem_wait_consume_status timeout function...
[ERROR][][mem_log.c:104] [1121622.42560][145105:145105][MEM_ALLOCATOR] <hb_mem_wait_consume_status:5644> Fail to wait share information(ret=-16777209).
hb_mem_wait_consume_status timeout OK
sample_share_graph_buffer_use_consume_cnt done
=================================================
```

#### Share Graph Buffer Group
```sh
root@drobot:/app/multimedia_samples/sample_hbmem# ./sample_hbmem -m 17
sample_mode = 17
=================================================
Ready to sample_share_graph_buffer_group
[145106:145106] Do system command sudo sh -c 'cat /sys/kernel/debug/ion/clients/145106*'.
       heap_name:    size_in_bytes :  handle refcount :    handle import :       buffer ptr :  buffer refcount :  buffer share id : buffer share count
     ion_uncache:            80000 :                2 :                2 : ffff0042e6a60900 :                3:               25 :                2

     ion_uncache:            80000 :                2 :                2 : ffff0042e6a60c00 :                3:               31 :                2

     ion_uncache:            f0000 :                2 :                2 : ffff0042e6a60f00 :                3:               22 :                2

     ion_uncache:            f0000 :                2 :                2 : ffff0042e6a61700 :                3:               36 :                2

     ion_uncache:            f0000 :                2 :                2 : ffff0042e6a61900 :                3:               32 :                2

     ion_uncache:            f0000 :                2 :                2 : ffff0042e6a61e00 :                3:               28 :                2

     ion_uncache:            f0000 :                2 :                2 : ffff0042e6a61f00 :                3:               26 :                2

     ion_uncache:            80000 :                2 :                2 : ffff0042e6a62500 :                3:               27 :                2

     ion_uncache:            f0000 :                2 :                2 : ffff0042e6a62700 :                3:               30 :                2

     ion_uncache:            80000 :                2 :                2 : ffff0042e6a63a00 :                3:               33 :                2

     ion_uncache:            80000 :                2 :                2 : ffff0042e6a63d00 :                3:               29 :                2

     ion_uncache:            f0000 :                2 :                2 : ffff0042e6a64300 :                3:               24 :                2

     ion_uncache:            80000 :                2 :                2 : ffff0042e6a65e00 :                3:               23 :                2

     ion_uncache:            f0000 :                2 :                2 : ffff0042e6a66100 :                3:               34 :                2

     ion_uncache:            80000 :                2 :                2 : ffff0042e6a69c00 :                3:               35 :                2

     ion_uncache:            80000 :                2 :                2 : ffff0042e6a6b500 :                3:               37 :                2

-------------------------------------------------------------------------
          total            b80000
-------------------------------------------------------------------------
[145106:145106] Do system command sudo sh -c 'cat /sys/kernel/debug/ion/heaps/ion_cma | grep -w 145106 | grep -w sample_hbmem'.
[145106:145106] Result 256.
free graph buf group
[145106:145106] Do system command sudo sh -c 'cat /sys/kernel/debug/ion/clients/145106*'.
       heap_name:    size_in_bytes :  handle refcount :    handle import :       buffer ptr :  buffer refcount :  buffer share id : buffer share count
     ion_uncache:            80000 :                1 :                1 : ffff0042e6a60900 :                3:               25 :                1

     ion_uncache:            80000 :                1 :                1 : ffff0042e6a60c00 :                3:               31 :                1

     ion_uncache:            f0000 :                1 :                1 : ffff0042e6a60f00 :                3:               22 :                1

     ion_uncache:            f0000 :                1 :                1 : ffff0042e6a61700 :                3:               36 :                1

     ion_uncache:            f0000 :                1 :                1 : ffff0042e6a61900 :                3:               32 :                1

     ion_uncache:            f0000 :                1 :                1 : ffff0042e6a61e00 :                3:               28 :                1

     ion_uncache:            f0000 :                1 :                1 : ffff0042e6a61f00 :                3:               26 :                1

     ion_uncache:            80000 :                1 :                1 : ffff0042e6a62500 :                3:               27 :                1

     ion_uncache:            f0000 :                1 :                1 : ffff0042e6a62700 :                3:               30 :                1

     ion_uncache:            80000 :                1 :                1 : ffff0042e6a63a00 :                3:               33 :                1

     ion_uncache:            80000 :                1 :                1 : ffff0042e6a63d00 :                3:               29 :                1

     ion_uncache:            f0000 :                1 :                1 : ffff0042e6a64300 :                3:               24 :                1

     ion_uncache:            80000 :                1 :                1 : ffff0042e6a65e00 :                3:               23 :                1

     ion_uncache:            f0000 :                1 :                1 : ffff0042e6a66100 :                3:               34 :                1

     ion_uncache:            80000 :                1 :                1 : ffff0042e6a69c00 :                3:               35 :                1

     ion_uncache:            80000 :                1 :                1 : ffff0042e6a6b500 :                3:               37 :                1

-------------------------------------------------------------------------
          total            b80000
-------------------------------------------------------------------------
[145106:145106] Do system command sudo sh -c 'cat /sys/kernel/debug/ion/heaps/ion_cma | grep -w 145106 | grep -w sample_hbmem'.
[145106:145106] Result 256.
free import buf
[145106:145106] Do system command sudo sh -c 'cat /sys/kernel/debug/ion/clients/145106*'.
       heap_name:    size_in_bytes :  handle refcount :    handle import :       buffer ptr :  buffer refcount :  buffer share id : buffer share count
-------------------------------------------------------------------------
          total                 0
-------------------------------------------------------------------------
[145106:145106] Do system command sudo sh -c 'cat /sys/kernel/debug/ion/heaps/ion_cma | grep -w 145106 | grep -w sample_hbmem'.
[145106:145106] Result 256.
sample_share_graph_buffer_group done
=================================================
```

#### Share Graph Buffer Group Use Consume Cnt
```sh
root@drobot:/app/multimedia_samples/sample_hbmem# ./sample_hbmem -m 18
sample_mode = 18
=================================================
Ready to sample_share_graph_buffer_group_use_consume_cnt
in_buf used by process[145143]
share_consume_cnt: 1
Testing hb_mem_wait_consume_status timeout function...
[ERROR][][mem_log.c:104] [1121625.57133][145143:145143][MEM_ALLOCATOR] <hb_mem_wait_consume_status:5644> Fail to wait share information(ret=-16777209).
hb_mem_wait_consume_status timeout OK
sample_share_graph_buffer_group_use_consume_cnt done
=================================================
```

#### Share Graph Buffer Group Fork Process Scenario
```sh
root@drobot:/app/multimedia_samples/sample_hbmem# ./sample_hbmem -m 19
sample_mode = 19
=================================================
Ready to sample_share_graph_buffer_group_fork_process_scenario
socketpair: 0
[145144:142984] In parent process.
[145145:145144] In child process.
parent write share buf: parent test graph buf share.
share_consume_cnt: 0
[145144:142984] parent send msg 1
[145145:145144] child recv msg 1
child read share buf: parent test graph buf share.
share_consume_cnt: 1
child write share buf: child test common buf share.
[145145:145144] child send msg 2
[145144:142984] parent recv msg 2
parent read share buf: child test common buf share.
[145144:142984] parent send msg 3
[145145:145144] child recv msg 3
share_consume_cnt: 0
[145144:142984] parent quit
[145145:145144] child quit
sample_share_graph_buffer_group_fork_process_scenario done
=================================================
```

#### Queue Producer Consumer
```sh
root@drobot:/app/multimedia_samples/sample_hbmem# ./sample_hbmem -m 20
sample_mode = 20
=================================================
Ready to sample_queue_producer_consumer
[145146:145146] Queue test case.
[145146:145147] Start test 1121630421675.
[145146:145147] out buffer share id 22.
[145146:145147] out buffer share id 23.
[145146:145147] out buffer share id 24.
[145146:145147] out buffer share id 25.
[145146:145147] out buffer share id 26.
[145146:145147] out buffer share id 27.
[145146:145147] out buffer share id 28.
[145146:145147] out buffer share id 29.
[145146:145147] out buffer share id 30.
[145146:145147] out buffer share id 31.
[145146:145147] out buffer share id 32.
[145146:145147] out buffer share id 33.
[145146:145147] out buffer share id 34.
[145146:145147] out buffer share id 35.
[145146:145147] out buffer share id 36.
[145146:145147] out buffer share id 37.
[145146:145147] out buffer share id 22.
[145146:145147] out buffer share id 23.
[145146:145147] out buffer share id 24.
[145146:145147] out buffer share id 25.
[145146:145147] out buffer share id 26.
[145146:145147] out buffer share id 27.
[145146:145147] out buffer share id 28.
[145146:145147] out buffer share id 29.
[145146:145147] out buffer share id 30.
[145146:145147] out buffer share id 31.
[145146:145147] out buffer share id 32.
[145146:145147] out buffer share id 33.
[145146:145147] out buffer share id 34.
[145146:145147] out buffer share id 35.
[145146:145147] out buffer share id 36.
[145146:145147] out buffer share id 37.
[145146:145147] out buffer share id 22.
[145146:145147] out buffer share id 23.
[145146:145147] out buffer share id 24.
[145146:145147] out buffer share id 25.
[145146:145147] out buffer share id 26.
[145146:145147] out buffer share id 27.
[145146:145147] out buffer share id 28.
[145146:145147] out buffer share id 29.
[145146:145147] out buffer share id 30.
[145146:145147] out buffer share id 31.
[145146:145147] out buffer share id 32.
[145146:145147] out buffer share id 33.
[145146:145147] out buffer share id 34.
[145146:145147] out buffer share id 35.
[145146:145147] out buffer share id 36.
[145146:145147] out buffer share id 37.
[145146:145147] out buffer share id 22.
[145146:145147] out buffer share id 23.
[145146:145147] out buffer share id 24.
[145146:145147] out buffer share id 25.
[145146:145147] out buffer share id 26.
[145146:145147] out buffer share id 27.
[145146:145147] out buffer share id 28.
[145146:145147] out buffer share id 29.
[145146:145147] out buffer share id 30.
[145146:145147] out buffer share id 31.
[145146:145147] out buffer share id 32.
[145146:145147] out buffer share id 33.
[145146:145147] out buffer share id 34.
[145146:145147] out buffer share id 35.
[145146:145147] out buffer share id 36.
[145146:145147] out buffer share id 37.
[145146:145147] out buffer share id 22.
[145146:145147] out buffer share id 23.
[145146:145147] out buffer share id 24.
[145146:145147] out buffer share id 25.
[145146:145147] out buffer share id 26.
[145146:145147] out buffer share id 27.
[145146:145147] out buffer share id 28.
[145146:145147] out buffer share id 29.
[145146:145147] out buffer share id 30.
[145146:145147] out buffer share id 31.
[145146:145147] out buffer share id 32.
[145146:145147] out buffer share id 33.
[145146:145147] out buffer share id 34.
[145146:145147] out buffer share id 35.
[145146:145147] out buffer share id 36.
[145146:145147] out buffer share id 37.
[145146:145147] out buffer share id 22.
[145146:145147] out buffer share id 23.
[145146:145147] out buffer share id 24.
[145146:145147] out buffer share id 25.
[145146:145147] out buffer share id 26.
[145146:145147] out buffer share id 27.
[145146:145147] out buffer share id 28.
[145146:145147] out buffer share id 29.
[145146:145147] out buffer share id 30.
[145146:145147] out buffer share id 31.
[145146:145147] out buffer share id 32.
[145146:145147] out buffer share id 33.
[145146:145147] out buffer share id 34.
[145146:145147] out buffer share id 35.
[145146:145147] out buffer share id 36.
[145146:145147] out buffer share id 37.
[145146:145147] out buffer share id 22.
[145146:145147] out buffer share id 23.
[145146:145147] out buffer share id 24.
[145146:145147] out buffer share id 25.
[145146:145147] out buffer share id 26.
[145146:145147] out buffer share id 27.
[145146:145147] out buffer share id 28.
[145146:145147] out buffer share id 29.
[145146:145147] out buffer share id 30.
[145146:145147] out buffer share id 31.
[145146:145147] out buffer share id 32.
[145146:145147] out buffer share id 33.
[145146:145147] out buffer share id 34.
[145146:145147] out buffer share id 35.
[145146:145147] out buffer share id 36.
[145146:145147] out buffer share id 37.
[145146:145147] End test 1121631428481, interval 1006806.
[145146:145147] thread quits.
[145146:145146] thread return = 281459800144720
sample_queue_producer_consumer done
=================================================
```

#### Pool
```sh
root@drobot:/app/multimedia_samples/sample_hbmem# ./sample_hbmem -m 21
sample_mode = 21
=================================================
Ready to sample_pool
[145148:145148] Do system command sudo sh -c 'cat /sys/kernel/debug/ion/clients/145148*'.
       heap_name:    size_in_bytes :  handle refcount :    handle import :       buffer ptr :  buffer refcount :  buffer share id : buffer share count
     ion_uncache:           a00000 :                1 :                1 : ffff0042f21fa800 :                3:               22 :                1

-------------------------------------------------------------------------
          total            a00000
-------------------------------------------------------------------------
[145148:145148] Do system command sudo sh -c 'cat /sys/kernel/debug/ion/heaps/ion_cma | grep -w 145148 | grep -w sample_hbmem'.
[145148:145148] Result 256.
[ERROR][][mem_log.c:104] [1121632.91136][145148:145148][MEM_POOL] <mem_try_destroy_pool_locked:617> Fail to destroy memory pool(ret=-16777199).
hb_mem_pool_destroy HB_MEM_ERR_POOL_BUSY, need free first.
hb_mem_pool_free_buf success
sample_pool done
=================================================
```

#### Com Buf User Consume Cnt
```sh
root@drobot:/app/multimedia_samples/sample_hbmem# ./sample_hbmem -m 22
sample_mode = 22
=================================================
Ready to sample_com_buf_user_consume_cnt
alloc com buf, share_id: 22
[145161:145161] Do system command sudo sh -c 'cat /sys/kernel/debug/ion/clients/145161*'.
       heap_name:    size_in_bytes :  handle refcount :    handle import :       buffer ptr :  buffer refcount :  buffer share id : buffer share count
         ion_cma:           400000 :                1 :                1 : ffff0042e6ca1500 :                3:               22 :                1

-------------------------------------------------------------------------
          total            400000
-------------------------------------------------------------------------
[145161:145161] Do system command sudo sh -c 'cat /sys/kernel/debug/ion/heaps/ion_cma | grep -w 145161 | grep -w sample_hbmem'.
         ion_cma     sample_hbmem           145161          4194304
    sample_hbmem           145161           145161            other          4194304                0          no-label               22       41c0000000
[145161:145161] Result 0.
free com buf
[145161:145161] Do system command sudo sh -c 'cat /sys/kernel/debug/ion/clients/145161*'.
       heap_name:    size_in_bytes :  handle refcount :    handle import :       buffer ptr :  buffer refcount :  buffer share id : buffer share count
-------------------------------------------------------------------------
          total                 0
-------------------------------------------------------------------------
[145161:145161] Do system command sudo sh -c 'cat /sys/kernel/debug/ion/heaps/ion_cma | grep -w 145161 | grep -w sample_hbmem'.
[145161:145161] Result 256.
sample_com_buf_user_consume_cnt done
=================================================
```

#### Graph Buf User Consume Cnt
```sh
root@drobot:/app/multimedia_samples/sample_hbmem# ./sample_hbmem -m 23
sample_mode = 23
=================================================
Ready to sample_graph_buf_user_consume_cnt
graph_buf.plane_cnt: 2, graph_buf.format: 8, graph_buf.width: 1280, graph_buf.height: 720, graph_buf.stride: 0, graph_buf.vstride: 0, graph_buf.stride: 0, graph_buf.flags: 17
[145186:145186] Do system command sudo sh -c 'cat /sys/kernel/debug/ion/clients/145186*'.
       heap_name:    size_in_bytes :  handle refcount :    handle import :       buffer ptr :  buffer refcount :  buffer share id : buffer share count
     ion_uncache:            f0000 :                1 :                1 : ffff004288ce8f00 :                3:               22 :                1

     ion_uncache:            80000 :                1 :                1 : ffff004288cecd00 :                3:               23 :                1

-------------------------------------------------------------------------
          total            170000
-------------------------------------------------------------------------
[145186:145186] Do system command sudo sh -c 'cat /sys/kernel/debug/ion/heaps/ion_cma | grep -w 145186 | grep -w sample_hbmem'.
[145186:145186] Result 256.
sample_graph_buf_user_consume_cnt done
=================================================
```

### 测试结果说明

- 如果 log 最后以`xxxx done`结尾，则表示 sample 执行成功

## 常见问题

### 内存分配失败

**现象**：`hb_mem_alloc_com_buf` / `hb_mem_alloc_graph_buf` 返回错误。

**原因**：请求大小超出后端可用空间、heapmask 指定了不可用 heap、或未先调用 `hb_mem_module_open`。

**解决**：确认已先 `hb_mem_module_open`；核对大小与 heapmask 参数；必要时用其他 backend（ION CMA/CARVEOUT/SRAM）重试。

### 跨进程共享失败

**现象**：另一进程用 share_id 映射同一段内存失败。

**原因**：share_id 未正确传递、接收进程未打开 hbmem 模块、或共享内存已被释放。

**解决**：确认通过 `hb_mem_get_share_id` 获取 share_id 并可靠传递；接收进程先 `hb_mem_module_open`；共享期间不要释放。

### cache 一致性问题

**现象**：CPU 写数据后 DMA/其他核读不到最新数据，或反之。

**原因**：未做 cache invalid/clean 操作。

**解决**：写后读前做 `hb_mem_cache_clean`（或 flush），读前做 `hb_mem_cache_invalid`；参照 `sample_share.c` 的用法。

## 相关文档

- [示例代码介绍](/Advanced_development/multimedia_development/multimedia_sample/overview)
- [多媒体 API 参考](/Advanced_development/multimedia_development/multimedia_api/hbn_api)
