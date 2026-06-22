import React from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {useColorMode, useThemeConfig} from '@docusaurus/theme-common';

function LogoThemedImage({logo, alt, imageClassName}) {
  const {colorMode} = useColorMode();
  const src = useBaseUrl(
    colorMode === 'dark' && logo.srcDark ? logo.srcDark : logo.src,
  );
  const themedImage = (
    <img
      className={logo.className}
      src={src}
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

  const title = isEnglish ? 'Resource Center' : '资料中心';
  const docCenterUrl = isEnglish
    ? 'https://d-robotics.github.io/rdk_doc_center/en/'
    : 'https://developer.d-robotics.cc/rdk_doc_center/';

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
