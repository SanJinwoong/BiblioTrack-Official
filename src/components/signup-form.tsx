'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { UserPlus } from 'lucide-react';

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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { users } from '@/lib/data'; // Assuming users are exported from data
import { useToast } from '@/hooks/use-toast';


const formSchema = z.object({
  username: z.string().min(2, {
    message: 'El nombre de usuario debe tener al menos 2 caracteres.',
  }),
  password: z.string().min(6, {
    message: 'La contraseña debe tener al menos 6 caracteres.',
  }),
  role: z.enum(['client', 'librarian'], {
    required_error: 'Debes seleccionar un rol.',
  }),
});

export function SignUpForm() {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // In a real app, you'd do this on a backend and hash passwords.
    // For this mock, we'll just add to our in-memory user array.
    const existingUser = users.find(u => u.username === values.username);
    if (existingUser) {
        toast({
            variant: "destructive",
            title: "Error de registro",
            description: "Este nombre de usuario ya está en uso.",
        });
        return;
    }
    
    // This is not persistent, will be lost on refresh.
    users.push({
        username: values.username,
        password: values.password, // In real app, HASH THIS
        role: values.role,
    });
    
    localStorage.setItem('userRole', values.role);
    localStorage.setItem('userUsername', values.username);
    router.push('/dashboard');
  }

  return (
    <Card className="w-full border-0 shadow-none">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Crear una cuenta</CardTitle>
        <CardDescription>
          Selecciona tu rol y crea tus credenciales.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usuario</FormLabel>
                  <FormControl>
                    <Input placeholder="usuario" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Rol</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="client" />
                        </FormControl>
                        <FormLabel className="font-normal">Cliente</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="librarian" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Bibliotecario
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90">
              <UserPlus className="mr-2 h-4 w-4" />
              Registrarse
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
