
'use client';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ClipboardPlus, CalendarPlus, FileDown } from "lucide-react";

export function QuickActions() {
    const { toast } = useToast();

    const handleMockAction = (action: string) => {
        toast({
            title: `Acción Simulada: ${action}`,
            description: "Esta funcionalidad se conectará en el futuro.",
        });
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
             <Button variant="outline" className="justify-start text-left h-auto py-3 bg-card/50" onClick={() => handleMockAction("Agregar Historia")}>
                <ClipboardPlus className="mr-4 h-6 w-6 text-primary" />
                <div>
                    <p className="font-semibold">Agregar Historia</p>
                    <p className="text-xs text-muted-foreground">Nueva consulta, nota o resultado.</p>
                </div>
            </Button>
            <Button variant="outline" className="justify-start text-left h-auto py-3 bg-card/50" onClick={() => handleMockAction("Agendar Cita")}>
                <CalendarPlus className="mr-4 h-6 w-6 text-primary" />
                 <div>
                    <p className="font-semibold">Agendar Cita</p>
                    <p className="text-xs text-muted-foreground">Programar una nueva cita.</p>
                </div>
            </Button>
            <Button variant="outline" className="justify-start text-left h-auto py-3 bg-card/50" onClick={() => handleMockAction("Exportar PDF")}>
                <FileDown className="mr-4 h-6 w-6 text-primary" />
                 <div>
                    <p className="font-semibold">Exportar Resumen</p>
                    <p className="text-xs text-muted-foreground">Descargar un resumen en PDF.</p>
                </div>
            </Button>
        </div>
    );
}
