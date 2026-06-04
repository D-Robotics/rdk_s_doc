---

sidebar_position: 3
sidebar_products: "RDK S100"
---

# 1.1.3 FAQ

### Q1: What does the Pull up/down column in the RDK S100 Pinlist Excel file mean?

**A:** The Pull up/down column in the Pinlist Excel file describes the default pull-up or pull-down state of the interface signals at power-on.

### Q2: Can the input voltage range of the RDK S100 power JACK exceed 20V or go below 12V?

**A:** Exceeding 20V may damage the RDK S100 development board; going below 12V may cause abnormal startup, such as abnormal power-on or failure to boot into the kernel.

### Q3: Where can I find the description of the power supply capability of the RDK S100 external interface output?

**A:** It is described in the "Tip" or "Note" section of each interface introduction.

### Q4: Can the power supply capability of the RDK S100 external interface output exceed the maximum supply current provided by Dijia?

**A:** No, it cannot exceed the maximum supply current provided by Dijia; otherwise, it may cause board damage or abnormal startup.

### Q5: How to connect the MCU daughter board and CAM daughter board to the RDK S100 main board? Is there a reference guide?

**A:** The sections **[1.1.1.1 RDK S100 Camera Expansion Board](../01_hardware_introduction/01_rdk_s100/02_rdk_s100_camera_expansion_board.md)** and **[1.1.1.2 RDK S100 MCU Port Expansion Board](../01_hardware_introduction/01_rdk_s100/03_rdk_s100_mcu_port_expansion_board.md)** include reference videos on connecting the CAM daughter board and MCU daughter board to the RDK S100 main board.

### Q6: What do the characters AO, AI, I, O, IO, NULL, /, etc., in the RDK S100 Pinlist Excel file mean?

**A:**
- **AO:** Analog Output
- **AI:** Analog Input
- **I:** Digital Input
- **O:** Digital Output
- **IO:** Digital Input or Output
- **NULL:** Null value
- **/:** Indicates no pin or no state

### Q7: What should I do if the 3.3V pin cannot drive my sensor?

**A:** It is recommended to check whether the power supply provided by the RDK S100 meets the electrical characteristics (e.g., voltage/current/level matching) required by the sensor. Also, check for any hardware circuit connection errors.

### Q8: Can I parallel multiple pins to increase the output current?

**A:** The maximum current that can be output by any pin on the RDK S100 external interface is the maximum current available to the peripheral. Paralleling multiple pins cannot provide a higher current capability.

### Q9: Why won’t my USB device start properly?

**A:** It is recommended to check for loose hardware connections, whether the USB cable is too long, whether the development board can meet the power requirements of the USB device, whether the USB software configuration is correct, and try using a different USB device to identify the issue.

### Q10: Are there any safety recommendations for using the RDK S100 kit?

**A:**  

- **a.** Follow the connection guide videos for the CAM daughter board and MCU daughter board in the community documentation to properly attach both daughter boards. Ensure the connections are secure and not loose before powering on the RDK S100 main board. If the daughter boards are not needed, you can directly power the RDK S100 main board with a 12–20V power supply and turn it on.  

- **b.** While using the RDK S100 development kit, be aware of any conductors in the surrounding environment that may come into direct contact with the kit’s circuitry. If such conductors exist, move the kit away from exposed conductors to avoid short circuits.