import React from 'react';
import Layout from '@theme-original/Layout';
import FeedbackFloat from '@site/src/components/FeedbackFloat';

export default function LayoutWrapper(props) {
  return (
    <>
      <Layout {...props} />
      <FeedbackFloat />
    </>
  );
}
