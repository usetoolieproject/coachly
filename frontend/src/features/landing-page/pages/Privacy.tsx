import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Privacy = () => {
  const navigate = useNavigate();

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
          Privacy Policy
        </h1>
        
        <p className="text-sm text-gray-500 mb-8">
          Last updated: 11/14/2025 | This website is operated by Einstein Design Ltd., registered in the United Kingdom.
        </p>

        <div className="prose prose-lg max-w-none">
          {/* Introduction */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Coachly ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
              explains how we collect, use, disclose, and safeguard your information when you use our platform 
              at usecoachly.com. Please read this policy carefully to understand our practices regarding your 
              personal data.
            </p>
            <p className="text-gray-700 leading-relaxed">
              By using Coachly, you agree to the collection and use of information in accordance with this policy. 
              If you do not agree with our practices, please do not use our services.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Personal Information</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2 ml-4">
              <li>Name, email address, and contact information</li>
              <li>Account credentials and profile information</li>
              <li>Payment and billing information (processed securely through third-party payment processors)</li>
              <li>Content you create, including courses, community posts, and videos</li>
              <li>Communication preferences and support requests</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Automatically Collected Information</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We automatically collect certain information when you use our platform:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2 ml-4">
              <li>Device information (IP address, browser type, operating system)</li>
              <li>Usage data (pages visited, features used, time spent)</li>
              <li>Cookies and similar tracking technologies</li>
              <li>Log files and analytics data</li>
            </ul>
          </section>

          {/* How We Use Information */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2 ml-4">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send you technical notices, updates, and support messages</li>
              <li>Respond to your comments, questions, and requests</li>
              <li>Monitor and analyze trends, usage, and activities</li>
              <li>Detect, prevent, and address technical issues and fraudulent activity</li>
              <li>Personalize your experience and deliver relevant content</li>
              <li>Comply with legal obligations and enforce our terms</li>
            </ul>
          </section>

          {/* Information Sharing */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Information Sharing and Disclosure</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We do not sell your personal information. We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2 ml-4">
              <li><strong>Service Providers:</strong> With trusted third-party service providers who assist us in operating our platform</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              <li><strong>With Your Consent:</strong> When you explicitly agree to share your information</li>
            </ul>
          </section>

          {/* Data Security */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We implement industry-standard security measures to protect your information, including:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2 ml-4">
              <li>Encryption of data in transit and at rest</li>
              <li>Secure authentication and access controls</li>
              <li>Regular security audits and assessments</li>
              <li>Compliance with security best practices</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              However, no method of transmission over the Internet is 100% secure. While we strive to protect 
              your information, we cannot guarantee absolute security.
            </p>
          </section>

          {/* Your Rights */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Privacy Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Depending on your location, you may have the following rights:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2 ml-4">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Rectification:</strong> Correct inaccurate or incomplete information</li>
              <li><strong>Erasure:</strong> Request deletion of your personal data</li>
              <li><strong>Restriction:</strong> Limit how we process your information</li>
              <li><strong>Portability:</strong> Receive your data in a structured format</li>
              <li><strong>Objection:</strong> Object to certain processing activities</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              To exercise these rights, please contact us at <a href="mailto:privacy@usecoachly.com" className="text-purple-600 hover:underline">privacy@usecoachly.com</a>.
            </p>
          </section>

          {/* Cookies */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies and Tracking</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use cookies and similar technologies to enhance your experience, analyze usage, and assist with 
              marketing efforts. You can control cookies through your browser settings, though this may affect 
              platform functionality.
            </p>
          </section>

          {/* Children's Privacy */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Coachly is not intended for users under the age of 18. We do not knowingly collect personal 
              information from children. If you believe we have collected information from a child, please 
              contact us immediately.
            </p>
          </section>

          {/* Changes to Policy */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to This Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
              the new policy on this page and updating the "Last updated" date. You are advised to review this 
              policy periodically.
            </p>
          </section>

          {/* Contact */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have questions about this Privacy Policy, please contact us:
            </p>
            <p className="text-gray-700 leading-relaxed">
              Email: <a href="mailto:privacy@usecoachly.com" className="text-purple-600 hover:underline">privacy@usecoachly.com</a>
            </p>
          </section>
        </div>

        {/* Back Button */}
        <div className="pt-8 border-t border-gray-200 mt-12">
          <button 
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-purple-600 hover:text-purple-700 font-semibold transition-colors"
          >
            ← Back
          </button>
        </div>
      </main>
    </div>
  );
};

export default Privacy;

