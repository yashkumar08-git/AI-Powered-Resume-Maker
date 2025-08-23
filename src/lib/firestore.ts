
import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import 'server-only';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : undefined;

const adminApp = !getApps().length
  ? initializeApp({
      credential: cert(serviceAccount!),
    })
  : getApp();

const db = getFirestore(adminApp);

export async function saveResumeData(userId: string, data: any) {
  const docRef = db.collection('resumes').doc(userId);
  return docRef.set({
    ...data,
    updatedAt: Timestamp.now(),
  });
}

export async function getResumeData(userId: string): Promise<any | null> {
  const docRef = db.collection('resumes').doc(userId);
  const doc = await docRef.get();
  if (!doc.exists) {
    return null;
  }
  const data = doc.data();
  // Firestore timestamps need to be converted to be serializable
  if (data?.updatedAt) {
    data.updatedAt = data.updatedAt.toDate().toISOString();
  }
  return data;
}
