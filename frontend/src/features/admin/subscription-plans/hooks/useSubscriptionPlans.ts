import { useState, useEffect } from 'react';
import { SubscriptionPlan, CreatePlanData, UpdatePlanData } from '../types';
import { subscriptionPlansService } from '../services/subscriptionPlansService';

export const useSubscriptionPlans = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await subscriptionPlansService.getAllPlans();
      setPlans(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch plans');
    } finally {
      setLoading(false);
    }
  };

  const createPlan = async (planData: CreatePlanData): Promise<SubscriptionPlan> => {
    try {
      const newPlan = await subscriptionPlansService.createPlan(planData);
      setPlans(prev => [...prev, newPlan]);
      return newPlan;
    } catch (err) {
      throw err;
    }
  };

  const updatePlan = async (id: string, planData: UpdatePlanData): Promise<SubscriptionPlan> => {
    try {
      const updatedPlan = await subscriptionPlansService.updatePlan(id, planData);
      setPlans(prev => prev.map(plan => plan.id === id ? updatedPlan : plan));
      return updatedPlan;
    } catch (err) {
      throw err;
    }
  };

  const toggleVisibility = async (id: string, isVisible: boolean): Promise<void> => {
    try {
      const updated = await subscriptionPlansService.toggleVisibility(id, isVisible);
      setPlans(prev => prev.map(plan => plan.id === id ? updated : plan));
    } catch (err) {
      throw err;
    }
  };

  const togglePromo = async (id: string, promoEnabled: boolean): Promise<void> => {
    try {
      const updatedPlan = await subscriptionPlansService.togglePromo(id, promoEnabled);
      setPlans(prev => prev.map(plan => plan.id === id ? updatedPlan : plan));
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchPlans();
    const handler = () => fetchPlans();
    window.addEventListener('subscription-plans:refresh', handler);
    return () => window.removeEventListener('subscription-plans:refresh', handler);
  }, []);

  return {
    plans,
    loading,
    error,
    createPlan,
    updatePlan,
    toggleVisibility,
    togglePromo,
    refetch: fetchPlans,
  };
};

export const useActivePlans = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivePlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await subscriptionPlansService.getActivePlans();
      setPlans(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch active plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivePlans();
  }, []);

  return {
    plans,
    loading,
    error,
    refetch: fetchActivePlans,
  };
};
