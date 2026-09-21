'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Megaphone } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const STORAGE_PREFIX = 'abg_ad_';

function dismissKey(adId) {
    return `${STORAGE_PREFIX}${adId}`;
}

function wasDismissed(ad) {
    try {
        const key = dismissKey(ad._id);
        if (ad.frequency === 'always') return false;

        if (ad.frequency === 'session') {
            return sessionStorage.getItem(key) === '1';
        }

        if (ad.frequency === 'once') {
            return localStorage.getItem(key) === '1';
        }

        if (ad.frequency === 'daily') {
            const stored = localStorage.getItem(key);
            if (!stored) return false;
            const day = new Date().toDateString();
            return stored === day;
        }
    } catch (_) {
        /* ignore */
    }
    return false;
}

function markDismissed(ad) {
    try {
        const key = dismissKey(ad._id);
        if (ad.frequency === 'session' || ad.frequency === 'always') {
            sessionStorage.setItem(key, '1');
        } else if (ad.frequency === 'once') {
            localStorage.setItem(key, '1');
        } else if (ad.frequency === 'daily') {
            localStorage.setItem(key, new Date().toDateString());
        }
    } catch (_) {
        /* ignore */
    }
}

function getAnimation(ad) {
    const duration = (ad.animationDuration || 500) / 1000;
    if (ad.animationType === 'slide') {
        return {
            initial: { opacity: 0, y: 40 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: 20 },
            transition: { duration },
        };
    }
    if (ad.animationType === 'scale') {
        return {
            initial: { opacity: 0, scale: 0.92 },
            animate: { opacity: 1, scale: 1 },
            exit: { opacity: 0, scale: 0.95 },
            transition: { duration },
        };
    }
    return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration },
    };
}

function CtaLink({ ad, className, onClick }) {
    if (!ad.ctaLink || !ad.ctaText) return null;
    const isExternal = /^https?:\/\//i.test(ad.ctaLink);

    if (isExternal) {
        return (
            <a
                href={ad.ctaLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClick}
                className={className}
            >
                {ad.ctaText}
            </a>
        );
    }

    return (
        <Link href={ad.ctaLink} onClick={onClick} className={className}>
            {ad.ctaText}
        </Link>
    );
}

function BannerAd({ ad, onClose }) {
    const anim = getAnimation(ad);
    return (
        <motion.div
            {...anim}
            className="fixed top-0 left-0 right-0 z-[60] shadow-md"
            style={{
                backgroundColor: ad.backgroundColor || '#ffffff',
                color: ad.textColor || '#000000',
            }}
        >
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4 pr-10 relative">
                {ad.mediaUrl && (
                    <img
                        src={ad.mediaUrl}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0 hidden sm:block"
                    />
                )}
                <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base font-medium leading-snug">{ad.content}</p>
                    {ad.ctaText && ad.ctaLink && (
                        <CtaLink
                            ad={ad}
                            className="inline-block mt-1 text-sm font-bold underline underline-offset-2 hover:opacity-80"
                            onClick={onClose}
                        />
                    )}
                </div>
                {ad.showCloseButton !== false && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-3 right-3 p-1.5 rounded-md hover:bg-black/10 transition-colors"
                        aria-label="Close banner"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>
        </motion.div>
    );
}

function PopupAd({ ad, onClose }) {
    const anim = getAnimation(ad);
    const radius = ad.borderRadius ?? 12;

    return (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-3 sm:p-6">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={ad.showCloseButton !== false ? onClose : undefined}
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
                {...anim}
                className="relative w-full max-w-md overflow-hidden shadow-2xl max-h-[92vh] overflow-y-auto"
                style={{
                    backgroundColor: ad.backgroundColor || '#ffffff',
                    color: ad.textColor || '#000000',
                    borderRadius: radius,
                }}
            >
                {ad.showCloseButton !== false && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/10 hover:bg-black/20 transition-colors"
                        aria-label="Close"
                    >
                        <X size={18} />
                    </button>
                )}
                {ad.mediaUrl && (
                    <div className="w-full aspect-[16/10] overflow-hidden">
                        <img src={ad.mediaUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                )}
                <div className="p-6 space-y-4">
                    {ad.title && (
                        <p className="text-xs font-bold uppercase tracking-widest opacity-60">{ad.title}</p>
                    )}
                    <p className="text-lg font-semibold leading-relaxed whitespace-pre-wrap">{ad.content}</p>
                    {ad.ctaText && ad.ctaLink && (
                        <CtaLink
                            ad={ad}
                            onClick={onClose}
                            className="inline-flex items-center justify-center w-full py-3 px-4 font-bold text-sm uppercase tracking-wider bg-[#FFC107] text-black hover:bg-[#FFD54F] transition-colors"
                            style={{ borderRadius: Math.min(radius, 12) }}
                        />
                    )}
                </div>
            </motion.div>
        </div>
    );
}

function ToastAd({ ad, onClose }) {
    const anim = getAnimation(ad);
    const radius = ad.borderRadius ?? 12;
    const isLeft = ad.position === 'bottom-left';

    return (
        <motion.div
            {...anim}
            className={`fixed z-[100] bottom-4 ${isLeft ? 'left-4' : 'right-4'} w-[min(100%-2rem,360px)] shadow-xl border border-black/5 overflow-hidden`}
            style={{
                backgroundColor: ad.backgroundColor || '#ffffff',
                color: ad.textColor || '#000000',
                borderRadius: radius,
            }}
        >
            <div className="flex gap-3 p-4 relative">
                {ad.mediaUrl ? (
                    <img src={ad.mediaUrl} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                ) : (
                    <div className="w-14 h-14 rounded-lg bg-black/5 flex items-center justify-center flex-shrink-0">
                        <Megaphone size={22} className="opacity-50" />
                    </div>
                )}
                <div className="flex-1 min-w-0 pr-6">
                    <p className="text-sm font-medium leading-snug">{ad.content}</p>
                    {ad.ctaText && ad.ctaLink && (
                        <CtaLink
                            ad={ad}
                            onClick={onClose}
                            className="inline-block mt-2 text-xs font-bold uppercase tracking-wider underline underline-offset-2"
                        />
                    )}
                </div>
                {ad.showCloseButton !== false && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-2 right-2 p-1.5 rounded-md hover:bg-black/10"
                        aria-label="Close"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>
        </motion.div>
    );
}

function FlyerAd({ ad, onClose }) {
    const anim = getAnimation(ad);
    const radius = ad.borderRadius ?? 12;

    return (
        <motion.div
            {...anim}
            className="fixed z-[100] bottom-4 right-4 w-[min(100%-2rem,280px)] shadow-2xl overflow-hidden border border-black/10"
            style={{
                backgroundColor: ad.backgroundColor || '#ffffff',
                color: ad.textColor || '#000000',
                borderRadius: radius,
            }}
        >
            {ad.showCloseButton !== false && (
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60"
                    aria-label="Close"
                >
                    <X size={14} />
                </button>
            )}
            {ad.mediaUrl && (
                <img src={ad.mediaUrl} alt="" className="w-full aspect-[4/3] object-cover" />
            )}
            <div className="p-4 space-y-2">
                <p className="text-sm font-semibold leading-snug">{ad.content}</p>
                {ad.ctaText && ad.ctaLink && (
                    <CtaLink
                        ad={ad}
                        onClick={onClose}
                        className="inline-block text-xs font-bold uppercase tracking-wider text-[#B45309] underline"
                    />
                )}
            </div>
        </motion.div>
    );
}

function FloatingAd({ ad, onClose, onExpand }) {
    return (
        <motion.button
            type="button"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={onExpand}
            className="fixed z-[100] bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center animate-pulse"
            style={{ backgroundColor: ad.backgroundColor || '#FFC107', color: ad.textColor || '#000' }}
            aria-label="Open offer"
        >
            {ad.mediaUrl ? (
                <img src={ad.mediaUrl} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
                <Megaphone size={22} />
            )}
            {ad.showCloseButton !== false && (
                <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.stopPropagation();
                            onClose();
                        }
                    }}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-zinc-900 text-white flex items-center justify-center"
                >
                    <X size={10} />
                </span>
            )}
        </motion.button>
    );
}

function BadgeAd({ ad, onClose, onExpand }) {
    return (
        <motion.button
            type="button"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={onExpand}
            className="fixed z-[100] top-[40%] right-3 w-4 h-4 rounded-full shadow-[0_0_12px_rgba(255,193,7,0.8)] ring-2 ring-white"
            style={{ backgroundColor: ad.backgroundColor || '#FFC107' }}
            aria-label="View offer"
            title={ad.content}
        />
    );
}

/**
 * Loads published ads for the current page and renders the highest-priority
 * matching format (banner + one overlay type).
 */
const AdsDisplay = ({ placement: placementProp }) => {
    const pathname = usePathname();
    const [ads, setAds] = useState([]);
    const [visibleIds, setVisibleIds] = useState(new Set());
    const [expandedFloating, setExpandedFloating] = useState(null);

    const placement =
        placementProp ||
        (pathname?.startsWith('/menu') ? 'menu' : pathname === '/' ? 'homepage' : null);

    useEffect(() => {
        if (!placement) return;

        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(`/api/ads?active=true&placement=${placement}`);
                if (!res.ok) return;
                const data = await res.json();
                if (cancelled) return;

                const eligible = data.filter((ad) => !wasDismissed(ad));
                setAds(eligible);
                setVisibleIds(new Set(eligible.map((a) => a._id)));
            } catch (err) {
                console.error('Failed to load ads:', err);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [placement]);

    const closeAd = useCallback((ad) => {
        markDismissed(ad);
        setVisibleIds((prev) => {
            const next = new Set(prev);
            next.delete(ad._id);
            return next;
        });
        setExpandedFloating((cur) => (cur === ad._id ? null : cur));
    }, []);

    // Auto-close timers
    useEffect(() => {
        const timers = ads
            .filter((ad) => visibleIds.has(ad._id) && ad.autoCloseSeconds > 0)
            .map((ad) =>
                setTimeout(() => closeAd(ad), ad.autoCloseSeconds * 1000)
            );
        return () => timers.forEach(clearTimeout);
    }, [ads, visibleIds, closeAd]);

    const visible = ads.filter((ad) => visibleIds.has(ad._id));
    const banner = visible.find((a) => a.adType === 'banner');
    const overlayTypes = ['popup', 'toast', 'flyer', 'floating', 'badge'];
    const overlay = visible.find((a) => overlayTypes.includes(a.adType));

    useEffect(() => {
        if (banner) {
            document.body.style.paddingTop = '64px';
            document.documentElement.style.setProperty('--ad-banner-offset', '64px');
        } else {
            document.body.style.paddingTop = '';
            document.documentElement.style.setProperty('--ad-banner-offset', '0px');
        }
        return () => {
            document.body.style.paddingTop = '';
            document.documentElement.style.setProperty('--ad-banner-offset', '0px');
        };
    }, [banner]);

    if (!placement || visible.length === 0) return null;

    const showAsPopup =
        overlay &&
        (overlay.adType === 'popup' ||
            ((overlay.adType === 'floating' || overlay.adType === 'badge') &&
                expandedFloating === overlay._id));

    return (
        <AnimatePresence>
            {banner && <BannerAd key={`banner-${banner._id}`} ad={banner} onClose={() => closeAd(banner)} />}

            {overlay?.adType === 'toast' && (
                <ToastAd key={overlay._id} ad={overlay} onClose={() => closeAd(overlay)} />
            )}

            {overlay?.adType === 'flyer' && (
                <FlyerAd key={overlay._id} ad={overlay} onClose={() => closeAd(overlay)} />
            )}

            {overlay?.adType === 'floating' && expandedFloating !== overlay._id && (
                <FloatingAd
                    key={overlay._id}
                    ad={overlay}
                    onClose={() => closeAd(overlay)}
                    onExpand={() => setExpandedFloating(overlay._id)}
                />
            )}

            {overlay?.adType === 'badge' && expandedFloating !== overlay._id && (
                <BadgeAd
                    key={overlay._id}
                    ad={overlay}
                    onClose={() => closeAd(overlay)}
                    onExpand={() => setExpandedFloating(overlay._id)}
                />
            )}

            {showAsPopup && (
                <PopupAd
                    key={`popup-${overlay._id}`}
                    ad={overlay}
                    onClose={() => closeAd(overlay)}
                />
            )}
        </AnimatePresence>
    );
};

export default AdsDisplay;
