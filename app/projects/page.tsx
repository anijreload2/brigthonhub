
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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

// Sample project categories
const sampleCategories: ProjectCategory[] = [
  {
    id: '1',
    name: 'Residential Construction',
    description: 'Home building and renovation projects',
    isActive: true
  },
  {
    id: '2',
    name: 'Commercial Construction',
    description: 'Office buildings and commercial spaces',
    isActive: true
  },
  {
    id: '3',
    name: 'Interior Design',
    description: 'Interior decoration and space planning',
    isActive: true
  },
  {
    id: '4',
    name: 'Renovation',
    description: 'Property renovation and remodeling',
    isActive: true
  }
];

// Sample projects
const sampleProjects: Project[] = [
  {
    id: '1',
    title: 'Luxury Villa in Lekki',
    description: 'Complete construction of a 5-bedroom luxury villa with modern amenities, swimming pool, and landscaped gardens.',
    categoryId: '1',
    beforeImages: [
      '{https://c8.alamy.com/comp/2BD88R2/empty-plot-of-land-at-potters-field-park-before-the-construction-of-one-tower-bridge-southwark-2BD88R2.jpg}',
      '{https://www.asanduff.com/wp-content/uploads/2019/05/site-preparation.jpg}'
    ],
    afterImages: [
      '{https://i.pinimg.com/originals/77/f8/d0/77f8d04d61381ed37d94c48279e60540.jpg}',
      '{https://i.ytimg.com/vi/yOorEdg7i4c/maxresdefault.jpg}',
      '{https://i.pinimg.com/originals/d4/93/81/d49381e9de81e4bffe392507b3ca6653.jpg}'
    ],
    status: ProjectStatus.COMPLETED,
    budget: 150000000,
    startDate: new Date('2023-01-15'),
    endDate: new Date('2023-12-20'),
    location: 'Lekki, Lagos',
    clientName: 'Mr. & Mrs. Adebayo',
    testimonial: 'BrightonHub exceeded our expectations. The quality of work and attention to detail was outstanding.',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    title: 'Corporate Office Complex',
    description: 'Modern 10-story office complex with state-of-the-art facilities, parking, and green building features.',
    categoryId: '2',
    beforeImages: [
      '{https://i.pinimg.com/originals/53/61/44/536144a2373cde70d9fc7dc67a6e512e.png}',
      '{http://jejenkins.com/uploads/images/_1000xAUTO_crop_top-center_75/IMG_2589.JPG}'
    ],
    afterImages: [
      '{https://as2.ftcdn.net/v2/jpg/05/78/84/03/1000_F_578840314_guNgsNtSjChdKDZPzkPREgpe5YXXiJsk.jpg}',
      '{https://i.pinimg.com/originals/73/07/f3/7307f32294eb23b5d3410658ab2f9f39.jpg}',
      '{https://i.pinimg.com/originals/a8/49/f2/a849f2354a5f1ce4f89e12d8dda43221.jpg}'
    ],
    status: ProjectStatus.COMPLETED,
    budget: 2500000000,
    startDate: new Date('2022-06-01'),
    endDate: new Date('2024-03-15'),
    location: 'Victoria Island, Lagos',
    clientName: 'TechCorp Nigeria Ltd',
    testimonial: 'Professional service delivery and excellent project management. Highly recommended.',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    title: 'Restaurant Interior Design',
    description: 'Complete interior design and fit-out of a high-end restaurant with contemporary African themes.',
    categoryId: '3',
    beforeImages: [
      '{https://i.pinimg.com/originals/5b/7d/4f/5b7d4fb890e75d6379f181545b2ca261.png}',
      '{https://i.pinimg.com/originals/18/fa/dd/18fadda31785cc5e442722b10da8c3f2.jpg}'
    ],
    afterImages: [
      '{https://i.pinimg.com/originals/1e/a5/c5/1ea5c5448ccce3f6fd27e5bb642650e3.jpg}',
      '{https://i.pinimg.com/originals/18/f8/26/18f8262341b337e7d3f714e41cef7a09.jpg}',
      '{https://i.pinimg.com/736x/d6/cf/d1/d6cfd1f5550ed5819509636defcfe96e.jpg}'
    ],
    status: ProjectStatus.COMPLETED,
    budget: 25000000,
    startDate: new Date('2023-08-01'),
    endDate: new Date('2023-11-30'),
    location: 'Ikeja, Lagos',
    clientName: 'Afro Cuisine Restaurant',
    testimonial: 'The design perfectly captures our vision. Our customers love the ambiance.',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '4',
    title: 'Residential Apartment Renovation',
    description: 'Complete renovation of a 3-bedroom apartment including kitchen, bathrooms, and living areas.',
    categoryId: '4',
    beforeImages: [
      '{https://i.pinimg.com/originals/95/1c/82/951c821f53763227f0352fe0c7ccb5ea.jpg}',
      '{https://i.pinimg.com/originals/72/b8/51/72b851578f184f0f2f5b6fddb8937aa5.jpg}'
    ],
    afterImages: [
      '{https://images.pexels.com/photos/6588599/pexels-photo-6588599.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260}',
      '{https://i.pinimg.com/originals/a6/98/03/a698032885ec57de1edfb680492f6353.jpg}',
      '{https://i.pinimg.com/originals/99/08/5c/99085ca38bab005bea47c338a0928d72.jpg}'
    ],
    status: ProjectStatus.IN_PROGRESS,
    budget: 8500000,
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-04-30'),
    location: 'Surulere, Lagos',
    clientName: 'Mrs. Folake Ogundimu',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export default function ProjectsPage() {
  const [categories] = useState<ProjectCategory[]>(sampleCategories);
  const [projects, setProjects] = useState<Project[]>(sampleProjects);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(sampleProjects);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    let filtered = projects;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(project => project.categoryId === selectedCategory);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(project => project.status === selectedStatus);
    }

    // Sort
    switch (sortBy) {
      case 'budget-low':
        filtered.sort((a, b) => (a.budget || 0) - (b.budget || 0));
        break;
      case 'budget-high':
        filtered.sort((a, b) => (b.budget || 0) - (a.budget || 0));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      default:
        break;
    }

    setFilteredProjects(filtered);
  }, [projects, searchTerm, selectedCategory, selectedStatus, sortBy]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.COMPLETED:
        return 'bg-green-500';
      case ProjectStatus.IN_PROGRESS:
        return 'bg-blue-500';
      case ProjectStatus.PLANNING:
        return 'bg-yellow-500';
      case ProjectStatus.ON_HOLD:
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.COMPLETED:
        return 'Completed';
      case ProjectStatus.IN_PROGRESS:
        return 'In Progress';
      case ProjectStatus.PLANNING:
        return 'Planning';
      case ProjectStatus.ON_HOLD:
        return 'On Hold';
      default:
        return status;
    }
  };

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
              Project Showcase
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Explore our portfolio of completed projects and get inspired for your next venture
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search projects by name, location, or type..."
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: Award, title: 'Projects Completed', value: '150+', color: 'text-green-500' },
              { icon: Users, title: 'Happy Clients', value: '120+', color: 'text-blue-500' },
              { icon: Clock, title: 'Years Experience', value: '15+', color: 'text-purple-500' },
              { icon: Star, title: 'Client Rating', value: '4.9/5', color: 'text-yellow-500' }
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
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
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

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="PLANNING">Planning</SelectItem>
                  <SelectItem value="ON_HOLD">On Hold</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="budget-low">Budget: Low to High</SelectItem>
                  <SelectItem value="budget-high">Budget: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-gray-600">
              {filteredProjects.length} projects found
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="card-hover border-0 shadow-lg overflow-hidden h-full">
                  {/* Before/After Images */}
                  <div className="relative h-64">
                    <div className="grid grid-cols-2 h-full">
                      <div className="relative">
                        <img
                          src={project.beforeImages[0]}
                          alt="Before"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 left-2">
                          <Badge className="bg-red-500 text-white text-xs">
                            Before
                          </Badge>
                        </div>
                      </div>
                      <div className="relative">
                        <img
                          src={project.afterImages[0]}
                          alt="After"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 right-2">
                          <Badge className="bg-green-500 text-white text-xs">
                            After
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="absolute top-3 left-3">
                      <Badge className={`${getStatusColor(project.status)} text-white`}>
                        {getStatusLabel(project.status)}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {project.title}
                      </h3>
                      
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {project.description}
                      </p>

                      <div className="space-y-3 mb-4">
                        {project.location && (
                          <div className="flex items-center text-gray-600">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span className="text-sm">{project.location}</span>
                          </div>
                        )}
                        
                        {project.budget && (
                          <div className="flex items-center text-gray-600">
                            <DollarSign className="w-4 h-4 mr-2" />
                            <span className="text-sm font-medium">{formatPrice(project.budget)}</span>
                          </div>
                        )}

                        {project.endDate && (
                          <div className="flex items-center text-gray-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span className="text-sm">
                              Completed: {new Date(project.endDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {project.testimonial && (
                        <div className="bg-gray-50 p-3 rounded-lg mb-4">
                          <p className="text-sm text-gray-700 italic line-clamp-2">
                            "{project.testimonial}"
                          </p>
                          {project.clientName && (
                            <p className="text-xs text-gray-600 mt-1 font-medium">
                              - {project.clientName}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <Button className="w-full btn-primary mt-auto">
                      <Eye className="w-4 h-4 mr-2" />
                      View Project Details
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria</p>
              <Button onClick={() => { 
                setSearchTerm(''); 
                setSelectedCategory('all'); 
                setSelectedStatus('all'); 
              }}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-heading font-bold text-gray-900 mb-4">
              Ready to Start Your Project?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Let us help you transform your vision into reality with our expert team and proven track record.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="btn-primary">
                Get Project Quote
              </Button>
              <Button size="lg" variant="outline">
                Schedule Consultation
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
