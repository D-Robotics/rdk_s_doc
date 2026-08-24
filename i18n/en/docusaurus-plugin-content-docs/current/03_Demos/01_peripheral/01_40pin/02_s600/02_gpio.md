---
sidebar_position: 2
title: "GPIO Application (RDK S600)"
sidebar_products: RDK S600
sidebar_label: "GPIO Application"
description: "Usage and test routines of the RDK S600 GPIO Python library Hobot.GPIO"
---

# GPIO Application

The development board comes pre-installed with the GPIO Python library `Hobot.GPIO`. Users can import the GPIO library with the following command:

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
The pins mentioned below are for illustration only; port values differ across platforms, and the actual situation prevails. You can also directly use the code under the `/app/40pin_samples/` directory, which has been verified on the board.
:::


## Code Location

The GPIO test routines are located in the on-board `/app/40pin_samples/` directory; the related scripts are as follows:

```text
/app/40pin_samples/
├── simple_out.py        # GPIO output example
├── simple_input.py      # GPIO input example
├── button_led.py        # Example of controlling LED output with button input
├── button_event.py      # Edge event detection example
└── button_interrupt.py  # Example of handling edge events with interrupts
```

## Setting the Pin Numbering Scheme

The development board supports 4 pin numbering modes:

- BOARD: physical pin numbers, matching the silkscreen numbers on the development board one-to-one.
- BCM: GPIO naming convention defined for Broadcom SoCs.
- CVM: uses strings instead of numbers, corresponding to the signal names of the CVM / CVB connectors.
- SOC: the corresponding numbers are the internal GPIO pin numbers of the chip.

This document recommends using the `BOARD` numbering mode. The numbering mode is set as follows:

Note: the mode can only be set once each time. To set it again, call `GPIO.cleanup()` first and then set it again.

```python
GPIO.setmode(GPIO.BOARD)
# or
GPIO.setmode(GPIO.BCM)
# or
GPIO.setmode(GPIO.CVM)
# or
GPIO.setmode(GPIO.SOC)
```

Query the current numbering mode:

```python
GPIO.getmode()
```

The program outputs one of `BOARD, BCM, CVM, SOC or None`.

## Warning Messages

In the following cases, running code outputs warning logs, which do not affect normal functionality:

 - The GPIO the user tries to use is already used by another application;
 - Trying to call `GPIO.cleanup` to clean up pins before the mode and channels are set;

To suppress warning messages, use the following command:

```python
GPIO.setwarnings(False)
```

## Pin Configuration

:::info

On the `RDK S600` platform, GPIO expansion via two 10-pin latching connectors, one 12-pin latching connector and one 14-pin latching connector is supported. There are the following limitations during use:

For pin definitions, refer to [Pin Configuration and Definitions](./01_ext_io.md#pin_define)

:::

Before using GPIO pins, the corresponding configuration is required, as follows:

Set as input:
```python
GPIO.setup(channel, GPIO.IN)
```

Set as output:

```python
GPIO.setup(channel, GPIO.OUT)
```

You can also specify an initial value for the output channel, for example:

```python
GPIO.setup(channel, GPIO.OUT, initial=GPIO.HIGH)
```

Additionally, the tool supports configuring multiple output channels at once, for example:

```python
# set gpio(18,12,13) to output
channels = [18, 12, 13]
GPIO.setup(channels, GPIO.OUT)
```

## Input Operations

To read the value of a channel, use:

```python
GPIO.input(channel)
```

The command returns 0 or 1. 0 represents GPIO.LOW, 1 represents GPIO.HIGH.

## Output Operations

To set the output value of a channel, use:

```python
GPIO.output(channel, state)
```

Where state can be GPIO.LOW or GPIO.HIGH.

## Releasing Pin Occupancy

Before the program exits, it is recommended to perform channel cleanup; use:

```python
GPIO.cleanup()
```

To clean up only specific channels, use:

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

An edge is a change of an electrical signal `from low to high` (rising edge) or `from high to low` (falling edge). This change can be regarded as the occurrence of an event, which can be used to trigger a CPU interrupt signal.

The GPIO library provides three methods for detecting input events:

### wait_for_edge() Function

This function blocks the calling thread until the corresponding edge change is detected. The function is called as follows:

```python
GPIO.wait_for_edge(channel, GPIO.RISING)
```

The second parameter specifies the edge to detect, and can be `GPIO.RISING, GPIO.FALLING or GPIO.BOTH`. To specify a waiting time, you can set a timeout:

```python
# Timeout is in milliseconds
GPIO.wait_for_edge(channel, GPIO.RISING, timeout=500)
```

If an external signal change occurs within the timeout, the function returns the detected channel number; if a timeout occurs, the function returns None.

### event_detected() Function

This function can be used to periodically check whether an event has occurred since the last call. The function can be set up and called as follows:

```python
# Set rising edge detection on the GPIO channel
GPIO.add_event_detect(channel, GPIO.RISING)
if GPIO.event_detected(channel):
    print("Rising edge event detected")
```

You can detect events of GPIO.RISING, GPIO.FALLING or GPIO.BOTH.

### Running a Callback Function When an Edge Event Is Detected

This function can be used to register a callback function; the callback function runs in a separate processing thread. Usage is as follows:

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

Since all callback functions run on the same thread, different callbacks run sequentially rather than concurrently.

To prevent the callback function from being invoked multiple times by merging multiple events into one, you can set a debounce time:

```python
# bouncetime unit is ms
GPIO.add_event_detect(channel, GPIO.RISING, callback=callback_fn, bouncetime=200)
```

### Disabling Interrupts

If edge detection is no longer needed, it can be removed as follows:

```python
GPIO.remove_event_detect(channel)
```

## Test Routines

The main test routines are provided under the `/app/40pin_samples/` directory:

| Test routine name             | Description                                          |
| ---------------------- | --------------------------------------------- |
| simple_out.py          | Single-pin `output` test                            |
| simple_input.py        | Single-pin `input` test                            |
| button_led.py          | One pin as button input, another pin as output controlling an LED |
| button_event.py        | Capture rising/falling edge events of a pin                  |
| button_interrupt.py    | Handle rising/falling edge events of a pin with interrupts          |

- Set GPIO to `output mode` and toggle the output level every 1 second, which can be used to control an LED blinking cyclically; test code `simple_out.py`:

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

    # Set the pin numbering mode to the hardware numbering BOARD
    GPIO.setmode(GPIO.BOARD)
    # Set as output mode and initialize to high level
    GPIO.setup(output_pin, GPIO.OUT, initial=GPIO.HIGH)

    # Record the current pin state
    curr_value = GPIO.HIGH
    print("Starting demo now! Press CTRL+C to exit")
    try:
        # Toggle the LED on/off cyclically at 1-second intervals
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

- Set GPIO to `input mode` and read the pin level by busy polling; test code `simple_input.py`:

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

    # Set the pin numbering mode to the hardware numbering BOARD
    GPIO.setmode(GPIO.BOARD)
    # Set as input mode
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

- Set GPIO to input mode and capture the rising/falling edge events of a pin; test code `button_event.py`, which detects the falling edge of pin 4 and then controls the output of pin 3:

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
# but_pin as input, can connect a button
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
    # Set the pin numbering mode to the hardware numbering BOARD
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

- Set GPIO to input mode, enable the gpio interrupt function and respond to the rising/falling edge events of a pin; test code `button_interrupt.py`, which implements:
  - Controls pin 1 to toggle high/low with a period of 4s and a duty cycle of 50%, i.e. 2s high followed by 2s low, running continuously while the program is running;
  - Detects the falling edge of pin 3 to trigger an interrupt; the interrupt handler controls pin 2 to toggle high/low rapidly 5 times. As long as the user pulls pin 3 low, they can see pin 2 toggling with a 1s period and a 50% duty cycle, i.e. 0.5s high and 0.5s low, running for 5 cycles in total.

```python
#!/usr/bin/env python3
import sys
import signal
import Hobot.GPIO as GPIO
import time


def signal_handler(signal, frame):
    sys.exit(0)


# Define the GPIO channels to use:
# Pin 1 as output, can light up an LED
# Pin 2 as output, can light up an LED
# but_pin as input, can connect a button
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


# LED 2 blinks rapidly 5 times when the button is pressed
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

    # Register the blink function as the interrupt handler for the button falling edge event
    GPIO.add_event_detect(but_pin, GPIO.FALLING, callback=blink, bouncetime=10)
    # Start the test; Led1 blinks slowly
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
## hb_gpioinfo Tool Introduction

hb_gpioinfo is a GPIO helper tool adapted for the RDK S600. It can show the correspondence between PinName and PinNum of the current development board. Example command output is as follows:
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

<!-- TODO(S3): pending board verification -->

## FAQ

### Running the GPIO example produces no output or the level does not change

**Cause**: The 30-pin latching connector digital IOs of the RDK S600 are 1.8V level; the pin numbers used in the examples are automatically adapted to the board type (see `determine_pins()`).

**Solution**: Confirm that the peripheral levels match 1.8V; input pins must be connected to a definite level, and output pins can be observed with a multimeter or an LED.

### The pin is reported as already occupied

**Cause**: The GPIO is already used by another process.

**Solution**: Terminate the occupying process and retry; the examples automatically call `GPIO.cleanup()` on exit to release the pins. You can also use `GPIO.setwarnings(False)` to suppress warnings.

## Related Documentation

- [Pin Definitions](./01_ext_io.md)
- [GPIO Usage](../../../../07_Advanced_development/04_driver_development/04_driver_gpio_dev.md)
- [C/C++ Demo Programming Guide](../../../04_demo_support/02_c_cpp_build.md)
