export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  createdBy: string;
  createdByName: string;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'archived';
  expiresAt?: Date;
}

export interface FirestoreAnnouncement {
  id: string;
  title: string;
  content: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
  createdBy: string;
  createdByName: string;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'archived';
  expiresAt?: {
    seconds: number;
    nanoseconds: number;
  };
} 