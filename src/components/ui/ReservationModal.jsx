'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Calendar, Clock, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';

const ReservationModal = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        people: '2',
        date: '',
        time: '',
        requirements: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch(`/api/reservations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    guests: formData.people,
                    date: formData.date,
                    time: formData.time,
                    specialRequests: formData.requirements
                }),
            });

            if (response.ok) {
                setIsSuccess(true);
                setTimeout(() => {
                    onClose();
                    setIsSuccess(false);
                    setStep(1);
                    setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        people: '2',
                        date: '',
                        time: '',
                        requirements: ''
                    });
                }, 3000);
            } else {
                const errorData = await response.json();
                alert(`Reservation failed: ${errorData.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Reservation error:', error);
            alert('Failed to connect to the server. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.95, y: 20 },
        visible: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: 20 }
    };

    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
                    <motion.div
                        variants={overlayVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    <motion.div
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-900/50 sticky top-0 z-10 backdrop-blur-md">
                            <div>
                                <h2 className="text-2xl font-display font-bold text-white">Reserve a Table</h2>
                                <p className="text-zinc-400 text-sm">Experience the soul of Asia</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 md:p-8">
                            {!isSuccess ? (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                                <Users size={14} /> Number of People
                                            </label>
                                            <select
                                                name="people"
                                                value={formData.people}
                                                onChange={handleChange}
                                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors appearance-none"
                                                required
                                            >
                                                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                                                    <option key={num} value={num}>{num} {num === 1 ? 'Person' : 'People'}</option>
                                                ))}
                                                <option value="9+">9+ People</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                                <Calendar size={14} /> Date
                                            </label>
                                            <input
                                                type="date"
                                                name="date"
                                                value={formData.date}
                                                onChange={handleChange}
                                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                                <Clock size={14} /> Preferred Time
                                            </label>
                                            <input
                                                type="time"
                                                name="time"
                                                value={formData.time}
                                                onChange={handleChange}
                                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                                <Send size={14} /> Your Name
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                placeholder="John Doe"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors placeholder:text-zinc-600"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* New Contact Fields */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                                <Send size={14} /> Email Address
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                placeholder="john@example.com"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors placeholder:text-zinc-600"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                                <Send size={14} /> Phone Number
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                placeholder="+91 99999 99999"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors placeholder:text-zinc-600"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                            <MessageSquare size={14} /> Special Requirements
                                        </label>
                                        <textarea
                                            name="requirements"
                                            rows="3"
                                            placeholder="Example: Need to add a special cloth on the table for an anniversary..."
                                            value={formData.requirements}
                                            onChange={handleChange}
                                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors resize-none placeholder:text-zinc-600"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full py-4 bg-primary hover:bg-red-600 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                Confirm Reservation
                                                <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="py-12 flex flex-col items-center text-center space-y-4"
                                >
                                    <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-4">
                                        <CheckCircle2 size={40} />
                                    </div>
                                    <h3 className="text-2xl font-display font-bold text-white">Reservation Confirmed!</h3>
                                    <p className="text-zinc-400 max-w-xs">
                                        We've received your request for {formData.people} people on {formData.date}. A confirmation email has been sent to {formData.email}.
                                    </p>
                                    <button
                                        onClick={onClose}
                                        className="mt-8 px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-full border border-white/10 transition-colors"
                                    >
                                        Close
                                    </button>
                                </motion.div>
                            )}
                        </div>

                        {/* Footer decorative element */}
                        <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ReservationModal;
