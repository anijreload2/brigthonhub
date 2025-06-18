'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X, Send } from 'lucide-react';

interface ComposeMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMessageSent: () => void;
  recipientId?: string;
  recipientName?: string;
  recipientEmail?: string;
  itemType?: string;
  itemId?: string;
  subject?: string;
}

export default function ComposeMessageModal({
  isOpen,
  onClose,
  onMessageSent,
  recipientId,
  recipientName,
  recipientEmail,
  itemType = 'general',
  itemId,
  subject: initialSubject = ''
}: ComposeMessageModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    recipientEmail: recipientEmail || '',
    subject: initialSubject,
    message: '',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent'
  });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.message.trim()) {
      setError('Subject and message are required');
      return;
    }

    setSending(true);
    setError('');

    try {
      const messageData: any = {
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        priority: formData.priority,
        message_type: 'inquiry',
        item_type: itemType,
        item_id: itemId
      };

      // If we have a specific recipient ID, use it
      if (recipientId) {
        messageData.recipient_id = recipientId;
      } else if (formData.recipientEmail.trim()) {
        // For guest/anonymous messages, include email
        messageData.recipient_email = formData.recipientEmail.trim();
      } else {
        setError('Recipient is required');
        setSending(false);
        return;
      }

      const response = await fetch('/api/contact-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      // Reset form
      setFormData({
        recipientEmail: '',
        subject: '',
        message: '',
        priority: 'normal'
      });

      onMessageSent();
      onClose();
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Compose New Message
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Recipient */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To
            </label>
            {recipientName ? (
              <div className="bg-gray-50 px-3 py-2 rounded-md text-sm text-gray-700">
                {recipientName} ({recipientEmail})
              </div>
            ) : (
              <Input
                type="email"
                placeholder="Recipient email address"
                value={formData.recipientEmail}
                onChange={(e) => handleInputChange('recipientEmail', e.target.value)}
                required
              />
            )}
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <Input
              type="text"
              placeholder="Message subject"
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              required
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>            <select
              value={formData.priority}
              onChange={(e) => handleInputChange('priority', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Message Priority"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <Textarea
              placeholder="Type your message here..."
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              rows={6}
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={sending}>
              {sending ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </div>
              ) : (
                <div className="flex items-center">
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
