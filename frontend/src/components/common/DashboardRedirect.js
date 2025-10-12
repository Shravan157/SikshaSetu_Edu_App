import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const DashboardRedirect = () => {
  const { getRoleBasedDashboardRoute, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      const dashboardRoute = getRoleBasedDashboardRoute();
      navigate(dashboardRoute, { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [navigate, getRoleBasedDashboardRoute, isAuthenticated]);

  return null; // This component doesn't render anything
};

export default DashboardRedirect;