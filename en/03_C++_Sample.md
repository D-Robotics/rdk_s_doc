# Documentation Page

URL: https://developer.d-robotics.cc/rdk_s_doc/en/03_C++_Sample

[## 📄️Example Overview

This project includes multiple AI example programs written in C/C++ for the RDK S100 platform, covering common AI tasks such as image classification, object detection, instance segmentation, pose estimation, OCR, and speech recognition. The examples run inference with quantized models in .hbm format so developers can quickly validate model performance and start application development.](/rdk_s_doc/en/Algorithm_Application/C++_Sample/Summary)
[## 📄️Image Classification - ResNet18

This example demonstrates how to deploy the ResNet18 model for image classification inference using C/C++. It is intended for RDK S100 devices equipped with a BPU chip. The sample code is located in /app/cdevdemo/bpu/01classificationsample/01resnet18/.](/rdk_s_doc/en/Algorithm_Application/C++_Sample/ResNet18)
[## 📄️Image Classification - MobileNetV2

This example shows how to run image classification with a BPU-deployed MobileNetV2 model using C/C++ for inference. The sample code is located in /app/cdevdemo/bpu/01classificationsample/02mobilenetv2/.](/rdk_s_doc/en/Algorithm_Application/C++_Sample/MobileNetV2)
[## 📄️Object Detection - Ultralytics YOLOv5x

This example shows how to run image object detection on the BPU using a quantized Ultralytics YOLOv5x model. It supports preprocessing, post-processing, NMS, bounding box drawing, and result saving. The sample code is located in /app/cdevdemo/bpu/02detectionsample/01ultralytics_yolov5x/.](/rdk_s_doc/en/Algorithm_Application/C++_Sample/Ultralytics_YOLOv5x)
[## 📄️Object Detection - Ultralytics YOLO11

This example performs image object detection with the Ultralytics YOLO11 model using C/C++. It supports image preprocessing, inference, post-processing (including decoding, confidence filtering, and NMS), and result image saving. The sample code is located in /app/cdevdemo/bpu/02detectionsample/02ultralytics_yolo11/.](/rdk_s_doc/en/Algorithm_Application/C++_Sample/Ultralytics_YOLO11)
[## 📄️Semantic Segmentation - UNetMobileNet

This example shows how to run the UNet-MobileNet semantic segmentation model on the BPU. It supports image preprocessing, inference, and post-processing (parse outputs and overlay colored segmentation masks). The sample code is located in /app/cdevdemo/bpu/03instancesegmentationsample/01_unetmobilenet/.](/rdk_s_doc/en/Algorithm_Application/C++_Sample/UNetMobileNet)
[## 📄️Instance Segmentation - Ultralytics YOLO11

This example shows how to run the YOLOv11 semantic segmentation model on the BPU. It supports image preprocessing, inference, and post-processing (parse outputs and overlay colored segmentation masks). The sample code is located in /app/cdevdemo/bpu/03instancesegmentationsample/02ultralyticsyolo11_seg/.](/rdk_s_doc/en/Algorithm_Application/C++_Sample/Ultralytics_YOLO11_Seg)
[## 📄️Pose Estimation - Ultralytics YOLO11

This example shows how to run the Ultralytics YOLO11 pose estimation model on the BPU for human keypoint detection and visualization. It supports model preprocessing, inference, and post-processing (including keypoint decoding, bounding box drawing, and keypoint annotation). The sample code is located in /app/cdevdemo/bpu/04posesample/01ultralyticsyolo11pose/.](/rdk_s_doc/en/Algorithm_Application/C++_Sample/Ultralytics_YOLO11_Pose)
[## 📄️Instance Segmentation - Ultralytics YOLOE11

This sample applies only to RDK S100. The RDK S600 system image does not include the corresponding HBM model, and the related sample code is only shipped with the S100 system image; it is not supported on S600 yet.](/rdk_s_doc/en/Algorithm_Application/C++_Sample/Ultralytics_YOLOE11_Seg)
[## 📄️Lane Detection - LaneNet

This sample applies only to RDK S100. The RDK S600 system image does not include the corresponding HBM model, and the related sample code is only shipped with the S100 system image; it is not supported on S600 yet.](/rdk_s_doc/en/Algorithm_Application/C++_Sample/LaneNet)
[## 📄️Automatic Speech Recognition - ASR

This sample runs a speech recognition model using the BPU inference engine to automatically transcribe .wav audio files and output the corresponding text. The sample code is located in /app/cdevdemo/bpu/07speechsample/01asr/.](/rdk_s_doc/en/Algorithm_Application/C++_Sample/ASR)
[## 📄️Text Detection and Recognition - PaddleOCR

This example is only applicable to RDK S100. The RDK S600 image does not include the corresponding hbm models, and the relevant sample code is only released with the system image on the S100; it is not supported on the S600.](/rdk_s_doc/en/Algorithm_Application/C++_Sample/PaddleOCR)
[## 📄️USB Camera YOLOv5x Inference

This is a real-time Ultralytics YOLOv5x inference sample based on the BPU. It reads frames from a USB camera for object detection and visualizes the results in fullscreen. The sample code is located in /app/cdevdemo/bpu/09usbcamerasample/.](/rdk_s_doc/en/Algorithm_Application/C++_Sample/usb_camera)
[## 📄️MIPI Camera YOLOv5x Inference

This is a real-time Ultralytics YOLOv5x inference sample based on the BPU. It reads frames from a MIPI camera for object detection and visualizes the results in fullscreen. The sample code is located in /app/cdevdemo/bpu/10mipicamerasample/.](/rdk_s_doc/en/Algorithm_Application/C++_Sample/mipi_camera_yolov5x)
[## 📄️Video Decode and YOLOv5x Inference

This sample demonstrates how to combine SP decode/display/VIO modules with the BPU on platforms such as RDK S100 to implement an end-to-end pipeline:](/rdk_s_doc/en/Algorithm_Application/C++_Sample/decode_yolov5x_display)
[## 📄️RTSP Stream Pull and YOLOv5x Inference

This sample demonstrates how to combine SP hardware modules (decoder, VIO, display) with the BPU on platforms such as RDK S100 to implement:](/rdk_s_doc/en/Algorithm_Application/C++_Sample/rtsp_yolov5x_display)
