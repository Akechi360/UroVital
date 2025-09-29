'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import Image from 'next/image';
import { Stethoscope, LogIn, CalendarIcon, ArrowRight, ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import { submitAffiliateLead } from '@/lib/actions';
import type { AffiliateLead } from '@/lib/types';
import { AFFILIATE_PLANS, PAYMENT_METHODS } from '@/lib/payment-options';
import { cn } from '@/lib/utils';
import { useAuth } from '../layout/auth-provider';

const MySwal = withReactContent(Swal);

const step1Schema = z.object({
  fullName: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  documentId: z.string().min(6, 'El documento debe tener al menos 6 caracteres.'),
  birthDate: z.date({ required_error: 'La fecha de nacimiento es requerida.' }),
  phone: z.string().min(7, 'El teléfono debe tener al menos 7 caracteres.'),
  email: z.string().email('Debe ser un correo electrónico válido.'),
  address: z.string().min(10, 'La dirección debe tener al menos 10 caracteres.'),
});

const step2Schema = z.object({
    paymentMode: z.enum(['contado', 'credito'], { required_error: 'Selecciona un modo de pago.' }),
    paymentMethod: z.string({ required_error: 'Selecciona un método de pago.' }),
});

type Step1Values = z.infer<typeof step1Schema>;
type Step2Values = z.infer<typeof step2Schema>;

const steps = [
    { id: 1, name: 'Datos Personales' },
    { id: 2, name: 'Forma de Pago' },
    { id: 3, name: 'Confirmación' },
];

function OrderSummary({ plan, paymentMode, paymentMethod }: { plan: any, paymentMode?: string, paymentMethod?: string }) {
    const creditDetails = useMemo(() => {
        if (!plan || paymentMode !== 'credito') return null;
        const upfront = plan.price * plan.credit.upfrontPercent;
        const toFinance = plan.price - upfront;
        const installmentValue = toFinance / plan.credit.installments;
        return { upfront, installmentValue, installments: plan.credit.installments, frequency: plan.credit.frequencyDays };
    }, [plan, paymentMode]);

    const selectedPaymentMethod = PAYMENT_METHODS.find(p => p.id === paymentMethod);

    return (
        <Card className="sticky top-28 bg-card/50 backdrop-blur-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Resumen de Afiliación</h3>
            <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Plan:</span>
                    <span className="font-medium">{plan?.name || 'No seleccionado'}</span>
                </div>
                {plan && (
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Precio Anual:</span>
                        <span className="font-medium">${plan.price.toFixed(2)}</span>
                    </div>
                )}
                 {paymentMode && (
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Modalidad:</span>
                        <span className="font-medium capitalize">{paymentMode}</span>
                    </div>
                 )}
                 {selectedPaymentMethod && (
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Método:</span>
                        <span className="font-medium">{selectedPaymentMethod.label}</span>
                    </div>
                 )}
                <Separator/>
                {creditDetails && (
                    <div className="space-y-2 py-2">
                        <div className="flex justify-between font-medium">
                            <span>Inicial ({plan.credit.upfrontPercent * 100}%):</span>
                            <span>${creditDetails.upfront.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                            <span>{creditDetails.installments} cuotas de:</span>
                            <span>${creditDetails.installmentValue.toFixed(2)} c/u</span>
                        </div>
                    </div>
                )}
                 <div className="flex justify-between text-lg font-bold pt-2">
                    <span>Total a Pagar Hoy:</span>
                    <span>${creditDetails ? creditDetails.upfront.toFixed(2) : (plan?.price || 0).toFixed(2)}</span>
                </div>
            </div>
        </Card>
    );
}

export function AffiliateEnrollment() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [selectedPlanId, setSelectedPlanId] = useState(searchParams.get('plan') || AFFILIATE_PLANS[0].id);

  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);
  
  const form = useForm<Step1Values & Step2Values>({
    resolver: step === 1 ? zodResolver(step1Schema) : zodResolver(step2Schema),
  });

  const selectedPlan = AFFILIATE_PLANS.find(p => p.id === selectedPlanId);
  const paymentMode = form.watch('paymentMode');
  const paymentMethod = form.watch('paymentMethod');

  const handleStep1Submit = (data: Step1Values) => {
    setStep(2);
  };
  
  const handleStep2Submit = async (data: Step2Values) => {
      setStep(3);
      const allData = form.getValues();
      const plan = AFFILIATE_PLANS.find(p => p.id === selectedPlanId);
      if (!plan) return;

      let schedule;
      if (allData.paymentMode === 'credito') {
        const upfront = plan.price * plan.credit.upfrontPercent;
        const installmentValue = (plan.price - upfront) / plan.credit.installments;
        schedule = {
          upfront,
          installments: plan.credit.installments,
          installmentValue,
          frequencyDays: plan.credit.frequencyDays,
        }
      }

      const lead: AffiliateLead = {
          fullName: allData.fullName,
          documentId: allData.documentId,
          birthDate: format(allData.birthDate, 'yyyy-MM-dd'),
          phone: allData.phone,
          email: allData.email,
          address: allData.address,
          planId: selectedPlanId as AffiliateLead['planId'],
          paymentMode: allData.paymentMode,
          paymentMethod: allData.paymentMethod,
          schedule
      };

      await submitAffiliateLead(lead);

      const isDarkMode = document.documentElement.classList.contains('dark');
      MySwal.fire({
          title: '¡Gracias por afiliarte!',
          text: 'Hemos enviado la información a tu correo.',
          icon: 'success',
          background: isDarkMode ? '#1e293b' : '#ffffff',
          color: isDarkMode ? '#f1f5f9' : '#0f172a',
          confirmButtonColor: '#4f46e5',
      }).then(() => {
          router.push('/landing');
      });
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleStep1Submit)} className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="fullName" render={({ field }) => (
                      <FormItem><FormLabel>Nombre Completo</FormLabel><Input {...field} /></FormItem>
                  )}/>
                  <FormField control={form.control} name="documentId" render={({ field }) => (
                      <FormItem><FormLabel>Cédula / Pasaporte</FormLabel><Input {...field} /></FormItem>
                  )}/>
               </div>
               <FormField control={form.control} name="birthDate" render={({ field }) => (
                <FormItem className="flex flex-col"><FormLabel>Fecha de Nacimiento</FormLabel>
                    <Popover><PopoverTrigger asChild><FormControl>
                        <Button variant={"outline"} className={cn("pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>
                            {field.value ? format(field.value, "PPP") : <span>Elige una fecha</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                    </FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus /></PopoverContent></Popover>
                    <FormMessage />
                </FormItem>)}/>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem><FormLabel>Teléfono</FormLabel><Input type="tel" {...field} /></FormItem>
                    )}/>
                    <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem><FormLabel>Email</FormLabel><Input type="email" {...field} /></FormItem>
                    )}/>
                </div>
                <FormField control={form.control} name="address" render={({ field }) => (
                    <FormItem><FormLabel>Dirección</FormLabel><Textarea {...field} /></FormItem>
                )}/>

                <h3 className="font-medium pt-4">Selecciona tu Plan</h3>
                <RadioGroup value={selectedPlanId} onValueChange={setSelectedPlanId} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {AFFILIATE_PLANS.map(plan => (
                        <Label key={plan.id} htmlFor={plan.id} className={cn("block cursor-pointer rounded-lg border p-4 transition-all", selectedPlanId === plan.id ? "border-primary ring-2 ring-primary" : "border-border")}>
                            <div className="flex items-center">
                                <RadioGroupItem value={plan.id} id={plan.id} className="mr-4" />
                                <div>
                                    <p className="font-semibold">{plan.name}</p>
                                    <p className="text-sm text-muted-foreground">{plan.subtitle}</p>
                                    <p className="text-lg font-bold">${plan.price}</p>
                                </div>
                            </div>
                        </Label>
                    ))}
                </RadioGroup>
              <DialogFooter>
                 <Button type="submit" className="w-full">Continuar con el Pago <ArrowRight className="ml-2"/></Button>
              </DialogFooter>
            </form>
          </Form>
        );
      case 2:
        return (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleStep2Submit)} className="space-y-6">
                <div>
                    <h3 className="font-medium mb-2">Modalidad de Pago</h3>
                    <FormField control={form.control} name="paymentMode" render={({ field }) => (
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 gap-4">
                             <Label htmlFor="contado" className={cn("block cursor-pointer rounded-lg border p-4 transition-all", field.value === "contado" && "border-primary ring-2 ring-primary")}>
                                <div className="flex items-center">
                                    <RadioGroupItem value="contado" id="contado" className="mr-4" />
                                    <div><p className="font-semibold">Contado</p><p className="text-sm text-muted-foreground">Un solo pago</p></div>
                                </div>
                            </Label>
                            <Label htmlFor="credito" className={cn("block cursor-pointer rounded-lg border p-4 transition-all", field.value === "credito" && "border-primary ring-2 ring-primary")}>
                                <div className="flex items-center">
                                    <RadioGroupItem value="credito" id="credito" className="mr-4" />
                                    <div><p className="font-semibold">Crédito</p><p className="text-sm text-muted-foreground">Paga en cuotas</p></div>
                                </div>
                            </Label>
                        </RadioGroup>
                    )}/>
                </div>
                 <div>
                    <h3 className="font-medium mb-2">Método de Pago</h3>
                     <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {PAYMENT_METHODS.map(method => (
                                <Label key={method.id} htmlFor={method.id} className={cn("block cursor-pointer rounded-lg border p-4 transition-all", field.value === method.id && "border-primary ring-2 ring-primary")}>
                                     <div className="flex items-center">
                                         <RadioGroupItem value={method.id} id={method.id} className="mr-4" />
                                         <Image src={method.logoSrc} alt={method.label} width={24} height={24} className="mr-2" />
                                         <span className="font-medium text-sm">{method.label}</span>
                                     </div>
                                </Label>
                            ))}
                        </RadioGroup>
                     )}/>
                 </div>
              <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
                 <Button type="button" variant="outline" onClick={() => setStep(1)}><ArrowLeft className="mr-2"/> Volver</Button>
                 <Button type="submit" className="w-full" disabled={!paymentMethod || !paymentMode}>Confirmar Afiliación</Button>
              </DialogFooter>
            </form>
          </Form>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-5xl overflow-hidden rounded-2xl border border-border/20 bg-card/50 shadow-2xl shadow-primary/10 backdrop-blur-lg">
      <div className="p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 inline-block rounded-full bg-primary/10 p-3">
            <Stethoscope className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground font-headline">Formulario de Afiliación</h1>
          <p className="text-muted-foreground">Completa los siguientes pasos para unirte a UroVital.</p>
        </div>
        
        {/* Step Indicator */}
        <div className="flex justify-center items-center mb-8">
            {steps.map((s, index) => (
                <div key={s.id} className="flex items-center">
                    <div className={cn("flex flex-col items-center", s.id <= step ? "text-primary" : "text-muted-foreground")}>
                        <div className={cn("h-8 w-8 rounded-full flex items-center justify-center border-2", s.id <= step ? "border-primary bg-primary/10" : "border-border")}>
                           {s.id}
                        </div>
                        <p className="text-xs mt-1 text-center">{s.name}</p>
                    </div>
                    {index < steps.length - 1 && <div className={cn("flex-auto border-t-2 mx-4", s.id < step ? "border-primary" : "border-border")}></div>}
                </div>
            ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                {renderStep()}
            </div>
            <div>
                 <OrderSummary plan={selectedPlan} paymentMode={paymentMode} paymentMethod={paymentMethod} />
            </div>
        </div>
      </div>
    </div>
  );
}

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-6", className)} {...props} />
);
