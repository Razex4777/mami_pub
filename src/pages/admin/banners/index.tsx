import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/interactive/button';
import { Input } from '@/components/ui/forms/input';
import { Label } from '@/components/ui/forms/label';
import { Switch } from '@/components/ui/forms/switch';
import { useToast } from '@/components/ui/feedback/use-toast';
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
  GripVertical,
  Image as ImageIcon,
  ExternalLink,
  Eye,
  EyeOff,
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
        title: 'Erreur',
        description: 'Impossible de charger les bannières.',
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
        title: 'Erreur de validation',
        description: 'Veuillez remplir tous les champs obligatoires.',
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
          title: 'Bannière mise à jour',
          description: `"${formData.title}" a été mise à jour avec succès.`,
        });
      } else {
        await createBanner(formData);
        toast({
          title: 'Bannière créée',
          description: `"${formData.title}" a été créée avec succès.`,
        });
      }
      
      setIsFormOpen(false);
      fetchBanners();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la sauvegarde.',
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
        title: 'Bannière supprimée',
        description: `"${bannerToDelete.title}" a été supprimée.`,
      });
      setDeleteDialogOpen(false);
      setBannerToDelete(null);
      fetchBanners();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la bannière.',
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = async (banner: StoreBanner) => {
    try {
      await updateBanner(banner.id, { is_active: !banner.is_active });
      toast({
        title: banner.is_active ? 'Bannière désactivée' : 'Bannière activée',
        description: `"${banner.title}" a été ${banner.is_active ? 'désactivée' : 'activée'}.`,
      });
      fetchBanners();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le statut.',
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
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Bannières</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Gérer les bannières promotionnelles du store</p>
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
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Bannières</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Gérer les bannières promotionnelles du store ({banners.length} bannière{banners.length !== 1 ? 's' : ''})
          </p>
        </div>
        <Button size="sm" onClick={() => handleOpenForm()} className="h-8 sm:h-9 text-xs sm:text-sm">
          <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          Ajouter une bannière
        </Button>
      </div>

      {/* Banners Grid */}
      {banners.length === 0 ? (
        <Card className="p-8 text-center">
          <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucune bannière</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Commencez par créer votre première bannière promotionnelle.
          </p>
          <Button onClick={() => handleOpenForm()}>
            <Plus className="h-4 w-4 mr-2" />
            Créer une bannière
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {banners.map((banner) => (
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
                  {banner.is_active ? 'Active' : 'Inactive'}
                </div>
                {/* Order Badge */}
                <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-black/50 text-white text-xs font-medium">
                  #{banner.display_order + 1}
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
                    className="text-xs text-blue-500 hover:underline flex items-center gap-1 mb-3"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span className="truncate">{banner.link_url}</span>
                  </a>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleActive(banner)}
                    className="h-8 px-2"
                  >
                    {banner.is_active ? (
                      <><EyeOff className="h-4 w-4 mr-1" /> Désactiver</>
                    ) : (
                      <><Eye className="h-4 w-4 mr-1" /> Activer</>
                    )}
                  </Button>
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingBanner ? 'Modifier la bannière' : 'Nouvelle bannière'}
            </DialogTitle>
            <DialogDescription>
              {editingBanner 
                ? 'Modifiez les informations de la bannière.' 
                : 'Créez une nouvelle bannière promotionnelle pour le store.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Promo -30%"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">URL de l'image *</Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://... ou /images/banner.png"
              />
              {formData.image_url && (
                <div className="mt-2 aspect-[21/9] bg-muted rounded-lg overflow-hidden">
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="alt_text">Texte alternatif *</Label>
              <Input
                id="alt_text"
                value={formData.alt_text}
                onChange={(e) => setFormData({ ...formData, alt_text: e.target.value })}
                placeholder="Description de l'image pour l'accessibilité"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="link_url">Lien (optionnel)</Label>
              <Input
                id="link_url"
                value={formData.link_url || ''}
                onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                placeholder="https://... ou /store?category=promo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_order">Ordre d'affichage</Label>
              <Input
                id="display_order"
                type="number"
                min="0"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Bannière active</Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)} disabled={saving}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingBanner ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la bannière ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer "{bannerToDelete?.title}" ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BannersPage;
