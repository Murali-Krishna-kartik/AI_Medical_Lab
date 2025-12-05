import React from 'react';
import { validateEmail } from '../../utils/validation';

const EmailValidator = ({ email, showDetails = true }) => {
  if (!email) return null;
  
  const validation = validateEmail(email);
  
  return (
    <div className="mt-2">
      {/* Status Indicator */}
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-xs font-medium ${validation.isValid ? 'text-green-600' : 'text-red-500'}`}>
          {validation.isValid ? '✓ Valid email' : '✗ Invalid email'}
        </span>
      </div>
      
      {showDetails && (
        <>
          {/* Suggestions for typos */}
          {validation.suggestions && validation.suggestions.length > 0 && (
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
              <ul className="text-blue-700 space-y-1">
                {validation.suggestions.map((suggestion, index) => (
                  <li key={index}>💡 {suggestion}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Errors */}
          {validation.errors.length > 0 && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
              <ul className="text-red-600 space-y-1">
                {validation.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EmailValidator;