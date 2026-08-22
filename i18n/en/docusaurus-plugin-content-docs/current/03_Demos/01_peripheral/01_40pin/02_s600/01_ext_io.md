---
sidebar_position: 1
title: "Pin Definitions and Applications (RDK S600)"
sidebar_products: RDK S600
sidebar_label: "Pin Definitions and Applications"
description: "RDK S600 expansion pin definitions and GPIO read/write examples"
---

# Pin Definitions and Applications

```mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
```

The development board has an expansion pin header, making peripheral expansion easy. See this chapter for the interface definitions.

## Expansion Pin Header Definition{#pin_define}

The RDK S600 has two 10-pin latching connectors, one 12-pin latching connector, and one 14-pin latching connector, making peripheral expansion easy. The digital IOs are designed with 1.8V levels. The interface definitions are as follows:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/image-rdk_s600_mainboard_pin.png" alt="Expansion pin header definition photo" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

## GPIO Read/Write Operation Examples
:::tip
The pins mentioned below are for illustration only; port values differ across platforms, and the actual situation prevails. You can also directly use the code under the `/app/40pin_samples/` directory, which has been verified on the board.
:::


Under the development board's `/app/40pin_samples/` directory, functional test code for multiple PIN pins is provided, including GPIO input/output tests, I2C, SPI, UART, etc. All test programs are written in Python; see the other modules in this chapter for details.

Take `/app/40pin_samples/button_led.py` as an example: this program configures pin `4` as input and pin `3` as output, and controls the output state of pin `3` according to the input state of pin `4`.

## Environment Preparation

Use dupont wires to connect pin `4` to 1.8V or GND to control its high/low level.

## Code Location

All example code in this chapter is located in the on-board `/app/40pin_samples/` directory, containing 8 Python scripts:

```text
/app/40pin_samples/
├── button_event.py      # Edge event detection example
├── button_interrupt.py  # Example of handling edge events with interrupts
├── button_led.py        # Example of controlling LED output with button input
├── simple_input.py      # GPIO input example
├── simple_out.py        # GPIO output example
├── test_i2c.py          # I2C bus scan and read/write example
├── test_serial.py       # UART loopback test example
└── test_spi.py          # SPI loopback test example
```

## How to Run

Run the `button_led.py` program to start the GPIO read/write program

```bash
root@ubuntu:~# cd /app/40pin_samples/
root@ubuntu:/app/40pin_samples# sudo python3 ./button_led.py
```

## Expected Result


By controlling the high/low level of pin `4`, you can change the output level of pin `3`.

```bash
root@ubuntu:/app/40pin_samples# sudo python3 ./button_led.py
Starting demo now! Press CTRL+C to exit
Outputting 1 to Pin 3
Outputting 0 to Pin 3
Outputting 1 to Pin 3
```

## FAQ

### Running the example script shows insufficient permissions

**Cause**: Accessing peripherals such as GPIO requires root privileges.

**Solution**: Run with `sudo python3 ./button_led.py`, or run `sudo -s` first to switch to the root user.

### Pin level does not change

**Cause**: The input pin is not connected to a level correctly, or the output pin has no measurement point attached.

**Solution**: Confirm the dupont wire connection is correct; pin `4` is an input and must be connected to 1.8V or GND; pin `3` is an output, and can be observed with a multimeter or by connecting an LED.

## Related Documentation

- [Expansion Pin Application (S600)](/Demos/peripheral/40pin)
- [GPIO Application](./02_gpio.md)
- [GPIO Usage](/Advanced_development/driver_development/driver_gpio_dev)
- [Hardware Introduction](/01_hardware_introduction)
