
'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
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
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Check, ChevronLeft, ChevronRight, Stethoscope } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { AFFILIATE_PLANS, PAYMENT_METHODS } from '@/lib/payment-options';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';
import { Card } from '../ui/card';
import { submitAffiliateLead } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

const formSchema = z.object({
  fullName: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
  documentId: z.string().min(6, "La cédula debe tener al menos 6 dígitos."),
  birthDate: z.date({ required_error: "La fecha de nacimiento es requerida." }),
  phone: z.string().min(10, "El teléfono debe tener al menos 10 dígitos."),
  email: z.string().email("El correo electrónico no es válido."),
  address: z.string().min(10, "La dirección debe tener al menos 10 caracteres."),
  planId: z.string({ required_error: "Debes seleccionar un plan." }),
  paymentMode: z.enum(['contado', 'credito'], { required_error: "Selecciona una modalidad." }),
  installmentOption: z.string().optional(),
  paymentMethod: z.string({ required_error: "Debes seleccionar un método de pago." }),
  paymentReference: z.string().optional(),
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
      phone: "",
      email: "",
      address: "",
      planId: searchParams.get('plan') || AFFILIATE_PLANS[0].id,
      paymentMode: 'contado',
      installmentOption: '',
      paymentMethod: '',
      paymentReference: "",
    },
  });

  const { watch, control, trigger, getValues } = form;

  const planId = watch('planId');
  const paymentMode = watch('paymentMode');
  const selectedPlan = useMemo(() => AFFILIATE_PLANS.find(p => p.id === planId)!, [planId]);
  const selectedPaymentMethod = watch('paymentMethod');
  const selectedInstallmentKey = watch('installmentOption');

  const selectedInstallmentOption = useMemo(() => {
    if (paymentMode === 'credito' && selectedInstallmentKey) {
        const [type, count] = selectedInstallmentKey.split('-');
        return selectedPlan.paymentModes.credito.installmentOptions.find(
            opt => opt.type === type && opt.count === parseInt(count)
        );
    }
    return null;
  }, [paymentMode, selectedInstallmentKey, selectedPlan]);

  const nextStep = async () => {
    let fieldsToValidate: (keyof FormValues)[] = [];
    if (step === 1) {
      fieldsToValidate = ['fullName', 'documentId', 'birthDate', 'phone', 'email', 'address'];
    } else if (step === 2) {
      fieldsToValidate = ['planId', 'paymentMode'];
      if(paymentMode === 'credito') fieldsToValidate.push('installmentOption');
    }
    
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep(s => s + 1);
    }
  };

  const prevStep = () => {
    setStep(s => s - 1);
  };

  async function onSubmit(data: FormValues) {
     try {
      const leadData = {
        ...data,
        birthDate: data.birthDate.toISOString(),
        schedule: selectedInstallmentOption ? {
          upfront: 0, // Assuming no upfront for now
          installments: selectedInstallmentOption.count,
          installmentValue: selectedInstallmentOption.amount,
          frequencyDays: selectedInstallmentOption.type === 'mensual' ? 30 : 30 // Simplified
        } : undefined,
      }
      await submitAffiliateLead(leadData);
      toast({
        title: "¡Solicitud Enviada! 🎉",
        description: "Hemos recibido tu solicitud de afiliación. Pronto nos pondremos en contacto contigo.",
      });
      setStep(4); // Go to success step
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al enviar la solicitud",
        description: "Hubo un problema al procesar tu solicitud. Por favor, inténtalo de nuevo más tarde.",
      });
    }
  }

  const renderOrderSummary = () => (
    <div className="space-y-2 text-sm rounded-lg border bg-muted/50 p-4">
        <h3 className="font-semibold text-base mb-2">Resumen del Pedido</h3>
        <div className="flex justify-between"><span>Plan</span><span className='font-medium'>{selectedPlan.name}</span></div>
        {selectedPlan.affiliationFee > 0 && (
            <div className="flex justify-between"><span>Cuota de Afiliación</span><span>${selectedPlan.affiliationFee.toFixed(2)}</span></div>
        )}
        <div className="border-t my-2"></div>
        {paymentMode === 'credito' && selectedInstallmentOption ? (
            <>
                <div className="flex justify-between">
                    <span>Modalidad</span>
                    <span className="font-medium text-right">{selectedInstallmentOption.count} {selectedInstallmentOption.type === 'mensual' ? 'pagos mensuales' : 'cuotas'} de ${selectedInstallmentOption.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold mt-2 pt-2 border-t"><span>Total a Pagar Hoy</span><span>$0.00</span></div>
            </>
        ) : (
            <div className="flex justify-between font-bold"><span>Total</span><span>${selectedPlan.paymentModes.contado.price.toFixed(2)}</span></div>
        )}
    </div>
  );
  
  if (step === 4) {
    return (
       <div className="text-center py-16">
        <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
            <Check className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Solicitud Recibida</h2>
        <p className="text-muted-foreground max-w-md mx-auto">Gracias por tu interés. Hemos recibido tu solicitud y un asesor se pondrá en contacto contigo en las próximas 24-48 horas para finalizar el proceso.</p>
        <Button onClick={() => window.location.reload()} className="mt-6">Volver al inicio</Button>
      </div>
    )
  }

  return (
    <>
       <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground font-headline text-center">Formulario de Afiliación</h1>
            <Progress value={(step / 3) * 100} className="mt-4 h-2" />
        </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in-0 duration-500">
                <h2 className="text-xl font-semibold border-b pb-2">Paso 1: Datos Personales</h2>
                <FormField control={control} name="fullName" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Nombre Completo</FormLabel>
                        <FormControl><Input placeholder="Ej: Juan Pérez" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <div className="grid sm:grid-cols-2 gap-4">
                    <FormField control={control} name="documentId" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Cédula de Identidad</FormLabel>
                            <FormControl><Input placeholder="V-12345678" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={control} name="birthDate" render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Fecha de Nacimiento</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                            {field.value ? format(field.value, "PPP") : <span>Elige una fecha</span>}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} captionLayout="dropdown-buttons" fromYear={1930} toYear={new Date().getFullYear()} initialFocus />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
                 <div className="grid sm:grid-cols-2 gap-4">
                    <FormField control={control} name="phone" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Teléfono</FormLabel>
                            <FormControl><Input placeholder="0414-1234567" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={control} name="email" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Correo Electrónico</FormLabel>
                            <FormControl><Input type="email" placeholder="juan.perez@email.com" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
                 <FormField control={control} name="address" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Dirección</FormLabel>
                        <FormControl><Textarea placeholder="Urb. La Viña, Calle 123, Casa #4, Valencia, Carabobo" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
            </div>
          )}

          {step === 2 && (
             <div className="space-y-6 animate-in fade-in-0 duration-500">
                <h2 className="text-xl font-semibold border-b pb-2">Paso 2: Selección de Plan y Pago</h2>
                <FormField
                    control={control}
                    name="planId"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                        <FormLabel className="text-base">Elige tu Plan de Afiliación</FormLabel>
                        <FormControl>
                            <RadioGroup
                                onValueChange={field.onChange}
                                value={field.value}
                                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            >
                                {AFFILIATE_PLANS.map(plan => (
                                    <FormItem key={plan.id}>
                                        <FormControl>
                                            <RadioGroupItem value={plan.id} className="sr-only" />
                                        </FormControl>
                                        <Label
                                            htmlFor={plan.id}
                                            className={cn(
                                                "flex flex-col rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all",
                                                field.value === plan.id && "border-primary bg-primary/10"
                                            )}
                                        >
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
                 <FormField
                    control={control}
                    name="paymentMode"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                        <FormLabel className="text-base">Modalidad de Pago</FormLabel>
                        <FormControl>
                            <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-2 gap-4">
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
                        <FormMessage />
                        </FormItem>
                    )}
                    />

                {paymentMode === 'credito' && (
                    <FormField
                        control={control}
                        name="installmentOption"
                        render={({ field }) => (
                            <FormItem className="space-y-3 animate-in fade-in-0 duration-500">
                                <FormLabel>Opciones de Cuotas</FormLabel>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {selectedPlan.paymentModes.credito.installmentOptions.map(opt => {
                                            const key = `${opt.type}-${opt.count}`;
                                            return (
                                                <FormItem key={key}>
                                                    <FormControl>
                                                         <RadioGroupItem value={key} id={key} className="sr-only" />
                                                    </FormControl>
                                                    <Label htmlFor={key} className="flex items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                                        <span>{opt.count} {opt.type === 'mensual' ? 'pagos mensuales' : 'cuotas'}</span>
                                                        <span className="font-bold">${opt.amount.toFixed(2)}</span>
                                                    </Label>
                                                </FormItem>
                                            )
                                        })}
                                    </RadioGroup>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in-0 duration-500">
                 <h2 className="text-xl font-semibold border-b pb-2">Paso 3: Confirmación y Pago</h2>
                 <div>{renderOrderSummary()}</div>
                 <FormField
                    control={control}
                    name="paymentMethod"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormLabel className="text-base">Método de Pago</FormLabel>
                             <FormControl>
                                <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {PAYMENT_METHODS.map((method) => (
                                        <FormItem key={method.id}>
                                            <FormControl>
                                                <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                                            </FormControl>
                                             <Label htmlFor={method.id} className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer aspect-square">
                                                <Image src={method.logoSrc} alt={method.label} width={40} height={40} className="mb-2" />
                                                <span className="text-sm font-medium text-center">{method.label}</span>
                                            </Label>
                                        </FormItem>
                                    ))}
                                </RadioGroup>
                            </FormControl>
                        </FormItem>
                    )}
                 />

                {selectedPaymentMethod && (
                    <Card className="p-4 bg-muted/50 animate-in fade-in-0 duration-500">
                        <p className="font-semibold text-sm">Datos para realizar el pago:</p>
                        <p className="text-sm text-muted-foreground">{PAYMENT_METHODS.find(p => p.id === selectedPaymentMethod)?.description}</p>
                        <p className="font-mono text-sm mt-2 p-2 bg-background rounded-md">{PAYMENT_METHODS.find(p => p.id === selectedPaymentMethod)?.accountInfo}</p>
                    </Card>
                )}

                 <FormField
                    control={control}
                    name="paymentReference"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Referencia de Pago (Opcional)</FormLabel>
                            <FormControl><Input placeholder="Ej: 00123456" {...field} /></FormControl>
                             <FormMessage />
                        </FormItem>
                    )}
                 />
            </div>
          )}

          <div className="flex justify-between items-center pt-4">
            {step > 1 && step < 4 && (
              <Button type="button" variant="outline" onClick={prevStep}>
                <ChevronLeft className="mr-2" />
                Anterior
              </Button>
            )}
            <div className="flex-grow"></div>
            {step < 3 && (
              <Button type="button" onClick={nextStep}>
                Siguiente
                <ChevronRight className="ml-2" />
              </Button>
            )}
            {step === 3 && (
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Enviando...' : 'Finalizar y Enviar Solicitud'}
              </Button>
            )}
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

export default AffiliateEnrollment;

    