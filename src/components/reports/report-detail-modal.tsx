'use client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Report } from '@/lib/types';
import { Badge } from '../ui/badge';
import { FileDown, Paperclip, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReportDetailModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  report: Report;
}

export function ReportDetailModal({ isOpen, setIsOpen, report }: ReportDetailModalProps) {
  const { toast } = useToast();

  const handleExport = () => {
    toast({
        title: "Exportando Informe (Simulación)",
        description: `Se descargaría un PDF del informe: ${report.title}.`,
    });
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
          <DialogDescription className="sr-only">
            Detalles del informe: {report.title}
          </DialogDescription>
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
