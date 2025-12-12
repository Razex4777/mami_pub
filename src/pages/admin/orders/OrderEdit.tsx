import React, { useState } from 'react';
import { Button } from '@/components/ui/interactive/button';
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
import { Loader2, Mail, MailX, CheckCircle, Package, Truck, Clock, XCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface OrderEditTranslations {
  title: string;
  description: string;
  noEmail: string;
  noEmailWarning: string;
  deliveryStatus: string;
  notes: string;
  notesOptional: string;
  notesPlaceholder: string;
  emailNotice: string;
  cancel: string;
  save: string;
  sending: string;
}

interface OrderEditProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: any | null;
  onUpdate: (order: any) => void;
  onSave: () => void;
  orderStatuses: Array<{ value: string; label: string }>;
  translations?: OrderEditTranslations;
}

const defaultTranslations: OrderEditTranslations = {
  title: 'Modifier Commande',
  description: 'Mettre à jour le statut de livraison',
  noEmail: "Pas d'email - notifications désactivées",
  noEmailWarning: "Ce client n'a pas fourni d'email. Les mises à jour de statut ne seront pas envoyées par email.",
  deliveryStatus: 'Statut de livraison',
  notes: 'Notes',
  notesOptional: '(optionnel)',
  notesPlaceholder: 'Ajouter des notes pour le client...',
  emailNotice: "Un email sera envoyé au client pour l'informer du nouveau statut.",
  cancel: 'Annuler',
  save: 'Enregistrer',
  sending: 'Envoi...',
};

// Status labels in French
const statusLabels: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  processing: 'En cours de traitement',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

// Status icons
const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-4 w-4" />,
  confirmed: <CheckCircle className="h-4 w-4" />,
  processing: <Package className="h-4 w-4" />,
  shipped: <Truck className="h-4 w-4" />,
  delivered: <CheckCircle className="h-4 w-4" />,
  cancelled: <XCircle className="h-4 w-4" />,
};

const OrderEdit: React.FC<OrderEditProps> = ({
  open,
  onOpenChange,
  order,
  onUpdate,
  onSave,
  orderStatuses,
  translations = defaultTranslations,
}) => {
  const t = { ...defaultTranslations, ...translations };
  const [isSending, setIsSending] = useState(false);

  if (!order) return null;

  const handleSave = async () => {
    setIsSending(true);
    
    try {
      // Check if customer has email and send notification
      const customerEmail = order.customer?.email;
      
      if (customerEmail) {
        // Validate environment variables
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
          console.error('Missing Supabase configuration');
          toast.error('Configuration manquante', {
            description: 'Impossible d\'envoyer l\'email',
          });
          onSave();
          return;
        }
        
        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        try {
          // Send delivery status email via Edge Function
          const response = await fetch(
            `${supabaseUrl}/functions/v1/send-order-email`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseKey}`,
              },
              signal: controller.signal,
              body: JSON.stringify({
                recipientEmail: customerEmail,
                type: 'status_update',
                order: {
                  orderId: order.orderNumber,
                  customerName: order.customer?.name || 'Client',
                  status: order.status,
                  statusLabel: statusLabels[order.status] || order.status,
                  notes: order.notes || '',
                },
              }),
            }
          );
          
          clearTimeout(timeoutId);

          if (response.ok) {
            toast.success('Email envoyé', {
              description: `Notification envoyée à ${customerEmail}`,
            });
          } else {
            const errorData = await response.json().catch(() => ({}));
            console.error('Email API error:', response.status, errorData);
            toast.error('Erreur d\'envoi', {
              description: 'L\'email n\'a pas pu être envoyé',
            });
          }
        } catch (fetchError) {
          clearTimeout(timeoutId);
          if (fetchError.name === 'AbortError') {
            toast.error('Délai dépassé', {
              description: 'L\'envoi de l\'email a pris trop de temps',
            });
          } else {
            throw fetchError;
          }
        }
      }
      
      // Call the original save function
      onSave();
    } catch (error) {
      console.error('Error sending email:', error);
      // Still save even if email fails
      onSave();
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] sm:w-full max-w-md sm:max-w-lg p-4 sm:p-6">
        <DialogHeader className="space-y-1 sm:space-y-2">
          <DialogTitle className="text-base sm:text-lg">
            {t.title} {order.orderNumber}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {t.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 sm:space-y-5 mt-3 sm:mt-4">
          {/* Customer Info Summary */}
          <div className="bg-muted/50 rounded-lg p-3 sm:p-4 space-y-1">
            <p className="text-xs sm:text-sm font-medium">{order.customer?.name}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">{order.customer?.phone}</p>
            {order.customer?.email ? (
              <p className="text-[10px] sm:text-xs text-green-500 flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {order.customer.email}
              </p>
            ) : (
              <p className="text-[10px] sm:text-xs text-amber-500 flex items-center gap-1">
                <MailX className="h-3 w-3" />
                {t.noEmail}
              </p>
            )}
          </div>
          
          {/* No Email Warning */}
          {!order.customer?.email && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] sm:text-xs text-amber-400">
                {t.noEmailWarning}
              </p>
            </div>
          )}

          {/* Delivery Status */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label className="text-xs sm:text-sm">{t.deliveryStatus}</Label>
            <Select 
              value={order.status} 
              onValueChange={(value) => onUpdate({
                ...order, 
                status: value
              })}
            >
              <SelectTrigger className="h-9 sm:h-10 text-sm">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    {statusIcons[order.status]}
                    <span>{orderStatuses.find(s => s.value === order.status)?.label || order.status}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="z-[200]">
                {orderStatuses.filter(s => s.value !== 'all').map((status) => (
                  <SelectItem key={status.value} value={status.value} className="text-sm">
                    <div className="flex items-center gap-2">
                      {statusIcons[status.value]}
                      <span>{status.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Notes (Optional) */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label className="text-xs sm:text-sm">
              {t.notes} <span className="text-muted-foreground">{t.notesOptional}</span>
            </Label>
            <Textarea
              value={order.notes || ''}
              onChange={(e) => onUpdate({
                ...order, 
                notes: e.target.value
              })}
              placeholder={t.notesPlaceholder}
              rows={3}
              className="text-sm resize-none"
            />
          </div>

          {/* Email notification info */}
          {order.customer?.email && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex items-start gap-2">
              <Mail className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
              <p className="text-[10px] sm:text-xs text-blue-300">
                {t.emailNotice}
              </p>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-2 sm:pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="h-9 sm:h-10 text-sm"
              disabled={isSending}
            >
              {t.cancel}
            </Button>
            <Button 
              onClick={handleSave}
              className="h-9 sm:h-10 text-sm"
              disabled={isSending}
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t.sending}
                </>
              ) : (
                t.save
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderEdit;
