export type PlanId = 'free' | 'pro' | 'business';

export interface PlanLimits {
  maxMessages: number;
  maxProjects: number;
  watermark: boolean;
}

export const PLANS: Record<PlanId, {
  name: string;
  price: string;
  period: string;
  description: string;
  color: string;
  features: { text: string; included: boolean }[];
  limits: PlanLimits;
  highlighted?: boolean;
}> = {
  free: {
    name: 'Free',
    price: '0 TND',
    period: 'forever',
    description: 'Try ChatVid with no commitment.',
    color: '#6b7280',
    features: [
      { text: '1 saved project',             included: true  },
      { text: 'Up to 3 messages per export', included: true  },
      { text: 'All chat themes',             included: true  },
      { text: 'Watermark on exports',        included: true  },
      { text: 'No watermark',                included: false },
      { text: 'Unlimited projects',          included: false },
      { text: 'Priority support',            included: false },
    ],
    limits: { maxMessages: 3, maxProjects: 1, watermark: true },
  },
  pro: {
    name: 'Pro',
    price: '59 TND',
    period: '/month',
    description: 'For creators who publish regularly.',
    color: '#6366f1',
    highlighted: true,
    features: [
      { text: 'Unlimited messages per export', included: true  },
      { text: 'Unlimited projects',            included: true  },
      { text: 'All chat themes',               included: true  },
      { text: 'All aspect ratios',             included: true  },
      { text: 'No watermark',                  included: true  },
      { text: 'Priority support',              included: true  },
      { text: 'Dedicated account manager',     included: false },
    ],
    limits: { maxMessages: 999, maxProjects: 999, watermark: false },
  },
  business: {
    name: 'Business',
    price: '149 TND',
    period: '/month',
    description: 'For agencies and power users.',
    color: '#8b5cf6',
    features: [
      { text: 'Unlimited messages per export',  included: true },
      { text: 'Unlimited projects',             included: true },
      { text: 'All chat themes',                included: true },
      { text: 'All aspect ratios',              included: true },
      { text: 'No watermark',                   included: true },
      { text: 'Priority support',               included: true },
      { text: 'Dedicated account manager',      included: true },
    ],
    limits: { maxMessages: 999, maxProjects: 999, watermark: false },
  },
};

export function getPlanLimits(plan?: string | null): PlanLimits {
  return PLANS[(plan as PlanId) ?? 'free']?.limits ?? PLANS.free.limits;
}
