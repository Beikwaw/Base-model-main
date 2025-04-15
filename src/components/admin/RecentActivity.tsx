import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, subHours } from 'date-fns';
import { AlertCircle, Calendar, Wrench, Users } from 'lucide-react';
import { UserData, Complaint, SleepoverRequest, MaintenanceRequest } from '@/lib/firestore';

interface RecentActivityProps {
  pendingApplications: UserData[];
  complaints: Complaint[];
  sleepoverRequests: SleepoverRequest[];
  maintenanceRequests: MaintenanceRequest[];
}

export function RecentActivity({
  pendingApplications,
  complaints,
  sleepoverRequests,
  maintenanceRequests
}: RecentActivityProps) {
  const twentyFourHoursAgo = subHours(new Date(), 24);

  const recentApplications = pendingApplications.filter(
    app => app.createdAt >= twentyFourHoursAgo
  );

  const recentComplaints = complaints.filter(
    complaint => complaint.createdAt >= twentyFourHoursAgo
  );

  const recentSleepovers = sleepoverRequests.filter(
    request => request.createdAt >= twentyFourHoursAgo
  );

  const recentMaintenance = maintenanceRequests.filter(
    request => request.createdAt >= twentyFourHoursAgo
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            New Applications
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{recentApplications.length}</div>
          <p className="text-xs text-muted-foreground">
            Last 24 hours
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            New Complaints
          </CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{recentComplaints.length}</div>
          <p className="text-xs text-muted-foreground">
            Last 24 hours
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            New Sleepovers
          </CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{recentSleepovers.length}</div>
          <p className="text-xs text-muted-foreground">
            Last 24 hours
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            New Maintenance
          </CardTitle>
          <Wrench className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{recentMaintenance.length}</div>
          <p className="text-xs text-muted-foreground">
            Last 24 hours
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 