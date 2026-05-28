import { useState, useEffect } from "react";
import "../styles/Loading.css";

export default function Loading() {
  const [statusIndex, setStatusIndex] = useState(0);

  const statuses = [
    "Booking Your Experience...",
    "Generating Secure Pass...",
    "Verifying Identity...",
    "Confirming Admission Slots...",
    "Encrypting Ticket QR..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % statuses.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden flex flex-col items-center justify-center bg-[#f8fafc]">
      
      {/* Subtle Ambient Background Canvas */}
      <div className="absolute inset-0 pointer-events-none z-0 bg-gradient-to-tr from-primary/5 via-white to-gray-50/50">
        <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40vw] h-[40vw] rounded-full bg-tertiary/5 blur-[120px]" />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 md:px-16 w-full">
        
        {/* Aeroplane Loading Overlay (Behind Card) */}
        <span className="absolute text-[2.8rem] filter drop-shadow-[0_0_14px_rgba(0,212,170,0.7)] select-none pointer-events-none animate-plane-streak z-0">
          ✈️
        </span>

        {/* Floating Ticket Card */}
        <div className="relative w-full max-w-[600px] flex items-stretch bg-white border border-gray-150 rounded-xl shadow-xl overflow-visible animate-tick-in animate-ticket-float z-10">
          
          {/* Main Info Area (Left Column) */}
          <div className="flex-grow flex flex-col items-center justify-center py-12 px-8 border-r-[3px] border-dashed border-gray-200/80 relative">
            <span className="absolute top-4 left-4 font-['Inter'] text-[9px] font-bold text-gray-400/60 uppercase tracking-widest">
              Premium Digital Pass
            </span>
            <span className="absolute top-4 right-4 font-mono text-[9px] text-gray-400/40 tracking-wider">
              REF: BOARDING
            </span>
            
            <h1 className="font-['Hanken_Grotesk'] text-5xl font-extrabold text-primary tracking-tighter mb-1.5 select-none">
              ZeQue
            </h1>
            <div className="h-[1px] w-12 bg-gray-200/80 my-3" />
            <span className="font-['Inter'] text-[10px] font-bold text-gray-400 tracking-[0.4em] uppercase opacity-70">
              Zero Queue
            </span>
          </div>

          {/* Ticket Stub Area (Right Column) */}
          <div className="w-[180px] bg-gray-50/50 flex flex-col items-center justify-center py-12 px-6 text-center relative overflow-visible rounded-r-xl">
            {/* Cutout Punches */}
            <div className="absolute top-1/2 -left-4 w-8 h-8 bg-gray-50 rounded-full -translate-y-1/2 border border-gray-150 z-20" />
            <div className="absolute top-1/2 -right-4 w-8 h-8 bg-gray-50 rounded-full -translate-y-1/2 border border-gray-150 z-20" />

            <div className="p-3.5 rounded-full bg-tertiary/10 mb-4 text-tertiary flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl leading-none">confirmation_number</span>
            </div>
            
            <span className="font-['Hanken_Grotesk'] text-[10px] font-extrabold text-tertiary tracking-widest uppercase leading-tight">
              Travel Anywhere
            </span>
          </div>

        </div>

        {/* Loading State & Meta Footer */}
        <div className="mt-10 flex flex-col items-center gap-6 w-full max-w-[400px] animate-fade-up z-25">
          
          {/* Status Text Header */}
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary animate-spin text-lg leading-none select-none">
              progress_activity
            </span>
            <span className="font-['Hanken_Grotesk'] text-xs font-bold text-primary tracking-[0.15em] uppercase">
              {statuses[statusIndex]}
            </span>
          </div>

          {/* Loading Progress Bar */}
          <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-primary animate-loading-bar rounded-full shadow-[0_0_10px_rgba(0,212,170,0.5)]" />
          </div>

          {/* Meta Stats Grid */}
          <div className="flex gap-6 mt-2 items-center justify-center w-full">
            <div className="text-center font-['Inter']">
              <span className="text-[9px] text-gray-400 block uppercase tracking-wider mb-0.5">Network</span>
              <span className="text-xs font-bold text-gray-700">Encrypted</span>
            </div>
            <div className="w-[1px] h-8 bg-gray-200/80" />
            <div className="text-center font-['Inter']">
              <span className="text-[9px] text-gray-400 block uppercase tracking-wider mb-0.5">Identity</span>
              <span className="text-xs font-bold text-gray-700">Verified</span>
            </div>
            <div className="w-[1px] h-8 bg-gray-200/80" />
            <div className="text-center font-['Inter']">
              <span className="text-[9px] text-gray-400 block uppercase tracking-wider mb-0.5">Latency</span>
              <span className="text-xs font-bold text-gray-700">12ms</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
