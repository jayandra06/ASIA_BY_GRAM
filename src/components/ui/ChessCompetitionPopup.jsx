'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Calendar, IndianRupee, Crown, Send, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'abg_chess_promo_dismissed';

const ChessCompetitionPopup = ({ tableNumber = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState('banner'); // banner | form | success
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        age: '',
        experience: 'Beginner',
        notes: '',
    });

    useEffect(() => {
        try {
            if (sessionStorage.getItem(STORAGE_KEY) === '1') return;
        } catch (_) { /* ignore */ }

        const timer = setTimeout(() => setIsOpen(true), 900);
        return () => clearTimeout(timer);
    }, []);

    const close = () => {
        setIsOpen(false);
        try {
            sessionStorage.setItem(STORAGE_KEY, '1');
        } catch (_) { /* ignore */ }
        setTimeout(() => {
            setView('banner');
            setFormData({
                name: '',
                phone: '',
                email: '',
                age: '',
                experience: 'Beginner',
                notes: '',
            });
        }, 300);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/competition', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    age: formData.age ? Number(formData.age) : undefined,
                    tableNumber: tableNumber || '',
                }),
            });

            const data = await response.json().catch(() => ({}));

            if (response.ok) {
                setView('success');
            } else {
                alert(data.error || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Competition registration error:', error);
            alert('Failed to connect to the server. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-3 sm:p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={close}
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 30, scale: 0.96 }}
                        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
                        className="relative w-full max-w-md bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden shadow-2xl max-h-[92vh] overflow-y-auto"
                    >
                        <button
                            type="button"
                            onClick={close}
                            className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/40 text-white/80 hover:text-white hover:bg-black/60 transition-colors"
                            aria-label="Close"
                        >
                            <X size={18} />
                        </button>

                        {view === 'banner' && (
                            <>
                                {/* Designed promo banner */}
                                <div className="relative overflow-hidden min-h-[280px] bg-[#0c0c0c]">
                                    <div
                                        className="absolute inset-0 opacity-[0.18]"
                                        style={{
                                            backgroundImage:
                                                `linear-gradient(45deg, #222 25%, transparent 25%),
                                                 linear-gradient(-45deg, #222 25%, transparent 25%),
                                                 linear-gradient(45deg, transparent 75%, #222 75%),
                                                 linear-gradient(-45deg, transparent 75%, #222 75%)`,
                                            backgroundSize: '28px 28px',
                                            backgroundPosition: '0 0, 0 14px, 14px -14px, -14px 0',
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-transparent to-amber-900/30" />
                                    <div className="absolute -top-16 -right-10 w-48 h-48 rounded-full bg-primary/20 blur-3xl" />
                                    <div className="absolute -bottom-20 -left-10 w-56 h-56 rounded-full bg-amber-600/10 blur-3xl" />

                                    <div className="relative z-10 px-6 pt-8 pb-6 flex flex-col items-center text-center">
                                        <div className="flex items-center gap-2 mb-4">
                                            <img src="/logo.png" alt="Asia By Gram" className="w-10 h-10 object-contain rounded-full bg-white/90 p-1" />
                                            <span className="text-[10px] tracking-[0.25em] uppercase text-primary font-bold">Asia By Gram</span>
                                        </div>

                                        <div className="flex items-center gap-3 mb-3 text-primary">
                                            <span className="text-3xl leading-none select-none" aria-hidden>♞</span>
                                            <Crown size={28} className="text-primary" />
                                            <span className="text-3xl leading-none select-none" aria-hidden>♜</span>
                                        </div>

                                        <h2 className="text-2xl sm:text-3xl font-display font-bold text-white leading-tight">
                                            Chess Championship
                                        </h2>
                                        <p className="mt-1 text-primary font-bold tracking-wide text-sm">₹15,000 Cash Prize</p>
                                        <p className="mt-3 text-zinc-300 text-sm max-w-[280px] leading-relaxed">
                                            Battle it out at Asia By Gram. Qualifiers open — claim your seat at the board.
                                        </p>
                                    </div>
                                </div>

                                <div className="px-5 py-5 space-y-4 bg-zinc-950">
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
                                            <Calendar size={16} className="mx-auto text-primary mb-1.5" />
                                            <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">Qualifiers</p>
                                            <p className="text-xs text-white font-semibold mt-0.5">Oct 1 – 10</p>
                                        </div>
                                        <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
                                            <IndianRupee size={16} className="mx-auto text-primary mb-1.5" />
                                            <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">Entry</p>
                                            <p className="text-xs text-white font-semibold mt-0.5">₹500</p>
                                        </div>
                                        <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
                                            <Trophy size={16} className="mx-auto text-primary mb-1.5" />
                                            <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">Prize</p>
                                            <p className="text-xs text-white font-semibold mt-0.5">₹15,000</p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setView('form')}
                                        className="w-full py-3.5 rounded-xl bg-primary text-black font-bold text-sm uppercase tracking-wider hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                                    >
                                        Register for Chess Competition
                                    </button>
                                    <button
                                        type="button"
                                        onClick={close}
                                        className="w-full py-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                                    >
                                        Maybe later — continue to menu
                                    </button>
                                </div>
                            </>
                        )}

                        {view === 'form' && (
                            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
                                <div className="pr-8">
                                    <h3 className="text-xl font-bold text-white">Register Now</h3>
                                    <p className="text-sm text-zinc-400 mt-1">Entry fee ₹500 · Qualifiers Oct 1–10</p>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Full Name *</label>
                                    <input
                                        required
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Your name"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder:text-zinc-600 outline-none focus:border-primary"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Phone *</label>
                                    <input
                                        required
                                        name="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="10-digit mobile number"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder:text-zinc-600 outline-none focus:border-primary"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Email</label>
                                    <input
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="optional"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder:text-zinc-600 outline-none focus:border-primary"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Age</label>
                                        <input
                                            name="age"
                                            type="number"
                                            min="5"
                                            max="100"
                                            value={formData.age}
                                            onChange={handleChange}
                                            placeholder="e.g. 18"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder:text-zinc-600 outline-none focus:border-primary"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Level</label>
                                        <select
                                            name="experience"
                                            value={formData.experience}
                                            onChange={handleChange}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white outline-none focus:border-primary"
                                        >
                                            <option value="Beginner" className="bg-zinc-900">Beginner</option>
                                            <option value="Intermediate" className="bg-zinc-900">Intermediate</option>
                                            <option value="Advanced" className="bg-zinc-900">Advanced</option>
                                            <option value="Expert" className="bg-zinc-900">Expert</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Notes</label>
                                    <textarea
                                        name="notes"
                                        rows={2}
                                        value={formData.notes}
                                        onChange={handleChange}
                                        placeholder="Any message for the organizers"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder:text-zinc-600 outline-none focus:border-primary resize-none"
                                    />
                                </div>

                                <p className="text-[11px] text-zinc-500 leading-relaxed">
                                    Pay the ₹500 entry fee at the counter after registering. Prize pool: ₹15,000.
                                </p>

                                <div className="flex gap-3 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => setView('banner')}
                                        className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-300 font-bold text-sm hover:bg-white/10 transition-colors"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-[1.4] py-3 rounded-xl bg-primary text-black font-bold text-sm uppercase tracking-wider hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? 'Submitting…' : (
                                            <>
                                                <Send size={16} /> Submit
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}

                        {view === 'success' && (
                            <div className="p-8 text-center space-y-4">
                                <div className="mx-auto w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center">
                                    <CheckCircle2 size={36} className="text-green-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-white">You&apos;re Registered!</h3>
                                <p className="text-sm text-zinc-400 leading-relaxed">
                                    Thanks for joining the Chess Championship. Our team has been notified on WhatsApp.
                                    Please pay the ₹500 entry fee at the counter to confirm your spot. Qualifiers: Oct 1–10.
                                </p>
                                <button
                                    type="button"
                                    onClick={close}
                                    className="w-full py-3.5 rounded-xl bg-primary text-black font-bold text-sm uppercase tracking-wider hover:bg-primary/90 transition-colors"
                                >
                                    Continue to Menu
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ChessCompetitionPopup;
