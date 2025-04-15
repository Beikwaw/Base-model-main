'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { createGuestRegistration } from '@/lib/firestore';

interface GuestRegistrationFormProps {
  userId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FormData {
  guestName: string;
  guestEmail: string;
  visitDate: string;
  visitTime: string;
  purpose: string;
}

export function GuestRegistrationForm({ userId, onSuccess, onCancel }: GuestRegistrationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      await createGuestRegistration({
        ...data,
        userId,
        status: 'pending',
      });
      toast.success('Guest registration submitted successfully');
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting guest registration:', error);
      toast.error('Failed to submit guest registration');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="guestName">Guest Name</Label>
        <Input
          id="guestName"
          {...register('guestName', {
            required: 'Guest name is required',
          })}
        />
        {errors.guestName && (
          <p className="text-sm text-red-500">{errors.guestName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="guestEmail">Guest Email</Label>
        <Input
          id="guestEmail"
          type="email"
          {...register('guestEmail', {
            required: 'Guest email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
            },
          })}
        />
        {errors.guestEmail && (
          <p className="text-sm text-red-500">{errors.guestEmail.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="visitDate">Visit Date</Label>
        <Input
          id="visitDate"
          type="date"
          {...register('visitDate', {
            required: 'Visit date is required',
            validate: value => new Date(value).getTime() >= new Date().setHours(0, 0, 0, 0) || 'Visit date must be today or later',
          })}
        />
        {errors.visitDate && (
          <p className="text-sm text-red-500">{errors.visitDate.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="visitTime">Visit Time</Label>
        <Input
          id="visitTime"
          type="time"
          {...register('visitTime', {
            required: 'Visit time is required',
          })}
        />
        {errors.visitTime && (
          <p className="text-sm text-red-500">{errors.visitTime.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="purpose">Purpose of Visit</Label>
        <Input
          id="purpose"
          {...register('purpose', {
            required: 'Purpose of visit is required',
          })}
        />
        {errors.purpose && (
          <p className="text-sm text-red-500">{errors.purpose.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
      </div>
    </form>
  );
} 