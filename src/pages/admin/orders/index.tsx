import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/interactive/button';
import { useToast } from '@/components/ui/feedback/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Plus,
  Download,
  RefreshCw,
  FileSpreadsheet,
} from 'lucide-react';
import { 
  getAllOrders, 
  updateOrderStatus, 
  deleteOrder as deleteOrderApi,
  SupabaseOrder,
  OrderStatus,
  logActivity,
} from '@/supabase';
import OrderDetails from './OrderDetails';
import OrderTable from './OrderTable';
import OrderFilters from './OrderFilters';
import OrderEdit from './OrderEdit';
import StatsCard from '../dashboard/StatsCard';
import {
  exportOrdersToGoogleSheets,
  type OrderForExport,
} from '@/lib/googleSheets';
import { useLottieAnimation } from '@/hooks/useLottieAnimation';

// Convert Supabase order to UI Order format
const convertToUIOrder = (order: SupabaseOrder): any => ({
  id: order.id,
  orderNumber: order.order_number,
  customer: {
    id: (order.customer as any)?.id || order.id, // Use actual customer ID, fallback to order ID
    name: `${order.customer.first_name} ${order.customer.last_name}`,
    email: order.customer.email || '',
    phone: order.customer.phone,
  },
  items: order.items.map(item => ({
    id: item.id,
    productId: item.product_id,
    productName: item.product_name,
    quantity: item.quantity,
    price: item.price,
    total: item.total,
  })),
  status: order.status,
  total: order.total,
  subtotal: order.subtotal,
  tax: 0,
  shipping: order.shipping,
  createdAt: order.created_at,
  updatedAt: order.updated_at,
  shippingAddress: {
    street: order.shipping_address.address,
    city: order.shipping_address.commune,
    state: order.shipping_address.wilaya,
    zipCode: '',
    country: 'Algérie',
  },
  paymentStatus: order.payment_status,
  trackingNumber: undefined,
  notes: order.notes,
  discount: order.discount,
  couponCode: order.coupon_code,
});

// French translations (default)
const fr = {
  title: 'Commandes',
  subtitle: 'Gérer les commandes clients',
  refresh: 'Actualiser',
  export: 'Exporter',
  stats: {
    totalOrders: 'Total Commandes',
    processing: 'En cours',
    shipped: 'Expédiées',
    revenue: "Chiffre d'affaires"
  },
  status: {
    all: 'Toutes',
    pending: 'En attente',
    confirmed: 'Confirmée',
    processing: 'En cours',
    shipped: 'Expédiée',
    delivered: 'Livrée',
    cancelled: 'Annulée'
  },
  toast: {
    error: 'Erreur',
    loadError: 'Impossible de charger les commandes.',
    orderUpdated: 'Commande mise à jour',
    statusChanged: 'Statut changé en',
    statusUpdateError: 'Impossible de mettre à jour le statut.',
    orderDeleted: 'Commande supprimée',
    deleteError: 'Impossible de supprimer la commande.',
    noSelection: 'Aucune sélection',
    selectOrders: 'Veuillez sélectionner des commandes.',
    ordersConfirmed: 'Commandes confirmées',
    inProcessing: 'En traitement',
    ordersShipped: 'Commandes expédiées',
    ordersArchived: 'Commandes archivées',
    exportComplete: 'Export terminé',
    ordersDeleted: 'Commandes supprimées',
    partialOperation: 'Opération partielle',
    partialDelete: 'Suppression partielle',
    bulkError: "Une erreur est survenue lors de l'opération.",
    googleSheetsExport: 'Export Google Sheets',
    exportError: 'Erreur lors de l\'export'
  }
};

const OrdersPage: React.FC = () => {
  const { toast } = useToast();
  const { t, language } = useLanguage();
  
  // Translation helper
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
    const translated = t(key, 'admin_orders');
    return translated === key ? getFrenchText(key) : translated;
  };
  
  // Get status label based on language
  const getStatusLabel = (status: string): string => {
    return getText(`status.${status}`);
  };
  
  // Dynamic order statuses based on language
  const orderStatuses = [
    { value: 'all', label: getStatusLabel('all'), color: 'default' },
    { value: 'pending', label: getStatusLabel('pending'), color: 'secondary' },
    { value: 'confirmed', label: getStatusLabel('confirmed'), color: 'default' },
    { value: 'processing', label: getStatusLabel('processing'), color: 'default' },
    { value: 'shipped', label: getStatusLabel('shipped'), color: 'default' },
    { value: 'delivered', label: getStatusLabel('delivered'), color: 'default' },
    { value: 'cancelled', label: getStatusLabel('cancelled'), color: 'destructive' },
  ];
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
    const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<any | null>(null);
  const [editingOrder, setEditingOrder] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [exporting, setExporting] = useState(false);

  // Load Lottie animations from public folder
  const { animationData: shoppingCartAnimation } = useLottieAnimation('/animations/shopping-cart.json');
  const { animationData: packageAnimation } = useLottieAnimation('/animations/package.json');
  const { animationData: deliveryTruckAnimation } = useLottieAnimation('/animations/delivery-truck.json');
  const { animationData: revenueAnimation } = useLottieAnimation('/animations/revenue.json');

  // Fetch orders from Supabase
  const fetchOrders = useCallback(async () => {
    try {
      const supabaseOrders = await getAllOrders();
      const uiOrders = supabaseOrders.map(convertToUIOrder);
      setOrders(uiOrders);
      setFilteredOrders(uiOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: getText('toast.error'),
        description: getText('toast.loadError'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Handle viewOrder URL parameter to auto-open order details
  useEffect(() => {
    const viewOrderId = searchParams.get('viewOrder');
    if (viewOrderId && orders.length > 0) {
      const orderToView = orders.find((order: any) => order.id === viewOrderId);
      if (orderToView) {
        setViewingOrder(orderToView);
        setIsViewDialogOpen(true);
        // Clear the URL parameter after opening
        searchParams.delete('viewOrder');
        setSearchParams(searchParams, { replace: true });
      }
    }
  }, [orders, searchParams, setSearchParams]);

  // Refresh orders
  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  useEffect(() => {
    let filtered = orders;

    if (searchQuery) {
      filtered = filtered.filter((order: any) =>
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.trackingNumber?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter((order: any) => order.status === selectedStatus);
    }

    setFilteredOrders(filtered);
  }, [orders, searchQuery, selectedStatus]);

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
      setSelectedOrders(new Set(filteredOrders.map((o: any) => o.id)));
    }
  };

  const handleViewOrder = (order: any) => {
    setViewingOrder(order);
    setIsViewDialogOpen(true);
  };

  const handleEditOrder = (order: any) => {
    setEditingOrder(order);
    setIsEditDialogOpen(true);
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, status);
      await logActivity({
        type: 'order',
        action: 'status_update',
        entity_id: orderId,
        entity_name: `Order ${orderId}`,
        details: { status },
        performed_by: null,
        performed_by_name: 'Admin'
      });
      setOrders(orders.map((o: any) => o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o));
      
      toast({
        title: getText('toast.orderUpdated'),
        description: `${getText('toast.statusChanged')} "${getStatusLabel(status)}".`,
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: getText('toast.error'),
        description: getText('toast.statusUpdateError'),
        variant: 'destructive',
      });
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    const order = orders.find((o: any) => o.id === orderId);
    if (order) {
      try {
        await deleteOrderApi(orderId);
        await logActivity({
          type: 'order',
          action: 'delete',
          entity_id: orderId,
          entity_name: order.orderNumber,
          details: null,
          performed_by: null,
          performed_by_name: 'Admin'
        });
        setOrders(orders.filter((o: any) => o.id !== orderId));
        setSelectedOrders(new Set([...selectedOrders].filter(id => id !== orderId)));
        toast({
          title: getText('toast.orderDeleted'),
          description: `${order.orderNumber}`,
        });
      } catch (error) {
        console.error('Error deleting order:', error);
        toast({
          title: getText('toast.error'),
          description: getText('toast.deleteError'),
          variant: 'destructive',
        });
      }
    }
  };

  const handleSaveEdit = () => {
    if (editingOrder) {
      setOrders(orders.map(o => o.id === editingOrder.id ? editingOrder : o));
      setIsEditDialogOpen(false);
      setEditingOrder(null);
      // Log activity for manual edit
      logActivity({
        type: 'order',
        action: 'update',
        entity_id: editingOrder.id,
        entity_name: editingOrder.orderNumber,
        details: { changes: editingOrder },
        performed_by: null,
        performed_by_name: 'Admin'
      });
      toast({
        title: getText('toast.orderUpdated'),
        description: `${editingOrder.orderNumber}`,
      });
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedOrders.size === 0) {
      toast({
        title: getText('toast.noSelection'),
        description: getText('toast.selectOrders'),
        variant: 'destructive',
      });
      return;
    }

    const selectedIds = Array.from(selectedOrders);
    
    try {
      switch (action) {
        case 'confirm': {
          const results = await Promise.allSettled(selectedIds.map(id => updateOrderStatus(id, 'confirmed')));
          const succeededIds = selectedIds.filter((_, i) => results[i].status === 'fulfilled');
          const failedCount = results.filter(r => r.status === 'rejected').length;
          
          if (succeededIds.length > 0) {
            await logActivity({
              type: 'order',
              action: 'bulk_confirm',
              entity_id: null,
              entity_name: `${succeededIds.length} orders`,
              details: { ids: succeededIds },
              performed_by: null,
              performed_by_name: 'Admin'
            });
            setOrders(orders.map((o: any) => 
              succeededIds.includes(o.id) ? { ...o, status: 'confirmed', updatedAt: new Date().toISOString() } : o
            ));
          }
          
          if (failedCount > 0) {
            toast({ 
              title: getText('toast.partialOperation'), 
              description: `${succeededIds.length} / ${failedCount}`,
              variant: failedCount === selectedIds.length ? 'destructive' : 'default'
            });
          } else {
            toast({ title: getText('toast.ordersConfirmed'), description: `${succeededIds.length}` });
          }
          break;
        }
        case 'process': {
          const results = await Promise.allSettled(selectedIds.map(id => updateOrderStatus(id, 'processing')));
          const succeededIds = selectedIds.filter((_, i) => results[i].status === 'fulfilled');
          const failedCount = results.filter(r => r.status === 'rejected').length;
          
          if (succeededIds.length > 0) {
            await logActivity({
              type: 'order',
              action: 'bulk_process',
              entity_id: null,
              entity_name: `${succeededIds.length} orders`,
              details: { ids: succeededIds },
              performed_by: null,
              performed_by_name: 'Admin'
            });
            setOrders(orders.map((o: any) => 
              succeededIds.includes(o.id) ? { ...o, status: 'processing', updatedAt: new Date().toISOString() } : o
            ));
          }
          
          if (failedCount > 0) {
            toast({ 
              title: getText('toast.partialOperation'), 
              description: `${succeededIds.length} / ${failedCount}`,
              variant: failedCount === selectedIds.length ? 'destructive' : 'default'
            });
          } else {
            toast({ title: getText('toast.inProcessing'), description: `${succeededIds.length}` });
          }
          break;
        }
        case 'ship': {
          const results = await Promise.allSettled(selectedIds.map(id => updateOrderStatus(id, 'shipped')));
          const succeededIds = selectedIds.filter((_, i) => results[i].status === 'fulfilled');
          const failedCount = results.filter(r => r.status === 'rejected').length;
          
          if (succeededIds.length > 0) {
            await logActivity({
              type: 'order',
              action: 'bulk_ship',
              entity_id: null,
              entity_name: `${succeededIds.length} orders`,
              details: { ids: succeededIds },
              performed_by: null,
              performed_by_name: 'Admin'
            });
            setOrders(orders.map((o: any) => 
              succeededIds.includes(o.id) ? { ...o, status: 'shipped', updatedAt: new Date().toISOString() } : o
            ));
          }
          
          if (failedCount > 0) {
            toast({ 
              title: getText('toast.partialOperation'), 
              description: `${succeededIds.length} / ${failedCount}`,
              variant: failedCount === selectedIds.length ? 'destructive' : 'default'
            });
          } else {
            toast({ title: getText('toast.ordersShipped'), description: `${succeededIds.length}` });
          }
          break;
        }
        case 'archive':
          toast({ title: getText('toast.ordersArchived'), description: `${selectedOrders.size}` });
          break;
        case 'export':
          toast({ title: getText('toast.exportComplete'), description: `${selectedOrders.size}` });
          break;
        case 'delete': {
          const results = await Promise.allSettled(selectedIds.map(id => deleteOrderApi(id)));
          const succeededIds = selectedIds.filter((_, i) => results[i].status === 'fulfilled');
          const failedCount = results.filter(r => r.status === 'rejected').length;
          
          if (succeededIds.length > 0) {
            await logActivity({
              type: 'order',
              action: 'bulk_delete',
              entity_id: null,
              entity_name: `${succeededIds.length} orders`,
              details: { ids: succeededIds },
              performed_by: null,
              performed_by_name: 'Admin'
            });
            setOrders(orders.filter((o: any) => !succeededIds.includes(o.id)));
          }
          
          if (failedCount > 0) {
            toast({ 
              title: getText('toast.partialDelete'), 
              description: `${succeededIds.length} / ${failedCount}`,
              variant: failedCount === selectedIds.length ? 'destructive' : 'default'
            });
          } else {
            toast({ title: getText('toast.ordersDeleted'), description: `${succeededIds.length}` });
          }
          break;
        }
      }
    } catch (error) {
      console.error('Error in bulk action:', error);
      toast({
        title: getText('toast.error'),
        description: getText('toast.bulkError'),
        variant: 'destructive',
      });
    }
    
    setSelectedOrders(new Set());
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-DZ', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount) + ' DA';
  };

  // Convert UI orders to export format
  const getOrdersForExport = useCallback((): OrderForExport[] => {
    const ordersToExport = selectedOrders.size > 0 
      ? orders.filter(o => selectedOrders.has(o.id))
      : filteredOrders;
    
    return ordersToExport.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customer: {
        name: order.customer.name,
        email: order.customer.email || '',
        phone: order.customer.phone,
      },
      items: order.items.map((item: any) => ({
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
      })),
      status: order.status,
      total: order.total,
      subtotal: order.subtotal,
      shipping: order.shipping,
      discount: order.discount,
      couponCode: order.couponCode,
      createdAt: order.createdAt,
      shippingAddress: {
        street: order.shippingAddress?.street || '',
        city: order.shippingAddress?.city || '',
        state: order.shippingAddress?.state || '',
      },
      notes: order.notes,
    }));
  }, [orders, filteredOrders, selectedOrders]);

  // Export to Google Sheets - send data directly and open sheet
  const handleExportToGoogleSheets = useCallback(async () => {
    setExporting(true);
    try {
      const ordersToExport = getOrdersForExport();
      const result = await exportOrdersToGoogleSheets(ordersToExport);
      
      if (result.success) {
        toast({ 
          title: getText('toast.googleSheetsExport'), 
          description: result.message
        });
      } else {
        toast({ title: getText('toast.error'), description: result.message, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: getText('toast.error'), description: getText('toast.exportError'), variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  }, [getOrdersForExport, toast]);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const processingOrders = orders.filter(o => o.status === 'processing').length;
  const shippedOrders = orders.filter(o => o.status === 'shipped').length;
  const totalRevenue = orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0);

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">{getText('title')}</h1>
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
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">{getText('title')}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">{getText('subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh} 
            disabled={refreshing}
            className="h-8 sm:h-9 text-xs sm:text-sm"
          >
            <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{getText('refresh')}</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportToGoogleSheets}
            disabled={exporting}
            className="h-8 sm:h-9 text-xs sm:text-sm"
          >
            <FileSpreadsheet className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 ${exporting ? 'animate-pulse' : ''}`} />
            <span className="hidden sm:inline">{getText('export')}</span>
            <span className="ml-1">({selectedOrders.size > 0 ? selectedOrders.size : filteredOrders.length})</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={getText('stats.totalOrders')}
          value={totalOrders}
          change={undefined}
          lottieAnimation={shoppingCartAnimation || undefined}
          svgIcon="/icons/orders.svg"
          gradient="from-blue-500 to-cyan-600"
          iconColor="text-white"
        />
        
        <StatsCard
          title={getText('stats.processing')}
          value={processingOrders}
          change={undefined}
          lottieAnimation={packageAnimation || undefined}
          svgIcon="/icons/products.svg"
          gradient="from-purple-500 to-pink-600"
          iconColor="text-white"
        />
        
        <StatsCard
          title={getText('stats.shipped')}
          value={shippedOrders}
          change={undefined}
          lottieAnimation={deliveryTruckAnimation || undefined}
          svgIcon="/icons/truck.svg"
          gradient="from-indigo-500 to-blue-600"
          iconColor="text-white"
        />
        
        <StatsCard
          title={getText('stats.revenue')}
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
        orderStatuses={orderStatuses}
        selectedCount={selectedOrders.size}
        onBulkAction={handleBulkAction}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        translations={{
          search: getText('filters.search') || 'Rechercher...',
          statusPlaceholder: getText('filters.statusPlaceholder') || 'Statut',
          selected: getText('filters.selected') || 'sélect.',
          bulkActions: getText('filters.bulkActions') || 'Actions groupées',
          exportAction: getText('filters.exportAction') || 'Exporter',
          deleteAction: getText('filters.deleteAction') || 'Supprimer',
          deleteDialogTitle: getText('deleteDialog.title') || 'Supprimer',
          deleteDialogDesc: getText('deleteDialog.description') || 'Cette action est irréversible.',
          cancel: getText('deleteDialog.cancel') || 'Annuler',
        }}
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
        viewMode={viewMode}
        translations={{
          title: getText('table.title') || 'Gestion des commandes',
          selectAll: getText('table.selectAll') || 'Tout sélectionner',
          order: getText('table.order') || 'Commande',
          customer: getText('table.customer') || 'Client',
          phone: getText('table.phone') || 'Téléphone',
          statusHeader: getText('table.statusHeader') || 'Statut',
          total: getText('table.total') || 'Total',
          date: getText('table.date') || 'Date',
          actions: getText('table.actions') || 'Actions',
          tracking: getText('table.tracking') || 'Suivi',
          items: getText('table.items') || 'article',
          itemsPlural: getText('table.itemsPlural') || 'articles',
          viewDetails: getText('table.viewDetails') || 'Voir détails',
          edit: getText('table.edit') || 'Modifier',
          delete: getText('table.delete') || 'Supprimer',
          deleteDialogTitle: getText('deleteDialog.titleSingle') || 'Supprimer la commande',
          deleteDialogDesc: getText('deleteDialog.descriptionSingle') || 'Supprimer',
          cancel: getText('deleteDialog.cancel') || 'Annuler',
          statusPending: getStatusLabel('pending'),
          statusConfirmed: getStatusLabel('confirmed'),
          statusProcessing: getStatusLabel('processing'),
          statusShipped: getStatusLabel('shipped'),
          statusDelivered: getStatusLabel('delivered'),
          statusCancelled: getStatusLabel('cancelled'),
        }}
      />

      <OrderDetails
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        order={viewingOrder}
        translations={{
          title: (getText('details.title') || 'Commande').replace('{orderNumber}', ''),
          description: getText('details.description') || 'Détails et informations de livraison',
          tabs: {
            details: getText('details.tabs.details') || 'Détails',
            items: getText('details.tabs.items') || 'Articles',
            customer: getText('details.tabs.customer') || 'Client',
            tracking: getText('details.tabs.tracking') || 'Suivi',
          },
          info: {
            title: getText('details.info.title') || 'Informations',
            orderNumber: getText('details.info.orderNumber') || 'N° Commande:',
            status: getText('details.info.status') || 'Statut:',
            created: getText('details.info.created') || 'Créée:',
            modified: getText('details.info.modified') || 'Modifiée:',
            tracking: getText('details.info.tracking') || 'Suivi:',
          },
          summary: {
            title: getText('details.summary.title') || 'Récapitulatif',
            subtotal: getText('details.summary.subtotal') || 'Sous-total:',
            tax: getText('details.summary.tax') || 'TVA:',
            shipping: getText('details.summary.shipping') || 'Livraison:',
            total: getText('details.summary.total') || 'Total:',
          },
          notes: getText('details.notes') || 'Notes',
          itemsOrdered: getText('details.itemsOrdered') || 'Articles commandés',
          product: getText('details.product') || 'Produit',
          quantity: getText('details.quantity') || 'Quantité',
          price: getText('details.price') || 'Prix',
          customerInfo: {
            title: getText('details.customerInfo.title') || 'Informations client',
            customerId: getText('details.customerInfo.customerId') || 'ID Client:',
            email: getText('details.customerInfo.email') || 'Adresse email',
            phone: getText('details.customerInfo.phone') || 'Téléphone',
            shippingAddress: getText('details.customerInfo.shippingAddress') || 'Adresse de livraison',
          },
          progress: {
            title: getText('details.progress.title') || 'Progression',
            currentStatus: getText('details.progress.currentStatus') || 'Statut actuel',
          },
          statusPending: getStatusLabel('pending'),
          statusConfirmed: getStatusLabel('confirmed'),
          statusProcessing: getStatusLabel('processing'),
          statusShipped: getStatusLabel('shipped'),
          statusDelivered: getStatusLabel('delivered'),
          statusCancelled: getStatusLabel('cancelled'),
        }}
      />

      <OrderEdit
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        order={editingOrder}
        onUpdate={setEditingOrder}
        onSave={handleSaveEdit}
        orderStatuses={orderStatuses}
        translations={{
          title: getText('edit.title') || 'Modifier Commande',
          description: getText('edit.description') || 'Mettre à jour le statut de livraison',
          noEmail: getText('edit.noEmail') || "Pas d'email - notifications désactivées",
          noEmailWarning: getText('edit.noEmailWarning') || "Ce client n'a pas fourni d'email.",
          deliveryStatus: getText('edit.deliveryStatus') || 'Statut de livraison',
          notes: getText('edit.notes') || 'Notes',
          notesOptional: getText('edit.notesOptional') || '(optionnel)',
          notesPlaceholder: getText('edit.notesPlaceholder') || 'Ajouter des notes pour le client...',
          emailNotice: getText('edit.emailNotice') || 'Un email sera envoyé au client.',
          cancel: getText('edit.cancel') || 'Annuler',
          save: getText('edit.save') || 'Enregistrer',
          sending: getText('edit.sending') || 'Envoi...',
        }}
      />
    </div>
  );
};

export default OrdersPage;
