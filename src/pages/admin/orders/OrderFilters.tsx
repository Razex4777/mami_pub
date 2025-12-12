import React, { useState } from 'react';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/overlays/alert-dialog';
import {
  Search,
  MoreHorizontal,
  Download,
  Trash2,
  LayoutGrid,
  List,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ViewMode = 'list' | 'grid';

interface OrderFiltersTranslations {
  search: string;
  statusPlaceholder: string;
  selected: string;
  bulkActions: string;
  exportAction: string;
  deleteAction: string;
  deleteDialogTitle: string;
  deleteDialogDesc: string;
  cancel: string;
}

interface OrderFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  orderStatuses: Array<{ value: string; label: string; color?: string }>;
  selectedCount: number;
  onBulkAction: (action: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  translations?: OrderFiltersTranslations;
}

const defaultTranslations: OrderFiltersTranslations = {
  search: 'Rechercher...',
  statusPlaceholder: 'Statut',
  selected: 'sélect.',
  bulkActions: 'Actions groupées',
  exportAction: 'Exporter',
  deleteAction: 'Supprimer',
  deleteDialogTitle: 'Supprimer',
  deleteDialogDesc: 'Cette action est irréversible. Les commandes sélectionnées seront définitivement supprimées.',
  cancel: 'Annuler',
};

const OrderFilters: React.FC<OrderFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  orderStatuses,
  selectedCount,
  onBulkAction,
  viewMode,
  onViewModeChange,
  translations = defaultTranslations,
}) => {
  const t = { ...defaultTranslations, ...translations };
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    onBulkAction('delete');
    setShowDeleteConfirm(false);
  };

  return (
    <>
    <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t.deleteDialogTitle} {selectedCount} ?</AlertDialogTitle>
          <AlertDialogDescription>
            {t.deleteDialogDesc}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirmDelete}
            className="bg-red-600 hover:bg-red-700"
          >
            {t.deleteAction}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t.search}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedStatus} onValueChange={onStatusChange}>
              <SelectTrigger className="w-32 sm:w-40">
                <SelectValue placeholder={t.statusPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {orderStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center border rounded-lg p-0.5 bg-muted/50">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewModeChange('list')}
                className={cn(
                  "h-7 w-7 p-0 rounded-md",
                  viewMode === 'list' && "bg-background shadow-sm"
                )}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewModeChange('grid')}
                className={cn(
                  "h-7 w-7 p-0 rounded-md",
                  viewMode === 'grid' && "bg-background shadow-sm"
                )}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectedCount > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selectedCount} {t.selected}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{t.bulkActions}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onBulkAction('export')}>
                      <Download className="h-4 w-4 mr-2" />
                      {t.exportAction}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleDeleteClick}
                      className="text-red-500 focus:text-red-500"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t.deleteAction}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
    </>
  );
};

export default OrderFilters;
