'use client';
import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
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
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { AFFILIATE_PLANS, PAYMENT_METHODS } from '@/lib/payment-options';
import { submitAffiliateLead, type AffiliateLead } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, CheckCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';

const formSchema = z.object({
  fullName: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  documentId: z.string().min(6, 'El documento de identidad es requerido.'),
  birthDate: z.date({ required_error: 'La fecha de nacimiento es requerida.' }),
  phone: z.string().min(7, 'El teléfono es requerido.'),
  email: z.string().email('El correo electrónico no es válido.'),
  address: z.string().min(10, "La dirección debe tener al menos 10 caracteres."),
  planId: z.enum(['tarjeta-saludable', 'fondo-espiritu-santo']),
  paymentMode: z.enum(['contado', 'credito']),
  paymentMethod: z.string({ required_error: 'Debes seleccionar un método de pago.' }),
  installmentOption: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;


function AffiliateEnrollmentContent() {
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionComplete, setSubmissionComplete] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: '',
            documentId: '',
            phone: '',
            email: '',
            address: '',
            planId: 'tarjeta-saludable',
            paymentMode: 'contado',
            paymentMethod: '',
            installmentOption: '',
        },
    });

    const { watch, trigger, getValues } = form;

    const planId = watch('planId');
    const paymentMode = watch('paymentMode');
    const paymentMethodId = watch('paymentMethod');
    const installmentOptionKey = watch('installmentOption');

    const selectedPlan = useMemo(() => AFFILIATE_PLANS.find(p => p.id === planId)!, [planId]);
    const selectedPaymentMethod = useMemo(() => PAYMENT_METHODS.find(m => m.id === paymentMethodId), [paymentMethodId]);
    
    const selectedInstallment = useMemo(() => {
        if (paymentMode === 'credito' && installmentOptionKey) {
            const [type, countStr] = installmentOptionKey.split('-');
            const count = parseInt(countStr, 10);
            return selectedPlan.paymentModes.credito?.installmentOptions.find(
                opt => opt.type === type && opt.count === count
            );
        }
        return undefined;
    }, [paymentMode, installmentOptionKey, selectedPlan]);

    useEffect(() => {
        const initialPlan = searchParams.get('plan');
        if (initialPlan === 'tarjeta-saludable' || initialPlan === 'fondo-espiritu-santo') {
            form.setValue('planId', initialPlan);
        }
    }, [searchParams, form]);


    const handleNextStep = async () => {
        let fieldsToValidate: (keyof FormValues)[] = [];
        if (step === 1) {
            fieldsToValidate = ['fullName', 'documentId', 'birthDate', 'phone', 'email', 'address'];
        } else if (step === 2) {
             fieldsToValidate = ['planId', 'paymentMode', 'paymentMethod'];
             if(getValues('paymentMode') === 'credito') {
                fieldsToValidate.push('installmentOption');
             }
        }

        const isValid = await trigger(fieldsToValidate);
        if (isValid) {
            setStep(s => s + 1);
        }
    };

    const handlePrevStep = () => {
        setStep(s => s - 1);
    };

    const onSubmit = async (data: FormValues) => {
        setIsSubmitting(true);

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

        if (data.paymentMode === 'credito' && selectedInstallment) {
            leadData.schedule = {
                upfront: selectedPlan.affiliationFee,
                installments: selectedInstallment.count,
                installmentValue: selectedInstallment.amount,
                frequencyDays: selectedInstallment.type === 'mensual' ? 30 : (365 / selectedInstallment.count)
            };
        }

        try {
            await submitAffiliateLead(leadData);
            setSubmissionComplete(true);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error al enviar',
                description: 'Hubo un problema al procesar tu afiliación. Por favor, intenta de nuevo.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const renderOrderSummary = () => {
      const total = paymentMode === 'contado' 
          ? selectedPlan.paymentModes.contado.price 
          : selectedInstallment?.amount ?? 0;

      return (
        <div className="rounded-lg bg-muted/50 p-4 space-y-2 mt-4 text-sm">
            <h4 className="font-semibold">Resumen de Orden</h4>
            <div className="flex justify-between">
                <span>Plan: {selectedPlan.name}</span>
                <span className="font-medium">{paymentMode === 'credito' ? 'a Crédito' : 'de Contado'}</span>
            </div>
            <div className="flex justify-between text-sm">
                <span>Cuota de Afiliación</span>
                <span className="font-medium">${(selectedPlan.affiliationFee ?? 0).toFixed(2)}</span>
            </div>
            <div className="border-t border-dashed my-2"></div>
            {selectedInstallment ? (
                <>
                    <div className="flex justify-between">
                        <span>{selectedInstallment.count} {selectedInstallment.type === 'cuotas' ? 'cuotas' : 'meses'} de</span>
                        <span>${selectedInstallment.amount.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between font-bold text-base">
                        <span>Total por cuota</span>
                        <span>${selectedInstallment.amount.toFixed(2)}</span>
                    </div>
                </>
            ) : (
                <div className="flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span>${selectedPlan.paymentModes.contado.price.toFixed(2)}</span>
                </div>
            )}
        </div>
      );
    }

    if (submissionComplete) {
        return (
            <div className="text-center py-16">
                <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                <h2 className="mt-4 text-2xl font-bold">¡Afiliación Recibida!</h2>
                <p className="mt-2 text-muted-foreground">Gracias por unirte a UroVital. Un asesor se pondrá en contacto contigo pronto.</p>
            </div>
        );
    }
    
    return (
        <Form {...form}>
            <h1 className="text-3xl font-bold text-center mb-2 font-headline text-primary">Formulario de Afiliación</h1>
            <div className="flex items-center justify-center my-4">
                {[1, 2, 3].map((s, i) => (
                <React.Fragment key={s}>
                    <div className="flex flex-col items-center">
                        <div
                            className={cn(
                                "h-8 w-8 rounded-full flex items-center justify-center font-bold transition-all",
                                step > s ? "bg-green-500 text-white" : "bg-muted text-muted-foreground",
                                step === s && "bg-primary text-primary-foreground"
                            )}
                        >
                            {step > s ? <CheckCircle className="h-5 w-5" /> : s}
                        </div>
                        <p className="text-xs mt-1 text-muted-foreground">{['Información', 'Pago', 'Confirmar'][i]}</p>
                    </div>
                    {i < 2 && <div className={cn("flex-1 h-1 mx-2 transition-all", step > s ? 'bg-green-500' : 'bg-muted')}></div>}
                </React.Fragment>
                ))}
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-8">
                {step === 1 && (
                     <section className="space-y-4 animate-in fade-in-50">
                        <h2 className="text-xl font-semibold border-b pb-2">1. Información Personal</h2>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <FormField control={form.control} name="fullName" render={({ field }) => (
                                <FormItem><FormLabel>Nombre completo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                             )} />
                             <FormField control={form.control} name="documentId" render={({ field }) => (
                                <FormItem><FormLabel>Cédula/Documento</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                             )} />
                         </div>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField control={form.control} name="birthDate" render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Fecha de Nacimiento</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
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
                             <FormField control={form.control} name="phone" render={({ field }) => (
                                <FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>
                             )} />
                         </div>
                          <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem><FormLabel>Correo Electrónico</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                         )} />
                         <FormField control={form.control} name="address" render={({ field }) => (
                            <FormItem><FormLabel>Dirección</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                         )} />
                     </section>
                )}

                {step === 2 && (
                    <section className="space-y-6 animate-in fade-in-50">
                        <div>
                             <FormField
                                control={form.control}
                                name="planId"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel className="text-base font-semibold">1. Selecciona tu plan</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                                            >
                                                {AFFILIATE_PLANS.map((plan) => (
                                                    <FormItem key={plan.id}>
                                                        <FormControl>
                                                             <RadioGroupItem value={plan.id} id={plan.id} className="sr-only" />
                                                        </FormControl>
                                                        <Label
                                                            htmlFor={plan.id}
                                                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                                        >
                                                            <span className="font-bold text-lg">{plan.name}</span>
                                                            <span className="text-xs text-muted-foreground">{plan.subtitle}</span>
                                                        </Label>
                                                    </FormItem>
                                                ))}
                                            </RadioGroup>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                         <div>
                            <FormField
                                control={form.control}
                                name="paymentMode"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel className="text-base font-semibold">2. Elige tu modalidad de pago</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                value={field.value}
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
                                                {selectedPlan.paymentModes.credito && (
                                                     <FormItem>
                                                        <FormControl>
                                                            <RadioGroupItem value="credito" id="credito" className="sr-only" />
                                                        </FormControl>
                                                        <Label htmlFor="credito" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                                            Crédito
                                                            <span className="text-xs">Paga en cuotas</span>
                                                        </Label>
                                                    </FormItem>
                                                )}
                                            </RadioGroup>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        {paymentMode === 'credito' && selectedPlan.paymentModes.credito && (
                            <div className="animate-in fade-in-50">
                                <FormField
                                    control={form.control}
                                    name="installmentOption"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="font-semibold">Opciones de cuotas</FormLabel>
                                            <FormControl>
                                                 <RadioGroup
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                    className="grid grid-cols-2 gap-4"
                                                >
                                                    {selectedPlan.paymentModes.credito!.installmentOptions.map((opt) => {
                                                        const key = `${opt.type}-${opt.count}`;
                                                        return (
                                                             <FormItem key={key}>
                                                                <FormControl>
                                                                    <RadioGroupItem value={key} id={key} className="sr-only" />
                                                                </FormControl>
                                                                <Label
                                                                    htmlFor={key}
                                                                    className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                                                >
                                                                    <span>{opt.count} {opt.type === 'cuotas' ? 'Cuotas' : 'Meses'}</span>
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
                            </div>
                        )}
                        <div>
                             <FormField
                                control={form.control}
                                name="paymentMethod"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                    <FormLabel className="text-base font-semibold">3. Elige tu método de pago</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        className="grid grid-cols-2 md:grid-cols-4 gap-4"
                                        >
                                        {PAYMENT_METHODS.map((method) => (
                                            <FormItem key={method.id}>
                                                <FormControl>
                                                    <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                                                </FormControl>
                                                <Label
                                                    htmlFor={method.id}
                                                    className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer h-full"
                                                >
                                                    <div className="relative h-10 w-20 mb-2">
                                                        <Image src={method.logoSrc} alt={method.label} layout="fill" objectFit="contain" />
                                                    </div>
                                                    <span className="text-xs font-semibold text-center">{method.label}</span>
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
                    </section>
                )}
                
                {step === 3 && (
                    <section className="space-y-6 animate-in fade-in-50">
                        <h2 className="text-xl font-semibold border-b pb-2">3. Confirmación</h2>
                        <div className="space-y-1 text-sm">
                            <h3 className="font-semibold">Detalles Personales</h3>
                            <p><strong>Nombre:</strong> {getValues('fullName')}</p>
                            <p><strong>Documento:</strong> {getValues('documentId')}</p>
                            <p><strong>Fecha de Nacimiento:</strong> {format(getValues('birthDate'), 'dd/MM/yyyy')}</p>
                            <p><strong>Email:</strong> {getValues('email')}</p>
                             <p><strong>Teléfono:</strong> {getValues('phone')}</p>
                             <p><strong>Dirección:</strong> {getValues('address')}</p>
                        </div>
                        {renderOrderSummary()}

                        {selectedPaymentMethod && (
                          <div className="rounded-lg bg-muted/50 p-4 mt-4">
                            <h4 className="font-semibold mb-2">Método de Pago Seleccionado</h4>
                            <div className="flex items-center gap-4">
                              <div className="relative h-10 w-16">
                                <Image src={selectedPaymentMethod.logoSrc} alt={selectedPaymentMethod.label} layout="fill" objectFit="contain" />
                              </div>
                              <div>
                                <p className="font-semibold">{selectedPaymentMethod.label}</p>
                                <p className="text-xs text-muted-foreground">{selectedPaymentMethod.accountInfo}</p>
                              </div>
                            </div>
                          </div>
                        )}
                    </section>
                )}


                <div className="flex justify-between pt-4">
                    {step > 1 ? (
                        <Button type="button" variant="outline" onClick={handlePrevStep}>Anterior</Button>
                    ) : <div></div>}
                    
                    {step < 3 ? (
                        <Button type="button" onClick={handleNextStep}>Siguiente</Button>
                    ) : (
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSubmitting ? 'Enviando...' : 'Confirmar y Enviar'}
                        </Button>
                    )}
                </div>
            </form>
        </Form>
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
