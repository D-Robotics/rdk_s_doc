---
title: "Boot Auto-Start Configuration"
sidebar_position: 6
description: "Configure boot auto-start with systemd service / rc.local / init.d script"
---

# Boot Auto-Start Configuration

:::doc_scope{products="RDK S100"}
The RDK S100 factory image is based on Ubuntu and uses systemd as its init system. After the system starts, systemd brings up services stage by stage along a fixed flow.
:::

:::doc_scope{products="RDK S600"}
The RDK S600 factory image is based on Ubuntu and uses systemd as its init system. After the system starts, systemd brings up services stage by stage along a fixed flow.
:::

This document provides three methods for boot auto-start configuration. The three are mutually compatible; choose as needed. A systemd service is recommended; for simple cases, rc.local is usable; for porting an existing init.d script from another system, the init.d method is available for boot auto-start configuration.

## Method Selection

Choose one method as needed. The three methods are mutually compatible:

| Method | Applicable Scenario |
|-|-|
| Method 1: systemd service | Needs auto-restart on failure, depends on other services being ready, or independent log management |
| Method 2: rc.local | Only needs to run a few simple commands at boot |
| Method 3: init.d script | Porting an existing init.d script from another system |

## Principle

### systemd

systemd is the **init system** of modern Ubuntu — the first user-space process started once the kernel finishes loading (PID 1), responsible for unified management of all system services. Its smallest managed object is the **unit**, among which a `.service` describes a service (other types include target, socket, timer, etc.).

At boot, systemd brings up units stage by stage along a **target chain**. A target is a group of units started together, corresponding to one boot stage:

```
sysinit.target → basic.target → multi-user.target → graphical.target
```

- `sysinit.target`: low-level initialization — hardware, device nodes, filesystems;
- `basic.target`: basic system services ready;
- `multi-user.target`: multi-user text mode ready (networking and login services);
- `graphical.target`: graphical login ready, depends on `multi-user.target`.

Boot auto-start is achieved by writing a `.service` unit that declares fields such as the start command (`ExecStart`), ordering dependency (`After`), restart policy (`Restart`), and running user (`User`), then registering it with `systemctl enable`. The essence of `enable` is to create a symlink under the corresponding target's `.wants` directory (e.g. `/etc/systemd/system/multi-user.target.wants/`); at boot, upon reaching that target, systemd traverses the `.wants` links and starts the corresponding services. `.wants` denotes a weak dependency — systemd attempts to start the unit but does not wait for it to complete.

In addition, systemd supervises the processes it starts: standard output and error are written to the system journal (viewed via `journalctl`), and a process that exits abnormally is restarted automatically according to the `Restart` policy. A native unit therefore provides explicit dependency relationships, manageable restart policies, and independent logs, making it the standard form for system services and the first choice for new projects.

### init.d

init.d originates from **SysV init** (traditional Unix System V init), predating systemd by many years. Its core concept is the **run level**: seven states 0–6 (0 halt, 1 single-user, 2–5 multi-user, 6 reboot); at boot the system enters the default run level and executes that level's start scripts in sequence.

Configuration: place a shell script under `/etc/init.d/` that accepts `start`/`stop`/`restart` arguments, with an **LSB header** (Linux Standard Base Header — a machine-parseable metadata comment block at the top of the script that declares dependencies and default run levels) declaring dependencies and default run levels; then use `update-rc.d` to create symlinks in the `/etc/rcN.d/` directory (N is the run level):

- `S##name`: start when entering that run level (S = Start); `##` is a two-digit 00–99 sequence deciding ordering;
- `K##name`: stop when leaving that run level (K = Kill).

When entering the default run level at boot, init executes all `S##` scripts in ascending numeric order.

Since RDK OS uses systemd, its built-in **`systemd-sysv-generator`** scans `/etc/init.d/` at boot, generates a same-named `.service` for each script, converts the LSB header's `Required-Start` into the unit's `After=`, and decides whether to start it at boot based on the `S##`/`K##` symlinks in `/etc/rcN.d/`. Thus on this system init.d is essentially a **compatibility layer** on top of systemd: existing scripts can be reused nearly unchanged, but lack capabilities such as auto-restart, fine-grained dependencies, and structured logging, making it only suitable for reusing existing legacy scripts.

### rc.local

rc.local is another legacy convention from the SysV era: at the end of boot the system executes the `/etc/rc.local` script, used to centralize miscellaneous commands to be run during boot.

Under systemd this is handled by the built-in **`systemd-rc-local-generator`**: during boot generation it checks whether `/etc/rc.local` exists and has execute permission; if so, it generates `rc-local.service` (`Type=forking`) scheduled to run the file near the end of boot. Its trigger condition is `ConditionFileIsExecutable`, which requires the file to be executable; therefore, when the factory default permission is `644` (not executable), `chmod +x` must be run first, otherwise the service is skipped at boot.

Additionally, `Type=forking` indicates that the script is expected to fork a background process and then exit, and systemd considers the service started once the initial process exits. Consequently, a foreground command written in rc.local without a trailing `&` will hold the boot flow and block subsequent stages; commands must be placed in the background with `&`.

rc.local suits appending a few simple commands, but as a single script it offers no individual service management, runs as root by default, and has no auto-restart, making it unsuitable for production services.

---

All three mechanisms are ultimately launched by systemd at boot; among them, the systemd service has the most explicit dependencies and the most complete capabilities, and is recommended for new projects.

## Configuration Methods

The examples below use the program path `/usr/bin/myapp` for demonstration. Replace it with your actual path. The program must already be deployed and have execute permission (`chmod +x`).

### Method 1: systemd Service (Recommended)

Use a native systemd service unit when your program needs **auto-restart on failure**, **to start after another service is ready**, or **independent logs**. This is the standard way system services are managed, with the most explicit and reliable dependency relationships.

**Step 1: Create the service unit file**

```bash
sudo vim /etc/systemd/system/myapp.service
```

```ini
[Unit]
Description=My Application
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/myapp
Restart=on-failure
RestartSec=3
User=root

[Install]
WantedBy=multi-user.target
```

**`.service` file field reference:**

| Section | Field | Description |
|-|-|-|
| `[Unit]` | `Description` | Service description, shown by `systemctl status` etc.; no functional effect |
| `[Unit]` | `After` | Start-order dependency; the service starts after the specified target/service. Multiple targets can be combined, e.g. `After=network.target` |
| `[Service]` | `Type` | Start type, defaults to `simple` (foreground process; the process started by `ExecStart` staying alive is considered running) |
| `[Service]` | `ExecStart` | Start command, using an absolute path (e.g. `/usr/bin/myapp`) |
| `[Service]` | `Restart` | Restart policy on exit; `on-failure` means auto-restart only on non-zero exit code |
| `[Service]` | `RestartSec` | Restart interval in seconds, e.g. `3` means wait 3s after exit before restarting |
| `[Service]` | `User` | User running the service; for programs that do not need root, switch to a non-privileged user (e.g. `sunrise`) to reduce risk |
| `[Install]` | `WantedBy` | Target that `systemctl enable` installs into; `multi-user.target` corresponds to the multi-user run level (boot auto-start) |

:::tip
**Security tip:** For programs that do not need root, switch to a non-privileged user (e.g. `User=sunrise`) to reduce risk. After modifying a `.service`, always run `sudo systemctl daemon-reload`. To auto-restart on crash, add `Restart=on-failure`; to set the working directory, add `WorkingDirectory=/app`.
:::

**Step 2: Reload configuration and enable the service**

```bash
sudo systemctl daemon-reload
sudo systemctl enable myapp.service
sudo systemctl start myapp.service
```

**Step 3: Reboot and verify**

### Method 2: rc.local

The system ships with `/etc/rc.local`, executed by `rc-local.service` at boot. However, the factory file is **not executable** by default, and the trigger condition for `rc-local.service` is "file is executable"—**so you must add execute permission first, otherwise it will not run at boot**.

**Step 1: Edit rc.local**

```bash
sudo vim /etc/rc.local
```

**Step 2: Insert the start command before `exit 0`**

```bash
#!/bin/bash -e
#
# rc.local - executed at boot
# By default this script does nothing.

# Insert your start command here
/usr/bin/myapp &

exit 0
```

:::warning
Commands must be written **before** `exit 0`; `rc-local.service` is `Type=forking`, so a foreground command without `&` will block the boot flow.
:::

**Step 3: Grant execute permission (required)**

```bash
sudo chmod +x /etc/rc.local
```

:::tip
**This step cannot be skipped.** The factory `/etc/rc.local` has permission `644` (not executable); when the `ConditionFileIsExecutable` condition of `rc-local.service` is not met, it is skipped at boot. Use `ls -l /etc/rc.local` to confirm the permission contains `x`.
:::

**Step 4: Reboot and verify**

### Method 3: init.d Script

This is the traditional SysV approach, suitable for migrating from legacy scripts. For new projects, Method 1 is recommended.

**Step 1: Create an LSB-style init script**

```bash
sudo vim /etc/init.d/myapp
```

```bash
#!/bin/bash
### BEGIN INIT INFO
# Provides:          myapp
# Required-Start:    $all
# Required-Stop:
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: Start myapp at boot time
### END INIT INFO

case "$1" in
  start)
    echo "Starting myapp"
    /usr/bin/myapp &
    ;;
  stop)
    killall myapp
    ;;
  restart)
    $0 stop
    $0 start
    ;;
  *)
    echo "Usage: $0 {start|stop|restart}"
    exit 1
esac
exit 0
```

**Step 2: Grant permission and register boot auto-start**

```bash
sudo chmod +x /etc/init.d/myapp
sudo update-rc.d myapp defaults
```

**Step 3: Reboot and verify**

## Verification

After configuration, reboot the board to confirm boot auto-start takes effect:

```bash
sudo reboot
```

After reboot, choose the verification command for your method:

| Method | Verification Command | Success Flag |
|-|-|-|
| Method 1 | `systemctl is-active myapp.service` | Outputs active |
| Method 2 | `pgrep -af myapp`<br/>`systemctl is-active rc-local` | Process running; rc-local is active |
| Method 3 | `systemctl is-active myapp.service` | Outputs active |

## Cancel Auto-Start

When debugging or replacing a program, revoke the boot auto-start for the corresponding method per the table below:

| Method | How to Cancel |
|-|-|
| Method 1: systemd service | `sudo systemctl disable --now myapp.service`;<br/>delete `/etc/systemd/system/myapp.service`;<br/>`sudo systemctl daemon-reload` |
| Method 2: rc.local | Delete the lines you added in `/etc/rc.local` (execute permission can be kept) |
| Method 3: init.d script | `sudo update-rc.d -f myapp remove`;<br/>delete `/etc/init.d/myapp` |

## Common Error Troubleshooting Checklist

| Symptom | Troubleshooting |
|-|-|
| Program not running after boot | `systemctl status myapp.service` for status and error code; `journalctl -u myapp.service -b` for logs |
| rc.local not executed | `ls -l /etc/rc.local` to confirm permission contains `x`; if not, run `sudo chmod +x /etc/rc.local`; `journalctl -u rc-local.service -b` for logs |
| Command not found / library not found | Specify `Environment=PATH=...` in the service unit, or use absolute paths in the script; dependent libraries must be in a system path or `/app/lib` |
| Modified .service not taking effect | After every change to the service file, run `sudo systemctl daemon-reload` |
| Wrong boot order / hardware not ready | Declare dependencies explicitly with `After=` (e.g. `hobot-loadko.service` for kernel modules loaded); see the `.service` file field reference in Method 1 |
| Security concerns about running as root | Use `User=<non-privileged user>` in the `[Service]` section to avoid unnecessary root privileges |

## Related Documentation

- [Viewing System Logs](./15_system_log.md)
- [User and Permission Management](./14_user_permission.md)
- [Package Management apt](./03_system_update/01_apt_usage.md)
