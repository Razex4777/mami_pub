import React from 'react';
import { Card, CardContent } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/interactive/button';
import { Input } from '@/components/ui/forms/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/forms/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/overlays/dropdown-menu';
import {
  Search,
  MoreHorizontal,
  Grid3X3,
  List,
} from 'lucide-react';

interface ProductFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  categories: string[];
  statuses: string[];
  selectedCount: number;
  onBulkAction: (action: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  translations?: {
    search: string;
    category: string;
    status: string;
    selected: string;
    bulkActions: string;
    activate: string;
    deactivate: string;
    delete: string;
    export: string;
  };
}

const defaultTranslations = {
  search: 'Rechercher...',
  category: 'Catégorie',
  status: 'Statut',
  selected: 'sél.',
  bulkActions: 'Actions groupées',
  activate: 'Activer',
  deactivate: 'Désactiver',
  delete: 'Supprimer',
  export: 'Exporter',
};

const ProductFilters: React.FC<ProductFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  categories,
  statuses,
  selectedCount,
  onBulkAction,
  viewMode,
  onViewModeChange,
  translations: propTranslations,
}) => {
  const t = { ...defaultTranslations, ...propTranslations };
  
  return (
    <Card>
      <CardContent className="p-3 sm:p-4 md:p-6">
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Search - Full width on mobile */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t.search}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-9 sm:h-10 text-sm"
            />
          </div>
          
          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Select value={selectedCategory} onValueChange={onCategoryChange}>
              <SelectTrigger className="w-[100px] sm:w-32 h-8 sm:h-9 text-xs sm:text-sm">
                <SelectValue placeholder={t.category} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={onStatusChange}>
              <SelectTrigger className="w-[90px] sm:w-28 h-8 sm:h-9 text-xs sm:text-sm">
                <SelectValue placeholder={t.status} />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Spacer on larger screens */}
            <div className="flex-1 hidden sm:block" />

            {selectedCount > 0 && (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-[10px] sm:text-xs text-muted-foreground">
                  {selectedCount} {t.selected}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-7 sm:h-8 w-7 sm:w-8 p-0">
                      <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel className="text-xs">{t.bulkActions}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onBulkAction('activate')} className="text-xs sm:text-sm">
                      {t.activate}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onBulkAction('deactivate')} className="text-xs sm:text-sm">
                      {t.deactivate}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onBulkAction('delete')} className="text-red-600 text-xs sm:text-sm">
                      {t.delete}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onBulkAction('export')} className="text-xs sm:text-sm">
                      {t.export}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
            
            <div className="flex items-center border rounded-md">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('list')}
                className="rounded-r-none h-7 sm:h-8 w-7 sm:w-8 p-0"
              >
                <List className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('grid')}
                className="rounded-l-none h-7 sm:h-8 w-7 sm:w-8 p-0"
              >
                <Grid3X3 className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductFilters;
