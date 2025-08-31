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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { users } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

const studentEmailRegex = /^a\d{10}@alumnos\.uat\.edu\.mx$/;

const formSchema = z.object({
  username: z.string().min(2, {
    message: 'El nombre de usuario debe tener al menos 2 caracteres.',
  }).optional(),
  email: z.string().regex(studentEmailRegex, {
    message: 'Por favor ingrese un correo institucional válido (ej: a1234567890@alumnos.uat.edu.mx).',
  }).optional(),
  password: z.string().min(6, {
    message: 'La contraseña debe tener al menos 6 caracteres.',
  }),
  librarianId: z.string().optional(),
}).refine(data => (data.role === 'client' ? !!data.email : !!data.username), {
    message: "El campo es requerido",
    path: ["username"], // you can use any field name here
});


export function SignUpForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [role, setRole] = React.useState<'client' | 'librarian' | null>(null);

  const form = useForm<z.infer<typeof formSchema> & {role: 'client' | 'librarian' | null}>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: null,
      username: '',
      email: '',
      password: '',
      librarianId: '',
    },
  });
  
  React.useEffect(() => {
    form.setValue('role', role);
  }, [role, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!role) return;

    const usernameToRegister = role === 'client' ? values.email! : values.username!;

    const existingUser = users.find(u => u.username === usernameToRegister);
    if (existingUser) {
        toast({
            variant: "destructive",
            title: "❌ Error de registro",
            description: "Este usuario ya está en uso. Por favor, elige otro.",
        });
        return;
    }
    
    if (role === 'librarian' && !values.librarianId) {
        toast({
            variant: "destructive",
            title: "❌ Error de registro",
            description: "Por favor, ingrese su ID de bibliotecario.",
        });
        return;
    }
    
    users.push({
        username: usernameToRegister,
        password: values.password,
        role: role,
    });
    
    localStorage.setItem('userRole', role);

    if (role === 'client') {
      const matricula = values.email!.split('@')[0];
      localStorage.setItem('userUsername', matricula);
    } else {
      localStorage.setItem('userUsername', usernameToRegister);
    }
    
    router.push('/dashboard');
    toast({
        title: "✅ ¡Registro exitoso!",
        description: "Tu cuenta ha sido creada y has iniciado sesión."
    });
  }

  if (!role) {
    return (
        <Card className="w-full border-0 shadow-none">
            <CardHeader className="text-center">
                <CardTitle className="font-headline text-2xl">Elige tu tipo de cuenta</CardTitle>
                <CardDescription>
                Para comenzar, dinos si eres un nuevo cliente o un bibliotecario.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col space-y-4">
                <Button onClick={() => setRole('client')} className="w-full">
                    <User className="mr-2 h-4 w-4" />
                    Soy un nuevo cliente (Alumno)
                </Button>
                <Button onClick={() => setRole('librarian')} variant="outline" className="w-full">
                    <Library className="mr-2 h-4 w-4" />
                    Tengo un ID de bibliotecario
                </Button>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card className="w-full border-0 shadow-none">
      <CardHeader className="text-center">
        <CardTitle className="font-headline text-2xl">Crear una cuenta de {role === 'client' ? 'Alumno' : 'Bibliotecario'}</CardTitle>
        <CardDescription>
          ¡Es rápido y fácil! Empieza a explorar la biblioteca ahora.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {role === 'client' && (
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Institucional</FormLabel>
                    <FormControl>
                      <Input placeholder="a1234567890@alumnos.uat.edu.mx" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {role === 'librarian' && (
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Elige un nombre de usuario</FormLabel>
                    <FormControl>
                      <Input placeholder="ej: biblio-admin" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Crea una contraseña segura</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {role === 'librarian' && (
                 <FormField
                 control={form.control}
                 name="librarianId"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>ID de Bibliotecario</FormLabel>
                     <FormControl>
                       <Input placeholder="Ingresa tu ID" {...field} />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
            )}
            <div className="flex flex-col space-y-4">
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90">
                <UserPlus className="mr-2 h-4 w-4" />
                Registrarme
                </Button>
                <Button variant="link" size="sm" onClick={() => setRole(null)}>
                    Volver a la selección de rol
                </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
