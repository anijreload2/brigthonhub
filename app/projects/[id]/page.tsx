'use client';

import React, { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  Star,
  Quote,
  CheckCircle,
  Clock,
  DollarSign,
  Share2,
  Heart,
  ChevronLeft,
  ChevronRight,
  Building,
  Award,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { CURRENCY } from '@/lib/constants';

interface Project {
  id: string;
  title: string;
  description: string;
  beforeImages: string[];
  afterImages: string[];
  status: string;
  budget?: number;
  startDate?: string;
  endDate?: string;
  location?: string;
  clientName?: string;
  testimonial?: string;
  isActive: boolean;
  createdAt: string;
}

interface ProjectDetailPageProps {
  params: { id: string };
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [relatedProjects, setRelatedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'before' | 'after'>('before');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${params.id}`);
        if (!response.ok) {
          if (response.status === 404) {
            notFound();
          }
          throw new Error('Failed to fetch project');
        }
        const data = await response.json();
        setProject(data.project);
        setRelatedProjects(data.relatedProjects || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [params.id]);

  const getCurrentImages = () => {
    if (!project) return [];
    return activeTab === 'before' ? project.beforeImages : project.afterImages;
  };

  const nextImage = () => {
    const images = getCurrentImages();
    if (images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    const images = getCurrentImages();
    if (images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? images.length - 1 : prev - 1
      );
    }
  };

  const formatBudget = (budget: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(budget);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'planning': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getProgressPercentage = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 100;
      case 'in-progress': return 60;
      case 'planning': return 20;
      default: return 0;
    }
  };

  // Reset image index when switching tabs
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Project Not Found</h1>
          <p className="text-gray-600 mb-8">The project you're looking for doesn't exist.</p>
          <Link href="/projects">
            <Button>Back to Projects</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentImages = getCurrentImages();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/projects" className="flex items-center space-x-2 text-gray-600 hover:text-primary">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Projects</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => setIsLiked(!isLiked)}>
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Project Header */}
        <div className="bg-white rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.title}</h1>
              {project.location && (
                <div className="flex items-center space-x-2 text-gray-600 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>{project.location}</span>
                </div>
              )}
              <div className="flex items-center space-x-4">
                <Badge className={`${getStatusColor(project.status)} text-white`}>
                  {project.status}
                </Badge>
                {project.clientName && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <User className="w-4 h-4" />
                    <span>Client: {project.clientName}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4 md:mt-0 text-right">
              {project.budget && (
                <div className="text-2xl font-bold text-primary mb-2">
                  {formatBudget(project.budget)}
                </div>
              )}
              <div className="space-y-1 text-sm text-gray-600">
                {project.startDate && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Started: {new Date(project.startDate).toLocaleDateString()}</span>
                  </div>
                )}
                {project.endDate && (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Completed: {new Date(project.endDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Project Progress</span>
              <span className="font-medium">{getProgressPercentage(project.status)}%</span>
            </div>
            <Progress value={getProgressPercentage(project.status)} className="h-2" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image Gallery */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Project Gallery</CardTitle>
                  <div className="flex space-x-2">
                    <Button
                      variant={activeTab === 'before' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveTab('before')}
                    >
                      Before ({project.beforeImages.length})
                    </Button>
                    <Button
                      variant={activeTab === 'after' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveTab('after')}
                    >
                      After ({project.afterImages.length})
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative h-96 md:h-[500px]">
                  {currentImages.length > 0 ? (
                    <>
                      <Image
                        src={currentImages[currentImageIndex]}
                        alt={`${project.title} - ${activeTab}`}
                        fill
                        className="object-cover"
                      />
                      {currentImages.length > 1 && (
                        <>
                          <button
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                            aria-label="Previous image"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                            aria-label="Next image"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                            {currentImages.map((_, index) => (
                              <button
                                key={index}
                                onClick={() => setCurrentImageIndex(index)}
                                className={`w-3 h-3 rounded-full ${
                                  index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                                }`}
                                aria-label={`View image ${index + 1}`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                      <div className="absolute top-4 right-4">
                        <Badge variant="secondary" className="bg-black/50 text-white">
                          {activeTab === 'before' ? 'Before' : 'After'}
                        </Badge>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <Building className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>
                
                {/* Thumbnail Gallery */}
                {currentImages.length > 1 && (
                  <div className="p-4 border-t">
                    <div className="flex space-x-2 overflow-x-auto">
                      {currentImages.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                            index === currentImageIndex ? 'border-primary' : 'border-gray-200'
                          }`}
                          aria-label={`View ${activeTab} image ${index + 1}`}
                        >
                          <Image
                            src={image}
                            alt={`${project.title} ${activeTab} ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Project Description */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Project Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed">{project.description}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Project Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Project ID</span>
                  <span className="font-medium">#{project.id.slice(0, 8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <Badge className={`${getStatusColor(project.status)} text-white`}>
                    {project.status}
                  </Badge>
                </div>
                {project.budget && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Budget</span>
                    <span className="font-medium">{formatBudget(project.budget)}</span>
                  </div>
                )}
                {project.startDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Start Date</span>
                    <span className="font-medium">
                      {new Date(project.startDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {project.endDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">End Date</span>
                    <span className="font-medium">
                      {new Date(project.endDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Client Testimonial */}
            {project.testimonial && (
              <Card>
                <CardHeader>
                  <CardTitle>Client Testimonial</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Quote className="w-8 h-8 text-primary" />
                    <blockquote className="text-gray-700 italic leading-relaxed">
                      "{project.testimonial}"
                    </blockquote>
                    {project.clientName && (
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{project.clientName}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Get Quote CTA */}
            <Card>
              <CardHeader>
                <CardTitle>Interested in Similar Work?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Get a custom quote for your project based on this completed work.
                </p>
                <Button className="w-full mb-3">
                  Get Free Quote
                </Button>
                <Button variant="outline" className="w-full">
                  Contact Our Team
                </Button>
                <div className="mt-4 pt-4 border-t text-center">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <Award className="w-4 h-4" />
                    <span>Satisfaction Guaranteed</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Projects */}
        {relatedProjects.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Related Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProjects.map((relatedProject) => (
                <Card key={relatedProject.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="relative h-48">
                      <Image
                        src={relatedProject.afterImages[0] || relatedProject.beforeImages[0] || '/placeholder.jpg'}
                        alt={relatedProject.title}
                        fill
                        className="object-cover rounded-t-lg"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className={`${getStatusColor(relatedProject.status)} text-white`}>
                          {relatedProject.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-2 line-clamp-2">{relatedProject.title}</h3>
                      {relatedProject.location && (
                        <div className="flex items-center space-x-1 text-sm text-gray-600 mb-2">
                          <MapPin className="w-3 h-3" />
                          <span className="line-clamp-1">{relatedProject.location}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        {relatedProject.budget && (
                          <span className="font-bold text-primary text-sm">
                            {formatBudget(relatedProject.budget)}
                          </span>
                        )}
                        <Link href={`/projects/${relatedProject.id}`}>
                          <Button size="sm" variant="outline">View</Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
