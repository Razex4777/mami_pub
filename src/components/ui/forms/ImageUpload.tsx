import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, Video, Plus } from 'lucide-react';
import { Button } from '@/components/ui/interactive/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { validateImageFile } from '@/supabase';
import { useLanguage } from '@/contexts/LanguageContext';

// French translations (default)
const fr = {
  imageUpload: {
    dropHere: 'Déposez les {type} ici',
    dragDrop: 'Glissez-déposez vos {type}',
    files: 'fichiers',
    images: 'images',
    imagesVideos: 'images/vidéos',
    clickToBrowse: 'ou <span>cliquez pour parcourir</span>',
    formatInfoImages: 'JPG, PNG, WebP ou GIF • Max 5 Mo • {count}/{max} images',
    formatInfoMedia: 'JPG, PNG, WebP, GIF, MP4, WebM • Images max 5 Mo, Vidéos max 50 Mo • {count}/{max}',
    maxFiles: 'Maximum {max} fichiers',
    maxFilesDesc: 'Vous pouvez ajouter {remaining} fichier(s) supplémentaire(s).',
    videosNotAllowed: 'Vidéos non autorisées',
    videosNotAllowedDesc: 'Seules les images sont acceptées ici.',
    invalidFile: 'Fichier invalide',
    filesAdded: '{count} fichier(s) ajouté(s)',
    videoFormatError: 'Format vidéo non supporté. Utilisez MP4, WebM ou MOV.',
    videoSizeError: 'Vidéo trop volumineuse. Maximum {size} Mo.',
    primary: 'Principal',
    video: 'Vidéo',
    pending: 'En attente',
    noMedia: 'Aucun média ajouté',
    noImages: 'Aucune image ajoutée'
  }
};

// Media item can be a blob URL (local) or a remote URL (already uploaded)
interface MediaItem {
  url: string;
  file?: File; // Only present for local files not yet uploaded
  isVideo: boolean;
}

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  onFilesChange?: (files: File[]) => void; // Callback to get pending files for upload
  initialPendingFiles?: File[]; // Initial pending files to restore state
  maxImages?: number;
  disabled?: boolean;
  className?: string;
  allowVideo?: boolean;
}

// Helper to check if URL/file is a video
const isVideoFile = (file: File): boolean => {
  return file.type.startsWith('video/');
};

const isVideoUrl = (url: string): boolean => {
  const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.m4v'];
  const lowerUrl = url.toLowerCase();
  return videoExtensions.some(ext => lowerUrl.includes(ext)) || url.startsWith('blob:') && false; // blob URLs need file check
};

// Validate video file - returns error key for translation
const validateVideoFile = (file: File, maxSizeMB = 50): { isValid: boolean; errorKey?: string; errorParams?: Record<string, string> } => {
  const MAX_SIZE = maxSizeMB * 1024 * 1024;
  const ALLOWED_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      isValid: false,
      errorKey: 'imageUpload.videoFormatError',
    };
  }

  if (file.size > MAX_SIZE) {
    return {
      isValid: false,
      errorKey: 'imageUpload.videoSizeError',
      errorParams: { size: String(maxSizeMB) },
    };
  }

  return { isValid: true };
};

const ImageUpload: React.FC<ImageUploadProps> = ({
  value = [],
  onChange,
  onFilesChange,
  initialPendingFiles = [],
  maxImages = 10,
  disabled = false,
  className,
  allowVideo = false,
}) => {
  const { t: translate, language } = useLanguage();
  
  // Translation helper - French hardcoded, others from JSON
  const getFrenchText = (key: string): string => {
    const keys = key.split('.');
    let value: unknown = fr;
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = (value as Record<string, unknown>)[k];
      } else {
        return key;
      }
    }
    return typeof value === 'string' ? value : key;
  };
  
  const t = (key: string, params?: Record<string, string>) => {
    let text: string;
    if (language === 'fr') {
      text = getFrenchText(key);
    } else {
      const translated = translate(key, 'components');
      text = translated === key ? getFrenchText(key) : translated;
    }
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, v);
      });
    }
    return text;
  };
  const [isDragging, setIsDragging] = useState(false);
  const [localMedia, setLocalMedia] = useState<MediaItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initializedRef = useRef(false);

  // Initialize from initialPendingFiles on first mount
  useEffect(() => {
    // Skip only on the very first render if we have pending files to restore
    if (!initializedRef.current && initialPendingFiles.length > 0) {
      initializedRef.current = true;
      const restoredMedia: MediaItem[] = initialPendingFiles.map(file => ({
        url: URL.createObjectURL(file),
        file,
        isVideo: isVideoFile(file),
      }));
      
      const existingUrls = value.filter(url => !url.startsWith('blob:'));
      const existingMedia: MediaItem[] = existingUrls.map(url => ({
        url,
        isVideo: isVideoUrl(url),
      }));
      
      setLocalMedia([...existingMedia, ...restoredMedia]);
      
      // Update parent with all URLs
      const allUrls = [...existingUrls, ...restoredMedia.map(m => m.url)];
      if (onChangeRef.current) {
        onChangeRef.current(allUrls);
      }
      
      // Cleanup blob URLs on unmount
      return () => {
        restoredMedia.forEach(m => URL.revokeObjectURL(m.url));
      };
    }
  }, [initialPendingFiles, value]); // Removed onChange from dependencies

  // Sync local media with value prop (for existing URLs)
  useEffect(() => {
    // Skip if we haven't initialized yet and have pending files
    if (!initializedRef.current && initialPendingFiles.length > 0) {
      return;
    }
    
    // Mark as initialized after first sync
    if (!initializedRef.current) {
      initializedRef.current = true;
    }
    
    const existingUrls = value.filter(url => !url.startsWith('blob:'));
    
    // Get current local state
    const currentLocalUrls = localMedia.filter(m => !m.url.startsWith('blob:')).map(m => m.url);
    const localBlobs = localMedia.filter(m => m.url.startsWith('blob:'));
    
    // Check if external URLs changed
    const hasExternalChange = existingUrls.length !== currentLocalUrls.length || 
      existingUrls.some((url, i) => url !== currentLocalUrls[i]);

    if (!hasExternalChange) return;

    const existingMedia: MediaItem[] = existingUrls.map(url => ({
      url,
      isVideo: isVideoUrl(url),
      file: undefined,
    }));
    
    // If we have NEW external URLs that weren't there before, it means upload completed
    // In this case, clear the local blobs (they've been uploaded and replaced)
    const hasNewExternalUrl = existingUrls.some(url => !currentLocalUrls.includes(url));
    
    if (hasNewExternalUrl && localBlobs.length > 0) {
      // Upload completed - revoke blob URLs and use only external URLs
      localBlobs.forEach(m => URL.revokeObjectURL(m.url));
      setLocalMedia(existingMedia);
    } else {
      // No new uploads - preserve local blobs (user is still editing)
      setLocalMedia([...existingMedia, ...localBlobs]);
    }
  }, [value, initialPendingFiles.length]);

  // Use refs for callbacks to avoid effect dependencies
  const onChangeRef = useRef(onChange);
  const onFilesChangeRef = useRef(onFilesChange);

  useEffect(() => {
    onChangeRef.current = onChange;
    onFilesChangeRef.current = onFilesChange;
  }, [onChange, onFilesChange]);

  // Notify parent of pending files
  useEffect(() => {
    if (onFilesChangeRef.current) {
      const pendingFiles = localMedia
        .filter(m => m.file)
        .map(m => m.file!);
      // Only call if we have pending files or if we need to clear them
      // But actually, this effect runs on every render if onFilesChange changes in the original code.
      // With ref, it only runs when localMedia changes.
      onFilesChangeRef.current(pendingFiles);
    }
  }, [localMedia]);

  const handleFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const currentCount = localMedia.length;
    const remainingSlots = maxImages - currentCount;
    
    if (fileArray.length > remainingSlots) {
      toast.warning(t('imageUpload.maxFiles', { max: String(maxImages) }), {
        description: t('imageUpload.maxFilesDesc', { remaining: String(remainingSlots) }),
      });
      fileArray.splice(remainingSlots);
    }

    if (fileArray.length === 0) return;

    // Validate and create blob URLs for preview
    const newMedia: MediaItem[] = [];
    
    for (const file of fileArray) {
      const isVideo = isVideoFile(file);
      
      if (isVideo && !allowVideo) {
        toast.error(t('imageUpload.videosNotAllowed'), {
          description: t('imageUpload.videosNotAllowedDesc'),
        });
        continue;
      }
      
      if (isVideo) {
        const validation = validateVideoFile(file);
        if (!validation.isValid) {
          toast.error(t('imageUpload.invalidFile'), {
            description: validation.errorKey ? t(validation.errorKey, validation.errorParams) : '',
          });
          continue;
        }
      } else {
        const validation = validateImageFile(file);
        if (!validation.isValid) {
          toast.error(t('imageUpload.invalidFile'), {
            description: validation.error,
          });
          continue;
        }
      }

      // Create blob URL for instant preview
      const blobUrl = URL.createObjectURL(file);
      newMedia.push({
        url: blobUrl,
        file,
        isVideo,
      });
    }

    if (newMedia.length > 0) {
      setLocalMedia(prev => {
        const updated = [...prev, ...newMedia];
        // Update parent with all URLs from the updated local state
        const allUrls = updated.map(m => m.url);
        if (onChangeRef.current) {
          onChangeRef.current(allUrls);
        }
        return updated;
      });
      toast.success(t('imageUpload.filesAdded', { count: String(newMedia.length) }));
    }
  }, [localMedia, maxImages, allowVideo, t]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [disabled, handleFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
    // Reset input to allow selecting same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFiles]);

  const handleRemove = useCallback((index: number) => {
    const mediaToRemove = localMedia[index];
    
    // Revoke blob URL to free memory
    if (mediaToRemove?.url.startsWith('blob:')) {
      URL.revokeObjectURL(mediaToRemove.url);
    }
    
    const newMedia = localMedia.filter((_, i) => i !== index);
    setLocalMedia(newMedia);
    
    // Update parent
    const newUrls = newMedia.map(m => m.url);
    if (onChangeRef.current) {
      onChangeRef.current(newUrls);
    }
  }, [localMedia]); // Removed onChange

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const canAddMore = localMedia.length < maxImages;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={canAddMore && !disabled ? openFileDialog : undefined}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-4 sm:p-6 transition-all',
          'flex flex-col items-center justify-center gap-2 text-center min-h-[120px] sm:min-h-[150px]',
          isDragging && 'border-primary bg-primary/5',
          canAddMore && !disabled && 'cursor-pointer hover:border-primary/50 hover:bg-muted/50',
          disabled && 'opacity-50 cursor-not-allowed',
          !canAddMore && 'border-muted-foreground/20'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={allowVideo 
            ? "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime" 
            : "image/jpeg,image/png,image/webp,image/gif"
          }
          multiple
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || !canAddMore}
        />

        <div className={cn(
          'p-3 rounded-full',
          isDragging ? 'bg-primary/10' : 'bg-muted'
        )}>
          <Upload className={cn(
            'h-6 w-6',
            isDragging ? 'text-primary' : 'text-muted-foreground'
          )} />
        </div>
        <div>
          <p className="text-sm font-medium">
            {isDragging 
              ? t('imageUpload.dropHere', { type: allowVideo ? t('imageUpload.files') : t('imageUpload.images') })
              : t('imageUpload.dragDrop', { type: allowVideo ? t('imageUpload.imagesVideos') : t('imageUpload.images') })
            }
          </p>
          <p className="text-xs text-muted-foreground mt-1" dangerouslySetInnerHTML={{ 
            __html: t('imageUpload.clickToBrowse').replace('<span>', '<span class="text-primary">') 
          }} />
        </div>
        <p className="text-[10px] text-muted-foreground">
          {allowVideo 
            ? t('imageUpload.formatInfoMedia', { count: String(localMedia.length), max: String(maxImages) })
            : t('imageUpload.formatInfoImages', { count: String(localMedia.length), max: String(maxImages) })
          }
        </p>
      </div>

      {/* Media Previews */}
      {localMedia.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
          {localMedia.map((media, index) => (
            <div
              key={media.url}
              className="relative group aspect-square rounded-lg overflow-hidden bg-muted border"
            >
              {media.isVideo ? (
                <div className="relative w-full h-full">
                  <video
                    src={media.url}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Video className="h-8 w-8 text-white" />
                  </div>
                </div>
              ) : (
                <img
                  src={media.url}
                  alt={`Image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              )}
              {/* Remove Button - always visible on mobile */}
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-5 w-5 sm:h-6 sm:w-6 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(index);
                }}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>
              {/* Index Badge */}
              {index === 0 && (
                <div className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded font-medium">
                  {t('imageUpload.primary')}
                </div>
              )}
              {/* Video Badge */}
              {media.isVideo && (
                <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                  {t('imageUpload.video')}
                </div>
              )}
              {/* Pending upload indicator */}
              {media.file && (
                <div className="absolute top-1 left-1 bg-yellow-500/90 text-white text-[8px] px-1 py-0.5 rounded font-medium">
                  {t('imageUpload.pending')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {localMedia.length === 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ImageIcon className="h-4 w-4" />
          <span>{allowVideo ? t('imageUpload.noMedia') : t('imageUpload.noImages')}</span>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;

// Export helper to get pending files from URLs
export const getPendingFiles = (urls: string[], mediaItems: MediaItem[]): File[] => {
  return mediaItems.filter(m => m.file).map(m => m.file!);
};

export type { MediaItem };
