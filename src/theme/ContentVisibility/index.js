import React from 'react';
import {useLocation} from '@docusaurus/router';
import {UnlistedMetadata} from '@docusaurus/theme-common';
import Draft from '@theme/ContentVisibility/Draft';
import Unlisted from '@theme/ContentVisibility/Unlisted';

function isVersionHistoryPage(pathname) {
  return String(pathname || '').includes('/versions/');
}

export default function ContentVisibility({metadata}) {
  const location = useLocation();
  const {unlisted, frontMatter} = metadata;
  const showUnlisted = Boolean(unlisted || frontMatter?.unlisted);
  const hideUnlistedBanner = isVersionHistoryPage(location.pathname);

  return (
    <>
      {showUnlisted && hideUnlistedBanner && <UnlistedMetadata />}
      {showUnlisted && !hideUnlistedBanner && <Unlisted />}
      {frontMatter?.draft && <Draft />}
    </>
  );
}
