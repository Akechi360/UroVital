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
import { addPaymentType } from '@/lib/actions';
import { useFinanceStore } from '@/lib/store/finance-store';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres.'),
  defaultAmount: z.coerce.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddPaymentTypeFormProps {
  onSuccess: () => void;
}

export function AddPaymentTypeForm({ onSuccess }: AddPaymentTypeFormProps) {
  const { toast } = useToast();
  const { addPaymentType: addTypeToStore } = useFinanceStore();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      defaultAmount: undefined,
    },
  });

  const { formState: { isSubmitting } } = form;

  const onSubmit = async (values: FormValues) => {
    try {
      const newItem = await addPaymentType(values);
      addTypeToStore(newItem);
      toast({
        title: 'Tipo de Pago Agregado',
        description: `${newItem.name} ha sido agregado a la lista.`,
      });
      onSuccess();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo agregar el tipo de pago.',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Tipo de Pago</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Procedimiento Menor" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea placeholder="Ej: Procedimientos ambulatorios en consultorio." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
            control={form.control}
            name="defaultAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monto Predeterminado (Opcional)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Ej: 1500" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : e.target.valueAsNumber)} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="secondary" onClick={onSuccess}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar Tipo'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
