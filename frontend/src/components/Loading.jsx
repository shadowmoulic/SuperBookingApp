import React from "react";
import "../styles/Loading.css";

export default function Loading({ fullScreen = true }) {
  const containerClasses = fullScreen
    ? "flex flex-col items-center justify-center h-screen w-full bg-transparent"
    : "flex flex-col items-center justify-center p-8 w-full";

  return (
    <div className={containerClasses}>
      <div id="intro">
        <div class="i-ticket">
          <div class="it-l">
            <div className="nav-logo">
              <span className="nz">Ze</span>
              <span className="nq">Que</span>
              <span className="ndot">●</span>
            </div>
            <span class="it-sub">Zero Queue</span>
          </div>
          <div class="it-perf">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div class="it-r">
            <span class="it-ico">🎟️</span>
            <span class="it-num">TRAVEL ANYWHERE</span>
          </div>
        </div>
        <span class="i-plane">✈️</span>
        <p class="i-text">Booking your experience...</p>
        {/* <p class="i-hint">tap anywhere to skip</p> */}
      </div>
    </div>
  );
}
