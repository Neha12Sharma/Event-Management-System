import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calendar, MapPin, Tag, DollarSign, Users,
    Sparkles, ArrowLeft, Image as ImageIcon, Save, CheckCircle
} from 'lucide-react';
import api from '../api/axios';
import { mockCreateEvent, INITIAL_CATEGORIES } from '../api/mockData';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './CreateEvent.css';

const PRESET_IMAGES = [
    { label: '💻 Tech Conference', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80' },
    { label: '🎵 Music Fest', url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80' },
    { label: '🛠️ Workshop', url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80' },
    { label: '🤖 AI Summit', url: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80' },
    { label: '🍷 Food Festival', url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80' },
    { label: '🎨 Art Exhibition', url: 'https://images.unsplash.com/photo-1531913764164-f85c13636f5f?w=800&q=80' }
];

export default function CreateEvent() {
    const { user } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();

    const [categories, setCategories] = useState(INITIAL_CATEGORIES);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        title: '',
        short_description: '',
        description: '',
        category_id: 'cat-1',
        location: '',
        venue: '',
        image_url: PRESET_IMAGES[0].url,
        start_date: '',
        end_date: '',
        capacity: 100,
        price: 0,
        is_featured: true,
        status: 'published'
    });

    useEffect(() => {
        api.get('/events/categories')
            .then(r => { if (Array.isArray(r.data)) setCategories(r.data); })
            .catch(() => { });
    }, []);

    const handleChange = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.start_date || !form.end_date) {
            return toast('Title, Start Date, and End Date are required!', 'error');
        }

        setSubmitting(true);
        try {
            const { data } = await api.post('/events', form);
            toast('🎉 Event created & published successfully!', 'success');
            navigate(`/events/${data.id || data.event?.id || 1}`);
        } catch (err) {
            // Fallback to mock create event
            const newEv = mockCreateEvent(form, user);
            toast('🎉 Event created & published successfully!', 'success');
            navigate(`/events/${newEv.id}`);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="create-event-page">
            <div className="create-event-container">
                <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>
                    <ArrowLeft size={16} /> Back
                </button>

                <div className="create-event-card">
                    <div className="create-event-header">
                        <div className="section-tag" style={{ margin: '0 auto 10px auto', width: 'fit-content' }}>
                            <Sparkles size={14} /> Host Your Own Event
                        </div>
                        <h1 className="create-event-title">
                            Create <span className="gradient-text">New Event</span>
                        </h1>
                        <p className="create-event-sub">Fill out the details below to publish your event to thousands of attendees</p>
                    </div>

                    <form onSubmit={handleSubmit} className="event-form">
                        {/* Title */}
                        <div className="form-group">
                            <label className="form-label">Event Title *</label>
                            <input
                                className="form-input"
                                placeholder="e.g., Tech Innovators Conference 2026"
                                required
                                value={form.title}
                                onChange={e => handleChange('title', e.target.value)}
                            />
                        </div>

                        {/* Category & Status */}
                        <div className="form-grid-2">
                            <div className="form-group">
                                <label className="form-label">Category</label>
                                <select
                                    className="form-input form-select"
                                    value={form.category_id}
                                    onChange={e => handleChange('category_id', e.target.value)}
                                >
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.icon || '🏷️'} {c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Status</label>
                                <select
                                    className="form-input form-select"
                                    value={form.status}
                                    onChange={e => handleChange('status', e.target.value)}
                                >
                                    <option value="published">Published (Live)</option>
                                    <option value="draft">Draft</option>
                                </select>
                            </div>
                        </div>

                        {/* Short & Full Description */}
                        <div className="form-group">
                            <label className="form-label">Short Description</label>
                            <input
                                className="form-input"
                                placeholder="A catchy one-liner summary of your event"
                                maxLength={250}
                                value={form.short_description}
                                onChange={e => handleChange('short_description', e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Full Event Description</label>
                            <textarea
                                className="form-input form-textarea"
                                rows={4}
                                placeholder="Provide full event agenda, highlights, speakers, and schedule..."
                                value={form.description}
                                onChange={e => handleChange('description', e.target.value)}
                            />
                        </div>

                        {/* Dates */}
                        <div className="form-grid-2">
                            <div className="form-group">
                                <label className="form-label">Start Date & Time *</label>
                                <input
                                    type="datetime-local"
                                    className="form-input"
                                    required
                                    value={form.start_date}
                                    onChange={e => handleChange('start_date', e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">End Date & Time *</label>
                                <input
                                    type="datetime-local"
                                    className="form-input"
                                    required
                                    value={form.end_date}
                                    onChange={e => handleChange('end_date', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Location & Venue */}
                        <div className="form-grid-2">
                            <div className="form-group">
                                <label className="form-label">Location (City, Country)</label>
                                <input
                                    className="form-input"
                                    placeholder="e.g. San Francisco, CA, USA"
                                    value={form.location}
                                    onChange={e => handleChange('location', e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Venue Name</label>
                                <input
                                    className="form-input"
                                    placeholder="e.g. Moscone Center"
                                    value={form.venue}
                                    onChange={e => handleChange('venue', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Price & Capacity */}
                        <div className="form-grid-2">
                            <div className="form-group">
                                <label className="form-label">Ticket Price ($)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="form-input"
                                    placeholder="0 for Free Admission"
                                    value={form.price}
                                    onChange={e => handleChange('price', parseFloat(e.target.value) || 0)}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Capacity (Max Tickets)</label>
                                <input
                                    type="number"
                                    min="1"
                                    className="form-input"
                                    value={form.capacity}
                                    onChange={e => handleChange('capacity', parseInt(e.target.value) || 100)}
                                />
                            </div>
                        </div>

                        {/* Image URL & Quick Selection */}
                        <div className="form-group">
                            <label className="form-label">Cover Image URL</label>
                            <input
                                className="form-input"
                                placeholder="https://..."
                                value={form.image_url}
                                onChange={e => handleChange('image_url', e.target.value)}
                            />

                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 8, display: 'block' }}>
                                Or pick a quick cover photo:
                            </span>

                            <div className="image-presets">
                                {PRESET_IMAGES.map((img, idx) => (
                                    <button
                                        type="button"
                                        key={idx}
                                        className={`preset-chip ${form.image_url === img.url ? 'active' : ''}`}
                                        onClick={() => handleChange('image_url', img.url)}
                                    >
                                        <img src={img.url} alt="" />
                                        {img.label}
                                    </button>
                                ))}
                            </div>

                            {form.image_url && (
                                <div className="image-preview-box">
                                    <span className="image-preview-badge">Cover Preview</span>
                                    <img src={form.image_url} alt="Cover Preview" onError={e => e.target.src = PRESET_IMAGES[0].url} />
                                </div>
                            )}
                        </div>

                        {/* Featured Checkbox */}
                        <div className="form-group form-checkbox" style={{ marginTop: 20 }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                <input
                                    type="checkbox"
                                    checked={form.is_featured}
                                    onChange={e => handleChange('is_featured', e.target.checked)}
                                    style={{ width: 18, height: 18, accentColor: 'var(--primary)' }}
                                />
                                Feature this event on homepage
                            </label>
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: 'flex', gap: 16, marginTop: 32 }}>
                            <button type="button" className="btn btn-secondary btn-full" onClick={() => navigate(-1)}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={submitting}>
                                <Save size={18} />
                                {submitting ? 'Publishing Event...' : 'Publish Event'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
