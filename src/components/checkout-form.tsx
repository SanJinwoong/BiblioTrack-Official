
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format, addDays, startOfDay, addWeeks, addMonths } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import type { Book } from '@/lib/types';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { cn } from '@/lib/utils';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from './ui/input';

interface CheckoutFormProps {
  book: Book;
  username: string;
  role: 'client' | 'librarian';
  formId: string;
  onSuccess: (data: { userId: string; dueDate: string }) => void;
}

export function CheckoutForm({ book, username, role, formId, onSuccess }: CheckoutFormProps) {
  const { toast } = useToast();

  const baseSchema = z.object({
    loanDuration: z.string(),
    pickupDate: z.date().optional(),
  });

  const dynamicSchema = (
    role === 'librarian'
      ? baseSchema.extend({
          userId: z.string().min(1, { message: "La matrícula es obligatoria." }),
        })
      : baseSchema.extend({
          userId: z.string().optional(),
          pickupDate: z.date({
              required_error: "La fecha de retiro es obligatoria.",
          }),
        })
  ).refine(data => {
      const { pickupDate, loanDuration } = data;
      const effectivePickupDate = pickupDate || new Date();

      if (!loanDuration) return true;

      let dueDate: Date;
      const [value, unit] = loanDuration.split('-');
      switch (unit) {
          case 'weeks':
              dueDate = addWeeks(effectivePickupDate, parseInt(value));
              break;
          case 'months':
              dueDate = addMonths(effectivePickupDate, parseInt(value));
              break;
          default:
              dueDate = addDays(effectivePickupDate, 14);
      }
      return effectivePickupDate < dueDate;
  }, {
    message: "La fecha de retiro debe ser anterior a la fecha de entrega.",
    path: ["pickupDate"], 
  });


  const form = useForm<z.infer<typeof dynamicSchema>>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: {
      loanDuration: "2-weeks",
      userId: '',
    },
  });

  const calculateDueDate = (pickupDate: Date | undefined, loanDuration: string) => {
    const startDate = pickupDate || new Date();
    if (!loanDuration) return '';
    
    let dueDate: Date;
    const [value, unit] = loanDuration.split('-');

    switch (unit) {
        case 'weeks':
            dueDate = addWeeks(startDate, parseInt(value));
            break;
        case 'months':
            dueDate = addMonths(startDate, parseInt(value));
            break;
        default:
            dueDate = addDays(startDate, 14); // Default
    }
    return format(dueDate, 'yyyy-MM-dd');
  }

  function onSubmit(values: z.infer<typeof dynamicSchema>) {
    if (book.stock === 0) {
      toast({
        variant: 'destructive',
        title: '❌ No disponible',
        description: 'Este libro no tiene stock para ser prestado.',
      });
      return;
    }

    const dueDate = calculateDueDate(values.pickupDate, values.loanDuration);
    const checkoutUserId = role === 'librarian' ? values.userId! : username;

    onSuccess({ userId: checkoutUserId, dueDate });

    toast({
      title: '✅ ¡Préstamo Exitoso!',
      description: `"${book.title}" ha sido prestado a ${checkoutUserId}. La fecha de entrega es ${dueDate}.`,
    });
  }

  return (
    <div>
      <h3 className="font-semibold text-lg mb-4">Confirmar Préstamo</h3>
      <Form {...form}>
        <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            {role === 'librarian' && (
                <FormField
                    control={form.control}
                    name="userId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Matrícula del Usuario</FormLabel>
                            <FormControl>
                                <Input placeholder="a1234567890" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}

            {role === 'client' && (
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
            )}
            
            <FormField
              control={form.control}
              name="loanDuration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duración del Préstamo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona una duración" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="1-weeks">1 semana</SelectItem>
                            <SelectItem value="2-weeks">2 semanas</SelectItem>
                            <SelectItem value="3-weeks">3 semanas</SelectItem>
                            <SelectItem value="1-months">1 mes</SelectItem>
                            <SelectItem value="2-months">2 meses</SelectItem>
                            <SelectItem value="3-months">3 meses</SelectItem>
                        </SelectContent>
                    </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
        </form>
      </Form>
    </div>
  );
}
