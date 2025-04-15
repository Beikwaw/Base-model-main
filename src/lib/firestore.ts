import { 
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  arrayUnion,
  Timestamp,
  addDoc,
  orderBy,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { auth } from './firebase';

const USERS_COLLECTION = 'users';
const ADMINS_COLLECTION = 'admins';

export interface AdminData {
  id: string;
  userId: string;
  email: string;
  type: 'superadmin' | 'admin-finance' | 'admin-maintenance' | 'admin-security' | 'admin-complaints' | 'admin-guest-management';
  role: 'admin' | 'superadmin';
  name: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  permissions?: string[];
}

export interface UserData {
  id: string;
  email: string;
  name?: string;
  surname: string;
  full_name: string;
  phone?: string;
  role: 'student' | 'newbie';
  createdAt: Date;
  updatedAt: Date;
  applicationStatus?: 'accepted' | 'denied' | 'pending';
  place_of_study: string;
  room_number: string;
  tenant_code: string;
  isGuest?: boolean;
  requestDetails?: {
    accommodationType: string;
    location: string;
    dateSubmitted: Date;
  };
  communicationLog?: {
    message: string;
    sentBy: 'admin' | 'superadmin' | 'student';
    timestamp: Date;
  }[];
}

export interface Complaint {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: 'maintenance' | 'security' | 'noise' | 'cleanliness' | 'other';
  location?: string;
  status: 'pending' | 'in_progress' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
  adminResponse?: string;
}

export interface SleepoverRequest {
  id: string;
  userId: string;
  guestName: string;
  guestSurname: string;
  guestPhone: string;
  roomNumber: string;
  tenantCode: string;
  additionalGuests: {
    name: string;
    surname: string;
    phoneNumber: string;
  }[];
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
  adminResponse?: string;
  securityCode?: string;
  isActive?: boolean;
  checkInTime?: string | null;
  signOutTime?: Date | null;
}

export interface MaintenanceRequest {
  id: string;
  userId: string;
  title: string;
  category: 'bedroom' | 'bathroom' | 'kitchen' | 'furniture' | 'other';
  description: string;
  roomNumber: string;
  timeSlot: string;
  preferredDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
  adminResponse?: string;
}

export interface GuestRegistration {
  id: string;
  userId: string;
  guestName: string;
  guestEmail: string;
  visitDate: string;
  visitTime: string;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
  adminResponse?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'maintenance' | 'complaint' | 'sleepover' | 'guest' | 'message';
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface FirestoreUser {
  id: string;
  name: string;
  surname: string;
  tenant_code: string;
  room_number: string;
  email: string;
  phone?: string;
  role: 'student' | 'admin';
}

interface FirestorePayment {
  id: string;
  userId: string;
  amount: number;
  date: Date;
  type: string;
  status: 'paid' | 'pending' | 'overdue';
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DailyReport {
  date: Date;
  sleepovers: {
    total: number;
    resolved: number;
    denied: number;
    pending: number;
  };
  maintenance: {
    total: number;
    resolved: number;
    denied: number;
    pending: number;
  };
  complaints: {
    total: number;
    resolved: number;
    denied: number;
    pending: number;
  };
}

export interface DetailedReport extends DailyReport {
  sleepovers: {
    total: number;
    resolved: number;
    denied: number;
    pending: number;
    items: Array<{
      id: string;
      studentName: string;
      date: Date;
      status: 'resolved' | 'denied' | 'pending';
      details: string;
    }>;
  };
  maintenance: {
    total: number;
    resolved: number;
    denied: number
    pending: number;
    items: Array<{
      id: string;
      studentName: string;
      date: Date;
      status: 'resolved' | 'denied' | 'pending';
      details: string;
    }>;
  };
  complaints: {
    total: number;
    resolved: number;
    denied: number;
    pending: number;
    items: Array<{
      id: string;
      studentName: string;
      date: Date;
      status: 'resolved' | 'denied' | 'pending';
      details: string;
    }>;
  };
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  createdBy: string;
  createdByName: string;
  status: 'active' | 'inactive';
  expiresAt?: Date;
}

export type Guest = {
  id: string;
  name: string;
  roomNumber: string;
  status: 'active' | 'checked-out';
  checkInTime?: string;
  checkOutTime?: string;
  hostName: string;
  hostId: string;
};

export const createUser = async (userData: Omit<UserData, 'createdAt' | 'updatedAt' | 'communicationLog'>): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userData.id);
    const now = serverTimestamp();

    await setDoc(userRef, {
      ...userData,
      createdAt: now,
      updatedAt: now,
      communicationLog: [],
      isGuest: userData.isGuest || false
    });
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const getUserById = async (userId: string): Promise<UserData | null> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return null;
    }

    const data = userDoc.data();
    return {
      id: userDoc.id,
      email: data.email,
      name: data.name,
      surname: data.surname,
      full_name: data.full_name,
      phone: data.phone,
      role: data.role,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      applicationStatus: data.applicationStatus,
      place_of_study: data.place_of_study,
      room_number: data.room_number,
      tenant_code: data.tenant_code,
      isGuest: data.isGuest || false,
      requestDetails: data.requestDetails ? {
        ...data.requestDetails,
        dateSubmitted: data.requestDetails.dateSubmitted?.toDate() || new Date()
      } : undefined,
      communicationLog: data.communicationLog?.map((log: any) => ({
        ...log,
        timestamp: log.timestamp?.toDate() || new Date()
      })) || []
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export const getAllUsers = async () => {
  const usersRef = collection(db, USERS_COLLECTION);
  const usersSnap = await getDocs(usersRef);
  return usersSnap.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      communicationLog: data.communicationLog?.map((log: any) => ({
        ...log,
        timestamp: log.timestamp?.toDate() || new Date()
      })) || []
    } as UserData;
  });
};

export const getPendingApplications = async () => {
  const usersRef = collection(db, USERS_COLLECTION);
  
  // Get all users who have an applicationStatus (pending, accepted, or denied)
  const querySnapshot = await getDocs(
    query(usersRef, 
      where('role', 'in', ['student', 'newbie'])
    )
  );

  const applications = querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      communicationLog: data.communicationLog?.map((log: any) => ({
        ...log,
        timestamp: log.timestamp?.toDate() || new Date()
      })) || []
    } as UserData;
  });

  // Sort applications by date, with most recent first
  return applications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

export const processRequest = async (
  userId: string,
  status: 'accepted' | 'denied',
  message: string,
  adminId: string
): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();
    const currentStatus = userData.applicationStatus;

    if (currentStatus !== 'pending') {
      throw new Error('Application has already been processed');
    }

    const batch = writeBatch(db);
    const now = new Date();
    
    // Update user document with new role and status
    const userUpdates = {
      applicationStatus: status,
      role: status === 'accepted' ? 'student' : 'newbie',
      updatedAt: now,
      communicationLog: arrayUnion({
        type: 'application_status_change',
        status,
        message,
        timestamp: now,
        adminId
      })
    };
    
    batch.update(userRef, userUpdates);

    // If accepted, create/update student profile
    if (status === 'accepted') {
      const studentRef = doc(db, 'students', userId);
      const studentData = {
        userId,
        email: userData.email,
        name: userData.name,
        surname: userData.surname,
        full_name: userData.full_name,
        phone: userData.phone,
        place_of_study: userData.place_of_study,
        room_number: userData.room_number,
        tenant_code: userData.tenant_code,
        role: 'student',
        applicationStatus: 'accepted',
        createdAt: now,
        updatedAt: now,
        status: 'active'
      };
      
      // Create notification for the user
      const notificationRef = doc(collection(db, 'notifications'));
      batch.set(notificationRef, {
        userId,
        title: status === 'accepted' ? 'Application Approved' : 'Application Denied',
        message,
        type: 'application',
        read: false,
        createdAt: now,
        updatedAt: now
      });

      batch.set(studentRef, studentData);
      
      // Also update the main user document with student data
      batch.update(userRef, studentData);
    }

    await batch.commit();
  } catch (error) {
    console.error('Error processing request:', error);
    throw error;
  }
};

export const addCommunication = async (
  userId: string,
  message: string,
  sentBy: 'admin' | 'student'
) => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  const now = new Date();

  await updateDoc(userRef, {
    communicationLog: arrayUnion({
      message,
      sentBy,
      timestamp: Timestamp.fromDate(now)
    })
  });
};

export const updateUser = async (userId: string, updates: Partial<UserData>) => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  await updateDoc(userRef, updates);
};

export const deleteUser = async (userId: string) => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  await deleteDoc(userRef);
};

// Admin functions
export const createAdmin = async (adminData: Omit<AdminData, 'id' | 'createdAt' | 'updatedAt'>) => {
  const adminsRef = collection(db, ADMINS_COLLECTION);
  const now = new Date();
  
  const docRef = await addDoc(adminsRef, {
    ...adminData,
    createdAt: now,
    updatedAt: now
  });

  return docRef.id;
};

export const getAdminByUserId = async (userId: string) => {
  const adminsRef = collection(db, ADMINS_COLLECTION);
  const q = query(adminsRef, where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }

  const doc = querySnapshot.docs[0];
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
    lastLogin: data.lastLogin?.toDate()
  } as AdminData;
};

export const getAllAdmins = async () => {
  const adminsRef = collection(db, ADMINS_COLLECTION);
  const adminsSnap = await getDocs(adminsRef);
  
  return adminsSnap.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      lastLogin: data.lastLogin?.toDate()
    } as AdminData;
  });
};

export const updateAdmin = async (adminId: string, updates: Partial<Omit<AdminData, 'id'>>) => {
  const adminRef = doc(db, ADMINS_COLLECTION, adminId);
  const now = new Date();
  
  await updateDoc(adminRef, {
    ...updates,
    updatedAt: now
  });
};

export const deleteAdmin = async (adminId: string) => {
  const adminRef = doc(db, ADMINS_COLLECTION, adminId);
  await deleteDoc(adminRef);
};

export const updateAdminLastLogin = async (adminId: string) => {
  const adminRef = doc(db, ADMINS_COLLECTION, adminId);
  const now = new Date();
  
  await updateDoc(adminRef, {
    lastLogin: now,
    updatedAt: now
  });
};

export const createComplaint = async (complaint: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt' | 'adminResponse'>) => {
  const complaintsRef = collection(db, 'complaints');
  const now = new Date();
  
  const docRef = await addDoc(complaintsRef, {
    ...complaint,

    adminResponse: '',
    createdAt: now,
    updatedAt: now
  });

  return docRef.id;
};

export const createSleepoverRequest = async (data: Omit<SleepoverRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<string> => {
  try {
    const requestData: Omit<SleepoverRequest, 'id'> = {
      ...data,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      securityCode: '3693',
      isActive: false
    };

    const docRef = await addDoc(collection(db, 'sleepover_requests'), requestData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating sleepover request:', error);
    throw error;
  }
};

export const createMaintenanceRequest = async (request: Omit<MaintenanceRequest, 'id' | 'createdAt' | 'updatedAt' | 'adminResponse'>) => {
  const requestsRef = collection(db, 'maintenance_requests');
  const now = new Date();
  
  const docRef = await addDoc(requestsRef, {
    ...request,

    adminResponse: '',
    createdAt: now,
    updatedAt: now
  });

  return docRef.id;
};

export const getComplaints = async () => {
  const complaintsRef = collection(db, 'complaints');
  const complaintsSnap = await getDocs(complaintsRef);
  return complaintsSnap.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    };
  }) as Complaint[];
};

export const getSleepoverRequests = async () => {
  const requestsRef = collection(db, 'sleepover_requests');
  const requestsSnap = await getDocs(requestsRef);
  return requestsSnap.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt instanceof Date ? data.createdAt : data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt instanceof Date ? data.updatedAt : data.updatedAt?.toDate?.() || new Date(),
      startDate: data.startDate instanceof Date ? data.startDate : data.startDate?.toDate?.() || new Date(),
      endDate: data.endDate instanceof Date ? data.endDate : data.endDate?.toDate?.() || new Date(),
      signOutTime: data.signOutTime instanceof Date ? data.signOutTime : data.signOutTime?.toDate?.() || null
    };
  }) as SleepoverRequest[];
};

export const getMaintenanceRequests = async () => {
  const requestsRef = collection(db, 'maintenance_requests');
  const requestsSnap = await getDocs(requestsRef);
  return requestsSnap.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    };
  }) as MaintenanceRequest[];
};

export const modifyComplaintStatus = async (complaintId: string, status: Complaint['status'], adminResponse?: string) => {
  const complaintRef = doc(db, 'complaints', complaintId);
  await updateDoc(complaintRef, {
    status,
    adminResponse,
    updatedAt: new Date()
  });
};

export const updateSleepoverStatus = async (requestId: string, status: SleepoverRequest['status'], adminResponse?: string) => {
  try {
    const requestRef = doc(db, 'sleepover_requests', requestId);
    const requestSnap = await getDoc(requestRef);
    
    if (!requestSnap.exists()) {
      throw new Error('Sleepover request not found');
    }

    const request = requestSnap.data();
    const now = new Date();

    // Only include adminResponse in the update if it's provided
    const updateData: any = {
      status,
      updatedAt: now,
      adminResponse: adminResponse || ''
    };

    // If approved, set isActive to true and add checkInTime
    if (status === 'approved') {
      updateData.isActive = true;
      updateData.checkInTime = now.toISOString();
    }

    // If rejected, set isActive to false
    if (status === 'rejected') {
      updateData.isActive = false;
    }

    await updateDoc(requestRef, updateData);

    // Create notification for the user
    await createNotification({
      userId: request.userId,
      title: 'Sleepover Request Update',
      message: `Your sleepover request for ${request.guestName} ${request.guestSurname} has been ${status}`,
      type: 'sleepover',
      read: false
    });

    return { success: true, message: `Sleepover request ${status} successfully` };
  } catch (error) {
    console.error('Error updating sleepover status:', error);
    throw error;
  }
};

export const updateMaintenanceRequestStatus = async (requestId: string, status: MaintenanceRequest['status'], adminResponse?: string) => {
  const requestRef = doc(db, 'maintenance_requests', requestId);
  await updateDoc(requestRef, {
    status,
    adminResponse,
    updatedAt: new Date()
  });
};

export const createGuestRegistration = async (registration: Omit<GuestRegistration, 'id' | 'createdAt' | 'updatedAt' | 'adminResponse'>) => {
  const registrationsRef = collection(db, 'guest_registrations');
  const now = new Date();
  
  const docRef = await addDoc(registrationsRef, {
    ...registration,

    adminResponse: '',
    createdAt: now,
    updatedAt: now
  });

  return docRef.id;
};

export const getGuestRegistrations = async (userId: string) => {
  const registrationsRef = collection(db, 'guest_registrations');
  const registrationsQuery = query(registrationsRef, where('userId', '==', userId));
  const registrationsSnap = await getDocs(registrationsQuery);
  return registrationsSnap.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    };
  }) as GuestRegistration[];
};

export const updateRequestStatus = async (requestId: string, status: string) => {
  const requestRef = doc(db, 'requests', requestId);
  await updateDoc(requestRef, {
    status
  });
};

export const assignStaffToRequest = async (requestId: string, staffId: string) => {
  const requestRef = doc(db, 'requests', requestId);
  await updateDoc(requestRef, {
    staffId
  });
};

export async function getAllComplaints() {
  const complaintsRef = collection(db, 'complaints');
  const q = query(complaintsRef, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
  }));
}

export const updateComplaintStatus = async (id: string, status: 'pending' | 'in_progress' | 'resolved' | 'rejected', adminResponse?: string) => {
  const complaintRef = doc(db, 'complaints', id);
  const complaintSnap = await getDoc(complaintRef);
  
  if (!complaintSnap.exists()) {
    throw new Error('Complaint not found');
  }

  const complaint = complaintSnap.data();
  const now = new Date();

  // Only include adminResponse in the update if it's provided
  const updateData: any = {
    status,
    updatedAt: now
  };

  if (adminResponse !== undefined) {
    updateData.adminResponse = adminResponse;
  }

  await updateDoc(complaintRef, updateData);

  // Create notification for the user
  await createNotification({
    userId: complaint.userId,
    title: 'Complaint Update',
    message: `Your complaint "${complaint.title}" has been ${status}`,
    type: 'complaint',
    read: false
  });
};

export async function assignStaffToComplaint(complaintId: string, staffId: string) {
  const complaintRef = doc(db, 'complaints', complaintId);
  await updateDoc(complaintRef, {
    assignedStaffId: staffId,
    updatedAt: serverTimestamp(),
  });
}

export async function getAllMaintenanceRequests() {
  const maintenanceRef = collection(db, 'maintenance_requests');
  const q = query(maintenanceRef, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt instanceof Date ? data.createdAt : data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt instanceof Date ? data.updatedAt : data.updatedAt?.toDate?.() || new Date(),
      preferredDate: data.preferredDate instanceof Date ? data.preferredDate : data.preferredDate?.toDate?.() || null
    };
  });
}

export const updateMaintenanceStatus = async (id: string, status: 'pending' | 'in_progress' | 'completed' | 'rejected', adminResponse?: string) => {
  const maintenanceRef = doc(db, 'maintenance_requests', id);
  const maintenanceSnap = await getDoc(maintenanceRef);
  
  if (!maintenanceSnap.exists()) {
    throw new Error('Maintenance request not found');
  }

  const maintenance = maintenanceSnap.data();
  const now = new Date();

  // Only include adminResponse in the update if it's provided
  const updateData: any = {
    status,
    updatedAt: now
  };

  if (adminResponse !== undefined) {
    updateData.adminResponse = adminResponse;
  }

  await updateDoc(maintenanceRef, updateData);

  // Create notification for the user
  await createNotification({
    userId: maintenance.userId,
    title: 'Maintenance Request Update',
    message: `Your maintenance request "${maintenance.title}" has been ${status}`,
    type: 'maintenance',
    read: false
  });
};

export async function assignStaffToMaintenance(maintenanceId: string, staffId: string) {
  const maintenanceRef = doc(db, 'maintenance', maintenanceId);
  await updateDoc(maintenanceRef, {
    assignedStaffId: staffId,
    updatedAt: serverTimestamp(),
  });
}

export async function getAllSleepoverRequests() {
  const sleepoverRef = collection(db, 'sleepover_requests');
  const q = query(sleepoverRef, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt instanceof Date ? data.createdAt : data.createdAt?.toDate?.() || new Date(),
      startDate: data.startDate instanceof Date ? data.startDate : data.startDate?.toDate?.() || new Date(),
      endDate: data.endDate instanceof Date ? data.endDate : data.endDate?.toDate?.() || new Date(),
      updatedAt: data.updatedAt instanceof Date ? data.updatedAt : data.updatedAt?.toDate?.() || new Date(),
      signOutTime: data.signOutTime instanceof Date ? data.signOutTime : data.signOutTime?.toDate?.() || null
    };
  });
}

export async function getAllGuestRequests() {
  const guestRef = collection(db, 'guests');
  const q = query(guestRef);
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs
    .map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        checkInTime: data.checkInTime,
        checkOutTime: data.checkOutTime,
        fromDate: data.fromDate
      };
    })
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function getMyGuestRequests(userId:string){
  const guestRef = collection(db, 'guests');
  const q = query(guestRef, where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs
    .map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    }))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function getMyMaintenanceRequests(userId:string){
  const maintenanceRef = collection(db, 'maintenance_requests');
  const q = query(maintenanceRef, where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs
    .map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    }))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export const updateGuestStatus = async (id: string, status: 'pending' | 'approved' | 'rejected', adminResponse?: string) => {
  const guestRef = doc(db, 'guests', id);
  const guestSnap = await getDoc(guestRef);
  
  if (!guestSnap.exists()) {
    throw new Error('Guest request not found');
  }

  const guest = guestSnap.data();
  const now = new Date();

  const updateData: any = {
    status,
    updatedAt: now
  };

  if (adminResponse !== undefined) {
    updateData.adminResponse = adminResponse;
  }

  // If status is rejected (checked out), add checkOutTime
  if (status === 'rejected') {
    updateData.checkOutTime = now.toISOString();
  }

  await updateDoc(guestRef, updateData);

  // Create notification for the user
  await createNotification({
    userId: guest.userId,
    title: 'Guest Registration Update',
    message: `Guest registration for ${guest.firstName} ${guest.lastName} has been ${status}`,
    type: 'guest',
    read: false
  });
};

//student api calls
export async function getMyComplaints(userId:string){
  const complaintsRef = collection(db, 'complaints');
  const q = query(complaintsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
  }));
  
}

export async function getMySleepoverRequests(userId: string) {
  try {
    const sleepoverRef = collection(db, 'sleepover_requests');
    const q = query(
      sleepoverRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        guestName: data.guestName,
        guestSurname: data.guestSurname,
        guestPhone: data.guestPhone,
        roomNumber: data.roomNumber,
        tenantCode: data.tenantCode,
        additionalGuests: data.additionalGuests || [],
        startDate: data.startDate instanceof Date ? data.startDate : data.startDate?.toDate?.() || new Date(),
        endDate: data.endDate instanceof Date ? data.endDate : data.endDate?.toDate?.() || new Date(),
        status: data.status || 'pending',
        createdAt: data.createdAt instanceof Date ? data.createdAt : data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt instanceof Date ? data.updatedAt : data.updatedAt?.toDate?.() || new Date(),
        adminResponse: data.adminResponse || '',
        securityCode: data.securityCode || '',
        isActive: data.isActive || false,
        checkInTime: data.checkInTime || null,
        signOutTime: data.signOutTime instanceof Date ? data.signOutTime : data.signOutTime?.toDate?.() || null
      } as SleepoverRequest;
    });
  } catch (error) {
    console.error('Error fetching sleepover requests:', error);
    throw error;
  }
}

export async function getRequestDetails(requestId: string) {
  // Implement the logic to fetch request details by ID
  // This is a placeholder implementation
  return {
    id: requestId,
    title: 'Sample Request',
    userName: 'John Doe',
    roomNumber: '101',
    description: 'Sample description',
    priority: 'High',
    status: 'pending',
  };
}

export async function setCheckoutCode(code: number) {
  const checkoutRef = doc(collection(db, 'checkout'));
  const now = new Date();
  await setDoc(checkoutRef, {
    code,
    createdAt: now,
  });
}

export async function getCheckoutCode() {
  const checkoutRef = collection(db, 'checkout');
  const querySnapshot = await getDocs(checkoutRef);
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      code: doc.data().code.toString(), // Ensure the code is a string
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    };
  }
  return null;
}

export async function updateCheckoutCode(newCode: number) {
  const checkoutRef = collection(db, 'checkout');
  const querySnapshot = await getDocs(checkoutRef);
  if (!querySnapshot.empty) {
    const docRef = querySnapshot.docs[0].ref;
    await updateDoc(docRef, {
      code: newCode,
      updatedAt: serverTimestamp(),
    });
  }
}

export const createNotification = async (notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>) => {
  const notificationsRef = collection(db, 'notifications');
  const now = new Date();
  
  const docRef = await addDoc(notificationsRef, {
    ...notification,
    createdAt: now,
    updatedAt: now
  });
  
  return { id: docRef.id, ...notification, createdAt: now, updatedAt: now } as Notification;
};

export const getUserNotifications = async (userId: string) => {
  const notificationsRef = collection(db, 'notifications');
  const q = query(notificationsRef, where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    };
  }) as Notification[];
};

export const markNotificationAsRead = async (notificationId: string) => {
  const notificationRef = doc(db, 'notifications', notificationId);
  await updateDoc(notificationRef, {
    read: true,
    updatedAt: new Date()
  });
};

export const markAllNotificationsAsRead = async (userId: string) => {
  const notificationsRef = collection(db, 'notifications');
  const q = query(notificationsRef, where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  
  const batch = writeBatch(db);
  querySnapshot.docs.forEach(doc => {
    batch.update(doc.ref, {
      read: true,
      updatedAt: new Date()
    });
  });
  
  await batch.commit();
};

export async function getAnalyticsData(timeRange: "days" | "weeks" | "months") {
  const now = new Date();
  let startDate: Date;
  let dateFormat: string;

  // Calculate start date based on time range
  switch (timeRange) {
    case "days":
      startDate = new Date(now.setDate(now.getDate() - 14));
      dateFormat = "MMM dd";
      break;
    case "weeks":
      startDate = new Date(now.setDate(now.getDate() - 42)); // 6 weeks
      dateFormat = "MMM dd";
      break;
    case "months":
      startDate = new Date(now.setMonth(now.getMonth() - 6));
      dateFormat = "MMM yyyy";
      break;
  }

  // Create a map to store aggregated data by date
  const dataMap = new Map<string, {
    complaints: number;
    maintenance: number;
    sleepover: number;
    guests: number;
  }>();

  // Initialize all dates in the range with zero counts
  let currentDate = new Date(startDate);
  while (currentDate <= new Date()) {
    const dateKey = currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: timeRange === 'months' ? 'numeric' : undefined });
    dataMap.set(dateKey, { complaints: 0, maintenance: 0, sleepover: 0, guests: 0 });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  try {
    // Fetch data from all collections without complex queries
    const [complaintsSnap, maintenanceSnap, sleepoverSnap, guestSnap] = await Promise.all([
      getDocs(collection(db, 'complaints')),
      getDocs(collection(db, 'maintenance_requests')),
      getDocs(collection(db, 'sleepover_requests')),
      getDocs(collection(db, 'guests'))
    ]);

    // Helper function to safely convert Firestore timestamp to Date
    const safeToDate = (timestamp: any) => {
      if (timestamp instanceof Date) return timestamp;
      if (timestamp?.toDate) return timestamp.toDate();
      return new Date();
    };

    // Helper function to check if date is within range
    const isWithinRange = (date: Date) => {
      return date >= startDate && date <= new Date();
    };

    // Aggregate complaints data
    complaintsSnap.docs.forEach(doc => {
      const data = doc.data();
      const date = safeToDate(data.createdAt);
      if (isWithinRange(date)) {
        const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: timeRange === 'months' ? 'numeric' : undefined });
        const current = dataMap.get(dateKey) || { complaints: 0, maintenance: 0, sleepover: 0, guests: 0 };
        dataMap.set(dateKey, { ...current, complaints: current.complaints + 1 });
      }
    });

    // Aggregate maintenance data
    maintenanceSnap.docs.forEach(doc => {
      const data = doc.data();
      const date = safeToDate(data.createdAt);
      if (isWithinRange(date)) {
        const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: timeRange === 'months' ? 'numeric' : undefined });
        const current = dataMap.get(dateKey) || { complaints: 0, maintenance: 0, sleepover: 0, guests: 0 };
        dataMap.set(dateKey, { ...current, maintenance: current.maintenance + 1 });
      }
    });

    // Aggregate sleepover data
    sleepoverSnap.docs.forEach(doc => {
      const data = doc.data();
      const date = safeToDate(data.createdAt);
      if (isWithinRange(date)) {
        const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: timeRange === 'months' ? 'numeric' : undefined });
        const current = dataMap.get(dateKey) || { complaints: 0, maintenance: 0, sleepover: 0, guests: 0 };
        dataMap.set(dateKey, { ...current, sleepover: current.sleepover + 1 });
      }
    });

    // Aggregate guest data
    guestSnap.docs.forEach(doc => {
      const data = doc.data();
      const date = safeToDate(data.createdAt);
      if (isWithinRange(date)) {
        const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: timeRange === 'months' ? 'numeric' : undefined });
        const current = dataMap.get(dateKey) || { complaints: 0, maintenance: 0, sleepover: 0, guests: 0 };
        dataMap.set(dateKey, { ...current, guests: current.guests + 1 });
      }
    });

    // Convert map to array and sort by date
    return Array.from(dataMap.entries())
      .map(([date, counts]) => ({
        date,
        ...counts
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    throw error;
  }
}

export const getUserByTenantCode = async (tenantCode: string): Promise<FirestoreUser> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('tenant_code', '==', tenantCode));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('Student not found');
    }

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as FirestoreUser;
  } catch (error) {
    console.error('Error getting user by tenant code:', error);
    throw error;
  }
};

// Finance-related functions
export const getStudentFinanceData = async (tenantCode: string) => {
  try {
    // First get the user by tenant code
    const user = await getUserByTenantCode(tenantCode);
    if (!user) {
      throw new Error('Student not found');
    }

    // Get payment history
    const paymentsRef = collection(db, 'payments');
    const paymentsQuery = query(
      paymentsRef,
      where('userId', '==', user.id),
      orderBy('date', 'desc')
    );
    const paymentsSnap = await getDocs(paymentsQuery);
    const paymentHistory: FirestorePayment[] = paymentsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    })) as FirestorePayment[];

    // Calculate outstanding balance
    const outstandingBalance = paymentHistory.reduce((total, payment) => {
      if (payment.status === 'pending' || payment.status === 'overdue') {
        return total + payment.amount;
      }
      return total;
    }, 0);

    // Get next payment due
    const pendingPayments = paymentHistory.filter(
      payment => payment.status === 'pending'
    );
    const nextPaymentDue = pendingPayments.length > 0
      ? pendingPayments[0].date
      : new Date();

    return {
      fullName: `${user.name || ''} ${user.surname || ''}`.trim(),
      tenantCode: user.tenant_code,
      roomNumber: user.room_number,
      email: user.email,
      phone: user.phone || '',
      paymentHistory,
      outstandingBalance,
      nextPaymentDue
    };
  } catch (error) {
    console.error('Error getting student finance data:', error);
    throw error;
  }
};

export const getStudentFinanceReports = async (userId: string) => {
  try {
    const reportsRef = collection(db, 'financial_reports');
    const reportsQuery = query(
      reportsRef,
      where('userId', '==', userId),
      orderBy('reportDate', 'desc')
    );
    const reportsSnap = await getDocs(reportsQuery);

    return reportsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      reportDate: doc.data().reportDate.toDate(),
      createdAt: doc.data().createdAt?.toDate()
    }));
  } catch (error) {
    console.error('Error getting finance reports:', error);
    throw error;
  }
};

export const createFinanceReport = async (
  userId: string,
  reportData: {
    tenantCode: string;
    reportDate: Date;
    reportContent: string;
  }
) => {
  try {
    const reportsRef = collection(db, 'financial_reports');
    const newReport = {
      userId,
      tenantCode: reportData.tenantCode,
      reportDate: reportData.reportDate,
      reportData: reportData.reportContent,
      createdAt: new Date()
    };

    const docRef = await addDoc(reportsRef, newReport);
    return docRef.id;
  } catch (error) {
    console.error('Error creating finance report:', error);
    throw error;
  }
};

export const recordPayment = async (
  userId: string,
  paymentData: {
    amount: number;
    type: 'rent' | 'deposit' | 'fine' | 'other';
    description: string;
    date: Date;
    status: 'paid' | 'pending' | 'overdue';
  }
) => {
  try {
    const paymentsRef = collection(db, 'payments');
    const newPayment = {
      userId,
      ...paymentData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await addDoc(paymentsRef, newPayment);
    return docRef.id;
  } catch (error) {
    console.error('Error recording payment:', error);
    throw error;
  }
};

// Announcement-related functions
export const createAnnouncement = async (
  announcement: Omit<Announcement, 'id' | 'createdAt' | 'createdBy' | 'createdByName'>
) => {
  try {
    const announcementRef = collection(db, 'announcements');
    const newAnnouncement = {
      ...announcement,
      createdAt: serverTimestamp(),
      createdBy: auth.currentUser?.uid || '',
      createdByName: auth.currentUser?.displayName || 'Unknown Admin',
      id: '',
      status: 'active' as const
    };

    const docRef = await addDoc(announcementRef, newAnnouncement);
    await updateDoc(docRef, { id: docRef.id });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating announcement:', error);
    throw error;
  }
};

export async function getAnnouncements(): Promise<Announcement[]> {
  const announcementsRef = collection(db, 'announcements');
  const q = query(announcementsRef, where('status', '==', 'active'));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt instanceof Date ? data.createdAt : data.createdAt?.toDate?.() || new Date(),
      expiresAt: data.expiresAt instanceof Date ? data.expiresAt : data.expiresAt?.toDate?.() || undefined
    } as Announcement;
  });
}

export const updateAnnouncement = async (
  announcementId: string,
  updates: Partial<Announcement>
) => {
  try {
    const announcementRef = doc(db, 'announcements', announcementId);
    await updateDoc(announcementRef, updates);
  } catch (error) {
    console.error('Error updating announcement:', error);
    throw error;
  }
};

export const deleteAnnouncement = async (announcementId: string) => {
  try {
    const announcementRef = doc(db, 'announcements', announcementId);
    await deleteDoc(announcementRef);
  } catch (error) {
    console.error('Error deleting announcement:', error);
    throw error;
  }
};

// Report-related functions
export const generateDailyReport = async (tenantCode: string, date: Date): Promise<DailyReport> => {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Get sleepovers - using simple query without complex ordering
    const sleepoversRef = collection(db, 'sleepover_requests');
    const sleepoversQuery = query(
      sleepoversRef,
      where('createdAt', '>=', startOfDay),
      where('createdAt', '<=', endOfDay)
    );
    const sleepoversSnapshot = await getDocs(sleepoversQuery);
    const sleepovers = sleepoversSnapshot.docs.map(doc => doc.data());

    // Get maintenance requests - using simple query
    const maintenanceRef = collection(db, 'maintenance_requests');
    const maintenanceQuery = query(
      maintenanceRef,
      where('createdAt', '>=', startOfDay),
      where('createdAt', '<=', endOfDay)
    );
    const maintenanceSnapshot = await getDocs(maintenanceQuery);
    const maintenance = maintenanceSnapshot.docs.map(doc => doc.data());

    // Get complaints - using simple query
    const complaintsRef = collection(db, 'complaints');
    const complaintsQuery = query(
      complaintsRef,
      where('createdAt', '>=', startOfDay),
      where('createdAt', '<=', endOfDay)
    );
    const complaintsSnapshot = await getDocs(complaintsQuery);
    const complaints = complaintsSnapshot.docs.map(doc => doc.data());

    return {
      date,
      sleepovers: {
        total: sleepovers.length,
        resolved: sleepovers.filter(s => s.status === 'resolved').length,
        denied: sleepovers.filter(s => s.status === 'denied').length,
        pending: sleepovers.filter(s => s.status === 'pending').length
      },
      maintenance: {
        total: maintenance.length,
        resolved: maintenance.filter(m => m.status === 'resolved').length,
        denied: maintenance.filter(m => m.status === 'denied').length,
        pending: maintenance.filter(m => m.status === 'pending').length
      },
      complaints: {
        total: complaints.length,
        resolved: complaints.filter(c => c.status === 'resolved').length,
        denied: complaints.filter(c => c.status === 'denied').length,
        pending: complaints.filter(c => c.status === 'pending').length
      }
    };
  } catch (error) {
    console.error('Error generating daily report:', error);
    // Return empty report structure instead of throwing
    return {
      date,
      sleepovers: { total: 0, resolved: 0, denied: 0, pending: 0 },
      maintenance: { total: 0, resolved: 0, denied: 0, pending: 0 },
      complaints: { total: 0, resolved: 0, denied: 0, pending: 0 }
    };
  }
};

export const generateDetailedReport = async (tenantCode: string, date: Date): Promise<DetailedReport> => {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Get sleepovers with details
    const sleepoversRef = collection(db, 'tenants', tenantCode, 'sleepovers');
    const sleepoversQuery = query(
      sleepoversRef,
      where('createdAt', '>=', startOfDay),
      where('createdAt', '<=', endOfDay)
    );
    const sleepoversSnapshot = await getDocs(sleepoversQuery);
    const sleepovers = sleepoversSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().createdAt.toDate(),
      status: doc.data().status || 'pending',
      studentName: doc.data().studentName || '',
      details: doc.data().details || ''
    }));

    // Get maintenance requests with details
    const maintenanceRef = collection(db, 'tenants', tenantCode, 'maintenance');
    const maintenanceQuery = query(
      maintenanceRef,
      where('createdAt', '>=', startOfDay),
      where('createdAt', '<=', endOfDay)
    );
    const maintenanceSnapshot = await getDocs(maintenanceQuery);
    const maintenance = maintenanceSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().createdAt.toDate(),
      status: doc.data().status || 'pending',
      studentName: doc.data().studentName || '',
      details: doc.data().details || ''
    }));

    // Get complaints with details
    const complaintsRef = collection(db, 'tenants', tenantCode, 'complaints');
    const complaintsQuery = query(
      complaintsRef,
      where('createdAt', '>=', startOfDay),
      where('createdAt', '<=', endOfDay)
    );
    const complaintsSnapshot = await getDocs(complaintsQuery);
    const complaints = complaintsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().createdAt.toDate(),
      status: doc.data().status || 'pending',
      studentName: doc.data().studentName || '',
      details: doc.data().details || ''
    }));

    return {
      date,
      sleepovers: {
        total: sleepovers.length,
        resolved: sleepovers.filter(s => s.status === 'resolved').length,
        denied: sleepovers.filter(s => s.status === 'denied').length,
        pending: sleepovers.filter(s => s.status === 'pending').length,
        items: sleepovers.map(s => ({
          id: s.id,
          studentName: s.studentName,
          date: s.date,
          status: s.status,
          details: s.details
        }))
      },
      maintenance: {
        total: maintenance.length,
        resolved: maintenance.filter(m => m.status === 'resolved').length,
        denied: maintenance.filter(m => m.status === 'denied').length,
        pending: maintenance.filter(m => m.status === 'pending').length,
        items: maintenance.map(m => ({
          id: m.id,
          studentName: m.studentName,
          date: m.date,
          status: m.status,
          details: m.details
        }))
      },
      complaints: {
        total: complaints.length,
        resolved: complaints.filter(c => c.status === 'resolved').length,
        denied: complaints.filter(c => c.status === 'denied').length,
        pending: complaints.filter(c => c.status === 'pending').length,
        items: complaints.map(c => ({
          id: c.id,
          studentName: c.studentName,
          date: c.date,
          status: c.status,
          details: c.details
        }))
      }
    };
  } catch (error) {
    console.error('Error generating detailed report:', error);
    throw error;
  }
};

export const signOutSleepoverGuest = async (requestId: string, userId: string): Promise<void> => {
  try {
    const requestRef = doc(db, 'sleepover_requests', requestId);
    const requestDoc = await getDoc(requestRef);

    if (!requestDoc.exists()) {
      throw new Error('Sleepover request not found');
    }

    const now = new Date();

    // Update the request document
    await updateDoc(requestRef, {
      status: 'checked-out',
      isActive: false,
      signOutTime: now,
      updatedAt: serverTimestamp()
    });

    // Add to communication log
    await addCommunication(
      userId,
      `Sleepover guest checked out successfully`,
      'student'
    );
  } catch (error) {
    console.error('Error signing out sleepover guest:', error);
    throw error;
  }
};

export const checkOutGuest = async (guestId: string, securityCode: string): Promise<void> => {
  try {
    const guestRef = doc(db, 'guests', guestId);
    const guestDoc = await getDoc(guestRef);

    if (!guestDoc.exists()) {
      throw new Error('Guest not found');
    }

    const guest = guestDoc.data();

    // Check if the guest is already checked out
    if (guest.status === 'rejected') {
      throw new Error('Guest is already checked out');
    }

    // Check if the provided security code matches the fixed PIN
    if (securityCode !== '1005') {
      throw new Error('Invalid security code');
    }

    const now = new Date();

    // Update the guest's status and check-out time
    await updateDoc(guestRef, {
      status: 'rejected',
      checkOutTime: now.toISOString(),
      updatedAt: serverTimestamp(),
      isActive: false
    });

    // Add to communication log
    await addCommunication(
      guest.userId,
      `Guest ${guest.firstName} ${guest.lastName} checked out successfully`,
      'student'
    );
  } catch (error) {
    console.error('Error checking out guest:', error);
    throw error;
  }
};

export const getActiveSleepoverGuests = async () => {
  try {
    const requestsRef = collection(db, 'sleepover_requests');
    // First get by isActive
    const q = query(
      requestsRef,
      where('isActive', '==', true)
    );
    const querySnapshot = await getDocs(q);
    
    // Sort in memory instead of in query
    return querySnapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          guestName: data.guestName,
          guestSurname: data.guestSurname,
          guestPhone: data.guestPhone,
          roomNumber: data.roomNumber,
          tenantCode: data.tenantCode,
          additionalGuests: data.additionalGuests || [],
          startDate: data.startDate instanceof Date ? data.startDate : data.startDate?.toDate?.() || new Date(),
          endDate: data.endDate instanceof Date ? data.endDate : data.endDate?.toDate?.() || new Date(),
          status: data.status || 'pending',
          createdAt: data.createdAt instanceof Date ? data.createdAt : data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt instanceof Date ? data.updatedAt : data.updatedAt?.toDate?.() || new Date(),
          adminResponse: data.adminResponse || '',
          securityCode: data.securityCode || '',
          isActive: data.isActive || false,
          checkInTime: data.checkInTime || null,
          signOutTime: data.signOutTime instanceof Date ? data.signOutTime : data.signOutTime?.toDate?.() || null
        } as SleepoverRequest;
      })
      .sort((a, b) => {
        const timeA = a.checkInTime ? new Date(a.checkInTime).getTime() : 0;
        const timeB = b.checkInTime ? new Date(b.checkInTime).getTime() : 0;
        return timeB - timeA;
      });
  } catch (error) {
    console.error('Error fetching active sleepover guests:', error);
    throw error;
  }
};

export const createGuest = async (guestData: {
  userId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  roomNumber: string;
  purpose: string;
  fromDate: string;
  additionalGuests?: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
  }[];
}) => {
  try {
    const guestsRef = collection(db, 'guests');
    const now = serverTimestamp();

    const guestDoc = {
      ...guestData,
      additionalGuests: guestData.additionalGuests || [],
      createdAt: now,
      updatedAt: now,
      status: 'active',
      checkInTime: new Date().toISOString(),
      checkOutTime: null,
      date: new Date().toISOString()
    };

    await addDoc(guestsRef, guestDoc);
  } catch (error) {
    console.error('Error creating guest:', error);
    throw error;
  }
};

export const getGuests = async (userId: string) => {
  try {
    const guestsRef = collection(db, 'guests');
    const q = query(guestsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    // Sort the results in memory instead of using orderBy
    return querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      }))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error('Error fetching guests:', error);
    throw error;
  }
};

export const getCheckedOutGuests = async (): Promise<Guest[]> => {
  try {
    const guestsRef = collection(db, 'guests');
    const q = query(
      guestsRef,
      where('status', '==', 'rejected')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
        roomNumber: data.roomNumber || '',
        status: 'checked-out',
        checkInTime: data.checkInTime || '',
        checkOutTime: data.checkOutTime || '',
        hostName: data.hostName || '',
        hostId: data.userId || ''
      } as Guest;
    });
  } catch (error) {
    console.error('Error fetching checked out guests:', error);
    throw error;
  }
};

export const getCheckedOutSleepoverGuests = async () => {
  try {
    const requestsRef = collection(db, 'sleepover_requests');
    const q = query(
      requestsRef,
      where('isActive', '==', false)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt instanceof Date ? data.createdAt : data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt instanceof Date ? data.updatedAt : data.updatedAt?.toDate?.() || new Date(),
          startDate: data.startDate instanceof Date ? data.startDate : data.startDate?.toDate?.() || new Date(),
          endDate: data.endDate instanceof Date ? data.endDate : data.endDate?.toDate?.() || new Date(),
          signOutTime: data.signOutTime instanceof Date ? data.signOutTime : data.signOutTime?.toDate?.() || null
        } as SleepoverRequest;
      })
      .sort((a, b) => {
        // Sort in memory by signOutTime in descending order
        const timeA = a.signOutTime?.getTime() || 0;
        const timeB = b.signOutTime?.getTime() || 0;
        return timeB - timeA;
      });
  } catch (error) {
    console.error('Error fetching checked out sleepover guests:', error);
    throw error;
  }
};

export const getActiveGuests = async (): Promise<Guest[]> => {
  try {
    const guestsRef = collection(db, 'guests');
    const q = query(
      guestsRef,
      where('status', '==', 'active')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
        roomNumber: data.roomNumber || '',
        status: 'active',
        checkInTime: data.checkInTime || '',
        checkOutTime: data.checkOutTime || '',
        hostName: data.hostName || '',
        hostId: data.userId || ''
      } as Guest;
    });
  } catch (error) {
    console.error('Error fetching active guests:', error);
    throw error;
  }
};