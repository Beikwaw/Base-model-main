import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getFirestore, setDoc } from 'firebase/firestore';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const testUsers = [
  {
    email: 'admin@example.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin' as const
  },
  {
    email: 'student@example.com',
    password: 'student123',
    name: 'Student User',
    role: 'student' as const,
    requestDetails: {
      accommodationType: 'Single Room',
      location: 'Main Campus'
    }
  }
];

async function createTestUsers() {
  for (const user of testUsers) {
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        user.email,
        user.password
      );

      const now = new Date();
      
      // Create user document in Firestore directly
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        id: userCredential.user.uid,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: now,
        applicationStatus: 'pending',
        requestDetails: user.role === 'student' ? {
          ...user.requestDetails,
          dateSubmitted: now
        } : undefined,
        communicationLog: []
      });

      console.log(`Created ${user.role} user:`, user.email);
    } catch (error) {
      console.error(`Error creating ${user.role} user:`, error);
    }
  }

  // Exit the process after creating users
  process.exit(0);
}

createTestUsers(); 