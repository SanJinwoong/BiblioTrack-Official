
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format, addDays, startOfDay, addWeeks, addMonths } from 'date-fns';
import { Calendar as CalendarIcon, Check, ChevronsUpDown } from 'lucide-react';
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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from './ui/command';
import { Combobox } from './ui/combobox';

interface CheckoutFormProps {
  book: Book;
  username: string;
  role: 'client' | 'librarian';
  onSuccess: (data: { userId: string; dueDate: string }) => void;
  submitButton?: React.ReactNode;
}

export function CheckoutForm({ book, username, role, onSuccess, submitButton }: CheckoutFormProps) {
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

  const dynamicSchema =
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
      pickupDate: startOfDay(new Date()),
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

  const handleCurpLookup = (curp: string) => {
    if (!curp) return;
    const foundUser = users.find(u => u.curp === curp);

    if (foundUser) {
        form.setValue('name', foundUser.name || '');
        form.setValue('address', foundUser.address || '');
        toast({
            title: '✅ Usuario Encontrado por CURP',
            description: `Datos de ${foundUser.name} cargados.`,
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
    let checkoutUserId: string;
    let toastDescriptionName: string;

    if (role === 'librarian') {
        const matricula = values.userId;
        const userName = values.name!;

        if (matricula) {
            checkoutUserId = matricula;
            const clientUsername = `${matricula}@alumnos.uat.edu.mx`;
            const foundUser = users.find(u => u.username === clientUsername);

            if (!foundUser) {
                // Register new user if matricula doesn't exist
                const newUser: User = {
                    username: clientUsername,
                    password: 'password', // Default password, should be handled securely
                    role: 'client',
                    name: userName,
                    curp: values.curp!,
                    phone: values.phone!,
                    email: values.email!,
                    address: values.address!,
                };
                users.push(newUser);
                toast({
                    title: '👤 Nuevo usuario registrado',
                    description: `El usuario con matrícula ${matricula} ha sido creado.`,
                });
            }
        } else {
            // Register new user without matricula
            checkoutUserId = userName;
            const newUser: User = {
                username: `${userName.toLowerCase().replace(/\s/g, '.')}@externos.uat.edu.mx`, // Example username
                password: 'password',
                role: 'client',
                name: userName,
                curp: values.curp!,
                phone: values.phone!,
                email: values.email!,
                address: values.address!,
            };
            users.push(newUser);
            toast({
                title: '👤 Nuevo usuario registrado',
                description: `El usuario ${userName} ha sido creado.`,
            });
        }
        toastDescriptionName = userName;
    } else {
        // Client role
        checkoutUserId = username;
        toastDescriptionName = username;
    }

    onSuccess({ userId: checkoutUserId, dueDate });

    toast({
      title: '✅ ¡Préstamo Exitoso!',
      description: `"${book.title}" ha sido prestado a ${toastDescriptionName}. La fecha de entrega es ${dueDate}.`,
    });
  }
  
  const userOptions = users
    .filter(user => user.role === 'client' && user.username.includes('@alumnos.uat.edu.mx'))
    .map(user => ({
      value: user.username.split('@')[0],
      label: user.username.split('@')[0],
    }));


  return (
    <>
      <h3 className="font-semibold text-lg mb-4">Confirmar Préstamo</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            {role === 'librarian' && (
              <>
                <FormField
                    control={form.control}
                    name="userId"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Matrícula del Usuario</FormLabel>
                            <Combobox
                                options={userOptions}
                                value={field.value || ''}
                                onChange={(value) => {
                                    form.setValue('userId', value);
                                    handleUserLookup(value);
                                }}
                                placeholder="Busca o escribe una matrícula..."
                                emptyText="No se encontró ninguna matrícula."
                            />
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>Nombre completo</FormLabel> <FormControl><Input placeholder="John Doe" {...field} /></FormControl> <FormMessage /> </FormItem>)} />
                <FormField 
                    control={form.control} 
                    name="curp" 
                    render={({ field }) => ( 
                        <FormItem> 
                            <FormLabel>CURP</FormLabel> 
                            <FormControl>
                                <Input 
                                    placeholder="ABCD123456H..." 
                                    {...field} 
                                    onBlur={(e) => handleCurpLookup(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleCurpLookup(field.value || '');
                                        }
                                    }}
                                />
                            </FormControl> 
                            <FormMessage /> 
                        </FormItem>
                    )} 
                />
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
          {submitButton && <div className="pt-4">{submitButton}</div>}
        </form>
      </Form>
    </>
  );
}

    