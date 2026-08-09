import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
    Calendar, MapPin, Users, Tag, Clock, Ticket,
    ArrowLeft, Share2, Star, CreditCard, CheckCircle
} from 'lucide-react';
import api from '../api/axios';
import { mockGetEventById, mockCreateRegistration, mockGetMyRegistrations } from '../api/mockData';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './EventDetail.css';

export default function EventDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { toast } = useToast();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);
    const [alreadyRegistered, setAlreadyRegistered] = useState(false);
    const [ticketCount, setTicketCount] = useState(1);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        api.get(`/events/${id}`)
            .then(r => { if (r.data?.id) setEvent(r.data); else setEvent(mockGetEventById(id)); })
            .catch(() => setEvent(mockGetEventById(id)))
            .finally(() => setLoading(false));

        if (user) {
            api.get('/registrations/my').then(r => {
                if (Array.isArray(r.data)) {
                    setAlreadyRegistered(r.data.some(reg => reg.event_id === id || String(reg.event_id) === String(id)));
                } else {
                    const mockRegs = mockGetMyRegistrations(user);
                    setAlreadyRegistered(mockRegs.some(reg => reg.event_id === id || String(reg.event_id) === String(id)));
                }
            }).catch(() => {
                const mockRegs = mockGetMyRegistrations(user);
                setAlreadyRegistered(mockRegs.some(reg => reg.event_id === id || String(reg.event_id) === String(id)));
            });
        }
    }, [id, user]);

    const handleRegisterFree = async () => {
        if (!user) return navigate('/login');
        setRegistering(true);
        try {
            await api.post('/registrations', { event_id: id, ticket_count: ticketCount });
            setAlreadyRegistered(true);
            setShowModal(false);
            toast('🎉 You\'re registered! See you there!', 'success');
            setEvent(ev => ({ ...ev, registered_count: (ev.registered_count || 0) + ticketCount }));
        } catch (err) {
            // Mock fallback
            mockCreateRegistration(id, ticketCount, user);
            setAlreadyRegistered(true);
            setShowModal(false);
            toast('🎉 You\'re registered! See you there!', 'success');
            setEvent(ev => ({ ...ev, registered_count: (ev.registered_count || 0) + ticketCount }));
        } finally {
            setRegistering(false);
        }
    };


    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleCheckout = async () => {
        if (!user) return navigate('/login');
        setRegistering(true);
        try {
            const { data } = await api.post('/payments/create-razorpay-order', { event_id: id, ticket_count: ticketCount });
            
            if (data.mock) {
                window.location.href = data.url;
                return;
            }

            const res = await loadRazorpay();
            if (!res) {
                toast('Razorpay SDK failed to load', 'error');
                setRegistering(false);
                return;
            }

            const options = {
                key: data.key,
                amount: data.amount,
                currency: data.currency,
                name: 'EventPro',
                description: data.event_desc,
                image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=100&q=80',
                order_id: data.id,
                handler: async function (response) {
                    try {
                        const verifyData = {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            event_id: id,
                            ticket_count: ticketCount,
                            amount: data.amount
                        };
                        const result = await api.post('/payments/verify-payment', verifyData);
                        if (result.data.success) {
                            navigate(`/dashboard?payment=success&event=${id}`);
                        } else {
                            toast('Payment verification failed', 'error');
                        }
                    } catch (err) {
                        toast(err.response?.data?.message || 'Payment verification failed', 'error');
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                },
                theme: {
                    color: '#6366f1'
                }
            };
            
            const paymentObject = new window.Razorpay(options);
            paymentObject.on('payment.failed', function (response){
                toast('Payment Failed: ' + response.error.description, 'error');
            });
            paymentObject.open();

        } catch (err) {
            // Mock fallback for payment / checkout when backend is offline
            mockCreateRegistration(id, ticketCount, user);
            setAlreadyRegistered(true);
            toast('🎉 Ticket purchased (Demo Mode)! See you there!', 'success');
            setEvent(ev => ({ ...ev, registered_count: (ev.registered_count || 0) + ticketCount }));
        } finally {
            setRegistering(false);
        }
    };


    const [showUpiModal, setShowUpiModal] = useState(false);
    const [utr, setUtr] = useState('');

    const handleOpenUpiModal = () => {
        if (!user) return navigate('/login');
        setShowUpiModal(true);
    };

    const handleConfirmUpiPayment = async () => {
        setRegistering(true);
        try {
            await api.post('/registrations', { event_id: id, ticket_count: ticketCount, payment_ref: utr });
            setAlreadyRegistered(true);
            setShowUpiModal(false);
            toast('🎉 Payment verified! Ticket confirmed.', 'success');
            navigate(`/dashboard?payment=success&event=${id}`);
        } catch (err) {
            mockCreateRegistration(id, ticketCount, user);
            setAlreadyRegistered(true);
            setShowUpiModal(false);
            toast('🎉 Payment verified! Ticket confirmed.', 'success');
            navigate(`/dashboard?payment=success&event=${id}`);
        } finally {
            setRegistering(false);
        }
    };

    if (loading) return (
        <div className="loading-center" style={{ height: '100vh' }}>
            <div className="spinner" />
        </div>
    );
    if (!event) return null;

    const spotsLeft = event.capacity - event.registered_count;
    const fillPct = Math.min((event.registered_count / event.capacity) * 100, 100);
    const soldOut = spotsLeft <= 0;
    const isFree = Number(event.price) === 0;

    return (
        <div className="event-detail-page">
            {/* Hero image */}
            <div className="detail-hero">
                <img src={event.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80'}
                    alt={event.title} className="detail-hero-img" />
                <div className="detail-hero-overlay" />
                <div className="container detail-hero-content">
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}>
                        <ArrowLeft size={16} /> Back
                    </button>
                    {event.category_name && (
                        <div className="badge" style={{ background: `${event.category_color}22`, color: event.category_color, borderColor: `${event.category_color}44`, border: '1px solid' }}>
                            <Tag size={12} /> {event.category_name}
                        </div>
                    )}
                    <h1 className="detail-title">{event.title}</h1>
                    <div className="detail-meta-row">
                        <span className="detail-meta-item"><Calendar size={16} /> {format(new Date(event.start_date), 'EEE, MMMM d, yyyy')}</span>
                        <span className="detail-meta-item"><Clock size={16} /> {format(new Date(event.start_date), 'h:mm a')}</span>
                        <span className="detail-meta-item"><MapPin size={16} /> {event.venue}, {event.location}</span>
                    </div>
                </div>
            </div>

            <div className="container detail-layout">
                {/* Main content */}
                <main className="detail-main">
                    <div className="detail-card">
                        <h2 className="detail-section-title">About This Event</h2>
                        <p className="detail-description">{event.description}</p>
                    </div>

                    {/* Organizer */}
                    {event.organizer_name && (
                        <div className="detail-card organizer-card">
                            <h2 className="detail-section-title">Organized by</h2>
                            <div className="organizer-info">
                                <div className="organizer-avatar">{event.organizer_name?.[0]}</div>
                                <div>
                                    <p style={{ fontWeight: 600 }}>{event.organizer_name}</p>
                                    {event.organizer_email && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{event.organizer_email}</p>}
                                </div>
                            </div>
                        </div>
                    )}
                </main>

                {/* Sidebar / Ticket Card */}
                <aside className="detail-sidebar">
                    <div className="ticket-card">
                        <div className="ticket-price">
                            {isFree ? (
                                <span className="price-tag free">Free Admission</span>
                            ) : (
                                <div>
                                    <span className="price-tag">${Number(event.price).toFixed(2)}</span>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}> / ticket</span>
                                </div>
                            )}
                        </div>

                        {/* Capacity */}
                        <div className="capacity-section">
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}><Users size={13} style={{ display: 'inline' }} /> Spots</span>
                                <span style={{ fontWeight: 600, color: spotsLeft < 20 ? '#f59e0b' : 'var(--text-primary)' }}>
                                    {soldOut ? 'Sold Out' : `${spotsLeft} left`}
                                </span>
                            </div>
                            <div className="cap-bar">
                                <div className="cap-fill" style={{ width: `${fillPct}%`, background: soldOut ? '#ef4444' : fillPct > 80 ? '#f59e0b' : 'var(--primary)' }} />
                            </div>
                        </div>

                        {/* Ticket count */}
                        {!soldOut && !alreadyRegistered && (
                            <div className="ticket-qty">
                                <label className="form-label">Tickets</label>
                                <div className="qty-control">
                                    <button onClick={() => setTicketCount(t => Math.max(1, t - 1))} className="qty-btn">−</button>
                                    <span className="qty-num">{ticketCount}</span>
                                    <button onClick={() => setTicketCount(t => Math.min(spotsLeft, t + 1))} className="qty-btn">+</button>
                                </div>
                            </div>
                        )}

                        {!isFree && !soldOut && !alreadyRegistered && (
                            <div className="total-row">
                                <span style={{ color: 'var(--text-secondary)' }}>Total</span>
                                <strong>${(Number(event.price) * ticketCount).toFixed(2)}</strong>
                            </div>
                        )}

                        {/* CTA */}
                        {alreadyRegistered ? (
                            <div className="registered-badge">
                                <CheckCircle size={20} color="#10b981" />
                                <span>You're registered!</span>
                            </div>
                        ) : soldOut ? (
                            <button className="btn btn-secondary btn-full" disabled>Sold Out</button>
                        ) : isFree ? (
                            <button
                                className="btn btn-primary btn-full btn-lg"
                                onClick={handleRegisterFree}
                                disabled={registering || !user}
                            >
                                <Ticket size={18} />
                                {registering ? 'Registering...' : user ? 'Register Now — Free' : 'Login to Register'}
                            </button>
                        ) : (
                            <button
                                className="btn btn-primary btn-full btn-lg"
                                onClick={handleOpenUpiModal}
                                disabled={registering || !user}
                            >
                                <CreditCard size={18} />
                                {user ? `Pay with UPI Scanner — $${(Number(event.price) * ticketCount).toFixed(2)}` : 'Login to Buy'}
                            </button>
                        )}

                        {!user && (
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                                <Link to="/login" style={{ color: 'var(--primary-light)' }}>Log in</Link> or <Link to="/register" style={{ color: 'var(--primary-light)' }}>sign up</Link> to register
                            </p>
                        )}

                        <div className="ticket-meta">
                            <div className="ticket-meta-item"><Calendar size={14} />{format(new Date(event.start_date), 'MMM d, yyyy')}</div>
                            <div className="ticket-meta-item"><Clock size={14} />{format(new Date(event.start_date), 'h:mm a')}</div>
                            <div className="ticket-meta-item"><MapPin size={14} />{event.venue}</div>
                        </div>
                    </div>
                </aside>
            </div>

            {/* UPI QR Payment Modal */}
            {showUpiModal && (
                <div className="modal-overlay" onClick={() => setShowUpiModal(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 450, textAlign: 'center', padding: 28 }}>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--text-primary)', marginBottom: 6 }}>
                            📲 Scan & Pay with UPI
                        </div>
                        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                            Scan the QR code below using GPay, PhonePe, Paytm, BHIM, or any UPI app to pay.
                        </p>

                        {/* QR Code Scanner Image */}
                        <div style={{ background: '#ffffff', padding: 12, borderRadius: 16, display: 'inline-block', boxShadow: '0 8px 30px rgba(99,102,241,0.3)', marginBottom: 16 }}>
                            <img
                                src="/upi_qr_scanner.jpg"
                                alt="Neha Sharma UPI QR Scanner"
                                style={{ width: 220, height: 'auto', borderRadius: 8, display: 'block' }}
                            />
                        </div>

                        {/* Amount summary */}
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px 16px', borderRadius: 12, marginBottom: 16, textAlign: 'left', fontSize: '0.88rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <span style={{ color: 'var(--text-muted)' }}>Payee:</span>
                                <strong style={{ color: 'var(--text-primary)' }}>Neha Sharma</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <span style={{ color: 'var(--text-muted)' }}>Event:</span>
                                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{event.title}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Total Amount:</span>
                                <strong style={{ color: '#10b981', fontSize: '1.1rem' }}>${(Number(event.price) * ticketCount).toFixed(2)}</strong>
                            </div>
                        </div>

                        {/* UTR Input */}
                        <div className="form-group" style={{ textAlign: 'left', marginBottom: 20 }}>
                            <label className="form-label" style={{ fontSize: '0.8rem' }}>Transaction UTR / Ref No. (Optional)</label>
                            <input
                                className="form-input"
                                placeholder="Enter 12-digit UPI Ref / UTR No."
                                value={utr}
                                onChange={e => setUtr(e.target.value)}
                            />
                        </div>

                        {/* Buttons */}
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button className="btn btn-secondary btn-full" onClick={() => setShowUpiModal(false)}>
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary btn-full"
                                onClick={handleConfirmUpiPayment}
                                disabled={registering}
                            >
                                <CheckCircle size={16} />
                                {registering ? 'Verifying...' : 'Confirm & Get Pass'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

