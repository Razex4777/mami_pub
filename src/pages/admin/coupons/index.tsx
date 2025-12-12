import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

// French translations (default)
const fr = {
  title: 'Codes Promo',
  subtitle: 'Gérer vos codes de réduction',
  newCode: 'Nouveau Code',
  searchPlaceholder: 'Rechercher un code...',
  stats: {
    total: 'Total',
    active: 'Actifs',
    uses: 'Utilisations'
  },
  table: {
    code: 'Code',
    discount: 'Réduction',
    minOrder: 'Commande min.',
    uses: 'Utilisations',
    expiration: 'Expiration',
    status: 'Statut',
    actions: 'Actions',
    loading: 'Chargement...',
    noResults: 'Aucun coupon trouvé'
  },
  status: {
    active: 'Actif',
    inactive: 'Inactif',
    expired: 'Expiré'
  },
  dialog: {
    createTitle: 'Nouveau Coupon',
    editTitle: 'Modifier le Coupon',
    cancel: 'Annuler',
    create: 'Créer',
    update: 'Mettre à jour'
  },
  form: {
    code: 'Code',
    codeRequired: 'Code *',
    codePlaceholder: 'EX: PROMO20',
    codeTooltip: 'Le code unique que les clients entreront lors du paiement. Sera automatiquement converti en majuscules.',
    description: 'Description',
    descriptionPlaceholder: 'Ex: Promo été 2025',
    descriptionTooltip: 'Description interne pour vous aider à identifier ce coupon. Non visible par les clients.',
    type: 'Type',
    typeRequired: 'Type *',
    typePercentage: '% Pourcentage',
    typeFixed: 'DA Fixe',
    typeTooltip: '%: Réduction en pourcentage / DA: Montant fixe',
    value: 'Valeur',
    valueRequired: 'Valeur *',
    valueTooltip: 'Ex: 20 pour 20%',
    valueTooltipFixed: 'Ex: 500 pour -500 DA',
    minOrder: 'Commande min.',
    minOrderTooltip: 'Montant minimum de commande. 0 = pas de limite.',
    maxUses: 'Utilisations max.',
    maxUsesTooltip: "Nombre maximum d'utilisations. Vide = illimité.",
    expiration: 'Expiration',
    expirationTooltip: "Date d'expiration du coupon."
  },
  deleteDialog: {
    title: 'Supprimer le coupon ?',
    description: 'Cette action est irréversible',
    cancel: 'Annuler',
    confirm: 'Supprimer'
  },
  toast: {
    error: 'Erreur',
    loadError: 'Impossible de charger les coupons',
    validationError: 'Le code et la valeur de réduction sont requis',
    updated: 'Succès',
    updatedDesc: 'Coupon mis à jour',
    created: 'Succès',
    createdDesc: 'Coupon créé',
    deleted: 'Succès',
    deletedDesc: 'Coupon supprimé',
    deleteError: 'Impossible de supprimer le coupon',
    statusUpdated: 'Statut mis à jour',
    activated: 'Coupon activé',
    deactivated: 'Coupon désactivé',
    statusError: 'Impossible de changer le statut',
    genericError: 'Une erreur est survenue'
  }
};
import {
  Plus,
  Pencil,
  Trash2,
  Ticket,
  Percent,
  DollarSign,
  Calendar,
  Users,
  Search,
  X,
  Check,
  AlertCircle,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/interactive/button';
import { Input } from '@/components/ui/forms/input';
import { Label } from '@/components/ui/forms/label';
import { Switch } from '@/components/ui/forms/switch';
import { Badge } from '@/components/ui/data-display/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/forms/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/overlays/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/data-display/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/overlays/tooltip';
import { useToast } from '@/hooks/use-toast';
import {
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
  Coupon,
  CouponInsert,
} from '@/supabase';

const CouponsPage: React.FC = () => {
  const { t: translate, language } = useLanguage();
  
  // Translation helper - French hardcoded, others from JSON
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
  
  const t = (key: string): string => {
    if (language === 'fr') {
      return getFrenchText(key);
    }
    const translated = translate(key, 'admin_coupons');
    return translated === key ? getFrenchText(key) : translated;
  };
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [filteredCoupons, setFilteredCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<CouponInsert>>({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 0,
    min_order_amount: 0,
    max_discount_amount: null,
    max_uses: null,
    expires_at: null,
    status: 'active',
  });

  // Fetch coupons
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const data = await getAllCoupons();
      setCoupons(data);
      setFilteredCoupons(data);
    } catch (error) {
      toast({
        title: t('toast.error'),
        description: t('toast.loadError'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Filter coupons
  useEffect(() => {
    const filtered = coupons.filter(
      (c) =>
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCoupons(filtered);
  }, [searchQuery, coupons]);

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code || !formData.discount_value) {
      toast({
        title: t('toast.error'),
        description: t('toast.validationError'),
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingCoupon) {
        await updateCoupon(editingCoupon.id, formData);
        toast({ title: t('toast.updated'), description: t('toast.updatedDesc') });
      } else {
        await createCoupon(formData as CouponInsert);
        toast({ title: t('toast.created'), description: t('toast.createdDesc') });
      }
      setIsFormOpen(false);
      resetForm();
      fetchCoupons();
    } catch (error: any) {
      toast({
        title: t('toast.error'),
        description: error.message || t('toast.genericError'),
        variant: 'destructive',
      });
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      await deleteCoupon(id);
      toast({ title: t('toast.deleted'), description: t('toast.deletedDesc') });
      setDeleteConfirm(null);
      fetchCoupons();
    } catch (error) {
      toast({
        title: t('toast.error'),
        description: t('toast.deleteError'),
        variant: 'destructive',
      });
    }
  };

  // Handle status toggle - real-time update without refresh
  const handleToggleStatus = async (coupon: Coupon) => {
    const newStatus = coupon.status === 'active' ? 'inactive' : 'active';
    
    // Optimistic update - update UI immediately
    setCoupons(prev => prev.map(c => 
      c.id === coupon.id ? { ...c, status: newStatus } : c
    ));
    
    try {
      await toggleCouponStatus(coupon.id, newStatus);
      toast({ 
        title: t('toast.statusUpdated'), 
        description: newStatus === 'active' ? t('toast.activated') : t('toast.deactivated')
      });
    } catch (error) {
      // Revert on error
      setCoupons(prev => prev.map(c => 
        c.id === coupon.id ? { ...c, status: coupon.status } : c
      ));
      toast({
        title: t('toast.error'),
        description: t('toast.statusError'),
        variant: 'destructive',
      });
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 0,
      min_order_amount: 0,
      max_discount_amount: null,
      max_uses: null,
      expires_at: null,
      status: 'active',
    });
    setEditingCoupon(null);
  };

  // Open edit form
  const openEditForm = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      min_order_amount: coupon.min_order_amount,
      max_discount_amount: coupon.max_discount_amount,
      max_uses: coupon.max_uses,
      expires_at: coupon.expires_at,
      status: coupon.status,
    });
    setIsFormOpen(true);
  };

  // Format date for input (convert to local timezone)
  const formatDateForInput = (date: string | null) => {
    if (!date) return '';
    const d = new Date(date);
    // Adjust for timezone offset to get local time
    const offsetMs = d.getTimezoneOffset() * 60 * 1000;
    const localDate = new Date(d.getTime() - offsetMs);
    return localDate.toISOString().slice(0, 16);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">{t('status.active')}</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">{t('status.inactive')}</Badge>;
      case 'expired':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">{t('status.expired')}</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Ticket className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            {t('title')}
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            {t('subtitle')}
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsFormOpen(true);
          }}
          className="bg-primary hover:bg-primary/90 text-sm"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('newCode')}
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white/5 border-white/10 text-sm"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-card/50 border border-white/10 rounded-xl p-3 sm:p-4">
          <div className="text-lg sm:text-2xl font-bold text-primary">{coupons.length}</div>
          <div className="text-[10px] sm:text-sm text-muted-foreground">{t('stats.total')}</div>
        </div>
        <div className="bg-card/50 border border-white/10 rounded-xl p-3 sm:p-4">
          <div className="text-lg sm:text-2xl font-bold text-green-400">
            {coupons.filter((c) => c.status === 'active').length}
          </div>
          <div className="text-[10px] sm:text-sm text-muted-foreground">{t('stats.active')}</div>
        </div>
        <div className="bg-card/50 border border-white/10 rounded-xl p-3 sm:p-4">
          <div className="text-lg sm:text-2xl font-bold text-blue-400">
            {coupons.reduce((sum, c) => sum + c.current_uses, 0)}
          </div>
          <div className="text-[10px] sm:text-sm text-muted-foreground">{t('stats.uses')}</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card/30 border border-white/10 rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-white/5">
              <TableHead>{t('table.code')}</TableHead>
              <TableHead>{t('table.discount')}</TableHead>
              <TableHead className="hidden md:table-cell">{t('table.minOrder')}</TableHead>
              <TableHead className="hidden lg:table-cell">{t('table.uses')}</TableHead>
              <TableHead className="hidden lg:table-cell">{t('table.expiration')}</TableHead>
              <TableHead>{t('table.status')}</TableHead>
              <TableHead className="text-right">{t('table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    {t('table.loading')}
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredCoupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {t('table.noResults')}
                </TableCell>
              </TableRow>
            ) : (
              filteredCoupons.map((coupon) => (
                <TableRow key={coupon.id} className="border-white/10 hover:bg-white/5">
                  <TableCell>
                    <div className="font-mono font-bold text-primary">{coupon.code}</div>
                    {coupon.description && (
                      <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                        {coupon.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {coupon.discount_type === 'percentage' ? (
                        <>
                          <Percent className="h-3.5 w-3.5 text-primary" />
                          <span className="font-bold">{coupon.discount_value}%</span>
                        </>
                      ) : (
                        <>
                          <span className="font-bold">{coupon.discount_value} DA</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {coupon.min_order_amount > 0 ? `${coupon.min_order_amount} DA` : '-'}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>
                        {coupon.current_uses}
                        {coupon.max_uses ? ` / ${coupon.max_uses}` : ''}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {coupon.expires_at ? (
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        {new Date(coupon.expires_at).toLocaleDateString('fr-FR')}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={coupon.status === 'active'}
                        onCheckedChange={() => handleToggleStatus(coupon)}
                        disabled={coupon.status === 'expired'}
                        className="scale-90"
                      />
                      {getStatusBadge(coupon.status)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditForm(coupon)}
                        className="h-8 w-8 hover:bg-white/10"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteConfirm(coupon.id)}
                        className="h-8 w-8 hover:bg-red-500/20 text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent 
          className="w-[calc(100%-2rem)] sm:w-full max-w-lg bg-card border-white/10 max-h-[85vh] overflow-y-auto"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Ticket className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              {editingCoupon ? t('dialog.editTitle') : t('dialog.createTitle')}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
            <TooltipProvider>
              {/* Code - Required */}
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-xs sm:text-sm">{t('form.codeRequired')}</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-[200px] sm:max-w-[250px]">
                      <p className="text-[10px] sm:text-xs">{t('form.codeTooltip')}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  placeholder={t('form.codePlaceholder')}
                  className="bg-white/5 border-white/10 font-mono uppercase text-sm"
                  required
                />
              </div>

              {/* Description - Optional */}
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-xs sm:text-sm">{t('form.description')}</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-[200px] sm:max-w-[250px]">
                      <p className="text-[10px] sm:text-xs">{t('form.descriptionTooltip')}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t('form.descriptionPlaceholder')}
                  className="bg-white/5 border-white/10 text-sm"
                />
              </div>

              {/* Discount Type & Value - Required */}
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Label className="text-xs sm:text-sm">{t('form.typeRequired')}</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[200px] sm:max-w-[250px]">
                        <p className="text-[10px] sm:text-xs">{t('form.typeTooltip')}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Select
                    value={formData.discount_type}
                    onValueChange={(v) =>
                      setFormData({ ...formData, discount_type: v as 'percentage' | 'fixed' })
                    }
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-xs sm:text-sm h-9 sm:h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage" className="text-xs sm:text-sm">{t('form.typePercentage')}</SelectItem>
                      <SelectItem value="fixed" className="text-xs sm:text-sm">{t('form.typeFixed')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Label className="text-xs sm:text-sm">{t('form.valueRequired')}</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[200px] sm:max-w-[250px]">
                        <p className="text-[10px] sm:text-xs">{formData.discount_type === 'percentage' ? t('form.valueTooltip') : t('form.valueTooltipFixed')}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    type="number"
                    value={formData.discount_value || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, discount_value: parseFloat(e.target.value) || 0 })
                    }
                    placeholder={formData.discount_type === 'percentage' ? '20' : '500'}
                    className="bg-white/5 border-white/10 text-sm h-9 sm:h-10"
                    required
                    min={0}
                  />
                </div>
              </div>

              {/* Min Order & Max Discount - Optional */}
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Label className="text-xs sm:text-sm">{t('form.minOrder')}</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[200px] sm:max-w-[250px]">
                        <p className="text-[10px] sm:text-xs">{t('form.minOrderTooltip')}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    type="number"
                    value={formData.min_order_amount || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        min_order_amount: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="0"
                    className="bg-white/5 border-white/10 text-sm h-9 sm:h-10"
                    min={0}
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Label className="text-xs sm:text-sm">{t('form.maxUses')}</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[200px] sm:max-w-[250px]">
                        <p className="text-[10px] sm:text-xs">{t('form.maxUsesTooltip')}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    type="number"
                    value={formData.max_uses || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        max_uses: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    placeholder="∞"
                    className="bg-white/5 border-white/10 text-sm h-9 sm:h-10"
                    min={1}
                  />
                </div>
              </div>

              {/* Expiration - Optional */}
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Label className="text-xs sm:text-sm">{t('form.expiration')}</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[200px] sm:max-w-[250px]">
                      <p className="text-[10px] sm:text-xs">{t('form.expirationTooltip')}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  type="datetime-local"
                  value={formatDateForInput(formData.expires_at || null)}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      expires_at: e.target.value ? new Date(e.target.value).toISOString() : null,
                    })
                  }
                  className="bg-white/5 border-white/10 text-sm h-9 sm:h-10"
                />
              </div>
            </TooltipProvider>

            {/* Actions */}
            <div className="flex justify-end gap-2 sm:gap-3 pt-3 sm:pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsFormOpen(false);
                  resetForm();
                }}
                className="border-white/10 text-xs sm:text-sm"
                size="sm"
              >
                {t('dialog.cancel')}
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-xs sm:text-sm" size="sm">
                {editingCoupon ? t('dialog.update') : t('dialog.create')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-white/10 rounded-xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <h3 className="font-bold">{t('deleteDialog.title')}</h3>
                  <p className="text-sm text-muted-foreground">{t('deleteDialog.description')}</p>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirm(null)}
                  className="border-white/10"
                >
                  {t('deleteDialog.cancel')}
                </Button>
                <Button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="bg-red-500 hover:bg-red-600"
                >
                  {t('deleteDialog.confirm')}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CouponsPage;
