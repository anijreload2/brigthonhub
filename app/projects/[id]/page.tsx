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
  CheckCircle,
  Share2,
  Heart,
  ChevronLeft,
  ChevronRight,
  Building,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { BookmarkButton } from '@/components/ui/bookmark-button';

interface Project {
  id: string;
  title: string;
  description: string;
  specifications?: string;
  before_images: string[];
  after_images: string[];
  status: string;
  location?: string;
  team_members?: {
    name: string;
    role: string;
    phone?: string;
    email?: string;
  }[];
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  contact_address?: string;
  reviews?: {
    id: string;
    rating: number;
    comment: string;
    author: string;
    date: string;
  }[];
  is_active: boolean;
  created_at: string;
}

interface ProjectDetailPageProps {
  params: { id: string };
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {const [project, setProject] = useState<Project | null>(null);
  const [relatedProjects, setRelatedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'team' | 'reviews'>('description');  const [activeImageTab, setActiveImageTab] = useState<'before' | 'after'>('before');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

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
  }, [params.id]);  const getCurrentImages = () => {
    if (!project) return [];
    const images = activeImageTab === 'before' ? project.before_images : project.after_images;
    return images || [];
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
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'planning': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/contact-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: contactForm.name,
          email: contactForm.email,
          phone: contactForm.phone,
          subject: `Project Inquiry: ${project?.title}`,
          message: contactForm.message,
          item_type: 'project',
          item_id: project?.id,
          message_type: 'inquiry',
          recipient_email: project?.contact_email || null
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      alert('Message sent successfully! The project team will get back to you soon.');
      setContactForm({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      alert('Failed to send message. Please try again.');
    }
  };

  const getProgressPercentage = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 100;
      case 'in-progress': return 60;
      case 'planning': return 20;
      default: return 0;
    }
  };  // Reset image index when switching image tabs
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [activeImageTab]);

  // Ensure image index is within bounds when images change
  useEffect(() => {
    const images = getCurrentImages();
    if (images.length > 0 && currentImageIndex >= images.length) {
      setCurrentImageIndex(0);
    }
  }, [project, activeImageTab, currentImageIndex]);
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

      <div className="container mx-auto px-4 py-8">        {/* Project Header */}
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
              </div>
            </div>
            <div className="mt-4 md:mt-0 text-right">
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Created: {new Date(project.created_at).toLocaleDateString()}</span>
                </div>
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
                      variant={activeImageTab === 'before' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveImageTab('before')}
                    >
                      Before ({project.before_images?.length || 0})
                    </Button>
                    <Button
                      variant={activeImageTab === 'after' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveImageTab('after')}
                    >
                      After ({project.after_images?.length || 0})
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
                        alt={`${project.title} - ${activeImageTab}`}
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
                            {currentImages.map((_: any, index: number) => (
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
                          {activeImageTab === 'before' ? 'Before' : 'After'}
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
                      {currentImages.map((image: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                            index === currentImageIndex ? 'border-primary' : 'border-gray-200'
                          }`}
                          aria-label={`View ${activeImageTab} image ${index + 1}`}
                        >
                          <Image
                            src={image}
                            alt={`${project.title} ${activeImageTab} ${index + 1}`}
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

            {/* Four-Tab Content Section */}
            <Card className="mt-6">
              <CardHeader>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={activeTab === 'description' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTab('description')}
                    className="flex-1 min-w-[120px]"
                  >
                    Description
                  </Button>
                  <Button
                    variant={activeTab === 'specifications' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTab('specifications')}
                    className="flex-1 min-w-[120px]"
                  >
                    Specifications
                  </Button>
                  <Button
                    variant={activeTab === 'team' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTab('team')}
                    className="flex-1 min-w-[120px]"
                  >
                    Team Info
                  </Button>
                  <Button
                    variant={activeTab === 'reviews' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTab('reviews')}
                    className="flex-1 min-w-[120px]"
                  >
                    Reviews
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {activeTab === 'description' && (
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed">{project.description}</p>
                  </div>
                )}

                {activeTab === 'specifications' && (
                  <div className="prose max-w-none">
                    {project.specifications ? (
                      <p className="text-gray-700 leading-relaxed">{project.specifications}</p>
                    ) : (
                      <p className="text-gray-500 italic">No specifications available for this project.</p>
                    )}
                  </div>
                )}

                {activeTab === 'team' && (
                  <div className="space-y-4">                    {project.team_members && project.team_members.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {project.team_members.map((member: any, index: number) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-semibold">{member.name}</h4>
                                <p className="text-sm text-gray-600">{member.role}</p>
                              </div>
                            </div>
                            <div className="space-y-2 text-sm">
                              {member.phone && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Phone:</span>
                                  <a href={`tel:${member.phone}`} className="text-blue-600 hover:underline">
                                    {member.phone}
                                  </a>
                                </div>
                              )}
                              {member.email && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Email:</span>
                                  <a href={`mailto:${member.email}`} className="text-blue-600 hover:underline">
                                    {member.email}
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No team information available for this project.</p>
                    )}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-4">
                    {project.reviews && project.reviews.length > 0 ? (
                      project.reviews.map((review) => (
                        <div key={review.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold">{review.author}</span>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                                  />
                                ))}
                              </div>
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(review.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 italic">No reviews available for this project.</p>
                    )}
                  </div>
                )}
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
                <div className="flex justify-between">
                  <span className="text-gray-600">Created</span>
                  <span className="font-medium">
                    {new Date(project.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            {(project.contact_name || project.contact_phone || project.contact_email) && (
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">                  {project.contact_name && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Contact Person</span>
                      <span className="font-medium">{project.contact_name}</span>
                    </div>
                  )}
                  {project.contact_phone && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone</span>
                      <a 
                        href={`tel:${project.contact_phone}`} 
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {project.contact_phone}
                      </a>
                    </div>
                  )}
                  {project.contact_email && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email</span>
                      <a 
                        href={`mailto:${project.contact_email}`} 
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {project.contact_email}
                      </a>
                    </div>
                  )}
                  {project.contact_address && (
                    <div>
                      <span className="text-gray-600 block mb-1">Address</span>
                      <span className="font-medium text-sm">{project.contact_address}</span>
                    </div>
                  )}
                </CardContent>              </Card>
            )}

            {/* Action Buttons */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <BookmarkButton
                      itemId={project.id}
                      itemType="project"
                      title={project.title}
                      className="flex-1"
                      variant="outline"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: project.title,
                            text: `Check out this project: ${project.title}`,
                            url: window.location.href,
                          });
                        } else {
                          navigator.clipboard.writeText(window.location.href);
                          alert('Link copied to clipboard!');
                        }
                      }}
                      className="flex-1"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Project Team</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Name
                    </label>
                    <Input
                      id="name"
                      placeholder="Enter your name"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Phone
                    </label>
                    <Input
                      id="phone"
                      placeholder="Enter your phone number"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      placeholder="Tell us about your project requirements..."
                      value={contactForm.message}
                      onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                      rows={4}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Send Message
                  </Button>
                </form>
                <div className="mt-4 pt-4 border-t text-center">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <Award className="w-4 h-4" />
                    <span>Professional Service Guaranteed</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>        {/* Related Projects */}
        {relatedProjects.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Related Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProjects.map((relatedProject) => (
                <Card key={relatedProject.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="relative h-48">
                      <Image
                        src={relatedProject.after_images?.[0] || relatedProject.before_images?.[0] || '/placeholder.jpg'}
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
                        <div className="flex items-center space-x-1 text-sm text-gray-600 mb-3">
                          <MapPin className="w-3 h-3" />
                          <span className="line-clamp-1">{relatedProject.location}</span>
                        </div>
                      )}
                      <div className="flex justify-center">
                        <Link href={`/projects/${relatedProject.id}`}>
                          <Button size="sm" variant="outline" className="w-full">View Project</Button>
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
