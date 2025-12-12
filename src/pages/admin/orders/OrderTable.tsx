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
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  Package,
  Truck,
  Clock,
  XCircle,
} from 'lucide-react';
import { OrderStatus } from '@/supabase';
import { useNotifications } from '@/contexts/NotificationContext';

// UI Order type for display
interface UIOrder {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  items: any[];
  status: OrderStatus;
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  createdAt: string;
  updatedAt: string;
  shippingAddress: any;
  paymentStatus: string;
  trackingNumber?: string;
  notes?: string;
  discount?: number;
  couponCode?: string;
}

type ViewMode = 'list' | 'grid';

interface OrderTableTranslations {
  title: string;
  selectAll: string;
  order: string;
  customer: string;
  phone: string;
  statusHeader: string;
  total: string;
  date: string;
  actions: string;
  tracking: string;
  items: string;
  itemsPlural: string;
  viewDetails: string;
  edit: string;
  delete: string;
  deleteDialogTitle: string;
  deleteDialogDesc: string;
  cancel: string;
  statusPending: string;
  statusConfirmed: string;
  statusProcessing: string;
  statusShipped: string;
  statusDelivered: string;
  statusCancelled: string;
}

interface OrderTableProps {
  orders: UIOrder[];
  totalOrders: number;
  selectedOrders: Set<string>;
  onSelectOrder: (orderId: string) => void;
  onSelectAll: () => void;
  onView: (order: UIOrder) => void;
  onEdit: (order: UIOrder) => void;
  onDelete: (orderId: string) => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  viewMode: ViewMode;
  translations?: OrderTableTranslations;
}

const defaultTranslations: OrderTableTranslations = {
  title: 'Gestion des commandes',
  selectAll: 'Tout sélectionner',
  order: 'Commande',
  customer: 'Client',
  phone: 'Téléphone',
  statusHeader: 'Statut',
  total: 'Total',
  date: 'Date',
  actions: 'Actions',
  tracking: 'Suivi',
  items: 'article',
  itemsPlural: 'articles',
  viewDetails: 'Voir détails',
  edit: 'Modifier',
  delete: 'Supprimer',
  deleteDialogTitle: 'Supprimer la commande',
  deleteDialogDesc: 'Supprimer',
  cancel: 'Annuler',
  statusPending: 'En attente',
  statusConfirmed: 'Confirmée',
  statusProcessing: 'En cours',
  statusShipped: 'Expédiée',
  statusDelivered: 'Livrée',
  statusCancelled: 'Annulée',
};

const createGetStatusBadge = (t: OrderTableTranslations) => (status: string) => {
  switch (status) {
    case 'pending':
      return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="h-3 w-3" /> {t.statusPending}</Badge>;
    case 'confirmed':
      return <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> {t.statusConfirmed}</Badge>;
    case 'processing':
      return <Badge className="bg-purple-100 text-purple-800 flex items-center gap-1"><Package className="h-3 w-3" /> {t.statusProcessing}</Badge>;
    case 'shipped':
      return <Badge className="bg-indigo-100 text-indigo-800 flex items-center gap-1"><Truck className="h-3 w-3" /> {t.statusShipped}</Badge>;
    case 'delivered':
      return <Badge className="bg-green-100 text-green-800 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> {t.statusDelivered}</Badge>;
    case 'cancelled':
      return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" /> {t.statusCancelled}</Badge>;
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
  return new Date(dateString).toLocaleDateString('fr-FR', {
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
  viewMode,
  translations = defaultTranslations,
}) => {
  const t = { ...defaultTranslations, ...translations };
  const getStatusBadge = createGetStatusBadge(t);
  const { markAsRead } = useNotifications();
  
  // Handle view with notification mark as read
  const handleView = (order: UIOrder) => {
    markAsRead(order.id);
    onView(order);
  };
  
  return (
    <Card>
      <CardHeader className="p-3 sm:p-4 md:p-6">
        <CardTitle className="text-sm sm:text-base md:text-lg">{t.title}</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          {orders.length} / {totalOrders}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
        {/* Mobile Card View - Always cards on mobile */}
        <div className="md:hidden space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Checkbox
              checked={selectedOrders.size === orders.length && orders.length > 0}
              onCheckedChange={onSelectAll}
            />
            <span className="text-xs text-muted-foreground">{t.selectAll}</span>
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
                <div className="flex items-center gap-0.5">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleView(order)}
                    className="h-7 w-7 p-0"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onEdit(order)}
                    className="h-7 w-7 p-0"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 w-7 p-0 text-red-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="w-[calc(100%-2rem)] max-w-md">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-base">{t.deleteDialogTitle}</AlertDialogTitle>
                        <AlertDialogDescription className="text-sm">
                          {t.deleteDialogDesc} "{order.orderNumber}" ?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                        <AlertDialogCancel className="h-9">{t.cancel}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(order.id)} className="h-9 bg-red-600 hover:bg-red-700">
                          {t.delete}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {getStatusBadge(order.status)}
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-primary">{formatCurrency(order.total)}</span>
                <span className="text-muted-foreground">{formatDate(order.createdAt)}</span>
              </div>
              <Progress value={getOrderProgress(order.status)} className="h-1" />
            </div>
          ))}
        </div>

        {/* Desktop Grid View */}
        {viewMode === 'grid' && (
          <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {orders.map((order) => (
              <div key={order.id} className="border rounded-xl p-4 space-y-3 hover:shadow-md transition-shadow bg-card">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 min-w-0">
                    <Checkbox
                      checked={selectedOrders.has(order.id)}
                      onCheckedChange={() => onSelectOrder(order.id)}
                      className="mt-1"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm">{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground truncate">{order.customer.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{order.customer.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleView(order)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onEdit(order)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t.deleteDialogTitle}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t.deleteDialogDesc} "{order.orderNumber}" ?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDelete(order.id)} className="bg-red-600 hover:bg-red-700">
                            {t.delete}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {getStatusBadge(order.status)}
                  <span className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{t.total}</span>
                    <span className="font-semibold text-primary">{formatCurrency(order.total)}</span>
                  </div>
                  <Progress value={getOrderProgress(order.status)} className="h-1.5" />
                </div>
                {order.items.length > 0 && (
                  <div className="text-xs text-muted-foreground border-t pt-2">
                    {order.items.length} {order.items.length > 1 ? t.itemsPlural : t.items}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Desktop Table View */}
        <div className={viewMode === 'list' ? 'hidden md:block overflow-x-auto' : 'hidden'}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedOrders.size === orders.length && orders.length > 0}
                    onCheckedChange={onSelectAll}
                  />
                </TableHead>
                <TableHead>{t.order}</TableHead>
                <TableHead>{t.customer}</TableHead>
                <TableHead>{t.phone}</TableHead>
                <TableHead>{t.statusHeader}</TableHead>
                <TableHead>{t.total}</TableHead>
                <TableHead>{t.date}</TableHead>
                <TableHead className="w-28">{t.actions}</TableHead>
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
                          {t.tracking}: {order.trackingNumber}
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
                    <div className="text-sm font-mono">{order.customer.phone}</div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      {getStatusBadge(order.status)}
                      <Progress value={getOrderProgress(order.status)} className="h-1" />
                    </div>
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
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleView(order)}
                        className="h-8 w-8 p-0"
                        title={t.viewDetails}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onEdit(order)}
                        className="h-8 w-8 p-0"
                        title={t.edit}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                            title={t.delete}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="w-[calc(100%-2rem)] sm:w-full max-w-md">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-base sm:text-lg">{t.deleteDialogTitle}</AlertDialogTitle>
                            <AlertDialogDescription className="text-sm">
                              {t.deleteDialogDesc} "{order.orderNumber}" ?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                            <AlertDialogCancel className="h-9 sm:h-10">{t.cancel}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDelete(order.id)} className="h-9 sm:h-10 bg-red-600 hover:bg-red-700">
                              {t.delete}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
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
