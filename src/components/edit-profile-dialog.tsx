
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { User } from '@/lib/types';
import Image from 'next/image';
import { Camera } from 'lucide-react';
import { useEffect, useState } from 'react';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  bio: z.string().optional(),
  avatarFile: z.any().optional(),
  bannerFile: z.any().optional(),
});

interface EditProfileDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileUpdate: (data: Partial<User> & { newAvatarUrl?: string, newBannerUrl?: string }) => void;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export function EditProfileDialog({ user, open, onOpenChange, onProfileUpdate }: EditProfileDialogProps) {
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(user.avatarUrl);
  const [bannerPreview, setBannerPreview] = useState<string | undefined>(user.bannerUrl);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name || '',
      bio: user.bio || '',
      avatarFile: undefined,
      bannerFile: undefined,
    },
  });
  
  useEffect(() => {
    if (open) {
      form.reset({
        name: user.name || '',
        bio: user.bio || '',
      });
      setAvatarPreview(user.avatarUrl);
      setBannerPreview(user.bannerUrl);
    }
  }, [open, user, form]);

  const avatarFileValue = form.watch('avatarFile');
  const bannerFileValue = form.watch('bannerFile');

  useEffect(() => {
    let objectUrl: string | null = null;
    if (avatarFileValue && avatarFileValue.length > 0) {
      const file = avatarFileValue[0];
      if (file instanceof File) {
        objectUrl = URL.createObjectURL(file);
        setAvatarPreview(objectUrl);
      }
    }
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [avatarFileValue]);

  useEffect(() => {
    let objectUrl: string | null = null;
    if (bannerFileValue && bannerFileValue.length > 0) {
      const file = bannerFileValue[0];
      if (file instanceof File) {
        objectUrl = URL.createObjectURL(file);
        setBannerPreview(objectUrl);
      }
    }
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [bannerFileValue]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    let newAvatarUrl: string | undefined;
    let newBannerUrl: string | undefined;

    if (values.avatarFile && values.avatarFile.length > 0) {
      newAvatarUrl = await fileToBase64(values.avatarFile[0]);
    }
    if (values.bannerFile && values.bannerFile.length > 0) {
      newBannerUrl = await fileToBase64(values.bannerFile[0]);
    }
    
    onProfileUpdate({
      name: values.name,
      bio: values.bio,
      newAvatarUrl,
      newBannerUrl,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
          <DialogDescription>
            Personaliza tu perfil. Los cambios serán visibles para otros usuarios.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="relative">
              <div className="relative h-48 w-full rounded-lg bg-muted overflow-hidden group">
                {bannerPreview && (
                  <Image src={bannerPreview} alt="Banner preview" fill className="object-cover" />
                )}
                 <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <Camera className="h-8 w-8 text-white" />
                 </div>
                 <FormField
                    control={form.control}
                    name="bannerFile"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Input 
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={(e) => field.onChange(e.target.files)}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                 />
              </div>
              <div className="absolute bottom-0 left-6 transform translate-y-1/2">
                <div className="relative h-28 w-28 rounded-full border-4 border-background bg-background group overflow-hidden">
                    {avatarPreview && (
                        <Image src={avatarPreview} alt="Avatar preview" fill className="object-cover" />
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="h-6 w-6 text-white" />
                    </div>
                     <FormField
                        control={form.control}
                        name="avatarFile"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input 
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={(e) => field.onChange(e.target.files)}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>
              </div>
            </div>
            
            <div className="pt-16 space-y-4">
                 <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombre</FormLabel>
                            <FormControl>
                                <Input placeholder="Tu nombre" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Biografía</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Cuéntanos un poco sobre ti..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit">Guardar Cambios</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

