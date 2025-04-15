'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { toast } from 'sonner';
import { getPendingApplications, processRequest } from '@/lib/firestore';
import type { UserData } from '@/lib/firestore';
import { Check, X, UserPlus, Search, Filter } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

export default function NewbiesPage() {
  const { userData } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<UserData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    if (!userData?.role || userData.role !== 'admin') {
      toast.error('Unauthorized access');
      router.push('/portals/admin');
      return;
    }

    fetchApplications();
  }, [userData, router]);

  const fetchApplications = async () => {
    try {
      const data = await getPendingApplications();
      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to fetch applications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplication = async (userId: string, status: 'accepted' | 'denied', message: string) => {
    try {
      await processRequest(userId, status, message, userData.id);
      toast.success(`Application ${status} successfully`);
      fetchApplications();
    } catch (error) {
      console.error('Error processing application:', error);
      toast.error('Failed to process application');
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.tenant_code?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = activeTab === 'all' ? true : app.applicationStatus === activeTab;
    return matchesSearch && matchesStatus;
  });

  if (!userData?.role || userData.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Student Applications</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-[300px]"
            />
          </div>
          <Badge variant="secondary" className="text-sm">
            {filteredApplications.length} applications
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="accepted">Approved</TabsTrigger>
          <TabsTrigger value="denied">Rejected</TabsTrigger>
          <TabsTrigger value="all">All Applications</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid gap-4">
            {filteredApplications.map((application) => (
              <Card key={application.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5" />
                        {application.full_name}
                      </CardTitle>
                      <div className="flex gap-2 mt-2">
                        <Badge variant={application.applicationStatus === 'accepted' ? 'default' : 
                                      application.applicationStatus === 'denied' ? 'destructive' : 
                                      'secondary'}>
                          {application.applicationStatus}
                        </Badge>
                        <Badge variant="outline">
                          {application.tenant_code}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedApplication(application);
                          setIsDialogOpen(true);
                        }}
                      >
                        View Details
                      </Button>
                      {application.applicationStatus === 'pending' && (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleApplication(application.id, 'accepted', 'Your application has been accepted. Welcome to our student accommodation!')}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Accept
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleApplication(application.id, 'denied', 'We regret to inform you that your application has been denied.')}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium mb-2">Personal Information</h3>
                      <div className="space-y-1 text-sm">
                        <p><strong>Email:</strong> {application.email}</p>
                        <p><strong>Phone:</strong> {application.phone || 'Not provided'}</p>
                        <p><strong>Applied on:</strong> {format(application.createdAt, 'PPP')}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Academic Information</h3>
                      <div className="space-y-1 text-sm">
                        <p><strong>Place of Study:</strong> {application.place_of_study}</p>
                        {application.requestDetails && (
                          <>
                            <p><strong>Accommodation Type:</strong> {application.requestDetails.accommodationType}</p>
                            <p><strong>Preferred Location:</strong> {application.requestDetails.location}</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-3">Personal Information</h3>
                  <div className="space-y-2">
                    <p><strong>Full Name:</strong> {selectedApplication.full_name}</p>
                    <p><strong>Email:</strong> {selectedApplication.email}</p>
                    <p><strong>Phone:</strong> {selectedApplication.phone || 'Not provided'}</p>
                    <p><strong>Tenant Code:</strong> {selectedApplication.tenant_code}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-3">Academic Information</h3>
                  <div className="space-y-2">
                    <p><strong>Place of Study:</strong> {selectedApplication.place_of_study}</p>
                    <p><strong>Room Number:</strong> {selectedApplication.room_number || 'Not assigned'}</p>
                  </div>
                </div>
              </div>
              {selectedApplication.requestDetails && (
                <div>
                  <h3 className="font-medium mb-3">Accommodation Preferences</h3>
                  <div className="space-y-2">
                    <p><strong>Type:</strong> {selectedApplication.requestDetails.accommodationType}</p>
                    <p><strong>Location:</strong> {selectedApplication.requestDetails.location}</p>
                    <p><strong>Date Submitted:</strong> {format(selectedApplication.requestDetails.dateSubmitted, 'PPP')}</p>
                  </div>
                </div>
              )}
              <div>
                <h3 className="font-medium mb-3">Application Status</h3>
                <div className="space-y-2">
                  <p><strong>Status:</strong> {selectedApplication.applicationStatus}</p>
                  <p><strong>Applied On:</strong> {format(selectedApplication.createdAt, 'PPP')}</p>
                  <p><strong>Last Updated:</strong> {format(selectedApplication.updatedAt, 'PPP')}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 