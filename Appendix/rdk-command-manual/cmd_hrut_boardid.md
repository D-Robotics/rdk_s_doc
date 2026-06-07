# hrut_boardid

URL: https://developer.d-robotics.cc/rdk_s_doc/Appendix/rdk-command-manual/cmd_hrut_boardid

**hrut_boardid** 命令是用来获取当前开发板的编号 (不同开发板的编号不同）。

> ⚠️ boardid 会影响到启动时硬件的初始化，请谨慎设置。

命令输出示例：

```text
root@ubuntu:~# hrut_boardid
0x6A84
```

输出说明：

```text
0x   6A          8             4
     ^^          ^             ^
     ||          |             |
  芯片代号   板级电源设计   板级设计版本
```
