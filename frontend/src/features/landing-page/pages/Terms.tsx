import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Terms = () => {
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
          Terms of Service
        </h1>
        
        <p className="text-sm text-gray-500 mb-8">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div className="prose prose-lg max-w-none">
          {/* Introduction */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Agreement to Terms</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              These Terms of Service ("Terms") constitute a legally binding agreement between you and Coachly 
              ("we," "our," or "us") regarding your use of our platform accessible at usecoachly.com. By accessing 
              or using Coachly, you agree to be bound by these Terms.
            </p>
            <p className="text-gray-700 leading-relaxed">
              If you do not agree to these Terms, you may not access or use our services. We reserve the right 
              to update these Terms at any time, and your continued use constitutes acceptance of any changes.
            </p>
          </section>

          {/* Description of Service */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Description of Service</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Coachly is an all-in-one platform designed for coaches and instructors to:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2 ml-4">
              <li>Create and deliver online courses with video lessons and assignments</li>
              <li>Build and manage communities for students and members</li>
              <li>Record, upload, and host video content</li>
              <li>Host live meetings and coaching sessions</li>
              <li>Create sales pages and professional websites</li>
              <li>Process payments and manage subscriptions</li>
              <li>Track student progress and engagement analytics</li>
            </ul>
          </section>

          {/* Account Registration */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Registration</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              To use Coachly, you must:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2 ml-4">
              <li>Be at least 18 years of age</li>
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and update your account information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized access</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              You are responsible for maintaining the confidentiality of your account and password. You agree to 
              accept responsibility for all activities that occur under your account.
            </p>
          </section>

          {/* Acceptable Use */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceptable Use Policy</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You agree not to use Coachly to:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2 ml-4">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon intellectual property rights</li>
              <li>Upload malicious code, viruses, or harmful content</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Impersonate any person or entity</li>
              <li>Collect user information without consent</li>
              <li>Interfere with or disrupt the platform's operation</li>
              <li>Engage in any fraudulent or deceptive practices</li>
              <li>Use automated systems to access the platform without authorization</li>
              <li>Share your account credentials with others</li>
            </ul>
          </section>

          {/* Content Ownership */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Content Ownership and Rights</h2>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Your Content</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              You retain ownership of all content you upload to Coachly, including courses, videos, posts, and other 
              materials. By uploading content, you grant Coachly a worldwide, non-exclusive, royalty-free license to:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2 ml-4">
              <li>Store, host, and display your content on our platform</li>
              <li>Distribute your content to your students and members as you direct</li>
              <li>Provide technical support and platform functionality</li>
              <li>Use your content for platform improvement and analytics</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Platform Content</h3>
            <p className="text-gray-700 leading-relaxed">
              All content and materials on Coachly, including our design, text, graphics, logos, and software, 
              are owned by Coachly or our licensors and are protected by copyright, trademark, and other laws.
            </p>
          </section>

          {/* Payments and Billing */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Payments and Billing</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Coachly offers both one-time and subscription-based plans:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2 ml-4">
              <li><strong>One-Time Payments:</strong> Certain features may be available for a one-time payment</li>
              <li><strong>Subscriptions:</strong> Recurring monthly or annual subscriptions for premium features</li>
              <li><strong>Payment Processing:</strong> Payments are processed securely through third-party processors</li>
              <li><strong>Refunds:</strong> Refund policies are outlined at the time of purchase</li>
              <li><strong>Price Changes:</strong> We reserve the right to modify pricing with notice to existing customers</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              All fees are in USD unless otherwise stated. You are responsible for any taxes applicable to your 
              purchase. Failed payments may result in service suspension or termination.
            </p>
          </section>

          {/* Refund Policy */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Refund Policy</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Refund eligibility depends on your purchase type:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2 ml-4">
              <li><strong>One-Time Purchases:</strong> Refunds may be available within 30 days of purchase, subject to terms</li>
              <li><strong>Subscriptions:</strong> You may cancel your subscription at any time; refunds for unused periods are at our discretion</li>
              <li><strong>Chargebacks:</strong> Initiating a chargeback may result in immediate account suspension</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              To request a refund, contact us at <a href="mailto:support@usecoachly.com" className="text-purple-600 hover:underline">support@usecoachly.com</a> with your purchase details.
            </p>
          </section>

          {/* Termination */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Termination</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Either party may terminate this agreement at any time:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2 ml-4">
              <li><strong>By You:</strong> You may cancel your account at any time through your account settings</li>
              <li><strong>By Us:</strong> We may suspend or terminate your account for violation of these Terms</li>
              <li><strong>Effect of Termination:</strong> Upon termination, your access will be revoked, but certain content may be retained as required by law</li>
            </ul>
          </section>

          {/* Disclaimers */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Disclaimers</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Coachly is provided "as is" and "as available" without warranties of any kind, either express or implied. 
              We do not guarantee that:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2 ml-4">
              <li>The platform will be uninterrupted, secure, or error-free</li>
              <li>Any defects will be corrected</li>
              <li>The platform will meet your specific requirements</li>
            </ul>
          </section>

          {/* Limitation of Liability */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed">
              To the maximum extent permitted by law, Coachly shall not be liable for any indirect, incidental, 
              special, consequential, or punitive damages, including loss of profits, data, or business opportunities, 
              arising from your use of the platform.
            </p>
          </section>

          {/* Indemnification */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Indemnification</h2>
            <p className="text-gray-700 leading-relaxed">
              You agree to indemnify and hold harmless Coachly, its officers, directors, employees, and agents from 
              any claims, damages, losses, liabilities, and expenses arising from your use of the platform, violation 
              of these Terms, or infringement of any rights of another.
            </p>
          </section>

          {/* Changes to Terms */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify users of significant changes 
              via email or platform notification. Your continued use after changes constitutes acceptance.
            </p>
          </section>

          {/* Governing Law */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Governing Law</h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in 
              which Coachly operates, without regard to conflict of law provisions.
            </p>
          </section>

          {/* Contact */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have questions about these Terms, please contact us:
            </p>
            <p className="text-gray-700 leading-relaxed">
              Email: <a href="mailto:legal@usecoachly.com" className="text-purple-600 hover:underline">legal@usecoachly.com</a>
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

export default Terms;

