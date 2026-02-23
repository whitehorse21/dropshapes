export interface SubscriptionPlan {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  interval: string;
  features?: string | null;
  resume_limit: number;
  cover_letter_limit: number;
  ai_credits_limit?: number | null;
  stripe_price_id?: string | null;
  current_period_start?: string | null;
  current_period_end?: string | null;
  created_at?: string;
  popular?: boolean;
  subscription_id?: string | null;
  payment_provider?: string | null;
}

export interface SubscriptionUsage {
  current_resumes: number;
  current_cover_letters: number;
  resume_limit: number | null;
  cover_letter_limit: number | null;
  subscription_plan?: string;
  usage?: { resume_count: number; cover_letter_count: number };
  limits?: { resume_limit: number; cover_letter_limit: number };
}
