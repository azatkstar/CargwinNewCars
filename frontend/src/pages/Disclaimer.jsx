import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Disclaimer = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Disclaimer</h1>
        <p className="text-gray-600 mb-8">Important Legal Information</p>

        <div className="prose prose-lg max-w-none space-y-6">
          <div className="bg-red-50 border-2 border-red-200 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-red-900 mb-4">IMPORTANT NOTICE</h2>
            <p className="text-gray-800 font-medium">
              Cargwin LLC is an automotive information service and licensed broker. We DO NOT own, sell, 
              or lease vehicles. We are NOT a dealership.
            </p>
          </div>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">No Vehicle Ownership</h2>
            <p className="text-gray-700">
              CARGWIN LLC HAS NEVER: (1) Held title for any vehicle listed on our platform, 
              (2) Inspected any vehicle listed on our services, or (3) Had any vehicle in its legal possession.
            </p>
            <p className="text-gray-700 mt-3">
              We act solely as an information intermediary connecting consumers with licensed dealerships 
              and financing providers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">No Warranties or Guarantees</h2>
            <p className="text-gray-700">
              We expressly disclaim any responsibility and liability for:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>Vehicle condition, quality, or fitness for any particular purpose</li>
              <li>Accuracy of vehicle descriptions or specifications</li>
              <li>Dealership practices or service quality</li>
              <li>Financing terms or credit approval decisions</li>
              <li>Vehicle availability or delivery timelines</li>
              <li>Compliance with any laws, regulations, or safety codes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Pricing Information</h2>
            <p className="text-gray-700">
              All prices, payments, and terms shown are estimates based on information provided by 
              dealerships and lenders. Final pricing is subject to:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>Credit approval and individual creditworthiness</li>
              <li>Dealer confirmation and availability</li>
              <li>Incentive qualification and substantiation</li>
              <li>Applicable taxes, fees, and charges</li>
              <li>Changes in market conditions</li>
            </ul>
            <p className="text-gray-700 mt-3">
              We cannot guarantee that any displayed price or payment will be honored by dealerships.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Reservation Terms</h2>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <p className="font-semibold text-gray-900">Price Reservations:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1 text-gray-700">
                <li>Are informational holds only and non-binding</li>
                <li>Valid for 48 hours from creation</li>
                <li>Do not guarantee vehicle availability</li>
                <li>Subject to dealer confirmation upon conversion to application</li>
                <li>Prices may change based on credit approval</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Third-Party Transactions</h2>
            <p className="text-gray-700">
              Any purchase, lease, or finance agreement is directly between you and the dealership/lender. 
              Cargwin LLC is NOT a party to these contracts and cannot be held responsible for:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>Contract terms or conditions</li>
              <li>Vehicle delivery or condition</li>
              <li>Warranty coverage or service</li>
              <li>Payment disputes or collection issues</li>
              <li>Post-sale support or returns</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Credit Information</h2>
            <p className="text-gray-700">
              Credit scores and pre-qualification results are estimates only. We use FICO scoring models, 
              but dealerships may use different models resulting in different scores or terms. We are not 
              responsible for credit approval decisions made by lenders.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">"As-Is" Disclaimer</h2>
            <div className="bg-red-50 border-2 border-red-200 p-4 rounded-lg">
              <p className="font-semibold text-red-900">THE PLATFORM IS PROVIDED "AS IS"</p>
              <p className="text-gray-700 mt-2">
                WE MAKE NO WARRANTIES OR REPRESENTATIONS ABOUT THE ACCURACY, COMPLETENESS, OR 
                RELIABILITY OF ANY INFORMATION, PRICING, OR VEHICLE LISTINGS. YOUR USE OF OUR 
                SERVICES IS AT YOUR SOLE RISK.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">California Specific Disclosures</h2>
            <p className="text-gray-700">
              <strong>Broker License:</strong> Cargwin LLC operates as a licensed automotive broker in California.
            </p>
            <p className="text-gray-700 mt-3">
              <strong>Location:</strong> 2855 Michelle Dr, Office 180, Irvine, CA 92606
            </p>
            <p className="text-gray-700 mt-3">
              <strong>Consumer Protection:</strong> California consumers may file complaints with the 
              California Department of Consumer Affairs at (800) 952-5210.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Limitation of Liability</h2>
            <p className="text-gray-700">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, CARGWIN LLC SHALL NOT BE LIABLE FOR ANY 
              DAMAGES ARISING FROM YOUR USE OF OUR SERVICES, INCLUDING BUT NOT LIMITED TO VEHICLE 
              PURCHASE ISSUES, FINANCING PROBLEMS, OR DEALERSHIP DISPUTES.
            </p>
            <p className="text-gray-700 mt-3">
              Maximum liability is limited to $500 per incident.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Indemnification</h2>
            <p className="text-gray-700">
              You agree to indemnify and hold harmless Cargwin LLC from any claims, damages, or 
              expenses arising from:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>Your use of our platform or services</li>
              <li>Your dealings with dealerships or lenders</li>
              <li>Any misrepresentation of your information</li>
              <li>Violation of these terms or applicable laws</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Contact for Questions</h2>
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

export default Disclaimer;