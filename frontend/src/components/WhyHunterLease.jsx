import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import { Database, Calculator, MessageCircle } from 'lucide-react';

export default function WhyHunterLease() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Database className="w-12 h-12 text-red-600" />,
      title: "Real Bank Programs",
      description: "Programs parsed from official captive finance banks (Toyota, Honda, BMW, Mercedes)."
    },
    {
      icon: <Calculator className="w-12 h-12 text-red-600" />,
      title: "Transparent Calculations",
      description: "Full breakdown. No dealer markups. Real MF and residuals from banks."
    },
    {
      icon: <MessageCircle className="w-12 h-12 text-red-600" />,
      title: "Big Savings",
      description: "Clients save $3,000–$8,000 vs dealership prices with our fleet programs."
    },
    {
      icon: <svg className="w-12 h-12 text-red-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>,
      title: "Works Nationwide",
      description: "All major brands. All regions. California, Western, Pacific, and more."
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Why Hunter.Lease?</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            We bring you the same lease deals that fleet managers get — not retail markup
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow text-center"
            >
              <div className="flex justify-center mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
