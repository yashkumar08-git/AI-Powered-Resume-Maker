
"use server";

import { tailorResume, TailorResumeOutput } from "@/ai/flows/tailor-resume";
import { z } from "zod";
import { db } from "@/lib/firebase";
import { collection, addDoc, doc, setDoc, serverTimestamp, query, where, getDocs, getDoc, writeBatch } from "firebase/firestore";


const formSchema = z.object({
  resume: z.string(),
  jobDescription: z.string().optional().default(''),
  photoDataUri: z.string().optional(),
});

type ActionResponse = 
  | { success: true, data: TailorResumeOutput & { id?: string } }
  | { success: false, error: string };

export async function handleTailorResumeAction(
  formData: { resume: string; jobDescription?: string; photoDataUri?: string },
): Promise<ActionResponse> {
  const validation = formSchema.safeParse(formData);

  if (!validation.success) {
    // A more detailed error could be formed from validation.error.issues
    return { success: false, error: "Invalid input." };
  }
  
  try {
    const result = await tailorResume({
      resume: validation.data.resume,
      jobDescription: validation.data.jobDescription,
      photoDataUri: validation.data.photoDataUri,
    });
    
    // Pass photo through if AI misses it.
    if (validation.data.photoDataUri && !result.customizedResume.photoDataUri) {
      result.customizedResume.photoDataUri = validation.data.photoDataUri;
    }
    
    return { success: true, data: result };
  } catch (e: any) {
    console.error(e);
    // Provide a more specific error message to the user.
    const errorMessage = e.message || "An unexpected error occurred. Please try again later.";
    return { success: false, error: `Failed to generate documents: ${errorMessage}` };
  }
}

export async function saveResumeAction(
  resumeData: TailorResumeOutput,
  userId: string,
  resumeName: string,
  resumeId?: string,
): Promise<{ success: boolean, error?: string, id?: string }> {
  if (!userId) {
    return { success: false, error: "User must be logged in to save." };
  }

  try {
    // Separate photo data
    const photoDataUri = resumeData.customizedResume.photoDataUri;
    const resumeToSave = { ...resumeData };
    if (resumeToSave.customizedResume.photoDataUri) {
        delete resumeToSave.customizedResume.photoDataUri;
    }

    const dataToSave = {
      userId,
      resumeName,
      professionalTitle: resumeToSave.customizedResume.professionalTitle,
      ...resumeToSave,
      createdAt: serverTimestamp(),
    };

    const batch = writeBatch(db);
    let docId = resumeId;
    let resumeRef;

    if (docId) {
      // Update existing document
      resumeRef = doc(db, "resumes", docId);
      batch.set(resumeRef, dataToSave, { merge: true });
    } else {
      // Create new document
      resumeRef = doc(collection(db, "resumes"));
      batch.set(resumeRef, dataToSave);
      docId = resumeRef.id;
    }

    if (photoDataUri && docId) {
      const photoRef = doc(db, "resumes_photos", docId);
      batch.set(photoRef, { photoDataUri });
    }

    await batch.commit();

    return { success: true, id: docId };

  } catch (error: any) {
    console.error("Error saving resume to Firestore:", error);
    return { success: false, error: error.message || "Failed to save resume." };
  }
}


export async function getSavedResumesAction(
  userId: string
): Promise<{ success: boolean; data?: (TailorResumeOutput & { id: string, createdAt: any, resumeName?: string, professionalTitle?: string })[]; error?: string }> {
  if (!userId) {
    return { success: false, error: "User not found." };
  }
  try {
    const q = query(collection(db, "resumes"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const resumes = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as (TailorResumeOutput & { id: string, createdAt: any, resumeName?: string, professionalTitle?: string })[];

    return { success: true, data: resumes };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}


export async function getResumeWithPhotoAction(resumeId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!resumeId) {
        return { success: false, error: "Resume ID is required." };
    }
    try {
        const resumeRef = doc(db, "resumes", resumeId);
        const resumeSnap = await getDoc(resumeRef);

        if (!resumeSnap.exists()) {
            return { success: false, error: "Resume not found." };
        }

        const resumeData = { id: resumeSnap.id, ...resumeSnap.data() };

        const photoRef = doc(db, "resumes_photos", resumeId);
        const photoSnap = await getDoc(photoRef);

        if (photoSnap.exists()) {
            // @ts-ignore
            resumeData.customizedResume.photoDataUri = photoSnap.data().photoDataUri;
        }

        return { success: true, data: resumeData };
    } catch (error: any) {
        console.error("Error fetching resume with photo:", error);
        return { success: false, error: error.message || "Failed to fetch resume details." };
    }
}
