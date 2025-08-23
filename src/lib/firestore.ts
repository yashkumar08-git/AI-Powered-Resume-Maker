
import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import 'server-only';

// This is a simplified check for the service account.
// In a real-world scenario, you would have more robust error handling.
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : undefined;

// Initialize the Firebase Admin app if it doesn't already exist.
if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount!),
  });
}

const db = getFirestore();

/**
 * Saves the user's resume form data to Firestore.
 * @param userId - The ID of the user.
 * @param data - The resume data to save.
 */
export async function saveResumeData(userId: string, data: any) {
  if (!userId) return;
  const docRef = db.collection('userResumes').doc(userId);
  return docRef.set({
    formData: data,
    updatedAt: Timestamp.now(),
  }, { merge: true });
}

/**
 * Retrieves the user's resume data from Firestore.
 * @param userId - The ID of the user.
 * @returns The user's saved resume data, or null if it doesn't exist.
 */
export async function getResumeData(userId: string): Promise<any | null> {
    if (!userId) return null;
    const docRef = db.collection('userResumes').doc(userId);
    const doc = await docRef.get();
    if (!doc.exists) {
        return null;
    }
    const data = doc.data();
    // Firestore timestamps need to be converted to be serializable for the client
    if (data?.updatedAt) {
        data.updatedAt = data.updatedAt.toDate().toISOString();
    }
    return data;
}
