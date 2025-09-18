'use server';

/**
 * @fileOverview An AI agent that generates a summary of a patient's medical history.
 *
 * - generatePatientSummary - A function that generates a summary report of a patient's medical history.
 * - GeneratePatientSummaryInput - The input type for the generatePatientSummary function.
 * - GeneratePatientSummaryOutput - The return type for the generatePatientSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePatientSummaryInputSchema = z.object({
  patientMedicalHistory: z
    .string()
    .describe('The medical history of the patient.'),
});
export type GeneratePatientSummaryInput = z.infer<
  typeof GeneratePatientSummaryInputSchema
>;

const GeneratePatientSummaryOutputSchema = z.object({
  summary: z.string().describe('The summary of the patient medical history.'),
});
export type GeneratePatientSummaryOutput = z.infer<
  typeof GeneratePatientSummaryOutputSchema
>;

export async function generatePatientSummary(
  input: GeneratePatientSummaryInput
): Promise<GeneratePatientSummaryOutput> {
  return generatePatientSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePatientSummaryPrompt',
  input: {schema: GeneratePatientSummaryInputSchema},
  output: {schema: GeneratePatientSummaryOutputSchema},
  prompt: `You are an expert medical summarizer. You will be given a patient's medical history, and you will generate a summary of the patient's medical history.\n\nPatient Medical History: {{{patientMedicalHistory}}}`,
});

const generatePatientSummaryFlow = ai.defineFlow(
  {
    name: 'generatePatientSummaryFlow',
    inputSchema: GeneratePatientSummaryInputSchema,
    outputSchema: GeneratePatientSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
