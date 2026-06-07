# hrut_boardid

URL: https://developer.d-robotics.cc/rdk_s_doc/en/Appendix/rdk-command-manual/cmd_hrut_boardid

The **hrut_boardid** command is used to retrieve the ID of the current development board (different development boards have different IDs).

> ⚠️ The board ID affects hardware initialization during boot—please configure it with caution.

Example command output:

```text
root@ubuntu:~# hrut_boardid
0x6A84
```

Output explanation:

```text
0x   6A          8             4
     ^^          ^             ^
     ||          |             |
  Chip ID   Board Power Design   Board Design Version
```
