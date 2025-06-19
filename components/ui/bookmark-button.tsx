'use client';

import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface BookmarkButtonProps {
  itemId: string;
  itemType: 'property' | 'vendor' | 'project' | 'blog' | 'testimonial' | 'food' | 'store';
  title: string;
  className?: string;
  size?: 'sm' | 'lg' | 'default' | 'icon';
  variant?: 'default' | 'ghost' | 'outline';
}

export function BookmarkButton({ 
  itemId, 
  itemType, 
  title, 
  className = '', 
  size = 'sm',
  variant = 'ghost'
}: BookmarkButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkBookmarkStatus();
    }
  }, [user, itemId, itemType]);

  const checkBookmarkStatus = async () => {
    if (!user) return;
    
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      if (!token) return;

      const response = await fetch(`/api/bookmarks?type=${itemType}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const bookmarked = data.bookmarks.some((bookmark: any) => 
          bookmark.item_id === itemId && bookmark.item_type === itemType
        );
        setIsBookmarked(bookmarked);
      }
    } catch (error) {
      console.error('Error checking bookmark status:', error);
    }
  };

  const handleToggleBookmark = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to bookmark items',
        variant: 'destructive'
      });
      return;
    }

    if (isLoading) return;
    setIsLoading(true);

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      if (!token) throw new Error('No auth token');

      if (isBookmarked) {
        // Remove bookmark
        const response = await fetch(`/api/bookmarks?item_id=${itemId}&item_type=${itemType}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setIsBookmarked(false);
          toast({
            title: 'Removed from bookmarks',
            description: `${title} removed from your saved items`
          });
        } else {
          throw new Error('Failed to remove bookmark');
        }
      } else {
        // Add bookmark
        const response = await fetch('/api/bookmarks', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            item_id: itemId,
            item_type: itemType,
            title: title
          })
        });

        if (response.ok) {
          setIsBookmarked(true);
          toast({
            title: 'Added to bookmarks',
            description: `${title} saved to your bookmarks`
          });
        } else {
          throw new Error('Failed to add bookmark');
        }
      }
    } catch (error) {
      console.error('Error managing bookmark:', error);
      toast({
        title: 'Error',
        description: 'Failed to update bookmark',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggleBookmark}
      disabled={isLoading}
      className={`${className} ${isBookmarked ? 'text-red-500' : 'text-gray-600'}`}
    >
      <Heart 
        className={`w-4 h-4 ${isBookmarked ? 'fill-red-500' : ''} ${isLoading ? 'animate-pulse' : ''}`} 
      />
    </Button>
  );
}
