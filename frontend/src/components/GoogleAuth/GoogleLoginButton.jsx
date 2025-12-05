import React, { useState, useEffect } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { toast } from 'react-toastify';
import { BASE_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const GoogleLoginButton = ({ role = 'patient', className = '', isSignup = false }) => {
  const [loading, setLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if Google Client ID is configured
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || clientId === 'your_google_client_id_here') {
      console.warn('Google Client ID not configured');
      return;
    }

    const initializeGoogleSignIn = () => {
      try {
        if (window.google && window.google.accounts && window.google.accounts.id) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });
          
          setGoogleReady(true);
          console.log('Google Sign-In initialized successfully');
        } else {
          console.warn('Google services not available yet, retrying...');
          // Retry after a short delay
          setTimeout(initializeGoogleSignIn, 500);
        }
      } catch (error) {
        console.error('Error initializing Google Sign-In:', error);
        setGoogleReady(false);
      }
    };

    // Since the script is loaded in index.html, we just need to wait for it
    if (window.google && window.google.accounts) {
      initializeGoogleSignIn();
    } else {
      // Wait for the script to load
      const checkGoogleLoaded = setInterval(() => {
        if (window.google && window.google.accounts) {
          clearInterval(checkGoogleLoaded);
          initializeGoogleSignIn();
        }
      }, 100);

      // Clear interval after 10 seconds to avoid infinite checking
      setTimeout(() => {
        clearInterval(checkGoogleLoaded);
        if (!googleReady) {
          console.error('Google Identity Services failed to load within 10 seconds');
        }
      }, 10000);
    }
  }, [googleReady]);

  const handleGoogleLogin = async () => {
    // Check if Google Client ID is configured
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || clientId === 'your_google_client_id_here') {
      toast.error('Google authentication is not configured. Please contact the administrator.');
      return;
    }

    // For signup, validate role selection
    if (isSignup && (!role || role === 'select' || role === 'auto-detect')) {
      toast.error('Please select a role before signing up with Google');
      return;
    }

    if (!googleReady || !window.google) {
      toast.error('Google services are not ready. Please refresh the page and try again.');
      return;
    }

    setLoading(true);
    
    try {
      // Use renderButton approach as fallback for better compatibility
      const buttonContainer = document.createElement('div');
      buttonContainer.style.position = 'absolute';
      buttonContainer.style.top = '-9999px';
      buttonContainer.style.left = '-9999px';
      document.body.appendChild(buttonContainer);

      window.google.accounts.id.renderButton(buttonContainer, {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        shape: 'rectangular',
        text: 'signin_with',
        logo_alignment: 'left'
      });

      // Trigger the hidden button
      const hiddenButton = buttonContainer.querySelector('div[role="button"]');
      if (hiddenButton) {
        hiddenButton.click();
      } else {
        // Fallback to prompt method
        window.google.accounts.id.prompt((notification) => {
          console.log('Google prompt notification:', notification);
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            toast.info('Google sign-in popup was blocked or cancelled');
            setLoading(false);
          }
        });
      }

      // Clean up the hidden button after a delay
      setTimeout(() => {
        if (buttonContainer && buttonContainer.parentNode) {
          buttonContainer.parentNode.removeChild(buttonContainer);
        }
      }, 1000);

    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Failed to initialize Google login. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogleResponse = async (response) => {
    console.log('Google response received:', response);
    
    try {
      const { credential } = response;
      
      if (!credential) {
        toast.error('No credential received from Google');
        setLoading(false);
        return;
      }

      console.log('Sending credential to backend...');

      // Send the credential to your backend with better error handling
      const res = await fetch(`${BASE_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          token: credential,
          role: role,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log('Backend response:', data);

      if (data.success) {
        // Login successful
        login(data.token, data.data, data.role);
        
        toast.success(data.message);
        
        // Navigate based on role
        if (data.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (data.role === 'doctor') {
          navigate('/doctors/profile/me');
        } else {
          navigate('/users/profile/me');
        }
      } else {
        toast.error(data.message || 'Google login failed');
      }
    } catch (error) {
      console.error('Google authentication error:', error);
      toast.error('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Check if Google Client ID is configured
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const isConfigured = clientId && clientId !== 'your_google_client_id_here';

  if (!isConfigured) {
    return (
      <div className={`w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 ${className}`}>
        <FcGoogle className="w-5 h-5 opacity-50" />
        <span className="text-gray-500 font-medium">
          Google Sign-In (Not Configured)
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={handleGoogleLogin}
      disabled={loading || !googleReady || (isSignup && (!role || role === 'select'))}
      className={`w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
      ) : (
        <FcGoogle className="w-5 h-5" />
      )}
      <span className="text-gray-700 font-medium">
        {loading ? 'Signing in...' : 
         role === 'auto-detect' ? 'Continue with Google' :
         role === 'select' ? 'Select role first' :
         isSignup ? `Sign up with Google as ${role}` :
         `Continue with Google${role !== 'patient' ? ` as ${role}` : ''}`}
      </span>
    </button>
  );
};

export default GoogleLoginButton;