import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const CCPARights = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Your California Privacy Rights</h1>
        <p className="text-gray-600 mb-8">California Consumer Privacy Act (CCPA) Information</p>

        <div className="prose prose-lg max-w-none space-y-6">
          <section className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded">
            <h2 className="text-2xl font-bold text-blue-900 mb-3">Your Rights Under CCPA</h2>
            <p className="text-gray-700">
              As a California resident, you have specific rights regarding your personal information 
              under the California Consumer Privacy Act (CCPA).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">1. Right to Know</h2>
            <p className="text-gray-700">
              You have the right to request information about:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>What personal information we collect about you</li>
              <li>The sources of that information</li>
              <li>The purposes for collecting or selling your information</li>
              <li>Third parties with whom we share your information</li>
              <li>Specific pieces of personal information we hold about you</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">2. Right to Delete</h2>
            <p className="text-gray-700">
              You have the right to request deletion of your personal information, subject to certain 
              legal exceptions such as:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>Completing the transaction for which the information was collected</li>
              <li>Complying with legal obligations</li>
              <li>Detecting security incidents or protecting against fraud</li>
              <li>Internal uses reasonably aligned with your expectations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">3. Right to Opt-Out of Sale</h2>
            <div className="bg-green-50 border-l-4 border-green-600 p-4">
              <p className="font-semibold text-green-900">We DO NOT Sell Your Personal Information</p>
              <p className="text-gray-700 mt-2">
                Cargwin LLC does not sell personal information to third parties for monetary consideration. 
                We share information only with dealerships and lenders to facilitate your vehicle purchase or 
                financing application.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">4. Right to Non-Discrimination</h2>
            <p className="text-gray-700">
              You have the right to exercise your CCPA rights without discrimination. We will not:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>Deny goods or services to you</li>
              <li>Charge different prices or rates</li>
              <li>Provide a different level or quality of service</li>
              <li>Suggest you will receive different pricing or service quality</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Categories of Information We Collect</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 mt-3">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Examples</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purpose</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">Identifiers</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Name, email, phone, SSN</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Account creation, credit checks</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">Financial Info</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Income, credit score, employment</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Financing pre-qualification</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">Commercial Info</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Vehicle preferences, applications</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Matching with dealers/lenders</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">Internet Activity</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Browsing history, interactions</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Service improvement</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">How to Exercise Your Rights</h2>
            <div className="bg-blue-50 p-6 rounded-lg">
              <p className="font-semibold text-lg mb-3">Submit a CCPA Request:</p>
              <p className="text-gray-700 mb-3">You or your authorized agent may submit a request by:</p>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📧</span>
                  <div>
                    <p className="font-medium text-gray-900">Email:</p>
                    <a href="mailto:privacy@cargwin.com" className="text-blue-600 hover:underline">
                      privacy@cargwin.com
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📞</span>
                  <div>
                    <p className="font-medium text-gray-900">Phone:</p>
                    <p className="text-gray-700">+1 (747) CARGWIN</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="text-2xl">✉️</span>
                  <div>
                    <p className="font-medium text-gray-900">Mail:</p>
                    <p className="text-gray-700">Cargwin LLC - CCPA Requests</p>
                    <p className="text-gray-700">2855 Michelle Dr, Office 180</p>
                    <p className="text-gray-700">Irvine, CA 92606</p>
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mt-4">
              We will respond to your request within 45 days. You may submit up to 2 requests per 12-month period.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Verification Process</h2>
            <p className="text-gray-700">
              To protect your privacy, we must verify your identity before processing requests. 
              We may ask you to:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>Provide identifying information (name, email, phone)</li>
              <li>Confirm account details</li>
              <li>Answer security questions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Contact Information</h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="font-semibold text-lg mb-3">Cargwin LLC - Privacy & CCPA Compliance</p>
              <p className="text-gray-700">2855 Michelle Dr, Office 180</p>
              <p className="text-gray-700">Irvine, CA 92606</p>
              <p className="text-gray-700 mt-3">📞 Phone: +1 (747) CARGWIN</p>
              <p className="text-gray-700">📧 Privacy Inquiries: privacy@cargwin.com</p>
            </div>
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

export default CCPARights;