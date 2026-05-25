---
sidebar_position: 2
---

# 3.3.2.2 GPIO Application

:::warning
This feature has not been verified on RDK S600
:::

The development board comes with the GPIO Python library `Hobot.GPIO`. Users can import the GPIO library using the following command.

```shell
root@ubuntu:~# sudo python3
Python 3.10.12 (main, Feb  4 2025, 14:57:36) [GCC 11.4.0] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>> import Hobot.GPIO as GPIO
>>> GPIO.VERSION
'0.0.2'
>>> GPIO.model
'RDK_S600'
```

:::tip
The pins mentioned below are for illustration purposes only. Port values may vary across different platforms, so actual conditions should prevail. Alternatively, you can directly use the code in the `/app/40pin_samples/` directory, which has been verified on the board.
:::

## Setting the Pin Numbering Mode

There are 4 numbering modes for the development board's pins:

- BOARD: Physical pin numbers, corresponding one-to-one with the silkscreen numbers on the development board.
- BCM: GPIO naming rules based on the Broadcom SoC.
- CVM: Uses strings instead of numbers, corresponding to the signal names of the CVM/CVB connectors.
- SOC: The corresponding number is the GPIO pin number inside the chip.

This document recommends using the `BOARD` numbering mode. The numbering mode can be set as follows:
Note: The numbering mode can only be set once. To reset it, you need to call `GPIO.cleanup()` before setting it again.
```python
GPIO.setmode(GPIO.BOARD)
# or
GPIO.setmode(GPIO.BCM)
# or
GPIO.setmode(GPIO.CVM)
# or
GPIO.setmode(GPIO.SOC)
```

To query the numbering mode:

```python
GPIO.getmode()
```

The program will output one of the following results: `BOARD, BCM, CVM, SOC or None`.

## Warning Messages

Running code under the following circumstances will generate warning logs, but normal functionality will not be affected:

- When the user attempts to use a GPIO that is already in use by another application;
- When attempting to call `GPIO.cleanup` to clear pins before setting the mode and channels;

To suppress warning messages, use the following command:

```python
GPIO.setwarnings(False)
```

## Pin Configuration

:::info

On the `RDK S600` platform, 2x 10-pin latching interfaces, 1x 12-pin latching interface, and 1x 14-pin latching interface are supported for GPIO expansion. The following limitations apply during use:

Please refer to [Pin Configuration and Definition](./01_ext_io.md#pin_define) for pin definitions.

:::

GPIO pins need to be configured accordingly before use, as follows:

To set a pin as input:
```python
GPIO.setup(channel, GPIO.IN)
```

To set a pin as output:

```python
GPIO.setup(channel, GPIO.OUT)
```

You can also specify an initial value for an output channel, for example:

```python
GPIO.setup(channel, GPIO.OUT, initial=GPIO.HIGH)
```

Additionally, the tool supports setting multiple output channels at once, for example:

```python
# set gpio(18,12,13) to output
channels = [18, 12, 13]
GPIO.setup(channels, GPIO.OUT)
```

## Input Operation

To read the value of a channel, use:

```python
GPIO.input(channel)
```

The command returns 0 or 1. 0 represents GPIO.LOW, 1 represents GPIO.HIGH.

## Output Operation

To set the output value of a channel, use:

```python
GPIO.output(channel, state)
```

Where `state` can be GPIO.LOW or GPIO.HIGH.

## Cleaning Up Pin Usage

Before exiting the program, it is recommended to clean up the channels. Use:

```python
GPIO.cleanup()
```

If you only want to clean up specific channels, use:

```python
# Clean up a single channel
GPIO.cleanup(channel)
# Clean up a group of channels
GPIO.cleanup( (channel1, channel2) )
GPIO.cleanup( [channel1, channel2] )
```

## Checking Pin Status

This function allows you to check the function of the corresponding GPIO channel:

```python
GPIO.gpio_function(channel)
```

This function returns IN or OUT.

## Edge Detection and Interrupts

An edge is a change in the electrical signal from `low to high` (rising edge) or from `high to low` (falling edge). This change can be considered an event occurrence, which can trigger a CPU interrupt signal.

The GPIO library provides three methods to detect input events:

### wait_for_edge() function

This function blocks the calling thread until the corresponding edge change is detected. The function call is as follows:

```python
GPIO.wait_for_edge(channel, GPIO.RISING)
```

The second parameter specifies the edge to detect, which can be `GPIO.RISING, GPIO.FALLING, or GPIO.BOTH`. To specify a waiting time, you can optionally set a timeout:

```python
# Timeout is in milliseconds
GPIO.wait_for_edge(channel, GPIO.RISING, timeout=500)
```

If the external signal changes within the timeout period, the function returns the detected channel number; if a timeout occurs, the function returns None.

### event_detected() function

This function can be used to periodically check whether an event has occurred since the last call. The function can be set up and called as follows:

```python
# Set up rising edge detection on the GPIO channel
GPIO.add_event_detect(channel, GPIO.RISING)
if GPIO.event_detected(channel):
    print("Rising edge event detected")
```

You can detect events for GPIO.RISING, GPIO.FALLING, or GPIO.BOTH.

### Running a callback function when an edge event is detected

This function allows you to register a callback function that runs in a separate processing thread. Usage instructions are as follows:

```python
# define callback function
def callback_fn(channel):
    print("Callback called from channel %s" % channel)

# enable rising detection
GPIO.add_event_detect(channel, GPIO.RISING, callback=callback_fn)
```

If needed, you can also add multiple callbacks as follows:

```python
def callback_one(channel):
    print("First Callback")

def callback_two(channel):
    print("Second Callback")

GPIO.add_event_detect(channel, GPIO.RISING)
GPIO.add_event_callback(channel, callback_one)
GPIO.add_event_callback(channel, callback_two)
```

Since all callback functions run on the same thread, different callbacks are executed sequentially, not simultaneously.

To prevent multiple calls to the callback function by merging multiple events into one, you can optionally set a debounce time:

```python
# bouncetime unit is ms
GPIO.add_event_detect(channel, GPIO.RISING, callback=callback_fn, bouncetime=200)
```

### Disabling Interrupts

If edge detection is no longer needed, it can be removed as follows:

```python
GPIO.remove_event_detect(channel)
```

## Test Examples
TODO
The main test examples are provided in the `/app/40pin_samples/` directory:

| Test Example Name   | Description                                                          |
| ------------------- | -------------------------------------------------------------------- |
| simple_out.py       | Single pin `output` test                                             |
| simple_input.py     | Single pin `input` test                                              |
| button_led.py       | One pin as button input, one pin as output to control an LED         |
| button_event.py     | Capture rising and falling edge events on a pin                      |
| button_interrupt.py | Handle rising and falling edge events on a pin using interrupts      |

- Set GPIO to `output mode`, toggle the output level every 1 second, which can be used to control an LED to turn on and off cyclically. Test code `simple_out.py`:

```python
#!/usr/bin/env python3
import sys
import signal
import Hobot.GPIO as GPIO
import time


def signal_handler(signal, frame):
    sys.exit(0)


# Define the GPIO channel to use as output_pin
def determine_pins():
    board_id = GPIO.gpio_pin_data.parse_boardid()
    if GPIO.gpio_pin_data.if_s600_30pin(board_id):
        return 3
    else:
        return 4


def main():
    output_pin = determine_pins()

    # Set the pin numbering mode to hardware numbering BOARD
    GPIO.setmode(GPIO.BOARD)
    # Set to output mode and initialize to high level
    GPIO.setup(output_pin, GPIO.OUT, initial=GPIO.HIGH)

    # Record the current pin state
    curr_value = GPIO.HIGH
    print("Starting demo now! Press CTRL+C to exit")
    try:
        # Loop to control LED on/off at 1-second intervals
        while True:
            time.sleep(1)
            GPIO.output(output_pin, curr_value)
            curr_value ^= GPIO.HIGH
    finally:
        GPIO.cleanup()


if __name__ == '__main__':
    signal.signal(signal.SIGINT, signal_handler)
    main()

```

- Set GPIO to `input mode` and read the pin level value through busy polling. Test code `simple_input.py`:

```python
#!/usr/bin/env python3
import sys
import signal
import Hobot.GPIO as GPIO
import time


def signal_handler(signal, frame):
    sys.exit(0)


# Define the GPIO channel to use as input_pin


GPIO.setwarnings(False)


def determine_pins():
    board_id = GPIO.gpio_pin_data.parse_boardid()
    if GPIO.gpio_pin_data.if_s600_30pin(board_id):
        return 3
    else:
        return 4


def main():
    prev_value = None
    input_pin = determine_pins()

    # Set the pin numbering mode to hardware numbering BOARD
    GPIO.setmode(GPIO.BOARD)
    # Set to input mode
    GPIO.setup(input_pin, GPIO.IN)

    print("Starting demo now! Press CTRL+C to exit")
    try:
        while True:
            # Read the pin level
            value = GPIO.input(input_pin)
            if value != prev_value:
                if value == GPIO.HIGH:
                    value_str = "HIGH"
                else:
                    value_str = "LOW"
                print("Value read from pin {} : {}".format(input_pin, value_str))
                prev_value = value
            time.sleep(1)
    finally:
        GPIO.cleanup()


if __name__=='__main__':
    signal.signal(signal.SIGINT, signal_handler)
    main()

```

- Set GPIO to input mode, capture rising and falling edge events on the pin. Test code `button_event.py` implements detecting a falling edge on pin 4 and then controlling the output on pin 3:

```python
#!/usr/bin/env python3
import sys
import signal
import Hobot.GPIO as GPIO
import time


def signal_handler(signal, frame):
    sys.exit(0)


# Define the GPIO channels to use:
# led_pin as output, can light up an LED
# but_pin as input, can connect to a button
BOARD_ID_PATH = "/sys/class/boardinfo/adc_boardid"


# Disable warning messages
GPIO.setwarnings(False)

def determine_pins():
    board_id = GPIO.gpio_pin_data.parse_boardid()
    if GPIO.gpio_pin_data.if_s600_30pin(board_id):
        return 3, 4
    else:
        return 6, 7


def main():

    led_pin, but_pin = determine_pins()
    # Set the pin numbering mode to hardware numbering BOARD
    GPIO.setmode(GPIO.BOARD)
    GPIO.setup(led_pin, GPIO.OUT)  # LED pin set as output
    GPIO.setup(but_pin, GPIO.IN)  # button pin set as input

    # Initial state for LEDs:
    GPIO.output(led_pin, GPIO.LOW)

    print("Starting demo now! Press CTRL+C to exit")
    try:
        while True:
            print("Waiting for button event")
            GPIO.wait_for_edge(but_pin, GPIO.FALLING)

            # event received when button pressed
            print("Button Pressed!")
            GPIO.output(led_pin, GPIO.HIGH)
            time.sleep(1)
            GPIO.output(led_pin, GPIO.LOW)
    finally:
        GPIO.cleanup()  # cleanup all GPIOs


if __name__ == '__main__':
    signal.signal(signal.SIGINT, signal_handler)
    main()


```

- Set GPIO to input mode, enable GPIO interrupt function to respond to rising and falling edge events on the pin. Test code `button_interrupt.py` implements:
  - Controlling pin 1 to go high and low with a period of 4 seconds and a 50% duty cycle, i.e., high for 2 seconds then low for 2 seconds, running continuously during program execution;
  - Detecting a falling edge on pin 3 to trigger an interrupt. The interrupt handler will rapidly toggle pin 2 high and low 5 times. As long as the user pulls pin 3 low, pin 2 will toggle with a 1-second period and 50% duty cycle, i.e., high for 0.5 seconds and low for 0.5 seconds, for a total of 5 cycles.

```python
#!/usr/bin/env python3
import sys
import signal
import Hobot.GPIO as GPIO
import time


def signal_handler(signal, frame):
    sys.exit(0)


# Define the GPIO channels to use:
# 15 as output, can light up an LED
# 16 as output, can light up an LED
# but_pin as input, can connect to a button
led_pin_1 = 1  # BOARD numbering 1
led_pin_2 = 2  # BOARD numbering 2

# Disable warning messages
GPIO.setwarnings(False)


def determine_pins():
    board_id = GPIO.gpio_pin_data.parse_boardid()
    if GPIO.gpio_pin_data.if_s600_30pin(board_id):
        return 3
    else:
        return 4


# LED 2 blinks rapidly 5 times when button is pressed
def blink(channel):
    print("Blink LED 2")
    for i in range(5):
        GPIO.output(led_pin_2, GPIO.HIGH)
        time.sleep(0.5)
        GPIO.output(led_pin_2, GPIO.LOW)
        time.sleep(0.5)


def main():
    but_pin = determine_pins()
    # Pin Setup:
    GPIO.setmode(GPIO.BOARD)  # BOARD pin-numbering scheme
    GPIO.setup([led_pin_1, led_pin_2], GPIO.OUT)  # LED pins set as output
    GPIO.setup(but_pin, GPIO.IN)  # button pin set as input

    # Initial state for LEDs:
    GPIO.output(led_pin_1, GPIO.LOW)
    GPIO.output(led_pin_2, GPIO.LOW)

    # Register the blink function as the interrupt handler for button falling edge events
    GPIO.add_event_detect(but_pin, GPIO.FALLING, callback=blink, bouncetime=10)
    # Start test, Led1 blinks slowly
    print("Starting demo now! Press CTRL+C to exit")
    try:
        while True:
            # blink LED 1 slowly
            GPIO.output(led_pin_1, GPIO.HIGH)
            time.sleep(2)
            GPIO.output(led_pin_1, GPIO.LOW)
            time.sleep(2)
    finally:
        GPIO.cleanup()  # cleanup all GPIOs


if __name__ == '__main__':
    signal.signal(signal.SIGINT, signal_handler)
    main()

```
## Introduction to the hb_gpioinfo Tool

hb_gpioinfo is a GPIO helper tool adapted for RDK S600. It can display the mapping between Pin Names and Pin Numbers on the current development board. Example command output is as follows:
```shell
sunrise@ubuntu:/root$ sudo hb_gpioinfo
|--- ---------------- --------------------|
|Idx|        Pin Name|            Pin Func|
|--- ---------------- --------------------|
|402|        EMMC_CLK|      Not Configured|
|--- ---------------- --------------------|
|403|        EMMC_CMD|      Not Configured|
|--- ---------------- --------------------|
|404|      EMMC_DATA0|      Not Configured|
|--- ---------------- --------------------|
|405|      EMMC_DATA1|      Not Configured|
|--- ---------------- --------------------|
|406|      EMMC_DATA2|      Not Configured|
|--- ---------------- --------------------|
|407|      EMMC_DATA3|      Not Configured|
|--- ---------------- --------------------|
|408|      EMMC_DATA4|      Not Configured|
|--- ---------------- --------------------|
|409|      EMMC_DATA5|      Not Configured|
|--- ---------------- --------------------|
|410|      EMMC_DATA6|                gpio|
|--- ---------------- --------------------|
|411|      EMMC_DATA7|      Not Configured|
|--- ---------------- --------------------|
|412|  EMMC_DATA_STRB|      Not Configured|
|--- ---------------- --------------------|
|413|   PERI_RSTN_OUT|      Not Configured|
|--- ---------------- --------------------|
|414|          SD_1V8|      Not Configured|
|--- ---------------- --------------------|
|415|        SD_DET_N|      Not Configured|
|--- ---------------- --------------------|
|416|        SD_WPROT|      Not Configured|
|--- ---------------- --------------------|
|417|      SD_BUS_POW|      Not Configured|
|--- ---------------- --------------------|
|418|          SD_CLK|      Not Configured|
|--- ---------------- --------------------|
|419|          SD_CMD|      Not Configured|
|--- ---------------- --------------------|
|420|        SD_DATA0|      Not Configured|
|--- ---------------- --------------------|
|421|        SD_DATA1|      Not Configured|
|--- ---------------- --------------------|
|422|        SD_DATA2|      Not Configured|
|--- ---------------- --------------------|
|423|        SD_DATA3|      Not Configured|
|--- ---------------- --------------------|
|424|        SD_DATA4|      Not Configured|
|--- ---------------- --------------------|
|425|        SD_DATA5|      Not Configured|
|--- ---------------- --------------------|
|426|        SD_DATA6|      Not Configured|
|--- ---------------- --------------------|
|427|        SD_DATA7|      Not Configured|
|--- ---------------- --------------------|
|428|    SD_DATA_STRB|      Not Configured|
|--- ---------------- --------------------|
|429|     LPWM0_DOUT0|     cam_lpwm0_dout0|
|--- ---------------- --------------------|
|430|     LPWM0_DOUT1|     cam_lpwm0_dout1|
|--- ---------------- --------------------|
|431|     LPWM0_DOUT2|     cam_lpwm0_dout2|
|--- ---------------- --------------------|
|432|     LPWM0_DOUT3|     cam_lpwm0_dout3|
|--- ---------------- --------------------|
|433|     LPWM1_DOUT0|     cam_lpwm1_dout0|
|--- ---------------- --------------------|
|434|     LPWM1_DOUT1|     cam_lpwm1_dout1|
|--- ---------------- --------------------|
|435|     LPWM1_DOUT2|     cam_lpwm1_dout2|
|--- ---------------- --------------------|
|436|     LPWM1_DOUT3|     cam_lpwm1_dout3|
|--- ---------------- --------------------|
|437|     LPWM2_DOUT0|     cam_lpwm2_dout0|
|--- ---------------- --------------------|
|438|     LPWM2_DOUT1|     cam_lpwm2_dout1|
|--- ---------------- --------------------|
|439|     LPWM2_DOUT2|     cam_lpwm2_dout2|
|--- ---------------- --------------------|
|440|     LPWM2_DOUT3|     cam_lpwm2_dout3|
|--- ---------------- --------------------|
|441|     LPWM3_DOUT0|     cam_lpwm3_dout0|
|--- ---------------- --------------------|
|442|     LPWM3_DOUT1|     cam_lpwm3_dout1|
|--- ---------------- --------------------|
|443|     LPWM3_DOUT2|     cam_lpwm3_dout2|
|--- ---------------- --------------------|
|444|     LPWM3_DOUT3|     cam_lpwm3_dout3|
|--- ---------------- --------------------|
|445|       SPI0_MOSI|       hsi_spi0_mosi|
|--- ---------------- --------------------|
|446|       SPI0_MISO|       hsi_spi0_miso|
|--- ---------------- --------------------|
|447|       SPI0_SCLK|       hsi_spi0_sclk|
|--- ---------------- --------------------|
|448|        I2C8_SCL|        hsi_i2c8_scl|
|--- ---------------- --------------------|
|449|        I2C8_SDA|        hsi_i2c8_sda|
|--- ---------------- --------------------|
|450|        I2C9_SCL|        hsi_i2c9_scl|
|--- ---------------- --------------------|
|451|        I2C9_SDA|        hsi_i2c9_sda|
|--- ---------------- --------------------|
|452|       PCM0_MCLK|      Not Configured|
|--- ---------------- --------------------|
|453|       PCM0_BCLK|      Not Configured|
|--- ---------------- --------------------|
|454|      PCM0_FSYNC|      Not Configured|
|--- ---------------- --------------------|
|455|      PCM0_DATA0|      Not Configured|
|--- ---------------- --------------------|
|456|      PCM0_DATA1|      Not Configured|
|--- ---------------- --------------------|
|457|       PCM1_MCLK|      Not Configured|
|--- ---------------- --------------------|
|458|       PCM1_BCLK|      Not Configured|
|--- ---------------- --------------------|
|459|      PCM1_FSYNC|      Not Configured|
|--- ---------------- --------------------|
|460|      PCM1_DATA0|      Not Configured|
|--- ---------------- --------------------|
|461|      PCM1_DATA1|      Not Configured|
|--- ---------------- --------------------|
|462|       PCM2_MCLK|      Not Configured|
|--- ---------------- --------------------|
|463|       PCM3_MCLK|      Not Configured|
|--- ---------------- --------------------|
|464|       PCM2_BCLK|      Not Configured|
|--- ---------------- --------------------|
|465|      PCM2_FSYNC|      Not Configured|
|--- ---------------- --------------------|
|466|      PCM2_DATA0|      Not Configured|
|--- ---------------- --------------------|
|467|      PCM2_DATA1|      Not Configured|
|--- ---------------- --------------------|
|468|       PCM3_BCLK|       hsi_pcm3_bclk|
|--- ---------------- --------------------|
|469|      PCM3_FSYNC|      hsi_pcm3_fsync|
|--- ---------------- --------------------|
|470|      PCM3_DATA0|      hsi_pcm3_data0|
|--- ---------------- --------------------|
|471|      PCM3_DATA1|      hsi_pcm3_data1|
|--- ---------------- --------------------|
|472|       UART2_TXD|       hsi_uart2_txd|
|--- ---------------- --------------------|
|473|       UART2_RXD|       hsi_uart2_rxd|
|--- ---------------- --------------------|
|474|       UART3_TXD|      Not Configured|
|--- ---------------- --------------------|
|475|       UART3_RXD|      Not Configured|
|--- ---------------- --------------------|
|476|       UART4_TXD|       hsi_uart4_txd|
|--- ---------------- --------------------|
|477|       UART4_RXD|       hsi_uart4_rxd|
|--- ---------------- --------------------|
|478|       SPI0_CSN0|       hsi_spi0_csn0|
|--- ---------------- --------------------|
|479|       SPI0_CSN1|                gpio|
|--- ---------------- --------------------|
|480|       SPI3_MOSI|      Not Configured|
|--- ---------------- --------------------|
|481|       SPI3_MISO|      Not Configured|
|--- ---------------- --------------------|
|482|       SPI3_CSN0|      Not Configured|
|--- ---------------- --------------------|
|483|       SPI3_SCLK|      Not Configured|
|--- ---------------- --------------------|
|484|   EMAC_MDC_HSI4|   hsi_emac_mdc_hsi4|
|--- ---------------- --------------------|
|485|  EMAC_MDIO_HSI4|  hsi_emac_mdio_hsi4|
|--- ---------------- --------------------|
|486|   EMAC_MDC_HSI5|   hsi_emac_mdc_hsi5|
|--- ---------------- --------------------|
|487|  EMAC_MDIO_HSI5|  hsi_emac_mdio_hsi5|
|--- ---------------- --------------------|
|488|   EMAC_MDC_HSI2|   hsi_emac_mdc_hsi2|
|--- ---------------- --------------------|
|489|  EMAC_MDIO_HSI2|  hsi_emac_mdio_hsi2|
|--- ---------------- --------------------|
|490|   EMAC_MDC_HSI3|   hsi_emac_mdc_hsi3|
|--- ---------------- --------------------|
|491|  EMAC_MDIO_HSI3|  hsi_emac_mdio_hsi3|
|--- ---------------- --------------------|
|492|   EMAC_MDC_HSI0|      Not Configured|
|--- ---------------- --------------------|
|493|  EMAC_MDIO_HSI0|      Not Configured|
|--- ---------------- --------------------|
|494|   EMAC_MDC_HSI1|      Not Configured|
|--- ---------------- --------------------|
|495|  EMAC_MDIO_HSI1|      Not Configured|
|--- ---------------- --------------------|
|496|        I2C0_SCL|        hsi_i2c0_scl|
|--- ---------------- --------------------|
|497|        I2C0_SDA|        hsi_i2c0_sda|
|--- ---------------- --------------------|
|498|        I2C1_SCL|        hsi_i2c1_scl|
|--- ---------------- --------------------|
|499|        I2C1_SDA|        hsi_i2c1_sda|
|--- ---------------- --------------------|
|500|        I2C2_SCL|        hsi_i2c2_scl|
|--- ---------------- --------------------|
|501|        I2C2_SDA|        hsi_i2c2_sda|
|--- ---------------- --------------------|
|502|        I2C3_SCL|        hsi_i2c3_scl|
|--- ---------------- --------------------|
|503|        I2C3_SDA|        hsi_i2c3_sda|
|--- ---------------- --------------------|
|504|        I2C4_SCL|        hsi_i2c4_scl|
|--- ---------------- --------------------|
|505|        I2C4_SDA|        hsi_i2c4_sda|
|--- ---------------- --------------------|
|506|        I2C5_SCL|        hsi_i2c5_scl|
|--- ---------------- --------------------|
|507|        I2C5_SDA|        hsi_i2c5_sda|
|--- ---------------- --------------------|
|508|        I2C6_SCL|      Not Configured|
|--- ---------------- --------------------|
|509|        I2C6_SDA|      Not Configured|
|--- ---------------- --------------------|
|510|        I2C7_SCL|        hsi_i2c7_scl|
|--- ---------------- --------------------|
|511|        I2C7_SDA|        hsi_i2c7_sda|
|--- ---------------- --------------------|
|--- ---------------- --------------------
```