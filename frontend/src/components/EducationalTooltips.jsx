import React from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card';
import { Info } from 'lucide-react';

// Educational tooltips for finance terms
export const APRTooltip = ({ children }) => (
  <HoverCard>
    <HoverCardTrigger asChild>
      <span className="inline-flex items-center gap-1 cursor-help border-b border-dotted border-gray-400">
        {children}
        <Info className="w-3 h-3 text-gray-400" />
      </span>
    </HoverCardTrigger>
    <HoverCardContent className="w-80">
      <h4 className="font-semibold mb-2">What is APR?</h4>
      <p className="text-sm text-gray-600">
        <strong>Annual Percentage Rate (APR)</strong> is the yearly cost of borrowing money, including interest and fees. 
        Lower APR means lower total cost.
      </p>
      <p className="text-sm text-gray-600 mt-2">
        Example: 8% APR on $30,000 over 60 months = ~$4,800 in interest
      </p>
    </HoverCardContent>
  </HoverCard>
);

export const MoneyFactorTooltip = ({ children }) => (
  <HoverCard>
    <HoverCardTrigger asChild>
      <span className="inline-flex items-center gap-1 cursor-help border-b border-dotted border-gray-400">
        {children}
        <Info className="w-3 h-3 text-gray-400" />
      </span>
    </HoverCardTrigger>
    <HoverCardContent className="w-80">
      <h4 className="font-semibold mb-2">What is Money Factor?</h4>
      <p className="text-sm text-gray-600">
        <strong>Money Factor</strong> is the lease equivalent of APR, shown as a small decimal.
      </p>
      <p className="text-sm text-gray-600 mt-2">
        <strong>Formula:</strong> Money Factor = APR ÷ 2400
      </p>
      <p className="text-sm text-gray-600 mt-2">
        Example: 0.00250 money factor = 6% APR
      </p>
    </HoverCardContent>
  </HoverCard>
);

export const ResidualValueTooltip = ({ children }) => (
  <HoverCard>
    <HoverCardTrigger asChild>
      <span className="inline-flex items-center gap-1 cursor-help border-b border-dotted border-gray-400">
        {children}
        <Info className="w-3 h-3 text-gray-400" />
      </span>
    </HoverCardTrigger>
    <HoverCardContent className="w-80">
      <h4 className="font-semibold mb-2">What is Residual Value?</h4>
      <p className="text-sm text-gray-600">
        <strong>Residual Value</strong> is the car's estimated worth at lease end. Higher residual = lower monthly payments.
      </p>
      <p className="text-sm text-gray-600 mt-2">
        Typically 50-60% of MSRP for 36-month leases. You can buy the car for this amount at lease end.
      </p>
    </HoverCardContent>
  </HoverCard>
);

export const DueAtSigningTooltip = ({ children }) => (
  <HoverCard>
    <HoverCardTrigger asChild>
      <span className="inline-flex items-center gap-1 cursor-help border-b border-dotted border-gray-400">
        {children}
        <Info className="w-3 h-3 text-gray-400" />
      </span>
    </HoverCardTrigger>
    <HoverCardContent className="w-80">
      <h4 className="font-semibold mb-2">What's Due at Signing?</h4>
      <p className="text-sm text-gray-600">
        Money you pay upfront when signing the lease, typically includes:
      </p>
      <ul className="text-sm text-gray-600 mt-2 list-disc ml-4 space-y-1">
        <li>First month's payment</li>
        <li>Acquisition fee</li>
        <li>Registration & DMV fees</li>
        <li>Taxes on down payment</li>
      </ul>
    </HoverCardContent>
  </HoverCard>
);