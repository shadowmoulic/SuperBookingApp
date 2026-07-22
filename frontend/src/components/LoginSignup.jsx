import { useState, useEffect, useContext, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  updateProfile,
} from "firebase/auth";
import { auth } from "../Firebase";
import AuthContext from "../context/AuthContext";
import ModalContext from "../context/ModalContext";

export default function LoginSignup() {
  const { closeLoginModal, redirectUrl } = useContext(ModalContext);
  const [isLogin, setIsLogin] = useState(true);
  const [showPhoneLogin, setShowPhoneLogin] = useState(false);

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [otpTimer, setOtpTimer] = useState(0);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { loginWithFirebaseToken } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const recaptchaWrapperRef = useRef(null);

  const handleLoginSuccess = () => {
    const target = redirectUrl || location.state?.from;
    closeLoginModal();
    if (target) {
      navigate(target, { replace: true });
    }
  };

  // Handle Recaptcha cleanup
  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  useEffect(() => {
    let interval;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const validateForm = () => {
    const errors = {};
    if (!isLogin && !fullName.trim()) errors.fullName = "Full name is required";
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Invalid email format";
    }
    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    if (!isLogin && password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validateForm()) return;
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await signInWithEmailAndPassword(auth, email, password);
      } else {
        result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName: fullName });
      }

      // Force token refresh to ensure it's valid for backend
      const idToken = await result.user.getIdToken(true);
      await loginWithFirebaseToken(idToken);
      handleLoginSuccess();
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.message ||
        "Authentication failed";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const sendOTP = async () => {
    setError("");
    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(
          auth,
          "recaptcha-container",
          {
            size: "invisible",
          },
        );
      }
      const result = await signInWithPhoneNumber(
        auth,
        phone,
        window.recaptchaVerifier,
      );
      setConfirmationResult(result);
      setOtpTimer(30);
    } catch (err) {
      setError(err.message || "Failed to send OTP");
    }
  };

  const verifyOTP = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      // Force token refresh to ensure it's valid for backend
      const idToken = await result.user.getIdToken(true);
      await loginWithFirebaseToken(idToken);
      handleLoginSuccess();
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.message ||
        "Invalid OTP";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken(true);

      await loginWithFirebaseToken(idToken);
      handleLoginSuccess();
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Google login failed";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeLoginModal();
      }}
    >
      {/* Dialog Card Layout */}
      <div
        className={`w-full bg-white rounded-xl shadow-2xl relative overflow-hidden border border-gray-150 mx-4 max-h-[95vh] overflow-y-auto transition-all duration-300 ${isLogin ? "max-w-[440px] p-8" : "max-w-[480px] p-8 md:p-10"
          }`}
      >
        {/* Brand Accent Ribbon (Only on Login) */}
        {isLogin && <div className="absolute top-0 left-0 w-full h-1.5 bg-primary" />}

        {/* Close/Dismiss Button */}
        <button
          onClick={closeLoginModal}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors p-1 cursor-pointer flex items-center justify-center"
          aria-label="Close modal"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {/* Header Section */}
        {isLogin ? (
          <div className="flex flex-col items-center mb-8 text-center">
            <span className="font-['Hanken_Grotesk'] text-xl font-bold text-primary mb-1">ZeQue</span>
            <h2 className="font-['Hanken_Grotesk'] text-2xl font-bold text-gray-900 mb-0.5">Welcome back</h2>
            <p className="font-['Inter'] text-sm text-gray-500">Access your heritage collection</p>
          </div>
        ) : (
          <div className="flex flex-col justify-start mb-8 text-left w-full">
            <span className="font-['Hanken_Grotesk'] text-xl font-bold text-primary mb-1 block">ZeQue</span>
            <h2 className="font-['Hanken_Grotesk'] text-2xl font-bold text-gray-900">Create your account</h2>
            <p className="font-['Inter'] text-sm text-gray-500 mt-1">
              Start your journey into the world's most guarded legacies.
            </p>
          </div>
        )}

        {/* Error Notification Banner */}
        {error && (
          <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-semibold font-['Inter']">
            {error}
          </div>
        )}

        {/* Form & Actions */}
        {!showPhoneLogin && (
          <>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>

              {/* Full Name (Sign Up only) */}
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="font-['Inter'] text-[10px] font-bold text-gray-400 uppercase tracking-wider block" htmlFor="fullName">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      setValidationErrors({ ...validationErrors, fullName: "" });
                    }}
                    className="w-full bg-gray-50 border border-gray-250 rounded-lg px-4 py-2.5 font-['Inter'] text-sm focus:outline-none focus:border-primary focus:bg-white transition-all"
                  />
                  {validationErrors.fullName && (
                    <p className="text-red-500 text-xs mt-1 font-semibold font-['Inter']">
                      {validationErrors.fullName}
                    </p>
                  )}
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="font-['Inter'] text-[10px] font-bold text-gray-400 uppercase tracking-wider block" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setValidationErrors({ ...validationErrors, email: "" });
                  }}
                  className="w-full bg-gray-50 border border-gray-250 rounded-lg px-4 py-2.5 font-['Inter'] text-sm focus:outline-none focus:border-primary focus:bg-white transition-all"
                />
                {validationErrors.email && (
                  <p className="text-red-500 text-xs mt-1 font-semibold font-['Inter']">
                    {validationErrors.email}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-['Inter'] text-[10px] font-bold text-gray-400 uppercase tracking-wider block" htmlFor="password">
                    Password
                  </label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => alert("Password recovery is coming soon!")}
                      className="font-['Inter'] text-[10px] font-bold text-tertiary hover:underline bg-transparent border-none p-0 cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={isLogin ? "Enter your password" : "Enter a secure password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setValidationErrors({ ...validationErrors, password: "" });
                    }}
                    className="w-full pl-4 pr-11 py-2.5 bg-gray-50 border border-gray-250 rounded-lg focus:outline-none focus:border-primary focus:bg-white text-sm font-['Inter'] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg leading-none">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="text-red-500 text-xs mt-1 font-semibold font-['Inter']">
                    {validationErrors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password (Sign Up only) */}
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="font-['Inter'] text-[10px] font-bold text-gray-400 uppercase tracking-wider block" htmlFor="confirmPassword">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setValidationErrors({ ...validationErrors, confirmPassword: "" });
                      }}
                      className="w-full pl-4 pr-11 py-2.5 bg-gray-50 border border-gray-250 rounded-lg focus:outline-none focus:border-primary focus:bg-white text-sm font-['Inter'] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-lg leading-none">
                        {showConfirmPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                  {validationErrors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1 font-semibold font-['Inter']">
                      {validationErrors.confirmPassword}
                    </p>
                  )}
                </div>
              )}

              {/* Form Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:brightness-110 text-white font-['Hanken_Grotesk'] font-bold py-3 rounded-lg mt-2 transition-all active:scale-[0.98] cursor-pointer text-sm shadow-sm flex items-center justify-center gap-1.5 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : isLogin ? "Login" : "Create Account"}
              </button>
            </form>

            {/* Social Logins Division (Login Modal Only) */}
            {isLogin && (
              <>
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center w-full border-t border-gray-150" />
                  <div className="relative flex justify-center text-[10px] bg-white px-3 mx-auto w-fit text-gray-400 uppercase tracking-widest font-['Inter'] font-bold">
                    Or continue with
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="flex items-center justify-center gap-2 border border-gray-250 py-2.5 rounded-lg hover:bg-gray-50 transition-colors font-['Hanken_Grotesk'] text-sm font-bold text-gray-700 cursor-pointer shadow-xs"
                  >
                    <img
                      src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                      alt="Google logo"
                      className="w-4 h-4" />
                    Google
                  </button>
                  <button
                    type="button"
                    onClick={() => alert("Apple Sign-In is coming soon!")}
                    className="flex items-center justify-center gap-2 border border-gray-250 py-2.5 rounded-lg hover:bg-gray-50 transition-colors font-['Hanken_Grotesk'] text-sm font-bold text-gray-700 cursor-pointer shadow-xs"
                  >
                    <svg className="w-4 h-4 fill-current text-gray-900" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.7-1.13 1.84-.99 2.94.1.08.2.1.27.1 1.02 0 2.11-.63 2.55-1.43z" />
                    </svg>
                    Apple
                  </button>
                </div>
              </>
            )}

            {/* Modal Footer Link */}
            {isLogin ? (
              <p className="text-center mt-8 text-sm text-gray-500 font-['Inter']">
                New to ZeQue?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(false);
                    setShowPhoneLogin(false);
                  }}
                  className="border-none font-bold text-primary hover:underline focus:outline-none bg-transparent p-0 cursor-pointer ml-1"
                >
                  Join the Heritage
                </button>
              </p>
            ) : (
              <div className="mt-8 text-center flex flex-col gap-4">
                <p className="text-center text-sm text-gray-500 font-['Inter']">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(true);
                      setShowPhoneLogin(false);
                    }}
                    className="border-none font-bold text-tertiary hover:text-tertiary/80 transition-colors focus:outline-none bg-transparent p-0 cursor-pointer ml-1"
                  >
                    Login
                  </button>
                </p>
                <p className="font-['Inter'] text-[11px] text-gray-400 px-4 leading-relaxed">
                  By signing up, you agree to our{" "}
                  <a href="#terms" className="underline hover:text-gray-600 transition-colors">Terms of Service</a>
                  {" "}and{" "}
                  <a href="#privacy" className="underline hover:text-gray-600 transition-colors">Privacy Policy</a>.
                </p>
              </div>
            )}
          </>
        )}

        {/* OTP Phone Login */}
        {showPhoneLogin && (
          <div className="flex flex-col gap-4">

            {/* Phone Input Box */}
            <div className="space-y-1.5">
              <label className="font-['Inter'] text-[10px] font-bold text-gray-400 uppercase tracking-wider block" htmlFor="phone">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="+91XXXXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-250 rounded-lg focus:outline-none focus:border-primary focus:bg-white text-sm font-['Inter'] transition-all"
              />
            </div>

            <button
              onClick={sendOTP}
              className="w-full py-3 bg-primary text-white font-['Hanken_Grotesk'] font-bold rounded-lg text-sm transition-all hover:brightness-110 active:scale-98 cursor-pointer shadow-sm"
            >
              Send OTP
            </button>

            {otpTimer > 0 && (
              <p className="text-xs text-primary font-semibold text-center font-['Inter']">
                Enter OTP within {otpTimer}s
              </p>
            )}

            {/* OTP Verification Box */}
            <div className="space-y-1.5">
              <label className="font-['Inter'] text-[10px] font-bold text-gray-400 uppercase tracking-wider block" htmlFor="otp">
                One-Time Password (OTP)
              </label>
              <input
                id="otp"
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-250 rounded-lg focus:outline-none focus:border-primary focus:bg-white text-sm font-['Inter'] font-mono text-center tracking-widest transition-all"
              />
            </div>

            <button
              onClick={verifyOTP}
              disabled={loading || !otp}
              className="w-full py-3 bg-primary text-white font-['Hanken_Grotesk'] font-bold rounded-lg text-sm transition-all hover:brightness-110 active:scale-98 cursor-pointer shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Verify OTP
            </button>

            {otpTimer === 0 && confirmationResult && (
              <button
                onClick={sendOTP}
                className="w-full py-2.5 border border-gray-250 text-gray-700 font-['Hanken_Grotesk'] font-semibold rounded-lg text-xs hover:bg-gray-50 transition-all cursor-pointer"
              >
                Resend OTP
              </button>
            )}

            <div id="recaptcha-container"></div>

            <button
              onClick={() => setShowPhoneLogin(false)}
              className="w-full py-2.5 border border-gray-250 text-gray-700 font-['Hanken_Grotesk'] font-semibold rounded-lg text-xs hover:bg-gray-50 transition-all cursor-pointer mt-2"
            >
              ← Back to Email
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
