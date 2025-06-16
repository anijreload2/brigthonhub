'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  Eye,
  Calendar,
  MapPin,
  DollarSign,
  Star,
  Award,
  Users,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Project, ProjectCategory, ProjectStatus } from '@/lib/types';
import { CURRENCY } from '@/lib/constants';
import { supabase } from '@/lib/supabase';

// Type mapping for database response (snake_case) to UI (camelCase)
interface ProjectResponse {
  id: string;
  title: string;
  description: string;
  category_id: string;
  before_images: string[];
  after_images: string[];
  status: string;
  budget: number | null;
  start_date: string | null;
  end_date: string | null;
  location: string | null;
  client_name: string | null;
  testimonial: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  project_categories?: {
    id: string;
    name: string;
  };
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('project_categories')
          .select('*')
          .eq('isActive', true)
          .order('name');

        if (categoriesError) {
          console.error('Error fetching project categories:', categoriesError);
        } else {
          setCategories(categoriesData || []);
        }

        // Fetch projects
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select(`
            *,
            project_categories (
              id,
              name
            )
          `)
          .eq('isActive', true)
          .order('createdAt', { ascending: false });

        if (projectsError) {
          console.error('Error fetching projects:', projectsError);
        } else {
          setProjects(projectsData || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter and sort projects
  const filteredAndSortedProjects = projects
    .filter(project => {
      const matchesSearch = project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || (project as any).categoryId === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || project.status === selectedStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'budget':
          return (b.budget || 0) - (a.budget || 0);
        case 'date':
          return new Date((b as any).createdAt || '').getTime() - new Date((a as any).createdAt || '').getTime();
        case 'name':
        default:
          return (a.title || '').localeCompare(b.title || '');
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'planning':
        return 'bg-yellow-500';
      case 'on_hold':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatBudget = (budget: number) => {
    if (budget >= 1000000) {
      return `${CURRENCY.symbol}${(budget / 1000000).toFixed(1)}M`;
    } else if (budget >= 1000) {
      return `${CURRENCY.symbol}${(budget / 1000).toFixed(0)}K`;
    } else {
      return `${CURRENCY.symbol}${budget?.toLocaleString()}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Our Projects
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Explore our portfolio of successful construction and renovation projects. 
              From luxury homes to commercial buildings, we bring visions to life.
            </p>
            <div className="flex justify-center gap-4 mb-8">
              <Badge variant="secondary" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Award Winning
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Expert Team
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                On-Time Delivery
              </Badge>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search projects..."
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
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="budget">Budget</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Our Portfolio</h2>
              <p className="text-gray-600">{filteredAndSortedProjects.length} projects found</p>
            </div>
            
            {filteredAndSortedProjects.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No projects found matching your criteria.</p>
                <Button 
                  onClick={() => { setSearchTerm(''); setSelectedCategory('all'); setSelectedStatus('all'); }}
                  className="mt-4"
                  variant="outline"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedProjects.map((project) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="h-full hover:shadow-xl transition-shadow">
                      <CardHeader className="p-0">
                        {(project as any).afterImages && (project as any).afterImages.length > 0 && (
                          <div className="relative w-full h-48 rounded-t-lg overflow-hidden">
                            <Image
                              src={(project as any).afterImages[0]}
                              alt={project.title || 'Project image'}
                              fill
                              className="object-cover transition-transform duration-300 hover:scale-105"
                              priority={false}
                            />
                            <Badge className={`absolute top-2 left-2 ${getStatusColor(project.status || '')} text-white`}>
                              {project.status?.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                        )}
                      </CardHeader>
                      <CardContent className="p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{project.title}</h3>
                        <p className="text-gray-600 mb-4 text-sm line-clamp-3">{project.description}</p>
                        
                        <div className="space-y-2 mb-4">
                          {project.location && (
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="h-4 w-4 mr-2" />
                              {project.location}
                            </div>
                          )}
                          {project.budget && (
                            <div className="flex items-center text-sm text-gray-600">
                              <DollarSign className="h-4 w-4 mr-2" />
                              Budget: {formatBudget(project.budget)}
                            </div>
                          )}
                          {(project as any).startDate && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="h-4 w-4 mr-2" />
                              Started: {new Date((project as any).startDate).toLocaleDateString()}
                            </div>
                          )}
                          {(project as any).endDate && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="h-4 w-4 mr-2" />
                              Completed: {new Date((project as any).endDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>

                        {(project as any).clientName && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-500">Client: <span className="font-medium">{(project as any).clientName}</span></p>
                          </div>
                        )}

                        {project.testimonial && (
                          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 italic">"{project.testimonial}"</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <Link href={`/projects/${project.id}`}>
                            <Button
                              variant="outline"
                              className="flex items-center gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              View Details
                            </Button>
                          </Link>
                          {(project as any).beforeImages && (project as any).beforeImages.length > 0 && (
                            <Badge variant="secondary">
                              Before/After Available
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Features Section */}
          <section className="py-12 bg-white rounded-xl shadow-lg">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose BrightonHub for Your Project?</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                With years of experience and a track record of successful projects, 
                we deliver quality construction and renovation services that exceed expectations.
              </p>
            </div>
            <div className="grid md:grid-cols-4 gap-6 px-6">
              <div className="text-center">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Award Winning</h3>
                <p className="text-gray-600 text-sm">
                  Recognized for excellence in construction and design innovation
                </p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Expert Team</h3>
                <p className="text-gray-600 text-sm">
                  Skilled professionals with decades of combined experience
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">On-Time Delivery</h3>
                <p className="text-gray-600 text-sm">
                  Committed to meeting deadlines without compromising quality
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Quality Assurance</h3>
                <p className="text-gray-600 text-sm">
                  Rigorous quality control at every stage of construction
                </p>
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}