
'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Building, 
  Utensils, 
  ShoppingCart, 
  Briefcase, 
  Mail, 
  Phone, 
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin
} from 'lucide-react';

const footerSections = [
  {
    title: 'Services',
    links: [
      { name: 'Real Estate', href: '/properties', icon: Building },
      { name: 'Food Services', href: '/food', icon: Utensils },
      { name: 'Marketplace', href: '/store', icon: ShoppingCart },
      { name: 'Project Showcase', href: '/projects', icon: Briefcase },
    ]
  },
  {
    title: 'Company',
    links: [
      { name: 'About Us', href: '/about' },
      { name: 'Blog', href: '/blog' },
      { name: 'AI Assistant', href: '/ai-assistant' },
    ]
  },
  {
    title: 'Support',
    links: [
      { name: 'Contact Us', href: '/contact' },
      { name: 'Help Center', href: '/help' },
    ]
  }
];

const socialLinks = [
  { name: 'Facebook', href: '#', icon: Facebook },
  { name: 'Twitter', href: '#', icon: Twitter },
  { name: 'Instagram', href: '#', icon: Instagram },
  { name: 'LinkedIn', href: '#', icon: Linkedin },
];

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-brand-gradient rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="text-xl font-heading font-bold">
                BrightonHub
              </span>
            </Link>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Transform spaces and elevate lives through exceptional service delivery across Nigeria's premier multi-service platform.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-secondary" />
                <span className="text-sm text-gray-300">info@brightonhub.ng</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-secondary" />
                <span className="text-sm text-gray-300">+234 800 000 0000</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-secondary" />
                <span className="text-sm text-gray-300">Lagos, Nigeria</span>
              </div>
            </div>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-lg font-semibold mb-4 text-white">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => {
                  const Icon = 'icon' in link ? link.icon : null;
                  return (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="flex items-center space-x-2 text-gray-300 hover:text-secondary transition-colors duration-200"
                      >
                        {Icon && <Icon className="w-4 h-4" />}
                        <span className="text-sm">{link.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-sm text-gray-400">
              © {new Date().getFullYear()} Brighton-Hedge Limited. All rights reserved.
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <Link
                    key={social.name}
                    href={social.href}
                    className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-secondary transition-colors duration-200"
                    aria-label={social.name}
                  >
                    <Icon className="w-4 h-4" />
                  </Link>
                );
              })}
            </div>

            {/* Nigerian Flag Colors */}
            <div className="flex items-center space-x-1">
              <div className="w-3 h-6 bg-green-600 rounded-sm"></div>
              <div className="w-3 h-6 bg-white rounded-sm"></div>
              <div className="w-3 h-6 bg-green-600 rounded-sm"></div>
              <span className="text-xs text-gray-400 ml-2">Made in Nigeria</span>
            </div>
          </div>
          
          {/* Built by note */}
          <div className="text-center mt-6 pt-4 border-t border-gray-800">
            <p className="text-xs text-gray-500">
              built by seededlifeco, email.. seededlifeco@gmail.com
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
