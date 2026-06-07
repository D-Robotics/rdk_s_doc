# Automatic Speech Recognition - ASR

URL: https://developer.d-robotics.cc/rdk_s_doc/en/Algorithm_Application/Python_Sample/ASR

This sample runs a speech recognition model using the `hbm_runtime` inference engine to automatically transcribe `.wav` audio files and output the corresponding text. The sample code is located in `/app/pydev_demo/07_speech_sample/01_asr/` .

warning
The current RDK S100 system image does **not** include the `asr.hbm` model. Before running this sample, you must download it manually (see the download URL in "Model Description" below) and place it at the default path `/opt/hobot/model/s100/basic/asr.hbm` , or specify another path with `--model-path` .

This sample runs a speech recognition model using the `hbm_runtime` inference engine to automatically transcribe `.wav` audio files and output the corresponding text. The sample code is located in `/app/pydev_demo/speech_sample/asr/` .

## Model Description

- Introduction:

ASR (Automatic Speech Recognition) models convert audio signals into text. The input is single-channel speech waveforms (after sample rate conversion and standardization), and the output is character-level token sequences. Combined with a vocabulary (vocab) file, Chinese speech transcription can be achieved. This sample uses a quantized `.hbm` model.
- HBM model name: `asr.hbm`
- Input format: audio waveform, single channel, sample rate `16kHz` , maximum length `30000` (sample points)
- Output: character token probability distribution (logits); recognized text is obtained by argmax decoding and mapping
- Model download URL (automatically downloaded by the program):

```bash
https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_s100/asr/asr.hbm
```

```bash
https://archive.d-robotics.cc/downloads/rdk_model_zoo/rdk_s600/asr/asr.hbm
```

## Features

- Model loading

Use `hbm_runtime` to load the ASR model and automatically parse model input/output shapes and quantization information.
- Input preprocessing

Read audio with SoundFile (supports `.wav` ). The audio is:

- Converted to single channel
- Resampled to the target sample rate (default `16kHz` )
- Standardized to zero mean and unit variance (z-score)
- Padded or truncated to a fixed length (for example, `30000` )
- Supports generator-based processing of long audio for streaming recognition
- Inference execution

Complete inference using the `.run()` method, outputting a logits tensor.
- Output postprocessing

Use `np.argmax()` to obtain token indices from output logits, map them to characters using the vocab dictionary file (JSON format), and output the final recognized text.

## Environment Dependencies

- Ensure the dependencies in `pydev` are installed

```bash
pip install -r ../../requirements.txt
```

```bash
pip install -r ../../requirements.txt --break-system-packages
```
- Install the `soundfile` package

```bash
pip install soundfile==0.13.1
```

```bash
pip install soundfile==0.13.1 --break-system-packages
```

## Directory Structure

```text
01_asr/
├── asr.py                      # Main inference script
```

## Parameter Description

| Parameter | Description | Default Value 
| `--model-path` | Model path ( `.hbm` format) | `/opt/hobot/model/s100/basic/asr.hbm` 
| `--audio-file` | Input audio file (supports `.wav` or `.flac` ) | `/app/res/assets/chi_sound.wav` 
| `--vocab-file` | Vocabulary file, mapping token → id | `/app/res/labels/vocab.json` 
| `--priority` | Inference priority, `0~255` ; larger is higher | `0` 
| `--bpu-cores` | BPU cores to use (for example, `--bpu-cores 0 1` ) | `[0]` 
| `--audio_maxlen` | Fixed length after audio cropping/padding (sample points) | `30000` 
| `--new_rate` | Target sample rate; audio is automatically resampled | `16000` 

| Parameter | Description | Default Value 
| `--model-path` | Model path ( `.hbm` format) | `/opt/hobot/model/s600/basic/asr.hbm` 
| `--audio-file` | Input audio file (supports `.wav` or `.flac` ) | `/app/res/assets/chi_sound.wav` 
| `--vocab-file` | Vocabulary file, mapping token → id | `/app/res/labels/vocab.json` 
| `--priority` | Inference priority, `0~255` ; larger is higher | `0` 
| `--bpu-cores` | BPU cores to use (for example, `--bpu-cores 0 1` ) | `[0]` 
| `--audio_maxlen` | Fixed length after audio cropping/padding (sample points) | `30000` 
| `--new_rate` | Target sample rate; audio is automatically resampled | `16000` 

## Quick Start

- Run the model

- Use default parameters

```bash
python asr.py
```
- Run with specified parameters

```bash
python asr.py \
--model-path /opt/hobot/model/s100/basic/asr.hbm \
--audio-file /app/res/assets/chi_sound.wav \
--vocab-file /app/res/labels/vocab.json \
--priority 0 \
--bpu-cores 0 \
--audio_maxlen 30000 \
--new_rate 16000
```

```bash
python asr.py \
--model-path /opt/hobot/model/s600/basic/asr.hbm \
--audio-file /app/res/assets/chi_sound.wav \
--vocab-file /app/res/labels/vocab.json \
--priority 0 \
--bpu-cores 0 \
--audio_maxlen 30000 \
--new_rate 16000
```
- View the result

After successful execution, the result will be printed.

```bash
我是来自阿里云的大规模语言磨型过叫通意千问||
```

## Notes

- If the specified model path does not exist, the program will attempt to download the model automatically.
