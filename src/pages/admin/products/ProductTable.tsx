import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/interactive/button';
import { Badge } from '@/components/ui/data-display/badge';
import { Checkbox } from '@/components/ui/forms/checkbox';
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
import { Product } from '@/types';

interface ProductTableProps {
  products: Product[];
  totalProducts: number;
  selectedProducts: Set<string>;
  onSelectProduct: (productId: string) => void;
  onSelectAll: () => void;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

const getStockStatus = (product: Product) => {
  if (product.stock === 0) return { status: 'out', color: 'destructive', icon: XCircle };
  if (product.stock <= product.minStock) return { status: 'low', color: 'secondary', icon: AlertTriangle };
  return { status: 'good', color: 'default', icon: CheckCircle };
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return <Badge className="bg-green-100 text-green-800">Actif</Badge>;
    case 'inactive':
      return <Badge variant="secondary">Inactif</Badge>;
    case 'discontinued':
      return <Badge variant="destructive">Arrêté</Badge>;
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
}) => {
  return (
    <Card>
      <CardHeader className="p-3 sm:p-4 md:p-6">
        <CardTitle className="text-sm sm:text-base md:text-lg">Catalogue produits</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          {products.length} sur {totalProducts} produits
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
            <span className="text-xs text-muted-foreground">Tout sélectionner</span>
          </div>
          {products.map((product) => {
            const stockStatus = getStockStatus(product);
            const StockIcon = stockStatus.icon;
            
            return (
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
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem className="text-red-600" onSelect={(e) => e.preventDefault()}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="w-[calc(100%-2rem)] max-w-md">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-base">Supprimer le produit</AlertDialogTitle>
                            <AlertDialogDescription className="text-sm">
                              Supprimer "{product.name}" ? Cette action est irréversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="h-9">Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDelete(product.id)} className="h-9 bg-red-600 hover:bg-red-700">
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <Badge variant="outline" className="text-[10px]">{product.category}</Badge>
                  {getStatusBadge(product.status)}
                  <div className="flex items-center gap-1">
                    <StockIcon className={`h-3 w-3 ${
                      stockStatus.status === 'out' ? 'text-red-500' :
                      stockStatus.status === 'low' ? 'text-orange-500' : 'text-green-500'
                    }`} />
                    <span>{product.stock}</span>
                  </div>
                </div>
                <div className="text-sm font-semibold text-primary">{product.price.toFixed(0)} DA</div>
              </div>
            );
          })}
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
                <TableHead>Produit</TableHead>
                <TableHead>Réf</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const stockStatus = getStockStatus(product);
                const StockIcon = stockStatus.icon;
                
                return (
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
                      <div className="flex items-center gap-2">
                        <StockIcon className={`h-4 w-4 ${
                          stockStatus.status === 'out' ? 'text-red-500' :
                          stockStatus.status === 'low' ? 'text-orange-500' : 'text-green-500'
                        }`} />
                        <span>{product.stock}</span>
                        {stockStatus.status === 'low' && (
                          <Badge variant="outline" className="text-xs">Faible</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(product.status)}</TableCell>
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
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            Voir détails
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem className="text-red-600" onSelect={(e) => e.preventDefault()}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Supprimer
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Supprimer le produit</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Voulez-vous vraiment supprimer "{product.name}" ? Cette action est irréversible.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onDelete(product.id)} className="bg-red-600 hover:bg-red-700">
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductTable;
