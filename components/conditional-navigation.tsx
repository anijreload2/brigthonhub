'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navigation } from './navigation/navigation';

export function ConditionalNavigation() {
  const pathname = usePathname();
  
  // Don't show navigation on homepage since it has integrated header
  if (pathname === '/') {
    return null;
  }
  
  return <Navigation />;
}
