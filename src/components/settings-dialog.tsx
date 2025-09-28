
'use client';

import { useState, useEffect } from 'react';
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
import type { Book, Category, User, LoanDurationOption } from '@/lib/types';
import { createCategory, deleteCategory, getCategories, getLibraryPolicies, updateLibraryPolicies } from '@/lib/supabase-functions';
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
import { getBookCoverUrl } from '@/lib/utils';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

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
  loanDurationOptions: z.array(z.object({
    value: z.string().min(1, 'Valor requerido'),
    label: z.string().min(1, 'Etiqueta requerida'),
  })).min(1, 'Debe tener al menos una opción de duración'),
});

export function SettingsDialog({ open, onOpenChange, books, categories, setCategories, onEditBook, onDeleteBook, users, onUserStatusChange }: SettingsDialogProps) {
  const { toast } = useToast();
  const [bookSearchTerm, setBookSearchTerm] = useState('');
  const [newDurationAmount, setNewDurationAmount] = useState('');
  const [newDurationType, setNewDurationType] = useState<'dias' | 'semanas' | 'meses' | 'años'>('dias');
  
  const categoryForm = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '' },
  });

  const policyForm = useHookForm({
      resolver: zodResolver(policySchema),
      defaultValues: {
          maxLoans: 3,
          gracePeriod: 7,
          loanDurationOptions: [
            { value: '7', label: '1 semana' },
            { value: '14', label: '2 semanas' },
            { value: '21', label: '3 semanas' },
            { value: '30', label: '1 mes' }
          ],
      }
  });

  // Load existing policies when dialog opens
  useEffect(() => {
    if (open) {
      const loadPolicies = async () => {
        try {
          const policies = await getLibraryPolicies();
          if (policies) {
            policyForm.reset({
              maxLoans: policies.maxLoans,
              gracePeriod: policies.gracePeriod,
              loanDurationOptions: policies.loanDurationOptions || [
                { value: '7', label: '1 semana' },
                { value: '14', label: '2 semanas' },
                { value: '21', label: '3 semanas' },
                { value: '30', label: '1 mes' }
              ],
            });
          }
        } catch (error) {
          console.error('Error loading policies:', error);
        }
      };
      loadPolicies();
    }
  }, [open, policyForm]);

  const handleAddCategory = async (data: { name: string }) => {
    if (categories.some(cat => cat.name.toLowerCase() === data.name.toLowerCase())) {
        toast({
            variant: 'destructive',
            title: 'Category exists',
            description: `A category named "${data.name}" already exists.`,
        });
        return;
    }
    
    try {
      const newCategory = await createCategory({ name: data.name });
      setCategories(prev => [...prev, newCategory]);
      categoryForm.reset();
      toast({
          title: 'Category Added',
          description: `"${data.name}" has been added to the database.`,
      });
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to add category to the database.',
      });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const categoryToDelete = categories.find(c => c.id === categoryId);
    if (books.some(book => book.category === categoryToDelete?.name)) {
        toast({
            variant: 'destructive',
            title: 'Cannot delete category',
            description: 'This category is being used by some books. Please reassign them before deleting.',
        });
        return;
    }
    
    try {
      await deleteCategory(categoryId);
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      toast({
          title: 'Category Deleted',
          description: 'The category has been removed from the database.',
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to delete category from the database.',
      });
    }
  };

  const handlePolicySubmit = async (data: z.infer<typeof policySchema>) => {
      try {
        await updateLibraryPolicies({
          maxLoans: data.maxLoans,
          gracePeriod: data.gracePeriod,
          loanDurationOptions: data.loanDurationOptions,
        });
        toast({
            title: 'Políticas actualizadas',
            description: 'Las reglas de la biblioteca han sido guardadas en la base de datos.',
        });
      } catch (error) {
        console.error('Error updating policies:', error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'No se pudieron guardar las políticas en la base de datos.',
        });
      }
  }

  const handleAddDurationOption = () => {
    if (!newDurationAmount || !newDurationType) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Por favor complete ambos campos.',
      });
      return;
    }

    const amount = parseInt(newDurationAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Por favor ingrese un número válido mayor a 0.',
      });
      return;
    }

    // Calcular días según el tipo
    let totalDays: number;
    let label: string;
    
    switch (newDurationType) {
      case 'dias':
        totalDays = amount;
        label = amount === 1 ? '1 día' : `${amount} días`;
        break;
      case 'semanas':
        totalDays = amount * 7;
        label = amount === 1 ? '1 semana' : `${amount} semanas`;
        break;
      case 'meses':
        totalDays = amount * 30; // Aproximación de 30 días por mes
        label = amount === 1 ? '1 mes' : `${amount} meses`;
        break;
      case 'años':
        totalDays = amount * 365; // Aproximación de 365 días por año
        label = amount === 1 ? '1 año' : `${amount} años`;
        break;
      default:
        return;
    }

    const currentOptions = policyForm.getValues('loanDurationOptions');
    const exists = currentOptions.some(option => parseInt(option.value) === totalDays);
    
    if (exists) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Ya existe una opción con esa duración total de días.',
      });
      return;
    }

    const newOptions = [...currentOptions, { value: totalDays.toString(), label }];
    policyForm.setValue('loanDurationOptions', newOptions);
    setNewDurationAmount('');
    setNewDurationType('dias');
  };

  const handleRemoveDurationOption = (index: number) => {
    const currentOptions = policyForm.getValues('loanDurationOptions');
    if (currentOptions.length <= 1) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Debe mantener al menos una opción de duración.',
      });
      return;
    }
    
    const newOptions = currentOptions.filter((_, i) => i !== index);
    policyForm.setValue('loanDurationOptions', newOptions);
  };

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(bookSearchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(bookSearchTerm.toLowerCase())
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="books">Gestionar Libros</TabsTrigger>
              <TabsTrigger value="categories">Gestionar Categorías</TabsTrigger>
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
                                  <Image src={getBookCoverUrl(book)} alt={book.title} width={40} height={60} className="rounded-sm object-cover" />
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
                      
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium">Opciones de Duración de Préstamo</Label>
                          <p className="text-xs text-muted-foreground mb-3">Configure las duraciones disponibles para los préstamos de libros.</p>
                          
                          {/* Current duration options */}
                          <div className="space-y-2 mb-4">
                            {policyForm.watch('loanDurationOptions').map((option, index) => (
                              <div key={index} className="flex items-center justify-between p-2 rounded-md bg-secondary">
                                <span className="text-sm">
                                  <span className="font-medium">{option.label}</span> 
                                  <span className="text-muted-foreground"> ({option.value} días)</span>
                                </span>
                                <Button 
                                  type="button"
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-7 w-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" 
                                  onClick={() => handleRemoveDurationOption(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>

                          {/* Add new duration option */}
                          <div className="border rounded-md p-3 space-y-3">
                            <h4 className="font-medium text-sm">Añadir Nueva Opción</h4>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Label htmlFor="duration-amount" className="text-xs">Cantidad</Label>
                                <Input
                                  id="duration-amount"
                                  type="number"
                                  placeholder="1"
                                  value={newDurationAmount}
                                  onChange={(e) => setNewDurationAmount(e.target.value)}
                                  min="1"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label htmlFor="duration-type" className="text-xs">Tipo de Tiempo</Label>
                                <Select value={newDurationType} onValueChange={(value: 'dias' | 'semanas' | 'meses' | 'años') => setNewDurationType(value)}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar tipo" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="dias">Días</SelectItem>
                                    <SelectItem value="semanas">Semanas</SelectItem>
                                    <SelectItem value="meses">Meses</SelectItem>
                                    <SelectItem value="años">Años</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <Button 
                              type="button"
                              variant="outline" 
                              size="sm" 
                              onClick={handleAddDurationOption}
                              className="w-full"
                            >
                              <PlusCircle className="h-4 w-4 mr-2" />
                              Añadir Opción
                            </Button>
                          </div>
                        </div>
                      </div>
                      
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
