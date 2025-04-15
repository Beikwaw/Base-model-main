'use client';

import React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { createUser, getUserById } from '../lib/firestore';
import type { UserData } from '../lib/firestore';
import Cookies from 'js-cookie';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, surname: string) => Promise<void>;
  login: (email: string, password: string, userType: 'student' | 'admin' | 'newbie', rememberMe?: boolean) => Promise<UserData>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            const serializedData: UserData = {
              id: user.uid,
              email: user.email || '',
              name: data.name || undefined,
              surname: data.surname || '',
              full_name: `${data.name || ''} ${data.surname || ''}`,
              phone: data.phone || undefined,
              place_of_study: data.place_of_study || '',
              room_number: data.room_number || '',
              tenant_code: data.tenant_code || '',
              role: data.role || 'student',
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date(),
              applicationStatus: data.applicationStatus || undefined,
              requestDetails: data.requestDetails ? {
                accommodationType: data.requestDetails.accommodationType || '',
                location: data.requestDetails.location || '',
                dateSubmitted: data.requestDetails.dateSubmitted?.toDate() || new Date()
              } : undefined,
              communicationLog: data.communicationLog?.map((log: any) => ({
                ...log,
                timestamp: log.timestamp?.toDate() || new Date()
              })) || [],
              isGuest: data.isGuest || false
            };
            
            setUserData(serializedData);
            
            // Set cookies if they don't exist (for persistent login)
            if (!Cookies.get('userType')) {
              Cookies.set('userType', data.role);
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUserData(null);
        }
      } else {
        setUserData(null);
        // Clear cookies on logout/session end
        Cookies.remove('userType');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string, surname: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user) {
        throw new Error('Failed to create user account');
      }

      const userData: Omit<UserData, 'createdAt' | 'updatedAt' | 'communicationLog'> = {
        id: user.uid,
        email: user.email || '',
        name: name || undefined,
        surname: surname,
        full_name: `${name || ''} ${surname}`,
        phone: undefined,
        role: 'newbie',
        place_of_study: '',
        room_number: '',
        tenant_code: '',
        applicationStatus: 'pending',
        requestDetails: undefined,
        isGuest: false
      };

      await createUser(userData);
      setUser(user);
      
      // Create a complete UserData object with default values for omitted fields
      const completeUserData: UserData = {
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
        communicationLog: [],
        isGuest: false
      };
      
      setUserData(completeUserData);
      router.push('/pending-approval');
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string, userType: 'student' | 'admin' | 'newbie', rememberMe?: boolean) => {
    try {
      // Set persistence before signing in
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      if (!user) {
        throw new Error('Authentication failed');
      }

      // Get user data from Firestore
      const userData = await getUserById(user.uid);
      
      if (!userData) {
        throw new Error('User data not found');
      }

      // Check if user type matches
      if (userData.role !== userType) {
        throw new Error('Invalid user type');
      }

      // Check application status for newbies
      if (userData.role === 'newbie' && userData.applicationStatus !== 'pending') {
        throw new Error('Your application has been processed. Please check your email for updates.');
      }

      // Check if student is active or is a guest
      if (userData.role === 'student') {
        if (userData.applicationStatus !== 'accepted' && !userData.isGuest) {
          throw new Error('Your account is not active. Please contact support.');
        }
      }

      // Set cookies if they don't exist (for persistent login)
      if (!Cookies.get('userType')) {
        Cookies.set('userType', userData.role);
      }

      setUser(user);
      setUserData(userData);
      return userData;
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code === 'auth/invalid-credential') {
        throw new Error('Invalid email or password');
      } else if (error.code === 'auth/user-not-found') {
        throw new Error('User not found');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Invalid password');
      } else {
        throw new Error(error.message || 'Authentication failed');
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      Cookies.remove('userType');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, signUp, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}