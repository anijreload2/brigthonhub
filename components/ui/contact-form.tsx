'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Send, 
  User, 
  Mail, 
  Phone, 
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface ContactFormProps {
  contentType: 'property' | 'project' | 'food_item' | 'store_product' | 'general';
  contentId?: string;
  recipientId?: string;
  recipientName?: string;
  title?: string;
  description?: string;
  className?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export default function ContactForm({
  contentType,
  contentId,
  recipientId,
  recipientName,
  title = "Send Message",
  description,
  className = "",
  onSuccess,
  onCancel
}: ContactFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear submit status when user starts typing again
    if (submitStatus !== 'idle') {
      setSubmitStatus('idle');
      setErrorMessage('');
    }
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setErrorMessage('Name is required');
      return false;
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrorMessage('Valid email is required');
      return false;
    }
    if (!formData.subject.trim()) {
      setErrorMessage('Subject is required');
      return false;
    }
    if (!formData.message.trim()) {
      setErrorMessage('Message is required');
      return false;
    }
    return true;
  };

  const getDefaultSubject = (): string => {
    const typeMap = {
      property: 'Property Inquiry',
      project: 'Project Inquiry',
      food_item: 'Food Item Inquiry',
      store_product: 'Product Inquiry',
      general: 'General Inquiry'
    };
    return typeMap[contentType] || 'Inquiry';
  };

  const getDefaultMessage = (): string => {
    const messageMap = {
      property: 'I am interested in this property and would like to know more details.',
      project: 'I am interested in similar project work and would like to discuss my requirements.',
      food_item: 'I am interested in this food item and would like to know about availability and pricing.',
      store_product: 'I am interested in this product and would like to know more details.',
      general: 'I would like to get in touch regarding your services.'
    };
    return messageMap[contentType] || '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/contact-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          contentType,
          contentId,
          recipientId,
          metadata: {
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            contentType,
            contentId
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const result = await response.json();
      setSubmitStatus('success');
      
      // Reset form after success
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
        if (onSuccess) {
          onSuccess();
        }
      }, 2000);

    } catch (error) {
      console.error('Error sending message:', error);
      setSubmitStatus('error');
      setErrorMessage('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = () => {
    setFormData(prev => ({
      ...prev,
      subject: prev.subject || getDefaultSubject(),
      message: prev.message || getDefaultMessage()
    }));
  };

  return (
    <Card className={`w-full max-w-2xl mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <span>{title}</span>
        </CardTitle>
        {description && (
          <p className="text-sm text-gray-600">{description}</p>
        )}
        {recipientName && (
          <p className="text-sm text-gray-500">To: {recipientName}</p>
        )}
      </CardHeader>
      
      <CardContent>
        {submitStatus === 'success' ? (        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', padding: '2rem 0' }}
        >
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Message Sent Successfully!
            </h3>
            <p className="text-gray-600 mb-4">
              Your message has been sent. You should receive a response within 24 hours.
            </p>
            {onCancel && (
              <Button variant="outline" onClick={onCancel}>
                Close
              </Button>
            )}
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Quick Fill Button */}
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleQuickFill}
                className="text-xs"
              >
                Quick Fill
              </Button>
            </div>

            {/* Name Field */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center">
                <User className="w-4 h-4 mr-2" />
                Your Name *
              </label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your full name"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                Your Email *
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email address"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                Your Phone (Optional)
              </label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter your phone number"
                disabled={isSubmitting}
              />
            </div>

            {/* Subject Field */}
            <div className="space-y-2">
              <label htmlFor="subject" className="text-sm font-medium text-gray-700">
                Subject *
              </label>
              <Input
                id="subject"
                type="text"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                placeholder="Enter message subject"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Message Field */}
            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium text-gray-700">
                Message *
              </label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder="Enter your message..."
                rows={5}
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Error Message */}
            {submitStatus === 'error' && (              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  color: '#dc2626',
                  backgroundColor: '#fef2f2',
                  padding: '0.75rem',
                  borderRadius: '0.375rem'
                }}
              >
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{errorMessage}</span>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
              
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              )}
            </div>

            {/* Privacy Note */}
            <p className="text-xs text-gray-500 text-center pt-2">
              Your contact information will be shared with the recipient to facilitate communication.
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
