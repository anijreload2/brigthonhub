import Link from 'next/link';
import { ArrowLeft, Users, Target, Award, Heart } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">About BrightonHub</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Connecting communities, empowering businesses, and building the future of digital commerce in Nigeria.
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center mb-6">
            <Target className="w-8 h-8 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Our Mission</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
            BrightonHub is dedicated to creating a comprehensive digital ecosystem that connects local businesses, 
            service providers, and communities across Nigeria. We believe in the power of technology to transform 
            how people discover, interact with, and support local businesses.
          </p>
        </div>

        {/* What We Offer */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">What We Offer</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Property Listings</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Find and list properties across Nigeria with detailed information and high-quality images.
              </p>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Food & Dining</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Discover local restaurants, food vendors, and culinary experiences in your area.
              </p>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Professional Services</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Connect with skilled professionals and service providers for all your needs.
              </p>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">E-commerce Store</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Shop from local vendors and discover unique products from across Nigeria.
              </p>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">AI Assistant</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Get personalized recommendations and answers to your questions about local services.
              </p>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Community Hub</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Stay connected with your community through our blog and messaging features.
              </p>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center mb-6">
            <Heart className="w-8 h-8 text-red-500 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Our Values</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Community First</h3>
              <p className="text-gray-600 dark:text-gray-300">
                We prioritize the needs of local communities and work to strengthen connections between neighbors and businesses.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Quality & Trust</h3>
              <p className="text-gray-600 dark:text-gray-300">
                We maintain high standards for all listings and services to ensure users can trust what they find on our platform.
              </p>
            </div>
            <div>
              <h3 className="font-semibent text-gray-900 dark:text-white mb-3">Innovation</h3>
              <p className="text-gray-600 dark:text-gray-300">
                We continuously improve our platform with new features and technologies to better serve our users.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Accessibility</h3>
              <p className="text-gray-600 dark:text-gray-300">
                We believe everyone should have access to quality services and opportunities, regardless of their background.
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <div className="flex items-center mb-6">
            <Users className="w-8 h-8 text-green-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Our Team</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-6">
            BrightonHub is built by a passionate team of developers, designers, and community advocates who understand 
            the unique challenges and opportunities in the Nigerian market. We're committed to creating solutions that 
            truly serve the needs of our users.
          </p>
          <div className="text-center">
            <Link 
              href="/contact" 
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
