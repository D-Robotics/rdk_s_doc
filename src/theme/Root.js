import React from 'react';
import { DocScopeFilterProvider } from '@site/src/context/DocScopeFilterContext';

export default function Root({ children }) {
  return (
    <DocScopeFilterProvider>
      {children}
    </DocScopeFilterProvider>
  );
}