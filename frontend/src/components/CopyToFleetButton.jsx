import React, { useState } from 'react';
import { Button } from './ui/button';
import { Copy, Check } from 'lucide-react';

const CopyToFleetButton = ({ application, user }) => {
  const [copied, setCopied] = useState(false);

  const generateFleetText = () => {
    const app = application;
    const u = user || app.user_data;
    
    return `
═══════════════════════════════════════════
FLEET DEPARTMENT - NEW APPLICATION
═══════════════════════════════════════════

CLIENT INFORMATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: ${u.name || 'N/A'}
Email: ${u.email || 'N/A'}
Phone: ${u.phone || 'N/A'}
Date of Birth: ${u.date_of_birth || 'N/A'}
Driver's License: ${u.drivers_license_number || 'N/A'}
SSN: ***-**-${u.ssn?.slice(-4) || 'N/A'}

IMMIGRATION STATUS:
${u.immigration_status || 'N/A'}

EMPLOYMENT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Employer: ${u.employer_name || 'N/A'}
Job Title: ${u.job_title || 'N/A'}
Employment Type: ${u.employment_type || 'N/A'} (Self/1099/W2)
Time at Job: ${u.time_at_job_months || 'N/A'} months
Monthly Income (Pre-tax, 6mo avg): $${(u.monthly_income_pretax || 0).toLocaleString()}
Annual Income: $${(u.annual_income || 0).toLocaleString()}
Verified Income: $${(app.verified_income || 'Not verified')}

ADDRESS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Current Address: ${u.current_address || 'N/A'}
Time at Address: ${u.current_address_duration_months || 'N/A'} months
${u.current_address_duration_months < 24 ? `Previous Address: ${u.previous_address || 'N/A'}` : ''}

VEHICLE REQUEST:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Primary Choice: ${app.lot_data?.year} ${app.lot_data?.make} ${app.lot_data?.model}
Fleet Price: $${(app.lot_data?.fleet_price || 0).toLocaleString()}
Lease/Finance: ${app.financing_type || 'Lease'}
Down Payment: $${(u.down_payment_ready || 3000).toLocaleString()}

ALTERNATIVES:
${app.alternatives?.map((alt, idx) => `${idx + 1}. ${alt.title} - $${alt.monthly}/mo (${alt.type})`).join('\n') || 'None selected'}

TRADE-IN:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${app.trade_in ? `
VIN: ${app.trade_in.vin}
Vehicle: ${app.trade_in.year} ${app.trade_in.make} ${app.trade_in.model}
Mileage: ${app.trade_in.mileage?.toLocaleString()} miles
Condition: ${app.trade_in.condition}
Estimated Value: $${app.trade_in.kbb_value?.toLocaleString()}
` : 'No trade-in'}

CREDIT INFO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Credit Score: ${u.credit_score || 'N/A'}
${app.prescoring_data ? `
Prescoring Results:
- Credit Tier: ${app.prescoring_data.credit_tier}
- Approval Probability: ${app.prescoring_data.approval_probability}
- Max Approved Amount: $${app.prescoring_data.max_approved_amount?.toLocaleString()}
- Recommended Down: $${app.prescoring_data.recommended_down_payment?.toLocaleString()}
` : ''}

MANAGER NOTES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${app.manager_comments || 'No comments'}

═══════════════════════════════════════════
Application ID: ${app.id || app._id}
Date: ${new Date().toLocaleString()}
═══════════════════════════════════════════
    `.trim();
  };

  const handleCopy = () => {
    const text = generateFleetText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      onClick={handleCopy}
      variant="outline"
      className="flex items-center gap-2"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-green-600" />
          Copied to Clipboard!
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          Copy to Fleet Department
        </>
      )}
    </Button>
  );
};

export default CopyToFleetButton;