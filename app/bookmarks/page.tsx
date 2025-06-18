'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Heart, Home, Utensils, Store, Briefcase, 
  ArrowLeft, ExternalLink, MapPin, Clock,
  Search, Filter, Grid, List
} from 'lucide-react';
import Image from 'next/image';

interface Bookmark {
  id: string;
  item_type: 'property' | 'food' | 'store' | 'project';
  item_id: string;
  created_at: string;
  // Joined data from the respective tables
  item_data?: any;
}

const BOOKMARK_TYPES = {
  property: { name: 'Properties', icon: Home, color: 'text-blue-600', path: '/properties' },
  food: { name: 'Food Items', icon: Utensils, color: 'text-green-600', path: '/food' },
  store: { name: 'Marketplace', icon: Store, color: 'text-purple-600', path: '/store' },
  project: { name: 'Projects', icon: Briefcase, color: 'text-orange-600', path: '/projects' }
};

export default function BookmarksPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirect=/bookmarks');
      return;
    }
    fetchBookmarks();
  }, [user, router]);

  const fetchBookmarks = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_bookmarks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch the actual item data for each bookmark
      const bookmarksWithData = await Promise.all(
        (data || []).map(async (bookmark) => {
          try {
            let itemData = null;
            const tableName = getTableName(bookmark.item_type);
            
            const { data: itemResult, error: itemError } = await supabase
              .from(tableName)
              .select('*')
              .eq('id', bookmark.item_id)
              .single();

            if (!itemError && itemResult) {
              itemData = itemResult;
            }

            return { ...bookmark, item_data: itemData };
          } catch (err) {
            console.error('Error fetching item data:', err);
            return { ...bookmark, item_data: null };
          }
        })
      );

      setBookmarks(bookmarksWithData);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTableName = (itemType: string) => {
    switch (itemType) {
      case 'property': return 'properties';
      case 'food': return 'food_items';
      case 'store': return 'store_products';
      case 'project': return 'projects';
      default: return 'properties';
    }
  };

  const removeBookmark = async (bookmarkId: string) => {
    try {
      const { error } = await supabase
        .from('user_bookmarks')
        .delete()
        .eq('id', bookmarkId);

      if (error) throw error;

      setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  const getItemUrl = (bookmark: Bookmark) => {
    const basePath = BOOKMARK_TYPES[bookmark.item_type].path;
    return `${basePath}/${bookmark.item_id}`;
  };

  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesType = selectedType === 'all' || bookmark.item_type === selectedType;
    const matchesSearch = searchTerm === '' || 
      (bookmark.item_data?.title && bookmark.item_data.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (bookmark.item_data?.name && bookmark.item_data.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (bookmark.item_data?.description && bookmark.item_data.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesType && matchesSearch && bookmark.item_data; // Only show bookmarks with valid item data
  });
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your bookmarks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="lg:hidden"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Bookmarks</h1>
                <p className="text-gray-600">
                  Items you've saved for later
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                aria-label="Grid view"
              >
                <Grid className="w-5 h-5" />
              </button>              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                aria-label="List view"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search your bookmarks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Filter bookmarks by type"
            >
              <option value="all">All Types</option>
              {Object.entries(BOOKMARK_TYPES).map(([key, type]) => (
                <option key={key} value={key}>{type.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Bookmarks Grid/List */}
        {filteredBookmarks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {bookmarks.length === 0 ? 'No Bookmarks Yet' : 'No Matches Found'}
            </h3>
            <p className="text-gray-600 mb-6">
              {bookmarks.length === 0 
                ? 'Start browsing and bookmark items you\'re interested in!'
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
            {bookmarks.length === 0 && (
              <div className="flex flex-wrap justify-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.push('/properties')}
                >
                  <Home className="w-4 h-4 mr-2" />
                  Browse Properties
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/food')}
                >
                  <Utensils className="w-4 h-4 mr-2" />
                  Browse Food
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/store')}
                >
                  <Store className="w-4 h-4 mr-2" />
                  Browse Marketplace
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/projects')}
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  Browse Projects
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
          }>
            {filteredBookmarks.map((bookmark) => {
              const typeInfo = BOOKMARK_TYPES[bookmark.item_type];
              const Icon = typeInfo.icon;
              const item = bookmark.item_data;

              if (viewMode === 'grid') {
                return (
                  <div key={bookmark.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    {item.image_url && (
                      <div className="relative h-48">
                        <Image
                          src={item.image_url}
                          alt={item.title || item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Icon className={`w-5 h-5 ${typeInfo.color}`} />
                          <span className="text-sm text-gray-600">{typeInfo.name}</span>
                        </div>                      <button
                        onClick={() => removeBookmark(bookmark.id)}
                        className="text-red-500 hover:text-red-700"
                        aria-label="Remove bookmark"
                      >
                        <Heart className="w-5 h-5 fill-current" />
                      </button>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">                        {item.title || item.name}
                      </h3>
                      
                      {item.description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      
                      {(item.location || item.price) && (
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          {item.location && (
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {item.location}
                            </div>
                          )}
                          {item.price && (
                            <span className="font-medium text-gray-900">
                              ₦{item.price.toLocaleString()}
                            </span>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          Saved {new Date(bookmark.created_at).toLocaleDateString()}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => router.push(getItemUrl(bookmark))}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              } else {
                // List view
                return (
                  <div key={bookmark.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-4">
                      {item.image_url && (
                        <div className="relative w-24 h-24 flex-shrink-0">
                          <Image
                            src={item.image_url}
                            alt={item.title || item.name}
                            fill
                            className="object-cover rounded-md"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Icon className={`w-5 h-5 ${typeInfo.color}`} />
                            <span className="text-sm text-gray-600">{typeInfo.name}</span>
                          </div>
                          <button
                            onClick={() => removeBookmark(bookmark.id)}
                            className="text-red-500 hover:text-red-700"
                            aria-label="Remove bookmark"
                          >
                            <Heart className="w-5 h-5 fill-current" />
                          </button>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {item.title || item.name}
                        </h3>
                        
                        {item.description && (
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            {item.location && (
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {item.location}
                              </div>
                            )}
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              Saved {new Date(bookmark.created_at).toLocaleDateString()}
                            </div>
                            {item.price && (
                              <span className="font-medium text-gray-900">
                                ₦{item.price.toLocaleString()}
                              </span>
                            )}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => router.push(getItemUrl(bookmark))}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        )}
      </div>
    </div>
  );
}
