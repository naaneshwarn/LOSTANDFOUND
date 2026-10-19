import React, { useState, useEffect, useRef } from 'react';
import { ContactRequest, Message } from '../../types/auth';
import { useAuth } from '../../context/AuthContext';
import { contactService } from '../../services/contactService';
import { formatRelativeTime } from '../../lib/utils';
import { Send, CheckCircle2, Shield, AlertOctagon, Flag } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import confetti from 'canvas-confetti';

export interface ChatThreadProps {
  contactRequest: ContactRequest;
  onStatusChange?: () => void;
}

export const ChatThread: React.FC<ChatThreadProps> = ({
  contactRequest,
  onStatusChange,
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [isResolving, setIsResolving] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isRequester = user?.id === contactRequest.requesterId;
  const isRecipient = user?.id === contactRequest.recipientId;

  const loadMessages = async () => {
    const list = await contactService.getMessages(contactRequest.id);
    setMessages(list);
  };

  useEffect(() => {
    loadMessages();
  }, [contactRequest.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !user) return;

    setIsSending(true);
    try {
      const newMsg = await contactService.sendMessage({
        contactRequestId: contactRequest.id,
        senderId: user.id,
        senderName: user.fullName,
        content: inputText.trim(),
      });
      setMessages((prev) => [...prev, newMsg]);
      setInputText('');
    } finally {
      setIsSending(false);
    }
  };

  const handleConfirmRecovery = async () => {
    setIsResolving(true);
    try {
      await contactService.confirmItemRecovery(contactRequest.id);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      setShowConfirmModal(false);
      onStatusChange?.();
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white flex flex-col h-[550px] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-navy-900">
              {contactRequest.itemTitle || 'Lost & Found In-App Verification'}
            </h3>
            <Badge
              variant={
                contactRequest.status === 'accepted'
                  ? 'success'
                  : contactRequest.status === 'rejected'
                  ? 'danger'
                  : 'default'
              }
              className="text-[10px]"
            >
              {contactRequest.status.toUpperCase()}
            </Badge>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Safe communication between {contactRequest.requesterName || 'Owner'} & {contactRequest.recipientName || 'Finder'}
          </p>
        </div>

        {/* Confirm Handover / Recovery */}
        {contactRequest.status !== 'accepted' && (
          <Button
            size="sm"
            variant="success"
            onClick={() => setShowConfirmModal(true)}
            className="text-xs font-bold gap-1 shadow-sm"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Confirm Recovery</span>
          </Button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/40">
        <div className="text-center my-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
            <Shield className="h-3 w-3 text-brand-600" />
            End-to-end authenticated inquiry thread. Protect your privacy.
          </span>
        </div>

        {messages.map((msg) => {
          const isMe = msg.senderId === user?.id;
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs shadow-sm ${
                  isMe
                    ? 'bg-brand-600 text-white rounded-br-none'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none'
                }`}
              >
                {!isMe && (
                  <p className="font-bold text-[10px] text-brand-600 mb-0.5">
                    {msg.senderName || 'Participant'}
                  </p>
                )}
                <p className="leading-relaxed">{msg.content}</p>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1">
                {formatRelativeTime(msg.createdAt)}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Box */}
      <form
        onSubmit={handleSendMessage}
        className="p-3 border-t border-slate-100 bg-white flex items-center gap-2"
      >
        <Input
          placeholder="Type your message to coordinate recovery safely..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 h-10 text-xs"
        />
        <Button
          type="submit"
          size="sm"
          variant="primary"
          isLoading={isSending}
          disabled={!inputText.trim()}
          className="gap-1 font-semibold px-4 h-10"
        >
          <Send className="h-3.5 w-3.5" />
          <span>Send</span>
        </Button>
      </form>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Belonging Recovery"
        description="Verify that this item has been safely returned to its rightful owner."
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            By confirming recovery, the status of this report will be updated to <strong>Recovered</strong> and removed from the active search index.
          </p>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
            <AlertOctagon className="h-4 w-4 shrink-0 mt-0.5" />
            <span>Please only confirm after the physical item has been returned and verified.</span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowConfirmModal(false)}
              disabled={isResolving}
            >
              Cancel
            </Button>
            <Button
              variant="success"
              size="sm"
              onClick={handleConfirmRecovery}
              isLoading={isResolving}
              className="gap-1 font-bold"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Yes, Confirm Recovery</span>
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
