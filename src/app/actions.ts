
"use server";

import { tailorResume, TailorResumeOutput } from "@/ai/flows/tailor-resume";
import { z } from "zod";
import { db } from "@/lib/firebase";
import { collection, addDoc, doc, setDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";


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
    const dataToSave = {
      userId,
      resumeName, // Save the custom name
      professionalTitle: resumeData.customizedResume.professionalTitle, // Save title for fallback
      ...resumeData,
      createdAt: serverTimestamp(),
    };

    if (resumeId) {
      // Update existing document
      const docRef = doc(db, "resumes", resumeId);
      await setDoc(docRef, dataToSave, { merge: true });
      return { success: true, id: resumeId };
    } else {
      // Create new document
      const docRef = await addDoc(collection(db, "resumes"), dataToSave);
      return { success: true, id: docRef.id };
    }

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
