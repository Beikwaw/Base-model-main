'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAllSleepoverRequests, updateSleepoverStatus } from '@/lib/firestore';
import { RequestActions } from '@/components/admin/RequestActions';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import { getSleepoverRequests } from '@/lib/firestore';
import { SleepoverRequest } from '@/lib/firestore';

export default function SleepoverPage() {
  const { user } = useAuth();
  const [sleepoverRequests, setSleepoverRequests] = useState<SleepoverRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<SleepoverRequest | null>(null);
  const [response, setResponse] = useState('');

  useEffect(() => {
    if (user) {
      fetchSleepoverRequests();
    }
  }, [user]);

  const fetchSleepoverRequests = async () => {
    try {
      setLoading(true);
      const requests = await getSleepoverRequests();
      setSleepoverRequests(requests);
    } catch (error) {
      console.error('Error fetching sleepover requests:', error);
      toast.error('Failed to fetch sleepover requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId: string, status: SleepoverRequest['status']) => {
    try {
      await updateSleepoverStatus(requestId, status, response);
      toast.success(`Request ${status} successfully`);
      setResponse('');
      setSelectedRequest(null);
      fetchSleepoverRequests();
    } catch (error) {
      console.error('Error updating request:', error);
      toast.error('Failed to update request');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'approved':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">Loading...</div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Sleepover Requests</h1>

      <div className="space-y-4">
        {sleepoverRequests.map((request) => (
          <div key={request.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{request.guestName}</h3>
                <p className="text-gray-600">Requested by: {request.userId}</p>
                <p>Status: <span className={`font-semibold ${request.status === 'approved' ? 'text-green-600' : request.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'}`}>{request.status}</span></p>
                <p>Check-in: {format(request.startDate, 'PPP')}</p>
                <p>Check-out: {format(request.endDate, 'PPP')}</p>
                <p className="mt-2">{request.reason}</p>
                {request.status === 'approved' && (
                  <p className="mt-2 text-sm text-gray-600">Security Code: {request.securityCode}</p>
                )}
                {request.status === 'approved' && request.isActive && (
                  <span className="mt-2 inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Active</span>
                )}
              </div>
              {request.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedRequest(request)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Respond
                  </button>
                </div>
              )}
            </div>
            {request.adminResponse && (
              <div className="mt-2 p-2 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">Admin Response: {request.adminResponse}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Response Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Respond to Request</h3>
            <textarea
              placeholder="Enter your response"
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              className="border p-2 rounded mb-4 w-full"
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setResponse('');
                }}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusUpdate(selectedRequest.id, 'approved')}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Approve
              </button>
              <button
                onClick={() => handleStatusUpdate(selectedRequest.id, 'rejected')}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 