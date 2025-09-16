
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
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
import { Camera, Crop, X } from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react';
import ReactCrop, { type Crop as CropType, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  bio: z.string().optional(),
});

interface EditProfileDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileUpdate: (data: Partial<User> & { newAvatarUrl?: string, newBannerUrl?: string }) => void;
}

// Helper to get the cropped image as a data URL
function getCroppedImg(image: HTMLImageElement, crop: CropType, fileName: string): Promise<string> {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
      return Promise.reject('Could not get canvas context');
  }

  const pixelRatio = window.devicePixelRatio;
  canvas.width = crop.width * pixelRatio;
  canvas.height = crop.height * pixelRatio;
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height
  );

  return new Promise((resolve) => {
    resolve(canvas.toDataURL('image/jpeg'));
  });
}


export function EditProfileDialog({ user, open, onOpenChange, onProfileUpdate }: EditProfileDialogProps) {
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(user.avatarUrl);
  const [bannerPreview, setBannerPreview] = useState<string | undefined>(user.bannerUrl);
  
  // Cropping state
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState<CropType>();
  const [completedCrop, setCompletedCrop] = useState<CropType>();
  const [croppingTarget, setCroppingTarget] = useState<'avatar' | 'banner' | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [croppedAvatar, setCroppedAvatar] = useState<string | null>(null);
  const [croppedBanner, setCroppedBanner] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name || '',
      bio: user.bio || '',
    },
  });
  
  useEffect(() => {
    if (open) {
      form.reset({ name: user.name || '', bio: user.bio || '' });
      setAvatarPreview(user.avatarUrl);
      setBannerPreview(user.bannerUrl);
      setCroppedAvatar(null);
      setCroppedBanner(null);
      setCroppingTarget(null);
      setImgSrc('');
    }
  }, [open, user, form]);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>, target: 'avatar' | 'banner') => {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined); // Reset crop on new image
      const reader = new FileReader();
      reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
      reader.readAsDataURL(e.target.files[0]);
      setCroppingTarget(target);
    }
  };

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    let aspect = 1; // Square for avatar
    if (croppingTarget === 'banner') {
      aspect = 16 / 9; // Rectangular for banner
    }
    const newCrop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspect,
        width,
        height
      ),
      width,
      height
    );
    setCrop(newCrop);
  }

  const handleConfirmCrop = async () => {
    if (completedCrop && imgRef.current) {
        const croppedDataUrl = await getCroppedImg(imgRef.current, completedCrop, 'cropped.jpg');
        if (croppingTarget === 'avatar') {
            setCroppedAvatar(croppedDataUrl);
            setAvatarPreview(croppedDataUrl);
        } else if (croppingTarget === 'banner') {
            setCroppedBanner(croppedDataUrl);
            setBannerPreview(croppedDataUrl);
        }
        setCroppingTarget(null);
        setImgSrc('');
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    onProfileUpdate({
      name: values.name,
      bio: values.bio,
      newAvatarUrl: croppedAvatar || undefined,
      newBannerUrl: croppedBanner || undefined,
    });
    onOpenChange(false);
  }
  
  const CroppingView = () => (
     <div className="space-y-4">
        <h3 className="text-lg font-medium">Recortar Imagen</h3>
        {imgSrc && (
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={croppingTarget === 'avatar' ? 1 : 16 / 9}
            circularCrop={croppingTarget === 'avatar'}
          >
            <Image
              ref={imgRef}
              alt="Crop preview"
              src={imgSrc}
              width={500}
              height={500}
              onLoad={onImageLoad}
              className="max-h-[60vh] w-auto"
            />
          </ReactCrop>
        )}
        <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => { setCroppingTarget(null); setImgSrc(''); }}>Cancelar</Button>
            <Button onClick={handleConfirmCrop}>Confirmar Recorte</Button>
        </div>
      </div>
  );

  const EditFormView = () => (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="relative">
            <div className="relative h-48 w-full rounded-lg bg-muted overflow-hidden group">
            {bannerPreview && (
                <Image src={bannerPreview} alt="Banner preview" fill className="object-cover" />
            )}
            <label htmlFor="banner-upload" className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="h-8 w-8 text-white" />
                <Input id="banner-upload" type="file" accept="image/*" className="sr-only" onChange={(e) => onSelectFile(e, 'banner')} />
            </label>
            </div>
            <div className="absolute bottom-0 left-6 transform translate-y-1/2">
            <div className="relative h-28 w-28 rounded-full border-4 border-background bg-background group overflow-hidden">
                {avatarPreview && (
                    <Image src={avatarPreview} alt="Avatar preview" fill className="object-cover" />
                )}
                <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="h-6 w-6 text-white" />
                    <Input id="avatar-upload" type="file" accept="image/*" className="sr-only" onChange={(e) => onSelectFile(e, 'avatar')} />
                </label>
            </div>
            </div>
        </div>
        
        <div className="pt-16 space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Nombre</label>
                <Input id="name" placeholder="Tu nombre" {...form.register('name')} />
                {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
              </div>
               <div className="space-y-2">
                <label htmlFor="bio" className="text-sm font-medium">Biografía</label>
                <Textarea id="bio" placeholder="Cuéntanos un poco sobre ti..." {...form.register('bio')} />
              </div>
        </div>

        <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">Guardar Cambios</Button>
        </DialogFooter>
        </form>
    </Form>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
          <DialogDescription>
            {croppingTarget ? 'Ajusta tu imagen para que se vea perfecta.' : 'Personaliza tu perfil. Los cambios serán visibles para otros usuarios.'}
          </DialogDescription>
        </DialogHeader>
        {croppingTarget ? <CroppingView /> : <EditFormView />}
      </DialogContent>
    </Dialog>
  );
}
