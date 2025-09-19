
'use client';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ClipboardPlus, CalendarPlus, FileDown } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ConsultationForm, ConsultationFormValues } from "./consultation-form";
import type { Patient } from "@/lib/types";
import jsPDF from "jspdf";
import { format } from 'date-fns';

interface QuickActionsProps {
    patient: Patient;
}

export function QuickActions({ patient }: QuickActionsProps) {
    const { toast } = useToast();
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    const handleAddHistory = (values: ConsultationFormValues) => {
        toast({
            title: "Acción Simulada: Agregar Historia",
            description: `Nueva consulta de tipo "${values.type}" guardada.`,
        });
        setIsHistoryModalOpen(false);
    }
    
    const handleAddAppointment = () => {
        toast({
            title: "Acción Simulada: Agendar Cita",
            description: `Modal de cita para ${patient.name} abierto.`,
        });
        setIsAppointmentModalOpen(false);
    }

    const handleExportSummary = () => {
        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.text(`Resumen del Paciente: ${patient.name}`, 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(150);
        doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 30);

        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`ID del Paciente: ${patient.id}`, 14, 45);
        doc.text(`Edad: ${patient.age} años`, 14, 52);
        doc.text(`Género: ${patient.gender}`, 14, 59);

        // This is a placeholder for a real summary
        doc.text("Aquí iría un resumen más detallado del estado del paciente...", 14, 70);

        const filename = `Resumen-${patient.name.replace(/\s/g, '_')}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
        doc.save(filename);
        
        toast({
            title: "Exportación Completada",
            description: `Se ha descargado el resumen de ${patient.name}.`,
        });
        setIsExportModalOpen(false);
    }

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Button variant="outline" className="justify-start text-left h-auto py-3 bg-card/50" onClick={() => setIsHistoryModalOpen(true)}>
                    <ClipboardPlus className="mr-4 h-6 w-6 text-primary" />
                    <div>
                        <p className="font-semibold">Agregar Historia</p>
                        <p className="text-xs text-muted-foreground">Nueva consulta, nota o resultado.</p>
                    </div>
                </Button>
                <Button variant="outline" className="justify-start text-left h-auto py-3 bg-card/50" onClick={() => setIsAppointmentModalOpen(true)}>
                    <CalendarPlus className="mr-4 h-6 w-6 text-primary" />
                    <div>
                        <p className="font-semibold">Agendar Cita</p>
                        <p className="text-xs text-muted-foreground">Programar una nueva cita.</p>
                    </div>
                </Button>
                <Button variant="outline" className="justify-start text-left h-auto py-3 bg-card/50" onClick={() => setIsExportModalOpen(true)}>
                    <FileDown className="mr-4 h-6 w-6 text-primary" />
                    <div>
                        <p className="font-semibold">Exportar Resumen</p>
                        <p className="text-xs text-muted-foreground">Descargar un resumen en PDF.</p>
                    </div>
                </Button>
            </div>

            {/* Modals */}
            <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Añadir Nueva Consulta</DialogTitle>
                        <DialogDescription>Rellena los detalles para el nuevo registro de consulta para {patient.name}.</DialogDescription>
                    </DialogHeader>
                    <ConsultationForm onFormSubmit={handleAddHistory} />
                </DialogContent>
            </Dialog>

            <Dialog open={isAppointmentModalOpen} onOpenChange={setIsAppointmentModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Agendar Nueva Cita</DialogTitle>
                        <DialogDescription>Programar una nueva cita para {patient.name}.</DialogDescription>
                    </DialogHeader>
                    {/* Placeholder for appointment form */}
                    <div className="py-8 text-center text-muted-foreground">
                        <p>El formulario para agendar citas aparecerá aquí.</p>
                    </div>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setIsAppointmentModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleAddAppointment}>Guardar Cita</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Exportar Resumen del Paciente</DialogTitle>
                        <DialogDescription>
                            Se generará un documento PDF con el resumen de {patient.name}. ¿Deseas continuar?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setIsExportModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleExportSummary}>Sí, Exportar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
