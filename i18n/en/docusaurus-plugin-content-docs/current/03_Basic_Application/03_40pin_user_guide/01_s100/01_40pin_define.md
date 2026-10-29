---
sidebar_position: 1
---

# 3.3.1 Pin definitions and applications

## Overview

The board provides a 40-pin expansion header for peripheral expansion. This section describes the pinout and how to run the GPIO read/write example.

`/app/40pin_samples/` on the board includes functional test code for several pins, covering GPIO input and output, PWM, I2C, SPI, and UART. All examples are written in Python. See the other modules in this chapter for details.

:::tip
The examples below use the RDK S100 40-pin header. Pin numbers in this section are BOARD numbers: output is pin 23 (`SPI0_CLK_3V3`), and input is pin 24 (`SPI0_CS0_3V3`). You can also run the code under `/app/40pin_samples/` on the board. That code has been verified on the RDK S100.
:::

## Expansion pin header definition {#40pin_define}

RDK S100 has a 40-pin header for peripheral expansion. The digital I/O uses 3.3 V levels. The pinout is as follows:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/01_Quick_start/image/hardware_interface/image-rdk_100_mainboard_40pin-en.png" alt="Expansion pin header definition" style={{ width: '100%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

:::info
Pins named `40PIN_GPIO[x]_3V3` are GPIOs from an I2C I/O expander. The Pinctrl controller does not manage this group. These pins have no alternate function, do not need a Pinmux setting in the DTS, and work only as **GPIO**.
:::

:::warning
Do not connect an external pulldown when you use `I2C4_SDA_3V3`, `I2C4_SCL_3V3`, `I2C5_SDA_3V3`, `I2C5_SCL_3V3`, `UART2_TX_3V3`, or `UART2_RX_3V3` as **GPIO**.
:::

## Prepare the wiring

Use jumper wires to bring out two pins on the 40-pin header:

- `SPI0_CS0_3V3` (pin 24): input. Connect a button or a level source.
- `SPI0_CLK_3V3` (pin 23): output. Connect an LED or a multimeter.

## Sample location

Every example in this section is on the board under `/app/40pin_samples/`. The directory contains 10 Python scripts:

```text
/app/40pin_samples/
├── button_event.py      # Edge-event detection
├── button_interrupt.py  # Edge events handled by interrupt
├── button_led.py        # Button input controls an LED output
├── gpio_rw_demo.py      # GPIO read/write demo (used in this section)
├── simple_input.py      # GPIO input
├── simple_out.py        # GPIO output
├── simple_pwm.py        # PWM output
├── test_i2c.py          # I2C bus scan and read/write
├── test_serial.py       # UART loopback test
└── test_spi.py          # SPI loopback test
```

## Run the demo

This section uses `/app/40pin_samples/gpio_rw_demo.py` to show GPIO reads and writes in output mode and input mode.

```bash
root@ubuntu:~# cd /app/40pin_samples/
```

**Output mode**: Toggle `SPI0_CLK_3V3` (pin 23) and print the level. The default interval is 3 seconds:

```bash
root@ubuntu:/app/40pin_samples# python3 gpio_rw_demo.py output
```

Append the interval in seconds. This example uses 5 seconds:

```bash
root@ubuntu:/app/40pin_samples# python3 gpio_rw_demo.py output 5
```

**Input mode**: Read `SPI0_CS0_3V3` (pin 24). The script **prints only when the level changes**:

```bash
root@ubuntu:/app/40pin_samples# python3 gpio_rw_demo.py input
```

Press `Ctrl+C` to exit either mode.

## Expected result

**Output mode**: The serial console prints the current output level every 3 seconds. Measure `SPI0_CLK_3V3` against GND with a multimeter. The voltage switches between 0 V and 3.3 V together with the printout.

```bash
root@ubuntu:/app/40pin_samples# python3 gpio_rw_demo.py output
Output mode: pin 23 (SPI_SCLK), interval 3s. Press CTRL+C to exit
Output pin 23 (SPI_SCLK): LOW
Output pin 23 (SPI_SCLK): HIGH
Output pin 23 (SPI_SCLK): LOW
```

**Input mode**: The name in parentheses is the silkscreen name on the board. Connect `SPI0_CS0_3V3` to 3.3 V to read high, then connect it to GND to read low. Each change prints one line.

```bash
root@ubuntu:/app/40pin_samples# python3 gpio_rw_demo.py input
Input mode: pin 24 (SPI_CSN). Press CTRL+C to exit
Input pin 24 (SPI_CSN): HIGH
Input pin 24 (SPI_CSN): LOW
```

:::info
`pin 23` and `pin 24` in the output are BOARD numbers. The name in parentheses is the silkscreen name without the `_3V3` suffix. It matches the Pin Name shown by `hb_gpioinfo`.
:::

## Troubleshooting

### The serial console prints nothing when the input level changes

**Cause**: In input mode, `gpio_rw_demo.py` prints only when the level changes. The input stays at one level because it is floating or tied to 3.3 V or GND.

**Solution**: Switch the wire between GND and 3.3 V. Take 3.3 V from the 40-pin header. **Do not connect 5 V. That damages the 3.3 V I/O.**

### The input always reads high

**Cause**: `SPI0_CS0_3V3` passes through an onboard level shifter and has a weak pull-up. After you disconnect the external level, the pull-up holds the pin high. The pin does not fall low on its own.

**Solution**: Connect `SPI0_CS0_3V3` to GND to read low.

### The output pin shows no level change

**Cause**: The output pin has no measurement point, or the multimeter is not grounded.

**Solution**: Check the jumper wires. `SPI0_CLK_3V3` is an output. Place one multimeter lead on the pin and the other on GND to see the switch between 0 V and 3.3 V, or connect an LED and watch it turn on and off.

## Related documents

- [GPIO application](./02_gpio.md)
- [GPIO usage](../../../07_Advanced_development/02_linux_development/04_driver_development_super/04_driver_gpio_dev.md)
- [Developer kit](../../../01_Quick_start/01_hardware_introduction/01_rdk_s100/01_rdk_s100.md)
