---
sidebar_position: 9
title: "显示输出 - DISP"
description: "RDK S100/S600 5.5.1.9 DISP（显示输出）"
---

# 显示输出 - DISP

## 概述

DISP（Display，显示输出，X5 Display → RDK DISP）是 RDK 的显示输出模块（板端 `hb_disp_interface.h`，函数 `hb_disp_*`/`hbn_idu_*`）。封装显示通道配置、视频 buffer 校验、显示完成同步与显示抓图等能力，对应硬件 IDU/MIPI TX。

## 软件抽象

- 显示通道：`hb_disp_set_channel_cfg`/`get_channel_cfg` 配置/查询显示通道。
- buffer 校验：`hb_disp_check_video_bufaddr_valid` 校验视频 buffer 地址。
- 同步：`hb_disp_get_disp_done_sync` 获取显示完成同步；`hb_disp_get_display_done` 查询显示完成。
- 抓图：`hb_disp_get_capture_buf` 获取显示抓图。

## API 调用流程

1. `hb_disp_set_channel_cfg` 配置显示通道。
2. `hb_disp_check_video_bufaddr_valid` 校验输入 buffer。
3. `hb_disp_get_disp_done_sync` 等待显示完成同步。
4. `hb_disp_get_capture_buf` 获取抓图（如需）；`hb_disp_close` 关闭通道。


## API 列表

| 函数 | 说明 |
| --- | --- |
| hb_disp_init_dev_cfg | Initialize a display device instance |
| hb_disp_init_cfg | Initialize all display device |
| hb_disp_close | Close all display device |
| hb_disp_close_id | Close a display device instance |
| hb_disp_start | Start all display device |
| hb_disp_start_id | Start a display device instance |
| hb_disp_stop | Stop all display device |
| hb_disp_stop_id | Stop a display device instance |
| hb_disp_layer_on | Enable a layer of all display device |
| hb_disp_layer_on_id | Enable a layer of a display device instance |
| hb_disp_layer_off | Close a layer of all display device |
| hb_disp_layer_off_id | Close a layer of a display device instance |
| hb_disp_set_video_bufaddr | Set video buffer address |
| hb_disp_set_video_bufaddr_id | Set video buffer address to a display device instance |
| hb_disp_set_layer_cfg | Set video buffer address |
| hb_disp_set_layer_cfg_id | Set video buffer address for a display device instance |
| hb_disp_set_timing | Set display timing |
| hb_disp_set_timing_id | Set display timing for a display device instance |
| hb_disp_get_gamma_cfg | Get gamma config value |
| hb_disp_get_gamma_cfg_id | Get gamma config value for a display device instance |
| hb_disp_set_gamma_cfg | Set gamma config for a display device instance |
| hb_disp_set_gamma_cfg_id | Set gamma config |
| hb_disp_set_output_dynamic_cfg_id | Set output dynamic config |
| hb_disp_get_output_cfg | Get ouput config |
| hb_disp_get_output_cfg_id | Get ouput config of a display device instance |
| hb_disp_set_output_cfg | Set ouput config |
| hb_disp_set_output_cfg_id | Set ouput config of a display device instance |
| hb_disp_get_upscaling_cfg | Get upscale config |
| hb_disp_get_upscaling_cfg_id | Get upscale config of a display device instance |
| hb_disp_set_upscaling_cfg | Set upscale config of a display device instance |
| hb_disp_set_upscaling_cfg_id | Set upscale config of a display device instance |
| hb_disp_get_channel_cfg | Get channel config parameters |
| hb_disp_get_channel_cfg_id | Get channel config parameters of a display device instance |
| hb_disp_set_channel_cfg | Set channel config parameters of a display device instance |
| hb_disp_set_channel_cfg_id | Set channel config parameters of a display device instance |
| hb_disp_out_upscale | user config up-scale |
| hb_disp_out_upscale_id | user config up-scale for a display device instance |
| hb_disp_get_display_done | user get the display done flag |
| hb_disp_get_display_done_id | user get the display done flag for a display device instance |
| hb_disp_check_video_bufaddr_valid | user check whether the graphic size matches the channel |
| hb_disp_check_video_bufaddr_valid_id | user check whether the graphic size matches the channel |
| hb_disp_get_video_display_done_id | user get layer buffer read done flag |
| hb_disp_get_video_display_done | user get layer buffer read done flag |
| hb_disp_get_disp_done_sync_id | user wait display vsync flag |
| hb_disp_get_capture_buf_id | user get capture buffer |
| hb_disp_release_capture_buf_id | user release capture buffer |
| hb_disp_set_disp_oneshot_trigger_id | user trigger display control oneshot output |

## API 接口说明

### hb_disp_init_dev_cfg

【函数声明】

```c
HB_API int32_t hb_disp_init_dev_cfg(uint32_t disp_id, const char *cfg_file);
```

【功能描述】

Initialize a display device instance

【返回值】

"= 0" success
&lt;0 failed

【兼容性】
HW: Ultra/Super; SW: 0.0.1

### hb_disp_init_cfg

【函数声明】

```c
HB_API int32_t hb_disp_init_cfg(const char *cfg_file);
```

【功能描述】

Initialize all display device

【返回值】

"= 0" success
&lt;0 failed

【兼容性】
HW: Ultra/Super; SW: 0.0.1

### hb_disp_close

【函数声明】

```c
HB_API int32_t hb_disp_close(void);
```

【功能描述】

Close all display device

【返回值】

"= 0" success
&lt;0 failed

【兼容性】
HW: Ultra/Super; SW: 0.0.1

### hb_disp_close_id

【函数声明】

```c
HB_API int32_t hb_disp_close_id(uint32_t disp_id);
```

【功能描述】

Close a display device instance

【返回值】

"= 0" success
&lt;0 failed

【兼容性】
HW: Ultra/Super; SW: 0.0.1

### hb_disp_start

【函数声明】

```c
HB_API int32_t hb_disp_start(void);
```

【功能描述】

Start all display device

【返回值】

"= 0" success
&lt;0 failed

【兼容性】
HW: Ultra/Super; SW: 0.0.1

### hb_disp_start_id

【函数声明】

```c
HB_API int32_t hb_disp_start_id(uint32_t disp_id);
```

【功能描述】

Start a display device instance

【返回值】

"= 0" success
&lt;0 failed

【兼容性】
HW: Ultra/Super; SW: 0.0.1

### hb_disp_stop

【函数声明】

```c
HB_API int32_t hb_disp_stop(void);
```

【功能描述】

Stop all display device

【返回值】

"= 0" success
&lt;0 failed

【兼容性】
HW: Ultra/Super; SW: 0.0.1

### hb_disp_stop_id

【函数声明】

```c
HB_API int32_t hb_disp_stop_id(uint32_t disp_id);
```

【功能描述】

Stop a display device instance

【返回值】

"= 0" success
&lt;0 failed

【兼容性】
HW: Ultra/Super; SW: 0.0.1

### hb_disp_layer_on

【函数声明】

```c
HB_API int32_t hb_disp_layer_on(uint32_t layer_number);
```

【功能描述】

Enable a layer of all display device

【返回值】

"= 0" success
&lt;0 failed

【兼容性】
HW: Ultra/Super; SW: 0.0.1

### hb_disp_layer_on_id

【函数声明】

```c
HB_API int32_t hb_disp_layer_on_id(uint32_t layer_number, uint32_t disp_id);
```

【功能描述】

Enable a layer of a display device instance

【返回值】

"= 0" success
&lt;0 failed

【兼容性】
HW: Ultra/Super; SW: 0.0.1

### hb_disp_layer_off

【函数声明】

```c
HB_API int32_t hb_disp_layer_off(uint32_t layer_number);
```

【功能描述】

Close a layer of all display device

【返回值】

"= 0" success
&lt;0 failed

【兼容性】
HW: Ultra/Super; SW: 0.0.1

### hb_disp_layer_off_id

【函数声明】

```c
HB_API int32_t hb_disp_layer_off_id(uint32_t layer_number, uint32_t disp_id);
```

【功能描述】

Close a layer of a display device instance

【返回值】

"= 0" success
&lt;0 failed

【兼容性】
HW: Ultra/Super; SW: 0.0.1

### hb_disp_set_video_bufaddr

【函数声明】

```c
HB_API int32_t hb_disp_set_video_bufaddr(uint32_t layer_no, void *addr_y, void *addr_c);
```

【功能描述】

Set video buffer address

【返回值】

"= 0" success
&lt;0 failed

【兼容性】
HW: Super; SW: 0.0.1

### hb_disp_set_video_bufaddr_id

【函数声明】

```c
HB_API int32_t hb_disp_set_video_bufaddr_id(uint32_t disp_id, uint32_t layer_no, void *addr_y, void *addr_c);
```

【功能描述】

Set video buffer address to a display device instance

【返回值】

"= 0" success
&lt;0 failed

【兼容性】
HW: Super; SW: 0.0.1

### hb_disp_set_layer_cfg

【函数声明】

```c
HB_API int32_t hb_disp_set_layer_cfg(uint32_t layer_no, uint32_t width, uint32_t height, uint32_t x_pos, uint32_t y_pos);
```

【功能描述】

Set video buffer address

【返回值】

"= 0" success
&lt;0 failed

【兼容性】
HW: Ultra/Super; SW: 0.0.1

### hb_disp_set_layer_cfg_id

【函数声明】

```c
HB_API int32_t hb_disp_set_layer_cfg_id(uint32_t layer_no, uint32_t width, uint32_t height, uint32_t x_pos, uint32_t y_pos, uint32_t disp_id);
```

【功能描述】

Set video buffer address for a display device instance

【返回值】

"= 0" success
&lt;0 failed

【兼容性】
HW: Ultra/Super; SW: 0.0.1

### hb_disp_set_timing

【函数声明】

```c
HB_API int32_t hb_disp_set_timing(disp_timing_t *user_timing);
```

【功能描述】

Set display timing

【返回值】

"= 0" success
&lt;0 failed

【兼容性】
HW: Ultra/Super; SW: 0.0.1

### hb_disp_set_timing_id

【函数声明】

```c
HB_API int32_t hb_disp_set_timing_id(disp_timing_t *user_timing, uint32_t	    disp_id);
```

【功能描述】

Set display timing for a display device instance

【返回值】

"= 0" success
&lt;0 failed

【兼容性】
HW: Ultra/Super; SW: 0.0.1

### hb_disp_get_gamma_cfg

【函数声明】

```c
HB_API int32_t hb_disp_get_gamma_cfg(float32_t *gamma_val);
```

【功能描述】

Get gamma config value

【返回值】

"= 0" success
&lt;0 failed

【兼容性】
HW: Ultra/Super; SW: 0.0.1

### hb_disp_get_gamma_cfg_id

【函数声明】

```c
HB_API int32_t hb_disp_get_gamma_cfg_id(float32_t *gamma_val, uint32_t disp_id);
```

【功能描述】

Get gamma config value for a display device instance

【返回值】

"= 0" success
&lt;0 failed

【兼容性】
HW: Ultra/Super; SW: 0.0.1

### hb_disp_set_gamma_cfg

【函数声明】

```c
HB_API int32_t hb_disp_set_gamma_cfg(float32_t gamma_user);
```

【功能描述】

Set gamma config for a display device instance

【返回值】

"= 0" success
&lt;0 failed

【兼容性】
HW: Ultra/Super; SW: 0.0.1

### hb_disp_set_gamma_cfg_id

【函数声明】

```c
HB_API int32_t hb_disp_set_gamma_cfg_id(float32_t gamma_user, uint32_t disp_id);
```

【功能描述】

Set gamma config

【返回值】

"= 0" success
&lt;0 failed

【兼容性】
HW: Ultra/Super; SW: 0.0.1

### hb_disp_set_output_dynamic_cfg_id

【函数声明】

```c
HB_API int32_t hb_disp_set_output_dynamic_cfg_id(output_dynamic_cfg_t *dynamic_cfg, uint32_t disp_id);
```

【功能描述】

Set output dynamic config

【返回值】

"= 0" success
&lt;0 failed

【兼容性】
HW: Super; SW: 0.0.1

### hb_disp_get_output_cfg

【函数声明】

```c
HB_API int32_t hb_disp_get_output_cfg(output_cfg_t *cfg);
```

【功能描述】

Get ouput config

【返回值】

"= 0" success
&lt;0 failed

【兼容性】
HW: Ultra/Super; SW: 0.0.1

### hb_disp_get_output_cfg_id

【函数声明】

```c
HB_API int32_t hb_disp_get_output_cfg_id(output_cfg_t *cfg, uint32_t disp_id);
```

【功能描述】

Get ouput config of a display device instance

【返回值】

"= 0" success
&lt;0 failed

【兼容性】
HW: Ultra/Super; SW: 0.0.1

### hb_disp_set_output_cfg

【函数声明】

```c
HB_API int32_t hb_disp_set_output_cfg(output_cfg_t *cfg);
```

【功能描述】

Set ouput config

【返回值】

"= 0" success
&lt;0 failed

【兼容性】
HW: Ultra/Super; SW: 0.0.1

### hb_disp_set_output_cfg_id

【函数声明】

```c
HB_API int32_t hb_disp_set_output_cfg_id(output_cfg_t *cfg, uint32_t	     disp_id);
```

【功能描述】

Set ouput config of a display device instance

【返回值】

"= 0" success
&lt;0 failed

【兼容性】
HW: Ultra/Super; SW: 0.0.1

### hb_disp_get_upscaling_cfg

【函数声明】

```c
HB_API int32_t hb_disp_get_upscaling_cfg(upscaling_cfg_t *cfg);
```

【功能描述】

Get upscale config

【返回值】

"= 0" success
&lt;0 failed

【兼容性】
HW: Ultra/Super; SW: 0.0.1

### hb_disp_get_upscaling_cfg_id

【函数声明】

```c
HB_API int32_t hb_disp_get_upscaling_cfg_id(upscaling_cfg_t *cfg, uint32_t	     disp_id);
```

【功能描述】

Get upscale config of a display device instance

【返回值】

"= 0" success
&lt;0 failed

【兼容性】
HW: Ultra/Super; SW: 0.0.1

### hb_disp_set_upscaling_cfg

【函数声明】

```c
HB_API int32_t hb_disp_set_upscaling_cfg(const upscaling_cfg_t *cfg);
```

【功能描述】

Set upscale config of a display device instance

【返回值】

"= 0" success
&lt;0 failed

【兼容性】
HW: Ultra/Super; SW: 0.0.1

### hb_disp_set_upscaling_cfg_id

【函数声明】

```c
HB_API int32_t hb_disp_set_upscaling_cfg_id(const upscaling_cfg_t *cfg, uint32_t		   disp_id);
```

【功能描述】

Set upscale config of a display device instance

【返回值】

"= 0" success
&lt;0 failed

【兼容性】
HW: Ultra/Super; SW: 0.0.1

### hb_disp_get_channel_cfg

【函数声明】

```c
HB_API int32_t hb_disp_get_channel_cfg(uint32_t chn, channel_base_cfg_t *cfg);
```

【功能描述】

Get channel config parameters

【返回值】

"= 0" success
&lt;0 failed

【兼容性】
HW: Ultra/Super; SW: 0.0.1

### hb_disp_get_channel_cfg_id

【函数声明】

```c
HB_API int32_t hb_disp_get_channel_cfg_id(uint32_t chn, channel_base_cfg_t *cfg, uint32_t disp_id);
```

【功能描述】

Get channel config parameters of a display device instance

【返回值】

"= 0" success
&lt;0 failed

【兼容性】
HW: Ultra/Super; SW: 0.0.1

### hb_disp_set_channel_cfg

【函数声明】

```c
HB_API int32_t hb_disp_set_channel_cfg(uint32_t			 chn, channel_base_cfg_t *cfg);
```

【功能描述】

Set channel config parameters of a display device instance

【返回值】

"= 0" success
&lt;0 failed

【兼容性】
HW: Ultra/Super; SW: 0.0.1

### hb_disp_set_channel_cfg_id

【函数声明】

```c
HB_API int32_t hb_disp_set_channel_cfg_id(uint32_t		    chn, channel_base_cfg_t *cfg, uint32_t		    disp_id);
```

【功能描述】

Set channel config parameters of a display device instance

【返回值】

"= 0" success
&lt;0 failed

【兼容性】
HW: Ultra/Super; SW: 0.0.1

### hb_disp_out_upscale

【函数声明】

```c
HB_API int32_t hb_disp_out_upscale(uint32_t src_w, uint32_t src_h, uint32_t tag_w, uint32_t tag_h);
```

【功能描述】

user config up-scale

【返回值】

"= 0" success
&lt;0 failed

【兼容性】
HW: Ultra/Super; SW: 0.0.1

### hb_disp_out_upscale_id

【函数声明】

```c
HB_API int32_t hb_disp_out_upscale_id(uint32_t src_w, uint32_t src_h, uint32_t tag_w, uint32_t tag_h, uint32_t disp_id);
```

【功能描述】

user config up-scale for a display device instance

【返回值】

"= 0" success
&lt;0 failed

【兼容性】
HW: Ultra/Super; SW: 0.0.1

### hb_disp_get_display_done

【函数声明】

```c
HB_API int32_t hb_disp_get_display_done(void);
```

【功能描述】

user get the display done flag

【返回值】

0:not done;1:done

【兼容性】
HW: Ultra/Super; SW: 0.0.1

### hb_disp_get_display_done_id

【函数声明】

```c
HB_API int32_t hb_disp_get_display_done_id(uint32_t disp_id);
```

【功能描述】

user get the display done flag for a display device instance

【返回值】

0:not done;1:done

【兼容性】
HW: Ultra/Super; SW: 0.0.1

### hb_disp_check_video_bufaddr_valid

【函数声明】

```c
HB_API int32_t hb_disp_check_video_bufaddr_valid(size_t	  graphic_size, uint32_t disp_layer_no);
```

【功能描述】

user check whether the graphic size matches the channel

【返回值】

"= 0" success
&lt;0 failed

【兼容性】
HW: Ultra/Super; SW: 0.0.1

### hb_disp_check_video_bufaddr_valid_id

【函数声明】

```c
HB_API int32_t hb_disp_check_video_bufaddr_valid_id(size_t   graphic_size, uint32_t disp_layer_no, uint32_t  disp_id);
```

【功能描述】

user check whether the graphic size matches the channel

【返回值】

"= 0" success
&lt;0 failed

【兼容性】
HW: Ultra/Super; SW: 0.0.1

### hb_disp_get_video_display_done_id

【函数声明】

```c
HB_API int32_t hb_disp_get_video_display_done_id(uint32_t layer, uint32_t disp_id);
```

【功能描述】

user get layer buffer read done flag

【返回值】

"= 0" success
&lt;0 failed

【兼容性】
HW: Ultra/Super; SW: 0.0.1

### hb_disp_get_video_display_done

【函数声明】

```c
HB_API int32_t hb_disp_get_video_display_done(uint32_t layer);
```

【功能描述】

user get layer buffer read done flag

【返回值】

"= 0" success
&lt;0 failed

【兼容性】
HW: Ultra/Super; SW: 0.0.1

### hb_disp_get_disp_done_sync_id

【函数声明】

```c
HB_API int32_t hb_disp_get_disp_done_sync_id(uint32_t disp_id, uint64_t rel_seq);
```

【功能描述】

user wait display vsync flag

【返回值】

"= 0" success
&lt;0 failed

【兼容性】
HW: Super; SW: 0.0.1

### hb_disp_get_capture_buf_id

【函数声明】

```c
HB_API int32_t hb_disp_get_capture_buf_id(uint32_t disp_id, uint32_t timeout, struct hb_mem_graphic_buf_t *out_buf);
```

【功能描述】

user get capture buffer

【返回值】

"= 0" success
&lt;0 failed

【兼容性】
HW: Super; SW: 0.0.1

### hb_disp_release_capture_buf_id

【函数声明】

```c
HB_API int32_t hb_disp_release_capture_buf_id(uint32_t disp_id, struct hb_mem_graphic_buf_t *out_buf);
```

【功能描述】

user release capture buffer

【返回值】

"= 0" success
&lt;0 failed

【兼容性】
HW: Super; SW: 0.0.1

### hb_disp_set_disp_oneshot_trigger_id

【函数声明】

```c
HB_API int32_t hb_disp_set_disp_oneshot_trigger_id(uint32_t disp_id);
```

【功能描述】

user trigger display control oneshot output

【返回值】

"= 0" success
&lt;0 failed

【兼容性】
HW: Super; SW: 0.0.1

## 相关文档

- [DISPLAY API](/Simple_API/multimedia_api/cdev/display_api)
- [Display 对象](/Simple_API/multimedia_api/pydev/object_display)
- [采集→显示](/Demos/multimedia_demo/cdev/vio2display)
