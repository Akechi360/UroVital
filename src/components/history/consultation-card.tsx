import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Pill, Microscope } from "lucide-react"
import { format } from "date-fns"
import type { Consultation } from "@/lib/types"

interface ConsultationCardProps {
    consultation: Consultation;
}

export function ConsultationCard({ consultation }: ConsultationCardProps) {
    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>{format(new Date(consultation.date), "d 'de' MMMM, yyyy")}</CardTitle>
                        <CardDescription>Consulta con {consultation.doctor}</CardDescription>
                    </div>
                     <Badge variant={consultation.type === 'Seguimiento' ? 'secondary' : 'default'}>{consultation.type}</Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h4 className="font-semibold text-sm mb-1">Notas</h4>
                    <p className="text-muted-foreground text-sm">{consultation.notes}</p>
                </div>

                {consultation.prescriptions && consultation.prescriptions.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-sm mb-2 flex items-center"><Pill className="w-4 h-4 mr-2" />Recetas</h4>
                        <div className="flex flex-wrap gap-2">
                            {consultation.prescriptions.map(p => <Badge variant="outline" key={p.id}>{p.medication}</Badge>)}
                        </div>
                    </div>
                )}
                
                {consultation.labResults && consultation.labResults.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-sm mb-2 flex items-center"><Microscope className="w-4 h-4 mr-2" />Resultados de Laboratorio</h4>
                        <div className="flex flex-wrap gap-2">
                             {consultation.labResults.map(l => <Badge variant="outline" key={l.id}>{l.testName}</Badge>)}
                        </div>
                    </div>
                )}

                {consultation.reports && consultation.reports.length > 0 && (
                     <div>
                        <h4 className="font-semibold text-sm mb-2 flex items-center"><FileText className="w-4 h-4 mr-2" />Informes</h4>
                        <div className="flex flex-wrap gap-2">
                            {consultation.reports.map(r => <Badge variant="outline" key={r.id}>{r.title}</Badge>)}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
