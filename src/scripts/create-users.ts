// Using CommonJS style imports for compatibility
const firebase = require('firebase/app');
const firestore = require('firebase/firestore');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Firebase configuration from environment variables
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
const app = firebase.initializeApp(firebaseConfig);
const db = firestore.getFirestore(app);

// Simplified input type for our sample data
type UserInput = {
  id: string;
  email: string;
  name?: string;
  role: 'student' | 'admin';
  requestDetails?: {
    accommodationType: string;
    location: string;
  } | null;
};

// Sample student users to create
const studentUsers: UserInput[] = [
  {
    id: 'student1',
    email: 'student1@example.com',
    name: 'Student One',
    role: 'student',
    requestDetails: {
      accommodationType: 'Single Room',
      location: 'West Campus'
    }
  },
  {
    id: 'student2',
    email: 'student2@example.com',
    name: 'Student Two',
    role: 'student',
    requestDetails: {
      accommodationType: 'Double Room',
      location: 'East Campus'
    }
  },
  {
    id: 'student3',
    email: 'student3@example.com',
    name: 'Student Three',
    role: 'student',
    requestDetails: {
      accommodationType: 'Studio',
      location: 'North Campus'
    }
  }
];

// Sample admin users to create
const adminUsers: UserInput[] = [
  {
    id: 'admin1',
    email: 'admin1@example.com',
    name: 'Admin One',
    role: 'admin',
    // Admin users don't need requestDetails
    requestDetails: null
  },
  {
    id: 'admin2',
    email: 'admin2@example.com',
    name: 'Admin Two',
    role: 'admin',
    // Admin users don't need requestDetails
    requestDetails: null
  }
];

// Function to manually add a user to Firestore
async function addUserToFirestore(userData: UserInput) {
  const userRef = firestore.doc(db, 'users', userData.id);
  const now = new Date();

  // Prepare the document data with typescript any to bypass type checking
  const docData: any = {
    id: userData.id,
    email: userData.email,
    name: userData.name || '',
    role: userData.role,
    createdAt: now,
    applicationStatus: userData.role === 'admin' ? 'accepted' : 'pending',
    communicationLog: []
  };

  // Only add requestDetails if it's not null and has values
  if (userData.requestDetails) {
    docData.requestDetails = {
      ...userData.requestDetails,
      dateSubmitted: now
    };
  }

  await firestore.setDoc(userRef, docData);
  return userData;
}

// Function to create all sample users
async function createSampleUsers() {
  console.log('🔥 Creating sample users in Firestore...');
  
  try {
    // Create student users
    for (const user of studentUsers) {
      await addUserToFirestore(user);
      console.log(`✅ Created student user: ${user.name} (${user.email})`);
    }
    
    // Create admin users
    for (const admin of adminUsers) {
      await addUserToFirestore(admin);
      console.log(`✅ Created admin user: ${admin.name} (${admin.email})`);
    }
    
    console.log('🎉 All sample users created successfully!');
  } catch (error) {
    console.error('❌ Error creating sample users:', error);
  }
}

// Execute the function
createSampleUsers().then(() => {
  console.log('Script execution completed.');
  process.exit(0);
}).catch(error => {
  console.error('Script execution failed:', error);
  process.exit(1);
}); 