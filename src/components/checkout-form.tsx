
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format, addDays, startOfDay, addWeeks, addMonths } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import React from 'react';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import type { Book, User } from '@/lib/types';
import { users } from '@/lib/data';
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
    name: z.string().optional(),
    curp: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    address: z.string().optional(),
  });

  const dynamicSchema = (
    role === 'librarian'
      ? baseSchema.extend({
          userId: z.string().optional(), // Matricula is optional for lookup
          name: z.string().min(1, { message: "El nombre es obligatorio." }),
          curp: z.string().min(1, { message: "La CURP es obligatoria." }),
          phone: z.string().min(1, { message: "El teléfono es obligatorio." }),
          email: z.string().email({ message: "El correo no es válido." }),
          address: z.string().min(1, { message: "La dirección es obligatoria." }),
        })
      : baseSchema.extend({
          userId: z.string().optional(),
          pickupDate: z.date({
              required_error: "La fecha de retiro es obligatoria.",
          }),
        })
  ).refine(data => {
      // This validation only applies to clients, as librarians don't set a pickup date.
      if (role === 'client') {
        const { pickupDate, loanDuration } = data;
        const effectivePickupDate = pickupDate;

        if (!loanDuration || !effectivePickupDate) return true;

        const [value, unit] = loanDuration.split('-');
        const dueDate = unit === 'weeks' ? addWeeks(effectivePickupDate, parseInt(value)) : addMonths(effectivePickupDate, parseInt(value));
        return effectivePickupDate < dueDate;
      }
      return true;
  }, {
    message: "La fecha de retiro debe ser anterior a la fecha de entrega.",
    path: ["pickupDate"], 
  });


  const form = useForm<z.infer<typeof dynamicSchema>>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: {
      loanDuration: "2-weeks",
      userId: '',
      name: '',
      curp: '',
      phone: '',
      email: '',
      address: '',
    },
  });

  const handleUserLookup = (matricula: string) => {
    if (!matricula) return;
    const clientUsername = `${matricula}@alumnos.uat.edu.mx`;
    const foundUser = users.find(u => u.username === clientUsername);

    if (foundUser) {
      form.setValue('name', foundUser.name || '');
      form.setValue('curp', foundUser.curp || '');
      form.setValue('phone', foundUser.phone || '');
      form.setValue('email', foundUser.email || '');
      form.setValue('address', foundUser.address || '');
      toast({
        title: '✅ Usuario Encontrado',
        description: `Datos de ${foundUser.name} cargados.`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: '⚠️ Usuario no encontrado',
        description: 'La matrícula no existe. Puede registrar al usuario llenando los campos manualmente.',
      });
    }
  }


  const calculateDueDate = (pickupDate: Date | undefined, loanDuration: string) => {
    // For librarians, pickup date is today. For clients, it's the selected date.
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
    
    // For librarians, if a matricula (userId) is provided, use it. Otherwise, use the user's name.
    // For clients, their username is always used.
    let checkoutUserId: string;
    if (role === 'librarian') {
        if (values.userId) {
            checkoutUserId = values.userId;
             // In a real app, you would also save the new/updated user data
            if (!users.find(u => u.username === `${values.userId}@alumnos.uat.edu.mx`)) {
                const newUser: User = {
                    username: `${values.userId}@alumnos.uat.edu.mx`,
                    password: 'password', // Default password, should be handled securely
                    role: 'client',
                    name: values.name,
                    curp: values.curp,
                    phone: values.phone,
                    email: values.email,
                    address: values.address,
                };
                users.push(newUser);
                toast({
                    title: '👤 Nuevo usuario registrado',
                    description: `El usuario con matrícula ${values.userId} ha sido creado.`,
                });
            }
        } else {
            // No matricula provided, this is a new user without one. Use their name.
            checkoutUserId = values.name!; 
            // In a real app, you'd generate a unique ID for this user.
            const newUser: User = {
                username: `${values.name!.toLowerCase().replace(/\s/g, '.')}@externos.uat.edu.mx`, // Example username
                password: 'password',
                role: 'client',
                name: values.name,
                curp: values.curp,
                phone: values.phone,
                email: values.email,
                address: values.address,
            };
            users.push(newUser);
            toast({
                title: '👤 Nuevo usuario registrado',
                description: `El usuario ${values.name} ha sido creado.`,
            });
        }
    } else {
        checkoutUserId = username;
    }

    onSuccess({ userId: checkoutUserId, dueDate });

    toast({
      title: '✅ ¡Préstamo Exitoso!',
      description: `"${book.title}" ha sido prestado a ${values.name || checkoutUserId}. La fecha de entrega es ${dueDate}.`,
    });
  }

  return (
    <>
      <h3 className="font-semibold text-lg mb-4">Confirmar Préstamo</h3>
      <Form {...form}>
        <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            {role === 'librarian' && (
              <>
                <FormField
                    control={form.control}
                    name="userId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Matrícula del Usuario (Opcional)</FormLabel>
                            <FormControl>
                                <Input 
                                    placeholder="a1234567890 (presiona Enter para buscar)" 
                                    {...field}
                                    onBlur={(e) => handleUserLookup(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleUserLookup(field.value || '');
                                        }
                                    }}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>Nombre completo</FormLabel> <FormControl><Input placeholder="John Doe" {...field} /></FormControl> <FormMessage /> </FormItem>)} />
                <FormField control={form.control} name="curp" render={({ field }) => ( <FormItem> <FormLabel>CURP</FormLabel> <FormControl><Input placeholder="ABCD123456H..." {...field} /></FormControl> <FormMessage /> </FormItem>)} />
                <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem> <FormLabel>Teléfono de contacto</FormLabel> <FormControl><Input placeholder="834-123-4567" {...field} /></FormControl> <FormMessage /> </FormItem>)} />
                <FormField control={form.control} name="email" render={({ field }) => ( <FormItem> <FormLabel>Correo electrónico</FormLabel> <FormControl><Input type="email" placeholder="john.doe@example.com" {...field} /></FormControl> <FormMessage /> </FormItem>)} />
                <FormField control={form.control} name="address" render={({ field }) => ( <FormItem> <FormLabel>Dirección</FormLabel> <FormControl><Input placeholder="123 Main St, City, Country" {...field} /></FormControl> <FormMessage /> </FormItem>)} />
              </>
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
    </>
  );
}
