---
sidebar_position: 7
title: "Desktop Applications"
description: "Common issues and solutions for third-party applications on the RDK desktop."
---
# Desktop Applications

This section answers common issues encountered when using third-party applications on the RDK desktop.

> For desktop display/audio/screen sleep configuration, see [Display Configuration](../02_System_configuration/09_display_config.md), [Audio Configuration](../02_System_configuration/10_audio_output.md), and [Screen Sleep and Power Management](../02_System_configuration/11_screen_sleep.md).

## VS Code Does Not Open

The Electron shell used by Visual Studio Code may have issues when handling GPU hardware acceleration, causing a blank interface or failure to open.

**Solution:** Disable GPU acceleration on startup:

```bash
code --disable-gpu
```

Reference: [Official VS Code FAQ](https://code.visualstudio.com/docs/supporting/faq#_vs-code-is-blank)

## Unable to Log In to Desktop After Switching System Language

After switching the system language in Settings and restarting the desktop session, you may be unable to log in even when entering the correct password.

**Solution:**

1. Open Settings → Region & Language and select the target language.
2. Click restart (this only restarts the desktop session, not the device).
3. Enter the password on the lock screen to log in.
4. If you still cannot log in, run `reboot` to restart the device and complete the switch.

:::info Note
It is recommended not to use the system language switch feature for now. If you need to use it, follow the steps above; restart the device if you encounter problems.
:::

## Incorrect Screen Resolution

The HDMI display resolution can be configured through config.txt; see the display options section of [Common Configuration Item Reference](../02_System_configuration/05_config_txt/03_common_options.md).

It can also be adjusted via Settings → Displays on the desktop.

## No HDMI Display Output

1. Confirm that the HDMI cable is firmly connected.
2. Confirm that the monitor power is on and the input source is set to HDMI.
3. Confirm that the power indicator is on (the system has started).
4. The first system startup takes about 45 seconds for configuration; the desktop should appear after waiting.
5. If there is still no display after a long time (more than 2 minutes), debug via serial port; see [Debug Serial Port](../02_System_configuration/16_debug_serial.md).

## Desktop Lag

- Check CPU usage: `top` (see [top command](../09_Appendix/linux-command-manual/18_top.md)).
- Check BPU usage: `hrut_ps` (see [hrut_ps](../09_Appendix/rdk-command-manual/03_hrut_ps.md)).
- Close unnecessary background services.
- Reduce desktop effects: Settings → Appearance → turn off animations.

## Related Documentation

- [Display Configuration](../02_System_configuration/09_display_config.md)
- [Audio Configuration](../02_System_configuration/10_audio_output.md)
- [Screen Sleep and Power Management](../02_System_configuration/11_screen_sleep.md)
- [Common Configuration Item Reference](../02_System_configuration/05_config_txt/03_common_options.md)
- [Debug Serial Port](../02_System_configuration/16_debug_serial.md)