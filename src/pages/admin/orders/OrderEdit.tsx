import React from 'react';
import { Button } from '@/components/ui/interactive/button';
import { Input } from '@/components/ui/forms/input';
import { Label } from '@/components/ui/forms/label';
import { Textarea } from '@/components/ui/forms/textarea';
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
} from '@/components/ui/overlays/dialog';
import { Order } from '@/types';

interface OrderEditProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  onUpdate: (order: Order) => void;
  onSave: () => void;
  orderStatuses: Array<{ value: string; label: string }>;
  paymentStatuses: Array<{ value: string; label: string }>;
}

const OrderEdit: React.FC<OrderEditProps> = ({
  open,
  onOpenChange,
  order,
  onUpdate,
  onSave,
  orderStatuses,
  paymentStatuses,
}) => {
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Modifier Commande {order.orderNumber}</DialogTitle>
          <DialogDescription>
            Mettre à jour le statut et les informations
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Statut de la commande</Label>
            <Select 
              value={order.status} 
              onValueChange={(value) => onUpdate({
                ...order, 
                status: value as Order['status']
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {orderStatuses.filter(s => s.value !== 'all').map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Statut du paiement</Label>
            <Select 
              value={order.paymentStatus} 
              onValueChange={(value) => onUpdate({
                ...order, 
                paymentStatus: value as Order['paymentStatus']
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {paymentStatuses.filter(s => s.value !== 'all').map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Numéro de suivi</Label>
            <Input
              value={order.trackingNumber || ''}
              onChange={(e) => onUpdate({
                ...order, 
                trackingNumber: e.target.value
              })}
              placeholder="Entrer le numéro de suivi"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={order.notes || ''}
              onChange={(e) => onUpdate({
                ...order, 
                notes: e.target.value
              })}
              placeholder="Ajouter des notes..."
              rows={3}
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button onClick={onSave}>
              Enregistrer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderEdit;
