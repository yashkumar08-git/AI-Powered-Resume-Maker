
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

const resumePrompt = ai.definePrompt({
    name: 'resumePrompt',
    input: {schema: CustomizeResumeInputSchema},
    output: {schema: ResumeSchema},
    prompt: `You are an expert resume writer. Your task is to generate a resume based on the provided information.

Your output MUST be a JSON object that conforms to the provided JSON schema. Do not add any extra text or markdown formatting around the JSON object.

If the user provides a resume and/or a job description, you will customize the resume to the job description, highlighting relevant skills and experience.

If the user provides an empty resume and an empty job description, you MUST generate a high-quality, complete sample resume for a fictional person named "Alex Doe" applying for a "Senior Software Engineer" position at a top tech company.

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

const coverLetterPrompt = ai.definePrompt({
    name: 'coverLetterPrompt',
    input: {schema: z.object({
      resumeJson: z.string(), // Expecting the resume as a JSON string
      jobDescription: z.string(),
    })},
    output: {schema: z.string()},
    prompt: `You are an expert career advisor. Your task is to write a compelling and professional cover letter based on the provided information.

If the user provides a resume and/or a job description, you will write a cover letter tailored to that information.

If the user provides an empty resume and an empty job description, you MUST generate a high-quality sample cover letter from a fictional person named "Alex Doe" applying for a "Senior Software Engineer" position at a top tech company.

The user's resume is provided below as a JSON object. Use this as the primary source of information.

Resume:
{{{resumeJson}}}

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
    // Step 1: Generate the customized resume.
    const resumeResult = await resumePrompt(input);
    const customizedResume = resumeResult.output;

    if (!customizedResume) {
        throw new Error("Failed to generate the resume.");
    }
    
    // Ensure photo is passed through if the model misses it.
    if (input.photoDataUri && !customizedResume.photoDataUri) {
      customizedResume.photoDataUri = input.photoDataUri;
    }

    // Step 2: Generate the cover letter using the generated resume data.
    const coverLetterResult = await coverLetterPrompt({
        // Pass the generated resume as a JSON string to the next prompt
        resumeJson: JSON.stringify(customizedResume, null, 2),
        jobDescription: input.jobDescription
    });

    const coverLetter = coverLetterResult.output;
    if (!coverLetter) {
        throw new Error("Failed to generate the cover letter.");
    }
    
    return {
      customizedResume: customizedResume,
      coverLetter: coverLetter,
    };
  }
);
