import React, { useState, useContext, useEffect } from 'react';
import { BookMarked, MapPin, Calendar, Settings, Compass, ChevronRight, LogOut, Search, CreditCard, Award, Loader2 } from 'lucide-react';
import AuthContext from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';

function formatCurrency(amount) {
  const value = Number(amount);
  if (Number.isNaN(value)) return amount || "₹0.00";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(value);
}

function formatDate(value) {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getExperienceImage(name) {
  const normalized = String(name || "").toLowerCase();
  if (normalized.includes("victoria")) {
    return "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=600&q=80";
  }
  if (normalized.includes("taj mahal") || normalized.includes("taj")) {
    return "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80";
  }
  if (normalized.includes("louvre")) {
    return "https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=600&q=80";
  }
  if (normalized.includes("golden temple") || normalized.includes("golden")) {
    return "https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?auto=format&fit=crop&w=600&q=80";
  }
  if (normalized.includes("national zoo") || normalized.includes("zoo")) {
    return "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=600&q=80";
  }
  return "https://images.unsplash.com/photo-1566127992631-137a642a90f4?auto=format&fit=crop&w=600&q=80";
}

function getStatusBadge(status) {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "confirmed") {
    return (
      <span className="bg-green-50 text-green-700 border border-green-200 text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
        Confirmed
      </span>
    );
  }
  if (normalized === "pending") {
    return (
      <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
        Pending
      </span>
    );
  }
  return (
    <span className="bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
      Cancelled
    </span>
  );
}

const UserDashboard = () => {
  const { user, logout, updateProfile } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState({ text: "", type: "" });

  const [savedAttractions, setSavedAttractions] = useState([]);

  const [bookings, setBookings] = useState({ bookings: [], tickets: [] });
  const [dashboardStats, setDashboardStats] = useState({ savedCount: 0, upcomingCount: 0, citiesCount: 1 });
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [recentlyExplored, setRecentlyExplored] = useState([]);

  useEffect(() => {
    if (user) {
      const name = `${user.first_name || ""} ${user.last_name || ""}`.trim();
      setEditName(name || user.username || "");
      setEditPhone(user.mobile || "");
    }
  }, [user]);

  useEffect(() => {
    // Load recently explored items from localStorage
    try {
      const list = JSON.parse(localStorage.getItem("recently_explored") || "[]");
      setRecentlyExplored(list);
    } catch (e) {
      console.error("Error reading recently_explored:", e);
    }
  }, []);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setDashboardLoading(true);
        // Call the correct, mapped bookings endpoint
        const bookingsRes = await api.get("/api/bookings/");
        const data = bookingsRes.data || { bookings: [], tickets: [] };
        setBookings(data);

        // Derive dynamic statistics from actual bookings and tickets
        const confirmedList = Array.isArray(data.tickets) ? data.tickets : [];
        const pendingList = Array.isArray(data.bookings) ? data.bookings : [];

        // Find unique cities in confirmed tickets
        const uniqueCities = new Set(confirmedList.map(t => t.experience_name || "").filter(Boolean));

        setDashboardStats({
          savedCount: savedAttractions.length,
          upcomingCount: confirmedList.length + pendingList.length,
          citiesCount: Math.max(1, uniqueCities.size)
        });
      }
      catch (err) {
        console.error("Error loading dashboard data:", err);
      }
      finally {
        setDashboardLoading(false);
      }
    }
    if (user) {
      loadDashboard();
    }
  }, [user]);

  const fullName = user
    ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username || user.email
    : "Traveler";
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleDownload = () => {
    alert("Ticket PDF download initiated successfully!");
  };

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    setUpdateMsg({ text: "", type: "" });
    try {
      const nameParts = editName.trim().split(" ");
      const first_name = nameParts[0] || "";
      const last_name = nameParts.slice(1).join(" ") || "";

      await updateProfile({
        first_name,
        last_name,
        mobile: editPhone
      });
      setUpdateMsg({ text: "Profile updated successfully!", type: "success" });
    } catch (err) {
      setUpdateMsg({ text: err.response?.data?.detail || err.message, type: "error" });
    } finally {
      setIsUpdating(false);
      setTimeout(() => setUpdateMsg({ text: "", type: "" }), 4000);
    }
  };

  if (dashboardLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary"></Loader2>
      </div>
    )
  }

  const pendingBookings = Array.isArray(bookings?.bookings) ? bookings.bookings : [];
  const confirmedTickets = Array.isArray(bookings?.tickets) ? bookings.tickets : [];

  return (
    <div className="min-h-screen bg-background pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">

        {/* Sidebar */}
        <div className="w-full lg:w-72 flex-shrink-0">
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/35 p-6 sticky top-32 shadow-sm">
            {/* User Profile Mini */}
            <div className="flex flex-col items-center text-center pb-6 border-b border-outline-variant/20 mb-6">
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-on-primary font-black text-2xl shadow-xl shadow-emerald-950/10 mb-4 ring-4 ring-background">
                {initials}
              </div>
              <h3 className="font-black text-on-surface text-lg tracking-tight">{fullName}</h3>
              <p className="text-xs font-bold text-on-surface-variant/75 mt-1">{user?.email}</p>
              <div className="mt-4 bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5">
                <Award className="w-3 h-3" /> Explorer Tier
              </div>
            </div>

            <nav className="space-y-1.5">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 font-semibold text-sm ${activeTab === 'overview' ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant hover:bg-surface-container'}`}
              >
                <Compass className={`w-5 h-5 ${activeTab === 'overview' ? 'text-amber-400' : 'text-on-surface-variant/70'}`} /> Dashboard
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 font-semibold text-sm ${activeTab === 'bookings' ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant hover:bg-surface-container'}`}
              >
                <Calendar className={`w-5 h-5 ${activeTab === 'bookings' ? 'text-amber-400' : 'text-on-surface-variant/70'}`} /> My Bookings
              </button>
              {/* Saved Trips navigation commented out because they are not coming from backend
              <button 
                onClick={() => setActiveTab('saved')} 
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 font-semibold text-sm ${activeTab === 'saved' ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant hover:bg-surface-container'}`}
              >
                <BookMarked className={`w-5 h-5 ${activeTab === 'saved' ? 'text-amber-400' : 'text-on-surface-variant/70'}`} /> Saved Trips
              </button>
              */}
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 font-semibold text-sm ${activeTab === 'settings' ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant hover:bg-surface-container'}`}
              >
                <Settings className={`w-5 h-5 ${activeTab === 'settings' ? 'text-amber-400' : 'text-on-surface-variant/70'}`} /> Settings
              </button>
            </nav>

            <div className="mt-8 pt-6 border-t border-outline-variant/20">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 font-semibold text-sm text-red-600 hover:bg-error/10"
              >
                <LogOut className="w-5 h-5" /> Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-8">
          {activeTab === 'overview' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black text-on-surface tracking-tight">Welcome back, {fullName.split(" ")[0]}.</h1>
                  <p className="text-on-surface-variant mt-2 font-medium">Ready for your next heritage discovery?</p>
                </div>
                <button onClick={() => navigate("/state")} className="hidden sm:flex items-center gap-2 bg-primary hover:brightness-110 text-on-primary px-6 py-3 rounded-full text-sm font-bold transition-all shadow-lg hover:-translate-y-0.5">
                  <Search className="w-4 h-4" /> Explore Maps
                </button>
              </div>

              {/* Premium Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Saved Places stats card commented out as it is not coming from backend
                <div className="bg-surface-container-high border border-outline-variant/30 rounded-3xl p-6 text-on-surface shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                    <BookMarked className="w-24 h-24 rotate-12 transform -translate-y-4 translate-x-4 text-on-surface" />
                  </div>
                  <div className="relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/15">
                      <BookMarked className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-1">Saved Places</p>
                    <h3 className="text-4xl font-black">{dashboardStats.savedCount}</h3>
                  </div>
                </div>
                */}

                <div className="bg-primary rounded-3xl p-6 text-on-primary shadow-xl shadow-emerald-950/15 relative overflow-hidden group md:col-start-2">
                  <div className="absolute top-0 right-0 p-6 opacity-15 group-hover:opacity-25 transition-opacity">
                    <Calendar className="w-24 h-24 rotate-12 transform -translate-y-4 translate-x-4" />
                  </div>
                  <div className="relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-on-primary/10 flex items-center justify-center mb-6 backdrop-blur-md border border-on-primary/10">
                      <Calendar className="w-5 h-5 text-on-primary" />
                    </div>
                    <p className="text-on-primary/80 text-xs font-bold uppercase tracking-wider mb-1">Upcoming Trips</p>
                    <h3 className="text-4xl font-black">{dashboardStats.upcomingCount}</h3>
                  </div>
                </div>

                {/* Cities Explored stats card commented out as it is not coming from backend
                <div className="bg-surface-container-lowest border border-outline-variant/35 rounded-3xl p-6 shadow-sm relative overflow-hidden group">
                  <div className="relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center mb-6">
                      <MapPin className="w-5 h-5 text-amber-600" />
                    </div>
                    <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-1">Cities Explored</p>
                    <h3 className="text-4xl font-black text-on-surface">{dashboardStats.citiesCount}</h3>
                  </div>
                </div>
                */}
              </div>

              {/* Recently Explored Section */}
              {recentlyExplored.length > 0 && (
                <div className="mt-12">
                  <h2 className="text-2xl font-black text-on-surface tracking-tight mb-6">Recently Explored</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {recentlyExplored.map((item, idx) => (
                      <Link
                        key={idx}
                        to={item.url}
                        className="group flex flex-col bg-surface-container-lowest border border-outline-variant/35 rounded-3xl overflow-hidden shadow-xs hover:shadow-md hover:border-primary/30 transition-all duration-300"
                      >
                        <div className="h-32 overflow-hidden relative">
                          <img
                            src={item.image || "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&q=80&w=600"}
                            alt={item.name}
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent" />
                          <div className="absolute top-3 left-3 bg-surface-container-lowest/95 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider text-on-surface">
                            {item.type}
                          </div>
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="font-bold text-on-surface text-sm line-clamp-1 group-hover:text-primary transition-colors">{item.name}</h4>
                            <p className="text-on-surface-variant text-[10px] font-semibold mt-0.5">{item.subtitle}</p>
                          </div>
                          <div className="mt-3 flex items-center justify-between text-xs font-bold text-primary group-hover:underline">
                            View details
                            <ChevronRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Saved Attractions Preview */}
              {savedAttractions.length > 0 && (
                <div className="mt-12">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-on-surface tracking-tight">Your Saved Collection</h2>
                    <button onClick={() => setActiveTab('saved')} className="text-primary font-bold text-sm hover:brightness-110 flex items-center gap-1 group">
                      View all <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedAttractions.map(attr => (
                      <div key={attr.id} className="group relative bg-surface-container-lowest rounded-3xl overflow-hidden shadow-sm border border-outline-variant/35 hover:shadow-xl hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                        <div className="aspect-[4/3] overflow-hidden relative">
                          <img src={attr.img} alt={attr.name} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                          <div className="absolute top-4 right-4 bg-surface-container-lowest/90 backdrop-blur-md p-2.5 rounded-full shadow-lg text-primary">
                            <BookMarked className="w-4 h-4 fill-current" />
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 p-5 w-full">
                          <h3 className="font-black text-xl text-white mb-1.5">{attr.name}</h3>
                          <p className="text-slate-200 flex items-center gap-1.5 text-xs font-semibold">
                            <MapPin className="w-3.5 h-3.5 text-amber-400" /> {attr.city}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/35 p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-black text-on-surface tracking-tight mb-8">Your Bookings</h2>

              {(pendingBookings.length === 0 && confirmedTickets.length === 0) ? (
                <div className="text-center py-20 bg-background rounded-2xl border border-dashed border-outline-variant/40">
                  <div className="w-16 h-16 bg-surface-container-lowest rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-outline-variant/20">
                    <CreditCard className="w-6 h-6 text-on-surface-variant/40" />
                  </div>
                  <h3 className="text-lg font-bold text-on-surface mb-2">No active bookings</h3>
                  <p className="text-on-surface-variant text-sm max-w-sm mx-auto mb-6">You haven't booked any tickets yet. Explore monuments to skip the queues.</p>
                  <button onClick={() => navigate("/state")} className="bg-primary hover:brightness-110 text-on-primary px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-md">
                    Explore Monuments
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  {confirmedTickets.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-on-surface mb-4 border-b border-outline-variant/20 pb-2">Active Digital Passes</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {confirmedTickets.map((ticket) => {
                          const ref = ticket?.booking_reference || "-";
                          const name = ticket?.experience_name || "Experience";
                          const experienceId = ticket?.experience_id || ticket?.experience;
                          const images = String(ticket?.experience_image || "")
                            .split(",")
                            .map((url) => url.trim())
                            .filter(Boolean);
                          const coverImage = images[0] || getExperienceImage(name);

                          return (
                            <article
                              key={ticket.qr_code || ticket.id}
                              className="group bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full relative"
                            >
                              {/* Upper Media aspect ratio container */}
                              <Link
                                to={`/attraction/${experienceId}`}
                                className="relative h-44 overflow-hidden flex-shrink-0 block"
                              >
                                <img
                                  src={coverImage}
                                  alt={name}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                {/* Status badge */}
                                <div className="absolute top-3 left-3">
                                  {getStatusBadge("confirmed")}
                                </div>
                              </Link>

                              {/* Lower Details */}
                              <div className="p-5 flex-1 flex flex-col justify-between">
                                <div>
                                  {/* Title */}
                                  <h3 className="font-bold text-base text-on-surface line-clamp-1 mb-1">
                                    <Link to={`/attraction/${experienceId}`} className="hover:text-primary transition-colors">
                                      {name}
                                    </Link>
                                  </h3>
                                  {/* Reference */}
                                  <p className="text-[10px] text-on-surface-variant/60 font-mono tracking-wider mb-4">
                                    Ref: {ref}
                                  </p>

                                  {/* Details Row */}
                                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-on-surface-variant mb-6">
                                    <div>
                                      <span className="text-[9px] text-on-surface-variant/60 block uppercase tracking-wider mb-0.5">Date</span>
                                      <span className="font-semibold text-on-surface">{formatDate(ticket?.booking_date)}</span>
                                    </div>
                                    <div>
                                      <span className="text-[9px] text-on-surface-variant/60 block uppercase tracking-wider mb-0.5">Slot</span>
                                      <span className="font-semibold text-on-surface">{ticket?.slot_time || "General"}</span>
                                    </div>
                                    <div>
                                      <span className="text-[9px] text-on-surface-variant/60 block uppercase tracking-wider mb-0.5">Tickets</span>
                                      <span className="font-semibold text-on-surface">{ticket?.total_tickets ?? "1"} Ticket</span>
                                    </div>
                                    <div>
                                      <span className="text-[9px] text-on-surface-variant/60 block uppercase tracking-wider mb-0.5">Paid</span>
                                      <span className="font-semibold text-on-surface">{formatCurrency(ticket?.total_amount)}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Show QR Action */}
                                <button
                                  onClick={() => setSelectedTicket(ticket)}
                                  className="w-full py-2.5 bg-primary text-on-primary font-semibold text-xs rounded-lg hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                                >
                                  <span className="material-symbols-outlined text-sm leading-none">qr_code_2</span>
                                  Show QR Code
                                </button>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {pendingBookings.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-on-surface mb-4 border-b border-outline-variant/20 pb-2">Pending Orders</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {pendingBookings.map((booking) => (
                          <div key={booking.id} className="bg-surface-container-lowest border border-outline-variant/35 rounded-3xl p-5 flex flex-col justify-between gap-4">
                            <div>
                              <div className="flex justify-between items-start">
                                <h4 className="font-bold text-on-surface text-base">{booking.experience_name}</h4>
                                <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                                  Pending
                                </span>
                              </div>
                              <p className="text-[10px] text-on-surface-variant/70 font-mono mt-1">Ref: {booking.reference}</p>
                              <div className="grid grid-cols-2 gap-2 mt-4 text-xs text-on-surface-variant">
                                <div>Date: <span className="font-semibold text-on-surface">{booking.booking_date}</span></div>
                                <div>Slot: <span className="font-semibold text-on-surface">{booking.slot_time || "General"}</span></div>
                                <div>Tickets: <span className="font-semibold text-on-surface">{booking.total_tickets}</span></div>
                                <div>Amount: <span className="font-semibold text-on-surface">₹{booking.total_amount}</span></div>
                              </div>
                            </div>
                            <button
                              onClick={() => navigate(`/payment/${booking.reference}`)}
                              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md transition-all text-center cursor-pointer"
                            >
                              Complete Payment
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* {activeTab === 'saved' && (
              <div className="bg-surface-container-lowest border border-outline-variant/35 p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl font-black text-on-surface tracking-tight mb-8">Saved Places</h2>
                {savedAttractions.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                     {savedAttractions.map(attr => (
                       <div key={attr.id} className="flex gap-5 p-4 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl hover:border-primary/30 hover:shadow-md transition-all group cursor-pointer">
                         <div className="w-28 h-28 flex-shrink-0 overflow-hidden rounded-xl">
                           <img src={attr.img} alt={attr.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                         </div>
                         <div className="flex flex-col justify-center flex-1">
                           <h3 className="font-black text-lg text-on-surface mb-1 group-hover:text-primary transition-colors">{attr.name}</h3>
                           <p className="text-on-surface-variant text-xs font-semibold flex items-center gap-1.5 mb-3">
                             <MapPin className="w-3.5 h-3.5 text-amber-500" /> {attr.city}
                           </p>
                           <button className="self-start text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg group-hover:bg-primary/20 transition-colors">
                             Plan Visit
                           </button>
                         </div>
                       </div>
                     ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-background rounded-2xl border border-dashed border-outline-variant/40">
                     <div className="w-16 h-16 bg-surface-container-lowest rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-outline-variant/20">
                       <BookMarked className="w-6 h-6 text-on-surface-variant/40" />
                     </div>
                     <h3 className="text-lg font-bold text-on-surface mb-2">No saved places</h3>
                     <p className="text-on-surface-variant text-sm max-w-sm mx-auto mb-6">Explore destinations and bookmark your favorite monuments to plan trips.</p>
                     <button onClick={() => navigate("/state")} className="bg-primary hover:brightness-110 text-on-primary px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-md">
                       Explore Monuments
                     </button>
                  </div>
                )}
              </div>
           )} */}

          {activeTab === 'settings' && (
            <div className="bg-surface-container-lowest border border-outline-variant/35 p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-black text-on-surface tracking-tight mb-8">Account Settings</h2>

              {updateMsg.text && (
                <div className={`mb-6 p-4 rounded-xl text-sm font-bold ${updateMsg.type === 'success' ? 'bg-primary/10 text-primary' : 'bg-error/10 text-error'}`}>
                  {updateMsg.text}
                </div>
              )}

              <div className="space-y-6 max-w-2xl">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70 mb-2">Email Address (Read Only)</label>
                  <input type="email" readOnly value={user?.email || ""} className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface-variant font-semibold focus:outline-none cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70 mb-2">Full Name</label>
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-background border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70 mb-2">Phone Number</label>
                  <input type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="+91 9999999999" className="w-full bg-background border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                </div>
                <div className="pt-4">
                  <button onClick={handleUpdateProfile} disabled={isUpdating} className="flex items-center justify-center gap-2 bg-primary hover:brightness-110 disabled:bg-surface-container-high disabled:text-on-surface/40 text-on-primary px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-md">
                    {isUpdating ? <><Loader2 className="w-4 h-4 animate-spin text-on-primary" /> Updating...</> : "Update Profile"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* QR Code Modal Overlay (Dialog) */}
      {selectedTicket && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedTicket(null)}
        >
          <div
            className="w-full max-w-sm bg-surface-container-lowest rounded-2xl p-6 shadow-2xl relative border border-outline-variant/30 flex flex-col items-center animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button icon */}
            <button
              onClick={() => setSelectedTicket(null)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>

            {/* Header */}
            <div className="text-center w-full px-4 mb-4">
              <span className="text-[9px] font-bold text-primary uppercase tracking-widest block mb-1">Monument Digital Pass</span>
              <h3 className="font-bold text-lg text-on-surface truncate">
                {selectedTicket?.experience_name || "Experience"}
              </h3>
              <p className="text-[10px] text-on-surface-variant/60 font-mono tracking-wider uppercase mt-0.5">
                Ref: {selectedTicket?.booking_reference || "-"}
              </p>
            </div>

            {/* QR Image Visualizer */}
            <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 my-4 flex items-center justify-center">
              {selectedTicket?.qr_image ? (
                <img
                  src={selectedTicket.qr_image}
                  alt="Ticket QR Code"
                  className="w-44 h-44 rounded-lg shadow-sm border border-surface-container bg-surface-container p-2"
                />
              ) : (
                <div className="w-44 h-44 rounded-lg bg-error/10 flex flex-col items-center justify-center border border-error/20 p-4 text-center">
                  <span className="material-symbols-outlined text-3xl text-error mb-1">error</span>
                  <p className="text-xs text-error font-semibold leading-relaxed">QR image not found</p>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="text-center text-xs text-on-surface-variant leading-relaxed px-4 mb-6">
              <p className="font-semibold text-on-surface mb-1">Gateway instructions</p>
              Present this code to the scanner at the monument entrance gate. Valid for {selectedTicket?.total_tickets ?? 1} visitor(s).
            </div>

            {/* Modal CTA actions */}
            <div className="flex gap-3 w-full">
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-on-primary py-2.5 rounded-lg text-xs font-semibold hover:brightness-110 active:scale-95 transition-all shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm leading-none">download</span>
                Download PDF
              </button>
              <button
                onClick={() => setSelectedTicket(null)}
                className="flex items-center justify-center bg-surface-container text-on-surface-variant border border-outline-variant/35 px-4 py-2.5 rounded-lg text-xs font-semibold hover:bg-surface-container-high active:scale-95 transition-all cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default UserDashboard;
