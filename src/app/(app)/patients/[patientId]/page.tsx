'use client';
import { getConsultationsByPatientId } from '@/lib/actions';
import { MedicalHistoryTimeline } from '@/components/history/medical-history-timeline';
import type { Consultation } from '@/lib/types';
import { useEffect, useState } from 'react';

export default function PatientHistoryPage({ params }: { params: { patientId: string } }) {
  const [history, setHistory] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      const medicalHistory = await getConsultationsByPatientId(params.patientId);
      setHistory(medicalHistory);
      setLoading(false);
    };
    fetchHistory();
  }, [params.patientId]);

  const handleNewConsultation = (newConsultation: Omit<Consultation, 'id' | 'patientId'>) => {
    const fullConsultation: Consultation = {
      ...newConsultation,
      id: `c-${Date.now()}`, // Mock ID
      patientId: params.patientId,
    };
    setHistory(prevHistory => [fullConsultation, ...prevHistory]);
  };

  if (loading) {
    // You can replace this with a proper skeleton loader for the timeline
    return <div>Cargando historial...</div>;
  }

  return (
      <MedicalHistoryTimeline history={history} onNewConsultation={handleNewConsultation}/>
  );
}
