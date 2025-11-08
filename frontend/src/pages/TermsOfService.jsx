import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
        <p className="text-gray-600 mb-8">Last updated: November 2025</p>

        <div className="prose prose-lg max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Agreement to Terms</h2>
            <p className="text-gray-700">
              These Terms and Conditions constitute a legally binding agreement between you and 
              <strong> Cargwin LLC</strong> ("we," "us" or "our"), a California-licensed automotive broker, 
              concerning your access to and use of the CargwinNewCar website and services.
            </p>
            <p className="text-gray-700 mt-3">
              <strong>IMPORTANT:</strong> Cargwin LLC operates as an <strong>automotive information service and broker</strong>, 
              NOT as a dealership or vehicle seller. We connect potential automobile consumers with dealerships 
              and financing providers but DO NOT own, sell, lease, or hold title to any vehicles listed on our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Our Role as Broker</h2>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4">
              <p className="font-semibold text-gray-900">CARGWIN LLC DOES NOT:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1 text-gray-700">
                <li>Own or sell vehicles directly</li>
                <li>Hold title to any vehicle listed on our platform</li>
                <li>Inspect vehicles or guarantee their condition</li>
                <li>Have legal possession of any vehicles</li>
                <li>Provide warranties or guarantees about vehicle quality</li>
              </ul>
            </div>
            <p className="text-gray-700">
              We provide an <strong>informational marketplace platform</strong> that connects you with licensed 
              dealerships and financing providers. The actual purchase, lease, or finance contract is 
              directly between you and the dealership/lender, NOT with Cargwin LLC.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Information Services</h2>
            <p className="text-gray-700">
              Cargwin LLC provides the following information services:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>Vehicle pricing information and fleet pricing access</li>
              <li>Connection to licensed dealerships and financing providers</li>
              <li>Comparison of financing options and terms</li>
              <li>Credit pre-qualification assistance (soft check)</li>
              <li>Price reservation and tracking services</li>
            </ul>
            <p className="text-gray-700 mt-3">
              We are compensated by dealerships and lenders for successful referrals but maintain 
              transparency in all pricing shown to consumers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Price Reservations</h2>
            <p className="text-gray-700">
              When you reserve a price through our platform:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>The reservation holds the displayed price for 48 hours</li>
              <li>Reservations are non-binding and can be cancelled anytime</li>
              <li>Converting a reservation to an application is binding upon dealer acceptance</li>
              <li>Final pricing is subject to credit approval and dealer confirmation</li>
              <li>Incentives and rebates must be substantiated with proof of eligibility</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Disclaimer of Warranties</h2>
            <div className="bg-red-50 border-l-4 border-red-400 p-4 my-4">
              <p className="font-semibold text-gray-900">THE PLATFORM IS PROVIDED "AS IS"</p>
              <p className="text-gray-700 mt-2">
                TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, 
                INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND 
                NON-INFRINGEMENT REGARDING ANY VEHICLES, DEALERSHIPS, OR FINANCING PROVIDERS.
              </p>
            </div>
            <p className="text-gray-700">
              We make no representations about vehicle condition, dealership practices, or financing terms 
              beyond the information provided to us by third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Limitation of Liability</h2>
            <p className="text-gray-700">
              IN NO EVENT WILL CARGWIN LLC BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, 
              OR CONSEQUENTIAL DAMAGES ARISING FROM:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>Vehicle condition or quality issues</li>
              <li>Dealership practices or conduct</li>
              <li>Financing terms or credit approval decisions</li>
              <li>Delivery delays or vehicle availability</li>
              <li>Price changes or discontinued offers</li>
            </ul>
            <p className="text-gray-700 mt-3">
              Our maximum liability is limited to <strong>$500</strong> per transaction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Credit Authorization</h2>
            <p className="text-gray-700">
              By using our services, you authorize us to:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>Obtain and review your credit report for pre-qualification purposes</li>
              <li>Share your application information with financing providers and dealerships</li>
              <li>Facilitate credit applications on your behalf</li>
            </ul>
            <p className="text-gray-700 mt-3">
              We use industry-standard FICO scoring models. Variations may occur if dealerships use 
              different scoring models, which may affect pricing or eligibility.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">User Eligibility</h2>
            <p className="text-gray-700">
              You must be at least 18 years old and a California resident to use our services. 
              You represent that all information provided is true, accurate, and complete.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Governing Law</h2>
            <p className="text-gray-700">
              These Terms are governed by the laws of the State of California, without regard to 
              conflict of law principles. Any disputes will be resolved through binding arbitration 
              in Orange County, California.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">California Residents</h2>
            <p className="text-gray-700">
              If you have a complaint that is not satisfactorily resolved, you may contact:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg my-3">
              <p className="font-semibold">California Department of Consumer Affairs</p>
              <p className="text-sm text-gray-600">Complaint Assistance Unit</p>
              <p className="text-sm text-gray-600">1625 North Market Blvd., Suite N 112</p>
              <p className="text-sm text-gray-600">Sacramento, CA 95834</p>
              <p className="text-sm text-gray-600">Phone: (800) 952-5210 or (916) 445-1254</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Contact Us</h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="font-semibold text-lg mb-3">Cargwin LLC</p>
              <p className="text-gray-700">2855 Michelle Dr, Office 180</p>
              <p className="text-gray-700">Irvine, CA 92606</p>
              <p className="text-gray-700 mt-3">📞 Phone: +1 (747) CARGWIN</p>
              <p className="text-gray-700">📧 Email: info@cargwin.com</p>
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

export default TermsOfService;
