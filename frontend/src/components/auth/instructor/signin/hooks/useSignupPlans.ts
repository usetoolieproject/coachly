import { useState, useEffect } from 'react';
import { apiFetch } from '../../../../../services/api';

interface Plan {
  id: string;
  name: string;
  description: string;
  base_price_cents: number;
  features: string[];
}

export const useSignupPlans = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiFetch('/subscription-plans/active');
        
        // Transform plans to match PlanSelector interface
        const transformedPlans = data.map((plan: any) => ({
          id: plan.id,
          name: plan.name,
          description: plan.description,
          price: Math.round(plan.base_price_cents / 100), 
          features: Array.isArray(plan.features) ? plan.features : []
        }));
        
        setPlans(transformedPlans);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch plans');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  return { plans, loading, error };
};

