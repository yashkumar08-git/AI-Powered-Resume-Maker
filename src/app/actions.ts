"use server";

import { tailorResume, TailorResumeOutput } from "@/ai/flows/tailor-resume";
import { z } from "zod";

const formSchema = z.object({
  resume: z.string().min(1, "Resume cannot be empty."),
  jobDescription: z.string().min(1, "Job description cannot be empty."),
});

type ActionResponse = 
  | { success: true; data: TailorResumeOutput }
  | { success: false; error: string };

export async function handleTailorResumeAction(formData: { resume: string; jobDescription: string }): Promise<ActionResponse> {
  const validation = formSchema.safeParse(formData);

  if (!validation.success) {
    // A more detailed error could be formed from validation.error.issues
    return { success: false, error: "Invalid input." };
  }

  try {
    const result = await tailorResume({
      resume: validation.data.resume,
      jobDescription: validation.data.jobDescription,
    });
    return { success: true, data: result };
  } catch (e) {
    console.error(e);
    // This provides a generic error message to the user for security.
    return { success: false, error: "Failed to generate documents. Please try again later." };
  }
}
