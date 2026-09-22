// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config
import "dotenv/config";
import { createRequire } from "module";
import { themes as prismThemes } from "prism-react-renderer";

const require = createRequire(import.meta.url);
import remarkDirective from "remark-directive";
import remarkDocScope from "./src/remark/remark-doc-scope.js";

const buildProduct = process.env.DOC_BUILD_PRODUCT?.trim() || "";
const buildVersion = process.env.DOC_BUILD_VERSION?.trim() || "";
const COPYRIGHT_START_YEAR = 2024;
const currentYear = new Date().getFullYear();
const copyrightYearLabel =
  currentYear > COPYRIGHT_START_YEAR
    ? `${COPYRIGHT_START_YEAR}-${currentYear}`
    : `${COPYRIGHT_START_YEAR}`;

const localePrefix = process.env.DOCUSAURUS_CURRENT_LOCALE === "en" ? "/en" : "";

// Windows / macOS 默认文件系统大小写不敏感，from 与 to 只差大小写的 redirect 会和真实
// 页面落到同一个路径，plugin-client-redirects 会以 "not supposed to override existing
// files" 中止构建（Bing 大小写 404 那 7 条全是这种）。生产构建在 Linux runner 和 OSS 上
// 大小写敏感，规则照常生效，因此仅在大小写不敏感的平台过滤掉这类 redirect。
const caseInsensitiveFs =
  process.platform === "win32" || process.platform === "darwin";
const isCaseOnlyRedirect = ({ from, to }) =>
  from.toLowerCase() === to.toLowerCase() && from !== to;

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "RDK S100/S600 DOC",
  // tagline: 'Dinosaurs are cool',
  favicon: "img/logo.png",
  // Set the production url of your site here
  // url: "https://developer.d-robotics.cc",
  url: "https://developer.d-robotics.cc",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/rdk_s_doc/",
  customFields: {
    docBuildScope:
      buildProduct && buildVersion
        ? {
            enabled: true,
            product: buildProduct,
            version: buildVersion,
          }
        : {
            enabled: false,
          },

          feedbackFloat: {
            enabled: true,
                questionnaireUrl: "https://horizonrobotics.feishu.cn/share/base/form/shrcnLQ9OfYQO03cebdkNfOmkCh",
                questionnaireUrlByLocale: {
                  "zh-Hans": "https://horizonrobotics.feishu.cn/share/base/form/shrcnLQ9OfYQO03cebdkNfOmkCh",
                  en: "https://horizonrobotics.feishu.cn/share/base/form/shrcnrLwiznJOrzZkV75fYD92He",
            },
            // 站点内路径规则（基于 baseUrl 之后的路径）：
            // - "/" 精确匹配中文首页
            // - "/en" 精确匹配英文首页
            // - "/*" 匹配全部页面
            // - "/en/*" 匹配英文全部页面
            showOnPathRules: ["/*"],
            hideOnPathRules: [],
          },
  },

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "D-Robotics", // Usually your GitHub org/user name.
  projectName: "rdk_s_doc", // Usually your repo name.

  // onBrokenLinks: 'throw',

  //add by xgs for build reduce bug
  onBrokenLinks: "warn", // 临时启用以检查失效链接（检查后改回 ignore）
  onBrokenMarkdownLinks: "warn",

  //add vy xgs for analysis
  scripts: [
    {
      src: "https://hm.baidu.com/hm.js?24dd63cad43b63889ea6bede5fd1ab9e",
      async: true,
    },
    // Dify：仅加载配置脚本；embed.min.js 在 body 就绪后由 dify-config.js 动态注入
    {
      src: "/rdk_s_doc/js/dify-config.js",
    },
    {
      src: `/rdk_s_doc${localePrefix}/js/umami-events.js`,
      defer: true,
    },
  ],
  headTags: [
    {
      tagName: "script",
      attributes: {},
      innerHTML:
        "window.difyChatbotConfig=window.difyChatbotConfig||{token:'rJYrxmxmjOkjEx2c',baseUrl:'https://rdk.d-robotics.cc',inputs:{},systemVariables:{},userVariables:{},dynamicScript:true};",
    },
    {
      tagName: "meta",
      attributes: {
        name: "algolia-site-verification",
        content: "7D2FA77E12885A7C",
      },
    },
    {
      tagName: "script",
      attributes: {
        defer: "defer",
        src: "https://cloud.umami.is/script.js",
        "data-website-id": "b0c771b8-947e-4fa4-8880-606ecab89c36",
      },
    },
  ],

  // add by xgs for translate
  i18n: {
    defaultLocale: "zh-Hans",
    locales: ["zh-Hans", "en"],
    localeConfigs: {
      en: {
        label: "EN",
        htmlLang: "en",
      },
      "zh-Hans": {
        label: "CN",
        htmlLang: "zh-Hans",
      },
    },
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          path: process.env.DOCS_OVERRIDE_DIR || "docs",
          routeBasePath: "/", // 修改默认文档路径
          sidebarPath: "./sidebars.js",
          showLastUpdateTime: true,
          remarkPlugins: [remarkDirective, remarkDocScope],

          
        },
        blog: { showReadingTime: true },
        pages: { exclude: ["/imager/**", "**/dl/**"] },
        theme: { customCss: "./src/css/custom.css" },
        sitemap: { lastmod: "date" },
      }),
    ],
  ],
  plugins: [
    require.resolve("./src/plugins/sidebar-scope-config-plugin"),
    [
      "docusaurus-plugin-copy-page-button",
      {
        // Match the requested dropdown actions in screenshot.
        enabledActions: ["copy", "view", "claude"],
        // Static .md routes are incompatible with OSS "append /index.html" rules.
        generateMarkdownRoutes: false,
      },
    ],
    "docusaurus-plugin-image-zoom",
    [
      "@docusaurus/plugin-client-redirects",
      {
        // Bing 大小写 404（小写→大写），2026-09-20。
        // from/to 都是 baseUrl（/rdk_s_doc/）之后的相对路径；i18n 下每个 locale 单独
        // build，plugin 用各自 baseUrl 拼 from/to，一份配置自动落 zh/en 两处，勿手写 /en/ 前缀。
        redirects: [
          { from: "/rdk", to: "/RDK" },
          { from: "/05_mcu_development", to: "/05_MCU_development" },
          { from: "/03_python_sample", to: "/03_Python_Sample" },
          { from: "/robot_development", to: "/Robot_development" },
          { from: "/03_s600_multimedia_application", to: "/03_S600_multimedia_application" },
          { from: "/basic_development", to: "/Basic_Development" },
          { from: "/ota", to: "/OTA" },
        ].filter((r) => !(caseInsensitiveFs && isCaseOnlyRedirect(r))),
      },
    ],
  ],
  markdown: {
    mermaid: true,
  },
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: "img/docusaurus-social-card.jpg",
      zoom: {
        selector: ".markdown img",
        background: {
          light: "rgba(255, 255, 255, 0.95)",
          dark: "rgba(30, 30, 30, 0.95)",
        },
        config: {
          margin: 24,
          scrollOffset: 80,
        },
      },
      // ✅ 新增：支持 h2 ~ h5 add by xgs for table of contents
    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 5,
    },
      navbar: {
        title: "D-Robotics",
        logo: {
          alt: "地瓜机器人 logo",
          src: "img/logo.png",
          // href: "https://d-robotics.cc/", // 修改为文档根路径
        },
        items: [
          {
            type: 'custom-DocScopeSelectors',
            position: 'left',
          },

          {
            href: (() => {
              if (process.env.DOCUSAURUS_CURRENT_LOCALE === "en") {
                return "https://developer.d-robotics.cc/en";
              }
              return "https://developer.d-robotics.cc/";
            })(),
            label: "Community",
            position: "left",
            className: "navbar-community-link",
          },

          {
            href: "https://github.com/D-Robotics",
            label: "GitHub",
            position: "right",
            className: "navbar-github-link",
          },
          // add by xgs for translate show
          {
            type: "localeDropdown",
            position: "right",
            className: "navbar-locale-switch",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "友情链接",
            items: [
              {
                label: "古月居",
                href: "https://www.guyuehome.com/",
              },
            ],
          },
          {
            title: "联系我们",
            items: [
              {
                label: "GitHub",
                href: "https://github.com/D-Robotics",
              },
              {
                label: "Bilibili",
                href: (() => {
                  if (process.env.DOCUSAURUS_CURRENT_LOCALE === "en") {
                    return "https://www.youtube.com/@D-Robotics";
                  }
                  return "https://space.bilibili.com/437998606";
                })(),
              },
            ],
          },
        ],
        copyright: `Copyright © ${copyrightYearLabel} D-Robotics.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
      algolia: {
        appId: "1VU781LYTV",
        apiKey: "fb65c6e54a52ce6fba0645bd2630e79b",
        indexName: "rdk_s_doc",
        contextualSearch: true,
        searchPagePath: "search",
      },
    }),
  themes: ["@docusaurus/theme-mermaid"],
};

export default config;
