---
sidebar_position: 3
title: "UART Application (RDK S600)"
sidebar_products: RDK S600
sidebar_label: "UART Application"
description: "Usage and loopback test of the UART on the RDK S600 latching 10-PIN interface"
---

# UART Application


The RDK S600 supports UART6 and UART7 on the latching 10-PIN interface, with 3.3V IO levels.

See `/app/40pin_samples/test_serial.py` for detailed information on how to use the UART.

:::tip
The pins mentioned below are for illustration only; port values differ across platforms, and the actual situation prevails. You can also directly use the code under the `/app/40pin_samples/` directory, which has been verified on the board.
:::

## Code Location

The UART loopback test code is located at `/app/40pin_samples/test_serial.py` on the board.

## Loopback Test

Connect TXD and RXD together on the hardware, then run the test program to perform write and read operations. The expected result is that the data read back is exactly the same as the data written.

### Hardware Connection

Before testing, short TXD and RXD:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/03_Basic_Application/03_40pin_user_guide/image/40pin_user_guide/image-rdk_s600_uart.png" alt="Hardware connection diagram" style={{ width: '70%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

### Test Procedure

- Run `python3 /app/40pin_samples/test_serial.py`
- Select a serial device from the printed serial devices as the input option (/dev/ttyS0 is the system debug port; testing it is not recommended unless you fully understand its role). For example, on RDK S600 select `/dev/ttyS6` or `/dev/ttyS7` to test and press Enter to confirm, then enter the baud rate parameter:

```text
root@ubuntu:/app/40pin_samples# ./test_serial.py
List of enabled UART:
/dev/ttyS0
/dev/ttyS1
/dev/ttyS2
/dev/ttyS3
/dev/ttyS4
/dev/ttyS5
/dev/ttyS6
/dev/ttyS7

Please input the UART device name to test (default /dev/ttyS0):/dev/ttyS6
Please input the baud rate (default 115200):921600
Serial<id=0xffff211c3850, open=True>(port='/dev/ttyS6', baudrate=921600, bytesize=8, parity='N', stopbits=1, timeout=1, xonxoff=False, rtscts=False, dsrdtr=False)
```

- After shorting TXD and RXD, if the program runs correctly it will continuously print `Send: AA55` and `Recv:  AA55`:

```text
Starting demo now! Press CTRL+C to exit
Send:  AA55
Recv:  AA55
```

- If TXD/RXD are not shorted, nothing appears after `Recv:` (no data can be read), indicating the loopback failed:

```text
Starting demo now! Press CTRL+C to exit
Send:  AA55
Recv:
```

## Test Code

:::caution Note
In the device tree, the correspondence between ttyS and the uart hardware controllers is: `/dev/ttyS0` ~ `/dev/ttyS7` correspond to `uart0` ~ `uart7` respectively. The 10-pin latching interface of the RDK S600 exposes `uart6`/`uart7`, corresponding to `/dev/ttyS6` and `/dev/ttyS7`.
For the specific pins, refer to the [Pin Definitions and Applications](./01_ext_io.md) chapter.
:::

```python
#!/usr/bin/env python3

import sys
import signal
import os
import time

# Import the python serial library
import serial
import serial.tools.list_ports

def signal_handler(signal, frame):
    sys.exit(0)

def serialTest():
    print("List of enabled UART:")
    os.system('ls /dev/tty[a-zA-Z]*')
    uart_dev = input("Please input the UART device name to test (default /dev/ttyS0):").strip() or "/dev/ttyS0"
    if not os.path.exists(uart_dev):
        print("UART device not found: %s" % uart_dev)
        return -1

    baudrate = input("Please input the baud rate (default 115200):").strip() or "115200"
    if not baudrate.isdigit():
        print("Invalid baudrate: %s" % baudrate)
        return -1
    try:
        ser = serial.Serial(uart_dev, int(baudrate), timeout=1) # 1s timeout
    except Exception as e:
        print("open serial failed: %s" % e)
        return -1

    print(ser)

    print("Starting demo now! Press CTRL+C to exit")

    while True:
        test_data = "AA55"
        write_num = ser.write(test_data.encode('UTF-8'))
        print("Send: ", test_data)

        received_data = ser.read(write_num).decode('UTF-8')
        print("Recv: ", received_data)

        time.sleep(1)

    ser.close()
    return 0


if __name__ == '__main__':
    signal.signal(signal.SIGINT, signal_handler)
    if serialTest() != 0:
        print("Serial test failed!")
    else:
        print("Serial test success!")

```

## FAQ

### `open serial failed` is reported

**Cause**: Opening the serial device failed; it may be occupied by another process, or the device does not exist.

**Solution**: Confirm that the selected `/dev/ttySx` exists and is not occupied; testing the system debug port `/dev/ttyS0` is not recommended.

### Nothing appears after `Recv:`

**Cause**: TXD and RXD are not shorted, or the wiring is wrong, so no loopback data can be read.

**Solution**: Short TXD and RXD as described in [Hardware Connection](#hardware-connection) and try again.

## Related Documentation

- [Pin Definitions](./01_ext_io.md)
- [UART Driver Debugging Guide](../../../../07_Advanced_development/04_driver_development/02_driver_uart_dev.md)
- [C/C++ Demo Programming Guide](../../../04_demo_support/02_c_cpp_build.md)
