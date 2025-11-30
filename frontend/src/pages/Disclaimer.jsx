import React from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Disclaimer = () => {
  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Disclaimer - Cargwin LLC</title>
      </Helmet>
      
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">Disclaimer</h1>
        
        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">General Disclaimer</h2>
            <p className="text-gray-700 leading-relaxed">
              The information provided on hunter.lease and by Cargwin LLC is for general informational purposes only. While we strive to provide accurate and up-to-date information, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the information, products, services, or related graphics.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Pricing and Availability</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              <strong>Estimated Pricing:</strong> All prices displayed on our website are estimates based on fleet pricing, manufacturer incentives, and typical credit tiers. Your final monthly payment and total cost may vary based on:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Your actual credit score and approved credit tier</li>
              <li>Changes in interest rates or money factors</li>
              <li>Changes to manufacturer incentives or rebates</li>
              <li>Your selected down payment, term, and mileage</li>
              <li>State-specific taxes, fees, and registration costs</li>
              <li>Vehicle availability and dealer allocation</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              <strong>Inventory:</strong> Vehicle availability is subject to change without notice. Reserving a vehicle does not guarantee availability until confirmed by our team.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Broker Relationship</h2>
            <p className="text-gray-700 leading-relaxed">
              Cargwin LLC is a licensed auto broker. We facilitate transactions between customers and automotive manufacturers, dealerships, and financial institutions. We are not:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-3">
              <li>A lender or lessor (we broker financing, not provide it)</li>
              <li>A vehicle manufacturer or authorized dealer</li>
              <li>Responsible for vehicle defects, recalls, or warranty claims</li>
              <li>Able to guarantee credit approval or specific terms</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Credit and Financing</h2>
            <p className="text-gray-700 leading-relaxed">
              <strong>Credit Decisions:</strong> All credit decisions are made by lending institutions, not Cargwin LLC. We submit your application to multiple lenders to find the best rates, but approval and terms are at the lender's sole discretion.
            </p>
            <p className="text-gray-700 leading-relaxed mt-3">
              <strong>Credit Impact:</strong> While we initially perform a soft credit inquiry (no score impact), applying for financing requires a hard credit pull which may temporarily affect your credit score.
            </p>
            <p className="text-gray-700 leading-relaxed mt-3">
              <strong>Income Verification:</strong> All stated income and employment information is subject to verification. False information may result in application denial and potential legal consequences.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Third-Party Links</h2>
            <p className="text-gray-700 leading-relaxed">
              Our website may contain links to third-party websites (manufacturer sites, credit bureaus, financial institutions). We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">No Professional Advice</h2>
            <p className="text-gray-700 leading-relaxed">
              The information on our website does not constitute financial, legal, or tax advice. You should consult with appropriate professionals regarding your specific circumstances before making any financial decisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed">
              Cargwin LLC shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of our services, even if advised of the possibility of such damages.
            </p>
            <p className="text-gray-700 leading-relaxed mt-3">
              Our maximum liability for any claims shall not exceed the fees paid to us for our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Changes and Updates</h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify, suspend, or discontinue any aspect of our service at any time without notice. We also reserve the right to modify this disclaimer without prior notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Licensing Information</h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-700"><strong>Legal Name:</strong> Cargwin LLC</p>
              <p className="text-gray-700"><strong>Business Address:</strong> 2855 Michelle Dr, Office 180, Irvine, CA 92606</p>
              <p className="text-gray-700"><strong>California Auto Broker License:</strong> [License Number]</p>
              <p className="text-gray-700"><strong>NMLS ID:</strong> [NMLS Number]</p>
              <p className="text-gray-700 mt-3 text-sm">Licensed to operate in: California (additional states may apply)</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              For questions about this disclaimer:
            </p>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-700">Email: legal@cargwin.com</p>
              <p className="text-gray-700">Phone: +1 (747) CARGWIN</p>
            </div>
          </section>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Disclaimer;
