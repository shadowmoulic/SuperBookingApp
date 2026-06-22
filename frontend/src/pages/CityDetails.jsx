import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Star, Heart, SlidersHorizontal, ChevronRight, ChevronDown, CheckCircle, Zap, Compass, Check } from 'lucide-react';
import api from '../api/api';

const CITIES_DATA = {
  jaipur: {
    name: 'Jaipur',
    desc: 'The Pink City',
    tagline: 'Forts, Palaces, and Royal Heritage',
    attractionsCount: '34+',
    categoryCount: '12 Forts',
    img: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80',
    bentoImg1: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&q=80&w=800',
    bentoImg2: 'https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?auto=format&fit=crop&q=80&w=800',
    bentoImg3: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&q=80&w=800',
    mocks: [
      { name: 'Amer Fort', category: 'Fort', rating: '4.8', location: 'Jaipur', fee: '₹100', img: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&q=80&w=800' },
      { name: 'Hawa Mahal', category: 'Palace', rating: '4.6', location: 'Jaipur', fee: '₹50', img: 'https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?auto=format&fit=crop&q=80&w=800' },
      { name: 'City Palace', category: 'Palace', rating: '4.7', location: 'Jaipur', fee: '₹200', img: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&q=80&w=800' },
      { name: 'Jantar Mantar', category: 'Heritage', rating: '4.5', location: 'Jaipur', fee: '₹50', img: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&q=80&w=800' }
    ]
  },
  delhi: {
    name: 'Delhi',
    desc: 'Historic Capital',
    tagline: 'Centuries of Dynasties & Modern Hub',
    attractionsCount: '24+',
    categoryCount: '174 Monuments',
    img: 'https://www.mistay.in/travel-blog/content/images/size/w2000/2020/06/cover-10.jpg',
    bentoImg1: 'https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?auto=format&fit=crop&w=800&q=80',
    bentoImg2: 'https://images.unsplash.com/photo-1587135941948-670b381f08ec?auto=format&fit=crop&w=800&q=80',
    bentoImg3: 'https://images.unsplash.com/photo-1610123598147-f632aa18b275?auto=format&fit=crop&w=800&q=80',
    mocks: [
      { name: 'Red Fort', category: 'Fort', rating: '4.7', location: 'Delhi', fee: '₹50', img: 'https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?auto=format&fit=crop&w=800&q=80' },
      { name: 'Qutub Minar', category: 'Heritage', rating: '4.8', location: 'Delhi', fee: '₹40', img: 'https://images.unsplash.com/photo-1587135941948-670b381f08ec?auto=format&fit=crop&w=800&q=80' },
      { name: 'Humayun\'s Tomb', category: 'UNESCO Site', rating: '4.9', location: 'Delhi', fee: '₹40', img: 'https://images.unsplash.com/photo-1610123598147-f632aa18b275?auto=format&fit=crop&w=800&q=80' }
    ]
  },
  agra: {
    name: 'Agra',
    desc: 'Mughal Capital',
    tagline: 'The City of the Taj Mahal',
    attractionsCount: '8+',
    categoryCount: '3 UNESCO Sites',
    img: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
    bentoImg1: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
    bentoImg2: 'https://images.unsplash.com/photo-1595841696660-1e5c54b2b363?auto=format&fit=crop&w=800&q=80',
    bentoImg3: 'https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?auto=format&fit=crop&w=800&q=80',
    mocks: [
      { name: 'Taj Mahal', category: 'UNESCO Site', rating: '5.0', location: 'Agra', fee: '₹50', img: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80' },
      { name: 'Agra Fort', category: 'Fort', rating: '4.8', location: 'Agra', fee: '₹50', img: 'https://images.unsplash.com/photo-1595841696660-1e5c54b2b363?auto=format&fit=crop&w=800&q=80' }
    ]
  },
  kolkata: {
    name: 'Kolkata',
    desc: 'Cultural Center',
    tagline: 'Grand Colonial Architecture & Art',
    attractionsCount: '28+',
    categoryCount: '120+ Museums',
    img: 'https://www.oberoihotels.com/-/media/oberoi-hotel/kolkata_8-aug-24/destination/banner1920x980.jpg',
    bentoImg1: 'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=800&q=80',
    bentoImg2: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80',
    bentoImg3: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
    mocks: [
      { name: 'Victoria Memorial', category: 'Museum', rating: '4.8', location: 'Kolkata', fee: '₹60', img: 'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=800&q=80' },
      { name: 'Howrah Bridge', category: 'Heritage', rating: '4.7', location: 'Kolkata', fee: 'Free', img: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80' }
    ]
  },
  hyderabad: {
    name: 'Hyderabad',
    desc: 'Nizam City',
    tagline: 'Pearls, Palaces, and Deccani Cuisine',
    attractionsCount: '12+',
    categoryCount: '8 Museums',
    img: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0f/98/f7/df/charminar.jpg?w=1400&h=-1&s=1',
    bentoImg1: 'https://images.unsplash.com/photo-1608958416719-7c858548c267?auto=format&fit=crop&w=800&q=80',
    bentoImg2: 'https://images.unsplash.com/photo-1608958416790-256df278bbf4?auto=format&fit=crop&w=800&q=80',
    bentoImg3: 'https://images.unsplash.com/photo-1595841696660-1e5c54b2b363?auto=format&fit=crop&w=800&q=80',
    mocks: [
      { name: 'Charminar', category: 'Heritage', rating: '4.7', location: 'Hyderabad', fee: '₹40', img: 'https://images.unsplash.com/photo-1608958416719-7c858548c267?auto=format&fit=crop&w=800&q=80' },
      { name: 'Golconda Fort', category: 'Fort', rating: '4.8', location: 'Hyderabad', fee: '₹25', img: 'https://images.unsplash.com/photo-1608958416790-256df278bbf4?auto=format&fit=crop&w=800&q=80' }
    ]
  },
  hampi: {
    name: 'Hampi',
    desc: 'Kingdom of Ruins',
    tagline: 'UNESCO World Heritage Boulders',
    attractionsCount: '100+',
    categoryCount: '11 Temple Complexes',
    img: 'https://www.hampitrip.com/_next/image?url=https%3A%2F%2Fstorage.hampitrip.com%2Fhampitrip%2Fhampi%2Fhampi03.webp&w=1920&q=80',
    bentoImg1: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC57GMIIVp13zCN3MN_TpyPRl4URl18ZlPOQKHeX7G7E_h_R9VQWyDYdkK_XKjBi97Rin8WSJ8mPJiDmWtKKZQuGVWM7dXQnXfQeZJVJp3rKLPTJLoybu_oN6KsvNv4mTlv1OkxAw_JMv32dP2eoJdv3MAD71JWJUKKuTVp12MvpF8jUz6eNPyD1_LfqB6S1By5agPE0W7ZuzzJ1gWsQliA0v8tRbB55_v9dM1FW1JUtooaJswzXESX1AgAqD0RxrR8V0I8peIi4hD5',
    bentoImg2: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCD_yWEo0uAogXptZwCRWs41VZn8XsuZyUXJREvRarHIpNOJYessYg2daFFXSny2Ty-y7bhG5_uIfoVdwvG8t49K5TJVsLo-FCDrzEx3nXdhKfjm2fOXYbL139O3WzpADqIFx_rDqnVX3a4sZf98JgxuyekPjrqeWkyqRWzrHVWJZJaDkC-uXDr85K-7ABOH4mB6tqQNtiAaSlJu5-EsSkg_6rwZ9Hmn2I77VnZNnAou9TWf_PFGrzLEL7qEdg8UAXyuT1MH5Hy7BDL',
    bentoImg3: 'https://images.unsplash.com/photo-1608958416719-7c858548c267?auto=format&fit=crop&w=800&q=80',
    mocks: [
      { name: 'Hampi Ruins', category: 'UNESCO Site', rating: '5.0', location: 'Hampi', fee: 'Free', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCD_yWEo0uAogXptZwCRWs41VZn8XsuZyUXJREvRarHIpNOJYessYg2daFFXSny2Ty-y7bhG5_uIfoVdwvG8t49K5TJVsLo-FCDrzEx3nXdhKfjm2fOXYbL139O3WzpADqIFx_rDqnVX3a4sZf98JgxuyekPjrqeWkyqRWzrHVWJZJaDkC-uXDr85K-7ABOH4mB6tqQNtiAaSlJu5-EsSkg_6rwZ9Hmn2I77VnZNnAou9TWf_PFGrzLEL7qEdg8UAXyuT1MH5Hy7BDL' },
      { name: 'Virupaksha Temple', category: 'Religious Site', rating: '4.9', location: 'Hampi', fee: 'Free', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC57GMIIVp13zCN3MN_TpyPRl4URl18ZlPOQKHeX7G7E_h_R9VQWyDYdkK_XKjBi97Rin8WSJ8mPJiDmWtKKZQuGVWM7dXQnXfQeZJVJp3rKLPTJLoybu_oN6KsvNv4mTlv1OkxAw_JMv32dP2eoJdv3MAD71JWJUKKuTVp12MvpF8jUz6eNPyD1_LfqB6S1By5agPE0W7ZuzzJ1gWsQliA0v8tRbB55_v9dM1FW1JUtooaJswzXESX1AgAqD0RxrR8V0I8peIi4hD5' }
    ]
  },
  varanasi: {
    name: 'Varanasi',
    desc: 'Spiritual Capital',
    tagline: 'Eternal Ghats and Ancient Prayers',
    attractionsCount: '23,000+',
    categoryCount: '84 Ghats',
    img: 'https://theorionhotels.com/_next/image?url=https%3A%2F%2Fassets.theasar.com%2Fblogs%2F1768561498185_top_10_places_to_visit_in_varanasi.webp&w=3840&q=75',
    bentoImg1: 'https://images.unsplash.com/photo-1561361513-2d000a50f0db?auto=format&fit=crop&w=800&q=80',
    bentoImg2: 'https://images.unsplash.com/photo-1598977123418-45f04b01fe1e?auto=format&fit=crop&w=800&q=80',
    bentoImg3: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80',
    mocks: [
      { name: 'Kashi Vishwanath Temple', category: 'Religious Site', rating: '4.9', location: 'Varanasi', fee: 'Free', img: 'https://images.unsplash.com/photo-1561361513-2d000a50f0db?auto=format&fit=crop&w=800&q=80' },
      { name: 'Dashashwamedh Ghat', category: 'Heritage', rating: '4.9', location: 'Varanasi', fee: 'Free', img: 'https://images.unsplash.com/photo-1598977123418-45f04b01fe1e?auto=format&fit=crop&w=800&q=80' }
    ]
  },
  bengaluru: {
    name: 'Bengaluru',
    desc: 'The Garden City',
    tagline: 'Silicon Valley & Historical Gardens',
    attractionsCount: '42+',
    categoryCount: '15 Parks',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBM0YhSFCqt7pHdlhWdWulztaoR4Bkj8_DAr26U-sjovfH6jPaoAR0uhWrwiBZJyh4b6hrx7-VsjyxnEDw7NdSqhoY5wT95TodIYHVsBw2iyNb92z3_nWfDMf70UPS2vlpHDjdhCucOWbYK84JelRaHHZp4JZhPdmK7SRuA-R-Ccqjp0YtGJ0BmIm8N189tl5X7mT3XkClFPITKq9VaWfPdTSur6n5fQ1qasPCbhEI7SkFVMQhF-lD14aQzD1dYYH1K5752xE-TgvVC',
    bentoImg1: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHWmBORy2dYY-leHZ5wRjV0KTKUxUcsBuh2jJVYsjGttk17Uh1wh1mkZVVIKvjjPbRgowiq90syagQHbMkQsyXp_vm8GCY4vIX1D7-E3KxrO2YMj1hQhMPA4-ygvYXupco2loT0RBr4gsi8GOhs8JtwhxhKUU-M5ZPVxxQGaEMI2fL_8cKc8o_9Qo5IGJRSwB7xa8eQjwg0aArYaddjq-HirB39Yq9ECggnDr5_fJt4Zw8SVE7cpN2Mx1RwNTWc0tx5GgPsQrwOglU',
    bentoImg2: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBM0YhSFCqt7pHdlhWdWulztaoR4Bkj8_DAr26U-sjovfH6jPaoAR0uhWrwiBZJyh4b6hrx7-VsjyxnEDw7NdSqhoY5wT95TodIYHVsBw2iyNb92z3_nWfDMf70UPS2vlpHDjdhCucOWbYK84JelRaHHZp4JZhPdmK7SRuA-R-Ccqjp0YtGJ0BmIm8N189tl5X7mT3XkClFPITKq9VaWfPdTSur6n5fQ1qasPCbhEI7SkFVMQhF-lD14aQzD1dYYH1K5752xE-TgvVC',
    bentoImg3: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&q=80&w=800',
    mocks: [
      { name: 'Bangalore Palace', category: 'Heritage', rating: '4.7', location: 'Bengaluru', fee: '₹480', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHWmBORy2dYY-leHZ5wRjV0KTKUxUcsBuh2jJVYsjGttk17Uh1wh1mkZVVIKvjjPbRgowiq90syagQHbMkQsyXp_vm8GCY4vIX1D7-E3KxrO2YMj1hQhMPA4-ygvYXupco2loT0RBr4gsi8GOhs8JtwhxhKUU-M5ZPVxxQGaEMI2fL_8cKc8o_9Qo5IGJRSwB7xa8eQjwg0aArYaddjq-HirB39Yq9ECggnDr5_fJt4Zw8SVE7cpN2Mx1RwNTWc0tx5GgPsQrwOglU' }
    ]
  },
  mysuru: {
    name: 'Mysuru',
    desc: 'Cultural Capital',
    tagline: 'Palaces, Silk, and Royal Heritage',
    attractionsCount: '28+',
    categoryCount: '8 Royal Mansions',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUWr1VixdRFBUoWNkt-9qlhO8zMrAu1DO_9OHRL0b3R6xKovPbm8GgJ4RXpl3VsI_xSyhn1Ru6aFUSrYeRslDk17X3PjNfodCuWPFkp0rji6xPjFhSlQwVNLi5zh__FhCD-GsqTRx0KjwrNZbrJuVLQLuwuxeDmC1hVr2fxUJb1u19_bR2w4z8oT-2ljMFGkYdNqxW0ez_3Zxc6_p3jBHI02YRpHNckoCFk9AXBkNVKawjAm8CZzezGFY_qwwnl-Vhc9I3xgq9WwNL',
    bentoImg1: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5TsRiEYfe4AfZi63dqe24OXRYM8SeSxix_MfcjbuqDMoVfvUxtonOB44VlQ7iBKn2s3Z2e5m0nUAlMtT71gFGd8gG3UziOmQbwUBYESEpSwyzIVPy63K8DjI01DLYfd7C2ArpgULNCaYpqZO4VwQYY7L4VxnPp-8WzG4vBVqU5RV3eam8bMg4GKB2KyHK1_-IBlSsYL6ju-O2nWsfKRQTYnD45mX0x9Uxb5q0rYLEJzbNuIZYqGBkGgi5muMJpGG1yS25N8V4Vrqc',
    bentoImg2: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUWr1VixdRFBUoWNkt-9qlhO8zMrAu1DO_9OHRL0b3R6xKovPbm8GgJ4RXpl3VsI_xSyhn1Ru6aFUSrYeRslDk17X3PjNfodCuWPFkp0rji6xPjFhSlQwVNLi5zh__FhCD-GsqTRx0KjwrNZbrJuVLQLuwuxeDmC1hVr2fxUJb1u19_bR2w4z8oT-2ljMFGkYdNqxW0ez_3Zxc6_p3jBHI02YRpHNckoCFk9AXBkNVKawjAm8CZzezGFY_qwwnl-Vhc9I3xgq9WwNL',
    bentoImg3: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&q=80&w=800',
    mocks: [
      { name: 'Mysore Palace', category: 'Palace', rating: '4.9', location: 'Mysuru', fee: '₹149', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5TsRiEYfe4AfZi63dqe24OXRYM8SeSxix_MfcjbuqDMoVfvUxtonOB44VlQ7iBKn2s3Z2e5m0nUAlMtT71gFGd8gG3UziOmQbwUBYESEpSwyzIVPy63K8DjI01DLYfd7C2ArpgULNCaYpqZO4VwQYY7L4VxnPp-8WzG4vBVqU5RV3eam8bMg4GKB2KyHK1_-IBlSsYL6ju-O2nWsfKRQTYnD45mX0x9Uxb5q0rYLEJzbNuIZYqGBkGgi5muMJpGG1yS25N8V4Vrqc' }
    ]
  },
  coorg: {
    name: 'Coorg',
    desc: 'Scotland of India',
    tagline: 'Mist-clad Hills & Coffee Estates',
    attractionsCount: '20+',
    categoryCount: '12 Coffee Trails',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBI7R8NDTqXe-H1gA1BSOh6X_8ZjIO-xCjHApxE3fcDxTNbg6gfTUyc5fTjKgvuhnBWrl745JtVbsk-daLYJ8jqGoKJ6nM9rG9ePZAPB_u1AN5CFRD8EzGoZ4s0wle7bszBLgPru6tKEkaK9TVbO8Jp_wh_8AHcYCKjGNctQBX5cTf78Ul6efqEI9udVpBCihdF-E6FiD05dyn5LepCXHlhuB0NTkfMlHQMHhucktZHFJNmQHRk6Ayc3ZzqUm5Db54ETyvC-ketZ5LA',
    bentoImg1: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBI7R8NDTqXe-H1gA1BSOh6X_8ZjIO-xCjHApxE3fcDxTNbg6gfTUyc5fTjKgvuhnBWrl745JtVbsk-daLYJ8jqGoKJ6nM9rG9ePZAPB_u1AN5CFRD8EzGoZ4s0wle7bszBLgPru6tKEkaK9TVbO8Jp_wh_8AHcYCKjGNctQBX5cTf78Ul6efqEI9udVpBCihdF-E6FiD05dyn5LepCXHlhuB0NTkfMlHQMHhucktZHFJNmQHRk6Ayc3ZzqUm5Db54ETyvC-ketZ5LA',
    bentoImg2: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA2sly3ZigfHmBgJl2obH2z-2YPgWTh_FF0xSAMuU1e_4xcxeEfyBLizpPRZcaXhUfOcpZ8YdexlKtgWBoBbcJ3qujpnksH_WvCy7W05YTw3qTRnDfWjgbAO9wVNRguLdml3lxQ0rNx_9FDp_-uiT7cIL0sMVck6x92P4OKVM6Hk4Kp1h0y1-CT9WWRqhKQrEvfmRPQxtZPtqY4SOldFQ2dD0PLcKkcPVbR2c7bM1RGSQMAHsNJD3AWTHRf_xo6Zx_G4h7R1Fv1OslD',
    bentoImg3: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&q=80&w=800',
    mocks: [
      { name: 'Abbey Falls', category: 'Nature', rating: '4.5', location: 'Coorg', fee: '₹15', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA2sly3ZigfHmBgJl2obH2z-2YPgWTh_FF0xSAMuU1e_4xcxeEfyBLizpPRZcaXhUfOcpZ8YdexlKtgWBoBbcJ3qujpnksH_WvCy7W05YTw3qTRnDfWjgbAO9wVNRguLdml3lxQ0rNx_9FDp_-uiT7cIL0sMVck6x92P4OKVM6Hk4Kp1h0y1-CT9WWRqhKQrEvfmRPQxtZPtqY4SOldFQ2dD0PLcKkcPVbR2c7bM1RGSQMAHsNJD3AWTHRf_xo6Zx_G4h7R1Fv1OslD' }
    ]
  },
  udaipur: {
    name: 'Udaipur',
    desc: 'City of Lakes',
    tagline: 'Shimmering Lakes & White Marble Palaces',
    attractionsCount: '18+',
    categoryCount: '5 Palaces',
    img: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&q=80&w=800',
    bentoImg1: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&q=80&w=800',
    bentoImg2: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
    bentoImg3: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80',
    mocks: [
      { name: 'City Palace Udaipur', category: 'Palace', rating: '4.7', location: 'Udaipur', fee: '₹250', img: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&q=80&w=800' }
    ]
  },
  jodhpur: {
    name: 'Jodhpur',
    desc: 'The Blue City',
    tagline: 'Fortresses & Blue-washed Houses',
    attractionsCount: '22+',
    categoryCount: '1 Fort',
    img: 'https://images.unsplash.com/photo-1562158074-d021c172ee18?auto=format&fit=crop&q=80&w=800',
    bentoImg1: 'https://images.unsplash.com/photo-1562158074-d021c172ee18?auto=format&fit=crop&w=800&q=80',
    bentoImg2: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
    bentoImg3: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80',
    mocks: [
      { name: 'Mehrangarh Fort', category: 'Fort', rating: '4.9', location: 'Jodhpur', fee: '₹100', img: 'https://images.unsplash.com/photo-1562158074-d021c172ee18?auto=format&fit=crop&w=800&q=80' }
    ]
  },
  jaisalmer: {
    name: 'Jaisalmer',
    desc: 'The Golden City',
    tagline: 'Thar Desert Sand Dunes & Sandstone Forts',
    attractionsCount: '15+',
    categoryCount: '9 Havelis',
    img: 'https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?auto=format&fit=crop&w=1200&q=80',
    bentoImg1: 'https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?auto=format&fit=crop&w=800&q=80',
    bentoImg2: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
    bentoImg3: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80',
    mocks: [
      { name: 'Jaisalmer Fort', category: 'Fort', rating: '4.8', location: 'Jaisalmer', fee: '₹50', img: 'https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?auto=format&fit=crop&w=800&q=80' }
    ]
  },
  kochi: {
    name: 'Kochi',
    desc: 'Queen of the Arabian Sea',
    tagline: 'Spice Trading History & Chinese Fishing Nets',
    attractionsCount: '24+',
    categoryCount: '6 Colonial Forts',
    img: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=1200&q=80',
    bentoImg1: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80',
    bentoImg2: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
    bentoImg3: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80',
    mocks: [
      { name: 'Chinese Fishing Nets', category: 'Heritage', rating: '4.6', location: 'Kochi', fee: 'Free', img: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80' }
    ]
  },
  munnar: {
    name: 'Munnar',
    desc: 'Hill Station',
    tagline: 'Rolling Tea Hills & Wilderness',
    attractionsCount: '16+',
    categoryCount: '8 Tea Estates',
    img: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80',
    bentoImg1: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80',
    bentoImg2: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
    bentoImg3: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80',
    mocks: [
      { name: 'Tea Gardens', category: 'Nature', rating: '4.8', location: 'Munnar', fee: 'Free', img: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80' }
    ]
  },
  alleppey: {
    name: 'Alleppey',
    desc: 'Venice of the East',
    tagline: 'Serene Houseboats & Backwaters',
    attractionsCount: '12+',
    categoryCount: '4 Water Circuits',
    img: 'https://images.unsplash.com/photo-1593693411515-c202e974fe08?auto=format&fit=crop&w=800&q=80',
    bentoImg1: 'https://images.unsplash.com/photo-1593693411515-c202e974fe08?auto=format&fit=crop&w=800&q=80',
    bentoImg2: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
    bentoImg3: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80',
    mocks: [
      { name: 'Alleppey Backwaters', category: 'Nature', rating: '4.9', location: 'Alleppey', fee: '₹1500', img: 'https://images.unsplash.com/photo-1593693411515-c202e974fe08?auto=format&fit=crop&w=800&q=80' }
    ]
  },
  wayanad: {
    name: 'Wayanad',
    desc: 'Land of Paddy Fields',
    tagline: 'Waterfalls, Caves, and Spice Plantations',
    attractionsCount: '14+',
    categoryCount: '3 Caves',
    img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
    bentoImg1: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
    bentoImg2: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80',
    bentoImg3: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80',
    mocks: [
      { name: 'Edakkal Caves', category: 'Heritage', rating: '4.5', location: 'Wayanad', fee: '₹50', img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80' }
    ]
  }
};

const NAV_CITIES = [
  { id: 'jaipur', name: 'Jaipur', path: '/jaipur' },
  { id: 'delhi', name: 'Delhi', path: '/delhi' },
  { id: 'agra', name: 'Agra', path: '/agra' },
  { id: 'hampi', name: 'Hampi', path: '/hampi' },
  { id: 'bengaluru', name: 'Bengaluru', path: '/bengaluru' },
  { id: 'mysuru', name: 'Mysuru', path: '/mysuru' },
  { id: 'udaipur', name: 'Udaipur', path: '/udaipur' },
  { id: 'kochi', name: 'Kochi', path: '/kochi' }
];

export default function CityDetails() {
  const { locationName } = useParams();
  const navigate = useNavigate();
  const normalizedCityId = locationName ? locationName.toLowerCase() : 'jaipur';
  const cityInfo = CITIES_DATA[normalizedCityId] || CITIES_DATA.jaipur;

  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedRating, setSelectedRating] = useState('Rating');
  const [favorites, setFavorites] = useState({});
  const [dbExperiences, setDbExperiences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const fetchExperiences = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/experiences/?location=${cityInfo.name}`);
        const data = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.results)
            ? res.data.results
            : [];
        setDbExperiences(data);
      } catch (err) {
        console.error("Error loading experiences:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExperiences();
  }, [normalizedCityId, cityInfo]);

  const toggleFavorite = (name) => {
    setFavorites(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail('');
  };

  // Combine DB experiences with mock experiences to show a complete, robust list
  const allExperiences = useMemo(() => {
    const dbFormatted = dbExperiences.map(exp => ({
      name: exp.name,
      category: exp.category,
      rating: exp.average_rating ? Number(exp.average_rating).toFixed(1) : '4.5',
      location: exp.location,
      fee: exp.entry_fee_base ? `₹${Number(exp.entry_fee_base).toFixed(0)}` : 'Free',
      img: String(exp.image_url || '').split(',')[0] || 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&q=80&w=800',
      id: exp.public_id || exp.id,
      isDb: true
    }));

    const uniqueMocks = (cityInfo.mocks || []).filter(mock => 
      !dbFormatted.some(db => db.name.toLowerCase() === mock.name.toLowerCase())
    );

    return [...dbFormatted, ...uniqueMocks];
  }, [dbExperiences, cityInfo]);

  const filteredAttractions = useMemo(() => {
    return allExperiences.filter(item => {
      if (activeCategory !== 'All') {
        const itemCatLower = item.category?.toLowerCase() || '';
        const activeCatLower = activeCategory.toLowerCase();
        if (activeCatLower === 'museums' && itemCatLower === 'museum') return true;
        if (activeCatLower === 'forts' && itemCatLower === 'fort') return true;
        if (activeCatLower === 'palaces' && itemCatLower === 'palace') return true;
        if (activeCatLower === 'temples' && (itemCatLower === 'religious site' || itemCatLower === 'temple')) return true;
        if (itemCatLower !== activeCatLower) return false;
      }
      if (selectedRating !== 'Rating') {
        const ratingNum = parseFloat(item.rating || 0);
        if (selectedRating === '4.5+' && ratingNum < 4.5) return false;
        if (selectedRating === '4.0+' && ratingNum < 4.0) return false;
      }
      return true;
    });
  }, [allExperiences, activeCategory, selectedRating]);

  return (
    <div className="min-h-screen bg-[#fcf8f9] text-[#1b1b1c] font-['Sora'] antialiased pb-24 md:pb-0">
      
      {/* Desktop Hero Section */}
      <section className="hidden md:block relative bg-[#F7F9F9] pt-28 pb-24 overflow-hidden border-b border-[#E8ECEB]">
        <div className="max-w-[1280px] mx-auto px-6 relative z-10">
          <nav className="flex items-center gap-1.5 text-[#3e4945] text-xs font-semibold mb-8">
            <Link to="/" className="hover:text-[#006955] transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/cities" className="hover:text-[#006955] transition-colors">Cities</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#006955] font-bold">{cityInfo.name}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1b1b1c] mb-6 tracking-tight">
                Explore {cityInfo.name}
              </h1>
              <p className="text-lg sm:text-xl text-[#3e4945] mb-10 max-w-xl leading-relaxed">
                {cityInfo.tagline} - Discover beautiful sights, local landmarks, and amazing cultural heritage.
              </p>
              <div className="flex gap-8">
                <div className="flex flex-col">
                  <span className="text-3xl sm:text-4xl font-extrabold text-[#006955]">{cityInfo.attractionsCount}</span>
                  <span className="text-xs text-[#3e4945] uppercase tracking-wider font-bold">Attractions</span>
                </div>
                <div className="h-12 w-px bg-[#bdc9c3]"></div>
                <div className="flex flex-col">
                  <span className="text-3xl sm:text-4xl font-extrabold text-[#006955]">{cityInfo.categoryCount}</span>
                  <span className="text-xs text-[#3e4945] uppercase tracking-wider font-bold">Historical Records</span>
                </div>
              </div>
            </div>
            <div className="hidden lg:block relative h-[400px] rounded-[32px] overflow-hidden shadow-2xl transition-transform duration-500 hover:scale-[1.01]">
              <img 
                alt={cityInfo.name} 
                className="w-full h-full object-cover" 
                src={cityInfo.img}
              />
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#fcf8f9] to-transparent"></div>
      </section>

      {/* Mobile Header / TopAppBar */}
      <header className="sticky top-0 z-50 flex justify-between items-center w-full px-4 py-3 bg-[#fcf8f9]/85 backdrop-blur-md border-b border-[#E8ECEB] md:hidden">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#006955] text-2xl">menu</span>
          <span className="text-lg font-bold text-[#006955]">ZeQue</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#006955] text-2xl">search</span>
        </div>
      </header>

      {/* Mobile Hero Section */}
      <section className="px-4 py-4 md:hidden">
        <nav className="flex items-center gap-1 text-[#3e4945] text-[11px] font-semibold mb-3">
          <span>Home</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span>Cities</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#006955] font-bold">{cityInfo.name}</span>
        </nav>
        <h1 className="text-3xl font-extrabold text-[#1b1b1c] mb-1.5">Explore {cityInfo.name}</h1>
        <p className="text-sm text-[#3e4945] mb-4 leading-relaxed font-semibold">{cityInfo.tagline}</p>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1 text-[#006955] font-bold text-xs">
            <MapPin className="w-3.5 h-3.5" />
            <span>{cityInfo.attractionsCount} Attractions</span>
          </div>
          <div className="flex items-center gap-1 text-[#006955] font-bold text-xs">
            <span className="material-symbols-outlined text-sm leading-none">apartment</span>
            <span>{cityInfo.categoryCount} Mapped</span>
          </div>
        </div>
      </section>

      {/* City Navigation Pill Bar */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 mt-4 md:-mt-8 relative z-20">
        <div className="bg-white p-3 md:p-4 rounded-3xl md:rounded-[24px] shadow-sm flex items-center gap-2.5 overflow-x-auto no-scrollbar border border-[#E8ECEB]">
          {NAV_CITIES.map((c) => {
            const isActive = normalizedCityId === c.id;
            return (
              <button
                key={c.id}
                onClick={() => navigate(c.path)}
                className={`whitespace-nowrap px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-[#006955] text-white shadow-sm font-bold scale-[1.02]' 
                    : 'bg-white border border-[#bdc9c3] text-[#3e4945] hover:border-[#006955] hover:text-[#006955]'
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </section>

      {/* Filter Bar (Sticky) */}
      <section className="sticky top-[48px] md:top-20 z-40 bg-[#fcf8f9]/90 backdrop-blur-md border-b border-[#E8ECEB] py-3 mt-4">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 flex flex-wrap lg:flex-nowrap items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 lg:pb-0 w-full lg:w-auto">
            {['All', 'Museums', 'Heritage', 'Forts', 'Palaces', 'Temples', 'Nature'].map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full md:rounded-xl text-xs font-semibold transition-colors border cursor-pointer whitespace-nowrap ${
                    isActive 
                      ? 'bg-[#006955]/10 border-[#006955] text-[#006955]' 
                      : 'bg-[#f0edee] border-transparent text-[#3e4945] hover:bg-[#e5e2e3]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
          
          <div className="hidden md:flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="relative">
              <label htmlFor="city-details-rating" className="sr-only">Rating Filter</label>
              <select 
                id="city-details-rating"
                value={selectedRating} 
                onChange={(e) => setSelectedRating(e.target.value)}
                className="appearance-none bg-[#f0edee] border border-[#bdc9c3] rounded-xl pl-4 pr-10 py-1.5 text-xs font-semibold text-[#1b1b1c] outline-none cursor-pointer focus:ring-2 focus:ring-[#006955]/20 focus:border-[#006955]"
              >
                <option value="Rating">Rating</option>
                <option value="4.5+">4.5+</option>
                <option value="4.0+">4.0+</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#3e4945]" />
            </div>

            <button className="flex items-center gap-1.5 px-4 py-1.5 bg-[#f0edee] border border-[#bdc9c3] rounded-xl text-xs font-semibold hover:bg-[#e5e2e3] transition-colors cursor-pointer">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
            </button>
          </div>
        </div>
      </section>

      {/* Attraction Grid */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 md:py-12">
        <h2 className="hidden md:block text-2xl font-bold text-[#1b1b1c] mb-8">Recommended Attractions in {cityInfo.name}</h2>
        {filteredAttractions.length === 0 ? (
          <div className="text-center py-16 bg-[#F7F9F9] rounded-2xl border border-dashed border-[#bdc9c3]">
            <Compass className="w-12 h-12 text-[#bdc9c3] mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#1b1b1c]">No attractions found</h3>
            <p className="text-[#3e4945] text-sm">Try resetting filters to explore other heritage sites.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredAttractions.map((item, index) => {
              const isFav = !!favorites[item.name];
              const cardContent = (
                <div className="group bg-white rounded-2xl overflow-hidden shadow-[0px_12px_24px_rgba(0,0,0,0.04)] border border-[#E8ECEB] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col h-full cursor-pointer active:scale-95">
                  <div className="relative h-32 sm:h-48 md:h-64 overflow-hidden">
                    <img 
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      src={item.img} 
                    />
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavorite(item.name);
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-white/20 backdrop-blur-md rounded-full text-white hover:text-[#ba1a1a] transition-colors cursor-pointer"
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-[#ba1a1a] text-[#ba1a1a]' : 'text-white'}`} />
                    </button>
                    <span className="absolute bottom-2 left-2 bg-[#006955]/90 text-white px-2 py-0.5 rounded font-bold text-[10px] uppercase tracking-wider">
                      {item.category}
                    </span>
                  </div>
                  <div className="p-3 flex-grow flex flex-col justify-between gap-1">
                    <div>
                      <h3 className="font-bold text-sm text-[#1b1b1c] truncate group-hover:text-[#006955] transition-colors">{item.name}</h3>
                      <div className="flex items-center gap-0.5 text-[#3e4945] text-[11px]">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{item.location}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-1 pt-2 border-t border-[#E8ECEB]/50">
                      <div className="flex items-center gap-0.5 text-[#FEBB02]">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="text-xs font-bold text-[#1b1b1c]">{item.rating}</span>
                      </div>
                      <p className="text-xs font-bold text-[#006955]">{item.fee}</p>
                    </div>
                  </div>
                </div>
              );

              return item.isDb ? (
                <Link key={item.id} to={`/attraction/${item.name ? item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : item.id}`}>{cardContent}</Link>
              ) : (
                <div key={index} onClick={() => alert(`${item.name} details are coming soon!`)}>{cardContent}</div>
              );
            })}
          </div>
        )}
      </section>

      {/* Bento Layout Gallery of City */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 md:py-12">
        <h2 className="text-xl md:text-2xl font-bold text-[#1b1b1c] mb-6 md:mb-8">Highlights of {cityInfo.name}</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-auto md:h-[400px]">
          <div className="md:col-span-2 relative group rounded-[24px] overflow-hidden shadow-sm min-h-[200px]">
            <img 
              alt={cityInfo.name} 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              src={cityInfo.bentoImg1 || cityInfo.img} 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent"></div>
            <div className="absolute bottom-6 left-6 z-10">
              <h3 className="text-2xl font-extrabold text-white mb-1">Scenic Vibe</h3>
              <p className="text-white/80 text-xs font-semibold">Iconic structures & cityscapes</p>
            </div>
          </div>
          <div className="relative group rounded-[24px] overflow-hidden shadow-sm min-h-[200px]">
            <img 
              alt={cityInfo.name} 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              src={cityInfo.bentoImg2 || cityInfo.img} 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent"></div>
            <div className="absolute bottom-6 left-6 z-10">
              <h3 className="text-xl font-extrabold text-white mb-1">Architecture</h3>
              <p className="text-white/80 text-[10px] font-semibold">Intricate historical carvings</p>
            </div>
          </div>
          <div className="relative group rounded-[24px] overflow-hidden shadow-sm min-h-[200px]">
            <img 
              alt={cityInfo.name} 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              src={cityInfo.bentoImg3 || cityInfo.img} 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent"></div>
            <div className="absolute bottom-6 left-6 z-10">
              <h3 className="text-xl font-extrabold text-white mb-1">Culture</h3>
              <p className="text-white/80 text-[10px] font-semibold">Authentic local narratives</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-[#F7F9F9] py-16 md:py-20 border-y border-[#E8ECEB]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#1b1b1c] mb-12">Why Explore with ZeQue</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center p-4">
              <div className="w-16 h-16 bg-[#006955]/10 rounded-2xl flex items-center justify-center text-[#006955] mb-5">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg mb-2">Verified Attractions</h3>
              <p className="text-[#3e4945] text-sm leading-relaxed">Hand-picked and personally vetted experiences for maximum quality and safety.</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="w-16 h-16 bg-[#006955]/10 rounded-2xl flex items-center justify-center text-[#006955] mb-5">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg mb-2">Instant Booking</h3>
              <p className="text-[#3e4945] text-sm leading-relaxed">Seamless digital tickets and reservations delivered instantly to your account.</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="w-16 h-16 bg-[#006955]/10 rounded-2xl flex items-center justify-center text-[#006955] mb-5">
                <Compass className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg mb-2">Local Experiences</h3>
              <p className="text-[#3e4945] text-sm leading-relaxed">Gain access to off-beat trails and authentic local cultural narratives.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 py-16 md:py-20">
        <div className="bg-[#00846c] rounded-[32px] p-8 sm:p-20 relative overflow-hidden flex flex-col items-center text-center text-white shadow-lg">
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-2xl sm:text-4xl font-extrabold mb-4">Stay Updated</h2>
            <p className="text-white/80 text-sm sm:text-base mb-8 leading-relaxed">
              Subscribe to get the latest heritage stories, travel guides, and exclusive offers for {cityInfo.name}'s best destinations.
            </p>
            {subscribed ? (
              <div className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-6 py-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 mx-auto max-w-md">
                <Check className="w-5 h-5 text-white" />
                Thank you for subscribing!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 w-full max-w-md mx-auto">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="flex-grow px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm text-sm"
                  required
                />
                <button 
                  type="submit"
                  className="bg-white text-[#00846c] px-6 py-3 rounded-xl font-bold hover:bg-[#F7F9F9] transition-all cursor-pointer text-sm whitespace-nowrap active:scale-95"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-12 -left-12 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 w-full z-50 flex justify-around items-center px-4 py-2 bg-white shadow-lg rounded-t-xl border-t border-[#E8ECEB] md:hidden">
        <a className="flex flex-col items-center justify-center bg-[#006955]/10 text-[#006955] rounded-xl px-3 py-1 scale-95 transition-all cursor-pointer">
          <Compass className="w-5 h-5 fill-current" />
          <span className="text-[10px] font-bold">Discover</span>
        </a>
        <a className="flex flex-col items-center justify-center text-[#3e4945] px-3 py-1 hover:bg-[#e5e2e3] rounded-xl transition-colors cursor-pointer">
          <Heart className="w-5 h-5" />
          <span className="text-[10px] font-bold">Wishlist</span>
        </a>
        <a className="flex flex-col items-center justify-center text-[#3e4945] px-3 py-1 hover:bg-[#e5e2e3] rounded-xl transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-lg leading-none">confirmation_number</span>
          <span className="text-[10px] font-bold">Bookings</span>
        </a>
        <a className="flex flex-col items-center justify-center text-[#3e4945] px-3 py-1 hover:bg-[#e5e2e3] rounded-xl transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-lg leading-none">person</span>
          <span className="text-[10px] font-bold">Profile</span>
        </a>
      </nav>
    </div>
  );
}
