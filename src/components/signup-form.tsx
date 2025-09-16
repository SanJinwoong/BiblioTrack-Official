
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

const baseSchema = z.object({
    password: z.string().min(6, {
        message: 'Password must be at least 6 characters.',
    }),
});

const clientSchema = baseSchema.extend({
    email: z.string().regex(studentEmailRegex, {
        message: 'Please enter a valid institutional email (e.g., a1234567890@alumnos.uat.edu.mx).',
    }),
    name: z.string().min(1, { message: "Name is required." }),
    curp: z.string().min(1, { message: "CURP is required." }),
    phone: z.string().min(1, { message: "Phone is required." }),
    address: z.string().min(1, { message: "Address is required." }),
    username: z.string().optional(),
    librarianId: z.string().optional(),
});

const librarianSchema = baseSchema.extend({
    username: z.string().min(2, {
        message: 'Username must be at least 2 characters.',
    }),
    email: z.string().optional(),
    librarianId: z.string().min(1, { message: "Please enter your librarian ID."}),
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
      librarianId: '',
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
            status: 'active',
        };
    } else { // librarian
        const librarianValues = values as z.infer<typeof librarianSchema>;
        usernameToRegister = librarianValues.username;
        newUser = {
            username: usernameToRegister,
            password: librarianValues.password,
            role: 'librarian',
            status: 'active',
        };
    }

    const existingUser = users.find(u => u.username === usernameToRegister);
    if (existingUser) {
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: "This username is already taken. Please choose another one.",
        });
        return;
    }
    
    await addDoc(collection(db, 'users'), newUser);
    
    localStorage.setItem('userRole', role);

    if (role === 'client') {
      const matricula = newUser.username.split('@')[0];
      localStorage.setItem('userUsername', matricula);
    } else {
      localStorage.setItem('userUsername', newUser.username);
    }
    
    router.push('/dashboard');
    toast({
        title: "✅ Sign-up successful!",
        description: "Your account has been created and you've been logged in."
    });
  }

  if (!role) {
    return (
      <>
        <CardHeader className="px-0 pt-0">
            <CardTitle className="text-2xl">Choose your Role</CardTitle>
            <CardDescription>
            Tell us what kind of account you need to get started.
            </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4 pt-4 px-0 pb-0">
            <Button onClick={() => setRole('client')} size="lg" className="w-full bg-primary hover:bg-primary/90">
                <User className="mr-2 h-4 w-4" />
                I'm a Student
            </Button>
            <Button onClick={() => setRole('librarian')} size="lg" variant="secondary" className="w-full">
                <Library className="mr-2 h-4 w-4" />
                I'm a Librarian
            </Button>
        </CardContent>
      </>
    )
  }

  return (
    <>
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-2xl">Create {role === 'client' ? 'Student' : 'Librarian'} Account</CardTitle>
        <CardDescription>
          It&apos;s quick and easy! Start exploring the library now.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {role === 'client' && (
              <>
                <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>Full name</FormLabel> <FormControl><Input placeholder="John Doe" {...field} /></FormControl> <FormMessage /> </FormItem>)} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Institutional Email</FormLabel>
                    <FormControl>
                      <Input placeholder="a1234567890@alumnos.uat.edu.mx" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
                />
                <FormField control={form.control} name="curp" render={({ field }) => ( <FormItem> <FormLabel>CURP</FormLabel> <FormControl><Input placeholder="ABCD123456H..." {...field} />
                    </FormControl> <FormMessage /> </FormItem>)} />
                <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem> <FormLabel>Contact phone</FormLabel> <FormControl><Input placeholder="834-123-4567" {...field} /></FormControl> <FormMessage /> </FormItem>)} />
                <FormField control={form.control} name="address" render={({ field }) => ( <FormItem> <FormLabel>Address</FormLabel> <FormControl><Input placeholder="123 Main St, City, Country" {...field} /></FormControl> <FormMessage /> </FormItem>)} />
              </>
            )}
            {role === 'librarian' && (
              <>
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. library-admin" {...field} />
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
                     <FormLabel>Librarian ID</FormLabel>
                     <FormControl>
                       <Input placeholder="Enter your staff ID" {...field} />
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
                  <FormLabel>Password</FormLabel>
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
                    Create my account
                </Button>
                <Button variant="link" size="sm" onClick={() => { form.reset(); setRole(null);}}>
                    &larr; Go back
                </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </>
  );
}
