import React from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import Footer from '../components/Footer';

const CCPARights = () => {
  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>CCPA Rights - California Consumer Privacy Act | Cargwin LLC</title>
      </Helmet>
      
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">California Consumer Privacy Act (CCPA) Rights</h1>
        <div className="text-sm text-gray-600 mb-8">Your Privacy Rights Under California Law</div>
        
        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <p className="text-gray-700 leading-relaxed">
              If you are a California resident, the California Consumer Privacy Act (CCPA) provides you with specific rights regarding your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Your CCPA Rights</h2>
            
            <div className="space-y-6">
              <div className="bg-blue-50 border-l-4 border-blue-600 p-6">
                <h3 className="font-bold text-lg mb-2">1. Right to Know</h3>
                <p className="text-gray-700">
                  You have the right to request that we disclose what personal information we collect, use, and share about you.
                </p>
              </div>

              <div className="bg-green-50 border-l-4 border-green-600 p-6">
                <h3 className="font-bold text-lg mb-2">2. Right to Delete</h3>
                <p className="text-gray-700">
                  You have the right to request deletion of your personal information, subject to certain exceptions (e.g., legal obligations, fraud prevention).
                </p>
              </div>

              <div className="bg-purple-50 border-l-4 border-purple-600 p-6">
                <h3 className="font-bold text-lg mb-2">3. Right to Opt-Out</h3>
                <p className="text-gray-700">
                  You have the right to opt-out of the sale of your personal information. <strong>Note: Cargwin LLC does not sell personal information.</strong>
                </p>
              </div>

              <div className="bg-orange-50 border-l-4 border-orange-600 p-6">
                <h3 className="font-bold text-lg mb-2">4. Right to Non-Discrimination</h3>
                <p className="text-gray-700">
                  You have the right to not be discriminated against for exercising your CCPA rights. We will not deny services, charge different prices, or provide different quality of service.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Categories of Information We Collect</h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <ul className="space-y-3 text-gray-700">
                <li><strong>Identifiers:</strong> Name, email, phone, address, SSN, driver's license</li>
                <li><strong>Financial Information:</strong> Income, employment, credit score, bank account details</li>
                <li><strong>Commercial Information:</strong> Lease history, payment records, preferences</li>
                <li><strong>Internet Activity:</strong> Browsing history, pages viewed, device information</li>
                <li><strong>Geolocation Data:</strong> IP address, approximate location</li>
                <li><strong>Professional Information:</strong> Employment status, employer details</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">How We Use Your Information</h2>
            <p className="text-gray-700 leading-relaxed mb-3">We use your personal information for:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Processing lease and finance applications</li>
              <li>Verifying identity and creditworthiness</li>
              <li>Providing customer support and communications</li>
              <li>Improving our services and user experience</li>
              <li>Fraud prevention and security</li>
              <li>Compliance with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">How to Exercise Your Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              To exercise your CCPA rights, you may submit a verifiable request by:
            </p>
            
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
              <h3 className="font-bold text-lg mb-4">Submit a Request</h3>
              <div className="space-y-3">
                <div>
                  <strong className="text-gray-900">Email:</strong>
                  <p className="text-gray-700">privacy@cargwin.com</p>
                  <p className="text-sm text-gray-600">Subject: CCPA Request - [Right to Know/Delete/etc.]</p>
                </div>
                <div>
                  <strong className="text-gray-900">Phone:</strong>
                  <p className="text-gray-700">+1 (747) CARGWIN</p>
                </div>
                <div>
                  <strong className="text-gray-900">Mail:</strong>
                  <p className="text-gray-700">Cargwin LLC - Privacy Department</p>
                  <p className="text-gray-700">2855 Michelle Dr, Office 180</p>
                  <p className="text-gray-700">Irvine, CA 92606</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Verification Process</h2>
            <p className="text-gray-700 leading-relaxed">
              To protect your privacy, we will verify your identity before processing your request. You may be asked to provide:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-3">
              <li>Your full name and email address used with our service</li>
              <li>Last 4 digits of your SSN or driver's license number</li>
              <li>Information about your recent interactions with our service</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              We will respond to verifiable requests within 45 days. If we need more time, we will notify you of the extension and reason.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Authorized Agents</h2>
            <p className="text-gray-700 leading-relaxed">
              You may designate an authorized agent to make a request on your behalf. The agent must provide:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-3">
              <li>Written authorization signed by you</li>
              <li>Proof of their identity</li>
              <li>Verification that they are registered with the California Secretary of State (if applicable)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Contact for Questions</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have questions about your CCPA rights or this notice, please contact us:
            </p>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="font-semibold">Cargwin LLC - Privacy Officer</p>
              <p className="text-gray-700">Email: privacy@cargwin.com</p>
              <p className="text-gray-700">Phone: +1 (747) CARGWIN</p>
            </div>
          </section>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CCPARights;
