
"use server";

import { customizeResume, CustomizeResumeOutput } from "@/ai/flows/tailor-resume";
import { getResumeData, saveResumeData } from "@/lib/firestore";
import { getAuth } from "firebase-admin/auth";
import { z } from "zod";

const formSchema = z.object({
  resume: z.string(),
  jobDescription: z.string(),
  photoDataUri: z.string().optional(),
});

const formValuesSchema = z.object({
  name: z.string().optional(),
  professionalTitle: z.string().optional(),
  email: z.string().email({ message: "Invalid email address." }).optional(),
  phone: z.string().optional(),
  linkedin: z.string().optional(),
  location: z.string().optional(),
  website: z.string().optional(),
  experiences: z.array(z.object({
    title: z.string(),
    company: z.string(),
    dates: z.string(),
    description: z.string(),
  })),
  educations: z.array(z.object({
    degree: z.string(),
    school: z.string(),
    year: z.string(),
    percentage: z.string().optional(),
  })),
  skills: z.string().optional(),
  jobDescription: z.string().optional(),
  photo: z.string().optional(),
});

type ActionResponse = 
  | { success: true; data: CustomizeResumeOutput }
  | { success: false; error: string };

export async function handleCustomizeResumeAction(
  formData: { resume: string; jobDescription: string; photoDataUri?: string },
  formValues: z.infer<typeof formValuesSchema>,
  userId: string | null
): Promise<ActionResponse> {
  const validation = formSchema.safeParse(formData);

  if (!validation.success) {
    // A more detailed error could be formed from validation.error.issues
    return { success: false, error: "Invalid input." };
  }
  
  if (!validation.data.resume.trim() && !validation.data.jobDescription.trim()) {
    return { success: false, error: "Please provide either a resume or a job description." };
  }

  try {
    const result = await customizeResume({
      resume: validation.data.resume,
      jobDescription: validation.data.jobDescription,
      photoDataUri: validation.data.photoDataUri,
    });

    if (userId) {
      // Don't save photo to DB to avoid large document sizes
      const { photo, ...restOfValues} = formValues;
      await saveResumeData(userId, restOfValues);
    }

    return { success: true, data: result };
  } catch (e) {
    console.error(e);
    // This provides a generic error message to the user for security.
    return { success: false, error: "Failed to generate documents. Please try again later." };
  }
}

export async function fetchResumeData(userId: string) {
  try {
    const data = await getResumeData(userId);
    return { success: true, data };
  } catch (error: any) {
    console.error("Failed to fetch resume data:", error);
    return { success: false, error: error.message || "Could not load your saved data." };
  }
}
