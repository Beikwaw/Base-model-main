'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import type { Announcement } from "@/types/announcement";

interface AnnouncementPopupProps {
  announcement: Announcement;
  isOpen: boolean;
  onClose: () => void;
}

export function AnnouncementPopup({ announcement, isOpen, onClose }: AnnouncementPopupProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className={`inline-block w-2 h-2 rounded-full ${
              announcement.priority === 'high' ? 'bg-red-500' :
              announcement.priority === 'medium' ? 'bg-yellow-500' :
              'bg-green-500'
            }`} />
            {announcement.title}
          </DialogTitle>
        </DialogHeader>
        <div className="text-sm text-muted-foreground mb-4">
          Posted by {announcement.createdByName} on{' '}
          {format(announcement.createdAt, 'PPP')}
          {announcement.expiresAt && (
            <span className="ml-2">
              • Expires: {format(announcement.expiresAt, 'PPP')}
            </span>
          )}
        </div>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {announcement.content}
        </div>
      </DialogContent>
    </Dialog>
  );
} 