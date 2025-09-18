'use client';
import { getConsultationsByPatientId, getPatientById } from '@/lib/actions';
import { MedicalHistoryTimeline } from '@/components/history/medical-history-timeline';
import type { Consultation, Patient } from '@/lib/types';
import { useEffect, useState, use } from 'react';

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
        <MedicalHistoryTimeline 
            history={history} 
            onNewConsultation={handleNewConsultation}
        />
    </div>
  );
}
