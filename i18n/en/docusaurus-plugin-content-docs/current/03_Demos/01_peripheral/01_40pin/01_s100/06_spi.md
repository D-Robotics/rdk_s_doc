---
sidebar_position: 6
title: "SPI Application (RDK S100)"
sidebar_products: RDK S100
sidebar_label: "SPI Application"
description: "Usage and loopback test of SPI0 on the RDK S100 40-pin header"
---

# SPI Application

The RDK S100 exposes the `SPI0` bus on physical pins `19, 21, 23, 24, 26` of the 40PIN, supporting two chip selects with 3.3V IO levels.

See `/app/40pin_samples/test_spi.py` for detailed information on how to use SPI.

:::tip
The pins mentioned below are for illustration only; port values differ across platforms, and the actual situation prevails. You can also directly use the code under the `/app/40pin_samples/` directory, which has been verified on the board.
:::

## Code Location

The SPI loopback test code is located at `/app/40pin_samples/test_spi.py` on the board.

## Loopback Test

Connect MISO and MOSI together on the hardware, then run the SPI test program to perform write and read operations. The expected result is that the data read back is exactly the same as the data written.

### Hardware Connection

Connect MISO and MOSI directly together on the hardware with a jumper cap:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/03_Basic_Application/03_40pin_user_guide/image/40pin_user_guide/image-rdk_s100_spi.png" alt="SPI loopback test: MISO and MOSI shorted with a jumper cap" style={{ width: '80%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

### Test Procedure

- Run `python3 /app/40pin_samples/test_spi.py`
- Select a bus number and chip select number from the printed spi controllers as input options. For example, to test `spidev0.0`, both `bus num` and `cs num` are `0`; press Enter to confirm:

```text
List of enabled spi controllers:
/dev/spidev0.0
/dev/spidev0.1
Please input SPI bus num (default 0):0
Please input SPI cs num (default 0):0
```

- After shorting MISO and MOSI, if the program runs correctly it will continuously print `0x55 0xAA`:

```text
Starting demo now! Press CTRL+C to exit
0x55 0xAA
0x55 0xAA
```

- If MISO/MOSI are not shorted (loopback failed), what is read back is the default level of MISO (measured as `0xFF 0xFF` on this board), which does not match the written value:

```text
Starting demo now! Press CTRL+C to exit
0xFF 0xFF
0xFF 0xFF
```

## Test Code

```python
#!/usr/bin/env python3

import sys
import signal
import os
import time

# Import the spidev module
import spidev

def signal_handler(signal, frame):
    sys.exit(0)

def BytesToHex(Bytes):
    return ''.join(["0x%02X " % x for x in Bytes]).strip()

def spidevTest():
    # Set the spi bus number (0, 1, 2) and chip select (0, 1)
    spi_bus = input("Please input SPI bus num (default 0):").strip() or "0"
    spi_device = input("Please input SPI cs num (default 0):").strip() or "0"
    if not spi_bus.isdigit() or not spi_device.isdigit():
        print("Invalid SPI bus/cs: %s/%s" % (spi_bus, spi_device))
        return

    # Create a spidev class object to access the spidev-based Python functions.
    spi = spidev.SpiDev()
    # Open the spi bus handle
    try:
        spi.open(int(spi_bus), int(spi_device))
    except Exception as e:
        print("open spi failed: %s" % e)
        return

    # Set the spi frequency to 12MHz
    spi.max_speed_hz = 12000000

    print("Starting demo now! Press CTRL+C to exit")

    # Send [0x55, 0xAA]; the received data should also be [0x55, 0xAA]
    try:
        while True:
            resp = spi.xfer2([0x55, 0xAA])
            print(BytesToHex(resp))
            time.sleep(1)

    except KeyboardInterrupt:
        spi.close()

if __name__ == '__main__':
    signal.signal(signal.SIGINT, signal_handler)
    print("List of enabled spi controllers:")
    os.system('ls /dev/spidev*')

    spidevTest()

```

## FAQ

### `open spi failed` is reported

**Cause**: The SPI controller is not enabled, or the bus number/chip select number is entered incorrectly.

**Solution**: Confirm that SPI0 is enabled; the two chip selects of SPI0 correspond to `bus num = 0`, `cs num = 0` or `1`.

### The read-back data does not match the written value

**Cause**: MISO and MOSI are not shorted, so MISO is at its default level.

**Solution**: Short MISO and MOSI as described in [Hardware Connection](#hardware-connection) and try again. When successful, `0x55 0xAA` should be printed.

## Related Documentation

- [Pin Definitions](./01_40pin_define.md)
- [SPI Debugging Guide](../../../../07_Advanced_development/04_driver_development/07_driver_spi_dev.md)
- [C/C++ Demo Programming Guide](../../../04_demo_support/02_c_cpp_build.md)
