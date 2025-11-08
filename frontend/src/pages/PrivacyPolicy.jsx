import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-gray-600 mb-8">Last updated: November 2025</p>

        <div className="prose prose-lg max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Introduction</h2>
            <p className="text-gray-700">
              Cargwin LLC ("we," "us," or "our") respects your privacy and is committed to protecting 
              your personal information. This Privacy Policy explains how we collect, use, disclose, 
              and safeguard your information when you use our website and services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Information We Collect</h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Personal Information</h3>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>Name, email address, phone number</li>
              <li>Date of birth, Social Security Number (for credit checks)</li>
              <li>Employment information and income</li>
              <li>Residential address and housing information</li>
              <li>Driver's license information</li>
              <li>Credit history and financial information</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">Usage Information</h3>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>IP address, browser type, and device information</li>
              <li>Pages visited and time spent on our site</li>
              <li>Vehicle preferences and search history</li>
              <li>Interaction with our platform features</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">How We Use Your Information</h2>
            <p className="text-gray-700">We use your information to:</p>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>Connect you with licensed dealerships and financing providers</li>
              <li>Perform credit checks and pre-qualification assessments</li>
              <li>Process your vehicle reservation and financing applications</li>
              <li>Communicate important updates about your applications</li>
              <li>Improve our services and user experience</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Information Sharing</h2>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-4">
              <p className="font-semibold text-gray-900">We Share Your Information With:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1 text-gray-700">
                <li>Licensed automotive dealerships for vehicle purchases</li>
                <li>Financing providers and lenders for loan/lease applications</li>
                <li>Insurance companies for coverage quotes</li>
                <li>Credit bureaus for credit checks (with your authorization)</li>
                <li>Service providers who assist in platform operations</li>
              </ul>
            </div>
            <p className="text-gray-700">
              <strong>We DO NOT sell your personal information to third parties for marketing purposes.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Your California Privacy Rights (CCPA)</h2>
            <p className="text-gray-700">
              Under the California Consumer Privacy Act (CCPA), California residents have the right to:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li><strong>Know:</strong> What personal information we collect and how it's used</li>
              <li><strong>Access:</strong> Request a copy of your personal information</li>
              <li><strong>Delete:</strong> Request deletion of your personal information</li>
              <li><strong>Opt-Out:</strong> Opt-out of the sale of personal information (we don't sell data)</li>
              <li><strong>Non-Discrimination:</strong> Exercise your rights without discrimination</li>
            </ul>
            <p className="text-gray-700 mt-3">
              To exercise these rights, contact us at <a href="mailto:privacy@cargwin.com" className="text-red-600 hover:underline">privacy@cargwin.com</a> or 
              call <strong>+1 (747) CARGWIN</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Data Security</h2>
            <p className="text-gray-700">
              We implement industry-standard security measures to protect your information, including:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>SSL/TLS encryption for data transmission</li>
              <li>Secure database storage with encryption at rest</li>
              <li>Access controls and authentication</li>
              <li>Regular security audits and monitoring</li>
            </ul>
            <p className="text-gray-700 mt-3">
              However, no method of transmission over the internet is 100% secure. We cannot guarantee 
              absolute security of your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Cookies and Tracking</h2>
            <p className="text-gray-700">
              We use cookies and similar technologies to enhance your experience, analyze site usage, 
              and deliver personalized content. You can control cookie settings through your browser.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Data Retention</h2>
            <p className="text-gray-700">
              We retain your personal information for as long as necessary to provide our services 
              and comply with legal obligations. You may request deletion at any time, subject to 
              legal retention requirements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Children's Privacy</h2>
            <p className="text-gray-700">
              Our services are not intended for individuals under 18 years of age. We do not knowingly 
              collect information from children.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Changes to Privacy Policy</h2>
            <p className="text-gray-700">
              We may update this Privacy Policy from time to time. We will notify you of any material 
              changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Contact Information</h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="font-semibold text-lg mb-3">Cargwin LLC - Privacy Inquiries</p>
              <p className="text-gray-700">2855 Michelle Dr, Office 180</p>
              <p className="text-gray-700">Irvine, CA 92606</p>
              <p className="text-gray-700 mt-3">📞 Phone: +1 (747) CARGWIN</p>
              <p className="text-gray-700">📧 Email: privacy@cargwin.com</p>
            </div>
          </section>

          <section className="bg-yellow-50 p-6 rounded-lg mt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Important California Notice</h3>
            <p className="text-gray-700">
              Cargwin LLC is a licensed automotive broker in California. We comply with all California 
              consumer protection laws including the California Consumer Privacy Act (CCPA), the 
              California Financial Information Privacy Act, and regulations of the California Department 
              of Motor Vehicles.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t">
          <Link to="/" className="text-red-600 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
