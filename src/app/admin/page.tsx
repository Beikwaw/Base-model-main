'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  UserData, 
  getPendingApplications, 
  processRequest,
  getComplaints,
  getSleepoverRequests,
  getMaintenanceRequests,
  getAllGuestRequests,
  getAnalyticsData,
  Complaint,
  SleepoverRequest,
  MaintenanceRequest
} from '../../lib/firestore';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Users, 
  AlertCircle, 
  Calendar, 
  Wrench, 
  UserPlus, 
  LogOut,
  TrendingUp,
  Activity,
  RefreshCw,
  BarChart as BarChartIcon,
  LineChart as LineChartIcon
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [pendingApplications, setPendingApplications] = useState<UserData[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [sleepoverRequests, setSleepoverRequests] = useState<SleepoverRequest[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [guestRequests, setGuestRequests] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<"days" | "weeks" | "months">("days");
  const [chartType, setChartType] = useState<"line" | "bar">("line");

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchData = async () => {
    try {
      const [
        applications, 
        complaintsData, 
        sleepoverData, 
        maintenanceData, 
        guestData,
        analytics
      ] = await Promise.all([
        getPendingApplications(),
        getComplaints(),
        getSleepoverRequests(),
        getMaintenanceRequests(),
        getAllGuestRequests(),
        getAnalyticsData(timeRange)
      ]);
      
      setPendingApplications(applications);
      setComplaints(complaintsData);
      setSleepoverRequests(sleepoverData);
      setMaintenanceRequests(maintenanceData);
      setGuestRequests(guestData);
      setAnalyticsData(analytics);
    } catch (err) {
      setError('Failed to fetch data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  const activeGuests = guestRequests.filter(request => request.status === 'active' || request.status === 'checked-in');
  const checkedOutGuests = guestRequests.filter(request => request.status === 'checked-out');
  const applicationsPending = pendingApplications.length;
  const pendingComplaints = complaints.filter(c => c.status === 'pending').length;
  const pendingSleepovers = sleepoverRequests.filter(r => r.status === 'pending').length;
  const pendingMaintenance = maintenanceRequests.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-6 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Real-time overview of all activities</p>
        </div>
        <Button onClick={fetchData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Guests</CardTitle>
            <UserPlus className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeGuests.length}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <span>{checkedOutGuests.length} checked out today</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingSleepovers + pendingMaintenance}</div>
            <div className="text-xs text-muted-foreground">
              {pendingSleepovers} sleepover, {pendingMaintenance} maintenance
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Complaints</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingComplaints}</div>
            <div className="text-xs text-muted-foreground">
              {complaints.length} total complaints
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Applications</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applicationsPending}</div>
            <div className="text-xs text-muted-foreground">
              Pending student applications
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Chart */}
      <Card className="col-span-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Activity Analytics</CardTitle>
              <CardDescription>Overview of all activities over time</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 border rounded-lg p-1">
                <Button
                  variant={chartType === 'line' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setChartType('line')}
                >
                  <LineChartIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant={chartType === 'bar' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setChartType('bar')}
                >
                  <BarChartIcon className="h-4 w-4" />
                </Button>
              </div>
              <Tabs value={timeRange} className="w-fit" onValueChange={(v) => setTimeRange(v as any)}>
                <TabsList>
                  <TabsTrigger value="days">Days</TabsTrigger>
                  <TabsTrigger value="weeks">Weeks</TabsTrigger>
                  <TabsTrigger value="months">Months</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="guests" stroke="#10B981" name="Guests" />
                  <Line type="monotone" dataKey="sleepover" stroke="#3B82F6" name="Sleepovers" />
                  <Line type="monotone" dataKey="complaints" stroke="#F97316" name="Complaints" />
                  <Line type="monotone" dataKey="maintenance" stroke="#8B5CF6" name="Maintenance" />
                </LineChart>
              ) : (
                <BarChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="guests" fill="#10B981" name="Guests" />
                  <Bar dataKey="sleepover" fill="#3B82F6" name="Sleepovers" />
                  <Bar dataKey="complaints" fill="#F97316" name="Complaints" />
                  <Bar dataKey="maintenance" fill="#8B5CF6" name="Maintenance" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Guest Activity</CardTitle>
            <CardDescription>Latest guest check-ins and check-outs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...activeGuests, ...checkedOutGuests]
                .sort((a, b) => new Date(b.checkInTime || b.checkOutTime).getTime() - new Date(a.checkInTime || a.checkOutTime).getTime())
                .slice(0, 5)
                .map(guest => (
                  <div key={guest.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div>
                      <p className="font-medium">{guest.firstName} {guest.lastName}</p>
                      <p className="text-sm text-muted-foreground">Room {guest.roomNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {guest.status === 'active' ? 'Checked In' : 'Checked Out'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(guest.status === 'active' ? guest.checkInTime : guest.checkOutTime), 'PPp')}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Requests</CardTitle>
            <CardDescription>Latest maintenance and sleepover requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...maintenanceRequests, ...sleepoverRequests]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 5)
                .map(request => (
                  <div key={request.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div>
                      <p className="font-medium">
                        {'guestName' in request ? request.guestName : request.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {'guestPhone' in request ? 'Sleepover Request' : 'Maintenance'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium capitalize">{request.status}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(request.createdAt), 'PPp')}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}