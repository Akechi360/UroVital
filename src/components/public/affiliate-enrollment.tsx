'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, User, CreditCard, Mail, Phone, Calendar as CalendarIcon, Briefcase, FileText, ArrowRight, Banknote, Landmark } from 'lucide-react';
import Image from 'next/image';

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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AFFILIATE_PLANS, PAYMENT_METHODS } from '@/lib/payment-options';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { submitAffiliateLead } from '@/lib/actions';
import { Label } from '../ui/label';

const formSchema = z.object({
  fullName: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
  documentId: z.string().min(6, "El documento de identidad es requerido."),
  birthDate: z.date({ required_error: "La fecha de nacimiento es requerida." }),
  phone: z.string().min(10, "El teléfono debe tener al menos 10 caracteres."),
  email: z.string().email("El correo electrónico no es válido."),
  address: z.string().min(10, "La dirección debe tener al menos 10 caracteres."),
  planId: z.string({ required_error: "Debes seleccionar un plan." }),
  paymentMode: z.enum(['contado', 'credito'], { required_error: "Debes seleccionar una modalidad de pago." }),
  installmentOption: z.string().optional(),
  paymentMethod: z.string({ required_error: "Debes seleccionar un método de pago." }),
});

type FormValues = z.infer<typeof formSchema>;

function AffiliateEnrollmentContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialPlan = searchParams.get('plan') || AFFILIATE_PLANS[0].id;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      documentId: '',
      phone: '',
      email: '',
      address: '',
      planId: initialPlan,
      paymentMode: 'contado',
      installmentOption: '',
      paymentMethod: '',
    },
  });

  const { watch, trigger } = form;
  const planId = watch('planId');
  const paymentMode = watch('paymentMode');
  const installmentOption = watch('installmentOption');
  const selectedPlan = useMemo(() => AFFILIATE_PLANS.find(p => p.id === planId)!, [planId]);
  const selectedPaymentMethod = watch('paymentMethod');
  
  const selectedInstallment = useMemo(() => {
    if (paymentMode === 'credito' && installmentOption) {
      return selectedPlan.paymentModes.credito.installmentOptions.find(o => `${o.count}-${o.type}` === installmentOption);
    }
    return null;
  }, [paymentMode, installmentOption, selectedPlan]);

  const handleNextStep = async () => {
    let fieldsToValidate: (keyof FormValues)[] = [];
    if (step === 1) {
      fieldsToValidate = ['fullName', 'documentId', 'birthDate', 'phone', 'email', 'address'];
    } else if (step === 2) {
      fieldsToValidate = ['planId', 'paymentMode', 'paymentMethod'];
       if (form.getValues('paymentMode') === 'credito') {
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
  
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
        const leadData = {
            ...values,
            birthDate: format(values.birthDate, 'yyyy-MM-dd'),
            planId: values.planId as 'tarjeta-saludable' | 'fondo-espiritu-santo',
            schedule: selectedInstallment ? {
                upfront: 0,
                installments: selectedInstallment.count,
                installmentValue: selectedInstallment.amount,
                frequencyDays: selectedInstallment.type === 'mensual' ? 30 : (365 / selectedInstallment.count)
            } : undefined
        };
        await submitAffiliateLead(leadData);
        toast({
            title: '🎉 ¡Solicitud Enviada!',
            description: 'Hemos recibido tu solicitud de afiliación. Nos pondremos en contacto contigo pronto.',
        });
        setStep(4);
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Ocurrió un error',
            description: 'No se pudo enviar tu solicitud. Por favor, inténtalo de nuevo más tarde.',
        });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const renderOrderSummary = () => {
    if (!selectedPlan) return null;

    return (
      <div className="bg-primary/5 dark:bg-primary/10 p-4 rounded-lg space-y-2 border border-primary/20">
      <h3 className="font-semibold text-lg mb-2">Resumen del Pedido</h3>
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
                  <span className="font-medium">Crédito ({selectedInstallment.count} {selectedInstallment.type === 'mensual' ? 'meses' : 'cuotas'})</span>
              </div>
              <div className="flex justify-between font-bold text-lg mt-2">
                  <span>Valor de la cuota</span>
                  <span>${selectedInstallment.amount.toFixed(2)}</span>
              </div>
          </>
      ) : (
          <div className="flex justify-between font-bold"><span>Total</span><span>${selectedPlan.paymentModes.contado.price.toFixed(2)}</span></div>
      )}
  </div>
    )
  };

  const steps = [
    {
      title: 'Información Personal',
      icon: User,
      fields: [
        { name: 'fullName', label: 'Nombre Completo', placeholder: 'Ej: Juan Pérez', icon: User },
        { name: 'documentId', label: 'Cédula o Pasaporte', placeholder: 'Ej: V-12345678', icon: FileText },
        { name: 'birthDate', label: 'Fecha de Nacimiento', icon: CalendarIcon },
        { name: 'phone', label: 'Teléfono', placeholder: 'Ej: 0414-1234567', icon: Phone },
        { name: 'email', label: 'Correo Electrónico', placeholder: 'ejemplo@correo.com', icon: Mail },
        { name: 'address', label: 'Dirección', placeholder: 'Ej: Av. Bolívar, Valencia', icon: Briefcase },
      ]
    },
    {
      title: 'Plan y Pago',
      icon: CreditCard,
      fields: []
    },
    {
      title: 'Confirmación',
      icon: Check,
      fields: []
    }
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
             {step <= 3 && (
                <>
                <h2 className="text-2xl font-bold text-center mb-2 font-headline">{steps[step-1].title}</h2>
                <div className="flex items-center justify-center my-4">
                    {[1, 2, 3].map((s, i) => (
                    <React.Fragment key={s}>
                        <div className="flex flex-col items-center">
                            <div
                                className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                                    step > s ? 'bg-green-500 text-white' : step === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                                )}
                            >
                                {step > s ? <Check size={16}/> : s}
                            </div>
                            <span className={cn("text-xs mt-2", step === s ? 'font-bold' : 'text-muted-foreground')}>{steps[i].title.split(' ')[0]}</span>
                        </div>
                        {i < 2 && <div className={cn("flex-1 h-0.5 mx-2", step > s ? 'bg-green-500' : 'bg-muted')}></div>}
                    </React.Fragment>
                    ))}
                </div>
                </>
            )}


            {step === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                {steps[0].fields.map(field => (
                  <FormField
                    key={field.name}
                    control={form.control}
                    name={field.name as keyof FormValues}
                    render={({ field: renderField }) => (
                      <FormItem className={field.name === 'address' ? 'sm:col-span-2' : ''}>
                        <FormLabel>{field.label}</FormLabel>
                        <FormControl>
                          {field.name === 'birthDate' ? (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !renderField.value && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {renderField.value ? format(renderField.value, "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="single"
                                  selected={renderField.value as Date | undefined}
                                  onSelect={renderField.onChange}
                                  initialFocus
                                  captionLayout="dropdown-buttons"
                                  fromYear={1930}
                                  toYear={new Date().getFullYear() - 18}
                                />
                              </PopoverContent>
                            </Popover>
                          ) : (
                            <Input placeholder={field.placeholder} {...renderField} value={renderField.value as string || ''} />
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            )}
            
            {step === 2 && (
              <div className="space-y-8 mt-6">
                 {/* Plan Selection */}
                <FormField
                  control={form.control}
                  name="planId"
                  render={({ field }) => (
                    <FormItem className="space-y-4">
                      <FormLabel className="text-lg font-semibold">Selecciona tu Plan</FormLabel>
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
                                    <Label
                                    htmlFor={plan.id}
                                    className="flex flex-col rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                                    >
                                    <span className="text-xl font-bold font-headline text-primary">{plan.name}</span>
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
                <FormField
                  control={form.control}
                  name="paymentMode"
                  render={({ field }) => (
                    <FormItem className="space-y-4">
                      <FormLabel className="text-lg font-semibold">Modalidad de Pago</FormLabel>
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
                             <Label
                                htmlFor="contado"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer h-full"
                              >
                                Contado
                                <span className="font-bold text-lg">${selectedPlan.paymentModes.contado.price.toFixed(2)}</span>
                              </Label>
                          </FormItem>
                           <FormItem>
                             <FormControl>
                                <RadioGroupItem value="credito" id="credito" className="sr-only" />
                             </FormControl>
                             <Label
                                htmlFor="credito"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer h-full"
                              >
                                Crédito
                                <span className="text-sm text-muted-foreground mt-1">Paga en cuotas</span>
                              </Label>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Installment Options */}
                <AnimatePresence>
                {paymentMode === 'credito' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <FormField
                        control={form.control}
                        name="installmentOption"
                        render={({ field }) => (
                            <FormItem className="space-y-4">
                            <FormLabel className="text-lg font-semibold">Opciones de Cuotas</FormLabel>
                            <FormControl>
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="grid grid-cols-2 gap-4"
                                >
                                    {selectedPlan.paymentModes.credito.installmentOptions.map((opt) => (
                                    <FormItem key={`${opt.count}-${opt.type}`}>
                                        <FormControl>
                                            <RadioGroupItem value={`${opt.count}-${opt.type}`} id={`${opt.count}-${opt.type}`} className="sr-only" />
                                        </FormControl>
                                        <Label
                                        htmlFor={`${opt.count}-${opt.type}`}
                                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                        >
                                        <span className="font-medium">{opt.count} {opt.type}</span>
                                        <span className="font-bold text-lg">${opt.amount.toFixed(2)}</span>
                                        </Label>
                                    </FormItem>
                                    ))}
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </motion.div>
                )}
                </AnimatePresence>

                {/* Payment Method Selection */}
                 <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem className="space-y-4">
                      <FormLabel className="text-lg font-semibold">Método de Pago</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-2 md:grid-cols-4 gap-4"
                        >
                          {PAYMENT_METHODS.map((method) => (
                            <FormItem key={method.id}>
                                <FormControl>
                                    <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                                </FormControl>
                                 <Label
                                    htmlFor={method.id}
                                    className="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                >
                                    <Image src={method.logoSrc} alt={method.label} width={40} height={40} />
                                    <span className="text-sm font-medium">{method.label}</span>
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
            
            {step === 3 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                    <div>
                         <h3 className="font-semibold text-lg mb-2">Detalles de la Afiliación</h3>
                         <div className="bg-muted/30 p-4 rounded-lg space-y-2 text-sm">
                            <div className="flex justify-between"><span>Nombre:</span><span className="font-medium">{form.getValues('fullName')}</span></div>
                            <div className="flex justify-between"><span>Documento:</span><span className="font-medium">{form.getValues('documentId')}</span></div>
                            <div className="flex justify-between"><span>Teléfono:</span><span className="font-medium">{form.getValues('phone')}</span></div>
                            <div className="flex justify-between"><span>Email:</span><span className="font-medium">{form.getValues('email')}</span></div>
                         </div>
                    </div>
                    {renderOrderSummary()}
                </div>
            )}

            {step === 4 && (
                <div className="text-center py-16">
                     <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
                        className="w-24 h-24 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto"
                     >
                        <Check size={60} />
                    </motion.div>
                    <h2 className="text-2xl font-bold mt-6">¡Solicitud Completada!</h2>
                    <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                        Gracias por afiliarte. Recibirás un correo con los próximos pasos. Nuestro equipo se pondrá en contacto contigo a la brevedad.
                    </p>
                    <Button asChild className="mt-8">
                        <a href="/landing">Volver al Inicio</a>
                    </Button>
                </div>
            )}

            </motion.div>
        </AnimatePresence>

        {step < 3 && (
          <div className="flex justify-between mt-8">
            <Button type="button" variant="outline" onClick={handlePrevStep} disabled={step === 1}>
              Anterior
            </Button>
            <Button type="button" onClick={handleNextStep}>
              Siguiente
            </Button>
          </div>
        )}
        {step === 3 && (
            <div className="flex justify-between mt-8">
                <Button type="button" variant="outline" onClick={handlePrevStep} disabled={isSubmitting}>
                Anterior
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Enviando...' : 'Confirmar y Enviar Solicitud'}
                </Button>
            </div>
        )}

      </form>
    </Form>
  )
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
