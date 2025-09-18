'use server';

/**
 * @fileOverview An AI agent that generates a detailed medical report based on the patient's timeline.
 *
 * - generateReportFromTimeline - A function that generates a detailed medical report based on the patient's timeline.
 * - GenerateReportFromTimelineInput - The input type for the generateReportFromTimeline function.
 * - GenerateReportFromTimelineOutput - The return type for the generateReportFromTimeline function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateReportFromTimelineInputSchema = z.object({
  patientTimeline: z
    .string()
    .describe("The patient's medical timeline, including consultations, prescriptions, and reports."),
});
export type GenerateReportFromTimelineInput = z.infer<
  typeof GenerateReportFromTimelineInputSchema
>;

const GenerateReportFromTimelineOutputSchema = z.object({
  report: z.string().describe('A detailed medical report based on the patient timeline.'),
});
export type GenerateReportFromTimelineOutput = z.infer<
  typeof GenerateReportFromTimelineOutputSchema
>;

export async function generateReportFromTimeline(
  input: GenerateReportFromTimelineInput
): Promise<GenerateReportFromTimelineOutput> {
  return generateReportFromTimelineFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReportFromTimelinePrompt',
  input: {schema: GenerateReportFromTimelineInputSchema},
  output: {schema: GenerateReportFromTimelineOutputSchema},
  prompt: `You are an expert medical report generator. You will be given a patient's medical timeline, and you will generate a detailed medical report based on the patient's timeline to provide a comprehensive overview of their health journey.

Patient Timeline: {{{patientTimeline}}}`,
});

const generateReportFromTimelineFlow = ai.defineFlow(
  {
    name: 'generateReportFromTimelineFlow',
    inputSchema: GenerateReportFromTimelineInputSchema,
    outputSchema: GenerateReportFromTimelineOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
