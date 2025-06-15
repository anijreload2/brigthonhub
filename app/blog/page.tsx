
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
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

// Sample blog categories
const sampleCategories: BlogCategory[] = [
  {
    id: '1',
    name: 'Real Estate Tips',
    description: 'Expert advice on property investment and management',
    isActive: true
  },
  {
    id: '2',
    name: 'Construction Insights',
    description: 'Latest trends and techniques in construction',
    isActive: true
  },
  {
    id: '3',
    name: 'Market Analysis',
    description: 'Nigerian real estate and business market updates',
    isActive: true
  },
  {
    id: '4',
    name: 'Design Trends',
    description: 'Interior design and architectural trends',
    isActive: true
  }
];

// Sample blog posts
const samplePosts: BlogPost[] = [
  {
    id: '1',
    title: 'The Future of Real Estate Investment in Lagos',
    slug: 'future-real-estate-investment-lagos',
    content: 'Lagos continues to be the epicenter of Nigeria\'s real estate boom...',
    excerpt: 'Discover the emerging trends and opportunities in Lagos real estate market that smart investors are capitalizing on.',
    categoryId: '1',
    featuredImage: '{https://c8.alamy.com/comp/2M11MYG/outline-lagos-nigeria-city-skyline-with-modern-colored-buildings-isolated-on-white-vector-illustration-lagos-cityscape-with-landmarks-2M11MYG.jpg}',
    tags: ['Lagos', 'Investment', 'Real Estate', 'Nigeria'],
    readingTime: 8,
    isPublished: true,
    publishedAt: new Date('2024-01-15'),
    authorId: 'author1',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    title: 'Sustainable Building Materials: A Guide for Nigerian Contractors',
    slug: 'sustainable-building-materials-nigerian-contractors',
    content: 'The construction industry is evolving towards more sustainable practices...',
    excerpt: 'Learn about eco-friendly building materials that are both cost-effective and environmentally responsible for Nigerian construction projects.',
    categoryId: '2',
    featuredImage: '{https://i.pinimg.com/originals/f9/68/9b/f9689bac99f77efa9fac7b8bdd3066e4.jpg}',
    tags: ['Sustainability', 'Construction', 'Materials', 'Environment'],
    readingTime: 12,
    isPublished: true,
    publishedAt: new Date('2024-01-10'),
    authorId: 'author2',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    title: 'Nigerian Property Market Report Q1 2024',
    slug: 'nigerian-property-market-report-q1-2024',
    content: 'The first quarter of 2024 has shown remarkable growth in the Nigerian property sector...',
    excerpt: 'Comprehensive analysis of property prices, market trends, and investment opportunities across major Nigerian cities.',
    categoryId: '3',
    featuredImage: '{https://images.nigeriapropertycentre.com/blog/nigerian-real-estate-growth-rate-2011-2012-2013.png}',
    tags: ['Market Report', 'Analysis', 'Property Prices', 'Investment'],
    readingTime: 15,
    isPublished: true,
    publishedAt: new Date('2024-01-05'),
    authorId: 'author1',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '4',
    title: 'Modern African Interior Design: Blending Tradition with Contemporary Style',
    slug: 'modern-african-interior-design-tradition-contemporary',
    content: 'African interior design is experiencing a renaissance...',
    excerpt: 'Explore how contemporary African designers are creating stunning interiors that celebrate heritage while embracing modern aesthetics.',
    categoryId: '4',
    featuredImage: '{https://i.pinimg.com/originals/9a/30/22/9a3022004998f5a1e6c40786fd7a7470.jpg}',
    tags: ['Interior Design', 'African Style', 'Modern', 'Traditional'],
    readingTime: 10,
    isPublished: true,
    publishedAt: new Date('2024-01-01'),
    authorId: 'author3',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '5',
    title: 'Smart Home Technology for Nigerian Homes',
    slug: 'smart-home-technology-nigerian-homes',
    content: 'Smart home technology is becoming increasingly accessible in Nigeria...',
    excerpt: 'A comprehensive guide to implementing smart home solutions that work reliably in the Nigerian environment.',
    categoryId: '4',
    featuredImage: '{https://lh4.googleusercontent.com/YgxhRMcSMcsQ5Kuoc_LVXlfg9WSY8-VPCVB8SOWIbPA8hq_qXbDIIwTihs_z3wZPOh9efDnQyd7opZ69Py-mr_Op2TwSlGtya_gM5GzxWYQdl8P1UMS4mAqqK9Rmki8exwu7Vg250QwZ9iV9X217xnI}',
    tags: ['Smart Home', 'Technology', 'Automation', 'Nigeria'],
    readingTime: 7,
    isPublished: true,
    publishedAt: new Date('2023-12-28'),
    authorId: 'author2',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export default function BlogPage() {
  const [categories] = useState<BlogCategory[]>(sampleCategories);
  const [posts, setPosts] = useState<BlogPost[]>(samplePosts);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>(samplePosts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    let filtered = posts.filter(post => post.isPublished);

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.categoryId === selectedCategory);
    }

    // Sort
    switch (sortBy) {
      case 'oldest':
        filtered.sort((a, b) => new Date(a.publishedAt!).getTime() - new Date(b.publishedAt!).getTime());
        break;
      case 'reading-time':
        filtered.sort((a, b) => (a.readingTime || 0) - (b.readingTime || 0));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.publishedAt!).getTime() - new Date(a.publishedAt!).getTime());
        break;
    }

    setFilteredPosts(filtered);
  }, [posts, searchTerm, selectedCategory, sortBy]);

  const featuredPost = filteredPosts[0];
  const regularPosts = filteredPosts.slice(1);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-brand-gradient text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
              BrightonHub Blog
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Expert insights, market analysis, and industry trends from Nigeria's leading multi-service platform
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search articles, tips, and insights..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-4 text-lg bg-white text-gray-900 border-0 rounded-lg shadow-lg"
                />
              </div>
            </div>
          </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: BookOpen, title: 'Articles Published', value: '150+', color: 'text-blue-500' },
              { icon: TrendingUp, title: 'Monthly Readers', value: '25K+', color: 'text-green-500' },
              { icon: User, title: 'Expert Authors', value: '12+', color: 'text-purple-500' }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={stat.title} className="text-center">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600 font-medium">{stat.title}</div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-4 md:space-y-0">
            <div className="flex flex-wrap items-center gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
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
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="reading-time">Reading Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-gray-600">
              {filteredPosts.length} articles found
            </div>
          </div>

          {/* Featured Post */}
          {featuredPost && (
          <div className="mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="card-hover border-0 shadow-xl overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="relative h-64 lg:h-auto">
                    <img
                      src={featuredPost.featuredImage!}
                      alt={featuredPost.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-accent text-white">
                        Featured
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-8 flex flex-col justify-center">
                    <div className="flex items-center space-x-4 mb-4">
                      <Badge variant="secondary">
                        {categories.find(c => c.id === featuredPost.categoryId)?.name}
                      </Badge>
                      <div className="flex items-center text-gray-600 text-sm">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(featuredPost.publishedAt!).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <Clock className="w-4 h-4 mr-1" />
                        {featuredPost.readingTime} min read
                      </div>
                    </div>
                    
                    <h2 className="text-2xl lg:text-3xl font-heading font-bold text-gray-900 mb-4">
                      <Link href={`/blog/${featuredPost.slug}`} className="hover:text-primary">
                        {featuredPost.title}
                      </Link>
                    </h2>
                    
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {featuredPost.excerpt}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {featuredPost.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <Button asChild className="btn-primary w-fit">
                      <Link href={`/blog/${featuredPost.slug}`} className="flex items-center space-x-2">
                        <span>Read Full Article</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </div>
              </Card>
            </motion.div>
          </div>
          )}

          {/* Regular Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="card-hover border-0 shadow-md overflow-hidden h-full">
                  <div className="relative h-48">
                    <img
                      src={post.featuredImage!}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge variant="secondary">
                        {categories.find(c => c.id === post.categoryId)?.name}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex items-center space-x-4 mb-3 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(post.publishedAt!).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {post.readingTime} min
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
                      <Link href={`/blog/${post.slug}`} className="hover:text-primary">
                        {post.title}
                      </Link>
                    </h3>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3 flex-1">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {post.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {post.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{post.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                    
                    <Button asChild variant="outline" className="w-full mt-auto">
                      <Link href={`/blog/${post.slug}`} className="flex items-center justify-center space-x-2">
                        <span>Read More</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No articles found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search or category filter</p>
              <Button onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
