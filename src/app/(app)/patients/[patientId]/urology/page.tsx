import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PsaChart } from '@/components/dashboard/charts';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from '@/components/ui/table'
import { getLabResultsByPatientId, getIpssScoresByPatientId } from '@/lib/actions';
import LabResultsCard from '@/components/patients/lab-results-card';
import { IpssCalculator } from '@/components/patients/ipss-calculator';

  const uroflowData = [
    { date: "2024-08-15", qmax: "12 mL/s", avgFlow: "7 mL/s", voidedVol: "250 mL", pvr: "50 mL" },
    { date: "2024-05-20", qmax: "10 mL/s", avgFlow: "6 mL/s", voidedVol: "220 mL", pvr: "65 mL" },
    { date: "2024-02-10", qmax: "9 mL/s", avgFlow: "5.5 mL/s", voidedVol: "200 mL", pvr: "70 mL" },
  ]

export default async function UrologyDataPage({ params }: { params: { patientId: string } }) {
    const labResults = await getLabResultsByPatientId(params.patientId);
    const ipssScores = await getIpssScoresByPatientId(params.patientId);

    return (
        <div className="grid gap-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="rounded-2xl shadow-md hover:shadow-lg transition-all bg-card/50">
                    <CardHeader>
                        <CardTitle>Resultados de Uroflujometría</CardTitle>
                        <CardDescription>Datos históricos de uroflujometría del paciente.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Qmax</TableHead>
                                <TableHead>Flujo Prom.</TableHead>
                                <TableHead>Vol. Miccional</TableHead>
                                <TableHead>RPM</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {uroflowData.map((flow) => (
                                <TableRow key={flow.date}>
                                    <TableCell className="font-medium">{flow.date}</TableCell>
                                    <TableCell>{flow.qmax}</TableCell>
                                    <TableCell>{flow.avgFlow}</TableCell>
                                    <TableCell>{flow.voidedVol}</TableCell>
                                    <TableCell>{flow.pvr}</TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                <LabResultsCard labResults={labResults} />
            </div>
            
            <PsaChart />

            <IpssCalculator patientId={params.patientId} historicalScores={ipssScores} />
        </div>
    )
}
