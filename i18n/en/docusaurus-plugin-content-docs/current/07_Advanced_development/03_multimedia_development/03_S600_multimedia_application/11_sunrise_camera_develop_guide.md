# Sunrise camera development instructions

## Sunrise camera system design

### System block diagram

Sunrise camera implements various application solutions such as smart cameras and smart analysis boxes.

The Sunrise camera source code includes WebPages for the user operation layer, communication module layer, and functional module layer; this document mainly introduces the design of these three modules.

The Hal layer module includes multimedia-related module call interface libraries, BPU module inference libraries, etc.

The Kernel version includes standard driver libraries along with the system BSP.

The software block diagram is shown below:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/images_to_upload/software_framework.png" alt="software_framwork" style={{ width: '100%' }} />

### Microkernel design

The microkernel architecture, also known as the "plug-in architecture", means that the software kernel is relatively small, with major functions and business logic implemented through plugins.

The core typically contains only the minimal functions required for system operation. Plugins are independent of each other, and communication between plugins should be minimized to avoid mutual dependencies.

### Architecture advantages and disadvantages

**Advantages**

Good functional extensibility - develop plugins for any required functionality.

Functions are isolated; plugins can be loaded and unloaded independently, making deployment easy.

High customizability to adapt to different development needs.

Supports incremental development, gradually adding features.

**Disadvantages**

Poor scalability - the kernel is typically a single unit, not easily distributed.

Relatively high development difficulty due to plugin-kernel communication and plugin registration.

## Sunrise camera architecture view

### Module division

| **Module** | **Directory** | **Description** |
| ------------ | ----------- | ------------------------------------------------------------ |
| Event bus module | communicate | Implements module event registration, event reception, and event distribution |
| Common library module | common | Common operation functions, log/lock, thread operations, queue operations, etc. |
| Camera module | Platform | Chip platform-related code, implementing encapsulation of hardware differences |
| External interaction module | Transport | Device and external interaction parts, rtspserver, websocket, etc. |
| Main program entry | Main | Main function entry |

**Top-level code structure**
```bash
.
├── common						# Common library module code
├── communicate					# Event bus module
├── config						# Compilation configuration directory
├── main						# Main entry program
├── Makefile					# Compilation script
├── makefile.param				# Compilation configuration
├── Platform					# Camera module, platform and application scenario code, chip IP-related code implemented in this directory
├── start_app.sh				# Startup script
├── sunrise_camera.service 		# Auto-start configuration file
├── third_party					# Dependent third-party libraries
├── Transport					# Rtspserver and websocket module code implementation
├── VERSION						# Version information
└── WebServer					# Web page programs and resource files
```

**Compilation**

1. Log into the device and navigate to the directory: `/app/multimedia_samples/sunrise_camera`
2. Execute command: `make`
3. Generated target file: `sunrise_camera`
```sh
root@ubuntu:/app/multimedia_samples/sunrise_camera# ls sunrise_camera/bin/
log  sunrise_camera  www
```

### Event bus module (communicate)

#### Overview

Event bus module, the smallest operational unit; calls registration interface functions of different modules based on compilation options, and completes reception and distribution of CMDs from different modules.

When modules interact, if the received CMD is already registered and enabled, it is relayed to the responsible submodule for processing, and the processing result is returned to the requesting module upon completion.

When modules interact, if the received CMD is not registered or not enabled, the CMD call fails.

#### Functional description

1. Static plug-in control for module plugins
2. CMD command relay between modules

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/images_to_upload/event_bus.png" alt="event_bus" style={{ width: '100%' }} />

Example:

The camera submodule defines the SDK_CMD_CAMERA_GET_CHIP_TYPE command. After registering this CMD by calling the camera_cmd_register function, when the websocket submodule receives a web page request to get the chip type, the websocket module can call the interface in the camera submodule through the following code.

The entire process is shown in the following figure:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/images_to_upload/event_bus_flow.png" alt="event_bus_flow" style={{ width: '100%' }} />

#### Module code structure

```bash
.
├── include
│   ├── sdk_common_cmd.h			# Defines CMDs for all submodules in the system
│   ├── sdk_common_struct.h		    # Defines data structures used for each CMD
│   └── sdk_communicate.h			# Defines interface functions for this module
├── Makefile
└── src
    └── sdk_communicate.c			# Interface code implementation
```

#### Interface description

**sdk_globle_prerare**

The xxx_cmd_register() functions of each submodule are centralized in this function. When the main program starts, this interface is called to register all CMDs that need to be registered and enabled by each submodule into the subsystem.

Each submodule must implement xxx_cmd_register(), which registers the submodule's CMDs. This is the basic prerequisite for the entire system to function properly.

Example:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/images_to_upload/cmd_register.png" alt="cmd_register" style={{ width: '100%' }} />

**sdk_cmd_register**

  CMD registration interface.

**sdk_cmd_unregister**

  CMD unregistration interface.

**sdk_cmd_impl**

Submodules call this interface to implement interface functions of other submodules.

### Common library module (common)

#### Overview

Program common library class, including but not limited to log operations, lock operations, thread encapsulation, base64;

This module encapsulates common classes and functions used in programming; avoids duplicate implementations of the same operations across multiple locations.

Updates to this module affect all modules and require careful operation.

#### Functional description

None

#### Module code structure

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

### Platform module

#### Overview

The module mainly includes: video encoding, ISP control, image control, snapshot capture, video output, algorithm computation, etc.

The internal structure of this module is as follows:

api_vpp serves as the entry point for this module, defining the set of supported CMD commands;

solution_handle handles application configuration reading/writing and scenario interface assignment;

vpp_camera_impl and vpp_box_impl implement application scenario functions;

vp_wrap implements interface encapsulation for multimedia modules;

bpu_wrap implements algorithm inference interface and post-processing method encapsulation.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/images_to_upload/platform_module.png" alt="platform_module" style={{ width: '100%' }} />

#### Functional description

To add a new application scenario implementation, simply implement the interface defined by the vpp_ops_t structure.

```c
typedef struct vpp_ops {
	int (*init_param)(void); // Initialize configuration parameters for VIN, VSE, VENC, BPU and other modules
	int (*init)(void); // SDK initialization, based on configuration
	int (*uninit)(void); // Uninitialization
	int (*start)(void); // Start various media-related modules
	int (*stop)(void); // Stop
	// CMDs supported by this module are implemented via the following two interfaces
	int (*param_set)(SOLUTION_PARAM_E type, char* val, unsigned int length);
	int (*param_get)(SOLUTION_PARAM_E type, char* val, unsigned int* length);
} vpp_ops_t;
```

The flow for starting an application solution (using vpp_camera as an example) is as follows:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/images_to_upload/vpp_camera_flow.png" alt="vpp_camera_flow" style={{ width: '100%' }} />

The initialization and startup flow for other submodules can refer to this flowchart.

#### Module code structure

Code path: Platform/S100

```bash
.
├── api                                   # CMD registration
├── bpu_wrap                              # BPU algorithm interface usage encapsulation
├── main                                  # Actual functional interface implementation for CMD registration
├── Makefile                              # Compilation script
├── makefile.param                        # Compilation configuration
├── model_zoom                            # Algorithm model repository
├── test_data                             # Stores test video stream files and program configuration files
├── vpp_impl                              # Functional implementation for application solutions
├── vp_sensors -> ../../../vp_sensors/    # Camera Sensor configuration code, shared with other sample modules
└── vp_wrap                               # Multimedia interface encapsulation
```

### External interaction module (Transport)

#### Overview

Concrete submodules that interact with terminals or platforms following transport protocols; includes communication modules via network, rtspserver, and websocket;

The interaction module has the most inter-module communication and must strictly adhere to design conventions. When requesting data from other modules, it must be processed through defined module CMDs.

#### Media Server module

This module is an encapsulation of ZLMediakit, wrapping ZLMediakit into several simple interfaces such as init, create_media, push_video. Currently supports streaming of H264 and H265 code streams.

For startup and usage of this module, refer to the flow introduction in the Main Program Entry section.

#### Websocket Server module

This module handles interactions with the web. After corresponding operations on the web, the websocket server receives commands and parameters of the corresponding kind, which are processed in the handle_user_msg function of handle_user_massage.c. To add new interaction commands, please add them in this function.

Currently supported interaction commands: scene switching, scene parameter get/set, get chip type, H264 bitrate setting, system time synchronization, websocket stream pulling and stopping, etc.

### Main program entry (main)

#### Overview

Main program entry, module startup.

The current basic submodule startup sequence is as follows. Note that the startup sequence of each module needs to follow the dependency relationships between submodules.

#### Execution flow

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/images_to_upload/main_flow.png" alt="main_flow" style={{ width: '100%' }} />

### WebServer

#### Overview

This module implements HTTP protocol web services through ZLMediakit, allowing users to preview video and configure application scenarios directly via a browser.

#### Functional description

The `WebServer/www` directory provides: resource files, web pages, css, js programs.

## Algorithm inference using BPU

### Overview

This module completes algorithm model loading, data preprocessing, inference, algorithm post-processing, and returns results in JSON format.

The module runtime sequence is as follows:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/images_to_upload/bpu_flow.png" alt="bpu_flow" style={{ width: '100%' }} />

### Process for adding a new model

Currently, sunrise_camera only supports a limited number of algorithm models. In practical applications, it is inevitable to run other models to test effectiveness. This section describes the basic steps for adding a new algorithm model.

| **Item** | **Source file** | **Description** |
| --------------------- | ------------------------------------------------- | ------------------------------------------------------------ |
| Prepare algorithm model | Place in Platform/s100/model_zoom directory (*.hbm) | Add fixed-point algorithm models that can run on the development board in this directory (system's built-in model files are stored at: `/opt/hobot/model/s100/basic/`) |
| Add model configuration | bpu_wrap.c | Add the new model's name, specify the algorithm model file, inference and post-processing function interfaces in bpu_models |
| Inference thread handler | bpu_wrap.c | Prepare output tensors in the handler, call **hbDNNInfer** for inference, and push results to the output queue. Example: **inference_yolov5s** |
| Post-processing thread function | bpu_wrap.c | Retrieve algorithm results from the output queue, call the post-processing method to process, obtaining a JSON-formatted result string. If a callback function is set, invoke the callback. Example: **post_process_yolov5s** |
| Post-processing code | yolov5_post_process.cpp | Each algorithm model requires a corresponding post-processing method. For classification models, map returned IDs to type names; for detection models, map detection boxes to positions in the original image. |
| Add rendering handling on web page | WebServer/www/js/DisplayWindowManager.js | Optional |

#### Prepare algorithm model

Algorithm models that can run on the development board have two suffixes: .bin files and .hbm files:

1. .bin model: Models obtained through algorithm toolchain conversion (PTQ), with .bin suffix
2. .hbm model: Algorithm models directly trained using the fixed-point model training framework (QAT)

For detailed development instructions on algorithm models, please refer to the "Quantization Toolchain Development Guide" document.

#### Add initialization process

Define a new algorithm model in the bpu_models array in bpu_wrap.c, adding the new model's name, algorithm model file path, inference and post-processing function interfaces:

```c
bpu_model_descriptor bpu_models[] = {
	{
		.model_name = "yolov5s",                                   // Algorithm name, displayed to users on web client for selection
		.model_path = "../model_zoom/yolov5s_672x672_nv12.bin",    // Algorithm model file
		.inference_func = inference_yolov5s,                       // Inference function
		.post_proc_func = post_process_yolov5s                     // Post-processing function, can be merged into inference function if simple
	},
	... (omitted) ...
};
```

When the algorithm task starts, the corresponding inference thread and algorithm post-processing thread are started based on `model_name`.

#### Inference thread handler

In the inference thread, prepare the output result tensors; retrieve yuv data from the yuv queue, call HB_BPU_runModel for inference to obtain algorithm results; then push the algorithm results into the output Queue for post-processing use.

```c
static void *inference_yolov5s(void *ptr)
{
	// Prepare model output node tensors, 5 sets of output buffer rotation, simple handling, theoretically post-processing speed should be faster than algorithm inference
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
		// Get image data for algorithm computation, format is mostly NV12 yuv
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

		// Enqueue post-processing data
		Yolo5PostProcessInfo_t *post_info;
		post_info = (Yolo5PostProcessInfo_t *)malloc(sizeof(Yolo5PostProcessInfo_t));
		… …
		mQueueEnqueue(&bpu_handle->m_output_queue, post_info);
		cur_ouput_buf_idx++;
		cur_ouput_buf_idx %= 5;
}
}
```

#### Post-processing thread function

In the post-processing thread, retrieve algorithm results from the output queue; call the post-processing function; call the algorithm task callback function to process algorithm results (the current effective callbacks are all sent to the web for rendering algorithm results).

```c

static void *post_process_yolov5s(void *ptr)
{
	tsThread *privThread = (tsThread*)ptr;
	Yolov5PostProcessInfo_t *post_info;

	mThreadSetName(privThread, __func__);

	bpu_handle_t *bpu_handle = (bpu_handle_t *)privThread->pvThreadData;
	while (privThread->eState == E_THREAD_RUNNING) {
		// Get data from post-processing data queue
		if (mQueueDequeueTimed(&bpu_handle->m_output_queue, 100, (void**)&post_info) != E_QUEUE_OK)
			continue;

		char *results = Yolov5PostProcess(post_info); // Perform post-processing, e.g., get detection boxes, filter low-confidence results, scale detection box dimensions to match displayed video dimensions

		if (results) {
			if (NULL != bpu_handle->callback) {
				// Algorithm task result callback, current application scenario sends algorithm results to browser via websocket
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

#### Post-processing code

It is recommended to add a post-processing method for each algorithm model:

- yolov5: yolo5_post_process.cpp
- mobilenet_v2: classification model processing is simpler, just mapping IDs to type names

The post-processing method should accomplish the following:

Analyze output results; classification models need to match type names; detection models need to map algorithm result boxes to original image coordinates, etc.;

Process algorithm results into JSON format. For convenience, format as JSON within the function, e.g., for transmission to web, the output result can be used directly.

```c
// Yolov5 output tensor format
// Three downsampling operations produce three reduced grids, then three predictions per grid, final output result
char* Yolov5PostProcess(Yolov5PostProcessInfo_t *post_info) {
	hbDNNTensor *tensor = post_info->output_tensor;

	std::vector<Detection> dets;
	std::vector<Detection> det_restuls;
	uint32_t i = 0;
	char *str_dets;

	// Filter detection boxes by confidence
	for (i = 0; i < default_yolov5_config.strides.size(); i++) {
		_postProcess(&tensor[i], post_info, i, dets);
	}
	// Calculate IoU to merge detection boxes, pass IoU threshold (0.65) and return box count (5000)
	yolov5_nms(dets, post_info->nms_threshold, post_info->nms_top_k, det_restuls, false);
	std::stringstream out_string;

	// Convert algorithm results to JSON format
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

#### Add rendering handling on web page

This part is optional. In the current implementation, all algorithm results are rendered on the web page. The data flow is: after the algorithm post-processing returns results in JSON format, the results are sent via websocket to the web page, where a canvas is implemented to render the algorithm results.

```c
// Generic algorithm callback function, currently all send data to web via websocket
int32_t bpu_wrap_general_result_handle(char *result, void *userdata)
{
	int32_t ret = 0;
	int32_t pipeline_id = 0;
	char *ws_msg = NULL;

	if (userdata)
		pipeline_id = *(int*)userdata;

	// Add marker information to JSON algorithm result
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

The `WebServer/www/js/WebSocketProtocolHandler.js` file already supports generic classification and object detection algorithm processing logic. If you need to render results from new types of algorithm models, you need to modify the `js` code.

```js
// Web page websocket data reception handler
handleMessage(event) {
	{
	... (omitted) ...
	try {
            const message = JSON.parse(event.data);
            if (message && message.kind) {
                // Parse command type and call corresponding callback function
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
            console.error("Message parsing failed:", error);
        }
    }
	... (omitted) ...
}

```