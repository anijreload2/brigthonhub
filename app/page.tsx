
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  Building, 
  Utensils, 
  ShoppingCart, 
  Briefcase, 
  ArrowRight,
  Star,
  Users,
  Award,
  TrendingUp,
  CheckCircle,
  MapPin,
  Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import HeroWithHeader from '@/components/sections/hero-with-header';
import FeaturedProperties from '@/components/sections/featured-properties';
import FeaturedFoodMarketplace from '@/components/sections/featured-food-marketplace';
import FeaturedProjects from '@/components/sections/featured-projects';

interface Testimonial {
  id?: string;
  name: string;
  role: string;
  company?: string;
  content: string;
  rating: number;
  avatar_url?: string;
  location?: string;
}

const services = [
  {
    title: 'Real Estate',
    description: 'Discover premium properties across Nigeria with our comprehensive real estate platform.',
    icon: Building,
    href: '/properties',
    color: 'bg-blue-500',
    features: ['Property Listings', 'Virtual Tours', 'Market Analysis', 'Agent Support']
  },
  {
    title: 'Food Services',
    description: 'Bulk produce supply and professional catering services for all your needs.',
    icon: Utensils,
    href: '/food',
    color: 'bg-green-500',
    features: ['Bulk Produce', 'Fresh Delivery', 'Quality Assured', 'Competitive Pricing']
  },
  {
    title: 'Marketplace',
    description: 'Office furniture, building materials, and equipment supply in one place.',
    icon: ShoppingCart,
    href: '/store',
    color: 'bg-orange-500',
    features: ['Office Furniture', 'Building Materials', 'Equipment Supply', 'Bulk Orders']
  },
  {
    title: 'Project Showcase',
    description: 'Explore our portfolio of completed projects and get inspired for your next venture.',
    icon: Briefcase,
    href: '/projects',
    color: 'bg-purple-500',
    features: ['Portfolio Gallery', 'Before & After', 'Project Management', 'Client Testimonials']
  }
];

const stats = [
  { label: 'Happy Clients', value: '', icon: Users },
  { label: 'Projects Completed', value: '', icon: Award },
  { label: 'Years Experience', value: '', icon: TrendingUp },
  { label: 'Cities Served', value: '', icon: MapPin }
];

export default function HomePage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);

  // Fetch testimonials from API
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch('/api/testimonials');
        if (response.ok) {
          const data = await response.json();

          
          // Filter for featured testimonials or take first 3
          const displayTestimonials = data.testimonials
            .filter((t: any) => t.is_featured)
            .slice(0, 3);
          
          // If less than 3 featured, fill with non-featured
          if (displayTestimonials.length < 3) {
            const remaining = data.testimonials
              .filter((t: any) => !t.is_featured)
              .slice(0, 3 - displayTestimonials.length);
            displayTestimonials.push(...remaining);
          }
          

          setTestimonials(displayTestimonials);
        } else {

          // Only use fallback if API fails
          setTestimonials([]);
        }
      } catch (error) {

        // Only use fallback if there's an actual error
        setTestimonials([]);
      } finally {
        setTestimonialsLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section with Integrated Header */}
      <HeroWithHeader />

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    {stat.value && (
                      <div className="text-3xl font-bold text-primary mb-2 count-up">
                        {stat.value}
                      </div>
                    )}
                    <div className="text-gray-600 font-medium">
                      {stat.label}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
                Our Services
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Comprehensive solutions for all your business and personal needs across Nigeria
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full card-hover border-0 shadow-lg">
                    <CardHeader className="pb-4">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className={`w-12 h-12 ${service.color} rounded-lg flex items-center justify-center`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-xl font-bold text-gray-900">
                            {service.title}
                          </CardTitle>
                        </div>
                      </div>
                      <CardDescription className="text-gray-600 text-base leading-relaxed">
                        {service.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 mb-6">
                        {service.features.map((feature) => (
                          <li key={feature} className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-secondary" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button asChild className="w-full btn-primary">
                        <Link href={service.href} className="flex items-center justify-center space-x-2">
                          <span>Explore {service.title}</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <FeaturedProperties />

      {/* Featured Food Marketplace Section */}
      <FeaturedFoodMarketplace />

      {/* Featured Projects Section */}
      <FeaturedProjects />

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
                What Our Clients Say
              </h2>
              <p className="text-xl text-gray-600">
                Trusted by thousands of satisfied customers across Nigeria
              </p>
            </div>
          </motion.div>

          {testimonialsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading testimonials...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id || testimonial.name || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-0 shadow-lg">
                  <CardContent className="p-6">
                    {(testimonial.rating || 0) > 0 && (
                      <div className="flex items-center space-x-1 mb-4">
                        {[...Array(testimonial.rating || 5)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    )}
                    <p className="text-gray-700 mb-6 leading-relaxed">
                      "{testimonial.content || 'Great service!'}"
                    </p>
                    <div className="flex items-center space-x-3">
                      {testimonial.avatar_url ? (
                        <img 
                          src={testimonial.avatar_url} 
                          alt={testimonial.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {(testimonial.name || '?').charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-gray-900">
                          {testimonial.name || 'Anonymous'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {testimonial.role || 'Customer'}
                          {(testimonial.company || testimonial.location) && ' • '}
                          {testimonial.company || testimonial.location}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-brand-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="text-white">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
                Ready to Transform Your Business?
              </h2>
              <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
                Join thousands of satisfied customers and experience the BrightonHub difference today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-primary hover:bg-gray-100 text-lg px-8 py-4">
                  <Link href="/auth/register" className="flex items-center space-x-2">
                    <span>Get Started</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary text-lg px-8 py-4">
                  <Link href="/contact" className="flex items-center space-x-2">
                    <Phone className="w-5 h-5" />
                    <span>Contact Us</span>
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
