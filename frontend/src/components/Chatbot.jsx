import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { useLocation } from "react-router-dom";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello. I am the ZeQue travel assistant. How may I help you plan your itinerary today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const location = useLocation();



  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

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
            { role: "system", content: "You are a professional, highly knowledgeable travel assistant for an application called ZeQue. You provide concise, accurate, and professional advice without using emojis." },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: "user", content: userMsg }
          ],
          temperature: 0.5,
          max_tokens: 300
        })
      });
      if (!response.ok) throw new Error("API error");
      const data = await response.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.choices[0].message.content }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "I am currently unable to connect to the server. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (location.pathname === "/explore-near-me") {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-80 h-[400px] flex flex-col overflow-hidden transition-all duration-300">
          {/* Header */}
          <div className="bg-primary text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <span className="font-bold text-sm">ZeQue Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-1 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${msg.role === 'user' ? 'bg-primary text-white rounded-br-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm shadow-sm'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 bg-slate-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-slate-700"
            />
            <button type="submit" disabled={isLoading || !input.trim()} className="w-9 h-9 bg-primary hover:bg-[#0c4c3b] disabled:bg-slate-300 text-white rounded-full flex items-center justify-center transition-colors shrink-0">
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary hover:brightness-110 hover:-translate-y-1 text-white w-14 h-14 rounded-full shadow-lg shadow-emerald-900/20 flex items-center justify-center transition-all duration-300 relative group"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>

          {/* Tooltip */}
          <div className="absolute right-full mr-4 bg-white text-slate-800 text-sm font-bold px-4 py-2 rounded-xl shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300">
            Assistance Available
            {/* Arrow */}
            <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-4 bg-white rotate-45"></div>
          </div>
        </button>
      )}
    </div>
  );
}
