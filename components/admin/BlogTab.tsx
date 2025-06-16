'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Search, Plus, Eye, Edit, Trash2, Calendar, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface BlogTabProps {
  onAdd: () => void;
  onEdit: (data: any) => void;
  onView: (data: any) => void;
  onDelete: (data: any) => void;
}

const BlogTab: React.FC<BlogTabProps> = ({ onAdd, onEdit, onView, onDelete }) => {
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPublished, setFilterPublished] = useState('all');

  const fetchBlogPosts = async () => {
    try {
      setLoading(true);      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          blog_categories:categoryId (
            id,
            name
          )
        `)
        .order('createdAt', { ascending: false });

      if (error) {
        console.error('Error fetching blog posts:', error);
      } else {
        setBlogPosts(data || []);
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .eq('isActive', true)
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
      } else {
        setCategories(data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchBlogPosts();
    fetchCategories();
  }, []);

  const filteredBlogPosts = blogPosts.filter(post => {
    const matchesSearch = post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || post.categoryId === filterCategory;
    const matchesPublished = filterPublished === 'all' || 
      (filterPublished === 'published' && post.isPublished) ||
      (filterPublished === 'draft' && !post.isPublished);
    return matchesSearch && matchesCategory && matchesPublished;
  });

  return (
    <div className="bg-white rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-text-primary">Blog & Content Management</h2>
        <button onClick={onAdd} className="btn btn-primary">
          <Plus className="w-4 h-4" />
          Add Blog Post
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-light" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search blog posts..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-primary focus:outline-none"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:border-primary focus:outline-none"
          title="Filter by category"
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <select
          value={filterPublished}
          onChange={(e) => setFilterPublished(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:border-primary focus:outline-none"
          title="Filter by status"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-text-light">Loading blog posts...</p>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBlogPosts.length > 0 ? filteredBlogPosts.map((post) => (
              <div key={post.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-8 h-8 bg-accent bg-opacity-10 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-accent" />
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => onView(post)}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="View"
                    >
                      <Eye className="w-4 h-4 text-text-light" />
                    </button>
                    <button 
                      onClick={() => onEdit(post)}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4 text-text-light" />
                    </button>
                    <button 
                      onClick={() => onDelete(post)}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
                
                {post.featuredImage && (
                  <div className="mb-3">
                    <img 
                      src={post.featuredImage} 
                      alt={post.title}
                      className="w-full h-32 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-blog.jpg';
                      }}
                    />
                  </div>
                )}
                
                <h4 className="font-semibold text-text-primary mb-1 line-clamp-2">{post.title}</h4>
                <p className="text-sm text-text-light mb-2 line-clamp-2">{post.excerpt}</p>
                <div className="text-xs text-text-light space-y-1">
                  <p>Category: {post.blog_categories?.name || 'N/A'}</p>
                  {post.readingTime && <p>Reading Time: {post.readingTime} min</p>}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      post.isPublished 
                        ? 'bg-success bg-opacity-10 text-success'
                        : 'bg-warning bg-opacity-10 text-warning'
                    }`}>
                      {post.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {post.tags.slice(0, 3).map((tag: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          +{post.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center py-8 text-text-light">
                {searchTerm || filterCategory !== 'all' || filterPublished !== 'all' ? 'No blog posts found matching your criteria' : 'No blog posts found'}
              </div>
            )}
          </div>

          <div className="mt-4 text-sm text-text-light">
            Showing {filteredBlogPosts.length} of {blogPosts.length} blog posts
          </div>
        </>
      )}
    </div>
  );
};

export default BlogTab;
