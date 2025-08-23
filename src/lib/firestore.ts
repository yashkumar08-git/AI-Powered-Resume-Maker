
import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import 'server-only';

try {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : undefined;

  if (serviceAccount) {
    if (!getApps().length) {
      initializeApp({
        credential: cert(serviceAccount),
      });
    }
  } else {
    console.warn("Firebase service account key is not set. Firestore functionality will be disabled.");
  }
} catch (error) {
  console.error("Failed to initialize Firebase Admin SDK:", error);
}


const db = getApps().length ? getFirestore() : null;

/**
 * Saves the user's resume form data to Firestore.
 * @param userId - The ID of the user.
 * @param data - The resume data to save.
 */
export async function saveResumeData(userId: string, data: any) {
  if (!db || !userId) return;
  const docRef = db.collection('userResumes').doc(userId);
  try {
    return await docRef.set({
      formData: data,
      updatedAt: Timestamp.now(),
    }, { merge: true });
  } catch (error) {
    console.error("Error saving resume data to Firestore:", error);
    // Optionally, you could throw the error or handle it as needed
  }
}

/**
 * Retrieves the user's resume data from Firestore.
 * @param userId - The ID of the user.
 * @returns The user's saved resume data, or null if it doesn't exist.
 */
export async function getResumeData(userId: string): Promise<any | null> {
    if (!db || !userId) return null;
    const docRef = db.collection('userResumes').doc(userId);
    try {
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
    } catch (error) {
        console.error("Error fetching resume data from Firestore:", error);
        return null;
    }
}
