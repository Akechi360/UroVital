'use client';

import * as React from 'react';
import { useState, useMemo, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Check, CheckCircle, ChevronLeft, CreditCard, Loader2, User, Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Image from 'next/image';
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AFFILIATE_PLANS, PAYMENT_METHODS } from '@/lib/payment-options';
import { submitAffiliateLead, type AffiliateLead } from '@/lib/actions';


const formSchema = z.object({
  fullName: z.string().min(3, "El nombre completo debe tener al menos 3 caracteres."),
  documentId: z.string().min(6, "El documento de identidad es requerido."),
  birthDate: z.date({ required_error: "La fecha de nacimiento es requerida." }),
  phone: z.string().min(7, "El teléfono es requerido."),
  email: z.string().email("El correo electrónico no es válido."),
  address: z.string().min(10, "La dirección debe tener al menos 10 caracteres."),
  planId: z.enum(['tarjeta-saludable', 'fondo-espiritu-santo'], { required_error: "Debe seleccionar un plan." }),
  paymentMode: z.enum(['contado', 'credito'], { required_error: "Debe seleccionar una modalidad de pago." }),
  installmentOption: z.string().optional(),
  paymentMethod: z.string({ required_error: "Debe seleccionar un método de pago." }),
});

type FormValues = z.infer<typeof formSchema>;

function AffiliateEnrollmentContent() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      documentId: '',
      birthDate: undefined,
      phone: '',
      email: '',
      address: '',
      planId: searchParams.get('plan') === 'fondo-espiritu-santo' ? 'fondo-espiritu-santo' : 'tarjeta-saludable',
      paymentMode: undefined,
      installmentOption: '',
      paymentMethod: '',
    },
  });

  const { watch, trigger, getValues } = form;

  const planId = watch('planId');
  const paymentMode = watch('paymentMode');
  const installmentOption = watch('installmentOption');
  const paymentMethod = watch('paymentMethod');

  const selectedPlan = useMemo(() => AFFILIATE_PLANS.find(p => p.id === planId), [planId]);
  const selectedInstallment = useMemo(() => {
    if (paymentMode === 'credito' && selectedPlan && 'installmentOptions' in selectedPlan.paymentModes.credito) {
      return selectedPlan.paymentModes.credito.installmentOptions.find(o => `${o.count}-${o.type}` === installmentOption);
    }
    return null;
  }, [paymentMode, selectedPlan, installmentOption]);

  const selectedPaymentMethod = useMemo(() => PAYMENT_METHODS.find(p => p.id === paymentMethod), [paymentMethod]);

  const handleNextStep = async () => {
    let fieldsToValidate: (keyof FormValues)[] = [];
    if (step === 1) {
      fieldsToValidate = ['fullName', 'documentId', 'birthDate', 'phone', 'email', 'address'];
    } else if (step === 2) {
      fieldsToValidate = ['planId', 'paymentMode'];
      if(paymentMode === 'credito') fieldsToValidate.push('installmentOption');
      fieldsToValidate.push('paymentMethod');
    }
    
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep(prev => prev + 1);
    } else {
        toast({
            variant: "destructive",
            title: "Campos Incompletos",
            description: "Por favor, completa todos los campos requeridos antes de continuar.",
        })
    }
  };

  const handlePrevStep = () => setStep(prev => prev - 1);

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);
    try {
        const leadData: AffiliateLead = {
            ...data,
            birthDate: format(data.birthDate, 'yyyy-MM-dd'),
        };
        await submitAffiliateLead(leadData);
        handleNextStep();
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error al enviar",
            description: "No se pudo procesar tu solicitud. Por favor, intenta de nuevo.",
        });
    } finally {
        setIsSubmitting(false);
    }
  }
  
  if (!selectedPlan) {
    return <div>Cargando plan...</div>;
  }

  const renderOrderSummary = () => (
    <div className="space-y-2 rounded-lg border bg-muted/50 p-4">
      <h3 className="font-semibold">Resumen de la orden</h3>
      <div className="flex justify-between text-sm">
        <span>Plan</span>
        <span className="font-medium">{selectedPlan.name}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span>Cuota de Afiliación</span>
        <span className="font-medium">${selectedPlan.affiliationFee.toFixed(2)}</span>
      </div>
      <div className="border-t border-dashed my-2"></div>
      {selectedInstallment ? (
        <>
            <div className="flex justify-between text-sm">
                <span>Modalidad</span>
                <span className="font-medium">Crédito</span>
            </div>
            <div className="flex justify-between text-sm font-bold">
                <span>Total a Pagar Hoy (1ra Cuota)</span>
                <span>${selectedInstallment.amount.toFixed(2)}</span>
            </div>
            <p className="text-xs text-muted-foreground pt-1">
                Pagarás ${selectedInstallment.amount.toFixed(2)} hoy, seguido de {selectedInstallment.count - 1} pago(s) de ${selectedInstallment.amount.toFixed(2)} cada uno.
            </p>
        </>
      ) : (
        <div className="flex justify-between font-bold"><span>Total</span><span>${selectedPlan.paymentModes.contado.price.toFixed(2)}</span></div>
      )}
    </div>
  );

  return (
    <FormProvider {...form}>
      <h1 className="text-2xl font-bold text-center text-primary font-headline">Formulario de Afiliación</h1>
      
      {step < 4 && (
        <div className="flex items-center justify-center my-4">
            {[1, 2, 3].map((s, i) => (
            <React.Fragment key={s}>
                <div className="flex flex-col items-center">
                    <div
                        className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full transition-all",
                            step > s ? "bg-green-500 text-white" : "bg-muted text-muted-foreground",
                            step === s && "bg-primary text-primary-foreground scale-110"
                        )}
                    >
                        {step > s ? <Check size={18} /> : s}
                    </div>
                    <p className={cn(
                        "mt-2 text-xs font-semibold transition-all",
                        step === s ? "text-primary" : "text-muted-foreground"
                    )}>
                        {['Información', 'Pago', 'Confirmar'][i]}
                    </p>
                </div>
                {i < 2 && <div className={cn("flex-1 h-1 mx-2 transition-colors", step > s ? 'bg-green-500' : 'bg-muted')} />}
            </React.Fragment>
            ))}
        </div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in-0 duration-300">
            <h2 className="text-lg font-semibold flex items-center gap-2"><User className="text-primary"/>Información Personal</h2>
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Juan Pérez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid sm:grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="documentId"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Cédula / Pasaporte</FormLabel>
                    <FormControl>
                        <Input placeholder="V-12.345.678" {...field} />
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
                                {field.value ? (
                                    format(field.value, "PPP", { locale: es })
                                ) : (
                                    <span>Selecciona una fecha</span>
                                )}
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                            <Input placeholder="0414-1234567" {...field} />
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
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                            <Input type="email" placeholder="juan.perez@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
             <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                        <Textarea placeholder="Urb. La Viña, Calle 1, Casa 1-1, Valencia, Carabobo" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
          </div>
        )}
        
        {step === 2 && (
          <div className="space-y-8 animate-in fade-in-0 duration-300">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4"><Wallet className="text-primary"/>Plan y Pago</h2>
              
              <FormField
                control={form.control}
                name="planId"
                render={({ field }) => (
                  <FormItem className="space-y-4">
                    <FormLabel className="text-base">1. Selecciona tu Plan de Afiliación</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      >
                        {AFFILIATE_PLANS.map((plan) => (
                          <FormItem key={plan.id}>
                            <FormControl>
                              <RadioGroupItem value={plan.id} id={plan.id} className="sr-only" />
                            </FormControl>
                            <Label htmlFor={plan.id} className="flex flex-col rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all">
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
            </div>
             <div>
                <FormField
                    control={form.control}
                    name="paymentMode"
                    render={({ field }) => (
                        <FormItem className="space-y-4">
                            <FormLabel className="text-base">2. Elige la Modalidad de Pago</FormLabel>
                            <FormControl>
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
                                     <FormItem>
                                        <FormControl>
                                            <RadioGroupItem value="credito" id="credito" className="sr-only" />
                                        </FormControl>
                                        <Label htmlFor="credito" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                        Crédito
                                        <span className="text-xs text-muted-foreground mt-1">Paga en cuotas</span>
                                        </Label>
                                    </FormItem>
                                </RadioGroup>
                            </FormControl>
                        </FormItem>
                    )}
                />
            </div>
            
            {paymentMode === 'credito' && 'installmentOptions' in selectedPlan.paymentModes.credito && (
                <div className="animate-in fade-in-0 duration-500">
                    <FormField
                        control={form.control}
                        name="installmentOption"
                        render={({ field }) => (
                            <FormItem className="space-y-4">
                                <FormLabel className="text-base">3. Elige tu Opción de Cuotas</FormLabel>
                                <FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     {selectedPlan.paymentModes.credito.installmentOptions.map(option => (
                                         <FormItem key={`${option.count}-${option.type}`}>
                                            <FormControl>
                                                <RadioGroupItem value={`${option.count}-${option.type}`} id={`${option.count}-${option.type}`} className="sr-only" />
                                            </FormControl>
                                            <Label htmlFor={`${option.count}-${option.type}`} className="flex items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                                <div className="flex flex-col">
                                                    <span>{option.count} {option.type === 'cuotas' ? 'Cuotas' : 'Meses'}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {option.type === 'cuotas' ? 'Pagos fijos' : 'Pagos mensuales'}
                                                    </span>
                                                </div>
                                                <span className="font-bold">${option.amount.toFixed(2)}</span>
                                            </Label>
                                        </FormItem>
                                    ))}
                                </RadioGroup>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>
            )}

            <div>
                <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                        <FormItem className="space-y-4">
                            <FormLabel className="text-base">{paymentMode === 'credito' ? '4.' : '3.'} Selecciona un Método de Pago</FormLabel>
                            <FormControl>
                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {PAYMENT_METHODS.map(method => (
                                <FormItem key={method.id}>
                                    <FormControl>
                                        <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                                    </FormControl>
                                    <Label htmlFor={method.id} className="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer h-full">
                                    <Image src={method.logoSrc} alt={method.label} width={40} height={40} className="h-10 w-auto"/>
                                    <span className="text-sm font-semibold">{method.label}</span>
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
          </div>
        )}

        {step === 3 && (
            <div className="space-y-6 animate-in fade-in-0 duration-300">
                <h2 className="text-lg font-semibold flex items-center gap-2"><CreditCard className="text-primary"/>Confirmación y Pago</h2>
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h3 className="font-semibold">Detalles de la Afiliación</h3>
                        <div className="text-sm space-y-2 rounded-lg border bg-muted/25 p-4">
                            <div className="flex justify-between"><span>Nombre:</span><span className="font-medium text-right">{getValues('fullName')}</span></div>
                            <div className="flex justify-between"><span>Documento:</span><span className="font-medium">{getValues('documentId')}</span></div>
                            <div className="flex justify-between"><span>Email:</span><span className="font-medium">{getValues('email')}</span></div>
                        </div>
                         <h3 className="font-semibold pt-2">Pago</h3>
                        {renderOrderSummary()}
                    </div>
                     <div className="space-y-4">
                        <h3 className="font-semibold">Instrucciones de Pago</h3>
                        <div className="text-sm space-y-4 rounded-lg border bg-muted/25 p-4">
                            <p>Para completar su afiliación, por favor realice el pago utilizando los siguientes datos:</p>
                            <div className="flex items-center gap-3">
                                <Image src={selectedPaymentMethod?.logoSrc || ''} alt={selectedPaymentMethod?.label || ''} width={40} height={40} />
                                <div>
                                    <p className="font-bold">{selectedPaymentMethod?.label}</p>
                                    <p className="text-xs">{selectedPaymentMethod?.description}</p>
                                </div>
                            </div>
                            <div className="p-3 bg-muted rounded-md text-xs font-mono text-center">
                                {selectedPaymentMethod?.accountInfo}
                            </div>
                            <p>Una vez realizado el pago, por favor envíe el comprobante a nuestro departamento de administración para activar su cuenta.</p>
                        </div>
                    </div>
                </div>
            </div>
        )}
        
        {step === 4 && (
            <div className="text-center py-10 flex flex-col items-center animate-in fade-in-0 zoom-in-95 duration-500">
                <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2">¡Solicitud Recibida!</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                    Hemos recibido tu solicitud de afiliación. Por favor, completa el pago y envía el comprobante para activar tu plan.
                </p>
                <Button onClick={() => setStep(1)} className="mt-8">Realizar otra afiliación</Button>
            </div>
        )}

        <div className="flex justify-between items-center pt-4">
          {step > 1 && step < 4 && (
            <Button variant="outline" onClick={handlePrevStep} type="button">
              <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
            </Button>
          )}
          <div className="flex-1" />
          {step < 3 && (
            <Button onClick={handleNextStep} type="button">
              Siguiente
            </Button>
          )}
          {step === 3 && (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Procesando..." : "Confirmar y Enviar Solicitud"}
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}

export function AffiliateEnrollment() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

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
