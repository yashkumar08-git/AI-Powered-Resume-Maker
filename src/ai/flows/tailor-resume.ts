
'use server';

/**
 * @fileOverview An AI agent that customizes a resume and generates a cover letter.
 *
 * - customizeResume - A function that handles the resume customization and cover letter generation.
 * - CustomizeResumeInput - The input type for the customizeResume function.
 * - CustomizeResumeOutput - The return type for the customizeResume function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CustomizeResumeInputSchema = z.object({
  resume: z
    .string()
    .describe('The resume of the user as plain text.'),
  jobDescription: z.string().describe('The job description to customize the resume to.'),
  photoDataUri: z.string().optional().describe("A profile photo of the user, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type CustomizeResumeInput = z.infer<typeof CustomizeResumeInputSchema>;

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

const CustomizeResumeOutputSchema = z.object({
  customizedResume: ResumeSchema.describe('The customized resume, structured as a JSON object.'),
  coverLetter: z.string().describe('A cover letter for the job.'),
});
export type CustomizeResumeOutput = z.infer<typeof CustomizeResumeOutputSchema>;

export async function customizeResume(input: CustomizeResumeInput): Promise<CustomizeResumeOutput> {
  return customizeResumeFlow(input);
}

const resumeOnlyPrompt = ai.definePrompt({
    name: 'resumeOnlyPrompt',
    input: {schema: CustomizeResumeInputSchema},
    output: {schema: ResumeSchema},
    prompt: `You are an expert resume writer. Your task is to generate a resume based on the provided information.

If the user provides a resume and/or a job description, you will customize the resume to the job description, highlighting relevant skills and experience.

If the user provides an empty resume and an empty job description, you MUST generate a high-quality, complete sample resume for a fictional person named "Alex Doe" applying for a "Senior Software Engineer" position at a top tech company.

Structure the output as a JSON object that conforms to the provided schema.

If a photo is provided in the input, you MUST include the original photo's data URI in the 'photoDataUri' field of the resume object.

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

const coverLetterOnlyPrompt = ai.definePrompt({
    name: 'coverLetterOnlyPrompt',
    input: {schema: z.object({
      resume: z.string(),
      jobDescription: z.string(),
    })},
    output: {schema: z.string()},
    prompt: `You are an expert career advisor. Your task is to write a compelling and professional cover letter based on the provided information.

If the user provides a resume and/or a job description, you will write a cover letter tailored to that information.

If the user provides an empty resume and an empty job description, you MUST generate a high-quality sample cover letter from a fictional person named "Alex Doe" applying for a "Senior Software Engineer" position at a top tech company.

Resume:
{{{resume}}}

Job Description:
{{{jobDescription}}}
`,
});


const customizeResumeFlow = ai.defineFlow(
  {
    name: 'customizeResumeFlow',
    inputSchema: CustomizeResumeInputSchema,
    outputSchema: CustomizeResumeOutputSchema,
  },
  async (input) => {
    const [resumeResult, coverLetterResult] = await Promise.all([
      resumeOnlyPrompt(input),
      coverLetterOnlyPrompt({
        resume: input.resume,
        jobDescription: input.jobDescription,
      }),
    ]);
    
    const customizedResume = resumeResult.output!;
    // Ensure photo is passed through if the model misses it.
    if (input.photoDataUri && !customizedResume.photoDataUri) {
      customizedResume.photoDataUri = input.photoDataUri;
    }
    
    return {
      customizedResume: customizedResume,
      coverLetter: coverLetterResult.output!,
    };
  }
);
