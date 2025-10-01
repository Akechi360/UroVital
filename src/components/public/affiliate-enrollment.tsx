
'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AFFILIATE_PLANS, PAYMENT_METHODS } from '@/lib/payment-options';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Check, ChevronLeft, CreditCard, Loader2, Send } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { submitAffiliateLead } from '@/lib/actions';
import type { AffiliateLead } from '@/lib/types';


const leadSchema = z.object({
  fullName: z.string().min(3, "El nombre completo es requerido."),
  documentId: z.string().regex(/^[VEJGP]?\d{7,9}$/, "Cédula o RIF inválido."),
  birthDate: z.date({ required_error: "La fecha de nacimiento es requerida." }),
  phone: z.string().min(10, "El número de teléfono es requerido."),
  email: z.string().email("El correo electrónico es inválido."),
});

type LeadFormValues = z.infer<typeof leadSchema>;

function AffiliateEnrollment() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <AffiliateEnrollmentContent />
    </Suspense>
  )
}

function AffiliateEnrollmentContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const initialPlanId = searchParams.get('plan') || AFFILIATE_PLANS[0].id;
  const [selectedPlanId, setSelectedPlanId] = useState(initialPlanId);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<LeadFormValues | null>(null);
  const [paymentMode, setPaymentMode] = useState<'contado' | 'credito'>('contado');
  const [selectedInstallment, setSelectedInstallment] = useState<number>(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, control, formState: { errors } } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
  });

  const selectedPlan = useMemo(() => AFFILIATE_PLANS.find(p => p.id === selectedPlanId), [selectedPlanId]);

  if (!selectedPlan) {
    return <div>Plan no válido</div>;
  }
  
  const hasCreditOption = selectedPlan.paymentModes.credito && selectedPlan.paymentModes.credito.installmentOptions.length > 0;

  const onPersonalInfoSubmit = (data: LeadFormValues) => {
    setFormData(data);
    setStep(2);
  };

  const handleFinalSubmit = async () => {
    if (!formData || !selectedPaymentMethod) {
        toast({
            variant: "destructive",
            title: "Faltan datos",
            description: "Por favor, completa todos los pasos antes de enviar.",
        });
        return;
    }
    
    setIsSubmitting(true);
    
    let schedule;
    if (paymentMode === 'credito' && selectedPlan.paymentModes.credito) {
        const option = selectedPlan.paymentModes.credito.installmentOptions[selectedInstallment];
        schedule = {
            upfront: 0, // Assuming no upfront for credit
            installments: option.count,
            installmentValue: option.amount,
            frequencyDays: option.type === 'mensual' ? 30 : 90, // Example
        }
    }
    
    const leadData: AffiliateLead = {
        fullName: formData.fullName,
        documentId: formData.documentId,
        birthDate: formData.birthDate.toISOString(),
        phone: formData.phone,
        email: formData.email,
        address: "Dirección de prueba", // Placeholder
        planId: selectedPlanId as 'tarjeta-saludable' | 'fondo-espiritu-santo',
        paymentMode: paymentMode,
        paymentMethod: selectedPaymentMethod,
        schedule,
    };
    
    try {
        await submitAffiliateLead(leadData);
        setStep(4); // Success step
    } catch(error) {
        toast({
            variant: "destructive",
            title: "Error al enviar",
            description: "No se pudo procesar tu solicitud. Por favor, inténtalo de nuevo.",
        });
    } finally {
        setIsSubmitting(false);
    }
};


  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 className="text-2xl font-bold mb-2">Paso 1: Completa tus Datos</h2>
            <p className="text-muted-foreground mb-6">Necesitamos algunos datos para iniciar tu proceso de afiliación.</p>
            <form onSubmit={handleSubmit(onPersonalInfoSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nombre completo</Label>
                <Input id="fullName" {...register("fullName")} />
                {errors.fullName && <p className="text-destructive text-sm">{errors.fullName.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="documentId">Cédula / RIF</Label>
                    <Input id="documentId" {...register("documentId")} />
                    {errors.documentId && <p className="text-destructive text-sm">{errors.documentId.message}</p>}
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
                    <Controller
                        control={control}
                        name="birthDate"
                        render={({ field }) => (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {field.value ? format(field.value, "PPP", { locale: es }) : <span>Elige una fecha</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus disabled={(date) => date > new Date() || date < new Date("1900-01-01")}/>
                                </PopoverContent>
                            </Popover>
                        )}
                    />
                    {errors.birthDate && <p className="text-destructive text-sm">{errors.birthDate.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input id="phone" {...register("phone")} />
                    {errors.phone && <p className="text-destructive text-sm">{errors.phone.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input id="email" type="email" {...register("email")} />
                    {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
                </div>
              </div>
              <Button type="submit" className="w-full">Siguiente</Button>
            </form>
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 className="text-2xl font-bold mb-2">Paso 2: Elige tu forma de pago</h2>
             <p className="text-muted-foreground mb-6">Selecciona cómo prefieres pagar tu plan.</p>
            <RadioGroup value={paymentMode} onValueChange={(v) => setPaymentMode(v as 'contado' | 'credito')} className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <RadioGroupItem value="contado" id="contado" className="peer sr-only" />
                    <Label htmlFor="contado" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                        Pago de Contado
                        <span className="font-bold text-lg">${selectedPlan.paymentModes.contado.price.toFixed(2)}</span>
                    </Label>
                </div>
                {hasCreditOption && (
                     <div>
                        <RadioGroupItem value="credito" id="credito" className="peer sr-only" />
                        <Label htmlFor="credito" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                            Pago a Crédito
                            <span className="text-sm font-semibold text-muted-foreground">en cuotas</span>
                        </Label>
                    </div>
                )}
            </RadioGroup>
            {paymentMode === 'credito' && selectedPlan.paymentModes.credito && (
                <div className="mb-6">
                    <h3 className="font-semibold mb-2">Opciones de cuotas</h3>
                    <RadioGroup value={String(selectedInstallment)} onValueChange={(v) => setSelectedInstallment(Number(v))} className="space-y-2">
                        {selectedPlan.paymentModes.credito.installmentOptions.map((opt, index) => (
                            <div key={index} className="flex items-center">
                                <RadioGroupItem value={String(index)} id={`opt-${index}`} />
                                <Label htmlFor={`opt-${index}`} className="ml-2">{opt.count} {opt.type} de ${opt.amount.toFixed(2)}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>
            )}
             <Button onClick={() => setStep(3)} className="w-full">Siguiente</Button>
          </motion.div>
        );
      case 3:
         return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 className="text-2xl font-bold mb-2">Paso 3: Método de Pago</h2>
             <p className="text-muted-foreground mb-6">Selecciona el método que usarás para realizar tu pago.</p>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {PAYMENT_METHODS.map(method => (
                    <button key={method.id} onClick={() => setSelectedPaymentMethod(method.id)} className={cn("rounded-lg border-2 p-4 flex flex-col items-center gap-2 transition-colors", selectedPaymentMethod === method.id ? 'border-primary bg-primary/10' : 'border-muted hover:bg-accent')}>
                        {method.logoSrc && <Image src={method.logoSrc} alt={method.label} width={48} height={48} className="h-8 object-contain" />}
                        <span className="text-sm font-semibold">{method.label}</span>
                    </button>
                ))}
             </div>
             <Button onClick={handleFinalSubmit} disabled={!selectedPaymentMethod || isSubmitting} className="w-full mt-6">
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Procesando...</> : 'Finalizar Afiliación'}
             </Button>
          </motion.div>
        );
      case 4:
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <Check className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2">¡Solicitud Enviada!</h2>
                <p className="text-muted-foreground mb-6">Hemos recibido tu solicitud de afiliación. Pronto nos pondremos en contacto contigo para confirmar los detalles del pago y activar tu plan.</p>
                <Button asChild>
                    <a href="/landing">Volver al Inicio</a>
                </Button>
            </motion.div>
        )
      default:
        return null;
    }
  };
  
    const renderOrderSummary = () => {
        const installmentOption = paymentMode === 'credito' && selectedPlan.paymentModes.credito
            ? selectedPlan.paymentModes.credito.installmentOptions[selectedInstallment]
            : null;

        return (
            <div className="space-y-2 text-sm">
                <h3 className="font-bold mb-4">Resumen del Pedido</h3>
                <div className="flex justify-between"><span>Plan</span><span>{selectedPlan.name}</span></div>
                <div className="flex justify-between"><span>Afiliación</span><span>${selectedPlan.affiliationFee.toFixed(2)}</span></div>
                <div className="border-t my-2"></div>
                {paymentMode === 'credito' && installmentOption ? (
                    <>
                        <div className="flex justify-between"><span>Modalidad</span><span>Crédito</span></div>
                        <div className="flex justify-between font-bold"><span>Total a pagar hoy</span><span>${(installmentOption.amount).toFixed(2)}</span></div>
                        <p className="text-xs text-muted-foreground text-right">({installmentOption.count} {installmentOption.type} de ${installmentOption.amount.toFixed(2)})</p>
                    </>
                ) : (
                    <div className="flex justify-between font-bold"><span>Total</span><span>${selectedPlan.paymentModes.contado.price.toFixed(2)}</span></div>
                )}
                 {step === 2 && selectedPaymentMethod && (
                    <div className="pt-4 mt-4 border-t">
                        <h4 className="font-semibold mb-2">Método de pago</h4>
                        <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                            <Image src={PAYMENT_METHODS.find(p=>p.id === selectedPaymentMethod)?.logoSrc || ""} alt="" width={32} height={32}/>
                            <span className="font-medium">{PAYMENT_METHODS.find(p=>p.id === selectedPaymentMethod)?.label}</span>
                        </div>
                    </div>
                )}
            </div>
        )
    }

  return (
    <div className="container mx-auto px-4 max-w-5xl py-12 md:py-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2">
          {step > 1 && (
            <Button variant="ghost" onClick={() => setStep(s => s - 1)} className="mb-4">
              <ChevronLeft className="mr-2 h-4 w-4" /> Volver
            </Button>
          )}
          <AnimatePresence mode="wait">
            <Card className="p-6 sm:p-8">
                {renderStepContent()}
            </Card>
          </AnimatePresence>
        </div>

        {/* Sidebar */}
        <div className="md:col-span-1">
          <Card className="p-6 sticky top-20">
             <RadioGroup value={selectedPlanId} onValueChange={(id) => setSelectedPlanId(id)} className="mb-6 space-y-2">
                {AFFILIATE_PLANS.map(plan => (
                    <Label key={plan.id} htmlFor={plan.id} className={cn("flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors", selectedPlanId === plan.id ? "border-primary bg-primary/5" : "border-muted hover:bg-accent/50")}>
                        <RadioGroupItem value={plan.id} id={plan.id} className="mt-1" />
                        <div>
                            <span className="font-semibold">{plan.name}</span>
                            <p className="text-sm text-muted-foreground">{plan.subtitle}</p>
                        </div>
                    </Label>
                ))}
             </RadioGroup>

            {renderOrderSummary()}
          </Card>
        </div>
      </div>
    </div>
  );
}


export { AffiliateEnrollment };

