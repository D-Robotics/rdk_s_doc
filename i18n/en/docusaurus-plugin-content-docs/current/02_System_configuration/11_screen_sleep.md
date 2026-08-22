---
title: "Screen Sleep and Power Management"
sidebar_position: 11
description: "Desktop/console screen sleep and power management"
---

# Screen Sleep and Power Management

Disabling screen sleep prevents the screen from going black during demos / production testing; power management involves thermal policies and power consumption modes.

## Disable Sleep on the Desktop Edition

By default, the GNOME desktop turns off the screen after 5 minutes of inactivity. Check the current setting:

```bash
gsettings get org.gnome.desktop.session idle-delay
```

Measured on RDK S600:

```text
$ gsettings get org.gnome.desktop.session idle-delay
uint32 300
```

`300` means 300 seconds (5 minutes). Temporarily disable automatic screen blanking and suspend:

```bash
# Disable automatic screen blanking
gsettings set org.gnome.desktop.session idle-delay 0
# Disable automatic suspend when on AC power (this key belongs to the power plugin)
gsettings set org.gnome.settings-daemon.plugins.power sleep-inactive-ac-timeout 0
systemctl mask sleep.target suspend.target
```

Or use `xset` (X11 session; not applicable to the Wayland session — use the gsettings above instead):

```bash
xset s off          # Disable the screensaver
xset -dpms          # Disable DPMS (power management)
xset s noblank
```

## Console Screen Blanking

The kernel framebuffer console blanks the screen after 10 minutes by default. To disable it:

```bash
# Temporarily disable blanking
setterm --blank 0
```

To disable it permanently, add `consoleblank=0` to the kernel command line; see [config.txt Configuration](./05_config_txt/01_usage.md).

The RDK S600 board uses the serial console by default (`console=ttyS0` in the output of `cat /proc/cmdline`), so there is no framebuffer console and no screen blanking handling is needed; for a desktop environment with a monitor connected, configure it as described in the previous section.

## Persistence

Write the commands above into a boot script (see [Boot Auto-Start Configuration](./06_self_start.md)) or `~/.config/autostart/` so that they remain effective after reboot.

## Power Consumption and Thermal

For Thermal and CPU frequency policies, see [Thermal and CPU Frequency Management](./08_frequency_management.md); for the low-power mode, see the advanced [Low-Power Mode Debugging Guide](../07_Advanced_development/03_system_software/13_driver_lowpower.md).

## FAQ

- **The desktop still blanks the screen**: Confirm that the gsettings took effect; under Wayland, you need to use the corresponding org.gnome.* settings.
- **The console still goes black**: Check whether `consoleblank=0` made it into the kernel command line (`cat /proc/cmdline`).

## Related Documentation

- [Display Configuration](./09_display_config.md)
- [Thermal and CPU Frequency Management](./08_frequency_management.md)
- [Boot Auto-Start Configuration](./06_self_start.md)
