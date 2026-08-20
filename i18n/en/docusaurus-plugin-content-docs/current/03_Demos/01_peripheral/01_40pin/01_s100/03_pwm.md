---
sidebar_position: 3
title: "PWM Application (RDK S100)"
sidebar_products: RDK S100
sidebar_label: "PWM Application"
description: "Usage and test routines of LPWM on the RDK S100 40-pin header"
---

# PWM Application

The Hobot.GPIO library only supports PWM on pins with an additional hardware PWM controller. Unlike the RPi.GPIO library, the Hobot.GPIO library does not implement software-emulated PWM. The RDK S100 40pin hardware supports two LPWM channels.

See the example code below for how to use PWM.

:::tip
The pins mentioned below are for illustration only; port values differ across platforms, and the actual situation prevails. You can also directly use the code under the `/app/40pin_samples/` directory, which has been verified on the board.
:::

## Code Location

- On-board pre-installed script: `/app/40pin_samples/simple_pwm.py` (identical logic to the test code below; can be run directly)
- The test code below is the same example inlined, making it easier to modify the duty cycle/frequency parameters as needed

## Test Code

Open the PWM channel specified by `output_pin` with an initial duty cycle of 25%. First, increase the duty cycle by 5% every 0.25 seconds; after reaching 100%, decrease it by 5% every 0.25 seconds. When the output waveform is normal, you can measure the output signal with an oscilloscope or logic analyzer to observe the waveform.

```python
#!/usr/bin/env python3
import sys
import signal
import Hobot.GPIO as GPIO
import time

def signal_handler(signal, frame):
    sys.exit(0)

# Pins supporting PWM: 32 and 33. When using PWM, make sure the pin is not occupied by other functions
output_pin = 33

GPIO.setwarnings(False)

def main():
    # Pin Setup:
    # Board pin-numbering scheme
    GPIO.setmode(GPIO.BOARD)
    # Supported frequency range: 48KHz ~ 192MHz
    p = GPIO.PWM(output_pin, 48000)
    # Initial duty cycle 25%. First increase the duty cycle by 5% every 0.25 seconds; after reaching 100%, decrease it by 5% every 0.25 seconds
    val = 25
    incr = 5
    p.ChangeDutyCycle(val)
    p.start(val)

    print("PWM running. Press CTRL+C to exit.")
    try:
        while True:
            time.sleep(0.25)
            if val >= 100:
                incr = -incr
            if val <= 0:
                incr = -incr
            val += incr
            p.ChangeDutyCycle(val)
    finally:
        p.stop()
        GPIO.cleanup()

if __name__ == '__main__':
    signal.signal(signal.SIGINT, signal_handler)
    main()

```

## FAQ

### No waveform output

**Reason**: The PWM pin is occupied by another function, or no measurement device is connected.

**Solution**: Confirm that pins `32`/`33` are not occupied by other functions; measure the output waveform with an oscilloscope or logic analyzer. The example output is a square wave starting at 25% duty cycle, increasing/decreasing by 5% every 0.25 seconds.

### PWM channel initialization failure is reported

**Reason**: The selected pin does not support hardware PWM.

**Solution**: On the RDK S100 40-pin header, only pins `32` and `33` support LPWM; switch to these two pins.

## Related Documents

- [Pin Definitions](./01_40pin_define.md)
- [PWM Driver Debugging Guide](/Advanced_development/driver_development/driver_pwm)
- [C/C++ Demo Programming Guide](/Demos/demo_support/c_cpp_build)
