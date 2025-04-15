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
  getActiveGuests,
  getCheckedOutGuests,
  getActiveSleepoverGuests,
  getCheckedOutSleepoverGuests,
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
  LineChart as LineChartIcon,
  Loader2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [pendingApplications, setPendingApplications] = useState<UserData[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [sleepoverRequests, setSleepoverRequests] = useState<SleepoverRequest[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [guestRequests, setGuestRequests] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [activeGuests, setActiveGuests] = useState<any[]>([]);
  const [checkedOutGuests, setCheckedOutGuests] = useState<any[]>([]);
  const [activeSleepoverGuests, setActiveSleepoverGuests] = useState<any[]>([]);
  const [checkedOutSleepoverGuests, setCheckedOutSleepoverGuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("7d");
  const [chartType, setChartType] = useState<"line" | "bar">("line");

  const fetchData = async () => {
    try {
      setLoading(true);
      // Convert timeRange to the format expected by getAnalyticsData
      const analyticsTimeRange = timeRange === "7d" ? "days" : timeRange === "30d" ? "weeks" : "months";
      
      const [
        applications,
        complaints,
        sleepovers,
        maintenance,
        guestRequests,
        analytics,
        activeGuests,
        checkedOutGuests,
        activeSleepoverGuests,
        checkedOutSleepoverGuests
      ] = await Promise.all([
        getPendingApplications(),
        getComplaints(),
        getSleepoverRequests(),
        getMaintenanceRequests(),
        getAllGuestRequests(),
        getAnalyticsData(analyticsTimeRange),
        getActiveGuests(),
        getCheckedOutGuests(),
        getActiveSleepoverGuests(),
        getCheckedOutSleepoverGuests()
      ]);

      setPendingApplications(applications);
      setComplaints(complaints);
      setSleepoverRequests(sleepovers);
      setMaintenanceRequests(maintenance);
      setGuestRequests(guestRequests);
      setAnalyticsData(analytics || []); // Ensure we always set an array even if analytics is undefined
      setActiveGuests(activeGuests);
      setCheckedOutGuests(checkedOutGuests);
      setActiveSleepoverGuests(activeSleepoverGuests);
      setCheckedOutSleepoverGuests(checkedOutSleepoverGuests);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-600">Dashboard Error</CardTitle>
            <CardDescription className="text-red-500">There was a problem loading the dashboard data</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-red-500 mb-4">{error}</p>
            <div className="flex gap-4">
              <Button onClick={fetchData} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry Loading
              </Button>
              <Button onClick={() => setError(null)} variant="ghost">
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const overviewCards = [
    {
      title: 'Active Guests',
      value: activeGuests.length,
      description: 'Currently checked-in guests',
    },
    {
      title: 'Pending Requests',
      value: maintenanceRequests.filter(r => r.status === 'pending').length,
      description: 'Maintenance requests awaiting action',
    },
    {
      title: 'Active Complaints',
      value: complaints.filter(c => c.status === 'active').length,
      description: 'Unresolved complaints',
    },
    {
      title: 'New Applications',
      value: pendingApplications.length,
      description: 'Applications pending review',
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your residence management system</p>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={fetchData} variant="outline" size="sm">
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {overviewCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Section */}
      <Card className="col-span-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Analytics Overview</CardTitle>
              <CardDescription>System activity over time</CardDescription>
            </div>
            <div className="flex gap-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select chart type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'line' ? (
                  <LineChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="guests" stroke="#3B82F6" name="Guests" />
                    <Line type="monotone" dataKey="complaints" stroke="#EF4444" name="Complaints" />
                    <Line type="monotone" dataKey="maintenance" stroke="#F59E0B" name="Maintenance" />
                    <Line type="monotone" dataKey="sleepover" stroke="#10B981" name="Sleepovers" />
                  </LineChart>
                ) : (
                  <BarChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="guests" fill="#3B82F6" name="Guests" />
                    <Bar dataKey="complaints" fill="#EF4444" name="Complaints" />
                    <Bar dataKey="maintenance" fill="#F59E0B" name="Maintenance" />
                    <Bar dataKey="sleepover" fill="#10B981" name="Sleepovers" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Current Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <UserPlus className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">Active Guests</span>
                      </div>
                      <span className="font-medium">{activeGuests.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Active Sleepovers</span>
                      </div>
                      <span className="font-medium">{activeSleepoverGuests.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Wrench className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">Pending Maintenance</span>
                      </div>
                      <span className="font-medium">{maintenanceRequests.filter(r => r.status === 'pending').length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm">Active Complaints</span>
                      </div>
                      <span className="font-medium">{complaints.filter(c => c.status === 'pending').length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <LogOut className="h-4 w-4 text-purple-500" />
                        <span className="text-sm">Checked Out Today</span>
                      </div>
                      <span className="font-medium">{checkedOutGuests.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-indigo-500" />
                        <span className="text-sm">New Applications</span>
                      </div>
                      <span className="font-medium">{pendingApplications.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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
                        {guest.status === 'active' || guest.status === 'checked-in' ? 'Checked In' : 'Checked Out'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(guest.status === 'active' || guest.status === 'checked-in' ? guest.checkInTime : guest.checkOutTime), 'PPp')}
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