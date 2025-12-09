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
  CheckCircle,
  Package,
  Truck,
  Archive,
  Download,
} from 'lucide-react';

interface OrderFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  selectedPaymentStatus: string;
  onPaymentStatusChange: (value: string) => void;
  orderStatuses: Array<{ value: string; label: string; color?: string }>;
  paymentStatuses: Array<{ value: string; label: string; color?: string }>;
  selectedCount: number;
  onBulkAction: (action: string) => void;
}

const OrderFilters: React.FC<OrderFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedPaymentStatus,
  onPaymentStatusChange,
  orderStatuses,
  paymentStatuses,
  selectedCount,
  onBulkAction,
}) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedStatus} onValueChange={onStatusChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                {orderStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedPaymentStatus} onValueChange={onPaymentStatusChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Paiement" />
              </SelectTrigger>
              <SelectContent>
                {paymentStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            {selectedCount > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selectedCount} sélect.
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions groupées</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onBulkAction('confirm')}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirmer
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onBulkAction('process')}>
                      <Package className="h-4 w-4 mr-2" />
                      Traiter
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onBulkAction('ship')}>
                      <Truck className="h-4 w-4 mr-2" />
                      Expédier
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onBulkAction('archive')}>
                      <Archive className="h-4 w-4 mr-2" />
                      Archiver
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onBulkAction('export')}>
                      <Download className="h-4 w-4 mr-2" />
                      Exporter
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderFilters;
