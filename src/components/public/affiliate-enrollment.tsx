
'use client';
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { AFFILIATE_PLANS, PAYMENT_METHODS } from '@/lib/payment-options';
import type { AffiliateLead } from '@/lib/types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { submitAffiliateLead } from '@/lib/actions';
import Image from 'next/image';
import { Label } from '@/components/ui/label';

const formSchema = z.object({
    fullName: z.string().min(3, "El nombre completo es requerido."),
    documentId: z.string().min(5, "El documento de identidad es requerido."),
    birthDate: z.date({ required_error: "La fecha de nacimiento es requerida."}),
    phone: z.string().min(7, "El teléfono es requerido."),
    email: z.string().email("El correo electrónico no es válido."),
    address: z.string().min(10, "La dirección es requerida."),
    planId: z.enum(['tarjeta-saludable', 'fondo-espiritu-santo'], { required_error: "Debe seleccionar un plan." }),
    paymentMode: z.enum(['contado', 'credito'], { required_error: "Debe seleccionar una modalidad de pago." }),
    installmentOption: z.string().optional(),
    paymentMethod: z.string({ required_error: "Debe seleccionar un método de pago." }),
    paymentProof: z.instanceof(File).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function AffiliateEnrollment() {
  const searchParams = useSearchParams();
  const initialPlan = searchParams.get('plan') as FormValues['planId'] | null;
  
  return (
    <Card className="w-full max-w-4xl bg-card/60 backdrop-blur-sm shadow-2xl shadow-primary/10">
      <CardHeader>
          <CardTitle className='text-center text-3xl font-bold font-headline'>Formulario de Afiliación</CardTitle>
      </CardHeader>
      <CardContent>
        <AffiliateEnrollmentContent initialPlan={initialPlan} />
      </CardContent>
    </Card>
  );
}


function AffiliateEnrollmentContent({ initialPlan }: { initialPlan: FormValues['planId'] | null }) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionComplete, setSubmissionComplete] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      planId: initialPlan || undefined,
      paymentMode: 'contado',
    },
  });

  const selectedPlanId = form.watch('planId');
  const selectedPaymentMode = form.watch('paymentMode');
  const selectedInstallmentOption = form.watch('installmentOption');
  const selectedPaymentMethod = form.watch('paymentMethod');
  
  const selectedPlan = useMemo(() => {
    return AFFILIATE_PLANS.find(p => p.id === selectedPlanId);
  }, [selectedPlanId]);

  useEffect(() => {
      // Reset payment mode when plan changes
      form.reset({
          ...form.getValues(),
          paymentMode: 'contado',
          installmentOption: undefined,
      });
  }, [selectedPlanId, form]);

  const nextStep = async () => {
    let fieldsToValidate: (keyof FormValues)[] = [];
    if (step === 1) {
        fieldsToValidate = ['fullName', 'documentId', 'birthDate', 'phone', 'email', 'address'];
    }
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
        setStep(s => s + 1);
    }
  };

  const prevStep = () => {
    setStep(s => s - 1);
  };
  
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    const affiliateData: AffiliateLead = {
        ...data,
        birthDate: format(data.birthDate, 'yyyy-MM-dd'),
    };

    try {
        await submitAffiliateLead(affiliateData);
        setSubmissionComplete(true);
    } catch (error) {
        console.error("Submission failed", error);
        // Here you would show a toast or error message to the user
    } finally {
        setIsSubmitting(false);
    }
  };

  const renderOrderSummary = () => {
    if (!selectedPlan) return null;

    let total = 0;
    let summaryText = '';

    if (selectedPaymentMode === 'contado') {
        total = selectedPlan.paymentModes.contado.price;
        summaryText = 'Pago único';
    } else if (selectedPaymentMode === 'credito' && selectedInstallmentOption) {
        const option = selectedPlan.paymentModes.credito?.installmentOptions.find(o => String(o.count) === selectedInstallmentOption);
        if(option) {
            total = option.amount * option.count;
            summaryText = `${option.count} cuotas de $${option.amount.toFixed(2)}`;
        }
    }

    return (
        <div className="mt-6 p-4 rounded-lg bg-muted/50 border space-y-2">
            <h3 className="font-semibold text-lg">Resumen de Orden</h3>
            <div className="flex justify-between"><span>Plan:</span><span className='font-medium'>{selectedPlan.name}</span></div>
            <div className="flex justify-between"><span>Modalidad:</span><span className='font-medium'>{selectedPaymentMode === 'contado' ? 'Contado' : 'Crédito'}</span></div>
            {summaryText && <div className="flex justify-between"><span>Detalle:</span><span className='font-medium'>{summaryText}</span></div>}
             <div className="flex justify-between"><span>Cuota de Afiliación:</span><span className='font-medium'>${selectedPlan.affiliationFee.toFixed(2)}</span></div>
            <div className="border-t my-2"></div>
            {selectedPaymentMode === 'credito' ? (
                    <>
                        <div className="flex justify-between text-sm"><span>Total a pagar:</span><span>${total.toFixed(2)}</span></div>
                        <div className="flex justify-between font-bold text-lg"><span>A Pagar Hoy:</span><span>${(selectedPlan.paymentModes.credito?.installmentOptions.find(o => String(o.count) === selectedInstallmentOption)?.amount || 0).toFixed(2)}</span></div>
                    </>
                ) : (
                    <div className="flex justify-between font-bold"><span>Total</span><span>${selectedPlan.paymentModes.contado.price.toFixed(2)}</span></div>
                )}
            </div>
    );
  }

  if (submissionComplete) {
      return (
          <div className="text-center py-10">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
              <h2 className="text-2xl font-bold mb-2">¡Solicitud Enviada!</h2>
              <p className="text-muted-foreground">Gracias por tu interés. Hemos recibido tu solicitud de afiliación y nuestro equipo se pondrá en contacto contigo a la brevedad para confirmar los próximos pasos.</p>
          </div>
      )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Progress value={(step / 3) * 100} className="w-full" />

        <AnimatePresence mode="wait">
            <motion.div
                key={step}
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -30, opacity: 0 }}
                transition={{ duration: 0.3 }}
            >
                {step === 1 && (
                    <div className='space-y-4'>
                        <CardDescription className='text-center'>Ingresa tus datos personales para iniciar el proceso.</CardDescription>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="fullName" render={({ field }) => (
                                <FormItem><FormLabel>Nombre Completo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="documentId" render={({ field }) => (
                                <FormItem><FormLabel>Cédula o Pasaporte</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="birthDate" render={({ field }) => (
                                <FormItem><FormLabel>Fecha de Nacimiento</FormLabel>
                                <Popover><PopoverTrigger asChild>
                                <FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                    {field.value ? format(field.value, "PPP") : <span>Elige una fecha</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button></FormControl>
                                </PopoverTrigger><PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus />
                                </PopoverContent></Popover><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="phone" render={({ field }) => (
                                <FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                        </div>
                        <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem><FormLabel>Correo Electrónico</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="address" render={({ field }) => (
                                <FormItem><FormLabel>Dirección</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                    </div>
                )}
                {step === 2 && (
                    <div className='space-y-6'>
                        <FormField control={form.control} name="planId" render={({ field }) => (
                           <FormItem><FormLabel>Selecciona tu Plan</FormLabel>
                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 gap-4">
                                {AFFILIATE_PLANS.map(plan => (
                                    <FormItem key={plan.id}>
                                        <FormControl><RadioGroupItem value={plan.id} id={plan.id} className="sr-only" /></FormControl>
                                        <Label htmlFor={plan.id} className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                            <span className="font-semibold">{plan.name}</span>
                                            <span className="text-xs text-muted-foreground">{plan.subtitle}</span>
                                        </Label>
                                    </FormItem>
                                ))}
                            </RadioGroup><FormMessage /></FormItem>
                        )}/>

                       {selectedPlan && (
                           <>
                               <FormField control={form.control} name="paymentMode" render={({ field }) => (
                                   <FormItem><FormLabel>Modalidad de Pago</FormLabel>
                                   <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 gap-4">
                                       <FormItem>
                                            <FormControl>
                                                <RadioGroupItem value="contado" id="contado" className="sr-only" />
                                            </FormControl>
                                            <Label htmlFor="contado" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                                Contado
                                                <span className="font-bold">${selectedPlan.paymentModes.contado.price.toFixed(2)}</span>
                                            </Label>
                                       </FormItem>
                                       {selectedPlan.paymentModes.credito && (
                                            <FormItem>
                                                <FormControl><RadioGroupItem value="credito" id="credito" className="sr-only" /></FormControl>
                                                <Label htmlFor="credito" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                                    Crédito
                                                    <span className="text-xs">Paga en cuotas</span>
                                                </Label>
                                            </FormItem>
                                       )}
                                   </RadioGroup><FormMessage /></FormItem>
                               )}/>
                               {selectedPaymentMode === 'credito' && selectedPlan.paymentModes.credito && (
                                   <FormField control={form.control} name="installmentOption" render={({ field }) => (
                                       <FormItem><FormLabel>Opciones de Cuotas</FormLabel>
                                       <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid sm:grid-cols-2 gap-4">
                                           {selectedPlan.paymentModes.credito.installmentOptions.map(opt => (
                                                <FormItem key={opt.count}>
                                                    <FormControl><RadioGroupItem value={String(opt.count)} id={`opt-${opt.count}`} className="sr-only" /></FormControl>
                                                    <Label htmlFor={`opt-${opt.count}`} className="flex justify-between items-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                                        <span>{opt.count} {opt.type}</span>
                                                        <span className='font-semibold'>${opt.amount.toFixed(2)} c/u</span>
                                                    </Label>
                                                </FormItem>
                                           ))}
                                       </RadioGroup><FormMessage /></FormItem>
                                   )}/>
                               )}
                           </>
                       )}
                       {renderOrderSummary()}
                    </div>
                )}
                 {step === 3 && (
                    <div className="space-y-6">
                        <CardDescription className='text-center'>Selecciona un método y adjunta el comprobante.</CardDescription>
                         <FormField
                            control={form.control}
                            name="paymentMethod"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Método de Pago</FormLabel>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {PAYMENT_METHODS.map((method) => (
                                         <FormItem key={method.id} className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value={method.id} id={method.id} className='sr-only'/>
                                            </FormControl>
                                            <Label htmlFor={method.id} className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer w-full aspect-square">
                                                <Image src={method.logoSrc} alt={method.label} width={40} height={40} className="mb-2"/>
                                                <span className='text-sm font-medium text-center'>{method.label}</span>
                                            </Label>
                                        </FormItem>
                                    ))}
                                </RadioGroup>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                         {step === 2 && selectedPaymentMethod && (
                            <div className="p-4 rounded-lg bg-primary/10 text-primary">
                                <p className="font-semibold">{PAYMENT_METHODS.find(m => m.id === selectedPaymentMethod)?.label}</p>
                                <p>{PAYMENT_METHODS.find(m => m.id === selectedPaymentMethod)?.accountInfo}</p>
                            </div>
                        )}
                        {renderOrderSummary()}
                    </div>
                )}
            </motion.div>
        </AnimatePresence>

        <div className="flex justify-between">
          {step > 1 && <Button type="button" variant="outline" onClick={prevStep}>Anterior</Button>}
          <div />
          {step < 3 && <Button type="button" onClick={nextStep}>Siguiente</Button>}
          {step === 3 && <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Enviar Solicitud</Button>}
        </div>
      </form>
    </Form>
  )
}

    