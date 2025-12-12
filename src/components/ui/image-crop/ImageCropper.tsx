import React, { useState, useCallback } from 'react';
import Cropper, { Area, Point } from 'react-easy-crop';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/overlays/dialog';
import { Button } from '@/components/ui/interactive/button';
import { Slider } from '@/components/ui/forms/slider';
import { Label } from '@/components/ui/forms/label';
import { Loader2, ZoomIn, RotateCw } from 'lucide-react';
import { toast } from 'sonner';

interface ImageCropperProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageSrc: string;
  aspect?: number; // default 21/9 for banners
  onCropComplete: (croppedImageUrl: string, croppedBlob: Blob) => void;
}

// Helper functions
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

function getRadianAngle(degreeValue: number): number {
  return (degreeValue * Math.PI) / 180;
}

function rotateSize(width: number, height: number, rotation: number): { width: number; height: number } {
  const rotRad = getRadianAngle(rotation);
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0
): Promise<{ url: string; blob: Blob } | null> {
  const image = await createImage(imageSrc);
  
  // Step 1: Create a temporary canvas to draw the rotated image
  const rotRad = getRadianAngle(rotation);
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(image.width, image.height, rotation);
  
  const rotatedCanvas = document.createElement('canvas');
  const rotatedCtx = rotatedCanvas.getContext('2d');
  
  if (!rotatedCtx) {
    throw new Error('Failed to create 2D context');
  }
  
  // Size the rotated canvas to fit the rotated image
  rotatedCanvas.width = bBoxWidth;
  rotatedCanvas.height = bBoxHeight;
  
  // Apply rotation transforms: translate to center, rotate, translate back
  rotatedCtx.save();
  rotatedCtx.translate(bBoxWidth / 2, bBoxHeight / 2);
  rotatedCtx.rotate(rotRad);
  rotatedCtx.translate(-image.width / 2, -image.height / 2);
  rotatedCtx.drawImage(image, 0, 0);
  rotatedCtx.restore();
  
  // Step 2: Create final canvas and extract the cropped region
  const croppedCanvas = document.createElement('canvas');
  const croppedCtx = croppedCanvas.getContext('2d');
  
  if (!croppedCtx) {
    throw new Error('Failed to create cropped canvas context');
  }
  
  croppedCanvas.width = pixelCrop.width;
  croppedCanvas.height = pixelCrop.height;
  
  // Draw the cropped region from the rotated canvas to the final canvas
  croppedCtx.drawImage(
    rotatedCanvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    croppedCanvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to generate cropped image blob'));
        return;
      }
      // Note: Caller is responsible for revoking URL with URL.revokeObjectURL()
      resolve({
        url: URL.createObjectURL(blob),
        blob,
      });
    }, 'image/jpeg', 0.95);
  });
}
const ImageCropper: React.FC<ImageCropperProps> = ({
  open,
  onOpenChange,
  imageSrc,
  aspect = 21 / 9, // Banner aspect ratio
  onCropComplete,
}) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isPending, setIsPending] = useState(false);

  const onCropCompleteCallback = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;

    setIsPending(true);
    try {
      const result = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
      if (result) {
        onCropComplete(result.url, result.blob);
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error cropping image:', error);
      setIsPending(false); // Clear loading state before showing error
      toast.error('Échec du recadrage', {
        description: 'Impossible de recadrer l\'image. Veuillez réessayer ou choisir une autre image.',
      });
      return; // Exit early, don't run finally
    } finally {
      setIsPending(false);
    }
  };

  const handleClose = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100%-1rem)] sm:w-full sm:max-w-[600px] max-h-[90vh] p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Recadrer l'image</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Ajustez le cadrage et la rotation de votre image.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4">
          {/* Cropper Area */}
          <div className="relative h-[200px] sm:h-[300px] w-full bg-muted rounded-lg overflow-hidden">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={onCropCompleteCallback}
              classes={{
                containerClassName: isPending ? 'opacity-50 pointer-events-none' : '',
              }}
            />
          </div>

          {/* Controls */}
          <div className="space-y-3 sm:space-y-4">
            {/* Zoom Control */}
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                  <ZoomIn className="h-3 w-3 sm:h-4 sm:w-4" />
                  Zoom
                </Label>
                <span className="text-xs sm:text-sm text-muted-foreground">{Math.round(zoom * 100)}%</span>
              </div>
              <Slider
                value={[zoom]}
                min={1}
                max={3}
                step={0.1}
                onValueChange={(value) => setZoom(value[0])}
                disabled={isPending}
              />
            </div>

            {/* Rotation Control */}
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                  <RotateCw className="h-3 w-3 sm:h-4 sm:w-4" />
                  Rotation
                </Label>
                <span className="text-xs sm:text-sm text-muted-foreground">{rotation}°</span>
              </div>
              <Slider
                value={[rotation]}
                min={0}
                max={360}
                step={1}
                onValueChange={(value) => setRotation(value[0])}
                disabled={isPending}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 flex-col-reverse sm:flex-row">
          <Button variant="outline" onClick={handleClose} disabled={isPending} className="h-9 sm:h-10 text-sm">
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={isPending} className="h-9 sm:h-10 text-sm">
            {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Appliquer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCropper;
