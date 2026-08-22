---
sidebar_position: 4
title: "UART Application (RDK S100)"
sidebar_products: RDK S100
sidebar_label: "UART Application"
description: "Usage and loopback test of UART2 on the RDK S100 40-pin header"
---

# UART Application

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

The RDK S100 supports UART2 on the 40PIN, not enabled by default, with physical pin numbers 8 and 10 and 3.3V IO levels.

:::info

On the 40-pin header, you need to toggle the DIP switch to select between UART2 and I2C5. See the figure below for the details:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_s100/audio3.png" alt="UART application diagram" style={{ width: '40%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0,0' }} />

After toggling the DIP switch, you also need to modify the device tree file. The path and modification method are as follows:

```{.text}
/*kernel/arch/arm64/boot/dts/hobot/drobot-s100-soc.dtsi*/
uart2: uart@394C0000 {
        power-domains = <&scmi_smc_pd PD_IDX_LSPERI_TOP>;
        compatible = "snps,dw-apb-uart";
        reg = <0x0 0x394C0000 0x0 0x10000>;
        reg-shift = <2>;
        reg-io-width = <4>;
        interrupts = <GIC_SPI PERISYS_UART2_INTR PERISYS_UART2_INTR_TRIG_TYPE>;
        clock-frequency = <200000000>;
        pinctrl-names = "default";
        pinctrl-0 = <&peri_uart2>;
        status = "okay";
};
```

For pin definitions, refer to [Pin Configuration and Definitions](./01_40pin_define.md#40pin_define)

:::

See `/app/40pin_samples/test_serial.py` for detailed information on how to use the UART.

:::tip
The pins mentioned below are for illustration only; port values differ across platforms, and the actual situation prevails. You can also directly use the code under the `/app/40pin_samples/` directory, which has been verified on the board.
:::

## Code Location

The UART loopback test code is located at `/app/40pin_samples/test_serial.py` on the board.

## Loopback Test

Connect TXD and RXD together on the hardware, then run the test program to perform write and read operations. The expected result is that the data read back is exactly the same as the data written.

### Hardware Connection

Connect TXD and RXD directly together on the hardware with a jumper cap:

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/03_Basic_Application/03_40pin_user_guide/image/40pin_user_guide/image-rdk_s100_uart.png" alt="UART loopback test: TXD and RXD shorted with a jumper cap" style={{ width: '70%', maxWidth: '980px', height: 'auto', display: 'block', margin: '0 auto' }} />

### Test Procedure


- Run `python3 /app/40pin_samples/test_serial.py`
- Select a serial device from the printed serial devices as the input option (/dev/ttyS0 is the system debug port; testing it is not recommended unless you fully understand its role). For example, on RDK S100 select `/dev/ttyS2` to test and press Enter to confirm, then enter the baud rate parameter:

```
root@ubuntu:/app/40pin_samples# ./test_serial.py
List of enabled UART:
/dev/ttyS0
/dev/ttyS1
/dev/ttyS2
/dev/ttyS3

Please input the UART device name to test (default /dev/ttyS0):/dev/ttyS2
Please input the baud rate (default 115200):921600
Serial<id=0x7f819dcac0, open=True>(port='/dev/ttyS2', baudrate=921600, bytesize=8, parity='N', stopbits=1, timeout=1, xonxoff=False, rtscts=False, dsrdtr=False)
```

- After shorting TXD and RXD, if the program runs correctly it will continuously print `Send: AA55` and `Recv:  AA55`:

```
Starting demo now! Press CTRL+C to exit
Send:  AA55
Recv:  AA55
```

- If TXD/RXD are not shorted, nothing appears after `Recv:` (no data can be read), indicating the loopback failed:

```
Starting demo now! Press CTRL+C to exit
Send:  AA55
Recv:
```

## Test Code

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

- [Pin Definitions](./01_40pin_define.md)
- [UART Driver Debugging Guide](/Advanced_development/driver_development/driver_uart_dev)
- [C/C++ Demo Programming Guide](/Demos/demo_support/c_cpp_build)
