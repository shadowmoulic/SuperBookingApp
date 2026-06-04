import React, { useState } from 'react';
import { MapPin, Navigation, Sparkles, Compass, Send } from 'lucide-react';

const ExploreNearMe = () => {
  const [locationGranted, setLocationGranted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: 'Hi! I can help you plan an itinerary based on your current location. What kind of places are you in the mood for today?' }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const requestLocation = () => {
    setLoading(true);
    // Simulate location fetch
    setTimeout(() => {
      setLocationGranted(true);
      setLoading(false);
    }, 1500);
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}` 
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: "You are an AI travel itinerary planner. The user is asking for places nearby. Suggest a brief, customized day itinerary." },
            ...chatMessages,
            { role: "user", content: userMessage }
          ],
          temperature: 0.7, 
          max_tokens: 400
        })
      });
      if (!response.ok) throw new Error("API error");
      const data = await response.json();
      setChatMessages(prev => [...prev, { role: "assistant", content: data.choices[0].message.content }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Explore Near Me</h1>
          <p className="text-gray-600 text-lg">Discover incredible attractions, museums, and weekend trips right in your backyard.</p>
        </div>

        {!locationGranted ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm max-w-2xl mx-auto border border-gray-100">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600">
              <Navigation className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Allow Location Access</h2>
            <p className="text-gray-500 mb-8">We need your location to show you the best attractions and hidden gems nearby.</p>
            <button 
              onClick={requestLocation}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 mx-auto"
            >
              {loading ? (
                <>Finding you...</>
              ) : (
                <><MapPin className="w-5 h-5" /> Grant Permission</>
              )}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Nearby Places */}
            <div className="lg:col-span-2 space-y-8">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-indigo-600" /> Nearby Attractions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(item => (
                  <div key={item} className="bg-white rounded-2xl p-4 flex gap-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <div className="w-24 h-24 bg-gray-200 rounded-xl flex-shrink-0"></div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">Local Museum {item}</h3>
                      <p className="text-sm text-gray-500 mb-2">2.{item} km away</p>
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">Open Now</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Itinerary Planner */}
            <div className="bg-white rounded-3xl shadow-lg border border-indigo-50 flex flex-col h-[600px] sticky top-24">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-t-3xl text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <h2 className="text-xl font-bold">AI Itinerary Planner</h2>
                </div>
                <p className="text-indigo-100 text-sm">Tell me your interests, and I'll build a custom day trip nearby!</p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white border border-gray-100 text-gray-700 rounded-bl-sm shadow-sm'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                   <div className="flex justify-start">
                     <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-1.5">
                       <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                       <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                       <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                     </div>
                   </div>
                )}
              </div>

              <form onSubmit={handleChatSubmit} className="p-4 bg-white border-t border-gray-100 rounded-b-3xl">
                <div className="flex gap-2 relative">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="E.g., I have 3 hours, love history..."
                    className="flex-1 bg-gray-100 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-gray-700"
                  />
                  <button type="submit" disabled={isChatLoading || !chatInput.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center disabled:bg-gray-300 transition-colors">
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
                </div>
              </form>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default ExploreNearMe;
