[English](./README_EN.md) | 简体中文

# 文档仓库

本仓库是 RDK S100 / S600 开发文档站点源码，基于 Docusaurus 构建，包含中文主文档、英文文档翻译、站点主题定制、文档范围过滤（Doc Scope）和自动化发布流程。

文档站核心能力包括：
- 多语言文档（`zh-Hans` / `en`）
- 按产品和版本筛选文档内容（`DOC_BUILD_PRODUCT`、`DOC_BUILD_VERSION`）
- 自动生成并监听侧边栏范围配置
- GitHub Pages 构建发布与 OSS 同步

## 仓库结构概览

主要目录说明如下：

- `docs/`：中文文档主内容
- `i18n/en/docusaurus-plugin-content-docs/current/`：英文文档内容
- `scripts/`：文档维护与构建辅助脚本（编号、链接修复、范围构建等）
- `src/`：主题定制、插件与 remark 扩展
- `static/`：静态资源
- `.github/workflows/`：CI/CD 工作流（Pages 部署与 OSS 同步）
- `docusaurus.config.js`：站点主配置
- `sidebars.js`：文档侧边栏配置入口

## 环境准备

- Node.js：`>= 18`
- 包管理：`npm`

```bash
# 安装依赖（推荐：CI 和本地统一使用）
npm ci

# 或：日常开发快速安装（会按 semver 更新依赖）
npm install
```

## 文档维护流程

推荐按以下顺序执行：

```bash
# 1) 修改文档内容
# 中文目录：docs/
# 英文目录：i18n/en/docusaurus-plugin-content-docs/current/

# 2) 仅重排 docs/ 下 Markdown 文件编号（按需）
npm run renumber-docs-md

# 3) 重排 docs/ 下目录 + Markdown 编号（按需，影响较大，谨慎执行）
node scripts/renumber-docs-and-folders.js

# 4) 重排英文目录（可选，只有英文目录也需要调整时执行）
node scripts/renumber-docs-and-folders.js i18n/en/docusaurus-plugin-content-docs/current

# 5) 修复 docs/ 下受重命名影响的相对 Markdown 链接（按需）
npm run fix-relative-docs-links

# 6) 生成/更新侧边栏范围配置
npm run generate-sidebar-config

# 7) 本地预览（中文）
npm run start

# 8) 本地预览（英文）
npm run start:en

# 9) 提交前执行完整构建校验
npm run build

# 10) 本地托管 build 产物进行验证
npm run serve
```

## 维护常用命令

### 内容与结构维护

```bash
# 谨慎执行以下操作

# 按 sidebar_position 重排 docs/ 下 Markdown 编号
npm run renumber-docs-md

# 重排目录 + Markdown，并尝试批量修复仓库路径引用
node scripts/renumber-docs-and-folders.js

# 重排英文文档目录（可选）
node scripts/renumber-docs-and-folders.js i18n/en/docusaurus-plugin-content-docs/current

# 修复 docs/ 下受重命名影响的相对链接
npm run fix-relative-docs-links

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



### CI 自动部署

仓库内已配置两条工作流：

1. `Deploy Docusaurus site to GitHub Pages`（`.github/workflows/deploy.yml`）  
   - 触发：`main` 分支 push 或手动触发  
   - 执行：安装依赖、构建、发布到 `gh-pages`

2. `Sync gh-pages to OSS`（`.github/workflows/sync-gh-pages.yml`）  
   - 触发：Pages 部署工作流成功后  
   - 执行：将 `gh-pages` 内容同步到 OSS

