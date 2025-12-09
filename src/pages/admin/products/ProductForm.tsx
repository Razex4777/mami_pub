import React from 'react';
import { Button } from '@/components/ui/interactive/button';
import { Input } from '@/components/ui/forms/input';
import { Label } from '@/components/ui/forms/label';
import { Textarea } from '@/components/ui/forms/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/forms/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/overlays/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/navigation/tabs';
import { Product } from '@/types';

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingProduct: Product | null;
  formData: Partial<Product>;
  setFormData: (data: Partial<Product>) => void;
  onSave: () => void;
  categories: string[];
}

const ProductForm: React.FC<ProductFormProps> = ({
  open,
  onOpenChange,
  editingProduct,
  formData,
  setFormData,
  onSave,
  categories,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-1rem)] sm:w-full max-w-2xl max-h-[85vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">{editingProduct ? 'Modifier Produit' : 'Ajouter Produit'}</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {editingProduct ? 'Modifier les informations' : 'Remplir les détails du produit'}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-9 sm:h-10">
            <TabsTrigger value="basic" className="text-xs sm:text-sm">Général</TabsTrigger>
            <TabsTrigger value="pricing" className="text-xs sm:text-sm">Prix</TabsTrigger>
            <TabsTrigger value="inventory" className="text-xs sm:text-sm">Stock</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-3 sm:space-y-4">
            <div className="grid gap-3 sm:gap-4">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="name" className="text-xs sm:text-sm">Nom du produit *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Entrer le nom du produit"
                  className="h-9 sm:h-10 text-sm"
                />
              </div>
              
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="description" className="text-xs sm:text-sm">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Product description"
                  rows={2}
                  className="text-sm"
                />
              </div>
              
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="category" className="text-xs sm:text-sm">Catégorie *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="h-9 sm:h-10 text-sm">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(c => c !== 'All').map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="sku" className="text-xs sm:text-sm">SKU *</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="Référence produit"
                    className="h-9 sm:h-10 text-sm"
                  />
                </div>
              </div>
              
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="supplier" className="text-xs sm:text-sm">Fournisseur</Label>
                <Input
                  id="supplier"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  placeholder="Nom du fournisseur"
                  className="h-9 sm:h-10 text-sm"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="pricing" className="space-y-3 sm:space-y-4">
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="price" className="text-xs sm:text-sm">Prix de vente *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  className="h-9 sm:h-10 text-sm"
                />
              </div>
              
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="cost" className="text-xs sm:text-sm">Prix d'achat *</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  className="h-9 sm:h-10 text-sm"
                />
              </div>
            </div>
            
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="profit" className="text-xs sm:text-sm">Marge bénéficiaire</Label>
              <div className="p-2 sm:p-3 bg-muted rounded-md">
                <span className="text-lg sm:text-2xl font-bold">
                  {((formData.price || 0) - (formData.cost || 0)).toFixed(0)} DA
                </span>
                <span className="text-xs sm:text-sm text-muted-foreground ml-2">
                  ({(((formData.price || 0) - (formData.cost || 0)) / (formData.cost || 1) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="inventory" className="space-y-3 sm:space-y-4">
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="stock" className="text-xs sm:text-sm">Stock actuel *</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  className="h-9 sm:h-10 text-sm"
                />
              </div>
              
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="minStock" className="text-xs sm:text-sm">Stock min *</Label>
                <Input
                  id="minStock"
                  type="number"
                  value={formData.minStock}
                  onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  className="h-9 sm:h-10 text-sm"
                />
              </div>
            </div>
            
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="status" className="text-xs sm:text-sm">Statut</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData({ ...formData, status: value as 'active' | 'inactive' | 'discontinued' })}
              >
                <SelectTrigger className="h-9 sm:h-10 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
                  <SelectItem value="discontinued">Arrêté</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="tags" className="text-xs sm:text-sm">Tags</Label>
              <Input
                id="tags"
                value={formData.tags?.join(', ')}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean) 
                })}
                placeholder="tag1, tag2, tag3"
                className="h-9 sm:h-10 text-sm"
              />
              <p className="text-[10px] sm:text-xs text-muted-foreground">Séparer les tags par des virgules</p>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end gap-2 sm:gap-3 pt-3 sm:pt-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 sm:h-9 text-xs sm:text-sm"
          >
            Annuler
          </Button>
          <Button onClick={onSave} size="sm" className="h-8 sm:h-9 text-xs sm:text-sm">
            {editingProduct ? 'Modifier' : 'Ajouter'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductForm;
