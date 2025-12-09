import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/interactive/button';
import { Badge } from '@/components/ui/data-display/badge';
import { Checkbox } from '@/components/ui/forms/checkbox';
import { Progress } from '@/components/ui/feedback/progress';
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
  CheckCircle,
  Package,
  Truck,
  Clock,
  XCircle,
} from 'lucide-react';
import { Order } from '@/types';

interface OrderTableProps {
  orders: Order[];
  totalOrders: number;
  selectedOrders: Set<string>;
  onSelectOrder: (orderId: string) => void;
  onSelectAll: () => void;
  onView: (order: Order) => void;
  onEdit: (order: Order) => void;
  onDelete: (orderId: string) => void;
  onUpdateStatus: (orderId: string, status: Order['status']) => void;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="h-3 w-3" /> En attente</Badge>;
    case 'confirmed':
      return <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Confirmée</Badge>;
    case 'processing':
      return <Badge className="bg-purple-100 text-purple-800 flex items-center gap-1"><Package className="h-3 w-3" /> En cours</Badge>;
    case 'shipped':
      return <Badge className="bg-indigo-100 text-indigo-800 flex items-center gap-1"><Truck className="h-3 w-3" /> Expédiée</Badge>;
    case 'delivered':
      return <Badge className="bg-green-100 text-green-800 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Livrée</Badge>;
    case 'cancelled':
      return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" /> Annulée</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getPaymentStatusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return <Badge variant="secondary">En attente</Badge>;
    case 'paid':
      return <Badge className="bg-green-100 text-green-800">Payé</Badge>;
    case 'failed':
      return <Badge variant="destructive">Échoué</Badge>;
    case 'refunded':
      return <Badge variant="outline">Remboursé</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getOrderProgress = (status: string): number => {
  const progressMap: { [key: string]: number } = {
    pending: 0,
    confirmed: 20,
    processing: 40,
    shipped: 70,
    delivered: 100,
    cancelled: 0,
  };
  return progressMap[status] || 0;
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-DZ', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount) + ' DA';
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  totalOrders,
  selectedOrders,
  onSelectOrder,
  onSelectAll,
  onView,
  onEdit,
  onDelete,
  onUpdateStatus,
}) => {
  return (
    <Card>
      <CardHeader className="p-3 sm:p-4 md:p-6">
        <CardTitle className="text-sm sm:text-base md:text-lg">Gestion des commandes</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          {orders.length} sur {totalOrders} commandes
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Checkbox
              checked={selectedOrders.size === orders.length && orders.length > 0}
              onCheckedChange={onSelectAll}
            />
            <span className="text-xs text-muted-foreground">Tout sélectionner</span>
          </div>
          {orders.map((order) => (
            <div key={order.id} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 min-w-0">
                  <Checkbox
                    checked={selectedOrders.has(order.id)}
                    onCheckedChange={() => onSelectOrder(order.id)}
                    className="mt-1"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{order.orderNumber}</p>
                    <p className="text-[10px] text-muted-foreground">{order.customer.name}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView(order)} className="text-xs">
                      <Eye className="h-3 w-3 mr-2" /> Voir
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(order)} className="text-xs">
                      <Edit className="h-3 w-3 mr-2" /> Modifier
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onUpdateStatus(order.id, 'shipped')} className="text-xs">
                      <Truck className="h-3 w-3 mr-2" /> Expédier
                    </DropdownMenuItem>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem className="text-red-600 text-xs" onSelect={(e) => e.preventDefault()}>
                          <Trash2 className="h-3 w-3 mr-2" /> Supprimer
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="w-[calc(100%-2rem)] max-w-md">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-base">Supprimer la commande</AlertDialogTitle>
                          <AlertDialogDescription className="text-sm">
                            Supprimer "{order.orderNumber}" ?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="h-9">Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDelete(order.id)} className="h-9 bg-red-600 hover:bg-red-700">
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {getStatusBadge(order.status)}
                {getPaymentStatusBadge(order.paymentStatus)}
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-primary">{formatCurrency(order.total)}</span>
                <span className="text-muted-foreground">{formatDate(order.createdAt)}</span>
              </div>
              <Progress value={getOrderProgress(order.status)} className="h-1" />
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
                    checked={selectedOrders.size === orders.length && orders.length > 0}
                    onCheckedChange={onSelectAll}
                  />
                </TableHead>
                <TableHead>Commande</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Paiement</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedOrders.has(order.id)}
                      onCheckedChange={() => onSelectOrder(order.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{order.orderNumber}</div>
                      {order.trackingNumber && (
                        <div className="text-sm text-muted-foreground font-mono">
                          Suivi: {order.trackingNumber}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{order.customer.name}</div>
                      <div className="text-sm text-muted-foreground">{order.customer.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      {getStatusBadge(order.status)}
                      <Progress value={getOrderProgress(order.status)} className="h-1" />
                    </div>
                  </TableCell>
                  <TableCell>
                    {getPaymentStatusBadge(order.paymentStatus)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(order.total)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(order.createdAt)}
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
                        <DropdownMenuItem onClick={() => onView(order)}>
                          <Eye className="h-4 w-4 mr-2" /> Voir détails
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(order)}>
                          <Edit className="h-4 w-4 mr-2" /> Modifier
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onUpdateStatus(order.id, 'confirmed')}>
                          <CheckCircle className="h-4 w-4 mr-2" /> Confirmer
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onUpdateStatus(order.id, 'processing')}>
                          <Package className="h-4 w-4 mr-2" /> Traiter
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onUpdateStatus(order.id, 'shipped')}>
                          <Truck className="h-4 w-4 mr-2" /> Expédier
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onUpdateStatus(order.id, 'delivered')}>
                          <CheckCircle className="h-4 w-4 mr-2" /> Livrée
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-red-600" onSelect={(e) => e.preventDefault()}>
                              <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer la commande</AlertDialogTitle>
                              <AlertDialogDescription>
                                Voulez-vous vraiment supprimer la commande "{order.orderNumber}" ?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => onDelete(order.id)} className="bg-red-600 hover:bg-red-700">
                                Supprimer
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

export default OrderTable;
