import React from 'react';
import { Shield, Lock, CheckCircle, Clock, Phone } from 'lucide-react';

const SecurityTrustBanner = ({ context = 'general' }) => {
  const messages = {
    ssn_input: {
      title: "🔒 Bank-Level Security for Your SSN",
      points: [
        "AES-256 encryption (same as major banks)",
        "No hard credit pull - soft check only for pre-approval",
        "SSN never shared with dealers without your approval",
        "CCPA compliant - you control your data",
        "Prescoring does NOT affect your credit score"
      ],
      highlight: "Pre-Approval WITHOUT Hurting Your Credit"
    },
    general: {
      title: "Why It's Safe to Apply",
      points: [
        "✓ Soft credit check only - no impact on score",
        "✓ Pre-approval in 24 hours or less",
        "✓ No obligation until you sign final contract",
        "✓ Your data encrypted and CCPA protected",
        "✓ Cancel anytime before signing"
      ],
      highlight: "Get Pre-Approved Risk-Free"
    }
  };

  const content = messages[context] || messages.general;

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-lg p-6 my-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-3">{content.title}</h3>
          <ul className="space-y-2">
            {content.points.map((point, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 p-3 bg-white rounded border-2 border-green-400">
            <p className="font-bold text-green-900 text-center">
              {content.highlight}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityTrustBanner;