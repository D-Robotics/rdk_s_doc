---
sidebar_position: 4
---

# GPIO Usage

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

<DocScope products="RDK S100">
The S100 Acore chip has a total of 3 sys with gpio devices, namely peri, cam, and video. Each device supports up to 32 gpio pins, and each gpio pin supports interrupts.

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_s100/gpio_devs.png" alt="gpio_devs" style={{ width: '100%' }} />

</DocScope>

<DocScope products="RDK S600">
## S600 GPIO Overview

The S600 chip has a total of 3 sys with gpio devices, namely hsi, cam, and peri, totaling 110 gpio pins, and each gpio pin supports interrupts.

| GPIO Controller | Number of Pins | Base Address | Device Node |
|-----------|---------|--------|----------|
| hsi_gpio0 | 32 | 0x33810000 | hsi_port0 |
| hsi_gpio1 | 32 | 0x33814000 | hsi_port1 |
| hsi_gpio2 | 3 | 0x33818000 | hsi_port2 |
| cam_gpio0 | 16 | 0x37130000 | cam_port0 |
| peri_gpio0 | 27 | 0x390b0000 | peri_port0 |

</DocScope>

## Driver Code

```bash
kernel/drivers/gpio/gpio-dwapb.c # gpio driver source file
```

### Kernel Configuration

GPIO_DWAPB

<img src="https://rdk-doc.oss-cn-beijing.aliyuncs.com/doc/img/07_Advanced_development/02_linux_development/driver_development_x5/GPIO_MENUCONFIG.png" alt="image-GPIO_MENUCONFIG" style={{ width: '100%' }} />

### Kernel DTS Configuration

<DocScope products="RDK S100">

The device tree definition of the S100 GPIO controller is located in the `arch/arm64/boot/dts/hobot/drobot-s100-soc.dtsi` file under the kernel folder of the SDK package.

:::info Note
The nodes in s100.dtsi mainly declare SoC common features and are unrelated to specific circuit boards. Generally, no modification is required.
:::

</DocScope>
<DocScope products="RDK S600">

The device tree definition of the S600 GPIO controller is located in the `drobot-s600-pinctrl.dtsi` file under the hobot-drivers/kernel-dts folder of the SDK package.

:::info Note
The nodes in drobot-s600-pinctrl.dtsi mainly declare SoC common features and are unrelated to specific circuit boards. Generally, no modification is required.
:::
</DocScope>

## GPIO Usage

### Kernel Space

#### DTS Configuration

<DocScope products="RDK S100">

The GPIO configuration for all pins of the S100 is located in the file `arch/arm64/boot/dts/hobot/drobot-s100-soc.dtsi` under the kernel folder of the SDK package.

When users need to configure a specific pin as a GPIO function, they can directly reference the predefined GPIO configuration:

The property naming convention for GPIO device tree nodes is generally `<names>-gpios` or `<names>-gpio`, as shown in the following example:

```c
/**
* peri_port0 represents the first gpio device of the peri sys
* The following device node has a total of four gpio pins, namely:
*       pin 16 of the first gpio device of peri sys (starting from 0)
*       pin 17 of the second gpio device of peri sys (starting from 0)
*       pin 28 of the first gpio device of cam sys (starting from 0)
*       pin 18 of the first gpio device of video sys (starting from 0)
* GPIO_ACTIVE_HIGH indicates active high, generally set to GPIO_ACTIVE_HIGH
*/
gpio-test {
        test-gpios = <&peri_port0 16 GPIO_ACTIVE_HIGH
                      &peri_port1 17 GPIO_ACTIVE_HIGH
                      &cam_port0 28 GPIO_ACTIVE_HIGH
                      &video_port0 18 GPIO_ACTIVE_HIGH>;
};
```

</DocScope>
<DocScope products="RDK S600">

The GPIO configuration for all pins of the S600 is located in the file `drobot-s600-pinctrl.dtsi` under the hobot-drivers/kernel-dts folder of the SDK package.

When users need to configure a specific pin as a GPIO function, they can directly reference the predefined GPIO configuration:

The property naming convention for GPIO device tree nodes is generally `<names>-gpios` or `<names>-gpio`, as shown in the following example:

```c
/**
* hsi_port0 represents the first gpio device of the hsi sys
* The following device node has a total of three gpio pins, namely:
*       pin 0 of the first gpio device of hsi sys (starting from 0)
*       pin 1 of the first gpio device of hsi sys (starting from 0)
*       pin 8 of the first gpio device of cam sys (starting from 0)
* GPIO_ACTIVE_HIGH indicates active high, generally set to GPIO_ACTIVE_HIGH
*/
gpio-test {
        test-gpios = <&hsi_port0 0 GPIO_ACTIVE_HIGH
                      &hsi_port0 1 GPIO_ACTIVE_HIGH
                      &cam_port0 8 GPIO_ACTIVE_HIGH>;
};
```

</DocScope>

#### Driver Code Interface

```c
/* include/linux/gpio.h */
/* Request GPIO */
int gpio_request(unsigned gpio, const char *label);
/* Initialize GPIO as output. Set output level */
int gpio_direction_output(unsigned gpio, int value);
/* Initialize GPIO as input */
int gpio_direction_input(unsigned gpio);
/* Get GPIO level */
int gpio_get_value(unsigned int gpio);
/* Set GPIO level */
void gpio_set_value(unsigned int gpio, int value);
/* Free GPIO */
void gpio_free(unsigned gpio);
/* Request GPIO interrupt, the return value can be passed to request_irq and free_irq */
int gpio_to_irq(unsigned int gpio);
```

### User Space{#user-space}

#### Control Interface

In user space, you can use the /sys/class/gpio node to perform related gpio operations.

The following nodes exist under the sys node:

```shell
# Request gpio
echo <gpio_num> > /sys/class/gpio/export
# Free gpio
echo <gpio_num> > /sys/class/gpio/unexport
# Set gpio as output
# When setting dir to out, you can echo 1/0 to value to represent high/low level input respectively.
echo out > /sys/class/gpio/gpio<gpio_num>/direction
# Set high level
echo 1 > /sys/class/gpio/gpio<gpio_num>/value
# Set low level
echo 0 > /sys/class/gpio/gpio<gpio_num>/value

# Set gpio as input, when setting dir to in, cat value represents the input value (0-low, 1-high).
echo in > /sys/class/gpio/gpio<gpio_num>/direction
# Read the external value of gpio
cat /sys/class/gpio/gpio<gpio_num>/value


# View gpio debug interface
cat /sys/kernel/debug/gpio

# View the relationship between gpio and pinctrl
# You can see the relationship between system pins and gpio numbers
cat /sys/kernel/debug/pinctrl/<pinctrl_dev>/gpio-ranges
```

### sysfs Interface Introduction

#### export&unexport

/sys/class/gpio/export and /sys/class/gpio/unexport, these two nodes can only be written to, not read.

User programs write the gpio number to request the kernel to export control of a certain gpio to user space, provided that no kernel code has requested this gpio port. For example, the command to request GPIO number 480:

``` {.shell}
echo 480 > export
```

The above operation will create a node gpio480 for gpio 480. At this time, a gpio480 directory will be generated under the /sys/class/gpio directory.

/sys/class/gpio/unexport has the opposite effect. For example, the command to remove the gpio480 node:

``` {.shell}
echo 480 > unexport # This operation will remove the gpio480 node and release gpio number 480.
```

#### direction

direction indicates the direction of the gpio port, and the read result is in or out. You can also write to this file. When writing out, the gpio is set as output; when writing in, the gpio is set as input.

#### value

When dir is set to in, cat value represents the input value (0-low, 1-high).

When dir is set to out, you can echo 1/0 to value to represent high/low level input respectively.

#### edge

When setting interrupts in user space, direction needs to be set to in, and then set the corresponding value to edge.

| edge value | Meaning |
| --- | --- |
| none | Indicates the pin is input, not an interrupt pin |
| rising | Indicates the pin is interrupt input, rising edge triggered |
| falling | Indicates the pin is interrupt input, falling edge triggered |
| both | Indicates the pin is interrupt input, edge triggered |

<DocScope products="RDK S100">

## Debugging

``` {.shell}
cat /sys/kernel/debug/gpio
```

Querying the above node allows you to obtain the gpios currently in use in the system and their status (in, out, IRQ).

``` {.shell}
root@ubuntu:~# cat /sys/kernel/debug/gpio
gpiochip4: GPIOs 423-438, parent: i2c/3-0076, 3-0076, can sleep:
gpio-423 (                    |io-ser-reset0       ) out hi
gpio-424 (                    |io-ser-reset1       ) out hi
gpio-425 (                    |io-ser-reset2       ) out hi
gpio-426 (                    |io-ser-reset3       ) out hi

gpiochip3: GPIOs 439-455, parent: platform/360b0000.gpio, 360b0000.gpio:

gpiochip2: GPIOs 456-473, parent: platform/370f5000.gpio, 370f5000.gpio:

gpiochip1: GPIOs 474-479, parent: platform/39500000.gpio, 39500000.gpio:

gpiochip0: GPIOs 480-511, parent: platform/394f0000.gpio, 394f0000.gpio:
gpio-481 (                    |sysfs               ) out hi ACTIVE LOW
gpio-491 (                    |sysfs               ) in  hi
gpio-495 (                    |sysfs               ) in  hi
gpio-496 (                    |sysfs               ) in  hi
gpio-498 (                    |sysfs               ) in  hi
gpio-503 (                    |io-ext-reset        ) out lo
root@ubuntu:~#
```

### Determining gpio-index

kernel_index = base + offset, base is obtained via "/sys/class/gpio" or "/sys/kernel/debug/gpio", offset is obtained via dts.

Taking pin sensor8_err as an example: By checking drobot-s100-pinctrl.dtsi, you can know that the gpio chip corresponding to sensor8_err is video_port0: gpio\@360b0000, and the corresponding offset is 13.
Check /sys/kernel/debug/gpio, you can see that the base corresponding to "video_port0: gpio\@360b0000" is 439. Then the gpio kernel index corresponding to sensor8_err is: 439+13 = 452

### Check drobot-s100-pinctrl.dtsi to get offset and base

From the device tree below, we can see that sensor8_err corresponds to video_sensor8_err, and the corresponding gpio chip is "video_port0: gpio\@360b0000".
The offset of video_gnss_int is 0, incrementing by count, so the offset of video_sensor8_err is 13.

``` {.shell}
pinctrl_video: pinctrl@36090000 {
   compatible = "drobot,s100-pinctrl";
   reg = <0x0 0x36090000 0x0 0x1000>,
         <0x0 0x360a0000 0x0 0x1000>;
   pctldev-name = "video";
   status = "okay";

   video_gpio: video_gpio_func {
      pinmux {
         function = "video_gpio";
         pins = "video_gnss_int", "video_peri_rsto",
                  "video_cam_pint", "video_sd_1v8", "video_sd_bus_pow",
                  "video_sensor0_err", "video_sensor1_err",
                  "video_sensor2_err", "video_sensor3_err", "video_sensor4_err",
                  "video_sensor5_err", "video_sensor6_err",
                  "video_sensor7_err", "video_sensor8_err",
                  "video_sensor9_err", "video_sensor10_err", "video_sensor11_err";
      };
      pinconf {
         pins = "video_gnss_int", "video_peri_rsto",
                  "video_cam_pint", "video_sd_1v8", "video_sd_bus_pow",
                  "video_sensor0_err", "video_sensor1_err",
                  "video_sensor2_err", "video_sensor3_err", "video_sensor4_err",
                  "video_sensor5_err", "video_sensor6_err",
                  "video_sensor7_err", "video_sensor8_err",
                  "video_sensor9_err", "video_sensor10_err", "video_sensor11_err";
         drive-strength = <1>;
      };
   };
}
```

For example this line: gpiochip3: GPIOs 439-455, parent: platform/360b0000.gpio, 360b0000.gpio: "GPIOs 439-455" means the base is 439

``` {.shell}
cat /sys/kernel/debug/gpio
```

``` {.shell}
root@ubuntu:~# cat /sys/kernel/debug/gpio
gpiochip4: GPIOs 423-438, parent: i2c/3-0076, 3-0076, can sleep:
gpio-423 (                    |io-ser-reset0       ) out hi
gpio-424 (                    |io-ser-reset1       ) out hi
gpio-425 (                    |io-ser-reset2       ) out hi
gpio-426 (                    |io-ser-reset3       ) out hi

gpiochip3: GPIOs 439-455, parent: platform/360b0000.gpio, 360b0000.gpio:

gpiochip2: GPIOs 456-473, parent: platform/370f5000.gpio, 370f5000.gpio:
gpio-464 (                    |scl                 ) out lo
gpio-465 (                    |sda                 ) in  lo
gpio-466 (                    |scl                 ) out lo
gpio-467 (                    |sda                 ) in  lo
gpio-468 (                    |scl                 ) out lo
gpio-469 (                    |sda                 ) in  lo
gpio-470 (                    |scl                 ) out lo
gpio-471 (                    |sda                 ) in  lo
gpio-472 (                    |scl                 ) out lo
gpio-473 (                    |sda                 ) in  lo

gpiochip1: GPIOs 474-479, parent: platform/39500000.gpio, 39500000.gpio:

gpiochip0: GPIOs 480-511, parent: platform/394f0000.gpio, 394f0000.gpio:
gpio-495 (                    |scl                 ) out lo
gpio-496 (                    |sda                 ) in  lo
gpio-503 (                    |io-ext-reset        ) out lo
```
</DocScope>
<DocScope products="RDK S600">
## S600 GPIO Debugging

### Determining gpio-index

Taking pin cam_sensor0_err as an example: By checking drobot-s600-pinctrl.dtsi, you can know that the gpio chip corresponding to cam_sensor0_err is cam_port0: gpio\@37130000, and the corresponding offset is 8 (the position of cam_lpwm2_dout0 in the cam_gpio list).
Check /sys/kernel/debug/gpio, you can see the base corresponding to "cam_gpio0: gpio\@37130000". Then the gpio kernel index corresponding to cam_sensor0_err is: base + 8

### Check drobot-s600-pinctrl.dtsi to get offset and base

From the device tree below, we can see that cam_sensor0_err uses the cam_lpwm2_dout0 pin, and the corresponding gpio chip is "cam_port0: gpio\@37130000".
The position of cam_lpwm2_dout0 in the cam_gpio list is the 9th (counting from 0 as 8).

``` {.shell}
pinctrl_cam: pinctrl@37121000 {
   compatible = "drobot,s600-pinctrl";
   reg = <0x0 0x37121000 0x0 0x1000>,
         <0x0 0x37125000 0x0 0x1000>;
   pctldev-name = "cam";
   status = "okay";

   cam_gpio: cam_gpio_func {
      pinmux {
         function = "cam_gpio";
         pins = "cam_lpwm0_dout0", "cam_lpwm0_dout1",
                "cam_lpwm0_dout2", "cam_lpwm0_dout3", "cam_lpwm1_dout0",
                "cam_lpwm1_dout1", "cam_lpwm1_dout2",
                "cam_lpwm1_dout3", "cam_lpwm2_dout0", "cam_lpwm2_dout1",
                "cam_lpwm2_dout2", "cam_lpwm2_dout3", "cam_lpwm3_dout0",
                "cam_lpwm3_dout1", "cam_lpwm3_dout2",
                "cam_lpwm3_dout3";
      };
      pinconf {
         pins = "cam_lpwm0_dout0", "cam_lpwm0_dout1",
                "cam_lpwm0_dout2", "cam_lpwm0_dout3", "cam_lpwm1_dout0",
                "cam_lpwm1_dout1", "cam_lpwm1_dout2",
                "cam_lpwm1_dout3", "cam_lpwm2_dout0", "cam_lpwm2_dout1",
                "cam_lpwm2_dout2", "cam_lpwm2_dout3", "cam_lpwm3_dout0",
                "cam_lpwm3_dout1", "cam_lpwm3_dout2",
                "cam_lpwm3_dout3";
         drive-strength = <1>;
      };
   };

   cam_sensor0_err: cam_sensor0_err_func {
      pinmux {
         function = "cam_sensor0_err";
         pins = "cam_lpwm2_dout0";
      };
      pinconf {
         pins = "cam_lpwm2_dout0";
         drive-strength = <1>;
      };
   };
}
```
</DocScope>