
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
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
import { Textarea } from '@/components/ui/textarea';
import type { Book } from '@/lib/types';

const formSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio.'),
  author: z.string().min(1, 'El autor es obligatorio.'),
  description: z.string().min(1, 'La descripción es obligatoria.'),
  coverUrl: z.string().optional(),
  coverFile: z.any().optional(),
  genre: z.string().min(1, 'El género es obligatorio.'),
  stock: z.coerce.number().int().min(0, 'El stock no puede ser negativo.'),
}).refine(data => data.coverUrl || data.coverFile, {
  message: "Debe proporcionar una URL de portada o subir un archivo.",
  path: ["coverUrl"],
});


type FormValues = Omit<Book, 'id'>;

interface AddBookFormProps {
  onSuccess: (data: FormValues) => void;
  onCancel: () => void;
}

export function AddBookForm({ onSuccess, onCancel }: AddBookFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      author: '',
      description: '',
      coverUrl: `https://picsum.photos/300/450?random=${Math.floor(Math.random() * 100)}`,
      genre: '',
      stock: 1,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    let coverUrl = values.coverUrl;

    if (values.coverFile && values.coverFile.length > 0) {
      const file = values.coverFile[0];
      // In a real app, you'd upload this to a storage service (like Firebase Storage)
      // and get a URL back. For now, we'll use a local object URL for preview.
      coverUrl = URL.createObjectURL(file);
    }
    
    // We remove coverFile as it's not part of the Book type
    const { coverFile, ...bookData } = values;

    onSuccess({
      ...bookData,
      coverUrl: coverUrl || '', // Ensure coverUrl is not undefined
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="title" render={({ field }) => ( <FormItem> <FormLabel>Título</FormLabel> <FormControl><Input placeholder="El Gran Gatsby" {...field} /></FormControl> <FormMessage /> </FormItem>)} />
        <FormField control={form.control} name="author" render={({ field }) => ( <FormItem> <FormLabel>Autor</FormLabel> <FormControl><Input placeholder="F. Scott Fitzgerald" {...field} /></FormControl> <FormMessage /> </FormItem>)} />
        <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>Descripción</FormLabel> <FormControl><Textarea placeholder="Una novela sobre el sueño americano..." {...field} /></FormControl> <FormMessage /> </FormItem>)} />
        <FormField control={form.control} name="genre" render={({ field }) => ( <FormItem> <FormLabel>Género</FormLabel> <FormControl><Input placeholder="Clásico" {...field} /></FormControl> <FormMessage /> </FormItem>)} />
        <FormField control={form.control} name="stock" render={({ field }) => ( <FormItem> <FormLabel>Stock</FormLabel> <FormControl><Input type="number" placeholder="5" {...field} /></FormControl> <FormMessage /> </FormItem>)} />
        
        <FormField control={form.control} name="coverUrl" render={({ field }) => ( <FormItem> <FormLabel>URL de Portada</FormLabel> <FormControl><Input placeholder="https://ejemplo.com/portada.jpg" {...field} /></FormControl> <FormMessage /> </FormItem>)} />

        <div className="text-center text-sm text-muted-foreground my-2">o</div>

        <FormField
            control={form.control}
            name="coverFile"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Subir Portada (Archivo)</FormLabel>
                    <FormControl>
                        <Input 
                            type="file"
                            accept="image/png, image/jpeg, image/webp"
                            onChange={(e) => field.onChange(e.target.files)}
                         />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
        
        <div className='flex justify-end gap-2 pt-4'>
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            Añadir Libro
          </Button>
        </div>
      </form>
    </Form>
  );
}
