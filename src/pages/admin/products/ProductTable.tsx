import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/interactive/button';
import { Badge } from '@/components/ui/data-display/badge';
import { Checkbox } from '@/components/ui/forms/checkbox';
import { Switch } from '@/components/ui/forms/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/data-display/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/overlays/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/overlays/dropdown-menu';
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { AdminProduct } from '@/supabase';

interface ProductTableProps {
  products: AdminProduct[];
  totalProducts: number;
  selectedProducts: Set<string>;
  onSelectProduct: (productId: string) => void;
  onSelectAll: () => void;
  onEdit: (product: AdminProduct) => void;
  onDelete: (productId: string) => void;
  onToggleStatus: (product: AdminProduct) => void;
  translations?: {
    catalogTitle: string;
    of: string;
    products: string;
    selectAll: string;
    edit: string;
    delete: string;
    deleteTitle: string;
    deleteConfirm: string;
    cancel: string;
    active: string;
    inactive: string;
    discontinued: string;
    product: string;
    ref: string;
    category: string;
    price: string;
    views: string;
    viewProduct: string;
    status: string;
    actions: string;
  };
}

const defaultTranslations = {
  catalogTitle: 'Catalogue produits',
  of: 'sur',
  products: 'produits',
  selectAll: 'Tout sélectionner',
  edit: 'Modifier',
  delete: 'Supprimer',
  deleteTitle: 'Supprimer le produit',
  deleteConfirm: 'Cette action est irréversible.',
  cancel: 'Annuler',
  active: 'Actif',
  inactive: 'Inactif',
  discontinued: 'Arrêté',
  product: 'Produit',
  ref: 'Réf',
  category: 'Catégorie',
  price: 'Prix',
  views: 'Vues',
  viewProduct: 'Voir',
  status: 'Statut',
  actions: 'Actions',
};

const getStatusBadge = (status: string, translations: typeof defaultTranslations) => {
  switch (status) {
    case 'active':
      return <Badge className="bg-green-100 text-green-800">{translations.active}</Badge>;
    case 'inactive':
      return <Badge variant="secondary">{translations.inactive}</Badge>;
    case 'discontinued':
      return <Badge variant="destructive">{translations.discontinued}</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  totalProducts,
  selectedProducts,
  onSelectProduct,
  onSelectAll,
  onEdit,
  onDelete,
  onToggleStatus,
  translations: propTranslations,
}) => {
  const navigate = useNavigate();
  const t = { ...defaultTranslations, ...propTranslations };
  
  return (
    <Card>
      <CardHeader className="p-3 sm:p-4 md:p-6">
        <CardTitle className="text-sm sm:text-base md:text-lg">{t.catalogTitle}</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          {products.length} {t.of} {totalProducts} {t.products}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Checkbox
              checked={selectedProducts.size === products.length && products.length > 0}
              onCheckedChange={onSelectAll}
            />
            <span className="text-xs text-muted-foreground">{t.selectAll}</span>
          </div>
          {products.map((product) => (
              <div key={product.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0">
                    <Checkbox
                      checked={selectedProducts.has(product.id)}
                      onCheckedChange={() => onSelectProduct(product.id)}
                      className="mt-1"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{product.sku}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(product)}>
                        <Edit className="h-4 w-4 mr-2" />
                        {t.edit}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem className="text-red-600" onSelect={(e) => e.preventDefault()}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t.delete}
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="w-[calc(100%-2rem)] max-w-md">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-base">{t.deleteTitle}</AlertDialogTitle>
                            <AlertDialogDescription className="text-sm">
                              {t.delete} "{product.name}" ? {t.deleteConfirm}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="h-9">{t.cancel}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDelete(product.id)} className="h-9 bg-red-600 hover:bg-red-700">
                              {t.delete}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">{product.category}</Badge>
                    <span className="text-sm font-semibold text-primary">{product.price.toFixed(0)} DA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={product.status === 'active'}
                      onCheckedChange={() => onToggleStatus(product)}
                      className="scale-75"
                    />
                    <span className="text-[10px] text-muted-foreground">
                      {product.status === 'active' ? t.active : t.inactive}
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedProducts.size === products.length && products.length > 0}
                    onCheckedChange={onSelectAll}
                  />
                </TableHead>
                <TableHead>{t.product}</TableHead>
                <TableHead>{t.ref}</TableHead>
                <TableHead>{t.category}</TableHead>
                <TableHead>{t.price}</TableHead>
                <TableHead>{t.views}</TableHead>
                <TableHead>{t.status}</TableHead>
                <TableHead className="w-24">{t.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedProducts.has(product.id)}
                        onCheckedChange={() => onSelectProduct(product.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {product.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.price.toFixed(0)} DA</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Eye className="h-3.5 w-3.5" />
                        <span className="text-sm">{product.viewer_count || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={product.status === 'active'}
                          onCheckedChange={() => onToggleStatus(product)}
                          className="scale-90"
                        />
                        <span className="text-xs text-muted-foreground">
                          {product.status === 'active' ? t.active : t.inactive}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(product)}>
                            <Edit className="h-4 w-4 mr-2" />
                            {t.edit}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/product/${product.id}`)}>
                            <Eye className="h-4 w-4 mr-2" />
                            {t.viewProduct}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem className="text-red-600" onSelect={(e) => e.preventDefault()}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                {t.delete}
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t.deleteTitle}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t.delete} "{product.name}" ? {t.deleteConfirm}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onDelete(product.id)} className="bg-red-600 hover:bg-red-700">
                                  {t.delete}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductTable;
