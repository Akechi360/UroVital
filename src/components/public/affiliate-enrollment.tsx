'use client';
import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AFFILIATE_PLANS, PAYMENT_METHODS } from '@/lib/payment-options';
import { Stethoscope, User, CreditCard, ShieldCheck, Mail, Phone, Calendar as CalendarIcon, Check } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Image from 'next/image';
import { Textarea } from '../ui/textarea';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { submitAffiliateLead } from '@/lib/actions';
import type { AffiliateLead } from '@/lib/types';
import { Label } from '../ui/label';

const MySwal = withReactContent(Swal);

const formSchema = z.object({
  fullName: z.string().min(3, 'El nombre completo es requerido.'),
  documentId: z.string().min(6, 'La cédula de identidad es requerida.'),
  birthDate: z.date({ required_error: 'La fecha de nacimiento es requerida.' }),
  phone: z.string().min(7, 'El número de teléfono es requerido.'),
  email: z.string().email('El correo electrónico no es válido.'),
  address: z.string().min(10, "La dirección debe tener al menos 10 caracteres."),
  planId: z.enum(['tarjeta-saludable', 'fondo-espiritu-santo'], {
    required_error: 'Debes seleccionar un plan.',
  }),
  paymentMode: z.enum(['contado', 'credito'], { required_error: 'Selecciona una modalidad de pago.' }),
  installmentOption: z.string().optional(),
  paymentMethod: z.string({ required_error: 'Selecciona un método de pago.' }),
  paymentProof: z.instanceof(File).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function AffiliateEnrollment() {
  return <AffiliateEnrollmentContent />;
}

function AffiliateEnrollmentContent() {
  const searchParams = useSearchParams();
  const initialPlan = searchParams.get('plan');
  const [step, setStep] = useState(1);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      documentId: '',
      phone: '',
      email: '',
      address: '',
      planId: initialPlan === 'tarjeta-saludable' || initialPlan === 'fondo-espiritu-santo' ? initialPlan : undefined,
      paymentMode: undefined,
      paymentMethod: '',
      installmentOption: '',
    },
  });

  const { watch, handleSubmit, control } = form;
  const selectedPlanId = watch('planId');
  const selectedPaymentMode = watch('paymentMode');
  const selectedInstallmentOption = watch('installmentOption');

  const selectedPlan = useMemo(
    () => AFFILIATE_PLANS.find((p) => p.id === selectedPlanId),
    [selectedPlanId]
  );
  
  const selectedPaymentMethod = useMemo(
    () => PAYMENT_METHODS.find(pm => pm.id === watch('paymentMethod')),
    [watch('paymentMethod')]
  );

  const renderOrderSummary = () => {
    if (!selectedPlan) return null;

    let total;
    let summaryText;

    if (selectedPaymentMode === 'contado') {
      total = selectedPlan.paymentModes.contado.price;
      summaryText = `Pago único de $${total.toFixed(2)}`;
    } else if (selectedPaymentMode === 'credito' && selectedInstallmentOption) {
      const option = selectedPlan.paymentModes.credito.installmentOptions.find(opt => opt.type === selectedInstallmentOption);
      if (option) {
        total = option.count * option.amount;
        summaryText = `${option.count} cuotas de $${option.amount.toFixed(2)}`;
      }
    }

    return (
      <div className="space-y-2 text-sm">
        <h4 className="font-semibold text-base">Resumen de la Orden</h4>
        <div className="flex justify-between"><span>Plan</span><span className="font-medium">{selectedPlan.name}</span></div>
        <div className="flex justify-between"><span>Modalidad</span><span className="font-medium capitalize">{selectedPaymentMode}</span></div>
        {summaryText && <div className="flex justify-between"><span>Detalle</span><span className="font-medium">{summaryText}</span></div>}
        <div className="flex justify-between"><span>Afiliación</span><span className="font-medium">${selectedPlan.affiliationFee.toFixed(2)}</span></div>
        <div className="border-t border-dashed my-2"></div>
        {total !== undefined ? (
          <>
            <div className="flex justify-between font-bold text-base">
              <span>Total a Pagar</span>
              <span>${total.toFixed(2)}</span>
            </div>
            {selectedPlan.paymentModes.credito.installmentOptions.find(opt => opt.type === selectedInstallmentOption) && (
                 <p className="text-xs text-muted-foreground text-right">
                    Total: {selectedInstallmentOption === 'mensual' ? '12 pagos mensuales' : `${selectedInstallmentOption} cuotas`}
                </p>
            )}
          </>
        ) : (
            <div className="flex justify-between font-bold"><span>Total</span><span>${selectedPlan.paymentModes.contado.price.toFixed(2)}</span></div>
        )}
      </div>
    );
  };

  const onSubmit = async (data: FormValues) => {
    const leadData: AffiliateLead = {
      fullName: data.fullName,
      documentId: data.documentId,
      birthDate: data.birthDate.toISOString(),
      phone: data.phone,
      email: data.email,
      address: data.address,
      planId: data.planId,
      paymentMode: data.paymentMode,
      paymentMethod: data.paymentMethod,
    };

    if (data.paymentMode === 'credito' && data.installmentOption && selectedPlan) {
      const option = selectedPlan.paymentModes.credito.installmentOptions.find(opt => opt.type === data.installmentOption);
      if (option) {
        leadData.schedule = {
          upfront: 0,
          installments: option.count,
          installmentValue: option.amount,
          frequencyDays: option.type === 'mensual' ? 30 : 90, // Example logic
        };
      }
    }
    
    try {
        await submitAffiliateLead(leadData);
        setStep(4);
    } catch (error) {
        const isDarkMode = document.documentElement.classList.contains('dark');
        MySwal.fire({
          icon: 'error',
          title: 'Error al enviar',
          text: 'Hubo un problema al procesar tu afiliación. Por favor, intenta de nuevo.',
          background: isDarkMode ? '#1e293b' : '#ffffff',
          color: isDarkMode ? '#f1f5f9' : '#0f172a',
        });
    }
  };

  const steps = [
    { num: 1, icon: User, label: 'Datos Personales' },
    { num: 2, icon: CreditCard, label: 'Pago' },
    { num: 3, icon: ShieldCheck, label: 'Confirmar' },
  ];

  const CurrentIcon = steps.find(s => s.num === step)?.icon || User;
  
  const FormTitle = () => {
    switch (step) {
      case 1: return 'Completa tus datos personales';
      case 2: return 'Selecciona tu método de pago';
      case 3: return 'Confirma tu afiliación';
      case 4: return '¡Afiliación Exitosa!';
      default: return 'Formulario de Afiliación';
    }
  };

  return (
    <Card className="w-full max-w-4xl shadow-2xl shadow-primary/10 border-border/20 bg-card/50 backdrop-blur-lg">
      <CardHeader>
        <div className="flex justify-center mb-4">
          <Stethoscope className="h-10 w-10 text-primary" />
        </div>
        <CardTitle className="text-center text-3xl font-bold font-headline">{FormTitle()}</CardTitle>
        {step < 4 && (
             <CardDescription className="text-center">
                Estás a punto de unirte a la familia UroVital.
             </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {step < 4 && (
          <div className="w-full max-w-sm mx-auto mb-8">
            <div className="relative">
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2" />
              <div className="relative flex justify-between">
                {steps.map(({ num, icon: Icon, label }) => (
                  <div key={num} className="flex flex-col items-center gap-2 z-10">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300",
                      step > num ? "bg-green-500 text-white" : step === num ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      {step > num ? <Check /> : <Icon className="h-5 w-5" />}
                    </div>
                     <span className={cn("text-xs font-semibold", step >= num ? "text-primary" : "text-muted-foreground")}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {step === 1 && (
                  <>
                    <FormField control={control} name="fullName" render={({ field }) => (
                      <FormItem className="md:col-span-2"><FormLabel>Nombre Completo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={control} name="documentId" render={({ field }) => (
                      <FormItem><FormLabel>Cédula de Identidad</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={control} name="birthDate" render={({ field }) => (
                        <FormItem className="flex flex-col"><FormLabel>Fecha de Nacimiento</FormLabel>
                            <Popover><PopoverTrigger asChild>
                                <FormControl><Button variant="outline" className={cn(!field.value && "text-muted-foreground")}>
                                    {field.value ? format(field.value, "PPP", { locale: es }) : <span>Elige una fecha</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button></FormControl>
                            </PopoverTrigger><PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} captionLayout="dropdown-buttons" fromYear={1930} toYear={new Date().getFullYear()} initialFocus />
                            </PopoverContent></Popover><FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={control} name="phone" render={({ field }) => (
                      <FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={control} name="email" render={({ field }) => (
                      <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={control} name="address" render={({ field }) => (
                        <FormItem className="md:col-span-2"><FormLabel>Dirección</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </>
                )}
                {step === 2 && (
                  <>
                    <FormField control={control} name="planId" render={({ field }) => (
                      <FormItem className="md:col-span-2"><FormLabel>Plan de Afiliación</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Selecciona un plan" /></SelectTrigger></FormControl>
                        <SelectContent>{AFFILIATE_PLANS.map(plan => <SelectItem key={plan.id} value={plan.id}>{plan.name}</SelectItem>)}</SelectContent>
                      </Select><FormMessage /></FormItem>
                    )} />
                    {selectedPlan && (
                      <>
                        <FormField control={control} name="paymentMode" render={({ field }) => (
                          <FormItem className="space-y-3 md:col-span-2"><FormLabel>Modalidad de Pago</FormLabel><FormControl>
                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 gap-4">
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="contado" id="contado" className="sr-only" />
                                </FormControl>
                                <Label htmlFor="contado" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                  Contado
                                  <span className="font-bold">${selectedPlan.paymentModes.contado.price.toFixed(2)}</span>
                                </Label>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="credito" id="credito" className="sr-only" />
                                </FormControl>
                                <Label htmlFor="credito" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                  Crédito
                                  <span className="text-xs text-muted-foreground mt-1">Paga en cuotas</span>
                                </Label>
                              </FormItem>
                            </RadioGroup>
                          </FormControl><FormMessage /></FormItem>
                        )} />
                        {selectedPaymentMode === 'credito' && (
                           <FormField control={control} name="installmentOption" render={({ field }) => (
                            <FormItem className="md:col-span-2"><FormLabel>Opciones de Cuotas</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Selecciona una opción" /></SelectTrigger></FormControl>
                                <SelectContent>{selectedPlan.paymentModes.credito.installmentOptions.map(opt => (
                                    <SelectItem key={opt.type} value={opt.type}>
                                        {opt.count} {opt.type === 'mensual' ? 'pagos mensuales' : 'cuotas'} de ${opt.amount.toFixed(2)}
                                    </SelectItem>
                                ))}</SelectContent>
                            </Select><FormMessage /></FormItem>
                        )} />
                        )}
                         <FormField control={control} name="paymentMethod" render={({ field }) => (
                            <FormItem className="md:col-span-2"><FormLabel>Método de Pago</FormLabel><FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {PAYMENT_METHODS.map(method => (
                                    <FormItem key={method.id}>
                                        <FormControl>
                                            <RadioGroupItem value={method.id} id={method.id} className="sr-only"/>
                                        </FormControl>
                                         <Label htmlFor={method.id} className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer h-28">
                                            <Image src={method.logoSrc} alt={method.label} width={40} height={40} className="mb-2"/>
                                            <span className="text-xs text-center font-medium">{method.label}</span>
                                        </Label>
                                    </FormItem>
                                ))}
                                </RadioGroup>
                            </FormControl><FormMessage /></FormItem>
                         )} />
                      </>
                    )}
                  </>
                )}

                {step === 3 && (
                    <>
                        <div className="md:col-span-2 space-y-4">
                            {renderOrderSummary()}
                             {selectedPaymentMethod && (
                                <div className="p-4 rounded-md bg-muted/50 border">
                                    <h4 className="font-semibold mb-2">Instrucciones de Pago</h4>
                                    <p className="text-sm">Has seleccionado <span className='font-bold'>{selectedPaymentMethod.label}</span>.</p>
                                    <p className="text-sm text-muted-foreground">{selectedPaymentMethod.description}</p>
                                    <div className="mt-2 p-2 bg-background rounded-md text-sm font-mono text-center">
                                        {selectedPaymentMethod.accountInfo}
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {step === 4 && (
                    <div className="md:col-span-2 text-center flex flex-col items-center">
                        <motion.div initial={{scale:0}} animate={{scale:1}} transition={{delay:0.2, type: 'spring', stiffness: 260, damping: 20}}>
                            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/50 text-green-500 rounded-full flex items-center justify-center mx-auto">
                                <Check className="h-10 w-10" />
                            </div>
                        </motion.div>
                        <p className="mt-4 text-muted-foreground">
                            Tu solicitud de afiliación ha sido recibida. Pronto serás contactado por nuestro equipo.
                        </p>
                        <Button asChild className="mt-6">
                            <a href="/landing">Volver al Inicio</a>
                        </Button>
                    </div>
                )}
                
                {step < 4 && (
                    <div className="md:col-span-2 flex justify-between mt-6">
                    <Button type="button" variant="outline" onClick={() => setStep(step - 1)} disabled={step === 1}>
                        Anterior
                    </Button>
                    {step < 3 ? (
                        <Button type="button" onClick={() => setStep(step + 1)}>
                            Siguiente
                        </Button>
                    ) : (
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? 'Procesando...' : 'Confirmar y Enviar'}
                        </Button>
                    )}
                    </div>
                )}

              </form>
            </Form>
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
