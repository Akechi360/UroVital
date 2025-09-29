
'use client';
import { useState, useMemo, useEffect, forwardRef } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarIcon, Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { AffiliateLead } from "@/lib/types";
import { AFFILIATE_PLANS, PAYMENT_METHODS } from "@/lib/payment-options";
import { submitAffiliateLead } from "@/lib/actions";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { AnimatePresence, motion } from "framer-motion";

const MySwal = withReactContent(Swal);

// --- Form Schema ---
const step1Schema = z.object({
  fullName: z.string().min(3, "El nombre completo es requerido."),
  documentId: z.string().min(6, "El documento de identidad es requerido."),
  birthDate: z.date({ required_error: "La fecha de nacimiento es requerida." }),
  phone: z.string().min(10, "El teléfono debe tener al menos 10 dígitos."),
  email: z.string().email("El correo electrónico no es válido."),
  address: z.string().min(10, "La dirección es requerida."),
  planId: z.enum(['tarjeta-saludable', 'fondo-espiritu-santo']),
});

const step2Schema = z.object({
  paymentMode: z.enum(['contado', 'credito']),
  paymentMethod: z.enum(['banvenez', 'mercantil', 'bnc', 'banesco', 'usdt', 'wallytech', 'zinlli', 'paypal']),
});

type Step1Values = z.infer<typeof step1Schema>;
type Step2Values = z.infer<typeof step2Schema>;

// --- Step Indicator ---
const StepIndicator = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => (
  <div className="flex items-center justify-center gap-2 mb-4">
    {Array.from({ length: totalSteps }).map((_, index) => (
      <div
        key={index}
        className={cn(
          "h-2 w-8 rounded-full transition-all duration-300",
          index + 1 === currentStep ? "w-12 bg-primary" : "bg-muted"
        )}
      />
    ))}
  </div>
);

// --- Plan Selection Card ---
const PlanCard = forwardRef<HTMLButtonElement, { plan: typeof AFFILIATE_PLANS[0], isSelected: boolean } & React.HTMLAttributes<HTMLButtonElement>>(({ plan, isSelected, ...props }, ref) => (
    <button
        ref={ref}
        type="button"
        className={cn(
            "relative w-full text-left p-4 border rounded-lg transition-all duration-200",
            isSelected ? "border-primary ring-2 ring-primary/50 bg-primary/5" : "border-border hover:bg-muted/50"
        )}
        {...props}
    >
        {isSelected && <div className="absolute top-2 right-2 h-5 w-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center"><Check className="h-3 w-3" /></div>}
        <p className="font-semibold">{plan.name}</p>
        <p className="text-sm text-muted-foreground">{plan.subtitle}</p>
        <p className="text-lg font-bold mt-1">${plan.price}</p>
    </button>
));
PlanCard.displayName = 'PlanCard';

// --- Payment Method Card ---
const PaymentMethodCard = forwardRef<HTMLButtonElement, { method: typeof PAYMENT_METHODS[0], isSelected: boolean } & React.HTMLAttributes<HTMLButtonElement>>(({ method, isSelected, ...props }, ref) => (
     <button
        ref={ref}
        type="button"
        className={cn(
            "relative w-full text-left p-4 border rounded-lg transition-all duration-200 flex items-center gap-4",
            isSelected ? "border-primary ring-2 ring-primary/50 bg-primary/5" : "border-border hover:bg-muted/50"
        )}
        {...props}
    >
        <Image src={method.logoSrc} alt={method.label} width={40} height={40} className="rounded-md" />
        <div className="flex-1">
            <p className="font-semibold">{method.label}</p>
            <p className="text-sm text-muted-foreground">{method.description}</p>
        </div>
         {isSelected && <div className="absolute top-2 right-2 h-5 w-5 text-primary"><Circle className="h-5 w-5 fill-current" /></div>}
    </button>
));
PaymentMethodCard.displayName = 'PaymentMethodCard';


// --- Main Component ---
interface AffiliateFlowTriggerProps {
  planId?: AffiliateLead['planId'];
  children: React.ReactNode;
  onSuccess?: () => void;
}

export function AffiliateFlowTrigger({ planId, children, onSuccess }: AffiliateFlowTriggerProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [formValues, setFormValues] = useState<Partial<Step1Values & Step2Values>>({
      planId: planId || 'tarjeta-saludable',
      paymentMode: 'contado',
  });
  
  const form = useForm<Step1Values & Step2Values>({
    resolver: zodResolver(step === 1 ? step1Schema : step2Schema),
    defaultValues: formValues,
  });

  const selectedPlan = AFFILIATE_PLANS.find(p => p.id === form.watch('planId'));

  const creditDetails = useMemo(() => {
    if (!selectedPlan) return null;
    const { price, credit } = selectedPlan;
    const upfront = price * credit.upfrontPercent;
    const remaining = price - upfront;
    const installmentValue = remaining / credit.installments;
    return { upfront, installmentValue, ...credit };
  }, [selectedPlan]);

  const resetFlow = () => {
    form.reset({ planId: planId || 'tarjeta-saludable', paymentMode: 'contado' });
    setStep(1);
    setOpen(false);
  };

  const handleStep1Submit = (data: Step1Values) => {
    setFormValues(prev => ({...prev, ...data}));
    setStep(2);
  };

  const handleStep2Submit = async (data: Step2Values) => {
    const finalData: AffiliateLead = {
        ...formValues as Step1Values,
        ...data,
        birthDate: format(formValues.birthDate!, 'yyyy-MM-dd'),
        schedule: data.paymentMode === 'credito' && creditDetails ? {
            upfront: creditDetails.upfront,
            installments: creditDetails.installments,
            installmentValue: creditDetails.installmentValue,
            frequencyDays: creditDetails.frequencyDays,
        } : undefined,
    };
    
    await submitAffiliateLead(finalData);

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
    resetFlow();
  };

  useEffect(() => {
    // Sync external planId with form state when dialog opens
    if (open) {
        form.setValue('planId', planId || 'tarjeta-saludable');
    }
  }, [open, planId, form]);

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <form onSubmit={form.handleSubmit(handleStep1Submit)} className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="fullName" render={({ field }) => (
                    <FormItem><FormLabel>Nombre Completo</FormLabel><Input {...field} /></FormItem>
                )}/>
                <FormField control={form.control} name="documentId" render={({ field }) => (
                    <FormItem><FormLabel>Cédula o Pasaporte</FormLabel><Input {...field} /></FormItem>
                )}/>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField control={form.control} name="birthDate" render={({ field }) => (
                    <FormItem className="flex flex-col"><FormLabel>Fecha de Nacimiento</FormLabel>
                        <Popover><PopoverTrigger asChild>
                            <Button variant="outline" className={cn(!field.value && "text-muted-foreground")}>
                                {field.value ? format(field.value, 'PPP') : <span>Selecciona una fecha</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} captionLayout="dropdown-buttons" fromYear={1920} toYear={new Date().getFullYear()} /></PopoverContent></Popover>
                    </FormItem>
                )}/>
                <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem><FormLabel>Teléfono</FormLabel><Input type="tel" {...field} /></FormItem>
                )}/>
            </div>
             <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Correo Electrónico</FormLabel><Input type="email" {...field} /></FormItem>
            )}/>
             <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem><FormLabel>Dirección</FormLabel><Textarea {...field} /></FormItem>
            )}/>
             <FormField control={form.control} name="planId" render={({ field }) => (
                <FormItem><FormLabel>Selecciona un Plan</FormLabel>
                    <RadioGroup value={field.value} onValueChange={field.onChange} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {AFFILIATE_PLANS.map(plan => (
                         <RadioGroupItem key={plan.id} value={plan.id} className="sr-only" />
                       ))}
                       {AFFILIATE_PLANS.map(plan => (
                         <PlanCard key={plan.id} plan={plan} isSelected={field.value === plan.id} onClick={() => field.onChange(plan.id)} />
                       ))}
                    </RadioGroup>
                </FormItem>
            )}/>
            <DialogFooter>
                <Button type="submit">Continuar con pago</Button>
            </DialogFooter>
          </form>
        );
      case 2:
        return (
          <form onSubmit={form.handleSubmit(handleStep2Submit)} className="space-y-6">
            <FormField control={form.control} name="paymentMode" render={({ field }) => (
                <FormItem><FormLabel>Modalidad de Pago</FormLabel>
                    <RadioGroup value={field.value} onValueChange={field.onChange} className="flex gap-4">
                        <div className="flex items-center space-x-2"><RadioGroupItem value="contado" id="contado" /><Label htmlFor="contado">Contado</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="credito" id="credito" /><Label htmlFor="credito">Crédito</Label></div>
                    </RadioGroup>
                </FormItem>
            )}/>

             <AnimatePresence>
                {form.watch('paymentMode') === 'credito' && creditDetails && (
                    <motion.div initial={{opacity: 0, height: 0}} animate={{opacity: 1, height: 'auto'}} exit={{opacity: 0, height: 0}} className="p-4 bg-muted/50 rounded-lg text-sm">
                        <h4 className="font-semibold mb-2">Resumen del Plan de Pago a Crédito</h4>
                        <ul className="space-y-1">
                            <li><strong>Inicial ({creditDetails.upfrontPercent * 100}%):</strong> ${creditDetails.upfront.toFixed(2)}</li>
                            <li><strong>Cuotas:</strong> {creditDetails.installments} de ${creditDetails.installmentValue.toFixed(2)} c/u</li>
                            <li><strong>Frecuencia:</strong> Cada {creditDetails.frequencyDays} días</li>
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>

             <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                <FormItem><FormLabel>Método de Pago</FormLabel>
                    <RadioGroup value={field.value} onValueChange={field.onChange} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {PAYMENT_METHODS.map(method => (
                         <RadioGroupItem key={method.id} value={method.id} className="sr-only" />
                       ))}
                       {PAYMENT_METHODS.map(method => (
                           <PaymentMethodCard key={method.id} method={method} isSelected={field.value === method.id} onClick={() => field.onChange(method.id)} />
                       ))}
                    </RadioGroup>
                </FormItem>
            )}/>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setStep(1)}>Atrás</Button>
                <Button type="submit" disabled={!form.watch('paymentMethod')}>Confirmar Afiliación</Button>
            </DialogFooter>
          </form>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        if (!isOpen) resetFlow();
        setOpen(isOpen);
    }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Formulario de Afiliación</DialogTitle>
          <DialogDescription>
            Paso {step} de 2: {step === 1 ? 'Completa tus datos personales.' : 'Selecciona tu método de pago.'}
          </DialogDescription>
        </DialogHeader>
        <StepIndicator currentStep={step} totalSteps={2} />
        <ScrollArea className="max-h-[65vh] pr-4">
            {renderStep()}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
