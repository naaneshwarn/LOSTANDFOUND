import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { contactService } from '../services/contactService';
import { ContactRequest } from '../types/auth';
import { ChatThread } from '../components/messaging/ChatThread';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Shield } from 'lucide-react';

export const MessagesPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [request, setRequest] = useState<ContactRequest | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await contactService.getContactRequestById(id);
      setRequest(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (!request) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-navy-900">Conversation Not Found</h2>
        <p className="text-xs text-slate-500">The contact request or message thread was not found.</p>
        <Link to="/requests">
          <Button size="sm" variant="outline">
            Back to Inquiries
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/requests"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-navy-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Inquiries</span>
        </Link>
      </div>

      <ChatThread contactRequest={request} onStatusChange={loadData} />
    </div>
  );
};
