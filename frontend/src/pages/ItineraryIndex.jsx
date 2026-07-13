import React, { useState, useMemo } from 'react';
import { Compass, Clock, MapPin, ChevronRight, Check } from 'lucide-react';

const CURATED_ITINERARIES = {
  jaipur: {
    title: "Royal Jaipur Architectural Tour",
    duration: "2 Days",
    city: "Jaipur",
    tagline: "Experience the Pink City's majestic hill forts, mirror palaces, and astronomical wonders.",
    days: [
      {
        day: 1, theme: "Heritage and Fortresses", activities: [
          { time: "09:00 AM", place: "Amer Fort", description: "Explore sandstone palaces, Sheesh Mahal mirror hall, and panoramic ramparts overlooking the lake.", image: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=400&q=80" },
          { time: "02:00 PM", place: "Nahargarh Fort", description: "Stand on the edge of the Aravalli hills with a breathtaking aerial view of the pink city.", image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=400&q=80" },
          { time: "05:00 PM", place: "Jal Mahal", description: "Watch the floating palace glow at twilight from the Man Sagar Lake embankment.", image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=400&q=80" },
        ]
      },
      {
        day: 2, theme: "Palaces and Observatories", activities: [
          { time: "09:30 AM", place: "Hawa Mahal", description: "Stand before the iconic 953-window facade designed for royal ladies to observe street festivals.", image: "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?auto=format&fit=crop&w=400&q=80" },
          { time: "11:30 AM", place: "City Palace", description: "Walk through royal courtyards, textile galleries, and the magnificent Peacock Gate.", image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=400&q=80" },
          { time: "03:00 PM", place: "Jantar Mantar", description: "Marvel at the world's largest stone sundial and its extraordinary astronomical precision.", image: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=400&q=80" },
        ]
      },
    ]
  },
  delhi: {
    title: "Imperial Delhi Discovery",
    duration: "2 Days",
    city: "Delhi",
    tagline: "Walk through centuries of dynastic history from grand Mughal forts to colonial avenues.",
    days: [
      {
        day: 1, theme: "Old Delhi Mughal Splendor", activities: [
          { time: "09:00 AM", place: "Red Fort", description: "Walk through the historic barracks and the Diwan-i-Aam public audience hall.", image: "https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?auto=format&fit=crop&w=400&q=80" },
          { time: "01:00 PM", place: "Jama Masjid", description: "Climb the minarets of India's largest mosque for sweeping views over Old Delhi.", image: "https://images.unsplash.com/photo-1587135941948-670b381f08ec?auto=format&fit=crop&w=400&q=80" },
          { time: "04:30 PM", place: "Raj Ghat", description: "Pay respects at the peaceful Mahatma Gandhi memorial garden on the Yamuna banks.", image: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=400&q=80" },
        ]
      },
      {
        day: 2, theme: "New Delhi Monuments", activities: [
          { time: "09:30 AM", place: "Qutub Minar", description: "See the towering 12th-century victory tower and surrounding archaeological park.", image: "https://images.unsplash.com/photo-1587135941948-670b381f08ec?auto=format&fit=crop&w=400&q=80" },
          { time: "01:00 PM", place: "Humayun's Tomb", description: "Stroll through the lush garden tomb that inspired the architecture of the Taj Mahal.", image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=400&q=80" },
          { time: "04:00 PM", place: "India Gate", description: "Walk down Kartavya Path and admire the war memorial arch at golden hour.", image: "https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?auto=format&fit=crop&w=400&q=80" },
        ]
      },
    ]
  },
  agra: {
    title: "Agra Mughal Heritage Trail",
    duration: "2 Days",
    city: "Agra",
    tagline: "Explore the eternal monument of love and the formidable red sandstone citadels.",
    days: [
      {
        day: 1, theme: "The Taj and Crafts", activities: [
          { time: "06:00 AM", place: "Taj Mahal", description: "Watch the marble dome catch the first light of sunrise — the most photographed moment in India.", image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=400&q=80" },
          { time: "11:00 AM", place: "Itmad-ud-Daulah", description: "Visit the Baby Taj — the first Mughal structure built entirely from marble with pietra dura inlay.", image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=400&q=80" },
          { time: "03:00 PM", place: "Kinari Bazaar", description: "Explore the old bazaar for marble handicrafts, leather goods, and Mughal-era jewellery.", image: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=400&q=80" },
        ]
      },
      {
        day: 2, theme: "Forts and Dynasties", activities: [
          { time: "09:30 AM", place: "Agra Fort", description: "Explore the walled Mughal city and royal residences built by Emperor Akbar in red sandstone.", image: "https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?auto=format&fit=crop&w=400&q=80" },
          { time: "02:00 PM", place: "Fatehpur Sikri", description: "Day-trip to Akbar's abandoned sandstone capital, including the towering Buland Darwaza.", image: "https://images.unsplash.com/photo-1587135941948-670b381f08ec?auto=format&fit=crop&w=400&q=80" },
        ]
      },
    ]
  },
  hampi: {
    title: "Ruins of the Vijayanagara Empire",
    duration: "2 Days",
    city: "Hampi",
    tagline: "Traverse a surreal landscape of giant boulders, carved shrines, and forgotten palace courts.",
    days: [
      {
        day: 1, theme: "Sacred Center and Temples", activities: [
          { time: "08:30 AM", place: "Virupaksha Temple", description: "Visit the ancient active temple dedicated to Lord Shiva near the Tungabhadra river bank.", image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=400&q=80" },
          { time: "11:00 AM", place: "Hemakuta Hill", description: "Climb the rocky hill to see early Jain and Shaiva temples and panoramic views.", image: "https://images.unsplash.com/photo-1600100397608-f010e42ed98e?auto=format&fit=crop&w=400&q=80" },
          { time: "03:30 PM", place: "Vittala Temple Complex", description: "See the iconic Stone Chariot and the resonant musical pillars of the main hall.", image: "https://images.unsplash.com/photo-1600100397608-f010e42ed98e?auto=format&fit=crop&w=400&q=80" },
        ]
      },
      {
        day: 2, theme: "Royal Center Chronicles", activities: [
          { time: "09:00 AM", place: "Lotus Mahal and Elephant Stables", description: "Admire the Indo-Islamic pavilions and the symmetrical row of elephant chambers.", image: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=400&q=80" },
          { time: "11:30 AM", place: "Hazara Rama Temple", description: "Examine the Ramayana narrative carvings covering the entire outer wall of the temple.", image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=400&q=80" },
          { time: "03:00 PM", place: "Matanga Hill", description: "Hike up the rocky trail to witness a spectacular sunset over the Hampi boulder ruins.", image: "https://images.unsplash.com/photo-1600100397608-f010e42ed98e?auto=format&fit=crop&w=400&q=80" },
        ]
      },
    ]
  }
};

const INTERESTS = ["History", "Architecture", "Photography", "Culture", "Family", "Adventure"];

export default function ItineraryIndex() {
  const [plannerCity, setPlannerCity] = useState("jaipur");
  const [plannerDuration, setPlannerDuration] = useState("2");
  const [plannerInterests, setPlannerInterests] = useState(["History", "Architecture"]);
  
  const toggleInterest = (i) => setPlannerInterests(p => p.includes(i) ? p.filter(x => x !== i) : [...p, i]);

  const itinerary = useMemo(() => {
    return CURATED_ITINERARIES[plannerCity] || CURATED_ITINERARIES.jaipur;
  }, [plannerCity]);

  return (
    <div className="min-h-screen bg-[#fcf8f9] text-[#1b1b1c] font-['Sora'] antialiased pt-28 pb-16">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <nav className="flex items-center justify-center gap-1.5 text-[#3e4945] text-xs font-semibold mb-4">
            <a href="/" className="hover:text-[#006955] transition-colors">Home</a>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#006955] font-bold">Itineraries</span>
          </nav>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#1b1b1c] mb-4">
            Heritage Route Planner
          </h1>
          <p className="text-[#3e4945] text-sm sm:text-base max-w-xl mx-auto leading-relaxed font-semibold">
            Choose your preferred settings to dynamically display Curated Heritage routes and daily planned monuments.
          </p>
        </div>

        {/* Dynamic Preference Selection and Output Grid */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Panel: Preferences Selector */}
          <div className="lg:col-span-4 bg-white border border-[#E8ECEB] p-6 sm:p-8 rounded-[24px] shadow-sm lg:sticky lg:top-32">
            <div className="space-y-6">
              
              {/* Destination Select */}
              <div>
                <label htmlFor="itinerary-planner-city" className="block text-[10px] font-bold text-[#3e4945] uppercase tracking-widest mb-2.5">Destination</label>
                <select
                  id="itinerary-planner-city"
                  value={plannerCity}
                  onChange={(e) => setPlannerCity(e.target.value)}
                  className="w-full bg-[#f0edee] border border-[#bdc9c3] rounded-xl px-4 py-3 text-[#1b1b1c] text-sm outline-none cursor-pointer focus:ring-2 focus:ring-[#006955]/20 focus:border-[#006955] font-semibold"
                >
                  <option value="jaipur">Jaipur — Pink City</option>
                  <option value="delhi">Delhi — Historic Capital</option>
                  <option value="agra">Agra — Mughal Capital</option>
                  <option value="hampi">Hampi — Vijayanagara Empire</option>
                </select>
              </div>

              {/* Duration buttons */}
              <div>
                <label className="block text-[10px] font-bold text-[#3e4945] uppercase tracking-widest mb-2.5">Duration</label>
                <div className="grid grid-cols-5 gap-2">
                  {["1", "2", "3", "4", "5"].map((d) => (
                    <button 
                      key={d} 
                      onClick={() => setPlannerDuration(d)}
                      className={`py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        plannerDuration === d 
                          ? "bg-[#006955] border-[#006955] text-white" 
                          : "bg-white border-[#bdc9c3] text-[#3e4945] hover:bg-[#f0edee]"
                      }`}
                    >
                      {d}d
                    </button>
                  ))}
                </div>
              </div>

              {/* Interests Multi-Select */}
              <div>
                <label className="block text-[10px] font-bold text-[#3e4945] uppercase tracking-widest mb-2.5">Focus Interests</label>
                <div className="grid grid-cols-2 gap-2">
                  {INTERESTS.map((interest) => {
                    const sel = plannerInterests.includes(interest);
                    return (
                      <button 
                        key={interest} 
                        onClick={() => toggleInterest(interest)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          sel 
                            ? "bg-[#006955]/10 border-[#006955] text-[#006955] font-bold" 
                            : "bg-white border-[#bdc9c3] text-[#3e4945] hover:bg-[#f0edee]"
                        }`}
                      >
                        {interest}
                        {sel && <Check className="w-3.5 h-3.5 text-[#006955]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          {/* Right Panel: Itinerary Result */}
          <div className="lg:col-span-8">
            {itinerary && (
              <div className="space-y-6">
                
                {/* Info Card */}
                <div className="relative overflow-hidden rounded-[24px] bg-slate-900 text-white p-6 sm:p-8 shadow-sm border border-[#E8ECEB]">
                  {/* Background Image with overlay */}
                  <div className="absolute inset-0 z-0">
                    <img 
                      src={
                        plannerCity === "jaipur" 
                          ? "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80" 
                          : plannerCity === "delhi"
                          ? "https://images.unsplash.com/photo-1587135941948-670b381f08ec?auto=format&fit=crop&w=800&q=80"
                          : plannerCity === "agra"
                          ? "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80"
                          : "https://images.unsplash.com/photo-1600100397608-f010e42ed98e?auto=format&fit=crop&w=800&q=80"
                      } 
                      alt={itinerary.title}
                      className="w-full h-full object-cover brightness-40 transition-all duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/40 to-transparent" />
                  </div>
                  
                  <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest bg-amber-400/20 px-3 py-1 rounded-full border border-amber-400/30">
                        Curated Tour
                      </span>
                      <h3 className="text-white font-extrabold text-2xl sm:text-3xl mt-3 tracking-tight drop-shadow-md">
                        {itinerary.title}
                      </h3>
                      <p className="text-slate-200 text-xs sm:text-sm mt-2 max-w-xl leading-relaxed">
                        {itinerary.tagline}
                      </p>
                    </div>
                    <span className="self-start sm:self-auto bg-amber-400 text-slate-950 text-xs font-bold px-4 py-2 rounded-full shadow-md shrink-0">
                      {itinerary.duration}
                    </span>
                  </div>
                </div>


                {/* Day-by-Day Timeline */}
                {itinerary.days.map((dayData, di) => (
                  <div key={di} className="bg-white border border-[#E8ECEB] rounded-[24px] overflow-hidden shadow-sm">
                    <div className="px-6 py-4 bg-[#F7F9F9] border-b border-[#E8ECEB] flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-[#006955] text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {dayData.day}
                      </span>
                      <div>
                        <span className="text-[10px] text-[#3e4945] uppercase tracking-wider font-bold">Day {dayData.day}</span>
                        <h4 className="text-[#1b1b1c] font-bold text-sm">{dayData.theme}</h4>
                      </div>
                    </div>
                    <div className="divide-y divide-[#E8ECEB]/60">
                      {dayData.activities.map((act, ai) => (
                        <div key={ai} className="p-6 flex flex-col md:flex-row gap-6 hover:bg-[#F7F9F9]/20 transition-colors">
                          {act.image && (
                            <div className="w-full md:w-44 h-28 rounded-2xl overflow-hidden shrink-0 shadow-xs">
                              <img 
                                src={act.image} 
                                alt={act.place} 
                                className="w-full h-full object-cover" 
                              />
                            </div>
                          )}
                          <div className="flex-grow flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <h5 className="text-[#1b1b1c] font-bold text-base">{act.place}</h5>
                                <span className="text-[#006955] text-[10px] bg-[#006955]/10 px-2.5 py-1 rounded-full font-bold">
                                  {act.time}
                                </span>
                              </div>
                              <p className="text-[#3e4945] text-xs leading-relaxed">
                                {act.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
