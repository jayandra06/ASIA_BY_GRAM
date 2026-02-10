'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, CheckCircle2, Phone, User, MessageSquare } from 'lucide-react';
import { useState } from 'react';

const EventRegistrationModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        note: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/event-registrations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    eventName: "Valentine's Day Special",
                    name: formData.name,
                    phone: formData.phone,
                    note: formData.note
                }),
            });

            if (response.ok) {
                setIsSuccess(true);
                setTimeout(() => {
                    onClose();
                    setIsSuccess(false);
                    setFormData({ name: '', phone: '', note: '' });
                }, 3000);
            } else {
                const errorData = await response.json();
                alert(`Registration failed: ${errorData.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Registration error:', error);
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
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-6">
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
                        className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-10"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-900/50">
                            <div>
                                <h2 className="text-2xl font-display font-bold text-white uppercase tracking-tight">Event Registration</h2>
                                <p className="text-primary text-sm font-asian tracking-widest uppercase">Valentine's Day Special</p>
                                <p className="text-zinc-400 text-xs mt-1 italic">Plan your date night with your valentine</p>
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
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                            <User size={14} /> Full Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            placeholder="Your Name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors placeholder:text-zinc-600"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                            <Phone size={14} /> Mobile Number
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

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                            <MessageSquare size={14} /> Special Note (Optional)
                                        </label>
                                        <textarea
                                            name="note"
                                            rows="3"
                                            placeholder="Any special requests or notes?"
                                            value={formData.note}
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
                                                Register Now
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
                                    <h3 className="text-2xl font-display font-bold text-white">Registration Successful!</h3>
                                    <p className="text-zinc-400 max-w-xs">
                                        Thank you for registering for the Valentine's Day Special. We'll contact you soon with more details.
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
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default EventRegistrationModal;
