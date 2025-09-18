'use client';
import { getConsultationsByPatientId, getPatientById } from '@/lib/actions';
import { MedicalHistoryTimeline } from '@/components/history/medical-history-timeline';
import type { Consultation, Patient } from '@/lib/types';
import { useEffect, useState, use } from 'react';
import { ExportHistoryButton } from '@/components/history/export-history-button';
import { Button } from '@/components/ui/button';
import { Filter, Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';

export default function PatientHistoryPage({ params }: { params: Promise<{ patientId: string }> }) {
  const { patientId } = use(params);
  const [history, setHistory] = useState<Consultation[]>([]);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      const [medicalHistory, patientData] = await Promise.all([
        getConsultationsByPatientId(patientId),
        getPatientById(patientId)
      ]);
      setHistory(medicalHistory);
      setPatient(patientData || null);
      setLoading(false);
    };
    fetchHistory();
  }, [patientId]);

  const handleNewConsultation = (newConsultation: Omit<Consultation, 'id' | 'patientId'>) => {
    const fullConsultation: Consultation = {
      ...newConsultation,
      id: `c-${Date.now()}`, // Mock ID
      patientId: patientId,
    };
    setHistory(prevHistory => [fullConsultation, ...prevHistory]);
  };

  if (loading) {
    // You can replace this with a proper skeleton loader for the timeline
    return <div>Cargando historial...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
        <div className="flex items-center justify-end gap-2">
             <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline">
                            <Filter className="mr-2 h-4 w-4" />
                            Filtros
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <h4 className="font-medium leading-none">Filtros</h4>
                                <p className="text-sm text-muted-foreground">
                                Ajusta los filtros para el historial médico.
                                </p>
                            </div>
                            <div className="grid gap-2">
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <Label htmlFor="status">Tipo</Label>
                                    <Select>
                                        <SelectTrigger className="w-full col-span-2">
                                            <SelectValue placeholder="Filtrar por tipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Todos">Todos</SelectItem>
                                            <SelectItem value="Inicial">Inicial</SelectItem>
                                            <SelectItem value="Seguimiento">Seguimiento</SelectItem>
                                            <SelectItem value="Pre-operatorio">Pre-operatorio</SelectItem>
                                            <SelectItem value="Post-operatorio">Post-operatorio</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                     <Label>Fecha</Label>
                                     <div className='col-span-2'>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className='w-full justify-start text-left font-normal'>
                                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                                    <span>Elige una fecha</span>
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                mode="single"
                                                />
                                            </PopoverContent>
                                        </Popover>
                                     </div>
                                </div>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            {patient && <ExportHistoryButton patient={patient} />}
        </div>
        <MedicalHistoryTimeline 
            history={history} 
            onNewConsultation={handleNewConsultation}
        />
    </div>
  );
}
