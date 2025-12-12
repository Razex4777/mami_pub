import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Badge } from '@/components/ui/data-display/badge';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/overlays/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/navigation/tabs';
import {
  User,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  Clock,
  Package,
  Truck,
  XCircle,
} from 'lucide-react';
import { Order } from '@/supabase';

interface OrderDetailsTranslations {
  title: string;
  description: string;
  tabs: {
    details: string;
    items: string;
    customer: string;
    tracking: string;
  };
  info: {
    title: string;
    orderNumber: string;
    status: string;
    created: string;
    modified: string;
    tracking: string;
  };
  summary: {
    title: string;
    subtotal: string;
    tax: string;
    shipping: string;
    total: string;
  };
  notes: string;
  itemsOrdered: string;
  product: string;
  quantity: string;
  price: string;
  customerInfo: {
    title: string;
    customerId: string;
    email: string;
    phone: string;
    shippingAddress: string;
  };
  progress: {
    title: string;
    currentStatus: string;
  };
  statusPending: string;
  statusConfirmed: string;
  statusProcessing: string;
  statusShipped: string;
  statusDelivered: string;
  statusCancelled: string;
}

interface OrderDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  translations?: OrderDetailsTranslations;
}

const defaultTranslations: OrderDetailsTranslations = {
  title: 'Commande',
  description: 'Détails et informations de livraison',
  tabs: { details: 'Détails', items: 'Articles', customer: 'Client', tracking: 'Suivi' },
  info: { title: 'Informations', orderNumber: 'N° Commande:', status: 'Statut:', created: 'Créée:', modified: 'Modifiée:', tracking: 'Suivi:' },
  summary: { title: 'Récapitulatif', subtotal: 'Sous-total:', tax: 'TVA:', shipping: 'Livraison:', total: 'Total:' },
  notes: 'Notes',
  itemsOrdered: 'Articles commandés',
  product: 'Produit',
  quantity: 'Quantité',
  price: 'Prix',
  customerInfo: { title: 'Informations client', customerId: 'ID Client:', email: 'Adresse email', phone: 'Téléphone', shippingAddress: 'Adresse de livraison' },
  progress: { title: 'Progression', currentStatus: 'Statut actuel' },
  statusPending: 'En attente',
  statusConfirmed: 'Confirmée',
  statusProcessing: 'En cours',
  statusShipped: 'Expédiée',
  statusDelivered: 'Livrée',
  statusCancelled: 'Annulée',
};

const createGetStatusBadge = (t: OrderDetailsTranslations) => (status: string) => {
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

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-5 w-5 text-gray-500" />;
    case 'confirmed':
      return <CheckCircle className="h-5 w-5 text-blue-500" />;
    case 'processing':
      return <Package className="h-5 w-5 text-purple-500" />;
    case 'shipped':
      return <Truck className="h-5 w-5 text-indigo-500" />;
    case 'delivered':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'cancelled':
      return <XCircle className="h-5 w-5 text-red-500" />;
    default:
      return <Clock className="h-5 w-5 text-gray-500" />;
  }
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
    hour: '2-digit',
    minute: '2-digit',
  });
};

const OrderDetails: React.FC<OrderDetailsProps> = ({ open, onOpenChange, order, translations }) => {
  const t: OrderDetailsTranslations = {
    ...defaultTranslations,
    ...translations,
    tabs: { ...defaultTranslations.tabs, ...translations?.tabs },
    info: { ...defaultTranslations.info, ...translations?.info },
    summary: { ...defaultTranslations.summary, ...translations?.summary },
    customerInfo: { ...defaultTranslations.customerInfo, ...translations?.customerInfo },
    progress: { ...defaultTranslations.progress, ...translations?.progress },
  };
  const getStatusBadge = createGetStatusBadge(t);
  
  if (!order) return null;

  const orderStatuses = [
    { value: 'pending', label: t.statusPending },
    { value: 'confirmed', label: t.statusConfirmed },
    { value: 'processing', label: t.statusProcessing },
    { value: 'shipped', label: t.statusShipped },
    { value: 'delivered', label: t.statusDelivered },
    { value: 'cancelled', label: t.statusCancelled },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t.title} {order.orderNumber}</DialogTitle>
          <DialogDescription>
            {t.description}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">{t.tabs.details}</TabsTrigger>
            <TabsTrigger value="items">{t.tabs.items}</TabsTrigger>
            <TabsTrigger value="customer">{t.tabs.customer}</TabsTrigger>
            <TabsTrigger value="tracking">{t.tabs.tracking}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t.info.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.info.orderNumber}</span>
                    <span className="font-medium">{order.orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.info.status}</span>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.info.created}</span>
                    <span>{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.info.modified}</span>
                    <span>{formatDate(order.updatedAt)}</span>
                  </div>
                  {order.trackingNumber && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t.info.tracking}</span>
                      <span className="font-mono">{order.trackingNumber}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t.summary.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.summary.subtotal}</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.summary.tax}</span>
                    <span>{formatCurrency(order.tax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.summary.shipping}</span>
                    <span>{formatCurrency(order.shipping)}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-medium">
                      <span>{t.summary.total}</span>
                      <span className="text-lg">{formatCurrency(order.total)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {order.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t.notes}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{order.notes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="items" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t.itemsOrdered}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.product}</TableHead>
                      <TableHead>{t.quantity}</TableHead>
                      <TableHead>{t.price}</TableHead>
                      <TableHead>{t.summary.total}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.productName}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatCurrency(item.price)}</TableCell>
                        <TableCell>{formatCurrency(item.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="customer" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t.customerInfo.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{order.customer.name}</p>
                    <p className="text-sm text-muted-foreground">{t.customerInfo.customerId} {order.customer.id}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{order.customer.email}</p>
                    <p className="text-sm text-muted-foreground">{t.customerInfo.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{order.customer.phone}</p>
                    <p className="text-sm text-muted-foreground">{t.customerInfo.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="font-medium">{t.customerInfo.shippingAddress}</p>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>{order.shippingAddress.street}</p>
                      <p>
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                      </p>
                      <p>{order.shippingAddress.country}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="tracking" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t.progress.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Progress value={getOrderProgress(order.status)} className="h-2" />
                  
                  <div className="space-y-3">
                    {orderStatuses.map((status) => {
                      const isCompleted = getOrderProgress(order.status) > getOrderProgress(status.value);
                      const isCurrent = order.status === status.value;
                      
                      return (
                        <div key={status.value} className={`flex items-center gap-3 p-3 rounded-lg ${
                          isCompleted ? 'bg-green-50 dark:bg-green-950' :
                          isCurrent ? 'bg-blue-50 dark:bg-blue-950' : 'bg-muted'
                        }`}>
                          {getStatusIcon(status.value)}
                          <div className="flex-1">
                            <p className={`font-medium ${isCompleted ? 'text-green-700 dark:text-green-300' : 
                              isCurrent ? 'text-blue-700 dark:text-blue-300' : 'text-muted-foreground'}`}>
                              {status.label}
                            </p>
                            {isCurrent && (
                              <p className="text-sm text-blue-600 dark:text-blue-400">{t.progress.currentStatus}</p>
                            )}
                          </div>
                          {isCompleted && (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetails;
