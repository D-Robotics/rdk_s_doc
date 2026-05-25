[English](./README_EN.md) | 简体中文


## 1. 依赖安装

### 环境要求

- Node.js >= 18
- npm（随 Node.js 安装）

### 安装方式

首次拉取或日常本地开发：

```bash
npm install
```

CI 或需要严格锁定依赖版本时：

```bash
npm ci
```

## 2. 文档维护流程

1. 修改中文文档：`docs/`
2. 修改英文文档：`i18n/en/docusaurus-plugin-content-docs/current/`
3. 若改动了显示范围（`sidebar_versions`、`sidebar_products`、`_sidebar_scope.json`、`DocScope`），执行一次配置生成：

   ```bash
   npm run generate-sidebar-config
   ```

   或执行：

  ```bash
   npm run start
  ```


4. 本地预览验证（中文或英文）：
   - 中文：`npm run start`
   - 英文：`npm run start:en`
5. 提交前做完整构建检查：

   ```bash
   npm run build
   ```

6. 需要本地查看构建产物时：

   ```bash
   npm run serve
   ```

## 3. 维护常用命令

| 命令 | 用途 |
|---|---|
| `npm run generate-sidebar-config` | 手动生成侧边栏显示范围配置 |
| `npm run watch-sidebar-config` | 监听文档变化并自动更新范围配置 |
| `npm run start` | 本地启动中文文档开发服务（含配置监听） |
| `npm run start:en` | 本地启动英文文档开发服务（含配置监听） |
| `npm run start:no-watch` | 本地启动中文文档（不监听配置变化） |
| `npm run start:no-watch:en` | 本地启动英文文档（不监听配置变化） |
| `npm run start:port` | 在 3001 端口启动中文文档（含配置监听） |
| `npm run build` | 生产构建（含侧边栏配置生成） |
| `npm run serve` | 本地预览 build 产物 |
| `npm run deploy` | 构建并部署到 GitHub Pages |

