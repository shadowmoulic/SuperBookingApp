import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin } from 'lucide-react';

const CITIES_LIST = [
  { id: 'jaipur', name: 'Jaipur', desc: 'The Pink City', img: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=400&q=80', attractions: '34+' },
  { id: 'delhi', name: 'Delhi', desc: 'Historic Capital', img: 'https://www.mistay.in/travel-blog/content/images/size/w2000/2020/06/cover-10.jpg', attractions: '24+' },
  { id: 'agra', name: 'Agra', desc: 'Mughal Capital', img: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=400&q=80', attractions: '8+' },
  { id: 'kolkata', name: 'Kolkata', desc: 'Cultural Center', img: 'https://www.oberoihotels.com/-/media/oberoi-hotel/kolkata_8-aug-24/destination/banner1920x980.jpg', attractions: '28+' },
  { id: 'hyderabad', name: 'Hyderabad', desc: 'Nizam City', img: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0f/98/f7/df/charminar.jpg?w=400&h=-1&s=1', attractions: '12+' },
  { id: 'hampi', name: 'Hampi', desc: 'Kingdom of Ruins', img: 'https://www.hampitrip.com/_next/image?url=https%3A%2F%2Fstorage.hampitrip.com%2Fhampitrip%2Fhampi%2Fhampi03.webp&w=400&q=80', attractions: '100+' },
  { id: 'varanasi', name: 'Varanasi', desc: 'Spiritual Capital', img: 'https://theorionhotels.com/_next/image?url=https%3A%2F%2Fassets.theasar.com%2Fblogs%2F1768561498185_top_10_places_to_visit_in_varanasi.webp&w=400&q=75', attractions: '23,000+' },
  { id: 'bengaluru', name: 'Bengaluru', desc: 'The Garden City & Tech Hub', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBM0YhSFCqt7pHdlhWdWulztaoR4Bkj8_DAr26U-sjovfH6jPaoAR0uhWrwiBZJyh4b6hrx7-VsjyxnEDw7NdSqhoY5wT95TodIYHVsBw2iyNb92z3_nWfDMf70UPS2vlpHDjdhCucOWbYK84JelRaHHZp4JZhPdmK7SRuA-R-Ccqjp0YtGJ0BmIm8N189tl5X7mT3XkClFPITKq9VaWfPdTSur6n5fQ1qasPCbhEI7SkFVMQhF-lD14aQzD1dYYH1K5752xE-TgvVC', attractions: '42+' },
  { id: 'mysuru', name: 'Mysuru', desc: 'Cultural Capital', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUWr1VixdRFBUoWNkt-9qlhO8zMrAu1DO_9OHRL0b3R6xKovPbm8GgJ4RXpl3VsI_xSyhn1Ru6aFUSrYeRslDk17X3PjNfodCuWPFkp0rji6xPjFhSlQwVNLi5zh__FhCD-GsqTRx0KjwrNZbrJuVLQLuwuxeDmC1hVr2fxUJb1u19_bR2w4z8oT-2ljMFGkYdNqxW0ez_3Zxc6_p3jBHI02YRpHNckoCFk9AXBkNVKawjAm8CZzezGFY_qwwnl-Vhc9I3xgq9WwNL', attractions: '28+' },
  { id: 'coorg', name: 'Coorg', desc: 'Scotland of India', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBI7R8NDTqXe-H1gA1BSOh6X_8ZjIO-xCjHApxE3fcDxTNbg6gfTUyc5fTjKgvuhnBWrl745JtVbsk-daLYJ8jqGoKJ6nM9rG9ePZAPB_u1AN5CFRD8EzGoZ4s0wle7bszBLgPru6tKEkaK9TVbO8Jp_wh_8AHcYCKjGNctQBX5cTf78Ul6efqEI9udVpBCihdF-E6FiD05dyn5LepCXHlhuB0NTkfMlHQMHhucktZHFJNmQHRk6Ayc3ZzqUm5Db54ETyvC-ketZ5LA', attractions: '20+' },
  { id: 'udaipur', name: 'Udaipur', desc: 'City of Lakes', img: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=400&q=80', attractions: '18+' },
  { id: 'jodhpur', name: 'Jodhpur', desc: 'The Blue City', img: 'https://images.unsplash.com/photo-1562158074-d021c172ee18?auto=format&fit=crop&w=400&q=80', attractions: '22+' },
  { id: 'jaisalmer', name: 'Jaisalmer', desc: 'The Golden City', img: 'https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?auto=format&fit=crop&w=400&q=80', attractions: '15+' },
  { id: 'kochi', name: 'Kochi', desc: 'Queen of the Arabian Sea', img: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=400&q=80', attractions: '24+' },
  { id: 'munnar', name: 'Munnar', desc: 'Hill Station & Tea Gardens', img: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=400&q=80', attractions: '16+' },
  { id: 'alleppey', name: 'Alleppey', desc: 'Venice of the East', img: 'https://images.unsplash.com/photo-1593693411515-c202e974fe08?auto=format&fit=crop&w=400&q=80', attractions: '12+' },
  { id: 'wayanad', name: 'Wayanad', desc: 'Land of Paddy Fields', img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=400&q=80', attractions: '14+' }
];

const CityIndex = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-16 px-4 sm:px-6 lg:px-8 font-['Sora']">
      <div className="max-w-[1280px] mx-auto">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Explore India's Heritage Cities</h1>
        <p className="text-slate-600 mb-12 max-w-2xl text-base leading-relaxed">
          From ancient spiritual ghats to majestic desert fortresses and verdant hill stations, discover incredible locales brimming with architecture and history.
        </p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {CITIES_LIST.map((city) => (
            <div 
              key={city.id} 
              onClick={() => navigate(`/${city.id}`)}
              className="bg-white rounded-3xl overflow-hidden shadow-[0px_8px_16px_rgba(0,0,0,0.03)] border border-slate-100 hover:shadow-xl hover:scale-[1.01] transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="h-44 bg-slate-100 relative overflow-hidden">
                <img 
                  src={city.img} 
                  alt={city.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent z-10" />
                <span className="absolute top-3 left-3 bg-white/95 text-slate-900 text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-full shadow-sm flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5 text-[#006955]" />
                  {city.attractions} Sites
                </span>
                <div className="absolute bottom-3 left-4 z-20">
                  <h3 className="text-white text-lg font-bold">{city.name}</h3>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <p className="text-slate-500 text-xs truncate max-w-[150px] font-semibold">{city.desc}</p>
                <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[#006955] transition-colors">
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-all" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CityIndex;
