
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AnimatePresence, motion } from 'framer-motion';
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
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { CalendarIcon, CheckCircle, CircleDollarSign, CreditCard, Banknote, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AFFILIATE_PLANS, PAYMENT_METHODS } from '@/lib/payment-options';
import { submitAffiliateLead } from '@/lib/actions';
import type { AffiliateLead } from '@/lib/types';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';


const MySwal = withReactContent(Swal);

const formSchema = z.object({
  planId: z.string({ required_error: 'Debes seleccionar un plan.'}),
  fullName: z.string().min(3, 'El nombre completo es requerido.'),
  documentId: z.string().min(6, 'El documento de identidad es requerido.'),
  birthDate: z.date({ required_error: 'La fecha de nacimiento es requerida.' }),
  phone: z.string().min(7, 'El teléfono es requerido.'),
  email: z.string().email('El correo electrónico no es válido.'),
  address: z.string().min(10, 'La dirección es requerida.'),
  paymentMode: z.enum(['contado', 'credito'], { required_error: 'Debes seleccionar una modalidad de pago.' }),
  installmentOption: z.string().optional(),
  paymentMethod: z.string({ required_error: 'Debes seleccionar un método de pago.' }),
  paymentProof: z.instanceof(File).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const STEPS = [
  { step: 1, title: 'Información Personal' },
  { step: 2, title: 'Pago' },
  { step: 3, title: 'Confirmación' },
];

function AffiliateEnrollmentContent({ form, step, setStep }: { form: UseFormReturn<FormValues>, step: number, setStep: (step: number) => void }) {
  const { watch } = form;
  const planId = watch('planId');
  const paymentMode = watch('paymentMode');
  const installmentOption = watch('installmentOption');
  const selectedPaymentMethod = watch('paymentMethod');
  const { toast } = useToast();

  const selectedPlan = useMemo(() => AFFILIATE_PLANS.find(p => p.id === planId), [planId]);

  if (!selectedPlan) {
    return (
        <div className="text-center text-red-500">
            Error: El plan seleccionado no es válido. Por favor, vuelve a la página de inicio y selecciona un plan.
        </div>
    );
  }
  
  const selectedInstallment = useMemo(() => {
    if (paymentMode === 'credito' && installmentOption) {
      return selectedPlan.paymentModes.credito?.installmentOptions.find(opt => `${opt.type}-${opt.count}` === installmentOption);
    }
    return undefined;
  }, [paymentMode, installmentOption, selectedPlan]);


  const renderOrderSummary = () => {
    return (
      <div className="mt-6 space-y-2 rounded-lg bg-muted/50 p-4">
        <h4 className="font-semibold">Resumen de Orden</h4>
        <div className="flex justify-between">
          <span>Plan: {selectedPlan.name}</span>
          <span className="font-medium">
            {paymentMode === 'contado' ? `$${selectedPlan.paymentModes.contado.price.toFixed(2)}` : 'a crédito'}
          </span>
        </div>
        {selectedPlan.affiliationFee !== undefined && (
          <div className="flex justify-between">
            <span>Cuota de Afiliación</span>
            <span className="font-medium">${selectedPlan.affiliationFee.toFixed(2)}</span>
          </div>
        )}
        <div className="pt-2 border-t">
         {paymentMode === 'credito' && selectedInstallment ? (
             <>
                 <div className="flex justify-between font-medium text-sm">
                    <span>Pago inicial:</span>
                    <span>$0.00</span>
                 </div>
                 <div className="flex justify-between text-sm">
                    <span>Cuotas:</span>
                    <span>{selectedInstallment.count} x ${selectedInstallment.amount.toFixed(2)}</span>
                 </div>
             </>
         ) : (
             <div className="flex justify-between font-bold"><span>Total</span><span>${(selectedPlan.paymentModes.contado.price + (selectedPlan.affiliationFee || 0)).toFixed(2)}</span></div>
         )}
        </div>
         {step === 2 && selectedPaymentMethod && (
            <div className="pt-4 mt-4 border-t">
                <h4 className="font-semibold mb-2">Instrucciones de Pago</h4>
                <div className="text-sm text-muted-foreground bg-background p-3 rounded-md">
                    <p className="font-medium text-foreground">{PAYMENT_METHODS.find(p => p.id === selectedPaymentMethod)?.label}</p>
                    <p>{PAYMENT_METHODS.find(p => p.id === selectedPaymentMethod)?.accountInfo}</p>
                    <p className='mt-2'>Una vez realizado el pago, adjunta el comprobante a continuación.</p>
                </div>
            </div>
        )}
      </div>
    );
  };
  
  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  const handleNextStep = async () => {
    const fieldsToValidate: (keyof FormValues)[] = 
      step === 1 ? ['planId', 'fullName', 'documentId', 'birthDate', 'phone', 'email', 'address'] : 
      step === 2 ? ['paymentMode', 'paymentMethod'] : [];

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setStep(step + 1);
    } else {
        toast({
            variant: "destructive",
            title: "Campos Incompletos",
            description: "Por favor, completa todos los campos requeridos para continuar.",
        });
    }
  };

  return (
    <div className="space-y-8">
        <AnimatePresence mode="wait">
            <motion.div
                key={step}
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
            >
            {step === 1 && (
                <div className="space-y-4">
                     <FormField
                        control={form.control}
                        name="planId"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                            <FormLabel className="text-base font-semibold">Selecciona tu Plan</FormLabel>
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
                                        <Label htmlFor={plan.id} className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all">
                                            <div className="w-full">
                                                <div className="flex justify-between items-center mb-2">
                                                    <h3 className="font-bold text-lg">{plan.name}</h3>
                                                    <div className='p-2 bg-primary/10 rounded-full'>
                                                        <ShieldCheck className='h-6 w-6 text-primary' />
                                                    </div>
                                                </div>
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
                    <FormField control={form.control} name="fullName" render={({ field }) => ( <FormItem> <FormLabel>Nombre Completo</FormLabel> <FormControl> <Input placeholder="Ej: Juan Pérez" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField control={form.control} name="documentId" render={({ field }) => ( <FormItem> <FormLabel>Cédula o Pasaporte</FormLabel> <FormControl> <Input placeholder="V-12345678" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                        <FormField control={form.control} name="birthDate" render={({ field }) => ( <FormItem className="flex flex-col"> <FormLabel>Fecha de Nacimiento</FormLabel> <Popover> <PopoverTrigger asChild> <FormControl> <Button variant={"outline"} className={cn( "w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground" )}> {field.value ? ( format(field.value, "PPP", { locale: es }) ) : ( <span>Elige una fecha</span> )} <CalendarIcon className="ml-auto h-4 w-4 opacity-50" /> </Button> </FormControl> </PopoverTrigger> <PopoverContent className="w-auto p-0" align="start"> <Calendar mode="single" selected={field.value} onSelect={field.onChange} captionLayout="dropdown-buttons" fromYear={1900} toYear={new Date().getFullYear()} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus /> </PopoverContent> </Popover> <FormMessage /> </FormItem> )}/>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem> <FormLabel>Teléfono</FormLabel> <FormControl> <Input placeholder="0414-1234567" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                        <FormField control={form.control} name="email" render={({ field }) => ( <FormItem> <FormLabel>Correo Electrónico</FormLabel> <FormControl> <Input type="email" placeholder="juan.perez@email.com" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                    </div>
                    <FormField control={form.control} name="address" render={({ field }) => ( <FormItem> <FormLabel>Dirección</FormLabel> <FormControl> <Textarea placeholder="Ej: Urb. La Viña, Calle 1, Casa #5, Valencia" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="paymentMode"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-base font-semibold">Elige tu Modalidad de Pago</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <FormItem>
                                <FormControl>
                                    <RadioGroupItem value="contado" id="contado" className="sr-only" />
                                </FormControl>
                                <Label htmlFor="contado" className="flex items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all">
                                    <div className='flex items-center gap-3'>
                                        <div className='p-2 bg-primary/10 rounded-full'><Banknote className='h-6 w-6 text-primary' /></div>
                                        <div>
                                            <p className='font-bold'>Contado</p>
                                            <p className='text-sm text-muted-foreground'>Pago único anual</p>
                                        </div>
                                    </div>
                                    <span className="font-bold text-lg">${selectedPlan.paymentModes.contado.price.toFixed(2)}</span>
                                </Label>
                            </FormItem>
                          {selectedPlan.paymentModes.credito && (
                            <FormItem>
                                <FormControl>
                                    <RadioGroupItem value="credito" id="credito" className="sr-only" />
                                </FormControl>
                                <Label htmlFor="credito" className="flex items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all">
                                    <div className='flex items-center gap-3'>
                                        <div className='p-2 bg-primary/10 rounded-full'><CreditCard className='h-6 w-6 text-primary' /></div>
                                        <div>
                                            <p className='font-bold'>Crédito</p>
                                            <p className='text-sm text-muted-foreground'>Paga en cómodas cuotas</p>
                                        </div>
                                    </div>
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
                          <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {selectedPlan.paymentModes.credito.installmentOptions.map((opt) => (
                              <FormItem key={`${opt.type}-${opt.count}`}>
                                <FormControl>
                                  <RadioGroupItem value={`${opt.type}-${opt.count}`} id={`${opt.type}-${opt.count}`} className="sr-only" />
                                </FormControl>
                                <Label htmlFor={`${opt.type}-${opt.count}`} className="flex items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                  <span>{opt.count} {opt.type === 'mensual' ? 'meses' : 'cuotas'}</span>
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
                        <FormLabel className="text-base font-semibold">Método de Pago</FormLabel>
                        <FormControl>
                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {PAYMENT_METHODS.map(method => (
                                <FormItem key={method.id}>
                                    <FormControl>
                                        <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                                    </FormControl>
                                    <Label htmlFor={method.id} className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all aspect-square">
                                        <Image src={method.logoSrc} alt={method.label} width={40} height={40} className="object-contain" />
                                        <span className="text-center text-sm font-medium">{method.label}</span>
                                    </Label>
                                </FormItem>
                            ))}
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                
                {renderOrderSummary()}
              </div>
            )}
            
            {step === 3 && (
                <div className="text-center p-8 bg-muted/50 rounded-lg">
                    <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                    <h2 className="text-2xl font-bold mb-2">¡Solicitud Enviada!</h2>
                    <p className="text-muted-foreground">
                        Hemos recibido tu solicitud de afiliación. Nos pondremos en contacto contigo pronto para confirmar los detalles y finalizar el proceso. ¡Gracias por unirte a UroVital!
                    </p>
                </div>
            )}
            </motion.div>
        </AnimatePresence>

        {step < 3 && (
          <div className="flex justify-between items-center">
            <Button variant="ghost" onClick={() => setStep(step - 1)} disabled={step === 1}>
              Atrás
            </Button>
            <Button onClick={handleNextStep}>
              Siguiente
            </Button>
          </div>
        )}
    </div>
  );
}


export function AffiliateEnrollment() {
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan');
  const [step, setStep] = useState(1);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      planId: plan || AFFILIATE_PLANS[0].id,
      fullName: '',
      documentId: '',
      birthDate: undefined,
      phone: '',
      email: '',
      address: '',
      paymentMethod: '',
      installmentOption: '',
    },
  });

  const { handleSubmit, formState: { isSubmitting } } = form;

  const onSubmit = async (data: FormValues) => {
    try {
      const selectedPlan = AFFILIATE_PLANS.find(p => p.id === data.planId);
      let schedule;
      if (data.paymentMode === 'credito' && data.installmentOption) {
        const selectedOption = selectedPlan?.paymentModes.credito?.installmentOptions.find(opt => `${opt.type}-${opt.count}` === data.installmentOption);
        if (selectedOption) {
            schedule = {
                upfront: 0,
                installments: selectedOption.count,
                installmentValue: selectedOption.amount,
                frequencyDays: selectedOption.type === 'mensual' ? 30 : (365 / selectedOption.count)
            }
        }
      }

      const lead: Omit<AffiliateLead, 'paymentProof'> = {
        ...data,
        birthDate: data.birthDate.toISOString(),
        planId: data.planId as AffiliateLead['planId'],
        paymentMode: data.paymentMode as AffiliateLead['paymentMode'],
        schedule,
      };

      await submitAffiliateLead(lead);

      const isDarkMode = document.documentElement.classList.contains('dark');
        MySwal.fire({
            title: '¡Solicitud completada!',
            text: 'Tu formulario de afiliación fue enviado con éxito.',
            icon: 'success',
            background: isDarkMode ? '#1e293b' : '#ffffff',
            color: isDarkMode ? '#f1f5f9' : '#0f172a',
            confirmButtonColor: '#4f46e5',
        });
      setStep(3);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error al enviar",
        description: "No se pudo procesar tu solicitud. Por favor, intenta de nuevo.",
      });
    }
  };
  
  return (
      <Card className="w-full max-w-4xl mx-auto shadow-2xl shadow-primary/10">
          <CardContent className="p-8">
              <h1 className="text-3xl font-bold text-center mb-2 font-headline">Formulario de Afiliación</h1>
              <p className="text-muted-foreground text-center mb-6">Completa los siguientes pasos para unirte a UroVital.</p>
              
              <div className="mb-8">
                  <Progress value={(step / STEPS.length) * 100} className="h-2" />
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                      {STEPS.map(s => (
                          <span key={s.step} className={cn(s.step <= step && "text-primary font-semibold")}>
                              {s.title}
                          </span>
                      ))}
                  </div>
              </div>

              <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <AffiliateEnrollmentContent form={form} step={step} setStep={setStep} />
                </form>
              </Form>
          </CardContent>
      </Card>
  );
}

