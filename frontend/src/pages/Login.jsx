import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";
import { toast } from "react-toastify";
import HashLoader from "react-spinners/HashLoader";
import { useAuth } from "../context/AuthContext.jsx";
import { validateEmail } from "../utils/validation";
import EmailValidator from "../components/Validation/EmailValidator";
import GoogleLoginButton from "../components/GoogleAuth/GoogleLoginButton";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "", // Add role to help with login flow
  });
  const [showEmailValidation, setShowEmailValidation] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "email") {
      setShowEmailValidation(true);
    }
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      // Validate email before sending
      const emailValidation = validateEmail(formData.email);
      if (!emailValidation.isValid) {
        toast.error(emailValidation.errors[0]);
        setLoading(false);
        return;
      }

      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message);
      }

      // Use the new login function from AuthContext
      login(result.token, result.data, result.role);

      setLoading(false);
      toast.success(result.message);

      // Navigate based on user role
      const redirectPath =
        result.role === "admin"
          ? "/admin/dashboard"
          : result.role === "doctor"
          ? "/doctors/profile/me"
          : "/users/profile/me";

      navigate(redirectPath);
    } catch (err) {
      toast.error(err.message);
      setLoading(false);
    }
  };

  return (
    <section className="px-5 lg:px-0">
      <div className="w-full max-w-[570px] mx-auto rounded-lg shadow-md md:p-10">
        <h3 className="text-headingColor text-[22px] leading-9 font-bold mb-10">
          Hello
          <span className="text-primaryColor"> Welcome </span> Back 👋
        </h3>
        {formData.role === "admin" && (
          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Admin Login:</strong> You are logging in as an
                  administrator. You will have access to the admin dashboard
                  with full system management capabilities.
                </p>
              </div>
            </div>
          </div>
        )}
        <form action="" className="py-4 md:py-0" onSubmit={submitHandler}>
          <div className="mb-5">
            <input
              type="email"
              placeholder="Enter Your Email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full py-3 border-b border-solid border-[#0066ff61] focus:outline-none focus:border-b-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor cursor-pointer"
              required
            />
            {showEmailValidation && formData.email && (
              <EmailValidator email={formData.email} showDetails={false} />
            )}
          </div>
          <div className="mb-5">
            <input
              type="password"
              placeholder="Enter Your Password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full py-3 border-b border-solid border-[#0066ff61] focus:outline-none focus:border-b-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor cursor-pointer"
              required
            />
          </div>


          <div className="mt-7">
            <button
              type="submit"
              className="w-full bg-primaryColor text-white text-[18px] leading-[30px] rounded-lg px-4 py-4"
            >
              {loading ? <HashLoader size={25} color="#ffffff" /> : "Login"}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-gray-500 text-sm">or</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Google Login */}
          <div className="mb-5">
            <GoogleLoginButton 
              role="auto-detect" 
              className="mb-3"
            />
          </div>

          <p className="mt-5 text-textColor text-center">
            Dont have an account?{" "}
            <Link to="/register" className="text-primaryColor font-medium ml-1">
              Register
            </Link>
          </p>

          {/* Quick Admin Access Section */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border">
            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Admin Access
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              System administrators can login here to access the admin dashboard
              with full management capabilities.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "admin" })}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded transition-colors"
              >
                Set Admin Login Mode
              </button>
              <Link
                to="/register"
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium py-2 px-4 rounded text-center transition-colors"
              >
                Register as Admin
              </Link>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Login;
