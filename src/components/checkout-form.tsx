
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format, addDays, startOfDay, addWeeks, addMonths } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import React, { useState, useEffect } from 'react';


import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import type { Book, User, LibraryPolicies } from '@/lib/types';
import { addCheckout, getUsers, addUser, getLibraryPolicies, getCheckouts } from '@/lib/supabase-functions';
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
import { Combobox } from './ui/combobox';

interface CheckoutFormProps {
  book: Book;
  username: string;
  role: 'client' | 'librarian';
  onSuccess: (data: { userId: string; dueDate: string }) => void;
  onCancel: () => void;
}

// Separate schemas for clarity and robustness
const clientSchema = z.object({
  loanDuration: z.string().min(1, "Debes seleccionar una duración."),
  pickupDate: z.date({
    required_error: "La fecha de retiro es obligatoria.",
  }),
});

const librarianSchema = z.object({
  loanDuration: z.string().min(1, "Debes seleccionar una duración."),
  userId: z.string().optional(), // Matricula is optional for lookup
  name: z.string().min(1, { message: "El nombre es obligatorio." }),
  curp: z.string().min(1, { message: "La CURP es obligatoria." }),
  phone: z.string().min(1, { message: "El teléfono es obligatorio." }),
  email: z.string().email({ message: "El correo no es válido." }),
  address: z.string().min(1, { message: "La dirección es obligatoria." }),
});

// Union schema for typing convenience, resolver will use the correct one.
const formSchema = z.union([clientSchema, librarianSchema]);

export function CheckoutForm({ book, username, role, onSuccess, onCancel }: CheckoutFormProps) {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [policies, setPolicies] = useState<LibraryPolicies | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersData, policiesData] = await Promise.all([
          getUsers(),
          getLibraryPolicies()
        ]);
        setUsers(usersData);
        setPolicies(policiesData);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadData();
  }, []);

  const currentSchema = role === 'client' ? clientSchema : librarianSchema;
  const form = useForm<any>({
    resolver: zodResolver(currentSchema as any),
    defaultValues:
      role === 'client'
        ? {
            loanDuration: "2-weeks",
            pickupDate: startOfDay(new Date()),
          }
        : {
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
    if (!matricula) {
        // Clear fields if matricula is empty
        form.setValue('name', '');
        form.setValue('curp', '');
        form.setValue('phone', '');
        form.setValue('email', '');
        form.setValue('address', '');
        return;
    }
    
    // Buscar por múltiples criterios
    const foundUser = users.find(u => {
      // Buscar por matrícula extraída del email
      const userMatricula = u.email?.includes('@alumnos.uat.edu.mx') 
        ? u.email.split('@')[0] 
        : u.username;
      
      return userMatricula === matricula || 
             u.username === matricula ||
             u.email === `${matricula}@alumnos.uat.edu.mx` ||
             u.curp === matricula.toUpperCase() ||
             u.name?.toLowerCase().includes(matricula.toLowerCase());
    });

    if (foundUser) {
      form.setValue('name', foundUser.name);
      form.setValue('curp', foundUser.curp);
      form.setValue('phone', foundUser.phone);
      form.setValue('email', foundUser.email);
      form.setValue('address', foundUser.address);
      toast({
        title: '✅ Usuario Encontrado',
        description: `Datos de ${foundUser.name} cargados automáticamente.`,
      });
    } else {
      // Limpiar campos para nuevo usuario
      form.setValue('name', '');
      form.setValue('curp', '');
      form.setValue('phone', '');
      form.setValue('email', `${matricula}@alumnos.uat.edu.mx`);
      form.setValue('address', '');
      toast({
        title: 'ℹ️ Usuario nuevo',
        description: 'Complete los datos para registrar este nuevo usuario.',
      });
    }
  }

  const handleCurpLookup = (curp: string) => {
    if (!curp) return;
    const foundUser = users.find(u => u.curp === curp);

    if (foundUser) {
        form.setValue('name', foundUser.name);
        form.setValue('address', foundUser.address);
        toast({
            title: '✅ Usuario Encontrado por CURP',
            description: `Datos de ${foundUser.name} cargados.`,
        });
    }
  }


  const calculateDueDate = (pickupDate: Date | undefined, loanDuration: string) => {
    const startDate = role === 'client' ? pickupDate : new Date();
    if (!startDate || !loanDuration) return '';
    
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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (book.stock === 0) {
      toast({
        variant: 'destructive',
        title: '❌ No disponible',
        description: 'Este libro no tiene stock para ser prestado.',
      });
      return;
    }

    // Get library policies and validate max loans
    try {
      const policies = await getLibraryPolicies();
      let userIdToCheck = '';
      
      if (role === 'librarian') {
        const librarianValues = values as z.infer<typeof librarianSchema>;
        
        // Buscar usuario existente por matrícula/identificador ingresado
        if (librarianValues.userId) {
          const foundUser = users.find(u => {
            const userMatricula = u.email?.includes('@alumnos.uat.edu.mx') 
              ? u.email.split('@')[0] 
              : u.username;
            
            return userMatricula === librarianValues.userId || 
                   u.username === librarianValues.userId ||
                   u.email === `${librarianValues.userId}@alumnos.uat.edu.mx` ||
                   (librarianValues.userId && u.curp === librarianValues.userId.toUpperCase());
          });
          
          userIdToCheck = foundUser ? foundUser.id : librarianValues.userId; // fallback si no se encuentra UUID
        } else {
          const found = users.find(u => u.name === librarianValues.name);
          userIdToCheck = found ? found.id : librarianValues.name!; // fallback nombre
        }
      } else {
        // Cliente: necesitamos el UUID real, no el username
        const currentUser = users.find(u => u.username === username);
        if (!currentUser) {
          toast({
            variant: 'destructive',
            title: '❌ Usuario no encontrado',
            description: 'No se pudo resolver tu usuario. Intenta recargar la página.'
          });
          return;
        }
        userIdToCheck = currentUser.id; // UUID correcto
      }
      
      const currentCheckouts = await getCheckouts();
      const userActiveLoans = currentCheckouts.filter(
        checkout => checkout.userId === userIdToCheck && checkout.status === 'approved'
      );
      
      if (userActiveLoans.length >= (policies?.maxLoans || 3)) {
        toast({
          variant: 'destructive',
          title: '❌ Límite de préstamos alcanzado',
          description: `Este usuario ya tiene ${userActiveLoans.length} libros prestados. El máximo permitido es ${policies?.maxLoans || 3}.`,
        });
        return;
      }
    } catch (error) {
      console.error('Error validating policies:', error);
      toast({
        variant: 'destructive',
        title: '❌ Error de validación',
        description: 'No se pudo validar las políticas de préstamo.',
      });
      return;
    }

    let checkoutUserId: string;
    let toastDescriptionName: string;
    let dueDate: string;

    if (role === 'librarian') {
        const librarianValues = values as z.infer<typeof librarianSchema>;
        const searchTerm = librarianValues.userId;
        const userName = librarianValues.name!;
        dueDate = calculateDueDate(undefined, librarianValues.loanDuration);

        // Buscar usuario existente primero
        let foundUser = users.find(u => {
          const userMatricula = u.email?.includes('@alumnos.uat.edu.mx') 
            ? u.email.split('@')[0] 
            : u.username;
          
          return userMatricula === searchTerm || 
                 u.username === searchTerm ||
                 u.email === `${searchTerm}@alumnos.uat.edu.mx` ||
                 (searchTerm && u.curp === searchTerm.toUpperCase());
        });

        if (foundUser) {
          // Usuario existe, usar su UUID
          checkoutUserId = foundUser.id;
          toastDescriptionName = foundUser.name;
        } else if (searchTerm) {
          // Usuario nuevo, crear con matrícula
          const clientUsername = `${searchTerm}@alumnos.uat.edu.mx`;
          const newUser: Omit<User, 'id'> = {
            username: clientUsername, 
            password: 'password', 
            role: 'client',
            name: userName, 
            curp: librarianValues.curp!, 
            phone: librarianValues.phone!, 
            email: librarianValues.email!, 
            address: librarianValues.address!, 
            status: 'active'
          };
          
          const createdUser = await addUser(newUser);
          checkoutUserId = createdUser.id;
          toastDescriptionName = userName;
          
          toast({ 
            title: '👤 Nuevo usuario registrado', 
            description: `El usuario ${userName} con matrícula ${searchTerm} ha sido creado.` 
          });
        } else {
          // Sin matrícula, crear usuario externo
          const externalUsername = `${userName.toLowerCase().replace(/\s/g, '.')}@externos.uat.edu.mx`;
          const newUser: Omit<User, 'id'> = {
            username: externalUsername, 
            password: 'password', 
            role: 'client',
            name: userName, 
            curp: librarianValues.curp!, 
            phone: librarianValues.phone!, 
            email: librarianValues.email!, 
            address: librarianValues.address!, 
            status: 'active'
          };
          
          const createdUser = await addUser(newUser);
          checkoutUserId = createdUser.id;
          toastDescriptionName = userName;
          
          toast({ 
            title: '👤 Nuevo usuario externo registrado', 
            description: `El usuario ${userName} ha sido creado como externo.` 
          });
        }

        onSuccess({ userId: checkoutUserId, dueDate });

        toast({
            title: '✅ ¡Préstamo Directo Exitoso!',
            description: `"${book.title}" ha sido prestado a ${toastDescriptionName}. La fecha de entrega es ${dueDate}.`,
        });

    } else {
        // Client role
        const clientValues = values as z.infer<typeof clientSchema>;
        const currentUser = users.find(u => u.username === username);
        if (!currentUser) {
          toast({
            variant: 'destructive',
            title: '❌ Usuario no encontrado',
            description: 'No se pudo enviar la solicitud porque el usuario no existe en memoria.'
          });
          return;
        }
        checkoutUserId = currentUser.id; // UUID
        toastDescriptionName = currentUser.name || username;
        dueDate = calculateDueDate(clientValues.pickupDate, clientValues.loanDuration);
        onSuccess({ userId: checkoutUserId, dueDate });
        
        toast({
            title: '✅ ¡Solicitud Enviada!',
            description: `Tu solicitud para "${book.title}" ha sido enviada. Recibirás una notificación cuando sea aprobada.`,
        });
    }
  }
  
  const userOptions = users
    .filter(user => user.role === 'client')
    .map(user => {
      // Extraer matrícula del email o usar username
      const matricula = user.email?.includes('@alumnos.uat.edu.mx') 
        ? user.email.split('@')[0] 
        : user.username;
      
      const displayName = user.name ? `${user.name} - ${matricula}` : matricula;
      return {
        value: matricula,
        label: displayName,
        searchable: `${matricula} ${user.name || ''} ${user.email || ''} ${user.curp || ''}`.toLowerCase()
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));


  return (
    <>
      <h3 className="font-semibold text-lg mb-4">{role === 'client' ? 'Solicitar Préstamo' : 'Préstamo Directo'}</h3>
      <Form {...form}>
        <form id="checkout-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            {role === 'librarian' && (
              <>
                <FormField
                    control={form.control}
                    name="userId"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Buscar Usuario</FormLabel>
                            <Combobox
                                options={userOptions}
                                value={field.value || ''}
                                onChange={(value) => {
                                    form.setValue('userId', value, { shouldValidate: true });
                                    handleUserLookup(value);
                                }}
                                placeholder="Buscar por matrícula, nombre o CURP..."
                                emptyText={`${userOptions.length > 0 ? 'No se encontró el usuario' : 'Cargando usuarios'}. Puedes crear uno nuevo llenando los campos.`}
                            />
                            <p className="text-xs text-muted-foreground">
                              Busca entre {userOptions.length} usuarios por matrícula, nombre o CURP. Escribe una nueva matrícula para crear un usuario.
                            </p>
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
                                            const values = form.getValues();
                                            if ('curp' in values) {
                                                handleCurpLookup(values.curp || '');
                                            }
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
                          {policies?.loanDurationOptions?.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          )) || [
                            <SelectItem key="1-weeks" value="1-weeks">1 semana</SelectItem>,
                            <SelectItem key="2-weeks" value="2-weeks">2 semanas</SelectItem>,
                            <SelectItem key="3-weeks" value="3-weeks">3 semanas</SelectItem>,
                            <SelectItem key="1-months" value="1-months">1 mes</SelectItem>
                          ]}
                        </SelectContent>
                    </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
        </form>
      </Form>
       <div className='flex justify-end gap-2 mt-6'>
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" form="checkout-form">
              Confirmar
          </Button>
        </div>
    </>
  );
}
