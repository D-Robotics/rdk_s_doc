---
title: Automatic Speech Recognition - ASR (Python)
sidebar_position: 2
description: "Pre-installed example of deploying the ASR model for speech-to-text with the hbm_runtime Python interface"
---

# Automatic Speech Recognition - ASR (Python)

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

This example demonstrates how to deploy the ASR speech recognition model on the BPU with the `hbm_runtime` Python interface, transcribe a `.wav` audio clip into text, and print it.

The example code is located in the `/app/pydev_demo/speech_sample/asr/` directory on the board.

:::warning
Neither the S100 nor the S600 system image bundles the `asr.hbm` model. Before running, download it manually and place it at `/opt/hobot/model/<product>/basic/asr.hbm` (or specify it via `--model-path`).
:::

## Prerequisites

- The development board is flashed with RDK OS and logged in via SSH (see [Remote Login](../../../01_Quick_start/03_install_os_and_setup/05_remote_login.md)).
- The pre-installed models are in place (not bundled in the image, download from the RDK model zoo, see [Model files](../../04_demo_support/01_model_files.md)):
  - S100: `/opt/hobot/model/s100/basic/asr.hbm`
  - S600: `/opt/hobot/model/s600/basic/asr.hbm`
- Install `soundfile` (for audio reading):

<DocScope products="RDK S100">

```bash
pip install soundfile
```

</DocScope>
<DocScope products="RDK S600">

```bash
pip install soundfile --break-system-packages
```

</DocScope>

## Code Location

Path on the board: `/app/pydev_demo/speech_sample/asr/`

:::tip
The code in this directory is pre-installed with the image and verified on the board; it can be run directly.
:::

Directory structure:

```text
.
├── asr.py       # Main inference script
└── README.md    # Usage instructions
```

## Parameters

| Parameter | Description | Default |
|---|---|---|
| `--model-path` | Model file path (.hbm) | S600: `/opt/hobot/model/s600/basic/asr.hbm` (S100 uses `s100/basic/`) |
| `--audio-file` | Input audio file path (.wav/.flac) | `/app/res/assets/chi_sound.wav` |
| `--vocab-file` | Vocabulary file (JSON, token-to-id mapping) | `/app/res/labels/vocab.json` |
| `--priority` | Inference priority (0~255) | `0` |
| `--bpu-cores` | List of BPU core IDs to use (e.g. `--bpu-cores 0 1`) | `[0]` |
| `--audio-maxlen` | Fixed length after audio truncation/padding (number of samples) | `30000` |
| `--new-rate` | Target sample rate (automatic resampling) | `16000` |

## Usage

```bash
cd /app/pydev_demo/speech_sample/asr
python asr.py
```

After a successful run, the recognized text is printed to the terminal.

## Execution Results

The following is actual output on RDK S600 (test audio `chi_sound.wav`, whose content is "我是来自阿里云的大规模语言模型叫做通义千问"):

```text
Model Description:
 - asr: {"MARCH": "nash-p", "INPUT_SHAPE": "1x30000",
   "INPUT_TYPE_RT": "featuremap", "NORM_TYPE": "no_preprocess", ...}

=== Scheduling Parameters ===
asr:
  priority    : 0
  bpu_cores   : [-1]
  deviceId    : 0

我是来自阿里云的大规模语言磨型过叫通意千问||
```

**Success indicators**: the recognized text is printed at the end (as above). Note that the ASR model has recognition deviations on some words (e.g. "模型→磨型", "叫做→过叫"); this is a model accuracy limitation, not a runtime error.

## Software Notes

Data flow: read wav (`soundfile`) → resample to 16kHz → truncate/pad to 30000 samples → extract audio featuremap → BPU inference → greedy-decode tokens → map to text using `vocab.json`. The model input is `1x30000`, with no preprocessing (`no_preprocess`).

## FAQ

- **`ModuleNotFoundError: No module named 'soundfile'`**: Install `soundfile` as described in "Prerequisites".
- **Garbled or missing characters in the result**: The ASR model accuracy is limited; using clearer audio can improve the result. Make sure the audio sample rate matches `--new-rate 16000`.
- **`asr.hbm` not found**: Neither the S100 nor S600 image bundles it; manual download is required (see the warning above).

## Related Documentation

- [ASR Example (C/C++)](./01_asr.md)
- [Model Acquisition and Placement](../../04_demo_support/01_model_files.md)
- [Python Demo Build Guide](../../04_demo_support/03_python_build.md)
- [Python Inference API](../../../04_Simple_API/02_inference_api/02_python_api.md)
