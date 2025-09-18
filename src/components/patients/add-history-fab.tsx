'use client';
import { Button } from "@/components/ui/button";
import { ClipboardPlus } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { ConsultationForm } from "./consultation-form";
import type { Patient } from "@/lib/types";
import { useState } from "react";
  

export function AddHistoryFab({ patient }: { patient: Patient }) {
    const [open, setOpen] = useState(false);
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-lg bg-gradient-to-r from-primary to-blue-400 hover:from-primary/90 hover:to-blue-400/90">
                    <ClipboardPlus className="h-8 w-8" />
                    <span className="sr-only">Add Medical History</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                <DialogTitle>Add New Consultation</DialogTitle>
                <DialogDescription>
                    Fill in the details for the new consultation record.
                </DialogDescription>
                </DialogHeader>
                <ConsultationForm patientId={patient.id} onFormSubmit={() => setOpen(false)} />
            </DialogContent>
        </Dialog>
    )
}
