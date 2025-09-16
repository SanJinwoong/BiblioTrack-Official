
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
import { Camera, ZoomIn, ZoomOut } from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react';
import ReactCrop, { type Crop as CropType, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Slider } from './ui/slider';


const formSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  bio: z.string().optional(),
});


async function getCroppedImg(
  image: HTMLImageElement,
  crop: CropType,
  scale = 1,
  rotate = 0
): Promise<string> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  
  canvas.width = crop.width;
  canvas.height = crop.height;

  ctx.imageSmoothingQuality = 'high';

  const cropX = crop.x * scaleX;
  const cropY = crop.y * scaleY;

  const centerX = image.naturalWidth / 2;
  const centerY = image.naturalHeight / 2;
  
  ctx.save();
  ctx.translate(-cropX, -cropY);
  ctx.translate(centerX, centerY);
  ctx.rotate((rotate * Math.PI) / 180);
  ctx.scale(scale, scale);
  ctx.translate(-centerX, -centerY);
  ctx.drawImage(
    image,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
  );

  ctx.restore();

  return canvas.toDataURL('image/jpeg', 0.95);
}


// Optimized Cropping Component
function CroppingView({
  imgSrc,
  aspect,
  isCircular,
  onConfirm,
  onCancel,
}: {
  imgSrc: string;
  aspect: number;
  isCircular: boolean;
  onConfirm: (dataUrl: string) => void;
  onCancel: () => void;
}) {
  const [crop, setCrop] = useState<CropType>();
  const [completedCrop, setCompletedCrop] = useState<CropType>();
  const imgRef = useRef<HTMLImageElement>(null);
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    setCrop(centerCrop(
      makeAspectCrop({ unit: '%', width: 90 }, aspect, width, height),
      width,
      height
    ));
  }

  const handleConfirmCrop = async () => {
    if (completedCrop && completedCrop.width > 0 && completedCrop.height > 0 && imgRef.current) {
        try {
            const croppedDataUrl = await getCroppedImg(imgRef.current, completedCrop, scale, rotate);
            onConfirm(croppedDataUrl);
        } catch (e) {
            console.error("Error cropping image:", e);
        }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-center bg-muted/50 p-4 rounded-md min-h-[450px] max-h-[450px]">
        {imgSrc && (
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspect}
            circularCrop={isCircular}
            keepSelection
          >
            <Image
              ref={imgRef}
              alt="Crop preview"
              src={imgSrc}
              width={0}
              height={0}
              sizes="100vw"
              style={{
                width: '100%',
                height: 'auto',
                objectFit: 'contain',
                transform: `scale(${scale}) rotate(${rotate}deg)`,
              }}
              onLoad={onImageLoad}
            />
          </ReactCrop>
        )}
      </div>

       <div className="flex items-center gap-4 px-4">
        <ZoomOut className="h-5 w-5 text-muted-foreground" />
        <Slider
          defaultValue={[1]}
          value={[scale]}
          min={0.1}
          max={4}
          step={0.01}
          onValueChange={(value) => setScale(value[0])}
        />
        <ZoomIn className="h-5 w-5 text-muted-foreground" />
      </div>

      <DialogFooter>
        <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button onClick={handleConfirmCrop}>Confirmar Recorte</Button>
      </DialogFooter>
    </div>
  );
}

interface EditProfileDialogProps {
    user: User;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onProfileUpdate: (data: { name: string; bio?: string; newAvatarUrl?: string; newBannerUrl?: string }) => void;
}


export function EditProfileDialog({ user, open, onOpenChange, onProfileUpdate }: EditProfileDialogProps) {
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(user.avatarUrl);
  const [bannerPreview, setBannerPreview] = useState<string | undefined>(user.bannerUrl);
  
  // State for the image that is currently being cropped
  const [imageToCrop, setImageToCrop] = useState('');
  const [croppingTarget, setCroppingTarget] = useState<'avatar' | 'banner' | null>(null);

  // State for the final cropped images
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
      setImageToCrop('');
    }
  }, [open, user, form]);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>, target: 'avatar' | 'banner') => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => setImageToCrop(reader.result?.toString() || ''));
      reader.readAsDataURL(e.target.files[0]);
      setCroppingTarget(target);
    }
    // Reset file input to allow re-selecting the same file
    e.target.value = '';
  };
  
  const handleConfirmCrop = (croppedDataUrl: string) => {
    if (croppingTarget === 'avatar') {
      setCroppedAvatar(croppedDataUrl);
      setAvatarPreview(croppedDataUrl);
    } else if (croppingTarget === 'banner') {
      setCroppedBanner(croppedDataUrl);
      setBannerPreview(croppedDataUrl);
    }
    // Exit cropping mode
    setCroppingTarget(null);
    setImageToCrop('');
  };

  const handleCancelCrop = () => {
    setCroppingTarget(null);
    setImageToCrop('');
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    onProfileUpdate({
      name: values.name,
      bio: values.bio,
      newAvatarUrl: croppedAvatar || undefined,
      newBannerUrl: croppedBanner || undefined,
    });
    onOpenChange(false);
  }
  
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
          <DialogTitle>{croppingTarget ? 'Ajustar Imagen' : 'Editar Perfil'}</DialogTitle>
          <DialogDescription>
            {croppingTarget ? 'Arrastra y ajusta el recuadro para seleccionar la parte de la imagen que quieres usar.' : 'Personaliza tu perfil. Los cambios serán visibles para otros usuarios.'}
          </DialogDescription>
        </DialogHeader>
        {croppingTarget ? (
            <CroppingView
                imgSrc={imageToCrop}
                aspect={croppingTarget === 'avatar' ? 1 : 16 / 9}
                isCircular={croppingTarget === 'avatar'}
                onConfirm={handleConfirmCrop}
                onCancel={handleCancelCrop}
            />
        ) : <EditFormView />}
      </DialogContent>
    </Dialog>
  );
}
