---
sidebar_position: 4
title: "MediaCodec 常见问题"
description: "RDK S100/S600 MediaCodec 编解码常见问题解答"
---

import DocScope from '@site/src/components/DocScope';

# MediaCodec 常见问题

## 配置和用法问题

#### video 编码性能规格问题

**Q**：对于 4K@30FPS 的编码，是否支持编码成 4 路独立的 1080p@30fps 码流？

**A**：codec 支持多路编码，如果想实现 1080p 4 路的编码，输入的流就需要是 4 路 1080p 的图像，无法把 1 路 4K 的图像分解成 4 路 1080p 编码。

#### GOP 配置问题

**Q**：H265 帧每次 publish 的时候，每个 GOP 的组合是怎么样的呢？会使用到 P 帧吗？每帧里支持独立解码吗？会在每帧中插入 SPS 和 PPS 吗？

**A**：GOP 结构是需要用户配置的，可以支持全 I 帧或 IP 帧的模块；如果是全 IDR 帧的话，是支持独立解码的，需要配置全 I 帧的 gop 结构和 Intra period=1；每个 IDR 帧是否要插入 sps/pps/vps，可以通过接口 `hb_mm_mc_request_idr_header` 选择，默认都会加。

#### 如何插入 userdata 信息

**Q**：在编码过程中，如何通过接口插入 userdata 信息？

**A**：通过 `hb_mm_mc_insert_user_data` 插入，"+"后面部分为用户自己插入的信息：

```c
//"+"后面部分为用户自己插入的信息
uint8_t uuid[] = "dc45e9bd-e6d948b7-962cd820-d923eeef+HorizonAI";
hb_u32 length = sizeof(uuid)/sizeof(uuid[0]);
ret = hb_mm_mc_insert_user_data(context, uuid, length);
```

#### 帧信息打印问题

**Q**：每帧编解码信息都打印会产生海量日志。

**A**：编解码进程初始化时会根据 `LOGLEVEL` 设置日志等级，当配置 `LOGLEVEL < 5` 时不会输出帧信息。

#### 外部输入 Buffer 映射失败问题

**Q**：用户在使用外部输入 buffer 模式时遇到 "Fail to map phys" 报错，驱动报 "Failed to map ion phy due to same phys"。

**A**：外部输入 buffer 是指通过内存映射来复用其它模块/程序申请的 ION Buffer，从而减少内存申请和拷贝；

用户使用外部输入 Buffer 模式时需要注意以下场景限制。

1. 不能把同一个 Buffer 地址信息给到两个不同的编解码实例做映射。

2. 不能把外部 Buffer 动态申请释放，避免得到交叠的地址导致报错；建议申请固定个数 Buffer 然后循环使用，实例退出后统一释放。

#### 内部 Buffer 申请失败问题

**Q**：用户使用较多编解码通道时出现内存申请失败问题。

**A**： libmm 从 ion 中申请到内存后还会执行 map 和 import 操作去获取 iova 和 vaddr 地址；但可能会由于达到系统 ion 内存/进程 fd 上限/内部 buffer pool 个数上限而出现内存申请失败问题。

1. ion 内存上限：需要减少通道数或优化系统 ion 内存使用。

2. 进程 fd 上限：通过 `ulimit -n` 调整进程 fd 上限值即可。

3. 内部 buffer pool 个数上限：在解码特定码流时可能遇到，建议采用限制 dpb size（max_dec_frame_buffering）的码流。

## VPU 编解码问题

#### dequeue output buffer 超时可能是什么原因

**Q**：编解码过程中，dequeue output buffer 超时可能是什么原因导致的？

**A**：常见原因与排查顺序：

1. **输入侧**：解码时要确认送入方式（`feed_mode`）与每次 queue 的数据量匹配——按帧送入时，每次必须送完整一帧；码流缺少 SPS / PPS 参数集时解码器无法解析，也会表现为一直取不到输出。

2. **CPU 压力**：CPU 压力较大时，线程调度频繁，相关工作线程调度延时。

3. **队列水位**：用 `hb_mm_mc_get_status` 看 `cur_input_buf_cnt` / `cur_output_buf_cnt`。输入侧持续堆积说明编码器没有消费，检查 `bitstream_buf_size` 是否过小。

4. **分辨率匹配**：输入 YUV 的实际分辨率必须与配置一致，不一致会导致编码器一直等待有效输入。

5. **接口对称**：前几次 dequeue output 后未及时 queue output 归还、取出未归还的 buffer 让队列耗尽、无输入 buffer 时直接 dequeue output——检查每一条 dequeue 都有对应的 queue。

#### video 解码时首帧获取出现 timeout 现象

**Q**：串行调用 dequeue/queue inputbuffer/outputbuffer 接口时，第一次 dequeue outputbuffer 必现 timeout 是什么原因？

**A**：由于硬件特性，h265 解码时第一帧会输出一个空帧，会延迟一帧给出数据。

#### video 解码时首帧 pts 不对齐问题

**Q**：解码时取出来的第一帧数据 pts 一直是 0，和赋值不一致，获取到第二帧时，才和送进去第二帧中的 pts 对应上。

**A**：当首帧头信息和 IDR 帧分开送入时，可以支持第一帧 pts 对齐，一并送入时，由于和硬件处理特性关联，第一帧会是 0。

#### 解码时出现 FAILED TO DEC_PIC_HDR: ret(1) SEQERR(00005000) 报错

**Q**：video 解码过程中，出现 `FAILED TO DEC_PIC_HDR: ret(1) SEQERR(00005000)` 报错。

**A**：这是解析帧头信息错误，解码器解码时，第一帧都带有 VPS SPS PPS 信息，但是有些码流因为格式问题，如果单独给 VPS SPS PPS 不能正常解码，需要给 VPS+SPS+PPS+IDR。

#### 编码时出现 Bitstream buffer is too small 报错

**Q**：编码过程中，出现 `Bitstream buffer is too small` 的报错。

**A**：`bitstream_buf_size` 设置过小导致，增大 size 值即可。

#### 编码时出现 Failed to VPU_EncRegisterFrameBuffer (1) 报错

**Q**：编码过程中，出现 `Failed to VPU_EncRegisterFrameBuffer (1)` 的报错。

**A**：`vlc_buf_size` 设置过小，增大 size 值即可。

#### video color range 问题

**Q**：使用 VPU 进行 H265 编码时，编码器是否会强制转换为 limit range(TV range) 输出？测试方法：用一段编码的 265 码流，直接用 ffmpeg 播放，发现解析出为 TV range。

**A**：编解码器并没有办法区分 full range 和 limit range，也没法识别这张图是 full range 或 limit range，只有用户自己知道输入的是什么 range，然后编解码处理像素的范围都是 [0,255]，是按照给入的像素直接做处理，不会有转换，解码的时候也不会做转换；但是对于 ffmpeg 它是有一个 swscaler 模块的，它是可以转换的，yuv420p 是 limit range，yuvj420p 是 full range，他内部会根据 video full range 信息做输入和输出格式的转换的。

所以如果用户现在知道自己输入的是 full range 或者 limit range，是可以设置 vui 信息的，这样通过 ffmpeg 解码时根据 vui 信息指定 ffmpeg 的输出格式来决定是否转码。

目前已经根据用户需求，将 VUI 信息中默认的 color range 模式改为 full range。

#### 当编码大片蓝天时，出现了一些异常的条纹

**Q**：当编码大片蓝天时，出现了一些异常的条纹形状是什么原因？

![蓝天条纹现象](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/media_codec/faq-blue-sky.png)

**A**：原始图片中存在较多的噪点，压缩后噪点分布不规律，看着像是条纹状，其实是对噪点压缩导致，这种现象属于 codec 硬件特性，无法消除。

#### CBR 或 AVBR 模式编码输出码率不符合预期

**Q**：用户使用 CBR 和 AVBR 模式时发现实际输出码流的码率和设置的目标码率偏差超过 10%。

**A**：常见原因与处置：

1. 全 I 帧编码（`gop_preset_idx=1`）时需要将 I 帧间隔（`intra_period`）置 1。

2. 检查目标码率设置是否合理，调整质量参数是有上下限的（仅供测试参考：针对 h264 的以 1:100 压缩率设置码率，针对 h265 的以 1:150 压缩率设置码率）。

3. 编码帧数是否足够多，码率控制过程调节质量参数需要一定时间。

#### 高优先级编码限制问题

**Q**：多路编码场景中，如何让某一路优先处理以获取最短延迟？

**A**：把要求低时延的编码任务的 priority 参数设置 31（高优先级）。需要注意如下限制条件：

1. 存在多路高优任务时无法保证低时延目标。

2. 用户需要确保高优任务程序的软件调度环境才能保证时延稳定。

   建议：总 cpu 负载不超过 90%，把创建高优编码任务的线程的调度策略改 FIFO，优先级改 20，把低优任务的线程优先级也同步调整，避免低优任务持有全局硬件锁后被抢占导致延迟波动（若有解码业务需把 queue output 接口的线程优先级也拉高）。

3. 业务场景 DDR 负载过高且 VPU 在总线中为低优先级时，带宽竞争会影响硬件处理延迟。

<DocScope products="RDK S100">

建议：比 VPU 高优的写带宽流量不超过 DDR 负载 45%，将 sysfs 节点中的 `rt_task_expect_latency_ms` 置 0 可减少指令排队。

</DocScope>

<DocScope products="RDK S600">

建议：比 VPU 高优的写带宽流量不超过 DDR 负载 45%，DDR 压力负载正常时（硬件延迟符合预期），高优通道可以和大尺寸图像放一个核上跑；DDR 压力负载过高时（由于带宽竞争硬件延迟增大），需调整总线 qos，或者把 4k 大图像拿到其它核上跑；同时将 sysfs 节点中的 `rt_task_expect_latency_ms` 置 0 可减少指令排队。

</DocScope>

4. 启停场景影响说明：同时发生多路编解码通道启停时，高优任务的帧延迟会不可避免地产生波动。

#### 编码器 Task Buffer 内存占用较高问题

**Q**：编码器的 Task Buffer 内存占用为什么这么高，能否降低？

**A**：由于 VPU 只能 offline 熵编码，必须要外部 DDR 缓存，且每个 VLC Buffer 的大小计算需要安全冗余预留，导致 Task Buffer（主要包含 vlcbuf_num * VLC Buffer）在编码器的整体内存占用中非常突出，可能占一半以上。通过接口减少 `vlcbuf_num` 是有效的节省内存的手段，当然代价是会有一定的性能损失。用户可以根据场景取舍内存最优或性能最优（默认性能优先）。

接口示例：

```c
mc_av_codec_startup_config_t startup_config;
startup_config.vlcbuf_num = 2;
ret = hb_mm_mc_set_startup_config(context, &startup_config);
```

内存检查：运行时 `cat /sys/kernel/debug/ion/heaps/all_heap_info`，能看到 Task Buffer（编码是 vpuchn*_9）大小有变化。

性能说明：`vlcbuf_num` 减小可能有不同程度的帧率降低，但编解码仍能满足性能规格。

## JPU 编解码问题

#### jpg 工具查看 1080p 图片时出现绿边

**Q**：使用 jpg 工具查看 1920x1080 图片时，底下会出现绿边。

![1080p 绿边现象](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/media_codec/faq-green-edge.png)

**A**：这是因为当前 ip 进行编码时按照 16 位对齐进行，假如到最后如果是 8 位对齐而不是 16 位对齐，那么编码器就会在后面补齐，这部分补齐的数据是随机产生的，不属于有效数据。

#### 1080p 图片多次编码后 md5 不同

**Q**：同一个 1080p yuv 图片被多次编码后，即使编码的参数都相同，产生的 jpg 图片其 md5 结果有可能不同。

**A**：因为当前 ip 进行编码时按照 16 位对齐进行，假如到最后是 8 位对齐而不是 16 位对齐，那么编码器就会在后面进行补齐，这部分补齐的数据是随机产生的，不属于有效数据。

#### 外部输入 Buffer 映射个数限制

**Q**：用户在使用外部输入 Buffer 模式（零拷贝）时，传入超过 32 个 Buffer 地址报异常 "Fail to get map idx"。

**A**：libmm 内部做了 jpg 输入 buffer 映射信息缓存，默认上限是 32 个，在退出时统一解映射。建议申请有限个 buffer 的内存然后循环使用。

## 录制相关问题

#### 封装后的 MP4 时间较预期变长

**Q**：muxer 封装后生成的 MP4 播放时间预计为 30 秒，但实际播放 mp4 文件时时间显示为 1 个小时。

![MP4 时间变长现象](http://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/06_multimedia_development/media_codec/faq-mp4-time.png)

**A**：主要是因为 video 的时间基设置不准确导致。

封装为 mp4 时，video 时间基的分子和分母设置为固定值。

```c
numerator = 1;
denominator = 90000;
```

## 相关文档

- [MediaCodec 应用场景](/Advanced_development/multimedia_development/multimedia_api/mediacodec/scene)
- [MediaCodec 调试指南](/Advanced_development/multimedia_development/multimedia_api/debug_guide/mediacodec_debug_guide)
