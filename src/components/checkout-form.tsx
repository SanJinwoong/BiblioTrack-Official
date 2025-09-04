
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format, addDays, startOfDay } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

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
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { cn } from '@/lib/utils';
import { Textarea } from './ui/textarea';

const formSchema = z.object({
  dueDate: z.string(),
  pickupDate: z.date({
    required_error: "La fecha de retiro es obligatoria.",
  }),
  comments: z.string().optional(),
}).refine(data => new Date(data.pickupDate) < new Date(data.dueDate), {
  message: "La fecha de retiro debe ser anterior a la fecha de entrega.",
  path: ["pickupDate"], 
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
              name="pickupDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha de retiro deseada</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Elige una fecha</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < startOfDay(new Date())
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
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

            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => (
                <FormItem>
                    <FormLabel>Comentarios (Opcional)</FormLabel>
                    <FormControl>
                        <Textarea
                        placeholder="Ej: Dejar en recepción, etc."
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
