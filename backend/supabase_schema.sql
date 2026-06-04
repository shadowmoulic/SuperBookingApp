-- ==========================================
-- DEV TABLES (Supabase)
-- ==========================================

-- 1. states
CREATE TABLE states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    hero_image TEXT,
    best_time_to_visit TEXT,
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. cities
CREATE TABLE cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state_id UUID REFERENCES states(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    hero_image TEXT,
    best_time_to_visit TEXT,
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. categories
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    hero_image TEXT,
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. attractions
CREATE TABLE attractions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    short_description TEXT,
    address TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    opening_time TEXT,
    closing_time TEXT,
    best_time_to_visit TEXT,
    time_required TEXT,
    ticket_price_indian NUMERIC,
    ticket_price_foreigner NUMERIC,
    ticket_price_student NUMERIC,
    ticket_price_child NUMERIC,
    nearest_airport TEXT,
    distance_from_airport NUMERIC,
    nearest_station TEXT,
    distance_from_station NUMERIC,
    parking_available BOOLEAN DEFAULT FALSE,
    wheelchair_accessible BOOLEAN DEFAULT FALSE,
    audio_guide_available BOOLEAN DEFAULT FALSE,
    featured_image TEXT,
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. attraction_categories
CREATE TABLE attraction_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attraction_id UUID REFERENCES attractions(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE(attraction_id, category_id)
);

-- 6. attraction_images
CREATE TABLE attraction_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attraction_id UUID REFERENCES attractions(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0
);

-- 7. trails
CREATE TABLE trails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    days INTEGER,
    estimated_budget NUMERIC,
    hero_image TEXT,
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. trail_attractions
CREATE TABLE trail_attractions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trail_id UUID REFERENCES trails(id) ON DELETE CASCADE,
    attraction_id UUID REFERENCES attractions(id) ON DELETE CASCADE,
    day_number INTEGER,
    sequence INTEGER
);

-- 9. faqs
CREATE TABLE faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL, -- 'state', 'city', 'category', 'attraction', 'trail'
    entity_id UUID NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL
);

-- 10. people_also_ask
CREATE TABLE people_also_ask (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL
);

-- 11. itineraries
CREATE TABLE itineraries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
    days INTEGER,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    seo_title TEXT,
    seo_description TEXT
);

-- 12. itinerary_attractions
CREATE TABLE itinerary_attractions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    itinerary_id UUID REFERENCES itineraries(id) ON DELETE CASCADE,
    attraction_id UUID REFERENCES attractions(id) ON DELETE CASCADE,
    day_number INTEGER,
    sequence INTEGER
);

-- ==========================================
-- USER / BOOKING TABLES
-- ==========================================

-- 13. users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    avatar TEXT,
    role TEXT DEFAULT 'user', -- 'user', 'official', 'admin'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. saved_attractions
CREATE TABLE saved_attractions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    attraction_id UUID REFERENCES attractions(id) ON DELETE CASCADE,
    UNIQUE(user_id, attraction_id)
);

-- 15. bookings
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    attraction_id UUID REFERENCES attractions(id) ON DELETE RESTRICT,
    amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled'
    booking_reference TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
