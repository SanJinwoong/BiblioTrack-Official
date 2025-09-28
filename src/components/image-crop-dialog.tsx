'use client';

import React, { useState, useRef } from 'react';
import ReactCrop, { type Crop as CropType, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Slider } from './ui/slider';
import { ZoomIn, ZoomOut } from 'lucide-react';
import Image from 'next/image';

interface ImageCropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageSrc: string;
  aspectRatio?: number;
  title?: string;
  onCropComplete: (croppedImage: string) => void;
}

// Helper function to get the cropped image data URL - exactamente igual que en edit-profile-dialog
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

    ctx.scale(pixelRatio, pixelRatio);
    ctx.imageSmoothingQuality = 'high';

    const centerX = image.naturalWidth / 2;
    const centerY = image.naturalHeight / 2;

    ctx.save();

    ctx.translate(-crop.x * scaleX, -crop.y * scaleY);
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

// Componente de recorte - estructura idéntica a CroppingView del perfil
function CroppingView({
  imgSrc,
  aspect,
  onConfirm,
  onCancel,
}: {
  imgSrc: string;
  aspect: number;
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

export function ImageCropDialog({ 
  open, 
  onOpenChange, 
  imageSrc, 
  aspectRatio = 3/4,
  title = "Recortar Portada del Libro",
  onCropComplete 
}: ImageCropDialogProps) {

  const handleConfirm = (dataUrl: string) => {
    onCropComplete(dataUrl);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl h-full max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle>{title}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Arrastra y ajusta la imagen para crear una portada perfecta para el libro.
          </p>
        </DialogHeader>
        
        <div className="flex-1 p-6 min-h-0">
          <CroppingView
            imgSrc={imageSrc}
            aspect={aspectRatio}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}