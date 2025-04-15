'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { getAnnouncements } from '@/lib/firestore';
import type { Announcement } from '@/types/announcement';
import { AnnouncementPopup } from '@/components/AnnouncementPopup';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const fetchedAnnouncements = await getAnnouncements();
        setAnnouncements(fetchedAnnouncements);
      } catch (error) {
        console.error('Error fetching announcements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Announcements</h1>
      </div>

      <div className="grid gap-4">
        {announcements.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No announcements available.</p>
            </CardContent>
          </Card>
        ) : (
          announcements.map((announcement) => (
            <Card 
              key={announcement.id}
              className="cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => setSelectedAnnouncement(announcement)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <span className={`inline-block w-2 h-2 rounded-full ${
                    announcement.priority === 'high' ? 'bg-red-500' :
                    announcement.priority === 'medium' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`} />
                  {announcement.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-2">
                  Posted by {announcement.createdByName} on{' '}
                  {format(announcement.createdAt, 'PPP')}
                  {announcement.expiresAt && (
                    <span className="ml-2">
                      • Expires: {format(announcement.expiresAt, 'PPP')}
                    </span>
                  )}
                </div>
                <p className="line-clamp-2">{announcement.content}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {selectedAnnouncement && (
        <AnnouncementPopup
          announcement={selectedAnnouncement}
          isOpen={!!selectedAnnouncement}
          onClose={() => setSelectedAnnouncement(null)}
        />
      )}
    </div>
  );
} 