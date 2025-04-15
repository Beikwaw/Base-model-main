'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { UserCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

export default function StudentPortalPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userData = await login(email, password, 'student', rememberMe);
      if (userData.role === 'newbie') {
        toast.success('Login successful');
        router.push('/pending-approval');
      } else if (userData.role === 'student') {
        toast.success('Login successful');
        router.push('/student');
      } else {
        toast.error('Invalid user type');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error && error.message === 'Invalid user type') {
        toast.error('Invalid user type');
      } else {
        toast.error('Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resetEmail) {
      toast.error('Please enter your email');
      return;
    }

    setIsLoading(true);

    try {
      await sendPasswordResetEmail(getAuth(), resetEmail);
      setResetMessage('Password reset email sent');
      toast.success('Password reset email sent');
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <Card className="w-full max-w-md p-8">
        <CardHeader>
          <CardTitle>Student Portal</CardTitle>
          <CardDescription>Login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                />
                <Label htmlFor="rememberMe">Remember me</Label>
              </div>
              <Button
                type="button"
                variant="link"
                onClick={() => setShowResetPassword(!showResetPassword)}
              >
                Forgot password?
              </Button>
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
          {showResetPassword && (
            <form onSubmit={handleResetPassword} className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resetEmail">Reset Email</Label>
                <Input
                  id="resetEmail"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Send Reset Email
              </Button>
              {resetMessage && <p className="text-sm text-green-600">{resetMessage}</p>}
            </form>
          )}
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <Link href="/register">
            <Button variant="link">Create an account</Button>
          </Link>
          <Link href="/">
            <Button variant="link" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to home</span>
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}