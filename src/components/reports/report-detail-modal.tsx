'use client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Report } from '@/lib/types';
import { Badge } from '../ui/badge';
import { FileDown, Paperclip, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from "jspdf";

interface ReportDetailModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  report: Report;
}

export function ReportDetailModal({ isOpen, setIsOpen, report }: ReportDetailModalProps) {
  const { toast } = useToast();

  const handleExport = () => {
    try {
        const doc = new jsPDF();

        // Add title
        doc.setFontSize(18);
        doc.setTextColor(58, 109, 255);
        doc.text(report.title, doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });

        // Add date
        doc.setFontSize(10);
        doc.setTextColor(100);
        const reportDate = new Date(report.date).toLocaleDateString();
        doc.text(`Fecha del informe: ${reportDate}`, doc.internal.pageSize.getWidth() - 20, 30, { align: "right" });

        // Add content
        doc.setFontSize(12);
        doc.setTextColor(51, 51, 51);
        const lines = doc.splitTextToSize(report.notes, 180);
        doc.text(lines, 15, 40);

        const dateString = new Date(report.date).toISOString().slice(0,10);
        const filename = `informe_${report.id}_${dateString}.pdf`;
        doc.save(filename);

        toast({
            title: "Exportando Informe",
            description: `Se ha iniciado la descarga del informe: ${report.title}.`,
        });
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error en la exportación",
            description: "No se pudo generar el archivo del informe.",
        });
        console.error("Failed to export report:", error);
    }
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{report.title}</DialogTitle>
          <div className="flex items-center gap-4 pt-1">
            <Badge variant="secondary">{report.type}</Badge>
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                <Calendar className='h-4 w-4'/>
                {new Date(report.date).toLocaleDateString()}
            </div>
          </div>
        </DialogHeader>
        <div className="py-4 space-y-6">
            <div className='space-y-2'>
                <h3 className='font-semibold'>Notas del Informe</h3>
                <p className="text-muted-foreground text-sm">{report.notes}</p>
            </div>
            {report.attachments && report.attachments.length > 0 && (
                <div className='space-y-2'>
                    <h3 className='font-semibold flex items-center gap-2'><Paperclip className='h-4 w-4'/> Adjuntos</h3>
                    {/* In a real app, this would be a gallery of images */}
                    <div className="grid grid-cols-3 gap-4">
                        {report.attachments.map((att, index) => (
                            <div key={index} className="aspect-square bg-muted rounded-lg flex items-center justify-center text-muted-foreground text-xs">
                                {att}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cerrar</Button>
          <Button onClick={handleExport}>
            <FileDown className="mr-2 h-4 w-4" />
            Exportar como PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}