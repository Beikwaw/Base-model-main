'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Calendar, Phone, Home, User, RefreshCw, Check, X } from "lucide-react";
import { getAllSleepoverRequests, updateSleepoverStatus } from '@/lib/firestore';
import { toast } from 'sonner';
import { format } from 'date-fns';

const formatDate = (date: any) => {
  if (!date) return 'N/A';
  if (date.toDate) {
    return format(date.toDate(), 'PPP');
  }
  return format(new Date(date), 'PPP');
};

export default function SleepoverRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [actionType, setActionType] = useState<'approved' | 'rejected' | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const fetchedRequests = await getAllSleepoverRequests();
      setRequests(fetchedRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (request: any, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setActionType(action === 'approve' ? 'approved' : 'rejected');
    setAdminResponse('');
    setShowDialog(true);
  };

  const handleSubmitAction = async () => {
    if (!selectedRequest || !actionType) return;

    try {
      await updateSleepoverStatus(selectedRequest.id, actionType, adminResponse);
      toast.success(`Request ${actionType}d successfully`);
      setShowDialog(false);
      setSelectedRequest(null);
      setAdminResponse('');
      fetchRequests();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(`Failed to ${actionType} request`);
    }
  };

  const RequestCard = ({ request }: { request: any }) => (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex flex-col space-y-4">
          {/* Status Badge */}
          <div className="flex justify-between items-center">
            <Badge variant={
              request.status === 'approved' ? 'default' :
              request.status === 'pending' ? 'secondary' :
              'destructive'
            }>
              {request.status.toUpperCase()}
            </Badge>
            {request.status === 'pending' && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                  onClick={() => handleAction(request, 'approve')}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleAction(request, 'reject')}
                >
                  <X className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </div>
            )}
          </div>

          {/* Tenant Code */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-semibold text-blue-900">
                  Tenant Code: {request.tenantCode}
                </p>
              </div>
            </div>
          </div>

          {/* Request Details */}
          <div className="grid gap-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" />
              <p className="text-sm text-gray-600">Guest: {request.guestName}</p>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-400" />
              <p className="text-sm text-gray-600">Phone: {request.guestPhone}</p>
            </div>
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 text-gray-400" />
              <p className="text-sm text-gray-600">Room: {request.roomNumber}</p>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <p className="text-sm text-gray-600">
                Stay: {formatDate(request.startDate)} - {formatDate(request.endDate)}
              </p>
            </div>
          </div>

          {/* Admin Response (if any) */}
          {request.adminResponse && (
            <div className="mt-2 p-3 bg-gray-50 rounded-md">
              <p className="text-sm font-medium text-gray-700">Admin Response:</p>
              <p className="text-sm text-gray-600 mt-1">{request.adminResponse}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin text-gray-500" />
          <span className="text-gray-600">Loading requests...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Sleepover Requests</h1>
          <p className="text-gray-500 mt-1">Review and manage student sleepover requests</p>
        </div>

        <div className="space-y-4">
          {requests.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approved' ? 'Approve' : 'Reject'} Sleepover Request
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Admin Response
              </label>
              <Textarea
                placeholder="Enter your response..."
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button
              variant={actionType === 'approved' ? 'default' : 'destructive'}
              onClick={handleSubmitAction}
            >
              {actionType === 'approved' ? 'Approve' : 'Reject'} Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 