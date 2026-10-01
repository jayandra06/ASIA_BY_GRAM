'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2,
    ArrowLeft,
    ArrowRight,
    User,
    Phone,
    Calendar,
    Copy,
    Check,
    QrCode,
    Smartphone,
    CreditCard,
    ShieldCheck,
} from 'lucide-react';

function RegisterForm() {
    const searchParams = useSearchParams();
    const eventFromQuery = searchParams.get('event') || '';
    const adId = searchParams.get('ad') || '';

    const [step, setStep] = useState('details'); // 'details' | 'payment'
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        age: '',
        utr: '',
    });
    const [copied, setCopied] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState('');

    const upiId = 'asiabygram@kotak';
    const entryFee = 500;
    const upiPayLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
        'ASIA BY GRAM'
    )}&am=${entryFee}&cu=INR&tn=${encodeURIComponent(eventFromQuery || 'Event Registration')}`;

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleCopyUpi = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(upiId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleProceedToPayment = (e) => {
        e.preventDefault();
        setError('');

        const name = formData.name.trim();
        const phone = formData.phone.trim().replace(/\s+/g, '');
        const age = Number(formData.age);

        if (!name) {
            setError('Please enter your full name');
            return;
        }

        if (!/^[0-9+\-]{8,15}$/.test(phone)) {
            setError('Please enter a valid 10-digit phone number');
            return;
        }

        if (Number.isNaN(age) || age < 1 || age > 120) {
            setError('Please enter a valid age (1-120)');
            return;
        }

        setStep('payment');
    };

    const handleFinalSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const res = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    phone: formData.phone.trim().replace(/\s+/g, ''),
                    age: Number(formData.age),
                    eventName: eventFromQuery,
                    adId,
                    source: 'register',
                    entryFee,
                    paymentStatus: 'Pending',
                    utr: formData.utr.trim(),
                    paymentNotes: formData.utr.trim()
                        ? `UPI UTR: ${formData.utr.trim()}`
                        : 'Paid via UPI scanner',
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
        'w-full bg-white border border-zinc-200 rounded-xl pl-11 pr-4 py-3.5 text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/30 transition-all text-sm';

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 md:py-20">
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-lg"
            >
                {/* Header */}
                <div className="text-center mb-6">
                    <img
                        src="/logo.png"
                        alt="Asia By Gram"
                        className="h-14 w-auto mx-auto mb-3 object-contain"
                    />
                    <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#B45309]">
                        Asia By Gram
                    </p>
                    <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
                        {eventFromQuery || 'Event Registration'}
                    </h1>
                    <div className="mt-2 inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold">
                        <CreditCard size={14} className="text-amber-600" />
                        Entry Fee: ₹{entryFee}
                    </div>
                </div>

                <div className="bg-white/95 backdrop-blur-sm border border-zinc-200 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] p-5 sm:p-8">
                    {done ? (
                        <div className="text-center py-4 space-y-4">
                            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto">
                                <CheckCircle2 className="text-green-600" size={32} />
                            </div>
                            <h2 className="text-xl font-bold text-zinc-900">You’re Registered!</h2>
                            <p className="text-sm text-zinc-500 leading-relaxed max-w-md mx-auto">
                                Thanks, <span className="font-semibold text-zinc-800">{formData.name}</span>. We’ve
                                recorded your registration for{' '}
                                <span className="font-semibold text-zinc-800">
                                    {eventFromQuery || 'our event'}
                                </span>
                                . Our team will verify your ₹{entryFee} payment and confirm via WhatsApp.
                            </p>

                            {/* Summary Receipt */}
                            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-left space-y-2 text-xs text-zinc-600">
                                <div className="flex justify-between py-1 border-b border-zinc-200">
                                    <span className="text-zinc-400 uppercase font-semibold">Participant</span>
                                    <span className="font-bold text-zinc-900">{formData.name}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-zinc-200">
                                    <span className="text-zinc-400 uppercase font-semibold">Phone</span>
                                    <span className="font-medium text-zinc-900">{formData.phone}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-zinc-200">
                                    <span className="text-zinc-400 uppercase font-semibold">Entry Fee</span>
                                    <span className="font-bold text-green-700">₹{entryFee}</span>
                                </div>
                                {formData.utr && (
                                    <div className="flex justify-between py-1 border-b border-zinc-200">
                                        <span className="text-zinc-400 uppercase font-semibold">UPI UTR / Ref</span>
                                        <span className="font-mono text-zinc-900 font-semibold">{formData.utr}</span>
                                    </div>
                                )}
                                <div className="flex justify-between py-1">
                                    <span className="text-zinc-400 uppercase font-semibold">Status</span>
                                    <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                                        Pending Admin Verification
                                    </span>
                                </div>
                            </div>

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
                        <div>
                            {/* Step Indicator */}
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-100">
                                <div
                                    className={`flex items-center gap-2 text-xs font-bold ${
                                        step === 'details' ? 'text-primary' : 'text-zinc-400'
                                    }`}
                                >
                                    <span
                                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                                            step === 'details'
                                                ? 'bg-[#FFC107] text-black font-bold'
                                                : 'bg-zinc-200 text-zinc-600'
                                        }`}
                                    >
                                        1
                                    </span>
                                    Your Details
                                </div>
                                <div className="h-0.5 w-12 bg-zinc-200" />
                                <div
                                    className={`flex items-center gap-2 text-xs font-bold ${
                                        step === 'payment' ? 'text-primary' : 'text-zinc-400'
                                    }`}
                                >
                                    <span
                                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                                            step === 'payment'
                                                ? 'bg-[#FFC107] text-black font-bold'
                                                : 'bg-zinc-200 text-zinc-600'
                                        }`}
                                    >
                                        2
                                    </span>
                                    Pay Entry Fee (₹{entryFee})
                                </div>
                            </div>

                            {/* STEP 1: Details */}
                            {step === 'details' && (
                                <form onSubmit={handleProceedToPayment} className="space-y-4">
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
                                        className="w-full py-3.5 rounded-xl bg-[#FFC107] text-black font-bold text-sm uppercase tracking-wider hover:bg-[#FFD54F] transition-colors shadow-lg shadow-amber-200/50 mt-2 flex items-center justify-center gap-2"
                                    >
                                        Proceed to Pay ₹{entryFee} <ArrowRight size={16} />
                                    </button>

                                    <Link
                                        href="/"
                                        className="flex items-center justify-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-700 pt-1 transition-colors"
                                    >
                                        <ArrowLeft size={12} /> Back to home
                                    </Link>
                                </form>
                            )}

                            {/* STEP 2: Payment */}
                            {step === 'payment' && (
                                <form onSubmit={handleFinalSubmit} className="space-y-4">
                                    {/* Registrant summary pill */}
                                    <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3 flex items-center justify-between">
                                        <div className="text-xs">
                                            <p className="font-bold text-zinc-900">{formData.name}</p>
                                            <p className="text-zinc-500">{formData.phone} · Age {formData.age}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setStep('details')}
                                            className="text-xs font-bold text-amber-800 hover:underline"
                                        >
                                            Edit
                                        </button>
                                    </div>

                                    {/* Scanner Card */}
                                    <div className="bg-white border-2 border-zinc-200 rounded-2xl p-4 sm:p-5 text-center shadow-sm space-y-3">
                                        <div className="flex items-center justify-center gap-2">
                                            <QrCode size={18} className="text-[#B45309]" />
                                            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
                                                Scan &amp; Pay ₹{entryFee}
                                            </h3>
                                        </div>

                                        {/* Scanner Image */}
                                        <div className="relative mx-auto max-w-[260px] rounded-xl overflow-hidden border border-zinc-200 bg-white p-2 shadow-inner">
                                            <img
                                                src="/asia-by-gram-qr.jpg"
                                                alt="Asia By Gram UPI QR Scanner"
                                                className="w-full h-auto object-contain rounded-lg"
                                            />
                                        </div>

                                        {/* UPI ID with Copy Button */}
                                        <div className="flex items-center justify-between bg-zinc-100 rounded-xl px-3 py-2 border border-zinc-200 text-xs">
                                            <div className="text-left">
                                                <span className="text-[10px] uppercase tracking-wider text-zinc-400 block font-bold">
                                                    UPI ID
                                                </span>
                                                <span className="font-mono font-bold text-zinc-800">
                                                    {upiId}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleCopyUpi}
                                                className="px-2.5 py-1.5 bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 rounded-lg font-semibold flex items-center gap-1 transition-colors text-xs"
                                            >
                                                {copied ? (
                                                    <>
                                                        <Check size={14} className="text-green-600" />
                                                        <span className="text-green-600">Copied</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy size={14} />
                                                        <span>Copy</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        {/* Mobile Direct Pay Button */}
                                        <a
                                            href={upiPayLink}
                                            className="w-full py-2.5 px-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors"
                                        >
                                            <Smartphone size={14} />
                                            Pay ₹{entryFee} using UPI App (PhonePe / GPay / Paytm)
                                        </a>

                                        <p className="text-[11px] text-zinc-400">
                                            Accepted on Google Pay, PhonePe, Paytm, BHIM &amp; all UPI apps.
                                        </p>
                                    </div>

                                    {/* UTR Input */}
                                    <div>
                                        <label className="block text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1.5">
                                            UPI Reference / UTR Number (optional)
                                        </label>
                                        <input
                                            name="utr"
                                            value={formData.utr}
                                            onChange={handleChange}
                                            placeholder="e.g. 12-digit UTR from your payment receipt"
                                            className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/30 transition-all text-xs font-mono"
                                        />
                                        <p className="text-[11px] text-zinc-400 mt-1">
                                            Found in your UPI app receipt after making the ₹{entryFee} payment.
                                        </p>
                                    </div>

                                    {error && (
                                        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                                            {error}
                                        </p>
                                    )}

                                    <div className="flex gap-3 pt-1">
                                        <button
                                            type="button"
                                            onClick={() => setStep('details')}
                                            className="flex-1 py-3.5 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 font-bold text-xs uppercase tracking-wider transition-colors"
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="flex-[2] py-3.5 rounded-xl bg-[#FFC107] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#FFD54F] disabled:opacity-60 transition-colors shadow-lg shadow-amber-200/50 flex items-center justify-center gap-1.5"
                                        >
                                            {isSubmitting ? (
                                                'Submitting...'
                                            ) : (
                                                <>
                                                    <ShieldCheck size={16} />
                                                    I Have Paid ₹{entryFee}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
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
