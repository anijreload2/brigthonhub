'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  Search, 
  Calendar,
  Clock,
  User,
  Tag,
  ArrowRight,
  TrendingUp,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BlogPost, BlogCategory } from '@/lib/types';
import { supabase } from '@/lib/supabase';

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('blog_categories')
          .select('*')
          .eq('isActive', true)
          .order('name');

        if (categoriesError) {
          console.error('Error fetching blog categories:', categoriesError);
        } else {
          setCategories(categoriesData || []);
        }

        // Fetch blog posts
        const { data: postsData, error: postsError } = await supabase
          .from('blog_posts')
          .select(`
            *,
            blog_categories:categoryId (
              id,
              name
            )
          `)
          .eq('isPublished', true)
          .order('publishedAt', { ascending: false });

        if (postsError) {
          console.error('Error fetching blog posts:', postsError);
        } else {
          setPosts(postsData || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter and sort posts
  const filteredAndSortedPosts = posts
    .filter(post => {
      const matchesSearch = post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           post.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || post.categoryId === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        case 'reading_time':
          return (a.readingTime || 0) - (b.readingTime || 0);
        case 'date':
        default:
          return new Date(b.publishedAt || '').getTime() - new Date(a.publishedAt || '').getTime();
      }
    });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getFeaturedPosts = () => {
    return filteredAndSortedPosts.slice(0, 3);
  };

  const getRecentPosts = () => {
    return filteredAndSortedPosts.slice(3);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              BrightonHub Blog
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Insights, tips, and updates from the world of real estate, construction, 
              and business development in Nigeria.
            </p>
            <div className="flex justify-center gap-4 mb-8">
              <Badge variant="secondary" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Expert Insights
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Market Updates
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Industry News
              </Badge>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="reading_time">Reading Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Featured Posts */}
          {getFeaturedPosts().length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Articles</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {getFeaturedPosts().map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="h-full hover:shadow-xl transition-shadow">
                      <CardHeader className="p-0">
                        {post.featuredImage && (
                          <div className="relative w-full h-48 rounded-t-lg overflow-hidden">
                            <Image
                              src={post.featuredImage}
                              alt={post.title || 'Blog post image'}
                              fill
                              className="object-cover transition-transform duration-300 hover:scale-105"
                              priority={false}
                            />
                            <Badge className="absolute top-2 left-2 bg-purple-600 text-white">
                              Featured
                            </Badge>
                          </div>
                        )}
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {(post as any).published_at && formatDate((post as any).published_at)}
                          </div>
                          {(post as any).reading_time && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {(post as any).reading_time} min read
                            </div>
                          )}
                        </div>
                        
                        <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                          {post.title}
                        </h3>
                        
                        <p className="text-gray-600 mb-4 text-sm line-clamp-3">
                          {post.excerpt}
                        </p>

                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {post.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                <Tag className="h-3 w-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <Button 
                          variant="outline" 
                          className="w-full group"
                          asChild
                        >
                          <Link href={`/blog/${post.slug}`}>
                            Read More
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Posts */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Recent Articles</h2>
              <p className="text-gray-600">{filteredAndSortedPosts.length} articles found</p>
            </div>
            
            {getRecentPosts().length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No articles found matching your criteria.</p>
                <Button 
                  onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
                  className="mt-4"
                  variant="outline"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getRecentPosts().map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="h-full hover:shadow-xl transition-shadow">
                      <CardHeader className="p-0">
                        {(post as any).featured_image && (
                          <div className="relative w-full h-48 rounded-t-lg overflow-hidden">
                            <Image
                              src={(post as any).featured_image}
                              alt={post.title || 'Blog post image'}
                              fill
                              className="object-cover transition-transform duration-300 hover:scale-105"
                              priority={false}
                            />
                          </div>
                        )}
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {(post as any).published_at && formatDate((post as any).published_at)}
                          </div>
                          {(post as any).reading_time && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {(post as any).reading_time} min read
                            </div>
                          )}
                        </div>
                        
                        <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                          {post.title}
                        </h3>
                        
                        <p className="text-gray-600 mb-4 text-sm line-clamp-3">
                          {post.excerpt}
                        </p>

                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {post.tags.slice(0, 2).map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                <Tag className="h-3 w-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                            {post.tags.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{post.tags.length - 2} more
                              </Badge>
                            )}
                          </div>
                        )}

                        <Button 
                          variant="outline" 
                          className="w-full group"
                          asChild
                        >
                          <Link href={`/blog/${post.slug}`}>
                            Read More
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Categories Section */}
          {categories.length > 0 && (
            <section className="py-12 bg-white rounded-xl shadow-lg">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Explore by Category</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Browse articles by topic to find insights that matter to your business and interests.
                </p>
              </div>
              <div className="grid md:grid-cols-4 gap-6 px-6">
                {categories.map((category) => (
                  <motion.div
                    key={category.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Card 
                      className="h-full hover:shadow-lg transition-shadow text-center cursor-pointer"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-gray-900 mb-2">{category.name}</h3>
                        <p className="text-sm text-gray-600">{category.description}</p>
                        <div className="mt-4">
                          <Badge variant="outline">
                            {posts.filter(post => (post as any).category_id === category.id).length} articles
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </section>
          )}
        </div>
      </section>
    </div>
  );
}