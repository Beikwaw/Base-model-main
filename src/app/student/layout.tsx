'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { Shield, Menu, Home, Settings, LogOut, Wrench, AlertCircle, Users, Calendar, Megaphone, Building } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from 'next/link';
import { NotificationsDropdown } from '@/components/NotificationsDropdown';
import { ChatDialog } from '@/components/ChatDialog';
import { ApplicantDetails } from '@/components/ApplicantDetails';
import BG from '@/assets/user-bg.jpg'

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, userData: rawUserData, logout, loading } = useAuth();
  const userData = rawUserData ? { ...rawUserData, applicationStatus: (rawUserData.applicationStatus as 'pending' | 'accepted' | 'denied') || 'pending' } : null;
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileScreen, setIsMobileScreen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showApplicantDetails, setShowApplicantDetails] = useState(false);

  useEffect(() => {
    // If user is not logged in, redirect to login
    if (!loading && !user) {
      router.push('/portals/student');
      return;
    }

    // If user is a newbie, redirect to pending approval page
    if (!loading && userData && userData.role === 'newbie') {
      router.push('/pending-approval');
      return;
    }

    // If user is not a student (e.g. admin), redirect to login
    if (!loading && userData && userData.role !== 'student') {
      router.push('/portals/student');
      return;
    }

    const handleResize = () => {
      setIsMobileScreen(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [user, userData, loading, router]);

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (userData.role !== 'student') {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/portals/student');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const toggleApplicantDetails = () => {
    setShowApplicantDetails(!showApplicantDetails);
  };

  const isActiveLink = (href: string) => pathname === href;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky flex px-5 items-center justify-center top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {isMobileScreen ? (
          <div className='flex flex-row items-center w-full'>
            <Menu className="h-6 w-6" onClick={() => setShowSidebar(!showSidebar)} />
            <div className="flex items-center space-x-4">
              <Button variant="ghost">
                <Shield className="h-6 w-6" />
              </Button>
              <span className="font-bold text-xl">MDO Student Living</span>
            </div>
          </div>
        ) : (
          <div className="flex h-16 items-center justify-between w-full">
            <div className="flex items-center space-x-4">
              <div className="bg-primary rounded-full w-8 h-8 flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-xl">My Domain Student Living</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">
                {user?.email}
              </div>
              <Avatar>
                <AvatarImage src={user?.photoURL || undefined} />
                <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </header>
      
      <div className="flex-1 flex">
        {isMobileScreen && showSidebar ? (
          <>
            <aside className="fixed top-0 left-0 w-[70%] h-full z-50 border-r bg-background">
              <nav className="space-y-1 p-4">
                <Link href="/student">
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${isActiveLink('/student') ? 'bg-black text-white hover:bg-gray-800 hover:text-gray-300' : ''}`}
                    onClick={() => setShowSidebar(false)}
                  >
                    <Home className={`mr-2 h-4 w-4 ${isActiveLink('/student') ? 'text-white hover:text-black' : ''}`} />
                    Dashboard
                  </Button>
                </Link>
                <Link href="/student/announcements">
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${isActiveLink('/student/announcements') ? 'bg-black text-white hover:bg-gray-800 hover:text-gray-300' : ''}`}
                    onClick={() => setShowSidebar(false)}
                  >
                    <Megaphone className={`mr-2 h-4 w-4 ${isActiveLink('/student/announcements') ? 'text-white hover:text-black' : ''}`} />
                    Announcements
                  </Button>
                </Link>
                <Link href="/student/guests">
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${isActiveLink('/student/guests') ? 'bg-black text-white hover:bg-gray-800 hover:text-gray-300' : ''}`}
                    onClick={() => setShowSidebar(false)}
                  >
                    <Users className={`mr-2 h-4 w-4 ${isActiveLink('/student/guests') ? 'text-white hover:text-black' : ''}`} />
                    Guest Sign-In
                  </Button>
                </Link>
                <Link href="/student/sleepovers">
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${isActiveLink('/student/sleepovers') ? 'bg-black text-white hover:bg-gray-800 hover:text-gray-300' : ''}`}
                    onClick={() => setShowSidebar(false)}
                  >
                    <Calendar className={`mr-2 h-4 w-4 ${isActiveLink('/student/sleepovers') ? 'text-white hover:text-black' : ''}`} />
                    Sleepover Requests
                  </Button>
                </Link>
                <Link href="/student/maintenance">
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${isActiveLink('/student/maintenance') ? 'bg-black text-white hover:bg-gray-800 hover:text-gray-600' : ''}`}
                    onClick={() => setShowSidebar(false)}
                  >
                    <Wrench className={`mr-2 h-4 w-4 ${isActiveLink('/student/maintenance') ? 'text-white hover:text-black' : ''}`} />
                    Maintenance
                  </Button>
                </Link>
                <Link href="/student/complaints">
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${isActiveLink('/student/complaints') ? 'bg-black text-white hover:bg-gray-800 hover:text-gray-300' : ''}`}
                    onClick={() => setShowSidebar(false)}
                  >
                    <AlertCircle className={`mr-2 h-4 w-4 ${isActiveLink('/student/complaints') ? 'text-white hover:text-black' : ''}`} />
                    Complaints
                  </Button>
                </Link>
                <Separator className="my-4" />
                <Link href="/student/settings">
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${isActiveLink('/student/settings') ? 'bg-black text-white hover:bg-gray-800 hover:text-gray-300' : ''}`}
                    onClick={() => setShowSidebar(false)}
                  >
                    <Settings className={`mr-2 h-4 w-4 ${isActiveLink('/student/settings') ? 'text-white hover:text-black' : ''}`} />
                    Settings
                  </Button>
                </Link>
                <Button variant="ghost" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </nav>
            </aside>
            <div className="fixed top-0 right-0 w-[30%] h-full bg-black/40 z-40" onClick={() => setShowSidebar(false)}></div>
          </>
        ) : (
          !isMobileScreen && (
            <aside className="w-64 border-r bg-background">
              <nav className="space-y-1 p-4">
                <Link href="/student">
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${isActiveLink('/student') ? 'bg-black text-white hover:bg-gray-800 hover:text-gray-300' : ''}`}
                    onClick={() => setShowSidebar(false)}
                  >
                    <Home className={`mr-2 h-4 w-4 ${isActiveLink('/student') ? 'text-white hover:text-black' : ''}`} />
                    Dashboard
                  </Button>
                </Link>
                <Link href="/student/announcements">
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${isActiveLink('/student/announcements') ? 'bg-black text-white hover:bg-gray-800 hover:text-gray-300' : ''}`}
                    onClick={() => setShowSidebar(false)}
                  >
                    <Megaphone className={`mr-2 h-4 w-4 ${isActiveLink('/student/announcements') ? 'text-white hover:text-black' : ''}`} />
                    Announcements
                  </Button>
                </Link>
                <Link href="/student/guests">
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${isActiveLink('/student/guests') ? 'bg-black text-white hover:bg-gray-800 hover:text-gray-300' : ''}`}
                    onClick={() => setShowSidebar(false)}
                  >
                    <Users className={`mr-2 h-4 w-4 ${isActiveLink('/student/guests') ? 'text-white hover:text-black' : ''}`} />
                    Guest Sign-In
                  </Button>
                </Link>
                <Link href="/student/sleepovers">
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${isActiveLink('/student/sleepovers') ? 'bg-black text-white hover:bg-gray-800 hover:text-gray-300' : ''}`}
                    onClick={() => setShowSidebar(false)}
                  >
                    <Calendar className={`mr-2 h-4 w-4 ${isActiveLink('/student/sleepovers') ? 'text-white hover:text-black' : ''}`} />
                    Sleepover Requests
                  </Button>
                </Link>
                <Link href="/student/maintenance">
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${isActiveLink('/student/maintenance') ? 'bg-black text-white hover:bg-gray-800 hover:text-gray-600' : ''}`}
                    onClick={() => setShowSidebar(false)}
                  >
                    <Wrench className={`mr-2 h-4 w-4 ${isActiveLink('/student/maintenance') ? 'text-white hover:text-black' : ''}`} />
                    Maintenance
                  </Button>
                </Link>
                <Link href="/student/complaints">
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${isActiveLink('/student/complaints') ? 'bg-black text-white hover:bg-gray-800 hover:text-gray-300' : ''}`}
                    onClick={() => setShowSidebar(false)}
                  >
                    <AlertCircle className={`mr-2 h-4 w-4 ${isActiveLink('/student/complaints') ? 'text-white hover:text-black' : ''}`} />
                    Complaints
                  </Button>
                </Link>
                <Separator className="my-4" />
                <Link href="/student/settings">
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${isActiveLink('/student/settings') ? 'bg-black text-white hover:bg-gray-800 hover:text-gray-300' : ''}`}
                  >
                    <Settings className={`mr-2 h-4 w-4 ${isActiveLink('/student/settings') ? 'text-white hover:text-black' : ''}`} />
                    Settings
                  </Button>
                </Link>
              </nav>
            </aside>
          )
        )}
        <main className="flex-1 p-5 md:p-8" style={{ backgroundImage: `url(${BG.src})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
          {children}
          {showApplicantDetails && (
            <div className="absolute top-16 right-0 shadow-lg p-4 w-fit rounded-2xl">
              <ApplicantDetails userData={userData} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}