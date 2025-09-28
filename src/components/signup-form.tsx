
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { UserPlus, User, Loader2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

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
import { getUsers, getUserByUsername } from '@/lib/supabase-functions';

const studentEmailRegex = /^a\d{10}@alumnos\.uat\.edu\.mx$/;
const curpRegex = /^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z]{2}$/;
const phoneRegex = /^[0-9]{10}$/;
const ADMIN_REGISTRATION_CODE = 'UAT2024';

const formSchema = z.object({
  role: z.enum(['client', 'librarian']),
  username: z.string().optional(),
  email: z.string().email("Por favor ingrese un correo válido."),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.'),
  adminCode: z.string().optional(),
  name: z.string().optional(),
  curp: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.role === 'client') {
    if (!studentEmailRegex.test(data.email)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Por favor ingrese un correo institucional válido (ej. a1234567890@alumnos.uat.edu.mx).',
        path: ['email'],
      });
    }
    if (!data.name || data.name.length < 2) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'El nombre debe tener al menos 2 caracteres.', path: ['name'] });
    }
    if (!data.curp || !curpRegex.test(data.curp)) {
      ctx.addIssue({ 
        code: z.ZodIssueCode.custom, 
        message: 'La CURP debe tener el formato correcto (ej. MAJJ990315HDFNTN01).', 
        path: ['curp'] 
      });
    }
     if (!data.phone || !phoneRegex.test(data.phone)) {
      ctx.addIssue({ 
        code: z.ZodIssueCode.custom, 
        message: 'El teléfono debe tener exactamente 10 dígitos sin espacios ni guiones (ej. 6441234567).', 
        path: ['phone'] 
      });
    }
    if (!data.address || data.address.length < 10) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'La dirección debe tener al menos 10 caracteres.', path: ['address'] });
    }
  }

  if (data.role === 'librarian') {
    if (!data.username || data.username.length < 2) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'El nombre de usuario debe tener al menos 2 caracteres.', path: ['username'] });
    }
    if (!data.name || data.name.length < 2) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'El nombre completo es obligatorio.', path: ['name'] });
    }
    if (!data.curp || !curpRegex.test(data.curp)) {
      ctx.addIssue({ 
        code: z.ZodIssueCode.custom, 
        message: 'La CURP debe tener el formato correcto (ej. GARM850301MDFRNR02).', 
        path: ['curp'] 
      });
    }
    if (!data.phone || !phoneRegex.test(data.phone)) {
      ctx.addIssue({ 
        code: z.ZodIssueCode.custom, 
        message: 'El teléfono debe tener exactamente 10 dígitos sin espacios ni guiones (ej. 6441234567).', 
        path: ['phone'] 
      });
    }
    if (!data.address || data.address.length < 10) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'La dirección debe tener al menos 10 caracteres.', path: ['address'] });
    }
    if (data.adminCode !== ADMIN_REGISTRATION_CODE) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'El código de registro de administrador no es válido.', path: ['adminCode'] });
    }
  }
});


export function SignUpForm() {
  const { toast } = useToast();
  const [role, setRole] = React.useState<'client' | 'librarian' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: 'client',
      username: '',
      email: '',
      password: '',
      adminCode: '',
      name: '',
      curp: '',
      phone: '',
      address: '',
    },
  });

  const handleRoleSelect = (selectedRole: 'client' | 'librarian') => {
    setRole(selectedRole);
    form.reset(); // Reset form values when role changes
    form.setValue('role', selectedRole); // Set the role for validation
  };
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!role) return;
    setIsLoading(true);

    try {
        let newUser: Omit<UserType, 'id'>;
        
        if (role === 'client') {
            const usernameToRegister = values.email.split('@')[0];
            newUser = {
                username: usernameToRegister,
                password: values.password,
                role: 'client',
                name: values.name!,
                curp: values.curp!,
                phone: values.phone!,
                address: values.address!,
                email: values.email, 
                status: 'active',
                createdAt: new Date().toISOString(),
            };
        } else { // librarian
            newUser = {
                username: values.username!,
                password: values.password,
                role: 'librarian',
                name: values.name!,
                curp: values.curp!,
                phone: values.phone!,
                address: values.address!,
                email: values.email,
                status: 'active',
                createdAt: new Date().toISOString(),
            };
        }
        
        // Create user using Supabase
        const success = await supabase.from('users').insert([{
            username: newUser.username,
            password: newUser.password,
            role: newUser.role,
            name: newUser.name,
            curp: newUser.curp,
            email: newUser.email,
            phone: newUser.phone,
            address: newUser.address,
            status: newUser.status,
            created_at: newUser.createdAt
        }]);
        
        if (success.error) {
            throw new Error(success.error.message);
        }
        
        toast({
            title: "✅ ¡Registro exitoso!",
            description: "Tu cuenta ha sido creada. Ahora puedes iniciar sesión."
        });
        
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
            <Button onClick={() => handleRoleSelect('client')} size="lg" className="w-full bg-primary hover:bg-primary/90">
                <User className="mr-2 h-4 w-4" />
                Soy Estudiante
            </Button>
            <Button onClick={() => handleRoleSelect('librarian')} size="lg" variant="secondary" className="w-full">
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
             <FormField control={form.control} name="role" render={({ field }) => ( <FormItem className="hidden"> <FormControl><Input {...field} /></FormControl> </FormItem>)} />
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
                <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem> <FormLabel>Teléfono de contacto</FormLabel> <FormControl><Input type="tel" placeholder="6441234567" {...field} maxLength={10} /></FormControl> <FormMessage /> </FormItem>)} />
                <FormField control={form.control} name="address" render={({ field }) => ( <FormItem> <FormLabel>Dirección</FormLabel> <FormControl><Input placeholder="Calle Falsa 123, Ciudad" {...field} maxLength={100} /></FormControl> <FormMessage /> </FormItem>)} />
              </>
            )}
            {role === 'librarian' && (
              <>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre completo</FormLabel>
                      <FormControl>
                        <Input placeholder="María García Bibliotecaria" {...field} maxLength={50} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de usuario (para login)</FormLabel>
                      <FormControl>
                        <Input placeholder="María García Bibliotecaria" {...field} maxLength={50}/>
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
                        <Input type="email" placeholder="bibliotecario@biblioteca.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="curp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CURP</FormLabel>
                      <FormControl>
                        <Input placeholder="GARM850301MDFRNR02" {...field} maxLength={18} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono de contacto</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="6441234567" {...field} maxLength={10} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección</FormLabel>
                      <FormControl>
                        <Input placeholder="Av. Universidad 123, Victoria, Tamaulipas" {...field} maxLength={100} />
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
                <Button variant="link" size="sm" onClick={() => { setRole(null);}}>
                    &larr; Volver
                </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </>
  );
}
