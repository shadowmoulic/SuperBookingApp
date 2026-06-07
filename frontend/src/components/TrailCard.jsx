import { Link } from "react-router-dom";
import { CheckCircle, ChevronRight } from "lucide-react";

export default function TrailCard({ trail }) {
  return (
    <Link
      to="/trails"
      className="block w-full h-full bg-surface-container-lowest rounded-3xl overflow-hidden shadow-sm border border-outline-variant hover:shadow-md transition-all duration-300 group cursor-pointer flex flex-col"
    >
      <div className="h-48 relative overflow-hidden">
        <img
          src={trail.image || trail.image_url}
          alt={trail.title || trail.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <span className="absolute bottom-3 left-3 bg-tertiary-container text-on-tertiary-container font-['Hanken_Grotesk'] font-bold text-[10px] px-2.5 py-1 rounded-lg">
          {trail.days || trail.duration || '4 Days'} Journey
        </span>
      </div>
      <div className="p-5 sm:p-6 flex-1 flex flex-col">
        <h3 className="font-['Hanken_Grotesk'] font-bold text-base sm:text-lg text-on-surface group-hover:text-primary transition-colors">
          {trail.title || trail.name}
        </h3>
        <p className="font-['Inter'] text-xs font-bold text-primary uppercase tracking-wider mt-1">
          {trail.route}
        </p>
        <p className="font-['Inter'] text-on-surface-variant text-xs sm:text-sm mt-3 leading-relaxed flex-1">
          {trail.desc || trail.description}
        </p>

        {/* Highlights */}
        {trail.highlights && trail.highlights.length > 0 && (
          <div className="mt-4 space-y-1.5 font-['Inter']">
            {trail.highlights.map((h) => (
              <div key={h} className="flex items-center gap-2 text-xs text-on-surface-variant">
                <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                {h}
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-outline-variant/30 pt-4 mt-5">
          <span className="font-['Hanken_Grotesk'] text-primary text-xs font-bold uppercase tracking-wider group-hover:translate-x-1.5 transition-transform inline-flex items-center gap-1">
            View Trail <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
