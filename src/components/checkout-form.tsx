
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format, addDays } from 'date-fns';
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
import type { Book } from '@/lib/types';

const formSchema = z.object({
  username: z.string().min(1, { message: 'El nombre de usuario es requerido.' }),
  dueDate: z.string(),
});

interface CheckoutFormProps {
  book: Book;
  username: string;
  onCancel: () => void;
  onSuccess: () => void;
}

export function CheckoutForm({ book, username, onCancel, onSuccess }: CheckoutFormProps) {
  const { toast } = useToast();
  const defaultDueDate = format(addDays(new Date(), 14), 'yyyy-MM-dd');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: username,
      dueDate: defaultDueDate,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (book.stock === 0) {
      toast({
        variant: "destructive",
        title: "❌ No disponible",
        description: "Este libro no tiene stock para ser prestado.",
      });
      return;
    }
    
    // In a real app, this would trigger a server action
    // For this prototype, we call the onSuccess callback which will
    // update the local state in the parent component.
    onSuccess();

    toast({
      title: '✅ ¡Préstamo Exitoso!',
      description: `Has pedido prestado "${book.title}". La fecha de entrega es ${values.dueDate}.`,
    });
  }

  return (
      <div className="mt-6">
        <h3 className="font-semibold text-lg mb-4">Confirmar Préstamo</h3>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de Usuario</FormLabel>
                  <FormControl>
                    <Input {...field} readOnly disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Entrega</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} readOnly disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2 pt-4">
                 <Button type="button" variant="ghost" onClick={onCancel}>
                    Cancelar
                </Button>
                <Button type="submit">
                    Confirmar Préstamo
                </Button>
            </div>
          </form>
        </Form>
      </div>
  );
}
