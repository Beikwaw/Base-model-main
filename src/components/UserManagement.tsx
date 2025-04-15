'use client';

import React, { useState, useEffect } from 'react';
import { getAllUsers, deleteUser, updateUser, createUser, UserData } from '../lib/firestore';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';

interface NewUser {
  id?: string;
  email: string;
  name: string;
  surname?: string;
  phone: string;
  place_of_study: string;
  room_number: string;
  tenant_code: string;
  role: 'student' | 'admin';
}

export default function UserManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState<NewUser>({
    id: '',
    email: '',
    name: '',
    role: 'student',
    phone: '',
    place_of_study: '',
    room_number: '',
    tenant_code: ''
  });
  
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersList = await getAllUsers();
      setUsers(usersList);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    let isMounted = true;
    fetchUsers().then(() => {
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };
  
  const handleRoleChange = (value: string) => {
    setNewUser(prev => ({ ...prev, role: value as 'student' | 'admin' }));
  };
  
  const handleAddUser = async () => {
    if (!newUser.email || !newUser.name) {
      toast.error('Please fill all required fields');
      return;
    }

    if (users.some(user => user.email === newUser.email)) {
      toast.error('User with this email already exists');
      return;
    }
    
    try {
      const userId = newUser.id || newUser.email.replace(/[^a-zA-Z0-9]/g, '');
      
      await createUser({
        ...newUser,
        id: userId,
        surname: newUser.surname || newUser.name,
        full_name: newUser.surname ? `${newUser.name} ${newUser.surname}` : newUser.name,
        requestDetails: undefined
      });

      toast.success(`User ${newUser.name} created successfully`);
      setNewUser({
        id: '',
        email: '',
        name: '',
        role: 'student',
        phone: '',
        place_of_study: '',
        room_number: '',
        tenant_code: ''
      });

      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
    }
  };
  
  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId);
        toast.success('User deleted successfully');
        setUsers(users.filter(user => user.id !== userId));
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      }
    }
  };
  
  const handleToggleRole = async (user: UserData) => {
    const newRole = user.role === 'admin' ? 'student' : 'admin';
    try {
      await updateUser(user.id, { role: newRole });
      toast.success(`User role updated to ${newRole}`);
      setUsers(users.map(u => 
        u.id === user.id ? { ...u, role: newRole } : u
      ));
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Add New User</CardTitle>
          <CardDescription>Create a new student or admin user</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email (required)</Label>
              <Input
                id="email"
                name="email"
                value={newUser.email}
                onChange={handleInputChange}
                placeholder="user@example.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Name (required)</Label>
              <Input
                id="name"
                name="name"
                value={newUser.name}
                onChange={handleInputChange}
                placeholder="John Doe"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="id">User ID (optional)</Label>
              <Input
                id="id"
                name="id"
                value={newUser.id}
                onChange={handleInputChange}
                placeholder="Leave blank to auto-generate"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={newUser.role} onValueChange={handleRoleChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleAddUser}>Add User</Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
          <CardDescription>Manage existing users</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-4">No users found</div>
          ) : (
            <div className="grid gap-4">
              {users.map(user => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{user.name}</h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <div className="flex items-center mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                      {user.applicationStatus && (
                        <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                          user.applicationStatus === 'accepted' ? 'bg-green-100 text-green-800' :
                          user.applicationStatus === 'denied' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.applicationStatus}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleToggleRole(user)}
                    >
                      {user.role === 'admin' ? 'Make Student' : 'Make Admin'}
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}