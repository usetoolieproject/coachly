import React from 'react';

interface TermsSectionProps {
  sectionId?: string;
}

export const TermsSection: React.FC<TermsSectionProps> = () => {
  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        
        <div className="prose prose-slate max-w-none text-gray-700 space-y-8">
          <section>
            <p className="text-base sm:text-lg leading-relaxed text-gray-600 mb-6">
              <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className="text-base leading-relaxed mb-4">
              Welcome to Coachly. These Terms of Service ("Terms") govern your access to and use of our website, mobile applications, and related services (collectively, the "Services") provided by Coachly ("we," "us," or "our").
            </p>
            <p className="text-base leading-relaxed mb-4">
              By accessing or using our Services, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our Services. We may modify these Terms at any time, and such modifications will be effective immediately upon posting.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">1. Acceptance of Terms</h2>
            <p className="text-base leading-relaxed mb-4">
              By registering for, accessing, or using our Services, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. You represent that you are at least 18 years old and have the legal capacity to enter into these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">2. User Accounts</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Account Registration</h3>
            <p className="text-base leading-relaxed mb-4">
              To access certain features of our Services, you must register for an account. When you register, you agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security of your password and account</li>
              <li>Accept responsibility for all activities that occur under your account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Account Security</h3>
            <p className="text-base leading-relaxed mb-4">
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. We are not liable for any losses resulting from unauthorized access to your account. You must notify us immediately of any suspected unauthorized access or use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">3. Payment and Subscription Terms</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Subscription Plans</h3>
            <p className="text-base leading-relaxed mb-4">
              Our Services may offer various subscription plans, including free and paid options. Subscription plans, pricing, and features are subject to change at any time. We reserve the right to modify, suspend, or discontinue any subscription plan with reasonable notice.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Payment Processing</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Billing:</strong> All fees are billed in advance on a recurring basis (monthly, quarterly, or annually) as selected by you.</li>
              <li><strong>Payment Methods:</strong> We accept major credit cards and other payment methods as indicated during checkout.</li>
              <li><strong>Authorization:</strong> By providing payment information, you authorize us to charge your payment method for all fees and taxes.</li>
              <li><strong>Price Changes:</strong> We reserve the right to change subscription prices with 30 days' notice. Your continued use of the Services after a price change constitutes acceptance of the new pricing.</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Automatic Renewal</h3>
            <p className="text-base leading-relaxed mb-4">
              Unless you cancel your subscription before the end of the billing period, it will automatically renew. You will be charged the then-current subscription fee. You can cancel your subscription at any time through your account settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">4. Refund Policy</h2>
            <p className="text-base leading-relaxed mb-4">
              We offer a 30-day money-back guarantee for paid subscriptions. If you are not satisfied with our Services within the first 30 days of your initial subscription, you may request a full refund. Refund requests must be submitted within 30 days of the original purchase date.
            </p>
            <p className="text-base leading-relaxed mb-4">
              After 30 days, no refunds will be provided for any reason, including unused portions of your subscription. Refunds are processed to the original payment method within 5-10 business days.
            </p>
            <p className="text-base leading-relaxed mb-4">
              If you cancel your subscription, you will continue to have access to the Services until the end of your current billing period. No partial refunds will be provided for early cancellation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">5. Intellectual Property Rights</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Our Intellectual Property</h3>
            <p className="text-base leading-relaxed mb-4">
              All content, features, and functionality of our Services, including but not limited to text, graphics, logos, images, audio clips, video clips, software, and source code, are owned by Coachly or our licensors and are protected by copyright, trademark, patent, and other intellectual property laws.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">User Content</h3>
            <p className="text-base leading-relaxed mb-4">
              You retain ownership of any content you create, upload, or post on our platform ("User Content"). However, by uploading User Content, you grant us a worldwide, non-exclusive, royalty-free, perpetual, and transferable license to use, reproduce, modify, adapt, publish, and display such User Content in connection with operating and promoting our Services.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Prohibited Use</h3>
            <p className="text-base leading-relaxed mb-4">
              You agree not to:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Copy, reproduce, or redistribute any content from our Services without permission</li>
              <li>Use our Services for any unlawful purpose or in violation of any laws</li>
              <li>Upload content that infringes on third-party intellectual property rights</li>
              <li>Modify, adapt, reverse engineer, or attempt to extract the source code of our software</li>
              <li>Remove any copyright, trademark, or other proprietary notices from our content</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">6. User Conduct</h2>
            <p className="text-base leading-relaxed mb-4">
              You agree to use our Services only for lawful purposes and in accordance with these Terms. You agree NOT to:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Violate any applicable laws, regulations, or third-party rights</li>
              <li>Transmit or upload any malicious code, viruses, or harmful materials</li>
              <li>Harass, abuse, threaten, or harm other users</li>
              <li>Post false, misleading, or defamatory content</li>
              <li>Impersonate any person or entity or falsely state or misrepresent your affiliation</li>
              <li>Attempt to gain unauthorized access to our Services, accounts, or computer systems</li>
              <li>Interfere with or disrupt our Services or servers</li>
              <li>Collect or harvest information about other users without their consent</li>
              <li>Use automated systems (bots, scrapers, etc.) to access our Services without permission</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">7. Content Moderation</h2>
            <p className="text-base leading-relaxed mb-4">
              We reserve the right to review, edit, remove, or refuse to post any content at our sole discretion. We may remove or disable access to content that violates these Terms or is otherwise objectionable. However, we do not necessarily review all content before it is posted, and we assume no responsibility for content posted by users.
            </p>
            <p className="text-base leading-relaxed mb-4">
              If you believe any content on our platform violates these Terms or your rights, please contact us with details of the alleged violation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">8. Termination</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Termination by You</h3>
            <p className="text-base leading-relaxed mb-4">
              You may terminate your account at any time by contacting us or using the account deletion feature in your account settings. Upon termination, your right to access and use our Services will immediately cease.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Termination by Us</h3>
            <p className="text-base leading-relaxed mb-4">
              We may suspend or terminate your account and access to our Services immediately, without prior notice, if you breach these Terms, engage in fraudulent activity, or for any other reason we deem necessary to protect our platform and users.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Effect of Termination</h3>
            <p className="text-base leading-relaxed mb-4">
              Upon termination, all rights granted to you under these Terms will cease. You will no longer have access to your account or any content associated with your account. We may delete your account and content at our discretion, and we are not obligated to retain or provide you with copies of such content.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">9. Limitation of Liability</h2>
            <p className="text-base leading-relaxed mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, COACHLY AND ITS AFFILIATES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES RESULTING FROM:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Your use or inability to use our Services</li>
              <li>Any unauthorized access to or use of our servers or any personal information stored therein</li>
              <li>Any interruption or cessation of transmission to or from our Services</li>
              <li>Any bugs, viruses, Trojan horses, or the like transmitted through our Services</li>
              <li>Any errors or omissions in content or any loss or damage incurred as a result of the use of any content posted, emailed, or otherwise transmitted through our Services</li>
            </ul>
            <p className="text-base leading-relaxed mb-4">
              OUR TOTAL LIABILITY TO YOU FOR ALL DAMAGES SHALL NOT EXCEED THE AMOUNT YOU PAID TO US IN THE 12 MONTHS PRECEDING THE CLAIM OR $100, WHICHEVER IS GREATER. SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OR LIMITATION OF LIABILITY FOR CONSEQUENTIAL OR INCIDENTAL DAMAGES, SO SOME OF THE ABOVE LIMITATIONS MAY NOT APPLY TO YOU.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">10. Disclaimer of Warranties</h2>
            <p className="text-base leading-relaxed mb-4">
              OUR SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Our Services will meet your requirements</li>
              <li>Our Services will be uninterrupted, timely, secure, or error-free</li>
              <li>The results obtained from the use of our Services will be accurate or reliable</li>
              <li>The quality of any products, services, information, or other material obtained through our Services will meet your expectations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">11. Indemnification</h2>
            <p className="text-base leading-relaxed mb-4">
              You agree to indemnify, defend, and hold harmless Coachly, its affiliates, officers, directors, employees, agents, and licensors from and against any claims, actions, demands, damages, losses, liabilities, costs, and expenses (including reasonable legal fees) arising out of or relating to:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Your use of our Services</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any third-party rights</li>
              <li>Any content you upload, post, or transmit through our Services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">12. Governing Law and Dispute Resolution</h2>
            <p className="text-base leading-relaxed mb-4">
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Coachly operates, without regard to its conflict of law provisions. Any dispute arising out of or relating to these Terms or our Services shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association, except that you may assert claims in small claims court if your claims qualify.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">13. Changes to Terms</h2>
            <p className="text-base leading-relaxed mb-4">
              We reserve the right to modify these Terms at any time. We will notify you of material changes by posting the updated Terms on our website and updating the "Last Updated" date. Your continued use of our Services after such modifications constitutes your acceptance of the updated Terms. If you do not agree to the modified Terms, you must stop using our Services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">14. Contact Information</h2>
            <p className="text-base leading-relaxed mb-4">
              If you have any questions about these Terms, please contact us at:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-base font-semibold mb-2">Coachly</p>
              <p className="text-base">Email: <a href="mailto:support@coachly.com" className="text-purple-600 hover:text-purple-800">support@coachly.com</a></p>
              <p className="text-base">Website: <a href="https://coachly.com" className="text-purple-600 hover:text-purple-800">www.coachly.com</a></p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">15. Miscellaneous</h2>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Entire Agreement:</strong> These Terms, together with our Privacy Policy, constitute the entire agreement between you and Coachly regarding our Services.</li>
              <li><strong>Severability:</strong> If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full effect.</li>
              <li><strong>Waiver:</strong> Our failure to enforce any right or provision of these Terms will not be considered a waiver of such right or provision.</li>
              <li><strong>Assignment:</strong> You may not assign or transfer these Terms or your account without our prior written consent. We may assign these Terms without restriction.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

