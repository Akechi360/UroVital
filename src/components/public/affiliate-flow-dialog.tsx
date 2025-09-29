// src/components/public/affiliate-flow-dialog.tsx
'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { CalendarIcon, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { submitAffiliateLead } from '@/lib/actions';
import { AFFILIATE_PLANS, PAYMENT_METHODS } from '@/lib/payment-options';
import type { AffiliateLead } from '@/lib/types';
import { Card } from '../ui/card';

const MySwal = withReactContent(Swal);

const step1Schema = z.object({
  fullName: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
  documentId: z.string().min(6, "El documento de identidad es requerido."),
  birthDate: z.date({ required_error: "La fecha de nacimiento es requerida." }),
  phone: z.string().min(7, "El teléfono debe tener al menos 7 dígitos."),
  email: z.string().email("El correo electrónico no es válido."),
  address: z.string().min(10, "La dirección debe tener al menos 10 caracteres."),
});

type Step1Values = z.infer<typeof step1Schema>;

interface AffiliateFlowTriggerProps {
  planId?: AffiliateLead['planId'];
  children: React.ReactNode;
  onSuccess?: () => void;
}

export function AffiliateFlowTrigger({ planId: initialPlanId, children, onSuccess }: AffiliateFlowTriggerProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedPlanId, setSelectedPlanId] = useState<AffiliateLead['planId']>(initialPlanId || 'tarjeta-saludable');
  const [paymentMode, setPaymentMode] = useState<'contado' | 'credito'>('contado');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);

  const form = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      fullName: '',
      documentId: '',
      phone: '',
      email: '',
      address: '',
    },
  });

  const selectedPlan = useMemo(() => AFFILIATE_PLANS.find(p => p.id === selectedPlanId)!, [selectedPlanId]);

  const creditSchedule = useMemo(() => {
    if (!selectedPlan || !selectedPlan.credit) return null;
    const upfront = selectedPlan.price * selectedPlan.credit.upfrontPercent;
    const remaining = selectedPlan.price - upfront;
    const installmentValue = remaining / selectedPlan.credit.installments;
    return {
      upfront,
      installments: selectedPlan.credit.installments,
      installmentValue,
      frequencyDays: selectedPlan.credit.frequencyDays,
    };
  }, [selectedPlan]);

  const handleStep1Submit = (values: Step1Values) => {
    setStep(2);
  };
  
  const handleFinalSubmit = async () => {
    const step1Values = form.getValues();
    
    if (!selectedPaymentMethod) return;

    const lead: AffiliateLead = {
      ...step1Values,
      birthDate: format(step1Values.birthDate, 'yyyy-MM-dd'),
      planId: selectedPlanId,
      paymentMode,
      paymentMethod: selectedPaymentMethod as AffiliateLead['paymentMethod'],
      schedule: paymentMode === 'credito' ? creditSchedule! : undefined,
    };
    
    try {
      await submitAffiliateLead(lead);
      setOpen(false);
      const isDarkMode = document.documentElement.classList.contains('dark');
      MySwal.fire({
          title: '¡Gracias por afiliarte!',
          text: 'Hemos enviado la información a tu correo.',
          icon: 'success',
          background: isDarkMode ? '#1e293b' : '#ffffff',
          color: isDarkMode ? '#f1f5f9' : '#0f172a',
          confirmButtonColor: '#4f46e5',
      });
      onSuccess?.();
      // Reset state
      form.reset();
      setStep(1);
      setPaymentMode('contado');
      setSelectedPaymentMethod(null);
    } catch(e) {
      // Handle error
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <DialogHeader>
              <DialogTitle>Paso 1: Datos del Afiliado</DialogTitle>
              <DialogDescription>Completa tus datos personales para iniciar la afiliación.</DialogDescription>
            </DialogHeader>
             <Form {...form}>
              <form onSubmit={form.handleSubmit(handleStep1Submit)} className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="fullName" render={({ field }) => (
                        <FormItem><FormLabel>Nombre Completo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="documentId" render={({ field }) => (
                        <FormItem><FormLabel>CI / Pasaporte</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                </div>
                <FormField control={form.control} name="birthDate" render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Fecha de Nacimiento</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                                <FormControl>
                                <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                    {field.value ? format(field.value, "PPP") : <span>Elige una fecha</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} captionLayout="dropdown-buttons" fromYear={1930} toYear={new Date().getFullYear()} initialFocus />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                )}/>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                </div>
                <FormField control={form.control} name="address" render={({ field }) => (
                    <FormItem><FormLabel>Dirección</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                
                 <div>
                    <Label className="mb-2 block">Selecciona tu Plan</Label>
                    <RadioGroup value={selectedPlanId} onValueChange={(val) => setSelectedPlanId(val as any)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {AFFILIATE_PLANS.map(plan => (
                          <Label key={plan.id} htmlFor={plan.id} className={cn(
                              "block cursor-pointer rounded-lg border p-4 transition-all",
                              selectedPlanId === plan.id ? "border-primary ring-2 ring-primary" : "border-border"
                          )}>
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold">{plan.name}</h4>
                                <RadioGroupItem value={plan.id} id={plan.id} className="h-5 w-5" />
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{plan.subtitle}</p>
                              <p className="text-xl font-bold mt-2">${plan.price}</p>
                          </Label>
                      ))}
                    </RadioGroup>
                </div>
                <DialogFooter>
                  <Button type="submit">Continuar con Pago</Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        );
      case 2:
        return (
          <>
            <DialogHeader>
              <DialogTitle>Paso 2: Método de Pago</DialogTitle>
              <DialogDescription>Selecciona cómo deseas pagar tu afiliación.</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
                <RadioGroup value={paymentMode} onValueChange={(val) => setPaymentMode(val as any)} className="grid grid-cols-2 gap-4">
                    <Label htmlFor="contado" className={cn("block cursor-pointer rounded-lg border p-4 text-center", paymentMode === 'contado' && 'border-primary ring-2 ring-primary')}>
                        <RadioGroupItem value="contado" id="contado" className="sr-only" />
                        <h4 className="font-semibold">Contado</h4>
                    </Label>
                    <Label htmlFor="credito" className={cn("block cursor-pointer rounded-lg border p-4 text-center", paymentMode === 'credito' && 'border-primary ring-2 ring-primary')}>
                        <RadioGroupItem value="credito" id="credito" className="sr-only" />
                        <h4 className="font-semibold">Crédito</h4>
                    </Label>
                </RadioGroup>

                {paymentMode === 'credito' && creditSchedule && (
                    <Card className="p-4 bg-muted/50">
                        <h5 className="font-semibold">Resumen de Crédito</h5>
                        <p className="text-sm text-muted-foreground">Inicial ({selectedPlan.credit.upfrontPercent * 100}%): ${creditSchedule.upfront.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">{creditSchedule.installments} cuotas de ${creditSchedule.installmentValue.toFixed(2)} c/u cada {creditSchedule.frequencyDays} días.</p>
                    </Card>
                )}
                
                <RadioGroup value={selectedPaymentMethod || ''} onValueChange={setSelectedPaymentMethod} className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {PAYMENT_METHODS.map(method => (
                        <Label key={method.id} htmlFor={method.id} className={cn("flex flex-col items-center justify-center gap-2 rounded-lg border p-3 cursor-pointer aspect-square", selectedPaymentMethod === method.id && "border-primary ring-2 ring-primary")}>
                            <Image src={method.logoSrc} alt={method.label} width={40} height={40} className="dark:invert"/>
                            <span className="text-xs font-medium text-center">{method.label}</span>
                            <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                        </Label>
                    ))}
                </RadioGroup>

                {selectedPaymentMethod && (
                    <Card className="p-4 bg-muted/50">
                         <h5 className="font-semibold">Información de Pago para {PAYMENT_METHODS.find(m => m.id === selectedPaymentMethod)?.label}</h5>
                         <p className="text-sm text-muted-foreground">{PAYMENT_METHODS.find(m => m.id === selectedPaymentMethod)?.accountInfo}</p>
                    </Card>
                )}
            </div>
            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={() => setStep(1)}>Atrás</Button>
              <Button onClick={handleFinalSubmit} disabled={!selectedPaymentMethod}>Confirmar Afiliación</Button>
            </DialogFooter>
          </>
        );
      default:
        return null;
    }
  };
  
  const StepIndicator = () => (
      <div className="flex items-center justify-center gap-2 mb-4">
        {[1, 2].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center transition-colors",
              step > s ? "bg-green-500 text-white" : step === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              {step > s ? <CheckCircle className="h-5 w-5" /> : s}
            </div>
            {s < 2 && <div className={cn("h-0.5 w-12", step > s ? 'bg-green-500' : 'bg-muted')} />}
          </div>
        ))}
      </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-xl">
        <StepIndicator />
        <ScrollArea className="max-h-[70vh] pr-4">
            {renderStep()}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
