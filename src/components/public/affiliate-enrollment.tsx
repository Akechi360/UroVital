
'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Stethoscope, User, CreditCard, CheckCircle, CalendarIcon, ArrowRight, ArrowLeft } from 'lucide-react';
import { AFFILIATE_PLANS, PAYMENT_METHODS } from '@/lib/payment-options';
import type { AffiliateLead } from '@/lib/types';
import Image from 'next/image';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { submitAffiliateLead } from '@/lib/actions';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Label } from '@/components/ui/label';

const MySwal = withReactContent(Swal);

const formSchemaStep1 = z.object({
  fullName: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
  documentId: z.string().min(6, "El documento de identidad es requerido."),
  birthDate: z.date({ required_error: "La fecha de nacimiento es requerida."}),
  phone: z.string().min(7, "El teléfono debe tener al menos 7 dígitos."),
  email: z.string().email("El correo electrónico no es válido."),
  address: z.string().min(10, "La dirección debe tener al menos 10 caracteres."),
});

type Step1Values = z.infer<typeof formSchemaStep1>;

function AffiliateEnrollmentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);

  const initialPlanId = searchParams.get('plan') as AffiliateLead['planId'] | null;
  const [selectedPlanId, setSelectedPlanId] = useState<AffiliateLead['planId']>(initialPlanId || 'tarjeta-saludable');
  
  const [paymentMode, setPaymentMode] = useState<'contado' | 'credito'>('contado');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);

  const form = useForm<Step1Values>({
    resolver: zodResolver(formSchemaStep1),
    defaultValues: {
      fullName: '',
      documentId: '',
      birthDate: undefined,
      phone: '',
      email: '',
      address: '',
    }
  });

  const selectedPlan = useMemo(() => {
    return AFFILIATE_PLANS.find(p => p.id === selectedPlanId) || AFFILIATE_PLANS[0];
  }, [selectedPlanId]);

  const creditDetails = useMemo(() => {
    if (paymentMode === 'credito' && selectedPlan.credit) {
      const upfront = selectedPlan.price * selectedPlan.credit.upfrontPercent;
      const remaining = selectedPlan.price - upfront;
      const installmentValue = remaining / selectedPlan.credit.installments;
      return {
        ...selectedPlan.credit,
        upfront: upfront,
        installmentValue: installmentValue,
      };
    }
    return null;
  }, [paymentMode, selectedPlan]);

  const handleStep1Submit = (data: Step1Values) => {
    setStep(2);
  };

  const handleFinalSubmit = async () => {
    if (!selectedPaymentMethod) {
      // Should not happen as button is disabled, but as a safeguard
      return;
    }

    const leadData: AffiliateLead = {
      ...form.getValues(),
      birthDate: format(form.getValues('birthDate'), 'yyyy-MM-dd'),
      planId: selectedPlanId,
      paymentMode,
      paymentMethod: selectedPaymentMethod,
      schedule: creditDetails ? {
        upfront: creditDetails.upfront,
        installments: creditDetails.installments,
        installmentValue: creditDetails.installmentValue,
        frequencyDays: creditDetails.frequencyDays,
      } : undefined,
    };
    
    try {
      await submitAffiliateLead(leadData);
      const isDarkMode = document.documentElement.classList.contains('dark');
      MySwal.fire({
        title: '¡Gracias por afiliarte!',
        text: 'Hemos enviado toda la información a tu correo electrónico.',
        icon: 'success',
        background: isDarkMode ? '#1e293b' : '#ffffff',
        color: isDarkMode ? '#f1f5f9' : '#0f172a',
        confirmButtonColor: '#4f46e5',
      }).then(() => {
        router.push('/landing');
      });
    } catch (error) {
       const isDarkMode = document.documentElement.classList.contains('dark');
      MySwal.fire({
        title: 'Error',
        text: 'Hubo un problema al procesar tu afiliación. Por favor, intenta de nuevo.',
        icon: 'error',
        background: isDarkMode ? '#1e293b' : '#ffffff',
        color: isDarkMode ? '#f1f5f9' : '#0f172a',
        confirmButtonColor: '#ef4444',
      });
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <CardHeader>
              <CardTitle>Paso 1: Datos del Afiliado</CardTitle>
              <CardDescription>Completa tu información personal para continuar.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleStep1Submit)} className="space-y-4">
                  <div className="mb-6">
                    <FormLabel className="text-base font-semibold">Selecciona tu Plan</FormLabel>
                    <RadioGroup value={selectedPlanId} onValueChange={(val) => setSelectedPlanId(val as AffiliateLead['planId'])} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
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
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="fullName" render={({ field }) => (
                          <FormItem><FormLabel>Nombre Completo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )}/>
                      <FormField control={form.control} name="documentId" render={({ field }) => (
                          <FormItem><FormLabel>Cédula / Pasaporte</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )}/>
                      <FormField control={form.control} name="birthDate" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha de Nacimiento</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button variant={"outline"} className={cn("w-full text-left font-normal", !field.value && "text-muted-foreground")}>
                                  {field.value ? format(field.value, "PPP") : <span>Elige una fecha</span>}
                                  <CalendarIcon className="ml-auto h-4 w-4" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} captionLayout="dropdown-buttons" fromYear={1930} toYear={new Date().getFullYear()} initialFocus /></PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}/>
                      <FormField control={form.control} name="phone" render={({ field }) => (
                          <FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>
                      )}/>
                  </div>
                   <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem><FormLabel>Correo Electrónico</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                  <FormField control={form.control} name="address" render={({ field }) => (
                      <FormItem><FormLabel>Dirección</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <div className="flex justify-end pt-4">
                    <Button type="submit">Continuar con el Pago <ArrowRight className="ml-2"/></Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </>
        );
      case 2:
        return (
          <>
            <CardHeader>
              <CardTitle>Paso 2: Método de Pago</CardTitle>
              <CardDescription>Elige tu modalidad y método de pago preferido.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    <div>
                        <Label className="text-base font-semibold">Modalidad de Pago</Label>
                        <RadioGroup value={paymentMode} onValueChange={(val) => setPaymentMode(val as 'contado' | 'credito')} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                            <Label htmlFor="contado" className={cn("block cursor-pointer rounded-lg border p-4 transition-all", paymentMode === 'contado' ? "border-primary ring-2 ring-primary" : "border-border")}>
                                <div className="flex items-center"><RadioGroupItem value="contado" id="contado" className="mr-4" /><span>Pago de Contado (${selectedPlan.price})</span></div>
                            </Label>
                            {selectedPlan.credit && (
                                <Label htmlFor="credito" className={cn("block cursor-pointer rounded-lg border p-4 transition-all", paymentMode === 'credito' ? "border-primary ring-2 ring-primary" : "border-border")}>
                                     <div className="flex items-center"><RadioGroupItem value="credito" id="credito" className="mr-4" /><span>Pago a Crédito</span></div>
                                </Label>
                            )}
                        </RadioGroup>
                    </div>

                    {paymentMode === 'credito' && creditDetails && (
                        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-sm">
                            <h4 className="font-semibold mb-2">Resumen del Crédito</h4>
                            <p>Inicial ({creditDetails.upfrontPercent * 100}%): <span className="font-bold">${creditDetails.upfront.toFixed(2)}</span></p>
                            <p>{creditDetails.installments} cuotas de <span className="font-bold">${creditDetails.installmentValue.toFixed(2)}</span> cada {creditDetails.frequencyDays} días.</p>
                        </div>
                    )}
                    
                     <div>
                        <Label className="text-base font-semibold">Elige un Método</Label>
                        <RadioGroup value={selectedPaymentMethod || ''} onValueChange={setSelectedPaymentMethod} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                           {PAYMENT_METHODS.map(method => (
                                <Label key={method.id} htmlFor={method.id} className={cn("block cursor-pointer rounded-lg border p-4 transition-all", selectedPaymentMethod === method.id ? "border-primary ring-2 ring-primary" : "border-border")}>
                                    <div className="flex items-center mb-2">
                                        <RadioGroupItem value={method.id} id={method.id} className="mr-4" />
                                        <Image src={method.logoSrc} alt={method.label} width={24} height={24} className="mr-2" />
                                        <span className="font-semibold">{method.label}</span>
                                    </div>
                                    <div className="pl-8 text-xs text-muted-foreground">
                                        <p>{method.description}</p>
                                        <p className="font-mono mt-1">{method.accountInfo}</p>
                                    </div>
                                </Label>
                           ))}
                        </RadioGroup>
                    </div>
                </div>
            </CardContent>
             <CardContent className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="mr-2"/> Volver</Button>
                <Button onClick={handleFinalSubmit} disabled={!selectedPaymentMethod}>Confirmar Afiliación <CheckCircle className="ml-2"/></Button>
            </CardContent>
          </>
        );
      default:
        return null;
    }
  };

  const renderOrderSummary = () => (
    <Card className="sticky top-24">
        <CardHeader>
            <CardTitle>Resumen de tu Pedido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div>
                <p className="text-sm font-semibold">{selectedPlan.name}</p>
                <p className="text-sm text-muted-foreground">{selectedPlan.subtitle}</p>
            </div>
            <div className="border-t pt-4">
                {paymentMode === 'credito' && creditDetails ? (
                    <>
                        <div className="flex justify-between text-sm"><span>Inicial ({creditDetails.upfrontPercent * 100}%)</span><span>${creditDetails.upfront.toFixed(2)}</span></div>
                        <div className="flex justify-between text-sm text-muted-foreground"><span>{creditDetails.installments} cuotas</span><span>${creditDetails.installmentValue.toFixed(2)} c/u</span></div>
                        <div className="flex justify-between font-bold mt-2"><span>Total</span><span>${selectedPlan.price.toFixed(2)}</span></div>
                    </>
                ) : (
                    <div className="flex justify-between font-bold"><span>Total</span><span>${selectedPlan.price.toFixed(2)}</span></div>
                )}
            </div>
             {step === 2 && selectedPaymentMethod && (
                <div className="border-t pt-4">
                    <p className="text-sm font-semibold">Método de Pago</p>
                    <div className="flex items-center gap-2 mt-1">
                        <Image src={PAYMENT_METHODS.find(p => p.id === selectedPaymentMethod)?.logoSrc || ''} alt="" width={20} height={20} />
                        <span className="text-sm text-muted-foreground">{PAYMENT_METHODS.find(p => p.id === selectedPaymentMethod)?.label}</span>
                    </div>
                </div>
            )}
        </CardContent>
    </Card>
  )

  return (
    <div className="w-full max-w-7xl mx-auto">
       <div className="mb-8 text-center">
            <div className="mx-auto mb-4 inline-block rounded-full bg-primary/10 p-3">
                <Stethoscope className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground font-headline">Formulario de Afiliación</h1>
            <p className="text-muted-foreground">Únete a UroVital en pocos pasos.</p>
        </div>

      <div className="mb-8 px-4">
        <div className="flex justify-between items-center max-w-lg mx-auto">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center">
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full border-2",
                step >= s ? "bg-primary border-primary text-primary-foreground" : "border-border"
              )}>
                {step > s ? <CheckCircle size={16} /> : s}
              </div>
              <p className={cn("ml-2 font-semibold", step >= s ? "text-primary" : "text-muted-foreground")}>
                {s === 1 ? "Datos" : "Pago"}
              </p>
               {s < 2 && <div className={cn("w-16 mx-2 h-0.5", step > s ? 'bg-primary' : 'bg-border')} />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 shadow-lg">
            {renderStep()}
        </Card>
        <div className="hidden lg:block">
            {renderOrderSummary()}
        </div>
      </div>
    </div>
  );
}

export function AffiliateEnrollment() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <AffiliateEnrollmentContent />
        </Suspense>
    )
}

    