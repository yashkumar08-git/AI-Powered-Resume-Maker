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
});
export type CustomizeResumeInput = z.infer<typeof CustomizeResumeInputSchema>;

const ResumeSchema = z.object({
  name: z.string().describe("The user's full name."),
  contact: z.string().describe("The user's contact information (email, phone, LinkedIn)."),
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

const customizeResumePrompt = ai.definePrompt({
  name: 'customizeResumePrompt',
  input: {schema: CustomizeResumeInputSchema},
  output: {schema: CustomizeResumeOutputSchema},
  prompt: `You are an expert resume writer and career advisor. You will customize the user's resume to the job description provided, highlighting relevant skills and experience. Structure the output as a JSON object that conforms to the provided schema. You will also write a compelling cover letter for the job.

Resume:
{{{resume}}}

Job Description:
{{{jobDescription}}}`,
});

const customizeResumeFlow = ai.defineFlow(
  {
    name: 'customizeResumeFlow',
    inputSchema: CustomizeResumeInputSchema,
    outputSchema: CustomizeResumeOutputSchema,
  },
  async input => {
    const {output} = await customizeResumePrompt(input);
    return output!;
  }
);
