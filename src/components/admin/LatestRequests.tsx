import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, subHours } from 'date-fns';
import { AlertCircle, Calendar, Wrench, Users } from 'lucide-react';
import { UserData, Complaint, SleepoverRequest, MaintenanceRequest } from '@/lib/firestore';
import { Badge } from '@/components/ui/badge';

interface LatestRequestsProps {
  pendingApplications: UserData[];
  complaints: Complaint[];
  sleepoverRequests: SleepoverRequest[];
  maintenanceRequests: MaintenanceRequest[];
}

export function LatestRequests({
  pendingApplications,
  complaints,
  sleepoverRequests,
  maintenanceRequests
}: LatestRequestsProps) {
  const twentyFourHoursAgo = subHours(new Date(), 24);

  const recentApplications = pendingApplications
    .filter(app => app.createdAt >= twentyFourHoursAgo)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  const recentComplaints = complaints
    .filter(complaint => complaint.createdAt >= twentyFourHoursAgo)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  const recentSleepovers = sleepoverRequests
    .filter(request => request.createdAt >= twentyFourHoursAgo)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  const recentMaintenance = maintenanceRequests
    .filter(request => request.createdAt >= twentyFourHoursAgo)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            Latest Applications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentApplications.map(app => (
              <div key={app.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{app.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(app.createdAt, 'MMM d, h:mm a')}
                  </p>
                </div>
                <Badge variant="outline">New</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Latest Complaints
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentComplaints.map(complaint => (
              <div key={complaint.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{complaint.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(complaint.createdAt, 'MMM d, h:mm a')}
                  </p>
                </div>
                <Badge variant="outline">New</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Latest Sleepovers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentSleepovers.map(request => (
              <div key={request.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{request.guestName}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(request.createdAt, 'MMM d, h:mm a')}
                  </p>
                </div>
                <Badge variant="outline">New</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Latest Maintenance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentMaintenance.map(request => (
              <div key={request.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{request.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(request.createdAt, 'MMM d, h:mm a')}
                  </p>
                </div>
                <Badge variant="outline">New</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 