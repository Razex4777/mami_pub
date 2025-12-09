import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/interactive/button';
import { useToast } from '@/components/ui/feedback/use-toast';
import {
  Plus,
  Download,
} from 'lucide-react';
import { Order } from '@/types';
import OrderDetails from './OrderDetails';
import OrderTable from './OrderTable';
import OrderFilters from './OrderFilters';
import OrderEdit from './OrderEdit';
import StatsCard from '../dashboard/StatsCard';
import { useLottieAnimation } from '@/hooks/useLottieAnimation';

// Mock data generator - same as before
const generateMockOrders = (): Order[] => [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    customer: {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '+1-555-0123',
    },
    items: [
      {
        id: '1',
        productId: '1',
        productName: 'DTF Transfer Film',
        quantity: 5,
        price: 49.99,
        total: 249.95,
      },
      {
        id: '2',
        productId: '2',
        productName: 'Heat Press Machine Pro',
        quantity: 1,
        price: 299.99,
        total: 299.99,
      },
    ],
    status: 'processing',
    total: 574.94,
    subtotal: 549.94,
    tax: 27.50,
    shipping: 15.00,
    createdAt: '2024-03-10T14:30:00Z',
    updatedAt: '2024-03-10T16:45:00Z',
    shippingAddress: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
    },
    paymentStatus: 'paid',
    trackingNumber: 'TRK123456789',
    notes: 'Customer requested express shipping',
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    customer: {
      id: '2',
      name: 'Sarah Wilson',
      email: 'sarah.wilson@email.com',
      phone: '+1-555-0456',
    },
    items: [
      {
        id: '3',
        productId: '3',
        productName: 'Vinyl Sheets - White',
        quantity: 10,
        price: 12.99,
        total: 129.90,
      },
    ],
    status: 'shipped',
    total: 144.90,
    subtotal: 129.90,
    tax: 6.50,
    shipping: 8.50,
    createdAt: '2024-03-09T10:15:00Z',
    updatedAt: '2024-03-11T09:20:00Z',
    shippingAddress: {
      street: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      country: 'USA',
    },
    paymentStatus: 'paid',
    trackingNumber: 'TRK987654321',
  },
  {
    id: '3',
    orderNumber: 'ORD-2024-003',
    customer: {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike.johnson@email.com',
      phone: '+1-555-0789',
    },
    items: [
      {
        id: '4',
        productId: '4',
        productName: 'Printer Ink Set - CMYK',
        quantity: 2,
        price: 89.99,
        total: 179.98,
      },
    ],
    status: 'pending',
    total: 234.97,
    subtotal: 214.97,
    tax: 10.75,
    shipping: 9.25,
    createdAt: '2024-03-11T16:20:00Z',
    updatedAt: '2024-03-11T16:20:00Z',
    shippingAddress: {
      street: '789 Pine St',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'USA',
    },
    paymentStatus: 'pending',
  },
];

const orderStatuses = [
  { value: 'all', label: 'Toutes', color: 'default' },
  { value: 'pending', label: 'En attente', color: 'secondary' },
  { value: 'confirmed', label: 'Confirmée', color: 'default' },
  { value: 'processing', label: 'En cours', color: 'default' },
  { value: 'shipped', label: 'Expédiée', color: 'default' },
  { value: 'delivered', label: 'Livrée', color: 'default' },
  { value: 'cancelled', label: 'Annulée', color: 'destructive' },
];

const paymentStatuses = [
  { value: 'all', label: 'Tous', color: 'default' },
  { value: 'pending', label: 'En attente', color: 'secondary' },
  { value: 'paid', label: 'Payé', color: 'default' },
  { value: 'failed', label: 'Échoué', color: 'destructive' },
  { value: 'refunded', label: 'Remboursé', color: 'outline' },
];

const OrdersPage: React.FC = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  // Load Lottie animations from public folder
  const { animationData: shoppingCartAnimation } = useLottieAnimation('/animations/shopping-cart.json');
  const { animationData: packageAnimation } = useLottieAnimation('/animations/package.json');
  const { animationData: deliveryTruckAnimation } = useLottieAnimation('/animations/delivery-truck.json');
  const { animationData: revenueAnimation } = useLottieAnimation('/animations/revenue.json');

  useEffect(() => {
    const timer = setTimeout(() => {
      const mockOrders = generateMockOrders();
      setOrders(mockOrders);
      setFilteredOrders(mockOrders);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let filtered = orders;

    if (searchQuery) {
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.trackingNumber?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(order => order.status === selectedStatus);
    }

    if (selectedPaymentStatus !== 'all') {
      filtered = filtered.filter(order => order.paymentStatus === selectedPaymentStatus);
    }

    setFilteredOrders(filtered);
  }, [orders, searchQuery, selectedStatus, selectedPaymentStatus]);

  const handleSelectOrder = (orderId: string) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedOrders.size === filteredOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(filteredOrders.map(o => o.id)));
    }
  };

  const handleViewOrder = (order: Order) => {
    setViewingOrder(order);
    setIsViewDialogOpen(true);
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setIsEditDialogOpen(true);
  };

  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o));
    toast({
      title: 'Commande mise à jour',
      description: `Statut changé en ${status}.`,
    });
  };

  const handleDeleteOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setOrders(orders.filter(o => o.id !== orderId));
      setSelectedOrders(new Set([...selectedOrders].filter(id => id !== orderId)));
      toast({
        title: 'Commande supprimée',
        description: `Commande ${order.orderNumber} supprimée.`,
      });
    }
  };

  const handleSaveEdit = () => {
    if (editingOrder) {
      setOrders(orders.map(o => o.id === editingOrder.id ? editingOrder : o));
      setIsEditDialogOpen(false);
      setEditingOrder(null);
      toast({
        title: 'Commande mise à jour',
        description: `Commande ${editingOrder.orderNumber} mise à jour.`,
      });
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedOrders.size === 0) {
      toast({
        title: 'Aucune sélection',
        description: 'Veuillez sélectionner des commandes.',
        variant: 'destructive',
      });
      return;
    }

    switch (action) {
      case 'confirm':
        setOrders(orders.map(o => 
          selectedOrders.has(o.id) ? { ...o, status: 'confirmed' as const, updatedAt: new Date().toISOString() } : o
        ));
        toast({ title: 'Commandes confirmées', description: `${selectedOrders.size} commandes confirmées.` });
        break;
      case 'process':
        setOrders(orders.map(o => 
          selectedOrders.has(o.id) ? { ...o, status: 'processing' as const, updatedAt: new Date().toISOString() } : o
        ));
        toast({ title: 'En traitement', description: `${selectedOrders.size} commandes en traitement.` });
        break;
      case 'ship':
        setOrders(orders.map(o => 
          selectedOrders.has(o.id) ? { ...o, status: 'shipped' as const, updatedAt: new Date().toISOString() } : o
        ));
        toast({ title: 'Commandes expédiées', description: `${selectedOrders.size} commandes expédiées.` });
        break;
      case 'archive':
        toast({ title: 'Commandes archivées', description: `${selectedOrders.size} commandes archivées.` });
        break;
      case 'export':
        toast({ title: 'Export terminé', description: `${selectedOrders.size} commandes exportées.` });
        break;
    }
    
    setSelectedOrders(new Set());
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-DZ', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount) + ' DA';
  };

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const processingOrders = orders.filter(o => o.status === 'processing').length;
  const shippedOrders = orders.filter(o => o.status === 'shipped').length;
  const totalRevenue = orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0);

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Commandes</h1>
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2 p-3 sm:p-4">
                <div className="h-3 sm:h-4 bg-muted rounded w-16 sm:w-20" />
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <div className="h-6 sm:h-8 bg-muted rounded w-12 sm:w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Commandes</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Gérer les commandes clients</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleBulkAction('export')} disabled={selectedOrders.size === 0} className="h-8 sm:h-9 text-xs sm:text-sm">
            <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Exporter</span> ({selectedOrders.size})
          </Button>
          <Button size="sm" className="h-8 sm:h-9 text-xs sm:text-sm">
            <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Nouvelle</span> Commande
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Commandes"
          value={totalOrders}
          change={undefined}
          lottieAnimation={shoppingCartAnimation || undefined}
          svgIcon="/icons/orders.svg"
          gradient="from-blue-500 to-cyan-600"
          iconColor="text-white"
        />
        
        <StatsCard
          title="En cours"
          value={processingOrders}
          change={undefined}
          lottieAnimation={packageAnimation || undefined}
          svgIcon="/icons/products.svg"
          gradient="from-purple-500 to-pink-600"
          iconColor="text-white"
        />
        
        <StatsCard
          title="Expédiées"
          value={shippedOrders}
          change={undefined}
          lottieAnimation={deliveryTruckAnimation || undefined}
          svgIcon="/icons/truck.svg"
          gradient="from-indigo-500 to-blue-600"
          iconColor="text-white"
        />
        
        <StatsCard
          title="Chiffre d'affaires"
          value={formatCurrency(totalRevenue)}
          change={undefined}
          lottieAnimation={revenueAnimation || undefined}
          svgIcon="/icons/revenue.svg"
          gradient="from-green-500 to-emerald-600"
          iconColor="text-white"
        />
      </div>

      <OrderFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedPaymentStatus={selectedPaymentStatus}
        onPaymentStatusChange={setSelectedPaymentStatus}
        orderStatuses={orderStatuses}
        paymentStatuses={paymentStatuses}
        selectedCount={selectedOrders.size}
        onBulkAction={handleBulkAction}
      />

      <OrderTable
        orders={filteredOrders}
        totalOrders={totalOrders}
        selectedOrders={selectedOrders}
        onSelectOrder={handleSelectOrder}
        onSelectAll={handleSelectAll}
        onView={handleViewOrder}
        onEdit={handleEditOrder}
        onDelete={handleDeleteOrder}
        onUpdateStatus={handleUpdateOrderStatus}
      />

      <OrderDetails
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        order={viewingOrder}
      />

      <OrderEdit
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        order={editingOrder}
        onUpdate={setEditingOrder}
        onSave={handleSaveEdit}
        orderStatuses={orderStatuses}
        paymentStatuses={paymentStatuses}
      />
    </div>
  );
};

export default OrdersPage;
