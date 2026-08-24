---
sidebar_position: 5
title: "SYS（模块绑定）API"
description: "SYS（模块绑定）API 接口说明"
---

# SYS（模块绑定）API

`SYS` 模块提供 `VIO`、`ENCODER`、`DECODER`、`DISPLAY` 四个模块间的内部绑定功能，绑定后数据自动流转，无需手动搬运。

- **接口层级**：封装层简易接口（模式 1）。
- **适用场景**：采集→显示、采集→编码的 pipeline 简化，见 [多媒体示例](/Demos/multimedia_demo)。
- **前置条件**：已烧录 RDK OS，板端有编译工具链。

`SYS` API 提供了以下的接口：

| 函数 | 功能 |
| ---- | ----- |
| sp_module_bind | **绑定数据源、目标模块** |
| sp_module_unbind | **解除模块间的绑定** |

## sp_module_bind  

**【函数原型】**  

`int sp_module_bind(void *src, int32_t src_type, void *dst, int32_t dst_type)`

**【功能描述】**  

本接口可以把 `VIO`，`ENCODER`，`DECODER`，`DISPLAY`, 这四个模块的输出与输入进行内部绑定，绑定后的两个模块的数据会在内部自动流转，无需用户操作。比如绑定 `VIO` 和 `DISPLAY` 后，打开的 mipi 摄像头的数据会直接显示到显示屏上，不需要调用`VIO`的`sp_vio_get_frame`接口获取数据，之后再调用`DISPLAY`的`sp_display_set_image`接口进行显示。

支持绑定的模块关系如下：

| 源数据模块 | 目标数据模块 |
| ---- | ----- |
| VIO | ENCODER |
| VIO | DISPLAY |
| DECODER | ENCODER |
| DECODER | DISPLAY |

**【参数】**

- `src`： 数据源模块的对象指针（调用各模块初始化接口得到）
- `src_type`：源数据模块类型，支持 `SP_MTYPE_VIO` 和 `SP_MTYPE_DECODER`
- `dst`： 目标模块的对象指针（调用各模块初始化接口得到）
- `dst_type`：目标数据模块类型，支持 `SP_MTYPE_ENCODER` 和 `SP_MTYPE_DISPLAY`

**【返回类型】**  

成功返回 0，失败返回其他值。

**【注意事项】**

源/目标模块对象须先完成各自模块的初始化；仅支持 VIO→ENCODER、VIO→DISPLAY、DECODER→ENCODER、DECODER→DISPLAY 四种绑定关系。

**【兼容性】**

支持 RDK S100、RDK S600。

## sp_module_unbind  

**【函数原型】**  

`int sp_module_unbind(void *src, int32_t src_type, void *dst, int32_t dst_type)`

**【功能描述】**  

本接口完成已经绑定的两个模块的解绑，模块退出前需要先完成解绑。

**【参数】**

- `src`： 数据源模块的对象指针（调用各模块初始化接口得到）
- `src_type`：源数据模块类型，支持 `SP_MTYPE_VIO` 和 `SP_MTYPE_DECODER`
- `dst`： 目标模块的对象指针（调用各模块初始化接口得到）
- `dst_type`：目标数据模块类型，支持 `SP_MTYPE_ENCODER` 和 `SP_MTYPE_DISPLAY`

**【返回类型】**  

成功返回 0，失败返回其他值。

**【注意事项】**

参数须与 `sp_module_bind` 绑定时一致；模块退出前需先调用本接口完成解绑。

**【兼容性】**

支持 RDK S100、RDK S600。

## 数据结构与常量

以下模块类型常量定义于 `sp_sys.h`，用于 `sp_module_bind`/`sp_module_unbind` 的 `src_type`/`dst_type` 参数：

| 常量 | 值 | 说明 |
| ---- | --- | ---- |
| `SP_MTYPE_VIO` | 0 | 模块类型：VIO（视频输入） |
| `SP_MTYPE_ENCODER` | 1 | 模块类型：ENCODER（编码） |
| `SP_MTYPE_DECODER` | 2 | 模块类型：DECODER（解码） |
| `SP_MTYPE_DISPLAY` | 3 | 模块类型：DISPLAY（显示） |

## 快速示例

将 VIO 输出绑定到 DISPLAY 输入的典型调用（完整示例见 [采集→显示](/Demos/multimedia_demo/cdev/vio2display)）：

```c
// vio、disp 分别为已初始化的 VIO / DISPLAY 对象
sp_module_bind(vio, SP_MTYPE_VIO, disp, SP_MTYPE_DISPLAY);   // 绑定：VIO 输出 → DISPLAY 输入
// ... 数据自动流转，无需手动 get/set ...
sp_module_unbind(vio, SP_MTYPE_VIO, disp, SP_MTYPE_DISPLAY); // 退出前解绑
```

## 常见问题

### sp_module_bind 返回失败

**现象**：调用 `sp_module_bind` 绑定两个模块后返回失败。

**原因**：绑定的模块关系不在支持的绑定关系列表中（仅 VIO→ENCODER、VIO→DISPLAY、DECODER→ENCODER、DECODER→DISPLAY）。

**解决**：检查源/目标模块类型是否符合支持的绑定关系。

### 模块退出时异常或资源未释放

**现象**：程序退出时出现异常或下次运行受影响。

**原因**：模块退出前未先调用 `sp_module_unbind` 解绑。

**解决**：模块退出前先调用 `sp_module_unbind` 完成解绑。

## 相关文档

- [VIO API](/Simple_API/multimedia_api/cdev/vio_api)
- [ENCODER API](/Simple_API/multimedia_api/cdev/encoder_api)
