'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSleepoverRequest } from '@/lib/firestore';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'react-hot-toast';

export default function NewSleepoverRequestPage() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);
  const [formData, setFormData] = useState({
    guestName: '',
    guestSurname: '',
    guestPhone: '',
    roomNumber: userData?.room_number || '',
    tenantCode: userData?.tenant_code || '',
    startDate: '',
    endDate: '',
    additionalGuests: [{ name: '', surname: '', phoneNumber: '' }]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userData) return;

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

      const requestData = {
        userId: user.uid,
        guestName: formData.guestName,
        guestSurname: formData.guestSurname,
        guestPhone: formData.guestPhone,
        roomNumber: userData.room_number,
        tenantCode: userData.tenant_code,
        additionalGuests: validAdditionalGuests,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate)
      };

      await createSleepoverRequest(requestData);
      setSubmittedData(requestData);
      setShowConfirmation(true);
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Failed to submit request');
    }
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    router.push('/student/sleepovers');
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">New Sleepover Request</h1>

      <div className="bg-white p-6 rounded-lg shadow">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="guestName">Guest Name</Label>
              <Input
                id="guestName"
                value={formData.guestName}
                onChange={(e) => setFormData(prev => ({ ...prev, guestName: e.target.value }))}
                placeholder="Enter guest's first name"
                required
              />
            </div>
            <div>
              <Label htmlFor="guestSurname">Guest Surname</Label>
              <Input
                id="guestSurname"
                value={formData.guestSurname}
                onChange={(e) => setFormData(prev => ({ ...prev, guestSurname: e.target.value }))}
                placeholder="Enter guest's last name"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="guestPhone">Guest Phone Number</Label>
            <Input
              id="guestPhone"
              type="tel"
              value={formData.guestPhone}
              onChange={(e) => setFormData(prev => ({ ...prev, guestPhone: e.target.value }))}
              placeholder="0836795566"
              required
            />
          </div>

          <div>
            <Label htmlFor="roomNumber">Room Number</Label>
            <Input
              id="roomNumber"
              value={userData?.room_number || ''}
              readOnly
              className="bg-gray-100"
            />
          </div>

          <div>
            <Label htmlFor="tenantCode">Tenant Code</Label>
            <Input
              id="tenantCode"
              value={userData?.tenant_code || ''}
              readOnly
              className="bg-gray-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Additional Guests</Label>
              {formData.additionalGuests.length < 3 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={addAdditionalGuest}
                >
                  Add Guest
                </Button>
              )}
            </div>

            {formData.additionalGuests.map((guest, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Additional Guest {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => removeAdditionalGuest(index)}
                  >
                    Remove
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={guest.name}
                      onChange={(e) => updateAdditionalGuest(index, 'name', e.target.value)}
                      placeholder="First name"
                      required
                    />
                  </div>
                  <div>
                    <Label>Surname</Label>
                    <Input
                      value={guest.surname}
                      onChange={(e) => updateAdditionalGuest(index, 'surname', e.target.value)}
                      placeholder="Last name"
                      required
                    />
                  </div>
                  <div>
                    <Label>Phone Number</Label>
                    <Input
                      type="tel"
                      value={guest.phoneNumber}
                      onChange={(e) => updateAdditionalGuest(index, 'phoneNumber', e.target.value)}
                      placeholder="0836795566"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/student/sleepovers')}
            >
              Cancel
            </Button>
            <Button type="submit">
              Submit Request
            </Button>
          </div>
        </form>
      </div>

      <Dialog open={showConfirmation} onOpenChange={handleConfirmationClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Request Submitted Successfully</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-700">
              Thank you for submitting a sleepover request for:
            </p>
            {submittedData && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p><span className="font-semibold">Guest Name:</span> {submittedData.guestName} {submittedData.guestSurname}</p>
                <p><span className="font-semibold">Phone Number:</span> {submittedData.guestPhone}</p>
                <p><span className="font-semibold">Room Number:</span> {submittedData.roomNumber}</p>
                <p><span className="font-semibold">Stay Period:</span> {new Date(submittedData.startDate).toLocaleDateString()} - {new Date(submittedData.endDate).toLocaleDateString()}</p>
                {submittedData.additionalGuests?.length > 0 && (
                  <div>
                    <p className="font-semibold mt-2">Additional Guests:</p>
                    <ul className="list-disc pl-5">
                      {submittedData.additionalGuests.map((guest: any, index: number) => (
                        <li key={index}>
                          {guest.name} {guest.surname} - {guest.phoneNumber}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            <p className="text-gray-700">
              Your request will be reviewed by management. Please check back later in this portal for updates.
            </p>
            <div className="flex justify-end">
              <Button onClick={handleConfirmationClose}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 