import { useContext } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import { usePermission, useProvider } from "../../hooks/usePermission";
import { LayoutDashboard, Calendar, BarChart3, QrCode, LogOut, Building, ShieldCheck } from "lucide-react";

export default function ProviderLayout() {
  const { user, logout } = useContext(AuthContext);
  const { hasPermission } = usePermission();
  const providerMemberships = useProvider();
  const location = useLocation();
  const navigate = useNavigate();

  const currentMembership = providerMemberships[0];
  const providerName = currentMembership?.provider_name || "Provider Panel";
  const roleName = currentMembership?.role || "Staff";

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const navItems = [
    {
      label: "Dashboard",
      path: "/provider",
      icon: LayoutDashboard,
      show: hasPermission("analytics.view") || hasPermission("booking.validate"),
    },
    {
      label: "Bookings",
      path: "/provider/bookings",
      icon: Calendar,
      show: hasPermission("analytics.view") || hasPermission("booking.validate"),
    },
    {
      label: "Analytics",
      path: "/provider/analytics",
      icon: BarChart3,
      show: hasPermission("analytics.view"),
    },
    {
      label: "Validate Ticket",
      path: "/provider/validate",
      icon: QrCode,
      show: hasPermission("booking.validate"),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-['Hanken_Grotesk'] pt-16">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-100 flex flex-col justify-between border-r border-slate-800 flex-shrink-0">
        <div className="p-6 space-y-6">
          {/* Brand/Info */}
          <div className="flex items-center gap-3 bg-white/5 rounded-2xl p-4 border border-white/5">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 text-primary">
              <Building className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-sm text-slate-100 truncate">{providerName}</h2>
              <div className="flex items-center gap-1 mt-0.5 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                <span>{roleName}</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">Operations</div>
            {navItems.map((item) => {
              if (!item.show) return null;
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-semibold text-xs border-none ${
                    isActive
                      ? "bg-primary text-on-primary shadow-lg shadow-primary/10"
                      : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-amber-400" : "text-slate-400"}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info/Logout */}
        <div className="p-6 border-t border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs">
              {user?.username?.substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-xs text-slate-200 truncate">{user?.username}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-950/30 hover:bg-red-900/40 text-red-400 border border-red-900/20 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
