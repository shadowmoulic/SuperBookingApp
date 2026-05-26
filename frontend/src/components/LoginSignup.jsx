import { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
  const { closeLoginModal } = useContext(ModalContext);
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

  const { loginWithFirebaseToken } = useContext(AuthContext);
  const navigate = useNavigate();
  const recaptchaWrapperRef = useRef(null);

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
      closeLoginModal();
      navigate("/");
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
      closeLoginModal();
      navigate("/");
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
      // Ensure we prompt for account selection if needed
      // provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      // Force refresh token to ensure it's valid for the backend
      const idToken = await result.user.getIdToken(true);

      await loginWithFirebaseToken(idToken);
      closeLoginModal();
      navigate("/");
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeLoginModal();
      }}
    >
      <div className="relative backdrop-blur-xl bg-white/10 p-8 rounded-2xl shadow-2xl border-white/20 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <button
          onClick={closeLoginModal}
          className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300 transition-colors"
        >
          ×
        </button>
        <h1 className="text-xl font-extrabold mb-8 text-center bg-gradient-to-r from-gold-400 to-teal-400 bg-clip-text text-transparent">
          {isLogin ? "Log In" : "Sign Up"}
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-xs">
            {error}
          </div>
        )}

        {!showPhoneLogin && (
          <>
            <form className="space-y-5" onSubmit={handleSubmit}>
              {!isLogin && (
                <input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setValidationErrors({ ...validationErrors, fullName: "" });
                  }}
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/50"
                />
              )}
              {validationErrors.fullName && (
                <p className="text-red-400 text-xs -mt-4">
                  {validationErrors.fullName}
                </p>
              )}

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/50"
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/50"
              />

              {!isLogin && (
                <input
                  type="password"
                  placeholder="Re-enter Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/50"
                />
              )}
              {validationErrors.confirmPassword && (
                <p className="text-red-400 text-xs -mt-4">
                  {validationErrors.confirmPassword}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-[var(--md-sys-color-tertiary-src)] to-[var(--md-sys-color-primary-src)] hover:from-[var(--md-sys-color-tertiary-src)] hover:to-[var(--md-sys-color-tertiary-src)] transition-all"
              >
                {loading ? "Processing..." : isLogin ? "Log In" : "Sign Up"}
              </button>
            </form>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full mt-4 flex items-center justify-center gap-3 bg-white text-gray-800 font-semibold py-3 rounded-xl border border-gray-300 shadow-md hover:bg-gray-500 hover:shadow-lg transition-all duration-200"
              style={{ backgroundColor: "#ffffff", color: "#1f2937" }}
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="w-5 h-5"
              />
              Continue with Google
            </button>

            {/* <p className="text-center mt-4 text-sm">
              <button
                onClick={() => setShowPhoneLogin(true)}
                className="border-none px-4 py-2 rounded-lg font-semibold outline-none hover:text-blue-500 hover:underline focus:outline-none"
                style={{
                  border: "none",
                  outline: "none",
                  boxShadow: "none",
                  appearance: "none",
                  WebkitAppearance: "none",
                }}
              >
                Another way to login
              </button>
            </p> */}
          </>
        )}

        {showPhoneLogin && (
          <div className="space-y-4">
            <input
              type="tel"
              placeholder="+91XXXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/50"
            />

            <button
              onClick={sendOTP}
              className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400"
            >
              Send OTP
            </button>

            {otpTimer > 0 && (
              <p className="text-sm text-blue-400 text-center">
                Enter OTP within {otpTimer}s
              </p>
            )}

            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/50"
            />

            <button
              onClick={verifyOTP}
              disabled={loading || !otp}
              className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400"
            >
              Verify OTP
            </button>

            {otpTimer === 0 && confirmationResult && (
              <button
                onClick={sendOTP}
                className="w-full py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400"
              >
                Resend OTP
              </button>
            )}

            <div id="recaptcha-container"></div>

            <button
              onClick={() => setShowPhoneLogin(false)}
              className="w-full rounded-xl border-none bg-slate-800 py-2 outline-none hover:bg-slate-700 focus:outline-none"
              style={{
                border: "none",
                outline: "none",
                boxShadow: "none",
                appearance: "none",
                WebkitAppearance: "none",
              }}
            >
              ← Back
            </button>
          </div>
        )}

        {!showPhoneLogin && (
          <p className="text-center border-0 mt-6 text-sm text-white/80">
            {isLogin ? "New user?" : "Already have an account?"}{" "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setShowPhoneLogin(false);
              }}
              className="border-none font-bold text-cyan-400 outline-none hover:underline focus:outline-none"
              style={{
                border: "none",
                outline: "none",
                boxShadow: "none",
                appearance: "none",
                WebkitAppearance: "none",
              }}
            >
              {isLogin ? "Sign Up" : "Log In"}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
