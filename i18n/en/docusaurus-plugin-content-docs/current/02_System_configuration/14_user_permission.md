---
title: "User and Permission Management"
sidebar_position: 14
description: "Managing users/groups, sudo, and su"
---

# User and Permission Management

RDK OS provides two accounts by default. For Mode 2 productization, you often need to create dedicated users and configure sudo and permission isolation.

## Default Accounts

| Account | Username | Password | Description |
|---|---|---|---|
| Regular user | `sunrise` | `sunrise` | uid 1000, sudo without password already configured |
| Superuser | `root` | `root` | Full privileges |

Measured on the board (`id`, `/etc/passwd`):

```text
$ whoami && id
root
uid=0(root) gid=0(root) groups=0(root)

$ grep "^sunrise:" /etc/passwd
sunrise:x:1000:1000::/home/sunrise:/bin/bash
```

The passwordless sudo configuration for `sunrise` is in `/etc/sudoers.d/010_sunrise-nopasswd`.

## sudo / su

```bash
# Run a single command with elevated privileges as a regular user
sudo <command>

# Switch to a root shell
sudo -i          # or su -
```

:::tip
For production environments, disable the default password login and switch to key-based authentication, and revoke the passwordless sudo of `sunrise` as needed (delete `/etc/sudoers.d/010_sunrise-nopasswd` and grant individual authorizations as needed).
:::

## Creating a New User (Mode 2 Productization)

```bash
# Create user myapp with a home directory and add it to the sudo group
sudo useradd -m -s /bin/bash -G sudo myapp
sudo passwd myapp

# Delete a user
sudo userdel -r myapp
```

## Group Management

```bash
sudo groupadd <group_name>              # Create a group
sudo usermod -aG <group> <user>         # Add a user to a group (append, without removing other groups)
groups <user>                           # View the groups a user belongs to
```

Common groups: `sudo` (privilege elevation), `video` (video/display devices), `dialout` (serial port devices), `plugdev` (hot-plug devices).

## File Permissions

```bash
chmod 755 <file>              # rwxr-xr-x
chown <user>:<group> <file>   # Change owner and group
```

## Related Documents

- [Boot Auto-Start Configuration](./06_self_start.md)
- [System Log Viewing](./15_system_log.md)
