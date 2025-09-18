'use server';

/**
 * @fileOverview An AI agent that generates a summary report of a patient's medical history.
 *
 * - generatePatientReportSummary - A function that generates a summary report of a patient's medical history.
 * - GeneratePatientReportSummaryInput - The input type for the generatePatientReportSummary function.
 * - GeneratePatientReportSummaryOutput - The return type for the generatePatientReportSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePatientReportSummaryInputSchema = z.object({
  patientMedicalHistory: z
    .string()
    .describe('The medical history of the patient.'),
});
export type GeneratePatientReportSummaryInput = z.infer<
  typeof GeneratePatientReportSummaryInputSchema
>;

const GeneratePatientReportSummaryOutputSchema = z.object({
  summary: z.string().describe('The summary of the patient medical history.'),
});
export type GeneratePatientReportSummaryOutput = z.infer<
  typeof GeneratePatientReportSummaryOutputSchema
>;

export async function generatePatientReportSummary(
  input: GeneratePatientReportSummaryInput
): Promise<GeneratePatientReportSummaryOutput> {
  return generatePatientReportSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePatientReportSummaryPrompt',
  input: {schema: GeneratePatientReportSummaryInputSchema},
  output: {schema: GeneratePatientReportSummaryOutputSchema},
  prompt: `You are an expert medical summarizer. You will be given a patient's medical history, and you will generate a summary of the patient's medical history.

Patient Medical History: {{{patientMedicalHistory}}}`,
});

const generatePatientReportSummaryFlow = ai.defineFlow(
  {
    name: 'generatePatientReportSummaryFlow',
    inputSchema: GeneratePatientReportSummaryInputSchema,
    outputSchema: GeneratePatientReportSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
