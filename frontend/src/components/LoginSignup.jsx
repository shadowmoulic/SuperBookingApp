import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  signUp,
  login,
  loginWithGoogle,
  resetPassword,
} from "../services/AuthServices";
import ModalContext from "../context/ModalContext";

export default function LoginSignup() {
  const { closeLoginModal } = useContext(ModalContext);
  const [view, setView] = useState("login"); // 'login', 'signup', 'forgot_password'

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(""); // For success messages
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (view === "signup") {
        if (!fullName) throw new Error("Full Name is required");
        if (password !== confirmPassword) throw new Error("Passwords do not match");
        
        await signUp(email, password, fullName);
        alert("Account created successfully! Please check your email to verify.");
        setView("login");
      } else if (view === "login") {
        await login(email, password);
        alert("Logged in successfully");
        closeLoginModal();
        navigate("/");
      } else if (view === "forgot_password") {
        await resetPassword(email);
        setMessage("Password reset link sent! Check your email.");
      }
    } catch (err) {
      alert(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      // OAuth redirect will handle the rest, but if it popup:
      closeLoginModal();
      navigate("/");
    } catch (err) {
      alert(err.message);
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
        <h1 className="text-xl font-extrabold mb-8 text-center bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
          {view === "signup" ? "Create an Account" : view === "forgot_password" ? "Recover Password" : "Authenticate"}
        </h1>

        {message && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500 text-green-100 rounded-xl text-sm text-center">
            {message}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          {view === "signup" && (
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          )}

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:border-cyan-400 transition-colors"
            required
          />

          {view !== "forgot_password" && (
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:border-cyan-400 transition-colors"
              required
            />
          )}

          {view === "signup" && (
            <input
              type="password"
              placeholder="Re-enter Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:border-cyan-400 transition-colors"
              required
            />
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-white transition-all shadow-lg shadow-cyan-500/25 disabled:opacity-50"
          >
            {loading ? "Processing..." : view === "signup" ? "Create Account" : view === "forgot_password" ? "Send Recovery Link" : "Authenticate"}
          </button>
        </form>

        {view === "login" && (
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => setView("forgot_password")}
              className="text-sm text-cyan-400 hover:underline focus:outline-none"
            >
              Recover Password
            </button>
          </div>
        )}

        {view !== "forgot_password" && (
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full mt-6 flex items-center justify-center gap-3 bg-white text-gray-800 font-semibold py-3 rounded-xl border border-gray-300 shadow-md hover:bg-gray-50 hover:shadow-lg transition-all duration-200"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="w-5 h-5"
            />
            Authenticate with Google
          </button>
        )}

        <div className="mt-8 text-center text-sm text-white/80">
          {view === "signup" ? (
            <p>
              Existing User?{" "}
              <button
                onClick={() => setView("login")}
                className="font-bold text-cyan-400 hover:underline focus:outline-none"
              >
                Authenticate
              </button>
            </p>
          ) : (
            <p>
              {view === "forgot_password" ? "Remember your password? " : "New User? "}
              <button
                onClick={() => setView(view === "forgot_password" ? "login" : "signup")}
                className="font-bold text-cyan-400 hover:underline focus:outline-none"
              >
                {view === "forgot_password" ? "Authenticate" : "Create Account"}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
