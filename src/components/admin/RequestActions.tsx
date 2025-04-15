'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { Eye, UserPlus, RefreshCw, CheckCircle, XCircle, Clock, AlertCircle, Wrench, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface RequestActionsProps {
  type: 'complaint' | 'maintenance' | 'sleepover' | 'guest';
  data: any;
  onStatusUpdate: (id: string, status: string, adminResponse?: string) => Promise<void>;
  onAssignStaff?: (id: string, staffId: string) => Promise<void>;
  staffList?: { id: string; name: string }[];
}

export function RequestActions({ 
  type, 
  data, 
  onStatusUpdate, 
  onAssignStaff,
  staffList = []
}: RequestActionsProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'completed':
      case 'approved':
      case 'resolved':
        return 'bg-green-500';
      case 'rejected':
      case 'denied':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'complaint':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'maintenance':
        return <Wrench className="h-5 w-5 text-blue-500" />;
      case 'sleepover':
        return <Calendar className="h-5 w-5 text-purple-500" />;
      case 'guest':
        return <UserPlus className="h-5 w-5 text-green-500" />;
      default:
        return null;
    }
  };

  const handleStatusUpdate = async (status: string) => {
    try {
      setLoading(true);
      await onStatusUpdate(data.id, status);
      toast.success(`Status updated to ${status}`);
      setOpen(false);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusButtons = () => {
    switch (type) {
      case 'complaint':
        return (
          <>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => handleStatusUpdate('pending')}
              disabled={loading}
            >
              <Clock className="h-4 w-4 mr-2 text-yellow-500" />
              Mark Pending
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => handleStatusUpdate('in_progress')}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-2 text-blue-500" />
              In Progress
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => handleStatusUpdate('resolved')}
              disabled={loading}
            >
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              Resolve
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => handleStatusUpdate('rejected')}
              disabled={loading}
            >
              <XCircle className="h-4 w-4 mr-2 text-red-500" />
              Reject
            </Button>
          </>
        );
      case 'sleepover':
        return (
          <>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => handleStatusUpdate('pending')}
              disabled={loading}
            >
              <Clock className="h-4 w-4 mr-2 text-yellow-500" />
              Mark Pending
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => handleStatusUpdate('approved')}
              disabled={loading}
            >
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              Approve
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => handleStatusUpdate('rejected')}
              disabled={loading}
            >
              <XCircle className="h-4 w-4 mr-2 text-red-500" />
              Reject
            </Button>
          </>
        );
      case 'maintenance':
        return (
          <>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => handleStatusUpdate('pending')}
              disabled={loading}
            >
              <Clock className="h-4 w-4 mr-2 text-yellow-500" />
              Mark Pending
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => handleStatusUpdate('in_progress')}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-2 text-blue-500" />
              In Progress
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => handleStatusUpdate('completed')}
              disabled={loading}
            >
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              Complete
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => handleStatusUpdate('rejected')}
              disabled={loading}
            >
              <XCircle className="h-4 w-4 mr-2 text-red-500" />
              Reject
            </Button>
          </>
        );
      case 'guest':
        return (
          <>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => handleStatusUpdate('pending')}
              disabled={loading}
            >
              <Clock className="h-4 w-4 mr-2 text-yellow-500" />
              Mark Pending
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => handleStatusUpdate('approved')}
              disabled={loading}
            >
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              Approve
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => handleStatusUpdate('rejected')}
              disabled={loading}
            >
              <XCircle className="h-4 w-4 mr-2 text-red-500" />
              Reject
            </Button>
          </>
        );
      default:
        return null;
    }
  };

  const renderDetails = () => {
    switch (type) {
      case 'complaint':
        return (
          <>
            <div className="space-y-2">
              <h3 className="font-medium">Title</h3>
              <p className="text-sm text-muted-foreground">{data.title}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Description</h3>
              <p className="text-sm text-muted-foreground">{data.description}</p>
            </div>
          </>
        );
      case 'maintenance':
        return (
          <>
            <div className="space-y-2">
              <h3 className="font-medium">Title</h3>
              <p className="text-sm text-muted-foreground">{data.roomNumber} {data.category}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Category</h3>
              <p className="text-sm text-muted-foreground">{data.category}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Description</h3>
              <p className="text-sm text-muted-foreground">{data.description}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Room Number</h3>
              <p className="text-sm text-muted-foreground">{data.roomNumber}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Priority</h3>
              <Badge variant="outline">{data.priority}</Badge>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Preferred Date</h3>
              <p className="text-sm text-muted-foreground">
                {new Date(data.preferredDate).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Time Slot</h3>
              <p className="text-sm text-muted-foreground">{data.timeSlot}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Created At</h3>
              <p className="text-sm text-muted-foreground">
                {new Date(data.createdAt).toLocaleString('en-US', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Last Updated</h3>
              <p className="text-sm text-muted-foreground">
                {new Date(data.updatedAt).toLocaleString('en-US', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            {data.adminResponse && (
              <div className="space-y-2">
                <h3 className="font-medium">Admin Response</h3>
                <p className="text-sm text-muted-foreground">{data.adminResponse}</p>
              </div>
            )}
          </>
        );
      case 'sleepover':
        return (
          <>
            <div className="space-y-2">
              <h3 className="font-medium">Guest Name</h3>
              <p className="text-sm text-muted-foreground">{data.guestName}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Guest Email</h3>
              <p className="text-sm text-muted-foreground">{data.guestEmail}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Visit Period</h3>
              <p className="text-sm text-muted-foreground">
                {format(data.startDate, 'PPP')} - {format(data.endDate, 'PPP')}
              </p>
            </div>
          </>
        );
      case 'guest':
        return (
          <>
            <div className="space-y-2">
              <h3 className="font-medium">Guest Name</h3>
              <p className="text-sm text-muted-foreground">{data.guestName}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Guest Email</h3>
              <p className="text-sm text-muted-foreground">{data.guestEmail}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Visit Date</h3>
              <p className="text-sm text-muted-foreground">{data.visitDate}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Visit Time</h3>
              <p className="text-sm text-muted-foreground">{data.visitTime}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Purpose</h3>
              <p className="text-sm text-muted-foreground">{data.purpose}</p>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Eye className="h-4 w-4 text-blue-500" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getTypeIcon()}
            {type.charAt(0).toUpperCase() + type.slice(1)} Request Details
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-medium">Status</h3>
              <Badge className={getStatusColor(data.status)}>
                {data.status.replace('_', ' ')}
              </Badge>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Submitted</h3>
              <p className="text-sm text-muted-foreground">
                {format(data.createdAt, 'PPP')}
              </p>
            </div>
            {renderDetails()}
          </div>
        </ScrollArea>
        <div className="flex flex-col gap-4 mt-4">
          <div className="flex gap-2">
            {getStatusButtons()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}