---
sidebar_position: 2
---

# 1.3.2 RDK S100 入门配置

:::tip

本章节介绍的入门配置方式仅支持在 RDK S100 型号的开发板上使用；

:::

```mdx-code-block
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
```

## 连接Wi-Fi

<Tabs groupId="rdk-type">
<TabItem value="desktop" label="Desktop">

使用菜单栏右上角的Wi-Fi管理工具连接Wi-Fi，如下图所示，点击需要连接的Wi-Fi名，然后在弹出的对话框中输入Wi-Fi密码。

</TabItem>

<TabItem value="server" label="Server">



</TabItem>
</Tabs>

## 开启SSH服务

当前系统版本默认开启 SSH 登录服务，用户可以使用本方法开、关 SSH 服务。

<Tabs groupId="rdk-type">
<TabItem value="desktop" label="Desktop">

</TabItem>

<TabItem value="server" label="Server">


</TabItem>

</Tabs>

SSH的使用请查看 [远程登录 - SSH登录](../remote_login#ssh)。

## 开启VNC服务

<Tabs groupId="rdk-type">
<TabItem value="desktop" label="Desktop">

</TabItem>
</Tabs>

VNC 的使用请查看 [远程登录 - VNC登录](./remote_login#vnc登录)。

## 设置登录模式

<Tabs groupId="rdk-type">
<TabItem value="desktop" label="Desktop">


</TabItem>

<TabItem value="server" label="Server">

</TabItem>
</Tabs>

## 设置中文环境

<Tabs groupId="rdk-type">
<TabItem value="desktop" label="Desktop">

</TabItem>

<TabItem value="server" label="Server">

</TabItem>
</Tabs>

## 设置中文输入法

<Tabs groupId="rdk-type">
<TabItem value="desktop" label="Desktop">


</TabItem>
</Tabs>

## 设置RDK Studio

:::tip
持续更新中....
:::


## 用户管理

**修改用户名**

以新用户名为usertest为例

```shell
#关闭sunrise用户所有进程
sudo pkill -u sunrise
#sunrise用户改名为usertest
sudo usermod -l usertest sunrise
#用户的家目录改为/home/usertest
sudo usermod -d /home/usertest -m sunrise
#修改用户密码
sudo passwd usertest
```

最后将`/etc/lightdm/lightdm.conf.d/22-hobot-autologin.conf`文件中的 `autologin-user=sunrise` 改为`autologin-user=usertest`，更新自动登录的用户名称

**增加新用户**

以新增用户为usertest为例

```shell
sudo useradd -U -m -d /home/usertest -k /etc/skel/ -s /bin/bash -G disk,kmem,dialout,sudo,audio,video,render,i2c,lightdm,vpu,gdm,weston-launch,graphics,jpu,ipu,vps,misc,gpio usertest
sudo passwd usertest
sudo cp -aRf /etc/skel/. /home/usertest
sudo chown -R usertest:usertest /home/usertest
```

也可以参考修改用户名，将新增用户设为自动登录用户