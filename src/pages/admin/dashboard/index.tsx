import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/interactive/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/navigation/tabs';
import { Progress } from '@/components/ui/feedback/progress';
import { Badge } from '@/components/ui/data-display/badge';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  Eye,
  Download,
  Sparkles,
  RefreshCw,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChartIcon,
  Activity,
  Layers,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Analytics, 
  Activity as ActivityType, 
  getDashboardAnalytics, 
  getRecentActivities,
  getMostViewedProducts,
} from '@/supabase';
import StatsCard from './StatsCard';
import RevenueChart from './RevenueChart';
import ActivityFeed from './ActivityFeed';
import { useLottieAnimation } from '@/hooks/useLottieAnimation';
import { formatCurrency } from '@/lib/currency';
import { exportDashboardToPDF } from '@/lib/pdfExport';
import { toast } from 'sonner';

// Category colors for pie chart
const CATEGORY_COLORS = [
  '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', 
  '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#84cc16'
];

// Order status colors
const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  processing: '#8b5cf6',
  shipped: '#06b6d4',
  delivered: '#10b981',
  cancelled: '#ef4444',
};

// French translations (default)
const fr = {
  title: 'Tableau de bord',
  welcome: 'Bienvenue',
  subtitle: 'Voici un aperçu de votre boutique.',
  stats: {
    revenue: "Chiffre d'affaires",
    profit: 'Bénéfice',
    orders: 'Commandes',
    products: 'Produits',
    vsLastMonth: 'le mois dernier'
  },
  tabs: {
    overview: "Vue d'ensemble",
    products: 'Produits',
    orders: 'Commandes',
    activity: 'Activité'
  },
  charts: {
    revenueOverview: 'Aperçu des revenus',
    revenueDescription: 'Tendances des revenus mensuels',
    categoryDistribution: 'Répartition par catégorie',
    categoryDescription: 'Distribution des produits actifs',
    all: 'Tous',
    orderStatus: 'Statut des commandes',
    orderStatusDesc: 'Répartition actuelle',
    ordersByMonth: 'Commandes par mois',
    ordersByMonthDesc: 'Évolution sur 6 mois'
  },
  buttons: {
    refresh: 'Actualiser',
    export: 'Exporter',
    exporting: 'Export...'
  },
  status: {
    pending: 'En attente',
    confirmed: 'Confirmée',
    processing: 'En cours',
    shipped: 'Expédiée',
    delivered: 'Livrée',
    cancelled: 'Annulée'
  },
  errors: {
    loadFailed: 'Impossible de charger les données du tableau de bord',
    noData: 'Aucune donnée à exporter',
    exportError: "Erreur lors de l'export"
  },
  success: {
    exportSuccess: 'Rapport PDF généré avec succès'
  },
  time: {
    justNow: 'Juste maintenant',
    minutesAgo: 'il y a',
    hoursAgo: 'il y a',
    daysAgo: 'il y a'
  },
  quickStats: {
    activeProducts: 'Produits actifs',
    inactiveProducts: 'Produits inactifs',
    totalOrders: 'Total commandes',
    totalCustomers: 'Total clients'
  },
  productsTab: {
    productStats: 'Statistiques produits',
    catalogState: 'État de votre catalogue',
    activeProducts: 'Produits actifs',
    inactiveProducts: 'Produits inactifs',
    categories: 'Catégories',
    mostViewed: 'Produits les plus vus',
    mostViewedDesc: 'Basé sur les vues des visiteurs',
    noData: 'Aucune donnée disponible',
    topSelling: 'Meilleures ventes',
    topSellingDesc: 'Produits générant le plus de revenus',
    sales: 'ventes'
  },
  ordersTab: {
    orderStatus: 'Statut des commandes',
    currentDistribution: 'Répartition actuelle',
    ordersByMonth: 'Commandes par mois',
    evolution6Months: 'Évolution sur 6 mois',
    orderStatusCards: 'Commandes par statut'
  },
  activityTab: {
    recentActivity: 'Activité récente',
    latestEvents: 'Derniers événements',
    quickActions: 'Actions rapides',
    manageProducts: 'Gérer les produits',
    viewOrders: 'Voir les commandes',
    manageCoupons: 'Gérer les coupons',
    manageBanners: 'Gérer les bannières'
  }
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { getSetting } = useSiteSettings();
  const { t, language } = useLanguage();
  
  // Translation helper
  const getText = (key: string): string => {
    if (language === 'fr') {
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
    }
    return t(key, 'overview');
  };
  
  // Get status label based on language
  const getStatusLabel = (status: string): string => {
    if (language === 'fr') {
      return fr.status[status as keyof typeof fr.status] || status;
    }
    return t(`orders.${status}`, 'overview') || status;
  };
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [mostViewed, setMostViewed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Load Lottie animations from public folder
  const { animationData: revenueAnimation } = useLottieAnimation('/animations/revenue.json');
  const { animationData: shoppingCartAnimation } = useLottieAnimation('/animations/shopping-cart.json');
  const { animationData: customersAnimation } = useLottieAnimation('/animations/customers.json');
  const { animationData: packageAnimation } = useLottieAnimation('/animations/package.json');

  const fetchData = async () => {
    try {
      const [analyticsData, activitiesData, mostViewedData] = await Promise.all([
        getDashboardAnalytics(),
        getRecentActivities(10),
        getMostViewedProducts(5)
      ]);
      
      setAnalytics(analyticsData as any);
      setMostViewed(mostViewedData);
      setActivities(activitiesData.map((a: any) => ({
        id: a.id,
        type: a.type,
        title: a.action,
        description: a.entity_name ? `${a.action} on ${a.entity_name}` : a.action,
        timestamp: a.created_at,
        userName: a.performed_by_name || 'System'
      })) as any);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Impossible de charger les données du tableau de bord');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleExport = async () => {
    if (!analytics) {
      toast.error('Aucune donnée à exporter');
      return;
    }
    
    setExporting(true);
    try {
      await exportDashboardToPDF({
        analytics,
        mostViewed,
        siteName: getSetting('site_name') || 'MAMI PUB',
      });
      toast.success('Rapport PDF généré avec succès', {
        description: 'Le fichier a été téléchargé',
      });
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erreur lors de l\'export', {
        description: 'Veuillez réessayer',
      });
    } finally {
      setExporting(false);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    if (!timestamp) return '';
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Juste maintenant';
    if (diffInMinutes < 60) return `il y a ${diffInMinutes}m`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `il y a ${diffInHours}h`;
    return `il y a ${Math.floor(diffInHours / 24)}j`;
  };

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
                <div className="h-6 sm:h-8 bg-muted rounded w-20 sm:w-24 mb-2" />
                <div className="h-2 sm:h-3 bg-muted rounded w-12 sm:w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">{getText('title')}</h1>
        <Card className="p-6">
          <p className="text-muted-foreground text-center">{getText('errors.loadFailed')}</p>
          <Button onClick={() => window.location.reload()} className="mx-auto mt-4 block">
            {getText('buttons.refresh')}
          </Button>
        </Card>
      </div>
    );
  }

  const productHealth = analytics.productHealth || { total: 0, active: 0, inactive: 0 };
  const categoryDistribution = analytics.categoryDistribution || [];

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500">
      {/* Header with gradient background */}
      <div className="relative overflow-hidden rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-3 sm:p-4 md:p-6 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 sm:mb-2">
              <Sparkles className="h-4 w-4 sm:h-6 sm:w-6 animate-pulse" />
              <h1 className="text-lg sm:text-2xl md:text-3xl font-bold">{getText('title')}</h1>
            </div>
            <p className="text-white/90 text-xs sm:text-sm md:text-base">
              {getText('welcome')}, {user?.name || 'Admin User'} ! {getText('subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleRefresh}
              disabled={refreshing}
              className="h-8 sm:h-9 text-xs sm:text-sm bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{getText('buttons.refresh')}</span>
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              className="h-8 sm:h-9 text-xs sm:text-sm bg-white/20 hover:bg-white/30 text-white border-white/30"
              onClick={handleExport}
              disabled={exporting || !analytics}
            >
              <Download className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 ${exporting ? 'animate-bounce' : ''}`} />
              <span className="hidden sm:inline">{exporting ? getText('buttons.exporting') : getText('buttons.export')}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics with Animated Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={getText('stats.revenue')}
          value={formatCurrency(analytics.totalRevenue)}
          change={analytics.revenueGrowth}
          lottieAnimation={revenueAnimation || undefined}
          svgIcon="/icons/revenue.svg"
          gradient="from-emerald-500 to-teal-600"
          iconColor="text-white"
          vsLastMonthLabel={getText('stats.vsLastMonth')}
        />
        
        <StatsCard
          title={getText('stats.profit')}
          value={formatCurrency((analytics as any).totalProfit || 0)}
          change={analytics.revenueGrowth}
          lottieAnimation={revenueAnimation || undefined}
          svgIcon="/icons/revenue.svg"
          gradient="from-green-500 to-lime-600"
          iconColor="text-white"
          vsLastMonthLabel={getText('stats.vsLastMonth')}
        />
        
        <StatsCard
          title={getText('stats.orders')}
          value={analytics.totalOrders.toLocaleString()}
          change={analytics.ordersGrowth}
          lottieAnimation={shoppingCartAnimation || undefined}
          svgIcon="/icons/orders.svg"
          gradient="from-blue-500 to-cyan-600"
          iconColor="text-white"
          vsLastMonthLabel={getText('stats.vsLastMonth')}
        />
        
        <StatsCard
          title={getText('stats.products')}
          value={analytics.totalProducts}
          change={analytics.productsGrowth}
          lottieAnimation={packageAnimation || undefined}
          svgIcon="/icons/products.svg"
          gradient="from-orange-500 to-amber-600"
          iconColor="text-white"
          vsLastMonthLabel={getText('stats.vsLastMonth')}
        />
      </div>

      {/* Tabs for different analytics sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-10 sm:h-11">
          <TabsTrigger value="overview" className="text-xs sm:text-sm flex items-center gap-1 sm:gap-2">
            <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">{getText('tabs.overview')}</span>
            <span className="sm:hidden">Vue</span>
          </TabsTrigger>
          <TabsTrigger value="products" className="text-xs sm:text-sm flex items-center gap-1 sm:gap-2">
            <Package className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">{getText('tabs.products')}</span>
            <span className="sm:hidden">Prod.</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="text-xs sm:text-sm flex items-center gap-1 sm:gap-2">
            <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">{getText('tabs.orders')}</span>
            <span className="sm:hidden">Cmd.</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="text-xs sm:text-sm flex items-center gap-1 sm:gap-2">
            <Activity className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">{getText('tabs.activity')}</span>
            <span className="sm:hidden">Act.</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <RevenueChart 
              data={analytics.revenueByMonth} 
              formatCurrency={formatCurrency}
              title={getText('charts.revenueOverview')}
              description={getText('charts.revenueDescription')}
              revenueLabel={getText('stats.revenue')}
              ordersLabel={getText('tabs.orders')}
            />

            {/* Category Distribution Pie Chart */}
            <Card className="hover:shadow-md transition-shadow duration-300">
              <CardHeader className="p-3 sm:p-4 md:p-6">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-violet-500 animate-pulse" />
                  <CardTitle className="text-sm sm:text-base md:text-lg flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    {getText('charts.categoryDistribution')}
                  </CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">{getText('charts.categoryDescription')}</CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={categoryDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        dataKey="count"
                        nameKey="name"
                        animationDuration={1000}
                      >
                        {categoryDistribution.map((_, index) => (
                          <Cell key={`cat-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [`${value} produits`, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-2 justify-center md:flex-col md:gap-1">
                    {categoryDistribution.slice(0, 6).map((cat, index) => (
                      <div key={cat.name} className="flex items-center gap-2 text-xs">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}
                        />
                        <span className="truncate max-w-[100px]">{cat.name}</span>
                        <Badge variant="secondary" className="text-[10px] px-1">{cat.percentage}%</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats Row */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {/* Product Health Mini Cards */}
            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{productHealth.active}</p>
                  <p className="text-xs text-muted-foreground">{getText('quickStats.activeProducts')}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-gray-500/10 to-slate-500/10 border-gray-500/20">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-500/20">
                  <XCircle className="h-5 w-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-600">{productHealth.inactive}</p>
                  <p className="text-xs text-muted-foreground">{getText('quickStats.inactiveProducts')}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-500/20">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <ShoppingCart className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{analytics.totalOrders}</p>
                  <p className="text-xs text-muted-foreground">{getText('quickStats.totalOrders')}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 border-purple-500/20">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Users className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">{analytics.totalCustomers}</p>
                  <p className="text-xs text-muted-foreground">{getText('quickStats.totalCustomers')}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4 mt-4">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            {/* Product Stats */}
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  {getText('productsTab.productStats')}
                </CardTitle>
                <CardDescription>{getText('productsTab.catalogState')}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{getText('productsTab.activeProducts')}</span>
                    <span className="text-sm font-medium text-green-600">{productHealth.active}/{productHealth.total}</span>
                  </div>
                  <Progress value={(productHealth.active / (productHealth.total || 1)) * 100} className="h-2 bg-green-100" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{getText('productsTab.inactiveProducts')}</span>
                    <span className="text-sm font-medium text-gray-600">{productHealth.inactive}/{productHealth.total}</span>
                  </div>
                  <Progress value={(productHealth.inactive / (productHealth.total || 1)) * 100} className="h-2 bg-gray-200" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{getText('productsTab.categories')}</span>
                    <span className="text-sm font-medium text-purple-600">{categoryDistribution.length}</span>
                  </div>
                  <Progress value={100} className="h-2 bg-purple-100" />
                </div>
              </CardContent>
            </Card>

            {/* Most Viewed Products */}
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  {getText('productsTab.mostViewed')}
                </CardTitle>
                <CardDescription>{getText('productsTab.mostViewedDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-3">
                  {mostViewed.length > 0 ? mostViewed.map((product, index) => (
                    <div key={product.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{formatCurrency(product.price)}</p>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Eye className="h-4 w-4" />
                        <span className="text-sm font-medium">{product.viewer_count || 0}</span>
                      </div>
                    </div>
                  )) : (
                    <p className="text-sm text-muted-foreground text-center py-4">{getText('productsTab.noData')}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Selling Products */}
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                {getText('productsTab.topSelling')}
              </CardTitle>
              <CardDescription>{getText('productsTab.topSellingDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {analytics.topProducts.map((product, index) => (
                  <div 
                    key={product.id} 
                    className="p-3 rounded-xl border bg-gradient-to-br from-muted/50 to-muted/30 hover:shadow-md transition-all"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold mb-2 ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                      index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                      index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700' :
                      'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-600'
                    }`}>
                      #{index + 1}
                    </div>
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.sales} {getText('productsTab.sales')}</p>
                    <p className="text-sm font-bold text-primary mt-1">{formatCurrency(product.revenue)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-4 mt-4">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            {/* Orders by Status Pie Chart */}
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-primary" />
                  {getText('ordersTab.orderStatus')}
                </CardTitle>
                <CardDescription>{getText('ordersTab.currentDistribution')}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={analytics.ordersByStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="count"
                        nameKey="status"
                        animationDuration={1000}
                      >
                        {analytics.ordersByStatus.map((entry) => (
                          <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#6b7280'} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [`${value} ${language === 'fr' ? 'commandes' : 'orders'}`, getStatusLabel(name as string)]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-2 justify-center md:flex-col md:gap-2">
                    {analytics.ordersByStatus.map((item) => (
                      <div key={item.status} className="flex items-center gap-2 text-xs">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: STATUS_COLORS[item.status] || '#6b7280' }}
                        />
                        <span>{getStatusLabel(item.status)}</span>
                        <Badge variant="secondary" className="text-[10px] px-1">{item.count}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Orders by Month Bar Chart */}
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  {getText('ordersTab.ordersByMonth')}
                </CardTitle>
                <CardDescription>{getText('ordersTab.evolution6Months')}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={analytics.revenueByMonth}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Bar dataKey="orders" fill="#8b5cf6" radius={[4, 4, 0, 0]} name={getText('tabs.orders')} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Order Stats Summary */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-6">
            {analytics.ordersByStatus.map((item) => (
              <Card key={item.status} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <div 
                    className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center"
                    style={{ backgroundColor: `${STATUS_COLORS[item.status]}20` }}
                  >
                    <ShoppingCart className="h-5 w-5" style={{ color: STATUS_COLORS[item.status] }} />
                  </div>
                  <p className="text-2xl font-bold">{item.count}</p>
                  <p className="text-xs text-muted-foreground">{getStatusLabel(item.status)}</p>
                  <Badge 
                    variant="secondary" 
                    className="mt-1 text-[10px]"
                    style={{ backgroundColor: `${STATUS_COLORS[item.status]}20`, color: STATUS_COLORS[item.status] }}
                  >
                    {item.percentage}%
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="mt-4">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ActivityFeed 
                activities={activities} 
                formatTimeAgo={formatTimeAgo}
                title={getText('activityTab.recentActivity')}
                description={getText('activityTab.latestEvents')}
              />
            </div>
            
            {/* Quick Actions */}
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  {getText('activityTab.quickActions')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = '/admin/products'}>
                  <Package className="h-4 w-4 mr-2" />
                  {getText('activityTab.manageProducts')}
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = '/admin/orders'}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {getText('activityTab.viewOrders')}
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = '/admin/coupons'}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  {getText('activityTab.manageCoupons')}
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = '/admin/banners'}>
                  <Layers className="h-4 w-4 mr-2" />
                  {getText('activityTab.manageBanners')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

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
