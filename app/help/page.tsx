import Link from 'next/link';
import { ArrowLeft, Search, HelpCircle, BookOpen, MessageCircle } from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Help Center</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Find answers to common questions and get help with using BrightonHub.
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for help articles..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Quick Help Categories */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
            <BookOpen className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Getting Started</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Learn the basics of using BrightonHub</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
            <HelpCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Account & Settings</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Manage your account and preferences</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
            <MessageCircle className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Vendor Support</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Help for business owners and vendors</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
            <Search className="w-12 h-12 text-orange-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Technical Issues</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Troubleshoot common problems</p>
          </div>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-8">
          {/* Getting Started */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Getting Started</h2>
            <div className="space-y-6">
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">How do I create an account?</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Click on the "Sign Up" button in the top right corner of the homepage. Fill in your details and verify your email address to get started.
                </p>
              </div>
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">What services does BrightonHub offer?</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  BrightonHub offers property listings, food and dining discovery, professional services, e-commerce marketplace, AI assistant, and community features.
                </p>
              </div>
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Is BrightonHub free to use?</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Basic browsing and searching is free. Some premium features and vendor accounts may have fees. Check our pricing page for details.
                </p>
              </div>
            </div>
          </div>

          {/* Account Management */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Account & Settings</h2>
            <div className="space-y-6">
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">How do I reset my password?</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Click on "Forgot Password" on the login page and enter your email address. You'll receive a password reset link via email.
                </p>
              </div>
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">How do I update my profile information?</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Go to your profile page after logging in. Click "Edit Profile" to update your personal information, contact details, and preferences.
                </p>
              </div>
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">How do I delete my account?</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Contact our support team at support@brightonhub.ng to request account deletion. Please note this action is irreversible.
                </p>
              </div>
            </div>
          </div>

          {/* Vendor Support */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Vendor Support</h2>
            <div className="space-y-6">
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">How do I become a vendor?</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Visit our <Link href="/vendor" className="text-blue-600 hover:underline">vendor registration page</Link> and complete the application form. Our team will review your application within 5-7 business days.
                </p>
              </div>
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">What are the vendor requirements?</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  You need a valid business registration, tax identification number, and must provide quality products or services. Full requirements are listed in the vendor application.
                </p>
              </div>
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">How do I manage my listings?</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Use your vendor dashboard to add, edit, or remove listings. You can also track orders, manage inventory, and view analytics.
                </p>
              </div>
            </div>
          </div>

          {/* Technical Support */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Technical Support</h2>
            <div className="space-y-6">
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">The website is loading slowly</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Try clearing your browser cache, disable browser extensions, or try using a different browser. Contact support if the issue persists.
                </p>
              </div>
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">I can't upload images</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Ensure your images are in supported formats (JPG, PNG, WebP) and under 5MB in size. Check your internet connection and try again.
                </p>
              </div>
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">The AI assistant isn't responding</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Make sure you're logged in and have a stable internet connection. The AI assistant requires registration to function properly.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-8 mt-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Still Need Help?</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact" 
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Contact Support
            </Link>
            <a 
              href="mailto:support@brightonhub.ng" 
              className="inline-flex items-center px-6 py-3 border border-blue-600 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              Email Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
