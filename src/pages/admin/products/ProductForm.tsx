import React, { useState, KeyboardEvent, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/interactive/button';
import { Input } from '@/components/ui/forms/input';
import { Label } from '@/components/ui/forms/label';
import { Textarea } from '@/components/ui/forms/textarea';
import ImageUpload from '@/components/ui/forms/ImageUpload';
import { Plus, Trash2, X, HelpCircle, AlertCircle } from 'lucide-react';
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/overlays/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/navigation/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/overlays/tooltip';
import { AdminProduct, ProductSpec, ProductCondition } from '@/supabase';
import { cn } from '@/lib/utils';

// French translations (default)
const fr = {
  form: {
    name: 'Nom du produit',
    nameRequired: 'Nom du produit *',
    namePlaceholder: 'Entrez le nom du produit',
    description: 'Description',
    descriptionRequired: 'Description *',
    descriptionPlaceholder: 'Description du produit...',
    category: 'Catégorie',
    categoryPlaceholder: 'Sélectionner une catégorie',
    categoryOptional: 'Optionnel - "Tous" par défaut',
    categoryAll: 'Tous',
    categoryDefault: 'Tous (par défaut)',
    price: 'Prix (DA)',
    priceRequired: 'Prix de vente (DA) *',
    pricePlaceholder: 'Ex: 5000',
    priceTooltipTitle: 'Prix de vente',
    priceTooltip: "C'est le prix que vos clients paieront pour acheter ce produit.",
    cost: 'Coût (DA)',
    costRequired: "Prix d'achat (DA) *",
    costPlaceholder: 'Ex: 3500',
    costTooltipTitle: "Prix d'achat",
    costTooltip: "C'est le prix que VOUS avez payé pour acheter ce produit (votre coût).",
    sku: 'SKU / Référence',
    skuPlaceholder: 'Référence produit (optionnel)',
    skuOptional: 'Optionnel',
    status: 'Statut',
    statusActive: 'Actif',
    statusInactive: 'Inactif',
    statusDiscontinued: 'Discontinué',
    condition: 'État du produit',
    conditionRequired: 'État du produit *',
    conditionPlaceholder: "Sélectionner l'état",
    conditionNew: 'Neuf',
    conditionUsed: 'Occasion',
    conditionRefurbished: 'Reconditionné',
    images: 'Images',
    imagesRequired: 'Médias du produit (Images & Vidéos) *',
    imagesHint: 'La première image/vidéo sera le média principal. Max 10 fichiers.',
    imagesPending: 'fichier(s) en attente',
    tags: 'Tags',
    tagsPlaceholder: 'Ajouter un tag...',
    tagsHint: 'Appuyez sur Entrée ou cliquez + pour ajouter',
    specs: 'Spécifications',
    specsTitle: 'Spécifications du produit',
    addSpec: 'Ajouter',
    specName: 'Nom',
    specValue: 'Valeur',
    specBlock: 'Bloc',
    specTitlePlaceholder: 'Titre du bloc (ex: Dimensions, Matériaux...)',
    specDescPlaceholder: 'Description détaillée...',
    specsEmpty: 'Aucune spécification. Cliquez "Ajouter" pour en créer.',
    specsHint: 'Ajoutez des blocs de spécifications pour décrire les caractéristiques.',
    margin: 'Marge bénéficiaire',
    marginTooltipTitle: 'Pourquoi calculer la marge ?',
    marginTooltip: 'La marge vous montre combien vous gagnez sur chaque vente.',
    marginCalc: 'Calcul :',
    marginFormula: "Marge = Prix de vente - Prix d'achat",
    marginPercent: "% = (Marge ÷ Prix d'achat) × 100",
    profit: 'de profit'
  },
  dialog: {
    addTitle: 'Ajouter un produit',
    editTitle: 'Modifier le produit',
    addDescription: 'Remplissez les détails du produit',
    editDescription: 'Modifier les informations',
    tabGeneral: 'Général',
    tabMedia: 'Médias',
    tabPricing: 'Tarifs',
    tabSpecs: 'Specs',
    cancel: 'Annuler',
    add: 'Ajouter',
    edit: 'Modifier',
    saving: 'Enregistrement...'
  },
  validation: {
    nameRequired: 'Le nom du produit est requis',
    descriptionRequired: 'La description est requise',
    priceRequired: 'Le prix de vente est requis',
    costRequired: "Le prix d'achat est requis",
    imagesRequired: 'Au moins une image est requise'
  }
};

// Validation errors type
interface ValidationErrors {
  name?: string;
  description?: string;
  price?: string;
  cost?: string;
  images?: string;
}

// Tags Input Component with Enter key and Add button support
const TagsInput: React.FC<{ tags: string[]; onChange: (tags: string[]) => void; t: (key: string) => string }> = ({ tags, onChange, t }) => {
  const [inputValue, setInputValue] = useState('');

  const addTag = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="space-y-1.5 sm:space-y-2">
      <Label className="text-xs sm:text-sm">{t('form.tags')}</Label>
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('form.tagsPlaceholder')}
          className="h-9 sm:h-10 text-sm flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addTag}
          disabled={!inputValue.trim()}
          className="h-9 sm:h-10 px-3"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:bg-primary/20 rounded p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <p className="text-[10px] sm:text-xs text-muted-foreground">
        {t('form.tagsHint')}
      </p>
    </div>
  );
};

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingProduct: AdminProduct | null;
  formData: Partial<AdminProduct>;
  setFormData: (data: Partial<AdminProduct>) => void;
  onSave: () => void;
  categories: string[];
  pendingFiles: File[];
  setPendingFiles: (files: File[]) => void;
  validationErrors?: ValidationErrors;
  isSaving?: boolean;
  setIsSaving?: (saving: boolean) => void;
}

const ProductForm: React.FC<ProductFormProps> = ({
  open,
  onOpenChange,
  editingProduct,
  formData,
  setFormData,
  onSave,
  categories,
  pendingFiles,
  setPendingFiles,
  validationErrors: externalErrors,
  isSaving = false,
  setIsSaving,
}) => {
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
    const translated = translate(key, 'admin_products');
    return translated === key ? getFrenchText(key) : translated;
  };
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState('basic');

  // Combine external and internal errors
  const validationErrors = externalErrors || errors;

  // Validate form and return errors
  const validate = (): ValidationErrors => {
    const newErrors: ValidationErrors = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = t('validation.nameRequired');
    }
    
    if (!formData.description?.trim()) {
      newErrors.description = t('validation.descriptionRequired');
    }
    
    if (formData.price === undefined || formData.price === null || formData.price <= 0) {
      newErrors.price = t('validation.priceRequired');
    }
    
    if (formData.cost === undefined || formData.cost === null || formData.cost < 0) {
      newErrors.cost = t('validation.costRequired');
    }
    
    // Check for images - either existing URLs or pending files
    const hasImages = (formData.images && formData.images.length > 0) || pendingFiles.length > 0;
    if (!hasImages) {
      newErrors.images = t('validation.imagesRequired');
    }
    
    return newErrors;
  };

  // Check which tabs have errors
  const tabErrors = useMemo(() => ({
    basic: !!(validationErrors.name || validationErrors.description),
    images: !!validationErrors.images,
    pricing: !!(validationErrors.price || validationErrors.cost),
    specs: false,
  }), [validationErrors]);

  // Handle save with validation
  const handleSave = () => {
    // Prevent duplicate submissions
    if (isSaving) return;
    
    const newErrors = validate();
    setErrors(newErrors);
    setTouched({ name: true, description: true, price: true, cost: true, images: true });
    
    if (Object.keys(newErrors).length > 0) {
      // Find first tab with error and switch to it
      if (newErrors.name || newErrors.description) {
        setActiveTab('basic');
      } else if (newErrors.images) {
        setActiveTab('images');
      } else if (newErrors.price || newErrors.cost) {
        setActiveTab('pricing');
      }
      return;
    }
    
    onSave();
  };

  // Mark field as touched on blur
  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const newErrors = validate();
    setErrors(newErrors);
  };

  // Reset state when dialog closes
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setErrors({});
      setTouched({});
      setActiveTab('basic');
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="w-[calc(100%-1rem)] sm:w-full max-w-2xl max-h-[85vh] overflow-y-auto p-4 sm:p-6"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">{editingProduct ? t('dialog.editTitle') : t('dialog.addTitle')}</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {editingProduct ? t('dialog.editDescription') : t('dialog.addDescription')}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-9 sm:h-10">
            <TabsTrigger 
              value="basic" 
              className={cn(
                "text-xs sm:text-sm relative",
                tabErrors.basic && "text-red-500 data-[state=active]:text-red-500"
              )}
            >
              {t('dialog.tabGeneral')}
              {tabErrors.basic && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="images" 
              className={cn(
                "text-xs sm:text-sm relative",
                tabErrors.images && "text-red-500 data-[state=active]:text-red-500",
                !tabErrors.images && pendingFiles.length > 0 && "text-yellow-500 data-[state=active]:text-yellow-500"
              )}
            >
              {t('dialog.tabMedia')}
              {tabErrors.images && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
              {!tabErrors.images && pendingFiles.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full" />
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="pricing" 
              className={cn(
                "text-xs sm:text-sm relative",
                tabErrors.pricing && "text-red-500 data-[state=active]:text-red-500"
              )}
            >
              {t('dialog.tabPricing')}
              {tabErrors.pricing && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </TabsTrigger>
            <TabsTrigger value="specs" className="text-xs sm:text-sm">{t('dialog.tabSpecs')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-3 sm:space-y-4">
            <div className="grid gap-3 sm:gap-4">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="name" className={cn("text-xs sm:text-sm", touched.name && validationErrors.name && "text-red-500")}>
                  {t('form.nameRequired')}
                </Label>
                <div className="relative">
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    onBlur={() => handleBlur('name')}
                    placeholder={t('form.namePlaceholder')}
                    className={cn(
                      "h-9 sm:h-10 text-sm",
                      touched.name && validationErrors.name && "border-red-500 focus-visible:ring-red-500"
                    )}
                  />
                  {touched.name && validationErrors.name && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        </TooltipTrigger>
                        <TooltipContent side="left" className="bg-red-500 text-white text-xs">
                          {validationErrors.name}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  )}
                </div>
                {touched.name && validationErrors.name && (
                  <p className="text-[10px] text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.name}
                  </p>
                )}
              </div>
              
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="description" className={cn("text-xs sm:text-sm", touched.description && validationErrors.description && "text-red-500")}>
                  {t('form.descriptionRequired')}
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  onBlur={() => handleBlur('description')}
                  placeholder={t('form.descriptionPlaceholder')}
                  rows={2}
                  className={cn(
                    "text-sm",
                    touched.description && validationErrors.description && "border-red-500 focus-visible:ring-red-500"
                  )}
                />
                {touched.description && validationErrors.description && (
                  <p className="text-[10px] text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.description}
                  </p>
                )}
              </div>
              
              {/* Product Condition - REQUIRED */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="condition" className="text-xs sm:text-sm">{t('form.conditionRequired')}</Label>
                <Select 
                  value={formData.condition || 'new'} 
                  onValueChange={(value) => setFormData({ ...formData, condition: value as ProductCondition })}
                >
                  <SelectTrigger className="h-9 sm:h-10 text-sm">
                    <SelectValue placeholder={t('form.conditionPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">{t('form.conditionNew')}</SelectItem>
                    <SelectItem value="used">{t('form.conditionUsed')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="category" className="text-xs sm:text-sm">{t('form.category')}</Label>
                  <Select 
                    value={formData.category || ''} 
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="h-9 sm:h-10 text-sm">
                      <SelectValue placeholder={t('form.categoryDefault')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tous">{t('form.categoryAll')}</SelectItem>
                      {categories.filter(c => c !== 'All' && c !== 'Tous').map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-muted-foreground">{t('form.categoryOptional')}</p>
                </div>
                
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="sku" className="text-xs sm:text-sm">{t('form.sku')}</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder={t('form.skuPlaceholder')}
                    className="h-9 sm:h-10 text-sm"
                  />
                  <p className="text-[10px] text-muted-foreground">{t('form.skuOptional')}</p>
                </div>
              </div>
              
            </div>
          </TabsContent>
          
          <TabsContent value="images" className="space-y-3 sm:space-y-4" forceMount style={{ display: activeTab === 'images' ? 'block' : 'none' }}>
            <div className="space-y-1.5 sm:space-y-2">
              <Label className={cn("text-xs sm:text-sm", touched.images && validationErrors.images && "text-red-500")}>
                {t('form.imagesRequired')}
              </Label>
              <div className={cn(
                "rounded-lg",
                touched.images && validationErrors.images && "ring-2 ring-red-500"
              )}>
                <ImageUpload
                  value={formData.images || []}
                  onChange={(urls) => setFormData({ ...formData, images: urls })}
                  onFilesChange={setPendingFiles}
                  initialPendingFiles={pendingFiles}
                  maxImages={10}
                  allowVideo={true}
                />
              </div>
              {touched.images && validationErrors.images && (
                <p className="text-[10px] text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {validationErrors.images}
                </p>
              )}
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                {t('form.imagesHint')}
                {pendingFiles.length > 0 && (
                  <span className="text-yellow-500 ml-1">
                    ({pendingFiles.length} {t('form.imagesPending')})
                  </span>
                )}
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="pricing" className="space-y-3 sm:space-y-4">
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="price" className={cn("text-xs sm:text-sm", touched.price && validationErrors.price && "text-red-500")}>
                    {t('form.priceRequired')}
                  </Label>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[200px] text-xs">
                      <p className="font-semibold mb-1">{t('form.priceTooltipTitle')}</p>
                      <p>{t('form.priceTooltip')}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="price"
                  type="number"
                  step="1"
                  min="0"
                  value={formData.price ?? ''}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value ? parseFloat(e.target.value) : undefined })}
                  onBlur={() => handleBlur('price')}
                  placeholder={t('form.pricePlaceholder')}
                  className={cn(
                    "h-9 sm:h-10 text-sm",
                    touched.price && validationErrors.price && "border-red-500 focus-visible:ring-red-500"
                  )}
                />
                {touched.price && validationErrors.price && (
                  <p className="text-[10px] text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.price}
                  </p>
                )}
              </div>
              
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="cost" className={cn("text-xs sm:text-sm", touched.cost && validationErrors.cost && "text-red-500")}>
                    {t('form.costRequired')}
                  </Label>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[200px] text-xs">
                      <p className="font-semibold mb-1">{t('form.costTooltipTitle')}</p>
                      <p>{t('form.costTooltip')}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="cost"
                  type="number"
                  step="1"
                  min="0"
                  value={formData.cost ?? ''}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value ? parseFloat(e.target.value) : undefined })}
                  onBlur={() => handleBlur('cost')}
                  placeholder={t('form.costPlaceholder')}
                  className={cn(
                    "h-9 sm:h-10 text-sm",
                    touched.cost && validationErrors.cost && "border-red-500 focus-visible:ring-red-500"
                  )}
                />
                {touched.cost && validationErrors.cost && (
                  <p className="text-[10px] text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.cost}
                  </p>
                )}
              </div>
            </div>
            
            {(formData.price !== undefined && formData.cost !== undefined && formData.price > 0 && formData.cost > 0) && (
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex items-center gap-1.5">
                  <Label className="text-xs sm:text-sm">{t('form.margin')}</Label>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[250px] text-xs">
                      <p className="font-semibold mb-1">{t('form.marginTooltipTitle')}</p>
                      <p className="mb-2">{t('form.marginTooltip')}</p>
                      <p className="font-medium">{t('form.marginCalc')}</p>
                      <p>{t('form.marginFormula')}</p>
                      <p>{t('form.marginPercent')}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="p-2 sm:p-3 bg-muted rounded-md">
                  <span className="text-lg sm:text-2xl font-bold text-green-500">
                    +{((formData.price || 0) - (formData.cost || 0)).toFixed(0)} DA
                  </span>
                  <span className="text-xs sm:text-sm text-muted-foreground ml-2">
                    ({formData.cost ? (((formData.price || 0) - (formData.cost || 0)) / formData.cost * 100).toFixed(1) : 0}% {t('form.profit')})
                  </span>
                </div>
              </div>
            )}
            
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="status" className="text-xs sm:text-sm">{t('form.status')}</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData({ ...formData, status: value as 'active' | 'inactive' | 'discontinued' })}
              >
                <SelectTrigger className="h-9 sm:h-10 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{t('form.statusActive')}</SelectItem>
                  <SelectItem value="inactive">{t('form.statusInactive')}</SelectItem>
                  <SelectItem value="discontinued">{t('form.statusDiscontinued')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <TagsInput 
              tags={formData.tags || []} 
              onChange={(tags) => setFormData({ ...formData, tags })}
              t={t}
            />
          </TabsContent>

          <TabsContent value="specs" className="space-y-3 sm:space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs sm:text-sm">{t('form.specsTitle')}</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newSpecs = [...(formData.specs || []), { name: '', description: '' }];
                    setFormData({ ...formData, specs: newSpecs });
                  }}
                  className="h-7 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {t('form.addSpec')}
                </Button>
              </div>
              
              {(!formData.specs || formData.specs.length === 0) ? (
                <div className="text-center py-6 text-muted-foreground text-sm border border-dashed rounded-lg">
                  {t('form.specsEmpty')}
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.specs.map((spec, index) => (
                    <div key={index} className="p-3 border rounded-lg space-y-2 bg-muted/30">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">{t('form.specBlock')} #{index + 1}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newSpecs = formData.specs?.filter((_, i) => i !== index) || [];
                            setFormData({ ...formData, specs: newSpecs });
                          }}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <Input
                        value={spec.name}
                        onChange={(e) => {
                          const newSpecs = [...(formData.specs || [])];
                          newSpecs[index] = { ...newSpecs[index], name: e.target.value };
                          setFormData({ ...formData, specs: newSpecs });
                        }}
                        placeholder={t('form.specTitlePlaceholder')}
                        className="h-8 text-sm"
                      />
                      <Textarea
                        value={spec.description}
                        onChange={(e) => {
                          const newSpecs = [...(formData.specs || [])];
                          newSpecs[index] = { ...newSpecs[index], description: e.target.value };
                          setFormData({ ...formData, specs: newSpecs });
                        }}
                        placeholder={t('form.specDescPlaceholder')}
                        rows={2}
                        className="text-sm"
                      />
                    </div>
                  ))}
                </div>
              )}
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                {t('form.specsHint')}
              </p>
            </div>
          </TabsContent>
          
        </Tabs>
        
        <div className="flex justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleOpenChange(false)}
            className="h-8 sm:h-9 text-xs sm:text-sm"
            disabled={isSaving}
          >
            {t('dialog.cancel')}
          </Button>
          <Button onClick={handleSave} size="sm" className="h-8 sm:h-9 text-xs sm:text-sm" disabled={isSaving}>
            {isSaving ? t('dialog.saving') : (editingProduct ? t('dialog.edit') : t('dialog.add'))}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductForm;
