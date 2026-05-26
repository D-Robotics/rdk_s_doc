const path = require('path');
const {
  GENERATED_SIDEBAR_CONFIG_ALIAS,
  GENERATED_SIDEBAR_CONFIG_FILENAME,
  buildAndWriteSidebarScopeConfig,
} = require('../../../scripts/lib/sidebar-scope-config-generator');

/** @param {import('@docusaurus/types').LoadContext} context */
function sidebarScopeConfigPlugin(context) {
  const configFilePath = path.join(
    context.generatedFilesDir,
    GENERATED_SIDEBAR_CONFIG_FILENAME,
  );

  function resolveDocsDir() {
    const override = process.env.DOCS_OVERRIDE_DIR?.trim();
    if (override) {
      return path.resolve(context.siteDir, override);
    }
    return path.join(context.siteDir, 'docs');
  }

  return {
    name: 'sidebar-scope-config-plugin',

    async loadContent() {
      const docsDir = resolveDocsDir();
      const i18nEnDocsCurrentDir = path.join(
        context.siteDir,
        'i18n/en/docusaurus-plugin-content-docs/current',
      );

      await buildAndWriteSidebarScopeConfig({
        configFilePath,
        docsDir,
        i18nEnDocsCurrentDir,
        siteDir: context.siteDir,
        verbose: false,
      });
    },

    configureWebpack() {
      return {
        resolve: {
          alias: {
            [GENERATED_SIDEBAR_CONFIG_ALIAS]: configFilePath,
          },
        },
      };
    },
  };
}

module.exports = sidebarScopeConfigPlugin;
