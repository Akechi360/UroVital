'use client';

import { useForm } from 'react-hook-form';
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
import { useToast } from '@/hooks/use-toast';
import { addPayment } from '@/lib/actions';
import { useFinanceStore } from '@/lib/store/finance-store';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Patient, Company, PaymentMethod, PaymentType } from '@/lib/types';
import { useState } from 'react';

const formSchema = z.object({
  entityId: z.string({ required_error: 'Debe seleccionar una entidad.' }),
  paymentTypeId: z.string({ required_error: 'Debe seleccionar un tipo de pago.' }),
  paymentMethodId: z.string({ required_error: 'Debe seleccionar un método de pago.' }),
  amount: z.coerce.number().min(0.01, 'El monto debe ser mayor a cero.'),
  date: z.date({ required_error: 'La fecha es requerida.' }),
});

type FormValues = z.infer<typeof formSchema>;

interface AddPaymentFormProps {
  patients: Patient[];
  companies: Company[];
  paymentTypes: PaymentType[];
  paymentMethods: PaymentMethod[];
  onSuccess: () => void;
}

export function AddPaymentForm({ patients, companies, paymentTypes, paymentMethods, onSuccess }: AddPaymentFormProps) {
  const { toast } = useToast();
  const { addPayment: addPaymentToStore } = useFinanceStore();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: undefined,
      date: new Date(),
    },
  });

  const { formState: { isSubmitting }, watch, setValue } = form;

  const paymentTypeId = watch('paymentTypeId');

  if (paymentTypeId) {
    const selectedType = paymentTypes.find(t => t.id === paymentTypeId);
    if (selectedType && selectedType.defaultAmount) {
      setValue('amount', selectedType.defaultAmount, { shouldValidate: true });
    }
  }

  const onSubmit = async (values: FormValues) => {
    const entity = patients.find(p => p.id === values.entityId) || companies.find(c => c.id === values.entityId);
    if (!entity) return; // Should not happen

    try {
      const newPaymentData = {
        ...values,
        entityType: patients.some(p => p.id === values.entityId) ? 'patient' : 'company' as 'patient' | 'company',
        date: values.date.toISOString(),
        status: 'Completado' as const,
      }
      const newPayment = await addPayment(newPaymentData);
      addPaymentToStore(newPayment);
      toast({
        title: 'Pago Registrado',
        description: `El pago de ${entity.name} ha sido registrado.`,
      });
      onSuccess();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo registrar el pago.',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="entityId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Paciente o Empresa</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                    <SelectGroup>
                        <FormLabel className="px-2 py-1.5 text-xs font-semibold">Pacientes</FormLabel>
                        {patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectGroup>
                     <SelectGroup>
                        <FormLabel className="px-2 py-1.5 text-xs font-semibold">Empresas</FormLabel>
                        {companies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectGroup>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="paymentTypeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Concepto</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Seleccione un concepto..." /></SelectTrigger>
                </FormControl>
                <SelectContent>
                    {paymentTypes.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monto</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Ej: 800.00" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : e.target.valueAsNumber)} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                    <FormLabel>Fecha de Pago</FormLabel>
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
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <FormField
          control={form.control}
          name="paymentMethodId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Método de Pago</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Seleccione un método..." /></SelectTrigger>
                </FormControl>
                <SelectContent>
                    {paymentMethods.filter(m => m.enabled).map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="secondary" onClick={onSuccess}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Registrar Pago'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
