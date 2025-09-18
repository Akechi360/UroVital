'use client';

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { getPatientMedicalHistoryAsString } from "@/lib/actions";
import type { Patient } from "@/lib/types";
import { Download } from "lucide-react";

interface ExportHistoryButtonProps {
    patient: Patient;
}

export function ExportHistoryButton({ patient }: ExportHistoryButtonProps) {
    const { toast } = useToast();

    const handleExport = async () => {
        try {
            const historyString = await getPatientMedicalHistoryAsString(patient.id);
            
            const blob = new Blob([historyString], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            link.download = `historial-${patient.id}-${date}.txt`; // Simulate PDF download with a txt file
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast({
                title: "Exportación completada",
                description: "La descarga del historial ha comenzado.",
            });
        } catch (error) {
             toast({
                variant: "destructive",
                title: "Error en la exportación",
                description: "No se pudo generar el archivo del historial.",
            });
            console.error("Failed to export history:", error);
        }
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        aria-label="Exportar historial médico"
                        onClick={handleExport}
                    >
                        <Download className="h-5 w-5" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Exportar historial (PDF)</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
