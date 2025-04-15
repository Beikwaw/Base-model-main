'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { getMySleepoverRequests } from '@/lib/firestore';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function SleepoverHistoryPage() {
  const { userData } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, [userData]);

  const fetchRequests = async () => {
    try {
      const data = await getMySleepoverRequests(userData?.id || '');
      setRequests(data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to fetch requests');
    } finally {
      setIsLoading(false);
    }
  };

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Sleepover Request History</h1>
        </div>
      </div>

      <div className="grid gap-4">
        {requests.map((request) => (
          <Card key={request.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Sleepover Request</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  request.status === 'approved' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <p><strong>Guest Name:</strong> {request.guestName}</p>
                <p><strong>Date:</strong> {format(new Date(request.date), 'PPP')}</p>
                <p><strong>Reason:</strong> {request.reason}</p>
                <p><strong>Submitted:</strong> {format(new Date(request.createdAt), 'PPP p')}</p>
                {request.updatedAt && (
                  <p><strong>Last Updated:</strong> {format(new Date(request.updatedAt), 'PPP p')}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {requests.length === 0 && !isLoading && (
          <Card>
            <CardContent className="py-6">
              <p className="text-center text-muted-foreground">
                No sleepover request history found
              </p>
            </CardContent>
          </Card>
        )}

        {isLoading && (
          <Card>
            <CardContent className="py-6">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 