import React from 'react';

interface PolicySectionProps {
  title: string;
  items: string[];
}

export function PolicySection({ title, items }: PolicySectionProps) {
  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-700">
        By submitting this request, you agree to provide accurate information and understand that:
      </p>
      <ul className="list-disc list-inside text-sm text-gray-700 mt-2">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
} 