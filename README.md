[English](./README_EN.md) | 简体中文

# 文档仓库

本仓库是 RDK S100 / S600 开发文档站点源码，基于 Docusaurus 构建，包含中文主文档、英文文档翻译、站点主题定制、文档范围过滤（Doc Scope）和自动化发布流程。


## 环境准备

- Node.js：`>= 18`
- 包管理：`npm`

```bash
# 日常开发快速安装（会按 semver 更新依赖）
npm install
```


## 维护常用命令

### 内容与结构维护

```bash

# 生成侧边栏范围配置（Doc Scope）
npm run generate-sidebar-config

# 开发时监听文档变化，自动更新侧边栏范围配置
npm run watch-sidebar-config
```

### 本地运行

```bash
# 中文开发模式（包含侧边栏配置监听）
npm run start

# 英文开发模式（包含侧边栏配置监听）
npm run start:en

# 中文开发模式，使用 3001 端口
npm run start:port

# 中文开发模式（不启动监听）
npm run start:no-watch

# 英文开发模式（不启动监听）
npm run start:no-watch:en

# 对外暴露预览（VM/容器内启动，供宿主机浏览器访问，不自动开浏览器窗口）
# 直接用 docusaurus start 原生参数，不要叠加 watch-sidebar-config：
# 后者与 Docusaurus 自带的文件监听重复，双 watcher 抢同一批 md 会把 dev server 路由表踩坏（改文档后 404，须重启）
npx docusaurus start --host 0.0.0.0 --no-open --locale zh-Hans
# 宿主机访问：http://<虚拟机IP>:3000/rdk_s_doc/  （注意末尾斜杠）
# 注意：此方式不监听侧边栏范围配置；改了 front matter 的 sidebar_versions/sidebar_products 或增删文档后，
# 需重启，或先 npm run generate-sidebar-config

# 清理 Docusaurus 缓存
npm run clear
```

### 构建与产物验证

```bash
# 标准全量构建
npm run build

# 本地预览 build 目录
npm run serve

# 指定 host 和 port 预览（示例）
npm run serve -- --host=10.64.62.34 --port=1688 --no-open

```

常见访问路径（端口以实际 `serve` 输出为准）：
- 英文：`http://localhost:3000/en/rdk_s_doc/RDK`
- 中文：`http://localhost:3000/rdk_s_doc/RDK`



