import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/interactive/button';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Eye,
  Download,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Analytics, Activity as ActivityType } from '@/supabase';
import StatsCard from './StatsCard';
import RevenueChart from './RevenueChart';
import ActivityFeed from './ActivityFeed';
import { useLottieAnimation } from '@/hooks/useLottieAnimation';
import { formatCurrency } from '@/lib/currency';

// Mock data generators
const generateMockAnalytics = (): Analytics => ({
  totalRevenue: 247500,
  totalOrders: 1247,
  totalCustomers: 856,
  totalProducts: 124,
  revenueGrowth: 12.5,
  ordersGrowth: 8.3,
  customersGrowth: 15.2,
  productsGrowth: 4.1,
  revenueByMonth: [
    { month: 'Jan', revenue: 45000, orders: 145 },
    { month: 'Feb', revenue: 52000, orders: 168 },
    { month: 'Mar', revenue: 48000, orders: 156 },
    { month: 'Apr', revenue: 61000, orders: 198 },
    { month: 'May', revenue: 55000, orders: 182 },
    { month: 'Jun', revenue: 67000, orders: 215 },
  ],
  ordersByStatus: [
    { status: 'Pending', count: 45, percentage: 12.3 },
    { status: 'Confirmed', count: 78, percentage: 21.3 },
    { status: 'Processing', count: 123, percentage: 33.6 },
    { status: 'Shipped', count: 89, percentage: 24.3 },
    { status: 'Delivered', count: 32, percentage: 8.5 },
  ],
  topProducts: [
    { id: '1', name: 'DTF Transfer Film', sales: 245, revenue: 12250 },
    { id: '2', name: 'Heat Press Machine', sales: 89, revenue: 17800 },
    { id: '3', name: 'Vinyl Sheets', sales: 456, revenue: 9120 },
    { id: '4', name: 'Printer Ink Set', sales: 134, revenue: 6700 },
    { id: '5', name: 'Cutting Tools', sales: 78, revenue: 2340 },
  ],
  recentActivities: [],
});

const generateMockActivities = (): ActivityType[] => [
  {
    id: '1',
    type: 'order',
    title: 'New Order',
    description: 'Order #12345 from John Doe ($450.00)',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    userName: 'System',
  },
  {
    id: '2',
    type: 'product',
    title: 'Product Updated',
    description: 'DTF Transfer Film price updated to $49.99',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    userName: 'Admin User',
  },
  {
    id: '3',
    type: 'customer',
    title: 'New Customer',
    description: 'Sarah Wilson registered as new customer',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    userName: 'System',
  },
  {
    id: '4',
    type: 'system',
    title: 'Stock Alert',
    description: 'Heat Press Machine running low (5 units left)',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    userName: 'System',
  },
];

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Load Lottie animations from public folder
  const { animationData: revenueAnimation } = useLottieAnimation('/animations/revenue.json');
  const { animationData: shoppingCartAnimation } = useLottieAnimation('/animations/shopping-cart.json');
  const { animationData: customersAnimation } = useLottieAnimation('/animations/customers.json');
  const { animationData: packageAnimation } = useLottieAnimation('/animations/package.json');

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnalytics(generateMockAnalytics());
      setActivities(generateMockActivities());
      setLoading(false);
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2 p-3 sm:p-4">
                <div className="h-3 sm:h-4 bg-muted rounded w-16 sm:w-20" />
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <div className="h-6 sm:h-8 bg-muted rounded w-20 sm:w-24 mb-2" />
                <div className="h-2 sm:h-3 bg-muted rounded w-12 sm:w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500">
      {/* Header with gradient background */}
      <div className="relative overflow-hidden rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-3 sm:p-4 md:p-6 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 sm:mb-2">
              <Sparkles className="h-4 w-4 sm:h-6 sm:w-6 animate-pulse" />
              <h1 className="text-lg sm:text-2xl md:text-3xl font-bold">Tableau de bord</h1>
            </div>
            <p className="text-white/90 text-xs sm:text-sm md:text-base">
              Bienvenue, {user?.name} !
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" className="h-8 sm:h-9 text-xs sm:text-sm bg-white/20 hover:bg-white/30 text-white border-white/30">
              <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Exporter</span>
            </Button>
            <Button variant="secondary" size="sm" className="h-8 sm:h-9 text-xs sm:text-sm bg-white/20 hover:bg-white/30 text-white border-white/30">
              <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Rapport</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics with Animated Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Chiffre d'affaires"
          value={formatCurrency(analytics.totalRevenue)}
          change={analytics.revenueGrowth}
          lottieAnimation={revenueAnimation || undefined}
          svgIcon="/icons/revenue.svg"
          gradient="from-emerald-500 to-teal-600"
          iconColor="text-white"
        />
        
        <StatsCard
          title="Commandes"
          value={analytics.totalOrders.toLocaleString()}
          change={analytics.ordersGrowth}
          lottieAnimation={shoppingCartAnimation || undefined}
          svgIcon="/icons/orders.svg"
          gradient="from-blue-500 to-cyan-600"
          iconColor="text-white"
        />
        
        <StatsCard
          title="Clients"
          value={analytics.totalCustomers.toLocaleString()}
          change={analytics.customersGrowth}
          lottieAnimation={customersAnimation || undefined}
          svgIcon="/icons/customers.svg"
          gradient="from-purple-500 to-pink-600"
          iconColor="text-white"
        />
        
        <StatsCard
          title="Produits"
          value={analytics.totalProducts}
          change={analytics.productsGrowth}
          lottieAnimation={packageAnimation || undefined}
          svgIcon="/icons/products.svg"
          gradient="from-orange-500 to-amber-600"
          iconColor="text-white"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">
        <RevenueChart data={analytics.revenueByMonth} formatCurrency={formatCurrency} />

        {/* Order Status */}
        <Card className="hover:shadow-md transition-shadow duration-300">
          <CardHeader className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
              <CardTitle className="text-sm sm:text-base md:text-lg">Statut des commandes</CardTitle>
            </div>
            <CardDescription className="text-xs sm:text-sm">Répartition par statut</CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
            <ResponsiveContainer width="100%" height={200} className="sm:h-[250px] md:h-[300px]">
              <PieChart>
                <Pie
                  data={analytics.ordersByStatus}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  dataKey="count"
                  label={({ percentage }) => `${percentage}%`}
                  animationDuration={1000}
                >
                  {analytics.ordersByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(${index * 45 + 200}, 70%, 50%)`} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-3">
        {/* Top Products */}
        <Card className="md:col-span-2 hover:shadow-md transition-shadow duration-300">
          <CardHeader className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <CardTitle className="text-sm sm:text-base md:text-lg">Meilleurs produits</CardTitle>
            </div>
            <CardDescription className="text-xs sm:text-sm">Produits les plus vendus</CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
            <div className="space-y-2 sm:space-y-3 md:space-y-4">
              {analytics.topProducts.map((product, index) => (
                <div 
                  key={product.id} 
                  className="flex items-center justify-between p-2 sm:p-3 rounded-lg hover:bg-muted/50 transition-colors duration-200"
                  style={{
                    animation: `fadeInLeft 0.5s ease-out ${index * 0.1}s both`,
                  }}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className={`flex h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 items-center justify-center rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-br ${
                      index === 0 ? 'from-yellow-400 to-orange-500 shadow-lg' :
                      index === 1 ? 'from-gray-300 to-gray-400' :
                      index === 2 ? 'from-amber-600 to-amber-700' :
                      'from-gray-200 to-gray-300 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium truncate">{product.name}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">{product.sales} ventes</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs sm:text-sm font-medium">{formatCurrency(product.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <ActivityFeed activities={activities} formatTimeAgo={formatTimeAgo} />
      </div>

      <style>{`
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
