import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/interactive/button';
import { Input } from '@/components/ui/forms/input';
import { Label } from '@/components/ui/forms/label';
import { Textarea } from '@/components/ui/forms/textarea';
import { Switch } from '@/components/ui/forms/switch';
import { useToast } from '@/components/ui/feedback/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
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
  FolderOpen,
  Loader2,
} from 'lucide-react';
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  generateSlug,
} from '@/supabase';
import type { Category, CategoryInsert, CategoryUpdate } from '@/supabase';

// French translations (default)
const fr = {
  title: 'Catégories',
  subtitle: 'Gérer les catégories de produits',
  addCategory: 'Ajouter une catégorie',
  createCategory: 'Créer une catégorie',
  editCategory: 'Modifier la catégorie',
  newCategory: 'Nouvelle catégorie',
  category: 'catégorie',
  categories: 'catégories',
  active: 'Active',
  inactive: 'Inactive',
  noCategories: 'Aucune catégorie',
  noCategoriesDesc: 'Commencez par créer votre première catégorie de produits.',
  form: {
    name: 'Nom',
    slug: 'Slug',
    slugHint: 'Identifiant unique utilisé dans les URLs',
    description: 'Description',
    descriptionPlaceholder: 'Description de la catégorie...',
    displayOrder: "Ordre d'affichage",
    isActive: 'Catégorie active',
    namePlaceholder: 'Ex: Encres DTF',
    slugPlaceholder: 'encres-dtf'
  },
  dialog: {
    editDesc: 'Modifiez les informations de la catégorie.',
    createDesc: 'Créez une nouvelle catégorie de produits.'
  },
  actions: {
    cancel: 'Annuler',
    update: 'Mettre à jour',
    create: 'Créer',
    delete: 'Supprimer'
  },
  deleteDialog: {
    title: 'Supprimer la catégorie ?',
    description: 'Cette action est irréversible. Les produits associés ne seront pas supprimés mais perdront leur catégorie.'
  },
  toast: {
    error: 'Erreur',
    loadError: 'Impossible de charger les catégories.',
    validationError: 'Erreur de validation',
    nameSlugRequired: 'Le nom et le slug sont obligatoires.',
    categoryUpdated: 'Catégorie mise à jour',
    categoryCreated: 'Catégorie créée',
    categoryDeleted: 'Catégorie supprimée',
    duplicateError: 'Une catégorie avec ce nom ou slug existe déjà.',
    saveError: 'Une erreur est survenue lors de la sauvegarde.',
    deleteError: 'Impossible de supprimer la catégorie. Elle est peut-être utilisée par des produits.',
    statusError: 'Impossible de modifier le statut.',
    activated: 'Catégorie activée',
    deactivated: 'Catégorie désactivée'
  }
};

const CategoriesPage: React.FC = () => {
  const { toast } = useToast();
  const { t, language } = useLanguage();
  
  // Translation helper - get French fallback value
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
  
  const getText = (key: string): string => {
    if (language === 'fr') {
      return getFrenchText(key);
    }
    const translated = t(key, 'admin_categories');
    // If t() returns the key itself, it means translation wasn't found - fall back to French
    return translated === key ? getFrenchText(key) : translated;
  };
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const [formData, setFormData] = useState<CategoryInsert>({
    name: '',
    slug: '',
    description: '',
    image_url: null,
    display_order: 0,
    is_active: true,
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getAllCategories();
      setCategories(data);
    } catch (error) {
      toast({
        title: getText('toast.error'),
        description: getText('toast.loadError'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenForm = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        image_url: category.image_url,
        display_order: category.display_order,
        is_active: category.is_active,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        image_url: null,
        display_order: categories.length,
        is_active: true,
      });
    }
    setIsFormOpen(true);
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: editingCategory ? formData.slug : generateSlug(name),
    });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.slug) {
      toast({
        title: getText('toast.validationError'),
        description: getText('toast.nameSlugRequired'),
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);

      if (editingCategory) {
        const updates: CategoryUpdate = {
          name: formData.name,
          slug: formData.slug,
          description: formData.description || null,
          image_url: formData.image_url,
          display_order: formData.display_order,
          is_active: formData.is_active,
        };
        await updateCategory(editingCategory.id, updates);
        toast({
          title: getText('toast.categoryUpdated'),
          description: `"${formData.name}"`,
        });
      } else {
        await createCategory(formData);
        toast({
          title: getText('toast.categoryCreated'),
          description: `"${formData.name}"`,
        });
      }

      setIsFormOpen(false);
      fetchCategories();
    } catch (error: any) {
      const isDuplicate = error?.code === '23505';
      toast({
        title: getText('toast.error'),
        description: isDuplicate
          ? getText('toast.duplicateError')
          : getText('toast.saveError'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;

    try {
      await deleteCategory(categoryToDelete.id);
      toast({
        title: getText('toast.categoryDeleted'),
        description: `"${categoryToDelete.name}"`,
      });
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
      fetchCategories();
    } catch (error) {
      toast({
        title: getText('toast.error'),
        description: getText('toast.deleteError'),
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = async (category: Category) => {
    const newStatus = !category.is_active;
    
    // Optimistic update - update UI immediately
    setCategories(prev => 
      prev.map(c => c.id === category.id ? { ...c, is_active: newStatus } : c)
    );

    try {
      await updateCategory(category.id, { is_active: newStatus });
      toast({
        title: newStatus ? getText('toast.activated') : getText('toast.deactivated'),
        description: `"${category.name}"`,
      });
    } catch (error) {
      // Revert on error
      setCategories(prev => 
        prev.map(c => c.id === category.id ? { ...c, is_active: !newStatus } : c)
      );
      toast({
        title: getText('toast.error'),
        description: getText('toast.statusError'),
        variant: 'destructive',
      });
    }
  };

  const confirmDelete = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">{getText('title')}</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">{getText('subtitle')}</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-5 bg-muted rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted rounded w-1/2" />
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
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">{getText('title')}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {getText('subtitle')} ({categories.length} {categories.length !== 1 ? getText('categories') : getText('category')})
          </p>
        </div>
        <Button size="sm" onClick={() => handleOpenForm()} className="h-8 sm:h-9 text-xs sm:text-sm">
          <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          {getText('addCategory')}
        </Button>
      </div>

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <Card className="p-8 text-center">
          <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">{getText('noCategories')}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {getText('noCategoriesDesc')}
          </p>
          <Button onClick={() => handleOpenForm()}>
            <Plus className="h-4 w-4 mr-2" />
            {getText('createCategory')}
          </Button>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Card
              key={category.id}
              className={`transition-all duration-200 hover:shadow-md ${!category.is_active ? 'opacity-60' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm truncate">{category.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">/{category.slug}</p>
                  </div>
                  <div className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                    category.is_active
                      ? 'bg-green-500/10 text-green-500'
                      : 'bg-gray-500/10 text-gray-500'
                  }`}>
                    {category.is_active ? 'Active' : 'Inactive'}
                  </div>
                </div>

                {category.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {category.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={category.is_active}
                      onCheckedChange={() => handleToggleActive(category)}
                      className="scale-90"
                    />
                    <span className="text-[10px] text-muted-foreground">
                      {category.is_active ? getText('active') : getText('inactive')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenForm(category)}
                      className="h-7 w-7"
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => confirmDelete(category)}
                      className="h-7 w-7 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
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
        <DialogContent className="w-[calc(100%-1rem)] sm:w-full sm:max-w-[450px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">
              {editingCategory ? getText('editCategory') : getText('newCategory')}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {editingCategory
                ? getText('dialog.editDesc')
                : getText('dialog.createDesc')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 sm:space-y-4 py-2 sm:py-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="name" className="text-xs sm:text-sm">{getText('form.name')} *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder={getText('form.namePlaceholder')}
                className="h-9 sm:h-10 text-sm"
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="slug" className="text-xs sm:text-sm">{getText('form.slug')} *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder={getText('form.slugPlaceholder')}
                className="h-9 sm:h-10 text-sm"
              />
              <p className="text-[10px] text-muted-foreground">
                {getText('form.slugHint')}
              </p>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="description" className="text-xs sm:text-sm">{getText('form.description')}</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={getText('form.descriptionPlaceholder')}
                rows={3}
                className="text-sm"
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="display_order" className="text-xs sm:text-sm">{getText('form.displayOrder')}</Label>
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
              <Label htmlFor="is_active" className="text-xs sm:text-sm">{getText('form.isActive')}</Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 flex-col-reverse sm:flex-row">
            <Button variant="outline" onClick={() => setIsFormOpen(false)} disabled={saving} className="h-9 sm:h-10 text-sm">
              {getText('actions.cancel')}
            </Button>
            <Button onClick={handleSave} disabled={saving} className="h-9 sm:h-10 text-sm">
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingCategory ? getText('actions.update') : getText('actions.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{getText('deleteDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {getText('actions.delete')} "{categoryToDelete?.name}" ? {getText('deleteDialog.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{getText('actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {getText('actions.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CategoriesPage;
