
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
import type { Book, Category } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import Image from 'next/image';
import { Image as ImageIcon, Camera } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ImageCropDialog } from './image-crop-dialog';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  author: z.string().min(1, 'Author is required.'),
  description: z.string().min(1, 'Description is required.'),
  coverUrl: z.string().optional(),
  coverFile: z.any().optional(),
  category: z.string().min(1, 'Category is required.'),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative.'),
}).refine(data => data.coverUrl || (data.coverFile && data.coverFile.length > 0) || data.category, {
  message: "You must provide a cover URL or upload a file.",
  path: ["coverUrl"],
});


type FormValues = Omit<Book, 'id'>;

interface AddBookFormProps {
  bookToEdit?: Book | null;
  categories: Category[];
  onSuccess: (data: FormValues | Book) => void;
  onCancel: () => void;
  onFormDirtyChange: (isDirty: boolean) => void;
}

// Helper function to convert a file to a Base64 Data URI
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
};


export function AddBookForm({ bookToEdit, categories, onSuccess, onCancel, onFormDirtyChange }: AddBookFormProps) {
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [cropDialogOpen, setCropDialogOpen] = useState(false);
    const [imageToCrop, setImageToCrop] = useState<string>('');
    const [croppedCover, setCroppedCover] = useState<string>('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: bookToEdit ? {
        ...bookToEdit,
        coverFile: undefined,
    } : {
      title: '',
      author: '',
      description: '',
      coverUrl: '',
      category: '',
      stock: 1,
    },
  });

  const coverUrlValue = form.watch('coverUrl');
  const coverFileValue = form.watch('coverFile');
  const { isDirty } = form.formState;

  useEffect(() => {
    if (bookToEdit) {
      setPreviewUrl(bookToEdit.coverUrl);
    }
  }, [bookToEdit]);

  useEffect(() => {
    onFormDirtyChange(isDirty);
  }, [isDirty, onFormDirtyChange]);

  useEffect(() => {
    let objectUrl: string | null = null;

    const generatePreview = async () => {
        if (coverFileValue && coverFileValue.length > 0) {
            const file = coverFileValue[0];
            if (file instanceof File) {
              objectUrl = URL.createObjectURL(file);
              setPreviewUrl(objectUrl);
            }
        } else if (coverUrlValue) {
            setPreviewUrl(coverUrlValue);
        } else if (bookToEdit?.coverUrl) {
            setPreviewUrl(bookToEdit.coverUrl);
        } else {
            setPreviewUrl('');
        }
    }

    generatePreview();
    
    // Cleanup function to revoke the object URL
    return () => {
        if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
        }
    };
  }, [coverUrlValue, coverFileValue, bookToEdit?.coverUrl]);

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImageToCrop(result);
      setCropDialogOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedImage: string) => {
    setCroppedCover(croppedImage);
    setPreviewUrl(croppedImage);
    setCropDialogOpen(false);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    let finalCoverUrl = values.coverUrl;

    // Use cropped cover if available
    if (croppedCover) {
      finalCoverUrl = croppedCover;
    } else if (values.coverFile && values.coverFile.length > 0) {
        const file = values.coverFile[0];
        if (file instanceof File) {
            finalCoverUrl = await fileToBase64(file);
        }
    }
    
    const { coverFile, ...bookData } = values;

    const finalData = {
        ...bookData,
        coverUrl: finalCoverUrl || '',
    };

    if(bookToEdit) {
        onSuccess({ ...bookToEdit, ...finalData });
    } else {
        onSuccess(finalData);
    }

    form.reset();
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full p-6">
        {/* Columna de Formulario */}
        <ScrollArea className="md:col-span-2 h-full pr-6">
          <div className="space-y-4">
            <FormField control={form.control} name="title" render={({ field }) => ( <FormItem> <FormLabel>Title</FormLabel> <FormControl><Input placeholder="The Great Gatsby" {...field} /></FormControl> <FormMessage /> </FormItem>)} />
            <FormField control={form.control} name="author" render={({ field }) => ( <FormItem> <FormLabel>Author</FormLabel> <FormControl><Input placeholder="F. Scott Fitzgerald" {...field} /></FormControl> <FormMessage /> </FormItem>)} />
            <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>Description</FormLabel> <FormControl><Textarea placeholder="A novel about the American dream..." {...field} rows={5} /></FormControl> <FormMessage /> </FormItem>)} />
             <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="stock" render={({ field }) => ( <FormItem> <FormLabel>Stock</FormLabel> <FormControl><Input type="number" placeholder="5" {...field} /></FormControl> <FormMessage /> </FormItem>)} />
            
            <FormField control={form.control} name="coverUrl" render={({ field }) => ( <FormItem> <FormLabel>Cover URL</FormLabel> <FormControl><Input placeholder="https://example.com/cover.jpg" {...field} /></FormControl> <FormMessage /> </FormItem>)} />
            
            <div className="text-center text-sm text-muted-foreground my-2">or</div>
            
            <FormField
                control={form.control}
                name="coverFile"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Upload Cover File</FormLabel>
                        <FormControl>
                            <Input 
                                type="file"
                                accept="image/png, image/jpeg, image/webp"
                                className="cursor-pointer"
                                onChange={(e) => {
                                  const files = e.target.files;
                                  if (files && files[0]) {
                                    handleFileUpload(files[0]);
                                    field.onChange(files);
                                  }
                                }}
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
                <FormLabel>Cover Preview</FormLabel>
                <div className="mt-2 w-full max-w-[200px] mx-auto aspect-[3/4] rounded-md border border-dashed flex items-center justify-center bg-muted/50 overflow-hidden relative">
                {previewUrl ? (
                    <Image
                        src={previewUrl}
                        alt="Cover preview"
                        fill
                        className="object-cover"
                        onError={() => setPreviewUrl('')} // Reset if URL is invalid
                    />
                ) : (
                    <div className="text-center text-muted-foreground p-4">
                    <ImageIcon className="mx-auto h-12 w-12" />
                    <p className="mt-2 text-sm">Upload or enter a URL for the cover</p>
                    </div>
                )}
                </div>
            </div>

            <div className='flex justify-end gap-2 w-full'>
                <Button type="button" variant="ghost" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit">
                    {bookToEdit ? 'Update Book' : 'Add Book'}
                </Button>
            </div>
        </div>
      </form>
    </Form>
    
    <ImageCropDialog
      open={cropDialogOpen}
      onOpenChange={setCropDialogOpen}
      imageSrc={imageToCrop}
      aspectRatio={3/4} // Book cover aspect ratio
      title="Recortar Portada del Libro"
      onCropComplete={handleCropComplete}
    />
    </>
  );
}

    