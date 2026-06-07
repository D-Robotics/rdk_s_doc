# dmesg

URL: https://developer.d-robotics.cc/rdk_s_doc/en/Appendix/linux-command-manual/cmd_dmesg

The `dmesg` command is used to view or control the kernel ring buffer.

The kernel stores the kernel boot logs in the ring buffer. If you didn't have time to view the information during boot-up, you can use `dmesg` to view it.

## Syntax

```text
dmesg [options]

dmesg -C / dmesg --clear
dmesg -c / dmesg --read-clear [options]
```

## Option Explanation

- -c, --read-clear: Display the information and then clear the contents of the ring buffer.
- -C, --clear: Clear the contents of the ring buffer.

## Common Commands

- Display all kernel log content in the ring buffer

```text
dmesg
```

- Save the kernel log to a file

```text
dmesg > kernel.log
```

- Clear the cached logs; useful for reducing log content when debugging drivers

```text
dmesg -C
```
