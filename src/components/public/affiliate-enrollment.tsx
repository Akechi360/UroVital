
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
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
import {
    RadioGroup,
    RadioGroupItem
} from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, CheckCircle, ChevronRight, Loader2, PartyPopper } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { AFFILIATE_PLANS, PAYMENT_METHODS } from '@/lib/payment-options';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import type { AffiliateLead } from '@/lib/types';
import { submitAffiliateLead } from '@/lib/actions';
import { Label } from '@/components/ui/label';

const formSchema = z.object({
  fullName: z.string().min(3, 'El nombre completo es requerido.'),
  documentId: z.string().min(6, 'El documento de identidad es requerido.'),
  birthDate: z.date({ required_error: 'La fecha de nacimiento es requerida.' }),
  phone: z.string().min(7, 'El número de teléfono es requerido.'),
  email: z.string().email('El correo electrónico no es válido.'),
  address: z.string().min(10, 'La dirección es requerida.'),
  planId: z.string({ required_error: 'Debes seleccionar un plan.' }),
  paymentMode: z.string({ required_error: 'Debes seleccionar una modalidad de pago.' }),
  paymentMethod: z.string().optional(),
  installmentOption: z.string().optional(),
});


function AffiliateEnrollmentContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      documentId: '',
      birthDate: undefined,
      phone: '',
      email: '',
      address: '',
      planId: searchParams.get('plan') || AFFILIATE_PLANS[0].id,
      paymentMode: 'contado',
      paymentMethod: '',
      installmentOption: '',
    },
  });

  const { watch, trigger, getValues } = form;

  const planId = watch('planId');
  const paymentMode = watch('paymentMode');
  const installmentOption = watch('installmentOption');
  const selectedPlan = AFFILIATE_PLANS.find(p => p.id === planId);
  const selectedPaymentMethodId = watch('paymentMethod');
  const selectedPaymentMethod = PAYMENT_METHODS.find(pm => pm.id === selectedPaymentMethodId);

  useEffect(() => {
    const planFromUrl = searchParams.get('plan');
    if (planFromUrl) {
      form.setValue('planId', planFromUrl);
    }
  }, [searchParams, form]);
  
  useEffect(() => {
    // Reset payment mode when plan changes
    form.setValue('paymentMode', 'contado');
    form.setValue('installmentOption', '');
  }, [planId, form]);

  if (!selectedPlan) {
    return <div>Cargando plan...</div>;
  }

  const handleNextStep = async () => {
    let fieldsToValidate: (keyof z.infer<typeof formSchema>)[] = [];
    if (step === 1) {
        fieldsToValidate = ['fullName', 'documentId', 'birthDate', 'phone', 'email', 'address'];
    } else if (step === 2) {
        fieldsToValidate = ['planId', 'paymentMode'];
        if (paymentMode === 'credito') {
            fieldsToValidate.push('installmentOption');
        }
        fieldsToValidate.push('paymentMethod');
    }
    
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep(prev => prev + 1);
    }
  };

  const handleBackStep = () => {
    setStep(prev => prev - 1);
  };
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
        const leadData: AffiliateLead = {
            fullName: values.fullName,
            documentId: values.documentId,
            birthDate: format(values.birthDate, 'yyyy-MM-dd'),
            phone: values.phone,
            email: values.email,
            address: values.address,
            planId: values.planId as 'tarjeta-saludable' | 'fondo-espiritu-santo',
            paymentMode: values.paymentMode as 'contado' | 'credito',
            paymentMethod: values.paymentMethod!,
        };

        if (values.paymentMode === 'credito' && values.installmentOption) {
            const selectedInstallment = selectedPlan.paymentModes.credito?.installmentOptions[parseInt(values.installmentOption, 10)];
            if(selectedInstallment) {
                leadData.schedule = {
                    upfront: selectedPlan.affiliationFee || 0,
                    installments: selectedInstallment.count,
                    installmentValue: selectedInstallment.amount,
                    frequencyDays: selectedInstallment.type === 'mensual' ? 30 : 90 / selectedInstallment.count,
                };
            }
        }
        
        await submitAffiliateLead(leadData);
        handleNextStep();

    } catch (error) {
        console.error("Submission error:", error);
        toast({
            variant: "destructive",
            title: "Error al enviar",
            description: "Hubo un problema al procesar tu solicitud. Por favor, intenta de nuevo.",
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  const renderOrderSummary = () => {
    const selectedInstallment = paymentMode === 'credito' && installmentOption !== '' 
        ? selectedPlan.paymentModes.credito?.installmentOptions[parseInt(installmentOption, 10)] 
        : null;

    return (
        <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Plan</span><span className="font-medium">{selectedPlan.name}</span></div>
            {selectedPlan.affiliationFee > 0 && <div className="flex justify-between"><span>Cuota de Afiliación</span><span className="font-medium">${selectedPlan.affiliationFee.toFixed(2)}</span></div>}
            <div className="flex justify-between"><span>Modalidad</span><span className="font-medium capitalize">{paymentMode}</span></div>
            <hr className="my-2" />
            {paymentMode === 'credito' && selectedInstallment ? (
                <>
                    <div className="flex justify-between"><span>Cuotas</span><span className="font-medium">{selectedInstallment.count} de ${selectedInstallment.amount.toFixed(2)}</span></div>
                    <div className="flex justify-between font-bold"><span>Total a Pagar Hoy</span><span>${selectedPlan.affiliationFee.toFixed(2)}</span></div>
                </>
            ) : (
                <div className="flex justify-between font-bold"><span>Total</span><span>${(selectedPlan.paymentModes.contado?.price ?? 0).toFixed(2)}</span></div>
            )}
        </div>
    );
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
            <div className="space-y-4">
                 <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Nombre y Apellido</FormLabel>
                        <FormControl>
                            <Input placeholder="Ej: Juan Pérez" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <FormField
                    control={form.control}
                    name="documentId"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Cédula de Identidad</FormLabel>
                        <FormControl>
                            <Input placeholder="Ej: V-12345678" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                 <FormField
                    control={form.control}
                    name="birthDate"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Fecha de Nacimiento</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                )}
                                >
                                {field.value ? format(field.value, "PPP") : <span>Elige una fecha</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                captionLayout="dropdown-buttons"
                                fromYear={1930}
                                toYear={new Date().getFullYear() - 18}
                                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                            <Input placeholder="Ej: 0414-1234567" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Correo Electrónico</FormLabel>
                        <FormControl>
                            <Input type="email" placeholder="email@ejemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Dirección</FormLabel>
                        <FormControl>
                            <Input placeholder="Tu dirección completa" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
            </div>
        );
      case 2:
        return (
            <div className="space-y-6">
                <FormField
                    control={form.control}
                    name="planId"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                        <FormLabel>Elige tu Plan de Afiliación</FormLabel>
                        <FormControl>
                            <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            >
                            {AFFILIATE_PLANS.map((plan) => (
                                <FormItem key={plan.id}>
                                    <FormControl>
                                        <RadioGroupItem value={plan.id} id={plan.id} className="sr-only" />
                                    </FormControl>
                                    <Label htmlFor={plan.id} className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                        <span className="font-bold text-lg text-primary">{plan.name}</span>
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
                 <FormField
                    control={form.control}
                    name="paymentMode"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                        <FormLabel>Selecciona la Modalidad de Pago</FormLabel>
                        <FormControl>
                            <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="grid grid-cols-2 gap-4"
                            >
                                <FormItem>
                                    <FormControl>
                                        <RadioGroupItem value="contado" id="contado" className="sr-only" />
                                    </FormControl>
                                    <Label htmlFor="contado" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                    Contado
                                    <span className="font-bold">${(selectedPlan.paymentModes.contado?.price ?? 0).toFixed(2)}</span>
                                    </Label>
                                </FormItem>

                                {selectedPlan.paymentModes.credito && (
                                <FormItem>
                                     <FormControl>
                                        <RadioGroupItem value="credito" id="credito" className="sr-only" />
                                     </FormControl>
                                     <Label htmlFor="credito" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                        Crédito
                                        <span className="text-xs text-muted-foreground">Paga en cuotas</span>
                                     </Label>
                                </FormItem>
                                )}
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                
                {paymentMode === 'credito' && selectedPlan.paymentModes.credito && (
                    <FormField
                        control={form.control}
                        name="installmentOption"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                            <FormLabel>Opciones de Cuotas</FormLabel>
                            <FormControl>
                                 <RadioGroup
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                >
                                    {selectedPlan.paymentModes.credito!.installmentOptions.map((opt, index) => (
                                        <FormItem key={index}>
                                            <FormControl>
                                                <RadioGroupItem value={index.toString()} id={`install-${index}`} className="sr-only" />
                                            </FormControl>
                                            <Label htmlFor={`install-${index}`} className="flex items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                                <span>{opt.count} {opt.type === 'mensual' ? 'meses' : 'cuotas'} de</span>
                                                <span className="font-bold">${opt.amount.toFixed(2)}</span>
                                            </Label>
                                        </FormItem>
                                    ))}
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                )}

                <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                        <FormLabel>Selecciona el Método de Pago</FormLabel>
                        <FormControl>
                            <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="grid grid-cols-2 md:grid-cols-4 gap-4"
                            >
                            {PAYMENT_METHODS.map((method) => (
                                <FormItem key={method.id}>
                                    <FormControl>
                                        <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                                    </FormControl>
                                    <Label htmlFor={method.id} className="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer aspect-square">
                                        <Image src={method.logoSrc} alt={method.label} width={40} height={40} />
                                        <span className="text-xs text-center font-medium">{method.label}</span>
                                    </Label>
                                </FormItem>
                            ))}
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        );
      case 3:
        return (
            <div className="space-y-6">
                <h3 className="text-xl font-semibold">Resumen de la Orden</h3>
                <div className="p-6 bg-muted/50 rounded-lg border">
                    {renderOrderSummary()}
                </div>
                
                {selectedPaymentMethod && (
                     <div>
                        <h3 className="text-xl font-semibold">Instrucciones de Pago</h3>
                        <div className="mt-4 p-4 border rounded-lg flex items-center gap-4 bg-muted/50">
                             <Image src={selectedPaymentMethod.logoSrc} alt={selectedPaymentMethod.label} width={48} height={48} />
                             <div>
                                <p className="font-semibold">{selectedPaymentMethod.label}</p>
                                <p className="text-sm text-muted-foreground">{selectedPaymentMethod.accountInfo}</p>
                             </div>
                        </div>
                        <FormDescription className="mt-2 text-xs">
                             Realiza el pago y luego presiona "Finalizar Afiliación". Uno de nuestros agentes confirmará tu pago y activará tu cuenta.
                        </FormDescription>
                    </div>
                )}
            </div>
        );
        case 4:
            return (
                <div className="text-center py-8 flex flex-col items-center gap-4">
                    <PartyPopper className="h-16 w-16 text-green-500" />
                    <h2 className="text-2xl font-bold">¡Solicitud Enviada!</h2>
                    <p className="text-muted-foreground max-w-md">
                        Hemos recibido tu solicitud de afiliación. Un agente de UroVital te contactará pronto para confirmar tu pago y activar tu cuenta.
                    </p>
                    <Button onClick={() => window.location.reload()}>
                        Completar
                    </Button>
                </div>
            )
      default:
        return null;
    }
  };

  if (step === 4) {
      return renderStepContent();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <h2 className="text-2xl font-bold tracking-tight text-center mb-1">Formulario de Afiliación</h2>
        <div className="flex items-center justify-center my-4">
            {[1, 2, 3].map((s, i) => (
            <React.Fragment key={s}>
                <div className="flex flex-col items-center">
                    <div
                        className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center font-bold transition-all",
                        step > s ? "bg-green-500 text-white" : "bg-primary text-primary-foreground",
                        step === s && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                        )}
                    >
                        {step > s ? <CheckCircle size={20} /> : s}
                    </div>
                </div>
                {i < 2 && (
                    <div
                        className={cn(
                        "flex-1 h-1 transition-all",
                        step > s ? "bg-green-500" : "bg-muted"
                        )}
                    />
                )}
            </React.Fragment>
            ))}
        </div>
        <div className="mt-8 min-h-[300px]">
            {renderStepContent()}
        </div>
        <div className="mt-8 flex justify-end gap-4">
            {step > 1 && (
                <Button type="button" variant="outline" onClick={handleBackStep}>
                    Atrás
                </Button>
            )}
            {step < 3 && (
                <Button type="button" onClick={handleNextStep}>
                    Siguiente
                    <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
            )}
            {step === 3 && (
                 <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSubmitting ? 'Procesando...' : 'Finalizar Afiliación'}
                </Button>
            )}
        </div>
      </form>
    </Form>
  );
}


export function AffiliateEnrollment() {
    return(
    <div className="w-full max-w-4xl mx-auto overflow-hidden rounded-2xl border border-border/20 bg-card/50 shadow-2xl shadow-primary/10 backdrop-blur-lg">
      <div className="p-6 sm:p-8">
        <Suspense fallback={<div>Cargando...</div>}>
            <AffiliateEnrollmentContent />
        </Suspense>
      </div>
    </div>
    )
}
