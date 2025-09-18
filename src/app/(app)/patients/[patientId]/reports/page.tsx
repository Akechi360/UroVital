import { getReportsByPatientId } from "@/lib/actions";
import ReportList from "@/components/reports/report-list";

export default async function PatientReportsPage({ params }: { params: { patientId: string } }) {
    const reports = await getReportsByPatientId(params.patientId);

    return <ReportList initialReports={reports} patientId={params.patientId} />;
}
