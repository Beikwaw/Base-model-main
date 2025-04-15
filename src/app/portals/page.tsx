'use client';

import Link from 'next/link';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, UserCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PortalsPage() {
  const router = useRouter();
  const { user, userData } = useAuth();

  // If already logged in, redirect to the appropriate dashboard
  useEffect(() => {
    if (userData) {
      if (userData.role === 'admin') {
        router.push('/admin');
      } else if (userData.role === 'student') {
        router.push('/student');
      }
    }
  }, [userData, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to home
        </Link>

        <Card className="mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Choose Portal</CardTitle>
            <CardDescription>
              Select the appropriate portal based on your role
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <Link href="/portals/student" className="w-full">
                <Button 
                  className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 h-16"
                  size="lg"
                >
                  <UserCircle className="h-5 w-5 mr-2" />
                  Student Portal
                </Button>
              </Link>
              
              <Link href="/portals/admin" className="w-full">
                <Button 
                  className="w-full flex items-center justify-center h-16"
                  size="lg"
                >
                  <Shield className="h-5 w-5 mr-2" />
                  Admin Portal
                </Button>
              </Link>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-500">
              Don't have an account? <Link href="/register" className="text-primary hover:underline">Register here</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 