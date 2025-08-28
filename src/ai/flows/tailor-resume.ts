
'use server';

/**
 * @fileOverview An AI agent that customizes a resume and generates a cover letter.
 *
 * - tailorResume - A function that handles the resume and cover letter generation.
 * - TailorResumeInput - The input type for the tailorResume function.
 * - TailorResumeOutput - The return type for the tailorResume function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TailorResumeInputSchema = z.object({
  resume: z
    .string()
    .describe('The resume of the user as plain text.'),
  jobDescription: z.string().optional().default('').describe('The job description to customize the resume to.'),
  photoDataUri: z.string().optional().describe("A profile photo of the user, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  generationType: z.enum(['resume', 'coverLetter', 'both']).default('resume').describe('What to generate: just the resume, just the cover letter, or both.'),
});
export type TailorResumeInput = z.infer<typeof TailorResumeInputSchema>;

const ResumeSchema = z.object({
  name: z.string().describe("The user's full name."),
  professionalTitle: z.string().optional().describe("The user's professional title (e.g., 'Senior Software Engineer')."),
  location: z.string().optional().describe("The user's location (e.g., 'San Francisco, CA')."),
  website: z.string().optional().describe("A link to the user's personal website or portfolio."),
  email: z.string().optional().describe("The user's email address."),
  phone: z.string().optional().describe("The user's phone number."),
  linkedin: z.string().optional().describe("A link to the user's LinkedIn profile."),
  photoDataUri: z.string().optional().describe("A profile photo of the user, as a data URI. If a photo was provided in the input, this should be included in the output."),
  summary: z.string().describe("A professional summary customized for the job."),
  experience: z.array(z.object({
    title: z.string().describe("Job title."),
    company: z.string().describe("Company name."),
    dates: z.string().describe("Employment dates."),
    description: z.string().describe("A description of responsibilities and achievements, optimized for the job description."),
  })).describe("The user's work experience."),
  education: z.array(z.object({
    degree: z.string().describe("Degree or certificate obtained."),
    school: z.string().describe("Name of the school or university."),
    year: z.string().describe("Year of graduation."),
    percentage: z.string().optional().describe("Percentage or GPA obtained."),
  })).describe("The user's education history."),
  skills: z.array(z.string()).describe("A list of skills relevant to the job description."),
});

const TailorResumeOutputSchema = z.object({
  customizedResume: ResumeSchema.optional().describe('The customized resume, structured as a JSON object. This should only be generated if the user requests a resume.'),
  coverLetter: z.string().optional().describe('A professional cover letter tailored to the job description. This should only be generated if the user requests a cover letter.'),
});
export type TailorResumeOutput = z.infer<typeof TailorResumeOutputSchema>;

export async function tailorResume(input: TailorResumeInput): Promise<TailorResumeOutput> {
  const result = await tailorResumeFlow(input);
  // Ensure photo is passed through if the model misses it.
  if (input.photoDataUri && result.customizedResume) {
    result.customizedResume.photoDataUri = input.photoDataUri;
  }
  return result;
}

const tailorResumePrompt = ai.definePrompt({
    name: 'tailorResumePrompt',
    model: 'googleai/gemini-1.5-flash',
    input: {schema: TailorResumeInputSchema},
    output: {schema: TailorResumeOutputSchema},
    prompt: `You are an expert resume writer and career advisor. Your task is to generate documents based on the provided information.

Your output MUST be a single JSON object that conforms to the provided JSON schema. Do not add any extra text or markdown formatting around the JSON object.

The user has specified what to generate with the 'generationType' field.
- If 'generationType' is 'resume', you MUST generate only the 'customizedResume' object.
- If 'generationType' is 'coverLetter', you MUST generate only the 'coverLetter' string.
- If 'generationType' is 'both', you MUST generate both the 'customizedResume' object and the 'coverLetter' string.

If the user provides a resume and/or a job description, you will customize the documents to the job description, highlighting relevant skills and experience.

If the user provides an empty resume and an empty job description, you MUST generate a high-quality, complete sample resume and/or cover letter for a fictional person named "Alex Doe" applying for a "Senior Software Engineer" position at a top tech company.

If a photo is provided in the input and you are generating a resume, you MUST include the original photo's data URI in the 'photoDataUri' field of the resume object. Do not process or change the photo data URI.

Resume:
{{{resume}}}

Job Description:
{{{jobDescription}}}
{{#if photoDataUri}}
Photo:
{{media url=photoDataUri}}
{{/if}}
`,
});

const tailorResumeFlow = ai.defineFlow(
  {
    name: 'tailorResumeFlow',
    inputSchema: TailorResumeInputSchema,
    outputSchema: TailorResumeOutputSchema,
  },
  async (input) => {
    let result = await tailorResumePrompt(input);
    let output = result.output;

    const MAX_RETRIES = 2;
    let attempt = 1;

    // If 'both' were requested, but one is missing, retry.
    while (
      input.generationType === 'both' &&
      (!output?.customizedResume || !output?.coverLetter) &&
      attempt < MAX_RETRIES
    ) {
      attempt++;
      // Create a new input for the retry, asking for the missing piece.
      const retryInput: TailorResumeInput = { ...input };
      const missingParts: string[] = [];
      if (!output?.customizedResume) missingParts.push('resume');
      if (!output?.coverLetter) missingParts.push('cover letter');

      retryInput.resume = `Original Resume: ${input.resume}\nOriginal Job Description: ${input.jobDescription}\nPREVIOUSLY GENERATED: ${JSON.stringify(output || {}, null, 2)}\n\nYou failed to generate all the required documents. Please generate the missing parts: ${missingParts.join(' and ')}.`;
      
      const retryResult = await tailorResumePrompt(retryInput);
      const retryOutput = retryResult.output;

      // Merge the results
      if (retryOutput) {
        if (!output) {
          output = {};
        }
        if (retryOutput.customizedResume && !output.customizedResume) {
          output.customizedResume = retryOutput.customizedResume;
        }
        if (retryOutput.coverLetter && !output.coverLetter) {
          output.coverLetter = retryOutput.coverLetter;
        }
      }
    }
    
    if (!output) {
      throw new Error("Failed to generate the requested documents.");
    }
    
    // Final check after retries
    if (input.generationType === 'both' && (!output.customizedResume || !output.coverLetter)) {
        throw new Error("The AI failed to generate both the resume and the cover letter. Please try again.");
    }
    if (input.generationType === 'resume' && !output.customizedResume) {
        throw new Error("The resume could not be generated.");
    }
    if (input.generationType === 'coverLetter' && !output.coverLetter) {
        throw new Error("The cover letter cound not be generated.");
    }
     if (!output.customizedResume && !output.coverLetter) {
      throw new Error("No documents could be generated from the provided input.");
    }

    return output;
  }
);
