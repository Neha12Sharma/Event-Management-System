// Client-side mock data store & fallback service for EventPro
// Allows full functionality when backend API server is not connected or unreachable.

export const INITIAL_CATEGORIES = [
    { id: 'cat-1', name: 'Conference', icon: '🎤', color: '#6366f1' },
    { id: 'cat-2', name: 'Music', icon: '🎵', color: '#ec4899' },
    { id: 'cat-3', name: 'Technology', icon: '💻', color: '#10b981' },
    { id: 'cat-4', name: 'Sports', icon: '🏆', color: '#f59e0b' },
    { id: 'cat-5', name: 'Art & Culture', icon: '🎨', color: '#8b5cf6' },
    { id: 'cat-6', name: 'Food & Drink', icon: '🍷', color: '#ef4444' },
    { id: 'cat-7', name: 'Networking', icon: '🤝', color: '#0ea5e9' },
    { id: 'cat-8', name: 'Workshop', icon: '🛠️', color: '#f97316' },
];

export const INITIAL_USERS = [
    {
        id: 'usr-admin',
        name: 'Admin User',
        email: 'admin@eventpro.com',
        password_hash: 'admin123', // Demo comparison
        role: 'admin',
        created_at: new Date().toISOString()
    },
    {
        id: 'usr-demo',
        name: 'Neha',
        email: 'neha@gmail.com',
        password_hash: '123456',
        role: 'user',
        created_at: new Date().toISOString()
    },
    {
        id: 'usr-dikshant',
        name: 'Dikshant',
        email: 'dikshant@gmail.com',
        password_hash: '123456',
        role: 'admin',
        created_at: new Date().toISOString()
    }
];

export const INITIAL_EVENTS = [
    {
        id: 'ev-1',
        title: 'Web Summit 2026',
        short_description: "The world's largest tech conference bringing together 70,000+ attendees.",
        description: "Join the world's largest technology conference featuring 1,000+ speakers, 300+ startups, and unparalleled networking opportunities. From AI breakthroughs to the future of the web, Web Summit covers every angle of the tech industry.",
        category_id: 'cat-1',
        category_name: 'Conference',
        category_icon: '🎤',
        category_color: '#6366f1',
        location: 'Lisbon, Portugal',
        venue: 'Altice Arena',
        image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
        start_date: '2026-05-10T09:00:00Z',
        end_date: '2026-05-13T18:00:00Z',
        capacity: 5000,
        registered_count: 1420,
        price: 299.00,
        is_featured: true,
        organizer_name: 'Admin User',
        organizer_email: 'admin@eventpro.com',
        status: 'published'
    },
    {
        id: 'ev-2',
        title: 'Global Music Festival 2026',
        short_description: '3-day outdoor music extravaganza with 50+ artists across 6 stages.',
        description: 'Experience three legendary days of non-stop music across six spectacular stages. Featuring headliners and emerging artists from around the globe, this festival is a celebration of every genre from indie rock to electronic dance music.',
        category_id: 'cat-2',
        category_name: 'Music',
        category_icon: '🎵',
        category_color: '#ec4899',
        location: 'Austin, Texas, USA',
        venue: 'Zilker Park',
        image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
        start_date: '2026-06-20T14:00:00Z',
        end_date: '2026-06-22T23:00:00Z',
        capacity: 20000,
        registered_count: 8500,
        price: 149.00,
        is_featured: true,
        organizer_name: 'Admin User',
        organizer_email: 'admin@eventpro.com',
        status: 'published'
    },
    {
        id: 'ev-3',
        title: 'React & Node.js Workshop',
        short_description: 'Hands-on full-stack development workshop for intermediate developers.',
        description: 'Deep-dive into building production-ready full-stack applications using React 18, Node.js, and PostgreSQL. Bring your laptop and leave with a complete deployed project.',
        category_id: 'cat-8',
        category_name: 'Workshop',
        category_icon: '🛠️',
        category_color: '#f97316',
        location: 'San Francisco, CA, USA',
        venue: 'Moscone Center',
        image_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
        start_date: '2026-04-15T10:00:00Z',
        end_date: '2026-04-15T18:00:00Z',
        capacity: 80,
        registered_count: 45,
        price: 79.00,
        is_featured: false,
        organizer_name: 'Admin User',
        organizer_email: 'admin@eventpro.com',
        status: 'published'
    },
    {
        id: 'ev-4',
        title: 'AI & Machine Learning Summit',
        short_description: 'Explore the cutting edge of artificial intelligence and ML applications.',
        description: 'A premier gathering of AI researchers, engineers, and business leaders exploring the latest advances in machine learning, large language models, computer vision, and AI ethics.',
        category_id: 'cat-3',
        category_name: 'Technology',
        category_icon: '💻',
        category_color: '#10b981',
        location: 'New York, NY, USA',
        venue: 'Jacob K. Javits Center',
        image_url: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80',
        start_date: '2026-07-08T09:00:00Z',
        end_date: '2026-07-10T17:00:00Z',
        capacity: 2000,
        registered_count: 1100,
        price: 199.00,
        is_featured: true,
        organizer_name: 'Admin User',
        organizer_email: 'admin@eventpro.com',
        status: 'published'
    },
    {
        id: 'ev-5',
        title: 'City Marathon 2026',
        short_description: 'Annual city marathon — 5K, 10K, half and full marathon categories.',
        description: 'Lace up and join thousands of runners in the most iconic city marathon of the year. Categories for all fitness levels, from first-timers to seasoned athletes. Medals, refreshments, and post-race celebrations included.',
        category_id: 'cat-4',
        category_name: 'Sports',
        category_icon: '🏆',
        category_color: '#f59e0b',
        location: 'Chicago, IL, USA',
        venue: 'Grant Park Start Line',
        image_url: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800&q=80',
        start_date: '2026-09-13T07:00:00Z',
        end_date: '2026-09-13T15:00:00Z',
        capacity: 10000,
        registered_count: 3200,
        price: 55.00,
        is_featured: false,
        organizer_name: 'Admin User',
        organizer_email: 'admin@eventpro.com',
        status: 'published'
    },
    {
        id: 'ev-6',
        title: 'Street Food & Craft Beer Festival',
        short_description: 'Celebrate local culinary culture with 60+ food stalls and craft breweries.',
        description: 'A weekend-long celebration of food, drink, and community. Sample dishes from 60+ local chefs and artisan food vendors, paired with unique craft beers, wines, and cocktails from independent producers.',
        category_id: 'cat-6',
        category_name: 'Food & Drink',
        category_icon: '🍷',
        category_color: '#ef4444',
        location: 'Portland, OR, USA',
        venue: 'Tom McCall Waterfront Park',
        image_url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80',
        start_date: '2026-08-22T11:00:00Z',
        end_date: '2026-08-23T21:00:00Z',
        capacity: 3000,
        registered_count: 1400,
        price: 25.00,
        is_featured: false,
        organizer_name: 'Admin User',
        organizer_email: 'admin@eventpro.com',
        status: 'published'
    },
    {
        id: 'ev-7',
        title: 'Modern Art Exhibition: Visions 2026',
        short_description: 'A stunning showcase of emerging artists redefining contemporary art.',
        description: 'Visions 2026 brings together 40+ emerging contemporary artists from over 20 countries. Explore paintings, sculptures, digital art, and immersive installations that challenge your perception.',
        category_id: 'cat-5',
        category_name: 'Art & Culture',
        category_icon: '🎨',
        category_color: '#8b5cf6',
        location: 'London, UK',
        venue: 'Tate Modern',
        image_url: 'https://images.unsplash.com/photo-1531913764164-f85c13636f5f?w=800&q=80',
        start_date: '2026-03-05T10:00:00Z',
        end_date: '2026-03-28T19:00:00Z',
        capacity: 500,
        registered_count: 210,
        price: 0,
        is_featured: false,
        organizer_name: 'Admin User',
        organizer_email: 'admin@eventpro.com',
        status: 'published'
    },
    {
        id: 'ev-8',
        title: 'Startup Founders Networking Night',
        short_description: 'Connect with 200+ founders, investors, and startup ecosystem leaders.',
        description: 'An intimate but high-energy evening designed for startup founders, early-stage investors, and tech ecosystem builders. Speed networking, fireside chats, and hosted introductions to accelerate your connections.',
        category_id: 'cat-7',
        category_name: 'Networking',
        category_icon: '🤝',
        category_color: '#0ea5e9',
        location: 'Berlin, Germany',
        venue: 'Factory Berlin',
        image_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80',
        start_date: '2026-04-28T18:00:00Z',
        end_date: '2026-04-28T22:00:00Z',
        capacity: 200,
        registered_count: 140,
        price: 0,
        is_featured: false,
        organizer_name: 'Admin User',
        organizer_email: 'admin@eventpro.com',
        status: 'published'
    }
];

// Helper functions for localStorage persistence
const getStored = (key, fallback) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
    } catch {
        return fallback;
    }
};

const setStored = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error('Failed to write to localStorage', e);
    }
};

export const getMockUsers = () => getStored('eventpro_demo_users', INITIAL_USERS);
export const saveMockUsers = (users) => setStored('eventpro_demo_users', users);

export const getMockEvents = () => getStored('eventpro_demo_events', INITIAL_EVENTS);
export const saveMockEvents = (events) => setStored('eventpro_demo_events', events);

// Mock Auth
export const mockLogin = (email, password) => {
    const users = getMockUsers();
    const cleanEmail = email.trim().toLowerCase();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
        // If email matches admin@eventpro.com, dikshant@gmail.com, or neha@gmail.com, allow login in demo mode!
        if (cleanEmail === 'admin@eventpro.com' || cleanEmail === 'dikshant@gmail.com') {
            const adminUser = {
                id: 'usr-' + Date.now(),
                name: cleanEmail.split('@')[0],
                email: cleanEmail,
                role: 'admin',
                created_at: new Date().toISOString()
            };
            users.push(adminUser);
            saveMockUsers(users);
            const token = 'demo-jwt-token-' + Date.now();
            return { token, user: adminUser };
        }
        
        // For general user login fallback
        const newUser = {
            id: 'usr-' + Date.now(),
            name: cleanEmail.split('@')[0],
            email: cleanEmail,
            role: cleanEmail.includes('admin') ? 'admin' : 'user',
            created_at: new Date().toISOString()
        };
        users.push(newUser);
        saveMockUsers(users);
        const token = 'demo-jwt-token-' + Date.now();
        return { token, user: newUser };
    }

    const { password_hash: _, ...safeUser } = user;
    const token = 'demo-jwt-token-' + Date.now();
    return { token, user: safeUser };
};

export const mockRegister = (name, email, password) => {
    const users = getMockUsers();
    const cleanEmail = email.trim().toLowerCase();
    const exists = users.find(u => u.email.toLowerCase() === cleanEmail);
    
    // If user already exists in mock users, return the existing user (so demo registration never blocks)
    if (exists) {
        const { password_hash: _, ...safeUser } = exists;
        const token = 'demo-jwt-token-' + Date.now();
        return { token, user: safeUser };
    }

    const isDemoAdmin = cleanEmail.includes('admin') || cleanEmail.includes('dikshant');
    const newUser = {
        id: 'usr-' + Date.now(),
        name,
        email: cleanEmail,
        password_hash: password,
        role: isDemoAdmin ? 'admin' : 'user',
        created_at: new Date().toISOString()
    };

    users.push(newUser);
    saveMockUsers(users);

    const { password_hash: _, ...safeUser } = newUser;
    const token = 'demo-jwt-token-' + Date.now();
    return { token, user: safeUser };
};

// Mock Events API
export const mockGetEvents = (params = {}) => {
    let events = getMockEvents();
    const { category, search, upcoming, featured, page = 1, limit = 12 } = params;

    if (category) {
        events = events.filter(e => e.category_name?.toLowerCase() === category.toLowerCase());
    }
    if (search) {
        const q = search.toLowerCase();
        events = events.filter(e =>
            e.title?.toLowerCase().includes(q) ||
            e.description?.toLowerCase().includes(q) ||
            e.location?.toLowerCase().includes(q)
        );
    }
    if (upcoming === 'true') {
        events = events.filter(e => new Date(e.start_date) >= new Date());
    }
    if (featured === 'true') {
        events = events.filter(e => e.is_featured);
    }

    const total = events.length;
    const start = (page - 1) * limit;
    const paginated = events.slice(start, start + limit);

    return {
        events: paginated,
        total,
        page: Number(page),
        pages: Math.ceil(total / limit) || 1
    };
};

export const mockGetEventById = (id) => {
    const events = getMockEvents();
    return events.find(e => e.id === id || String(e.id) === String(id)) || events[0];
};

export const mockCreateEvent = (eventData, user) => {
    const events = getMockEvents();
    const category = INITIAL_CATEGORIES.find(c => c.id === eventData.category_id) || INITIAL_CATEGORIES[0];
    const newEv = {
        ...eventData,
        id: 'ev-' + Date.now(),
        registered_count: 0,
        category_name: category.name,
        category_icon: category.icon,
        category_color: category.color,
        organizer_name: user?.name || 'Admin User',
        organizer_email: user?.email || 'admin@eventpro.com',
        created_at: new Date().toISOString()
    };
    events.unshift(newEv);
    saveMockEvents(events);
    return newEv;
};

export const mockUpdateEvent = (id, eventData) => {
    const events = getMockEvents();
    const idx = events.findIndex(e => e.id === id || String(e.id) === String(id));
    if (idx !== -1) {
        const category = INITIAL_CATEGORIES.find(c => c.id === eventData.category_id);
        events[idx] = {
            ...events[idx],
            ...eventData,
            category_name: category ? category.name : events[idx].category_name,
            category_color: category ? category.color : events[idx].category_color,
            category_icon: category ? category.icon : events[idx].category_icon,
        };
        saveMockEvents(events);
        return events[idx];
    }
    return null;
};

export const mockDeleteEvent = (id) => {
    let events = getMockEvents();
    events = events.filter(e => e.id !== id && String(e.id) !== String(id));
    saveMockEvents(events);
    return { message: 'Event deleted' };
};

export const INITIAL_REGISTRATIONS = [
    {
        id: 'reg-demo-1',
        event_id: 'ev-1',
        user_id: 'usr-demo',
        ticket_count: 2,
        payment_status: 'completed',
        payment_method: 'UPI QR Scanner',
        payment_ref: 'UTR984729103847',
        total_paid: 598.00,
        title: 'Web Summit 2026',
        start_date: '2026-05-10T09:00:00Z',
        location: 'Lisbon, Portugal',
        venue: 'Altice Arena',
        image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
        category_name: 'Conference',
        category_color: '#6366f1',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
        id: 'reg-demo-2',
        event_id: 'ev-7',
        user_id: 'usr-demo',
        ticket_count: 1,
        payment_status: 'free',
        payment_method: 'Free',
        payment_ref: 'FREE-ENTRY',
        total_paid: 0,
        title: 'Modern Art Exhibition: Visions 2026',
        start_date: '2026-03-05T10:00:00Z',
        location: 'London, UK',
        venue: 'Tate Modern',
        image_url: 'https://images.unsplash.com/photo-1531913764164-f85c13636f5f?w=800&q=80',
        category_name: 'Art & Culture',
        category_color: '#8b5cf6',
        created_at: new Date(Date.now() - 86400000 * 5).toISOString()
    }
];

export const getMockRegistrations = () => getStored('eventpro_demo_registrations', INITIAL_REGISTRATIONS);
export const saveMockRegistrations = (regs) => setStored('eventpro_demo_registrations', regs);

// Mock Registrations
export const mockCreateRegistration = (eventId, ticketCount = 1, user, paymentRef = '') => {
    const regs = getMockRegistrations();
    const event = mockGetEventById(eventId);

    const isFree = Number(event.price) === 0;
    const newReg = {
        id: 'reg-' + Date.now(),
        event_id: eventId,
        user_id: user?.id || 'usr-demo',
        ticket_count: ticketCount,
        payment_status: isFree ? 'free' : 'completed',
        payment_method: isFree ? 'Free Pass' : 'UPI QR Scanner',
        payment_ref: paymentRef || (isFree ? 'FREE-PASS' : 'UTR' + Math.floor(100000000000 + Math.random() * 900000000000)),
        total_paid: Number(event.price) * ticketCount,
        title: event.title,
        start_date: event.start_date,
        location: event.location,
        venue: event.venue,
        image_url: event.image_url,
        category_name: event.category_name,
        category_color: event.category_color,
        created_at: new Date().toISOString()
    };

    regs.unshift(newReg);
    saveMockRegistrations(regs);

    // Update event registered count
    const events = getMockEvents();
    const evIdx = events.findIndex(e => e.id === eventId || String(e.id) === String(eventId));
    if (evIdx !== -1) {
        events[evIdx].registered_count = (events[evIdx].registered_count || 0) + ticketCount;
        saveMockEvents(events);
    }

    return newReg;
};

export const mockGetMyRegistrations = (user) => {
    const regs = getMockRegistrations();
    if (!user) return regs;
    return regs.filter(r => r.user_id === user.id || !r.user_id);
};

export const mockCancelRegistration = (regId) => {
    let regs = getMockRegistrations();
    regs = regs.filter(r => r.id !== regId);
    saveMockRegistrations(regs);
    return { message: 'Registration cancelled' };
};
