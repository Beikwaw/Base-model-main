'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wrench, Clock, Calendar, User, Building, AlertTriangle, CheckCircle, X, RefreshCw } from "lucide-react";
import { getAllMaintenanceRequests, updateMaintenanceStatus, assignStaffToMaintenance } from '@/lib/firestore';
import { toast } from 'sonner';
import { format } from 'date-fns';

const formatDate = (date: any) => {
  if (!date) return 'N/A';
  if (date.toDate) {
    return format(date.toDate(), 'PPP');
  }
  return format(new Date(date), 'PPP');
};

const priorityColors = {
  low: 'bg-blue-50 text-blue-700 border-blue-200',
  medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  high: 'bg-red-50 text-red-700 border-red-200'
};

const statusColors = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-red-50 text-red-700 border-red-200'
};

interface MaintenanceRequest {
  id: string;
  userId: string;
  category: 'bedroom' | 'bathroom' | 'kitchen' | 'furniture' | 'other';
  description: string;
  roomNumber: string;
  timeSlot: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
  adminResponse?: string;
  userName?: string;
}

interface FetchedMaintenanceRequest {
  id: string;
  userId: string;
  category: string;
  description: string;
  roomNumber: string;
  timeSlot: string;
  createdAt: string;
  updatedAt: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  preferredDate: string;
}

const formatCategory = (category: string | undefined) => {
  if (!category) return 'Not specified';
  return category.replace('_', ' ').charAt(0).toUpperCase() + category.slice(1);
};

export default function MaintenancePage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [actionType, setActionType] = useState<'in_progress' | 'completed' | 'rejected' | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const fetchedRequests = await getAllMaintenanceRequests() as FetchedMaintenanceRequest[];
      const typedRequests = fetchedRequests.map(request => ({
        ...request,
        createdAt: new Date(request.createdAt),
        updatedAt: new Date(request.updatedAt),
      })) as MaintenanceRequest[];
      setRequests(typedRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (request: MaintenanceRequest, action: 'in_progress' | 'completed' | 'rejected') => {
    setSelectedRequest(request);
    setActionType(action);
    setAdminResponse('');
    setShowDialog(true);
  };

  const handleSubmitAction = async () => {
    if (!selectedRequest || !actionType) return;

    try {
      await updateMaintenanceStatus(selectedRequest.id, actionType, adminResponse);
      toast.success(`Request marked as ${actionType.replace('_', ' ')}`);
      setShowDialog(false);
      setSelectedRequest(null);
      setAdminResponse('');
      fetchRequests();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(`Failed to update request`);
    }
  };

  const RequestCard = ({ request }: { request: MaintenanceRequest }) => (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex flex-col space-y-4">
          {/* Header with Status and Actions */}
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${request.status ? statusColors[request.status] : 'bg-gray-50 text-gray-700 border-gray-200'} border`}>
                  {request.status ? request.status.replace('_', ' ').toUpperCase() : 'UNKNOWN'}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${request.priority ? priorityColors[request.priority] : 'bg-gray-50 text-gray-700 border-gray-200'} border`}>
                  {request.priority ? request.priority.toUpperCase() : 'UNKNOWN'} Priority
                </span>
              </div>
              <h3 className="text-lg font-semibold">{formatCategory(request.category)}</h3>
            </div>
            
            {request.status === 'pending' && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  onClick={() => handleAction(request, 'in_progress')}
                >
                  <Clock className="h-4 w-4 mr-1" />
                  Start
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleAction(request, 'rejected')}
                >
                  <X className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </div>
            )}
            
            {request.status === 'in_progress' && (
              <Button
                variant="outline"
                size="sm"
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={() => handleAction(request, 'completed')}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Complete
              </Button>
            )}
          </div>

          {/* Request Details */}
          <div className="grid md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Requested by:</span> {request.userName || 'Unknown'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-gray-400" />
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Room:</span> {request.roomNumber || 'Not specified'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Submitted:</span> {formatDate(request.createdAt)}
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Time Slot:</span> {request.timeSlot || 'Not specified'}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white p-4 rounded-lg border border-gray-100">
            <p className="text-sm text-gray-600">{request.description || 'No description provided'}</p>
          </div>

          {/* Admin Response (if any) */}
          {request.adminResponse && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <p className="text-sm font-medium text-blue-800">Admin Response:</p>
              <p className="text-sm text-blue-600 mt-1">{request.adminResponse}</p>
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Maintenance Requests</h1>
              <p className="text-gray-500 mt-1">Manage and track maintenance tasks</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchRequests}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
          
          <div className="grid grid-cols-4 gap-4 mt-6">
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-yellow-800">Pending</p>
                  <span className="text-2xl font-bold text-yellow-800">
                    {requests.filter(r => r.status === 'pending').length}
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-blue-800">In Progress</p>
                  <span className="text-2xl font-bold text-blue-800">
                    {requests.filter(r => r.status === 'in_progress').length}
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-green-800">Completed</p>
                  <span className="text-2xl font-bold text-green-800">
                    {requests.filter(r => r.status === 'completed').length}
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-red-800">Rejected</p>
                  <span className="text-2xl font-bold text-red-800">
                    {requests.filter(r => r.status === 'rejected').length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
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
              {actionType === 'in_progress' ? 'Start' : 
               actionType === 'completed' ? 'Complete' : 
               'Reject'} Maintenance Request
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
              variant={actionType === 'completed' ? 'default' : actionType === 'in_progress' ? 'default' : 'destructive'}
              onClick={handleSubmitAction}
            >
              {actionType === 'in_progress' ? 'Start Work' :
               actionType === 'completed' ? 'Mark as Complete' :
               'Reject Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}