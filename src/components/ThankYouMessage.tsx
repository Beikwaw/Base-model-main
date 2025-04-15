import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { CheckCircle } from 'lucide-react';

interface ThankYouMessageProps {
  title: string;
  message: string;
  onClose: () => void;
}

export function ThankYouMessage({ title, message, onClose }: ThankYouMessageProps) {
  return (
    <Card className="bg-green-50 border-green-200">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CheckCircle className="h-6 w-6 text-green-500" />
          <CardTitle className="text-green-700">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-green-600">{message}</p>
        <button
          onClick={onClose}
          className="mt-4 text-sm text-green-600 hover:text-green-700 underline"
        >
          Close
        </button>
      </CardContent>
    </Card>
  );
} 