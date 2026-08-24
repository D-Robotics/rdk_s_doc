---
sidebar_position: 2
---

# dmesg

The `dmesg` command is used to view or control the kernel ring buffer.

The kernel stores the kernel boot logs in the ring buffer. If you didn't have time to view the information during boot-up, you can use `dmesg` to view it.

## Syntax

```
dmesg [options]

dmesg -C / dmesg --clear
dmesg -c / dmesg --read-clear [options]
```

------

## Option Explanation

- -c, --read-clear: Display the information and then clear the contents of the ring buffer.
- -C, --clear: Clear the contents of the ring buffer.

## Common Commands

- Display all kernel log content in the ring buffer

  ```
  dmesg
  ```

  Expected output (excerpt):

  ```text
  [    0.000000] Booting Linux on physical CPU 0x0000040000 [0x410fd423]
  [    0.000000] Linux version 6.1.158-rt58-DR-5.1.0-2606102106-g369e4b-gb66940 (aarch64-none-linux-gnu-gcc) #38 SMP PREEMPT_RT Wed Jun 10 21:07:32 CST 2026
  [    0.000000] Machine model: D-Robotics RDK S600 MCB V0p2
  [    0.000000] earlycon: uart8250 at MMIO32 0x000000003484c000 (options '')
  ```

- Save the kernel log to a file

```
dmesg > kernel.log
```

- Clear the cached logs; useful for reducing log content when debugging drivers

```
dmesg -C
```