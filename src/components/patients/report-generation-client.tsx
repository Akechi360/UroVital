
'use client'

import { generateReportFromTimeline } from '@/ai/flows/generate-report-from-timeline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Wand2, FileDown, Save } from 'lucide-react';
import { useState, useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function ReportGenerationClient({ medicalHistory, patientId }: { medicalHistory: string, patientId: string }) {
    const [isPending, startTransition] = useTransition();
    const [report, setReport] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const { toast } = useToast();

    const handleGenerateReport = () => {
        if (!medicalHistory || medicalHistory === "No medical history found for this patient.") return;
        setIsGenerating(true);
        setReport('');
        startTransition(async () => {
            try {
                const result = await generateReportFromTimeline({ patientTimeline: medicalHistory });
                setReport(result.report);
            } catch (error) {
                console.error("Failed to generate report:", error);
                setReport("Could not generate report at this time.");
                toast({
                    variant: "destructive",
                    title: "Report Generation Failed",
                    description: "An error occurred while generating the report.",
                });
            } finally {
                setIsGenerating(false);
            }
        });
    };

    const handleSaveReport = () => {
        // In a real application, this would save the report to the database
        // and associate it with the patient's medical history.
        console.log("Saving report for patient:", patientId, report);
        toast({
            title: "Report Saved (Mock)",
            description: "The generated report has been added to the patient's history.",
        });
    };
    
    const handleExport = () => {
        // In a real application, this would generate and download a PDF.
        toast({
            title: "Exporting Report (Mock)",
            description: "A PDF of the report would be downloaded.",
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>AI-Powered Report Generation</CardTitle>
                <CardDescription>Generate a comprehensive medical report from the patient's timeline.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                 <div className="space-y-2">
                    <h3 className="font-semibold text-sm">Patient Timeline Source</h3>
                    <Textarea
                        readOnly
                        value={medicalHistory}
                        className="h-48 bg-muted/50"
                        />
                </div>
                <div>
                    <Button onClick={handleGenerateReport} disabled={isPending || isGenerating || medicalHistory === "No medical history found for this patient."}>
                        <Wand2 className="mr-2 h-4 w-4" />
                        {isPending || isGenerating ? 'Generating Report...' : 'Generate Detailed Report'}
                    </Button>
                </div>
                
                {(isPending || isGenerating) && (
                    <div className="space-y-4 pt-4">
                        <Skeleton className="h-6 w-1/3" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-4/6" />
                        </div>
                    </div>
                )}

                {report && !isGenerating && (
                    <div className="pt-4">
                        <h3 className="font-semibold text-lg mb-2">Generated Report</h3>
                        <div className="prose prose-sm dark:prose-invert max-w-none rounded-md border bg-background p-6 text-card-foreground">
                            <h4 className="font-bold !text-base mt-0">Medical Report</h4>
                            <p className="text-xs text-muted-foreground !mt-0 !mb-4">Generated on: {format(new Date(), 'MMMM d, yyyy')}</p>
                            {report.split('\n').map((paragraph, i) => (
                                <p key={i}>{paragraph || '\u00A0'}</p>
                            ))}
                        </div>
                    </div>
                )}

                 {!report && !isGenerating && !isPending && (
                    <div className="text-center text-muted-foreground py-12 border rounded-lg bg-muted/20">
                        <Wand2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
                        <p className="mt-4">
                            {medicalHistory === "No medical history found for this patient."
                            ? "No medical history available to generate a report."
                            : "Click the button above to generate a comprehensive report."}
                        </p>
                    </div>
                 )}
            </CardContent>
            {report && !isGenerating && (
                <CardFooter className="justify-end gap-2 border-t pt-6">
                    <Button variant="outline" onClick={handleSaveReport}>
                        <Save className="mr-2 h-4 w-4" />
                        Save to Timeline
                    </Button>
                    <Button onClick={handleExport}>
                        <FileDown className="mr-2 h-4 w-4" />
                        Export as PDF
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}
