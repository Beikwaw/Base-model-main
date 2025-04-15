'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getAllUsers, processRequest, updateUser, UserData } from '@/lib/firestore';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function UsersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const fetchedUsers = await getAllUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleProcessApplication = async (userId: string, status: 'accepted' | 'denied') => {
    if (!user) return;
    try {
      setProcessingId(userId);
      const message = `Your application has been ${status}`;
      
      // If accepting, update both status and role
      if (status === 'accepted') {
        const targetUser = users.find(u => u.id === userId);
        if (targetUser && targetUser.role === 'newbie') {
          await updateUser(userId, { 
            applicationStatus: status,
            role: 'student',
            communicationLog: [{
              message,
              sentBy: 'admin',
              timestamp: new Date()
            }]
          });
        } else {
          await processRequest(userId, status, message, user.uid || '');
        }
      } else {
        await processRequest(userId, status, message, user.uid || '');
      }
      
      toast.success(`The application has been ${status} successfully.`);
      
      await fetchUsers();
    } catch (error) {
      console.error('Error processing application:', error);
      toast.error("Failed to process application");
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleAdminRole = async (userId: string, currentRole: string) => {
    try {
      setProcessingId(userId);
      const newRole = currentRole === 'admin' ? 'student' : 'admin';
      await updateUser(userId, { role: newRole });
      toast.success("User role updated");
      await fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error("Failed to update user role");
    } finally {
      setProcessingId(null);
    }
  };

  const NewbieUsers = () => {
    const newbieUsers = users.filter(user => user.role === 'newbie');
    
    if (newbieUsers.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No pending newbie applications
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {newbieUsers.map(user => (
          <Card key={user.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <h3 className="font-medium">{user.name || user.email}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div className="text-sm text-muted-foreground mt-2">
                  <p>Phone: {user.phone || 'N/A'}</p>
                  <p>Tenant Code: {user.tenant_code || 'N/A'}</p>
                  <p>Status: {user.applicationStatus || 'pending'}</p>
                  <p>Submitted: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  className='bg-destructive hover:bg-destructive/90 text-white'
                  disabled={!!processingId || user.applicationStatus === 'denied'}
                  onClick={() => handleProcessApplication(user.id, 'denied')}
                >
                  {processingId === user.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Reject'
                  )}
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className='bg-green-900 hover:bg-green-800 text-white'
                  disabled={!!processingId || user.applicationStatus === 'accepted'}
                  onClick={() => handleProcessApplication(user.id, 'accepted')}
                >
                  {processingId === user.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Approve'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const PendingApplications = () => {
    const pendingUsers = users.filter(user => user.applicationStatus === 'pending' && user.role !== 'newbie');
    
    if (pendingUsers.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No pending applications
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {pendingUsers.map(user => (
          <Card key={user.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <h3 className="font-medium">{user.name || user.email}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                {user.requestDetails && (
                  <div className="text-sm text-muted-foreground mt-2">
                    <p>Accommodation: {user.requestDetails.accommodationType}</p>
                    <p>Location: {user.requestDetails.location}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={!!processingId}
                  onClick={() => handleProcessApplication(user.id, 'denied')}
                >
                  {processingId === user.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Reject'
                  )}
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  disabled={!!processingId}
                  onClick={() => handleProcessApplication(user.id, 'accepted')}
                >
                  {processingId === user.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Approve'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const AllUsers = () => {
    return (
      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-muted">
            <tr>
              <th className="px-6 py-3">Name/Email</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b">
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium">{user.name || 'N/A'}</div>
                    <div className="text-muted-foreground">{user.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge 
                    variant={
                      user.role === 'admin' 
                        ? 'default' 
                        : user.role === 'newbie' 
                          ? 'outline' 
                          : 'secondary'
                    }
                  >
                    {user.role}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <Badge
                    variant={
                      user.applicationStatus === 'accepted'
                        ? 'default'
                        : user.applicationStatus === 'denied'
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {user.applicationStatus || 'N/A'}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  {user.role !== 'newbie' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!!processingId}
                      onClick={() => handleToggleAdminRole(user.id, user.role)}
                    >
                      {processingId === user.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        `Make ${user.role === 'admin' ? 'Student' : 'Admin'}`
                      )}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!!processingId || user.applicationStatus !== 'accepted'}
                      onClick={() => updateUser(user.id, { role: 'student' })}
                    >
                      {processingId === user.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Convert to Student'
                      )}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="newbies">
            <TabsList>
              <TabsTrigger value="newbies">New Registrations</TabsTrigger>
              <TabsTrigger value="pending">Pending Applications</TabsTrigger>
              <TabsTrigger value="all">All Users</TabsTrigger>
            </TabsList>
            <TabsContent value="newbies" className="mt-4">
              <NewbieUsers />
            </TabsContent>
            <TabsContent value="pending" className="mt-4">
              <PendingApplications />
            </TabsContent>
            <TabsContent value="all" className="mt-4">
              <AllUsers />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}