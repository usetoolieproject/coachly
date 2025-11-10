import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MessageCircle, Clock } from 'lucide-react';

const Contact = () => {
  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
    
    const hadDarkHtml = document.documentElement.classList.contains('dark');
    const hadDarkBody = document.body.classList.contains('dark');
    if (hadDarkHtml) document.documentElement.classList.remove('dark');
    if (hadDarkBody) document.body.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
    return () => {
      if (hadDarkHtml) document.documentElement.classList.add('dark');
      if (hadDarkBody) document.body.classList.add('dark');
      document.documentElement.style.colorScheme = hadDarkHtml ? 'dark' : 'light';
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <Link to="/" className="text-2xl font-bold text-purple-600 hover:text-purple-700 transition-colors">
            Coachly
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-6">
          Contact Us
        </h1>
        
        <p className="text-lg sm:text-xl text-gray-600 mb-12">
          We're here to help! Get in touch with the Coachly team for support, questions, or feedback.
        </p>

        {/* Contact Methods */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-purple-50 rounded-2xl p-6 sm:p-8 border border-purple-100">
            <Mail className="w-8 h-8 text-purple-600 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Email Support</h2>
            <p className="text-gray-600 mb-4">
              Send us an email and we'll get back to you within 24 hours.
            </p>
            <a 
              href="mailto:support@usecoachly.com" 
              className="text-purple-600 font-semibold hover:text-purple-700 transition-colors"
            >
              support@usecoachly.com
            </a>
          </div>

          <div className="bg-blue-50 rounded-2xl p-6 sm:p-8 border border-blue-100">
            <MessageCircle className="w-8 h-8 text-blue-600 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">General Inquiries</h2>
            <p className="text-gray-600 mb-4">
              Have questions about Coachly? We're happy to help!
            </p>
            <a 
              href="mailto:hello@usecoachly.com" 
              className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
            >
              hello@usecoachly.com
            </a>
          </div>
        </div>

        {/* Response Time */}
        <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 mb-12 border border-gray-200">
          <Clock className="w-8 h-8 text-gray-600 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Response Time</h2>
          <p className="text-gray-600">
            Our team typically responds to all inquiries within 24-48 hours during business days. 
            For urgent matters, please include "URGENT" in your subject line.
          </p>
        </div>

        {/* Common Questions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="border-l-4 border-purple-600 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">How do I get started with Coachly?</h3>
              <p className="text-gray-600">
                Simply sign up for an account at <Link to="/signup" className="text-purple-600 hover:underline">coachly.com/signup</Link> and 
                start building your coaching business. Our platform includes everything you need: courses, community, video hosting, and more.
              </p>
            </div>
            <div className="border-l-4 border-purple-600 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">
                We accept all major credit cards and debit cards through our secure payment processor. 
                All payments are processed securely and encrypted.
              </p>
            </div>
            <div className="border-l-4 border-purple-600 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">Can I try Coachly before purchasing?</h3>
              <p className="text-gray-600">
                Yes! We offer a trial period for new users. You can explore all features and see how Coachly 
                can transform your coaching business before making a commitment.
              </p>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="pt-8 border-t border-gray-200">
          <Link 
            to="/" 
            className="inline-flex items-center text-purple-600 hover:text-purple-700 font-semibold transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Contact;

