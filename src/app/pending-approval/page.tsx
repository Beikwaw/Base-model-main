'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClockIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';
import Link from 'next/link';

export default function PendingApprovalPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<'pending' | 'accepted' | 'denied'>('pending');

  useEffect(() => {
    // If user is not authenticated, redirect to login
    if (!loading && !user) {
      router.push('/portals/student');
      return;
    }

    // If user is not a newbie, redirect to student dashboard
    if (!loading && userData && userData.role !== 'newbie') {
      router.push('/student');
      return;
    }

    // Get application status
    if (userData?.applicationStatus) {
      setStatus(userData.applicationStatus as 'pending' | 'accepted' | 'denied');
    }
  }, [user, userData, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const statusDisplay = {
    pending: {
      icon: <ClockIcon className="h-16 w-16 text-amber-500" />,
      title: 'Application Under Review',
      description: 'Your application is currently being reviewed by our administrators. This process typically takes 1-2 business days.',
      colorClass: 'bg-amber-50 border-amber-200',
    },
    accepted: {
      icon: <CheckCircleIcon className="h-16 w-16 text-green-500" />,
      title: 'Application Approved',
      description: 'Your application has been approved! You can now access the student dashboard.',
      colorClass: 'bg-green-50 border-green-200',
    },
    denied: {
      icon: <XCircleIcon className="h-16 w-16 text-red-500" />,
      title: 'Application Denied',
      description: 'Unfortunately, your application has been denied. Please contact administration for more information.',
      colorClass: 'bg-red-50 border-red-200',
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className={`border-2 shadow-lg ${statusDisplay[status].colorClass}`}>
          <CardHeader className="text-center pb-2">
            <div className="mx-auto flex justify-center my-4">
              {statusDisplay[status].icon}
            </div>
            <CardTitle className="text-2xl font-bold">{statusDisplay[status].title}</CardTitle>
            <CardDescription className="text-base">
              {statusDisplay[status].description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="rounded-lg bg-white p-4 shadow-sm">
                <h3 className="font-medium">Application Details</h3>
                <div className="mt-2 text-sm text-gray-600 space-y-1">
                  <p>Name: {userData?.name}</p>
                  <p>Email: {userData?.email}</p>
                  <p>Status: <span className="font-medium">{status.charAt(0).toUpperCase() + status.slice(1)}</span></p>
                  <p>Submitted: {userData?.createdAt?.toLocaleDateString()}</p>
                </div>
              </div>
              
              {status === 'accepted' && (
                <Button className="w-full" asChild>
                  <Link href="/student">Continue to Dashboard</Link>
                </Button>
              )}
              
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => {
                  localStorage.removeItem('token');
                  router.push('/');
                }}
              >
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Need help? Contact our support team at <a href="mailto:support@mydomainliving.com" className="text-primary hover:underline">support@mydomainliving.com</a></p>
        </div>
      </div>
    </div>
  );
} 