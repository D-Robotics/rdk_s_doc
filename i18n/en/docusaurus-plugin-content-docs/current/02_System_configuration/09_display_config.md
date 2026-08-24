---
title: "Display Configuration"
sidebar_position: 9
description: "HDMI/DP monitor connection, resolution, and multi-display"
---

# Display Configuration

The RDK board connects to a monitor via the HDMI/DP interface. The Desktop edition shows the graphical desktop out of the box, and the Server edition allows configuring the console resolution.

:::info Note
The RDK OS Desktop edition runs GNOME (Wayland session) by default. `xrandr` is an X11 tool and only works in the X11 session; under the Wayland session, adjust the resolution in "Settings → Displays", or run `gnome-control-center display` to open the settings.
:::

## Connecting a Monitor

- Connect the board and the monitor with an HDMI/DP cable. The Desktop edition outputs automatically after power-on.
- Supported resolutions depend on the EDID negotiation result between the board and the monitor.

## Checking and Setting the Resolution

### Command Line (X11)

```bash
# List connected monitors and supported resolutions
xrandr

# Set the resolution (example)
xrandr --output HDMI-1 --mode 1920x1080 --rate 60
```

### Wayland (GNOME Desktop, Default)

```bash
gnome-control-center display      # Open the "Settings → Displays" graphical interface
```

### Kernel DRM Nodes (Common to Both Sessions)

Whether X11 or Wayland, you can check the monitor connection status and supported modes through the kernel DRM nodes:

```bash
cat /sys/class/drm/card0-HDMI-A-1/status    # connected / disconnected
cat /sys/class/drm/card0-HDMI-A-1/modes     # Supported display modes
```

Measured on RDK S600 (HDMI-A-1 connected, outputting 1920x1080@60, excerpt):

```text
$ cat /sys/class/drm/card0-HDMI-A-1/status
connected
$ cat /sys/class/drm/card0-HDMI-A-1/modes
1920x1080
1680x1050
1280x1024
1440x900
1280x800
1280x720
```

The Server edition console resolution is configured with the `video=` parameter in config.txt (see [config.txt](./05_config_txt/01_usage.md)).

## Multi-Display

In the X11 session, use `xrandr` to list all outputs. You can set the primary display and extended display:

```bash
xrandr --output HDMI-1 --primary --output HDMI-2 --right-of HDMI-1
```

In the Wayland session, configure the multi-display layout in "Settings → Displays".

## Rotation

In the X11 session, use `xrandr` to rotate the output:

```bash
xrandr --output HDMI-1 --rotate left    # left/right/normal/inverted
```

In the Wayland session, configure the rotation direction in "Settings → Displays".

## FAQ

- **No display**: Check the cable and port, and the monitor input source; the Server edition has no graphical desktop by default — you need a Desktop edition image or need to install `xorg`.
- **Wrong resolution**: In X11, use `xrandr` to check the supported list; in Wayland, adjust in "Settings → Displays", or check the modes supported by the kernel with `cat /sys/class/drm/card0-HDMI-A-1/modes`, and choose the modes reported by EDID.
- **Garbled screen/flickering**: Replace with a compliant HDMI cable and check the refresh rate.

## Verification

- Monitor connected: `cat /sys/class/drm/card0-HDMI-A-1/status` outputs `connected`.
- Supported resolutions: `cat /sys/class/drm/card0-HDMI-A-1/modes` lists the supported display modes.
- Current resolution: under X11, use `xrandr` to check the mode marked with `*`; under Wayland, check in "Settings → Displays".

## Related Documentation

- [config.txt Configuration](./05_config_txt/01_usage.md)
- [Screen Sleep and Power Management](./11_screen_sleep.md)
- [Audio Configuration](./10_audio_output.md)
