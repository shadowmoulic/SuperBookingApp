import { useEnterprise } from "../../hooks/usePermission";
import { useNavigate } from "react-router-dom";
import { Building2, ArrowRight, ShieldCheck, Ticket } from "lucide-react";

export default function EnterpriseDashboard() {
  const enterpriseMemberships = useEnterprise();
  const navigate = useNavigate();

  const currentMembership = enterpriseMemberships[0];
  const enterpriseName = currentMembership?.enterprise_name || "Enterprise Corporate";
  const roleName = currentMembership?.role || "Member";

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-['Hanken_Grotesk'] animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-xl space-y-4">
          <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-wider border border-white/10">
            Corporate Client Portal
          </span>
          <h1 className="text-4xl font-black tracking-tight">{enterpriseName}</h1>
          <p className="opacity-90 text-sm leading-relaxed">
            Welcome to your corporate space. Skip queues, validation wait times, and manage bookings for large group tours effortlessly.
          </p>
        </div>
        {/* Background icon decoration */}
        <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 opacity-10 pointer-events-none">
          <Building2 className="w-80 h-80 text-white" />
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Enterprise Membership Status Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900">Membership Profile</h3>
            <p className="text-slate-500 text-xs mt-1">Review your current authorization details and clearance tier.</p>
          </div>
          <div className="divide-y divide-slate-100 text-xs font-semibold text-slate-700 pt-2">
            <div className="flex justify-between py-2.5">
              <span className="text-slate-400">Enterprise</span>
              <span className="text-slate-900 font-bold">{enterpriseName}</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-slate-400">Role Assigned</span>
              <span className="text-slate-900 font-bold uppercase tracking-wider text-[10px]">{roleName}</span>
            </div>
          </div>
        </div>

        {/* Bulk booking operations card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">Bulk Group Bookings</h3>
              <p className="text-slate-500 text-xs mt-1">
                Submit booking requests for school excursions, corporate trips, or private tours at special rates.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/enterprise/bulk-booking")}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:brightness-110 text-on-primary py-3 px-4 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            Manage Bulk Bookings <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
