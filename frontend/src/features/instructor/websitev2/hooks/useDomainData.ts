import { useAuth } from '../../../../contexts/AuthContext';

export const useDomainData = () => {
  const { user } = useAuth();
  
  console.log('useDomainData - user:', user);
  console.log('useDomainData - user.instructor:', user?.instructor);
  
  if (!user || user.role !== 'instructor') {
    console.log('useDomainData - no user or not instructor, returning defaults');
    return {
      subdomain: 'your-community',
      customDomain: '',
      businessName: 'Your Business'
    };
  }
  
  const domainData = {
    subdomain: user.instructor?.subdomain || 'your-community',
    customDomain: user.instructor?.custom_domain || '',
    businessName: user.instructor?.business_name || 'Your Business'
  };
  
  console.log('useDomainData - returning domain data:', domainData);
  return domainData;
};
