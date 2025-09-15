
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
import type { Book, Category } from '@/lib/types';
import { Input } from './ui/input';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { PlusCircle, Trash2, Edit, X } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  books: Book[];
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  onEditBook: (book: Book) => void;
  onDeleteBook: (bookId: number) => void;
}

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required.'),
});

export function SettingsDialog({ open, onOpenChange, books, categories, setCategories, onEditBook, onDeleteBook }: SettingsDialogProps) {
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '' },
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
    form.reset();
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="font-headline text-2xl">Settings</DialogTitle>
          <DialogDescription>
            Manage the library catalog and configuration. This is the developer mode.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-6">
          <Tabs defaultValue="books">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="books">Manage Books</TabsTrigger>
              <TabsTrigger value="categories">Manage Categories</TabsTrigger>
            </TabsList>
            <TabsContent value="books" className="mt-4">
                <Card>
                    <CardContent className="p-4 space-y-4">
                        {books.map(book => (
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
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="categories" className="mt-4">
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Add New Category</h4>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleAddCategory)} className="flex items-start gap-2">
                        <FormField
                          control={form.control}
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
                    <h4 className="font-semibold mb-2">Existing Categories</h4>
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
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
