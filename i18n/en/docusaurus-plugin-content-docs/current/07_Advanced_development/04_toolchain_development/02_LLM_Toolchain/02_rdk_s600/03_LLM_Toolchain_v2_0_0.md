---
sidebar_position: 3
sidebar_products: RDK S600
---

# LLM Toolchain_v2.0.0

D-Robotics_LLM_2.0.0 applies to the D-Robotics S600 5.1.0, S100P/S100 4.0.5 and above version computing platforms.


## Main Features

**Custom Model Deployment**  
- Covers the full calibration, quantization, and compilation pipeline, producing model artifacts for on-device deployment.
- Unofficially adapted models can be extended through the adaptation workflow for quantization deployment, without waiting for official adaptation.


**Agent-Assisted Development**  
- Includes a rich set of Agent Skills for quantization, deployment, and troubleshooting, which mainstream AI coding assistants can directly invoke to efficiently accomplish model deployment.


**VLA Support**  
- Covers the full pipeline of VLA model quantization, debugging, deployment, and C++ integration.


**Quantization Acceleration**  
- Supports w4/w8 quantization specifications, as well as advanced acceleration schemes such as speculative sampling.
- Accuracy can be evaluated and verified at each quantization stage and on-device, ensuring accuracy alignment.


**On-Device Inference Engine**  
- Supports on-device inference for text, multimodal, and action generation models; LLM/VLM supports Eagle3/DFlash inference acceleration.
- Supports inference features such as multi-session parallel inference, context prefix cache matching, and generation interruption, providing tiered C++ APIs for custom development and integration.
- Built-in OpenAI-compatible HTTP service, supporting streaming output, tool calls, and multimodal input, capable of directly providing inference services externally.


## Adapted Models

- **LLM**: MiniCPM5-2B, Phi-4-mini, Qwen2.5-3B, Qwen3-0.6B/1.7B/4B/8B
- **VLM**: Qwen2.5-VL-3B/7B, Qwen3-VL-2B/4B/8B, Qwen3.5-2B/4B/9B, InternVL2-2B/2.5-1B/3.5-1B
- **OMNI**: Gemma4-E2B/E4B
- **ASR**: Qwen3-ASR-0.6/1.7B, whisper-small/medium
- **VLA**: Pi0/0.5, Smolvla, Spirit1.5


## Download Address

- [**Download LLM Development Toolkit**](https://d-robotics-aitoolchain.oss-cn-beijing.aliyuncs.com/llm/2.0.0/D-Robotics_LLM_2.0.0_S600_S100_SDK.tar.gz)

- [**User Manual Online Reading URL**](https://developer.d-robotics.cc/oe_llm_s600_doc/en/guide/sdk_introduction.html)

- **D-Robotics_LLM Supported Models**  

    After downloading the development toolkit:

    - See oellm_runtime_s600/model/resolve_model_s600.md for the S600 on-device model download links.
    - See oellm_runtime_s100/model/resolve_model_s100.md for the S100P/S100 on-device model download links.


## Model Performance Benchmark

[**Model Performance Benchmark**](https://developer.d-robotics.cc/oe_llm_s600_doc/en/guide/benchmark/note.html)