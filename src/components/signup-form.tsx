
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { UserPlus, User } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot } from 'firebase/firestore';

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
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { User as UserType } from '@/lib/types';
import { Library } from '@/components/icons/uat-logo';
import { db } from '@/lib/firebase';

const studentEmailRegex = /^a\d{10}@alumnos\.uat\.edu\.mx$/;
const ADMIN_REGISTRATION_CODE = 'SUPER_SECRET_CODE';

const baseSchema = z.object({
    password: z.string().min(6, {
        message: 'La contraseña debe tener al menos 6 caracteres.',
    }),
});

const clientSchema = baseSchema.extend({
    email: z.string().regex(studentEmailRegex, {
        message: 'Por favor ingrese un correo institucional válido (ej. a1234567890@alumnos.uat.edu.mx).',
    }),
    name: z.string().min(1, { message: "El nombre es obligatorio." }),
    curp: z.string().min(1, { message: "La CURP es obligatoria." }),
    phone: z.string().min(1, { message: "El teléfono es obligatorio." }),
    address: z.string().min(1, { message: "La dirección es obligatoria." }),
});

const librarianSchema = baseSchema.extend({
    username: z.string().min(2, {
        message: 'El nombre de usuario debe tener al menos 2 caracteres.',
    }),
    email: z.string().email({ message: "Por favor ingrese un correo válido."}),
    adminCode: z.string().refine(code => code === ADMIN_REGISTRATION_CODE, {
        message: "El código de registro de administrador no es válido."
    }),
});


export function SignUpForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [role, setRole] = React.useState<'client' | 'librarian' | null>(null);
  const [users, setUsers] = useState<UserType[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), snapshot => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserType)));
    });
    return () => unsubscribe();
  }, []);

  const formSchema = role === 'client' ? clientSchema : (role === 'librarian' ? librarianSchema : z.object({}));

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      adminCode: '',
      name: '',
      curp: '',
      phone: '',
      address: '',
    },
    shouldUnregister: true,
  });
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!role) return;

    let usernameToRegister: string;
    let newUser: Omit<UserType, 'id'>;
    
    if (role === 'client') {
        const clientValues = values as z.infer<typeof clientSchema>;
        usernameToRegister = clientValues.email.split('@')[0];
        newUser = {
            username: usernameToRegister,
            password: clientValues.password,
            role: 'client',
            name: clientValues.name,
            curp: clientValues.curp,
            phone: clientValues.phone,
            address: clientValues.address,
            email: clientValues.email, 
            status: 'active',
        };
    } else { // librarian
        const librarianValues = values as z.infer<typeof librarianSchema>;
        usernameToRegister = librarianValues.username;
        newUser = {
            username: usernameToRegister,
            password: librarianValues.password,
            role: 'librarian',
            email: librarianValues.email,
            status: 'active',
        };
    }

    const existingUser = users.find(u => u.username === usernameToRegister);
    if (existingUser) {
        toast({
            variant: "destructive",
            title: "¡Ups! Ocurrió un error.",
            description: "Este nombre de usuario ya está registrado. Por favor, elige otro.",
        });
        return;
    }
    
    await addDoc(collection(db, 'users'), newUser);
    
    localStorage.setItem('userRole', role);
    localStorage.setItem('userUsername', newUser.username);
    
    router.push('/dashboard');
    toast({
        title: "✅ ¡Registro exitoso!",
        description: "Tu cuenta ha sido creada y has iniciado sesión."
    });
  }

  if (!role) {
    return (
      <>
        <CardHeader className="px-0 pt-0">
            <CardTitle className="text-2xl">Elige tu Rol</CardTitle>
            <CardDescription>
            Dinos qué tipo de cuenta necesitas para empezar.
            </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4 pt-4 px-0 pb-0">
            <Button onClick={() => setRole('client')} size="lg" className="w-full bg-primary hover:bg-primary/90">
                <User className="mr-2 h-4 w-4" />
                Soy Estudiante
            </Button>
            <Button onClick={() => setRole('librarian')} size="lg" variant="secondary" className="w-full">
                <Library className="mr-2 h-4 w-4" />
                Soy Bibliotecario
            </Button>
        </CardContent>
      </>
    )
  }

  return (
    <>
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-2xl">Crear Cuenta de {role === 'client' ? 'Estudiante' : 'Bibliotecario'}</CardTitle>
        <CardDescription>
          ¡Es rápido y fácil! Comienza a explorar la biblioteca ahora.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {role === 'client' && (
              <>
                <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>Nombre completo</FormLabel> <FormControl><Input placeholder="Juan Pérez" {...field} /></FormControl> <FormMessage /> </FormItem>)} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Institucional</FormLabel>
                    <FormControl>
                      <Input placeholder="a1234567890@alumnos.uat.edu.mx" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
                />
                <FormField control={form.control} name="curp" render={({ field }) => ( <FormItem> <FormLabel>CURP</FormLabel> <FormControl><Input placeholder="ABCD123456H..." {...field} />
                    </FormControl> <FormMessage /> </FormItem>)} />
                <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem> <FormLabel>Teléfono de contacto</FormLabel> <FormControl><Input placeholder="834-123-4567" {...field} /></FormControl> <FormMessage /> </FormItem>)} />
                <FormField control={form.control} name="address" render={({ field }) => ( <FormItem> <FormLabel>Dirección</FormLabel> <FormControl><Input placeholder="Calle Falsa 123, Ciudad" {...field} /></FormControl> <FormMessage /> </FormItem>)} />
              </>
            )}
            {role === 'librarian' && (
              <>
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de usuario</FormLabel>
                      <FormControl>
                        <Input placeholder="ej. bibliotecario2" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo electrónico</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="tu@correo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                 control={form.control}
                 name="adminCode"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>Código de Registro de Administrador</FormLabel>
                     <FormControl>
                       <Input type="password" placeholder="Ingresa el código secreto" {...field} />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
              </>
            )}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex flex-col space-y-2 pt-4">
                <Button type="submit" size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Crear mi cuenta
                </Button>
                <Button variant="link" size="sm" onClick={() => { form.reset(); setRole(null);}}>
                    &larr; Volver
                </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </>
  );
}

    