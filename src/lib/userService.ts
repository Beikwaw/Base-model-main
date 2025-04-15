import { 
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from './firebase';

const USERS_COLLECTION = 'users';

export interface UserData {
  id: string;
  email: string;
  name?: string;
  role: 'user' | 'admin';
  createdAt: Date;
  applicationStatus?: string; // added applicationStatus property

  // Add any other user fields you need
}

export const createUser = async (userData: Omit<UserData, 'createdAt'>) => {
  const userRef = doc(db, USERS_COLLECTION, userData.id);
  await setDoc(userRef, {
    ...userData,
    createdAt: new Date(),
  });
};

export const getUserById = async (userId: string) => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return { id: userSnap.id, ...userSnap.data() } as UserData;
  }
  return null;
};

export const getAllUsers = async () => {
  const usersRef = collection(db, USERS_COLLECTION);
  const usersSnap = await getDocs(usersRef);
  return usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as UserData);
};

export const getAdminUsers = async () => {
  const usersRef = collection(db, USERS_COLLECTION);
  const adminQuery = query(usersRef, where('role', '==', 'admin'));
  const adminSnap = await getDocs(adminQuery);
  return adminSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as UserData);
};

export const updateUser = async (userId: string, updates: Partial<UserData>) => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  await updateDoc(userRef, updates);
};

export const deleteUser = async (userId: string) => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  await deleteDoc(userRef);
}; 