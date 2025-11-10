import React from 'react';

interface PrivacySectionProps {
  sectionId?: string;
}

export const PrivacySection: React.FC<PrivacySectionProps> = () => {
  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        
        <div className="prose prose-slate max-w-none text-gray-700 space-y-8">
          <section>
            <p className="text-base sm:text-lg leading-relaxed text-gray-600 mb-6">
              <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className="text-base leading-relaxed mb-4">
              Welcome to Coachly. We are committed to protecting your privacy and ensuring you have a positive experience on our platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, mobile applications, and related services (collectively, the "Services").
            </p>
            <p className="text-base leading-relaxed mb-4">
              By using our Services, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our Services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">1. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Information You Provide to Us</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Account Information:</strong> When you create an account, we collect your name, email address, password, and other information you choose to provide.</li>
              <li><strong>Profile Information:</strong> Information you provide in your profile, such as your bio, profile picture, professional credentials, and other details.</li>
              <li><strong>Payment Information:</strong> When you make a purchase or subscription, we collect payment card information and billing details, which are processed securely through third-party payment processors.</li>
              <li><strong>Content You Create:</strong> Courses, posts, comments, messages, and other content you create or upload to our platform.</li>
              <li><strong>Communications:</strong> Information you provide when contacting us for support or other purposes.</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Information Automatically Collected</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Usage Data:</strong> Information about how you use our Services, including pages viewed, features used, time spent, and navigation paths.</li>
              <li><strong>Device Information:</strong> Browser type, operating system, device identifiers, IP address, and mobile network information.</li>
              <li><strong>Location Data:</strong> General location information derived from your IP address.</li>
              <li><strong>Cookies and Similar Technologies:</strong> We use cookies, web beacons, and similar technologies to track activity and store certain information.</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Information from Third Parties</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Information from payment processors regarding your transactions.</li>
              <li>Information from social media platforms if you choose to connect your accounts.</li>
              <li>Information from analytics providers and other service providers.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">2. How We Use Your Information</h2>
            <p className="text-base leading-relaxed mb-4">
              We use the information we collect for various purposes, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>To Provide and Maintain Our Services:</strong> Create and manage your account, process payments, deliver courses and content, and provide customer support.</li>
              <li><strong>To Improve Our Services:</strong> Analyze usage patterns, conduct research, and develop new features.</li>
              <li><strong>To Communicate with You:</strong> Send you updates, newsletters, marketing communications (with your consent), and respond to your inquiries.</li>
              <li><strong>To Ensure Security:</strong> Detect, prevent, and address technical issues, fraud, and unauthorized access.</li>
              <li><strong>To Personalize Your Experience:</strong> Customize content, recommendations, and features based on your preferences and usage.</li>
              <li><strong>To Comply with Legal Obligations:</strong> Meet legal requirements, enforce our terms, and protect our rights and interests.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">3. How We Share Your Information</h2>
            <p className="text-base leading-relaxed mb-4">
              We may share your information in the following circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>With Your Consent:</strong> When you explicitly consent to sharing your information.</li>
              <li><strong>With Service Providers:</strong> Third-party vendors who perform services on our behalf, such as hosting, payment processing, analytics, and customer support. These providers are contractually obligated to protect your information.</li>
              <li><strong>For Legal Purposes:</strong> When required by law, court order, or to protect our rights, property, or safety.</li>
              <li><strong>In Connection with Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.</li>
              <li><strong>With Your Instructor:</strong> If you enroll in a course or join a community, your information may be shared with the instructor for educational and communication purposes.</li>
              <li><strong>Aggregated or Anonymized Data:</strong> We may share aggregated or anonymized information that cannot identify you personally.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">4. Data Security</h2>
            <p className="text-base leading-relaxed mb-4">
              We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>SSL/TLS encryption for data in transit</li>
              <li>Secure data storage with encryption at rest</li>
              <li>Regular security assessments and vulnerability testing</li>
              <li>Access controls and authentication measures</li>
              <li>Employee training on data protection</li>
            </ul>
            <p className="text-base leading-relaxed mb-4">
              However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">5. Your Privacy Rights</h2>
            <p className="text-base leading-relaxed mb-4">
              Depending on your location, you may have certain rights regarding your personal information, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Access:</strong> Request access to and receive a copy of your personal information.</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information.</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information, subject to certain exceptions.</li>
              <li><strong>Portability:</strong> Request transfer of your personal information to another service provider.</li>
              <li><strong>Objection:</strong> Object to processing of your personal information for certain purposes.</li>
              <li><strong>Withdraw Consent:</strong> Withdraw your consent where we rely on it to process your information.</li>
            </ul>
            <p className="text-base leading-relaxed mb-4">
              To exercise these rights, please contact us at <a href="mailto:privacy@coachly.com" className="text-purple-600 hover:text-purple-800">privacy@coachly.com</a>. We will respond to your request within a reasonable timeframe.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">6. Cookies and Tracking Technologies</h2>
            <p className="text-base leading-relaxed mb-4">
              We use cookies and similar tracking technologies to collect and store information about your preferences and activities. Cookies are small text files placed on your device that allow us to:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Remember your preferences and settings</li>
              <li>Analyze site traffic and usage patterns</li>
              <li>Provide personalized content and advertisements</li>
              <li>Improve our services and user experience</li>
            </ul>
            <p className="text-base leading-relaxed mb-4">
              You can control cookies through your browser settings. However, disabling cookies may limit your ability to use certain features of our Services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">7. Children's Privacy</h2>
            <p className="text-base leading-relaxed mb-4">
              Our Services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately at <a href="mailto:privacy@coachly.com" className="text-purple-600 hover:text-purple-800">privacy@coachly.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">8. International Data Transfers</h2>
            <p className="text-base leading-relaxed mb-4">
              Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws. We take appropriate safeguards to ensure your information receives an adequate level of protection.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">9. Changes to This Privacy Policy</h2>
            <p className="text-base leading-relaxed mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last Updated" date. Your continued use of our Services after any changes indicates your acceptance of the updated Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">10. Contact Us</h2>
            <p className="text-base leading-relaxed mb-4">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us at:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-base font-semibold mb-2">Coachly</p>
              <p className="text-base">Email: <a href="mailto:privacy@coachly.com" className="text-purple-600 hover:text-purple-800">privacy@coachly.com</a></p>
              <p className="text-base">Website: <a href="https://coachly.com" className="text-purple-600 hover:text-purple-800">www.coachly.com</a></p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

