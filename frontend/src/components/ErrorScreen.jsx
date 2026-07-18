import React from "react";
import { ShieldAlert } from "lucide-react";

export function ErrorScreen({ message, onRetry }) {
  return (
    <div className="bg-surface-container-lowest min-h-screen flex flex-col items-center justify-center px-6 py-24 text-center">
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-3xl p-8 max-w-md w-full shadow-sm flex flex-col items-center gap-6">
        <div className="p-4 rounded-full bg-error/10 text-error flex items-center justify-center">
          <ShieldAlert className="w-10 h-10 animate-bounce" />
        </div>
        <div>
          <h2 className="font-['Hanken_Grotesk'] text-xl font-extrabold text-on-surface mb-2">
            Something Went Wrong
          </h2>
          <p className="font-['Inter'] text-sm text-on-surface-variant leading-relaxed">
            {message || "We encountered an unexpected error while retrieving this page's content."}
          </p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="w-full bg-primary text-on-primary py-3 rounded-xl font-['Hanken_Grotesk'] font-semibold text-sm hover:brightness-110 active:scale-95 transition-all shadow-md shadow-primary/10 cursor-pointer"
          >
            Retry Loading
          </button>
        )}
      </div>
    </div>
  );
}

export function ErrorBlock({ message, onRetry }) {
  return (
    <div className="rounded-3xl border border-red-200 bg-red-50/10 p-8 sm:p-12 text-center shadow-xs max-w-2xl mx-auto flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
        <ShieldAlert className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-semibold text-red-700 font-['Inter']">
          {message || "Failed to load directory items."}
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-full bg-red-600 text-white px-6 py-2 text-xs font-bold shadow-sm hover:brightness-105 transition-all active:scale-95 cursor-pointer"
        >
          Retry Loading
        </button>
      )}
    </div>
  );
}
