import React, { useState } from 'react';
import { FoundItem, LostItem } from '../../types/item';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Input';
import { Shield, Lock, Send, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export interface ContactRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  foundItem: FoundItem;
  lostItem?: LostItem | null;
  onSubmit: (message: string) => Promise<void>;
}

export const ContactRequestModal: React.FC<ContactRequestModalProps> = ({
  isOpen,
  onClose,
  foundItem,
  lostItem,
  onSubmit,
}) => {
  const { user } = useAuth();
  const [message, setMessage] = useState<string>(
    lostItem
      ? `Hi! I believe you found my ${lostItem.title} in ${foundItem.locationFound}. I can provide identifying details to confirm ownership.`
      : `Hi! I believe this ${foundItem.title} belongs to me. I would like to arrange a safe recovery verification.`
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Please provide a message explaining your claim.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await onSubmit(message);
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Contact with Finder"
      description="Connect safely through our authenticated in-app messaging thread."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Item preview */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <img
            src={foundItem.imageUrl}
            alt={foundItem.title}
            className="h-12 w-12 rounded-lg object-cover shrink-0 border border-slate-200"
          />
          <div className="min-w-0">
            <p className="text-xs font-bold text-navy-900 truncate">{foundItem.title}</p>
            <p className="text-[11px] text-slate-500">
              Found at {foundItem.locationFound}
            </p>
          </div>
        </div>

        {/* Safe Privacy Notice */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900">
          <Shield className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Privacy Guard Active</p>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Your personal email address and telephone number are never disclosed publicly. All verification occurs within this secure channel until you choose to meet at a designated campus safety point.
            </p>
          </div>
        </div>

        <Textarea
          label="Verification Message to Finder"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe unique marks, serial numbers, wallpapers, or contents to verify your ownership..."
          rows={4}
          error={error}
          helperText="Tip: Mention specific identifying marks or contents not visible in the public photo."
          required
        />

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            className="gap-1.5 font-bold shadow-sm"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Send Request</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};
