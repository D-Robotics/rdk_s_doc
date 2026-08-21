---
sidebar_position: 11
title: "Sunrise camera Development Guide"
description: "Sunrise camera development guide - board-side example usage guide"
---

# Sunrise camera Development Guide

## Sunrise camera System Design

### System Block Diagram

Sunrise camera implements a variety of application solutions, including smart cameras and intelligent analysis boxes.

The Sunrise camera source code includes the WebPages at the user operation layer, the communication module layer, and the functional module layer. This document mainly introduces the design of these three modules.

The HAL-layer modules include the multimedia-related module call interface library, the BPU module inference library, and so on.

On top of the standard driver library included in the kernel version, the system BSP is provided.

The software block diagram is shown below:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/images_to_upload/software_framework.png" alt="System block diagram" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

### Microkernel Design

The microkernel architecture, also known as the plug-in architecture, means that the software kernel is relatively small, and the main functions and business logic are implemented through plug-ins.

The core usually contains only the minimal functions required for the system to run. Plug-ins are independent of each other, and communication between plug-ins should be minimized to avoid mutual dependency problems.

### Architecture Advantages and Disadvantages

**Advantages**

Good functional extensibility: whatever function is needed, just develop a plug-in.

Functions are isolated from each other; plug-ins can be loaded and unloaded independently, making deployment easy.

Highly customizable to suit different development needs.

Supports incremental development, with functions added step by step.

**Disadvantages**

Poor scalability: the core is usually an independent unit and is not easy to distribute.

Relatively high development difficulty, because it involves communication between plug-ins and the core, as well as plug-in registration.

## Sunrise camera Architecture View

### Module Partition

| **Module**                   | **Directory** | **Description**                                                          |
| ---------------------------- | ------------- | ----------------------------------------------------------------------- |
| Event bus module             | communicate   | Implements module event registration, event reception, and event dispatch |
| Common library module        | common        | Common operation functions, log/lock, thread operations, queue operations, etc. |
| Camera module                | Platform      | Chip-platform-related code, encapsulating the hardware differences       |
| External interaction module  | Transport     | The part for interaction between the device and external parties: rtspserver, websocket, etc. |
| Main program entry           | Main          | Main function entry                                                      |

**Top-level code structure**
```bash
.
├── common						# Common library module code
├── communicate					# Event bus module
├── config						# Compilation configuration directory
├── main						# Main entry program
├── Makefile						# Compilation script
├── makefile.param				# Compilation configuration
├── Platform						# Camera module; platform, application scenario, and chip IP related code is implemented in this directory
├── start_app.sh					# Startup script
├── sunrise_camera.service 		# Configuration file for enabling auto-start at boot
├── third_party					# Dependent third-party libraries
├── Transport						# Implementation of the rtspserver and websocket modules
├── VERSION						# Version information
└── WebServer						# Web page programs and resource files
```

**Compilation**

1. Log in to the device and enter the directory: `/app/multimedia_samples/sunrise_camera`
2. Run the command: `make`
3. The generated target file: `sunrise_camera`
```sh
root@ubuntu:/app/multimedia_samples/sunrise_camera# ls sunrise_camera/bin/
log  sunrise_camera  www
```

### Event Bus Module (communicate)

#### Overview

The event bus module is the minimal running unit. According to the compilation options, it calls the registration interface functions of different modules and completes the reception and dispatch of CMDs from different modules.

During interaction between modules, if the received CMD has been registered and enabled, it is relayed to the accepting submodule for processing, and after the processing is complete, the processing result is returned to the requesting module.

During interaction between modules, if the received CMD is not registered or not enabled, the CMD invocation fails.

#### Functional Description

1. Static plug/unplug control of module plug-ins
2. Relay of module CMD instructions

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/images_to_upload/event_bus.png" alt="Functional description diagram" style={{ width: '60%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

Example:

The SDK_CMD_CAMERA_GET_CHIP_TYPE command is defined in the camera submodule. After this CMD is registered by calling the camera_cmd_register function, when the websocket submodule receives a web page request to get the chip type, the websocket module can call the interface in the camera submodule through the following code.

The whole process is shown in the following figure:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/images_to_upload/event_bus_flow.png" alt="Functional description diagram" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

#### Module Code Structure

```bash
.
├── include
│   ├── sdk_common_cmd.h			# Defines the CMDs of all submodules in the system
│   ├── sdk_common_struct.h		    # Defines the data structures used by each CMD
│   └── sdk_communicate.h			# Defines the interface functions of this module
├── Makefile
└── src
    └── sdk_communicate.c			# Interface code implementation
```

#### Interface Description

**sdk_globle_prerare**

The xxx_cmd_register() functions of all submodules are centralized into this function. When the main program starts, this interface is called to register all CMDs that need to be registered and enabled by the submodules into the subsystem.

Each submodule must implement xxx_cmd_register(), in which the submodule's CMD registration is implemented. This is the basic prerequisite for the whole system to run normally.

Example:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/images_to_upload/cmd_register.png" alt="Interface description diagram" style={{ width: '60%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

**sdk_cmd_register**

CMD registration interface.

**sdk_cmd_unregister**

CMD unregistration interface.

**sdk_cmd_impl**

A submodule calls this interface to invoke the interface functions implemented by other submodules.

### Common Library Module (common)

#### Overview

The program's common library, including but not limited to log operations, lock operations, thread wrappers, base64, etc.

This module mainly encapsulates the common classes and common functions used in programming, avoiding the same operation functions being implemented in multiple places.

Updates to this module affect all modules, so operate with caution.

#### Functional Description

None

#### Module Code Structure

```bash
.
├── Makefile					# Compilation script
├── makefile.param
└── utils
    ├── include				    # Header files
    │   ├── aes256.h
    │   ├── base64.h
    │   ├── cJSON_Direct.h
    │   ├── cmap.h
    │   ├── common_utils.h
    │   ├── cqueue.h
    │   ├── gen_rand.h
    │   ├── lock_utils.h
    │   ├── mqueue.h
    │   ├── mthread.h
    │   ├── nalu_utils.h
    │   ├── sha256.h
    │   ├── stream_define.h
    │   ├── stream_manager.h
    │   └── utils_log.h
    ├── Makefile
    └── src                      # Implementation source code
        ├── aes256.c
        ├── base64.c
        ├── cJSON_Direct.c
        ├── cmap.c
        ├── common_utils.c
        ├── cqueue.c
        ├── gen_rand.c
        ├── lock_utils.c
        ├── mqueue.c
        ├── mthread.c
        ├── nalu_utils.c
        ├── sha256.c
        ├── stream_manager.c
        └── utils_log.c
```

### Platform Module

#### Overview

This module mainly includes video encoding, ISP control, image control, snapshot capture, video output, algorithm computation, etc.

The internal structure of this module is as follows:

api_vpp serves as the entry point of this module and defines the supported CMD command set;

solution_handle implements the read/write of application configurations and the assignment of scenario interfaces;

vpp_camera_impl and vpp_box_impl implement the application scenario functions;

vp_wrap implements the interface encapsulation of the multimedia modules;

the bpu_wrap module implements the encapsulation of the algorithm inference interface and post-processing methods.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/images_to_upload/platform_module.png" alt="Overview diagram" style={{ width: '70%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

#### Functional Description

To implement a new application scenario, you only need to implement the interfaces defined in the vpp_ops_t structure.

```c
typedef struct vpp_ops {
	int (*init_param)(void); // Initialize the configuration parameters of the VIN, VSE, VENC, and BPU modules
	int (*init)(void); // SDK initialization; initialize according to the configuration
	int (*uninit)(void); // Uninitialize
	int (*start)(void); // Start all media-related modules
	int (*stop)(void); // Stop
	// All CMDs supported by this module are implemented through the following two interfaces
	int (*param_set)(SOLUTION_PARAM_E type, char* val, unsigned int length);
	int (*param_get)(SOLUTION_PARAM_E type, char* val, unsigned int* length);
} vpp_ops_t;
```

The flow of starting an application solution (taking starting vpp_camera as an example) is as follows:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/images_to_upload/vpp_camera_flow.png" alt="Functional description diagram" style={{ width: '70%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

The initialization and startup flows of other submodules can also refer to this flowchart.

#### Module Code Structure

Code path: Platform/S100

```bash
.
├── api                                   # CMD registration
├── bpu_wrap                              # Wrapper for using the BPU algorithm interfaces
├── main                                  # Implementation of the actual functional interfaces for CMD registration
├── Makefile                              # Compilation script
├── makefile.param                        # Compilation configuration
├── model_zoom                            # Algorithm model repository
├── test_data                             # Stores the test video stream files and program configuration files
├── vpp_impl                              # Functional implementation of the application solutions
├── vp_sensors -> ../../../vp_sensors/    # Camera Sensor configuration code; the code in this directory is shared with other sample modules
└── vp_wrap                               # Encapsulation of the multimedia interfaces
```

### External Interaction Module (Transport)

#### Overview

The concrete submodule that interacts with terminals or platforms in compliance with the transport protocol; it includes the communication modules over the network, via rtspserver and websocket.

The interaction module is the part with the most inter-module interaction and must strictly follow the design conventions. All requests for data from other modules must be handled through the defined module CMDs.

#### Media Server Module

This module is a wrapper implementation of ZLMediakit, wrapping ZLMediakit into several simple interfaces such as init, create_media, and push_video. It currently supports pushing H264 and H265 streams.

For the startup and usage of this module, refer to the flow introduced in the Main Program Entry section.

#### WebSocket Server Module

This module handles the interaction with the operations on the web. After the corresponding operation is performed on the web, the websocket server receives the command and parameters of the corresponding kind, and processes them for the corresponding functionality in the handle_user_msg function of the code file handle_user_massage.c. If you want to add a new interaction command, please add it to this function.

The interaction commands currently supported include: scenario switching, scenario parameter get and set, chip type query, h264 bitrate setting, system time synchronization, websocket stream pulling and stopping, etc.

### Main Program Entry (main)

#### Overview

The main program entry, where modules are started.

The basic submodule startup order is as follows. Note that the startup order of the modules must follow the dependency relationships between submodules.

#### Execution Flow

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/images_to_upload/main_flow.png" alt="Execution flow diagram" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

### WebServer

#### Overview

This module implements a web service based on the HTTP protocol through ZLMediakit, allowing users to directly preview videos and configure application scenarios through a browser.

#### Functional Description

The `WebServer/www` directory provides: resource files, web pages, css, and js programs.


## Using BPU for Algorithm Inference

### Overview

This module implements algorithm model loading, data pre-processing, inference, and algorithm post-processing, and returns the results in json format.

The runtime sequence of the module is as follows:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/images_to_upload/bpu_flow.png" alt="Overview diagram" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

### Adding a New Model

Currently, sunrise_camera only supports running a small number of algorithm models. In actual applications, it is inevitable to run other models to test their effects. This section describes the basic steps for adding a new algorithm model.

| **Item**                         | **Source File**                                   | **Description**                                                                                                                                     |
| -------------------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Prepare the algorithm model      | Place it in the Platform/s100/model_zoom directory (*.hbm) | Add a fixed-point algorithm model that can run on the development board in this directory (the model files shipped with the system are stored in: `/opt/hobot/model/s100/basic/`) |
| Add the model configuration      | bpu_wrap.c                                        | In bpu_models, add the name of the new model, and specify the algorithm model file, as well as the inference and post-processing function interfaces |
| Inference thread handler function | bpu_wrap.c                                       | In the handler function, prepare the output tensors, call **hbDNNInfer** for inference, and put the result into the output queue after getting it. Example: **inference_yolov5s** |
| Post-processing thread function  | bpu_wrap.c                                        | Take the algorithm result out of the output queue, call the post-processing method to process it, and get the result string in json format. If a callback function is set, call the callback. Example: **post_process_yolov5s** |
| Post-processing code             | yolov5_post_process.cpp                           | Every algorithm model must have a corresponding post-processing method. For example, a classification model needs to map the returned id to the type name, and a detection model needs to map the detection boxes to the positions in the original image. |
| Add rendering handling on the web page | WebServer/www/js/DisplayWindowManager.js      | Optional                                                                                                                                            |

#### Preparing the Algorithm Model

The algorithm models that can run on the development board have two kinds of extensions: bin files and hbm files:

1. bin models: models obtained through algorithm toolchain conversion (PTQ), with bin as the extension
2. hbm models: algorithm models directly trained through the fixed-point model training framework (QAT)

For the detailed development instructions of algorithm models, please refer to the *Quantization Toolchain Development Guide* document.

#### Adding the Initialization Process

Define the new algorithm model in the bpu_models array in bpu_wrap.c, adding the name of the new model and specifying the algorithm model file, as well as the inference and post-processing function interfaces:

```c
bpu_model_descriptor bpu_models[] = {
	{
		.model_name = "yolov5s",                                   // Algorithm name; this name is displayed on the web client for the user to select
		.model_path = "../model_zoom/yolov5s_672x672_nv12.bin",    // Algorithm model file
		.inference_func = inference_yolov5s,                       // Inference function
		.post_proc_func = post_process_yolov5s                     // Post-processing function; if this part is relatively simple, it can be merged into the inference function
	},
	... (omitted) ...
};
```

When the algorithm task starts, the corresponding inference thread and algorithm post-processing thread are started according to `model_name`.

#### Inference Thread Handler Function

In the inference thread, implement the preparation of the output result tensors; take the yuv data out of the yuv queue, call HB_BPU_runModel for inference to obtain the algorithm result; then push the algorithm result into the output queue for post-processing.

```c
static void *inference_yolov5s(void *ptr)
{
	// Prepare the output node tensors of the model; 5 groups of output buffers are rotated. This is a simple approach; theoretically, post-processing is faster than model inference
	hbDNNTensor output_tensors[5][3];
	int32_t cur_ouput_buf_idx = 0;
	for (i = 0; i < 5; i++) {
		ret = prepare_output_tensor(output_tensors[i], dnn_handle);
		if (ret) {
			SC_LOGE("prepare model output tensor failed");
			return NULL;
		}
	}

	while (privThread->eState == E_THREAD_RUNNING) {
		// Get the image data that needs algorithm computation; the format is basically NV12 yuv
		if (mQueueDequeueTimed(&bpu_handle->m_input_queue, 100, (void**)&input_tensor) != E_QUEUE_OK)
			continue;

        // Model inference
		hbDNNInferCtrlParam infer_ctrl_param;
		HB_DNN_INITIALIZE_INFER_CTRL_PARAM(&infer_ctrl_param);
		ret = hbDNNInfer(&task_handle,
				&output,
				&input_tensor->m_dnn_tensor,
				dnn_handle,
				&infer_ctrl_param);

		// Enqueue the data for post-processing
		Yolo5PostProcessInfo_t *post_info;
		post_info = (Yolo5PostProcessInfo_t *)malloc(sizeof(Yolo5PostProcessInfo_t));
		… …
		mQueueEnqueue(&bpu_handle->m_output_queue, post_info);
		cur_ouput_buf_idx++;
		cur_ouput_buf_idx %= 5;
}
}
```

#### Post-Processing Thread Function

In the post-processing thread, implement the following: get the algorithm result from the output queue; call the post-processing function; call the algorithm task callback function to process the algorithm result (the currently effective callbacks all send the result directly to the web, where the algorithm result is rendered).

```c

static void *post_process_yolov5s(void *ptr)
{
	tsThread *privThread = (tsThread*)ptr;
	Yolov5PostProcessInfo_t *post_info;

	mThreadSetName(privThread, __func__);

	bpu_handle_t *bpu_handle = (bpu_handle_t *)privThread->pvThreadData;
	while (privThread->eState == E_THREAD_RUNNING) {
		// Get data from the post-processing data queue
		if (mQueueDequeueTimed(&bpu_handle->m_output_queue, 100, (void**)&post_info) != E_QUEUE_OK)
			continue;

		char *results = Yolov5PostProcess(post_info); // Perform post-processing, e.g., obtain detection boxes, filter out low-confidence results, and scale the detection box width and height to the displayed video size

		if (results) {
			if (NULL != bpu_handle->callback) {
				// Algorithm task result callback; in the current application scenario, the algorithm result is sent to the browser via websocket
				bpu_handle->callback(results, bpu_handle->m_userdata);
			} else {
				SC_LOGI("%s", results);
			}
			free(results);
		}
		if (post_info) {
			free(post_info);
			post_info = NULL;
		}
	}
	mThreadFinish(privThread);
	return NULL;
}
```

#### Post-Processing Code

It is recommended that a post-processing method be added for every algorithm model:

-   yolov5: yolo5_post_process.cpp
-   mobilenet_v2: the processing of classification models is relatively simple; it just maps the id to the type name

The following tasks must be completed in the post-processing method:

Analyze the output results: classification models need to match the type names, and detection models need to map the algorithm result boxes to the coordinates of the original image, etc.

Convert the algorithm results into json format. For convenience, the json formatting is performed in the function; for example, when the results are passed to the web, the output here can be used directly.

```c
// Yolov5 output tensor format
// Three downsampling passes produce three sets of reduced grids, then each grid is predicted three times, and the results are finally output
char* Yolov5PostProcess(Yolov5PostProcessInfo_t *post_info) {
	hbDNNTensor *tensor = post_info->output_tensor;

	std::vector<Detection> dets;
	std::vector<Detection> det_restuls;
	uint32_t i = 0;
	char *str_dets;

	// Filter detection boxes according to confidence
	for (i = 0; i < default_yolov5_config.strides.size(); i++) {
		_postProcess(&tensor[i], post_info, i, dets);
	}
	// Calculate the intersection over union (IoU) to merge detection boxes; pass in the IoU threshold (0.65) and the number of returned boxes (5000)
	yolov5_nms(dets, post_info->nms_threshold, post_info->nms_top_k, det_restuls, false);
	std::stringstream out_string;

	// Convert the algorithm result to json format
	out_string << "\"timestamp\": ";
	unsigned long timestamp = post_info->tv.tv_sec * 1000000 + post_info->tv.tv_usec;
	out_string << timestamp;
	out_string << ",\"detection_result\": [";
	for (i = 0; i < det_restuls.size(); i++) {
		auto det_ret = det_restuls[i];
		out_string << det_ret;
		if (i < det_restuls.size() - 1)
		out_string << ",";
	}
	out_string << "]" << std::endl;

	str_dets = (char *)malloc(out_string.str().length() + 1);
	str_dets[out_string.str().length()] = '\0';
	snprintf(str_dets, out_string.str().length(), "%s", out_string.str().c_str());
	return str_dets;
}
```

#### Adding Rendering Handling on the Web Page

This part is not a mandatory implementation. In the current implementation, all algorithm results are rendered on the web page. The data flow is as follows: after the algorithm post-processing returns the results in json format, the result information is sent to the web page via websocket; a canvas is implemented on the web, and the algorithm results are rendered on the canvas.

```c
// Generic algorithm callback function; currently, all results are sent to the web via websocket
int32_t bpu_wrap_general_result_handle(char *result, void *userdata)
{
	int32_t ret = 0;
	int32_t pipeline_id = 0;
	char *ws_msg = NULL;

	if (userdata)
		pipeline_id = *(int*)userdata;

	// Add flag information to the json algorithm result
	// Allocate memory
	ws_msg = malloc(strlen(result) + 32);
	if (NULL == ws_msg) {
		SC_LOGE("Failed to allocate memory for ws_msg");
		return -1;
	}
	sprintf(ws_msg, "{\"kind\":10, \"pipeline\":%d,", pipeline_id + 1);
	strcat(ws_msg, result);
	strcat(ws_msg, "}");

	ret = SDK_Cmd_Impl(SDK_CMD_WEBSOCKET_SEND_MSG, (void*)ws_msg);
	free(ws_msg);
	return ret;
}

```

The file `WebServer/www/js/WebSocketProtocolHandler.js` already supports the generic algorithm handling logic for classification and object detection. If you need to render the results of a new type of algorithm model, you need to modify the `js` code.

```js
// Handler function for websocket data received on the web page
handleMessage(event) {
	{
	... (omitted) ...
	try {
            const message = JSON.parse(event.data);
            if (message && message.kind) {
                // Parse the command type and call the corresponding callback function
                switch (message.kind) {
					... (omitted) ...
                    case this.REQUEST_TYPES.ALOG_RESULT:
                        if (this.userCallbacks.onAlogResult) {
                            this.userCallbacks.onAlogResult(message);
                        }
                        break;
					... (omitted) ...
                    default:
                        console.warn(`Unknown command type: kind=${message.kind}`);
                }
            }
        } catch (error) {
            console.error("Failed to parse the message:", error);
        }
    }
	... (omitted) ...
}

```

## Frequently Asked Questions

### CMD Invocation Failure

**Symptom**: CMD invocation fails during interaction between modules.

**Cause**: The received CMD is not registered or not enabled.

**Solution**: Confirm that the target module has registered the CMD and that it is in the enabled state (see the "Inter-module Communication" section).

### Inference Does Not Take Effect After Adding a New Model

**Symptom**: After adding a new model to `model_zoom`, the Web side cannot select it, or inference reports an error.

**Cause**: The model file is not placed in the correct directory, the `bpu_models` configuration is not added, or the inference/post-processing functions are not implemented.

**Solution**: Check the four steps according to "Adding a New Model": place the model file in `Platform/s100/model_zoom` (*.hbm), add the configuration to `bpu_models` in `bpu_wrap.c`, implement the inference thread handler function, and implement the corresponding post-processing code.

### Module Startup Order Error

**Symptom**: Some functions are unavailable or the system crashes after startup.

**Cause**: Submodules are not started in the order of their dependency relationships (for example, the algorithm module is started before VIN/VENC).

**Solution**: Check the startup order according to the "Submodule Startup Order" section, and start the later modules only after the prerequisite modules are ready.

## Related Documents

- [Sample Code Introduction](/Advanced_development/multimedia_development/multimedia_sample/overview)
- [Multimedia API Reference](/Advanced_development/multimedia_development/multimedia_api/hbn_api)