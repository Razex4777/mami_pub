import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SupabaseOrder } from '@/supabase/orders';
import { supabase } from '@/supabase';

interface NotificationContextType {
  unreadOrders: SupabaseOrder[];
  unreadCount: number;
  markAsRead: (orderId: string) => void;
  markAllAsRead: () => void;
  refreshNotifications: () => void;
  isLoading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [unreadOrders, setUnreadOrders] = useState<SupabaseOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get read order IDs from localStorage
  const getReadOrderIds = (): string[] => {
    try {
      const stored = localStorage.getItem('read_order_notifications');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };
  // Save read order IDs to localStorage
  const saveReadOrderIds = (ids: string[]) => {
    localStorage.setItem('read_order_notifications', JSON.stringify(ids));
  };

  // Get last seen timestamp
  const getLastSeenTimestamp = (): string => {
    return localStorage.getItem('last_seen_order_timestamp') || new Date(0).toISOString();
  };

  // Save last seen timestamp
  const saveLastSeenTimestamp = (timestamp: string) => {
    localStorage.setItem('last_seen_order_timestamp', timestamp);
  };

  const fetchUnreadOrders = async () => {
    try {
      const readOrderIds = getReadOrderIds();
      const lastSeen = getLastSeenTimestamp();

      // Fetch all orders newer than last seen timestamp
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', lastSeen)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        return;
      }

      // Update last seen to now AFTER successful fetch
      saveLastSeenTimestamp(new Date().toISOString());

      // Filter out already read orders
      const unread = (orders as SupabaseOrder[] || []).filter(order => !readOrderIds.includes(order.id));
      
      setUnreadOrders(unread);
    } catch (error) {
      console.error('Error in fetchUnreadOrders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mark an order as read
  const markAsRead = (orderId: string) => {
    const readOrderIds = getReadOrderIds();
    if (!readOrderIds.includes(orderId)) {
      const newReadIds = [...readOrderIds, orderId];
      saveReadOrderIds(newReadIds);
      
      // Update unread orders state
      setUnreadOrders(prev => prev.filter(order => order.id !== orderId));
    }
  };

  // Mark all orders as read
  const markAllAsRead = () => {
    const allOrderIds = unreadOrders.map(order => order.id);
    const readOrderIds = getReadOrderIds();
    const newReadIds = [...new Set([...readOrderIds, ...allOrderIds])];
    saveReadOrderIds(newReadIds);
    setUnreadOrders([]);
  };

  // Refresh notifications
  const refreshNotifications = () => {
    setIsLoading(true);
    fetchUnreadOrders();
  };

  // Initial fetch
  useEffect(() => {
    fetchUnreadOrders();
  }, []);

  // Set up real-time subscription for new orders
  useEffect(() => {
    console.log('[Notifications] Setting up realtime subscription...');
    
    const channel = supabase
      .channel('db-orders-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          console.log('[Notifications] New order received:', payload);
          const newOrder = payload.new as SupabaseOrder;
          const readOrderIds = getReadOrderIds();
          
          if (!readOrderIds.includes(newOrder.id)) {
            console.log('[Notifications] Adding new order to notifications:', newOrder.id);
            setUnreadOrders(prev => [newOrder, ...prev]);
          }
        }
      )
      .subscribe((status, err) => {
        console.log('[Notifications] Subscription status:', status);
        if (err) {
          console.error('[Notifications] Subscription error:', err);
        }
      });

    return () => {
      console.log('[Notifications] Cleaning up subscription...');
      supabase.removeChannel(channel);
    };
  }, []);

  const value: NotificationContextType = {
    unreadOrders,
    unreadCount: unreadOrders.length,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
    isLoading,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
