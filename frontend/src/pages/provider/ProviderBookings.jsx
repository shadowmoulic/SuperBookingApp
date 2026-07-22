import { useState, useEffect } from "react";
import api from "../../api/api";
import { Loader2, Search, Filter, ShieldAlert } from "lucide-react";

export default function ProviderBookings() {
  const [bookings, setBookings] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExp, setSelectedExp] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Fetch experiences once for filtering
  useEffect(() => {
    async function fetchExperiences() {
      try {
        const res = await api.get("/provider-api/experiences/");
        setExperiences(res.data);
      } catch (err) {
        console.error("Error fetching experiences for filter:", err);
      }
    }
    fetchExperiences();
  }, []);

  // Fetch bookings whenever filters change
  useEffect(() => {
    async function fetchBookings() {
      try {
        setLoading(true);
        let url = "/provider-api/bookings/";
        const params = [];
        if (selectedExp) params.push(`experience_id=${selectedExp}`);
        if (selectedStatus) params.push(`status=${selectedStatus}`);
        if (params.length > 0) {
          url += `?${params.join("&")}`;
        }
        const res = await api.get(url);
        setBookings(res.data);
      } catch (err) {
        console.error("Error fetching provider bookings:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, [selectedExp, selectedStatus]);

  const color = s =>
    s === "confirmed"
      ? "bg-green-50 text-green-700 border border-green-200"
      : s === "pending"
      ? "bg-amber-50 text-amber-700 border border-amber-200"
      : "bg-red-50 text-red-700 border border-red-200";

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Bookings Manager</h1>
          <p className="text-slate-500 text-sm mt-1">Monitor, filter, and track passenger booking records.</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <Filter className="w-4 h-4 text-primary" />
          <span className="font-bold text-slate-700">Filter By</span>
        </div>

        {/* Experience Selector */}
        <div className="flex-1 min-w-[200px]">
          <select
            value={selectedExp}
            onChange={(e) => setSelectedExp(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
          >
            <option value="">All Experiences</option>
            {experiences.map((exp) => (
              <option key={exp.public_id} value={exp.public_id}>
                {exp.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Selector */}
        <div className="w-[180px]">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 p-8 shadow-sm">
          <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-3 animate-bounce" />
          <h3 className="text-base font-bold text-slate-800">No bookings found</h3>
          <p className="text-slate-500 text-xs mt-1">Try adjusting your filters or search options.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Reference</th>
                  <th className="py-4 px-6">Customer Details</th>
                  <th className="py-4 px-6">Experience</th>
                  <th className="py-4 px-6">Visit Date</th>
                  <th className="py-4 px-6">Price</th>
                  <th className="py-4 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {bookings.map((b) => (
                  <tr key={b.reference} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-4.5 px-6 font-mono text-slate-900 select-all font-bold">
                      {b.reference}
                    </td>
                    <td className="py-4.5 px-6">
                      <div className="font-bold text-slate-900">{b.user_name || "Guest Traveler"}</div>
                      <div className="text-[10px] text-slate-400 font-semibold">{b.user_email || "-"}</div>
                    </td>
                    <td className="py-4.5 px-6 font-bold text-slate-800">
                      {b.experience_name}
                    </td>
                    <td className="py-4.5 px-6">
                      {b.booking_date}
                    </td>
                    <td className="py-4.5 px-6 font-black text-slate-900">
                      ₹{b.total_amount}
                    </td>
                    <td className="py-4.5 px-6">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${color(b.status)}`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
