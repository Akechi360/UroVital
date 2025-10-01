
'use client';
import { useState, useMemo, useEffect, forwardRef, type ElementRef, type ComponentProps } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AnimatePresence, motion } from 'framer-motion';

import { Stethoscope, User, Lock, Mail, Phone, Calendar as CalendarIcon, MapPin, Check, CreditCard, ChevronLeft, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { AFFILIATE_PLANS, PAYMENT_METHODS } from '@/lib/payment-options';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { submitAffiliateLead } from '@/lib/actions';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const stepVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50, position: 'absolute' },
};

const FormSchema = z.object({
  fullName: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
  documentId: z.string().regex(/^[0-9]+$/, "Debe ser solo números").min(6, "Debe tener al menos 6 dígitos."),
  birthDate: z.date({ required_error: "La fecha de nacimiento es requerida." }),
  phone: z.string().min(7, "El teléfono debe tener al menos 7 caracteres."),
  email: z.string().email("Email inválido."),
  address: z.string().min(10, "La dirección debe tener al menos 10 caracteres."),
  planId: z.enum(['tarjeta-saludable', 'fondo-espiritu-santo']),
  paymentMode: z.enum(['contado', 'credito']),
  installmentOption: z.string().optional(),
  paymentMethod: z.string({ required_error: "Debe seleccionar un método de pago." }),
});

type FormValues = z.infer<typeof FormSchema>;

const StepIndicator = ({ currentStep, totalSteps }: { currentStep: number, totalSteps: number }) => (
    <div className="flex items-center gap-2 mb-4">
        {Array.from({ length: totalSteps }).map((_, index) => (
            <motion.div
                key={index}
                initial={false}
                animate={{ scale: currentStep === index + 1 ? 1.2 : 1 }}
                className={cn(
                    "h-2 rounded-full transition-colors",
                    currentStep >= index + 1 ? "bg-primary" : "bg-muted",
                    currentStep === index + 1 ? "flex-1" : "w-8"
                )}
            />
        ))}
    </div>
);

const AffiliateEnrollmentContent = forwardRef<ElementRef<typeof Card>, ComponentProps<typeof Card>>((props, ref) => {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      planId: searchParams.get('plan') === 'fondo-espiritu-santo' ? 'fondo-espiritu-santo' : 'tarjeta-saludable',
      paymentMode: 'contado',
    }
  });

  const { watch, trigger } = form;
  const planId = watch('planId');
  const paymentMode = watch('paymentMode');
  const selectedPaymentMethodId = watch('paymentMethod');

  const selectedPlan = useMemo(() => AFFILIATE_PLANS.find(p => p.id === planId)!, [planId]);
  const selectedPaymentMethod = useMemo(() => PAYMENT_METHODS.find(m => m.id === selectedPaymentMethodId), [selectedPaymentMethodId]);
  
  const handleNext = async () => {
    let fields: (keyof FormValues)[] = [];
    if (step === 1) {
      fields = ['fullName', 'documentId', 'birthDate', 'phone', 'email', 'address'];
    } else if (step === 2) {
      fields = ['planId', 'paymentMode', 'installmentOption', 'paymentMethod'];
    }
    
    const isValid = await trigger(fields);
    if (isValid) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => setStep(prev => prev - 1);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
     try {
        await submitAffiliateLead({
            ...data,
            birthDate: data.birthDate.toISOString(),
        });
        const isDarkMode = document.documentElement.classList.contains('dark');
        MySwal.fire({
            title: '¡Solicitud Enviada!',
            text: 'Gracias por afiliarte. Nuestro equipo se pondrá en contacto contigo pronto.',
            icon: 'success',
            background: isDarkMode ? '#1e293b' : '#ffffff',
            color: isDarkMode ? '#f1f5f9' : '#0f172a',
            confirmButtonColor: '#4f46e5',
        });
        form.reset();
        setStep(1);
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Error al enviar',
            description: 'Hubo un problema al procesar tu solicitud. Por favor, inténtalo de nuevo.',
        });
    }
  };

  const renderOrderSummary = () => {
    const installmentKey = form.watch('installmentOption');
    const selectedInstallment = paymentMode === 'credito' 
        ? selectedPlan.paymentModes.credito?.installmentOptions.find(opt => `${opt.type}-${opt.count}` === installmentKey)
        : null;

    return (
        <div className="p-4 bg-muted/50 rounded-lg space-y-2 text-sm mt-4">
            <h4 className="font-semibold text-base">Resumen del Plan</h4>
            <div className="flex justify-between"><span>Plan:</span><span className="font-medium">{selectedPlan.name}</span></div>
            {selectedPlan.affiliationFee !== undefined && (
                <div className="flex justify-between"><span>Cuota de Afiliación:</span><span className="font-medium">${selectedPlan.affiliationFee.toFixed(2)}</span></div>
            )}
            <div className="border-t my-2"></div>
             {paymentMode === 'credito' && selectedInstallment ? (
                    <>
                        <div className="flex justify-between"><span>Modalidad:</span><span className="font-medium">Crédito</span></div>
                        <div className="flex justify-between font-bold"><span>Total a pagar hoy:</span><span>${selectedInstallment.amount.toFixed(2)}</span></div>
                        <p className="text-xs text-muted-foreground text-right">{selectedInstallment.count} cuotas de ${selectedInstallment.amount.toFixed(2)}</p>
                    </>
                ) : (
                    <div className="flex justify-between font-bold"><span>Total</span><span>${selectedPlan.paymentModes.contado.price.toFixed(2)}</span></div>
                )}
        </div>
    );
  };


  return (
    <Card ref={ref} className="w-full max-w-4xl overflow-hidden" {...props}>
      <CardHeader className='text-center'>
        <CardTitle className="text-2xl font-bold">Formulario de Afiliación</CardTitle>
        <CardDescription>Completa los pasos para unirte a UroVital.</CardDescription>
      </CardHeader>
      <CardContent>
         <StepIndicator currentStep={step} totalSteps={3} />
         <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        variants={stepVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                    >
                      {step === 1 && (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField name="fullName" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>Nombre Completo</FormLabel><FormControl><Input Icon={User} placeholder="Tu nombre" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField name="documentId" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>Cédula / Documento</FormLabel><FormControl><Input Icon={User} placeholder="Tu documento de identidad" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField name="birthDate" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>Fecha de Nacimiento</FormLabel>
                                <Popover><PopoverTrigger asChild><FormControl>
                                    <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                        {field.value ? format(field.value, "PPP") : <span>Elige una fecha</span>}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start">
                                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} captionLayout="dropdown-buttons" fromYear={1930} toYear={new Date().getFullYear()} initialFocus />
                                </PopoverContent></Popover><FormMessage />
                                </FormItem>
                            )} />
                             <FormField name="phone" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input Icon={Phone} placeholder="Tu número de teléfono" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField name="email" control={form.control} render={({ field }) => (
                                <FormItem className="md:col-span-2"><FormLabel>Email</FormLabel><FormControl><Input Icon={Mail} type="email" placeholder="Tu correo electrónico" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField name="address" control={form.control} render={({ field }) => (
                                <FormItem className="md:col-span-2"><FormLabel>Dirección</FormLabel><FormControl><Textarea placeholder="Tu dirección completa" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                         </div>
                      )}
                      {step === 2 && (
                        <div>
                            <FormField name="planId" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>Selecciona tu Plan</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Elige un plan" /></SelectTrigger></FormControl>
                                <SelectContent>{AFFILIATE_PLANS.map(plan => <SelectItem key={plan.id} value={plan.id}>{plan.name}</SelectItem>)}</SelectContent>
                                </Select><FormMessage /></FormItem>
                            )} />
                            {selectedPlan && (
                                <Card className="mt-4 bg-muted/30">
                                    <CardContent className="p-4">
                                        <h3 className="font-semibold">{selectedPlan.subtitle}</h3>
                                        <p className="text-sm text-muted-foreground">{selectedPlan.paymentModes.credito ? selectedPlan.paymentModes.contado.priceSummary : ""}</p>
                                    </CardContent>
                                </Card>
                            )}
                            <FormField name="paymentMode" control={form.control} render={({ field }) => (
                                <FormItem className="mt-4"><FormLabel>Modalidad de Pago</FormLabel><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 gap-4">
                                    <Label className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                        <RadioGroupItem value="contado" className="sr-only" /><span>Contado</span>
                                        <span className="font-normal text-sm text-muted-foreground">${selectedPlan.paymentModes.contado.price.toFixed(2)}</span>
                                    </Label>
                                    <Label className={cn("flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary", !selectedPlan.paymentModes.credito && "opacity-50 cursor-not-allowed")}>
                                        <RadioGroupItem value="credito" className="sr-only" disabled={!selectedPlan.paymentModes.credito} /><span>Crédito</span>
                                        <span className="font-normal text-sm text-muted-foreground">Paga en cuotas</span>
                                    </Label>
                                </RadioGroup><FormMessage /></FormItem>
                            )} />
                            {paymentMode === 'credito' && (
                                <FormField name="installmentOption" control={form.control} render={({ field }) => (
                                    <FormItem className="mt-4"><FormLabel>Opciones de Cuotas</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Elige una opción de cuotas" /></SelectTrigger></FormControl>
                                        <SelectContent>{selectedPlan.paymentModes.credito?.installmentOptions.map(opt => (
                                            <SelectItem key={`${opt.type}-${opt.count}`} value={`${opt.type}-${opt.count}`}>
                                                {opt.count} {opt.type === 'cuotas' ? `cuotas de $${opt.amount.toFixed(2)}` : `pagos mensuales de $${opt.amount.toFixed(2)}`}
                                            </SelectItem>
                                        ))}</SelectContent>
                                    </Select><FormMessage /></FormItem>
                                )} />
                            )}
                            {renderOrderSummary()}
                        </div>
                      )}
                      {step === 3 && (
                         <div>
                            <h3 className="text-lg font-semibold">Confirmación Final</h3>
                            {renderOrderSummary()}
                             <FormField name="paymentMethod" control={form.control} render={({ field }) => (
                                <FormItem className="mt-4"><FormLabel>Selecciona tu Método de Pago</FormLabel><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {PAYMENT_METHODS.map(method => (
                                    <Label key={method.id} className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                        <RadioGroupItem value={method.id} className="sr-only" />
                                        <Building className="mb-2 h-6 w-6" />
                                        <span className="text-sm font-semibold">{method.label}</span>
                                    </Label>
                                ))}
                                </RadioGroup><FormMessage /></FormItem>
                            )} />
                             {selectedPaymentMethod && (
                                <Card className="mt-4">
                                    <CardContent className="p-4">
                                        <p className="font-semibold">{selectedPaymentMethod.label}</p>
                                        <p className="text-sm text-muted-foreground">{selectedPaymentMethod.description}</p>
                                        <p className="text-sm font-mono bg-muted p-2 rounded-md mt-2">{selectedPaymentMethod.accountInfo}</p>
                                    </CardContent>
                                </Card>
                            )}
                         </div>
                      )}
                    </motion.div>
                </AnimatePresence>

                 <div className="flex justify-between mt-8">
                    {step > 1 ? (
                        <Button type="button" variant="outline" onClick={handleBack}><ChevronLeft className="mr-2 h-4 w-4" /> Volver</Button>
                    ) : <div></div>}
                    {step < 3 ? (
                        <Button type="button" onClick={handleNext}>Siguiente</Button>
                    ) : (
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? "Enviando..." : "Confirmar y Enviar Solicitud"}
                        </Button>
                    )}
                </div>
            </form>
         </Form>
      </CardContent>
    </Card>
  )
});
AffiliateEnrollmentContent.displayName = "AffiliateEnrollmentContent";


export function AffiliateEnrollment() {
  return <AffiliateEnrollmentContent />;
}

// Dummy input to be used in the form until the real one is ready.
const InputWithIcon = forwardRef<HTMLInputElement, ComponentProps<typeof Input> & {Icon: React.ElementType}>(
    ({Icon, ...props}, ref) => {
    return (
        <div className="relative">
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input ref={ref} className="pl-10" {...props} />
        </div>
    )
});
InputWithIcon.displayName = "InputWithIcon";

    