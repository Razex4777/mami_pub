import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { X, Eye, CheckCircle, ShoppingBag, Clock, User, Phone, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/interactive/button';
import { ScrollArea } from '@/components/ui/layout/scroll-area';
import { useNotifications } from '@/contexts/NotificationContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { SupabaseOrder } from '@/supabase/orders';
import { cn } from '@/lib/utils';

interface NotificationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onMarkAllAsRead: () => void;
}

const NotificationSidebar: React.FC<NotificationSidebarProps> = ({
  isOpen,
  onClose,
  onMarkAllAsRead,
}) => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { unreadOrders, markAsRead, isLoading } = useNotifications();

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Handle clicking on an order
  const handleOrderClick = (order: SupabaseOrder) => {
    markAsRead(order.id);
    navigate(`/admin/orders?viewOrder=${order.id}`);
    onClose();
  };

  // Handle viewing order details
  const handleViewOrder = (e: React.MouseEvent, order: SupabaseOrder) => {
    e.stopPropagation();
    markAsRead(order.id);
    navigate(`/admin/orders?viewOrder=${order.id}`);
    onClose();
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const minutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      if (language === 'fr') {
        return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
      } else if (language === 'ar') {
        const key = minutes === 1 ? 'minutesAgo_one' : minutes === 2 ? 'minutesAgo_two' : (minutes >= 3 && minutes <= 10) ? 'minutesAgo_few' : minutes % 100 === 0 ? 'minutesAgo_many' : 'minutesAgo_other';
        return t(`notifications.${key}`, 'components').replace('{{count}}', minutes.toString());
      } else {
        const key = minutes === 1 ? 'minutesAgo_one' : 'minutesAgo_other';
        return t(`notifications.${key}`, 'components').replace('{{count}}', minutes.toString());
      }
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      if (language === 'fr') {
        return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
      } else if (language === 'ar') {
        const key = hours === 1 ? 'hoursAgo_one' : hours === 2 ? 'hoursAgo_two' : (hours >= 3 && hours <= 10) ? 'hoursAgo_few' : hours % 100 === 0 ? 'hoursAgo_many' : 'hoursAgo_other';
        return t(`notifications.${key}`, 'components').replace('{{count}}', hours.toString());
      } else {
        const key = hours === 1 ? 'hoursAgo_one' : 'hoursAgo_other';
        return t(`notifications.${key}`, 'components').replace('{{count}}', hours.toString());
      }
    } else {
      return date.toLocaleDateString(language === 'fr' ? 'fr-FR' : language === 'ar' ? 'ar-DZ' : 'en-US', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'processing':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  // Get status label
  const getStatusLabel = (status: string) => {
    const labels = {
      pending: language === 'fr' ? 'En attente' : language === 'ar' ? 'في الانتظار' : 'Pending',
      confirmed: language === 'fr' ? 'Confirmée' : language === 'ar' ? 'مؤكدة' : 'Confirmed',
      processing: language === 'fr' ? 'En traitement' : language === 'ar' ? 'قيد المعالجة' : 'Processing',
      shipped: language === 'fr' ? 'Expédiée' : language === 'ar' ? 'تم الشحن' : 'Shipped',
      delivered: language === 'fr' ? 'Livrée' : language === 'ar' ? 'تم التسليم' : 'Delivered',
      cancelled: language === 'fr' ? 'Annulée' : language === 'ar' ? 'ملغاة' : 'Cancelled',
    };
    return labels[status as keyof typeof labels] || status;
  };

  return createPortal(
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full z-[9999] w-full sm:w-96 transform transition-transform duration-300 ease-in-out',
          'bg-white dark:bg-zinc-900',
          'border-l border-border shadow-2xl',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <ShoppingBag className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                {t('notifications.newOrders', 'components')}
              </h2>
              <p className="text-sm text-muted-foreground">
                {unreadOrders.length} {t('notifications.unread', 'components')}{unreadOrders.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadOrders.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMarkAllAsRead}
                className="text-xs hover:bg-muted/50"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                {t('notifications.markAll', 'components')}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 h-[calc(100vh-73px)]">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : unreadOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <CheckCircle className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-1">
                {t('notifications.noNewOrders', 'components')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('notifications.allCaughtUp', 'components')}
              </p>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {unreadOrders.map((order) => (
                <div
                  key={order.id}
                  className="group rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer p-3"
                  onClick={() => handleOrderClick(order)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-sm">
                          #{order.order_number}
                        </span>
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded-full font-medium',
                          getStatusColor(order.status)
                        )}>
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        {order.customer && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span className="truncate">
                              {order.customer.first_name} {order.customer.last_name}
                            </span>
                          </div>
                        )}
                        
                        {order.customer?.phone && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span>{order.customer.phone}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(order.created_at)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            {order.payment_status === 'pending' 
                              ? t('notifications.paymentPending', 'components')
                              : t('notifications.paymentConfirmed', 'components')
                            }
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 pt-2 border-t">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {order.total.toLocaleString()} {order.currency || 'DA'}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleViewOrder(e, order)}
                            className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            {t('notifications.view', 'components')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </>,
    document.body
  );
};

export default NotificationSidebar;
