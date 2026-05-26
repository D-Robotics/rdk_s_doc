/**
 * CLI：生成侧边栏可见性配置到 .docusaurus/（供 watch 脚本与 build:scope 使用）。
 */
const path = require('path');
const {
  getGeneratedSidebarConfigPath,
  buildAndWriteSidebarScopeConfig,
} = require('./lib/sidebar-scope-config-generator');

const siteDir = path.join(__dirname, '..');
const configFilePath = getGeneratedSidebarConfigPath(siteDir);
const docsDir = process.env.DOCS_OVERRIDE_DIR
  ? path.resolve(siteDir, process.env.DOCS_OVERRIDE_DIR)
  : path.join(siteDir, 'docs');
const i18nEnDocsCurrentDir = path.join(
  siteDir,
  'i18n/en/docusaurus-plugin-content-docs/current',
);

buildAndWriteSidebarScopeConfig({
  configFilePath,
  docsDir,
  i18nEnDocsCurrentDir,
  siteDir,
  verbose: true,
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
