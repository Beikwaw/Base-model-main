'use client';

export const dynamic = 'force-dynamic'

import React from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield, Lock, User, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[url(../assets/bgmain.jpg)]  bg-cover bg-center  ">
      <header className="sticky px-5 top-0 z-50 w-full border-b bg-black  backdrop-blur supports-[backdrop-filter]:bg-black/60">
        <div className="container flex h-16 items-center ">
          <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <div className="bg-primary rounded-full w-8 h-8 flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-xl text-white">My Domain Student Living</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center bg-black/40 h-full w-full flex-col gap-5">
        <div className="w-full max-w-4xl pt-4 text-center">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-5xl lg:text-6xl text-white font-bold  p-2">Welcome to My Domain</h1>
          </div>

          <div className="flex flex-col md:flex-row gap-5 justify-center items-center">
            <Link href="/portals/admin" className="w-fit">
              <Button size="lg" className="w-fit font-normal text-[14px] md:text-[18px] lg:text-[20px] p-6 px-8  bg-[#dc2625] hover:bg-[#dc2625]/70">
                <Lock className="h-6 w-6 text-white" />
                Admin Portal
              </Button>
            </Link>
            <Link href="/portals/student" className="w-fit">
              <Button size="lg" className="w-fit font-normal text-[14px] md:text-[18px] lg:text-[20px] p-6 px-8 bg-[#3c82f5] hover:bg-[#3c82f5]/70">
                <User className="h-8 w-8 text-white" />
                Student Portal
              </Button>
            </Link>
          </div>

         
        </div>
        <Link href="/register" className="text-white text-lg hover:underline mt-4">
            New user ? Register here  
            <ArrowRight className="h-5 w-5 text-white inline" />
          </Link>
      </main>

      <footer className="border-t py-2 text-white px-5 flex items-center justify-center">
        <div className="container  w-full flex flex-col items-center justify-between gap-4  md:flex-row">
          <p className="text-center text-sm leading-loose md:text-left">
            © 2025 My Domain Student Living. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-sm hover:underline">
              Terms
            </Link>
            <Link href="#" className="text-sm hover:underline">
              Privacy
            </Link>
            <Link href="https://www.mydomainliving.co.za/contact" className="text-sm hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
} 