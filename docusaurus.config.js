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
import remarkGenerateSidebarConfig from "./src/remark/remark-generate-sidebar-config.js";

const buildProduct = process.env.DOC_BUILD_PRODUCT?.trim() || "";
const buildVersion = process.env.DOC_BUILD_VERSION?.trim() || "";

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "RDK S DOC",
  // tagline: 'Dinosaurs are cool',
  favicon: "img/logo.png",
  // Set the production url of your site here
  // url: "https://developer.d-robotics.cc",
  url: "https://liqinglian01.github.io/",
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
  },

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "liqinglian01", // Usually your GitHub org/user name.
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
    // Dify Chatbot Configuration
    {
      src: "/rdk_s_doc/js/dify-config.js",
    },
    {
      src: "https://rdk.d-robotics.cc/embed.min.js",
      id: "MltLQTHPb5EeP7uz",
      defer: true,
    },
  ],
  headTags: [
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
        "data-website-id": "fbd84605-92b5-43f6-aa3e-4861b62ea8df",
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
          remarkPlugins: [remarkDirective, remarkDocScope, remarkGenerateSidebarConfig],

          
        },
        blog: { showReadingTime: true },
        pages: { exclude: ["/imager/**", "**/dl/**"] },
        theme: { customCss: "./src/css/custom.css" },
        sitemap: { lastmod: "date" },
      }),
    ],
  ],
  plugins: [
  
  ],
  markdown: {
    mermaid: true,
  },
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: "img/docusaurus-social-card.jpg",
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
            href: "https://developer.d-robotics.cc/",
            label: "Community",
            position: "left",
          },

          {
            href: "https://github.com/D-Robotics",
            label: "GitHub",
            position: "right",
          },
          // add by xgs for translate show
          {
            type: "localeDropdown",
            position: "right",
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
                label: "BiLiBiLi",
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
        copyright: `Copyright © ${new Date().getFullYear()} D-Robotics.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
  themes: ["@docusaurus/theme-mermaid"],
};

export default config;
