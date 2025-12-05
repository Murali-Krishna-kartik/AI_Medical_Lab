// Email validation utility
export const validateEmail = (email) => {
  const errors = [];
  
  // Basic format check
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    errors.push("Please enter a valid email address");
    return { isValid: false, errors };
  }
  
  // Additional checks
  if (email.length > 254) {
    errors.push("Email address is too long (max 254 characters)");
  }
  
  // Check for common typos
  const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com'];
  const domain = email.split('@')[1]?.toLowerCase();
  const suggestions = [];
  
  if (domain) {
    // Check for common typos in domains
    const typoMap = {
      'gmial.com': 'gmail.com',
      'gmai.com': 'gmail.com',
      'yahooo.com': 'yahoo.com',
      'hotmial.com': 'hotmail.com',
      'outlok.com': 'outlook.com'
    };
    
    if (typoMap[domain]) {
      suggestions.push(`Did you mean ${email.replace(domain, typoMap[domain])}?`);
    }
  }
  
  // Check for suspicious patterns
  if (email.includes('..')) {
    errors.push("Email cannot contain consecutive dots");
  }
  
  if (email.startsWith('.') || email.endsWith('.')) {
    errors.push("Email cannot start or end with a dot");
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    suggestions,
    strength: errors.length === 0 ? 'valid' : 'invalid'
  };
};

// Password strength validation
export const validatePassword = (password) => {
  const errors = [];
  const suggestions = [];
  let score = 0;
  
  // Length check
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  } else if (password.length >= 8) {
    score += 1;
  }
  
  if (password.length >= 12) {
    score += 1;
  }
  
  // Character type checks
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  if (!hasLowercase) {
    errors.push("Password must contain at least one lowercase letter");
  } else {
    score += 1;
  }
  
  if (!hasUppercase) {
    errors.push("Password must contain at least one uppercase letter");
  } else {
    score += 1;
  }
  
  if (!hasNumbers) {
    errors.push("Password must contain at least one number");
  } else {
    score += 1;
  }
  
  if (!hasSpecialChars) {
    errors.push("Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;':\",./<>?)");
  } else {
    score += 1;
  }
  
  // Common password checks
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
    'admin', 'letmein', 'welcome', 'monkey', '1234567890', 'password1'
  ];
  
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push("This password is too common. Please choose a more unique password");
    score = Math.max(0, score - 2);
  }
  
  // Sequential characters check
  const hasSequential = /(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|123|234|345|456|567|678|789)/i.test(password);
  if (hasSequential) {
    suggestions.push("Avoid using sequential characters (abc, 123, etc.)");
    score = Math.max(0, score - 1);
  }
  
  // Repeated characters check
  const hasRepeated = /(.)\1{2,}/.test(password);
  if (hasRepeated) {
    suggestions.push("Avoid using repeated characters (aaa, 111, etc.)");
    score = Math.max(0, score - 1);
  }
  
  // Determine strength
  let strength = 'very-weak';
  let strengthText = 'Very Weak';
  let strengthColor = '#ff4444';
  
  if (score >= 6) {
    strength = 'very-strong';
    strengthText = 'Very Strong';
    strengthColor = '#00aa00';
  } else if (score >= 5) {
    strength = 'strong';
    strengthText = 'Strong';
    strengthColor = '#66aa00';
  } else if (score >= 4) {
    strength = 'medium';
    strengthText = 'Medium';
    strengthColor = '#aaaa00';
  } else if (score >= 2) {
    strength = 'weak';
    strengthText = 'Weak';
    strengthColor = '#ff8800';
  }
  
  // Add suggestions for improvement
  if (score < 6) {
    if (password.length < 12) {
      suggestions.push("Use at least 12 characters for better security");
    }
    if (!hasSpecialChars) {
      suggestions.push("Add special characters like !@#$%^&*");
    }
    if (!hasNumbers) {
      suggestions.push("Include numbers in your password");
    }
    if (!hasUppercase || !hasLowercase) {
      suggestions.push("Mix uppercase and lowercase letters");
    }
  }
  
  return {
    isValid: errors.length === 0 && score >= 4, // Require at least medium strength
    errors,
    suggestions,
    score,
    strength,
    strengthText,
    strengthColor,
    percentage: Math.min(100, (score / 6) * 100)
  };
};

// Name validation
export const validateName = (name) => {
  const errors = [];
  
  if (!name || name.trim().length < 2) {
    errors.push("Name must be at least 2 characters long");
  }
  
  if (name && name.length > 50) {
    errors.push("Name must be less than 50 characters");
  }
  
  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  const nameRegex = /^[a-zA-Z\s\-'\.]+$/;
  if (name && !nameRegex.test(name)) {
    errors.push("Name can only contain letters, spaces, hyphens, and apostrophes");
  }
  
  // Check for suspicious patterns
  if (name && /\d/.test(name)) {
    errors.push("Name should not contain numbers");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Phone validation
export const validatePhone = (phone) => {
  const errors = [];
  
  if (!phone) {
    return { isValid: true, errors }; // Phone is optional for most users
  }
  
  // Remove all non-digit characters for validation
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (cleanPhone.length < 10) {
    errors.push("Phone number is less than 10 digits");
  }
  
  if (cleanPhone.length > 10) {
    errors.push("Phone number shouldnot exceed more than 10 digits");
  }
  
  // Basic format check
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  if (!phoneRegex.test(cleanPhone)) {
    errors.push("Please enter a valid phone number");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Form validation helper
export const validateForm = (formData, requiredFields = []) => {
  const errors = {};
  let isValid = true;
  
  // Check required fields
  requiredFields.forEach(field => {
    if (!formData[field] || formData[field].toString().trim() === '') {
      errors[field] = [`${field.charAt(0).toUpperCase() + field.slice(1)} is required`];
      isValid = false;
    }
  });
  
  // Validate email
  if (formData.email) {
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      errors.email = emailValidation.errors;
      isValid = false;
    }
  }
  
  // Validate password
  if (formData.password) {
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.errors;
      isValid = false;
    }
  }
  
  // Validate name
  if (formData.name) {
    const nameValidation = validateName(formData.name);
    if (!nameValidation.isValid) {
      errors.name = nameValidation.errors;
      isValid = false;
    }
  }
  
  // Validate phone (if provided)
  if (formData.phone) {
    const phoneValidation = validatePhone(formData.phone);
    if (!phoneValidation.isValid) {
      errors.phone = phoneValidation.errors;
      isValid = false;
    }
  }
  
  return {
    isValid,
    errors
  };
};