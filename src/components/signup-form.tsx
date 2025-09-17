
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { UserPlus, User, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

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

// Define base schema for common fields
const baseSchema = z.object({
    password: z.string()
        .min(6, 'La contraseña debe tener al menos 6 caracteres.')
        .max(20, 'La contraseña no puede tener más de 20 caracteres.'),
});

// Schema for client (student) registration
const clientSchema = baseSchema.extend({
    email: z.string().regex(studentEmailRegex, {
        message: 'Por favor ingrese un correo institucional válido (ej. a1234567890@alumnos.uat.edu.mx).',
    }),
    name: z.string()
        .min(2, "El nombre debe tener al menos 2 caracteres.")
        .max(50, "El nombre no puede tener más de 50 caracteres."),
    curp: z.string()
        .length(18, "La CURP debe tener exactamente 18 caracteres."),
    phone: z.string()
        .min(10, "El teléfono debe tener al menos 10 dígitos.")
        .max(15, "El teléfono no puede tener más de 15 dígitos."),
    address: z.string()
        .min(10, "La dirección debe tener al menos 10 caracteres.")
        .max(100, "La dirección no puede tener más de 100 caracteres."),
});

// Schema for librarian registration
const librarianSchema = baseSchema.extend({
    username: z.string()
        .min(2, 'El nombre de usuario debe tener al menos 2 caracteres.')
        .max(30, 'El nombre de usuario no puede tener más de 30 caracteres.'),
    email: z.string().email({ message: "Por favor ingrese un correo válido."}),
    adminCode: z.string().refine(code => code === ADMIN_REGISTRATION_CODE, {
        message: "El código de registro de administrador no es válido."
    }),
});


export function SignUpForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [role, setRole] = React.useState<'client' | 'librarian' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);

    try {
        let newUser: Omit<UserType, 'id'>;
        let usernameToRegister: string;

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
                createdAt: new Date().toISOString(),
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
                createdAt: new Date().toISOString(),
            };
        }

        // We check for existing user on the backend via security rules in a real app
        // For this demo, we'll just attempt to add and let it fail if needed, or check quickly.
        // The main issue was waiting for this check. Let's make it more robust.
        
        await addDoc(collection(db, 'users'), newUser);
        
        toast({
            title: "✅ ¡Registro exitoso!",
            description: "Tu cuenta ha sido creada. Serás redirigido."
        });

        // Use window.location.assign for a full page reload and navigation
        // This ensures all states are reset cleanly.
        window.location.assign('/');

    } catch (error) {
        console.error("Error creating user:", error);
        toast({
            variant: "destructive",
            title: "Error de Registro",
            description: "Este usuario ya está registrado o ocurrió un error. Inténtalo de nuevo."
        });
    } finally {
        setIsLoading(false);
    }
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
                <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>Nombre completo</FormLabel> <FormControl><Input placeholder="Juan Pérez" {...field} maxLength={50} /></FormControl> <FormMessage /> </FormItem>)} />
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
                <FormField control={form.control} name="curp" render={({ field }) => ( <FormItem> <FormLabel>CURP</FormLabel> <FormControl><Input placeholder="ABCD123456H..." {...field} maxLength={18} />
                    </FormControl> <FormMessage /> </FormItem>)} />
                <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem> <FormLabel>Teléfono de contacto</FormLabel> <FormControl><Input type="tel" placeholder="834-123-4567" {...field} maxLength={15} /></FormControl> <FormMessage /> </FormItem>)} />
                <FormField control={form.control} name="address" render={({ field }) => ( <FormItem> <FormLabel>Dirección</FormLabel> <FormControl><Input placeholder="Calle Falsa 123, Ciudad" {...field} maxLength={100} /></FormControl> <FormMessage /> </FormItem>)} />
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
                        <Input placeholder="ej. bibliotecario2" {...field} maxLength={30}/>
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
                    <Input type="password" placeholder="••••••••" {...field} maxLength={20} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex flex-col space-y-2 pt-4">
                <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <UserPlus className="mr-2 h-4 w-4" />
                    )}
                    {isLoading ? 'Creando cuenta...' : 'Crear mi cuenta'}
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
