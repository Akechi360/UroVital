'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';
import { AFFILIATE_PLANS, PAYMENT_METHODS } from '@/lib/payment-options';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Check, CreditCard, Landmark, User, Mail, Phone, Map, ShieldCheck, FileText, Wallet } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { submitAffiliateLead } from '@/lib/actions';
import type { AffiliateLead } from '@/lib/types';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { Textarea } from '../ui/textarea';


const formSchema = z.object({
  fullName: z.string().min(3, "El nombre completo debe tener al menos 3 caracteres."),
  documentId: z.string().min(6, "El documento de identidad es requerido."),
  birthDate: z.date({ required_error: "La fecha de nacimiento es requerida." }),
  phone: z.string().min(7, "El teléfono es requerido."),
  email: z.string().email("El correo electrónico no es válido."),
  address: z.string().min(10, "La dirección debe tener al menos 10 caracteres."),
  planId: z.string({ required_error: "Debe seleccionar un plan." }),
  paymentMode: z.enum(['contado', 'credito'], { required_error: "Debe seleccionar una modalidad de pago." }),
  installmentOption: z.string().optional(),
  paymentMethod: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function AffiliateEnrollmentContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [step, setStep] = useState(1);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      documentId: "",
      email: "",
      phone: "",
      address: "",
      planId: searchParams.get('plan') || AFFILIATE_PLANS[0].id,
      paymentMode: 'contado',
      installmentOption: '',
      paymentMethod: '',
    },
  });

  const { watch, trigger, formState: { errors } } = form;
  const selectedPlanId = watch('planId');
  const selectedPaymentMode = watch('paymentMode');
  const selectedInstallmentOption = watch('installmentOption');
  const selectedPaymentMethod = watch('paymentMethod');

  const selectedPlan = useMemo(() => AFFILIATE_PLANS.find(p => p.id === selectedPlanId), [selectedPlanId]);

  if (!selectedPlan) {
    return <div>Cargando plan...</div>;
  }
  
  const handleNextStep = async () => {
    let fieldsToValidate: (keyof FormValues)[] = [];
    if (step === 1) {
        fieldsToValidate = ['planId', 'paymentMode', 'installmentOption'];
    } else if (step === 2) {
        fieldsToValidate = ['fullName', 'documentId', 'birthDate', 'email', 'phone', 'address'];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep(s => s + 1);
    }
  };

  const handlePrevStep = () => {
    setStep(s => s - 1);
  };
  
  const onSubmit = async (data: FormValues) => {
    try {
        let leadData: AffiliateLead = {
            ...data,
            birthDate: data.birthDate.toISOString(),
            planId: data.planId as AffiliateLead['planId'],
            paymentMode: data.paymentMode as AffiliateLead['paymentMode'],
            paymentMethod: data.paymentMethod || '',
        };
        await submitAffiliateLead(leadData);
        setStep(4); // Go to success step
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error al enviar",
            description: "No se pudo procesar tu afiliación. Por favor, intenta de nuevo.",
        });
    }
  };
  
  const renderOrderSummary = () => {
    const plan = selectedPlan;
    if (!plan) return null;

    let total = 0;
    let summaryText = `Plan: ${plan.name}`;

    if (selectedPaymentMode === 'contado') {
        total = plan.paymentModes.contado.price;
        summaryText += " (Contado)";
    } else if (selectedPaymentMode === 'credito' && selectedInstallmentOption) {
        const option = plan.paymentModes.credito.installmentOptions[parseInt(selectedInstallmentOption)];
        if (option) {
            total = option.count * option.amount;
            summaryText += ` (${option.count} cuotas de $${option.amount.toFixed(2)})`;
        }
    }
     const fee = plan.affiliationFee || 0;

    return (
      <div className="space-y-2 text-sm">
        <h3 className="font-bold text-lg mb-4">Resumen de la orden</h3>
        <div className="flex justify-between">
          <span>{summaryText}</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
            <span>Cuota de Afiliación</span>
            <span>${fee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold pt-2 border-t">
          <span>Total</span>
          <span>${(total + fee).toFixed(2)}</span>
        </div>
      </div>
    );
  };


  if (step === 4) {
    return (
      <div className="text-center py-16 px-6">
        <ShieldCheck className="mx-auto h-16 w-16 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">¡Afiliación Recibida!</h2>
        <p className="text-muted-foreground">
          Hemos recibido tus datos correctamente. Un asesor se pondrá en contacto contigo a la brevedad para confirmar los detalles del pago y finalizar el proceso.
        </p>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Step 1: Plan Selection */}
        {step === 1 && (
            <div>
                 <h2 className="text-xl font-bold text-center mb-1">Elige tu Plan</h2>
                 <p className="text-muted-foreground text-center mb-6">Selecciona el plan y la modalidad de pago que prefieras.</p>
                <div className="space-y-6">
                    {/* Plan Selection */}
                    <FormField
                        control={form.control}
                        name="planId"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel className="text-base font-semibold">1. Selecciona el Plan de Afiliación</FormLabel>
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
                                            className={cn(
                                                "flex flex-col rounded-lg border-2 p-4 cursor-pointer transition-all",
                                                "hover:border-primary/50",
                                                field.value === plan.id ? "border-primary bg-primary/10" : "border-muted bg-popover"
                                            )}
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


                    {/* Payment Mode */}
                    <FormField
                        control={form.control}
                        name="paymentMode"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel className="text-base font-semibold">2. Elige la Modalidad de Pago</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="grid grid-cols-2 gap-4"
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
                                                <CreditCard className="mt-1 mb-2 h-5 w-5" />
                                            </Label>
                                        </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />


                    {/* Installment Options */}
                    {selectedPaymentMode === 'credito' && (
                         <FormField
                            control={form.control}
                            name="installmentOption"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel className="text-base font-semibold">3. Elige tu Opción de Financiamiento</FormLabel>
                                    <FormControl>
                                         <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                        >
                                            {selectedPlan.paymentModes.credito.installmentOptions.map((opt, index) => (
                                                 <FormItem key={index}>
                                                     <FormControl>
                                                         <RadioGroupItem value={index.toString()} id={`install-${index}`} className="sr-only" />
                                                     </FormControl>
                                                    <Label htmlFor={`install-${index}`} className="flex items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                                        <div>
                                                            <p>{opt.count} cuotas de <span className="font-bold">${opt.amount.toFixed(2)}</span></p>
                                                            <p className="text-xs text-muted-foreground">{opt.type === 'mensual' ? 'Mensuales' : 'Fraccionadas'}</p>
                                                        </div>
                                                        <Check className={cn("h-5 w-5 ml-4 text-primary", field.value === index.toString() ? "opacity-100" : "opacity-0")} />
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
                </div>
            </div>
        )}

        {/* Step 2: Personal Info */}
        {step === 2 && (
             <div>
                <h2 className="text-xl font-bold text-center mb-1">Datos del Afiliado Titular</h2>
                <p className="text-muted-foreground text-center mb-6">Completa tu información personal para continuar.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Nombre Completo</FormLabel>
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
                                <Input placeholder="V-12345678" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                     <FormField
                        control={form.control}
                        name="birthDate"
                        render={({ field }) => (
                            <FormItem>
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
                                <Input type="tel" placeholder="0414-1234567" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                     <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem className="md:col-span-2">
                            <FormLabel>Correo Electrónico</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="juan.perez@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                            <FormItem className="md:col-span-2">
                            <FormLabel>Dirección</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Urb. La Viña, Calle 123, Casa 45. Valencia, Carabobo." {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                </div>
             </div>
        )}

         {/* Step 3: Payment */}
        {step === 3 && (
            <div>
                 <h2 className="text-xl font-bold text-center mb-1">Confirmación y Pago</h2>
                <p className="text-muted-foreground text-center mb-6">Revisa tu orden y selecciona un método de pago.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <FormField
                            control={form.control}
                            name="paymentMethod"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base font-semibold">Selecciona un Método de Pago</FormLabel>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="grid grid-cols-2 gap-4"
                                    >
                                        {PAYMENT_METHODS.map(method => (
                                            <FormItem key={method.id}>
                                                 <FormControl>
                                                    <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                                                </FormControl>
                                                <Label
                                                    htmlFor={method.id}
                                                    className={cn(
                                                        "flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer transition-all h-28",
                                                        "hover:border-primary/50",
                                                        field.value === method.id ? "border-primary bg-primary/10" : "border-muted bg-popover"
                                                    )}
                                                >
                                                    <Image src={method.logoSrc} alt={method.label} width={40} height={40} className="mb-2" />
                                                    <span className="text-xs font-semibold text-center">{method.label}</span>
                                                </Label>
                                            </FormItem>
                                        ))}
                                    </RadioGroup>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                         {selectedPaymentMethod && (
                            <div className="p-4 bg-muted/50 rounded-lg text-sm">
                                <h4 className="font-semibold mb-2">Instrucciones de Pago</h4>
                                <p className="text-muted-foreground">
                                    {PAYMENT_METHODS.find(m => m.id === selectedPaymentMethod)?.accountInfo}
                                </p>
                            </div>
                        )}
                    </div>
                     <div className="p-6 bg-muted/50 rounded-lg">
                        {renderOrderSummary()}
                    </div>
                </div>
            </div>
        )}

        {/* Navigation */}
        <div className="pt-4 flex justify-between items-center">
          {step > 1 && step < 4 && (
            <Button type="button" variant="outline" onClick={handlePrevStep}>
              Anterior
            </Button>
          )}
           <div className="flex-grow"></div>
          {step < 3 && (
            <Button type="button" onClick={handleNextStep}>
              Siguiente
            </Button>
          )}
          {step === 3 && (
            <Button type="submit" disabled={form.formState.isSubmitting || !selectedPaymentMethod}>
              {form.formState.isSubmitting ? 'Procesando...' : 'Finalizar Afiliación'}
            </Button>
          )}
        </div>
      </form>
    </Form>
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
