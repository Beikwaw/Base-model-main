'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { NotificationsDropdown } from './NotificationsDropdown';
import { ChatDialog } from './ChatDialog';

const links = [
  { href: '/student', label: 'Dashboard' },
  { href: '/student/maintenance', label: 'Maintenance' },
  { href: '/student/complaints', label: 'Complaints' },
  { href: '/student/sleepovers', label: 'Sleepovers' },
  { href: '/student/guests', label: 'Guests' },
  { href: '/student/settings', label: 'Settings' },
];

export function StudentNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            'text-sm font-medium transition-colors hover:text-primary',
            pathname === link.href
              ? 'text-primary'
              : 'text-muted-foreground'
          )}
        >
          {link.label}
        </Link>
      ))}
      <div className="flex items-center space-x-2 ml-auto">
        <NotificationsDropdown />
        <ChatDialog />
      </div>
    </nav>
  );
} 