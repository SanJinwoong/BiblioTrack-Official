
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
import type { User, Category } from '@/lib/types';
import Image from 'next/image';
import { Camera, ZoomIn, ZoomOut } from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react';
import ReactCrop, { type Crop as CropType, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Slider } from './ui/slider';
import { ScrollArea } from './ui/scroll-area';
import { getCategories } from '@/lib/supabase-functions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


const formSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  bio: z.string().optional(),
  badgeCategoryId: z.string().optional(),
  badgeLabel: z.string().max(40, 'Máximo 40 caracteres').optional(),
});

// Helper function to get the cropped image data URL
async function getCroppedImg(
    image: HTMLImageElement,
    crop: CropType,
    scale = 1
): Promise<string> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('No 2d context');
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    const pixelRatio = window.devicePixelRatio;

    canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
    canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';

    const cropX = crop.x * scaleX;
    const cropY = crop.y * scaleY;

    const centerX = image.naturalWidth / 2;
    const centerY = image.naturalHeight / 2;

    ctx.save();
    
    ctx.translate(-cropX, -cropY);
    ctx.translate(centerX, centerY);
    ctx.scale(scale, scale);
    ctx.translate(-centerX, -centerY);

    ctx.drawImage(
        image,
        0,
        0,
        image.naturalWidth,
        image.naturalHeight
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
            const dataUrl = await getCroppedImg(imgRef.current, completedCrop, scale);
            onConfirm(dataUrl);
        } catch (e) {
            console.error("Error cropping image:", e);
        }
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col items-center justify-center bg-muted/50 p-4 rounded-md flex-1 min-h-0">
        {imgSrc && (
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspect}
            circularCrop={isCircular}
            keepSelection
            className="max-h-[450px]"
          >
            <Image
              ref={imgRef}
              alt="Crop preview"
              src={imgSrc}
              width={0}
              height={0}
              sizes="100vw"
              style={{
                width: 'auto',
                height: 'auto',
                maxHeight: '450px',
                objectFit: 'contain',
                transform: `scale(${scale}) rotate(${rotate}deg)`,
              }}
              onLoad={onImageLoad}
            />
          </ReactCrop>
        )}
      </div>

       <div className="flex items-center gap-4 px-4 pt-4">
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

      <DialogFooter className="pt-4">
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
  const [categories, setCategories] = useState<Category[]>([]);
  
  // State for the image that is currently being cropped
  const [imageToCrop, setImageToCrop] = useState('');
  const [croppingTarget, setCroppingTarget] = useState<'avatar' | 'banner' | null>(null);

  // State for the final cropped images
  const [croppedAvatar, setCroppedAvatar] = useState<string | null>(null);
  const [croppedBanner, setCroppedBanner] = useState<string | null>(null);
  const [lastOpenState, setLastOpenState] = useState(false);
  // Template para generar la etiqueta automáticamente
  const [labelTemplate, setLabelTemplate] = useState<string>('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name || '',
      bio: user.bio || '',
      badgeCategoryId: user.badgeCategoryId || '',
      badgeLabel: user.badgeLabel || '',
    },
  });

  useEffect(() => {
    if (open && !lastOpenState) {
      // Solo resetear cuando el diálogo se abre por primera vez (transición false -> true)
  form.reset({ name: user.name || '', bio: user.bio || '', badgeCategoryId: user.badgeCategoryId || '', badgeLabel: user.badgeLabel || '' });
      setAvatarPreview(user.avatarUrl);
      setBannerPreview(user.bannerUrl);
      setCroppedAvatar(null);
      setCroppedBanner(null);
      setCroppingTarget(null);
      setImageToCrop('');
      setLabelTemplate('');
      console.log('🔄 Diálogo abierto - estados reseteados');
    }
    setLastOpenState(open);
  }, [open, user.name, user.bio, user.avatarUrl, user.bannerUrl, form, lastOpenState]);

  // Load categories once when dialog opens
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const cats = await getCategories();
        setCategories(cats);
      } catch (e) {
        console.warn('No se pudieron cargar categorías para insignias', e);
      }
    })();
  }, [open]);

  // Componer etiqueta a partir de plantilla + categoría
  const applyLabelTemplate = (template: string, categoryId?: string | null) => {
    const catId = categoryId ?? form.getValues('badgeCategoryId');
    if (!template || !catId) return;
    const catName = categories.find(c => c.id === catId)?.name?.trim();
    if (!catName) return;
    const result = `${template} ${catName}`;
    form.setValue('badgeLabel', result, { shouldDirty: true });
  };

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
    console.log('✂️ Imagen recortada confirmada para:', croppingTarget);
    console.log('📸 Data URL length:', croppedDataUrl.length);
    console.log('📸 Data URL preview:', croppedDataUrl.substring(0, 100) + '...');
    
    if (croppingTarget === 'avatar') {
      setCroppedAvatar(croppedDataUrl);
      setAvatarPreview(croppedDataUrl);
      console.log('✅ Avatar actualizado');
    } else if (croppingTarget === 'banner') {
      setCroppedBanner(croppedDataUrl);
      setBannerPreview(croppedDataUrl);
      console.log('✅ Banner actualizado');
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
    console.log('📝 Form submit con valores:', values);
    console.log('🖼️ croppedAvatar:', croppedAvatar);
    console.log('🖼️ croppedBanner:', croppedBanner);
    
    const updateData = {
      name: values.name,
      bio: values.bio,
      newAvatarUrl: croppedAvatar || undefined,
      newBannerUrl: croppedBanner || undefined,
      badgeCategoryId: values.badgeCategoryId || undefined,
      badgeLabel: values.badgeLabel || undefined,
    };
    
    console.log('📤 Enviando datos:', updateData);
    
    onProfileUpdate(updateData);
    onOpenChange(false);
  }
  
  const EditFormView = () => (
    <ScrollArea className="h-full">
      <div className="pr-6">
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
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Insignia</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground">Categoría</label>
                        <Select
                          value={form.watch('badgeCategoryId') || ''}
                          onValueChange={(val) => {
                            form.setValue('badgeCategoryId', val, { shouldDirty: true });
                            if (labelTemplate) applyLabelTemplate(labelTemplate, val);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una categoría" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((c) => (
                              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Plantilla (opcional)</label>
                        <Select
                          value={labelTemplate}
                          onValueChange={(tpl) => {
                            setLabelTemplate(tpl);
                            applyLabelTemplate(tpl);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Elige una plantilla" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Amante de">Amante de</SelectItem>
                            <SelectItem value="Adicto a">Adicto a</SelectItem>
                            <SelectItem value="Fan de">Fan de</SelectItem>
                            <SelectItem value="Explorador de">Explorador de</SelectItem>
                            <SelectItem value="Coleccionista de">Coleccionista de</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="mt-2 space-y-1">
                          <label className="text-xs text-muted-foreground">Etiqueta final (editable)</label>
                          <Input placeholder="Ej. Amante de Romance" {...form.register('badgeLabel')} />
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Elige una plantilla para autocompletar con la categoría o escribe tu propia etiqueta. Si la dejas vacía, usaremos el nombre de la categoría.</p>
                  </div>
            </div>

            <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
                <Button type="submit">Guardar Cambios</Button>
            </DialogFooter>
            </form>
        </Form>
      </div>
    </ScrollArea>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl h-full max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle>{croppingTarget ? 'Ajustar Imagen' : 'Editar Perfil'}</DialogTitle>
          <DialogDescription>
            {croppingTarget ? 'Arrastra y ajusta el recuadro para seleccionar la parte de la imagen que quieres usar.' : 'Personaliza tu perfil. Los cambios serán visibles para otros usuarios.'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 min-h-0 p-6 pt-0">
        {croppingTarget ? (
            <CroppingView
                imgSrc={imageToCrop}
                aspect={croppingTarget === 'avatar' ? 1 : 16 / 9}
                isCircular={croppingTarget === 'avatar'}
                onConfirm={handleConfirmCrop}
                onCancel={handleCancelCrop}
            />
        ) : <EditFormView />}
        </div>
      </DialogContent>
    </Dialog>
  );
}
