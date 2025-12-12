import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, Loader2, Crop } from 'lucide-react';
import { Button } from '@/components/ui/interactive/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { uploadBannerImage, validateImageFile } from '@/supabase';
import ImageCropper from '@/components/ui/image-crop/ImageCropper';

interface BannerImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  className?: string;
}

const BannerImageUpload: React.FC<BannerImageUploadProps> = ({
  value,
  onChange,
  disabled = false,
  className,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection - show cropper first
  const handleFileSelected = useCallback((file: File) => {
    // Validate file (10MB max for banners)
    const validation = validateImageFile(file, 10);
    if (!validation.isValid) {
      toast.error('Fichier invalide', {
        description: validation.error,
      });
      return;
    }

    // Create object URL for cropper
    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);
    setCropperOpen(true);
  }, []);

  // Handle cropped image - upload to Supabase
  const handleCropComplete = useCallback(async (croppedImageUrl: string, croppedBlob: Blob) => {
    // Clean up the selected image URL
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage);
      setSelectedImage(null);
    }

    setIsUploading(true);

    try {
      // Convert blob to file for upload
      const file = new File([croppedBlob], `banner-${Date.now()}.jpg`, { type: 'image/jpeg' });
      const url = await uploadBannerImage(file);
      
      // Clean up cropped image URL
      URL.revokeObjectURL(croppedImageUrl);
      
      onChange(url);
      toast.success('Image téléchargée avec succès');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Échec du téléchargement', {
        description: 'Impossible de télécharger l\'image. Veuillez réessayer.',
      });
    } finally {
      setIsUploading(false);
    }
  }, [onChange, selectedImage]);

  // Handle cropper close without saving
  const handleCropperClose = useCallback((open: boolean) => {
    if (!open && selectedImage) {
      URL.revokeObjectURL(selectedImage);
      setSelectedImage(null);
    }
    setCropperOpen(open);
  }, [selectedImage]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  }, [disabled, isUploading]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || isUploading) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelected(files[0]);
    }
  }, [disabled, isUploading, handleFileSelected]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelected(files[0]);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFileSelected]);

  const handleRemove = useCallback(() => {
    onChange('');
  }, [onChange]);

  const openFileDialog = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Image Preview or Drop Zone */}
      {value ? (
        <div className="relative group">
          <div className="aspect-[21/9] bg-muted rounded-lg overflow-hidden border">
            <img
              src={value}
              alt="Banner preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/placeholder-banner.png';
              }}
            />
          </div>
          {/* Mobile action buttons - always visible */}
          <div className="flex gap-2 mt-2 sm:hidden">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openFileDialog}
              disabled={disabled || isUploading}
              className="flex-1 h-8 text-xs"
            >
              {isUploading ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <Upload className="h-3 w-3 mr-1" />
              )}
              Changer
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              disabled={disabled || isUploading}
              className="h-8 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Supprimer
            </Button>
          </div>
          {/* Desktop overlay with actions - hover only */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex items-center justify-center gap-2 rounded-lg">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={openFileDialog}
              disabled={disabled || isUploading}
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Changer
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              disabled={disabled || isUploading}
            >
              <X className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFileDialog}
          className={cn(
            'relative border-2 border-dashed rounded-lg transition-all aspect-[21/9]',
            'flex flex-col items-center justify-center gap-2 text-center cursor-pointer',
            isDragging && 'border-primary bg-primary/5',
            !disabled && !isUploading && 'hover:border-primary/50 hover:bg-muted/50',
            (disabled || isUploading) && 'opacity-50 cursor-not-allowed'
          )}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 text-primary animate-spin" />
              <p className="text-xs sm:text-sm text-muted-foreground">Téléchargement en cours...</p>
            </>
          ) : (
            <>
              <div className={cn(
                'p-3 sm:p-4 rounded-full',
                isDragging ? 'bg-primary/10' : 'bg-muted'
              )}>
                <Upload className={cn(
                  'h-6 w-6 sm:h-8 sm:w-8',
                  isDragging ? 'text-primary' : 'text-muted-foreground'
                )} />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium">
                  {isDragging ? 'Déposez l\'image ici' : 'Glissez-déposez votre bannière'}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                  ou <span className="text-primary">cliquez pour parcourir</span>
                </p>
              </div>
              <p className="text-[10px] text-muted-foreground px-2">
                JPG, PNG, WebP ou GIF • Max 10 Mo • Ratio 21:9 recommandé
              </p>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {/* Image Cropper Modal */}
      {selectedImage && (
        <ImageCropper
          open={cropperOpen}
          onOpenChange={handleCropperClose}
          imageSrc={selectedImage}
          aspect={21 / 9}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
};

export default BannerImageUpload;
