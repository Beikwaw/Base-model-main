'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw } from "lucide-react";
import { getAllGuestRequests } from '@/lib/firestore';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { RefreshButton } from '@/components/ui/refresh-button';

const formatDate = (date: any) => {
  if (!date) return 'N/A';
  if (date.toDate) {
    // Handle Firestore Timestamp
    return format(date.toDate(), 'PPP p');
  }
  // Handle ISO string or regular Date object
  return format(new Date(date), 'PPP p');
};

export default function GuestsPage() {
  const [guestRequests, setGuestRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGuestRequests();
  }, []);

  const fetchGuestRequests = async () => {
    try {
      setLoading(true);
      const requests = await getAllGuestRequests();
      setGuestRequests(requests);
    } catch (error) {
      console.error('Error fetching guest requests:', error);
      toast.error('Failed to fetch guest requests');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const activeGuests = guestRequests.filter(request => request.status === 'active');
  const checkedOutGuests = guestRequests.filter(request => request.status === 'rejected');

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Guest Management</h1>
        <RefreshButton onClick={fetchGuestRequests} loading={loading} />
      </div>

      <Tabs defaultValue="active">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">Active Guests ({activeGuests.length})</TabsTrigger>
          <TabsTrigger value="checked-out">Checked Out Guests ({checkedOutGuests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeGuests.map((request) => (
            <Card key={request.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Guest Details</h3>
                      <Badge variant="default" className="bg-green-500">Active</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Guest Name</p>
                        <p className="font-medium">{request.firstName} {request.lastName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone Number</p>
                        <p className="font-medium">{request.phoneNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Purpose</p>
                        <p className="font-medium">{request.purpose}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Check-in Date</p>
                        <p className="font-medium">{formatDate(request.fromDate)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Check-in Time</p>
                        <p className="font-medium">{formatDate(request.checkInTime)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Student Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Room Number</p>
                        <p className="font-medium">{request.roomNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tenant Code</p>
                        <p className="font-medium">{request.tenantCode}</p>
                      </div>
                    </div>
                    {request.additionalGuests && request.additionalGuests.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold mb-2">Additional Guests</h4>
                        {request.additionalGuests.map((guest: any, index: number) => (
                          <div key={index} className="mb-2 p-2 bg-gray-50 rounded">
                            <p className="text-sm">
                              {guest.firstName} {guest.lastName} - {guest.phoneNumber}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="checked-out" className="space-y-4">
          {checkedOutGuests.map((request) => (
            <Card key={request.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Guest Details</h3>
                      <Badge variant="destructive">Checked Out</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Guest Name</p>
                        <p className="font-medium">{request.firstName} {request.lastName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone Number</p>
                        <p className="font-medium">{request.phoneNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Purpose</p>
                        <p className="font-medium">{request.purpose}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Check-in Date</p>
                        <p className="font-medium">{formatDate(request.fromDate)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Check-in Time</p>
                        <p className="font-medium">{formatDate(request.checkInTime)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Check-out Time</p>
                        <p className="font-medium">{formatDate(request.checkOutTime)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Student Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Room Number</p>
                        <p className="font-medium">{request.roomNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tenant Code</p>
                        <p className="font-medium">{request.tenantCode}</p>
                      </div>
                    </div>
                    {request.additionalGuests && request.additionalGuests.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold mb-2">Additional Guests</h4>
                        {request.additionalGuests.map((guest: any, index: number) => (
                          <div key={index} className="mb-2 p-2 bg-gray-50 rounded">
                            <p className="text-sm">
                              {guest.firstName} {guest.lastName} - {guest.phoneNumber}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}