---
title: "Boot Auto-Start Configuration"
sidebar_position: 6
description: "Configure boot auto-start with systemd unit / init.d / rc.local"
---

# Boot Auto-Start Configuration

There are multiple ways to add boot auto-start on the Ubuntu system. Using a custom systemd service is recommended (the most standard approach), and traditional init.d scripts and rc.local are also supported.

## View Enabled Auto-Start Services

```bash
systemctl list-unit-files --state=enabled --type=service
```

Measured on RDK S600 (partial):

```text
accounts-daemon.service   enabled
apparmor.service           enabled
bluetooth.service          enabled
...
```

## Method 1: Custom systemd Service (Recommended)

1. Write a unit file, for example `/etc/systemd/system/myapp.service`:

   ```ini
   [Unit]
   Description=My Application
   After=network.target

   [Service]
   ExecStart=/path/to/your/program
   Restart=on-failure

   [Install]
   WantedBy=multi-user.target
   ```

2. Reload systemd and enable auto-start:

   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable myapp        # Register boot auto-start
   sudo systemctl start myapp         # Start immediately
   ```

3. Verify:

   ```bash
   systemctl status myapp
   # ● myapp.service - My Application
   #      Active: active (running) since ...
   ```

Stop/disable: `sudo systemctl stop myapp` / `sudo systemctl disable myapp`.

## Method 2: init.d Script (Traditional SysV)

1. Create a script under `/etc/init.d` (with an LSB header):

   ```bash
   #!/bin/bash
   ### BEGIN INIT INFO
   # Provides:          your_service_name
   # Required-Start:    $all
   # Default-Start:     2 3 4 5
   # Default-Stop:      0 1 6
   # Short-Description: Start your_service_name at boot time
   ### END INIT INFO
   /path/to/your/program &
   exit 0
   ```

2. Add executable permission and register:

   ```bash
   sudo chmod +x /etc/init.d/your_script_name
   sudo update-rc.d your_script_name defaults
   sudo systemctl enable your_script_name   # systemd-compatible enabling
   ```

## Method 3: rc.local (Legacy)

`rc.local` is a systemd-compatible legacy startup script, executed at the end of boot. Just add commands at the end of `/etc/rc.local` (before `exit 0`):

```bash
#!/bin/bash -e
# Insert commands that need to run at boot here
exit 0
```

:::tip
For new projects, prefer systemd unit (Method 1), which can manage dependencies, restart policies, and logs; init.d/rc.local are only for compatibility.
:::

## Related Documentation

- [Viewing System Logs](./15_system_log.md)
- [User and Permission Management](./14_user_permission.md)
- [Package Management apt](./03_system_update/01_apt_usage.md)
