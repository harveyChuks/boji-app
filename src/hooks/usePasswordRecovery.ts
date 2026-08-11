import { useEffect } from 'react';
import { useNavigate, useLocation } from '@/lib/router-compat';

export const usePasswordRecovery = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if URL contains password recovery hash
    const hash = window.location.hash.substring(1);
    const hashParams = new URLSearchParams(hash);
    const type = hashParams.get('type');
    const accessToken = hashParams.get('access_token');
    
    // If we have a recovery type and access token, redirect to reset password page
    // Keep the hash so ResetPassword page can access the tokens
    if (type === 'recovery' && accessToken) {
      navigate('/reset-password' + window.location.hash, { replace: true });
    }
  }, [navigate, location]);
};
