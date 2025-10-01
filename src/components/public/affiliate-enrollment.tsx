
'use client';
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AFFILIATE_PLANS, PAYMENT_METHODS } from '@/lib/payment-options';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon, CheckCircle, Upload, ArrowRight, User, CreditCard, Banknote } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { submitAffiliateLead } from '@/lib/actions';
import { Label } from '@/components/ui/label';

const formSchema = z.object({
  fullName: z.string().min(3, "El nombre completo es requerido."),
  documentId: z.string().min(6, "El documento de identidad es requerido."),
  birthDate: z.date({ required_error: "La fecha de nacimiento es requerida." }),
  phone: z.string().min(7, "El teléfono es requerido."),
  email: z.string().email("El email no es válido."),
  address: z.string().min(10, "La dirección es requerida."),
  planId: z.enum(['tarjeta-saludable', 'fondo-espiritu-santo']),
  paymentMode: z.enum(['contado', 'credito']),
  paymentMethod: z.string().optional(),
  installmentOption: z.string().optional(),
});

function AffiliateEnrollment() {
    const searchParams = useSearchParams();
    const planId = searchParams.get('plan');
    const initialPlan = AFFILIATE_PLANS.some(p => p.id === planId) ? planId as 'tarjeta-saludable' | 'fondo-espiritu-santo' : 'tarjeta-saludable';
    
    return <AffiliateEnrollmentContent initialPlan={initialPlan} />
}


function AffiliateEnrollmentContent({ initialPlan }: { initialPlan: 'tarjeta-saludable' | 'fondo-espiritu-santo' }) {
  const [step, setStep] = useState(1);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      documentId: "",
      phone: "",
      email: "",
      address: "",
      planId: initialPlan,
      paymentMode: "contado",
      paymentMethod: '',
      installmentOption: '',
    },
  });

  const { watch, trigger, formState: { isSubmitting } } = form;

  const planId = watch('planId');
  const paymentMode = watch('paymentMode');
  const selectedPaymentMethod = watch('paymentMethod');
  const selectedInstallment = watch('installmentOption');

  const selectedPlan = useMemo(() => AFFILIATE_PLANS.find(p => p.id === planId)!, [planId]);

  useEffect(() => {
    form.reset({
      ...form.getValues(),
      planId: initialPlan,
      paymentMode: 'contado',
      paymentMethod: '',
      installmentOption: ''
    });
  }, [initialPlan, form]);


  const nextStep = async () => {
    let fieldsToValidate: (keyof z.infer<typeof formSchema>)[] = [];
    if (step === 1) {
      fieldsToValidate = ['fullName', 'documentId', 'birthDate', 'phone', 'email', 'address', 'planId'];
    } else if (step === 2) {
      fieldsToValidate = ['paymentMode'];
      if(paymentMode === 'credito') fieldsToValidate.push('installmentOption');
      fieldsToValidate.push('paymentMethod');
    }
    
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep(s => s + 1);
    }
  };

  const prevStep = () => setStep(s => s - 1);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      await submitAffiliateLead({
        ...data,
        birthDate: format(data.birthDate, 'yyyy-MM-dd'),
      });
      nextStep();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error al enviar',
        description: 'Hubo un problema al procesar tu afiliación. Por favor, intenta de nuevo.',
      });
    }
  };
  
  const renderOrderSummary = () => {
    if (!selectedPlan) return null;

    let total = 0;
    let summaryText = '';

    if (paymentMode === 'contado') {
        total = selectedPlan.paymentModes.contado.price;
        summaryText = 'Total a pagar (contado)';
    } else if (paymentMode === 'credito' && selectedInstallment) {
        const option = selectedPlan.paymentModes.credito.installmentOptions.find(opt => opt.type === selectedInstallment.split('-')[0] && String(opt.count) === selectedInstallment.split('-')[1]);
        if(option) {
            total = option.amount;
            summaryText = `${option.count} cuotas de`;
        }
    }
    
    return (
        <div className="space-y-2 text-sm mt-6">
            <div className="flex justify-between"><span>Plan</span><span>{selectedPlan.name}</span></div>
            <div className="flex justify-between"><span>Cuota de Afiliación</span><span>${selectedPlan.affiliationFee.toFixed(2)}</span></div>
            {paymentMode === 'credito' && selectedInstallment ? (
                <>
                    <div className="flex justify-between pt-2 border-t font-semibold">
                        <span>{summaryText}</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                </>
            ) : (
                <div className="flex justify-between font-bold pt-2 border-t"><span>Total</span><span>${selectedPlan.paymentModes.contado.price.toFixed(2)}</span></div>
            )}
        </div>
    );
};

  const steps = [
    { title: "Datos Personales", icon: User },
    { title: "Forma de Pago", icon: CreditCard },
    { title: "Confirmación", icon: Banknote }
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-2xl shadow-primary/10 overflow-hidden">
      <CardContent className="p-0">
        <div className="grid md:grid-cols-2">
          {/* Form Side */}
          <div className="p-6 md:p-8">
             <h1 className="text-2xl font-bold text-primary font-headline mb-2">Formulario de Afiliación</h1>
             <div className="flex items-center gap-4 mb-8">
                {steps.map((s, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <div className={cn(
                            "flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold",
                            step > index + 1 ? "bg-green-500 text-white" : "bg-primary text-primary-foreground",
                            step < index + 1 && "bg-muted text-muted-foreground"
                        )}>
                           {step > index + 1 ? <CheckCircle className="h-4 w-4"/> : index + 1}
                        </div>
                        <span className={cn(
                            "text-sm font-semibold",
                             step < index + 1 && "text-muted-foreground"
                        )}>{s.title}</span>
                    </div>
                ))}
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                  >
                    {step === 1 && (
                      <div className="space-y-4">
                        <FormField control={form.control} name="fullName" render={({ field }) => (<FormItem><FormLabel>Nombre Completo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <div className="grid sm:grid-cols-2 gap-4">
                          <FormField control={form.control} name="documentId" render={({ field }) => (<FormItem><FormLabel>Cédula / Pasaporte</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                          <FormField control={form.control} name="birthDate" render={({ field }) => (<FormItem><FormLabel>Fecha de Nacimiento</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal",!field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, "PPP") : <span>Elige una fecha</span>}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) =>date > new Date() || date < new Date("1900-01-01")} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                        <FormField control={form.control} name="address" render={({ field }) => (<FormItem><FormLabel>Dirección</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />

                      </div>
                    )}
                    {step === 2 && (
                         <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Modalidad de Pago</h3>
                                <FormField
                                    control={form.control}
                                    name="paymentMode"
                                    render={({ field }) => (
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
                                                    <span className="text-xs mt-1">Paga en cuotas</span>
                                                </Label>
                                            </FormItem>
                                        </RadioGroup>
                                    )}
                                />
                            </div>

                            {paymentMode === 'credito' && (
                                <FormField
                                    control={form.control}
                                    name="installmentOption"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Opciones de Cuotas</FormLabel>
                                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid sm:grid-cols-2 gap-4">
                                                {selectedPlan.paymentModes.credito.installmentOptions.map(opt => (
                                                    <FormItem key={`${opt.type}-${opt.count}`}>
                                                         <FormControl>
                                                            <RadioGroupItem value={`${opt.type}-${opt.count}`} id={`${opt.type}-${opt.count}`} className="sr-only" />
                                                        </FormControl>
                                                         <Label htmlFor={`${opt.type}-${opt.count}`} className="flex items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                                            <span>{opt.count} {opt.type === 'mensual' ? 'meses' : 'cuotas'}</span>
                                                            <span className="font-semibold">${opt.amount.toFixed(2)}</span>
                                                        </Label>
                                                    </FormItem>
                                                ))}
                                            </RadioGroup>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                            
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Método de Pago</h3>
                                <FormField
                                    control={form.control}
                                    name="paymentMethod"
                                    render={({ field }) => (
                                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                            {PAYMENT_METHODS.map((method) => (
                                                <FormItem key={method.id}>
                                                    <FormControl>
                                                        <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                                                    </FormControl>
                                                    <Label htmlFor={method.id} className="flex flex-col items-center justify-center text-center p-2 rounded-md border-2 border-muted bg-popover hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer h-24">
                                                        <Image src={method.logoSrc} alt={method.label} width={40} height={40} />
                                                        <span className="text-xs font-medium mt-1">{method.label}</span>
                                                    </Label>
                                                </FormItem>
                                            ))}
                                        </RadioGroup>
                                    )}
                                />
                            </div>
                        </div>
                    )}
                    {step === 3 && (
                      <div className="text-center p-8 flex flex-col items-center">
                          <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                          <h2 className="text-2xl font-bold mb-2">¡Afiliación Exitosa!</h2>
                          <p className="text-muted-foreground">
                              Hemos recibido tus datos. Pronto nos pondremos en contacto contigo para finalizar el proceso.
                          </p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                <div className="flex justify-between items-center pt-4">
                  {step > 1 && step < 3 && (
                    <Button type="button" variant="outline" onClick={prevStep}>
                      Anterior
                    </Button>
                  )}
                  <div className="flex-grow"></div>
                  {step < 2 && (
                    <Button type="button" onClick={nextStep}>
                      Siguiente <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                   {step === 2 && (
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Procesando...' : 'Confirmar y Pagar'}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </div>

          {/* Info Side */}
          <div className="bg-muted/30 p-6 md:p-8 flex flex-col">
              <h2 className="text-xl font-bold mb-4">Resumen de tu Plan</h2>
              <FormField
                control={form.control}
                name="planId"
                render={({ field }) => (
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 gap-4 mb-6">
                       {AFFILIATE_PLANS.map(plan => (
                            <FormItem key={plan.id}>
                                <FormControl>
                                    <RadioGroupItem value={plan.id} id={plan.id} className="sr-only" />
                                </FormControl>
                                <Label htmlFor={plan.id} className="block p-4 rounded-lg border-2 border-muted bg-popover hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                    <h4 className="font-semibold">{plan.name}</h4>
                                    <p className="text-xs text-muted-foreground">{plan.subtitle}</p>
                                </Label>
                            </FormItem>
                       ))}
                    </RadioGroup>
                )}
              />
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                {selectedPlan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                        <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500 shrink-0" />
                        <span>{feature}</span>
                    </li>
                ))}
              </ul>
              {renderOrderSummary()}

             {step === 2 && selectedPaymentMethod && (
                <div className="mt-auto pt-6 border-t">
                    <h3 className="font-semibold mb-2">Instrucciones de Pago</h3>
                    <div className="text-sm text-muted-foreground bg-popover/50 p-3 rounded-md">
                        <p><strong>Método:</strong> {PAYMENT_METHODS.find(p => p.id === selectedPaymentMethod)?.label}</p>
                        <p><strong>Detalles:</strong> {PAYMENT_METHODS.find(p => p.id === selectedPaymentMethod)?.accountInfo}</p>
                        <p className='mt-2'>Una vez realizado el pago, por favor envía el comprobante a nuestro departamento de administración.</p>
                    </div>
                </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default AffiliateEnrollment;
