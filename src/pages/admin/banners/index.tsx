import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/interactive/button';
import { Input } from '@/components/ui/forms/input';
import { Label } from '@/components/ui/forms/label';
import { Switch } from '@/components/ui/forms/switch';
import { useToast } from '@/components/ui/feedback/use-toast';
import BannerImageUpload from '@/components/ui/forms/BannerImageUpload';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/overlays/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/overlays/alert-dialog';
import {
  Plus,
  Pencil,
  Trash2,
  Image as ImageIcon,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import {
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} from '@/supabase';
import type { StoreBanner, StoreBannerInsert, StoreBannerUpdate } from '@/supabase';

const BannersPage: React.FC = () => {
  const { t: translate } = useLanguage();
  const t = (key: string) => translate(key, 'admin_banners');
  const { toast } = useToast();
  const [banners, setBanners] = useState<StoreBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<StoreBanner | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<StoreBanner | null>(null);
  
  const [formData, setFormData] = useState<StoreBannerInsert>({
    title: '',
    image_url: '',
    alt_text: '',
    link_url: '',
    is_active: true,
    display_order: 0,
  });

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const data = await getAllBanners();
      setBanners(data);
    } catch (error) {
      toast({
        title: t('toast.error'),
        description: t('toast.loadError'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleOpenForm = (banner?: StoreBanner) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        title: banner.title,
        image_url: banner.image_url,
        alt_text: banner.alt_text,
        link_url: banner.link_url || '',
        is_active: banner.is_active,
        display_order: banner.display_order,
      });
    } else {
      setEditingBanner(null);
      setFormData({
        title: '',
        image_url: '',
        alt_text: '',
        link_url: '',
        is_active: true,
        display_order: banners.length,
      });
    }
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.image_url || !formData.alt_text) {
      toast({
        title: t('toast.validationError'),
        description: t('toast.validationMessage'),
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      
      if (editingBanner) {
        const updates: StoreBannerUpdate = {
          title: formData.title,
          image_url: formData.image_url,
          alt_text: formData.alt_text,
          link_url: formData.link_url || null,
          is_active: formData.is_active,
          display_order: formData.display_order,
        };
        await updateBanner(editingBanner.id, updates);
        toast({
          title: t('toast.updated'),
          description: t('toast.updatedDesc').replace('{title}', formData.title),
        });
      } else {
        await createBanner(formData);
        toast({
          title: t('toast.created'),
          description: t('toast.createdDesc').replace('{title}', formData.title),
        });
      }
      
      setIsFormOpen(false);
      fetchBanners();
    } catch (error) {
      toast({
        title: t('toast.error'),
        description: t('toast.saveError'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!bannerToDelete) return;
    
    try {
      await deleteBanner(bannerToDelete.id);
      toast({
        title: t('toast.deleted'),
        description: t('toast.deletedDesc').replace('{title}', bannerToDelete.title),
      });
      setDeleteDialogOpen(false);
      setBannerToDelete(null);
      fetchBanners();
    } catch (error) {
      toast({
        title: t('toast.error'),
        description: t('toast.deleteError'),
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = async (banner: StoreBanner) => {
    const newStatus = !banner.is_active;
    
    // Optimistic update - update UI immediately
    setBanners(prev => 
      prev.map(b => b.id === banner.id ? { ...b, is_active: newStatus } : b)
    );

    try {
      await updateBanner(banner.id, { is_active: newStatus });
      toast({
        title: newStatus ? t('toast.activated') : t('toast.deactivated'),
        description: t('toast.toggledDesc').replace('{title}', banner.title).replace('{status}', newStatus ? t('status.active').toLowerCase() : t('status.inactive').toLowerCase()),
      });
    } catch (error) {
      // Revert on error
      setBanners(prev => 
        prev.map(b => b.id === banner.id ? { ...b, is_active: !newStatus } : b)
      );
      toast({
        title: t('toast.error'),
        description: t('toast.statusError'),
        variant: 'destructive',
      });
    }
  };

  const confirmDelete = (banner: StoreBanner) => {
    setBannerToDelete(banner);
    setDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">{t('title')}</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">{t('subtitle')}</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-[21/9] bg-muted rounded-t-lg" />
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {t('subtitle')} ({banners.length} {banners.length !== 1 ? t('subtitleCountPlural') : t('subtitleCount')})
          </p>
        </div>
        <Button size="sm" onClick={() => handleOpenForm()} className="h-8 sm:h-9 text-xs sm:text-sm">
          <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          {t('addBanner')}
        </Button>
      </div>

      {/* Banners Grid */}
      {banners.length === 0 ? (
        <Card className="p-8 text-center">
          <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t('empty.title')}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t('empty.description')}
          </p>
          <Button onClick={() => handleOpenForm()}>
            <Plus className="h-4 w-4 mr-2" />
            {t('createBanner')}
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {banners.map((banner, index) => (
            <Card key={banner.id} className={`overflow-hidden transition-all duration-200 hover:shadow-md ${!banner.is_active ? 'opacity-60' : ''}`}>
              {/* Banner Image */}
              <div className="relative aspect-[21/9] bg-muted">
                <img
                  src={banner.image_url}
                  alt={banner.alt_text}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/placeholder-banner.png';
                  }}
                />
                {/* Status Badge */}
                <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
                  banner.is_active 
                    ? 'bg-green-500/90 text-white' 
                    : 'bg-gray-500/90 text-white'
                }`}>
                  {banner.is_active ? t('status.active') : t('status.inactive')}
                </div>
                {/* Order Badge */}
                <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-black/50 text-white text-xs font-medium">
                  #{index + 1}
                </div>
              </div>

              {/* Banner Info */}
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm truncate">{banner.title}</h3>
                    <p className="text-xs text-muted-foreground truncate">{banner.alt_text}</p>
                  </div>
                </div>

                {banner.link_url && (
                  <a
                    href={banner.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 text-xs font-medium transition-colors mb-3"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {t('card.viewLink')}
                  </a>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={banner.is_active}
                      onCheckedChange={() => handleToggleActive(banner)}
                      className="scale-90"
                    />
                    <span className="text-[10px] text-muted-foreground">
                      {banner.is_active ? t('status.active') : t('status.inactive')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenForm(banner)}
                      className="h-8 w-8"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => confirmDelete(banner)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="w-[calc(100%-1rem)] sm:w-full sm:max-w-[500px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">
              {editingBanner ? t('dialog.editTitle') : t('dialog.createTitle')}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {editingBanner 
                ? t('dialog.editDescription') 
                : t('dialog.createDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 sm:space-y-4 py-2 sm:py-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="title" className="text-xs sm:text-sm">{t('form.titleRequired')}</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={t('form.titlePlaceholder')}
                className="h-9 sm:h-10 text-sm"
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-xs sm:text-sm">{t('form.imageRequired')}</Label>
              <BannerImageUpload
                value={formData.image_url}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
                disabled={saving}
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="alt_text" className="text-xs sm:text-sm">{t('form.altTextRequired')}</Label>
              <Input
                id="alt_text"
                value={formData.alt_text}
                onChange={(e) => setFormData({ ...formData, alt_text: e.target.value })}
                placeholder={t('form.altTextPlaceholder')}
                className="h-9 sm:h-10 text-sm"
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="link_url" className="text-xs sm:text-sm">{t('form.linkUrl')}</Label>
              <Input
                id="link_url"
                value={formData.link_url || ''}
                onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                placeholder={t('form.linkUrlPlaceholder')}
                className="h-9 sm:h-10 text-sm"
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="display_order" className="text-xs sm:text-sm">{t('form.displayOrder')}</Label>
              <Input
                id="display_order"
                type="number"
                min="0"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                className="h-9 sm:h-10 text-sm"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="is_active" className="text-xs sm:text-sm">{t('form.isActive')}</Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 flex-col-reverse sm:flex-row">
            <Button variant="outline" onClick={() => setIsFormOpen(false)} disabled={saving} className="h-9 sm:h-10 text-sm">
              {t('dialog.cancel')}
            </Button>
            <Button onClick={handleSave} disabled={saving} className="h-9 sm:h-10 text-sm">
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingBanner ? t('dialog.update') : t('dialog.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteDialog.description').replace('{title}', bannerToDelete?.title || '')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('deleteDialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('deleteDialog.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BannersPage;
