import { useState, useEffect } from "react";
import api from "../../api/api";
import { Loader2, TrendingUp, Users, Ticket, Award, CheckCircle, Clock, XCircle, ShieldAlert } from "lucide-react";

export default function ProviderAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await api.get("/provider-api/home/");
        setData(res.data.analytics);
      } catch (err) {
        console.error("Error fetching analytics details:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-16">
        <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Failed to load analytics</h3>
      </div>
    );
  }

  const { bookings, tickets, inventory, experiences } = data;
  const confirmationRate = bookings.total ? ((bookings.confirmed / bookings.total) * 100).toFixed(1) : 0;
  const ticketUtilizationRate = tickets.total_issued ? ((tickets.used_count / tickets.total_issued) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Performance Analytics</h1>
        <p className="text-slate-500 text-sm mt-1">Detailed operations intelligence, utilization metrics, and passenger insights.</p>
      </div>

      {/* Highlights Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Earnings */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Gross Revenue</p>
            <h2 className="text-3xl font-black text-slate-900 mt-1">₹{bookings.total_revenue}</h2>
          </div>
          <div className="text-[11px] text-slate-400 font-semibold">
            Based on confirmed bookings
          </div>
        </div>

        {/* Confirmation Rate */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="w-10 h-10 bg-green-50 border border-green-100 rounded-xl flex items-center justify-center text-green-600">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Booking Success</p>
            <h2 className="text-3xl font-black text-slate-900 mt-1">{confirmationRate}%</h2>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${confirmationRate}%` }} />
          </div>
        </div>

        {/* Tickets Issued */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-blue-600">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Tickets Issued</p>
            <h2 className="text-3xl font-black text-slate-900 mt-1">{tickets.total_issued}</h2>
          </div>
          <div className="text-[11px] text-slate-400 font-semibold">
            {tickets.used_count} verified at check-in
          </div>
        </div>

        {/* Ticket utilization */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="w-10 h-10 bg-violet-50 border border-violet-100 rounded-xl flex items-center justify-center text-violet-600">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Utilization Rate</p>
            <h2 className="text-3xl font-black text-slate-900 mt-1">{ticketUtilizationRate}%</h2>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
            <div className="bg-violet-500 h-1.5 rounded-full" style={{ width: `${ticketUtilizationRate}%` }} />
          </div>
        </div>
      </div>

      {/* Detailed break downs */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Bookings Status Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Bookings Volume</h2>
          <div className="space-y-4 text-xs font-semibold">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full inline-block" />
                Confirmed
              </span>
              <span className="text-slate-900 font-bold">{bookings.confirmed}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-amber-500 rounded-full inline-block" />
                Pending Payment
              </span>
              <span className="text-slate-900 font-bold">{bookings.pending}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full inline-block" />
                Cancelled
              </span>
              <span className="text-slate-900 font-bold">{bookings.cancelled}</span>
            </div>
            <div className="pt-4 border-t flex justify-between items-center font-bold text-slate-800 text-sm">
              <span>Total Submissions</span>
              <span>{bookings.total}</span>
            </div>
          </div>
        </div>

        {/* Capacity Utilization */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Inventory Clearance</h2>
          <div className="space-y-4 text-xs font-semibold">
            <div>
              <div className="flex justify-between text-slate-500 mb-1">
                <span>Used Capacity ({inventory.used_count})</span>
                <span className="text-slate-950 font-bold">
                  {inventory.total_capacity ? ((inventory.used_count / inventory.total_capacity) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: `${inventory.total_capacity ? (inventory.used_count / inventory.total_capacity) * 100 : 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-slate-500 mb-1">
                <span>Blocked slots ({inventory.blocked_count})</span>
                <span className="text-slate-950 font-bold">
                  {inventory.total_capacity ? ((inventory.blocked_count / inventory.total_capacity) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-slate-400 h-2 rounded-full" style={{ width: `${inventory.total_capacity ? (inventory.blocked_count / inventory.total_capacity) * 100 : 0}%` }} />
              </div>
            </div>
            <div className="pt-4 border-t flex justify-between items-center text-xs font-bold text-slate-800">
              <span>Max Capacity Limit</span>
              <span>{inventory.total_capacity} daily slots</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
