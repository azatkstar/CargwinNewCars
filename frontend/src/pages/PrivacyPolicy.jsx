import React from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import Footer from '../components/Footer';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Privacy Policy - Cargwin LLC</title>
      </Helmet>
      
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <div className="text-sm text-gray-600 mb-8">Last Updated: January 2025</div>
        
        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              Cargwin LLC ("we", "us", "our") operates hunter.lease and related services. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>
            <h3 className="text-xl font-semibold mb-3">Personal Information</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              When you apply for a lease or finance, we collect:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Full name, date of birth, Social Security Number</li>
              <li>Contact information (email, phone, address)</li>
              <li>Driver's license information</li>
              <li>Employment and income details</li>
              <li>Credit history and score (with your authorization)</li>
              <li>Financial account information for payments</li>
            </ul>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">Usage Information</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Browser type and device information</li>
              <li>IP address and location data</li>
              <li>Pages visited and time spent on our site</li>
              <li>Referring URLs and search terms</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-700 leading-relaxed mb-3">We use your information to:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Process your lease or financing application</li>
              <li>Verify your identity and creditworthiness</li>
              <li>Communicate with you about your application and account</li>
              <li>Improve our services and user experience</li>
              <li>Comply with legal obligations</li>
              <li>Prevent fraud and ensure security</li>
              <li>Send you marketing communications (with opt-out option)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Information Sharing</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We may share your information with:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Financial Institutions:</strong> Lenders and banks for credit approval</li>
              <li><strong>Credit Bureaus:</strong> To obtain and verify credit information</li>
              <li><strong>Service Providers:</strong> Third-party vendors assisting with our operations</li>
              <li><strong>Legal Authorities:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Partners:</strong> Automotive manufacturers and dealers</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              We do not sell your personal information to third parties for their marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Data Security</h2>
            <p className="text-gray-700 leading-relaxed">
              We implement industry-standard security measures including encryption (SSL/TLS), secure servers, access controls, and regular security audits. However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Your Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-3">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Access and obtain a copy of your personal information</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data (subject to legal obligations)</li>
              <li>Opt-out of marketing communications</li>
              <li>Withdraw consent for data processing (where applicable)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. California Residents (CCPA)</h2>
            <p className="text-gray-700 leading-relaxed">
              California residents have additional rights under the California Consumer Privacy Act. See our <a href="/ccpa-rights" className="text-blue-600 hover:underline">CCPA Rights</a> page for details.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">8. Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Our services are not directed to individuals under 18 years of age. We do not knowingly collect personal information from children.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">9. Changes to This Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy periodically. We will notify you of material changes via email or prominent notice on our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">10. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              For questions about this Privacy Policy or to exercise your rights, contact us at:
            </p>
            <div className="bg-gray-50 p-6 rounded-lg mt-4">
              <p className="font-semibold">Cargwin LLC</p>
              <p className="text-gray-700">2855 Michelle Dr, Office 180</p>
              <p className="text-gray-700">Irvine, CA 92606</p>
              <p className="text-gray-700 mt-2">Email: privacy@cargwin.com</p>
              <p className="text-gray-700">Phone: +1 (747) CARGWIN</p>
            </div>
          </section>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
