import React from 'react';
import { useLocation } from 'react-router-dom';
import { AdminOverview } from './overview';
import { PlansList, useSubscriptionPlans } from './subscription-plans';
import { PromoCodesList } from './promo-codes';
import AdminProfile from './components/AdminProfile';

const AdminDashboard: React.FC = () => {
  const location = useLocation();
  const {
    plans,
    loading,
    createPlan,
    updatePlan,
    toggleVisibility,
    togglePromo,
  } = useSubscriptionPlans();

  const renderContent = () => {
    const path = location.pathname;
    
    if (path.includes('/payments')) {
      return (
        <PlansList
          plans={plans}
          loading={loading}
          onCreatePlan={createPlan}
          onUpdatePlan={updatePlan}
          onToggleVisibility={toggleVisibility}
          onTogglePromo={togglePromo}
        />
      );
    } else if (path.includes('/promo-codes')) {
      return <PromoCodesList />;
    } else if (path.includes('/profile')) {
      return <AdminProfile />;
    } else {
      return <AdminOverview />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white min-h-screen">
      {/* Content */}
      <div>
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
