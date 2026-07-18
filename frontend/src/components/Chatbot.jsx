import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { useLocation } from "react-router-dom";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "👋 Welcome to ZeQue Assistant.\n\nChoose an option below or ask me about places, itineraries, food, hotels, and attractions." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const location = useLocation();

  const quickOptions = ["Places to visit in Hyderabad", "Best restaurants in Hyderabad", "Best hotels in Hyderabad", "Best time to visit Hyderabad", "Top attractions in Hyderabad"];


  const SUGGESTION_CHIPS = [
    "2-day trip to Jaipur",
    "Top sights in Hampi",
    "How to book tickets?"
  ];

  const handleSuggestionClick = async (chipText) => {
    if (isLoading) return;
    setMessages(prev => [...prev, { role: "user", content: chipText }]);
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
            { role: "system", content: "You are a professional, highly knowledgeable travel assistant for an application called ZeQue. You provide extremely brief, structured, bullet-point advice. Avoid long paragraphs and verbose explanations. Keep responses clean and concise under 4 sentences. Do not use emojis." },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: "user", content: chipText }
          ],
          temperature: 0.5,
          max_tokens: 250
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
            { role: "system", content: "You are a professional, highly knowledgeable travel assistant for an application called ZeQue. You provide extremely brief, structured, bullet-point advice. Avoid long paragraphs and verbose explanations. Keep responses clean and concise under 4 sentences. Do not use emojis." },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: "user", content: userMsg }
          ],
          temperature: 0.5,
          max_tokens: 250
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

  const isDetailsPage = location.pathname.startsWith("/attraction") || location.pathname.startsWith("/experience");

  if (location.pathname === "/explore-near-me") {
    return null;
  }

  return (
    <div className={`fixed right-6 z-50 ${isDetailsPage ? "bottom-24 lg:bottom-6" : "bottom-6"}`}>
      {isOpen ? (
        <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface w-[380px] h-[500px] flex flex-col overflow-hidden transition-all duration-300">
          {/* Header */}
          <div className="bg-primary-container text-on-primary p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-sm">ZeQue Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-on-primary/80 hover:text-on-primary hover:bg-on-primary/10 rounded-full p-1 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface-container-low">
            {messages.length === 1 && (
              <div className="grid grid-cols-1 gap-2 mb-4">
                {quickOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => setInput(option)}
                    className="text-xs bg-surface-container-highest border rounded-xl p-3 hover:border-primary text-left"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-4 py-2 text-sm ${msg.role === "user"
                  ? "bg-primary text-on-primary rounded-2xl rounded-br-md"
                  : "bg-surface-container-highest border border-gray-200 rounded-2xl rounded-bl-md shadow-sm"
                  }`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {messages.length === 1 && (
              <div className="flex flex-col gap-2 pt-1">
                <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Suggested queries:</p>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTION_CHIPS.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(chip)}
                      className="text-xs bg-surface-container-lowest hover:bg-primary/5 text-primary border border-primary/20 rounded-full px-2.5 py-1 transition-all text-left font-medium active:scale-95 shadow-2xs"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-surface-container-lowest border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 bg-surface-container-lowest border-t border-gray-150 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 bg-surface-container-highest rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button type="submit" disabled={isLoading || !input.trim()} className="w-9 h-9 bg-primary hover:brightness-95 disabled:bg-gray-300 text-on-primary rounded-full flex items-center justify-center transition-colors shrink-0">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary hover:brightness-110 hover:-translate-y-1 text-on-primary w-14 h-14 rounded-full shadow-lg shadow-primary/20 flex items-center justify-center transition-all duration-300 relative group"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-error rounded-full border-2 border-surface-container-lowest animate-pulse"></span>

          {/* Tooltip */}
          <div className="absolute right-full mr-4 bg-surface-container-lowest text-on-surface text-sm font-bold px-4 py-2 rounded-xl shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300">
            Assistance Available
            {/* Arrow */}
            <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-4 bg-surface-container-lowest rotate-45"></div>
          </div>
        </button>
      )}
    </div>
  );
}
