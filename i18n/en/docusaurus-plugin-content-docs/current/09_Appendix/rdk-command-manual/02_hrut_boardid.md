---
sidebar_position: 2
---

# hrut_boardid

The **hrut_boardid** command is used to retrieve the ID of the current development board (different development boards have different IDs).

> ⚠️ The board ID affects hardware initialization during boot—please configure it with caution.

```mdx-code-block
import DocScope from '@site/src/components/DocScope';
```

## Syntax

```
hrut_boardid
```

## Common Commands

Get the current board ID:

<DocScope products="RDK S100">

```
root@ubuntu:~# hrut_boardid
0x6A84
```

Output explanation:
```
0x   6A          8             4
     ^^          ^             ^
     ||          |             |
  Chip ID   Board Power Design   Board Design Version
```

</DocScope>

<DocScope products="RDK S600">

```
root@ubuntu:~# hrut_boardid
0x5131310
```

Output explanation:
```
0x   5131310
     ^^^^^^^
  S600 Carrier Board ID
```

</DocScope>