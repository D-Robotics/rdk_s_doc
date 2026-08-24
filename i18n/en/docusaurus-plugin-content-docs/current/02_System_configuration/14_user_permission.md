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

## Verification

- Current identity: `whoami`/`id` shows the current user and uid.
- User exists: `grep "^sunrise:" /etc/passwd` finds the default user; after creating a new user, `grep "^myapp:" /etc/passwd` finds it.
- Group membership and permissions: `groups <user>` shows the groups the user belongs to; `ls -l <file>` shows permissions and ownership.

## FAQ

### Permission Denied When a Regular User Runs a Command

**Cause**: Insufficient file/directory permissions, or the user is not in the corresponding group (for example, `dialout` for serial port access, `video` for display device access).

**Solution**: Use `sudo` to elevate privileges, or add the user to the corresponding group with `sudo usermod -aG <group> <user>` and log in again.

### sudo Requires a Password or Cannot Elevate

**Cause**: sudoers does not authorize passwordless sudo for this user, or the passwordless configuration was removed.

**Solution**: `sunrise` is passwordless by default (`/etc/sudoers.d/010_sunrise-nopasswd`); add new users to the `sudo` group and authorize them as needed with `visudo`.

### User Is Removed from Other Groups After Being Added to a Group

**Cause**: `usermod -G` (overwrite) was mistakenly used instead of `-aG` (append).

**Solution**: To append a group, use `sudo usermod -aG <group> <user>` to keep the existing groups.

## Related Documentation

- [Boot Auto-Start Configuration](./06_self_start.md)
- [System Log Viewing](./15_system_log.md)
