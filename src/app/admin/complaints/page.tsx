'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAllComplaints, updateComplaintStatus, assignStaffToComplaint } from '@/lib/firestore';
import { RequestActions } from '@/components/admin/RequestActions';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { RefreshCw, AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { RefreshButton } from '@/components/ui/refresh-button';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'in_progress':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'resolved':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'rejected':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-4 w-4" />;
    case 'in_progress':
      return <RefreshCw className="h-4 w-4" />;
    case 'resolved':
      return <CheckCircle className="h-4 w-4" />;
    case 'rejected':
      return <XCircle className="h-4 w-4" />;
    default:
      return <AlertCircle className="h-4 w-4" />;
  }
};

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [staffList, setStaffList] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const complaintsData = await getAllComplaints();
      setComplaints(complaintsData);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast.error('Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string, adminResponse?: string) => {
    try {
      await updateComplaintStatus(id, status as 'pending' | 'in_progress' | 'resolved' | 'rejected', adminResponse);
      await fetchComplaints();
      toast.success('Complaint status updated successfully');
    } catch (error) {
      console.error('Error updating complaint status:', error);
      toast.error('Failed to update complaint status');
    }
  };

  const handleAssignStaff = async (id: string, staffId: string) => {
    try {
      await assignStaffToComplaint(id, staffId);
      await fetchComplaints();
      toast.success('Staff assigned successfully');
    } catch (error) {
      console.error('Error assigning staff:', error);
      toast.error('Failed to assign staff');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Complaints Management</h1>
          <p className="text-muted-foreground">Review and manage student complaints</p>
        </div>
        <RefreshButton onClick={fetchComplaints} loading={loading} />
      </div>

      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                All Complaints
              </TabsTrigger>
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pending
              </TabsTrigger>
              <TabsTrigger value="in_progress" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                In Progress
              </TabsTrigger>
              <TabsTrigger value="resolved" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Resolved
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {complaints.map((complaint) => (
                <Card key={complaint.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{complaint.title}</h3>
                          <Badge className={getStatusColor(complaint.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(complaint.status)}
                              {complaint.status.replace('_', ' ')}
                            </div>
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Submitted by {complaint.userName} • Room {complaint.roomNumber}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(complaint.createdAt, 'PPP')}
                        </p>
                        <div className="bg-gray-50 p-3 rounded-md mt-2">
                          <p className="text-sm text-gray-600">{complaint.description}</p>
                        </div>
                        {complaint.adminResponse && (
                          <div className="bg-blue-50 p-3 rounded-md mt-2">
                            <p className="text-sm font-medium text-blue-800">Admin Response:</p>
                            <p className="text-sm text-blue-600 mt-1">{complaint.adminResponse}</p>
                          </div>
                        )}
                      </div>
                      <RequestActions
                        type="complaint"
                        data={complaint}
                        onStatusUpdate={handleStatusUpdate}
                        onAssignStaff={handleAssignStaff}
                        staffList={staffList}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="pending">
              {complaints
                .filter((complaint) => complaint.status === 'pending')
                .map((complaint) => (
                  <Card key={complaint.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{complaint.title}</h3>
                            <Badge className={getStatusColor(complaint.status)}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(complaint.status)}
                                {complaint.status.replace('_', ' ')}
                              </div>
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Submitted by {complaint.userName} • Room {complaint.roomNumber}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(complaint.createdAt, 'PPP')}
                          </p>
                          <div className="bg-gray-50 p-3 rounded-md mt-2">
                            <p className="text-sm text-gray-600">{complaint.description}</p>
                          </div>
                        </div>
                        <RequestActions
                          type="complaint"
                          data={complaint}
                          onStatusUpdate={handleStatusUpdate}
                          onAssignStaff={handleAssignStaff}
                          staffList={staffList}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </TabsContent>

            <TabsContent value="in_progress">
              {complaints
                .filter((complaint) => complaint.status === 'in_progress')
                .map((complaint) => (
                  <Card key={complaint.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{complaint.title}</h3>
                            <Badge className={getStatusColor(complaint.status)}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(complaint.status)}
                                {complaint.status.replace('_', ' ')}
                              </div>
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Submitted by {complaint.userName} • Room {complaint.roomNumber}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(complaint.createdAt, 'PPP')}
                          </p>
                          <div className="bg-gray-50 p-3 rounded-md mt-2">
                            <p className="text-sm text-gray-600">{complaint.description}</p>
                          </div>
                        </div>
                        <RequestActions
                          type="complaint"
                          data={complaint}
                          onStatusUpdate={handleStatusUpdate}
                          onAssignStaff={handleAssignStaff}
                          staffList={staffList}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </TabsContent>

            <TabsContent value="resolved">
              {complaints
                .filter((complaint) => complaint.status === 'resolved')
                .map((complaint) => (
                  <Card key={complaint.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{complaint.title}</h3>
                            <Badge className={getStatusColor(complaint.status)}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(complaint.status)}
                                {complaint.status.replace('_', ' ')}
                              </div>
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Submitted by {complaint.userName} • Room {complaint.roomNumber}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(complaint.createdAt, 'PPP')}
                          </p>
                          <div className="bg-gray-50 p-3 rounded-md mt-2">
                            <p className="text-sm text-gray-600">{complaint.description}</p>
                          </div>
                          {complaint.adminResponse && (
                            <div className="bg-blue-50 p-3 rounded-md mt-2">
                              <p className="text-sm font-medium text-blue-800">Admin Response:</p>
                              <p className="text-sm text-blue-600 mt-1">{complaint.adminResponse}</p>
                            </div>
                          )}
                        </div>
                        <RequestActions
                          type="complaint"
                          data={complaint}
                          onStatusUpdate={handleStatusUpdate}
                          onAssignStaff={handleAssignStaff}
                          staffList={staffList}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
