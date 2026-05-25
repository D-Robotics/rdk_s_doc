---
sidebar_position: 4
---

# 3.3.2.4 SPI Application

The RDK S600 features the `SPI1` bus on the 14-PIN self-locking interface, supporting one chip select with an I/O voltage of 1.8V.

Refer to `/app/40pin_samples/test_spi.py` for detailed instructions on using SPI.

:::tip
The pins mentioned below are for illustration purposes only. Port values may vary across different platforms, so actual conditions should prevail. You can also directly use the code in the `/app/40pin_samples/` directory, which has been verified on the board.
:::

## Loopback Test

Hardware-connect MISO and MOSI, then run the SPI test program to perform write and read operations. The expected result is that the read data should exactly match the written data.

### Hardware Connection

Before testing, short MISO and MOSI:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/03_Basic_Application/03_40pin_user_guide/image/40pin_user_guide/image-rdk_s600_spi.png" alt="image-rdk_s600_spi.png" style={{ width: '100%' }} />

### Test Procedure

- Run `cd /boot`, and write the following into the config.txt file (if it does not exist, run `sudo nano config.txt` to create it):
    ```shell
    dtbo_file_path=/overlays/s600_v0p2_enable_spi1.dtbo
    ```
- Run `sudo reboot` to restart the system.
- After rebooting, run `python3 /app/40pin_samples/test_spi.py`.
- Select the bus number and chip select number from the printed SPI controllers as input options. For example, to test `spidev1.0`, choose `1` for `bus num` and `0` for `cs num`, then press Enter to confirm:

```
List of enabled spi controllers:
/dev/spidev0.0  /dev/spidev0.1
Please input SPI bus num:1
Please input SPI cs num:0
```

- Once the program runs correctly, it will continuously print `0x55 0xAA`. If it prints `0x00 0x00`, the SPI loopback test has failed.

```
Starting demo now! Press CTRL+C to exit
0x55 0xAA
0x55 0xAA
```

## Test Code

```python
#!/usr/bin/env python3

import sys
import signal
import os
import time

# Import spidev module
import spidev

def signal_handler(signal, frame):
    sys.exit(0)

def BytesToHex(Bytes):
    return ''.join(["0x%02X " % x for x in Bytes]).strip()

def spidevTest():
    # Set SPI bus number (0, 1, 2) and chip select (0, 1)
    spi_bus = input("Please input SPI bus num:")
    spi_device = input("Please input SPI cs num:")
    # Create an object of the spidev class to access spidev-based Python functions
    spi=spidev.SpiDev()
    # Open the SPI bus handle
    spi.open(int(spi_bus), int(spi_device))

    # Set SPI frequency to 12MHz
    spi.max_speed_hz = 12000000

    print("Starting demo now! Press CTRL+C to exit")

    # Send [0x55, 0xAA]; received data should also be [0x55, 0xAA]
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