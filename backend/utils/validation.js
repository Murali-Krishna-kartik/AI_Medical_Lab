// Email validation with comprehensive checks
export const validateEmail = (email) => {
  const errors = [];
  
  if (!email) {
    errors.push("Email is required");
    return { isValid: false, errors };
  }
  
  // Basic format validation using regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    errors.push("Please enter a valid email address");
  }
  
  // Length check
  if (email.length > 254) {
    errors.push("Email address is too long (max 254 characters)");
  }
  
  // Check for suspicious patterns
  if (email.includes('..')) {
    errors.push("Email cannot contain consecutive dots");
  }
  
  if (email.startsWith('.') || email.endsWith('.')) {
    errors.push("Email cannot start or end with a dot");
  }
  
  // Check for common disposable email domains
  const disposableDomains = [
    '10minutemail.com', 'tempmail.org', 'guerrillamail.com', 
    'mailinator.com', 'throwaway.email', 'temp-mail.org'
  ];
  
  const domain = email.split('@')[1]?.toLowerCase();
  if (domain && disposableDomains.includes(domain)) {
    errors.push("Disposable email addresses are not allowed");
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitized: email.toLowerCase().trim()
  };
};

// Password strength validation
export const validatePassword = (password) => {
  const errors = [];
  let score = 0;
  
  if (!password) {
    errors.push("Password is required");
    return { isValid: false, errors, score: 0 };
  }
  
  // Length requirements
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  } else {
    score += 1;
  }
  
  if (password.length >= 12) {
    score += 1;
  }
  
  // Character type requirements
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
    errors.push("Password must contain at least one special character");
  } else {
    score += 1;
  }
  
  // Common password checks
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
    'admin', 'letmein', 'welcome', 'monkey', '1234567890', 'password1',
    'iloveyou', 'princess', 'rockyou', 'babygirl', 'michael', 'loveme'
  ];
  
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push("This password is too common. Please choose a more unique password");
    score = Math.max(0, score - 2);
  }
  
  // Sequential characters check
  const hasSequential = /(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|123|234|345|456|567|678|789)/i.test(password);
  if (hasSequential) {
    errors.push("Password should not contain sequential characters (abc, 123, etc.)");
    score = Math.max(0, score - 1);
  }
  
  // Repeated characters check
  const hasRepeated = /(.)\1{2,}/.test(password);
  if (hasRepeated) {
    errors.push("Password should not contain repeated characters (aaa, 111, etc.)");
    score = Math.max(0, score - 1);
  }
  
  // Minimum score requirement (at least basic strength)
  const isValid = errors.length === 0 && score >= 2;
  
  return {
    isValid,
    errors,
    score,
    strength: score >= 6 ? 'very-strong' : score >= 5 ? 'strong' : score >= 4 ? 'medium' : score >= 2 ? 'weak' : 'very-weak'
  };
};

// Name validation
export const validateName = (name) => {
  const errors = [];
  
  if (!name || !name.trim()) {
    errors.push("Name is required");
    return { isValid: false, errors };
  }
  
  const trimmedName = name.trim();
  
  if (trimmedName.length < 2) {
    errors.push("Name must be at least 2 characters long");
  }
  
  if (trimmedName.length > 50) {
    errors.push("Name must be less than 50 characters");
  }
  
  // Check for valid characters (letters, spaces, hyphens, apostrophes, dots)
  const nameRegex = /^[a-zA-Z\s\-'\.]+$/;
  if (!nameRegex.test(trimmedName)) {
    errors.push("Name can only contain letters, spaces, hyphens, and apostrophes");
  }
  
  // Check for numbers
  if (/\d/.test(trimmedName)) {
    errors.push("Name should not contain numbers");
  }
  
  // Check for excessive spaces
  if (/\s{2,}/.test(trimmedName)) {
    errors.push("Name should not contain multiple consecutive spaces");
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitized: trimmedName.replace(/\s+/g, ' ') // Replace multiple spaces with single space
  };
};

// Phone validation
export const validatePhone = (phone, required = false) => {
  const errors = [];
  
  if (!phone || !phone.trim()) {
    if (required) {
      errors.push("Phone number is required");
    }
    return { isValid: !required, errors };
  }
  
  // Remove all non-digit characters for validation
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (cleanPhone.length < 10) {
    errors.push("Phone number must be at least 10 digits");
  }
  
  if (cleanPhone.length > 15) {
    errors.push("Phone number must be less than 15 digits");
  }
  
  // Check for valid phone number pattern
  const phoneRegex = /^[\+]?[1-9][\d]{9,14}$/;
  if (!phoneRegex.test(cleanPhone)) {
    errors.push("Please enter a valid phone number");
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitized: cleanPhone
  };
};

// Role validation
export const validateRole = (role) => {
  const validRoles = ['patient', 'doctor', 'admin'];
  const errors = [];
  
  if (!role) {
    errors.push("Role is required");
    return { isValid: false, errors };
  }
  
  if (!validRoles.includes(role)) {
    errors.push("Invalid role. Must be patient, doctor, or admin");
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitized: role.toLowerCase()
  };
};

// Gender validation
export const validateGender = (gender) => {
  const validGenders = ['male', 'female', 'other'];
  const errors = [];
  
  if (!gender) {
    errors.push("Gender is required");
    return { isValid: false, errors };
  }
  
  if (!validGenders.includes(gender)) {
    errors.push("Invalid gender. Must be male, female, or other");
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitized: gender.toLowerCase()
  };
};

// Comprehensive form validation
export const validateRegistrationForm = (formData) => {
  const errors = {};
  let isValid = true;
  
  // Validate name
  const nameValidation = validateName(formData.name);
  if (!nameValidation.isValid) {
    errors.name = nameValidation.errors;
    isValid = false;
  }
  
  // Validate email
  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.errors;
    isValid = false;
  }
  
  // Validate password
  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.errors;
    isValid = false;
  }
  
  // Validate role
  const roleValidation = validateRole(formData.role);
  if (!roleValidation.isValid) {
    errors.role = roleValidation.errors;
    isValid = false;
  }
  
  // Validate gender
  const genderValidation = validateGender(formData.gender);
  if (!genderValidation.isValid) {
    errors.gender = genderValidation.errors;
    isValid = false;
  }
  
  // Validate phone (required for admin)
  const phoneRequired = formData.role === 'admin';
  const phoneValidation = validatePhone(formData.phone, phoneRequired);
  if (!phoneValidation.isValid) {
    errors.phone = phoneValidation.errors;
    isValid = false;
  }
  
  return {
    isValid,
    errors,
    sanitizedData: {
      name: nameValidation.sanitized || formData.name,
      email: emailValidation.sanitized || formData.email,
      role: roleValidation.sanitized || formData.role,
      gender: genderValidation.sanitized || formData.gender,
      phone: phoneValidation.sanitized || formData.phone,
      photo: formData.photo
    }
  };
};

// Login form validation
export const validateLoginForm = (formData) => {
  const errors = {};
  let isValid = true;
  
  // Validate email
  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.errors;
    isValid = false;
  }
  
  // Basic password check (not strength, just presence)
  if (!formData.password || !formData.password.trim()) {
    errors.password = ["Password is required"];
    isValid = false;
  }
  
  return {
    isValid,
    errors,
    sanitizedData: {
      email: emailValidation.sanitized || formData.email,
      password: formData.password,
      role: formData.role
    }
  };
};