import React from 'react';
import OriginalDocSidebar from '@theme-original/DocSidebar';
import {useDocScopeFilter} from '@site/src/context/DocScopeFilterContext';
import {processSidebarForDisplay} from '@site/src/utils/sidebar-processing';

export default function DocSidebar(props) {
  const {version, product} = useDocScopeFilter();
  const sidebar = props.sidebar;
  let processedSidebar;

  if (Array.isArray(sidebar)) {
    processedSidebar = processSidebarForDisplay(sidebar, version, product);
  } else if (sidebar && sidebar.items) {
    processedSidebar = {
      ...sidebar,
      items: processSidebarForDisplay(sidebar.items, version, product),
    };
  } else {
    processedSidebar = sidebar;
  }

  return <OriginalDocSidebar {...props} sidebar={processedSidebar} />;
}
