import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getSleepoverRequests, createSleepoverRequest, signOutSleepoverGuest, getActiveSleepoverGuests } from '@/lib/firestore';
import { SleepoverRequest } from '@/lib/firestore';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

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
        <h2 className="text-xl font-semibold mb-4">Active Guests</h2>
        <div className="grid gap-4">
          {activeGuests.map((guest) => (
            <div key={guest.id} className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold">{guest.guestName} {guest.guestSurname}</h3>
              <p>Room: {guest.roomNumber}</p>
              <p>Check-in: {format(guest.startDate, 'PPP')}</p>
              <p>Check-out: {format(guest.endDate, 'PPP')}</p>
              <p className="text-sm text-gray-600">Security Code: {guest.securityCode}</p>
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
                        {request.additionalGuests.map((guest, index) => (
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

      {/* Sign Out Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Sign Out Guest</h3>
            <p className="mb-4">Enter the security code to sign out the guest:</p>
            <input
              type="text"
              value={signOutCode}
              onChange={(e) => setSignOutCode(e.target.value)}
              placeholder="Enter security code"
              className="border p-2 rounded mb-4 w-full"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setSignOutCode('');
                }}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 