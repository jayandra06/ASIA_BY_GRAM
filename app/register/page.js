'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowLeft, User, Phone, Calendar } from 'lucide-react';

function RegisterForm() {
    const searchParams = useSearchParams();
    const eventFromQuery = searchParams.get('event') || '';
    const adId = searchParams.get('ad') || '';

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        age: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const res = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    phone: formData.phone,
                    age: Number(formData.age),
                    eventName: eventFromQuery,
                    adId,
                    source: 'register',
                }),
            });

            const data = await res.json().catch(() => ({}));

            if (res.ok) {
                setDone(true);
            } else {
                setError(data.error || 'Something went wrong. Please try again.');
            }
        } catch (err) {
            console.error(err);
            setError('Failed to connect. Please check your network and try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClass =
        'w-full bg-white border border-zinc-200 rounded-xl pl-11 pr-4 py-3.5 text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/30 transition-all';

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 md:py-24">
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <img
                        src="/logo.png"
                        alt="Asia By Gram"
                        className="h-14 w-auto mx-auto mb-4 object-contain"
                    />
                    <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#B45309]">
                        Asia By Gram
                    </p>
                    <h1 className="mt-3 text-3xl font-bold text-zinc-900 tracking-tight">
                        {eventFromQuery || 'Join the Event'}
                    </h1>
                    <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
                        {eventFromQuery
                            ? 'Fill in your details to register. We’ll get in touch soon.'
                            : 'Enter your details below to register your interest.'}
                    </p>
                </div>

                <div className="bg-white/90 backdrop-blur-sm border border-zinc-200 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] p-6 sm:p-8">
                    {done ? (
                        <div className="text-center py-6 space-y-4">
                            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto">
                                <CheckCircle2 className="text-green-600" size={32} />
                            </div>
                            <h2 className="text-xl font-bold text-zinc-900">You’re registered!</h2>
                            <p className="text-sm text-zinc-500">
                                Thanks{formData.name ? `, ${formData.name.split(' ')[0]}` : ''}. We’ve saved your
                                details{eventFromQuery ? ` for ${eventFromQuery}` : ''}. Our team has been notified
                                on WhatsApp and will get in touch soon.
                            </p>
                            <div className="flex flex-col gap-2 pt-2">
                                <Link
                                    href="/menu"
                                    className="w-full py-3.5 rounded-xl bg-[#FFC107] text-black font-bold text-sm uppercase tracking-wider hover:bg-[#FFD54F] transition-colors text-center"
                                >
                                    Browse Menu
                                </Link>
                                <Link
                                    href="/"
                                    className="w-full py-2.5 text-sm text-zinc-500 hover:text-zinc-800 transition-colors text-center"
                                >
                                    Back to home
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1.5">
                                    Full Name *
                                </label>
                                <div className="relative">
                                    <User
                                        size={16}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                                    />
                                    <input
                                        required
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Your full name"
                                        className={inputClass}
                                        autoComplete="name"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1.5">
                                    Phone Number *
                                </label>
                                <div className="relative">
                                    <Phone
                                        size={16}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                                    />
                                    <input
                                        required
                                        name="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="10-digit mobile number"
                                        className={inputClass}
                                        autoComplete="tel"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1.5">
                                    Age *
                                </label>
                                <div className="relative">
                                    <Calendar
                                        size={16}
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                                    />
                                    <input
                                        required
                                        name="age"
                                        type="number"
                                        min={1}
                                        max={120}
                                        value={formData.age}
                                        onChange={handleChange}
                                        placeholder="e.g. 24"
                                        className={inputClass}
                                    />
                                </div>
                            </div>

                            {error && (
                                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-3.5 rounded-xl bg-[#FFC107] text-black font-bold text-sm uppercase tracking-wider hover:bg-[#FFD54F] disabled:opacity-60 transition-colors shadow-lg shadow-amber-200/50 mt-2"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit'}
                            </button>

                            <Link
                                href="/"
                                className="flex items-center justify-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-700 pt-1 transition-colors"
                            >
                                <ArrowLeft size={12} /> Back to home
                            </Link>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-[50vh] flex items-center justify-center text-zinc-500 text-sm">
                    Loading...
                </div>
            }
        >
            <RegisterForm />
        </Suspense>
    );
}
