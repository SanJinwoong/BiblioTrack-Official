
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
import { ScrollArea } from './ui/scroll-area';
import Image from 'next/image';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

const formSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio.'),
  author: z.string().min(1, 'El autor es obligatorio.'),
  description: z.string().min(1, 'La descripción es obligatoria.'),
  coverUrl: z.string().optional(),
  coverFile: z.any().optional(),
  genre: z.string().min(1, 'El género es obligatorio.'),
  stock: z.coerce.number().int().min(0, 'El stock no puede ser negativo.'),
}).refine(data => data.coverUrl || (data.coverFile && data.coverFile.length > 0), {
  message: "Debe proporcionar una URL de portada o subir un archivo.",
  path: ["coverUrl"],
});


type FormValues = Omit<Book, 'id'>;

interface AddBookFormProps {
  onSuccess: (data: FormValues) => void;
  onCancel: () => void;
  onFormDirtyChange: (isDirty: boolean) => void;
}

export function AddBookForm({ onSuccess, onCancel, onFormDirtyChange }: AddBookFormProps) {
    const [previewUrl, setPreviewUrl] = useState<string>('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      author: '',
      description: '',
      coverUrl: '',
      genre: '',
      stock: 1,
    },
  });

  const coverUrlValue = form.watch('coverUrl');
  const coverFileValue = form.watch('coverFile');
  const { isDirty } = form.formState;

  useEffect(() => {
    onFormDirtyChange(isDirty);
  }, [isDirty, onFormDirtyChange]);

  useEffect(() => {
    let newPreviewUrl = '';
    if (coverFileValue && coverFileValue.length > 0) {
        newPreviewUrl = URL.createObjectURL(coverFileValue[0]);
    } else if (coverUrlValue) {
        newPreviewUrl = coverUrlValue;
    }
    setPreviewUrl(newPreviewUrl);
    
    // Cleanup function to revoke the object URL
    return () => {
        if (newPreviewUrl && newPreviewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(newPreviewUrl);
        }
    };
  }, [coverUrlValue, coverFileValue]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    let finalCoverUrl = values.coverUrl;

    if (values.coverFile && values.coverFile.length > 0) {
        // In a real app, upload file to storage and get URL.
        // For now, we are simulating this. We'll just pass the preview URL.
        finalCoverUrl = previewUrl; 
    }
    
    const { coverFile, ...bookData } = values;

    onSuccess({
      ...bookData,
      coverUrl: finalCoverUrl || '',
    });

    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full p-6">
        {/* Columna de Formulario */}
        <ScrollArea className="md:col-span-2 h-full pr-6">
          <div className="space-y-4">
            <FormField control={form.control} name="title" render={({ field }) => ( <FormItem> <FormLabel>Título</FormLabel> <FormControl><Input placeholder="El Gran Gatsby" {...field} /></FormControl> <FormMessage /> </FormItem>)} />
            <FormField control={form.control} name="author" render={({ field }) => ( <FormItem> <FormLabel>Autor</FormLabel> <FormControl><Input placeholder="F. Scott Fitzgerald" {...field} /></FormControl> <FormMessage /> </FormItem>)} />
            <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>Descripción</FormLabel> <FormControl><Textarea placeholder="Una novela sobre el sueño americano..." {...field} rows={5} /></FormControl> <FormMessage /> </FormItem>)} />
            <FormField control={form.control} name="genre" render={({ field }) => ( <FormItem> <FormLabel>Género</FormLabel> <FormControl><Input placeholder="Clásico, Ficción, etc." {...field} /></FormControl> <FormMessage /> </FormItem>)} />
            <FormField control={form.control} name="stock" render={({ field }) => ( <FormItem> <FormLabel>Stock</FormLabel> <FormControl><Input type="number" placeholder="5" {...field} /></FormControl> <FormMessage /> </FormItem>)} />
            
            <FormField control={form.control} name="coverUrl" render={({ field }) => ( <FormItem> <FormLabel>URL de Portada</FormLabel> <FormControl><Input placeholder="https://ejemplo.com/portada.jpg" {...field} /></FormControl> <FormMessage /> </FormItem>)} />
            
            <div className="text-center text-sm text-muted-foreground my-2">o</div>
            
            <FormField
                control={form.control}
                name="coverFile"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Subir Archivo de Portada</FormLabel>
                        <FormControl>
                            <Input 
                                type="file"
                                accept="image/png, image/jpeg, image/webp"
                                className="cursor-pointer"
                                onChange={(e) => field.onChange(e.target.files)}
                            />
                        </FormControl>
                         <FormMessage />
                    </FormItem>
                )}
            />
          </div>
        </ScrollArea>
        
        {/* Columna de Vista Previa */}
        <div className="md:col-span-1 flex flex-col justify-between items-center space-y-4">
            <div className='w-full'>
                <FormLabel>Vista Previa de la Portada</FormLabel>
                <div className="mt-2 w-full aspect-[3/4.5] rounded-md border border-dashed flex items-center justify-center bg-muted/50 overflow-hidden">
                {previewUrl ? (
                    <Image
                        src={previewUrl}
                        alt="Vista previa de la portada"
                        width={300}
                        height={450}
                        className="object-cover w-full h-full"
                        onError={() => setPreviewUrl('')} // Reset if URL is invalid
                    />
                ) : (
                    <div className="text-center text-muted-foreground p-4">
                    <ImageIcon className="mx-auto h-12 w-12" />
                    <p className="mt-2 text-sm">Sube o introduce la URL de una portada</p>
                    </div>
                )}
                </div>
            </div>

            <div className='flex justify-end gap-2 w-full'>
                <Button type="button" variant="ghost" onClick={onCancel}>
                    Cancelar
                </Button>
                <Button type="submit">
                    Añadir Libro
                </Button>
            </div>
        </div>
      </form>
    </Form>
  );
}
