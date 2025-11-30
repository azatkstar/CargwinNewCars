import React from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import Footer from '../components/Footer';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Terms of Service - Cargwin LLC</title>
      </Helmet>
      
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <div className="text-sm text-gray-600 mb-8">Last Updated: January 2025</div>
        
        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing and using hunter.lease and services provided by Cargwin LLC ("we", "us", "our"), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. Services Description</h2>
            <p className="text-gray-700 leading-relaxed">
              Cargwin LLC operates as a licensed California auto broker, facilitating vehicle leases and financing between customers and automotive manufacturers, financial institutions, and dealerships. We provide:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-3">
              <li>Online marketplace for vehicle lease and finance offers</li>
              <li>Credit application processing and approval coordination</li>
              <li>Vehicle reservation and delivery coordination</li>
              <li>Customer support throughout the leasing process</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. Eligibility</h2>
            <p className="text-gray-700 leading-relaxed mb-3">To use our services, you must:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Be at least 18 years of age</li>
              <li>Have a valid U.S. driver's license</li>
              <li>Provide accurate and truthful information</li>
              <li>Have the legal capacity to enter into binding contracts</li>
              <li>Reside in a state where we are licensed to operate</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Pricing and Payments</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              <strong>Fleet Pricing:</strong> Our displayed prices represent fleet-level pricing obtained through our relationships with manufacturers and lenders. Final pricing may vary based on:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Your credit profile and approved credit tier</li>
              <li>Selected lease term, mileage, and down payment</li>
              <li>Available manufacturer incentives and rebates</li>
              <li>State taxes, registration, and required fees</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              <strong>Price Match Guarantee:</strong> If you find a lower price for the same vehicle configuration from a licensed California dealer within 24 hours of your reservation, we will match it or refund your deposit.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Reservations and Cancellations</h2>
            <p className="text-gray-700 leading-relaxed">
              <strong>Free Reservations:</strong> Reserving a vehicle on our platform is free and does not obligate you to complete the lease. You may cancel your reservation at any time before signing the final contract.
            </p>
            <p className="text-gray-700 leading-relaxed mt-3">
              <strong>Refunds:</strong> Any deposit paid (if applicable) will be fully refunded if you cancel before final contract execution. After signing, standard lease cancellation terms apply.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Credit Authorization</h2>
            <p className="text-gray-700 leading-relaxed">
              By submitting an application, you authorize Cargwin LLC and its lending partners to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-3">
              <li>Obtain your credit report from consumer reporting agencies</li>
              <li>Verify your employment and income information</li>
              <li>Share your application with financial institutions for approval</li>
              <li>Perform identity verification and fraud prevention checks</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed">
              Cargwin LLC acts as a broker and is not the lessor or lender. We are not liable for:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-3">
              <li>Vehicle defects, recalls, or warranty issues (contact manufacturer)</li>
              <li>Lender decisions regarding credit approval or terms</li>
              <li>Delays in vehicle delivery due to manufacturer or carrier issues</li>
              <li>Changes in interest rates or incentives between quote and approval</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">8. Intellectual Property</h2>
            <p className="text-gray-700 leading-relaxed">
              All content on hunter.lease, including text, graphics, logos, and software, is owned by Cargwin LLC and protected by copyright and trademark laws. You may not reproduce, distribute, or create derivative works without our written permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">9. Dispute Resolution</h2>
            <p className="text-gray-700 leading-relaxed">
              Any disputes arising from these Terms or our services shall be resolved through binding arbitration in Orange County, California, in accordance with the rules of the American Arbitration Association.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">10. Modifications</h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify these Terms at any time. Material changes will be communicated via email or prominent notice on our website. Continued use after modifications constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">11. Contact Information</h2>
            <div className="bg-gray-50 p-6 rounded-lg mt-4">
              <p className="font-semibold">Cargwin LLC</p>
              <p className="text-gray-700">2855 Michelle Dr, Office 180, Irvine, CA 92606</p>
              <p className="text-gray-700 mt-2">Email: legal@cargwin.com</p>
              <p className="text-gray-700">Phone: +1 (747) CARGWIN</p>
              <p className="text-gray-700 mt-2 text-sm">CA Auto Broker License: [License Number]</p>
            </div>
          </section>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default TermsOfService;
