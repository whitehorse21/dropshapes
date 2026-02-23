'use client';

import React from 'react';
import { Check } from 'lucide-react';

interface FeaturesListProps {
  featuresString: string;
}

export default function FeaturesList({ featuresString }: FeaturesListProps) {
  const features = (featuresString || '')
    .split(',')
    .map((f) => f.trim())
    .filter(Boolean);

  return (
    <div className="subscription-features-list">
      {features.map((feature) => (
        <span key={feature} className="subscription-feature-item">
          <Check className="subscription-feature-check" aria-hidden />
          {feature}
        </span>
      ))}
    </div>
  );
}
