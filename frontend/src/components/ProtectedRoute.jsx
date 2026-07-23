import { useContext, useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import ModalContext from "../context/ModalContext";
import Loading from "./Loading";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";

export default function ProtectedRoute({ children, requires }) {
  const { isAuthenticated, loading, hasPermission } = useContext(AuthContext);
  const { openLoginModal } = useContext(ModalContext);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      const targetUrl = location.pathname + location.search;
      openLoginModal(targetUrl);
    }
  }, [loading, isAuthenticated, openLoginModal, location]);

  if (loading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    const targetUrl = location.pathname + location.search;
    return <Navigate to="/" state={{ from: targetUrl }} replace />;
  }

  // Permission Check
  if (requires && requires.length > 0) {
    const hasAll = requires.every(p => hasPermission(p));
    if (!hasAll) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-['Hanken_Grotesk']">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center space-y-6 transform hover:scale-[1.01] transition-transform duration-300">
            <div className="mx-auto w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center border border-red-100 shadow-sm animate-pulse">
              <ShieldAlert className="w-8 h-8 text-red-600" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Access Restricted</h1>
              <p className="text-slate-500 text-sm leading-relaxed">
                You do not have the required permissions to access this page. Please contact your system administrator or switch to an authorized account.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100/50 text-left text-xs font-semibold space-y-1.5">
              <div className="text-slate-400 uppercase tracking-wider text-[9px] font-bold">Required Clearance</div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {requires.map(req => (
                  <span key={req} className="px-2.5 py-1 bg-red-50 text-red-700 rounded-lg border border-red-100/45 font-mono">
                    {req}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => navigate(-1)}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 px-4 rounded-xl text-sm font-bold transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Go Back
              </button>
              <button
                onClick={() => navigate("/")}
                className="flex-1 flex items-center justify-center gap-2 bg-primary hover:brightness-110 text-on-primary py-3 px-4 rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow cursor-pointer"
              >
                <Home className="w-4 h-4" /> Home
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  return children;
}
