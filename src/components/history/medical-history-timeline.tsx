import type { Patient, Consultation } from "@/lib/types"
import { Stethoscope } from "lucide-react"
import { ConsultationCard } from "./consultation-card"

interface MedicalHistoryTimelineProps {
    history: Consultation[];
}

export function MedicalHistoryTimeline({ history }: MedicalHistoryTimelineProps) {
    const sortedHistory = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="relative pl-6">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2"></div>
            
            <div className="space-y-8">
                {sortedHistory.map((item, index) => (
                    <div key={item.id} className="relative">
                        <div className="absolute -left-0.5 top-2.5 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
                        <div className="pl-8">
                            <ConsultationCard consultation={item} />
                        </div>
                    </div>
                ))}
                {history.length === 0 && (
                    <div className="text-center text-muted-foreground py-10">
                        <Stethoscope className="mx-auto h-12 w-12" />
                        <h3 className="mt-2 text-lg font-medium">No Medical History</h3>
                        <p className="mt-1 text-sm">Add the first consultation record for this patient.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
