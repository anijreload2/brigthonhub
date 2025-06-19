'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Home, 
  Building, 
  Store, 
  Utensils, 
  ArrowRight, 
  ShoppingCart, 
  FolderOpen, 
  BookOpen, 
  Info, 
  Phone, 
  UserPlus, 
  Bell, 
  ChevronDown,
  Bot
} from 'lucide-react';
import { Navigation } from '@/components/navigation/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  backgroundUrl: string;
  ctaPrimary?: { text: string; url: string };
  ctaSecondary?: { text: string; url: string };
}

const defaultSlides: HeroSlide[] = [
  {
    id: '1',
    title: 'Transform Spaces',
    subtitle: 'Elevate Lives',
    description: 'Nigeria\'s premier multi-service platform for real estate, food services, marketplace, and project showcase.',
    backgroundUrl: 'https://i.pinimg.com/originals/e5/a9/35/e5a9357640e9e3d34de96ec98b1e5d12.jpg',
    ctaPrimary: { text: 'Explore Properties', url: '/properties' },
    ctaSecondary: { text: 'AI Assistant', url: '/ai-assistant' }
  },
  {
    id: '2',
    title: 'Premium Properties',
    subtitle: 'Across Nigeria',
    description: 'Discover exceptional real estate opportunities with our comprehensive property platform and expert guidance.',
    backgroundUrl: 'https://i.pinimg.com/originals/e7/70/f0/e770f095b5b68af0f219b03c40bff852.jpg',
    ctaPrimary: { text: 'View Properties', url: '/properties' },
    ctaSecondary: { text: 'Contact Agent', url: '/contact' }
  },
  {
    id: '3',
    title: 'Fresh Food Solutions',
    subtitle: 'Quality Assured',
    description: 'Bulk produce supply and professional catering services for businesses and events across Nigeria.',
    backgroundUrl: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    ctaPrimary: { text: 'Food Services', url: '/food' },
    ctaSecondary: { text: 'Get Quote', url: '/contact' }
  }
];

const HeroWithHeader: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCategory, setSearchCategory] = useState('all');

  const slides = defaultSlides;

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search logic here
  };

  const currentSlideData = slides[currentSlide];

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background with slides */}
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >            <Image
              src={slide.backgroundUrl}
              alt={slide.title}
              fill
              className="object-cover"
              priority={index === currentSlide}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60" />
          </div>
        ))}
      </div>      {/* Navigation */}
      <div className="absolute top-0 left-0 right-0 z-50">
        <Navigation />
      </div>

      {/* Hero Content */}
      <div className="relative z-40 flex items-center min-h-screen pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">            {/* Left Column - Hero Content */}
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="text-white space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="animate-float">                <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                  {currentSlideData.title}
                  <span className="block text-[#8CC63F] mt-2">
                    {currentSlideData.subtitle}
                  </span>
                </h1>
                  </div>
                </motion.div>                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <p className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-2xl">
                    {currentSlideData.description}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                {currentSlideData.ctaPrimary && (
                  <Button size="lg" className="bg-[#8CC63F] hover:bg-[#7ab82f] text-white text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-200">
                    <Link href={currentSlideData.ctaPrimary.url} className="flex items-center space-x-2">
                      <span>{currentSlideData.ctaPrimary.text}</span>
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </Button>
                )}
                {currentSlideData.ctaSecondary && (
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#005288] text-lg px-8 py-4">
                    <Link href={currentSlideData.ctaSecondary.url} className="flex items-center space-x-2">
                      <Bot className="w-5 h-5" />
                      <span>{currentSlideData.ctaSecondary.text}</span>
                    </Link>
                  </Button>                )}
                </div>
              </motion.div>
              </div>
            </motion.div>            {/* Right Column - Search Card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="flex justify-center lg:justify-end">
              <Card className="glass border-white/20 w-full max-w-md animate-float animation-delay-2000">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-white mb-2">Find Your Perfect Match</h3>
                    <p className="text-white/80">Search across all our services</p>
                  </div>

                  <form onSubmit={handleSearch} className="space-y-4">
                    <div>                      <select
                        value={searchCategory}
                        onChange={(e) => setSearchCategory(e.target.value)}
                        className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/70 focus:bg-white/30 focus:border-white/50 transition-all duration-200"
                        aria-label="Search category"
                      >
                        <option value="all" className="text-gray-900">All Services</option>
                        <option value="properties" className="text-gray-900">Properties</option>
                        <option value="food" className="text-gray-900">Food Services</option>
                        <option value="store" className="text-gray-900">Marketplace</option>
                        <option value="projects" className="text-gray-900">Projects</option>
                      </select>
                    </div>

                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="What are you looking for?"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/70 focus:bg-white/30 focus:border-white/50 transition-all duration-200"
                      />
                      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/70" />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-[#005288] hover:bg-[#004070] text-white py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      Search Now
                    </Button>
                  </form>

                  <div className="mt-6 flex justify-center space-x-4">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
                        <Building className="w-6 h-6 text-[#8CC63F]" />
                      </div>
                      <span className="text-white/80 text-sm">Properties</span>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
                        <Utensils className="w-6 h-6 text-[#8CC63F]" />
                      </div>
                      <span className="text-white/80 text-sm">Food</span>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
                        <Store className="w-6 h-6 text-[#8CC63F]" />
                      </div>
                      <span className="text-white/80 text-sm">Store</span>
                    </div>                  </div>
                </CardContent>
              </Card>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Slide Navigation */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50">
        <div className="flex items-center space-x-4">          <button
            onClick={prevSlide}
            className="p-2 glass rounded-full text-white hover:bg-white/20 transition-all duration-200"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <div className="flex space-x-2">            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentSlide ? 'bg-[#8CC63F]' : 'bg-white/50 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
            <button
            onClick={nextSlide}
            className="p-2 glass rounded-full text-white hover:bg-white/20 transition-all duration-200"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroWithHeader;
