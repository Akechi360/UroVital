import { config } from 'dotenv';
config();

import '@/ai/flows/generate-patient-report-summary.ts';
import '@/ai/flows/generate-report-from-timeline.ts';
import '@/ai/flows/generate-patient-summary.ts';