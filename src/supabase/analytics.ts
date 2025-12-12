import { supabase } from './core';
import { AdminActivityInsert, AdminActivity } from './types';

// ============================================
// Activity Logging
// ============================================

/**
 * Log an admin activity
 */
export const logActivity = async (activity: AdminActivityInsert): Promise<void> => {
  try {
    const { error } = await supabase
      .from('admin_activities')
      .insert(activity as any);

    if (error) {
      console.error('Error logging activity:', error);
    }
  } catch (error) {
    console.error('Exception logging activity:', error);
  }
};

/**
 * Get recent activities
 */
export const getRecentActivities = async (limit = 20): Promise<AdminActivity[]> => {
  const { data, error } = await supabase
    .from('admin_activities')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching activities:', error);
    return [];
  }

  return data as AdminActivity[];
};

// ============================================
// Dashboard Analytics
// ============================================

/**
 * Get dashboard analytics data
 */
export const getDashboardAnalytics = async () => {
  try {
    // 1. Get totals
    const { count: totalProducts } = await supabase.from('products').select('*', { count: 'exact', head: true });
    const { count: totalOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true });
    
    // Get unique customers by deduplicating email/phone
    const { data: ordersWithCustomers } = await supabase.from('orders').select('customer');
    const uniqueCustomerIds = new Set<string>();
    if (ordersWithCustomers) {
      (ordersWithCustomers as any[]).forEach(order => {
        if (order.customer) {
          // Use email as primary identifier, fallback to phone
          const identifier = order.customer.email || order.customer.phone;
          if (identifier) {
            uniqueCustomerIds.add(identifier);
          }
        }
      });
    }
    const totalCustomers = uniqueCustomerIds.size;
  
    // Calculate revenue ONLY from delivered orders (Chiffre d'affaires)
    const { data: deliveredOrders } = await supabase
      .from('orders')
      .select('total, items, created_at')
      .eq('status', 'delivered');
      
    const totalRevenue = (deliveredOrders as any[])?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;

    // Calculate profit from delivered orders (based on price - cost)
    let totalProfit = 0;
    if (deliveredOrders && deliveredOrders.length > 0) {
      // Get all product IDs from delivered orders
      const productIds = new Set<string>();
      (deliveredOrders as any[]).forEach(order => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach((item: any) => {
            if (item.product_id) productIds.add(item.product_id);
          });
        }
      });

      // Fetch product costs
      if (productIds.size > 0) {
        const { data: products } = await supabase
          .from('products')
          .select('id, price, cost')
          .in('id', Array.from(productIds));

        const productCostMap = new Map<string, { price: number; cost: number }>();
        (products as any[] || []).forEach(p => {
          productCostMap.set(p.id, { price: p.price || 0, cost: p.cost || 0 });
        });

        // Calculate profit for each delivered order
        (deliveredOrders as any[]).forEach(order => {
          if (order.items && Array.isArray(order.items)) {
            order.items.forEach((item: any) => {
              const productData = productCostMap.get(item.product_id);
              if (productData) {
                const quantity = item.quantity || 1;
                const profit = (productData.price - productData.cost) * quantity;
                totalProfit += profit;
              }
            });
          }
        });
      }
    }

    // 3. Revenue by month (last 6 months)
    const revenueByMonth = await getRevenueByMonth();
    
    // 4. Orders by status
    const ordersByStatus = await getOrdersByStatusStats();
    
    // 5. Top products
    const topProducts = await getTopProducts();
    
    // 6. Category distribution
    const categoryDistribution = await getCategoryDistribution();
    
    // 7. Product health
    const productHealth = await getProductHealth();

    // Calculate growth percentages from monthly data
    const currentMonthRevenue = revenueByMonth.length > 0 ? revenueByMonth[revenueByMonth.length - 1]?.revenue || 0 : 0;
    const previousMonthRevenue = revenueByMonth.length > 1 ? revenueByMonth[revenueByMonth.length - 2]?.revenue || 0 : 0;
    const revenueGrowth = previousMonthRevenue > 0 
      ? Math.round(((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 * 10) / 10 
      : 0;
    
    const currentMonthOrders = revenueByMonth.length > 0 ? revenueByMonth[revenueByMonth.length - 1]?.orders || 0 : 0;
    const previousMonthOrders = revenueByMonth.length > 1 ? revenueByMonth[revenueByMonth.length - 2]?.orders || 0 : 0;
    const ordersGrowth = previousMonthOrders > 0 
      ? Math.round(((currentMonthOrders - previousMonthOrders) / previousMonthOrders) * 100 * 10) / 10 
      : 0;
    
    // Customers and products growth (would need historical data for accurate calculation)
    const customersGrowth = 0;
    const productsGrowth = 0;

    return {
      totalRevenue,
      totalProfit,
      totalOrders: totalOrders || 0,
      totalCustomers: totalCustomers || 0,
      totalProducts: totalProducts || 0,
      revenueGrowth,
      ordersGrowth,
      customersGrowth,
      productsGrowth,
      revenueByMonth,
      ordersByStatus,
      topProducts,
      categoryDistribution,
      productHealth,
      recentActivities: []
    };
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    // Return default values on error
    return {
      totalRevenue: 0,
      totalProfit: 0,
      totalOrders: 0,
      totalCustomers: 0,
      totalProducts: 0,
      revenueGrowth: 0,
      ordersGrowth: 0,
      customersGrowth: 0,
      productsGrowth: 0,
      revenueByMonth: [],
      ordersByStatus: [],
      topProducts: [],
      categoryDistribution: [],
      productHealth: { total: 0, active: 0, inactive: 0 },
      recentActivities: []
    };
  }
};

/**
 * Get revenue breakdown by month (only delivered orders count as revenue)
 */
const getRevenueByMonth = async () => {
  // Only count delivered orders as actual revenue
  const { data: orders } = await supabase
    .from('orders')
    .select('total, created_at, status')
    .eq('status', 'delivered')
    .order('created_at', { ascending: true });

  if (!orders) return [];

  const monthsMap = new Map<string, { revenue: number; orders: number }>();
  
  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = d.toLocaleString('en-US', { month: 'short' });
    monthsMap.set(key, { revenue: 0, orders: 0 });
  }

  (orders as any[]).forEach(order => {
    const date = new Date(order.created_at);
    const key = date.toLocaleString('en-US', { month: 'short' });
    if (monthsMap.has(key)) {
      const current = monthsMap.get(key)!;
      monthsMap.set(key, {
        revenue: current.revenue + (order.total || 0),
        orders: current.orders + 1
      });
    }
  });

  return Array.from(monthsMap.entries()).map(([month, data]) => ({
    month,
    revenue: data.revenue,
    orders: data.orders
  }));
};

/**
 * Get orders breakdown by status
 */
const getOrdersByStatusStats = async () => {
  const { data: orders } = await supabase
    .from('orders')
    .select('status');

  if (!orders) return [];

  const total = orders.length;
  const counts: Record<string, number> = {};

  (orders as any[]).forEach(order => {
    counts[order.status] = (counts[order.status] || 0) + 1;
  });

  return Object.entries(counts).map(([status, count]) => ({
    status,
    count,
    percentage: Math.round((count / total) * 100)
  }));
};

/**
 * Get top selling products
 */
const getTopProducts = async () => {
  const { data: orders } = await supabase
    .from('orders')
    .select('items')
    .neq('status', 'cancelled');

  if (!orders) return [];

  const productStats = new Map<string, { name: string; sales: number; revenue: number }>();

  (orders as any[]).forEach(order => {
    const items = order.items as any[]; // Need to type this properly based on your JSON structure
    if (Array.isArray(items)) {
      items.forEach(item => {
        const id = item.product_id;
        if (!productStats.has(id)) {
          productStats.set(id, { name: item.product_name, sales: 0, revenue: 0 });
        }
        const current = productStats.get(id)!;
        productStats.set(id, {
          name: item.product_name,
          sales: current.sales + (item.quantity || 1),
          revenue: current.revenue + (item.total || 0)
        });
      });
    }
  });

  return Array.from(productStats.entries())
    .map(([id, stats]) => ({ id, ...stats }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
};

/**
 * Get product distribution by category
 */
export const getCategoryDistribution = async () => {
  // Fetch non-cancelled orders with their items for actual sales data
  const { data: orders } = await supabase
    .from('orders')
    .select('items')
    .neq('status', 'cancelled');

  if (!orders || orders.length === 0) return [];

  // Collect all product IDs from order items
  const productIds = new Set<string>();
  (orders as any[]).forEach(order => {
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach((item: any) => {
        if (item.product_id) productIds.add(item.product_id);
      });
    }
  });

  if (productIds.size === 0) return [];

  // Fetch product categories
  const { data: products } = await supabase
    .from('products')
    .select('id, category')
    .in('id', Array.from(productIds));

  const productCategoryMap = new Map<string, string>();
  (products as any[] || []).forEach(p => {
    productCategoryMap.set(p.id, p.category || 'Non catégorisé');
  });

  // Aggregate sales by category
  const categoryStats = new Map<string, { count: number; revenue: number }>();

  (orders as any[]).forEach(order => {
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach((item: any) => {
        const category = productCategoryMap.get(item.product_id) || 'Non catégorisé';
        if (!categoryStats.has(category)) {
          categoryStats.set(category, { count: 0, revenue: 0 });
        }
        const current = categoryStats.get(category)!;
        categoryStats.set(category, {
          count: current.count + (item.quantity || 1),
          revenue: current.revenue + (item.total || 0)
        });
      });
    }
  });

  const totalCount = Array.from(categoryStats.values()).reduce((sum, s) => sum + s.count, 0);
  
  // Handle zero total case - return empty array instead of misleading percentages
  if (totalCount === 0) {
    return [];
  }
  
  return Array.from(categoryStats.entries()).map(([name, stats]) => ({
    name,
    count: stats.count,
    percentage: Math.round((stats.count / totalCount) * 100),
    revenue: stats.revenue
  })).sort((a, b) => b.revenue - a.revenue);
};

/**
 * Get product health (status counts)
 */
export const getProductHealth = async () => {
  const { data: products } = await supabase
    .from('products')
    .select('status');

  if (!products) return {
    total: 0,
    active: 0,
    inactive: 0,
    lowStock: 0,
    outOfStock: 0,
  };

  let total = products.length;
  let active = 0;
  let inactive = 0;

  (products as any[]).forEach(product => {
    if (product.status === 'active') {
      active++;
    } else {
      inactive++;
    }
  });

  return {
    total,
    active,
    inactive,
  };
};
