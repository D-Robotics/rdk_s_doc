import React from 'react';
import {translate} from '@docusaurus/Translate';
import {PageMetadata} from '@docusaurus/theme-common';
import Layout from '@theme/Layout';
import NotFoundContent from '@theme/NotFound/Content';
import {useIsUrlEnglish} from '@site/src/utils/url-locale';

export default function Index() {
  const english = useIsUrlEnglish();
  const title = english
    ? 'Page Not Found'
    : translate({
        id: 'theme.NotFound.title',
        message: 'Page Not Found',
      });
  return (
    <>
      <PageMetadata title={title} />
      <Layout>
        <NotFoundContent />
      </Layout>
    </>
  );
}
