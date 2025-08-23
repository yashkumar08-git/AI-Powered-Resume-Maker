
"use server";

import { tailorResume, TailorResumeOutput } from "@/ai/flows/tailor-resume";
import { z } from "zod";

const formSchema = z.object({
  resume: z.string(),
  jobDescription: z.string().optional().default(''),
  photoDataUri: z.string().optional(),
});

type ActionResponse = 
  | { success: true, data: TailorResumeOutput }
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
