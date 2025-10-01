
'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Check, CheckCircle, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AnimatePresence, motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { AFFILIATE_PLANS, PAYMENT_METHODS } from '@/lib/payment-options';
import Image from 'next/image';
import { submitAffiliateLead, type AffiliateLead } from '@/lib/actions';


const formSchema = z.object({
  planId: z.enum(['tarjeta-saludable', 'fondo-espiritu-santo'], {
    required_error: 'Debes seleccionar un plan.',
  }),
  paymentMode: z.enum(['contado', 'credito'], {
    required_error: 'Debes seleccionar una modalidad de pago.',
  }),
  installmentOption: z.string().optional(),
  fullName: z.string().min(3, 'El nombre completo es requerido.'),
  documentId: z.string().min(6, 'El documento de identidad es requerido.'),
  birthDate: z.date({ required_error: 'La fecha de nacimiento es requerida.' }),
  phone: z.string().min(7, 'El teléfono es requerido.'),
  email: z.string().email('El correo electrónico no es válido.'),
  address: z.string().min(10, 'La dirección es requerida.'),
  paymentMethod: z.string({ required_error: 'Debes seleccionar un método de pago.' }),
  paymentConfirmation: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function StepIndicator({ currentStep, totalSteps }: { currentStep: number, totalSteps: number }) {
    return (
        <div className="flex items-center gap-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
                <div
                    key={index}
                    className={cn(
                        "h-2 w-full rounded-full transition-colors",
                        index + 1 <= currentStep ? 'bg-primary' : 'bg-muted'
                    )}
                />
            ))}
        </div>
    );
}


function AffiliateEnrollmentContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionComplete, setSubmissionComplete] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      planId: searchParams.get('plan') as FormValues['planId'] || undefined,
      fullName: '',
      documentId: '',
      phone: '',
      email: '',
      address: '',
      paymentMethod: '',
      installmentOption: '',
    },
  });

  const { watch, control, trigger, getValues } = form;

  const selectedPlanId = watch('planId');
  const selectedPaymentMode = watch('paymentMode');
  const selectedInstallmentOption = watch('installmentOption');
  const selectedPaymentMethod = watch('paymentMethod');

  const selectedPlan = AFFILIATE_PLANS.find(p => p.id === selectedPlanId);

  const handleNextStep = async () => {
    let fieldsToValidate: (keyof FormValues)[] = [];
    if (step === 1) {
      fieldsToValidate = ['planId', 'paymentMode', 'installmentOption'];
    } else if (step === 2) {
      fieldsToValidate = ['fullName', 'documentId', 'birthDate', 'phone', 'email', 'address'];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setStep(prev => prev - 1);
  };
  
  const onSubmit = async (data: FormValues) => {
    if (!selectedPlan) return;
    setIsSubmitting(true);
    
    let schedule;
    if (data.paymentMode === 'credito') {
        const option = selectedPlan.paymentModes.credito?.installmentOptions.find(o => o.type === data.installmentOption);
        if (option) {
            schedule = {
                upfront: 0,
                installments: option.count,
                installmentValue: option.amount,
                frequencyDays: option.type === 'mensual' ? 30 : 90, // Example logic
            };
        }
    }

    const leadData: AffiliateLead = {
        fullName: data.fullName,
        documentId: data.documentId,
        birthDate: format(data.birthDate, 'yyyy-MM-dd'),
        phone: data.phone,
        email: data.email,
        address: data.address,
        planId: data.planId,
        paymentMode: data.paymentMode,
        paymentMethod: data.paymentMethod,
        schedule,
    };
    
    try {
        await submitAffiliateLead(leadData);
        setSubmissionComplete(true);
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Error en el envío',
            description: 'No se pudo procesar tu solicitud. Por favor, inténtalo de nuevo.',
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  const renderOrderSummary = () => {
    if (!selectedPlan) return null;
    
    let summary;
    if (selectedPaymentMode === 'credito' && selectedInstallmentOption) {
        const option = selectedPlan.paymentModes.credito?.installmentOptions.find(o => o.type === selectedInstallmentOption);
        if (option) {
            summary = (
                 <div className="flex justify-between">
                    <span>{option.count} cuotas de</span>
                    <span className="font-bold">${option.amount.toFixed(2)}</span>
                </div>
            );
        }
    } else {
        summary = (
            <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${selectedPlan.paymentModes.contado.price.toFixed(2)}</span>
            </div>
        );
    }

    return (
        <div className="space-y-2 rounded-lg bg-muted/50 p-4">
            <h3 className="font-semibold">Resumen del Pedido</h3>
            <div className="flex justify-between text-sm">
                <span>Plan</span>
                <span className="font-medium">{selectedPlan.name}</span>
            </div>
             <div className="flex justify-between text-sm">
                <span>Cuota de Afiliación</span>
                <span className="font-medium">${selectedPlan.affiliationFee.toFixed(2)}</span>
            </div>
            {summary}
        </div>
    );
  }

  if (submissionComplete) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-8"
        >
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            <h2 className="mt-4 text-2xl font-bold">¡Solicitud Enviada!</h2>
            <p className="mt-2 text-muted-foreground">
                Gracias por tu interés. Hemos recibido tu solicitud de afiliación. Un asesor se pondrá en contacto contigo a la brevedad para finalizar el proceso.
            </p>
        </motion.div>
    );
  }


  return (
    <div className='w-full'>
    <h1 className="text-3xl font-bold text-center font-headline mb-2">Formulario de Afiliación</h1>
    <p className="text-muted-foreground text-center mb-6">Completa los siguientes pasos para unirte a UroVital.</p>
    <div className="mb-8 px-4">
        <StepIndicator currentStep={step} totalSteps={3} />
    </div>

    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <AnimatePresence mode="wait">
            <motion.div
                key={step}
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -30, opacity: 0 }}
                transition={{ duration: 0.3 }}
            >
                {step === 1 && (
                    <div className="space-y-6">
                        {/* Plan Selection */}
                        <FormField
                            control={form.control}
                            name="planId"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                <FormLabel className="text-lg font-semibold">1. Elige tu Plan de Afiliación</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                    >
                                        {AFFILIATE_PLANS.map(plan => (
                                        <FormItem key={plan.id}>
                                            <FormControl>
                                                <RadioGroupItem value={plan.id} id={plan.id} className="sr-only" />
                                            </FormControl>
                                            <Label 
                                                htmlFor={plan.id}
                                                className="flex flex-col rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                            >
                                                <span className="font-bold text-lg">{plan.name}</span>
                                                <span className="text-sm text-muted-foreground">{plan.subtitle}</span>
                                            </Label>
                                        </FormItem>
                                        ))}
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Payment Mode Selection */}
                        {selectedPlan && (
                        <FormField
                            control={form.control}
                            name="paymentMode"
                            render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel className="text-lg font-semibold">2. Elige tu Modalidad de Pago</FormLabel>
                                <FormControl>
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                >
                                    <FormItem>
                                        <FormControl>
                                            <RadioGroupItem value="contado" id="contado" className="sr-only" />
                                        </FormControl>
                                        <Label htmlFor="contado" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                            Contado
                                            <span className="font-bold">${selectedPlan.paymentModes.contado.price.toFixed(2)}</span>
                                        </Label>
                                    </FormItem>
                                    <FormItem>
                                        <FormControl>
                                            <RadioGroupItem value="credito" id="credito" className="sr-only" />
                                        </FormControl>
                                         <Label htmlFor="credito" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                            Crédito
                                            <span className="text-xs text-muted-foreground">Paga en cómodas cuotas</span>
                                        </Label>
                                    </FormItem>
                                </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        )}

                        {/* Installment Options */}
                        {selectedPaymentMode === 'credito' && selectedPlan?.paymentModes.credito && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="pl-4">
                                <FormField
                                    control={form.control}
                                    name="installmentOption"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Opciones de Cuotas</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecciona una opción de pago" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {selectedPlan.paymentModes.credito.installmentOptions.map((opt) => (
                                                        <SelectItem key={opt.type} value={opt.type}>
                                                            {opt.count} cuotas de ${opt.amount.toFixed(2)} ({opt.type})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </motion.div>
                        )}
                    </div>
                )}
                 {step === 2 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold mb-4">Información Personal</h2>
                        <FormField control={control} name="fullName" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre Completo</FormLabel>
                                <FormControl><Input placeholder="Ej: Juan Pérez" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={control} name="documentId" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cédula o Pasaporte</FormLabel>
                                    <FormControl><Input placeholder="Ej: V-12345678" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={control} name="birthDate" render={({ field }) => (
                                <FormItem className="flex flex-col pt-2">
                                     <FormLabel>Fecha de Nacimiento</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                            {field.value ? format(field.value, "PPP", { locale: es }) : <span>Elige una fecha</span>}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <FormField control={control} name="phone" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Teléfono</FormLabel>
                                    <FormControl><Input type="tel" placeholder="Ej: 0414-1234567" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                             <FormField control={control} name="email" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Correo Electrónico</FormLabel>
                                    <FormControl><Input type="email" placeholder="ejemplo@correo.com" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                        <FormField control={control} name="address" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Dirección</FormLabel>
                                <FormControl><Textarea placeholder="Indica tu dirección completa" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                 )}
                {step === 3 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold mb-4">Resumen y Pago</h2>
                        {renderOrderSummary()}

                        <FormField
                            control={form.control}
                            name="paymentMethod"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                <FormLabel className="text-lg font-semibold">3. Elige tu Método de Pago</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                                    >
                                        {PAYMENT_METHODS.map((method) => (
                                        <FormItem key={method.id}>
                                            <FormControl>
                                                <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                                            </FormControl>
                                            <Label
                                                htmlFor={method.id}
                                                className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer h-full"
                                            >
                                                {method.logoSrc && <Image src={method.logoSrc} alt={method.label} width={40} height={40} className="object-contain"/>}
                                                <span className="font-semibold text-center text-sm">{method.label}</span>
                                            </Label>
                                        </FormItem>
                                        ))}
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />

                         {selectedPaymentMethod && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 border rounded-lg bg-muted/50 space-y-2">
                                <h3 className="font-semibold">Instrucciones de Pago</h3>
                                <p className="text-sm text-muted-foreground">
                                    {PAYMENT_METHODS.find(m => m.id === selectedPaymentMethod)?.accountInfo}
                                </p>
                                <FormField control={control} name="paymentConfirmation" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Número de Confirmación</FormLabel>
                                    <FormControl><Input placeholder="Introduce el número de referencia del pago" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            </motion.div>
                        )}
                    </div>
                )}
            </motion.div>
        </AnimatePresence>

        <div className="flex justify-between items-center pt-4">
            <div>
                {step > 1 && (
                     <Button type="button" variant="ghost" onClick={handlePrevStep}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Anterior
                    </Button>
                )}
            </div>
            <div>
                {step < 3 && (
                    <Button type="button" onClick={handleNextStep}>
                        Siguiente
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                )}
                {step === 3 && (
                     <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando...</> : 'Finalizar y Enviar Solicitud'}
                    </Button>
                )}
            </div>
        </div>
      </form>
    </Form>
    </div>
  );
}

export function AffiliateEnrollment() {
  return (
    <div className="w-full max-w-4xl mx-auto overflow-hidden rounded-2xl border border-border/20 bg-card/50 shadow-2xl shadow-primary/10 backdrop-blur-lg">
      <div className="p-6 sm:p-8">
        <Suspense fallback={<div>Cargando...</div>}>
            <AffiliateEnrollmentContent />
        </Suspense>
      </div>
    </div>
  );
}
