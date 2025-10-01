'use client';
import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { AFFILIATE_PLANS, PAYMENT_METHODS } from '@/lib/payment-options';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { submitAffiliateLead, type AffiliateLead } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon, Check } from 'lucide-react';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';

const MySwal = withReactContent(Swal);

const formSchema = z.object({
  fullName: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  documentId: z.string().min(6, 'La cédula debe tener al menos 6 caracteres.'),
  birthDate: z.date({ required_error: 'La fecha de nacimiento es requerida.' }),
  phone: z.string().min(7, 'El teléfono debe tener al menos 7 caracteres.'),
  email: z.string().email('Email inválido.'),
  address: z.string().min(10, 'La dirección es muy corta.'),
  planId: z.string({ required_error: 'Debes seleccionar un plan.' }),
  paymentMode: z.string({ required_error: 'Debes seleccionar una modalidad de pago.' }),
  installmentOption: z.string().optional(),
  paymentMethod: z.string({ required_error: 'Debes seleccionar un método de pago.' }),
});

type FormValues = z.infer<typeof formSchema>;

function AffiliateEnrollmentContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      documentId: '',
      phone: '',
      email: '',
      address: '',
      planId: searchParams.get('plan') || AFFILIATE_PLANS[0].id,
      paymentMode: '',
      installmentOption: '',
      paymentMethod: '',
    },
  });

  const { watch, trigger } = form;
  const planId = watch('planId');
  const paymentMode = watch('paymentMode');
  const installmentOption = watch('installmentOption');
  const paymentMethod = watch('paymentMethod');

  const selectedPlan = useMemo(() => AFFILIATE_PLANS.find(p => p.id === planId), [planId]);
  const selectedPaymentMethod = useMemo(() => PAYMENT_METHODS.find(m => m.id === paymentMethod), [paymentMethod]);

  const selectedInstallment = useMemo(() => {
    if (paymentMode === 'credito' && selectedPlan?.paymentModes.credito && installmentOption) {
      return selectedPlan.paymentModes.credito.installmentOptions.find(opt => `${opt.type}-${opt.count}` === installmentOption);
    }
    return null;
  }, [paymentMode, selectedPlan, installmentOption]);

  const handleNextStep = async () => {
    let fieldsToValidate: (keyof FormValues)[] = [];
    if (step === 1) {
      fieldsToValidate = ['fullName', 'documentId', 'birthDate', 'phone', 'email', 'address', 'planId'];
    } else if (step === 2) {
      fieldsToValidate = ['paymentMode', 'paymentMethod'];
       if (paymentMode === 'credito') {
        fieldsToValidate.push('installmentOption');
       }
    }
    
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setStep(prev => prev - 1);
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!selectedPlan) return;

    setIsSubmitting(true);

    const leadData: AffiliateLead = {
      ...data,
      birthDate: data.birthDate.toISOString(),
      planId: data.planId as AffiliateLead['planId'],
      paymentMode: data.paymentMode as AffiliateLead['paymentMode'],
      paymentMethod: data.paymentMethod,
    };

    if (selectedInstallment) {
      leadData.schedule = {
        upfront: selectedPlan.affiliationFee || 0,
        installments: selectedInstallment.count,
        installmentValue: selectedInstallment.amount,
        frequencyDays: selectedInstallment.type === 'mensual' ? 30 : selectedInstallment.type === 'cuotas' ? 30 : 0, // Simplified
      };
    }

    try {
      await submitAffiliateLead(leadData);

      const isDarkMode = document.documentElement.classList.contains('dark');
      MySwal.fire({
        title: '¡Afiliación Enviada!',
        html: `
          <p>Tu solicitud de afiliación ha sido enviada con éxito.</p>
          <p class="mt-2 text-sm">Recibirás un correo electrónico con los detalles y los próximos pasos.</p>
        `,
        icon: 'success',
        background: isDarkMode ? '#1e293b' : '#ffffff',
        color: isDarkMode ? '#f1f5f9' : '#0f172a',
        confirmButtonColor: '#3A6DFF',
        confirmButtonText: 'Entendido',
      });
      form.reset();
      setStep(1);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error al enviar la solicitud',
        description: 'Hubo un problema al procesar tu afiliación. Por favor, inténtalo de nuevo.',
      });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const renderOrderSummary = () => {
    if (!selectedPlan) return null;

    return (
        <div className="space-y-2 rounded-lg bg-muted/50 p-4">
            <h3 className="font-semibold text-center mb-2">Resumen de la Orden</h3>
            <div className="flex justify-between text-sm">
                <span>Plan</span>
                <span className="font-medium">{selectedPlan.name}</span>
            </div>
             <div className="flex justify-between text-sm">
                <span>Cuota de Afiliación</span>
                <span className="font-medium">${(selectedPlan.affiliationFee ?? 0).toFixed(2)}</span>
            </div>
            <div className="border-t border-dashed my-2"></div>
            {selectedInstallment ? (
                <>
                    <div className="flex justify-between text-sm">
                        <span>Modalidad</span>
                        <span className="font-medium">Crédito</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span>Plan de Pago</span>
                        <span className="font-medium">{selectedInstallment.count} {selectedInstallment.type === 'mensual' ? 'meses' : 'cuotas'}</span>
                    </div>
                    <div className="border-t mt-2 pt-2">
                        <div className="flex justify-between font-bold">
                            <span>Monto por cuota</span>
                            <span>${selectedInstallment.amount.toFixed(2)}</span>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex justify-between font-bold"><span>Total</span><span>${selectedPlan.paymentModes.contado.price.toFixed(2)}</span></div>
            )}
        </div>
    );
  };


  return (
    <>
      <h1 className="text-3xl font-bold text-center text-primary font-headline mb-2">Formulario de Afiliación</h1>
      <div className="flex items-center justify-center my-4">
            {[1, 2, 3].map((s, i) => (
            <React.Fragment key={s}>
                <div className="flex flex-col items-center">
                    <div
                        className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                            step > s ? "bg-primary text-primary-foreground" :
                            step === s ? "bg-primary text-primary-foreground border-4 border-primary/30" : "bg-muted text-muted-foreground"
                        )}
                    >
                        {step > s ? <Check className="h-5 w-5" /> : s}
                    </div>
                    <p className={cn("mt-2 text-xs", step >= s ? "font-semibold text-foreground" : "text-muted-foreground")}>
                        {['Información', 'Pago', 'Confirmación'][i]}
                    </p>
                </div>
                {i < 2 && <div className={cn("flex-1 h-0.5 mx-4", step > s ? 'bg-primary' : 'bg-muted')}></div>}
            </React.Fragment>
            ))}
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-8">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in-50">
              <FormField
                control={form.control}
                name="planId"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-lg font-semibold">Selecciona tu Plan</FormLabel>
                     <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                          {AFFILIATE_PLANS.map((plan) => (
                             <FormItem key={plan.id}>
                                <FormControl>
                                  <RadioGroupItem value={plan.id} id={plan.id} className="sr-only peer" />
                                </FormControl>
                                <Label
                                  htmlFor={plan.id}
                                  className="flex h-full flex-col justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                >
                                  <div>
                                    <h3 className="font-bold">{plan.name}</h3>
                                    <p className="text-sm text-muted-foreground">{plan.subtitle}</p>
                                  </div>
                                </Label>
                             </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
              </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                toYear={new Date().getFullYear()}
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
              </div>
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
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
                      <FormItem>
                        <FormLabel>Dirección</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Indica tu dirección completa..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
            </div>
          )}

          {step === 2 && selectedPlan && (
            <div className="space-y-6 animate-in fade-in-50">
              <FormField
                control={form.control}
                name="paymentMode"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-lg font-semibold">Modalidad de Pago</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="grid grid-cols-2 gap-4"
                      >
                         <FormItem>
                            <FormControl>
                                <RadioGroupItem value="contado" id="contado" className="sr-only peer" />
                            </FormControl>
                            <Label
                                htmlFor="contado"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                            >
                                Contado
                                <span className="font-bold">${selectedPlan.paymentModes.contado.price.toFixed(2)}</span>
                            </Label>
                        </FormItem>
                        {selectedPlan.paymentModes.credito && (
                            <FormItem>
                                <FormControl>
                                    <RadioGroupItem value="credito" id="credito" className="sr-only peer" />
                                </FormControl>
                                <Label
                                    htmlFor="credito"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                >
                                    Crédito
                                    <span className="font-bold">en Cuotas</span>
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
                        <FormLabel className="text-lg font-semibold">Opciones de Cuotas</FormLabel>
                         <FormControl>
                            <RadioGroup
                                onValueChange={field.onChange}
                                value={field.value}
                                className="grid grid-cols-2 gap-4"
                            >
                                {selectedPlan.paymentModes.credito.installmentOptions.map(opt => {
                                    const id = `${opt.type}-${opt.count}`;
                                    return (
                                        <FormItem key={id}>
                                            <FormControl>
                                                <RadioGroupItem value={id} id={id} className="sr-only peer" />
                                            </FormControl>
                                            <Label
                                                htmlFor={id}
                                                className="flex flex-col text-center items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                            >
                                                <span className="font-medium">{opt.count} {opt.type === 'mensual' ? 'Meses' : 'Cuotas'}</span>
                                                <span className="text-xs">de</span>
                                                <span className="font-bold">${opt.amount.toFixed(2)}</span>
                                            </Label>
                                        </FormItem>
                                    )
                                })}
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
                    <FormLabel className="text-lg font-semibold">Elige tu método de pago</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4"
                      >
                        {PAYMENT_METHODS.map((method) => (
                          <FormItem key={method.id}>
                            <FormControl>
                              <RadioGroupItem value={method.id} id={method.id} className="sr-only peer" />
                            </FormControl>
                             <Label
                                htmlFor={method.id}
                                className={cn(
                                    "relative flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer",
                                    "peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                )}
                            >
                                {field.value === method.id && (
                                    <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                        <Check className="h-3 w-3" />
                                    </div>
                                )}
                                {method.logoSrc && <Image src={method.logoSrc} alt={method.label} width={40} height={40} className="mb-2 h-10 w-10 object-contain" />}
                                <span className="text-sm font-medium text-center">{method.label}</span>
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
          )}

          {step === 3 && selectedPlan && (
             <div className="space-y-6 animate-in fade-in-50">
                <h2 className="text-xl font-semibold text-center">Confirma tu Afiliación</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h3 className="font-semibold">Tus Datos</h3>
                        <div className="space-y-1 text-sm rounded-lg bg-muted/50 p-4">
                            <p><strong>Nombre:</strong> {watch('fullName')}</p>
                            <p><strong>Cédula:</strong> {watch('documentId')}</p>
                            <p><strong>Fecha de Nacimiento:</strong> {format(watch('birthDate'), 'dd/MM/yyyy')}</p>
                            <p><strong>Teléfono:</strong> {watch('phone')}</p>
                            <p><strong>Email:</strong> {watch('email')}</p>
                            <p><strong>Dirección:</strong> {watch('address')}</p>
                        </div>
                    </div>
                     <div className="space-y-4">
                        {renderOrderSummary()}
                        {selectedPaymentMethod && (
                            <div className="rounded-lg bg-muted/50 p-4">
                                 <h3 className="font-semibold text-center mb-2">Método de Pago</h3>
                                 <div className="flex items-center gap-4">
                                    {selectedPaymentMethod.logoSrc && <Image src={selectedPaymentMethod.logoSrc} alt={selectedPaymentMethod.label} width={40} height={40} className="h-10 w-10 object-contain"/>}
                                    <div>
                                        <p className="font-medium">{selectedPaymentMethod.label}</p>
                                        <p className="text-xs text-muted-foreground">{selectedPaymentMethod.accountInfo}</p>
                                    </div>
                                 </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-4">
            {step > 1 && (
              <Button type="button" variant="outline" onClick={handlePrevStep}>
                Anterior
              </Button>
            )}
            <div className={cn(step === 1 && "w-full flex justify-end")}>
                {step < 3 ? (
                <Button type="button" onClick={handleNextStep}>
                    Siguiente
                </Button>
                ) : (
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Procesando...' : 'Confirmar y Enviar Afiliación'}
                </Button>
                )}
            </div>
          </div>
        </form>
      </Form>
    </>
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
