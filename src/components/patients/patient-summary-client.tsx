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
        if (!medicalHistory || medicalHistory === "No se encontró historial médico para este paciente.") return;
        setIsGenerating(true);
        startTransition(async () => {
            try {
                const result = await generatePatientReportSummary({ patientMedicalHistory: medicalHistory });
                setSummary(result.summary);
            } catch (error) {
                console.error("Fallo al generar el resumen:", error);
                setSummary("No se pudo generar el resumen en este momento.");
            } finally {
                setIsGenerating(false);
            }
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Resumen de Paciente Generado por IA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <h3 className="font-semibold text-sm">Historial Médico Completo</h3>
                    <Textarea
                        readOnly
                        value={medicalHistory}
                        className="h-40 bg-muted/50"
                        />
                </div>
                <Button onClick={handleGenerateSummary} disabled={isPending || isGenerating || medicalHistory === "No se encontró historial médico para este paciente."}>
                    <Wand2 className="mr-2 h-4 w-4" />
                    {isGenerating ? 'Generando...' : 'Generar Resumen'}
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
                        <h3 className="font-semibold text-sm mt-0">Resumen:</h3>
                        <p className="text-sm">{summary}</p>
                    </div>
                )}
                 {!summary && !isGenerating && (
                    <div className="text-center text-muted-foreground py-10 border rounded-lg">
                        <p>
                            {medicalHistory === "No se encontró historial médico para este paciente."
                            ? "No hay historial médico disponible para generar un resumen."
                            : "Haz clic en \"Generar Resumen\" para crear un resumen del historial del paciente con IA."}
                        </p>
                    </div>
                 )}
            </CardContent>
        </Card>
    );
}
