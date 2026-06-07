# Documentation Page

URL: https://developer.d-robotics.cc/rdk_s_doc/en/03_Python_Sample

[## 📄️Example Overview

This project includes multiple AI example programs written in Python for the RDK S100 platform, covering common AI tasks such as image classification, object detection, instance segmentation, pose estimation, OCR, and speech recognition. The examples run inference with quantized models in .hbm format so developers can quickly validate model performance and start application development.](/rdk_s_doc/en/Algorithm_Application/Python_Sample/Summary)
[## 📄️Image Classification - ResNet18

This example demonstrates how to deploy the ResNet18 model for image classification inference using the Python interface of hbmruntime. It is intended for RDK S100 devices equipped with a BPU chip. The sample code is located in /app/pydevdemo/01classificationsample/01_resnet18/.](/rdk_s_doc/en/Algorithm_Application/Python_Sample/ResNet18)
[## 📄️Image Classification - MobileNetV2

This example shows how to perform image classification using a BPU-deployed MobileNetV2 model with hbmruntime for inference. The sample code is located in /app/pydevdemo/01classificationsample/02_mobilenetv2/.](/rdk_s_doc/en/Algorithm_Application/Python_Sample/MobileNetV2)
[## 📄️Object Detection - Ultralytics YOLOv5x

This example shows how to perform image object detection on the BPU using a quantized Ultralytics YOLOv5x model. It supports preprocessing, post-processing, NMS, bounding box drawing, and result saving. The sample code is located in /app/pydevdemo/02detectionsample/01ultralytics_yolov5x/.](/rdk_s_doc/en/Algorithm_Application/Python_Sample/Ultralytics_YOLOv5x)
[## 📄️Object Detection - Ultralytics YOLO11

This example uses the Ultralytics YOLO11 model with the hbmruntime interface to perform image object detection. It supports image preprocessing, inference, post-processing (including decoding, confidence filtering, and NMS), and result image saving. The sample code is located in /app/pydevdemo/02detectionsample/02ultralyticsyolo11/.](/rdk_s_doc/en/Algorithm_Application/Python_Sample/Ultralytics_YOLO11)
[## 📄️Semantic Segmentation - UNetMobileNet

This example shows how to run the UNet-MobileNet semantic segmentation model on the BPU using hbmruntime. It supports image preprocessing, inference, and post-processing (parsing output and overlaying a colored segmentation mask). The sample code is located in /app/pydevdemo/03instancesegmentationsample/01unetmobilenet/.](/rdk_s_doc/en/Algorithm_Application/Python_Sample/UNetMobileNet)
[## 📄️Instance Segmentation - Ultralytics YOLO11

This sample shows how to run the YOLOv11 instance segmentation model on BPU based on hbmruntime. It supports image preprocessing, inference, and postprocessing (parsing outputs and overlaying colored segmentation masks). The sample code is located in /app/pydevdemo/03instancesegmentationsample/02ultralyticsyolo11seg/.](/rdk_s_doc/en/Algorithm_Application/Python_Sample/Ultralytics_YOLO11_Seg)
[## 📄️Pose Estimation - Ultralytics YOLO11

This sample shows how to run the Ultralytics YOLO11 pose estimation model on BPU based on hbmruntime, enabling human keypoint detection and visualization. It supports model preprocessing, inference execution, and postprocessing (including keypoint decoding, bounding box drawing, and keypoint annotation). The sample code is located in /app/pydevdemo/04posesample/01ultralyticsyolo11_pose/.](/rdk_s_doc/en/Algorithm_Application/Python_Sample/Ultralytics_YOLO11_Pose)
[## 📄️Instance Segmentation - Ultralytics YOLOE11

This sample applies only to RDK S100. The RDK S600 system image does not include the corresponding HBM model, and the related sample code is only shipped with the S100 system image; it is not supported on S600 yet.](/rdk_s_doc/en/Algorithm_Application/Python_Sample/Ultralytics_YOLOE11_Seg)
[## 📄️Lane Detection - LaneNet

This sample applies only to RDK S100. The RDK S600 system image does not include the corresponding HBM model, and the related sample code is only shipped with the S100 system image; it is not supported on S600 yet.](/rdk_s_doc/en/Algorithm_Application/Python_Sample/LaneNet)
[## 📄️Automatic Speech Recognition - ASR

This sample runs a speech recognition model using the hbmruntime inference engine to automatically transcribe .wav audio files and output the corresponding text. The sample code is located in /app/pydevdemo/07speechsample/01_asr/.](/rdk_s_doc/en/Algorithm_Application/Python_Sample/ASR)
[## 📄️Text Detection and Recognition - PaddleOCR

This sample applies only to RDK S100. The RDK S600 system image does not include the corresponding HBM model, and the related sample code is only shipped with the S100 system image; it is not supported on S600 yet.](/rdk_s_doc/en/Algorithm_Application/Python_Sample/PaddleOCR)
[## 📄️USB Camera YOLOv5x Inference

This is a real-time Ultralytics YOLOv5x inference sample based on hbmruntime. It reads frames from a USB camera for object detection and visualizes the results in fullscreen. The sample code is located in /app/pydevdemo/09usbcamera_sample/.](/rdk_s_doc/en/Algorithm_Application/Python_Sample/USB_Camera_yolov5x)
[## 📄️MIPI Camera YOLOv5x Inference

This is a real-time Ultralytics YOLOv5x inference sample based on hbmruntime. It reads frames from a MIPI camera for object detection and visualizes the results in fullscreen. The sample code is located in /app/pydevdemo/10mipicamera_sample/.](/rdk_s_doc/en/Algorithm_Application/Python_Sample/mipi_camera_yolov5x)
[## 📄️WebSocket YOLOv5x Inference

This sample demonstrates how to run Ultralytics YOLOv5x object detection on an embedded platform with HBM acceleration and a VIO camera module (such as RDK S100), and stream JPEG images and detection boxes to clients in real time over WebSocket. The sample code is located in /app/pydevdemo/11webdisplaycamera_sample/.](/rdk_s_doc/en/Algorithm_Application/Python_Sample/WebSocket_yolov5x)
[## 📄️RTSP Stream Pull and YOLOv5x Inference

This sample demonstrates how to combine SP hardware modules (decoder, VIO, display) with the BPU on platforms such as RDK S100 to implement:](/rdk_s_doc/en/Algorithm_Application/Python_Sample/rtsp_yolov5x_display)
