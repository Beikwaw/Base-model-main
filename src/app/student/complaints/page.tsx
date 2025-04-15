'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TriangleAlert, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getMyComplaints, createComplaint } from '@/lib/firestore';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PolicySection } from '@/components/PolicySection';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FormData {
  category: 'maintenance' | 'security' | 'noise' | 'cleanliness' | 'other';
  title: string;
  description: string;
  location: string;
  roomNumber: string;
  tenantCode: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'in_progress':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'resolved':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'rejected':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-4 w-4" />;
    case 'in_progress':
      return <AlertCircle className="h-4 w-4" />;
    case 'resolved':
      return <CheckCircle className="h-4 w-4" />;
    case 'rejected':
      return <XCircle className="h-4 w-4" />;
    default:
      return <AlertCircle className="h-4 w-4" />;
  }
};

export default function ComplaintsPage() {
  const { user, userData } = useAuth();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    category: 'maintenance',
    title: '',
    description: '',
    location: '',
    roomNumber: userData?.room_number || '',
    tenantCode: userData?.tenant_code || '',
  });

  const fetchComplaints = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const userComplaints = await getMyComplaints(user.uid);
      setComplaints(userComplaints);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast.error('Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchComplaints();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userData) {
      toast.error('You must be logged in to submit a complaint');
      return;
    }

    try {
      await createComplaint({
        userId: user.uid,
        title: formData.title,
        description: formData.description,
        roomNumber: formData.roomNumber,
        tenantCode: formData.tenantCode,
        category: formData.category,
        location: formData.location,
        status: 'pending',
        createdAt: new Date()
      });

      toast.success('Complaint submitted successfully');
      setFormData({
        category: 'maintenance',
        title: '',
        description: '',
        location: '',
        roomNumber: userData.room_number || '',
        tenantCode: userData.tenant_code || '',
      });
      fetchComplaints();
    } catch (error) {
      console.error('Error submitting complaint:', error);
      toast.error('Failed to submit complaint');
    }
  };

  const activeComplaints = complaints.filter(complaint => 
    complaint.status === 'pending' || complaint.status === 'in_progress'
  );

  const historyComplaints = complaints.filter(complaint => 
    complaint.status === 'resolved' || complaint.status === 'rejected'
  );

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Complaints</h1>
          <p className="text-muted-foreground">Submit and track your complaints</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center gap-2">
            <TriangleAlert className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>New Complaint</CardTitle>
              <CardDescription>Submit a new complaint</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({ ...formData, category: value as FormData['category'] })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="noise">Noise</SelectItem>
                    <SelectItem value="cleanliness">Cleanliness</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Brief description of your complaint"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description of your complaint"
                  className="min-h-[100px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location (Optional)</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Where did this occur?"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="roomNumber">Room Number</Label>
                <Input
                  id="roomNumber"
                  value={formData.roomNumber}
                  readOnly
                  className="bg-gray-100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tenantCode">Tenant Code</Label>
                <Input
                  id="tenantCode"
                  value={formData.tenantCode}
                  readOnly
                  className="bg-gray-100"
                />
              </div>

              <PolicySection
                title="Complaint Policy"
                items={[
                  'All complaints are treated with confidentiality',
                  'Response time may vary based on the severity of the issue',
                  'False or malicious complaints may result in disciplinary action',
                  'Updates on your complaint status will be provided through the dashboard'
                ]}
              />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Complaint'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center gap-2">
            <TriangleAlert className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Your Complaints</CardTitle>
              <CardDescription>Track the status of your complaints</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="active" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="active" className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Active
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="space-y-4">
                {loading ? (
                  <p className="text-muted-foreground">Loading complaints...</p>
                ) : activeComplaints.length === 0 ? (
                  <div className="text-center py-6">
                    <TriangleAlert className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No active complaints</p>
                  </div>
                ) : (
                  activeComplaints.map((complaint) => (
                    <Card key={complaint.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">{complaint.title}</h3>
                            <Badge className={getStatusColor(complaint.status)}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(complaint.status)}
                                {complaint.status.replace('_', ' ')}
                              </div>
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Submitted on {format(complaint.createdAt, 'PPP')}
                          </p>
                          <div className="bg-gray-50 p-3 rounded-md">
                            <p className="text-sm text-gray-600">{complaint.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                {loading ? (
                  <p className="text-muted-foreground">Loading complaints...</p>
                ) : historyComplaints.length === 0 ? (
                  <div className="text-center py-6">
                    <Clock className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No complaint history</p>
                  </div>
                ) : (
                  historyComplaints.map((complaint) => (
                    <Card key={complaint.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">{complaint.title}</h3>
                            <Badge className={getStatusColor(complaint.status)}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(complaint.status)}
                                {complaint.status.replace('_', ' ')}
                              </div>
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Submitted on {format(complaint.createdAt, 'PPP')}
                          </p>
                          <div className="bg-gray-50 p-3 rounded-md">
                            <p className="text-sm text-gray-600">{complaint.description}</p>
                          </div>
                          {complaint.adminResponse && (
                            <div className="bg-blue-50 p-3 rounded-md mt-2">
                              <p className="text-sm font-medium text-blue-800">Admin Response:</p>
                              <p className="text-sm text-blue-600 mt-1">{complaint.adminResponse}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 