import React, { useState, useContext, useEffect } from 'react';
import { BookMarked, MapPin, Calendar, Settings, Compass, ChevronRight, LogOut, Search, CreditCard, Award, Loader2 } from 'lucide-react';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const { user, logout, updateProfile } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState({ text: "", type: "" });

  useEffect(() => {
    if (user) {
      const name = `${user.first_name || ""} ${user.last_name || ""}`.trim();
      setEditName(name || user.username || "");
      setEditPhone(user.mobile || "");
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

  const savedAttractions = [
    { id: 1, name: 'Amer Fort', city: 'Jaipur', img: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&w=800' },
    { id: 2, name: 'Taj Mahal', city: 'Agra', img: 'https://images.unsplash.com/photo-1564507592208-028fdb71ec1e?auto=format&fit=crop&w=800&w=800' },
    { id: 3, name: 'Hawa Mahal', city: 'Jaipur', img: 'https://images.unsplash.com/photo-1599661559882-628d01b1b016?auto=format&fit=crop&w=800&w=800' }
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/");
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

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">
        
        {/* Sidebar */}
        <div className="w-full lg:w-72 flex-shrink-0">
          <div className="bg-white rounded-3xl border border-slate-200/60 p-6 sticky top-32 shadow-sm">
            {/* User Profile Mini */}
            <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100 mb-6">
              <div className="w-20 h-20 rounded-full bg-[#136b55] flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-emerald-900/20 mb-4 ring-4 ring-slate-50">
                {initials}
              </div>
              <h3 className="font-black text-slate-900 text-lg tracking-tight">{fullName}</h3>
              <p className="text-xs font-bold text-slate-400 mt-1">{user?.email}</p>
              <div className="mt-4 bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5">
                <Award className="w-3 h-3" /> Explorer Tier
              </div>
            </div>
            
            <nav className="space-y-1.5">
              <button 
                onClick={() => setActiveTab('overview')} 
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 font-semibold text-sm ${activeTab === 'overview' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <Compass className={`w-5 h-5 ${activeTab === 'overview' ? 'text-amber-400' : 'text-slate-400'}`} /> Dashboard
              </button>
              <button 
                onClick={() => setActiveTab('bookings')} 
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 font-semibold text-sm ${activeTab === 'bookings' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <Calendar className={`w-5 h-5 ${activeTab === 'bookings' ? 'text-amber-400' : 'text-slate-400'}`} /> My Bookings
              </button>
              <button 
                onClick={() => setActiveTab('saved')} 
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 font-semibold text-sm ${activeTab === 'saved' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <BookMarked className={`w-5 h-5 ${activeTab === 'saved' ? 'text-amber-400' : 'text-slate-400'}`} /> Saved Trips
              </button>
              <button 
                onClick={() => setActiveTab('settings')} 
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 font-semibold text-sm ${activeTab === 'settings' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <Settings className={`w-5 h-5 ${activeTab === 'settings' ? 'text-amber-400' : 'text-slate-400'}`} /> Settings
              </button>
            </nav>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 font-semibold text-sm text-red-600 hover:bg-red-50"
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
                  <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Welcome back, {fullName.split(" ")[0]}.</h1>
                  <p className="text-slate-500 mt-2">Ready for your next heritage discovery?</p>
                </div>
                <button onClick={() => navigate("/state")} className="hidden sm:flex items-center gap-2 bg-[#136b55] hover:bg-[#0c4c3b] text-white px-6 py-3 rounded-full text-sm font-bold transition-all shadow-lg hover:-translate-y-0.5">
                  <Search className="w-4 h-4" /> Explore Maps
                </button>
              </div>
              
              {/* Premium Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                    <BookMarked className="w-24 h-24 rotate-12 transform -translate-y-4 translate-x-4" />
                  </div>
                  <div className="relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-6 backdrop-blur-md border border-white/10">
                      <BookMarked className="w-5 h-5 text-amber-400" />
                    </div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Saved Places</p>
                    <h3 className="text-4xl font-black">12</h3>
                  </div>
                </div>
                
                <div className="bg-[#136b55] rounded-3xl p-6 text-white shadow-xl shadow-emerald-900/20 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Calendar className="w-24 h-24 rotate-12 transform -translate-y-4 translate-x-4" />
                  </div>
                  <div className="relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-6 backdrop-blur-md border border-white/10">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider mb-1">Upcoming Trips</p>
                    <h3 className="text-4xl font-black">3</h3>
                  </div>
                </div>

                <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm relative overflow-hidden group">
                  <div className="relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center mb-6">
                      <MapPin className="w-5 h-5 text-amber-600" />
                    </div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Cities Explored</p>
                    <h3 className="text-4xl font-black text-slate-900">5</h3>
                  </div>
                </div>
              </div>

              {/* Saved Attractions Preview */}
              <div className="mt-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Your Saved Collection</h2>
                  <button onClick={() => setActiveTab('saved')} className="text-[#136b55] font-bold text-sm hover:text-[#0c4c3b] flex items-center gap-1 group">
                    View all <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedAttractions.map(attr => (
                    <div key={attr.id} className="group relative bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200/60 hover:shadow-xl hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                      <div className="aspect-[4/3] overflow-hidden relative">
                        <img src={attr.img} alt={attr.name} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2.5 rounded-full shadow-lg text-emerald-600">
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
            </div>
          )}

          {activeTab === 'bookings' && (
             <div className="bg-white rounded-3xl border border-slate-200/60 p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="flex items-center justify-between mb-8">
                 <h2 className="text-2xl font-black text-slate-900 tracking-tight">Your Bookings</h2>
               </div>
               
               <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                    <CreditCard className="w-6 h-6 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">No active bookings</h3>
                  <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">You haven't booked any tickets yet. Explore monuments to skip the queues.</p>
                  <button onClick={() => navigate("/state")} className="bg-[#136b55] hover:bg-[#0c4c3b] text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-md">
                    Explore Monuments
                  </button>
               </div>
             </div>
          )}

          {activeTab === 'saved' && (
             <div className="bg-white rounded-3xl border border-slate-200/60 p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
               <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-8">Saved Places</h2>
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {savedAttractions.map(attr => (
                    <div key={attr.id} className="flex gap-5 p-4 bg-white border border-slate-100 rounded-2xl hover:border-emerald-500/30 hover:shadow-md transition-all group cursor-pointer">
                      <div className="w-28 h-28 flex-shrink-0 overflow-hidden rounded-xl">
                        <img src={attr.img} alt={attr.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="flex flex-col justify-center flex-1">
                        <h3 className="font-black text-lg text-slate-900 mb-1 group-hover:text-[#136b55] transition-colors">{attr.name}</h3>
                        <p className="text-slate-500 text-xs font-semibold flex items-center gap-1.5 mb-3">
                          <MapPin className="w-3.5 h-3.5 text-amber-500" /> {attr.city}
                        </p>
                        <button className="self-start text-xs font-bold text-[#136b55] bg-emerald-50 px-3 py-1.5 rounded-lg group-hover:bg-emerald-100 transition-colors">
                          Plan Visit
                        </button>
                      </div>
                    </div>
                  ))}
               </div>
             </div>
          )}
          
          {activeTab === 'settings' && (
             <div className="bg-white rounded-3xl border border-slate-200/60 p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
               <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-8">Account Settings</h2>
               
               {updateMsg.text && (
                 <div className={`mb-6 p-4 rounded-xl text-sm font-bold ${updateMsg.type === 'success' ? 'bg-emerald-50 text-[#136b55]' : 'bg-red-50 text-red-600'}`}>
                   {updateMsg.text}
                 </div>
               )}

               <div className="space-y-6 max-w-2xl">
                 <div>
                   <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Email Address (Read Only)</label>
                   <input type="email" readOnly value={user?.email || ""} className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-500 font-semibold focus:outline-none cursor-not-allowed" />
                 </div>
                 <div>
                   <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Full Name</label>
                   <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#136b55]/30 transition-all" />
                 </div>
                 <div>
                   <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Phone Number</label>
                   <input type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="+91 9876543210" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#136b55]/30 transition-all" />
                 </div>
                 <div className="pt-4">
                   <button onClick={handleUpdateProfile} disabled={isUpdating} className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-md">
                     {isUpdating ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : "Update Profile"}
                   </button>
                 </div>
               </div>
             </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default UserDashboard;
