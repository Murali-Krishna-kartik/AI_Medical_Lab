import React from 'react';
import { validatePassword } from '../../utils/validation';

const PasswordStrengthIndicator = ({ password, showDetails = true }) => {
  if (!password) return null;
  
  const validation = validatePassword(password);
  
  return (
    <div className="mt-2">
      {/* Strength Bar */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: `${validation.percentage}%`,
              backgroundColor: validation.strengthColor
            }}
          />
        </div>
        <span
          className="text-xs font-medium"
          style={{ color: validation.strengthColor }}
        >
          {validation.strengthText}
        </span>
      </div>
      
      {showDetails && (
        <>
          {/* Requirements Checklist */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <span className={password.length >= 8 ? 'text-green-600' : 'text-red-500'}>
                {password.length >= 8 ? '✓' : '✗'}
              </span>
              <span className={password.length >= 8 ? 'text-green-600' : 'text-gray-600'}>
                At least 8 characters
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-xs">
              <span className={/[a-z]/.test(password) ? 'text-green-600' : 'text-red-500'}>
                {/[a-z]/.test(password) ? '✓' : '✗'}
              </span>
              <span className={/[a-z]/.test(password) ? 'text-green-600' : 'text-gray-600'}>
                Lowercase letter
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-xs">
              <span className={/[A-Z]/.test(password) ? 'text-green-600' : 'text-red-500'}>
                {/[A-Z]/.test(password) ? '✓' : '✗'}
              </span>
              <span className={/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-600'}>
                Uppercase letter
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-xs">
              <span className={/\d/.test(password) ? 'text-green-600' : 'text-red-500'}>
                {/\d/.test(password) ? '✓' : '✗'}
              </span>
              <span className={/\d/.test(password) ? 'text-green-600' : 'text-gray-600'}>
                Number
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-xs">
              <span className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? 'text-green-600' : 'text-red-500'}>
                {/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? '✓' : '✗'}
              </span>
              <span className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? 'text-green-600' : 'text-gray-600'}>
                Special character
              </span>
            </div>
          </div>
          
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
          
          {/* Suggestions */}
          {validation.suggestions.length > 0 && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
              <ul className="text-yellow-700 space-y-1">
                {validation.suggestions.map((suggestion, index) => (
                  <li key={index}>💡 {suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;