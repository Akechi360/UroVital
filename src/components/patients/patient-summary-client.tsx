'use client'

import { generatePatientReportSummary } from '@/ai/flows/generate-patient-report-summary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Wand2 } from 'lucide-react';
import { useState, useTransition } from 'react';

export default function PatientSummaryClient({ medicalHistory }: { medicalHistory: string }) {
    const [isPending, startTransition] = useTransition();
    const [summary, setSummary] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateSummary = () => {
        if (!medicalHistory || medicalHistory === "No medical history found for this patient.") return;
        setIsGenerating(true);
        startTransition(async () => {
            try {
                const result = await generatePatientReportSummary({ patientMedicalHistory: medicalHistory });
                setSummary(result.summary);
            } catch (error) {
                console.error("Failed to generate summary:", error);
                setSummary("Could not generate summary at this time.");
            } finally {
                setIsGenerating(false);
            }
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>AI-Generated Patient Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <h3 className="font-semibold text-sm">Full Medical History</h3>
                    <Textarea
                        readOnly
                        value={medicalHistory}
                        className="h-40 bg-muted/50"
                        />
                </div>
                <Button onClick={handleGenerateSummary} disabled={isPending || isGenerating || medicalHistory === "No medical history found for this patient."}>
                    <Wand2 className="mr-2 h-4 w-4" />
                    {isGenerating ? 'Generating...' : 'Generate Summary'}
                </Button>
                {isGenerating && (
                    <div className="space-y-2 pt-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                )}
                {summary && !isGenerating && (
                    <div className="prose prose-sm dark:prose-invert max-w-none rounded-md border bg-card p-4 text-card-foreground">
                        <h3 className="font-semibold text-sm mt-0">Summary:</h3>
                        <p className="text-sm">{summary}</p>
                    </div>
                )}
                 {!summary && !isGenerating && (
                    <div className="text-center text-muted-foreground py-10 border rounded-lg">
                        <p>
                            {medicalHistory === "No medical history found for this patient."
                            ? "No medical history available to generate a summary."
                            : "Click \"Generate Summary\" to create an AI-powered summary of the patient's history."}
                        </p>
                    </div>
                 )}
            </CardContent>
        </Card>
    );
}
