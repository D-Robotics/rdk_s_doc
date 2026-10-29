import React from 'react';
import {useThemeConfig} from '@docusaurus/theme-common';
import FooterLinks from '@theme/Footer/Links';
import FooterLogo from '@theme/Footer/Logo';
import FooterCopyright from '@theme/Footer/Copyright';
import FooterLayout from '@theme/Footer/Layout';
import enFooterTranslations from '@site/i18n/en/docusaurus-theme-classic/footer.json';
import {useIsUrlEnglish} from '@site/src/utils/url-locale';

/**
 * 根目录 404.html 用默认语言（zh-Hans）预渲染，英文 URL 下页脚同样是中文。
 * 这里在英文路径上复用 i18n/en 的页脚翻译，让整块页脚显示英文。
 * 英文构建里 footer 已是英文，查不到对应 key 时会回退原值，重复执行无副作用。
 */
function translateFooter(footer, translations) {
  if (!footer.links) {
    return {
      ...footer,
      copyright: translations.copyright?.message ?? footer.copyright,
    };
  }

  const isMultiColumn = footer.links.some((link) => 'title' in link);
  const links = isMultiColumn
    ? footer.links.map((column) => ({
        ...column,
        title:
          translations[`link.title.${column.title}`]?.message ?? column.title,
        items: column.items.map((item) => ({
          ...item,
          label:
            translations[`link.item.label.${item.label}`]?.message ??
            item.label,
        })),
      }))
    : footer.links.map((link) => ({
        ...link,
        label:
          translations[`link.item.label.${link.label}`]?.message ?? link.label,
      }));

  return {
    ...footer,
    links,
    copyright: translations.copyright?.message ?? footer.copyright,
  };
}

function Footer() {
  const {footer} = useThemeConfig();
  const english = useIsUrlEnglish();

  if (!footer) {
    return null;
  }

  const {copyright, links, logo, style} = english
    ? translateFooter(footer, enFooterTranslations)
    : footer;

  return (
    <FooterLayout
      style={style}
      links={links && links.length > 0 && <FooterLinks links={links} />}
      logo={logo && <FooterLogo logo={logo} />}
      copyright={copyright && <FooterCopyright copyright={copyright} />}
    />
  );
}

export default React.memo(Footer);
