
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Book, Category, User } from '@/lib/types';
import { Input } from './ui/input';
import { useForm, useForm as useHookForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { PlusCircle, Trash2, Edit, X, Search, UserX, UserCheck, Settings as SettingsIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Badge } from './ui/badge';
import { Label } from './ui/label';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  books: Book[];
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  onEditBook: (book: Book) => void;
  onDeleteBook: (bookId: string) => void;
  users: User[];
  onUserStatusChange: (userId: string, reactivate: boolean) => void;
}

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required.'),
});

const policySchema = z.object({
  maxLoans: z.coerce.number().int().min(1, 'Must be at least 1.'),
  gracePeriod: z.coerce.number().int().min(0, 'Cannot be negative.'),
});

export function SettingsDialog({ open, onOpenChange, books, categories, setCategories, onEditBook, onDeleteBook, users, onUserStatusChange }: SettingsDialogProps) {
  const { toast } = useToast();
  const [bookSearchTerm, setBookSearchTerm] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  
  const categoryForm = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '' },
  });

  const policyForm = useHookForm({
      resolver: zodResolver(policySchema),
      defaultValues: {
          maxLoans: 3,
          gracePeriod: 7,
      }
  });

  const handleAddCategory = (data: { name: string }) => {
    if (categories.some(cat => cat.name.toLowerCase() === data.name.toLowerCase())) {
        toast({
            variant: 'destructive',
            title: 'Category exists',
            description: `A category named "${data.name}" already exists.`,
        });
        return;
    }
    const newCategory: Category = {
      id: data.name.toLowerCase().replace(/\s+/g, '-'),
      name: data.name,
    };
    setCategories(prev => [...prev, newCategory]);
    categoryForm.reset();
    toast({
        title: 'Category Added',
        description: `"${data.name}" has been added.`,
    })
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (books.some(book => book.category === categories.find(c => c.id === categoryId)?.name)) {
        toast({
            variant: 'destructive',
            title: 'Cannot delete category',
            description: 'This category is being used by some books. Please reassign them before deleting.',
        });
        return;
    }
    setCategories(prev => prev.filter(cat => cat.id !== categoryId));
    toast({
        title: 'Category Deleted',
    })
  };

  const handlePolicySubmit = (data: z.infer<typeof policySchema>) => {
      // In a real app, you'd save this to a backend.
      // For now, we'll just show a toast.
      localStorage.setItem('libraryPolicies', JSON.stringify(data));
      toast({
          title: 'Políticas actualizadas',
          description: 'Las reglas de la biblioteca han sido guardadas.',
      })
  }

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(bookSearchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(bookSearchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(user =>
    user.role === 'client' && 
    (user.name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
     user.email?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
     user.username.toLowerCase().includes(userSearchTerm.toLowerCase()))
  );


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="font-headline text-2xl">Gestión del Sistema</DialogTitle>
          <DialogDescription>
            Administra el catálogo de libros, las categorías y las cuentas de usuario.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-6">
          <Tabs defaultValue="books">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="books">Gestionar Libros</TabsTrigger>
              <TabsTrigger value="categories">Gestionar Categorías</TabsTrigger>
              <TabsTrigger value="users">Gestionar Cuentas</TabsTrigger>
              <TabsTrigger value="policies">Políticas</TabsTrigger>
            </TabsList>
            <TabsContent value="books" className="mt-4">
                <Card>
                    <CardHeader className="p-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Buscar libro por título o autor..."
                            value={bookSearchTerm}
                            onChange={(e) => setBookSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-2 max-h-[50vh] overflow-y-auto">
                        <div className="space-y-2">
                          {filteredBooks.map(book => (
                              <div key={book.id} className="flex items-center gap-4 p-2 rounded-md hover:bg-muted/50">
                                  <Image src={book.coverUrl} alt={book.title} width={40} height={60} className="rounded-sm object-cover" />
                                  <div className="flex-1">
                                      <p className="font-semibold">{book.title}</p>
                                      <p className="text-sm text-muted-foreground">{book.author} &middot; <span className="font-medium">{book.category}</span></p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onEditBook(book)}>
                                          <Edit className="h-4 w-4" />
                                          <span className="sr-only">Edit Book</span>
                                      </Button>
                                      <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                              <Button variant="destructive" size="icon" className="h-8 w-8">
                                                  <Trash2 className="h-4 w-4" />
                                                  <span className="sr-only">Delete Book</span>
                                              </Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                              <AlertDialogHeader>
                                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                  <AlertDialogDescription>
                                                      This action cannot be undone. This will permanently delete the book
                                                      "{book.title}" and any associated checkout data.
                                                  </AlertDialogDescription>
                                              </AlertDialogHeader>
                                              <AlertDialogFooter>
                                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                  <AlertDialogAction onClick={() => onDeleteBook(book.id)}>Continue</AlertDialogAction>
                                              </AlertDialogFooter>
                                          </AlertDialogContent>
                                      </AlertDialog>
                                  </div>
                              </div>
                          ))}
                        </div>
                         {filteredBooks.length === 0 && (
                          <div className="text-center text-muted-foreground py-8">
                            <p>No books found for "{bookSearchTerm}".</p>
                          </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="categories" className="mt-4">
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Añadir Nueva Categoría</h4>
                    <Form {...categoryForm}>
                      <form onSubmit={categoryForm.handleSubmit(handleAddCategory)} className="flex items-start gap-2">
                        <FormField
                          control={categoryForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input placeholder="e.g., Science Fiction" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" size="icon" className="h-10 w-10">
                          <PlusCircle className="h-5 w-5" />
                        </Button>
                      </form>
                    </Form>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Categorías Existentes</h4>
                    <div className="space-y-2">
                        {categories.map(cat => (
                            <div key={cat.id} className="flex items-center justify-between p-2 rounded-md bg-secondary">
                                <span className="text-sm font-medium text-secondary-foreground">{cat.name}</span>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDeleteCategory(cat.id)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="users" className="mt-4">
                <Card>
                     <CardHeader className="p-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Buscar usuario por nombre o correo..."
                            value={userSearchTerm}
                            onChange={(e) => setUserSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                    </CardHeader>
                     <CardContent className="p-4 pt-0 space-y-2 max-h-[50vh] overflow-y-auto">
                        {filteredUsers.map(user => (
                            <div key={user.id} className="flex items-center justify-between gap-4 p-2 rounded-md hover:bg-muted/50">
                                <div>
                                    <p className="font-semibold">{user.name}</p>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {user.status === 'deactivated' ? (
                                        <Badge variant="destructive">Desactivada</Badge>
                                    ) : (
                                        <Badge variant="secondary" className="bg-green-100 text-green-800">Activa</Badge>
                                    )}

                                    {user.status === 'deactivated' ? (
                                        <Button
                                            variant="default"
                                            size="sm"
                                            className="bg-green-600 hover:bg-green-700"
                                            onClick={() => onUserStatusChange(user.id, true)}
                                        >
                                            <UserCheck className="mr-2 h-4 w-4" />
                                            Reactivar
                                        </Button>
                                    ) : (
                                        <Button 
                                            variant="destructive" 
                                            size="sm"
                                            onClick={() => onUserStatusChange(user.id, false)}
                                        >
                                            <UserX className="mr-2 h-4 w-4" />
                                            Desactivar
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                         {filteredUsers.length === 0 && (
                            <div className="text-center text-muted-foreground py-8">
                                <p>No se encontraron usuarios.</p>
                            </div>
                         )}
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="policies" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline flex items-center"><SettingsIcon className="mr-2 h-5 w-5"/>Políticas de la Biblioteca</CardTitle>
                  <CardDescription>Define las reglas para los préstamos y el manejo de cuentas.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...policyForm}>
                    <form onSubmit={policyForm.handleSubmit(handlePolicySubmit)} className="space-y-6">
                      <FormField
                        control={policyForm.control}
                        name="maxLoans"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Máximo de Libros por Usuario</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="3" {...field} />
                            </FormControl>
                            <FormDescription>El número máximo de libros que un usuario puede tener prestados al mismo tiempo.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={policyForm.control}
                        name="gracePeriod"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Período de Gracia (días)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="7" {...field} />
                            </FormControl>
                             <FormDescription>Número de días después de la fecha de vencimiento antes de que la cuenta se desactive automáticamente.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit">Guardar Políticas</Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

    
