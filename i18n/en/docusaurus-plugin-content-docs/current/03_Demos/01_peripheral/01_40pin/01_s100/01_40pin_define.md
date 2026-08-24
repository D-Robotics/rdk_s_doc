---
sidebar_position: 1
title: "Pin Definitions and Applications (RDK S100)"
sidebar_products: RDK S100
sidebar_label: "Pin Definitions and Applications"
description: "RDK S100 40-pin expansion pin definitions and GPIO read/write examples"
---

# Pin Definitions and Applications


The development board has an expansion pin header, making peripheral expansion easy. See this chapter for the interface definitions.

## Expansion Pin Header Definition{#40pin_define}

The RDK S100 has 40 pins, making peripheral expansion easy. The digital IOs are designed with 3.3V levels. The interface definitions are as follows:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/image-rdk_100_mainboard_40pin.png" alt="Expansion pin header definition diagram" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

:::info
In the interface definitions, the pins named `40PIN_GPIO[x]_3V3` are GPIOs provided by an I2C IO expander chip. They are not managed by the chip's Pinctrl controller, have no other functions to reuse, and do not require Pinmux configuration in the dts. They can only be used as **GPIOs**.
:::

## GPIO Read/Write Operation Examples

:::tip
The pins mentioned below are for illustration only; port values differ across platforms, and the actual situation prevails. You can also directly use the code under the `/app/40pin_samples/` directory, which has been verified on the board.
:::



Under the development board's `/app/40pin_samples/` directory, functional test code for multiple PIN pins is provided, including gpio input/output tests, PWM, I2C, SPI, UART, etc. All test programs are written in Python; see the other modules in this chapter for details.

Take `/app/40pin_samples/button_led.py` as an example: this program configures pin `24` as input and pin `23` as output, and controls the output state of pin `23` according to the input state of pin `24`.

## Code Location

All example code in this chapter is located in the on-board `/app/40pin_samples/` directory, containing 9 Python scripts:

```text
/app/40pin_samples/
├── button_event.py      # Edge event detection example
├── button_interrupt.py  # Example of handling edge events with interrupts
├── button_led.py        # Example of controlling LED output with button input
├── simple_input.py      # GPIO input example
├── simple_out.py        # GPIO output example
├── simple_pwm.py        # PWM output example
├── test_i2c.py          # I2C bus scan and read/write example
├── test_serial.py       # UART loopback test example
└── test_spi.py          # SPI loopback test example
```

## Environment Preparation

Use dupont wires to connect pin `24` to 3.3V or GND to control its high/low level.

## How to Run

Run the `button_led.py` program to start the GPIO read/write program

```bash
root@ubuntu:~# cd /app/40pin_samples/
root@ubuntu:/app/40pin_samples# sudo python3 ./button_led.py
```

## Expected Result

By controlling the high/low level of pin `24`, you can change the output level of pin `23`.

```bash
root@ubuntu:/app/40pin_samples# sudo python3 ./button_led.py
Starting demo now! Press CTRL+C to exit
Outputting 1 to Pin 23
Outputting 0 to Pin 23
Outputting 1 to Pin 23
```

## FAQ

### Running the example script shows insufficient permissions

**Cause**: Accessing peripherals such as GPIO requires root privileges.

**Solution**: Run with `sudo python3 ./button_led.py`, or run `sudo -s` first to switch to the root user.

### Pin level does not change

**Cause**: The input pin is not connected to a level correctly, or the output pin has no measurement point attached.

**Solution**: Confirm the dupont wire connection is correct; pin `24` is an input and must be connected to 3.3V or GND; pin `23` is an output, and can be observed with a multimeter or by connecting an LED.

## Related Documentation

- [Expansion Pin Application (S100)](./01_40pin_define.md)
- [GPIO Usage](../../../../07_Advanced_development/04_driver_development/04_driver_gpio_dev.md)
- [Hardware Introduction](../../../../01_Quick_start/01_hardware_introduction/01_rdk_s100.md)
