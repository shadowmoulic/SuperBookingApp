import React from "react";

// Helper pulse block class for consistency
const pulseClass = "bg-surface-container animate-pulse rounded-2xl";

export function HomeSkeleton() {
  return (
    <div className="bg-surface-container-lowest min-h-screen w-full pt-[72px]">
      {/* Hero Banner Shimmer */}
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-10">
        <div className={`${pulseClass} w-full h-[320px] sm:h-[450px] mb-12`} />

        {/* Categories Circle Row Shimmer */}
        <div className="mb-16">
          <div className="flex justify-between items-center mb-6">
            <div className={`${pulseClass} h-8 w-48`} />
            <div className={`${pulseClass} h-6 w-20`} />
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="flex flex-col items-center gap-3">
                <div className={`${pulseClass} w-16 h-16 rounded-full`} />
                <div className={`${pulseClass} h-4 w-20`} />
              </div>
            ))}
          </div>
        </div>

        {/* Explore Locations Shimmer */}
        <div className="mb-16">
          <div className="flex justify-between items-center mb-6">
            <div className={`${pulseClass} h-8 w-56`} />
            <div className={`${pulseClass} h-6 w-24`} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className={`${pulseClass} h-60 w-full`} />
            ))}
          </div>
        </div>

        {/* Featured Row Shimmer */}
        <div>
          <div className={`${pulseClass} h-8 w-64 mb-6`} />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className={`${pulseClass} h-80 w-full`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="bg-surface-container-lowest min-h-screen w-full pt-[72px]">
      {/* Immersive Hero Shimmer */}
      <div className="relative h-[45vh] min-h-[320px] w-full overflow-hidden bg-slate-900/10">
        <div className={`${pulseClass} w-full h-full rounded-none`} />
      </div>

      {/* Main Container */}
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-12">
        {/* About & Quick Facts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 mb-16">
          <div className="lg:col-span-2 space-y-4">
            <div className={`${pulseClass} h-8 w-64`} />
            <div className={`${pulseClass} h-24 w-full`} />
            <div className={`${pulseClass} h-12 w-full`} />
          </div>
          {/* Sidebar */}
          <div className={`${pulseClass} h-72 w-full`} />
        </div>

        {/* Experience List Shimmer */}
        <div>
          <div className="flex justify-between items-end mb-8">
            <div className="space-y-2">
              <div className={`${pulseClass} h-10 w-72`} />
              <div className={`${pulseClass} h-4 w-96`} />
            </div>
            <div className={`${pulseClass} h-6 w-24 hidden sm:block`} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="border border-outline-variant/20 rounded-2xl p-4 flex flex-col gap-4 h-full bg-surface-container-lowest">
                <div className={`${pulseClass} h-44 w-full`} />
                <div className="space-y-2">
                  <div className={`${pulseClass} h-4 w-1/3`} />
                  <div className={`${pulseClass} h-5 w-3/4`} />
                  <div className={`${pulseClass} h-4 w-1/2`} />
                </div>
                <div className="flex justify-between items-center mt-auto border-t border-outline-variant/10 pt-3">
                  <div className="space-y-1">
                    <div className={`${pulseClass} h-3 w-16`} />
                    <div className={`${pulseClass} h-4 w-20`} />
                  </div>
                  <div className={`${pulseClass} w-8 h-8 rounded-full`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function IndexSkeleton() {
  return (
    <div className="bg-surface-container-lowest min-h-screen w-full pt-[72px]">
      {/* Header Banner Shimmer */}
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-10">
        <div className={`${pulseClass} w-full h-[180px] sm:h-[220px] mb-8`} />

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-5 border-y border-outline-variant/30 mb-8 w-full">
          <div className="flex gap-2 w-full overflow-x-auto">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className={`${pulseClass} h-10 w-28 shrink-0 rounded-full`} />
            ))}
          </div>
          <div className={`${pulseClass} h-10 w-44 shrink-0`} />
        </div>

        {/* Grid of Location Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="border border-outline-variant/20 rounded-2xl overflow-hidden bg-surface-container-lowest h-80 flex flex-col">
              <div className={`${pulseClass} h-48 w-full rounded-b-none`} />
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className={`${pulseClass} h-5 w-2/3`} />
                  <div className={`${pulseClass} h-4 w-full`} />
                </div>
                <div className="flex justify-between items-center mt-auto border-t border-outline-variant/10 pt-3">
                  <div className={`${pulseClass} h-4 w-24`} />
                  <div className={`${pulseClass} h-4 w-28`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
