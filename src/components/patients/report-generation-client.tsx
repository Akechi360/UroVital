
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
        if (!medicalHistory || medicalHistory === "No se encontró historial médico para este paciente.") return;
        setIsGenerating(true);
        setReport('');
        startTransition(async () => {
            try {
                const result = await generateReportFromTimeline({ patientTimeline: medicalHistory });
                setReport(result.report);
            } catch (error) {
                console.error("Fallo al generar el informe:", error);
                setReport("No se pudo generar el informe en este momento.");
                toast({
                    variant: "destructive",
                    title: "Fallo en la Generación del Informe",
                    description: "Ocurrió un error mientras se generaba el informe.",
                });
            } finally {
                setIsGenerating(false);
            }
        });
    };

    const handleSaveReport = () => {
        // En una aplicación real, esto guardaría el informe en la base de datos
        // y lo asociaría con el historial médico del paciente.
        console.log("Guardando informe para el paciente:", patientId, report);
        toast({
            title: "Informe Guardado (Simulación)",
            description: "El informe generado ha sido añadido al historial del paciente.",
        });
    };
    
    const handleExport = () => {
        // En una aplicación real, esto generaría y descargaría un PDF.
        toast({
            title: "Exportando Informe (Simulación)",
            description: "Se descargaría un PDF del informe.",
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Generación de Informes con IA</CardTitle>
                <CardDescription>Genera un informe médico completo a partir de la cronología del paciente.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                 <div className="space-y-2">
                    <h3 className="font-semibold text-sm">Fuente de Cronología del Paciente</h3>
                    <Textarea
                        readOnly
                        value={medicalHistory}
                        className="h-48 bg-muted/50"
                        />
                </div>
                <div>
                    <Button onClick={handleGenerateReport} disabled={isPending || isGenerating || medicalHistory === "No se encontró historial médico para este paciente."}>
                        <Wand2 className="mr-2 h-4 w-4" />
                        {isPending || isGenerating ? 'Generando Informe...' : 'Generar Informe Detallado'}
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
                        <h3 className="font-semibold text-lg mb-2">Informe Generado</h3>
                        <div className="prose prose-sm dark:prose-invert max-w-none rounded-md border bg-background p-6 text-card-foreground">
                            <h4 className="font-bold !text-base mt-0">Informe Médico</h4>
                            <p className="text-xs text-muted-foreground !mt-0 !mb-4">Generado el: {format(new Date(), 'd \'de\' MMMM \'de\' yyyy')}</p>
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
                            {medicalHistory === "No se encontró historial médico para este paciente."
                            ? "No hay historial médico disponible para generar un informe."
                            : "Haz clic en el botón de arriba para generar un informe completo."}
                        </p>
                    </div>
                 )}
            </CardContent>
            {report && !isGenerating && (
                <CardFooter className="justify-end gap-2 border-t pt-6">
                    <Button variant="outline" onClick={handleSaveReport}>
                        <Save className="mr-2 h-4 w-4" />
                        Guardar en Cronología
                    </Button>
                    <Button onClick={handleExport}>
                        <FileDown className="mr-2 h-4 w-4" />
                        Exportar como PDF
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}
