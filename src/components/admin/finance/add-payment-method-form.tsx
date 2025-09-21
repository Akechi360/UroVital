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
import { addPaymentMethod } from '@/lib/actions';
import { useFinanceStore } from '@/lib/store/finance-store';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres.'),
  enabled: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface AddPaymentMethodFormProps {
  onSuccess: () => void;
}

export function AddPaymentMethodForm({ onSuccess }: AddPaymentMethodFormProps) {
  const { toast } = useToast();
  const { addPaymentMethod: addMethodToStore } = useFinanceStore();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      enabled: true,
    },
  });

  const { formState: { isSubmitting } } = form;

  const onSubmit = async (values: FormValues) => {
    try {
      const newItem = await addPaymentMethod(values);
      addMethodToStore(newItem);
      toast({
        title: 'Método de Pago Agregado',
        description: `${newItem.name} ha sido agregado a la lista.`,
      });
      onSuccess();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo agregar el método de pago.',
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
              <FormLabel>Nombre del Método</FormLabel>
              <FormControl>
                <Input placeholder="Ej: PayPal" {...field} />
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
                <Textarea placeholder="Ej: Pago a través de plataforma PayPal." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="enabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Habilitado</FormLabel>
                <FormMessage />
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="secondary" onClick={onSuccess}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar Método'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
