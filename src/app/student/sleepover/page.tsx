import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getSleepoverRequests, createSleepoverRequest, signOutSleepoverGuest, getActiveSleepoverGuests } from '@/lib/firestore';
import { SleepoverRequest } from '@/lib/firestore';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { UserPlus, Home, Calendar, Users, Key, LogOut, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function SleepoverRequestPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<SleepoverRequest[]>([]);
  const [activeGuests, setActiveGuests] = useState<SleepoverRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    guestName: '',
    guestSurname: '',
    roomNumber: '',
    startDate: '',
    endDate: '',
    additionalGuests: [{ name: '', surname: '', phoneNumber: '' }]
  });
  const [signOutCode, setSignOutCode] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<SleepoverRequest | null>(null);

  useEffect(() => {
    if (user) {
      fetchRequests();
      fetchActiveGuests();
    }
  }, [user]);

  const fetchRequests = async () => {
    try {
      const userRequests = await getSleepoverRequests();
      setRequests(userRequests.filter(request => request.userId === user?.uid));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      // Validate additional guests count
      if (formData.additionalGuests.length > 3) {
        toast.error('Maximum of 3 additional guests allowed');
        return;
      }

      // Filter out empty additional guests
      const validAdditionalGuests = formData.additionalGuests.filter(
        guest => guest.name && guest.surname && guest.phoneNumber
      );

      await createSleepoverRequest({
        userId: user.uid,
        guestName: formData.guestName,
        guestSurname: formData.guestSurname,
        roomNumber: formData.roomNumber,
        additionalGuests: validAdditionalGuests,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate)
      });

      toast.success('Sleepover request submitted successfully');
      setFormData({
        guestName: '',
        guestSurname: '',
        roomNumber: '',
        startDate: '',
        endDate: '',
        additionalGuests: [{ name: '', surname: '', phoneNumber: '' }]
      });
      fetchRequests();
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Failed to submit request');
    }
  };

  const handleSignOut = async () => {
    if (!selectedRequest) return;

    try {
      await signOutSleepoverGuest(selectedRequest.id, signOutCode);
      toast.success('Guest signed out successfully');
      setSignOutCode('');
      setSelectedRequest(null);
      fetchActiveGuests();
      fetchRequests();
    } catch (error) {
      console.error('Error signing out guest:', error);
      toast.error('Failed to sign out guest');
    }
  };

  const addAdditionalGuest = () => {
    if (formData.additionalGuests.length < 3) {
      setFormData(prev => ({
        ...prev,
        additionalGuests: [...prev.additionalGuests, { name: '', surname: '', phoneNumber: '' }]
      }));
    }
  };

  const removeAdditionalGuest = (index: number) => {
    setFormData(prev => ({
      ...prev,
      additionalGuests: prev.additionalGuests.filter((_, i) => i !== index)
    }));
  };

  const updateAdditionalGuest = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      additionalGuests: prev.additionalGuests.map((guest, i) => 
        i === index ? { ...guest, [field]: value } : guest
      )
    }));
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Sleepover Request</h1>

      {/* Active Guests Section */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Active Guests</CardTitle>
            <CardDescription>Currently checked-in sleepover guests</CardDescription>
          </CardHeader>
          <CardContent>
            {activeGuests.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No active guests at the moment</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeGuests.map((guest) => (
                  <div key={guest.id} className="flex items-center justify-between p-4 border rounded-lg bg-white hover:bg-gray-50">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4 text-blue-500" />
                        <p className="font-medium">{guest.guestName} {guest.guestSurname}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-gray-500" />
                        <p className="text-sm text-muted-foreground">Room {guest.roomNumber}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-green-500" />
                        <p className="text-sm text-muted-foreground">
                          {format(guest.startDate, 'PPP')} - {format(guest.endDate, 'PPP')}
                        </p>
                      </div>
                      {guest.additionalGuests && guest.additionalGuests.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-indigo-500" />
                          <p className="text-sm text-muted-foreground">
                            {guest.additionalGuests.length} additional guest(s)
                          </p>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-yellow-500" />
                        <p className="text-sm font-mono bg-gray-100 px-2 py-0.5 rounded">
                          Security Code: {guest.securityCode}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => setSelectedRequest(guest)}
                      variant="destructive"
                      size="sm"
                      className="ml-4"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Request Form */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Submit New Request</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Guest Name</label>
            <input
              type="text"
              value={formData.guestName}
              onChange={(e) => setFormData(prev => ({ ...prev, guestName: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Guest Surname</label>
            <input
              type="text"
              value={formData.guestSurname}
              onChange={(e) => setFormData(prev => ({ ...prev, guestSurname: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Room Number</label>
            <input
              type="text"
              value={formData.roomNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, roomNumber: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          {/* Additional Guests */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Additional Guests</label>
              {formData.additionalGuests.length < 3 && (
                <button
                  type="button"
                  onClick={addAdditionalGuest}
                  className="text-blue-500 hover:text-blue-700"
                >
                  + Add Guest
                </button>
              )}
            </div>
            {formData.additionalGuests.map((guest, index) => (
              <div key={index} className="border p-4 rounded-lg mb-2">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Guest {index + 1}</h4>
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeAdditionalGuest(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600">Name</label>
                    <input
                      type="text"
                      value={guest.name}
                      onChange={(e) => updateAdditionalGuest(index, 'name', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">Surname</label>
                    <input
                      type="text"
                      value={guest.surname}
                      onChange={(e) => updateAdditionalGuest(index, 'surname', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">Phone Number</label>
                    <input
                      type="tel"
                      value={guest.phoneNumber}
                      onChange={(e) => updateAdditionalGuest(index, 'phoneNumber', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Submit Request
          </button>
        </form>
      </div>

      {/* Request History */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Request History</CardTitle>
            <CardDescription>Past and pending sleepover requests</CardDescription>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No request history available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests
                  .filter(request => !request.isActive) // Remove active requests from history
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((request) => (
                    <div key={request.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <UserPlus className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">{request.guestName} {request.guestSurname}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Home className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-muted-foreground">Room {request.roomNumber}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-muted-foreground">
                              {format(request.startDate, 'PPP')} - {format(request.endDate, 'PPP')}
                            </span>
                          </div>

                          {request.additionalGuests && request.additionalGuests.length > 0 && (
                            <div className="flex items-start gap-2">
                              <Users className="h-4 w-4 text-indigo-500 mt-1" />
                              <div className="text-sm text-muted-foreground">
                                <p className="font-medium mb-1">Additional Guests:</p>
                                <ul className="list-disc list-inside pl-2 space-y-1">
                                  {request.additionalGuests.map((guest, index) => (
                                    <li key={index} className="text-sm">
                                      {guest.name} {guest.surname} - {guest.phoneNumber}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${request.status === 'approved' ? 'bg-green-100 text-green-800' : 
                              request.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                              'bg-yellow-100 text-yellow-800'}`}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Requested on {format(new Date(request.createdAt), 'PP')}
                          </span>
                        </div>
                      </div>

                      {request.adminResponse && (
                        <div className="mt-3 flex items-start gap-2 bg-gray-50 p-3 rounded-md">
                          <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">Admin Response</p>
                            <p className="text-sm text-muted-foreground">{request.adminResponse}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sign Out Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Sign Out Guest</CardTitle>
              <CardDescription>
                Please enter the security code to sign out {selectedRequest.guestName} {selectedRequest.guestSurname}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signOutCode">Security Code</Label>
                  <Input
                    id="signOutCode"
                    type="text"
                    value={signOutCode}
                    onChange={(e) => setSignOutCode(e.target.value)}
                    placeholder="Enter security code"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => {
                    setSelectedRequest(null);
                    setSignOutCode('');
                  }}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleSignOut}>
                    Confirm Sign Out
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 