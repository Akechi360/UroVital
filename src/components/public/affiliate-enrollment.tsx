
'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AFFILIATE_PLANS, PAYMENT_METHODS } from '@/lib/payment-options';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { CheckCircle, Info, Landmark, ShieldCheck, User, CreditCard as CreditCardIcon, FileCheck } from 'lucide-react';
import Image from 'next/image';
import { submitAffiliateLead } from '@/lib/actions';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { Textarea } from '../ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { format, subYears, startOfDay } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import type { AffiliateLead } from '@/lib/types';
import { Label } from '@/components/ui/label';

const MySwal = withReactContent(Swal);

const formSchema = z.object({
  fullName: z.string().min(3, { message: 'El nombre completo debe tener al menos 3 caracteres.' }),
  documentId: z.string().regex(/^\d{7,8}$/, { message: 'La cédula debe tener entre 7 y 8 dígitos.' }),
  birthDate: z.date({ required_error: 'La fecha de nacimiento es requerida.' }),
  phone: z.string().regex(/^\d{10,11}$/, { message: 'El teléfono debe tener entre 10 y 11 dígitos.' }),
  email: z.string().email({ message: 'El correo electrónico no es válido.' }),
  address: z.string().min(10, { message: 'La dirección debe tener al menos 10 caracteres.' }),
  planId: z.enum(['tarjeta-saludable', 'fondo-espiritu-santo'], {
    required_error: 'Debes seleccionar un plan de afiliación.',
  }),
  paymentMode: z.enum(['contado', 'credito'], {
    required_error: 'Debes seleccionar una modalidad de pago.',
  }),
  installmentOption: z.string().optional(),
  paymentMethod: z.string({ required_error: 'Debes seleccionar un método de pago.' }),
});

type FormValues = z.infer<typeof formSchema>;

const stepFields = {
  1: ['fullName', 'documentId', 'birthDate', 'phone', 'email', 'address'],
  2: ['planId', 'paymentMode', 'installmentOption', 'paymentMethod'],
};

function AffiliateEnrollmentContent() {
  const searchParams = useSearchParams();
  const initialPlanId = searchParams.get('plan') === 'fondo-espiritu-santo' ? 'fondo-espiritu-santo' : 'tarjeta-saludable';

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      planId: initialPlanId,
      fullName: '',
      documentId: '',
      birthDate: undefined,
      phone: '',
      email: '',
      address: '',
      paymentMode: 'contado',
      installmentOption: '',
      paymentMethod: '',
    },
  });

  const { watch, handleSubmit } = form;
  const selectedPlanId = watch('planId');
  const selectedPaymentMode = watch('paymentMode');
  const selectedInstallmentOptionId = watch('installmentOption');
  const selectedPaymentMethodId = watch('paymentMethod');

  const selectedPlan = useMemo(() => AFFILIATE_PLANS.find(p => p.id === selectedPlanId), [selectedPlanId]);
  const selectedInstallment = useMemo(() => {
    if (selectedPaymentMode === 'credito' && selectedPlan?.paymentModes.credito) {
      return selectedPlan.paymentModes.credito.installmentOptions.find(o => `${o.count}-${o.amount}` === selectedInstallmentOptionId);
    }
    return null;
  }, [selectedPaymentMode, selectedPlan, selectedInstallmentOptionId]);
  const selectedPaymentMethod = useMemo(() => PAYMENT_METHODS.find(pm => pm.id === selectedPaymentMethodId), [selectedPaymentMethodId]);

  if (!selectedPlan) {
    return <div>Plan no encontrado.</div>;
  }

  const renderOrderSummary = () => {
    const affiliationFee = selectedPlan.affiliationFee ?? 0;
    let total = affiliationFee;
    let paymentTitle = 'Pago de Contado';
    let paymentValue = selectedPlan.paymentModes.contado.price;

    if (selectedPaymentMode === 'credito' && selectedInstallment) {
        paymentTitle = `Inicial de ${selectedInstallment.installments} cuotas`;
        paymentValue = selectedInstallment.upfront;
    }

    total += paymentValue;

    return (
      <div className="mt-6 space-y-4 rounded-lg bg-muted/50 p-4 border border-border">
        <h3 className="font-semibold text-lg">Resumen de Orden</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Cuota de Afiliación</span>
            <span className="font-medium">${(selectedPlan.affiliationFee ?? 0).toFixed(2)}</span>
          </div>
          <div className="border-t border-dashed my-2"></div>
          {selectedInstallment ? (
             <>
                <div className="flex justify-between text-sm">
                    <span>Inicial ({selectedInstallment.installments} cuotas)</span>
                    <span className="font-medium">${selectedInstallment.upfront.toFixed(2)}</span>
                </div>
                 <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{selectedInstallment.installments} cuotas de ${selectedInstallment.installmentValue.toFixed(2)} / {selectedInstallment.frequencyDays === 30 ? 'mes' : `${selectedInstallment.frequencyDays} días`}</span>
                </div>
             </>
          ) : (
             <div className="flex justify-between text-sm">
                <span>Pago de Contado</span>
                <span className="font-medium">${selectedPlan.paymentModes.contado.price.toFixed(2)}</span>
             </div>
          )}

          <div className="border-t border-dashed my-2"></div>
          <div className="flex justify-between font-bold text-lg">
            <span>Total a Pagar Hoy</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    );
  };
  
  const handleNextStep = async () => {
    const fieldsToValidate = stepFields[currentStep as keyof typeof stepFields];
    const isValid = await form.trigger(fieldsToValidate as any);

    if (isValid) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsSubmitting(true);
    try {
        let schedule;
        if(data.paymentMode === 'credito' && selectedInstallment) {
            schedule = {
                upfront: selectedInstallment.upfront,
                installments: selectedInstallment.installments,
                installmentValue: selectedInstallment.installmentValue,
                frequencyDays: selectedInstallment.frequencyDays
            }
        }

        const leadData: Omit<AffiliateLead, 'birthDate'> & { birthDate: Date } = {
            ...data,
            schedule,
        };
        // The action expects birthDate as a string
        await submitAffiliateLead({
            ...leadData,
            birthDate: format(leadData.birthDate, 'yyyy-MM-dd')
        });

        const isDarkMode = document.documentElement.classList.contains('dark');
        MySwal.fire({
            title: '¡Afiliación Enviada!',
            text: 'Hemos recibido tus datos. Pronto recibirás un correo con la confirmación y los próximos pasos.',
            icon: 'success',
            background: isDarkMode ? '#1e293b' : '#ffffff',
            color: isDarkMode ? '#f1f5f9' : '#0f172a',
            confirmButtonColor: '#4f46e5',
            timer: 5000,
            timerProgressBar: true,
        });

    } catch(error) {
        console.error("Submission error:", error);
         const isDarkMode = document.documentElement.classList.contains('dark');
        MySwal.fire({
            title: 'Error',
            text: 'Hubo un problema al enviar tu solicitud. Por favor, inténtalo de nuevo.',
            icon: 'error',
            background: isDarkMode ? '#1e293b' : '#ffffff',
            color: isDarkMode ? '#f1f5f9' : '#0f172a',
            confirmButtonColor: '#ef4444',
        });
    } finally {
        setIsSubmitting(false);
    }
  };


  const steps = [
    { number: 1, name: 'Información', icon: User },
    { number: 2, name: 'Pago', icon: CreditCardIcon },
    { number: 3, name: 'Confirmación', icon: FileCheck },
  ];

  return (
    <>
      <h1 className="text-3xl font-bold text-center font-headline mb-2 text-primary">Formulario de Afiliación</h1>
      <p className="text-center text-muted-foreground mb-8">Completa los siguientes pasos para unirte a UroVital.</p>
      
      <div className="flex items-center justify-center my-8">
        {steps.map((step, i) => (
          <React.Fragment key={step.number}>
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300',
                  currentStep > step.number ? 'bg-primary text-primary-foreground' :
                  currentStep === step.number ? 'bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/30' :
                  'bg-muted text-muted-foreground'
                )}
              >
                <step.icon className="h-5 w-5" />
              </div>
              <p className={cn(
                "mt-2 text-xs font-semibold transition-colors",
                currentStep >= step.number ? "text-primary" : "text-muted-foreground"
              )}>
                {step.name}
              </p>
            </div>
            {i < steps.length - 1 && (
              <div className={cn(
                  "flex-1 h-1 mx-4 transition-colors duration-500 rounded-full",
                  currentStep > i + 1 ? 'bg-primary' : 'bg-muted'
              )}></div>
            )}
          </React.Fragment>
        ))}
      </div>


      <form onSubmit={handleSubmit(onSubmit)}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <div className="space-y-4">
                 <FormField
                    control={form.control}
                    name="planId"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-base font-semibold">Elige tu Plan de Afiliación</FormLabel>
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
                                    <Label htmlFor={plan.id} className={cn(
                                        "flex flex-col items-start justify-between rounded-lg border-2 p-4 cursor-pointer transition-all",
                                        "bg-card/50 hover:bg-accent/50 hover:text-accent-foreground",
                                        field.value === plan.id && "border-primary bg-primary/10"
                                    )}>
                                        <span className="text-lg font-bold text-primary">{plan.name}</span>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="fullName" render={({ field }) => (
                      <FormItem><FormLabel>Nombre Completo</FormLabel><FormControl><Input placeholder="Ej: Juan Pérez" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="documentId" render={({ field }) => (
                      <FormItem><FormLabel>Cédula de Identidad</FormLabel><FormControl><Input placeholder="Ej: 12345678" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="birthDate" render={({ field }) => (
                    <FormItem className="flex flex-col"><FormLabel>Fecha de Nacimiento</FormLabel>
                        <Popover><PopoverTrigger asChild>
                            <FormControl>
                                <Button variant="outline" className={cn("w-full justify-start text-left font-normal",!field.value && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {field.value ? format(field.value, 'PPP') : <span>Selecciona una fecha</span>}
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} captionLayout="dropdown-buttons" fromYear={1920} toYear={subYears(startOfDay(new Date()), 18).getFullYear()} initialFocus/></PopoverContent>
                        </Popover>
                    <FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input placeholder="Ej: 04141234567" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="ejemplo@correo.com" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                 <FormField control={form.control} name="address" render={({ field }) => (
                    <FormItem><FormLabel>Dirección de Habitación</FormLabel><FormControl><Textarea placeholder="Indica tu dirección completa" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
            )}

            {/* Step 2: Payment */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <FormField
                    control={form.control}
                    name="paymentMode"
                    render={({ field }) => (
                    <FormItem className="space-y-3">
                        <FormLabel className="text-base font-semibold">Modalidad de Pago</FormLabel>
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
                                        <span className="text-xs">Paga en cuotas</span>
                                     </Label>
                                </FormItem>
                            </RadioGroup>
                         </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                
                {selectedPaymentMode === 'credito' && (
                  <FormField
                    control={form.control}
                    name="installmentOption"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-base font-semibold">Opciones de Cuotas</FormLabel>
                        <FormControl>
                            <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                            >
                                {selectedPlan.paymentModes.credito.installmentOptions.map(option => (
                                <FormItem key={`${option.count}-${option.amount}`}>
                                    <FormControl>
                                        <RadioGroupItem value={`${option.count}-${option.amount}`} id={`${option.count}-${option.amount}`} className="sr-only" />
                                    </FormControl>
                                     <Label htmlFor={`${option.count}-${option.amount}`} className="flex flex-col text-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                        <p className="font-bold">{option.count} {option.type === 'cuotas' ? 'Cuotas' : 'Meses'}</p>
                                        <p className="text-sm">${option.amount.toFixed(2)} c/u</p>
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
                      <FormLabel className="text-base font-semibold">Método de Pago</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-2 md:grid-cols-4 gap-4"
                        >
                          {PAYMENT_METHODS.map(method => (
                            <FormItem key={method.id}>
                               <FormControl>
                                <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                               </FormControl>
                                <Label htmlFor={method.id} className={cn(
                                    "relative flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer transition-all h-28",
                                    "bg-card/50 hover:bg-accent/50 hover:text-accent-foreground",
                                    field.value === method.id && "border-primary bg-primary/10"
                                )}>
                                    {field.value === method.id && (
                                        <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                            <CheckCircle className="w-4 h-4 text-primary-foreground" />
                                        </div>
                                    )}
                                    <Image src={method.logoSrc} alt={method.label} width={40} height={40} />
                                    <span className="mt-2 text-sm font-semibold text-center">{method.label}</span>
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

            {/* Step 3: Confirmation */}
            {currentStep === 3 && (
              <div>
                <h2 className="text-2xl font-bold text-center mb-6">Confirma tu Afiliación</h2>
                <div className="space-y-6 rounded-lg border bg-card/70 p-6">
                    <div>
                        <h3 className="font-semibold text-lg flex items-center gap-2 mb-2"><User className="text-primary"/>Información Personal</h3>
                        <div className="text-sm text-muted-foreground space-y-1">
                            <p><strong>Nombre:</strong> {watch('fullName')}</p>
                            <p><strong>Cédula:</strong> {watch('documentId')}</p>
                            <p><strong>Fecha de Nacimiento:</strong> {format(watch('birthDate'), 'dd/MM/yyyy')}</p>
                            <p><strong>Teléfono:</strong> {watch('phone')}</p>
                            <p><strong>Email:</strong> {watch('email')}</p>
                            <p><strong>Dirección:</strong> {watch('address')}</p>
                        </div>
                    </div>
                     <div>
                        <h3 className="font-semibold text-lg flex items-center gap-2 mb-2"><ShieldCheck className="text-primary"/>Plan Seleccionado</h3>
                        <div className="text-sm text-muted-foreground space-y-1">
                            <p><strong>Plan:</strong> {selectedPlan.name}</p>
                             <p><strong>Modalidad:</strong> {watch('paymentMode') === 'contado' ? 'Contado' : 'Crédito'}</p>
                             {watch('paymentMode') === 'credito' && selectedInstallment && (
                                 <p><strong>Cuotas:</strong> {selectedInstallment.installments} cuotas de ${selectedInstallment.installmentValue.toFixed(2)}</p>
                             )}
                        </div>
                    </div>
                     {selectedPaymentMethod && (
                        <div>
                            <h3 className="font-semibold text-lg flex items-center gap-2 mb-2"><Landmark className="text-primary"/>Método de Pago</h3>
                            <div className="flex items-center gap-4 rounded-lg border bg-muted/50 p-3">
                                <Image src={selectedPaymentMethod.logoSrc} alt={selectedPaymentMethod.label} width={40} height={40}/>
                                <div>
                                    <p className="font-semibold">{selectedPaymentMethod.label}</p>
                                    <p className="text-sm text-muted-foreground">{selectedPaymentMethod.description}</p>
                                    <p className="text-xs text-muted-foreground">{selectedPaymentMethod.accountInfo}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                {renderOrderSummary()}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between">
          {currentStep > 1 ? (
            <Button type="button" variant="outline" onClick={handlePrevStep}>
              Anterior
            </Button>
          ) : (
            <div></div> // Placeholder to keep "Siguiente" on the right
          )}
          
          {currentStep < 3 && (
            <Button type="button" onClick={handleNextStep}>
              Siguiente
            </Button>
          )}

          {currentStep === 3 && (
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando...' : 'Confirmar y Enviar Afiliación'}
            </Button>
          )}
        </div>
      </form>
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
