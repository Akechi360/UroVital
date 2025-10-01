
'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { AFFILIATE_PLANS, PAYMENT_METHODS } from '@/lib/payment-options';
import { submitAffiliateLead } from '@/lib/actions';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

const MySwal = withReactContent(Swal);

const formSchema = z.object({
  fullName: z.string().min(3, "El nombre completo es requerido."),
  documentId: z.string().min(6, "La cédula o pasaporte es requerido."),
  birthDate: z.date({ required_error: "La fecha de nacimiento es requerida." }),
  phone: z.string().min(7, "El teléfono es requerido."),
  email: z.string().email("El correo electrónico no es válido."),
  address: z.string().min(10, "La dirección es requerida."),
  planId: z.enum(['tarjeta-saludable', 'fondo-espiritu-santo'], { required_error: "Debe seleccionar un plan." }),
  paymentMode: z.enum(['contado', 'credito'], { required_error: "Debe seleccionar una modalidad de pago." }),
  paymentInstallment: z.string().optional(),
  paymentMethod: z.string({ required_error: "Debe seleccionar un método de pago." }),
});

type FormData = z.infer<typeof formSchema>;

function AffiliateEnrollment() {
  const searchParams = useSearchParams();
  const initialPlanId = searchParams.get('plan') as 'tarjeta-saludable' | 'fondo-espiritu-santo' | null;

  return (
    <Card className="w-full max-w-4xl bg-card/60 backdrop-blur-sm shadow-2xl shadow-primary/10">
      <AffiliateEnrollmentContent initialPlanId={initialPlanId} />
    </Card>
  );
}

function AffiliateEnrollmentContent({ initialPlanId }: { initialPlanId: 'tarjeta-saludable' | 'fondo-espiritu-santo' | null }) {
  const [step, setStep] = useState(1);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      planId: initialPlanId || undefined,
      paymentMode: 'contado',
    },
  });

  const { formState: { isSubmitting }, watch } = form;

  const planId = watch('planId');
  const paymentMode = watch('paymentMode');

  const selectedPlan = useMemo(() => AFFILIATE_PLANS.find(p => p.id === planId), [planId]);
  const selectedPaymentMethod = useMemo(() => PAYMENT_METHODS.find(pm => pm.id === watch('paymentMethod')), [watch('paymentMethod')]);


  const onSubmit = async (data: FormData) => {
    try {
      // Format data for submission
      const leadData = {
        ...data,
        birthDate: format(data.birthDate, 'yyyy-MM-dd'),
      }
      await submitAffiliateLead(leadData);

      const isDarkMode = document.documentElement.classList.contains('dark');
      MySwal.fire({
        title: '¡Afiliación exitosa!',
        text: 'Hemos recibido tus datos. Pronto nos pondremos en contacto contigo.',
        icon: 'success',
        background: isDarkMode ? '#1e293b' : '#ffffff',
        color: isDarkMode ? '#f1f5f9' : '#0f172a',
        confirmButtonColor: '#4f46e5',
      });
      form.reset();
      setStep(1);

    } catch (error) {
      // Handle submission error
      console.error(error);
      const isDarkMode = document.documentElement.classList.contains('dark');
      MySwal.fire({
        title: 'Error',
        text: 'Hubo un problema al enviar tus datos. Por favor, inténtalo de nuevo.',
        icon: 'error',
        background: isDarkMode ? '#1e293b' : '#ffffff',
        color: isDarkMode ? '#f1f5f9' : '#0f172a',
        confirmButtonColor: '#ef4444',
      });
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof FormData)[] = [];
    if (step === 1) {
      fieldsToValidate = ['planId', 'paymentMode', 'paymentInstallment'];
    } else if (step === 2) {
      fieldsToValidate = ['fullName', 'documentId', 'birthDate', 'phone', 'email', 'address', 'paymentMethod'];
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setStep(s => s + 1);
    }
  };

  const prevStep = () => setStep(s => s - 1);
  
  const renderOrderSummary = () => {
    if (!selectedPlan) return null;

    const selectedInstallment = form.getValues('paymentInstallment')
        ? selectedPlan.paymentModes.credito?.installmentOptions.find(opt => String(opt.count) === form.getValues('paymentInstallment'))
        : undefined;

    return (
        <div className="mt-6 space-y-2 text-sm">
            <h4 className="font-semibold">Resumen de Orden</h4>
            <div className="flex justify-between"><span>Plan</span><span>{selectedPlan.name}</span></div>
            {selectedPlan.affiliationFee > 0 ? (
                <div className="flex justify-between"><span>Cuota de Afiliación</span><span>${selectedPlan.affiliationFee.toFixed(2)}</span></div>
            ) : (
                 <div className="flex justify-between"><span>Cuota de Afiliación</span><span>Gratis</span></div>
            )}
            
            {selectedInstallment ? (
                <>
                    <div className="flex justify-between"><span>Modalidad</span><span>{selectedInstallment.count} cuotas</span></div>
                    <div className="flex justify-between font-bold"><span>Monto por cuota</span><span>${selectedInstallment.amount.toFixed(2)}</span></div>
                </>
            ) : (
                <div className="flex justify-between font-bold"><span>Total</span><span>${selectedPlan.paymentModes.contado.price.toFixed(2)}</span></div>
            )}
        </div>
    );
};


  return (
    <>
      <CardHeader>
        <CardTitle className="text-2xl font-bold font-headline text-center">
            Formulario de Afiliación
        </CardTitle>
        <div className="flex justify-center items-center mt-4">
            {/* Progress Bar */}
        </div>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                {step === 1 && (
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="planId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Selecciona tu Plan</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger><SelectValue placeholder="Elige un plan..." /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {AFFILIATE_PLANS.map(plan => (
                                <SelectItem key={plan.id} value={plan.id}>{plan.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {selectedPlan && (
                      <FormField
                        control={form.control}
                        name="paymentMode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Modalidad de Pago</FormLabel>
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
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {paymentMode === 'credito' && selectedPlan?.paymentModes.credito && (
                      <FormField
                        control={form.control}
                        name="paymentInstallment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Elige tus Cuotas</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger><SelectValue placeholder="Selecciona una opción de cuotas..." /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {selectedPlan.paymentModes.credito!.installmentOptions.map(opt => (
                                        <SelectItem key={opt.count} value={String(opt.count)}>{opt.count} cuotas de ${opt.amount.toFixed(2)}</SelectItem>
                                    ))}
                                </SelectContent>
                             </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                )}
                {step === 2 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="fullName" render={({ field }) => (
                      <FormItem><FormLabel>Nombre Completo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="documentId" render={({ field }) => (
                      <FormItem><FormLabel>Cédula / Pasaporte</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="birthDate" render={({ field }) => (
                      <FormItem><FormLabel>Fecha de Nacimiento</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild><FormControl><Button variant="outline" className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP", { locale: es }) : <span>Selecciona una fecha</span>}</Button></FormControl></PopoverTrigger>
                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} captionLayout="dropdown-buttons" fromYear={1930} toYear={new Date().getFullYear()} initialFocus /></PopoverContent>
                        </Popover>
                      <FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem className="md:col-span-2"><FormLabel>Correo Electrónico</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="address" render={({ field }) => (
                      <FormItem className="md:col-span-2"><FormLabel>Dirección</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                )}
                 {step === 3 && (
                    <div className="space-y-6">
                        <FormField
                            control={form.control}
                            name="paymentMethod"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Método de Pago</FormLabel>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="grid grid-cols-2 md:grid-cols-3 gap-4"
                                    >
                                        {PAYMENT_METHODS.map(method => {
                                            const Icon = method.logoSrc ? (
                                                <Image src={method.logoSrc} alt={method.label} width={method.id === 'usdt' ? 24 : 80} height={24} className="object-contain" />
                                            ) : null;
                                            return (
                                                <FormItem key={method.id}>
                                                    <FormControl>
                                                        <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                                                    </FormControl>
                                                    <Label htmlFor={method.id} className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer h-28">
                                                        {Icon}
                                                        <span className="mt-2 text-center text-sm">{method.label}</span>
                                                    </Label>
                                                </FormItem>
                                            )
                                        })}
                                    </RadioGroup>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                       {renderOrderSummary()}

                        {step === 3 && selectedPaymentMethod && (
                            <Card className="bg-blue-50 dark:bg-blue-900/20 border-primary/20">
                                <CardHeader>
                                    <CardTitle className="text-lg">Instrucciones de Pago</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm">Para completar tu afiliación, por favor realiza el pago usando la siguiente información y reporta tu comprobante:</p>
                                    <div className="mt-4 p-3 bg-background rounded-md text-sm">
                                        <p><strong>Método:</strong> {selectedPaymentMethod.label}</p>
                                        <p><strong>Información:</strong> {selectedPaymentMethod.accountInfo}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                 )}
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-between items-center pt-4">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={prevStep}>Atrás</Button>
              )}
              <div className="flex-grow"></div>
              {step < 3 && (
                <Button type="button" onClick={nextStep} disabled={!planId}>
                  Siguiente <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
              {step === 3 && (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      Finalizar Afiliación <Check className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </>
  );
}

export { AffiliateEnrollment };

    