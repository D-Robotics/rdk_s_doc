import React from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {useThemeConfig} from '@docusaurus/theme-common';
import ThemedImage from '@theme/ThemedImage';

function LogoThemedImage({logo, alt, imageClassName}) {
  const sources = {
    light: useBaseUrl(logo.src),
    dark: useBaseUrl(logo.srcDark || logo.src),
  };
  const themedImage = (
    <ThemedImage
      className={logo.className}
      sources={sources}
      height={logo.height}
      width={logo.width}
      alt={alt}
      style={logo.style}
    />
  );

  return imageClassName ? (
    <div className={imageClassName}>{themedImage}</div>
  ) : (
    themedImage
  );
}

export default function NavbarLogo() {
  const { i18n } = useDocusaurusContext();
  const isEnglish = i18n.currentLocale === 'en';
  const {
    navbar: {logo},
  } = useThemeConfig();

  const title = isEnglish ? 'Documentation Center' : '文档中心';
  const docCenterUrl = isEnglish
    ? 'https://liqinglian01.github.io/rdk_doc_manager/en/'
    : 'https://liqinglian01.github.io/rdk_doc_manager/';

  const fallbackAlt = logo?.alt ?? title;
  const alt = logo?.alt ?? fallbackAlt;

  return (
    <Link href={docCenterUrl} className="navbar__brand">
      {logo && (
        <LogoThemedImage
          logo={logo}
          alt={alt}
          imageClassName="navbar__logo"
        />
      )}
      <b className="navbar__title text--truncate">{title}</b>
    </Link>
  );
}
