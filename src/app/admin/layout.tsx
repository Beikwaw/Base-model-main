'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Shield, 
  LogOut, 
  Home, 
  Users, 
  AlertCircle, 
  Calendar, 
  Settings, 
  Wrench, 
  Menu, 
  Bell, 
  UserPlus,
  Clock,
  Building,
  Megaphone
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from 'next/link';
import { getAdminByUserId, AdminData } from '@/lib/firestore';

const hasAccessToPage = (adminType: AdminData['type'], page: string): boolean => {
  if (adminType === 'superadmin') return true;

  const accessMap: Record<AdminData['type'], string[]> = {
    'superadmin': ['', 'users', 'alerts', 'calendar', 'settings', 'tools', 'maintenance', 'security', 'complaints', 'guests', 'sleepovers', 'announcements', 'newbies'],
    'admin-maintenance': ['', 'maintenance', 'tools', 'complaints'],
    'admin-security': ['', 'security', 'guests', 'sleepovers'],
    'admin-complaints': ['', 'complaints', 'alerts'],
    'admin-guest-management': ['', 'guests', 'sleepovers', 'calendar'],
    'admin-finance': ['', 'finance', 'payments', 'reports']
  };

  const currentPage = page.toLowerCase();
  const allowedPages = accessMap[adminType]?.map(p => p.toLowerCase()) || [];
  return allowedPages.includes(currentPage);
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [isMobileScreen, setIsMobileScreen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!loading && user) {
        const admin = await getAdminByUserId(user.uid);
        if (!admin) {
          router.push('/portals/admin');
        } else {
          setAdminData(admin);
          
          // Redirect if trying to access unauthorized page
          const currentPath = pathname?.split('/')[2] || '';
          if (!hasAccessToPage(admin.type, currentPath)) {
            router.push('/admin');
          }
        }
      } else if (!loading && !user) {
        router.push('/portals/admin');
      }
    };

    checkAdminAccess();

    const handleResize = () => {
      setIsMobileScreen(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [user, loading, router, pathname]);

  if (loading || !adminData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/portals/admin');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const isActiveLink = (href: string) => pathname === href;

  // Base navigation items (dashboard is always available)
  const baseItems = [
    { href: '/admin', label: 'Dashboard', icon: Home },
    { href: '/admin/newbies', label: 'New Applications', icon: UserPlus },
    { href: '/admin/guests', label: 'Guest Sign-In', icon: UserPlus },
    { href: '/admin/sleepovers', label: 'Sleepover Requests', icon: Calendar },
    { href: '/admin/maintenance', label: 'Maintenance', icon: Wrench },
    { href: '/admin/complaints', label: 'Complaints', icon: AlertCircle },
    { href: '/admin/announcements', label: 'Announcements', icon: Megaphone },
  ];

  // Settings is always at the bottom
  const settingsItem = [
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  // Combine navigation items
  const allNavigationItems = [
    ...baseItems,
    ...(adminData.type === 'superadmin' ? settingsItem : [])
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          {isMobileScreen ? (
            <div className="flex items-center space-x-4">
              <Menu className="h-6 w-6" onClick={() => setShowSidebar(!showSidebar)} />
              <div className="bg-primary rounded-full w-8 h-8 flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-xl">My Domain Admin</span>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <div className="bg-primary rounded-full w-8 h-8 flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-xl">My Domain Admin</span>
            </div>
          )}
          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">
              {adminData.type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </div>
            <Avatar>
              <AvatarImage src={user?.photoURL || undefined} />
              <AvatarFallback>{adminData.name?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {isMobileScreen && showSidebar ? (
          <>
            <aside className="fixed top-0 left-0 w-[70%] h-full z-50 border-r bg-background">
              <nav className="space-y-1 p-4">
                {baseItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActiveLink(item.href) ? "default" : "ghost"}
                      className={`w-full justify-start ${
                        isActiveLink(item.href)
                          ? 'bg-black text-white hover:bg-gray-800 hover:text-gray-300'
                          : ''
                      }`}
                      onClick={() => setShowSidebar(false)}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                ))}
                <div className="my-6 border-t" />
                {settingsItem.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActiveLink(item.href) ? "default" : "ghost"}
                      className={`w-full justify-start ${
                        isActiveLink(item.href)
                          ? 'bg-black text-white hover:bg-gray-800 hover:text-gray-300'
                          : ''
                      }`}
                      onClick={() => setShowSidebar(false)}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </nav>
            </aside>
            <div
              className="fixed top-0 right-0 w-[30%] h-full bg-black/40 z-40"
              onClick={() => setShowSidebar(false)}
            ></div>
          </>
        ) : (
          !isMobileScreen && (
            <aside className="w-64 border-r bg-background">
              <nav className="space-y-1 p-4">
                {baseItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActiveLink(item.href) ? "default" : "ghost"}
                      className={`w-full justify-start ${
                        isActiveLink(item.href)
                          ? 'bg-black text-white hover:bg-gray-800 hover:text-gray-300'
                          : ''
                      }`}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                ))}
                <div className="my-6 border-t" />
                {settingsItem.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActiveLink(item.href) ? "default" : "ghost"}
                      className={`w-full justify-start ${
                        isActiveLink(item.href)
                          ? 'bg-black text-white hover:bg-gray-800 hover:text-gray-300'
                          : ''
                      }`}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </nav>
            </aside>
          )
        )}
        <main className="flex-1 p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}