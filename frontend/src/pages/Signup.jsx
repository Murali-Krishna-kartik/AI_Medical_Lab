import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import signupImg from "../assets/images/signup.gif";
import uploadImageToCloudinary from "../utils/uploadCloudinary";
import { BASE_URL } from "../config.js";
import { toast } from "react-toastify";
import HashLoader from "react-spinners/HashLoader";
import { validateForm, validateEmail, validatePassword, validateName, validatePhone } from "../utils/validation";
import PasswordStrengthIndicator from "../components/Validation/PasswordStrengthIndicator";
import EmailValidator from "../components/Validation/EmailValidator";
import GoogleLoginButton from "../components/GoogleAuth/GoogleLoginButton";

const Signup = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [showValidation, setShowValidation] = useState({
    email: false,
    password: false,
    name: false,
    phone: false
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    photo: selectedFile,
    gender: "",
    role: "select",
    phone: "", // Add phone field for admin registration
  });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Show validation for the field being edited
    setShowValidation({ ...showValidation, [name]: true });
    
    // Clear previous validation errors for this field
    if (validationErrors[name]) {
      const newErrors = { ...validationErrors };
      delete newErrors[name];
      setValidationErrors(newErrors);
    }
  };
  const handleFileInputChange = async (event) => {
    const file = event.target.files[0];
    const data = await uploadImageToCloudinary(file);

    setPreviewUrl(data.url);
    setSelectedFile(data.url);
    setFormData({ ...formData, photo: data.url });

    // console.log(data);
    //late we use it
    // console.log(file);
  };
  const submitHandler = async (event) => {
    event.preventDefault();
    
    // Validate form before submission
    const requiredFields = ['name', 'email', 'password', 'role', 'gender'];
    if (formData.role === 'admin') {
      requiredFields.push('phone');
    }
    
    const validation = validateForm(formData, requiredFields);
    
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      setShowValidation({
        email: true,
        password: true,
        name: true,
        phone: true
      });
      
      // Show first error in toast
      const firstError = Object.values(validation.errors)[0];
      if (firstError && firstError.length > 0) {
        toast.error(firstError[0]);
      }
      return;
    }
    
    // Additional password strength check
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      toast.error("Please choose a stronger password");
      setShowValidation({ ...showValidation, password: true });
      return;
    }
    
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const { message } = await res.json();
      if (!res.ok) {
        throw new Error(message);
      }

      setLoading(false);
      toast.success(message);
      navigate("/login");
    } catch (err) {
      toast.error(err.message);
      setLoading(false);
    }
  };
  return (
    <section className="px-5 xl:px-0">
      <div className="max-w-[1170px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* ========== img box ========== */}
          <div className="hidden lg:block bg-primaryColor rounded-l-lg">
            <figure className="rounded-l-lg">
              <img src={signupImg} alt="" className="w-full rounded-l-lg" />
            </figure>
          </div>

          {/* ========== img box ========== */}
          <div className="rounded-l-lg lg:pl-16 py-10">
            <h3 className="text-headingColor text-[22px] leading-9 font-bold mb-10">
              Create an <span className="text-primaryColor">account</span>
            </h3>
            {formData.role === "admin" && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">
                      <strong>Admin Registration:</strong> You're creating an administrator account. This will give you full access to system management, user administration, and analytics. Please ensure you have authorization to create an admin account.
                    </p>
                  </div>
                </div>
              </div>
            )}
            <form onSubmit={submitHandler}>
              <div className="mb-5">
                <input
                  type="text"
                  placeholder="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full pr-4 py-3 border-b border-solid focus:outline-none text-[16px] leading-7 text-headingColor placeholder:text-textColor cursor-pointer ${
                    validationErrors.name ? 'border-red-500 focus:border-red-500' : 'border-[#0066ff61] focus:border-b-primaryColor'
                  }`}
                  required
                />
                {showValidation.name && formData.name && (
                  <div className="mt-1">
                    {validateName(formData.name).errors.map((error, index) => (
                      <p key={index} className="text-red-500 text-xs">• {error}</p>
                    ))}
                  </div>
                )}
              </div>
              <div className="mb-5">
                <input
                  type="email"
                  placeholder="Enter Your Email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pr-4 py-3 border-b border-solid focus:outline-none text-[16px] leading-7 text-headingColor placeholder:text-textColor cursor-pointer ${
                    validationErrors.email ? 'border-red-500 focus:border-red-500' : 'border-[#0066ff61] focus:border-b-primaryColor'
                  }`}
                  required
                />
                {showValidation.email && formData.email && (
                  <EmailValidator email={formData.email} showDetails={true} />
                )}
              </div>
              <div className="mb-5">
                <input
                  type="password"
                  placeholder="Password (min 8 chars, mix of upper/lower/numbers/symbols)"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pr-4 py-3 border-b border-solid focus:outline-none text-[16px] leading-7 text-headingColor placeholder:text-textColor cursor-pointer ${
                    validationErrors.password ? 'border-red-500 focus:border-red-500' : 'border-[#0066ff61] focus:border-b-primaryColor'
                  }`}
                  required
                />
                {showValidation.password && formData.password && (
                  <PasswordStrengthIndicator password={formData.password} showDetails={true} />
                )}
              </div>
              
              {formData.role === "admin" && (
                <div className="mb-5">
                  <input
                    type="tel"
                    placeholder="Phone Number (Required for Admin)"
                    name="phone"
                    value={formData.phone || ""}
                    onChange={handleInputChange}
                    className={`w-full pr-4 py-3 border-b border-solid focus:outline-none text-[16px] leading-7 text-headingColor placeholder:text-textColor cursor-pointer ${
                      validationErrors.phone ? 'border-red-500 focus:border-red-500' : 'border-[#0066ff61] focus:border-b-primaryColor'
                    }`}
                    required
                  />
                  {showValidation.phone && formData.phone && (
                    <div className="mt-1">
                      {validatePhone(formData.phone).errors.map((error, index) => (
                        <p key={index} className="text-red-500 text-xs">• {error}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="mb-5 flex items-center justify-between">
                <label className="text-headingColor font-bold text-[16px] leading-7">
                  Are you a:
                  <select
                    name="role"
                    className="text-textColor font-semibold text-[15px] leading-7 px-4 py-3 focus:outline-none"
                    value={formData.role}
                    onChange={handleInputChange}
                  >
                    <option value="select">Select</option>
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>

                <label className="text-headingColor font-bold text-[16px] leading-7">
                  Gender:
                  <select
                    name="gender"
                    className="text-textColor font-semibold text-[15px] leading-7 px-4 py-3 focus:outline-none"
                    value={formData.gender}
                    onChange={handleInputChange}
                  >
                    <option value="select">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </label>
              </div>

              <div className="mb-5 flex items-center gap-3">
                {selectedFile && (
                  <figure className="w-[60px] h-[60px] rounded-full border-2 border-solid border-primaryColor flex items-center justify-center">
                    <img
                      src={previewUrl}
                      className="w-full rounded-full"
                      alt=""
                    />
                  </figure>
                )}

                <div className="relative w-[130px] h-[50px]">
                  <input
                    type="file"
                    name="photo"
                    id="customFile"
                    accept=".jpg,.png"
                    className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                    // value={formData.photo}
                    onChange={handleFileInputChange}
                  />
                  <label
                    htmlFor="customFile"
                    className="absolute top-0 left-0 w-full h-full flex items-center px-[0.75rem] py-[0.375rem] text-[15px] leading-6 overflow-hidden bg-[#0066ff46] text-headingColor font-semibold rounded-lg truncate cursor-pointer"
                  >
                    Upload Photo
                  </label>
                </div>
              </div>

              <div className="mt-7">
                <button
                  disabled={loading && true}
                  type="submit"
                  className="w-full bg-primaryColor text-white text-[18px] leading-[30px] rounded-lg px-4 py-4"
                >
                  {loading ? (
                    <HashLoader size={35} color="#ffffff" />
                  ) : (
                    "Sign Up"
                  )}
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center my-6">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="px-4 text-gray-500 text-sm">or</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>

              {/* Google Signup */}
              <div className="mb-5">
                <GoogleLoginButton 
                  role={formData.role} 
                  className="mb-3"
                  isSignup={true}
                />
                <p className="text-xs text-gray-500 text-center mt-2">
                  {formData.role === 'select' 
                    ? 'Please select a role above before signing up with Google'
                    : `Sign up with Google as ${formData.role} - account will be created instantly`
                  }
                </p>
              </div>

              <p className="mt-5 text-textColor text-center">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primaryColor font-medium ml-1"
                >
                  Login
                </Link>
              </p>
              
              {/* Quick Admin Setup Section */}
              <div className="mt-8 p-4 bg-blue-50 rounded-lg border">
                <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                  </svg>
                  Admin Registration
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Need to create an administrator account? Click below to quickly set up admin registration mode.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, role: "admin"})}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded transition-colors"
                  >
                    Register as Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, role: "doctor"})}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 rounded transition-colors"
                  >
                    Register as Doctor
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Signup;
