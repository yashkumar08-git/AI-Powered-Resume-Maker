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

const CustomizeResumeOutputSchema = z.object({
  customizedResume: z.string().describe('The customized resume.'),
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
  prompt: `You are an expert resume writer and career advisor. You will customize the user's resume to the job description provided, highlighting relevant skills and experience. You will also write a compelling cover letter for the job.

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
