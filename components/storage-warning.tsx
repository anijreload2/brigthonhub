'use client';

import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface StorageWarningProps {
  isVisible: boolean;
}

export function StorageWarning({ isVisible }: StorageWarningProps) {
  if (!isVisible) return null;

  return (
    <Alert className="mb-4 border-orange-200 bg-orange-50">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-800">
        <strong>Notice:</strong> Your browser's tracking prevention is blocking storage access. 
        You may need to log in again if you refresh the page. For a better experience, 
        consider adding this site to your browser's exceptions or disabling strict tracking prevention.
      </AlertDescription>
    </Alert>
  );
}
