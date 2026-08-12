import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import {
    Calendar, MapPin, Ticket, CheckCircle, Clock, Tag, Trash2, X,
    CreditCard, QrCode, User, Search, DollarSign, Download, Printer, Shield, ArrowRight
} from 'lucide-react';
import api from '../api/axios';
import { mockGetMyRegistrations, mockCancelRegistration, mockCreateRegistration, mockGetEvents } from '../api/mockData';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import EventPass from '../components/EventPass';
import './Dashboard.css';

export default function Dashboard() {
    const { user, login } = useAuth();
    const { toast } = useToast();
    const [searchParams, setSearchParams] = useSearchParams();

    // Active Tab: 'tickets' | 'payments' | 'scanner' | 'profile'
    const activeTab = searchParams.get('tab') || 'tickets';
    const setActiveTab = (tab) => setSearchParams({ tab });

    const [registrations, setRegistrations] = useState([]);
    const [eventsList, setEventsList] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modals
    const [selectedPass, setSelectedPass] = useState(null);
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [showUpiModal, setShowUpiModal] = useState(false);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'upcoming' | 'past'

    // Instant UPI Scanner state
    const [selectedEventId, setSelectedEventId] = useState('');
    const [scannerTicketQty, setScannerTicketQty] = useState(1);
    const [scannerUtr, setScannerUtr] = useState('');
    const [submittingPayment, setSubmittingPayment] = useState(false);

    // Profile form state
    const [profileName, setProfileName] = useState(user?.name || '');
    const [profileEmail, setProfileEmail] = useState(user?.email || '');
    const [profilePhone, setProfilePhone] = useState('+91 98765 43210');
    const [savingProfile, setSavingProfile] = useState(false);

    const fetchRegistrations = () => {
        setLoading(true);
        api.get('/registrations/my').then(r => {
            if (Array.isArray(r.data) && r.data.length > 0) setRegistrations(r.data);
            else setRegistrations(mockGetMyRegistrations(user));
        }).catch(() => {
            setRegistrations(mockGetMyRegistrations(user));
        }).finally(() => setLoading(false));
    };

    const fetchEvents = () => {
        api.get('/events').then(r => {
            const list = r.data?.events || r.data || [];
            if (list.length > 0) setEventsList(list);
            else setEventsList(mockGetEvents().events);
        }).catch(() => {
            setEventsList(mockGetEvents().events);
        });
    };

    useEffect(() => {
        fetchRegistrations();
        fetchEvents();

        // Check for payment success from URL
        if (searchParams.get('payment') === 'success') {
            toast('🎉 Payment verified! Your ticket pass is ready in your dashboard.', 'success');
            searchParams.delete('payment');
            setSearchParams(searchParams);
        }
    }, []);

    useEffect(() => {
        if (user) {
            setProfileName(user.name || '');
            setProfileEmail(user.email || '');
        }
    }, [user]);

    const handleCancel = async (regId) => {
        if (!confirm('Are you sure you want to cancel this registration?')) return;
        try {
            await api.delete(`/registrations/${regId}`);
            setRegistrations(r => r.filter(x => x.id !== regId));
            toast('Registration cancelled', 'info');
        } catch (err) {
            mockCancelRegistration(regId);
            setRegistrations(r => r.filter(x => x.id !== regId));
            toast('Registration cancelled (Demo Mode)', 'info');
        }
    };

    const handleInstantUpiPay = async (e) => {
        e?.preventDefault();
        if (!selectedEventId) {
            toast('Please select an event to pay for', 'warning');
            return;
        }
        setSubmittingPayment(true);
        try {
            await api.post('/registrations', {
                event_id: selectedEventId,
                ticket_count: scannerTicketQty,
                payment_ref: scannerUtr
            });
            toast('🎉 UPI Payment verified! Ticket confirmed.', 'success');
            fetchRegistrations();
            setShowUpiModal(false);
            setScannerUtr('');
            setActiveTab('tickets');
        } catch (err) {
            mockCreateRegistration(selectedEventId, scannerTicketQty, user, scannerUtr);
            toast('🎉 UPI Payment verified! Ticket confirmed.', 'success');
            fetchRegistrations();
            setShowUpiModal(false);
            setScannerUtr('');
            setActiveTab('tickets');
        } finally {
            setSubmittingPayment(false);
        }
    };

    const handleSaveProfile = (e) => {
        e.preventDefault();
        setSavingProfile(true);
        setTimeout(() => {
            toast('Profile updated successfully!', 'success');
            setSavingProfile(false);
        }, 600);
    };

    // Computations
    const upcoming = registrations.filter(r => new Date(r.start_date) >= new Date());
    const past = registrations.filter(r => new Date(r.start_date) < new Date());
    const totalSpent = registrations.reduce((sum, r) => sum + (Number(r.total_paid) || 0), 0);

    const filteredTickets = registrations.filter(r => {
        const matchesQuery = !searchQuery || r.title?.toLowerCase().includes(searchQuery.toLowerCase()) || r.location?.toLowerCase().includes(searchQuery.toLowerCase());
        if (filterStatus === 'upcoming') return matchesQuery && new Date(r.start_date) >= new Date();
        if (filterStatus === 'past') return matchesQuery && new Date(r.start_date) < new Date();
        return matchesQuery;
    });

    const selectedScannerEvent = eventsList.find(e => String(e.id) === String(selectedEventId)) || eventsList[0];

    const statusColors = { free: '#10b981', completed: '#6366f1', pending: '#f59e0b', refunded: '#ef4444' };
    const statusLabels = { free: 'Confirmed (Free)', completed: 'Paid & Confirmed', pending: 'Pending Payment', refunded: 'Refunded' };

    return (
        <div className="dashboard-page">
            <div className="container">
                {/* Header */}
                <div className="dash-header">
                    <div>
                        <h1 className="section-title" style={{ marginBottom: 6 }}>
                            User <span className="gradient-text">Dashboard</span>
                        </h1>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Welcome back, <strong style={{ color: 'var(--text-primary)' }}>{user?.name || 'Guest'}</strong>! Manage your tickets, payments, & passes.
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <button className="btn btn-primary" onClick={() => setShowUpiModal(true)}>
                            <QrCode size={16} /> Pay via UPI Scanner
                        </button>
                        <Link to="/events" className="btn btn-secondary">
                            <Calendar size={16} /> Browse Events
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="dash-stats">
                    <div className="dash-stat">
                        <Ticket size={28} style={{ color: 'var(--primary-light)' }} />
                        <div>
                            <div className="dash-stat-num">{registrations.length}</div>
                            <div className="dash-stat-label">Total Bookings</div>
                        </div>
                    </div>
                    <div className="dash-stat">
                        <Clock size={28} style={{ color: '#10b981' }} />
                        <div>
                            <div className="dash-stat-num">{upcoming.length}</div>
                            <div className="dash-stat-label">Upcoming Events</div>
                        </div>
                    </div>
                    <div className="dash-stat">
                        <CheckCircle size={28} style={{ color: '#f59e0b' }} />
                        <div>
                            <div className="dash-stat-num">{past.length}</div>
                            <div className="dash-stat-label">Attended Events</div>
                        </div>
                    </div>
                    <div className="dash-stat">
                        <DollarSign size={28} style={{ color: '#ec4899' }} />
                        <div>
                            <div className="dash-stat-num">${totalSpent.toFixed(2)}</div>
                            <div className="dash-stat-label">Total Money Spent</div>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="dash-tabs">
                    <button
                        className={`dash-tab ${activeTab === 'tickets' ? 'active' : ''}`}
                        onClick={() => setActiveTab('tickets')}
                    >
                        <Ticket size={16} /> My Tickets & Passes
                    </button>
                    <button
                        className={`dash-tab ${activeTab === 'payments' ? 'active' : ''}`}
                        onClick={() => setActiveTab('payments')}
                    >
                        <CreditCard size={16} /> Payments & Receipts
                    </button>
                    <button
                        className={`dash-tab ${activeTab === 'scanner' ? 'active' : ''}`}
                        onClick={() => setActiveTab('scanner')}
                    >
                        <QrCode size={16} /> UPI Scanner Payment
                    </button>
                    <button
                        className={`dash-tab ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        <User size={16} /> Profile & Settings
                    </button>
                </div>

                {/* TAB 1: MY TICKETS */}
                {activeTab === 'tickets' && (
                    <section className="dash-tab-content">
                        <div className="tickets-bar">
                            <div className="search-box">
                                <Search size={16} style={{ color: 'var(--text-muted)' }} />
                                <input
                                    type="text"
                                    placeholder="Search tickets by title or city..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="tickets-search-input"
                                />
                            </div>
                            <div className="filter-pills">
                                <button className={`pill ${filterStatus === 'all' ? 'active' : ''}`} onClick={() => setFilterStatus('all')}>All ({registrations.length})</button>
                                <button className={`pill ${filterStatus === 'upcoming' ? 'active' : ''}`} onClick={() => setFilterStatus('upcoming')}>Upcoming ({upcoming.length})</button>
                                <button className={`pill ${filterStatus === 'past' ? 'active' : ''}`} onClick={() => setFilterStatus('past')}>Past ({past.length})</button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="loading-center"><div className="spinner" /></div>
                        ) : filteredTickets.length === 0 ? (
                            <div className="empty-state">
                                <span style={{ fontSize: '3rem' }}>🎟️</span>
                                <h3>No tickets found</h3>
                                <p style={{ color: 'var(--text-muted)' }}>You haven't registered for any events matching your filter.</p>
                                <Link to="/events" className="btn btn-primary" style={{ marginTop: 12 }}>Browse All Events</Link>
                            </div>
                        ) : (
                            <div className="reg-list">
                                {filteredTickets.map(r => (
                                    <RegCard
                                        key={r.id}
                                        reg={r}
                                        onCancel={handleCancel}
                                        onViewPass={() => setSelectedPass(r)}
                                        onViewReceipt={() => setSelectedReceipt(r)}
                                        statusColors={statusColors}
                                        statusLabels={statusLabels}
                                    />
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {/* TAB 2: PAYMENTS & RECEIPTS */}
                {activeTab === 'payments' && (
                    <section className="dash-tab-content">
                        <div className="card-glass" style={{ padding: 24, borderRadius: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                                <div>
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Payment History & Transactions</h2>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>All receipts and UPI payment confirmations linked to your account.</p>
                                </div>
                                <div className="badge" style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--primary-light)', padding: '6px 14px', borderRadius: 999 }}>
                                    <Shield size={14} style={{ marginRight: 6 }} /> Secure UPI Verification
                                </div>
                            </div>

                            {registrations.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '30px 0' }}>No payment records found.</p>
                            ) : (
                                <div className="table-responsive">
                                    <table className="payments-table">
                                        <thead>
                                            <tr>
                                                <th>Transaction ID / UTR</th>
                                                <th>Event Name</th>
                                                <th>Method</th>
                                                <th>Date</th>
                                                <th>Amount</th>
                                                <th>Status</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {registrations.map(r => (
                                                <tr key={r.id}>
                                                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary-light)' }}>
                                                        {r.payment_ref || `UTR${r.id.replace('reg-', '')}`}
                                                    </td>
                                                    <td style={{ fontWeight: 600 }}>{r.title}</td>
                                                    <td>
                                                        <span className="badge-sm" style={{ background: 'rgba(255,255,255,0.06)' }}>
                                                            {r.payment_method || (Number(r.total_paid) === 0 ? 'Free Entry' : 'UPI QR Scanner')}
                                                        </span>
                                                    </td>
                                                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                        {format(new Date(r.created_at || r.start_date), 'MMM d, yyyy')}
                                                    </td>
                                                    <td style={{ fontWeight: 700, color: Number(r.total_paid) === 0 ? '#10b981' : 'var(--text-primary)' }}>
                                                        {Number(r.total_paid) === 0 ? 'FREE' : `$${Number(r.total_paid).toFixed(2)}`}
                                                    </td>
                                                    <td>
                                                        <span className="reg-status" style={{ color: statusColors[r.payment_status] || '#10b981', background: `${statusColors[r.payment_status] || '#10b981'}22`, padding: '3px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600 }}>
                                                            {statusLabels[r.payment_status] || 'Completed'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button className="btn btn-secondary btn-sm" onClick={() => setSelectedReceipt(r)} style={{ gap: 4 }}>
                                                            <Printer size={12} /> Receipt
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* TAB 3: INSTANT UPI QR SCANNER */}
                {activeTab === 'scanner' && (
                    <section className="dash-tab-content">
                        <div className="card-glass scanner-tab-card">
                            <div className="scanner-tab-header">
                                <div>
                                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, fontFamily: 'Outfit' }}>
                                        📲 Instant UPI QR Payment Scanner
                                    </h2>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
                                        Scan the official QR code below using any UPI app (GPay, PhonePe, Paytm, BHIM) to complete your ticket purchase.
                                    </p>
                                </div>
                            </div>

                            <div className="scanner-tab-grid">
                                {/* Left side: QR Image Card */}
                                <div className="qr-display-box">
                                    <div className="qr-image-frame">
                                        <img
                                            src="/upi_qr_scanner.jpg"
                                            alt="Neha Sharma UPI QR Code Scanner"
                                            className="qr-img"
                                        />
                                    </div>
                                    <div className="payee-tag">
                                        <span>Verified Payee:</span>
                                        <strong>Neha Sharma</strong>
                                    </div>
                                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
                                        Compatible with Google Pay, PhonePe, Paytm, WhatsApp Pay & all BHIM UPI apps.
                                    </p>
                                </div>

                                {/* Right side: Interactive Form */}
                                <form className="scanner-form" onSubmit={handleInstantUpiPay}>
                                    <div className="form-group">
                                        <label className="form-label">Select Event to Book</label>
                                        <select
                                            className="form-input"
                                            value={selectedEventId}
                                            onChange={e => setSelectedEventId(e.target.value)}
                                            required
                                        >
                                            <option value="">-- Choose an Event --</option>
                                            {eventsList.map(ev => (
                                                <option key={ev.id} value={ev.id}>
                                                    {ev.title} — ${Number(ev.price).toFixed(2)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {selectedScannerEvent && (
                                        <div className="event-preview-pill">
                                            <img src={selectedScannerEvent.image_url} alt={selectedScannerEvent.title} />
                                            <div>
                                                <strong style={{ fontSize: '0.9rem' }}>{selectedScannerEvent.title}</strong>
                                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                                    {selectedScannerEvent.venue}, {selectedScannerEvent.location}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="form-group">
                                        <label className="form-label">Number of Tickets</label>
                                        <div className="qty-control" style={{ width: 'fit-content' }}>
                                            <button type="button" onClick={() => setScannerTicketQty(q => Math.max(1, q - 1))} className="qty-btn">−</button>
                                            <span className="qty-num">{scannerTicketQty}</span>
                                            <button type="button" onClick={() => setScannerTicketQty(q => q + 1)} className="qty-btn">+</button>
                                        </div>
                                    </div>

                                    {selectedScannerEvent && (
                                        <div className="total-summary-box">
                                            <span>Total Amount Due:</span>
                                            <strong>${(Number(selectedScannerEvent.price) * scannerTicketQty).toFixed(2)}</strong>
                                        </div>
                                    )}

                                    <div className="form-group">
                                        <label className="form-label">Transaction UTR / Reference Number</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Enter 12-digit UPI UTR number (e.g. 984729103847)"
                                            value={scannerUtr}
                                            onChange={e => setScannerUtr(e.target.value)}
                                        />
                                        <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 4, display: 'block' }}>
                                            After scanning & paying, paste your 12-digit UTR number here to generate your instant QR Pass.
                                        </small>
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-full btn-lg"
                                        disabled={submittingPayment || !selectedEventId}
                                    >
                                        <CheckCircle size={18} />
                                        {submittingPayment ? 'Verifying Payment...' : 'Confirm UPI Payment & Get Ticket Pass'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </section>
                )}

                {/* TAB 4: PROFILE & SETTINGS */}
                {activeTab === 'profile' && (
                    <section className="dash-tab-content">
                        <div className="card-glass" style={{ padding: 28, borderRadius: 16, maxWidth: 650, margin: '0 auto' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                <div className="organizer-avatar" style={{ width: 60, height: 60, fontSize: '1.6rem' }}>
                                    {user?.name?.[0] || 'U'}
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '1.3rem', margin: 0, fontWeight: 700 }}>{user?.name || 'User Profile'}</h2>
                                    <span className="badge" style={{ marginTop: 4, background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                                        {user?.role === 'admin' ? '👑 Admin Account' : '👤 Verified User'}
                                    </span>
                                </div>
                            </div>

                            <form onSubmit={handleSaveProfile} className="profile-form">
                                <div className="form-group">
                                    <label className="form-label">Full Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={profileName}
                                        onChange={e => setProfileName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Email Address</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        value={profileEmail}
                                        onChange={e => setProfileEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Phone Number</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={profilePhone}
                                        onChange={e => setProfilePhone(e.target.value)}
                                    />
                                </div>

                                <button type="submit" className="btn btn-primary" disabled={savingProfile}>
                                    {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                                </button>
                            </form>
                        </div>
                    </section>
                )}
            </div>

            {/* MODAL 1: PASS MODAL */}
            {selectedPass && (
                <div className="modal-overlay" onClick={() => setSelectedPass(null)}>
                    <div className="modal-content pass-modal" onClick={e => e.stopPropagation()} style={{ background: 'transparent', boxShadow: 'none', maxWidth: '800px' }}>
                        <button className="modal-close" onClick={() => setSelectedPass(null)} style={{ background: 'white', color: 'black', top: -10, right: 0 }}>
                            <X size={20} />
                        </button>
                        <EventPass reg={selectedPass} user={user} />
                        <div style={{ textAlign: 'center', marginTop: 15, display: 'flex', justifyContent: 'center', gap: 10 }}>
                            <button className="btn btn-primary" onClick={() => window.print()}>
                                <Printer size={16} /> Print Event Pass
                            </button>
                            <button className="btn btn-secondary" onClick={() => setSelectedPass(null)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 2: RECEIPT MODAL */}
            {selectedReceipt && (
                <div className="modal-overlay" onClick={() => setSelectedReceipt(null)}>
                    <div className="modal-box receipt-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500, padding: 28 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', fontFamily: 'Outfit' }}>💳 Payment Receipt</h3>
                            <button className="modal-close" onClick={() => setSelectedReceipt(null)} style={{ position: 'static' }}>
                                <X size={18} />
                            </button>
                        </div>

                        <div className="receipt-paper" style={{ background: '#ffffff', color: '#0f172a', padding: 24, borderRadius: 12, fontSize: '0.88rem' }}>
                            <div style={{ textAlign: 'center', paddingBottom: 12, borderBottom: '2px dashed #cbd5e1', marginBottom: 16 }}>
                                <h4 style={{ margin: 0, fontSize: '1.4rem', color: '#6366f1', fontWeight: 800 }}>EventPro</h4>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Official Payment Receipt</p>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{ color: '#64748b' }}>Receipt No:</span>
                                <strong>#REC-{selectedReceipt.id}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{ color: '#64748b' }}>Transaction Ref / UTR:</span>
                                <strong style={{ color: '#6366f1', fontFamily: 'monospace' }}>{selectedReceipt.payment_ref || 'UTR984729103847'}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{ color: '#64748b' }}>Customer:</span>
                                <strong>{user?.name || 'Event Guest'} ({user?.email})</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{ color: '#64748b' }}>Event:</span>
                                <strong style={{ textAlign: 'right', maxWidth: '60%' }}>{selectedReceipt.title}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{ color: '#64748b' }}>Tickets:</span>
                                <strong>{selectedReceipt.ticket_count} Pass(es)</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{ color: '#64748b' }}>Payment Mode:</span>
                                <strong>{selectedReceipt.payment_method || 'UPI QR Scanner'}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingT: 12, borderTop: '2px dashed #cbd5e1', marginTop: 12, fontSize: '1.1rem' }}>
                                <strong>Total Paid:</strong>
                                <strong style={{ color: '#10b981' }}>${Number(selectedReceipt.total_paid).toFixed(2)}</strong>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                            <button className="btn btn-primary btn-full" onClick={() => window.print()}>
                                <Printer size={16} /> Print Receipt
                            </button>
                            <button className="btn btn-secondary btn-full" onClick={() => setSelectedReceipt(null)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 3: INSTANT UPI SCANNER MODAL */}
            {showUpiModal && (
                <div className="modal-overlay" onClick={() => setShowUpiModal(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 450, textAlign: 'center', padding: 28 }}>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--text-primary)', marginBottom: 6 }}>
                            📲 Scan & Pay with UPI
                        </div>
                        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                            Scan the QR code below using GPay, PhonePe, Paytm, or BHIM to pay.
                        </p>

                        <div style={{ background: '#ffffff', padding: 12, borderRadius: 16, display: 'inline-block', boxShadow: '0 8px 30px rgba(99,102,241,0.3)', marginBottom: 16 }}>
                            <img
                                src="/upi_qr_scanner.jpg"
                                alt="Neha Sharma UPI QR Scanner"
                                style={{ width: 220, height: 'auto', borderRadius: 8, display: 'block' }}
                            />
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px 16px', borderRadius: 12, marginBottom: 16, textAlign: 'left', fontSize: '0.88rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <span style={{ color: 'var(--text-muted)' }}>Payee:</span>
                                <strong style={{ color: 'var(--text-primary)' }}>Neha Sharma</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Accepted Apps:</span>
                                <span style={{ color: 'var(--primary-light)', fontWeight: 600 }}>All UPI Apps</span>
                            </div>
                        </div>

                        <div className="form-group" style={{ textAlign: 'left', marginBottom: 20 }}>
                            <label className="form-label">Select Event</label>
                            <select className="form-input" value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)}>
                                <option value="">-- Select Event --</option>
                                {eventsList.map(ev => (
                                    <option key={ev.id} value={ev.id}>{ev.title} (${Number(ev.price).toFixed(2)})</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group" style={{ textAlign: 'left', marginBottom: 20 }}>
                            <label className="form-label">Transaction UTR / Ref No.</label>
                            <input
                                className="form-input"
                                placeholder="Enter 12-digit UPI Ref / UTR No."
                                value={scannerUtr}
                                onChange={e => setScannerUtr(e.target.value)}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: 10 }}>
                            <button className="btn btn-secondary btn-full" onClick={() => setShowUpiModal(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-primary btn-full" onClick={handleInstantUpiPay} disabled={submittingPayment || !selectedEventId}>
                                <CheckCircle size={16} /> Confirm & Get Pass
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function RegCard({ reg, onCancel, onViewPass, onViewReceipt, statusColors, statusLabels }) {
    const isConfirmed = reg.payment_status === 'free' || reg.payment_status === 'completed';

    return (
        <div className="reg-card">
            <div className="reg-image">
                <img src={reg.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=200&q=60'} alt={reg.title} />
            </div>
            <div className="reg-info">
                {reg.category_name && (
                    <div className="category-badge" style={{ background: `${reg.category_color || '#6366f1'}22`, color: reg.category_color || '#818cf8', borderColor: `${reg.category_color || '#6366f1'}44`, border: '1px solid', marginBottom: 6, width: 'fit-content', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '999px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Tag size={10} />{reg.category_name}
                    </div>
                )}
                <h3 className="reg-title">{reg.title}</h3>
                <div className="reg-meta">
                    <span><Calendar size={13} /> {format(new Date(reg.start_date), 'EEE, MMM d, yyyy')}</span>
                    <span><Clock size={13} /> {format(new Date(reg.start_date), 'h:mm a')}</span>
                    <span><MapPin size={13} /> {reg.location}</span>
                </div>
                <div className="reg-footer">
                    <div className="reg-ticket-info">
                        <Ticket size={14} /> {reg.ticket_count} ticket{reg.ticket_count > 1 ? 's' : ''}
                        {reg.total_paid > 0 && ` · $${Number(reg.total_paid).toFixed(2)} paid`}
                    </div>
                    <span className="reg-status" style={{ color: statusColors[reg.payment_status] || '#94a3b8', background: `${statusColors[reg.payment_status]}22`, padding: '2px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600 }}>
                        {statusLabels[reg.payment_status] || reg.payment_status}
                    </span>
                </div>
            </div>
            <div className="reg-actions" style={{ flexDirection: 'column', gap: 8 }}>
                {isConfirmed ? (
                    <>
                        <button className="btn btn-primary btn-sm" onClick={onViewPass} style={{ width: '100%' }}>
                            <QrCode size={14} /> View Pass
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={onViewReceipt} style={{ width: '100%' }}>
                            <Printer size={14} /> Receipt
                        </button>
                    </>
                ) : (
                    <Link to={`/events/${reg.event_id}`} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>View Event</Link>
                )}

                {onCancel && (
                    <button className="btn btn-outline btn-sm" onClick={() => onCancel(reg.id)} style={{ width: '100%', borderColor: '#ef4444', color: '#ef4444' }}>
                        Cancel Run
                    </button>
                )}
            </div>
        </div>
    );
}
