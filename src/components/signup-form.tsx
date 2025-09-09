
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { UserPlus, Library, User } from 'lucide-react';
import React from 'react';

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
import { users } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import type { User as UserType } from '@/lib/types';

const studentEmailRegex = /^a\d{10}@alumnos\.uat\.edu\.mx$/;

const baseSchema = z.object({
    password: z.string().min(6, {
        message: 'La contraseña debe tener al menos 6 caracteres.',
    }),
});

const clientSchema = baseSchema.extend({
    email: z.string().regex(studentEmailRegex, {
        message: 'Por favor ingrese un correo institucional válido (ej: a1234567890@alumnos.uat.edu.mx).',
    }),
    name: z.string().min(1, { message: "El nombre es obligatorio." }),
    curp: z.string().min(1, { message: "La CURP es obligatoria." }),
    phone: z.string().min(1, { message: "El teléfono es obligatorio." }),
    address: z.string().min(1, { message: "La dirección es obligatoria." }),
    username: z.string().optional(),
    librarianId: z.string().optional(),
});

const librarianSchema = baseSchema.extend({
    username: z.string().min(2, {
        message: 'El nombre de usuario debe tener al menos 2 caracteres.',
    }),
    email: z.string().optional(),
    librarianId: z.string().min(1, { message: "Por favor, ingrese su ID de bibliotecario."}),
});


export function SignUpForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [role, setRole] = React.useState<'client' | 'librarian' | null>(null);

  const formSchema = role === 'client' ? clientSchema : (role === 'librarian' ? librarianSchema : z.object({}));

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      librarianId: '',
      name: '',
      curp: '',
      phone: '',
      address: '',
    },
    shouldUnregister: true,
  });
  
  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!role) return;

    let usernameToRegister: string;
    let newUser: UserType;
    
    if (role === 'client') {
        const clientValues = values as z.infer<typeof clientSchema>;
        usernameToRegister = clientValues.email;
        newUser = {
            username: usernameToRegister,
            password: clientValues.password,
            role: 'client',
            name: clientValues.name,
            curp: clientValues.curp,
            phone: clientValues.phone,
            address: clientValues.address,
            email: usernameToRegister, // Using institutional email as the primary contact for clients
        };
    } else { // librarian
        const librarianValues = values as z.infer<typeof librarianSchema>;
        usernameToRegister = librarianValues.username;
        newUser = {
            username: usernameToRegister,
            password: librarianValues.password,
            role: 'librarian',
        };
    }

    const existingUser = users.find(u => u.username === usernameToRegister);
    if (existingUser) {
        toast({
            variant: "destructive",
            title: "❌ Error de registro",
            description: "Este usuario ya está en uso. Por favor, elige otro.",
        });
        return;
    }
    
    users.push(newUser);
    
    localStorage.setItem('userRole', role);

    if (role === 'client') {
      const matricula = newUser.username.split('@')[0];
      localStorage.setItem('userUsername', matricula);
    } else {
      localStorage.setItem('userUsername', newUser.username);
    }
    
    router.push('/dashboard');
    toast({
        title: "✅ ¡Registro exitoso!",
        description: "Tu cuenta ha sido creada y has iniciado sesión."
    });
  }

  if (!role) {
    return (
      <>
        <CardHeader className="px-0">
            <CardTitle className="font-headline text-3xl">Elige tu rol</CardTitle>
            <CardDescription>
            Dinos qué tipo de cuenta necesitas para empezar.
            </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4 pt-6 px-0">
            <Button onClick={() => setRole('client')} size="lg" className="w-full">
                <User className="mr-2 h-4 w-4" />
                Soy Alumno
            </Button>
            <Button onClick={() => setRole('librarian')} size="lg" variant="outline" className="w-full">
                <Library className="mr-2 h-4 w-4" />
                Soy Bibliotecario
            </Button>
        </CardContent>
      </>
    )
  }

  return (
    <>
      <CardHeader className="px-0">
        <CardTitle className="font-headline text-3xl">Crear una cuenta de {role === 'client' ? 'Alumno' : 'Bibliotecario'}</CardTitle>
        <CardDescription>
          ¡Es rápido y fácil! Empieza a explorar la biblioteca ahora.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {role === 'client' && (
              <>
                <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>Nombre completo</FormLabel> <FormControl><Input placeholder="John Doe" {...field} /></FormControl> <FormMessage /> </FormItem>)} />
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
                <FormField control={form.control} name="address" render={({ field }) => ( <FormItem> <FormLabel>Dirección</FormLabel> <FormControl><Input placeholder="123 Main St, City, Country" {...field} /></FormControl> <FormMessage /> </FormItem>)} />
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
                        <Input placeholder="ej: biblio-admin" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                 control={form.control}
                 name="librarianId"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>ID de Bibliotecario</FormLabel>
                     <FormControl>
                       <Input placeholder="Ingresa tu ID de personal" {...field} />
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
                <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary/90">
                <UserPlus className="mr-2 h-4 w-4" />
                Crear mi cuenta
                </Button>
                <Button variant="link" size="sm" onClick={() => { form.reset(); setRole(null);}}>
                    &larr; Volver a la selección de rol
                </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </>
  );
}
