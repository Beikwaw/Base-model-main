"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Home, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { app } from "@/lib/firebase";
import { createUser } from "@/lib/firestore";
import { toast as sonnerToast } from "sonner";

interface FormData {
  email: string;
  name: string;
  surname: string;
  phone: string;
  place_of_study: string;
  room_number: string;
  tenant_code: string;
  password: string;
  confirmPassword: string;
  full_name: string;
}

export default function SignUpPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const auth = getAuth(app);

  const [formData, setFormData] = useState<FormData>({
    email: "",
    name: "",
    surname: "",
    phone: "",
    place_of_study: "",
    room_number: "",
    tenant_code: "",
    password: "",
    confirmPassword: "",
    full_name: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    // Email validation
    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address");
      return false;
    }

    // Password validation
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Create profile in Firestore using our function
      await createUser({
        id: user.uid,
        email: formData.email,
        name: formData.name,
        surname: formData.surname,
        full_name: `${formData.name} ${formData.surname}`,
        phone: formData.phone,
        place_of_study: formData.place_of_study,
        room_number: formData.room_number,
        tenant_code: formData.tenant_code,
        role: "newbie",
        applicationStatus: "pending",
      });

      setSuccess(true);
      sonnerToast.success("Account created successfully. Your application has been submitted for approval.");

      // Redirect after 3 seconds
      setTimeout(() => {
        router.push("/portals/student");
      }, 3000);
    } catch (error: any) {
      console.error("Signup error:", error);
      setError(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <div className="bg-primary rounded-full w-8 h-8 flex items-center justify-center">
                <Home className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-xl">My Domain Student Living</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 py-12 bg-muted">
        <div className="container px-4 md:px-6">
          {success ? (
            <Card className="max-w-md mx-auto">
              <CardHeader className="text-center">
                <div className="mx-auto bg-green-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4 animate-pulse-slow">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl">Registration Successful!</CardTitle>
                <CardDescription>
                  Your registration has been submitted and is pending approval by an administrator.
                  You can log in now to check your application status.
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-center">
                <Link href="/portals/student">
                  <Button className="bg-primary hover:bg-primary/90">Go to Login</Button>
                </Link>
              </CardFooter>
            </Card>
          ) : (
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="text-2xl">Create an Account</CardTitle>
                <CardDescription>Fill in your details to sign up for My Domain Student Living.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">


                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your.name@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">First Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="surname">Last Name</Label>
                    <Input
                      id="surname"
                      name="surname"
                      value={formData.surname}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="0836795566"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="place_of_study">Place of Study</Label>
                    <Input
                      id="place_of_study"
                      name="place_of_study"
                      placeholder="University/College Name"
                      value={formData.place_of_study}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="room_number">Room Number</Label>
                    <Input
                      id="room_number"
                      name="room_number"
                      placeholder="101"
                      value={formData.room_number}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tenant_code">Tenant Code</Label>
                    <Input
                      id="tenant_code"
                      name="tenant_code"
                      placeholder="Your assigned tenant code"
                      value={formData.tenant_code}
                      onChange={handleChange}
                      required
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      This is very important as it will be used to identify the student and make requests.
                    </p>
                  </div>
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button type="submit" className="w-full mt-4" disabled={loading}>
                    {loading ? "Registering..." : "Register"}
                  </Button>
                </CardFooter>
              </form>
              <CardFooter className="flex justify-center border-t pt-4 text-sm">
                Already have an account?{" "}
                <Link href="/portals/student" className="ml-1 text-primary hover:underline">
                  Log in
                </Link>
              </CardFooter>
            </Card>
          )}
        </div>
      </main>

      <footer className="border-t py-6 md:py-0 bg-secondary text-white">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose md:text-left">
            © 2025 My Domain Student Living. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}