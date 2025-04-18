'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, History, AlertTriangle } from 'lucide-react';
import { getSleepoverRequests, getActiveSleepoverGuests, signOutSleepoverGuest, SleepoverRequest } from '@/lib/firestore';
import { format, isToday } from 'date-fns';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function SleepoversPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<SleepoverRequest[]>([]);
  const [activeGuests, setActiveGuests] = useState<SleepoverRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<SleepoverRequest | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [securityPin, setSecurityPin] = useState('');
  const [showSecurityInput, setShowSecurityInput] = useState(false);

  useEffect(() => {
    if (user) {
      fetchRequests();
      fetchActiveGuests();
    }
  }, [user]);

  const fetchRequests = async () => {
    try {
      const userRequests = await getSleepoverRequests();
      // Filter requests for the current user and sort by creation date (newest first)
      const filteredRequests = userRequests
        .filter(request => request.userId === user?.uid)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      setRequests(filteredRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveGuests = async () => {
    try {
      const active = await getActiveSleepoverGuests(user?.uid || '');
      setActiveGuests(active);
    } catch (error) {
      console.error('Error fetching active guests:', error);
      toast.error('Failed to fetch active guests');
    }
  };

  const handleSecurityCheckout = async () => {
    if (!selectedRequest) return;

    // PIN verification - hardcoded but not visible in UI
    if (securityPin !== '1005') {
      toast.error('Invalid security PIN. Access denied.');
      return;
    }

    try {
      await signOutSleepoverGuest(selectedRequest.id, selectedRequest.userId);
      toast.success('Guest checked out successfully');
      setSecurityPin('');
      setSelectedRequest(null);
      setShowSecurityInput(false);
      fetchActiveGuests();
      fetchRequests();
    } catch (error) {
      console.error('Error checking out guest:', error);
      toast.error('Failed to check out guest');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Sleepover Requests</h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowHistory(!showHistory)}>
            <History className="h-4 w-4 mr-2" />
            {showHistory ? 'Hide History' : 'Show History'}
          </Button>
          <Link
            href="/student/sleepovers/new"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            New Request
          </Link>
        </div>
      </div>

      {/* Approved Guests Needing Sign Out */}
      {activeGuests.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Guests to Sign Out</h2>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Checkout Instructions:</strong>
                </p>
                <ul className="list-disc list-inside mt-1 text-sm text-yellow-700">
                  <li>Visit the security desk at the front entrance</li>
                  <li>Security will verify and check out your guest</li>
                  <li>Ensure your guest is present during checkout</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="grid gap-4">
            {activeGuests.map((guest) => (
              <div key={guest.id} className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg">{guest.guestName} {guest.guestSurname}</h3>
                    <p className="text-gray-600">Room: {guest.roomNumber}</p>
                    <p className="text-gray-600">Check-in: {format(guest.startDate, 'PPP')}</p>
                    <p className="text-gray-600">Check-out: {format(guest.endDate, 'PPP')}</p>
                  </div>
                  <Button
                    onClick={() => setSelectedRequest(guest)}
                    variant="destructive"
                    className="h-10"
                  >
                    Start Checkout
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer Message */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>Important Notice:</strong> By applying for a sleepover, the Guest accepts full liability for any injury, damage, or loss incurred and agrees to pay R150 per night for any stay beyond Sunday 23:00. Sleepovers are only free from Friday to Sunday 23:00.
            </p>
          </div>
        </div>
      </div>

      {/* Active Guests Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Active Guests</h2>
        <div className="grid gap-4">
          {activeGuests.map((guest) => (
            <div key={guest.id} className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold">{guest.guestName} {guest.guestSurname}</h3>
              <p>Room: {guest.roomNumber}</p>
              <p>Check-in: {format(guest.startDate, 'PPP')}</p>
              <p>Check-out: {format(guest.endDate, 'PPP')}</p>
              <button
                onClick={() => setSelectedRequest(guest)}
                className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Sign Out Guest
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Request History */}
      {showHistory && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Request History</h2>
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{request.guestName} {request.guestSurname}</h3>
                    <p>Room: {request.roomNumber}</p>
                    <p>Status: <span className={`font-semibold ${request.status === 'approved' ? 'text-green-600' : request.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'}`}>{request.status}</span></p>
                    <p>Check-in: {format(request.startDate, 'PPP')}</p>
                    <p>Check-out: {format(request.endDate, 'PPP')}</p>
                    {request.additionalGuests && request.additionalGuests.length > 0 && (
                      <div className="mt-2">
                        <p className="font-medium">Additional Guests:</p>
                        <ul className="list-disc list-inside">
                          {request.additionalGuests.map((guest: { name: string; surname: string; phoneNumber: string }, index: number) => (
                            <li key={index}>{guest.name} {guest.surname} - {guest.phoneNumber}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  {request.status === 'approved' && request.isActive && (
                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                      Sign Out Guest
                    </button>
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
        </div>
      )}

      {/* Security Checkout Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Security Checkout</h3>
            {!showSecurityInput ? (
              <>
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
                  <h4 className="font-medium text-blue-800 mb-2">Checkout Process:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                    <li>Take your guest to the security desk</li>
                    <li>Security will verify guest identity</li>
                    <li>Security will process the checkout</li>
                  </ol>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedRequest(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => setShowSecurityInput(true)}
                  >
                    Security Access
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Security PIN Required
                  </label>
                  <input
                    type="password"
                    value={securityPin}
                    onChange={(e) => setSecurityPin(e.target.value)}
                    placeholder="Enter security PIN"
                    className="w-full p-2 border rounded-md"
                    maxLength={4}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowSecurityInput(false);
                      setSecurityPin('');
                    }}
                  >
                    Back
                  </Button>
                  <Button
                    variant="default"
                    onClick={handleSecurityCheckout}
                  >
                    Verify & Checkout
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 