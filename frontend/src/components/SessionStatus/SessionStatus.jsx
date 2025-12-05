import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTimeUntilExpiry, formatTimeRemaining, isTokenExpiringSoon } from '../../utils/tokenManager';

const SessionStatus = () => {
  const { isAuthenticated, logout } = useAuth();
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    const updateTimer = () => {
      const remaining = getTimeUntilExpiry();
      setTimeRemaining(remaining);
      
      // Show warning if less than 5 minutes remaining
      const expiringSoon = isTokenExpiringSoon();
      setShowWarning(expiringSoon && remaining > 0);
      
      // Auto logout if expired
      if (remaining <= 0) {
        logout();
      }
    };

    // Update immediately
    updateTimer();

    // Update every 30 seconds
    const interval = setInterval(updateTimer, 30 * 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, logout]);

  if (!isAuthenticated || timeRemaining <= 0) {
    return null;
  }

  return (
    <>
      {showWarning && (
        <div className="fixed top-4 right-4 z-50 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded shadow-lg max-w-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">Session Expiring Soon</p>
              <p className="text-xs">
                Your session will expire in {formatTimeRemaining(timeRemaining)}
              </p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setShowWarning(false)}
                className="text-yellow-500 hover:text-yellow-600"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Session timer in header/status bar */}
      <div className="text-xs text-gray-500 flex items-center space-x-1">
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Session: {formatTimeRemaining(timeRemaining)}</span>
      </div>
    </>
  );
};

export default SessionStatus;