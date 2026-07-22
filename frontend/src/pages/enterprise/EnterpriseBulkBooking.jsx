import { useState, useEffect } from "react";
import api from "../../api/api";
import { Loader2, Plus, Calendar, AlertCircle, CheckCircle2, FileText, QrCode } from "lucide-react";

export default function EnterpriseBulkBooking() {
  const [requests, setRequests] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [ticketTypes, setTicketTypes] = useState([]);
  
  const [selectedExp, setSelectedExp] = useState("");
  const [selectedTicketType, setSelectedTicketType] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch experiences and existing requests on load
  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoadingList(true);
        const [expRes, reqRes] = await Promise.all([
          api.get("/api/experiences/"),
          api.get("/api/bulk-bookings/"),
        ]);
        
        // Handle list responses which might be in results key
        const experiencesData = Array.isArray(expRes.data)
          ? expRes.data
          : expRes.data?.results || [];
        setExperiences(experiencesData);

        const requestsData = Array.isArray(reqRes.data)
          ? reqRes.data
          : reqRes.data?.results || [];
        setRequests(requestsData);
      } catch (err) {
        console.error("Error loading enterprise bulk booking initial data:", err);
        setError("Failed to load corporate booking records.");
      } finally {
        setLoadingList(false);
      }
    }
    loadInitialData();
  }, []);

  // Fetch ticket types when selected experience changes
  useEffect(() => {
    async function fetchTicketTypes() {
      if (!selectedExp) {
        setTicketTypes([]);
        setSelectedTicketType("");
        return;
      }

      try {
        setLoadingDetails(true);
        const res = await api.get(`/api/experience/${selectedExp}`);
        setTicketTypes(res.data?.ticket_types || []);
        if (res.data?.ticket_types?.length > 0) {
          setSelectedTicketType(res.data.ticket_types[0].public_id || res.data.ticket_types[0].id);
        }
      } catch (err) {
        console.error("Error loading experience details:", err);
      } finally {
        setLoadingDetails(false);
      }
    }
    fetchTicketTypes();
  }, [selectedExp]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedExp || !selectedTicketType || !bookingDate || !quantity) {
      setError("Please fill all required fields.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const res = await api.post("/api/bulk-bookings/", {
        experience: selectedExp,
        ticket_type: selectedTicketType,
        booking_date: bookingDate,
        quantity: parseInt(quantity),
        notes: notes,
      });

      setSuccess("Bulk booking request submitted successfully! It is now pending approval.");
      // Reset form fields
      setSelectedExp("");
      setBookingDate("");
      setQuantity(1);
      setNotes("");

      // Re-fetch requests
      const reqRes = await api.get("/api/bulk-bookings/");
      const requestsData = Array.isArray(reqRes.data)
        ? reqRes.data
        : reqRes.data?.results || [];
      setRequests(requestsData);
    } catch (err) {
      console.error("Error creating bulk booking request:", err);
      setError(err.response?.data?.error || err.response?.data?.detail || "Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  const statusColor = (s) =>
    s === "approved"
      ? "bg-green-50 text-green-700 border border-green-200"
      : s === "rejected"
      ? "bg-red-50 text-red-700 border border-red-200"
      : "bg-amber-50 text-amber-700 border border-amber-200";

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-['Hanken_Grotesk'] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Bulk Bookings</h1>
        <p className="text-slate-500 text-sm mt-1">Submit large volume booking requests and view current validation approvals.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Request Form */}
        <div className="lg:col-span-1 bg-white border border-slate-100 shadow-xl rounded-3xl p-6 space-y-6">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-slate-900">New Bulk Request</h2>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-2.5 items-start text-xs font-semibold text-red-700">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex gap-2.5 items-start text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                Experience
              </label>
              <select
                value={selectedExp}
                onChange={(e) => setSelectedExp(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
              >
                <option value="">Select Destination</option>
                {experiences.map((exp) => (
                  <option key={exp.public_id || exp.id} value={exp.public_id || exp.id}>
                    {exp.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                Ticket Type
              </label>
              <select
                value={selectedTicketType}
                onChange={(e) => setSelectedTicketType(e.target.value)}
                disabled={loadingDetails || ticketTypes.length === 0}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {loadingDetails ? (
                  <option>Loading types...</option>
                ) : ticketTypes.length === 0 ? (
                  <option value="">No types available</option>
                ) : (
                  ticketTypes.map((tt) => (
                    <option key={tt.public_id || tt.id} value={tt.public_id || tt.id}>
                      {tt.name} (₹{tt.price})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                  Visit Date
                </label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                Special Requests / Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Excursion details, school names, etc."
                rows="3"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary hover:brightness-110 disabled:bg-slate-100 disabled:text-slate-400 py-3.5 px-4 rounded-xl text-xs font-bold text-on-primary transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Submitting Request...
                </>
              ) : (
                "Submit Booking Request"
              )}
            </button>
          </form>
        </div>

        {/* Existing Requests List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-bold text-slate-900">Submission Records</h2>
          </div>

          {loadingList ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 p-8 shadow-sm">
              <QrCode className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No submissions found</h3>
              <p className="text-slate-500 text-xs mt-1">Submit a request on the left to initialize.</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                      <th className="py-4 px-6">Public Ref</th>
                      <th className="py-4 px-6">Experience / Type</th>
                      <th className="py-4 px-6">Visit Date</th>
                      <th className="py-4 px-6">Qty</th>
                      <th className="py-4 px-6">Notes</th>
                      <th className="py-4 px-6">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                    {requests.map((r) => (
                      <tr key={r.public_id} className="hover:bg-slate-50/75 transition-colors">
                        <td className="py-4.5 px-6 font-mono text-slate-900 select-all font-bold">
                          {r.public_id}
                        </td>
                        <td className="py-4.5 px-6">
                          <div className="font-bold text-slate-900">{r.experience_name}</div>
                          <div className="text-[10px] text-slate-400 font-semibold">{r.ticket_type_name || "General"}</div>
                        </td>
                        <td className="py-4.5 px-6">
                          {r.booking_date}
                        </td>
                        <td className="py-4.5 px-6 font-bold text-slate-900">
                          {r.quantity}
                        </td>
                        <td className="py-4.5 px-6 max-w-[150px] truncate text-slate-400 font-semibold" title={r.notes}>
                          {r.notes || "-"}
                        </td>
                        <td className="py-4.5 px-6">
                          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider ${statusColor(r.status)}`}>
                            {r.status}
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
      </div>
    </div>
  );
}
