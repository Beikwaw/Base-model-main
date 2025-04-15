'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Megaphone, 
  Calendar, 
  Wrench, 
  AlertCircle, 
  LogOut, 
  User,
  UserPlus
} from 'lucide-react';
import { getMyComplaints, getMyGuestRequests, getMySleepoverRequests, getMyMaintenanceRequests, getAnnouncements } from '@/lib/firestore';
import { AnnouncementPopup } from "@/components/AnnouncementPopup";
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import ContactInfo from '@/components/ContactInfo';

interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  expiresAt?: Date;
  priority: 'low' | 'medium' | 'high';
}

export default function DashboardPage() {
  const { userData, logout } = useAuth();
  const router = useRouter();
  const [myComplaintsCount, setMyComplaintsCount] = useState(0);
  const [isComplaintsZero, setIsComplaintsZero] = useState(false);
  const [myGuestRequestsCount, setMyGuestRequestsCount] = useState(0);
  const [isGuestRequestsZero, setIsGuestRequestsZero] = useState(false);
  const [mySleepoverRequestsCount, setMySleepoverRequestsCount] = useState(0);
  const [isSleepoverRequestsZero, setIsSleepoverRequestsZero] = useState(false);
  const [myMaintenanceRequestsCount, setMyMaintenanceRequestsCount] = useState(0);
  const [isMaintenanceRequestsZero, setIsMaintenanceRequestsZero] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  const navigationItems = [
    { href: '/student', label: 'Dashboard', icon: Home },
    { href: '/student/announcements', label: 'Announcements', icon: Megaphone },
    { href: '/student/sleepovers', label: 'Sleepover Requests', icon: Calendar },
    { href: '/student/maintenance', label: 'Maintenance Requests', icon: Wrench },
    { href: '/student/complaints', label: 'Complaints', icon: AlertCircle },
  ];

  useEffect(() => {
    if (userData) {
      if (userData.id) {
        getMyComplaints(userData.id).then(complaints => {
          setMyComplaintsCount(complaints.length);
        });
        getMyGuestRequests(userData.id).then(guestRequests => {
          setMyGuestRequestsCount(guestRequests.length);
        });
        getMySleepoverRequests(userData.id).then(sleepoverRequests => {
          setMySleepoverRequestsCount(sleepoverRequests.length);
        });
        getMyMaintenanceRequests(userData.id).then(maintenanceRequests => {
          setMyMaintenanceRequestsCount(maintenanceRequests.length);
        });
      }

      getAnnouncements().then(announcements => {
        // The timestamps are already converted in getAnnouncements
        setAnnouncements(announcements);
        setIsLoading(false);
      }).catch(error => {
        console.error('Error fetching announcements:', error);
        toast.error('Failed to fetch announcements');
        setIsLoading(false);
      });
    }

    if (myComplaintsCount === 0) {
      setIsComplaintsZero(true);
    }

    if (myGuestRequestsCount === 0) {
      setIsGuestRequestsZero(true);
    }

    if (mySleepoverRequestsCount === 0) {
      setIsSleepoverRequestsZero(true);
    }

    if (myMaintenanceRequestsCount === 0) {
      setIsMaintenanceRequestsZero(true);
    }
  }, [userData]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/portals/student');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <User className="h-6 w-6" />
              <h1 className="text-xl font-semibold">Student Portal</h1>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Welcome, {userData?.full_name}</h2>
          <p className="text-muted-foreground">
            Manage your accommodation requests and stay updated with announcements
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Complaints</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myComplaintsCount}</div>
              <p className="text-xs text-muted-foreground">
                Today's complaints
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Guest Requests</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myGuestRequestsCount}</div>
              <p className="text-xs text-muted-foreground">
                Today's guest requests
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sleepover Requests</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mySleepoverRequestsCount}</div>
              <p className="text-xs text-muted-foreground">
                Today's sleepover requests
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Maintenance Requests</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myMaintenanceRequestsCount}</div>
              <p className="text-xs text-muted-foreground">
                Today's maintenance requests
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {navigationItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {item.label === 'Dashboard' ? 'View your dashboard and recent activity' :
                     item.label === 'Announcements' ? 'View important announcements and updates' :
                     item.label === 'Sleepover Requests' ? 'Submit or view sleepover requests' :
                     item.label === 'Maintenance Requests' ? 'Submit or view maintenance requests' :
                     'Submit or view complaints'}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Contact Information */}
        <ContactInfo />

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <Link 
              href="/student/sleepovers" 
              className="block text-blue-600 hover:text-blue-800"
            >
              View Sleepover Requests
            </Link>
            <Link 
              href="/student/guests" 
              className="block text-blue-600 hover:text-blue-800"
            >
              View Guest History
            </Link>
            <Link 
              href="/student/maintenance" 
              className="block text-blue-600 hover:text-blue-800"
            >
              View Maintenance Requests
            </Link>
            <Link 
              href="/student/complaints" 
              className="block text-blue-600 hover:text-blue-800"
            >
              View Complaints
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}