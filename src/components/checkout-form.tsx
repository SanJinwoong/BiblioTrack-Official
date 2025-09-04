
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format, addDays } from 'date-fns';

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
import { Textarea } from './ui/textarea';

const formSchema = z.object({
  dueDate: z.string(),
  comments: z.string().optional(),
});


interface CheckoutFormProps {
  book: Book;
  username: string;
  formId: string;
  onSuccess: () => void;
}

export function CheckoutForm({ book, username, formId, onSuccess }: CheckoutFormProps) {
  const { toast } = useToast();
  const defaultDueDate = format(addDays(new Date(), 14), 'yyyy-MM-dd');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dueDate: defaultDueDate,
      comments: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (book.stock === 0) {
      toast({
        variant: 'destructive',
        title: '❌ No disponible',
        description: 'Este libro no tiene stock para ser prestado.',
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
    <div>
      <h3 className="font-semibold text-lg mb-4">Confirmar Préstamo</h3>
      <Form {...form}>
        <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => (
                <FormItem>
                    <FormLabel>Comentarios (Opcional)</FormLabel>
                    <FormControl>
                        <Textarea
                        placeholder="Ej: Dejar en recepción, necesito la edición de tapa dura, etc."
                        className="resize-none"
                        {...field}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        </form>
      </Form>
    </div>
  );
}
